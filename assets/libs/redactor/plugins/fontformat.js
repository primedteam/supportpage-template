(function($R) {
    $R.add('plugin', 'sp-fontformat', {
        // set translations
        translations: {
            en: {
                "more_formatting": Lang.get('core.more_formatting'),
                "clearformat": Lang.get('core.clearformat'),
                "underline": Lang.get('core.underline'),
                "italic": Lang.get('core.italic'),
                "deleted": Lang.get('core.strikethrough'),
                "fontcolor": Lang.get('core.font_color'),
                "quote": Lang.get('core.quote'),
                "code": Lang.get('core.code'),
                "cancel": Lang.get('general.cancel')
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
                observe: 'sp-fontformat',
                underline: {
                    title: '<i class="fas fa-fw fa-underline"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('underline') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+U</span>',
                    api: 'module.inline.format',
                    args: {
                        tag: 'u'
                    }
                },
                italic: {
                    title: '<i class="fas fa-fw fa-italic"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('italic') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+I</span>',
                    api: 'module.inline.format',
                    args: {
                        tag: 'em'
                    }
                },
                deleted: {
                    title: '<i class="fas fa-fw fa-strikethrough"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('deleted') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+SHIFT+S</span>',
                    api: 'module.inline.format',
                    args: {
                        tag: 'del'
                    }
                },
                fontcolor: {
                    title: '<i class="fas fa-fw fa-palette"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('fontcolor') + '</span>',
                    api: 'module.fontcolor.open'
                },
                blockquote: {
                    title: '<i class="fas fa-fw fa-quote-left"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('quote') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+Q</span>',
                    api: 'module.block.format',
                    args: {
                        tag: 'blockquote'
                    }
                },
                pre: {
                    title: '<i class="fas fa-fw fa-file-code"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('code') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+SHIFT+X</span>',
                    api: 'module.block.format',
                    args: {
                        tag: 'pre'
                    }
                },
                clear: {
                    title: '<i class="fas fa-fw fa-remove-format"></i> ' +
                        '<span class="sp-icon-name">' + this.lang.get('clearformat') + '</span>' +
                        '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+\\</span>',
                    api: 'plugin.sp-fontformat.clearformat'
                },
            };
        },
        onclick: function(e) {
            this._markSelected();
        },
        ondropdown: {
            "sp-fontformat": {
                observe: function(dropdown) {
                    this._markSelectedItem();
                }
            }
        },
        // public
        start: function() {
            var $button = this.toolbar.addButtonAfter('bold', 'sp-fontformat', {
                title: this.lang.get('more_formatting')
            });
            $button.setIcon('<i class="fas fa-ellipsis-h"></i>');
            $button.setDropdown(this.options);
        },

        clearformat: function() {
            var current = this.selection.getCurrent(),
                data = this.inspector.parse(current);

            if (data.isPre()) {
                this.app.module.block.format({tag: 'pre'});
            }
            if (data.isBlockquote()) {
                this.app.module.block.format({tag: 'blockquote'});
            }

            this.app.module.inline.clearformat();
        },

        // private
        _markSelected: function() {
            var $btn = this.app.toolbar.getButton('sp-fontformat');
            if ($btn) {
                this._getSelectedComponents().length ? $btn.setActive() : $btn.setInactive();
            }
        },
        _markSelectedItem: function() {
            var $btn = this.app.toolbar.getButton('sp-fontformat'),
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
            for (var name in this.options) {
                if (!this.options.hasOwnProperty(name) || typeof this.options[name].args === "undefined") {
                    continue;
                }

                var tag = this.options[name].args.tag;
                if (data.getTag() === tag) {
                    components.push(name);
                }
                
                // Handle parents.
                var $elements = $(data.$el.get()).closest('.redactor-in ' + tag);
                if ($elements.length) {
                    components.push(name);
                }
            }

            return components;
        },
        _resetButtonState: function() {
            var $btn = this.app.toolbar.getButton('sp-fontformat'),
                $dropdown = $btn.getDropdown();

            $btn.setInactive();
            for (var name in this.options) {
                if (this.options.hasOwnProperty(name) && $dropdown.getItem(name)) {
                    $dropdown.getItem(name).removeClass('active');
                }
            }
        }
    });

    $R.add('module', 'fontcolor', {
        translations: {
            en: {
                "fontcolor": "Font Color",
                "textcolor": "Text Color",
                "backgroundcolor": "Background Color"
            }
        },
        modals: {
            'fontcolor': '<form action=""> \
                      <table width="100%"> \
                        <tr> \
                          <th width="50%">## backgroundcolor ##</th> \
                          <th width="50%">## textcolor ##</th> \
                        </tr> \
                        <tr class="re-fontcolor-cells"> \
                          <td class="re-fontcolor-bg"></td> \
                          <td class="re-fontcolor-fg"></td> \
                        </tr> \
                      </table> \
                   </form>'
        },
        init: function(app) {
            this.app = app;
            this.opts = app.opts;
            this.lang = app.lang;
            this.inline = app.inline;
            this.toolbar = app.toolbar;
            this.selection = app.selection;

            // local
            this.colors = (this.opts.fontcolors) ? this.opts.fontcolors : [
                '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
                '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
                '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
                '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
                '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
                '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'
            ];
        },
        onmodal: {
            fontcolor: {
                open: function($modal, $form) {
                    $form.find('.re-fontcolor-bg').append(this._buildPicker('backcolor'));
                    $form.find('.re-fontcolor-fg').append(this._buildPicker('textcolor'));

                    // Set selected bg and fg color.
                    this._setActiveColor($form, 'background-color', '.re-fontcolor-bg');
                    this._setActiveColor($form, 'color', '.re-fontcolor-fg');
                }
            }
        },
        open: function() {
            var modalData = {
                name: 'fontcolor',
                title: this.lang.get('fontcolor'),
                handle: 'cancel', // when enter key is pressed
                commands: {
                    cancel: {
                        title: this.lang.get('cancel')
                    }
                }
            };

            this.app.api('module.modal.build', modalData);
        },
        _buildPicker: function(name) {
            var $box = $R.dom('<div class="re-dropdown-box-' + name + '">');
            var rule = (name == 'backcolor') ? 'background-color' : 'color';
            var len = this.colors.length;
            var self = this;
            var func = function(e) {
                e.preventDefault();

                var $el = $R.dom(e.target);
                if ($el.is('.active')) {
                    self._remove($el.data('rule'));
                    $box.find('span.active').removeClass('active');
                } else {
                    self._set($el.data('rule'), $el.attr('rel'));
                    $box.find('span.active').removeClass('active');
                    $el.addClass('active');
                }
            };

            for (var z = 0; z < len; z++) {
                var color = this.colors[z];

                var $swatch = $R.dom('<span>');
                $swatch.attr({
                    'rel': color,
                    'data-rule': rule
                });
                $swatch.css({
                    'background-color': color,
                    'font-size': 0,
                    'border': '2px solid #fff',
                    'width': '22px',
                    'height': '22px'
                });
                $swatch.on('mousedown', func);

                $box.append($swatch);
            }

            return $box;
        },
        _set: function(rule, value) {
            var style = {};
            style[rule] = value;

            var args = {
                tag: 'span',
                style: style,
                type: 'toggle'
            };

            this.inline.format(args);
        },
        _remove: function(rule) {
            this.inline.remove({
                style: rule
            });
        },
        _setActiveColor: function($form, attrName, classSelector) {
            var current = $R.dom(this.selection.getCurrent()),
                style = current.attr('style');

            var regex = new RegExp('(?:^|\\s*;\\s*)(' + this._escapeRegExp(attrName) + ')\\s*:\\s*([^;]+)\\s*;?', 'mg');
            matches = regex.exec(style);
            if (matches && matches.length > 1) {
                var color = this._rgbToHex(matches[2]);
                for (var i = 0; i < this.colors.length; i++) {
                    if (this.colors[i] === color) {
                        $form.find(classSelector + ' span[rel="' + color + '"]').addClass('active');
                    }
                }
            }
        },
        _rgbToHex: function(string) {
            var arr = string.replace('rgb(', '').replace(')', '').split(',');
            if (arr.length === 0) {
                return null;
            }

            var r = arr[0].trim(),
                g = arr[1].trim(),
                b = arr[2].trim();

            var func = function(rgb) {
                var hex = Number(rgb).toString(16);
                if (hex.length < 2) {
                    hex = "0" + hex;
                }
                return hex;
            };

            return "#" + func(r) + func(g) + func(b);
        },
        _escapeRegExp: function(string) {
            return string.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&'); // $& means the whole matched string
        }
    });
})(Redactor);
