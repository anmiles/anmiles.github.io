String.prototype.format = function(){
	if (arguments.length === 0) return this;

	let data;
	if (arguments.length > 1) data = arguments;
	else if (typeof arguments[0] == 'object') data = arguments[0];
	else data = arguments;

	return this.split('{{').map(function(q){
		return q.replace(/(\{([^}]+)\})+/g, function(){
			let copy = data;
			arguments[2].split('.').map(function(str){
				copy = copy[str];
			});
			return copy;
		});
	}).join('{').replace(/\}\}/g, '}');
};

Array.prototype.unique = function() {
	return this.filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
};

(function(sort) {
	Array.prototype.sort = function() {
		var fields = Array.prototype.slice.call(arguments);
		if (typeof fields[0] === 'function') return sort.apply(this, fields);
		if (typeof fields[0] === 'boolean') fields = [{'': fields[0]}];
		if (Array.isArray(fields[0])) fields = fields[0];

		return this.sort(function(item1, item2) {
			for (var i = 0; i < fields.length; i ++) {
				var field = fields[i];
				var asc = true;
				var options = {};
				var val1 = item1;
				var val2 = item2;

				if (typeof field === 'object') {
					options = field;
					asc = Object.values(field)[0];
					field = Object.keys(field)[0];
				}

				if (typeof field !== 'object') {
					field = [field];
				}

				for (var j = 0; j < field.length; j ++) if (field[j] !== '') {
					val1 = val1[field[j]];
					val2 = val2[field[j]];
				}

				if (typeof val1 === 'function') {
					val1 = val1();
				}

				if (typeof val2 === 'function') {
					val2 = val2();
				}

				if (options.ignoreCase) {
					val1 = val1.toString().toLowerCase();
					val2 = val2.toString().toLowerCase();
				}

				if (options.find) {
					val1 = val1.toString().replace(options.find, options.replace);
					val2 = val2.toString().replace(options.find, options.replace);
				}

				if (val2 < val1) return asc ? 1 : -1;
				if (val2 > val1) return asc ? -1 : 1;
			}

			if (fields.length === 0) {
				if (item2 < item1) return 1;
				if (item2 > item1) return -1;
			}

			return 0;
		});
	};
})(Array.prototype.sort);

const dlcs = {
	'': {
		key: '',
		title: '',
		zoom: 3,
		background: '#1d1d1d',
		default: true,
		ready: 0.98,
	},
	far_harbor: {
		key: 'far_harbor',
		title: '(Far Harbor)',
		background: '#201c20',
		zoom: 3,
		ready: 1,
	},
	nuka_world: {
		key: 'nuka_world',
		title: '(Nuka World)',
		background: '#282420',
		zoom: 3,
		ready: 0,
	},
	zone: {
		key: 'zone',
		title: '(Zone)',
		background: '#666666',
		zoom: 3,
		ready: 1,
	}
}

const langs = {
	ru: {
		key: 'ru',
		title: 'Russian',
		load: 'Загрузить',
		save: 'Сохранить',
		delete: 'Удалить',
		addPoint: 'Добавить метку',
		copyPoints: 'Копировать метки',
		confirmMove: 'Переместить метку?',
		search: 'Поиск',
		filter: 'Фильтр',
		visited: 'Посещённые',
		unvisited: 'Непосещённые',
		underConstruction: 'Карта находится в разработке ({0}% готово)'
	},
	en: {
		key: 'en',
		title: 'English',
		load: 'Load',
		save: 'Save',
		delete: 'Delete',
		addPoint: 'Add point',
		copyPoints: 'Copy points',
		confirmMove: 'Move point?',
		search: 'Search',
		filter: 'Filter',
		visited: 'Visited',
		unvisited: 'Unvisited',
		underConstruction: 'The map is under construction ({0}% finished)'
	},
};

const dlc = getFromQueryString('dlc', dlcs);
const lang = getFromQueryString('lang', langs) || langs[['ru', 'uk', 'be', 'kk'].indexOf(navigator.language) === -1 ? 'en' : 'ru'];

const meta = {
	base: { key: 'fallout4map', title: 'Fallout 4' },
	data: { dlc, lang },
};

const game = { ...dlc };
game.key = [ meta.base.key, meta.data.dlc.key ].filter(k => k).join('_');
game.title = [ meta.base.title, meta.data.dlc.title ].filter(k => k).join(' ');

