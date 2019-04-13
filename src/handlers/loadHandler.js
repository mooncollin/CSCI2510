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

		totalImages = 0;
		loadedImages = 0;

		images = {};

		this.loadEquipmentImages(images);
		this.loadMiscImages(images);
		this.loadTileImages(images);

		let ke = Object.keys(images);

		for(let i = 0; i < ke.length; i++) {
			let subKeys = Object.keys(images[ke[i]]);
			totalImages += subKeys.length;
		}

		var imageLoadingInterval = setInterval(function() {
			if(totalImages === loadedImages) {
				clearInterval(imageLoadingInterval);
				update({name: "next"});
			}
		}, msBetweenFrames);
	},
	eventPump(event) {
		switch(event.name) {
			case "next":
				state = states.GAME_STATE;
				updateListeners.splice(updateListeners.indexOf(this), 1);
				updateStateHandler();
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
	},
	loadEquipmentImages(images) {
		images.equipment = {};
		images.equipment.background = new Image();
		images.equipment.background.onload = loadImage;
		images.equipment.background.src = 'images/equipment/equipmentBackground.png';
		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			images.equipment[EQUIPMENT_TYPES[i]] = new Image();
			images.equipment[EQUIPMENT_TYPES[i]].onload = loadImage;
			images.equipment[EQUIPMENT_TYPES[i]].src = 'images/equipment/' + EQUIPMENT_TYPES[i] + '.png';
		}

		// BODY ITEMS
		for(let i = 0; i < bodyItems.length; i++) {
			images.equipment[bodyItems[i]] = new Image();
			images.equipment[bodyItems[i]].onload = loadImage;
			images.equipment[bodyItems[i]].src = 'images/equipment/' + bodyItems[i] + '.png';
		}

		// FEET ITEMS
		for(let i = 0; i < feetItems.length; i++) {
			images.equipment[feetItems[i]] = new Image();
			images.equipment[feetItems[i]].onload = loadImage;
			images.equipment[feetItems[i]].src = 'images/equipment/' + feetItems[i] + '.png';
		}

		// LEG ITEMS
		for(let i = 0; i < legItems.length; i++) {
			images.equipment[legItems[i]] = new Image();
			images.equipment[legItems[i]].onload = loadImage;
			images.equipment[legItems[i]].src = 'images/equipment/' + legItems[i] + '.png';
		}
	},
	loadMiscImages(images) {
		images.misc = {};
		images.misc.select = new Image();
		images.misc.select.onload = loadImage;
		images.misc.select.src = 'images/highlight.png';
		images.misc.money = new Image();
		images.misc.money.onload = loadImage;
		images.misc.money.src = 'images/coins.png';
	},
	loadTileImages(images) {
		images.tiles = {};
		let tileImageNames = ['bigTree1', 'bigTree2', 'bigTree3', 'bigTree4', 'bucket', 'bush1', 
			'bush2', 'bush3', 'bush4', 'bush5', 'cave', 'clifEdge', 'cliff1', 'cliff2', 'cliff3', 
			'dirt', 'edge', 'edge2', 'edgeBottom', 'edgeBottomCorner', 'edgeBottomRight', 'edgeLeft', 
			'edgeLeftCorner', 'edgeRight', 'edgeRightCorner', 'edgeTop', 'fence', 'fence2', 
			'fenceLeftCorner1', 'fenceLeftCorner2', 'fenceRightCorner1', 'fenceRightCorner2', 'flower1', 
			'flower2', 'grass', 'grass1', 'grass2', 'grass3', 'grass4', 'grassLeft', 'grassMiddle', 
			'grassTop', 'ironBar', 'path2', 'path3', 'path4', 'path5', 'path6', 'pathBottom', 'pathBottomLeftCorner', 
			'pathBottomRightCorner', 'pathLeft', 'pathLeftTopCorner', 'pathRight1', 'pathRight2', 'pathRightTopCorner', 
			'pathTop', 'plant1', 'plant2', 'plant3', 'reedBottom', 'reedTop', 'rock1', 'rock2', 'roof', 
			'roofBottomLeftCorner', 'roofEdgeLeft', 'roofEdgeRight', 'roofTileBottom', 'roofTileBottomRightCorner', 
			'roofTileCorner', 'roofTileLeft', 'roofTileRight', 'roofTileSide1', 'roofTileSide2', 'roofTileSide3', 
			'roofTop', 'shrub', 'smallBush', 'stairs1', 'stairs2', 'stairs3', 'stone1', 'stone2', 'stone3', 'stone4', 
			'stump', 'tallGrass', 'tallGrassAround', 'tallGrassBottom', 'tallGrassEdge', 'tallGrassRight', 'tallGrassTop', 
			'tallGrassTopLeft', 'tallGrassTopRight', 'treeBottom', 'treeTop', 'water1', 'water2', 'well', 'wellBottom', 'wellTop'
		];

		for(let i = 0; i < tileImageNames.length; i++) {
			images.tiles[tileImageNames[i]] = new Image();
			images.tiles[tileImageNames[i]].onload = loadImage;
			images.tiles[tileImageNames[i]].src = 'tiles/' + tileImageNames[i] + '.png';
		}
	}
};

function loadImage() {
	loadedImages++;
}