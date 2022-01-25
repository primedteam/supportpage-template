(function($R) {
    $R.add('plugin', 'limiter', {
        init: function(app) {
            this.app = app;
            this.utils = app.utils;
            this.opts = app.opts;
            this.editor = app.editor;
            this.keycodes = app.keycodes;
            this.statusbar = app.statusbar;
        },
        // events
        onpasting: function(html) {
            if (!this.opts.limiter) return;

            html = this._removeInvisibleChars(html);

            var text = this._getText();
            var len = html.length + text.length;

            this.opts.input = !(len >= this.opts.limiter);
        },
        // public
        start: function() {
            if (!this.opts.limiter) return;

            var $editor = this.editor.getElement();

            // Initialise counter.
            this.update();
            $editor.on('keyup.redactor-plugin-limiter', this.update.bind(this));

            // Register limiter key binding.
            $editor.on('keydown.redactor-plugin-limiter', this._limit.bind(this));

            this.statusbar.getElement().show();
        },
        stop: function() {
            var $editor = this.editor.getElement();
            $editor.off('.redactor-plugin-limiter');

            this.opts.input = true;

            this.statusbar.getElement().hide();
        },
        enable: function() {
            this.start();
        },
        disable: function() {
            this.stop();
        },
        update: function() {
            this.statusbar.add('chars', this._count() + '/' + this.opts.limiter);
        },

        // private
        _limit: function(e) {
            var key = e.which;
            var ctrl = e.ctrlKey || e.metaKey;
            var arrows = [37, 38, 39, 40];

            if (key === this.keycodes.BACKSPACE ||
                key === this.keycodes.DELETE ||
                key === this.keycodes.ESC ||
                key === this.keycodes.SHIFT ||
                (ctrl && key === 65) ||
                (ctrl && key === 88) ||
                (ctrl && key === 82) ||
                (ctrl && key === 116) ||
                (arrows.indexOf(key) !== -1)
            ) {
                return;
            }

            this._exceedsLimit(e);
            this.update();
        },
        _count: function() {
            return this._getText().length;
        },
        _exceedsLimit: function(e) {
            if (this._count() >= this.opts.limiter) {
                if (e) e.preventDefault();
                this.opts.input = false;
                return false;
            } else {
                this.opts.input = true;
            }
        },
        _getText: function() {
            var $editor = this.editor.getElement();
            var text = $editor.text();

            return this._removeInvisibleChars(text);
        },
        _removeInvisibleChars: function(html) {
            return html.replace(/\uFEFF/g, '');
        },
    });
})(Redactor);
