class Line {
	text = '';
	selected = ko.observable(false);
	invalid = ko.observable(false);

	constructor(text) {
		this.text = text;
	}

	toggle = function(_el, ev) {
		if (ev.keyCode && !(ev.keyCode === 10 || ev.keyCode === 13 || ev.keyCode === 32)) {
			return true;
		}

		this.selected(!this.selected());
		model.validate();
	};

	static sort = function(line1, line2) {
		if (line1.text > line2.text) {
			return 1;
		}

		if (line1.text < line2.text) {
			return -1;
		}

		return 0;
	}
}

class Model {
	text = ko.observable('');
	lines = ko.observableArray([]);
	hiddenLines = ko.observableArray([]);

	empty = ko.computed(() => this.lines().length === 0 && this.hiddenLines().length === 0);

	add() {
		const text = prompt();
		if (!text) return;

		const entities = [];

		const paragraphs = text.split(/\n+/).map(line => line.trim()).filter(line => line);

		for (let paragraph of paragraphs) {
			if (!paragraph.match(/[\.!]$/)) {
				paragraph += '.';
			}

			paragraph = paragraph
				.replace(/^...\S+?: /, '') // strip sign
				.replace('\ufe0f', '') // emoji variation selector
				.replace('\ufe0e', '') // emoji variation selector
				.replace(/(".*?")|(«.*?»)/g, (entity) => {
					entities.push(entity);
					return `[ENTITY${entities.length - 1}]`;
				});

			const sentences = paragraph.split(/(?<=[\.!])\s+(?=([^A-Za-z0-9А-Яа-яЁё]*)[A-ZА-ЯЁ])/).filter(s => s);

			for (const sentence of sentences) {
				const line = new Line(sentence.replace(/\[ENTITY(\d+)\]/, (_entity, index) => entities[index]));
				this.lines.push(line);
			}
		}
	}

	validate() {
		const keys = {};
		this.lines().forEach(line => line.invalid(false));

		this.lines().forEach(line => {
			if (!line.selected()) {
				line.invalid(false);
				return;
			}

			const key = line.text.split(' ')[0];
			keys[key] = keys[key] || [];
			keys[key].push(line);

			if (keys[key].length > 1) {
				keys[key].forEach(line => line.invalid(true));
			}
		});
	}

	filter() {
		const selectedLines = [];

		for (const line of this.lines()) {
			if (line.selected()) {
				line.selected(false);
				selectedLines.push(line);
			} else {
				this.hiddenLines.push(line);
			}
		}

		this.lines(selectedLines);
	}

	invert() {
		const lines = this.hiddenLines();
		this.hiddenLines([...this.lines()]);
		this.lines(lines);
	}

	sort() {
		this.lines(this.lines().sort(Line.sort));
	}

	daySort() {
		const markers = [
			['Сегодня', 'Этот день', 'Начните день', 'В начале дня', 'День начнется', 'День начнётся', 'Утро', 'С утра', 'С раннего утра'],
			[],
			['Днем', 'Днём'],
			[],
			['Во второй половине дня'],
			[],
			['Вечер'],
			[],
			['Ночь']
		];

		const blocks = markers.map(markerBlock => markerBlock.map(() => []));
		const nonMarkedLines = [];

		this.lines().forEach(line => {

			for (const i in markers) {
				const index = markers[i].findIndex(marker => line.text.startsWith(marker));

				if (index > -1) {
					blocks[i][index].push(line);
					return;
				}
			}

			nonMarkedLines.push(line);
		});

		nonMarkedLines.sort(Line.sort);

		for (const i in blocks) {
			blocks[i] = blocks[i].flat().sort(Line.sort);
		}

		const filteredBlocks = blocks.filter((block, i) => i === 0 || !(blocks[i].length === 0 && blocks[i - 1].length === 0));
		const emptyBlocksCount = filteredBlocks.filter(block => block.length === 0).length;
		const fill = Math.ceil(nonMarkedLines.length / emptyBlocksCount);

		const sortedLines = [];
		let e = 0;

		for (const block of filteredBlocks) {
			if (block.length > 0) {
				sortedLines.push(...block);
			} else {
				sortedLines.push(...nonMarkedLines.slice(fill * e, fill * (e++ + 1)));
			}
		}

		this.lines(sortedLines);
	}

	copy() {
		const text = this.lines().map(line => line.text).join(' ');
		navigator.clipboard.writeText(text);
	}

	reset() {
		if (!confirm('Are you sure?')) return;
		this.lines([]);
	}
}

const model = new Model();
ko.applyBindings(model, document.body);
