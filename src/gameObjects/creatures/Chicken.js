class Chicken extends Entity {
	constructor(xPosition=0, yPosition=0, xScale=1, yScale=1) {
		super("chicken", xPosition, yPosition, xScale, yScale);

		let minimapBlock = new AxisAlignedRectangle(1, 1);
		let blockRenderMinimap = new GeometryRendererComponent("yellow", minimapBlock);

		let beakBlock = new AxisAlignedRectangle(1.7, 2);
		this.beak = new GeometryRendererComponent("#fcde58", beakBlock, 5.6, 7);

		this.components.push(this.beak);
		this.minimapComponents.push(blockRenderMinimap);

		this.speed = 0.07;
		this.level = 1;
		this.health = 10;
		this.components.push(new EquipmentComponent(this));
		this.components.push(new CollidingComponent(this, COLLISION_TYPES.PASSIVE));
		this.components.push(new AttackComponent(this));

		this.moveStatus = 0;
		this.spawnRate = 3000;
	}

	defineBoundary() {
		this.boundary = new AxisAlignedRectangle(6, 12);
		// this.components.push(new GeometryRendererComponent("blue", this.boundary, 1, 3.5));
		this.boundary = new GeometryComponent(this.boundary, 1, 3.5);
	}

	defineTransforms() {
		this.legBlock = new AxisAlignedRectangle(1, 3);
		this.bodyBlock = new AxisAlignedRectangle(5, 5);
		this.headBlock = new AxisAlignedRectangle(4, 5);

		this.blocks = {
			"legs"		: this.legBlock,
			"body"		: this.bodyBlock,
			"head"		: this.headBlock
		};
		this.colors = {
			"legs"		: "#fcde58",
			"body"		: "#efede6",
			"head"		: "#efede6"
		};

		this.equipmentTransforms["legs"].push(new Transform(new Vector2(-1, -1)));
		this.equipmentTransforms["legs"].push(new Transform(new Vector2(3, -1)));
		this.equipmentTransforms["body"].push(new Transform(new Vector2(1, 3)));
		this.equipmentTransforms["head"].push(new Transform(new Vector2(3, 7)));
	}

	update() {
		if(!this.isMoving()) {
			let moveY = Math.random();
			let moveX = Math.random();
			if(moveY <= .005) {
				moveY = Math.random() * (Math.random() >= .5 ? 1 : -1);
			}
			else {
				moveY = 0;
			}
			if(moveX <= .005) {
				moveX = Math.random() * (Math.random() >= .5 ? 1 : -1);
			}
			else {
				moveX = 0;
			}
			this.updateMove(moveX, moveY);
		}
		super.update();
	}
}