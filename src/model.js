function positionText(canvWidth, canvHeight, xIn, yIn) {
	return {
		x: canvWidth * xIn,
		y: canvHeight * yIn
	};
}

function positionGUI(canvWidth, canvHeight, xDistance, yDistance, height) {
	var toReturn = {
	  x: 0,
	  y: 0,
	  width: 0,
	  height: 0
	}
	var xIsBigger = true;
	if (canvHeight > canvWidth) xIsBigger = false;
	var clippingUnit = xIsBigger ? canvHeight / 2 : canvWidth / 2;
	toReturn.x = xDistance * clippingUnit;
	toReturn.y = canvHeight - (yDistance + height * clippingUnit)
	toReturn.width = canvWidth - (2 * (xDistance * clippingUnit));
	toReturn.height = height * clippingUnit;
	return toReturn;
}

function updateStateHandler() {
	if(state == states.TITLE_STATE) {
		stateHandler = titleStateHandler;
	}
	else if(state == states.LOAD_STATE) {
		stateHandler = loadStateHandler;
	}
	else if(state == states.GAME_STATE) {
		stateHandler = gameStateHandler;
	}

	updateView();
	stateHandler.start();
}

var state;
var stateHandler;

var states = {
	TITLE_STATE: 1,
	LOAD_STATE: 2,
	GAME_STATE: 3
}

state = states.TITLE_STATE;
updateStateHandler();