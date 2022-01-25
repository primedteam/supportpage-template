(function($R) {
    $R.add('service', 'spdetector', {
        init: function(app) {
            this.app = app;
        },
        getShortcutKey: function () {
            return 'CTRL';
        }
    });
})(Redactor);