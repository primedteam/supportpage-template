/*
 * Redactor merge fields plugin.
 */
(function ($R) {
    $R.add('plugin', 'sp-mergefields', {
        translations: App.mergefields.translations,

        modals: {
            "sp-mergefields": App.mergefields.modalContent
        },

        init: function (app) {
            this.app = app;
            this.lang = app.lang;
            this.utils = app.utils;
            this.opts = app.opts;
            this.toolbar = app.toolbar;
            this.editor = app.editor;
            this.insertion = app.insertion;
            this.element = app.element;
            this.container = app.container;
        },

        onsource: {
            opened: function () {
                // Redactor annoyingly disables buttons on a 100ms timer...
                setTimeout(function () {
                    this.toolbar.getButton('sp-mergefields').enable();
                }.bind(this), 100);
            }
        },

        onchanged: function (html) {
            this.mergeFields.callback(html);
        },

        onmodal: {
            "sp-mergefields": {
                open: function ($modal, $form) {
                    var self = this;
                    this.mergeFields.appendMergeFields($($modal.get()))
                        .on('mergefield:inserted', function () {
                            self.app.api('module.modal.close');
                        });
                }
            }
        },

        // public
        start: function () {
            var $button = this.toolbar.addButtonAfter('sp-link', 'sp-mergefields', {
                title: this.lang.get('merge_fields'),
                api: 'plugin.sp-mergefields.open'
            });
            $button.setIcon(App.mergefields.icon);

            this.mergeFields = new App.mergefields({
                editor: this.app,
                show_tickets: this.opts.mergeFields.tickets,
                show_organisations: this.opts.mergeFields.organisations,
                show_canned_responses: this.opts.mergeFields.canned_responses,
                syntaxEmailTemplate: this.opts.syntaxEmailTemplate
            });

            this.mergeFields.init();
        },

        open: function () {
            var modalData = {
                name: 'sp-mergefields',
                title: this.lang.get('merge_fields'),
                handle: 'cancel', // when enter key is pressed
                commands: {
                    cancel: {
                        title: this.lang.get('cancel')
                    }
                }
            };

            this.app.api('module.modal.build', modalData);
        }
    });
})(Redactor);
