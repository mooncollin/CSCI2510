function randomColor() {
	let colorHex = "0123456789ABCDEF";
	let color = "#";

	for(let i = 0; i < 6; i++) {
		color += colorHex[Math.floor(Math.random() * colorHex.length)];
	}

	return color;
}

function border(canvas, color)
{
	let ctx = canvas.getContext("2d");
	let width = canvas.width;
	let height = canvas.height;
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(width, 0);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(width, 0);
	ctx.lineTo(width, height);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(width, height);
	ctx.lineTo(-width, height);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, height);
	ctx.lineTo(0, -height);
	ctx.stroke();
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}