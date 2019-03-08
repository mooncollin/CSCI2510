//A generic GameObject class
class GameObject {
	constructor() {
		this.transform = new Transform();
		this.components = [];
		this.minimapComponents = [];
	}

	render(ctx) {
		for(let i = 0; i < this.components.length; i++) {
			if(typeof this.components[i].render === "function") {
				this.components[i].render(ctx, this);
			}
		}
	}

	renderMinimap(ctx) {
		for(let i = 0; i < this.minimapComponents.length; i++) {
			if(typeof this.minimapComponents[i].render === "function") {
				this.minimapComponents[i].render(ctx, this);
			}
		}
	}
}