const editable = !!localStorage[meta.base.key + '-editMode'];

const queryString = Object.keys(meta.data).filter(id => meta.data[id].key).map(id => `${id}=${meta.data[id].key}`).join('&');

history.replaceState(null, document.title, `?${queryString}`);
$('#map').css({ background: game.background });

const points = {};
const markers = {};
const lostPoints = {};

let mappings = {};
let markersCount = 0;
let hasHidden = false;

const model = {
	showVisited: ko.observable(true),
	showUnvisited: ko.observable(true),
};

model.showVisited.subscribe(() => searchPanel.search());
model.showUnvisited.subscribe(() => searchPanel.search());

const hidden = JSON.parse(localStorage[game.key + '-hidden'] || '{ "types": [], "icons": [] }');

const types = [
	{ name: "all", className: "icon-all", titles: { en: "All", ru: "Все" }},
	{ name: "collectible", className: "icon-collectible", titles: { en: "Collectibles", ru: "Коллекции" }},
	{ name: "pickup", className: "icon-pickup", titles: { en: "Pickups", ru: "Предметы" }},
	{ name: "location", className: "icon-location", titles: { en: "Locations", ru: "Локации" }},
	{ name: "unmarked", className: "icon-unmarked", titles: { en: "Unmarked locations", ru: "Неотмечаемые локации" }},
].map(type => {
	type.icons = [];
	type.points = ko.observableArray([]);
	type.title = type.titles[lang.key];
	type.toggle = toggleType;
	type.enabled = ko.observable(hidden.types.indexOf(type.name) === -1);
	type.count = ko.computed(() => type.points().filter(point => point.checked()).length);
	type.search = () => {
		searchPanel.visible(true);
		searchPanel.text('');
		searchPanel.type(type);
		searchPanel.search();
	};
	return type;
});

const typesObject = types.reduce((obj, type) => {
	obj[type.name] = type;
	return obj;
}, {});

