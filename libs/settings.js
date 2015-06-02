var fs = require('fs');
var content = [], path = "";

if (typeof(exports) === 'object' && typeof(module) !== 'undefined') {
    path = __dirname + '/settings.json';
} else {
    path = __dirname + '/libs/settings.json';
}

content = fs.readFileSync(path, {encoding: "utf-8"});
content = JSON.parse(content);

if (typeof(exports) === 'object' && typeof(module) !== 'undefined') {
    module.exports = content;
} else {
    /* jshint browser: true */
    (function(global, $){

        var system = global.system;

        global.settings = {

            content: content,
            
            init: function() {
                var _this = this;
                //Apply
                this.apply();
                $('.settings .save').click(function(){
                    _this.save();
                });
            },

            apply: function() {
                $.each(this.content, function(i, item){
                    $('.settings .setting[data-setting="' + i + '"]').val(item);
                });
            },

            save: function() {
                var content = {}, key, value;
                $('.setting').each(function(){
                    key = $(this).attr('data-setting');
                    value = $(this).val();
                    if (typeof(key) != 'undefined') {
                        content[key] = value;
                    }
                });
                
                fs.writeFile(path, JSON.stringify(content), {encoding: "utf-8"}, function(err){
                    if (err) {
                        system.send("error", {title: "Unable to save Settings!", content: err.toString()});
                    } else {
                        system.send("changedSettings");
                        window.close();
                    }
                });
            }
        };

        global.settings.init();

    })(this, jQuery);
}