// TODO: migrate to react

Array.prototype.group = function(getKey, getValue) {
	return this.reduce((obj, item, index, array) => {
		obj[getKey(item, index, array)] = getValue(item, index, array);
		return obj;
	}, {});
}

let textareaId;

$('input[data-input], textarea[data-output]').on('input', (ev) => {
	if (ev.target.tagName.toLowerCase() === 'textarea') {
		textareaId = ev.target.id;
	}

	if (!textareaId) return;

	const inputs = getInputs();

	const { total, stops, outputs } = parse(inputs, textareaId, $('#' + textareaId).val());

	$('textarea[data-output]')
		.filter((i, textarea) => textarea.id !== textareaId)
		.map((i, textarea) => textarea.value = outputs[textarea.id]);

	setProgress(stops, total);
	$('#code').val(getCode(inputs, outputs));
});

$('#excel').on('input', ev => {
	const circles = {};

	ev.target.value
		.trim()
		.split(/\r?\n/g)
		.filter(line => line.trim().length > 0)
		.map(line => {
			const fields = [ 'angle1', 'angle2', 'radius1', 'radius2' ];

			const inputs = {
				... getInputs(),

				...line.trim()
					.split(/\s+/g)
					.filter(value => value.trim().length > 0)
					.group((_, index) => fields[index], value => parseFloat(value))
			};

			(circles[`${inputs.radius1},${inputs.radius2}`] ||= []).push(inputs);
		});

		const codes = Object.values(circles).map(inputsArray => {
			const angles = inputsArray
				.map(inputs => `${inputs.angle1} ${inputs.angle2}`)
				.join(' ');

			const { total, stops, outputs } = parse(inputsArray[0], 'angles', `-0.001 ${angles} 0.001`);
			return getCode(inputsArray[0], outputs);
		})

		$('#code').val(codes.join('\n'));
});

// // test 1
// $('#radius1').val(348);
// $('#radius2').val(370);
// $('#stops').val('2 3 1 42 2 11 4 10 2 2 2 3 1 1 1 7 2 5 1 10 1 4 1 5 2 1 1 3').trigger('input');

// // test 2
// $('#excel').val(`
// -124.3	-127	54	74
// -36.2	-38.8	54	84
// -135.3	-138.3	60	84
// 138.7	136	60	84
// -74.6	-77.4	70	92
// 89	85.7	70	92
// -30.7	-33.6	70	102
// -82.7	-85.7	86	116
// 155.4	152.7	86	116
// -143.7	-146.5	92	120
// 8.3	5.5	92	120
// -20	-40	100	120
// -60	-80	100	120
// -74.6	-77.4	98	124
// 33	30.1	98	124
// -124.3	-127	120	148
// -60.7	-63.6	124	148
// -91	-93.9	124	148
// 166.5	163.7	124	148
// -168.7	-171.5	128	146
// -8.5	-14.2	126	152
// -22.2	-25.3	126	152
// -44.3	-50	126	152
// 136	133.3	126	152
// 113.8	111.1	128	156
// 94.3	91.3	128	156
// 72.2	69.1	128	156
// 66.5	63.6	128	156
// 47.1	44	128	156
// -71.8	-77.4	148	174
// -152.1	-154.8	148	174
// 35.8	33.2	156	174
// -2.8	-5.8	154	178
// -174.3	-176.9	154	178
// 161	158	154	178
// 52.5	49.7	156	180
// `).trigger('input');

function getInputs() {
	return $('input[data-input]')
		.toArray()
		.group(input => input.id, input => parseFloat(input.value));
}

function parse(inputs, id, value) {
	const total = {
		stops: inputs.sections,
		angles: 360,
		dashes: (inputs.radius1 + inputs.radius2) * Math.PI,
	};

	const stops = parseValues(id, value, total);

	const outputs = $('textarea[data-output]')
		.toArray()
		.group(textarea => textarea.id, textarea => combineValues(textarea.id, stops, total));

	return { total, stops, outputs };
}

function parseValues(textareaId, textareaValue, total) {
	const outputValues = textareaValue.trim()
		.split(/\s+/g)
		.map(str => parseFloat(str));

	if (outputValues.filter(outputValue => isNaN(outputValue)).length > 0) throw 'Invalid string';
	return toStops(textareaId, outputValues, total);
}

function combineValues(id, stops, total) {
	const outputValues = fromStops(id, stops, total);

	return outputValues
		.map(value => parseFloat(value.toFixed(1)))
		.join(' ');
}

function toStops(id, outputValues, total) {
	let prevRoundedStop = 0;

	return outputValues.map(outputValue => {
		const value = id === 'angles' ? fromAngleValue(outputValue) : outputValue;
		const stop = (value / total[id]) * total.stops;
		const roundedStop = Math.round(stop * 2) / 2;
		const result = id === 'angles' ? roundedStop - prevRoundedStop : roundedStop;
		prevRoundedStop = roundedStop;
		return result;
	});
}

function fromStops(id, stops, total) {
	let sum = 0;

	return stops.map(stop => {
		const value = (stop / total.stops) * total[id];
		const outputValue = id === 'angles' ? toAngleValue(sum + value) : value;
		sum += value;
		return outputValue;
	});
}

function fromAngleValue(angleValue) {
	return (360 - angleValue) % 360;
}

function toAngleValue(angle) {
	return 180 - (angle + 180) % 360;
}

function setProgress(stops, total) {
	const sum = stops.reduce((s, value) => s += value, 0);

	$('#progress')
		.attr('data-remain', (total.stops - sum));

	$('#progress #bar')
		.attr('data-total', sum + '/' + total.stops)
		.width(Math.min(100, (100 * sum / total.stops)) + '%')
		.css({ background: getColor(sum, total.stops) });
}

function getColor(sum, total) {
	if (sum < total) return 'dodgerblue';
	if (sum > total) return 'darkred';
	return 'green';
}

function getCode(inputs, outputs) {
	return `<circle r="${(inputs.radius1 + inputs.radius2) / 2}" stroke-width="${Math.abs(inputs.radius2 - inputs.radius1)}" stroke="${$('#stroke').val()}"
	data-stops="${outputs.stops}"
	stroke-dasharray="${outputs.dashes}"
/>`;
}
