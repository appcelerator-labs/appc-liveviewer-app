var async = require('async');
var xhr = require('xhr');

var REGEXP_GIST = /^https:\/\/gist\.github\.com\/([^\/]+)\/([a-z0-9]+)(?:#(file-[a-z0-9-]+))?$/;

exports.resolve = function resolve(url, dir, callback) {
	var match;

	if ((match = url.match(REGEXP_GIST))) {
		var username = match[1];
		var gist = match[2];
		var filehash = match[3];

		var url = 'https://api.github.com/gists/' + gist;

		xhr(url, {
			contentType: 'application/json'
		}, function (err, data) {

			if (err) {
				return callback(err);
			}

			var filename;

			async.eachSeries(data.files, function iterator(file, next) {

				if (filehash) {

					if (filenameToHash(file.filename) === filehash) {
						filename = file.filename;
					} else {
						return next();
					}

				} else if (file.type === 'application/javascript' && (!filename || file.filename === 'app.js')) {
					filename = file.filename;
				}

				xhr(file.raw_url, {
					contentType: file.type,
					dir: dir,
					file: file.filename
				}, function (err, data) {

					if (err) {
						return next(err);
					}

					next();

				});

			}, function afterSeries(err) {

				if (!filename) {

					if (filehash) {
						return callback('Could not find: ' + filehash);
					} else {
						return callback('Could not find app.js or other JavaScript file.');
					}
				}

				return callback(null, dir + '/' + filename);

			});
		});

		return true;
	}

	return false;
};

function filenameToHash(filename) {
	var filehash = 'file-' + filename.replace(/[^a-z0-9]+/g, '-');

	console.debug('Hashed filename: ' + filename + ' > ' + filehash);

	return filehash;
}
