var fs = require('fs');
var i18n = null;
var settings = null;

var Loader = {

	app: null,

	init: function(app) {
		this.app = app;
		i18n = this.app.i18n;
		settings = this.app.settings;
	},

	load: function(path, string) {
		string = string || false;
		if (string) {
			return fs.readFileSync(path, {encoding: "utf-8"});
		} else {
			return require(path);
		}
	},

	loadMenu: function(name) {
		return this.__load("menu", name);		
	},

	loadLanguage: function() {
		return this.__load("languages", "json");
	},

	loadTemplate: function(name, args) {
		args = args || [];
		if (args.length === 0) {
			//Try to load language template file
			args = this.loadLanguageTemplate(name.replace("html", "json"));
		}
		var template = this.__load("templates", name, true);
		for (var i = 0; i < args.length; i++) {
			template = template.replace(new RegExp("\\$\\{" + i + "\\}", "g"), i18n(args[i]));
		}
		return template;
	},

	loadLanguageTemplate: function(name) {
		try {
			var template = this.__load("templates", name, true);
			return JSON.parse(template);
		} catch(e) {
			return [];
		}
	},

	loadValues: function(name) {
		var values = this.__load("values", name, true);
		return JSON.parse(values);
	},

	__exists: function(path) {
		try {
			fs.accessSync(path);
			return true;
		} catch (e) {}
		return false;
	},

	__load: function(res, name, string) {
		var common = this.app.OS.getCommonPlatform();
		// locale & platform / locale / common & platform / common
		var paths = [	this.app.basepath + "/res/" + res + "/" + settings.locale + "." + process.platform + "." + name,
						this.app.basepath + "/res/" + res + "/" + settings.locale + "." + name,
						this.app.basepath + "/res/" + res + "/" + process.platform + "." + name,
						this.app.basepath + "/res/" + res + "/" + common + "." + name];
		
		for (var i = 0; i < paths.length; i++) {
			if (this.__exists(paths[i])) {
				return this.load(paths[i], string);
				//Workaround for current dir
			}
		}
		
		return this.load(this.app.basepath + "/res/" + res + "/" + name, string);
	}
};

module.exports = Loader;