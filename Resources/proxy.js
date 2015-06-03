var TiProxy = require('ti-proxy');
var CFG = require('CFG');

exports.createProxy = function createProxy(codebase) {
	var cache = {};

	var proxy = {
		clean: function () {

		},
		resource: function (path) {
			var file;

			file = Ti.Filesystem.getFile(codebase, CFG.PLATFORM_DIR, path);

			if (!file.exists()) {
				file = Ti.Filesystem.getFile(codebase, path);
			}

			if (!file.exists()) {
				return;
			}

			return file.resolve();
		},
		exception: function (e) {

			// TODO: figure out how to get more information onexceptions (it's {} somehow)
			// https://github.com/dbankier/TiShadow/blob/master/app/Resources/api/Utils.js
			console.error(JSON.stringify(e, null, true));

			var filename = e.filename;

			if (filename.indexOf(codebase) === 0) {
				filename = filename.substr(codebase.length + 1);
			}

			alert('Exception in ' + filename);
		},
		require: function (id) {
			console.debug('require: ' + id);

			if (cache[id]) {
				return cache[id];
			}

			var resource = proxy.resource(id + '.js');

			if (!resource) {

				// FIXME: will still crash on iOS: https://jira.appcelerator.org/browse/TIMOB-9198
				try {
					return cache[id] = require(id);
				} catch (e) {
					console.error(JSON.stringify(e, null, true));
					alert('Could not find module: ' + id);
					return;
				}
			}

			var file = Ti.Filesystem.getFile(resource);

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

			return cache[id] = module.exports;
		}
	};

	return proxy;
};
