function positionText(canvWidth, canvHeight, xIn, yIn) {
	return {
		x: canvWidth * xIn,
		y: canvHeight * yIn
	};
}

function updateStateHandler() {
	if(state == states.TITLE_STATE) {
		stateHandler = titleStateHandler;
	}
	else if(state == states.LOAD_STATE) {
		stateHandler = loadStateHandler;
	}

	updateView();
	stateHandler.start();
}

var state;
var stateHandler;

var states = {
	TITLE_STATE: 1,
	LOAD_STATE: 2
}

state = states.TITLE_STATE;
updateStateHandler();