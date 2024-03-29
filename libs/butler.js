var BrowserWindow = require('browser-window');
var Dialog = require('dialog');
var IPC = require('ipc');
var exec = require('child_process').exec;

var i18n = null;
var Loader  = null;
var Image = null;

var Butler = {

    app: null,
    startWindows: [],
    imReg: /\.jpe?g$/i,

    init: function(app) {
        var _this = this;
        this.app = app;
        //Init subscripts
        i18n = app.i18n;
        Loader = app.Loader;
        Image = require(app.basepath + '/libs/image.js');
        Image.init(app);
        //Register listeners
        app.on('cut', function(){
            var focused = _this.__getFocusedWindow();
            if (typeof(focused) != 'undefined') {
                focused.webContents.cut();
            }
        });
        app.on('copy', function(){
            var focused = _this.__getFocusedWindow();
            if (typeof(focused) != 'undefined') {
                focused.webContents.copy();
            }
        });
        app.on('new', function(){
            _this.openStartWindow();
        });
        app.on('open', function(){
            _this.open();
        });
        app.on('open_settings', function(){
            _this.openSettings();
        });
        app.on('open_website', function(url){
            _this.__openWebsite(url);
        });
        app.on('paste', function(){
            var focused = _this.__getFocusedWindow();
            if (typeof(focused) != 'undefined') {
                focused.webContents.paste();
            }
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
        //IPC messages
        IPC.on('changedSettings', function(){
            _this.__showError(i18n("App restarts to apply new settings."));
            //Confirm dialog
            var exec = require('child_process').exec;
            exec(process.execPath + " " + app.basepath);
            app.quit();
        });
        IPC.on('error', function(e, args){
            if (typeof(args.title) != 'undefined' && typeof(args.content) != 'undefined') {
                _this.__showError(i18n(args.title), i18n(args.content));
            }
        });
        IPC.on('open', function(){
            _this.open();
        });
    },

    open: function() {
        var files = Dialog.showOpenDialog({
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
        }
    },

    openImage: function(path) {
        if (!this.imReg.test(path)) {
            return false; //File type not supported
        }

        var w = this.__openWindow({width: 800, height: 500, "min-width": 570, "min-height": 250}, false);
        
        //Retrieve exif data
        var data = Image.getImageInformation(path);
        var content = Loader.loadTemplate("edit.html");

        w.webContents.on('did-finish-load', function() {
            w.webContents.send('setContent', content);
            w.webContents.send('applyAttributes', data);

            Image.getExifData(path, function(exif){
                w.webContents.send('applyExif', exif);
            });
        });

        w.path = path;
        
        var ws = BrowserWindow.getAllWindows();
        for (var i = 0; i < ws.length; i++) {
            if (ws[i].isStartWindow) {
                ws[i].close();
            }
        }

        //Add image to recent files
        if (process.platform == 'darwin' || process.platform == 'win32' || process.platform == 'win64') {
            this.app.addRecentDocument(path);
        }
        
        w.unsaved = false;
        return w;
    },

    openSettings: function() {
        var w = this.__openWindow({width: 500, height: 280}, false);
        w.webContents.on('did-finish-load', function(){
            var content = Loader.loadTemplate("settings.html");
            w.webContents.send('setContent', content);
        });
    },

    openStartWindow: function() {
        var _this = this,
            height = 280;
        if (this.app.OS.isWindows()) {
            height = 320; // Space for menu
        }
        var w = this.__openWindow({width: 520, height: height, resizable: false}, true);
        var content = Loader.loadTemplate("start.html");
        w.webContents.on('did-finish-load', function() {
            w.webContents.send('setContent', content);
        });
        
        return w;
    },

    save: function(w, saveWithExif) {
        var _this = this;
        if (typeof(w) == 'boolean') {
            saveWithExif = w;
            w = undefined;
        } else {
            saveWithExif = saveWithExif || true;
        }

        w = w || BrowserWindow.getFocusedWindow();
        if (typeof(w) == 'undefined' || w === null || w.isStartWindow || typeof(w.path) == 'undefined') {
            if (!w.isStartWindow) {
                this.__showError(i18n("Unable to save"));
            }
            console.log("Unable to save");
            return false;
        }

        //Check existence of tag names
        

        var path = w.path;

        var binary = Image.getImageAsBinary(path);
        if (saveWithExif) {
            //Save image with exif data
            //Get exif data…
            w.webContents.send('getExifData', path);
            IPC.on('returnExifData', function(e, args){
                //console.log(args, 135);
                console.log(new Date());
                binary = Image.addExif(binary, args);
                _this.__saveImage(w, path, binary);
            });
        } else {
            //Save image without exif data
            binary = Image.rmExif(binary);
            this.__saveImage(w, path, binary);
        }
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

    __getFocusedWindow: function() {
        return BrowserWindow.getFocusedWindow();
    },

    __openWebsite: function(url) {
        if (typeof(url) == 'string') {
            if (this.app.OS.isWindows()) {
                exec("start " + url, function(){});
            } else {
                exec("open " + url, function(){});
            }
        }
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
                                    message: i18n("Do you want to save your changes?"),
                                    detail: i18n("Your changes will be lost if you don't save them.")});
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
        w.webContents.on('will-navigate', function(e, url){
            //Multidrop?
            console.log(url);
            _this.openImage(url.replace("file://", "")); 
            e.preventDefault();
        });
        //Show window
        w.show();
        return w;
    },

    __saveImage: function(w, path, binary) {
        var name = this.__basename(path);
        var newPath = Dialog.showSaveDialog(w,{
                    filters: [
                        { name: 'Images', extensions: ['jpg'] }
                    ],
                    title: name,
                    defaultPath: path
                });

        if (typeof(newPath) == 'undefined') {
            return false;
        }

        w.unsaved = false;

        Image.save(newPath, binary);
    },

    __showError: function(msg, title) {
        title = title || i18n("Notice!");
        if (this.app.OS.isDarwin()) {
            Dialog.showErrorBox(msg, "");
        } else {
            Dialog.showErrorBox(title, msg);
        }
    }
};

module.exports = Butler;