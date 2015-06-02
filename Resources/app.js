(function LiveViewer(global) {

	require('ui').createDialog().open();

	Ti.Gesture.addEventListener('shake', function restart() {
		Ti.Gesture.removeEventListener('shake', restart);

		require('codebase').clean();

		Ti.App._restart();
	});

})(this);