const icons = [
	{ name: "bobblehead", className: "icon-bobblehead", type: "collectible", titles: { en: "Bobblehead", ru: "Пупс" } },
	{ name: "building", className: "icon-building", type: "location", titles: { en: "Building", ru: "Здание" } },
	{ name: "bunker", className: "icon-bunker", type: "location", titles: { en: "Bunker", ru: "Бункер" } },
	{ name: "camper", className: "icon-camper", type: "location", titles: { en: "Camper", ru: "Трейлерный парк" } },
	{ name: "cave", className: "icon-cave", type: "location", titles: { en: "Cave", ru: "Пещера" } },
	{ name: "church", className: "icon-church", type: "location", titles: { en: "Church", ru: "Церковь" } },
	{ name: "encampment", className: "icon-encampment", type: "location", titles: { en: "Encampment", ru: "Лагерь" } },
	{ name: "factory", className: "icon-factory", type: "location", titles: { en: "Factory", ru: "Фабрика" } },
	{ name: "farm", className: "icon-farm", type: "location", titles: { en: "Farm", ru: "Ферма" } },
	{ name: "filling-station", className: "icon-filling-station", type: "location", titles: { en: "Filling station", ru: "Заправочная станция" } },
	{ name: "fusion-core", className: "icon-fusion-core", type: "pickup", titles: { en: "Fusion core", ru: "Ядерный блок" } },
	{ name: "graveyard", className: "icon-graveyard", type: "location", titles: { en: "Graveyard", ru: "Кладбище" } },
	{ name: "holotape", className: "icon-holotape", type: "collectible", titles: { en: "Holotape", ru: "Голодиск" } },
	{ name: "hospital", className: "icon-hospital", type: "location", titles: { en: "Hospital", ru: "Больница" } },
	{ name: "junkyard", className: "icon-junkyard", type: "location", titles: { en: "Junkyard", ru: "Свалка" } },
	{ name: "metro", className: "icon-metro", type: "location", titles: { en: "Metro", ru: "Метро" } },
	{ name: "military-base", className: "icon-military-base", type: "location", titles: { en: "Military base", ru: "Военная база" } },
	{ name: "mini-nuke", className: "icon-mini-nuke", type: "pickup", titles: { en: "Mini nuke", ru: "Ядерный минизаряд" } },
	{ name: "nuka-cherry", className: "icon-nuka-cherry", type: "pickup", titles: { en: "Nuka cherry", ru: "Ядер-вишня" } },
	{ name: "nuka-cola", className: "icon-nuka-cola", type: "pickup", titles: { en: "Nuka cola", ru: "Квантовая ядер-кола" } },
	{ name: "perk-magazine", className: "icon-perk-magazine", type: "collectible", titles: { en: "Perk magazine", ru: "Журнал" } },
	{ name: "pier", className: "icon-pier", type: "location", titles: { en: "Pier", ru: "Пирс" } },
	{ name: "poi", className: "icon-poi", type: "location", titles: { en: "Other", ru: "Прочее" } },
	{ name: "police-station", className: "icon-police-station", type: "location", titles: { en: "Police station", ru: "Полицейский участок" } },
	{ name: "pond-lake", className: "icon-pond-lake", type: "location", titles: { en: "Pond/lake", ru: "Озеро/пруд" } },
	{ name: "power-armor", className: "icon-power-armor", type: "pickup", titles: { en: "Power armor", ru: "Силовая броня" } },
	{ name: "quarry", className: "icon-quarry", type: "location", titles: { en: "Quarry", ru: "Карьер" } },
	{ name: "radio-tower", className: "icon-radio-tower", type: "location", titles: { en: "Radio tower", ru: "Радиовышка" } },
	{ name: "radioactive-area", className: "icon-radioactive-area", type: "location", titles: { en: "Radioactive area", ru: "Радиоактивная область" } },
	{ name: "railroad", className: "icon-railroad", type: "location", titles: { en: "Railroad", ru: "Ж/д станция" } },
	{ name: "ruins", className: "icon-ruins", type: "location", titles: { en: "Ruins", ru: "Руины" } },
	{ name: "satellite", className: "icon-satellite", type: "location", titles: { en: "Satellite", ru: "Спутниковая антенна" } },
	{ name: "school", className: "icon-school", type: "location", titles: { en: "School", ru: "Школа" } },
	{ name: "settlement", className: "icon-settlement", type: "location", titles: { en: "Settlement", ru: "Поселение" } },
	{ name: "shipwreck", className: "icon-shipwreck", type: "location", titles: { en: "Ship", ru: "Корабль" } },
	{ name: "town", className: "icon-town", type: "location", titles: { en: "Town", ru: "Город" } },
	{ name: "unmarked", className: "icon-unmarked", type: "unmarked", titles: { en: "Unmarked location", ru: "Неотмечаемая локация" } },
	{ name: "vault", className: "icon-vault", type: "location", titles: { en: "Vault", ru: "Убежище" } },
	{ name: "weapon", className: "icon-weapon", type: "pickup", titles: { en: "Weapon", ru: "Оружие" } },
].map((icon) => {
	icon.points = ko.observableArray([]);
	icon.title = icon.titles[lang.key];
	icon.all = icon.all || false;
	icon.className = typesObject[icon.type].className + ' ' + icon.className;
	icon.toggle = toggleIcon;
	icon.enabled = ko.observable(hidden.icons.indexOf(icon.name) === -1);
	icon.count = ko.computed(() => icon.points().filter(point => point.checked()).length);
	icon.search = function(){
		searchPanel.visible(true);
		searchPanel.text('');
		searchPanel.icon(icon);
		searchPanel.search();
	};
	typesObject[icon.type].icons.push(icon);
	return icon;
}).sort({ title: true, ignoreCase: true });

const iconsObject = icons.reduce((obj, icon) => {
	obj[icon.name] = icon;
	return obj;
}, {});

types.forEach(type => type.icons = type.icons.sort({ title: true, ignoreCase: true }));

function toggleType(type, ev, save) {
	if (type.name === 'all') {
		types.forEach(type1 => {
			if (type1.name === 'all') return;
			type1.enabled(type.enabled());
			toggleType(type1, ev, false);
		});
		if (save !== false) saveAll();
		return true;
	}

	Object.values(type.icons).forEach(icon => {
		icon.enabled(type.enabled());
		toggleIcon(icon, ev, false);
	});
	if (save !== false) saveAll();
	return true;
}

function toggleIcon(icon, ev, save) {
	icon.points().forEach(point => point.enabled(icon.enabled()));
	if (save !== false) saveAll();
	return true;
}

const progress = {
	total: ko.observable(0),
	visited: ko.observable(0),
};

progress.update = () => {
	const pointCollection = Object.values(points);
	progress.total(pointCollection.length);
	progress.visited(pointCollection.filter((point) => point.visited()).length);
};

