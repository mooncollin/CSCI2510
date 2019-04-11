class Chicken extends Entity {
	constructor(xPosition=0, yPosition=0, xScale=1, yScale=1) {
		super(xPosition, yPosition, xScale, yScale);

		let minimapBlock = new AxisAlignedRectangle(2, 2);
		let blockRenderMinimap = new GeometryRendererComponent("yellow", minimapBlock);

		let beakBlock = new AxisAlignedRectangle(1.7, 2);
		this.beak = new GeometryRendererComponent("#fcde58", beakBlock, 5.6, 7);

		this.components.push(this.beak);
		this.minimapComponents.push(blockRenderMinimap);

		this.speed = 0.07;
		this.level = 1;
		this.health = 10;
		this.components.push(new EquipmentComponent(this));

		this.moveStatus = 0;
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
			switch(this.moveStatus) {
				case 0:
					this.updateMove(2, 0);
					this.moveStatus++;
					break;
				case 1:
					this.updateMove(0, 2);
					this.moveStatus++;
					break;
				case 2:
					this.updateMove(-2, 0);
					this.moveStatus++;
					break;
				case 3:
					this.updateMove(0, -2);
					this.moveStatus = 0;
					break;
			}
		}
		super.update();
	}
}