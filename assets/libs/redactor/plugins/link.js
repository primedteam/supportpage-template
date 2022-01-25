(function($R) {
    $R.add('plugin', 'sp-link', {
        translations: {
            en: {
                'insert': Lang.get('core.insert_link'),
                'link': Lang.get('core.insert_link'),
                'link-insert': Lang.get('core.insert_link'),
                'link-edit': Lang.get('core.edit_link'),
                'unlink': Lang.get('core.unlink'),
                'text': Lang.get('general.text'),
                'edit': Lang.get('core.edit_link'),
                'link-in-new-tab': Lang.get('core.open_link_in_new_tab')
            }
        },
        init: function(app) {
            this.app = app;
            this.opts = app.opts;
            this.lang = app.lang;
            this.inline = app.inline;
            this.toolbar = app.toolbar;
            this.inspector = app.inspector;
            this.selection = app.selection;
            this.detector = app.spdetector;
        },

        onclick: function(e) {
            this._markSelected();
        },

        // public
        start: function() {
            var $button = this.toolbar.addButtonAfter('sp-lists', 'sp-link', {
                title: this.lang.get('link') + '&nbsp;<span class="sp-icon-shortcut">(' + this.detector.getShortcutKey() + '+K)</span>',
                api: 'module.link.open',
            });
            $button.setIcon('<i class="fas fa-link"></i>');
        },

        // private
        _markSelected: function() {
            var $btn = this.app.toolbar.getButton('sp-link');

            var current = this.selection.getCurrent(),
                data = this.inspector.parse(current);

            if ($btn) {
                data.isLink() ? $btn.setActive() : $btn.setInactive();
            }
        },
        _resetButtonState: function() {
            var $btn = this.app.toolbar.getButton('sp-link');
            $btn.setInactive();
        }
    });
})(Redactor);
