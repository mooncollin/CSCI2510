class Player extends Entity {
	constructor() {
		super();
		let legBlock = new AxisAlignedRectangle(1, 1.5);
		let footBlock = new AxisAlignedRectangle(1, .8);
		let waistBlock = new AxisAlignedRectangle(5, 1);
		let bodyBlock = new AxisAlignedRectangle(5, 4);
		let handBlock = new AxisAlignedRectangle(1, .5);
		let headBlock = new AxisAlignedRectangle(3, 3);
		let shoulderBlock = new AxisAlignedRectangle(1, 1);
		let minimapBlock = new AxisAlignedRectangle(1, 1);
		this.equipment["waist"].components.push(new GeometryRendererComponent("black", waistBlock))
		this.equipment["legs"].components.push(new GeometryRendererComponent("yellow", legBlock, -1.9, -1.2));
		this.equipment["legs"].components.push(new GeometryRendererComponent("yellow", legBlock, 1.9, -1.2));
		this.equipment["body"].components.push(new GeometryRendererComponent("brown", bodyBlock, 0, 2.5));
		this.equipment["hands"].components.push(new GeometryRendererComponent("yellow", handBlock, -3, 1.8));
		this.equipment["hands"].components.push(new GeometryRendererComponent("yellow", handBlock, 3, 1.8));
		this.equipment["shoulders"].components.push(new GeometryRendererComponent("yellow", shoulderBlock, 3, 4));
		this.equipment["shoulders"].components.push(new GeometryRendererComponent("yellow", shoulderBlock, -3, 4));
		this.equipment["feet"].components.push(new GeometryRendererComponent("yellow", footBlock, -1.9, -2.4));
		this.equipment["feet"].components.push(new GeometryRendererComponent("yellow", footBlock, 1.9, -2.4));
		this.equipment["head"].components.push(new GeometryRendererComponent("yellow", headBlock, 0, 6));
		this.leftArm = new GeometryRendererComponent("yellow", legBlock, 3, 2.8);
		this.rightArm = new GeometryRendererComponent("yellow", legBlock, -3, 2.8);
		let playerBlockRenderMinimap = new GeometryRendererComponent("white", minimapBlock);
		

		this.components.push(this.equipment["waist"]);
		this.components.push(this.equipment["legs"]);
		this.components.push(this.equipment["body"]);
		this.components.push(this.equipment["hands"]);
		this.components.push(this.equipment["shoulders"]);
		this.components.push(this.equipment["head"]);
		this.components.push(this.equipment["feet"]);
		this.components.push(this.leftArm);
		this.components.push(this.rightArm);
		this.minimapComponents.push(playerBlockRenderMinimap);

		this.health = 100;
		this.speed = .1;
		this.MAX_INVENTORY = 20;
	}
}