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
	}
}

var COLLISION_TYPES = {
	PASSIVE: "passive",
	ACTIVE: "active"
};