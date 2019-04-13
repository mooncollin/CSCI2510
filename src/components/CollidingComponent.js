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

			let firstWidth = gameObject.boundary.geometry.width * gameObject.transform.scale.x;
			let firstHeight = gameObject.boundary.geometry.height * gameObject.transform.scale.y;

			let secondWidth = other.boundary.geometry.width * other.transform.scale.x;
			let secondHeight = other.boundary.geometry.height * other.transform.scale.y;

			let firstLeft = -firstWidth/2 + gameObject.boundary.offsetX * gameObject.transform.scale.x + gameObject.transform.position.x;
			let firstTop = firstHeight/2 + gameObject.boundary.offsetY * gameObject.transform.scale.y + gameObject.transform.position.y;
			let firstRight = firstLeft + firstWidth;
			let firstBottom = firstTop - firstHeight;

			let secondLeft = -secondWidth/2 + other.boundary.offsetX * other.transform.scale.x + other.transform.position.x;
			let secondTop = secondHeight/2 + other.boundary.offsetY * other.transform.scale.y + other.transform.position.y;
			let secondRight = secondLeft + secondWidth;
			let secondBottom = secondTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(firstLeft, firstTop),
				new Vector2(firstRight, firstBottom),
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
		}

		gameObject.inScreen = function() {
			let firstWidth = gameObject.boundary.geometry.width * gameObject.transform.scale.x;
			let firstHeight = gameObject.boundary.geometry.height * gameObject.transform.scale.y;

			let firstLeft = -firstWidth/2 + gameObject.boundary.offsetX * gameObject.transform.scale.x + gameObject.transform.position.x;
			let firstTop = firstHeight/2 + gameObject.boundary.offsetY * gameObject.transform.scale.y + gameObject.transform.position.y;
			let firstRight = firstLeft + firstWidth;
			let firstBottom = firstTop - firstHeight;

			let secondWidth = gameStateHandler.width/gameStateHandler.cameraZoom;
			let secondHeight = gameStateHandler.height/gameStateHandler.cameraZoom;

			let screenLeft = gameStateHandler.player.transform.position.x + -secondWidth/2;
			let screenTop = gameStateHandler.player.transform.position.y + secondHeight/2;
			let screenRight = screenLeft + secondWidth;
			let screenBottom = screenTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(firstLeft, firstTop),
				new Vector2(firstRight, firstBottom),
				new Vector2(screenLeft, screenTop),
				new Vector2(screenRight, screenBottom)
			);
		};

		gameObject.inMinimap = function() {
			let firstWidth = gameObject.boundary.geometry.width * gameObject.transform.scale.x;
			let firstHeight = gameObject.boundary.geometry.height * gameObject.transform.scale.y;

			let firstLeft = -firstWidth/2 + gameObject.boundary.offsetX * gameObject.transform.scale.x + gameObject.transform.position.x;
			let firstTop = firstHeight/2 + gameObject.boundary.offsetY * gameObject.transform.scale.y + gameObject.transform.position.y;
			let firstRight = firstLeft + firstWidth;
			let firstBottom = firstTop - firstHeight;

			let secondWidth = gameStateHandler.width/(gameStateHandler.minimapZoom*3.2);
			let secondHeight = gameStateHandler.height/(gameStateHandler.minimapZoom*3.2);

			let screenLeft = gameStateHandler.player.transform.position.x + -secondWidth/2;
			let screenTop = gameStateHandler.player.transform.position.y + secondHeight/2;
			let screenRight = screenLeft + secondWidth;
			let screenBottom = screenTop - secondHeight;

			return gameObject.inCollisionPoints(
				new Vector2(firstLeft, firstTop),
				new Vector2(firstRight, firstBottom),
				new Vector2(screenLeft, screenTop),
				new Vector2(screenRight, screenBottom)
			);
		}
	}
}

var COLLISION_TYPES = {
	PASSIVE: "passive",
	ACTIVE: "active"
};