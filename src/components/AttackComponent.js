class AttackComponent extends Component {
	constructor(gameObject) {
		super();
		if(gameObject === undefined) {
			throw "Must pass in a GameObject to use this component.";
		}
		if(!gameObject.hasComponent(CollidingComponent)) {
			throw "This GameObject must have a CollidingComponent.";
		}

		gameObject.reach = 1;

		if(gameObject.facing === undefined) {
			gameObject.facing = "right";
		}
	}
}