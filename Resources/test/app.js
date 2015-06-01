var win = Ti.UI.createWindow({
	backgroundColor: 'red'
});

__LV.global.foo = 'in app.js';

var required = require('required');

win.add(required.label);

win.open();
