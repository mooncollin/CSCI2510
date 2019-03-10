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

		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			this.components.push(this.equipment[EQUIPMENT_TYPES[i]]);
		}
		
		this.requestedX = null;
		this.requestedY = null;
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
			let h = typeof equip[EQUIPMENT_TYPES[i]];
			equip[EQUIPMENT_TYPES[i]].components = equip[EQUIPMENT_TYPES[i]].components.concat(this.nothingEquipmentSlot(EQUIPMENT_TYPES[i]));
		}

		return equip;
	}

	nothingEquipmentSlot(slot) {
		return [];
	}

	defineTransforms() {

	}
}