var Loader = require(__dirname + '/Loader.js');

var i18n = {

    app: null,
    language: {},

    init: function(app) {
        this.app = app;
        //Init subscripts
        Loader.init(app);
        //LoadLanguage
        this.language = Loader.loadLanguage();
        return this.i18n.bind(this);
    },

    i18n: function(key, args) {
        args = args || [];
        if (typeof(key) != 'string') {
            return "";
        }
        var string = this.__getString(key);
        
        for (var i = 0; i < args.length; i++) {
            string = string.replace("${" + i + "}", args[i]);
        }

        return string;
    },

    __getString: function(key) {
        if (typeof(this.language[key.toLowerCase()]) == 'undefined') {
            return key;
        } else {
            return this.language[key.toLowerCase()];
        }
    }
};

module.exports = i18n;