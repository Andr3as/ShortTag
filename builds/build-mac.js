/* Build mac app */
var fse = require('fs-extra');
var source = __dirname + "/..";
var dest = __dirname + "/ShortTag.app/Contents/Resources/app";

var skip = [/^.DS_Store$/, /^.git$/, /^.gitignore$/, /^.jshintrc$/, /^Android$/, /^Electron.app$/, /.sublime-project$/, /.sublime-workspace$/, /^builds$/, /^tests$/, /^ToDo.md$/];

var fnError = function (err) {
	if (err) return console.error(err);
};

fse.readdir(source, function(err, files){
	if (err) return console.error(err);
	for (var i = 0; i < files.length; i++) {
		var move = true;
		for (var j = 0; j < skip.length; j++) {
			if (skip[j].test(files[i])) {
				move = false;
				break;
			}
		}

		if (move) {
			fse.copy(source + "/" + files[i], dest + "/" + files[i], fnError);
			console.log(files[i]);
		}
	}
});

fse.readJson('./package.json', function (err, packageObj) {
	if (err) return console.error(err);
	console.log("\nChange version number to complete process");
	console.log("\nVersion: " + packageObj.version);

	fse.readFile(__dirname + "/Info.plist", 'utf8', function(err, data) {
		if (err) return console.error(err);

		data = data.replace("VERSION", packageObj.version);

		fse.writeFile(__dirname + "/ShortTag.app/Contents/Info.plist", data, 'utf8', fnError);
	});
});