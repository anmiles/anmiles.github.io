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

class Section {
	lines = ko.observableArray([]);

	constructor(text) {
		if (!text.match(/[\.!]$/)) {
			text += '.';
		}

		const entities = [];

		text
			.replace(/^...\S+?: /, '') // strip sign
			.replace('\ufe0f', '') // emoji variation selector
			.replace('\ufe0e', '') // emoji variation selector
			.replace(/(".*?")|(«.*?»)/g, (entity) => {
				entities.push(entity);
				return `[ENTITY${entities.length - 1}]`;
			}).split(/(?<=[\.!])\s+(?=([^A-Za-z0-9А-Яа-яЁё]*)[A-ZА-ЯЁ])/).filter(s => s).forEach(text => {
				const line = new Line(text.replace(/\[ENTITY(\d+)\]/, (_entity, index) => entities[index]));
				this.lines.push(line);
				model.lines.push(line);
			});
	}
}

class Model {
	mode = ko.observable('');
	text = ko.observable('');
	sections = ko.observableArray([]);
	lines = ko.observableArray([]);
	selectedLines = ko.observableArray([]);
	inverted = ko.observable(false);

	modes = [ 'input', 'select', 'result' ];

	result = ko.computed(() => {
		const resultLines = this.inverted()
			? this.lines().filter(line => !this.selectedLines().includes(line))
			: this.selectedLines();

		return resultLines.map(line => line.text).join(' ');
	});

	constructor() {
		this.mode('input');
		this.mode.subscribe(newMode => history.pushState({}, null, '#' + newMode));
	}

	parse(_el, ev) {
		if (ev.keyCode && !(ev.ctrlKey && (ev.keyCode === 10 || ev.keyCode === 13))) {
			return true;
		}

		this.mode('select');
		this.lines([]);
		const textArray = this.text().split(/\n+/).filter(text => text.trim());
		textArray.forEach(text => this.sections.push(new Section(text.trim())));
		return false;
	};

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
	};

	submit() {
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

		const blocks = markers.map(section => section.map(marker => []));
		const secondaryLines = [];

		this.lines().filter(line => line.selected()).forEach(line => {
			for (const i in markers) {
				const index = markers[i].findIndex(marker => line.text.startsWith(marker));

				if (index > -1) {
					blocks[i][index].push(line);
					return;
				}
			}

			secondaryLines.push(line);
		});

		secondaryLines.sort(Line.sort);

		for (const i in blocks) {
			blocks[i] = blocks[i].flat().sort(Line.sort);
		}

		const filteredBlocks = blocks.filter((block, i) => i === 0 || !(blocks[i].length === 0 && blocks[i - 1].length === 0));
		const emptyBlocksCount = filteredBlocks.filter(block => block.length === 0).length;
		const fill = Math.ceil(secondaryLines.length / emptyBlocksCount);

		this.selectedLines([]);
		let e = 0;

		for (const block of filteredBlocks) {
			if (block.length > 0) {
				this.selectedLines.push(...block);
			} else {
				this.selectedLines.push(...secondaryLines.slice(fill * e, fill * (e++ + 1)));
			}
		}

		this.mode('result');
	};

	back() {
		const newIndex = this.modes.indexOf(this.mode()) - 1;
		this.mode(this.modes[Math.max(newIndex, 0)]);
	};

	selectAll() {

	}

	invert (_model, ev) {
		switch (this.mode()) {
			case 'select':
				this.lines().forEach(line => line.toggle(line, ev));
				break;

			case 'result':
				this.inverted(!this.inverted());
				break;
		}
	};

	copy() {
		navigator.clipboard.writeText(this.result());
	};

	reset() {
		if (!confirm('Are you sure?')) return;
		this.mode('input');
		this.text('');
		this.selectedLines([]);
		this.sections([]);
		this.lines([]);
		this.inverted(false);
	};
}

const model = new Model();
ko.applyBindings(model, document.body);
