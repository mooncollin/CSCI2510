class Player extends Entity {
	constructor() {
		super();
	}

	render(ctx) {
		ctx.fillStyle = "yellow";
		ctx.fillRect(-1, -1, 2, 2);
	}

	renderMiniMap(ctx) {
		ctx.fillStyle = "white";
		ctx.fillRect(-1, -1, 2, 2);
	}
}