function updateView() {
	if(!titleTemplate) {
		titleTemplate = document.getElementById("titleTemplate");
	}
	if(!loadTemplate) {
		loadTemplate = document.getElementById("loadTemplate");
	}
	if(!gameTemplate) {
		gameTemplate = document.getElementById("gameTemplate");
	}

	var clone;
	if(state === states.TITLE_STATE) {
		clone = titleTemplate.content.cloneNode(true);
	}
	else if(state === states.LOAD_STATE) {
		clone = loadTemplate.content.cloneNode(true);
	}
	else if(state === states.GAME_STATE) {
		clone = gameTemplate.content.cloneNode(true);
	}

	templateHere.innerHTML = "";
	templateHere.appendChild(clone);
}