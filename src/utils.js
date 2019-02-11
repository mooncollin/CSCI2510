function randomColor() {
	let colorHex = "0123456789ABCDEF";
	let color = "#";

	for(let i = 0; i < 6; i++) {
		color += colorHex[Math.floor(Math.random() * colorHex.length)];
	}

	return color;
}