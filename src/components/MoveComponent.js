class MoveComponent extends Component {
	constructor(gameObject) {
		super();
		if(gameObject === undefined) {
			throw "Must pass in a GameObject to use this component.";
		}
		if(gameObject.speed === undefined) {
			throw gameObject + " must have a speed defined.";
		}

		gameObject.requestedX = null;
		gameObject.requestedY = null;

		if(gameObject.facing === undefined) {
			gameObject.facing = "right";
		}

		gameObject.move = function(x, y) {
			if(x === 0 && y === 0) {
				return false;
			}

			let moved = false;

			if(x < 0 && gameObject.facing === "right") {
				gameObject.facing = "left";
				flipYAxis(gameObject.components);
			}
			else if(x > 0 && gameObject.facing === "left") {
				gameObject.facing = "right";
				flipYAxis(gameObject.components);
			}

			if(gameObject.canMoveX(x)) {
				gameObject.transform.position.x += x;
				moved = true;
			}
			
			if(gameObject.canMoveY(y)) {
				gameObject.transform.position.y += y;
				moved = true;
			}

			if(!moved) {
				gameObject.requestedX = null;
				gameObject.requestedY = null;
				return false;
			}

			return true;
		};

		gameObject.canMove = function(x, y) {
			return gameObject.canMoveX(x) && gameObject.canMoveY(y);
		};

		gameObject.canMoveX = function(x) {
			// let tiles = []
			// if(gameObject.hasComponent(CollidingComponent)) {
			// 	let currentX = gameObject.transform.position.x;
			// 	if(x < 0) {
			// 		currentX = gameObject.getBoundaryLeft();
			// 	}
			// 	else {
			// 		currentX = gameObject.getBoundaryRight();
			// 	}
			// 	tiles.push(gameStateHandler.getMapTile((currentX + x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, gameObject.transform.position.y  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// 	tiles.push(gameStateHandler.getMapTile((currentX + x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, gameObject.getBoundaryTop()  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// 	tiles.push(gameStateHandler.getMapTile((currentX + x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, gameObject.getBoundaryBottom()  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// }
			// else {
			// 	tiles.push(gameStateHandler.getMapTile((gameObject.transform.position.x + x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, (gameObject.transform.position.y)  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// }

			// for(let i = 0; i < gameStateHandler.IMPASSIBLE_TILES.length; i++) {
			// 	for(let j = 0; j < tiles.length; j++) {
			// 		if(tiles[j] === gameStateHandler.IMPASSIBLE_TILES[i]) {
			// 			return false;
			// 		}
			// 	}
			// }
			return true;
		};

		gameObject.canMoveY = function(y) {
			// let tiles = [];
			// if(gameObject.hasComponent(CollidingComponent)) {
			// 	let currentY = gameObject.transform.position.y;
			// 	if(y < 0) {
			// 		currentY = gameObject.getBoundaryBottom();
			// 	}
			// 	tiles.push(gameStateHandler.getMapTile((gameObject.transform.position.x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, (currentY + y)  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// 	tiles.push(gameStateHandler.getMapTile((gameObject.getBoundaryLeft()) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, (currentY + y)  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// 	tiles.push(gameStateHandler.getMapTile((gameObject.getBoundaryRight()) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, (currentY + y)  * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale * 2));
			// }
			// else {
			// 	tiles.push(gameStateHandler.getMapTile((gameObject.transform.position.x) * gameObject.transform.scale.x * gameStateHandler.cameraZoom * gameStateHandler.mapScale, (gameObject.transform.position.y + y) * 16));
			// }
			// for(let i = 0; i < gameStateHandler.IMPASSIBLE_TILES.length; i++) {
			// 	for(let j = 0; j < tiles.length; j++) {
			// 		if(tiles[j] === gameStateHandler.IMPASSIBLE_TILES[i]) {
			// 			return false;
			// 		}
			// 	}
			// }
			return true;
		};

		gameObject.updateMove = function(x, y) {
			if(!isNaN(x) && !isNaN(y) && x != null && y != null) {
				gameObject.requestedX = x + gameObject.transform.position.x;
				gameObject.requestedY = y + gameObject.transform.position.y;
				if(gameObject.requestedX === NaN) {
					gameObject.requestedX = 0;
				}
				if(gameObject.requestedY === NaN) {
					gameObject.requestedY = 0;
				}
				return true;
			}
			return false;
		};

		gameObject.isMoving = function() {
			return gameObject.requestedX != null || gameObject.requestedY != null;
		}
	}

	update(gameObject) {
		if(gameObject.requestedX != null && gameObject.requestedY != null) {
			let moveX = Math.min(gameObject.speed, Math.abs(gameObject.requestedX - gameObject.transform.position.x));
			let moveY = Math.min(gameObject.speed, Math.abs(gameObject.requestedY - gameObject.transform.position.y));
			if(moveX <= 0.001 && moveY <= 0.001) {
				gameObject.requestedX = null;
				gameObject.requestedY = null;
			}
			else {
				moveX = gameObject.requestedX - gameObject.transform.position.x < 0 ? -moveX : moveX;
				moveY = gameObject.requestedY - gameObject.transform.position.y < 0 ? -moveY : moveY;
				gameObject.move(moveX, moveY);
			}
		}
	}
}