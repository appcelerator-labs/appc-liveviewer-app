exports.ensureFileSync = function ensureFileSync(filepath) {
	var path = Ti.Filesystem.applicationDataDirectory.replace(/\/$/, '');
	var nodes = filepath.substr(path.length).replace(/^\//, '').split('/');
	var file;

	nodes.forEach(function (node) {
		path += '/' + node;

		file = Ti.Filesystem.getFile(path);

		if (path === filepath) {
			return;
		}

		if (!file.exists()) {
			file.createDirectory();
		}
	});

	return file;
};
