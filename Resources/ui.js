var CFG = require('CFG');

exports.createDialog = function createDialog() {
	var settings = Ti.App.Properties.getObject('proxy::settings', {});

	var win = Ti.UI.createWindow({
		backgroundColor: '#CD1625'
	});

	var samplesBtn = Ti.UI.createButton({
		top: 50,
		left: 20,
		right: 20,
		height: 30,
		title: 'EXAMPLES',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	samplesBtn.addEventListener('click', function onClick() {
		var examples = CFG.SAMPLES;

		var dialog = Ti.UI.createOptionDialog({
			cancel: examples.length,
			selectedIndex: examples.length,
			options: examples.map(function onEach(example) {
				return example.label;
			}).concat('Cancel')
		});

		dialog.addEventListener('click', function onClick(e) {

			if (e.cancel === true || e.index === examples.length || !examples[e.index]) {
				return;
			}

			urlField.value = examples[e.index].url;
		});

		dialog.show();
	});

	var urlField = Ti.UI.createTextField({
		top: 100,
		right: 20,
		left: 20,
		height: Ti.Platform.name === 'android' ? Ti.UI.SIZE : 40,
		paddingLeft: 10,
		paddingRight: 10,
		keyboardType: Ti.UI.KEYBOARD_URL,
		autocorrect: false,
		hintText: 'http://',
		value: settings.url,
		font: {
			fontSize: 15
		},
		backgroundColor: 'white',
		color: '#333',
		borderWidth: 2,
		borderColor: '#aa1617'
	});

	var alloySwitch = Ti.UI.createSwitch({
		top: 160,
		left: 20,
		value: !!settings.alloy
	});

	var alloyLabel = Ti.UI.createLabel({
		top: 160,
		left: 80,
		height: 30,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		color: 'white',
		text: 'Compile Alloy in Cloud'
	});

	var sourceBtn = Ti.UI.createButton({
		top: 210,
		left: 20,
		width: 100,
		height: 30,
		title: 'SOURCE',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	sourceBtn.addEventListener('click', function onClick(e) {
		var url = urlField.value;

		if (!url) {
			return alert('URL is missing.');
		}

		Ti.Platform.openURL(url);
	});

	var goBtn = Ti.UI.createButton({
		top: 210,
		right: 20,
		width: 100,
		height: 30,
		title: 'LOAD',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	goBtn.addEventListener('click', function onClick(e) {
		var url = urlField.value;

		if (!url) {
			return alert('URL is missing.');
		}

		if (goBtn.enabled === false) {
			return console.debug('Already loading..');
		}

		goBtn.applyProperties({
			title: 'LOADING',
			enabled: false,
			backgroundColor: 'transparent'
		});

		settings.url = url;
		settings.alloy = alloySwitch.value;

		Ti.App.Properties.setObject('proxy::settings', settings);

		require('codebase').create(settings, function afterCreate(err) {

			goBtn.applyProperties({
				title: 'LOAD',
				enabled: true,
				backgroundColor: '#aa1617'
			});

			if (err) {
				return alert(err);
			}

			win.hide();

			win.addEventListener('focus', function onFocus() {
				win.removeEventListener('focus', onFocus);
				win.show();
			});

		});
	});

	var instructions = Ti.UI.createLabel({
		bottom: 100,
		text: 'Shake anytime to return to this screen.',
		color: 'white'
	});

	win.add(samplesBtn);

	win.add(urlField);

	win.add(alloySwitch);
	win.add(alloyLabel);

	win.add(sourceBtn);
	win.add(goBtn);

	win.add(instructions);

	return win;
};
