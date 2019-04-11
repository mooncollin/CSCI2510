class Entity extends GameObject {
	constructor(xPosition=0, yPosition=0, xScale=1, yScale=1) {
		super(xPosition, yPosition, xScale, yScale);

		this.speed = 0;
		this.level = 1;
		this.health = 0;
		this.inventory = {
			"money" : 0,
			"items" : []
		};

		

		this.components.push(new MoveComponent(this));
	}
}