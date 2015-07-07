// FIXME: https://jira.appcelerator.org/browse/TIMOB-19155
(function (global) {

	try {

	var CFG = require('CFG');

	require('ui').createDialog().open();

	Ti.Gesture.addEventListener('shake', restart);

	function restart() {
		Ti.Gesture.removeEventListener('shake', restart);

		require('codebase').clean();

		if (CFG.OS_IOS && CFG.ENV_PRODUCTION) {

			// works in production as well
			require('info.rborn.tiapprestart').restartApp();

		} else if (CFG.OS_WINDOWS) {

			// FIXME: https://jira.appcelerator.org/browse/TIMOB-19122
			require('ui').createDialog().open();

		} else {

			// works in production on Android because we've disabled finishfalseroot
			Ti.App._restart();
		}
	}

} catch (e) {
	alert(JSON.stringify(e));
}

})(this);
