app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var MenuItem = require('menu-item');
var Loader = require(__dirname + '/libs/loader.js');
var Butler = require(__dirname + '/libs/butler.js');
var i18n = require(__dirname + '/libs/i18n.js');

//Do initial stuff
//Save basepath
app.basepath = __dirname;
app.windows = {};

//Call libs init
app.i18n = i18n.init(app);
app.Loader = Loader;
Loader.init(app);
Butler.init(app);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create start window.
    Butler.openStartWindow();
    
    if (process.platform == 'darwin') {
        app.dock.bounce();
    }

    // Load main window menu
    var template = Loader.loadMenu('app.js')(app);
    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});