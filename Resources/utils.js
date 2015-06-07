// Somewhat conform NodeJS:
// https://nodejs.org/api/path.html#path_path_join_path1_path2
exports.joinPath = function joinPath(args) {
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
exports.injectSuffix = function injectSuffix(file, suffix) {
	var parts = file.split('.');
	var ext = parts.pop();
	return parts.join('.') + suffix + '.' + ext;
};

// Somewhat conform NodeJS:
// https://nodejs.org/api/path.html#path_path_extname_p
exports.extname = function extname(path) {
	var index = path.lastIndexOf('.');

	if (index === -1) {
		return '';
	}

	return path.substr(index);
};
