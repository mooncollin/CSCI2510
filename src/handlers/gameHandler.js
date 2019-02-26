var gameStateHandler = {
	start() {
		updateListeners.push(this);

		this.canvas = document.getElementById("gameCanvas");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.minimap = document.getElementById("minimap");
		this.miniWidth = this.minimap.width;
		this.miniHeight = this.minimap.height;
		this.stats = document.getElementById("statsCanvas");
		this.statWidth = this.stats.width;
		this.statHeight = this.stats.height;
		this.ctx = this.canvas.getContext("2d");
		this.miniCtx = this.minimap.getContext("2d");
		this.statsCtx = this.stats.getContext("2d");
		this.statsActive = document.getElementsByClassName("statsActive")[0].id;
		this.textInput = document.getElementById("textbox");
		this.interpreterOutput = document.getElementById("textarea");
		this.chatOutput = document.getElementById("chatArea");
		this.interpreterOutputArr = [];
		this.functions = [];
		this.variables = [];
		this.history = [""];
		this.currentHistoryIndex = 0;
		this.MAX_HISTORY = 25;
		this.MAX_INTERPRETER_OUTPUT = 25;

		this.player = new Player();
		this.player.transform.scale.x = 0.2;
		this.player.transform.scale.y = 0.2;
		this.player.render = (ctx) => {
			ctx.fillStyle = "yellow";
			ctx.fillRect(-1, -1, 2, 2);
		};
		this.cameraZoom = 30;
		this.minimapZoom = 10;

		this.hierachy = [];
		this.hierachy.push(this.player);

		update({name: "statChange"});

		
		update({name: "addFunction", key: "moveUp", value: moveUp, status: Status.GAME});
		update({name: "addFunction", key: "moveDown", value: moveDown, status: Status.GAME});
		update({name: "addFunction", key: "moveLeft", value: moveLeft, status: Status.GAME});
		update({name: "addFunction", key: "moveRight", value: moveRight, status: Status.GAME});
		update({name: "addFunction", key: "clearVariables", value: clearVariables, status: Status.GAME});
		update({name: "addFunction", key: "clearWindow", value: clearWindow, status: Status.GAME});
		update({name: "addFunction", key: "print", value: print, status: Status.GAME});
		update({name: "addFunction", key: "println", value: println, status: Status.GAME});
		update({name: "addFunction", key: "printf", value: printf, status: Status.GAME});
		update({name: "addFunction", key: "clearChat", value: clearChat, status: Status.GAME});
		update({name: "addVariable", key: "globalFunctions", value: this.functions, status: Status.GAME});

		this.interpreterVariables = []; // Doesn't do anything but fix script to keep variables alive
		this.interpreterScript = new Script("interpreter", "", Status.INTERPRETER, this.interpreterVariables, null, interpreterCallback);
		this.textInput.onkeypress = function(event) {
			if(event.key === "Enter") {
				gameStateHandler.interpreterScript.setCode(this.value);
				let errors = gameStateHandler.interpreterScript.execute();
				for(let i = 0; i < errors.length; i++) {
					interpreterCallback(errors[i]);
				}
				gameStateHandler.history.splice(1, 0, this.value);
				if(gameStateHandler.history.length > gameStateHandler.MAX_HISTORY) {
					gameStateHandler.history.pop();
				}
				gameStateHandler.currentHistoryIndex = 0;
				this.value = "";
			}
		};
		this.textInput.onkeydown = function(event) {
			if(event.key === "ArrowDown") {
				gameStateHandler.currentHistoryIndex--;
				if(gameStateHandler.currentHistoryIndex < 0) {
					gameStateHandler.currentHistoryIndex = 0;
				}
				gameStateHandler.textInput.value = gameStateHandler.history[gameStateHandler.currentHistoryIndex];
			}
			else if(event.key === "ArrowUp") {
				gameStateHandler.currentHistoryIndex++;
				if(gameStateHandler.currentHistoryIndex >= gameStateHandler.history.length) {
					gameStateHandler.currentHistoryIndex = gameStateHandler.history.length - 1;
				}
				gameStateHandler.textInput.value = gameStateHandler.history[gameStateHandler.currentHistoryIndex];
			}
		}
	},
	eventPump(event) {
		switch(event.name) {
			case "next":
				break;
			case "timer":
				this.update();
				this.render();
				break;
			case "statChange":
				this.statsActive = document.getElementsByClassName("statsActive")[0].id;
				this.renderStats();
				break;
			case "addFunction":
				this.functions.push(new Function(event.key, event.value, event.status));
				break;
			case "addVariable":
				this.variables.push(new Variable(event.key, event.value, event.status));
				break;
		}
	},
	update() {
	},
	render() {
		this.renderGame();
		this.renderMinimap();
	},
	renderStats() {
		this.statsCtx.clearRect(0, 0, this.statWidth, this.statHeight);
		this.statsCtx.font = "20px Georgia";
		let textXPosition = (this.statWidth / 2) - (this.statsCtx.measureText(capitalize(this.statsActive)).width / 2);
		positions = positionText(this.statWidth, this.statHeight, textXPosition, .07);
		this.statsCtx.fillText(capitalize(this.statsActive), textXPosition, positions.y);
	},
	renderMinimap() {
		this.miniCtx.fillStyle = "rgb(18, 158, 23)";
		this.miniCtx.fillRect(0, 0, this.miniWidth, this.miniHeight);

		this.miniCtx.save();
		{
			this.miniCtx.translate(this.miniWidth / 2, this.miniHeight / 2);
			this.miniCtx.scale(this.minimapZoom, this.minimapZoom);

			this.miniCtx.save();
			{
				this.miniCtx.scale(1, -1);
				
				this.miniCtx.save();
				{
					for(let i = 0; i < this.hierachy.length; i++) {
						let gameObject = this.hierachy[i];
						if(typeof gameObject.renderMiniMap === 'function') {
							this.miniCtx.save();
							this.miniCtx.translate(gameObject.transform.position.x, gameObject.transform.position.y);
							this.miniCtx.scale(gameObject.transform.scale.x, gameObject.transform.scale.y);
							gameObject.renderMiniMap(this.miniCtx);
							this.miniCtx.restore();
						}
					}
				}
				this.miniCtx.restore();
			}
			this.miniCtx.restore();
		}
		this.miniCtx.restore();
	},
	renderGame() {
		this.ctx.fillStyle = "rgb(18, 158, 23)";
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Render GUI

		this.ctx.save();
		{
			this.ctx.translate(this.width / 2, this.height / 2);
			this.ctx.scale(this.cameraZoom, this.cameraZoom);

			this.ctx.save();
			{
				this.ctx.scale(1, -1);
				
				this.ctx.save();
				{
					for(let i = 0; i < this.hierachy.length; i++) {
						let gameObject = this.hierachy[i];
						if(typeof gameObject.render === 'function') {
							this.ctx.save();
							this.ctx.translate(gameObject.transform.position.x, gameObject.transform.position.y);
							this.ctx.scale(gameObject.transform.scale.x, gameObject.transform.scale.y);
							gameObject.render(this.ctx);
							this.ctx.restore();
						}
					}
				}
				this.ctx.restore();
			}
			this.ctx.restore();
		}
		this.ctx.restore();
	}
};

function interpreterCallback(byteCode, funcValue) {
	let output = null;
	if(byteCode instanceof Error) {
		output = "Error: " + byteCode.message;
	}
	else {
		if(byteCode instanceof ByteCodeMAKE_VAR) {
			output = "Created variable '" + byteCode.name + "' -> " + byteCode.getValue();
		}
		else if(byteCode instanceof ByteCodeSET_VAR || byteCode instanceof ByteCodeGET_VAR) {
			output = "'" + byteCode.name + "' -> " + byteCode.getValue();
		}
		else if(byteCode instanceof Function) {
			output = byteCode.name + "() -> " + funcValue;
		}
	}

	if(output != null) {
		gameStateHandler.interpreterOutputArr.push(output)
		if(gameStateHandler.interpreterOutputArr.length > gameStateHandler.MAX_INTERPRETER_OUTPUT) {
			gameStateHandler.interpreterOutputArr.shift();
		}
	}

	gameStateHandler.interpreterOutput.value = gameStateHandler.interpreterOutputArr.join("\n");
}