(function($R) {
    $R.add('plugin', 'sp-fontawesome', {
        init: function(app) {
            this.app = app;
            this.lang = app.lang;
            this.toolbar = app.toolbar;

            this.buttons = {
                html: '<i class="fas fa-fw fa-code"></i>',
                bold: '<i class="fas fa-fw fa-bold"></i>'
            };
        },
        // public
        start: function() {
            for (var name in this.buttons) {
                if (! this.buttons.hasOwnProperty(name)) {
                    continue;
                }

                var button = this.toolbar.getButton(name);
                if (button) {
                    button.setIcon(this.buttons[name]);
                }
            }
        },
    });
})(Redactor);
