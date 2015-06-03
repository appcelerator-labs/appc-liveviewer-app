exports.createDialog = function createDialog() {
	var settings = Ti.App.Properties.getObject('proxy::settings', {});

	function select(url) {

		if (go.enabled === false) {
			console.debug('Already loading..');
			return;
		}

		go.applyProperties({
			title: 'LOADING',
			enabled: false,
			backgroundColor: 'transparent'
		});

		settings.url = url;
		settings.alloy = alloyCheckbox.backgroundColor === 'white';

		Ti.App.Properties.setObject('proxy::settings', settings);

		require('codebase').create({
			url: url
		}, function afterCreate(err) {

			go.applyProperties({
				title: 'LOAD',
				enabled: true,
				backgroundColor: '#aa1617'
			});

			if (err) {
				alert(err);
			}

		});
	}

	var win = Ti.UI.createWindow({
		backgroundColor: '#CD1625'
	});

	var url = Ti.UI.createTextField({
		top: 100,
		right: 20,
		left: 20,
		height: Ti.Platform.name === 'android' ? Ti.UI.SIZE : 40,
		paddingLeft: 10,
		paddingRight: 10,
		returnKeyType: Ti.UI.RETURNKEY_GO,
		keyboardType: Ti.UI.KEYBOARD_URL,
		autocorrect: false,
		hintText: 'http://',
		value: settings.url,
		backgroundColor: 'white',
		color: '#333',
		borderWidth: 2,
		borderColor: '#aa1617'
	});

	url.addEventListener('return', function onReturn(e) {
		select(e.value);
	});

	var alloyCheckbox = Ti.UI.createView({
		top: 160,
		left: 20,
		width: 30,
		height: 30,
		backgroundColor: settings.alloy ? 'white' : 'transparent',
		borderWidth: 2,
		borderColor: '#aa1617'
	});

	alloyCheckbox.addEventListener('click', function onClick() {
		alloyCheckbox.backgroundColor = (alloyCheckbox.backgroundColor === 'white') ? 'transparent' : 'white';
	});

	var alloyLabel = Ti.UI.createLabel({
		top: 160,
		left: 60,
		height: 30,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		color: 'white',
		text: 'Compile with Alloy in the cloud'
	});

	var go = Ti.UI.createButton({
		top: 210,
		right: 20,
		width: 100,
		height: 30,
		title: 'LOAD',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	go.addEventListener('click', function onClick() {
		select(url.value);
	});

	var examples = Ti.UI.createButton({
		top: 210,
		left: 20,
		width: 100,
		height: 30,
		title: 'EXAMPLES',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	examples.addEventListener('click', function onClick() {

		var examples = [{
			label: 'GitHub repo with bare Alloy app in subfolder',
			url: 'https://github.com/appcelerator/alloy/tree/master/samples/rss'
		}, {
			label: 'ZIP with classic project',
			url: 'http://dev.fokkezb.nl/liveviewer/Resources.zip'
		}, {
			label: 'Gist with two files',
			url: 'https://gist.github.com/FokkeZB/f7b3cbde8c180afe6fa3'
		}, {
			label: 'Single file of Gist',
			url: 'https://gist.github.com/FokkeZB/f7b3cbde8c180afe6fa3#file-app-js'
		}, {
			label: 'JS file',
			url: 'https://gist.githubusercontent.com/FokkeZB/f7b3cbde8c180afe6fa3/raw/ad99604a55889f4b53f455f687ffb38739690813/app.js'
		}];

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

			url.value = examples[e.index].url;

			select(examples[e.index].url);
		});

		dialog.show();
	});

	var instructions = Ti.UI.createLabel({
		bottom: 100,
		text: 'Shake anytime to return to this screen.',
		color: 'white'
	});

	win.add(url);

	win.add(alloyCheckbox);
	win.add(alloyLabel);

	win.add(examples);
	win.add(go);

	win.add(instructions);

	return win;
};
