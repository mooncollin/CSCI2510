class Player extends Entity {
	constructor() {
		super();
		
		let minimapBlock = new AxisAlignedRectangle(1, 1);

		this.leftArm = new GeometryRendererComponent("yellow", this.legBlock, 3, 2.8);
		this.rightArm = new GeometryRendererComponent("yellow", this.legBlock, -3, 2.8);
		let playerBlockRenderMinimap = new GeometryRendererComponent("white", minimapBlock);
		
		this.components.push(this.leftArm);
		this.components.push(this.rightArm);
		this.minimapComponents.push(playerBlockRenderMinimap);

		this.health = 100;
		this.speed = .1;
		this.MAX_INVENTORY = 20;
		this.executionSpeed = 1000;
		this.scripts = [];

		for(let i = 0; i < this.MAX_INVENTORY; i++) {
			this.inventory.items.push(null);
		}
	}

	nothingEquipmentSlot(slot) {
		let result = [];
		
		for(let i = 0; i < this.equipmentTransforms[slot].length; i++) {
			result.push(new GeometryRendererComponent(this.colors[slot], this.blocks[slot], this.equipmentTransforms[slot][i].position.x, this.equipmentTransforms[slot][i].position.y));
		}

		return result;
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
					return true;
				}
			}
		}
		else {
			if(this.inventory.items[index] === null) {
				this.inventory.items[index] = item;
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
}