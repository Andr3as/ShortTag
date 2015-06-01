var fs = require('fs');
var child = require('child_process');

var piexif = require("piexifjs");
var sizeOf = require('image-size');
var moment, i18n;

var Image = {

    app: null,
    synonyms: [],

    init: function(app) {
        this.app = app;
        i18n = this.app.i18n;
        moment = require(app.basepath + "/vendor/moment.js");
        this.synonyms = app.Loader.loadValues("synonyms.json");
    },

    addExif: function(binary, data) {
        
        data = this.__parseSynonyms(data);

        if (typeof(data) == "object") {
            var zeroth = {}, exif = {}, gps = {};
            for (var i in data) {
                if (typeof(piexif.ImageIFD[i]) != 'undefined') {
                    zeroth[piexif.ImageIFD[i]] = data[i];
                } else if (typeof(piexif.ExifIFD[i]) != 'undefined') {
                    exif[piexif.ExifIFD[i]] = data[i];
                } else if (typeof(piexif.GPSIFD[i]) != 'undefined') {
                    gps[piexif.GPSIFD[i]] = data[i];
                }
            };
            
            //zeroth[piexif.ImageIFD.Software] = "ShortTag";

            var data = {};
            if (!this.__isEmpty(zeroth)) {
                data["0th"] = zeroth;
            }
            if (!this.__isEmpty(exif)) {
                data["Exif"] = exif;
            }
            if (!this.__isEmpty(gps)) {
                data["GPS"] = gps;
            }

            data = this.__parseNumeric(data);
            data = piexif.dump(data);
        }

        return piexif.insert(data, binary);
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
        var _this = this;

        this.fork = child.fork(this.app.basepath + '/libs/child.js');
        this.fork.on('message', function(exif){
            exif.categories = _this.__getCategories();
            exif = _this.__clean(exif);

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

    __clean: function(data) {
        //Delete unused main categories
        delete data.interoperability;
        delete data.makernote;
        delete data.thumbnail;

        //Delete unused/unsupported tags
        delete data.image.PrintIM;  //Unknown format
        delete data.exif.ComponentsConfiguration; //Unsupported
        delete data.exif.MakerNote;
        delete data.exif.UserComment; //Unsupported
        delete data.exif.LensInfo; //Unsupported
        try {
            data.exif.FileSource = data.exif.FileSource.data[0];
            data.exif.SceneType = data.exif.SceneType.data[0];
        } catch (e) {
            console.log(e, "FileSource or SceneType");
        }
        
        //Decode buffers
        for (var j in data) {
            if (j == 'categories') {
                continue;
            }

            for (var i in data[j]) {
                if (typeof(data[j][i]) == 'object') {
                    if (data[j][i].type = "Buffer") {
                        try {
                            data[j][i] = this.__decodeFromASCII(data[j][i].data);
                        } catch (e) {
                            console.log(e, "__decodeFromASCII", i + "." + j, data[j][i]);
                        }
                    }
                }
            }
        }

        return data;
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

    __decodeFromASCII: function(array) {
        var value = "";
        for (var i = 0; i < array.length; i++) {
            value += String.fromCharCode(array[i]);
        }
        return value;
    },

    __getCategories: function(){
        return {
            image: piexif.ImageIFD,
            exif: piexif.ExifIFD,
            gps: piexif.GPSIFD
        };
    },

    __getFraction: function(float) {
        var fString = float.toString();
        var start = fString.indexOf(".");
        var denominatorLength = fString.length - start - 1;
        if (denominatorLength < 1) {
            denominatorLength = 1;
        }
        var denominator = Math.pow(10, denominatorLength);
        var numerator = float * denominator;
        numerator = Math.round(numerator);
        return [numerator, denominator];
    },

    __isEmpty: function(obj) {
        if (Object.keys(obj).length == 0) {
            return true;
        } else {
            return false;
        }
    },

    __parseDate: function(date) {
        date = date.getTime();
        return moment(date).format(i18n("MM/DD/YYYY hh:mm"));
    },

    __parseNumeric: function(data) {
        var Integers = ["Byte", "Short", "Long"];
        var RATIONAL = ["Rational", "SRational"];
        for (var category in data) {
            for (var tag in data[category]) {
                if (Integers.indexOf(piexif.TAGS[category][tag].type) !== -1) {
                    data[category][tag] = parseInt(data[category][tag], 10);
                }
                if (RATIONAL.indexOf(piexif.TAGS[category][tag].type) !== -1) {
                    data[category][tag] = this.__getFraction(data[category][tag]);
                }
            }
        }
        return data;
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
    },

    __parseSynonyms: function(data) {
        for (var i in this.synonyms) {
            if (typeof(data[i]) != 'undefined') {
                data[this.synonyms[i]] = data[i];
                delete data[i];
            }
        }

        return data;
    }
}

module.exports = Image;