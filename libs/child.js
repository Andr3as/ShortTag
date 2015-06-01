var exif = require('exif').ExifImage;

process.on('message', function (msg) {
    var data = {error: "error"};
    try {
        new exif({image: msg.path}, function(e, result){
            if (e) {
                data.error = e;
            } else {
                data = result;
            }

            process.send(data);
        });
    } catch (e) {
        data.error = e;
        process.send(data);
    }
});