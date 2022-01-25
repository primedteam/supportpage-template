$(function() {
    // Check if send email checkbox should be checked on event based on relevant department email template
    function handleEmailCheckbox(template, name) {
        if (template != -1) {
            $checkboxes[name].checkbox.prop('disabled', false).prop('checked', $checkboxes[name].state);
            $checkboxes[name].checkbox.parent().removeAttr('title');
        } else {
            $checkboxes[name].checkbox.prop('checked', false).prop('disabled', true);
            $checkboxes[name].checkbox.parent().attr('title', Lang.get('ticket.department_template_disabled'));
        }
    }

    var $checkboxes = {
        'user': {'checkbox': $('.message-form .send-user-email input[type="checkbox"]') },
        'operator_reply': {'checkbox': $('.message-form .send-operators-email input[type="checkbox"]')},
        'operator_note': {'checkbox': $('.notes-form .send-operators-email input[type="checkbox"]') }
    };

    $.each($checkboxes, function (index, value) {
        // Save the state of the checkbox initially and on change
        value.state = value.checkbox.is(':checked');
        value.checkbox.on('change', function() {
            value.state = $(this).is(':checked');
        });

        // If the checkbox is disabled, uncheck it
        if (value.checkbox.prop('disabled')) {
            value.checkbox.prop('checked', false);
        }
    });

    // Check if 'send email to user' should show based on ticket status set, message form only
    $(document).on('change', '.message-form select[name="to_status"]', function () {
        if ($(this).val() == closedStatusId && departmentTemplates.user_ticket_reply == -1) {
            // Only need to check this branch if the reply template is disabled (fallback for operator closed)
            handleEmailCheckbox(departmentTemplates.user_ticket_operatorclose, 'user');
        } else {
            handleEmailCheckbox(departmentTemplates.user_ticket_reply, 'user');
        }
    });

    // Mock a change on the status to have it run the above code
    $('.message-form select[name="to_status"]').trigger('change');

    // Check if 'send email to operator(s)' should show based on ticket message type
    $('.reply-type .option').on('click', function() {
        if ($(this).data('type') == 0) {
            handleEmailCheckbox(departmentTemplates.operator_operator_ticket_reply, 'operator_reply');
        } else {
            handleEmailCheckbox(departmentTemplates.operator_ticket_note, 'operator_note');
        }
    });

    // Handle expanding each option group
    $(document).on('click', '.sp-reply-options-header', function() {
        $(this).next(".sp-reply-options-content").slideToggle(500);
        $(this).find(".fas").toggleClass("fa-chevron-down fa-chevron-up");
    });

    // Add a new canned response
    $('input[name=add_canned]').on('change', function() {
        var $table = $(this).parents('.sp-reply-option').find('div');

        this.checked ? $table.removeClass('sp-hidden') : $table.addClass('sp-hidden');
    });

    /*
     * Search for a canned response
     */
    $(document).on('donetyping', 'input[name=cannedResponseSearch]', function() {
        var $this = $(this),
            $container = $(this).parents('.redactor-modal-body'),
            $list = $container.find('.canned-response-results');

        // Add a search icon
        $this.parent().addClass('sp-loading');

        $container.find('.canned-response-tags a').addClass('sp-disabled');

        // Fire the AJAX
        $.get(laroute.route('ticket.operator.cannedresponse.search',
            {
                term: $this.val(),
                tags: Object.keys(selectedTags).join(','),
                order: $('select[name=cannedResponseOrder]').val(),
                locale: $('select[name=cannedResponseLang]').val(),
                start: 0,
                ticket_id: ticket.parameters().ticketId,
                user_id: ticket.parameters().userId,
                brand_id: ticket.parameters().brandId
            }))
            .done(function (data) {
                // In case it's searched two requests at once (rare)
                $list.empty();

                // Add responses to list
                $list = addResponsesToList(data, $list, $container);

                // Show the results
                $list.show();
            })
            .always(function () {
                $this.parent().removeClass('sp-loading');
                $container.find('.canned-response-tags a').removeClass('sp-disabled');
            });
    });

    /*
     * Load more canned responses
     */
    $(document).on('click', '.canned-response-results a.load-more', function() {
        var $list = $(this).parents('ul'),
            $container = $(this).parents('.redactor-modal-body'),
            $this = $(this).parent();

        // Replace button with spinner icon
        $(this).replaceWith('<i class="fas fa-spinner fa-pulse fa-fw sp-description"></i>');

        // Fire the AJAX
        $.get(laroute.route('ticket.operator.cannedresponse.search',
            {
                term: $('input[name=cannedResponseSearch]').val(),
                tags: Object.keys(selectedTags).join(','),
                order: $('select[name=cannedResponseOrder]').val(),
                locale: $('select[name=cannedResponseLang]').val(),
                start: $list.children('li.response-item').length,
                ticket_id: ticket.parameters().ticketId,
                user_id: ticket.parameters().userId,
                brand_id: ticket.parameters().brandId
            }))
            .done(function (data) {
                addResponsesToList(data, $list, $container);
            })
            .always(function () {
                // Remove row with spinning icon
                $this.remove();
            });
    });

    // Change order of responses
    $(document).on('change', 'select[name=cannedResponseOrder]', function() {
        // Create/update cookie for a year
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = "cannedResponseOrder=" + $(this).val() + "; expires="+ d.toUTCString();

        var $container = $(this).parents('.redactor-modal-body');

        $container.find('input[name=cannedResponseSearch]').trigger('donetyping');
    });

    // Change language of responses
    $(document).on('change', 'select[name=cannedResponseLang]', function() {
        var $container = $(this).parents('.redactor-modal-body');

        $container.find('input[name=cannedResponseSearch]').trigger('donetyping');
    });

    var selectedTags = {};
    // Select/deselect tag
    $(document).on('click', 'li.sp-tag a', function() {
        if ($(this).parent().hasClass('sp-disabled')) {
            return false;
        }

        var $container = $(this).parents('.redactor-modal-body'),
            tagId = $(this).data('id');

        // Select / deselect the tag.
        selectedTags.hasOwnProperty(tagId) ? delete selectedTags[tagId] : selectedTags[tagId] = 1;

        $(this).parent().toggleClass('sp-active');

        $container.find('input[name=cannedResponseSearch]').trigger('donetyping');
    });

    (function($R) {
        $R.add('plugin', 'sp-cannedresponses', {
            translations: {
                en: {
                    cannedresponses: Lang.choice('ticket.cannedresponse', 2)
                }
            },

            init: function(app) {
                this.app = app;
                this.lang = app.lang;
                this.toolbar = app.toolbar;
                this.selection = app.selection;
                this.insertion = app.insertion;
                this.detector = app.spdetector;
            },

            modals: {
                'sp-cannedresponses': '<form action=""></form>'
            },
            onmodal: {
                'sp-cannedresponses': {
                    open: function($modal, $form) {
                        $form.append(this._getTemplate());
                        $modal.addClass('custom-redactor-plugin');
                    },
                    opened: function($modal, $form) {
                        $(document).off('click.cannedresponse')
                            .on('click.cannedresponse', '.canned-response-results li a:not(.load-more)', this.insert.bind(this));

                        $($form.get()).find('input[name=cannedResponseSearch]').donetyping().trigger('donetyping').trigger('focus');
                    }
                }
            },

            // public
            start: function() {
                var $button = this.toolbar.addButtonAfter('sp-lists', 'sp-cannedresponses', {
                    title: this.lang.get('cannedresponses')
                        + '&nbsp;<span class="sp-icon-shortcut">(' + this.detector.getShortcutKey() + '+SHIFT+1)</span>',
                    api: 'plugin.sp-cannedresponses.show'
                });
                $button.setIcon('<i class="fas fa-comments"></i>');
            },

            show: function()
            {
                var modalData = {
                    name: 'sp-cannedresponses',
                    title: this.lang.get('cannedresponses'),
                    width: ($(document).width() / 1.2) + 'px',
                    handle: 'cancel', // when enter key is pressed
                    commands: false
                };

                this.selection.save();

                this.app.api('module.modal.build', modalData);
            },

            insert: function(e)
            {
                // Get the element that triggered this on click event handler
                var $modal = this,
                    $this = (e.target) ? $(e.target) : $(e.srcElement),
                    id;

                // Get the ID, sometimes it may be a div inside the a tag
                if ($this.is('a')) {
                    id = $this.data('id');
                } else {
                    id = $this.parents('a').data('id');
                }

                // Fetch canned response text and insert
                $.get(
                    laroute.route('ticket.operator.cannedresponse.show', { id: id }),
                    {
                        ticket_id: ticket.parameters().ticketId,
                        user_id: ticket.parameters().userId,
                        brand_id: ticket.parameters().brandId,
                        locale: $('select[name=cannedResponseLang]').val()
                    },
                    function(response) {
                        // Restore the caret/cursor position
                        $modal.app.api('module.modal.close');
                        $modal.selection.restore();

                        if (response.status == 'success') {
                            $modal.insertion.insertHtml(response.data);
                        }

                        $modal.app.api('module.source.sync');
                    }, "json");
            },

            /**
             * Get modal content HTML.
             *
             * @returns {string}
             * @private
             */
            _getTemplate: function()
            {
                // Try to get order that's saved in JS cookie
                var order = 0;
                if (getCookie('cannedResponseOrder') != "") {
                    order = getCookie('cannedResponseOrder');
                }

                // Create a list of language options for dropdown
                var languageOptions = '';
                var languageCount = 0;
                for (var code in allLanguages) {
                    languageOptions += '<option value="' + code + '" '
                        + (userLanguage == code ? 'selected="selected"' : '') + '>' + allLanguages[code] + '</option>';
                    languageCount++;
                }

                return String()
                    + '<section>'
                        + '<div class="sp-flex">'
                            + '<div class="sp-flex-grow sp-relative sp-overflow-x-hidden">'
                                + '<input type="text" name="cannedResponseSearch" placeholder="' + Lang.get('ticket.search_canned') + '" />'
                                + '<div></div>'
                                + '<ul class="canned-response-results redactor-search hide"></ul>'
                            + '</div>'
                            + '<div class="sp-flex-none sp-w-48 sp-ml-6 sp-text-secondary sp-hidden md:sp-block">'
                                + '<strong>' + Lang.get('general.sort_by') + '</strong>'
                                + '<select name="cannedResponseOrder">'
                                    + '<option value="0" ' + (order == 0 ? 'selected="selected"' : '') + '>' + Lang.get('general.frequently_used') + '</option>'
                                    + '<option value="1" ' + (order == 1 ? 'selected="selected"' : '') + '>' + Lang.get('general.recently_used') + '</option>'
                                    + '<option value="2" ' + (order == 2 ? 'selected="selected"' : '') + '>' + Lang.get('general.recently_created') + '</option>'
                                + '</select>'
                                + (languageCount > 1 ? '<strong class="sp-block sp-mt-3">' + Lang.choice('general.language', 1) + '</strong>'
                                    + '<select name="cannedResponseLang">' + languageOptions + '</select>' : '')
                                + '<strong class="sp-block sp-mt-3">' + Lang.choice('ticket.tag', 2) + '</strong>'
                                + '<ul class="canned-response-tags sp-list-none sp-p-0">'
                                    + '<li class="sp-description"><i class="fas fa-spinner fa-pulse fa-fw"></i> ' + Lang.get('ticket.loading_tags') + '...</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    + '</section>';
            },
        });
    })(Redactor);

    /*
     * Search for a self-service article
     */
    // Fire an AJAX request once they've entered the search term
    $(document).on("donetyping", 'input[name=selfServiceSearch]', function() {
        var $this = $(this),
            $container = $(this).parents('.redactor-modal-body'),
            $list = $container.find('.self-service-results');

        // Clear the results
        $list.empty();

        // Only if there is at least one character
        if ($this.val().length) {
            // Add a search icon
            $this.parent().addClass('sp-loading');

            // Fire the AJAX
            $.get(laroute.route('selfservice.operator.article.search', {
                    term: $this.val(),
                    brandId: ticket.parameters().brandId,
                    userId: ticket.parameters().userId,
                    locale: $('.selfServiceLang select').val()
                }))
                .done(function (data) {
                    // In case it's searched two requests at once (rare)
                    $list.empty();

                    if (data.data.length == 0) {
                        // No results were found
                        $list.append('<li class="no-results">' + Lang.get('messages.no_results') + '</li>');
                    } else {
                        // Add each result to the list
                        $.each(data.data, function (key, item) {
                            $list.append(
                                '<li>' +
                                    '<a data-url="' + item.frontend_url + '">' +
                                        '<span class="sp-title">' + item.title + '</span><br />' +
                                        '<div class="sp-description sp-truncate">' + (item.excerpt || '') + '</div>' +
                                    '</a>' +
                                '</li>'
                            );
                        });
                    }

                    // Show the results
                    $list.show();
                })
                .always(function () {
                    $this.parent().removeClass('sp-loading');
                });
        }
    });

    // Change language of self-service links
    $(document).on('change', '.selfServiceLang select', function() {
        $('input[name=selfServiceSearch]').trigger('donetyping');
    });

    (function($R) {
        $R.add('plugin', 'sp-selfservice', {
            translations: {
                en: {
                    selfservice: Lang.get('ticket.add_selfservice_link')
                }
            },

            init: function(app) {
                this.app = app;
                this.lang = app.lang;
                this.toolbar = app.toolbar;
                this.selection = app.selection;
                this.insertion = app.insertion;
                this.detector = app.spdetector;
            },

            modals: {
                'sp-selfservice': '<form action=""></form>'
            },
            onmodal: {
                'sp-selfservice': {
                    open: function($modal, $form) {
                        $form.append(this._getTemplate());
                        $modal.addClass('custom-redactor-plugin');
                    },
                    opened: function($modal, $form) {
                        $(document).off('click.selfservice')
                            .on('click.selfservice', '.self-service-results li a:not(.load-more)', this.insert.bind(this));

                        $('input[name=selfServiceSearch]').donetyping().trigger('focus');
                    }
                }
            },

            // public
            start: function() {
                var $button = this.toolbar.addButtonAfter('sp-cannedresponses', 'sp-selfservice', {
                    title: this.lang.get('selfservice')
                        + '&nbsp;<span class="sp-icon-shortcut">(' + this.detector.getShortcutKey() + '+SHIFT+2)</span>',
                    api: 'plugin.sp-selfservice.show'
                });
                $button.setIcon('<i class="fas fa-external-link-alt"></i>');
            },

            show: function()
            {
                var modalData = {
                    name: 'sp-selfservice',
                    title: this.lang.get('selfservice'),
                    width: ($(document).width() / 1.2) + 'px',
                    handle: 'cancel', // when enter key is pressed
                    commands: false
                };

                this.selection.save();

                this.app.api('module.modal.build', modalData);
            },
            insert: function(e)
            {
                var $this = (e.target) ? $(e.target) : $(e.srcElement),
                    url, title;

                // Get the URL, sometimes it may be a div inside the a tag
                if ($this.is('a')) {
                    url = $this.data('url');
                    title = $this.find('.sp-title').text();
                } else {
                    url = $this.parents('a').data('url');
                    title = $this.parents('a').find('.sp-title').text();
                }

                // If we have a valid URL insert it into the DOM
                if (typeof url !== 'undefined') {
                    // Restore the caret/cursor position
                    this.app.api('module.modal.close');
                    this.selection.restore();

                    this.insertion.insertHtml(
                        $('<div/>')
                            .append($('<a/>', {href: url, text: title}))
                            .html()
                    );

                    this.app.api('module.source.sync');
                }
            },
            _getTemplate: function() {
                // Create a list of language options for dropdown
                var languageOptions = '';
                var languageCount = 0;
                for (var code in allLanguages) {
                    languageOptions += '<option value="' + code + '" '
                        + (userLanguage == code ? 'selected="selected"' : '') + '>' + allLanguages[code] + '</option>';
                    languageCount++;
                }

                return String()
                    + '<section>'
                        + '<div class="sp-flex">'
                            + '<div class="sp-flex-grow sp-relative sp-overflow-x-hidden">'
                                + '<input type="text" name="selfServiceSearch" placeholder="' + Lang.get('ticket.search_selfservice') + '" />'
                                + '<div></div>'
                                + '<ul class="self-service-results redactor-search sp-hidden"></ul>'
                            + '</div>'
                            + (languageCount > 1 ?
                                '<div class="selfServiceLang sp-flex-none sp-w-48 sp-ml-6 sp-text-secondary sp-hidden md:sp-block">'
                                    + '<strong>' + Lang.choice('general.language', 1) + '</strong>'
                                    + '<select>' + languageOptions + '</select>'
                                    + '</div>'
                                : '')
                        + '</div>'
                    + '</section>';
            }
        });
    })(Redactor);

    function addResponsesToList(data, $list, $container) {
        if (typeof data.data.results == "undefined" ||
            (data.data.results.length === 0 && $list.children('.response-item').length === 0)) {
            // No results were found
            $list.append('<li class="no-results sp-description">' + Lang.get('messages.no_results') + '</li>');
        } else {
            $.each(data.data.results, function (key, item) {
                // Add tags if they exist
                var $tags = $('<span>');
                if (item.tags.length) {
                    $.each(item.tags, function (key, tag) {
                        $tags.append('<span class="sp-tag">' + tag.name + '</span>');
                    });
                }

                // Add each result to the list
                $list.append('<li class="response-item"><a data-id="' + item.id + '">'
                    + '<span class="sp-title">' + item.name + '</span>'
                    + '&nbsp;&nbsp;' + $tags.html()
                    + '<div class="sp-description sp-truncate">' + $("<p>").html(item.text).text()
                    + '</div></a></li>');
            });
        }

        // Handle tags if they're included in results
        if (typeof data.data.tags != "undefined") {
            var $tags = $container.find('.canned-response-tags');
            $tags.empty();
            if (data.data.tags.length === 0) {
                // No results were found
                $tags.append('<li class="no-results sp-description">' + Lang.get('messages.no_results') + '</li>');
            } else {
                // Add each tag
                $.each(data.data.tags, function (key, item) {
                    $tags.append('<li class="sp-tag sp-table sp-mt-1"><a data-id="' + item.id + '">'
                        + item.name + ' (' + item.count + ')</span>'
                        + '</a></li>');
                });

                // Highlight selected tags if exists
                $.each(selectedTags, function (key, value) {
                    $('li.sp-tag a[data-id=' + key + ']').parent().addClass('sp-active');
                });
            }
        }

        // Show load more button if more items than what is showing
        if (data.count > $list.children('.response-item').length) {
            $list.append('<li class="sp-p-3 sp-text-center"><a class="load-more sp-button">'
                + Lang.get('general.load_more') + '</a></li>');
        }

        return $list;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length,c.length);
            }
        }
        return "";
    }
});
