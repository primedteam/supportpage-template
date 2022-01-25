// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

(function($R) {
    $R.add('plugin', 'sp-fontsize', {
        translations: {
            en: {
                format: Lang.get('core.format'),
                paragraph: Lang.get('core.paragraph'),
                heading1: Lang.get('core.heading1'),
                heading2: Lang.get('core.heading2'),
                heading3: Lang.get('core.heading3'),
                heading4: Lang.get('core.heading4'),
                heading5: Lang.get('core.heading5'),
                heading6: Lang.get('core.heading6'),
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

            this.styles = {
                h1: {
                    'font-size': '3rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                },
                h2: {
                    'font-size': '2.25rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                },
                h3: {
                    'font-size': '1.875rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                },
                h4: {
                    'font-size': '1.5rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                },
                h5: {
                    'font-size': '1.25rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                },
                h6: {
                    'font-size': '1.125rem',
                    'font-weight': '400',
                    'line-height': '1.5',
                }
            };
            this.options = {
                observe: 'sp-fontsize',
                p: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('p') + '">'
                                + this.lang.get('paragraph')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+0</span>',
                    plain_title: this.lang.get('paragraph'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'p'
                    }
                },
                h1: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h1') + '">'
                                + this.lang.get('heading1')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+1</span>',
                    plain_title: this.lang.get('heading1'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h1'
                    }
                },
                h2: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h2') + '">'
                                + this.lang.get('heading2')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+2</span>',
                    plain_title: this.lang.get('heading2'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h2'
                    }
                },
                h3: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h3') + '">'
                                + this.lang.get('heading3')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+3</span>',
                    plain_title: this.lang.get('heading3'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h3'
                    }
                },
                h4: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h4') + '">'
                                + this.lang.get('heading4')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+4</span>',
                    plain_title: this.lang.get('heading4'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h4'
                    }
                },
                h5: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h5') + '">'
                                + this.lang.get('heading5')
                            + '</span>' +
                            '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+5</span>',
                    plain_title: this.lang.get('heading5'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h5'
                    }
                },
                h6: {
                    title: '<span class="sp-icon-name" style="' + this._buildHeaderStyle('h6') + '">'
                                + this.lang.get('heading6')
                            + '</span>'
                            + '<span class="sp-icon-shortcut">' + this.detector.getShortcutKey() + '+ALT+6</span>',
                    plain_title: this.lang.get('heading6'),
                    api: 'plugin.sp-fontsize.set',
                    args: {
                        tag: 'h6'
                    }
                }
            };
        },
        // callbacks
        onclick: function(e) {
            this._markSelected();
        },
        ondropdown: {
            "sp-fontsize": {
                observe: function(dropdown) {
                    this._markSelectedItem();
                }
            }
        },
        // public
        start: function() {
            // Redactor loads default buttons first, and then it loads plugins which
            // makes it impossible to control the button order without using addButtonAfter here.
            var $button = this.toolbar.addButtonAfter('html', 'sp-fontsize', {
                title: this.lang.get('format')
            });
            this._setIcon(this.lang.get('paragraph'));
            $button.setDropdown(this.options);
        },
        set: function(value) {
            // Clone object cause we're about to change the values, and don't want it to update the core object...
            var args = JSON.parse(JSON.stringify(value));

            // Set the icon in the dropdown menu.
            this._setIcon(this.options[value.tag].plain_title);

            // Add a class to identify the element if opts.headers is disabled.
            args.attr = {
                'data-redactor-span': true,
                'data-fontformat-tag': value.tag
            };

            // Add inline style.
            if (this.styles.hasOwnProperty(value.tag)) {
                args.style = this.styles[value.tag];
            }

            // Use div instead of header element.
            if (! this.opts.headers && this._getHeaders().indexOf(value.tag) !== -1) {
                args.tag = 'div';
                this.app.module.inline.format(args);
            } else {
                this.app.module.block.format(args);
            }
        },
        // private
        _setIcon: function(name) {
            var $button = this.toolbar.getButton('sp-fontsize');

            if ($button) {
                $button.setIcon('<span>' +
                    (this.app.detector.isMobile() ? '<i class="fas fa-paragraph"></i>' : name + '&nbsp;&nbsp;<i class="fas fa-caret-down"></i>')
                    + '</span>');
            }
        },
        // private
        _markSelected: function() {
            var component = this._getSelectedComponent();
            this._setIcon(this.options[component].plain_title);
        },
        _markSelectedItem: function() {
            var $btn = this.app.toolbar.getButton('sp-fontsize'),
                $dropdown = $btn.getDropdown();

            this._resetDropdownState();

            var component = this._getSelectedComponent();
            $dropdown.getItem(component).addClass('active');
        },
        _getSelectedComponent: function() {
            var current = this.selection.getCurrent(),
                data = this.inspector.parse(current);

            var component = 'p'; // default state
            if (data.isHeading()) {
                component = data.isHeading().tagName.toLowerCase();
            }
            if (data.isParagraph()) {
                component = 'p';
            }
            if (data.isText() || data.isElement()) {
                var self = this;

                // Handle parents.
                $(data.$el.get()).parents('.redactor-in [data-fontformat-tag]').each(function() {
                    var tag = $(this).data('fontformat-tag');
                    
                    if (Object.keys(self.styles).indexOf(tag) !== -1) {
                        component = tag;
                        
                        // break out the loop.
                        return false;
                    }
                });
            }

            return component;
        },
        _resetDropdownState: function() {
            var $btn = this.app.toolbar.getButton('sp-fontsize'),
                $dropdown = $btn.getDropdown();

            for (var name in this.options) {
                if (this.options.hasOwnProperty(name) && $dropdown.getItem(name)) {
                    $dropdown.getItem(name).removeClass('active');
                }
            }
        },

        _getHeaders: function() {
            return Object.keys(this.styles);
        },
        _buildHeaderStyle: function(header) {
            if (! this.styles.hasOwnProperty(header)) {
                return '';
            }

            var arr = [];
            for (var key in this.styles[header]) {
                if (this.styles[header].hasOwnProperty(key)) {
                    arr.push(key + ':' + this.styles[header][key]);
                }
            }

            return arr.join(';');
        }
    });
})(Redactor);
