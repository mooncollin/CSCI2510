var gameStateHandler = {
	start() {
		updateListeners.push(this);

		this.interpreterTemplate = document.getElementById("interpreterTextarea");
		this.scriptTemplate = document.getElementById("scriptTextarea");
		this.openedScript = null;

		this.textareaSection = document.getElementById("textareaSection");

		this.textareaSection.appendChild(this.interpreterTemplate.content.cloneNode(true));

		this.gameWidth = 8000;
		this.gameHeight = 8000;
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
		this.scriptOutput = this.scriptTemplate.content.querySelector("#script");
		this.chatOutput = document.getElementById("chatArea");
		this.interpreterOutputArr = [];
		this.functions = [];
		this.variables = [];
		this.history = [""];
		this.currentHistoryIndex = 0;
		this.MAX_HISTORY = 25;
		this.MAX_INTERPRETER_OUTPUT = 25;

		this.map = [];
		this.tileSize = 16;
		this.mapScale = 3;
		for(let i = 0; i < this.gameWidth / this.tileSize; i++)
		{
			this.map.push([]);
			for(let j = 0; j < this.gameHeight / this.tileSize; j++)
			{
				this.map[i].push(null);
			}
		}

		this.IMPASSIBLE_TILES = [
			images.tiles.bigTree1, images.tiles.bigTree2, images.tiles.bigTree3,
			images.tiles.bigTree4, images.tiles.cliff1, images.tiles.cliff2,
			images.tiles.cliff3, images.tiles.treeBottom, images.tiles.treeTop,
			images.tiles.ironBar, images.tiles.fence, images.tiles.fence2,
			images.tiles.fenceLeftCorner1, images.tiles.fenceLeftCorner2, images.tiles.fenceRightCorner1,
			images.tiles.fenceRightCorner2, images.tiles.wellBottom, images.tiles.wellTop,
			images.tiles.well, images.tiles.roof, images.tiles.roofBottomLeftCorner,
			images.tiles.roofEdgeLeft, images.tiles.roofEdgeRight, images.tiles.roofTileBottom,
			images.tiles.roofTileBottomRightCorner, images.tiles.roofTileCorner, images.tiles.roofTileRight,
			images.tiles.roofTileSide1, images.tiles.roofTileSide2, images.tiles.rootTileSide3,
			images.tiles.roofTop, images.tiles.bush1, images.tiles.bush2,
			images.tiles.bush3, images.tiles.bush4, images.tiles.bush5,
		];

		this.map[this.gameWidth/(this.tileSize * 2) - 1][this.gameHeight/(this.tileSize * 2) - 1] = images.tiles.grassMiddle;
		this.map[this.gameWidth/(this.tileSize * 2)][this.gameHeight/(this.tileSize * 2) - 1] = images.tiles.edgeRight;
		this.map[this.gameWidth/(this.tileSize * 2) + 1][this.gameHeight/(this.tileSize * 2) - 1] = images.tiles.bigTree3;
		this.map[this.gameWidth/(this.tileSize * 2) + 2][this.gameHeight/(this.tileSize * 2) - 1] = images.tiles.bigTree4;
		this.map[this.gameWidth/(this.tileSize * 2) + 1][this.gameHeight/(this.tileSize * 2) - 2] = images.tiles.bigTree1;
		this.map[this.gameWidth/(this.tileSize * 2) + 2][this.gameHeight/(this.tileSize * 2) - 2] = images.tiles.bigTree2;
		this.map[this.gameWidth/(this.tileSize * 2) - 3][this.gameHeight/(this.tileSize * 2)] = images.tiles.treeBottom;
		this.map[this.gameWidth/(this.tileSize * 2) - 3][this.gameHeight/(this.tileSize * 2) - 1] = images.tiles.treeTop;

		this.equipmentImagesLocations = {
			"head"		: [this.statWidth/2.4, this.statHeight/7],
			"body"		: [this.statWidth/2.4, this.statHeight/3],
			"waist"		: [this.statWidth/2.4, this.statHeight/2],
			"legs"		: [this.statWidth/2.4, this.statHeight/1.5],
			"feet"		: [this.statWidth/2.4, this.statHeight/1.2],
			"weapon"	: [this.statWidth/9, this.statHeight/3],
			"offhand"	: [this.statWidth/1.35, this.statHeight/3],
			"back"		: [this.statWidth/9, this.statHeight/7],
			"shoulders"	: [this.statWidth/1.35, this.statHeight/7],
			"hands"		: [this.statWidth/9, this.statHeight/2],
			"neck"		: [this.statWidth/9, this.statHeight/1.2],
			"finger"	: [this.statWidth/1.35, this.statHeight/1.2]
		};
		
		this.selectedInventory = 0;
		this.player = new Player(0, 0, 0.2, 0.2);
		this.cameraZoom = 30;
		this.minimapZoom = 5;

		this.hierachy = [];
		let chicken = new Chicken(5, 5, 0.1, 0.1);
		this.hierachy.push(chicken);
		this.hierachy.push(this.player);

		update({name: "statChange"});
		
		update({name: "addFunction", key: "move", value: move, status: Status.GAME});
		update({name: "addFunction", key: "clearVariables", value: clearVariables, status: Status.GAME});
		update({name: "addFunction", key: "clearWindow", value: clearWindow, status: Status.GAME});
		update({name: "addFunction", key: "print", value: print, status: Status.GAME});
		update({name: "addFunction", key: "println", value: println, status: Status.GAME});
		update({name: "addFunction", key: "printf", value: printf, status: Status.GAME});
		update({name: "addFunction", key: "clearChat", value: clearChat, status: Status.GAME});
		update({name: "addFunction", key: "equals", value: equals, status: Status.GAME});
		update({name: "addFunction", key: "help", value: help, status: Status.GAME});
		update({name: "addFunction", key: "selectedEquipment", value: selectedEquipment, status: Status.GAME});
		update({name: "addFunction", key: "selectedInventory", value: selectedInventory, status: Status.GAME});
		update({name: "addFunction", key: "selectEquipment", value: selectEquipment, status: Status.GAME});
		update({name: "addFunction", key: "selectInventory", value: selectInventory, status: Status.GAME});
		update({name: "addFunction", key: "unequip", value: unequip, status: Status.GAME});
		update({name: "addFunction", key: "equip", value: equip, status: Status.GAME});
		update({name: "addFunction", key: "openScript", value: openScript, status: Status.GAME});
		update({name: "addFunction", key: "closeScript", value: closeScript, status: Status.GAME});
		update({name: "addFunction", key: "executeScript", value: executeScript, status: Status.GAME});


		this.interpreterVariables = []; // Doesn't do anything but fix script to keep variables alive
		this.interpreterScript = new Script("interpreter", "", Status.INTERPRETER, this.interpreterVariables, null, interpreterCallback, this.player);
		this.textInput.onkeypress = function(event) {
			if(event.key === "Enter") {
				if(!gameStateHandler.interpreterScript.running) {
					gameStateHandler.interpreterScript.setCode(this.value);
					let errors = gameStateHandler.interpreterScript.execute();
					for(let i = 0; i < errors.length; i++) {
						interpreterCallback(errors[i]);
					}
					if(this.value != "") {
						gameStateHandler.history.splice(1, 0, this.value);
						if(gameStateHandler.history.length > gameStateHandler.MAX_HISTORY) {
							gameStateHandler.history.pop();
						}
						gameStateHandler.currentHistoryIndex = 0;
						this.value = "";
					}
				}
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

		this.player.equipmentPut(new RuggedShirt());
		this.player.equipmentPut(new Footwraps());
		this.player.equipmentPut(new WornTrousers());

		this.player.addScript(new Script("script 1", "", Status.PLAYER, null, null, scriptCallback));
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
				if(event.statSwitch) {
					document.getElementById(event.statSwitch).click();
				}
				this.statsActive = document.getElementsByClassName("statsActive")[0].id;
				this.renderStats();
				break;
			case "addFunction":
				this.functions.push(new Function(event.key, event.value, event.status));
				break;
			case "addVariable":
				this.variables.push(new Variable(event.key, event.value, event.status));
				break;
			case "interpreterOutput":
				if(event.output != null) {
					this.interpreterOutputArr.push(event.output)
				}
				if(this.interpreterOutputArr.length > this.MAX_INTERPRETER_OUTPUT) {
					this.interpreterOutputArr.shift();
				}
				this.interpreterOutput.value = this.interpreterOutputArr.join("\n");
				break;
			case "chatOutput":
				if(event.clear) {
					this.chatOutput.value = "";
				}
				if(event.output != null) {
					this.chatOutput.value += event.output;
				}
				this.chatOutput.scrollTop = this.chatOutput.scrollHeight;
		}
	},
	update() {
		if(this.hierachy) {
			for(let i = 0; i < this.hierachy.length; i++) {
				if(typeof this.hierachy[i].update === "function") {
					this.hierachy[i].update();
				}
			}
		}
	},
	render() {
		this.renderGame();
		this.renderMinimap();
	},
	renderStats() {
		this.statsCtx.clearRect(0, 0, this.statWidth, this.statHeight);
		this.statsCtx.beginPath();

		this.statsCtx.fillStyle = "black";
		this.statsCtx.font = "20px Georgia";
		let textXPosition = (this.statWidth / 2) - (this.statsCtx.measureText(capitalize(this.statsActive)).width / 2);
		let positions = positionText(this.statWidth, this.statHeight, textXPosition, .07);
		this.statsCtx.fillText(capitalize(this.statsActive), textXPosition, positions.y);

		if(this.statsActive === "inventory") {
			this.renderInventoryPage();
		}
		else if(this.statsActive === "stats") {
			this.renderStatsPage();
		}
		else if(this.statsActive === "equipment") {
			this.renderEquipmentPage();
		}
		else if(this.statsActive === "scripts") {
			this.renderScriptsPage();
		}
	},
	renderInventoryPage() {
		this.statsCtx.fillStyle = "black";

		let numberOfRows = 5;
		let numberOfColumns = 4;
		
		for(let i = 0; i < numberOfRows + 1; i++) {
			this.statsCtx.moveTo(0, (this.statHeight/(numberOfRows + 2)) * (i + 1));
			this.statsCtx.lineTo(this.statWidth, this.statHeight/(numberOfRows + 2) * (i + 1));
			this.statsCtx.stroke();
		}

		for(let i = 0; i < numberOfColumns - 1; i++) {
			this.statsCtx.moveTo((this.statWidth/numberOfColumns) * (i +1), this.statHeight/(numberOfRows + 2));
			this.statsCtx.lineTo((this.statWidth/numberOfColumns) * (i +1), (this.statHeight/(numberOfRows + 2)) * (numberOfRows + 1));
			this.statsCtx.stroke();
		}

		for(let i = 0; i < this.player.inventory.items.length; i++) {
			let item = this.player.inventory.items[i];
			if(item != null) {
				let row = Math.floor(i / (numberOfRows - 1));
				let col = i % numberOfColumns;
				let xPosition = this.statWidth/numberOfColumns * col + 2;
				let yPosition = (this.statHeight/(numberOfRows + 2)) * (row+1) + 2;
				this.statsCtx.fillStyle = randomColor();
				this.statsCtx.drawImage(item.image, xPosition, yPosition, this.statHeight/(numberOfRows + 2) - 2, this.statHeight/(numberOfRows + 2) - 2);
			}
		}
		this.statsCtx.drawImage(images.misc.money, gameStateHandler.statWidth / 14, (gameStateHandler.statHeight * (8/9)), 40, 40);
		
		this.statsCtx.font = "20px Georgia";
		this.statsCtx.fillStyle = "green";
		this.statsCtx.fillText(this.player.inventory.money, this.statWidth / 4, this.statHeight * (14/15));

		let inventorySelect = this.player.selectedInventory;
		let row = Math.floor(inventorySelect / (numberOfRows - 1));
		let col = inventorySelect % numberOfColumns;
		let xPosition = this.statWidth/numberOfColumns * col;
		let yPosition = (this.statHeight/(numberOfRows + 2)) * (row+1);
		this.statsCtx.drawImage(images.misc.select, xPosition, yPosition, this.statHeight/(numberOfRows + 2), this.statHeight/(numberOfRows + 2));
	},
	renderStatsPage() {
		this.statsCtx.fillStyle = "black";

		this.statsCtx.moveTo(0, this.statHeight/8);
		this.statsCtx.lineTo(this.statWidth, this.statHeight/8);
		this.statsCtx.stroke();

		let attributes = [
			["Level", this.player.level],
			["Health", this.player.health],
			["Defense", this.player.defense],
			["Attack", this.player.attack],
			["Movement Speed", this.player.speed],
			["Execution Speed", Math.pow(this.player.executionSpeed / PLAYER_STARTING_EXECUTION_SPEED, -1).toFixed(2)],
			["Number of scripts", this.player.scripts.length]
		];

		this.statsCtx.font = "20px Georgia";
		for(let i = 0; i < attributes.length; i++) {
			this.statsCtx.fillText(attributes[i][0] + ": " + attributes[i][1],
				this.statWidth / 15, this.statHeight * ((i+1)/(attributes.length * 1.5)) + this.statHeight/8);
		}

		this.statsCtx.moveTo(0, this.statHeight * (7/8));
		this.statsCtx.lineTo(this.statWidth, this.statHeight * (7/8));
		this.statsCtx.stroke();
	},
	renderEquipmentPage() {
		
		let imageSize = 45;
		let offset = 10;

		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			this.statsCtx.drawImage(images.equipment.background, this.equipmentImagesLocations[EQUIPMENT_TYPES[i]][0], this.equipmentImagesLocations[EQUIPMENT_TYPES[i]][1], imageSize + offset, imageSize + offset);
			if(this.player.equipment[EQUIPMENT_TYPES[i]].image) {
				this.statsCtx.drawImage(this.player.equipment[EQUIPMENT_TYPES[i]].image, this.equipmentImagesLocations[EQUIPMENT_TYPES[i]][0] + offset / 2, this.equipmentImagesLocations[EQUIPMENT_TYPES[i]][1] + offset / 2, imageSize, imageSize);
			}
		}

		this.statsCtx.drawImage(images.misc.select, this.equipmentImagesLocations[EQUIPMENT_TYPES[this.player.selectedEquipment]][0] - offset * .5, this.equipmentImagesLocations[EQUIPMENT_TYPES[this.player.selectedEquipment]][1] - offset * .5, imageSize + offset * 2, imageSize + offset * 2);
	},
	renderScriptsPage() {
		for(let i = 0; i < this.player.scripts.length; i++) {
			let scriptName = this.player.scripts[i].name;
			this.statsCtx.fillStyle = "white";
			this.statsCtx.font = "15px Georgia";
			let xPosition = this.statWidth / 10;
			let yPosition = (this.statHeight / 10) * (i+1);

			this.statsCtx.fillRect(xPosition, yPosition, this.statWidth/2, this.statHeight / 25);
			this.statsCtx.fillStyle = "black";
			this.statsCtx.fillText(scriptName, xPosition + 3, yPosition + 15);
		}
	},
	renderMinimap() {
		this.miniCtx.fillStyle = "rgb(18, 158, 23)";
		this.miniCtx.fillRect(0, 0, this.miniWidth, this.miniHeight);

		this.miniCtx.save();
		{
			this.miniCtx.translate(this.miniWidth / 2, this.miniHeight / 2);
			this.miniCtx.scale(this.minimapZoom, this.minimapZoom);

			this.miniCtx.scale(1, -1);

			// Camera
			this.miniCtx.translate(-this.player.transform.position.x, -this.player.transform.position.y);
			
			this.miniCtx.save();
			{
				for(let i = 0; i < this.hierachy.length; i++) {
					let gameObject = this.hierachy[i];
					if(typeof gameObject.renderMinimap === 'function') {
						this.miniCtx.save();
						this.miniCtx.translate(gameObject.transform.position.x, gameObject.transform.position.y);
						this.miniCtx.scale(gameObject.transform.scale.x, gameObject.transform.scale.y);
						gameObject.renderMinimap(this.miniCtx);
						this.miniCtx.restore();
					}
				}
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
			this.ctx.translate(this.width/2, this.height/2);

			this.ctx.scale(1, -1);
			this.ctx.scale(this.cameraZoom, this.cameraZoom);

			// Camera
			this.ctx.translate(-this.player.transform.position.x, -this.player.transform.position.y);

			//Map
			this.ctx.save();
			{
				this.ctx.scale(1/this.cameraZoom, -1/this.cameraZoom);
				this.ctx.scale(this.mapScale, this.mapScale);
				this.renderMap();
			}
			this.ctx.restore();
			
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
	},
	renderMap() {
		for(let x = 0; x < this.map.length; x++) {
			for(let y = 0; y < this.map[x].length; y++) {
				if(this.map[x][y] != null) {
					this.ctx.drawImage(this.map[x][y], x * this.tileSize - (this.gameWidth / (2 * this.tileSize) - 1) * this.tileSize, y * this.tileSize - (this.gameHeight / (2 * this.tileSize) - 1) * this.tileSize, this.tileSize, this.tileSize);
				}
			}
		}
	},
	getMapTile(x, y) {
		let middleX = this.gameWidth / (this.tileSize * 2) - 1;
		let middleY = this.gameHeight / (this.tileSize * 2) - 1;

		let adjustedX = middleX + Math.floor((x * this.mapScale * 3) / this.tileSize);
		let adjustedY = middleY + Math.floor((y * this.mapScale * 3) / this.tileSize);

		if(adjustedX < 0) {
			adjustedX = 0;
		}
		if(adjustedY < 0) {
			adjustedY = 0;
		}
		if(adjustedX >= this.gameWidth / this.tileSize) {
			adjustedX = this.gameWidth / this.tileSize - 1;
		}
		if(adjustedY >= this.gameHeight / this.tileSize) {
			adjustedY = this.gameHeight / this.tileSize - 1;
		}

		return this.map[adjustedX][adjustedY];
	}
};

function interpreterCallback(byteCode, funcValue, preExtra="", postExtra="") {
	let output = null;
	if(byteCode instanceof Error) {
		output = "Error: " + byteCode.message;
	}
	else if(byteCode instanceof ByteCodeMAKE_VAR) {
		let value = byteCode.getValue();
		output = "Created variable '" + byteCode.name + "' -> ";
		if(typeof value === "string") {
			output += "\"";
		}
		else if(value instanceof Array) {
			output += "[";
		}
		output += value;
		if(typeof value === "string") {
			output += "\"";
		}
		else if(value instanceof Array) {
			output += "]";
		}
	}
	else if(byteCode instanceof ByteCodeSET_VAR || byteCode instanceof ByteCodeGET_VAR) {
		let value = byteCode.getValue();
		output = "'" + byteCode.name + "' -> ";
		if(typeof value === "string") {
			output += "\"";
		}
		else if(value instanceof Array) {
			output += "[";
		}
		output += value;
		if(typeof value === "string") {
			output += "\"";
		}
		else if(value instanceof Array) {
			output += "]";
		}
	}
	else if(byteCode instanceof ByteCodeFunction) {
		output = byteCode.name + "() -> ";
		if(typeof funcValue === "string") {
			output += "\"";
		}
		else if(funcValue instanceof Array) {
			output += "[";
		}
		output += funcValue;
		if(typeof funcValue === "string") {
			output += "\"";
		}
		else if(funcValue instanceof Array) {
			output += "]";
		}
	}

	if(output === null) {
		update({name: "interpreterOutput", output: null});
	}
	else {
		update({name: "interpreterOutput", output: preExtra + output + postExtra});
	}
}

// Used to output errors to the interpreter window from scripts
function scriptCallback(byteCode, value, preExtra, postExtra) {
	let output = null;
	if(byteCode instanceof Error) {
		output = "Error: " + byteCode.message;
	}

	if(output === null) {
		update({name: "interpreterOutput", output: null});
	}
	else {
		update({name: "interpreterOutput", output: preExtra + output + postExtra});
	}
}