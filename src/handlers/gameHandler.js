var gameStateHandler = {
	start() {
		updateListeners.push(this);

		this.interpreterTemplate = document.getElementById("interpreterTextarea");
		this.scriptTemplate = document.getElementById("scriptTextarea");
		this.openedScript = null;

		this.textareaSection = document.getElementById("textareaSection");

		this.textareaSection.appendChild(this.interpreterTemplate.content.cloneNode(true));

		this.gameWidth = 16000;
		this.gameHeight = 16000;
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

		this.tileMappings = [
			null, null, null, null, images.tiles.cliffEdge, images.tiles.dirt, images.tiles.grassTop,
			images.tiles.grassMiddle, images.tiles.grassLeft, images.tiles.tallGrassTopLeft, images.tiles.tallGrassTop,
			images.tiles.tallGrassTopRight, null, images.tiles.water1, images.tiles.water2, images.tiles.ironBar,
			images.tiles.stone2, images.tiles.stone1, images.tiles.stone4, images.tiles.stone3, null, null, null, null,
			images.tiles.edgeLeftCorner, images.tiles.edgeTop, images.tiles.edgeRight, images.tiles.grass1,
			images.tiles.grass2, images.tiles.tallGrassEdge, images.tiles.tallGrass, images.tiles.tallGrassRight,
			images.tiles.tallGrassAround, images.tiles.roofEdgeLeft, images.tiles.roofTop, images.tiles.roofTop,
			images.tiles.roofTop, images.tiles.roofTop, images.tiles.roofEdgeRight, images.tiles.entrance,
			null, null, null, null, images.tiles.edgeLeft, images.tiles.grass, images.tiles.edgeRight,
			images.tiles.grass5, images.tiles.grass6, images.tiles.bush1, images.tiles.bush2, images.tiles.bush3,
			images.tiles.bush4, images.tiles.roofTileLeft, images.tiles.roof, images.tiles.roof, images.tiles.roof,
			images.tiles.roof, images.tiles.roofTileRight, null, null, null, null, null, images.tiles.edgeBottomCorner,
			images.tiles.edgeBottom, images.tiles.edgeBottomRight, images.tiles.grass3, images.tiles.grass4, images.tiles.cliff1,
			images.tiles.cliff2, images.tiles.cliff3, images.tiles.bush5, images.tiles.roofTileCorner, images.tiles.roofTileSide1,
			images.tiles.roof, images.tiles.roof, images.tiles.roofTileSide2, images.tiles.roofTilesSide3, null, images.tiles.pathLeftTopCorner,
			images.tiles.pathTop, images.tiles.pathRightTopCorner, images.tiles.path2, images.tiles.path3, images.tiles.path4,
			images.tiles.path5, images.tiles.path6, images.tiles.stairs1, images.tiles.stairs2, images.tiles.stairs3, null,
			images.tiles.wellTop, null, images.tiles.roofTileCorner, images.tiles.roofTileBottom, images.tiles.roofTileBottom, 
			images.tiles.roofTileBottomRightCorner, null, null, images.tiles.pathLeft, images.tiles.path1, images.tiles.pathRight,
			images.tiles.fence, images.tiles.fence2, images.tiles.fenceLeftCorner1, images.tiles.bigTree1, images.tiles.bigTree2,
			images.tiles.treeTop, images.tiles.rock1, images.tiles.rock2, images.tiles.bucket, images.tiles.wellBottom,
			images.tiles.well, null, null, null, null, null, null, images.tiles.pathBottomLeftCorner, images.tiles.pathBottom,
			images.tiles.pathBottomRightCorner, images.tiles.fenceRightCorner1, images.tiles.fenceRightCorner2, images.tiles.fenceLeftCorner2,
			images.tiles.bigTree3, images.tiles.bigTree4, images.tiles.treeBottom, images.tiles.flower1, images.tiles.flower2,
			images.tiles.stump, images.tiles.shrub, images.tiles.reedTop, null, null, null, null, null, null, null, null, null,
			null, null, null, null, null, null, images.tiles.smallBush, images.tiles.plant1, images.tiles.plant2, images.tiles.plant3,
			images.tiles.reedBottom, null, null, null, null, null, null
		];

		this.map = [];
		this.tileSize = 16;
		this.mapScale = 3;
		for(let i = 0; i < this.gameWidth / this.tileSize; i++)
		{
			this.map.push([]);
			for(let j = 0; j < this.gameHeight / this.tileSize; j++)
			{
				let tile = this.tileMappings[loadStateHandler.mapData[j][i]];
				this.map[i].push(tile);
			}
		}

		this.IMPASSIBLE_TILES = [
			images.tiles.bigTree3,
			images.tiles.bigTree4, images.tiles.cliff1, images.tiles.cliff2,
			images.tiles.cliff3, images.tiles.treeBottom,
			images.tiles.ironBar, images.tiles.fence, images.tiles.fence2,
			images.tiles.fenceLeftCorner1, images.tiles.fenceLeftCorner2, images.tiles.fenceRightCorner1,
			images.tiles.fenceRightCorner2, images.tiles.wellBottom, images.tiles.wellTop,
			images.tiles.well, images.tiles.roof,
			images.tiles.roofTileSide1, images.tiles.roofTileSide2, images.tiles.rootTileSide3,
			images.tiles.roofTop, images.tiles.bush1, images.tiles.bush2,
			images.tiles.bush3, images.tiles.bush4, images.tiles.bush5,
		];

		this.OVER_TILES = [
			images.tiles.bigTree1, images.tiles.bigTree2,
			images.tiles.roofBottomLeftCorner, images.tiles.roofEdgeLeft,
			images.tiles.roofEdgeRight, images.tiles.roofTileBottom,
			images.tiles.roofTileBottomRightCorner, images.tiles.roofTileCorner,
			images.tiles.roofTileLeft, images.tiles.roofTileRight,
			images.tiles.wellTop, images.tiles.treeTop
		];

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
		this.player = new Player(0, 0, 0.15, 0.15);
		this.cameraZoom = 30;
		this.minimapZoom = 5;

		this.hierachy = [];
		for(let i = 0; i < 10; i++) {
			this.hierachy.push(new Chicken(Math.random() * i, Math.random() * i, 0.07, 0.07));
		}
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
		update({name: "addFunction", key: "getArray", value: getArray, status: Status.GAME});
		update({name: "addFunction", key: "popArray", value: popArray, status: Status.GAME});
		update({name: "addFunction", key: "pushArray", value: pushArray, status: Status.GAME});
		update({name: "addFunction", key: "unshiftArray", value: unshiftArray, status: Status.GAME});
		update({name: "addFunction", key: "shiftArray", value: shiftArray, status: Status.GAME});
		update({name: "addFunction", key: "getAllMonsters", value: getAllMonsters, status: Status.GAME});
		update({name: "addFunction", key: "getMonsterName", value: getMonsterName, status: Status.GAME});
		update({name: "addFunction", key: "getMonsterLocation", value: getMonsterLocation, status: Status.GAME});
		update({name: "addFunction", key: "sizeArray", value: sizeArray, status: Status.GAME});
		update({name: "addFunction", key: "stopScript", value: stopScript, status: Status.GAME});
		update({name: "addFunction", key: "getLocation", value: getLocation, status: Status.GAME});
		update({name: "addFunction", key: "abs", value: abs, status: Status.GAME});
		update({name: "addFunction", key: "attack", value: attack, status: Status.GAME});


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
			case "entityDeath":
				for(let i = 0; i < this.hierachy.length; i++) {
					if(this.hierachy[i] === event.entity) {
						this.hierachy.splice(i, 1);
						break;
					}
				}
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
			["Attack", this.player.offense],
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
		this.miniCtx.fillStyle = "#83ac23";
		this.miniCtx.fillRect(0, 0, this.miniWidth, this.miniHeight);

		this.miniCtx.save();
		{
			this.miniCtx.translate(this.miniWidth / 2, this.miniHeight / 2);
			this.miniCtx.scale(1, -1);
			this.miniCtx.scale(this.minimapZoom, this.minimapZoom);

			// Camera
			this.miniCtx.translate(-this.player.transform.position.x, -this.player.transform.position.y);

			// Under Map
			this.miniCtx.save()
			{
				this.miniCtx.scale(1/this.minimapZoom, -1/this.minimapZoom);
				this.miniCtx.scale(1/this.mapScale, 1/this.mapScale);
				this.miniCtx.translate(-this.tileSize*this.mapScale * 1.5, 0);
				this.renderMap(this.miniCtx, this.minimapZoom * this.mapScale, "under");
			}
			this.miniCtx.restore();
			
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

			// Over Map
			this.miniCtx.save();
			{
				this.miniCtx.scale(1/this.minimapZoom, -1/this.minimapZoom);
				this.miniCtx.scale(1/this.mapScale, 1/this.mapScale);
				this.miniCtx.translate(-this.tileSize*this.mapScale * 1.5, 0);
				this.renderMap(this.miniCtx, this.minimapZoom * this.mapScale, "over");
			}
			this.miniCtx.restore();
		}
		this.miniCtx.restore();
	},
	renderGame() {
		this.ctx.fillStyle = "#83ac23";
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Render GUI

		this.ctx.save();
		{
			this.ctx.save();
			{
				this.ctx.translate(this.width/2, this.height/2);
				this.ctx.scale(1, -1);
				this.ctx.scale(this.cameraZoom, this.cameraZoom);

				// Camera
				this.ctx.translate(-this.player.transform.position.x, -this.player.transform.position.y);

				// Under Map
				this.ctx.save()
				{
					this.ctx.scale(1/this.cameraZoom, -1/this.cameraZoom);
					this.ctx.scale(this.mapScale, this.mapScale);
					this.renderMap(this.ctx, this.cameraZoom, "under");
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
							this.ctx.rotate(gameObject.transform.rotation);
							gameObject.render(this.ctx);
							this.ctx.restore();
						}
					}
				}
				this.ctx.restore();

				// Over Map
				this.ctx.save();
				{
					this.ctx.scale(1/this.cameraZoom, -1/this.cameraZoom);
					this.ctx.scale(this.mapScale, this.mapScale);
					this.renderMap(this.ctx, this.cameraZoom, "over");
				}
				this.ctx.restore();
			}
			this.ctx.restore();
		}
		this.ctx.restore();
	},
	renderMap(context, zoom, kind) {
		let left = context === this.ctx ? getScreenLeft() : getMinimapLeft();
		let right = context === this.ctx ? getScreenRight() : getMinimapRight();
		let top = context === this.ctx ? getScreenTop() : getMinimapTop();
		let bottom = context === this.ctx ? getScreenBottom() : getMinimapBottom();
		left = left < 0 ? left * zoom : left / zoom;
		right = right < 0 ? right / zoom : right * zoom;
		top = top < 0 ? top / zoom : top * zoom;
		bottom = bottom < 0 ? bottom * zoom : bottom / zoom;
		let topLeft = this.getMapLocation(left, top);
		let bottomRight = this.getMapLocation(right, bottom);
		for(let x = topLeft.x, xCounter = 0; x < bottomRight.x; x++, xCounter++) {
			for(let y = topLeft.y, yCounter = 0; y < bottomRight.y; y++, yCounter++) {
				if(this.map[x][y] != null) {
					// Under
					if(kind === "under") {
						let found = false;
						for(let i = 0; i < this.OVER_TILES.length; i++) {
							if(this.map[x][y] === this.OVER_TILES[i]) {
								found = true;
								break;
							}
							
						}
						if(!found) {
								context.drawImage(this.map[x][y], x * this.tileSize - this.gameWidth/2, y * this.tileSize - this.gameHeight/2, this.tileSize, this.tileSize);
						}
					}
					// Over
					else if(kind === "over") {
						for(let i = 0; i < this.OVER_TILES.length; i++) {
							if(this.map[x][y] === this.OVER_TILES[i]) {
								context.drawImage(this.map[x][y], x * this.tileSize - this.gameWidth/2, y * this.tileSize - this.gameHeight/2, this.tileSize, this.tileSize);
								break;
							}
						}
					}
				}
			}
		}
	},
	getMapTile(x, y) {
		let position = this.getMapLocation(x, y);
		return this.map[position.x][position.y];
	},
	getMapLocation(x, y) {
		y = -y;
		let middleX = this.gameWidth / this.tileSize / 2 - 1;
		let middleY = this.gameHeight / this.tileSize / 2 - 1;

		let adjustedX = middleX + Math.floor(x / this.tileSize);
		let adjustedY = middleY + Math.floor(y / this.tileSize);

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

		return {x:adjustedX, y:adjustedY};
	},
	getScreenEntities() {
		let entities = [];
		for(let i = 0; i < this.hierachy.length; i++) {
			if(this.hierachy[i].hasComponent(AttackComponent)) {
				if(this.hierachy[i].inScreen() && !(this.hierachy[i] instanceof Player)) {
					entities.push(this.hierachy[i]);
				}
			}
		}

		return entities;
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