module.exports = {
	DATA_DIR: 'code',
	PLATFORM_DIR: Ti.Platform.name.replace(/iPhone OS/, 'iphone'),
	SERVER_URL: 'http://node.fokkezb.nl/?platform=' + encodeURIComponent(Ti.Platform.name)
};
