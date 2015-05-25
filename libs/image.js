var fs = require('fs');
var child = require('child_process');

var piexif = require("piexifjs");
var sizeOf = require('image-size');
var moment, i18n;

var Image = {

    app: null,
    fork: null,
    callback: null,

    init: function(app) {
        this.app = app;
        i18n = this.app.i18n;
        moment = require(app.basepath + "/vendor/moment.js");
    },

    addExif: function(binary, exif) {
        if (typeof(exif) == "object") {
            exif = piexif.dump(exif);
        }
        return piexif.insert(exif, binary);
    },

    exists: function(path) {
        try {
            fs.accessSync(path);
            return true;
        } catch (e) {}
        return false;
    },

    getImageAsBinary: function(path) {
        var jpeg = fs.readFileSync(path);
        return jpeg.toString("binary");
    },

    getImageInformation: function(path){
        var _this = this;
        // Stats
        var data = fs.statSync(path);
        //Patch Dates
        var dates = ["atime", "birthtime", "ctime", "mtime"];

        for (var i = 0; i < dates.length; i++) {
            data[dates[i]] = this.__parseDate(data[dates[i]]);
        };

        data = this.__concat(data, sizeOf(path));

        data.size = this.__parseSize(data.size);
        data.path = path;
        
        return data;
    },

    getExifData: function(path, callback) {
        this.callback = callback;

        this.fork = child.fork('./child.js');
        this.fork.on('message', function(exif){
            callback(exif);
        });
        this.fork.send({path: path});
    },

    rmExif: function(binary) {
        return piexif.remove(binary);
    },

    save: function(path, binary) {
        var jpeg = new Buffer(binary, "binary");
        return fs.writeFileSync(path, jpeg);
    },

    __concat: function(one, two) {
        var res = {};
        for (var i in one) {
            res[i] = one[i];
        }
        for (var i in two) {
            res[i] = two[i];
        }
        return res;
    },

    __parseDate: function(date) {
        date = date.getTime();
        return moment(date).format(i18n("MM/DD/YYYY hh:mm"));
    },

    __parseSize: function(byte) {
        var sizes = ["Byte", "KB", "MB", "GB", "TB"];
        for (var i = 0; i < sizes.length; i++) {
            if (byte < 1000) {
                return Math.floor(byte) + " " + sizes[i];
            } else {
                byte /= 1000;
            }
        }
        return Math.florr(byte) + " " + sizes[i];
    }
}

module.exports = Image;