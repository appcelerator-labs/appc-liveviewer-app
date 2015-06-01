var TiProxy = require('ti-proxy');

exports.createProxy = function createProxy(codebase) {

	var proxy = {
		require: function require(id) {
			var file = Ti.Filesystem.getFile(codebase, id + '.js');

			if (!file.exists()) {
				return require(id);
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

			fn(module, module.exports, filename, dirname, proxy);

			return module.exports;
		}
	};

	return proxy;
};
