var fs = require('fs');
var settings = require(__dirname + '/settings.js');
var i18n = null;

var Loader = {

	app: null,

	init: function(app) {
		this.app = app;
		i18n = this.app.i18n;
	},

	load: function(path, string) {
		string = string || false;
		if (string) {
			return fs.readFileSync(path, {encoding: "utf-8"})
		} else {
			return require(path);
		}
	},

	loadMenu: function(name) {
		return this.__load("menu", name)		
	},

	loadLanguage: function() {
		return this.__load("languages", "json");
	},

	loadTemplate: function(name, args) {
		args = args || [];
		var template = this.__load("templates", name, true);
		for (var i = 0; i < args.length; i++) {
			template = template.replace("${" + i + "}", i18n(args[i]));
		};
		return template;
	},

	__exists: function(path) {
		try {
			fs.accessSync(path);
			return true;
		} catch (e) {}
		return false;
	},

	__load: function(res, name, string) {
		// process.platform
		// locale & platform / locale / common & platform / common
		var paths = [	this.app.basepath + "/res/" + res + "/" + settings.locale + "." + process.platform + "." + name,
						this.app.basepath + "/res/" + res + "/" + settings.locale + "." + name,
						this.app.basepath + "/res/" + res + "/" + process.platform + "." + name];
		
		for (var i = 0; i < paths.length; i++) {
			if (this.__exists(paths[i])) {
				return this.load(paths[i], string);
				//Workaround for current dir
			}
		}
		
		return this.load(this.app.basepath + "/res/" + res + "/" + name, string);
	}
}

module.exports = Loader;