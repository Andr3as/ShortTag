var BrowserWindow = require('browser-window');
var Dialog = require('dialog');

var i18n = null;
var Loader  = null;
var Image = null;

var Butler = {

    app: null,
    startWindows: [],

    init: function(app) {
        var _this = this;
        this.app = app;
        //Init subscripts
        i18n = app.i18n;
        Loader = app.Loader;
        Image = require(app.basepath + '/libs/image.js');
        Image.init(app);
        //Register listeners
        app.on('new', function(){
            _this.openStartWindow();
        });
        app.on('open', function(){
            _this.open();
        });
        app.on('reload', function(){
            var focused = _this.__getFocusedWindow();
            if (typeof(focused) != 'undefined') {
                focused.reloadIgnoringCache();
            }
        });
        app.on('save', function(){
            _this.save(true);
        });
        app.on('save_without_exif', function(){
            _this.save(false);
        });
        app.on('toggleDevTools', function(){
            var focused = _this.__getFocusedWindow();
            if (typeof(focused) != 'undefined') {
                focused.toggleDevTools();
            }
        });
    },

    open: function() {
        files = Dialog.showOpenDialog({
            filters: [
                { name: 'Images', extensions: ['jpg'] }
            ],
            properties: [ 'openFile', 'multiSelections' ]});

        if (typeof(files) == 'undefined') {
            return false;
        }

        //Maybe implement batch processing here

        for (var i = 0; i < files.length; i++) {
            this.openImage(files[i]);
        };
    },

    openImage: function(path) {
        var w = this.__openWindow({width: 800, height: 500}, false);
        var content = Loader.loadTemplate("edit.html");
        
        //Retrieve exif data
        var data = Image.getImageInformation(path);

        w.webContents.on('did-finish-load', function() {
            w.webContents.send('setContent', content);
            w.webContents.send('applyAttributes', data);

            Image.getExifData(path, function(exif){
                w.webContents.send('applyExif', exif);
            });
        });

        w.path = path;
        
        ws = BrowserWindow.getAllWindows();
        for (var i = 0; i < ws.length; i++) {
            if (ws[i].isStartWindow) {
                ws[i].close();
            }
        };

        //Add image to recent files
        if (process.platform == 'darwin' || process.platform == 'windows') {
            this.app.addRecentDocument(path);
        }
        
        return w;
    },

    openStartWindow: function() {
        var _this = this;
        var w = this.__openWindow({width: 520, height: 280, resizable: false}, true);
        var content = Loader.loadTemplate("start.html");
        w.webContents.on('did-finish-load', function() {
            w.webContents.send('setContent', content);
        });
        w.webContents.on('will-navigate', function(e, url){
            //Multidrop?
            _this.openImage(url);
            e.preventDefault();
        });
        
        return w;
    },

    save: function(w, saveWithExif) {
        if (typeof(w) == 'boolean') {
            saveWithExif = w;
            w = undefined;
        } else {
            saveWithExif = saveWithExif || true;
        }

        w = w || BrowserWindow.getFocusedWindow();
        if (typeof(w) == 'undefined' || w == null || w.isStartWindow || typeof(w.path) == 'undefined') {
            console.log("Unable to save");
            return false;
        }
        //Do Stuff
        w.unsaved = false;
        var path = w.path;

        var binary = Image.getImageAsBinary(path);
        if (saveWithExif) {
            //Save image with exif data
            //Get exif data…
            /*
            var exif = {};
            binary = Image.addExif(binary, exif);
            */
            console.log("save");
            return false;
        } else {
            //Save image without exif data
            binary = Image.rmExif(binary);
        }

        var name = this.__basename(path);
        var newPath = Dialog.showSaveDialog(w,{
                    filters: [
                        { name: 'Images', extensions: ['jpg'] }
                    ],
                    title: name,
                    defaultPath: path
                });

        if (typeof(newPath) == 'undefined') {
            console.log("unsaved");
            return false;
        }

        Image.save(newPath, binary);
    },

    __basename: function(path, suffix) {
        var b = path;
        var lastChar = b.charAt(b.length - 1);

        if (lastChar === '/' || lastChar === '\\') {
            b = b.slice(0, -1);
        }

        b = b.replace(/^.*[\/\\]/g, '');

        if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
            b = b.substr(0, b.length - suffix.length);
        }

        return b;
    },

    __openWindow: function(options, isStartWindow) {
        var _this = this;
        var w     = new BrowserWindow(options);
        var id    = w.id;
        //Load content
        w.loadUrl("file://" + this.app.basepath + "/index.html");
        w.isStartWindow = isStartWindow || false;
        //Save refernece for window
        this.app.windows[id] = w;
        w.on('close', function(e){
            if (w.unsaved) {
                var buttons = [i18n("Save"), i18n("Cancel"), i18n("Delete")];
                var returnCode = Dialog.showMessageBox(w, {type: 'warning', buttons: buttons,
                                    message: i18n("Do you want to save your changes?")});
                switch(buttons[returnCode]) {
                    case i18n("Save"):
                        _this.save();
                        break;
                    case i18n("Cancel"):
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
            }
        });
        w.on('closed', function(){
            delete _this.app.windows[id];
        });
        //Show window
        w.show();
        return w;
    },

    __getFocusedWindow: function() {
        return BrowserWindow.getFocusedWindow();
    }
}

module.exports = Butler;