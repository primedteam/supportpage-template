(function($R) {
    $R.add('plugin', 'sp-lists', {
        translations: {
            en: {
                orderedlist: Lang.get('core.orderedlist'),
                unorderedlist: Lang.get('core.unorderedlist'),
                outdent: Lang.get('core.outdent'),
                indent: Lang.get('core.indent'),
                lists: Lang.get('core.lists')
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

            this.options = {
                observe: 'sp-lists',
                orderedlist: {
                    title: '<i class="fas fa-fw fa-list-ol"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('orderedlist') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+.</span>',
                    api: 'module.list.toggle',
                    args: 'ol'
                },
                unorderedlist: {
                    title: '<i class="fas fa-fw fa-list-ul"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('unorderedlist') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+/</span>',
                    api: 'module.list.toggle',
                    args: 'ul'
                },
                outdent: {
                    title: '<i class="fas fa-fw fa-outdent"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('outdent') + '</span>' +
                    '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+[</span>',
                    api: 'module.list.outdent'
                },
                indent: {
                    title: '<i class="fas fa-fw fa-indent"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('indent') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+]</span>',
                    api: 'module.list.indent'
                }
            };
        },
        onclick: function(e) {
            this._markSelected();
        },
        ondropdown: {
            "sp-lists": {
                observe: function(dropdown) {
                    this._markSelectedItem();
                }
            }
        },
        // public
        start: function() {
            var $button = this.toolbar.addButtonAfter('sp-fontformat', 'sp-lists', {
                title: this.lang.get('lists')
            });
            $button.setIcon('<i class="fas fa-list-ul"></i>');
            $button.setDropdown(this.options);
        },

        // private
        _markSelected: function() {
            var $btn = this.app.toolbar.getButton('sp-lists');
            if ($btn) {
                this._getSelectedComponents().length ? $btn.setActive() : $btn.setInactive();
            }
        },
        _markSelectedItem: function() {
            var $btn = this.app.toolbar.getButton('sp-lists'),
                $dropdown = $btn.getDropdown();

            this._resetButtonState();
            this._markSelected();

            var components = this._getSelectedComponents();
            for (var i = 0; i < components.length; i++) {
                $dropdown.getItem(components[i]).addClass('active');
            }
        },
        _getSelectedComponents: function() {
            var current = this.selection.getCurrent(),
                data = this.inspector.parse(current);

            var components = [];
            if (data.isList() && data.isList().tagName.toLowerCase() === "ul") {
                components.push('unorderedlist');
            }
            if (data.isList() && data.isList().tagName.toLowerCase() === "ol") {
                components.push('orderedlist');
            }

            return components;
        },
        _resetButtonState: function() {
            var $btn = this.app.toolbar.getButton('sp-lists'),
                $dropdown = $btn.getDropdown();

            $btn.setInactive();
            for (var name in this.options) {
                if (this.options.hasOwnProperty(name) && $dropdown.getItem(name)) {
                    $dropdown.getItem(name).removeClass('active');
                }
            }
        }
    });
})(Redactor);
