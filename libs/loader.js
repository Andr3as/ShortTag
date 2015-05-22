var fs = require('fs');
var settings = require(__dirname + '/settings.js');

var Loader = {

	app: null,

	init: function(app) {
		this.app = app;
	},

	load: function(path) {
		return require(path);
	},

	loadMenu: function(name) {
		return this.loadRes("menu", name)		
	},

	loadRes: function(res, name) {
		// process.platform
		// locale & platform / locale / common & platform / common
		var paths = [	this.app.basepath + "/res/" + res + "/" + settings.locale + "." + process.platform + "." + name,
						this.app.basepath + "/res/" + res + "/" + settings.locale + "." + name,
						this.app.basepath + "/res/" + res + "/" + process.platform + "." + name];
		
		for (var i = 0; i < paths.length; i++) {
			if (this.__exists(paths[i])) {
				return this.load(paths[i]);
				//Workaround for current dir
			}
		}
		
		return this.load(this.app.basepath + "/res/" + res + "/" + name);
	},

	__exists: function(path) {
		try {
			fs.accessSync(path);
			return true;
		} catch (e) {}
		return false;
	}
}

module.exports = Loader;