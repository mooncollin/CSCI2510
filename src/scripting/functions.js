function move(x, y) {
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
	let chatWindow = gameStateHandler.chatOutput;
	chatWindow.value += output;
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
	chatWindow.value = "";
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