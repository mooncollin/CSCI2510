class CollidingComponent extends Component {
	constructor(gameObject, type) {
		super();
		if(gameObject === undefined) {
			throw "Must pass in a GameObject to use this component.";
		}
		if(!(typeof gameObject.defineBoundary === "function")) {
			throw "This GameObject must have a defineBoundary method";
		}

		if(type === undefined) {
			type = COLLISION_TYPES.PASSIVE;
		}

		gameObject.collisionType = type;
		gameObject.boundary = null;
		gameObject.defineBoundary();
		if(!(gameObject.boundary instanceof GeometryComponent)) {
			throw "Only boundaries of GeometryComponent are supported.";
		}

		gameObject.inCollision = function(other) {
			if(!(typeof other.hasComponent === "function")
				|| !other.hasComponent(CollidingComponent)) {
				return false;
			}

			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(other.getBoundaryLeft(), other.getBoundaryTop()),
				new Vector2(other.getBoundaryRight(), other.getBoundaryBottom())
			);
		};

		gameObject.inCollisionPoints = function(left1, right1, left2, right2) {
			if(left1.x > right2.x || left2.x > right1.x) {
				return false;
			}
			if(left1.y < right2.y || left2.y < right1.y) {
				return false;
			}

			return true;
		};

		gameObject.inScreen = function() {
			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(getScreenLeft(), getScreenTop()),
				new Vector2(getScreenRight(), getScreenBottom())
			);
		};

		gameObject.inMinimap = function() {
			let secondWidth = gameStateHandler.width/(gameStateHandler.minimapZoom*2);
			let secondHeight = gameStateHandler.height/(gameStateHandler.minimapZoom*2);

			let screenLeft = gameStateHandler.player.transform.position.x + -secondWidth/2;
			let screenTop = gameStateHandler.player.transform.position.y + secondHeight/2;
			let screenRight = screenLeft + secondWidth;
			let screenBottom = screenTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(getMinimapLeft(), getMinimapTop()),
				new Vector2(getMinimapRight(), getMinimapBottom())
			);
		};
		
		gameObject.getAdjustedWidth = function() {
			return gameObject.boundary.geometry.width * gameObject.transform.scale.x;
		};

		gameObject.getAdjustedHeight = function() {
			return gameObject.boundary.geometry.height * gameObject.transform.scale.y;
		};

		gameObject.getBoundaryLeft = function() {
			return -gameObject.getAdjustedWidth()/2 + gameObject.boundary.offsetX * gameObject.transform.scale.x + gameObject.transform.position.x;
		};

		gameObject.getBoundaryTop = function() {
			return gameObject.getAdjustedHeight()/2 + gameObject.boundary.offsetY * gameObject.transform.scale.y + gameObject.transform.position.y;
		};

		gameObject.getBoundaryRight = function() {
			return gameObject.getBoundaryLeft() + gameObject.getAdjustedWidth();
		};

		gameObject.getBoundaryBottom = function() {
			return gameObject.getBoundaryTop() - gameObject.getAdjustedHeight();
		};
	}
}

var COLLISION_TYPES = {
	PASSIVE: "passive",
	ACTIVE: "active"
};

function getScreenWidth() {
	return gameStateHandler.width/gameStateHandler.cameraZoom;
}

function getScreenHeight() {
	return gameStateHandler.height/gameStateHandler.cameraZoom;
}

function getScreenLeft() {
	return gameStateHandler.player.transform.position.x + -getScreenWidth()/2;
}

function getScreenTop() {
	return gameStateHandler.player.transform.position.y + getScreenHeight()/2;
}

function getScreenRight() {
	return getScreenLeft() + getScreenWidth();
}

function getScreenBottom() {
	return getScreenTop() - getScreenHeight();
}

function getMinimapWidth() {
	return gameStateHandler.width/(gameStateHandler.minimapZoom*2);
}

function getMinimapHeight() {
	return gameStateHandler.height/(gameStateHandler.minimapZoom*2);
}

function getMinimapLeft() {
	return gameStateHandler.player.transform.position.x - getMinimapWidth()/2;
}

function getMinimapTop() {
	return gameStateHandler.player.transform.position.y + getMinimapHeight()/2;
}

function getMinimapRight() {
	return getMinimapLeft() + getMinimapWidth();
}

function getMinimapBottom() {
	return getMinimapTop() - getMinimapHeight();
}