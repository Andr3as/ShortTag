var BrowserWindow = require('browser-window');
var Dialog = require('dialog');

var Butler = {

	app: null,

	init: function(app) {
		var _this = this;
		this.app = app;

		//Register listeners
		app.on('reload', function(){
			BrowserWindow.getFocusedWindow().reloadIgnoringCache();
		});
		app.on('toggleDevTools', function(){
			BrowserWindow.getFocusedWindow().toggleDevTools();
		});
		app.on('open', function(){
			_this.open();
		});
	},

	open: function() {
		files = Dialog.showOpenDialog({
			filters: [
				{ name: 'Images', extensions: ['jpg'] }
			],
			properties: [ 'openFile', 'multiSelections' ]});

		if (typeof(files) == 'undefined') {
			return false;
		}

		console.log(files);

	}

}

module.exports = Butler;