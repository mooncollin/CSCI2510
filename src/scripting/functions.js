function move(x, y) {
	if(isNaN(x) || isNaN(y)) {
		return false;
	}
	return gameStateHandler.player.updateMove(x, y);
}

function clearVariables() {
	let previousLength = gameStateHandler.interpreterScript.variables.length;
	gameStateHandler.interpreterScript.variables = gameStateHandler.interpreterScript.variables.filter(v => v.status != Status.PLAYER && v.status != Status.INTERPRETER);
	return previousLength != gameStateHandler.interpreterScript.variables.length;
}

function clearWindow() {
	let previousLength = gameStateHandler.interpreterOutputArr.length;
	gameStateHandler.interpreterOutputArr = [];
	gameStateHandler.interpreterOutput.value = gameStateHandler.interpreterOutputArr.join("\n");
	return previousLength != gameStateHandler.interpreterOutputArr.length;
}

function print(output) {
	update({name: "chatOutput", output: output, clear: false});
	return true;
}

function println(output) {
	return print(output + "\n");
}

function printf(output, ...args) {
	output = String(output);
	let indexFound = output.indexOf("{}", 0);
	let argsCount = 0;
	while(indexFound != -1) {
		if(indexFound == 0 || output.charAt(indexFound - 1) != "\\") {
			if(argsCount + 1 > args.length) {
				return false;
			}
			output = output.slice(0, indexFound) + args[argsCount] + output.slice(indexFound + 2);
			argsCount++;
		}
		else {
			output = output.slice(0, indexFound-1) + output.slice(indexFound);
		}

		indexFound = output.indexOf("{}", indexFound+2);
	}
	
	return print(output);
}

function clearChat() {
	let chatWindow = gameStateHandler.chatOutput;
	let previousString = chatWindow.value;
	update({name: "chatOutput", output: null, clear: true});
	return previousString != chatWindow.value;
}

function equals(var1, var2) {
	return var1 === var2;
}

function help(functionName="") {
	functionName = functionName === 0 ? "" : functionName;
	let found = false;
	if(functionName != "") {
		for(let i = 0; i < gameStateHandler.functions.length; i++) {
			if(functionName === gameStateHandler.functions[i].name) {
				found = true;
				break;
			}
		}
	}
	else {
		found = true;
	}
	if(!found) {
		return false;
	}
	let helpWindow = window.open("scripting/help.html?functionName=" + functionName, "Help");
	return true;
}

function selectedEquipment() {
	let result = gameStateHandler.player.getSelectedEquipment();
	return result === null || result.name === "Nothing" ? "" : result.name;
}

function selectedInventory() {
	let result = gameStateHandler.player.getSelectedInventory();
	return result === null ? "" : result.name;
}

function selectEquipment(select) {
	if(typeof select === "string") {
		for(let i = gameStateHandler.player.selectedEquipment; i < EQUIPMENT_TYPES.length; i++) {
			if(gameStateHandler.player.equipment[EQUIPMENT_TYPES[i]]
				&& gameStateHandler.player.equipment[EQUIPMENT_TYPES[i]].name === select) {
				gameStateHandler.player.selectedEquipment = i;
				update({name: "statChange"});
				return true;
			}
		}
		for(let i = 0; i < gameStateHandler.player.selectedEquipment; i++) {
			if(gameStateHandler.player.equipment[EQUIPMENT_TYPES[i]]
				&& gameStateHandler.player.equipment[EQUIPMENT_TYPES][i].name === select) {
				gameStateHandler.player.selectedEquipment = i;
				update({name: "statChange"});
				return true;
			}
		}
	}
	else if(typeof select === "number") {
		if(select >= 0 && select < EQUIPMENT_TYPES.length) {
			gameStateHandler.player.selectedEquipment = select;
			update({name: "statChange"});
			return true;
		}
	}

	return false;
}

function selectInventory(select) {
	if(typeof select === "string") {
		for(let i = gameStateHandler.player.selectedInventory; i < gameStateHandler.player.inventory.items.length; i++) {
			if(gameStateHandler.player.inventory.items[i]
				&& gameStateHandler.player.inventory.items[i].name === select) {
					gameStateHandler.player.selectedInventory = i;
					update({name: "statChange"});
					return true;
			}
		}
		for(let i = 0; i < gameStateHandler.player.selectedInventory; i++) {
			if(gameStateHandler.player.inventory.items[i]
				&& gameStateHandler.player.inventory.items[i].name === select) {
					gameStateHandler.player.selectedInventory = i;
					update({name: "statChange"});
					return true;
			}
		}
	}
	else if(typeof select === "number") {
		if(select >= 0 && select < gameStateHandler.player.inventory.items.length) {
			gameStateHandler.player.selectedInventory = select;
			update({name: "statChange"});
			return true;
		}
	}

	return false;
}