progress.text = ko.computed(() => {
	const value = Math.floor(100 * progress.visited() / progress.total());
	return value + '%';
});

const map = L.map('map', {
	zoom: game.zoom,
	minZoom: 2,
	maxZoom: 7,
	fullscreenControl: {
		position: 'bottomright'
	},
});

types.forEach(type => map.createPane(type.name));

map.attributionControl.setPrefix(null);
map.zoomControl.setPosition('bottomright');

map.setView(map.unproject([$(window).width() / 2, $(window).height() / 2]));

map.on('zoom', ev => {
	$('#map').attr('data-zoom', ev.target._zoom);
}).fire('zoom');

L.tileLayer(`data/${game.key}/tiles/{z}-{y}-{x}.png`, {
	minNativeZoom: game.zoom,
	maxNativeZoom: game.zoom,
	noWrap: true
}).addTo(map);

function getFromQueryString(name, dict) {
	const match = location.search.match('{0}=([A-Za-z0-9_]+)'.format(name));

	if (match) {
		const key = match[1].toLowerCase();
		const item = dict[key];
		if (item) return item;
	}

	for (const key in dict) if (dict[key].default) {
		return dict[key];
	}
}

function replaceQueryString(name, item, dict) {
	const keys = Object.keys(dict);
	let newIndex = keys.indexOf(item.key) + 1;
	if (newIndex >= keys.length) newIndex = 0;
	const value = keys[newIndex];
	const queryString = Object.keys(meta.data).map(id => `${id}=${id === name ? value : meta.data[id].key}`).join('&');
	window.location = `?${queryString}`;
}

$.getJSON(`data/${game.key}/data.json`, data => {
	let pointsCount = 0;

	for (const p in data) {
		if (points[p]) continue;
		points[p] = data[p];
		showPoint(points[p]);
		pointsCount++;
	}

	if (pointsCount !== markersCount) return;
	restore(localStorage[game.key]);
	progress.update();
	onMapReady();
	bindPanels();
	$('.search').css({ 'min-width': $('.filter').width() });
	if (hasHidden) filterPanel.visible(true);
});

function showPoint(point, isNew) {
	point.visited = ko.observable(false);
	point.enabled = ko.observable(iconsObject[point.icon].enabled());
	point.checked = ko.computed(() => point.visited() ? model.showVisited() : model.showUnvisited());
	point.visible = ko.computed(() => point.enabled() && point.checked());

	if (!point.visible()) hasHidden = true;

	point.navigate = function(){
		searchPanel.visible(false);
		map.setView(point.coordinates, 5);
		markers[point.id].openPopup();
		return false;
	};

	point.visit = function(){
		point.visited(!point.visited());
		saveAll();
	};

	point.clone = function(){
		addPoint(point);
	};

	point.deleteThis = function() {
		if (!confirm(lang.delete + ' "' + point.title() + '"?')) return;
		map.removeLayer(markers[point.id]);
		delete points[point.id];
		iconsObject[point.icon].points.splice(point, 1);
		typesObject[iconsObject[point.icon].type].points.splice(point, 1);
		types[0].points.splice(point, 1);
		delete mappings[json.titles.en];
		saveAll();
	};

	point.editable = ko.observable(editable);
	point.editMode = ko.observable(false);

	point.editTitle = function() {
		point.editMode(!point.editMode());
		point.title(point.titles[lang.key]);
	}

	if (isNew) {
		point.coordinates = map.getCenter();
	}

	point.title = ko.observable(point.titles[lang.key]);
	point.link = ko.observable(point.links[lang.key]);

	point.className = ko.observable(iconsObject[point.icon].className);
	point.searchTitle = ko.observable(iconsObject[point.icon].title);

	if (!point.title()) {
		delete points[point.id];
		markersCount++;
		return;
	}

	iconsObject[point.icon].points.push(point);
	typesObject[iconsObject[point.icon].type].points.push(point);
	types[0].points.push(point);

	markers[point.id] = L.marker(point.coordinates, {
		title: point.title(),
		icon: L.divIcon({
			html: $('#marker-template').html(),
			iconSize: [0, 0]
		}),
		draggable: editable,
		pane: iconsObject[point.icon].type
	}).on('add', (ev) => {
		ko.applyBindings(point, ev.target._icon);
		markersCount++;
	}).on('popupclose', (ev) => {
		ko.cleanNode(ev.popup._contentNode);
	}).on('dragend', (ev) => {
		if (isNew || confirm(lang.confirmMove)) {
			point.coordinates = ev.target.getLatLng();
			saveAll();
		} else {
			ev.target.setLatLng(point.coordinates);
		}
	})
	.addTo(map);

	markers[point.id]
		.bindPopup($('#popup-template').html())
		._popup.on('contentupdate', (ev) => ko.applyBindings(point, ev.target._contentNode));
}

