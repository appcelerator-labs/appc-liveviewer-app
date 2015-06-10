var _ = require('underscore');
var TiProxy = require('ti-proxy');
var CFG = require('CFG');
var utils = require('utils');

exports.createProxy = function createProxy(resourcesDirectory) {
	var cache = {};
	var globals = {};
	var sources = {};
	var events = {};

	var proxy = {
		globals: globals,
		clean: function () {
			var removed = 0;

			_.keys(events).forEach(function (ns) {
				_.keys(events[ns]).forEach(function (name) {
					events[ns][name].forEach(function (callback) {
						Ti[ns].removeEventListener(name, callback);

						removed++;
					});
				});
			});

			console.debug('removed ' + removed + ' events');

			cache = {};
			globals = {};
			sources = {};
			events = {};
		},
		events: {
			addEventListener: function (ns, name, callback) {
				console.debug('add event: Ti.' + name + ':' + name);

				if (events[ns]) {
					if (events[ns][name]) {
						events[ns][name].push(callback);
					} else {
						events[ns][name] = [callback];
					}
				} else {
					events[ns] = {};
					events[ns][name] = [callback];
				}

				return Ti[ns].addEventListener(name, callback);
			},
			removeEventListener: function (ns, name, callback) {
				console.debug('remove event: Ti.' + name + ':' + name);

				if (events[ns] && events[ns][name]) {
					events[ns][name] = _.without(events[ns][name], callback);
				}

				// not sure if this should only be called if found in the stack
				// we've seen remove > add cause strange bugs
				return Ti[ns].removeEventListener(name, callback);
			}
		},
		resource: function () {
			var args = Array.prototype.slice.call(arguments);

			// no arguments, return resourcesDirectory with trailing /
			if (args.length === 0) {
				return resourcesDirectory + '/';
			}

			// one argument, array of paths
			if (Array.isArray(args[0])) {
				return args[0].map(function (val) {
					return proxy.resource(val);
				});
			}

			var path = utils.joinPath(args);

			var file = getFile(path);

			if (!file) {
				console.debug('resource unresolved: ' + path);

				return path;
			}

			var resolved = file.resolve();

			console.debug('resource resolved: ' + path + ' (' + resolved + ')');

			return resolved;
		},
		exception: function (e) {

			console.error(JSON.stringify(e, null, ' '));

			var location = e.filename;

			if (location) {
				console.error(sources[e.filename]);

				location = relativePath(location);

				if (e.line && e.column) {
					location += ' ' + e.line + ':' + e.column;
				}
			}

			Ti.UI.createAlertDialog({
				title: location,
				message: e.message || 'Unknown Uncaught Exception'
			}).show();
		},
		require: function (id, opts) {
			opts = opts || {};
			opts.root = !!opts.root;

			if (opts.root) {
				proxy.clean();
			}

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

			var filename = file.resolve();
			var dirname = filename.substr(0, filename.lastIndexOf('/'));

			console.debug('require js: ' + id);

			var functionBody = file.read().text;

			functionBody = TiProxy.convert(functionBody, {
				resource: true,
				exception: true,
				exit: true,
				events: true,

				// catch primary scope vars as globals
				globals: opts.root
			});

			sources[filename] = functionBody;

			// module interface
			var module = {
				exports: {}
			};

			// module scope
			var scope = _.extend({
				module: module,
				exports: module.exports,
				require: proxy.require,
				__filename: filename,
				__dirname: dirname,
				__proxy: proxy
			}, proxy.globals);

			var argNames = Object.keys(scope).join(',');
			var argValues = _.values(scope);

			var fn = new Function(argNames, functionBody);

			// console.debug(filename, functionBody);

			try {
				fn.apply(undefined, argValues);
			} catch (e) {
				alert(e);
			}

			cache[id] = module.exports;

			return cache[id];
		}
	};

	function getFile(path) {

		// non-string or remote path
		if (!_.isString(path) || path.match(/^http(s)?:\/\//)) {
			return;
		}

		// remove resourceDirectory
		path = relativePath(path);

		var file, modifiedPath;

		var extname = utils.extname(path);

		if (extname === '.png' || extname === '.jpg') {

			if (CFG.OS_IOS) {

				for (var ldf = CFG.LDF; ldf === 2; ldf--) {
					modifiedPath = utils.injectSuffix(path, '@' + ldf + 'x');

					file = Ti.Filesystem.getFile(resourcesDirectory, CFG.PLATFORM_DIR, modifiedPath);

					if (file.exists()) {
						return file;
					}

					file = Ti.Filesystem.getFile(resourcesDirectory, modifiedPath);

					if (file.exists()) {
						return file;
					}
				}
			}
		}

		file = Ti.Filesystem.getFile(resourcesDirectory, CFG.PLATFORM_DIR, path);

		if (file.exists()) {
			return file;
		}

		file = Ti.Filesystem.getFile(resourcesDirectory, path);

		if (file.exists()) {
			return file;
		}

		return;
	}

	function relativePath(path) {

		if (path.indexOf(resourcesDirectory) === 0) {
			path = path.substr(resourcesDirectory.length + 1);
		}

		return path;
	}

	return proxy;
};
