var BrowserWindow = require('browser-window');
var Dialog = require('dialog');


var i18n = null;
var Loader  = null;

var Butler = {

    app: null,
    startWindows: [],

    init: function(app) {
        var _this = this;
        this.app = app;
        //Init subscripts
        i18n = app.i18n;
        Loader = app.Loader;
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
            this.openImage('file://' + files[i]);
        };
    },

    openImage: function(path) {
        var w = this.__openWindow(path, {width: 500, height: 300});
        w.isStartWindow = false;
        
        ws = BrowserWindow.getAllWindows();
        for (var i = 0; i < ws.length; i++) {
            if (ws[i].isStartWindow) {
                ws[i].close();
            }
        };
        
        return w;
    },

    openStartWindow: function() {
        var _this = this;
        var w = this.__openWindow("file://" + app.basepath + "/index.html" ,{width: 520, height: 280});
        var content = Loader.loadTemplate("start.html", ["Drop your file to open it"]);
        w.webContents.on('did-finish-load', function() {
            w.webContents.send('setContent', content);
        });
        w.webContents.on('will-navigate', function(e, url){
            //Multidrop?
            _this.openImage(url);
            e.preventDefault();
        });
        w.setResizable(false);
        w.isStartWindow = true;
        return w;
    },

    save: function(w) {
        w = w || BrowserWindow.getFocusedWindow();
        if (typeof(w) == 'undefined') {
            return false;
        }
        //Do Stuff
        w.unsaved = false;
    },

    __openWindow: function(path, size) {
        var _this = this;
        var w     = new BrowserWindow(size);
        var id    = w.id;
        //Load content
        w.loadUrl(path);
        //Save refernece for window
        this.app.windows[id] = w;
        w.on('close', function(e){
            if (w.unsaved) {
                var buttons = [i18n('Save'), i18n('Cancel'), i18n('Delete')];
                var returnCode = Dialog.showMessageBox(w, {type: 'warning', buttons: buttons, message: i18n('Do you want to save your changes?')});
                switch(buttons[returnCode]) {
                    case i18n('Save'):
                        _this.save();
                        break;
                    case i18n('Cancel'):
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