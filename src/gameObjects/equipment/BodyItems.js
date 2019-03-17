class RuggedShirt extends Equipment {
	constructor() {
		super("Rugged Shirt", "Grimy old shirt", 0, "body", images.equipment["Rugged Shirt"], baseAttributes());
		this.attributes.defense = 1;
		this.attributes.color = "brown";
		this.attributes.type = "cloth";
	}
}

var bodyItems = [
	"Rugged Shirt"
];