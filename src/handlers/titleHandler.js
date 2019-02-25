var titleStateHandler = {
	start() {
		updateListeners.push(this);
		this.titleTextbox = document.getElementById("titleText");
		this.titleTextbox.addEventListener("keyup", function(event){
			update({name: "checkText", keyEvent: event});
		});

		this.canvas = document.getElementById("titleCanvas");
		this.ctx = this.canvas.getContext("2d");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx.fillStyle = "black";
		this.ctx.font = "30px Courier New";
		var positions = positionText(this.width, this.height, .40, .5);
		this.ctx.fillText("Script", positions.x, positions.y);
		positions = positionText(this.width, this.height, .50, .5);
		this.ctx.font = "50px Georgia";
		this.ctx.fillText("RPG", positions.x, positions.y);

	},
	eventPump(event) {
		switch(event.name) {
			case "next":
				state = states.LOAD_STATE;
				updateListeners.splice(updateListeners.indexOf(this), 1);
				updateStateHandler();
				break;
			case "timer":
				this.update();
				this.render();
				break;
			case "checkText":
				if(event.keyEvent.keyCode == 13) {
					let startRe = /start\s*\(\s*\);$/;
					if(startRe.test(this.titleTextbox.value.trim())) {
						update({name: "next"});
					}
					else {
						this.titleTextbox.style.border = "3px solid red";
						this.titleTextbox.classList.add("apply-shake");
					}
				}
				break;
			case "endShake":
				this.titleTextbox.style.border = "1px solid gray";
				this.titleTextbox.classList.remove("apply-shake");
		}
	},
	update() {
	},
	render() {

	}
};