var TiProxy = require('ti-proxy');
var CFG = require('CFG');

exports.createProxy = function createProxy(codebase) {
	var cache = {};

	var proxy = {
		clean: function () {
			cache = {};
		},
		resource: function (path) {
			var file = getFile(path);

			if (!file) {
				return path;
			}

			return file.resolve();
		},
		exception: function (e) {
			console.error(JSON.stringify(e, null, ' '));

			var location = e.filename;

			if (location) {

				if (location.indexOf(codebase) === 0) {
					location = location.substr(codebase.length + 1);
				}

				if (e.line && e.column) {
					location += ' ' + e.line + ':' + e.column;
				}
			}

			Ti.UI.createAlertDialog({
				title: location,
				message: e.message || 'Unknown Uncaught Exception'
			}).show();
		},
		require: function (id) {

			if (cache[id]) {
				console.debug('require cache: ' + id);

				return cache[id];
			}

			var file = getFile(id + '.js');

			if (!file) {
				console.debug('require native: ' + id);

				try {
					cache[id] = require(id);
					return cache[id];

				} catch (e) {
					return alert(e);
				}
			}

			console.debug('require js: ' + id);

			var functionBody = file.read().text;

			functionBody = TiProxy.convert(functionBody, {
				UI: false
			});

			var module = {
				exports: {}
			};

			var filename = file.resolve();
			var dirname = filename.substr(0, filename.lastIndexOf('/'));

			var fn = new Function('module, exports, __filename, __dirname, __proxy', functionBody);

			console.debug(filename, functionBody);

			try {
				fn(module, module.exports, filename, dirname, proxy);
			} catch (e) {
				alert(e);
			}

			cache[id] = module.exports;
			return;
		}
	};

	function getFile(path) {
		var file;

		file = Ti.Filesystem.getFile(codebase, CFG.PLATFORM_DIR, path);

		if (!file.exists()) {
			file = Ti.Filesystem.getFile(codebase, path);
		}

		if (!file.exists()) {
			return;
		}

		return file;
	}

	return proxy;
};
