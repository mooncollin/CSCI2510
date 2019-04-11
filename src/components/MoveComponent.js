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

			if(gameObject.canMove(x, y)) {
				if(x < 0 && gameObject.facing === "right") {
					gameObject.facing = "left";
					flipYAxis(gameObject.components);
				}
				else if(x > 0 && gameObject.facing === "left") {
					gameObject.facing = "right";
					flipYAxis(gameObject.components);
				}
				gameObject.transform.position.x += x;
				gameObject.transform.position.y += y;
				return true;
			}
			else if(gameObject.isMoving()) {
				gameObject.requestedX = null;
				gameObject.requestedY = null;
			}

			return false;
		};

		gameObject.canMove = function(x, y) {
			return true;
		};

		gameObject.updateMove = function(x, y) {
			gameObject.requestedX = x + gameObject.transform.position.x;
			gameObject.requestedY = y + gameObject.transform.position.y;
			return true;
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