class Footwraps extends Equipment {
	constructor() {
		super("Footwraps", "Torns rags", 0, "feet", images.equipment.Footwraps, baseAttributes());
		this.attributes.defense = 1;
		this.attributes.color = "#cece94";
		this.attributes.type = EQUIPMENT_ATTRIBUTES_TYPES.CLOTH;
	}
}

var feetItems = [
	"Footwraps"
];