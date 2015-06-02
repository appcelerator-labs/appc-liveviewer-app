var CFG = require('CFG');

var proxy;

exports.clean = function clean() {
	var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, CFG.DATA_DIR);

	if (dir.exists()) {
		dir.deleteDirectory(true);
	}

	if (proxy) {
		proxy.clean();
		proxy = null;
	}
};

exports.create = function create(opts, callback) {
	var url = opts.url;
	var alloy = opts.alloy;

	var uuid = Ti.Platform.createUUID();

	console.debug('url: ' + url);
	console.debug('uuid: ' + uuid);

	var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, CFG.DATA_DIR, uuid);

	if (!dir.exists()) {
		dir.createDirectory();
	}

	// we only need the path, not the object
	dir = dir.resolve();

	console.debug('uuid dir: ' + dir);

	if (alloy) {
		console.debug('downloading via server');

		download(CFG.SERVER_URL + '&url=' + encodeURIComponent(url), start);

	} else if (!require('github').resolve(url, dir, start)) {
		console.debug('downloading directly');

		download(url, dir, start);
	}

	function start(err, path) {

		if (err) {
			return callback(err);
		}

		var dir = path.substr(0, path.lastIndexOf('/'));

		var moduleId = path.substr(dir.length + 1);
		moduleId = moduleId.substr(0, moduleId.lastIndexOf('.'));

		dir = dir.replace(new RegExp('/' + CFG.PLATFORM_DIR + '$'), '');

		console.debug('dir: ' + dir);
		console.debug('moduleId: ' + moduleId);

		proxy = require('proxy').createProxy(dir);
		proxy.require(moduleId);

		callback();
	}

	function download(url, dir, callback) {

		require('xhr')(url, {
			dir: dir,
			file: 'app.js'
		}, function onXhr(err) {

			if (err) {
				return callback(err);
			}

			var file = findApp(dir);

			if (!file) {
				return callback('Could not find an app.js');
			}

			return callback(null, file.resolve());
		});
	}
};

function findApp(path) {
	var file;

	file = Ti.Filesystem.getFile(path, CFG.PLATFORM_DIR, 'app.js');

	console.debug('trying platform file: ' + file.resolve());

	if (file.exists() && file.isFile()) {
		return file;
	}

	file = Ti.Filesystem.getFile(path, 'app.js');

	if (file.exists() && file.isFile()) {
		return file;
	}

	var dir = Ti.Filesystem.getFile(path);

	if (!dir.exists() || !dir.isDirectory()) {
		return;
	}

	var files = dir.getDirectoryListing();

	if (files.some(function (dirname) {
			file = findApp(path + '/' + dirname);

			return !!file;
		})) {

		return file;
	}

	return;
};
