function moveUp(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y += amount;
	return true;
}

function moveDown(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.y -= amount;
	return true;
}

function moveLeft(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x -= amount;
	return true;
}

function moveRight(amount=1) {
	let player = gameStateHandler.player;
	player.transform.position.x += amount;
	return true;
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
	let chatWindow = gameStateHandler.chatOutput;
	chatWindow.value += output;
	return true;
}

function println(output) {
	return print(output + "\n");
}

function printf(output, ...args) {
	let formatReg = /{}/;
	let indexFound = output.search(formatReg);
	let escapedAreas = [];
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
			escapedAreas.push(indexFound);
			output = output.slice(0, indexFound-1) + output.slice(indexFound+3);
		}

		indexFound = output.search(formatReg);
	}
	for(let i = 0; i < escapedAreas.length; i++) {
		output = output.slice(0, escapedAreas[i]-1) + "{}" + output.slice(escapedAreas[i]-2);
		console.log(output);
		for(let j = i+1; j < escapedAreas.length; j++) {
			escapedAreas[j] += 3;
		}
	}
	
	return print(output);
}

function clearChat() {
	let chatWindow = gameStateHandler.chatOutput;
	let previousString = chatWindow.value;
	chatWindow.value = "";
	return previousString != chatWindow.value;
}