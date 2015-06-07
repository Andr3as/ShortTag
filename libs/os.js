var os = {

    init: function() {},

    getCommonPlatform: function() {
        if (this.isDarwin()) {
            return "darwin";
        } else if (this.isWindows()) {
            return "windows";
        } else if (this.isLinux()) {
            return "linux";
        } else {
            return "";
        }
    },

    isDarwin: function() {
        if (process.platform == 'darwin') {
            return true;
        } else {
            return false;
        }
    },

    isLinux: function() {
        if (process.platform == 'linux') {
            return true;
        } else {
            return false;
        }
    },

    isWindows: function() {
        if (process.platform == 'win32' || process.platform == 'win64') {
            return true;
        } else {
            return false;
        }
    }
};

module.exports = os;