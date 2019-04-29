class Entity extends GameObject {
	constructor(name, xPosition=0, yPosition=0, xScale=1, yScale=1) {
		super(name, xPosition, yPosition, xScale, yScale);

		this.speed = 0;
		this.level = 1;
		this.health = 1;
		this.inventory = {
			"money" : 0,
			"items" : []
		};

		this.spawnRate = 1000;

		this.components.push(new MoveComponent(this));
	}

	update() {
		if(this.health <= 0) {
			this.alreadySpawned = false;
			let deathInterval = setInterval((function() {
				this.transform.rotation -= .05;
				if(this.transform.rotation <= -1.5) {
					clearInterval(deathInterval);
					update({name: "entityDeath", entity: this});
					if(this.spawnRate >= 0 && !this.alreadySpawned) {
						this.alreadySpawned = true;
						setTimeout((function() {
							let spawnLocation = newSpawnLocation(this.transform.position.x, this.transform.position.y);
							gameStateHandler.hierachy.unshift(new this.constructor(spawnLocation.x, spawnLocation.y, this.transform.scale.x, this.transform.scale.y));
						}).bind(this), this.spawnRate);
					}
				}
			}).bind(this), msBetweenFrames);
		}
		super.update();
	}
}

function newSpawnLocation(x, y) {
	let newX = x;
	let newY = y;
	newX += Math.random() * 3 * (Math.random() >= .5 ? -1 : 1);
	newY += Math.random() * 3 * (Math.random() >= .5 ? -1 : 1);

	let spawnedOnTile = gameStateHandler.getMapLocation(newX, newY);
	if(gameStateHandler.map[spawnedOnTile.x][spawnedOnTile.y] != undefined) {
		for(let i = 0; i < gameStateHandler.IMPASSIBLE_TILES.length; i++) {
			if(gameStateHandler.map[spawnedOnTile.x][spawnedOnTile.y] === gameStateHandler.IMPASSIBLE_TILES[i]) {
				newX = x;
				newY = y;
				break;
			}
		}
	}

	return {x: newX, y: newY};
}