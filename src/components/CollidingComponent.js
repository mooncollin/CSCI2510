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

			let secondLeft = -secondWidth/2 + other.boundary.offsetX * other.transform.scale.x + other.transform.position.x;
			let secondTop = secondHeight/2 + other.boundary.offsetY * other.transform.scale.y + other.transform.position.y;
			let secondRight = secondLeft + secondWidth;
			let secondBottom = secondTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(secondLeft, secondTop),
				new Vector2(secondRight, secondBottom)
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
			let secondWidth = gameStateHandler.width/gameStateHandler.cameraZoom;
			let secondHeight = gameStateHandler.height/gameStateHandler.cameraZoom;

			let screenLeft = gameStateHandler.player.transform.position.x + -secondWidth/2;
			let screenTop = gameStateHandler.player.transform.position.y + secondHeight/2;
			let screenRight = screenLeft + secondWidth;
			let screenBottom = screenTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(screenLeft, screenTop),
				new Vector2(screenRight, screenBottom)
			);
		};

		gameObject.inMinimap = function() {
			let secondWidth = gameStateHandler.width/(gameStateHandler.minimapZoom*3.2);
			let secondHeight = gameStateHandler.height/(gameStateHandler.minimapZoom*3.2);

			let screenLeft = gameStateHandler.player.transform.position.x + -secondWidth/2;
			let screenTop = gameStateHandler.player.transform.position.y + secondHeight/2;
			let screenRight = screenLeft + secondWidth;
			let screenBottom = screenTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(gameObject.getBoundaryLeft(), gameObject.getBoundaryTop()),
				new Vector2(gameObject.getBoundaryRight(), gameObject.getBoundaryBottom()),
				new Vector2(screenLeft, screenTop),
				new Vector2(screenRight, screenBottom)
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