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

		gameObject.attack = function() {
			let expandedLeft = gameObject.getBoundaryLeft() - gameObject.reach;
			let expandedRight = gameObject.getBoundaryRight() + gameObject.reach;
			let expandedTop = gameObject.getBoundaryTop() + gameObject.reach;
			let expandedBottom = gameObject.getBoundaryBottom() - gameObject.reach;
			let thingsHit = 0;
			let entities = gameStateHandler.getScreenEntities();
			for(let i = 0; i < entities.length; i++) {
				if(gameObject.inCollisionPoints(
					new Vector2(expandedLeft, expandedTop),
					new Vector2(expandedRight, expandedBottom),
					new Vector2(entities[i].getBoundaryLeft(), entities[i].getBoundaryTop()),
					new Vector2(entities[i].getBoundaryRight(), entities[i].getBoundaryBottom())
				)) {
					gameObject.hit(entities[i]);
					thingsHit++;
				}
			}

			return thingsHit;
		}

		gameObject.hit = function(otherGameObject) {
			otherGameObject.health -= 10;
		}
	}
}