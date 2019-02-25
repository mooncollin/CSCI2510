function moveUp(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y += amount;
}

function moveDown(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y -= amount;
}

function moveLeft(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x -= amount;
}

function moveRight(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x += amount;
}