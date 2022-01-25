(function($R)
{
	$R.add('plugin', 'imagemanager', {
		translations: {
			en: {
			    "image": Lang.get('core.insert_image'),
				"insert_image": Lang.get('core.insert_image'),
				"upload": Lang.get('core.upload'),
				"upload-label": Lang.get('core.upload_label')
			}
		},
		init: function(app)
		{
			this.app = app;
			this.lang = app.lang;
			this.opts = app.opts;
			this.toolbar = app.toolbar;
			this.inspector = app.inspector;
			this.selection = app.selection;
		},
		// messages
		onmodal: {
			image: {
				open: function($modal, $form)
				{
					if (!this.opts.imageManagerJson) return;
					this._load($modal)
				}
			}
		},

		// public
		start: function() {
			var $button = this.toolbar.addButtonAfter('sp-lists', 'sp-image', {
				title: this.lang.get('insert_image'),
				api: 'module.image.open',
			});
			$button.setIcon('<i class="fas fa-image"></i>');
		},

		// private
		markSelected: function() {
			var $btn = this.app.toolbar.getButton('sp-image');

			var current = this.selection.getCurrent(),
				data = this.inspector.parse(current);

			if ($btn) {
				data.isLink() ? $btn.setActive() : $btn.setInactive();
			}
		},
		_resetButtonState: function() {
			var $btn = this.app.toolbar.getButton('sp-image');
			$btn.setInactive();
		},
		_parse: function(data)
		{
			for (var key in data)
			{
				var obj = data[key];
				if (typeof obj !== 'object') continue;

				var $img = $R.dom('<img>');
				var url = (obj.thumb) ? obj.thumb : obj.url;

				$img.attr('src', url);
				$img.attr('data-params', encodeURI(JSON.stringify(obj)));
				$img.css({
					width: '96px',
					height: '72px',
					margin: '0 4px 2px 0',
					cursor: 'pointer'
				});

				$img.on('click', this._insert.bind(this));

				this.$box.append($img);
			}
		},
		_insert: function(e)
		{
			e.preventDefault();

			var $el = $R.dom(e.target);
			var data = JSON.parse(decodeURI($el.attr('data-params')));

			this.app.api('module.image.insert', { image: data });
		}
	});
})(Redactor);
