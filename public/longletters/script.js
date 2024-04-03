const zoomHX = 2;
const zoomHY = 80;
const width = 4;
const height = 6;
const space = 2;
const lineWidth = 1;
const blockWidth = 20;

const letters = {
	А: [[[0, 6], [2, 0], [4, 6]], [[1, 3], [3, 3]]],
	Б: [[[4, 0], [0, 0], [0, 6], [4, 6], [4, 3], [0, 3]]],
	В: [[[0, 3], [4, 2], [4, 0], [0, 0], [0, 6], [4, 6], [4, 4], [0, 3]]],
	Г: [[[4, 0], [0, 0], [0, 6]]],
	Д: [[[0, 6], [0, 5], [4, 5], [4, 6]], [[1, 5], [1, 0], [3, 0], [3, 5]]],
	Е: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
	Ё: [[[4, 1], [0, 1], [0, 6], [4, 6]], [[0, 3], [3, 3]], [[1, 0], [1.5, 0]], [[2.5, 0], [3, 0]]],
	Ж: [[[0, 0], [2, 3], [0, 6]], [[2, 0], [2, 6]], [[4, 0], [2, 3], [4, 6]]],
	З: [[[0, 0], [4, 0], [4, 2], [0, 3], [4, 4], [4, 6], [0, 6]]],
	И: [[[0, 0], [0, 6], [4, 0], [4, 6]]],
	Й: [[[0, 0], [0, 6], [4, 0], [4, 6]], [[1, 0], [3, 0]]],
	К: [[[0, 0], [0, 6]], [[4, 0], [0, 3], [4, 6]]],
	Л: [[[0, 6], [2, 0], [4, 6]]],
	М: [[[0, 6], [1, 0], [2, 6], [3, 0], [4, 6]]],
	Н: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
	О: [[[0, 0], [0, 6], [4, 6], [4, 0], [0, 0]]],
	П: [[[0, 6], [0, 0], [4, 0], [4, 6]]],
	Р: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3]]],
	С: [[[4, 1], [4, 0], [0, 0], [0, 6], [4, 6], [4, 5]]],
	Т: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
	У: [[[0, 0], [2, 3]], [[4, 0], [0, 6]]],
	Ф: [[[0, 0], [4, 0], [4, 3], [0, 3], [0, 0]], [[2, 0], [2, 6]]],
	Х: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
	Ц: [[[0, 0], [0, 5], [3, 5], [3, 0]], [[3, 5], [4, 5], [4, 6]]],
	Ч: [[[0, 0], [0, 3], [4, 3]], [[4, 0], [4, 6]]],
	Ш: [[[0, 0], [0, 6], [4, 6], [4, 0]], [[2, 0], [2, 6]]],
	Щ: [[[0, 0], [0, 5], [4, 5], [4, 0]], [[2, 0], [2, 5]], [[4, 5], [4, 6]]],
	Ъ: [[[0, 0], [1, 0], [1, 6], [4, 6], [4, 3], [1, 3]]],
	Ы: [[[0, 0], [0, 6], [2, 6], [2, 3], [0, 3]], [[4, 0], [4, 6]]],
	Ь: [[[0, 0], [0, 6], [4, 6], [4, 3], [0, 3]]],
	Э: [[[0, 0], [4, 0], [4, 6], [0, 6]], [[0, 3], [4, 3]]],
	Ю: [[[0, 0], [0, 6]], [[0, 3], [2, 3], [2, 0], [4, 0], [4, 6], [2, 6], [2, 3]]],
	Я: [[[0, 6], [4, 3], [0, 3], [0, 0], [4, 0], [4, 6]]],

	A: [[[0, 6], [2, 0], [4, 6]], [[1, 3], [3, 3]]],
	B: [[[0, 3], [4, 2], [4, 0], [0, 0], [0, 6], [4, 6], [4, 4], [0, 3]]],
	C: [[[4, 1], [4, 0], [0, 0], [0, 6], [4, 6], [4, 5]]],
	D: [[[4, 1], [3, 0], [0, 0], [0, 6], [3, 6], [4, 5], [4, 1]]],
	E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
	F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
	G: [[[4, 1], [4, 0], [0, 0], [0, 6], [4, 6], [4, 3], [2, 3]]],
	H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
	I: [[[2, 0], [2, 6]], [[0, 0], [4, 0]], [[0, 6], [4, 6]]],
	J: [[[0, 0], [4, 0], [4, 5], [3, 6], [1, 6], [0, 5], [0, 4]]],
	K: [[[0, 0], [0, 6]], [[4, 0], [0, 3], [4, 6]]],
	L: [[[0, 0], [0, 6], [4, 6]]],
	M: [[[0, 6], [1, 0], [2, 6], [3, 0], [4, 6]]],
	N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
	O: [[[0, 0], [0, 6], [4, 6], [4, 0], [0, 0]]],
	P: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3]]],
	R: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3], [4, 6]]],
	S: [[[0, 6], [4, 6], [4, 4], [0, 2], [0, 0], [4, 0]]],
	T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
	U: [[[0, 0], [0, 6], [4, 6], [4, 0]]],
	V: [[[0, 0], [2, 6], [4, 0]]],
	W: [[[0, 0], [1, 6], [2, 0], [3, 6], [4, 0]]],
	X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
	Y: [[[0, 0], [2, 3]], [[4, 0], [0, 6]]],
	Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],

	0: [[[0, 0], [0, 6], [4, 6], [4, 0], [0, 0]]],
	1: [[[0, 3], [4, 0], [4, 6]]],
	2: [[[0, 2], [0, 0], [4, 0], [4, 2], [0, 5], [0, 6], [4, 6]]],
	3: [[[0, 0], [4, 0], [4, 2], [0, 3], [4, 4], [4, 6], [0, 6]]],
	4: [[[0, 0], [0, 3], [4, 3]], [[4, 0], [4, 6]]],
	5: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]],
	6: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6], [0, 3]]],
	7: [[[0, 0], [4, 0], [0, 6]]],
	8: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]], [[0, 3], [4, 3]]],
	9: [[[0, 6], [4, 6], [4, 0], [0, 0], [0, 3], [4, 3]]],

	'.': [[[1.8, 6], [2.4, 6]]],
	',': [[[2.4, 5], [2.4, 5.5], [1.8, 6]]],
	':': [[[1.8, 0], [2.4, 0]], [[1.8, 6], [2.4, 6]]],
	';': [[[1.8, 0], [2.4, 0]], [[2.4, 5], [2.4, 5.5], [1.8, 6]]],
	'-': [[[0, 3], [4, 3]]],
	'!': [[[2, 0], [2, 5]], [[1.8, 6], [2.4, 6]]],
	'?': [[[0, 1], [0, 0], [4, 0], [4, 3], [2, 3], [2, 5]], [[1.8, 6], [2.4, 6]]],
}

