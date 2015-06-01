var REGEXP_GIST = /^https:\/\/gist\.github\.com\/([^\/]+)\/([a-z0-9]+)(?:#(file-[a-z0-9-]+))?$/;

exports.resolve = function resolve(url, callback) {
	var match;

	if ((match = url.match(REGEXP_GIST))) {

		return api('https://api.github.com/gists/' + match[2], function (err, response) {
			var url;

			console.log(response);

			if (err) {
				return callback(err);
			}

			for (var filename in response.files) {

				if (match[3] ? (filenameToHash(filename) === match[3]) : !url) {
					url = response.files[filename].raw_url;
				}
			}

			if (!url) {
				return callback('Could not find raw URL for gist.');
			}

			return callback(null, url);
		});
	}

	return callback();
};

function api(url, callback) {

	var xhr = Ti.Network.createHTTPClient({
		onload: function onLoad() {

			if (this.status !== 200 || !this.responseText) {
				return callback('No response from GitHub API.');
			}

			var response;

			try {
				response = JSON.parse(this.responseText);
			} catch (e) {
				return callback('Invalid response from GitHub API.');
			}

			callback(null, response);
		},
		onerror: function onError(e) {
			return callback('Could not connect to GitHub API: ' + e.error);
		}
	});

	xhr.open('GET', url);
	xhr.send();
}

function filenameToHash(filename) {
	return 'file-' + filename.replace(/[^a-z0-9]+/g, '-');
}
