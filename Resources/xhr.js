var utils = require('utils');

module.exports = function xhr(url, opts, callback) {
	opts = opts || {};

	var client = Ti.Network.createHTTPClient({
		cache: false,
		onload: function onLoad() {

			if (this.status !== 200 || !this.responseText) {
				return callback(this.responseText || 'No response: ' + this.status);
			}

			var contentType = opts.contentType || this.getResponseHeader('Content-Type');

			if (opts.dir) {
				opts.file = opts.file || 'app.js';

				var file;

				if (contentType === 'application/zip') {
					file = Ti.Filesystem.createTempFile();
					file.write(this.responseData);

					var dir = utils.ensureDirSync(opts.dir);

					require('ti.compression').unzip(dir.resolve(), file.resolve(), true);

					return callback();

				} else {
					file = utils.ensureFileSync(opts.dir + '/' + opts.file);
					file.write(this.responseData);

					return callback();
				}
			}

			var response = this.responseText;

			if (contentType === 'application/json') {
				try {
					response = JSON.parse(response);
				} catch (e) {
					return callback('Invalid response: ' + this.responseText);
				}
			}

			callback(null, response);
		},
		onerror: function onError(e) {
			return callback(this.responseText || ('Server error: ' + e.error + (e.code ? ' #' + e.code : '')));
		}
	});

	client.open('GET', url);

	// FIXME: https://jira.appcelerator.org/browse/TIMOB-19129
	if (Ti.Platform.name === 'windows') { // can't require CFG since it depends on xhr
		client.setRequestHeader('User-Agent', 'Appcelerator Titanium/' + (Ti.version || '4.1.0') + ' (' + Ti.Platform.model + '; ' + Ti.Platform.name + '; ' + Ti.Locale.currentLocale + ';)');
	}

	client.send();
};
