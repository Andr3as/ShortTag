/* jshint browser: true */
var remote = require('remote');
var ipc = require('ipc');

(function(global, $){

    var system = global.system = {};

    $(function() {    
        system.init();
    });

    system = {
        
        init: function() {
            var _this = this;
            //Trans process listeners
            ipc.on('setContent', function(content){
                $('.content').html(content);
                //Limit height
                _this.setMaxDimmensions();
                //Activate selects
                $('.select').selectpicker();
            });
            ipc.on('applyAttributes', function(attr){
                $('#image').attr('src', attr.path);
                document.title = attr.path;
                console.log(attr);
                $.each(attr, function(i, item){
                    $('[data-name="' + i + '"]').text(item);
                });
                //Scroll all labels to the right
                $('.edit .informations td:nth-of-type(2) label').scrollLeft(100000);
            });
            ipc.on('applyExif', function(exif){
                console.log(exif);
                $('.edit .exif tbody').html("");
                var each = [exif.image, exif.exif, exif.gps];
                for (var i = 0; i < each.length; i++) {
                    $.each(each[i], _this.__addExifLine.bind(_this));
                }
            });
            ipc.on('getExifData', function(path){
                var exif = {}, tag_name, value;
                $('.edit .exif tbody tr').each(function(i, item){
                    tag_name = $(this).find(".tag_name").val();
                    value = $(this).find(".value").val();
                    exif[tag_name] = value;
                });
                console.log(exif);
                ipc.send('returnExifData', exif);
            });
            //Window clicklisteners
            $(document).on('click', '#dropzone', function(e){
                ipc.send('open');
            });
            $(window).resize(function(){
                _this.setMaxDimmensions();
            });
            //Roles
            $(document).on('click', '.btn[role="close"]', function(){
                window.close();
            });
            //Hook buttons
            this.hookButtons();
        },
        
        hookButtons: function() {
            var _this = this;
            $(document).on('click', '.edit .addExifLine', function(){
                _this.__addExifLine();
                _this.__setWindowAsUnsaved();
            });
            $(document).on('click', '.edit .rmAllLines', function(){
                $('.edit .exif tbody tr').remove();
                _this.__setWindowAsUnsaved();
            });
            $(document).on('click', '.edit .rmExifLine', function(){
                $(this).parent().parent().remove();
                _this.__setWindowAsUnsaved();
            });
        },

        setMaxDimmensions: function() {
            var height = $(window).height();
            height = Math.floor(height) - 30;
            $('.edit>div').css('max-height', height + "px");

            var width = $(window).width();
            var inwidth = (width - 800) / 4 + 160;
            var lawidth = (width - 800) / 2 + 250;
            $('.edit .exif input[type="text"]').width(inwidth + "px");
            $('.edit .informations td:nth-of-type(2) label').width(lawidth + "px").scrollLeft(100000);
        },

        send: function(event, args) {
            ipc.send(event, args);
        },

        __addExifLine: function(tag, value) {
            var line = this.__getTemplateLine(tag, value);
            $('.edit .exif tbody').append(line);
            this.setMaxDimmensions();
        },

        __getTemplateLine: function(tag, value){
            tag = tag || "";
            if (value !== 0) {
                value = value || "";
            }
            //Trim values
            value = this.__trim(value);
            
            var line = '<tr><td><input type="text" value="' + tag + '" class="tag_name"></td><td><input type="text" value="' + value + '" class="value"></td>';
            line += '<td><button class="btn btn-xs btn-danger rmExifLine"><i class="glyphicon glyphicon-remove"></i></button></td></tr>';
            return line;
        },

        __setWindowAsUnsaved: function() {
            remote.getCurrentWindow().unsaved = true;
        },

        __trim: function(str, charlist) {
            var whitespace, l = 0,
                i = 0;
                str += '';

            if (!charlist) {
                // default list
                whitespace =
                ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            } else {
                // preg_quote custom list
                charlist += '';
                whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
            }

            l = str.length;
            for (i = 0; i < l; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }

            l = str.length;
            for (i = l - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }

            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        }
    };

})(this, jQuery);