function backup(){
	const data = lostPoints;

	for (const p in points) {
		if (points[p].visited()) data[p] = true;
	}

	return JSON.stringify(data);
}

function restore(json){
	if (!json) return;
	let data;

	try {
		data = JSON.parse(json);
	} catch(ex) {
		console.error(ex);
		return;
	}

	if (data.locations) {
		data = data.locations;
	}

	for (const p in points) {
		points[p].visited(false);
	}

	for (const p in data) {
		if (points[p]) {
			points[p].visited(true);
		} else {
			lostPoints[p] = data[p];
		}
	}

	saveAll();
}

function saveAll(){
	localStorage[game.key] = backup();
	localStorage[game.key + '-mappings'] = JSON.stringify(mappings, null, '	');
	localStorage[game.key + '-hidden'] = JSON.stringify({
		types: types.filter(type => !type.enabled()).map(type => type.name),
		icons: icons.filter(icon => !icon.enabled()).map(icon => icon.name)
	}, null, '	');
	progress.update();
}

function getAllPoints() {
	return JSON.stringify(points, null, '	');
}

function load(){
	$('<input type="file" style="display: none" />')
		.change((ev) => {
			if (!ev.target.files.length) return;
			const reader = new FileReader();
			$(reader).on('load', (ev) => restore(ev.target.result));
			reader.readAsText(ev.target.files[0]);
		})
		.appendTo(document.body)
		.click();
}

function save(){
	const text = backup();
	$('<a></a>').attr('download', game.key + '.json').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)).get(0).click();
}

function addPoint(json){
	const ids = Object.keys(points);
	const id = ids.length === 0 ? 1 : parseInt(ids[ids.length - 1]) + 1;

	if (!json) json = JSON.parse(prompt('JSON'));
	if (!json) return;

	mappings = JSON.parse(localStorage[game.key + '-mappings'] || '{}');
	const recentIcon = localStorage[game.key + '-recentIcon'] || 'unmarked';
	let icon = json.icon || mappings[json.titles.en];

	if (!icon) {
		icon = recentIcon;

		do {
			icon = prompt('Icon (one of {0})'.format(icons.map(icon => icon.name).join(', ')), icon);
		} while (!iconsObject[icon]);

		localStorage[game.key + '-recentIcon'] = icon;
		mappings[json.titles.en] = icon;
	}

	const point = {
		id: id,
		links: json.links,
		titles: json.titles,
		icon: icon
	};

	points[id] = point;

	showPoint(points[id], true);
	saveAll();
}

function copyPoints(){
	navigator.clipboard.writeText(getAllPoints());
}

const hotkeys = [];

document.onkeydown = function (ev) {
	for (const hotkey of hotkeys) {
		if (hotkey.hotkey === ev.key) {
			hotkey.callback();
			return false;
		}
	}

	if (ev.key === 'Escape') {
		if (!map._popup && panels.filter(panel => panel.visible()).length === 0) {
			return true;
		}

		if (map._popup) {
			map.closePopup();
		}

		panels.forEach((panel) => {
			panel.visible(false);
		});

		map._container.focus();
		return false;
	}
}

function extendControl(templateId, position) {
	return L.Control.extend({
		options: { position: position },
		onAdd: function() {
			var options = this.options;
			var container = $($('#' + templateId).html());

			if (options.hotkey) {
				options.text += ` (${options.hotkey})`;
				hotkeys.push({ hotkey: options.hotkey, callback: options.click || (() => options.checked(!options.checked())) });
			}

			ko.applyBindings(options, container.get(0));
			return container.get(0);
		}
	});
}

L.Bound = extendControl('bound-template', 'bottomleft');
L.Button = extendControl('button-template', 'topright');
L.CheckButton = extendControl('checkButton-template', 'topleft');

const panels = [];

