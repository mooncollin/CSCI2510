class Equipment extends Item {
	constructor(name, description, value, slot) {
		super(name, description, value);
		this.slot = slot;
	}
}

function noEquipment() {
	return {
		"weapon"	: nothing("weapon"),
		"head"		: nothing("head"),
		"body"		: nothing("body"),
		"sideweapon": nothing("sideweapon"),
		"legs"		: nothing("legs"),
		"feet"		: nothing("feet"),
		"hands"		: nothing("hands"),
		"finger"	: nothing("finger"),
		"neck"		: nothing("neck"),
		"back"		: nothing("back"),
		"waist"		: nothing("waist"),
		"shoulders"	: nothing("shoulders")
	};
}

function nothing(slot) {
	return new Equipment("nothing", "nothing", 0, slot);
}