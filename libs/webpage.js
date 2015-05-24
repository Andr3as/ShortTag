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
            //Trans window listeners
            ipc.on('setContent', function(content) {
                $('.container').html(content);
            });
            //Window clicklisteners
            $(document).on('click', '#dropzone', function(e){
                _this.app.emit('open');
            });
        }
    };

})(this, jQuery);