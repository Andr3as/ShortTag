var remote = require('remote');

(function(global, $){

    $(function() {    
        system.init();
    });

    system = {
        
        init: function() {
            var _this = this;
            //Window clicklisteners
            $(document).on("click", "#dropzone", function(e){
                remote.getGlobal("app").emit("open");
            });
        }
    };

})(this, jQuery);