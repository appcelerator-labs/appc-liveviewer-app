(function LiveViewer(global) {

	var compression = require('ti.compression');

	var DATA_DIR = 'code';
	var DATA_PATH;

	var proxy;

	(function init() {

		cleanup();

		require('ui').createDialog(loadURL).open();

		Ti.Gesture.addEventListener('shake', restart);

	})();

	function restart() {
		Ti.Gesture.removeEventListener('shake', restart);

		if (proxy) {
			// proxy.destroy();
		}

		Ti.App._restart();
	}

	function cleanup() {
		var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, DATA_DIR);

		if (dir.exists()) {
			dir.deleteDirectory(true);
		}

		dir.createDirectory();

		DATA_PATH = dir.resolve();
	}

	function loadURL(url) {

		function downloadURL(url) {

			download(url, function onDownload(err, file) {

				if (err) {
					return alert(err);
				}

				load(file);
			});
		}

		require('github').resolve(url, function (err, resolvedUrl) {

			if (err) {
				return alert(err);
			}

			console.log('URL ' + (resolvedUrl || url));

			return downloadURL(resolvedUrl || url);
		});
	}

	function testJS() {
		var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'test', 'app.js');

		load(file);
	}

	function testZIP() {
		var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'test', 'test.zip');

		extract(file, function onExtract(err, dir) {

			if (err) {
				return alert(err);
			}

			load(dir);
		});
	}

	function download(url, next) {

		// TODO: Detect type and decide to download directly or via liveviewer server or modify URL (GitHub gists etc)
		var viaServer = false;

		if (viaServer) {
			url = Alloy.CFG.server.url + '&url=' + encodeURIComponent(url);
		}

		var contentType;

		var xhr = Ti.Network.createHTTPClient({
			onreadystatechange: function onReadystatechange(e) {

				// prevent abort loop
				if (this.readyState === this.DONE) {
					return;
				}

				contentType = this.getResponseHeader('Content-Type');

				// abort unsupported mime types
				if (contentType && ['text/javascript', 'text/plain', 'application/zip'].indexOf(contentType) === -1) {
					next && next('Unsupported content-type: ' + contentType);

					// onerror does not seem to be called, but just for sure
					next = null;

					this.abort();
				}
			},
			onload: function onLoad(e) {
				var extension;

				if (!this.responseData) {
					next && next('Empty response.');
					return;
				}

				if (this.status !== 200) {
					next && next('HTTP Error: ' + this.status);
					return;
				}

				contentType = contentType || this.getResponseHeader('Content-Type');

				if (!contentType) {
					next && next('Could not detect content-type.');
					return;
				} else if (contentType === 'text/javascript' || contentType === 'text/plain') {
					extension = 'js';
				} else if (contentType === 'application/zip') {
					extension = 'zip';
				} else {
					next && next('Unsupported content-type: ' + contentType);
					return;
				}

				var dir, file;

				if (extension === 'zip') {
					file = Ti.Filesystem.getFile(DATA_PATH, Ti.Platform.createUUID() + '.' + extension);
				} else {
					dir = createDir();
					file = Ti.Filesystem.getFile(dir.nativePath, 'app.js');
				}

				file.write(this.responseData);

				if (extension === 'zip') {
					extract(file, function onExtract(err, dir) {

						if (err) {
							return alert(err);
						}

						load(dir);
					});

				} else {
					load(file);
				}

				next && next(null, file);
			},
			onerror: function onError(e) {
				next && next(e.error);
			}
		});

		xhr.open('GET', url);

		xhr.send();
	}

	function createDir() {
		var dir = Ti.Filesystem.getFile(DATA_PATH, Ti.Platform.createUUID());
		dir.createDirectory();

		return dir;
	}

	function extract(file, next) {
		var dir = createDir();

		try {
			compression.unzip(dir.nativePath, file.nativePath, true);

			next();

		} catch (err) {
			next(err);
		}
	}

	function load(file) {
		var dirname, filename, id;

		if (file.isDirectory()) {
			dirname = file.resolve();

		} else {
			filename = file.resolve();
			dirname = filename.substr(0, filename.lastIndexOf('/'));
			id = filename.substr(dirname.length + 1, filename.length - dirname.length - '/'.length - '.js'.length);
		}

		proxy = require('proxy').createProxy(dirname);

		proxy.require(id);
	}

})(this);
