exports.ensureFileSync = function ensureFileSync(filepath) {
	console.debug('filepath: ' + filepath);

	var path = Ti.Filesystem.applicationDataDirectory;

	filepath = file.substr(path.length);

	console.debug('filepath: ' + filepath);

	var nodes = file.split('/');

	var file;

	nodes.forEach(function (node) {
		path += '/' + node;

		var file = Ti.Filesystem.getFile(path);

		if (path !== filepath) {
			return;
		}

		if (!file.exists()) {
			file.createDirectory();
		}
	});

	return file;
};
