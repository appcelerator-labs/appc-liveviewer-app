exports.createDialog = function createDialog(callback) {
	var last = Ti.App.Properties.getString('proxy::last');

	function select(url) {
		Ti.App.Properties.setString('proxy::last', url);

		callback(url);
	}

	var win = Ti.UI.createWindow({
		backgroundColor: '#CD1625'
	});

	var url = Ti.UI.createTextField({
		top: 100,
		right: 20,
		left: 20,
		height: 40,
		paddingLeft: 10,
		paddingRight: 10,
		returnKeyType: Ti.UI.RETURNKEY_GO,
		hintText: 'http://',
		value: last,
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: '#aa1617'
	});

	url.addEventListener('return', function onReturn(e) {
		select(e.value);
	});

	var go = Ti.UI.createButton({
		top: 160,
		right: 20,
		width: 100,
		title: 'LOAD',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	go.addEventListener('click', function onClick() {
		select(url.value);
	});

	var examples = Ti.UI.createButton({
		top: 160,
		left: 20,
		width: 100,
		title: 'EXAMPLES',
		backgroundColor: '#aa1617',
		color: 'white'
	});

	examples.addEventListener('click', function onClick() {

		var examples = [{
			label: 'Gist',
			url: 'https://gist.github.com/FokkeZB/f7b3cbde8c180afe6fa3'
		}, {
			label: 'Gist - File',
			url: 'https://gist.github.com/FokkeZB/f7b3cbde8c180afe6fa3#file-app-js'
		}, {
			label: 'Gist - Raw Commit',
			url: 'https://gist.githubusercontent.com/FokkeZB/f7b3cbde8c180afe6fa3/raw/ad99604a55889f4b53f455f687ffb38739690813/app.js'
		}, {
			label: 'Gist - Raw File',
			url: 'https://gist.githubusercontent.com/FokkeZB/f7b3cbde8c180afe6fa3/raw/app.js'
		}, {
			label: 'Gist - Raw /',
			url: 'https://gist.githubusercontent.com/FokkeZB/f7b3cbde8c180afe6fa3/raw/'
		}, {
			label: 'Gist - Raw',
			url: 'https://gist.githubusercontent.com/FokkeZB/f7b3cbde8c180afe6fa3/raw'
		}, {
			label: ''
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
	win.add(examples);
	win.add(go);
	win.add(instructions);

	return win;
};
