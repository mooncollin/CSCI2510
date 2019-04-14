class Player extends Entity {
	constructor(xPosition=0, yPosition=0, xScale=1, yScale=1) {
		super(xPosition, yPosition, xScale, yScale);
		
		let minimapBlock = new AxisAlignedRectangle(1, 1);

		let armBlock = new AxisAlignedRectangle(1, 1.5);

		this.leftArm = new GeometryRendererComponent("yellow", armBlock, 3, 2.8);
		this.rightArm = new GeometryRendererComponent("yellow", armBlock, -3, 2.8);
		let playerBlockRenderMinimap = new GeometryRendererComponent("white", minimapBlock);
		
		this.components.push(this.leftArm);
		this.components.push(this.rightArm);
		this.minimapComponents.push(playerBlockRenderMinimap);

		this.health = 100;
		this.speed = .1;
		this.MAX_INVENTORY = 20;
		this.executionSpeed = PLAYER_STARTING_EXECUTION_SPEED;
		this.scripts = [];

		for(let i = 0; i < this.MAX_INVENTORY; i++) {
			this.inventory.items.push(null);
		}

		this.components.push(new EquipmentComponent(this));
		this.components.push(new CollidingComponent(this, COLLISION_TYPES.PASSIVE));
		this.components.push(new AttackComponent(this));
		this.selectedInventory = 0;
		this.selectedEquipment = 0;
	}

	defineBoundary() {
		this.boundary = new AxisAlignedRectangle(7.2, 10.4);
		// this.components.push(new GeometryRendererComponent("blue", this.boundary, 0, 2.4));
		this.boundary = new GeometryComponent(this.boundary, 0, 2.4);
	}

	defineTransforms() {
		this.legBlock = new AxisAlignedRectangle(1, 1.5);
		this.footBlock = new AxisAlignedRectangle(1, .8);
		this.waistBlock = new AxisAlignedRectangle(5, 1);
		this.bodyBlock = new AxisAlignedRectangle(5, 4);
		this.handBlock = new AxisAlignedRectangle(1, .5);
		this.headBlock = new AxisAlignedRectangle(3, 3);
		this.shoulderBlock = new AxisAlignedRectangle(1, 1);
		this.blocks = {
			"waist"		: this.waistBlock,
			"legs"		: this.legBlock,
			"body"		: this.bodyBlock,
			"hands"		: this.handBlock,
			"shoulders"	: this.shoulderBlock,
			"feet"		: this.footBlock,
			"head"		: this.headBlock
		};
		this.colors = {
			"waist"		: "yellow",
			"legs"		: "yellow",
			"body"		: "yellow",
			"hands"		: "yellow",
			"shoulders"	: "yellow",
			"feet"		: "yellow",
			"head"		: "yellow"
		};
		this.equipmentTransforms["legs"].push(new Transform(new Vector2(-1.9, -1.2)));
		this.equipmentTransforms["legs"].push(new Transform(new Vector2(1.9, -1.2)));
		this.equipmentTransforms["body"].push(new Transform(new Vector2(0, 2.5)));
		this.equipmentTransforms["hands"].push(new Transform(new Vector2(-3, 1.8)));
		this.equipmentTransforms["hands"].push(new Transform(new Vector2(3, 1.8)));
		this.equipmentTransforms["shoulders"].push(new Transform(new Vector2(3, 4)));
		this.equipmentTransforms["shoulders"].push(new Transform(new Vector2(-3, 4)));
		this.equipmentTransforms["feet"].push(new Transform(new Vector2(-1.9, -2.4)));
		this.equipmentTransforms["feet"].push(new Transform(new Vector2(1.9, -2.4)));
		this.equipmentTransforms["head"].push(new Transform(new Vector2(0, 6)));
		this.equipmentTransforms["waist"].push(new Transform(new Vector2(0, 0)));
	}

	inventoryPut(item, index=-1) {
		if(index < 0 || index >= this.inventory.items.length) {
			for(let i = 0; i < this.inventory.items.length; i++) {
				if(this.inventory.items[i] === null) {
					this.inventory.items[i] = item;
					update({name: "statChange"});
					return true;
				}
			}
		}
		else {
			if(this.inventory.items[index] === null) {
				this.inventory.items[index] = item;
				update({name: "statChange"});
				return true;
			}
		}

		return false;
	}

	inventoryRemove(index) {
		if(index < 0 || index >= this.inventory.items.length) {
			return null;
		}

		let item = this.inventory.items[index];
		this.inventory.items[index] = null;

		update({name: "statChange"});

		return item;
	}

	canInventoryPut(index) {
		if(index < 0 || index >= this.inventory.items.length) {
			for(let i = 0; i < this.inventory.items.length; i++) {
				if(this.inventory.items[i] === null) {
					return true;
				}
			}
		}

		return this.inventory.items[index] === null;
	}

	addScript(script) {
		if(script === null
			|| !(script instanceof Script)) {
			return false;
		}

		script.entity = this;

		this.scripts.push(script);
		update({name: "statChange"});
		return true;
	}

	getScript(name) {
		for(let i = 0; i < this.scripts.length; i++) {
			let script = this.scripts[i];
			if(script.name === name) {
				return script;
			}
		}
		
		return null;
	}

	getSelectedEquipment() {
		return this.equipment[EQUIPMENT_TYPES[this.selectedEquipment]];
	}

	getSelectedInventory() {
		if(this.selectedInventory < 0 || this.selectedInventory >= this.inventory.items.length) {
			return null;
		}

		return this.inventory.items[this.selectedInventory];
	}
}

var PLAYER_STARTING_EXECUTION_SPEED = 100;