var fs = require('fs');

var content = fs.readFileSync(__dirname + '/settings.json', {encoding: "utf-8"});
module.exports = JSON.parse(content);