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

	var hash = Ti.Utils.sha256(url);

	console.debug('url: ' + url);
	console.debug('hash: ' + hash);

	var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, CFG.DATA_DIR, hash);

	if (!dir.exists()) {
		dir.createDirectory();
	}

	if (alloy) {
		download(CFG.SERVER_URL + '&url=' + encodeURIComponent(url), afterDownload);

	} else if (!require('github').download(url, dir, afterDownload)) {
		download(url, dir, afterDownload);
	}

	function afterDownload(err, moduleId) {
		proxy = require('proxy').createProxy(dir.resolve());
		proxy.require(moduleId);
	}

	function download(url, dir, callback) {

		require('xhr')(url, {
			write: dir
		}, callback);
	}
}
