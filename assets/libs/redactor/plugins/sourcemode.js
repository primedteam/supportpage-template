(function($R) {
    $R.add('plugin', 'sp-sourcemode', {
        init: function(app) {
            this.app = app;
            this.toolbar = app.toolbar;
        },
        // public
        start: function() {
            // Force source mode.
            this.app.broadcast('startcodeshow');

            // Disable and hide all the buttons except merge fields.
            this.toolbar.disableButtons();
            this._hideButtons();

            // Redactor source.show() has a timer which enables the source button
            // and disables all other buttons. The source.opened callback doesn't
            // fire until after the app has started (outside this function) so we're
            // left with having to use a timer...
            var self = this;
            setTimeout(function () {
                self.toolbar.getButton('sp-mergefields').enable();
            }, 100);
        },
        // private
        _hideButtons: function () {
            // Support for sp-group plugin - hide the separators as well...
            this.toolbar.getElement().find('a:not(.re-sp-mergefields), .redactor-button-separator').hide();
        }
    });
})(Redactor);
