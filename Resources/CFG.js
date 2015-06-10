var xhr = require('xhr');

module.exports = CFG = {
	DATA_DIR: 'code',
	PLATFORM_DIR: Ti.Platform.name.replace(/iPhone OS/, 'iphone'),
	PLATFORM_NAME: Ti.Platform.name.replace(/iPhone OS/, 'ios'),
	LDF: Ti.Platform.displayCaps.logicalDensityFactor,
	ENV_PRODUCTION: (Ti.App.deployType === 'production'),
	SERVER_URL: 'http://node.fokkezb.nl:8080'
};

CFG.OS_IOS = (CFG.PLATFORM_NAME === 'ios');
CFG.OS_ANDORID = (CFG.PLATFORM_NAME === 'android');

Object.defineProperty(CFG, 'SAMPLES', {
	get: function () {

		// update samples for next time
		updateSamples();

		return Ti.App.Properties.getList('liveviewer::samples', [{
			'label': 'Movies',
			'url': 'https://github.com/appcelerator/movies'
		}]);
	}
});

function updateSamples() {

	xhr(CFG.SERVER_URL + '/samples.json', {

		// GitHub raw JSON returns as text/plain
		contentType: 'application/json'

	}, function (err, res) {

		if (!err) {
			Ti.App.Properties.setList('liveviewer::samples', res);
		}

	});
}

updateSamples();
