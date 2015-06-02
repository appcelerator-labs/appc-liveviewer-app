var fs = require('fs');

module.exports = function xhr(url, opts, callback) {
	var xhr = Ti.Network.createHTTPClient({
		cache: false,
		onload: function onLoad() {

			if (this.status !== 200 || !this.responseText) {
				return callback('No response: ' + this.status);
			}

			var response;

			var contentType = opts.contentType || this.getResponseHeader('Content-Type');

			if (contentType === 'application/zip') {



			} else {

				if (opts.write) {
					var file = fs.ensureFileSync(opts.write);
					file.write(this.responseData);

					return callback();
				}

				if (contentType === 'application/json') {
					try {
						response = JSON.parse(this.responseText);
					} catch (e) {
						return callback('Invalid response: ' + this.responseText);
					}
				}
			}

			callback(null, response);
		},
		onerror: function onError(e) {
			return callback('No connection: ' + e.error + (e.code ? ' #' + e.code : ''));
		}
	});

	xhr.open('GET', url);
	xhr.send();
};
