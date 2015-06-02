var TiProxy = require('ti-proxy');

exports.createProxy = function createProxy(codebase) {

	var proxy = {
		clean: function () {

		},
		resource: function (path) {

			path = 'images/appc.png';

			return codebase + '/' + path;

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

			var file = Ti.Filesystem.getFile(codebase, id + '.js');

			console.debug('file: ' + file.resolve());

			if (!file.exists()) {

				// FIXME: will still crash on iOS: https://jira.appcelerator.org/browse/TIMOB-9198
				try {
					return require(id);
				} catch (e) {
					console.error(JSON.stringify(e, null, true));
					alert('Could not find module: ' + id);
					return;
				}
			}

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

			try {
				fn(module, module.exports, filename, dirname, proxy);
			} catch (e) {
				alert(e);
			}

			return module.exports;
		}
	};

	return proxy;
};
