var loadStateHandler = {
	start() {
		updateListeners.push(this);
		
		this.canvas = document.getElementById("loadCanvas");
		this.minimap = document.getElementById("minimap");
		this.stats = document.getElementById("statsCanvas");
		this.ctx = this.canvas.getContext("2d");
		this.minimapCtx = this.minimap.getContext("2d");
		this.statsCtx = this.stats.getContext("2d");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx.fillStyle = "black";
		this.ctx.font = "30px Courier New";
		var positions = positionText(this.width, this.height, .4, .5);
		this.ctx.fillText("Script", positions.x, positions.y);
		positions = positionText(this.width, this.height, .5, .5);
		this.ctx.font = "50px Georgia";
		this.ctx.fillText("RPG", positions.x, positions.y);

		this.ctx.font = "30px Georgia";
		positions = positionText(this.width, this.height, .44, .6);
		this.ctx.fillText("Loading...", positions.x, positions.y);

		this.minimapCtx.font = "30px Georgia";
		positions = positionText(this.minimap.width, this.minimap.height, .3, .55);
		this.minimapCtx.fillText("Minimap", positions.x, positions.y);
	},
	eventPump(event) {
		switch(event.name) {
			case "next":
				break;
			case "timer":
				this.update();
				this.render();
				break;
		}
	},
	update() {

	},
	render() {
		this.statsCtx.fillStyle = "rgb(247, 222, 183)";
		this.statsCtx.fillRect(0, 0, this.stats.width, this.stats.height);
	}
};