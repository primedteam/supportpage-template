(function($R) {
    $R.add('plugin', 'sp-group', {
        init: function(app) {
            this.app = app;
            this.opts = app.opts;
            this.lang = app.lang;
            this.inline = app.inline;
            this.toolbar = app.toolbar;

            this.rboundary = this.opts.groups || [];
        },
        // public
        start: function() {
            // Returns the order of all buttons in the toolbar.
            // Array of objects
            for (var i = 0; i < this.rboundary.length; i++) {
                var $btn = this.app.toolbar.getButton(this.rboundary[i]);
                if ($btn) {
                    $btn.after('<div class="redactor-button-separator"></div>');
                }
            }
        },
    });
})(Redactor);
