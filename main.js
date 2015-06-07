app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var MenuItem = require('menu-item');
var Loader = require(__dirname + '/libs/loader.js');
var Butler = require(__dirname + '/libs/butler.js');
var OS = require(__dirname + '/libs/os.js');
var i18n = require(__dirname + '/libs/i18n.js');
var settings = require(__dirname + '/libs/settings.js');

//Do initial stuff
//Save basepath
app.basepath = __dirname;
app.windows = {};

app.settings = settings;

//Call libs init
app.OS = OS;
app.i18n = i18n.init(app);
app.Loader = Loader;

Loader.init(app);
Butler.init(app);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (app.OS.isDarwin()) {
        app.quit();
    }
});

app.on('open-file', function(e, path){
    Butler.openImage(path);
    e.preventDefault();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create start window.
    Butler.openStartWindow();
    
    if (app.OS.isDarwin()) {
        app.dock.bounce();
    }

    // Load main window menu
    var template = Loader.loadMenu('app.js')(app);
    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});