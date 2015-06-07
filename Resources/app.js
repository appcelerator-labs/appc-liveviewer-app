(function LiveViewer(global) {

	require('ui').createDialog().open();

	Ti.Gesture.addEventListener('shake', function restart() {
		Ti.Gesture.removeEventListener('shake', restart);

		require('codebase').clean();

		var CFG = require('CFG');

		if (CFG.OS_IOS && CFG.ENV_PRODUCTION) {

			// works in production as well
			require('info.rborn.tiapprestart').restartApp();

		} else {

			// works in production on Android because we've disabled finishfalseroot
			Ti.App._restart();
		}
	});

})(this);
