function main() {
	setInterval(timer, msBetweenFrames);
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
var msBetweenFrames = 1000 / 30;
var Time = {};
Time.deltaTime = msBetweenFrames / 1000;