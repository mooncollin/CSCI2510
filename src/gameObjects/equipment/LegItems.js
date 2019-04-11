class WornTrousers extends Equipment {
	constructor() {
		super("Worn Trousers", "Kinda smelly", 1, "legs", images.equipment.Worn_Trousers, baseAttributes());
		this.attributes.defense = 1;
		this.attributes.color = "#707c1d";
		this.attributes.type = EQUIPMENT_ATTRIBUTES_TYPES.LEATHER;
	}
}

var legItems = [
	"Worn_Trousers"
];