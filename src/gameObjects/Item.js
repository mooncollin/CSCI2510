class Item extends GameObject {
	constructor(name, description, value, image) {
		super();
		this.name = name;
		this.value = value;
		this.image = image;
		this.transform = null;
	}
}