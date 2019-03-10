class Equipment extends Item {
	constructor(name, description, value, slot, image, attributes) {
		super(name, description, value, image);
		this.slot = slot;
		this.attributes = attributes;
	}
}

function noEquipment() {
	let noEquip = {};
	for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
		noEquip[EQUIPMENT_TYPES[i]] = nothing(EQUIPMENT_TYPES[i]);
	}

	return noEquip;
}

function nothing(slot) {
	return new Equipment("Nothing", "Nothing", 0, slot, equipmentImages[slot], {});
}

var EQUIPMENT_TYPES = [
	"weapon",
	"head",
	"body",
	"offhand",
	"legs",
	"feet",
	"hands",
	"finger",
	"neck",
	"back",
	"waist",
	"shoulders"
];