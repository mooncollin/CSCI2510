//A generic GameObject class
class GameObject {
	constructor(name, xPosition=0, yPosition=0, xScale=1, yScale=1) {
		this.transform = new Transform(new Vector2(xPosition, yPosition), new Vector2(xScale, yScale));
		this.components = [];
		this.minimapComponents = [];
		this.name = name;
		this.id = Math.ceil(Math.random() * 100000000);
	}

	render(ctx) {
		for(let i = 0; i < this.components.length; i++) {
			if(typeof this.components[i].render === "function") {
				if(this.hasComponent(CollidingComponent)) {
					if(!this.inScreen()) {
						continue;
					}
				}
				this.components[i].render(ctx, this);
			}
		}
	}

	renderMinimap(ctx) {
		for(let i = 0; i < this.minimapComponents.length; i++) {
			if(typeof this.minimapComponents[i].render === "function") {
				if(this.hasComponent(CollidingComponent)) {
					if(!this.inMinimap()) {
						continue;
					}
				}
				
				ctx.save();
				{
					ctx.scale(1/this.transform.scale.x, 1/this.transform.scale.y);
					this.minimapComponents[i].render(ctx, this);
				}
				ctx.restore();
			}
		}
	}

	update() {
		for(let i = 0; i < this.components.length; i++) {
			if(typeof this.components[i].update === "function") {
				this.components[i].update(this);
			}
		}
	}

	hasComponent(componentClassType) {
		for(let i = 0; i < this.components.length; i++) {
			if(this.components[i] instanceof componentClassType) {
				return true;
			}
		}

		return false;
	}
}