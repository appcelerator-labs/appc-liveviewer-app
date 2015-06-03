var CFG = {
	DATA_DIR: 'code',
	PLATFORM_DIR: Ti.Platform.name.replace(/iPhone OS/, 'iphone'),
	PLATFORM_NAME: Ti.Platform.name.replace(/iPhone OS/, 'ios')
};

CFG.SERVER_URL = 'http://node.fokkezb.nl:8080/?platform=' + CFG.PLATFORM_NAME + '&url=';

module.exports = CFG;
