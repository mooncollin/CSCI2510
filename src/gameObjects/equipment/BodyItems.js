class RuggedShirt extends Equipment {
	constructor() {
		super("Rugged Shirt", "Grimy old shirt", 0, "body", images.equipment.Rugged_Shirt, baseAttributes());
		this.attributes.defense = 1;
		this.attributes.color = "brown";
		this.attributes.type = EQUIPMENT_ATTRIBUTES_TYPES.CLOTH;
	}
}

var bodyItems = [
	"Rugged_Shirt"
];