function build(textH, textV){
	$('canvas').remove();
	const canvas = $('<canvas></canvas>').appendTo('.result').get(0);
	canvas.width = zoomHX * (width * textH.length + space * (textH.length - 1)) + lineWidth;
	canvas.height = zoomHY * height;

	const ctx = canvas.getContext("2d");
	ctx.lineWidth = lineWidth;

	for (const [index, letter] of Array.from(textH.toUpperCase()).entries()) {
		if (!letters[letter]) continue;
		ctx.beginPath();
		const beginX = zoomHX * index * (width + space) + lineWidth / 2;

		for (const line of letters[letter]) {
			const firstPoint = line[0];
			const x = zoomHX * firstPoint[0] + beginX;
			const y = zoomHY * firstPoint[1];
			let prevX = x;
			let prevY = y;
			ctx.moveTo(x, y);

			for (const point of line.slice(1)) {
				const x = zoomHX * point[0] + beginX;
				const y = zoomHY * point[1];
				ctx.lineTo(x, y);

				if (prevY === y) {
					const rectX = prevX + (x > prevX ? -1 : 1) * lineWidth / 2;
					const rectY = prevY - (blockWidth * y) / (height * zoomHY);
					const rectWidth = (x - prevX) * (1 + lineWidth / (width * zoomHX));
					ctx.fillRect(rectX, rectY, rectWidth, blockWidth);
				}

				prevX = x;
				prevY = y;
			}
		}

		ctx.stroke();
	}

	const zoomVX = Math.min(zoomHX, (canvas.height - lineWidth) / (width * textV.length + space * (textV.length - 1)));
	const zoomVY = canvas.width / height;

	for (const [index, letter] of Array.from(textV.toUpperCase()).entries()) {
		if (!letters[letter]) continue;
		ctx.beginPath();
		const beginX = zoomVX * index * (width + space) + lineWidth / 2;

		for (const line of letters[letter]) {
			const firstPoint = line[0];
			const x = zoomVX * firstPoint[0] + beginX;
			const y = zoomVY * firstPoint[1];
			let prevX = x;
			let prevY = y;
			ctx.moveTo(y, canvas.height - x);

			for (const point of line.slice(1)) {
				const x = zoomVX * point[0] + beginX;
				const y = zoomVY * point[1];
				ctx.lineTo(y, canvas.height - x);

				if (prevY === y) {
					const rectX = prevX + (x > prevX ? -1 : 1) * lineWidth / 2;
					const rectY = prevY - (blockWidth * y) / (height * zoomVY);
					const rectWidth = (x - prevX) * (1 + lineWidth / (width * zoomVX));
					ctx.fillRect(rectY, canvas.height - rectX, blockWidth, -rectWidth);
				}

				prevX = x;
				prevY = y;
			}
		}

		ctx.stroke();
	}
}

$('.text').on('input', () => {
	build($('.text[data-orientation="horizontal"]').val(), $('.text[data-orientation="vertical"]').val());
	return true;
}).focus();
