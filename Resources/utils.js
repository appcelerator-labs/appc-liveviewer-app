var Utils = exports;

// Somewhat conform fs-extra:
// https://github.com/jprichardson/node-fs-extra#ensurefilefile-callback
Utils.ensureFileSync = function ensureFileSync(path) {
	var dir = path.substr(0, path.lastIndexOf('/'));

	Utils.ensureDirSync(dir);

	return Ti.Filesystem.getFile(path);
};

// Somewhat conform fs-extra:
// https://github.com/jprichardson/node-fs-extra#ensuredirdir-callback
Utils.ensureDirSync = function ensureDirSync(path) {
	var create = [];
	var exists = false;
	var dir;

	while (!exists) {
		var file = Ti.Filesystem.getFile(path);

		if (!dir) {
			dir = file;
		}

		exists = file.exists();

		if (!exists) {
			create.unshift(file);
		}

		path = path.substr(0, path.lastIndexOf('/'));
	}

	create.forEach(function (file) {
		file.createDirectory();
	});

	return dir;
};

// Somewhat conform NodeJS:
// https://nodejs.org/api/path.html#path_path_join_path1_path2
Utils.joinPath = function joinPath(args) {
	var path = args[0];

	if (args.length > 0) {

		for (var i = 1; i < args.length; i++) {
			var arg = args[i];

			// only adds a slash when left arguments don't have it
			if (arg.charAt(0) !== '/' && path.charAt(arg.length - 1) !== '/') {
				path += '/' + arg;
			} else {
				path += arg;
			}
		}
	}

	return path;
};

// By David Bankier:
// https://github.com/dbankier/TiShadow/blob/master/app/Resources/api/DensityAssets.js#L55
Utils.injectSuffix = function injectSuffix(file, suffix) {
	var parts = file.split('.');
	var ext = parts.pop();
	return parts.join('.') + suffix + '.' + ext;
};

// Somewhat conform NodeJS:
// https://nodejs.org/api/path.html#path_path_extname_p
Utils.extname = function extname(path) {
	var index = path.lastIndexOf('.');

	if (index === -1) {
		return '';
	}

	return path.substr(index);
};
