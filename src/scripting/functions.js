function moveUp(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y += amount;
	return true;
}

function moveDown(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y -= amount;
	return true;
}

function moveLeft(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x -= amount;
	return true;
}

function moveRight(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x += amount;
	return true;
}

function clearVariables() {
	let previousLength = gameStateHandler.interpreterScript.variables.length;
	gameStateHandler.interpreterScript.variables = gameStateHandler.interpreterScript.variables.filter(v => v.status != Status.PLAYER && v.status != Status.INTERPRETER);
	return previousLength != gameStateHandler.interpreterScript.variables.length;
}