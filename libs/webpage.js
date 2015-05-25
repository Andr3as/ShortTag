var remote = require('remote');
var ipc = require('ipc');

(function(global, $){

    $(function() {    
        system.init();
    });

    system = {

        app: null,
        
        init: function() {
            var _this = this;
            this.app = remote.getGlobal('app');
            i18n = app.i18n;
            //Trans process listeners
            ipc.on('setContent', function(content){
                $('.content').html(content);
            });
            ipc.on('applyAttributes', function(attr){
                $('#image').attr('src', attr.path);
                console.log(attr);
                $.each(attr, function(i, item){
                    $('[data-name="' + i + '"]').text(item);
                });
                //Scroll all labels to the right
                $('.edit .informations td:nth-of-type(2) label').scrollLeft(100000);
            })
            ipc.on('applyExif', function(exif){
                console.log(exif);
            });
            //Window clicklisteners
            $(document).on('click', '#dropzone', function(e){
                _this.app.emit('open');
            });
        }
    };

})(this, jQuery);