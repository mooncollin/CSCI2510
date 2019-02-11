function main() {
	setInterval(timer, 1000 / 30);
}

function timer() {
	update({name: "timer"});
}

function update(event) {
	for(let i = 0; i < updateListeners.length; i++) {
		updateListeners[i].eventPump(event);
	}
}

var updateListeners = [];