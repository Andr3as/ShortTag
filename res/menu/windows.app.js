var BrowserWindow = require('browser-window');

module.exports = function(app){
    var i18n = app.i18n;
    return [
    {
        label: app.getName(),
        submenu: [
            {
                label: i18n("Settings…"),
                accelerator: 'Ctrl+,',
                click: function() { app.emit("open_settings"); }
            },
            {
                type: 'separator'
            },
            {
                label: i18n("Quit ${0}", [app.getName()]),
                accelerator: 'Alt+F4',
                click: function() { app.quit(); }
            },
        ]
    },
    {
        label: i18n("File"),
        submenu: [
            {
                label: i18n("New…"),
                accelerator: 'Ctrl+N',
                click: function() { app.emit("new"); }
            },
            {
                label: i18n("Open…"),
                accelerator: 'Ctrl+O',
                click: function() { app.emit("open"); }
            },
            {
                type: 'separator'
            },
            {
                label: i18n("Save…"),
                accelerator: 'Ctrl+S',
                click: function() { app.emit("save"); }
            },
            {
                label: i18n("Save without Exif"),
                accelerator: 'Ctrl+Shift+S',
                click: function() { app.emit("save_without_exif"); }
            }
        ]
    },
    {
        label: i18n("Edit"),
        submenu: [
            {
                label: i18n("Cut"),
                accelerator: 'Ctrl+X',
                click: function() { app.emit("cut"); }
            },
            {
                label: i18n("Copy"),
                accelerator: 'Ctrl+C',
                click: function() { app.emit("copy"); }
            },
            {
                label: i18n("Paste"),
                accelerator: 'Ctrl+V',
                click: function() { app.emit("paste"); }
            }
        ]
    },
    {
        label: i18n("View"),
        submenu: [
            {
                label: i18n("Reload"),
                accelerator: 'F5',
                click: function() { app.emit("reload"); }
            },
            {
                label: i18n("Toggle DevTools"),
                accelerator: 'F12',
                click: function() { app.emit("toggleDevTools"); }
            }
        ]
    },
    {
        label: i18n("Window"),
        submenu: [
            {
                label: i18n("Minimize"),
                accelerator: 'Ctrl+M',
                click: function() { BrowserWindow.getFocusedWindow().minimize(); }
            },
            {
                label: i18n("Close"),
                accelerator: 'Ctrl+W',
                click: function() { BrowserWindow.getFocusedWindow().close(); }
            }
        ]
    },
    {
        label: i18n("Help"),
        submenu: [
            {
                label: i18n("${0} Help", [app.getName()]),
                accelerator: 'Ctrl+?',
                click: function() { app.emit("open_website", "http://github.com/Andr3as/ShortTags"); }
            },
            {
                label: i18n("Exif Tags from ExifTool"),
                click: function() { app.emit("open_website", "http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html"); }
            }
        ]
    }
];}