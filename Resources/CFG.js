var xhr = require('xhr');

var CFG = {
	DATA_DIR: 'code',
	PLATFORM_DIR: Ti.Platform.name.replace(/iPhone OS/, 'iphone'),
	PLATFORM_NAME: Ti.Platform.name.replace(/iPhone OS/, 'ios'),
	LDF: Ti.Platform.displayCaps.logicalDensityFactor,
	ENV_PRODUCTION: (Ti.Platform.deployType === 'production'),
	SERVER_URL: 'http://node.fokkezb.nl:8080',
	SAMPLES: Ti.App.Properties.getList('liveviewer::samples', [{
		'label': 'Movies',
		'url': 'https://github.com/appcelerator/movies'
	}])
};

CFG.OS_IOS = (CFG.PLATFORM_NAME === 'ios');
CFG.OS_ANDORID = (CFG.PLATFORM_NAME === 'android');

// update samples
xhr(CFG.SERVER_URL + '/samples.json', {

	// GitHub raw JSON returns as text/plain
	contentType: 'application/json'

}, function (err, res) {

	if (!err) {
		CFG.SAMPLES = res;
		Ti.App.Properties.setList('liveviewer::samples', CFG.SAMPLES);
	}

});

module.exports = CFG;