function createPanel(panel, selector) {
	panel.selector = selector;
	panel.visible = ko.observable(false);

	panel.visible.subscribe((value) => {
		if (value) {
			panels.forEach((otherPanel) => {
				if (otherPanel.selector === panel.selector) return;
				otherPanel.visible(false);
			});
		}
	});

	panel.bind = () => ko.applyBindings(panel, document.querySelector(selector));

	panels.push(panel);
	return panel;
}

function bindPanels(){
	panels.forEach(panel => panel.bind());
}

const searchPanel = createPanel({
	text: ko.observable(''),
	icon: ko.observable(),
	type: ko.observable(),
	focused: ko.observable(false),
	results: ko.observableArray([]),
	filter: ko.observable(lang.filter),
	selectedIndex: ko.observable(-1),
	placeholder: lang.search,

	search: (_icon, ev) => {
		if (window.searchTimeout) clearTimeout(window.searchTimeout);

		if (ev) {
			if (ev.key === 'Enter' && (searchPanel.selectedIndex() >= 0 || searchPanel.results().length === 1)) {
				searchPanel.results()[Math.max(searchPanel.selectedIndex(), 0)].navigate();
				return false;
			}

			if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
				const index = ev.key === 'ArrowDown'
					? Math.min(searchPanel.selectedIndex() + 1, searchPanel.results().length - 1)
					: Math.max(searchPanel.selectedIndex() - 1, 0);

				searchPanel.selectedIndex(index);
				return false;
			}
		}

		function cleanup(text){
			return text.toLowerCase().replace(/[^A-Za-z0-9А-Яа-яЁё ]+/g, ' ').replace(/\s+/g, ' ');
		}

		searchPanel.selectedIndex(-1);

		window.searchTimeout = setTimeout(() => {
			searchPanel.results(Object.values(points).filter((point) => {
				for (const i in point.titles) {
					if (point.checked() && point.titles[i]
						&& (!searchPanel.text() || cleanup(point.titles[i]).indexOf(cleanup(searchPanel.text())) !== -1)
						&& (!searchPanel.icon() || point.icon === searchPanel.icon().name)
						&& (!searchPanel.type() || searchPanel.type().name === 'all' || iconsObject[point.icon].type === searchPanel.type().name)
					) return true;
				}
			}).sort({ title: true, ignoreCase: true }));
		}, ev ? 100 : 0);
	},

	clearFilter: () => {
		searchPanel.icon(null);
		searchPanel.type(null);
		searchPanel.search();
	}
}, '.search');

searchPanel.visible.subscribe((value) => {
	if (value) {
		setTimeout(() => searchPanel.focused(true), 1);
	}
});

const filterPanel = createPanel({ types: Object.values(types) }, '.filter');

map.addControl(new L.Button({text: game.title, click: () => {
	replaceQueryString('dlc', dlc, dlcs);
}}));

map.addControl(new L.Button({text: lang.title, click: () => {
	replaceQueryString('lang', lang, langs);
}}));

map.addControl(new L.Button({text: lang.load, hotkey: 'F1', click: () => {
	load();
}}));

map.addControl(new L.Button({text: lang.save, hotkey: 'F2', click: () => {
	save();
}}));

if (editable) {
	map.addControl(new L.Button({text: lang.addPoint, hotkey: 'F9', click: () => {
		addPoint();
	}}));

	map.addControl(new L.Button({text: lang.copyPoints, hotkey: 'F10', click: () => {
		copyPoints();
	}}));
}

map.addControl(new L.Button({text: lang.search, position: 'topleft', hotkey: 'F3', click: () => {
	searchPanel.visible(!searchPanel.visible());
}}));

map.addControl(new L.Button({text: lang.filter, position: 'topleft', hotkey: 'F4', click: () => {
	filterPanel.visible(!filterPanel.visible());
}}));

map.addControl(new L.CheckButton({ text: lang.visited, position: 'topleft', hotkey: 'F7', checked: model.showVisited }));

map.addControl(new L.CheckButton({ text: lang.unvisited, position: 'topleft', hotkey: 'F8', checked: model.showUnvisited }));

map.addControl(new L.Bound(progress));

if (game.ready !== 1) {
	const underConstruction = new L.Button({ text: lang.underConstruction.format(Math.round(game.ready * 100)), position: 'bottomleft', click: () => { hideWarning(underConstruction) } });
	map.addControl(underConstruction);
	L.DomUtil.addClass(underConstruction.getContainer(), 'underConstruction');
}

function hideWarning(control) {
	$(control.getContainer()).addClass('hidden');
}

function onMapReady(){
}
