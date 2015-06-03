exports.ensureFileSync = function ensureFileSync(path) {
	var dir = path.substr(0, path.lastIndexOf('/'));

	exports.ensureDirSync(dir);

	var file = Ti.Filesystem.getFile(path);

	if (!file.exists()) {
		file.createFile();
	}

	return file;
};

exports.ensureDirSync = function ensureDirSync(path) {
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