function updateView() {
	if(!titleTemplate) {
		titleTemplate = document.getElementById("titleTemplate");
	}
	if(!loadTemplate) {
		loadTemplate = document.getElementById("loadTemplate");
	}

	var clone;
	if(state === states.TITLE_STATE) {
		clone = titleTemplate.content.cloneNode(true);
	}
	else if(state === states.LOAD_STATE) {
		clone = loadTemplate.content.cloneNode(true);
	}

	templateHere.innerHTML = "";
	templateHere.appendChild(clone);
}

function changeStats(button) {
	if(this.statButtons == null) {
		this.statButtons = []
		statButtons.push(document.getElementById("skills"));
		statButtons.push(document.getElementById("inventory"));
		statButtons.push(document.getElementById("equipment"));
		statButtons.push(document.getElementById("scripts"));
		statButtons.push(document.getElementById("stats"));
		statButtons.push(document.getElementById("settings"));
	}
	for(let i = 0; i < this.statButtons.length; i++) {
		this.statButtons[i].classList.remove("statsActive");
		this.statButtons[i].classList.add("hovered");
	}
	button.classList.add("statsActive");
	button.classList.remove("hovered");
}

var titleTemplate;