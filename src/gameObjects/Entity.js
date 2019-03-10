class Entity extends GameObject {
	constructor() {
		super();

		this.equipmentTransforms = {};
		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			this.equipmentTransforms[EQUIPMENT_TYPES[i]] = [];
		}

		this.defineTransforms();

		this.speed = 0;
		this.level = 1;
		this.health = 0;
		this.inventory = {
			"money" : 0,
			"items" : []
		};
		this.equipment = this.noEquipment();

		this.refreshEquipment();
		
		this.requestedX = null;
		this.requestedY = null;
		this.selectedInventory = 0;
		this.selectedEquipment = 0;
	}

	move(x, y) {
		if(x === 0 && y === 0) {
			return false;
		}

		if(this.canMove(x, y)) {
			this.transform.position.x += x;
			this.transform.position.y += y;
			return true;
		}

		return false;
	}

	canMove(x, y) {
		return true;
	}

	updateMove(x, y) {
		this.requestedX = x + this.transform.position.x;
		this.requestedY = y + this.transform.position.y;
		return true;
	}

	update() {
		if(this.requestedX != null && this.requestedY != null) {
			let moveX = Math.min(this.speed, Math.abs(this.requestedX - this.transform.position.x));
			let moveY = Math.min(this.speed, Math.abs(this.requestedY - this.transform.position.y));
			if(moveX <= 0.001 && moveY <= 0.001) {
				this.requestedX = null;
				this.requestedY = null;
			}
			else {
				moveX = this.requestedX - this.transform.position.x < 0 ? -moveX : moveX;
				moveY = this.requestedY - this.transform.position.y < 0 ? -moveY : moveY;
				this.move(moveX, moveY);
			}
		}
	}

	noEquipment() {
		var equip = noEquipment();
		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			equip[EQUIPMENT_TYPES[i]].components = this.nothingEquipmentSlot(EQUIPMENT_TYPES[i]);
		}

		return equip;
	}

	nothingEquipmentSlot(slot) {
		return [];
	}

	defineTransforms() {

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

	equipmentPut(item, slot) {
		if(this.equipment[slot] === undefined
			|| (this.equipment[slot] != null && this.equipment[slot].name != "Nothing"))
		{
			return false;
		}

		this.equipment[slot] = item;
		this.equipment[slot].components = this.nothingEquipmentSlot(slot);
		for(let i = 0; i < this.equipment[slot].components.length; i++) {
			this.equipment[slot].components[i].color = item.attributes.color;
		}
		this.refreshEquipment();
		return true;
	}

	equipmentRemove(slot) {
		if(this.equipment[slot] === undefined
			|| (this.equipment[slot] != null && this.equipment[slot].name === "Nothing"))
		{
			return null;
		}

		let item = this.equipment[slot];
		this.equipment[slot] = nothing(slot);
		this.equipment[slot].components = this.nothingEquipmentSlot(slot);
		this.refreshEquipment();
		return item;
	}

	refreshEquipment() {
		for(let i = 0; i < this.components.length; i++) {
			if(this.components[i] instanceof Equipment) {
				this.components.splice(i, 1);
				i--;
			}
		}
		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			this.components.push(this.equipment[EQUIPMENT_TYPES[i]]);
		}
	}
}