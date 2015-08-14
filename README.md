#ShortTags

A small tool to edit fast exif data of an image.

##Warning

This software is still beta. It has some problems to handle unknown data. This means unknown exif data gets overwritten and deleted. You should not overwrite the original image because of this problems.

##Run the app

###Users

Download the app for your system [here](https://github.com/Andr3as/ShortTag/releases).

###Developers

1. Download the code
2. Run `npm install`
3. Have fun and code
4. Download Electron from [here](https://github.com/atom/electron/releases)
5. Run the app
	- on Linux: `./electron/electron ./`
	- on OS X:  `./Electron.app/Contents/MacOS/Electron ./`
	- [Details](https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md#run-your-app)

6. Distribution
	- Copy content into Electron
		- on Windows/Linux: `electron/resources/app`
		- on OS X: `Electron.app/Contents/Resources/app/`
	- Rebrand the app
		- on Windows: Use rcedit or ResEdit
		- on Linux: Rename the executable
		- on OS X: Rename `CFBundleDisplayName`, `CFBundleIdentifier` and `CFBundleName` in `Electron.app/Contents/Info.plist`
	- [Details](https://github.com/atom/electron/blob/master/docs/tutorial/application-distribution.md)

##Credits

- [Bootstrap](http://getbootstrap.com): MIT license
- [bootstrap-select](https://github.com/silviomoreto/bootstrap-select): MIT license
- [CSS spinners](http://codepen.io/zessx/pen/RNPKKK): MIT license
- [Electron](https://github.com/atom/electron): MIT license
- [image-size](https://www.npmjs.com/package/image-size): MIT license
- [jQuery](http://jquery.com): MIT license
- [node-exif](https://www.npmjs.com/package/exif): MIT license
- [piexifjs](https://www.npmjs.com/package/piexifjs): MIT license
- [typeahead.js](https://github.com/twitter/typeahead.js): MIT license

##License

ShortTags is released under MIT license. 