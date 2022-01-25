(function($R) {
    $R.add('plugin', 'sp-tooltips', {
        translations: {
            en: {
                html: Lang.get('core.edit_html'),
                bold: Lang.get('core.bold')
            }
        },
        init: function(app) {
            this.app = app;
            this.lang = app.lang;
            this.toolbar = app.toolbar;
            this.detector = app.spdetector;

            this.tooltips = [
                {
                    name: 'html',
                    tooltip: this.lang.get('html')
                },
                {
                    name: 'bold',
                    tooltip: this.lang.get('bold') + '&nbsp;<span class="sp-icon-shortcut">(' + this.detector.getShortcutKey() + '+B)</span>'
                }
            ];
        },
        // public
        start: function() {
            for (var i = 0; i < this.tooltips.length; i++) {
                var button = this.toolbar.getButton(this.tooltips[i].name);
                button.html_tooltip = this.tooltips[i].tooltip;
            }
        },
    });

    $R.add('class', 'toolbar.button.tooltip', {
        mixins: ['dom'],
        init: function(app, $button) {
            this.app = app;
            this.uuid = app.uuid;
            this.opts = app.opts;
            this.$body = app.$body;
            this.toolbar = app.toolbar;

            // local
            this.$button = $button;
            this.created = false;

            // init
            this._init();
        },
        open: function() {
            if (this.$button.hasClass('redactor-button-disabled') || this.$button.hasClass('redactor-button-active')) return;

            this.created = true;
            this.parse('<span>');
            this.addClass('re-button-tooltip re-button-tooltip-' + this.uuid);
            this.$body.append(this);

            // start supportpal edit
            // this.html(this.$button.attr('alt'));
            var tooltip = this.$button.html_tooltip ? this.$button.html_tooltip : this.$button.attr('alt');
            this.html(tooltip);
            // end supportpal edit

            var offset = this.$button.offset();
            var position = 'absolute';
            var height = this.$button.height();
            var width = this.$button.width();
            var arrowOffset = 4;

            this.css({
                top: (offset.top + height + arrowOffset) + 'px',
                left: (offset.left + width / 2 - this.width() / 2) + 'px',
                position: position
            });

            this.show();
        },
        close: function() {
            if (!this.created || this.$button.hasClass('redactor-button-disabled')) return;

            this.remove();
            this.created = false;
        },

        // private
        _init: function() {
            this.$button.on('mouseover', this.open.bind(this));
            this.$button.on('mouseout', this.close.bind(this));
        }
    });
})(Redactor);