function unequip() {
	if(!gameStateHandler.player.canInventoryPut(gameStateHandler.player.selectedInventory)) {
		return false;
	}
	let item = gameStateHandler.player.equipmentRemove(EQUIPMENT_TYPES[gameStateHandler.player.selectedEquipment]);
	if(item === null) {
		return false;
	}

	let result = gameStateHandler.player.inventoryPut(item, gameStateHandler.player.selectedInventory);
	update({name: "statChange"});
	return result;
}

function equip() {
	let invenSlot = gameStateHandler.player.selectedInventory;
	if(!gameStateHandler.player.canEquipmentPut(gameStateHandler.player.inventory.items[invenSlot])) {
		return false;
	}

	let item = gameStateHandler.player.inventoryRemove(invenSlot);
	if(item === null) {
		return false;
	}

	let result = gameStateHandler.player.equipmentPut(item);
	update({name: "statChange"});
	return result;
}

function openScript(name) {
	let script = gameStateHandler.player.getScript(name);

	if(script === null) {
		return false;
	}

	if(gameStateHandler.openedScript != null) {
		closeScript();
	}

	gameStateHandler.textareaSection.innerHTML = "";
	gameStateHandler.textareaSection.appendChild(gameStateHandler.scriptTemplate.content.cloneNode(true));
	gameStateHandler.scriptOutput = document.getElementById("script");
	gameStateHandler.scriptOutput.value = script.code;
	gameStateHandler.openedScript = script;

	return true;
}

function closeScript() {
	if(gameStateHandler.openedScript === null) {
		return false;
	}

	gameStateHandler.openedScript.setCode(gameStateHandler.scriptOutput.value);
	gameStateHandler.textareaSection.innerHTML = "";
	gameStateHandler.textareaSection.appendChild(gameStateHandler.interpreterTemplate.content.cloneNode(true));
	gameStateHandler.interpreterOutput = document.getElementById("textarea");
	update({name: "interpreterOutput", output:null});
	gameStateHandler.openedScript = null;

	return true;
}

function executeScript(name) {
	let script = gameStateHandler.player.getScript(name);

	if(script === null) {
		return false;
	}

	let errors = script.execute();
	if(errors.length > 0) {
		update({name: "interpreterOutput", output: "'" + script.name + "' Errors:"});
	}
	for(let i = 0; i < errors.length; i++) {
		scriptCallback(errors[i], null, "\t", " - line " + errors[i].lineNum);
	}

	return errors.length === 0;
}

function getArray(arr, index) {
	return arr[index];
}

function popArray(arr) {
	return arr.pop();
}

function pushArray(arr, item) {
	return arr.push(item);
}

function unshiftArray(arr, item) {
	return arr.unshift(item);
}

function shiftArray(arr) {
	return arr.shift();
}

function getAllMonsters() {
	let monsters = gameStateHandler.getScreenEntities();
	let monsterIds = [];
	for(let i = 0; i < monsters.length; i++) {
		monsterIds.push(monsters[i].id);
	}

	return monsterIds;
}

function getMonsterName(id) {
	let monsters = gameStateHandler.getScreenEntities();
	for(let i = 0; i < monsters.length; i++) {
		if(id === monsters[i].id) {
			return monsters[i].name;
		}
	}

	return "";
}

function getMonsterLocation(id) {
	let monsters = gameStateHandler.getScreenEntities();
	for(let i = 0; i < monsters.length; i++) {
		if(id === monsters[i].id) {
			return [monsters[i].transform.position.x, monsters[i].transform.position.y];
		}
	}

	return []
}

function sizeArray(arr) {
	return arr.length;
}

function getLocation() {
	return [gameStateHandler.player.transform.position.x, gameStateHandler.player.transform.position.y];
}

function stopScript(scriptName) {
	let script = gameStateHandler.player.getScript(scriptName);
	if(script === null) {
		return false;
	}

	let running = script.running;
	script.running = false;

	return running;
}

function abs(number) {
	return Math.abs(number);
}

function attack() {
	return gameStateHandler.player.attack();
}