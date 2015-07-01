var CFG = require('CFG');
var utils = require('utils');

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

	// in case we were not reset by shake (e.g. Android back);
	exports.clean();

	var url = opts.url;
	var alloy = opts.alloy;

	var uuid = Ti.Platform.createUUID();

	// FIXME: https://jira.appcelerator.org/browse/TIMOB-19127
	if (CFG.OS_WINDOWS) {
		uuid = uuid.replace(/[\{\}]/g, '');
	}

	console.debug('url: ' + url);
	console.debug('uuid: ' + uuid);

	// FIXME: https://jira.appcelerator.org/browse/TIMOB-19128
	var dir = utils.ensureDirSync(Ti.Filesystem.applicationDataDirectory + CFG.DATA_DIR + '/' + uuid);

	// we only need the path, not the object
	dir = dir.resolve();

	console.debug('uuid dir: ' + dir);

	if (alloy || url.indexOf('https://github.com/') === 0) {
		console.debug('downloading via server');

		download(CFG.SERVER_URL + '/compile?platform=' + CFG.PLATFORM_NAME + '&url=' + encodeURIComponent(url), dir, start);

	} else if (!require('gist').resolve(url, dir, start)) {
		console.debug('downloading directly');

		download(url, dir, start);
	}

	function start(err, path) {

		if (err) {
			return callback(err);
		}

		var resourcesDirectory = path.substr(0, path.lastIndexOf('/'));

		var moduleId = path.substr(resourcesDirectory.length + 1);
		moduleId = moduleId.substr(0, moduleId.lastIndexOf('.'));

		// if root module is in platform-dir, pop it
		resourcesDirectory = resourcesDirectory.replace(new RegExp('/' + CFG.PLATFORM_DIR + '$'), '');

		console.debug('resourcesDirectory: ' + resourcesDirectory);
		console.debug('moduleId: ' + moduleId);

		// create new proxy
		proxy = require('proxy').createProxy(resourcesDirectory);
		proxy.require(moduleId, {
			root: true
		});

		loadFonts(resourcesDirectory);

		callback();
	}

	function download(url, dir, callback) {
		console.debug('Downloading: ' + url);

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
}

function loadFonts(resourceDirectory) {

	if (!CFG.OS_IOS) {
		return;
	}

	var dynamicFont = require('yy.tidynamicfont');

	var paths = [
		resourceDirectory + '/fonts',
		resourceDirectory + '/iphone/fonts'
	];

	paths.forEach(function (path) {
		var dir = Ti.Filesystem.getFile(path);
		var filenames = dir.getDirectoryListing();

		if (!filenames) {
			return;
		}

		filenames.forEach(function (filename) {
			if (filename.match(/\.(ttf|otf)$/i)) {
				var file = Ti.Filesystem.getFile(path, filename);
				dynamicFont.registerFont(file);
			}
		});
	});
}
