var CFG = {
	DATA_DIR: 'code',
	PLATFORM_DIR: Ti.Platform.name.replace(/iPhone OS/, 'iphone'),
	PLATFORM_NAME: Ti.Platform.name.replace(/iPhone OS/, 'ios'),
	LDF: Ti.Platform.displayCaps.logicalDensityFactor,
	ENV_PRODUCTION: (Ti.Platform.deployType === 'production')
};

CFG.OS_IOS = (CFG.PLATFORM_NAME === 'ios');
CFG.OS_ANDORID = (CFG.PLATFORM_NAME === 'android');
CFG.SERVER_URL = 'http://node.fokkezb.nl:8080/?platform=' + CFG.PLATFORM_NAME + '&url=';

module.exports = CFG;
