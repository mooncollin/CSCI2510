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
	return new Equipment("Nothing", "Nothing", 0, slot, images.equipment[slot], baseAttributes());
}

function baseAttributes() {
	return {
		"defense"	: 0,
		"color"		: "",
		"type"		: "none"
	};
}

var EQUIPMENT_TYPES = [
	"back",
	"head",
	"shoulders",
	"weapon",
	"body",
	"offhand",
	"hands",
	"waist",
	"legs",
	"neck",
	"feet",
	"finger"
];

var EQUIPMENT_ATTRIBUTES = [
	"defense",
	"color",
	"type"
];