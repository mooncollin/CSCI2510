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
		"offense"	: 0,
		"defense"	: 0,
		"color"		: "",
		"type"		: EQUIPMENT_ATTRIBUTES_TYPES.NONE
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
	"offense",
	"defense",
	"color",
	"type"
];

var EQUIPMENT_ATTRIBUTES_TYPES = {
	NONE: "none",
	CLOTH: "cloth",
	LEATHER: "leather",
	IRON: "iron",
	STEEL: "steel",
	MITHRIL: "mithril",
};