// TODO: migrate to react

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

function error(msg) {
	alert(msg);
	throw new Error(msg);
}

const dlcs = {
	'': {
		key: '',
		title: 'Fallout 4',
		zoom: 3,
		background: '#1d1d1d',
		default: true,
		ready: 0.99,
	},
	far_harbor: {
		key: 'far_harbor',
		title: 'Far Harbor DLC',
		background: '#201c20',
		zoom: 3,
		ready: 1,
	},
	nuka_world: {
		key: 'nuka_world',
		title: 'Nuka World DLC',
		background: '#282420',
		zoom: 3,
		ready: 0.1,
	},
	zone: {
		key: 'zone',
		title: 'Zone DLC',
		background: '#666666',
		zoom: 3,
		ready: 1,
	}
}

const langs = {
	ru: {
		key: 'ru',
		game: 'Игра',
		lang: 'Язык',
		title: 'Русский',
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
		visitedCount: 'Посещено',
		unmarked: 'Неотмечаемые',
		underConstruction: 'Карта находится в разработке ({0}% готово)'
	},
	en: {
		key: 'en',
		game: 'Game',
		lang: 'Language',
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
		visitedCount: 'Visited',
		unmarked: 'Unmarked',
		underConstruction: 'The map is under construction ({0}% finished)'
	},
};

const dlc = getFromQueryString('dlc', dlcs);
const lang = getFromQueryString('lang', langs) || langs[['ru', 'uk', 'be', 'kk'].indexOf(navigator.language) === -1 ? 'en' : 'ru'];

const meta = {
	base: { key: 'fallout4map' },
	data: { dlc, lang },
};

const game = { ...dlc };
game.key = [ meta.base.key, meta.data.dlc.key ].filter(k => k).join('_');
game.title = meta.data.dlc.title;

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
	showUnmarked: ko.observable(true),
};

model.showVisited.subscribe(() => searchPanel.search());
model.showUnvisited.subscribe(() => searchPanel.search());
model.showUnmarked.subscribe(() => searchPanel.search());

const hidden = JSON.parse(localStorage[game.key + '-hidden'] || '{ "types": [], "icons": [] }');

class Lookup extends Map {
	constructor(name) {
		super();
		this.name = name;
	}

	find(key) {
		if (this.has(key)) {
			return this.get(key);
		} else {
			error(`Cannot find ${key} in ${this.name}`);
		}
	}
}

class Types extends Lookup {
	constructor(data) {
		super('types');

		data.forEach(type => {
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

			this.set(type.name, type);
		});
	}
}

class Icons extends Lookup {
	constructor(data) {
		super('icons');

		data
			.map(icon => {
				icon.points = ko.observableArray([]);
				icon.title = icon.titles[lang.key];
				icon.all = icon.all || false;
				icon.className = types.find(icon.type).className + ' ' + 'icon-' + icon.name + ' fa-solid ' + icon.className;
				icon.toggle = toggleIcon;
				icon.enabled = ko.observable(hidden.icons.indexOf(icon.name) === -1);
				icon.count = ko.computed(() => icon.points().filter(point => point.checked()).length);
				icon.search = function(){
					searchPanel.visible(true);
					searchPanel.text('');
					searchPanel.icon(icon);
					searchPanel.search();
				};
				return icon;
			})
			.sort({ title: true, ignoreCase: true })
			.forEach(icon => {
				this.set(icon.name, icon);
				types.find(icon.type).icons.push(icon);
			});
	}
}

const types = new Types([
	{ name: "all", className: "icon-all", titles: { en: "All", ru: "Все" }},
	{ name: "collectible", className: "icon-collectible", titles: { en: "Collectibles", ru: "Коллекции" }},
	{ name: "pickup", className: "icon-pickup", titles: { en: "Pickups", ru: "Предметы" }},
	{ name: "location", className: "icon-location", titles: { en: "Locations", ru: "Локации" }},
]);

const icons = new Icons([
	{ name: "attraction", className: "fa-ticket", type: "location", titles: { en: "Attraction", ru: "Аттракцион" } },
	{ name: "bobblehead", className: "fa-face-smile", type: "collectible", titles: { en: "Bobblehead", ru: "Пупс" } },
	{ name: "bridge", className: "fa-bridge", type: "location", titles: { en: "Bridge", ru: "Мост" } },
	{ name: "building", className: "fa-building", type: "location", titles: { en: "Building", ru: "Здание" } },
	{ name: "bunker", className: "fa-door-closed", type: "location", titles: { en: "Bunker", ru: "Бункер" } },
	{ name: "camper", className: "fa-caravan", type: "location", titles: { en: "Camper", ru: "Трейлерный парк" } },
	{ name: "church", className: "fa-church", type: "location", titles: { en: "Church", ru: "Церковь" } },
	{ name: "city", className: "fa-city", type: "location", titles: { en: "City", ru: "Город" } },
	{ name: "dungeon", className: "fa-igloo", type: "location", titles: { en: "Dungeon", ru: "Подземелье" } },
	{ name: "encampment", className: "fa-campground", type: "location", titles: { en: "Encampment", ru: "Лагерь" } },
	{ name: "factory", className: "fa-industry", type: "location", titles: { en: "Factory", ru: "Завод" } },
	{ name: "farm", className: "fa-tractor", type: "location", titles: { en: "Farm", ru: "Ферма" } },
	{ name: "filling-station", className: "fa-gas-pump", type: "location", titles: { en: "Filling station", ru: "Заправочная станция" } },
	{ name: "forest", className: "fa-tree", type: "location", titles: { en: "Forest", ru: "Лес" } },
	{ name: "fusion-core", className: "fa-bolt", type: "pickup", titles: { en: "Fusion core", ru: "Ядерный блок" } },
	{ name: "graveyard", className: "fa-monument", type: "location", titles: { en: "Graveyard", ru: "Кладбище" } },
	{ name: "holotape", className: "fa-camera-retro", type: "collectible", titles: { en: "Holotape", ru: "Голодиск" } },
	{ name: "hospital", className: "fa-bed-pulse", type: "location", titles: { en: "Hospital", ru: "Больница" } },
	{ name: "junkyard", className: "fa-trash", type: "location", titles: { en: "Junkyard", ru: "Свалка" } },
	{ name: "magazine", className: "fa-book-open-reader", type: "collectible", titles: { en: "Magazine", ru: "Журнал" } },
	{ name: "military-base", className: "fa-star", type: "location", titles: { en: "Military base", ru: "Военная база" } },
	{ name: "mini-nuke", className: "fa-bomb", type: "pickup", titles: { en: "Mini nuke", ru: "Ядерный минизаряд" } },
	{ name: "parking", className: "fa-warehouse", type: "location", titles: { en: "Parking", ru: "Парковка" } },
	{ name: "pier", className: "fa-water-ladder", type: "location", titles: { en: "Pier", ru: "Пирс" } },
	{ name: "plane", className: "fa-plane", type: "location", titles: { en: "Plane", ru: "Самолёт" } },
	{ name: "police-station", className: "fa-person-military-pointing", type: "location", titles: { en: "Police station", ru: "Полицейский участок" } },
	{ name: "power-armor", className: "fa-shield-halved", type: "pickup", titles: { en: "Power armor", ru: "Силовая броня" } },
	{ name: "quarry", className: "fa-hill-rockslide", type: "location", titles: { en: "Quarry", ru: "Карьер" } },
	{ name: "radioactive-area", className: "fa-radiation", type: "location", titles: { en: "Radioactive area", ru: "Радиоактивная зона" } },
	{ name: "radio-tower", className: "fa-tower-cell", type: "location", titles: { en: "Radio tower", ru: "Радиовышка" } },
	{ name: "satellite", className: "fa-satellite-dish", type: "location", titles: { en: "Satellite", ru: "Спутниковая антенна" } },
	{ name: "school", className: "fa-graduation-cap", type: "location", titles: { en: "School", ru: "Школа" } },
	{ name: "settlement", className: "fa-house", type: "location", titles: { en: "Settlement", ru: "Поселение" } },
	{ name: "ship", className: "fa-anchor", type: "location", titles: { en: "Ship", ru: "Корабль" } },
	{ name: "square", className: "fa-vector-square", type: "location", titles: { en: "Square", ru: "Площадь" } },
	{ name: "stash", className: "fa-box", type: "location", titles: { en: "Stash", ru: "Тайник" } },
	{ name: "store", className: "fa-store", type: "location", titles: { en: "Store", ru: "Магазин" } },
	{ name: "subway-station", className: "fa-train-subway", type: "location", titles: { en: "Subway station", ru: "Станция метро" } },
	{ name: "train-station", className: "fa-train", type: "location", titles: { en: "Train station", ru: "Ж/д станция" } },
	{ name: "vault", className: "fa-gear", type: "location", titles: { en: "Vault", ru: "Убежище" } },
	{ name: "water", className: "fa-water", type: "location", titles: { en: "Water", ru: "Водоём" } },
	{ name: "weapon", className: "fa-gun", type: "pickup", titles: { en: "Weapon", ru: "Оружие" } },
]);

types.forEach(type => type.icons = type.icons.sort({ title: true, ignoreCase: true }));

ko.applyBindings({ types: Array.from(types.values()) }, document.querySelector('.addForm'));

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
	return `${lang.visitedCount}: ${isNaN(value) ? '...' : value + '%'}`;
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
	$('.search').css({ 'min-width': $('.filter').outerWidth() });
	if (hasHidden) filterPanel.visible(true);
});

function showPoint(point, isNew) {
	point.visited = ko.observable(false);
	point.enabled = ko.observable(icons.find(point.icon).enabled());
	point.checked = ko.computed(() => (point.visited() ? model.showVisited() : model.showUnvisited()) && (!point.unmarked || model.showUnmarked()));
	point.visible = ko.computed(() => point.enabled() && point.checked());

	if (!point.visible()) hasHidden = true;
	point.unmarked ||= false;

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
		icons.find(point.icon).points.splice(point, 1);
		types.find(icons.find(point.icon).type).points.splice(point, 1);
		types.find('all').points.splice(point, 1);
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

	point.className = icons.find(point.icon).className;

	if (point.unmarked) {
		point.className += " unmarked";
	}

	point.searchTitle = ko.observable(icons.find(point.icon).title);

	if (!checkPoint(point)) {
		delete points[point.id];
		markersCount++;
		return;
	}

	icons.find(point.icon).points.push(point);
	types.find(icons.find(point.icon).type).points.push(point);
	types.find('all').points.push(point);

	markers[point.id] = L.marker(point.coordinates, {
		title: point.title(),
		icon: L.divIcon({
			html: $('#marker-template').html(),
			iconSize: [0, 0]
		}),
		draggable: editable,
		pane: icons.find(point.icon).type
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

function checkPoint(point) {
	if (!point.titles) {
		error(`Cannot get point.titles`);
		return false;
	}

	for (const lang of Object.keys(langs)) {
		if (!point.titles[lang]) {
			error(`Unknown title[${lang}] for point #${point.id}`);
			return false;
		}
	}

	return true;
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
		types: Array.from(types.values()).filter(type => !type.enabled()).map(type => type.name),
		icons: Array.from(icons.values()).filter(icon => !icon.enabled()).map(icon => icon.name)
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

async function addPoint(json){
	const ids = Object.keys(points);
	const id = ids.length === 0 ? 1 : parseInt(ids[ids.length - 1]) + 1;

	if (!json) json = await inputJSON();
	if (!json) return;

	mappings = JSON.parse(localStorage[game.key + '-mappings'] || '{}');
	const recentIcon = localStorage[game.key + '-recentIcon'] || '';
	let icon = json.icon || mappings[json.titles.en];

	if (!icon) {
		icon = recentIcon;

		do {
			icon = prompt('Icon (one of {0})'.format(icons.values().map(icon => icon.name).join(', ')), icon);
		} while (!icons.has(icon));

		localStorage[game.key + '-recentIcon'] = icon;
		mappings[json.titles.en] = icon;
	}

	const point = {
		id: id,
		links: json.links,
		titles: json.titles,
		icon: icon
	};

	if (json.unmarked) {
		point.unmarked = true;
	}

	points[id] = point;

	showPoint(points[id], true);
	saveAll();
}

async function inputJSON() {
	return new Promise((resolve) => {
		const dialog = $('.addForm');

		dialog.find('form').on('submit', (ev) => {
			ev.stopPropagation();
			ev.preventDefault();
			const data = ev.originalEvent.target.elements;

			if (!data.icon.value) {
				alert(`Please select icon`);
				return;
			}

			let json;

			try {
				json = JSON.parse(data.json.value);
			} catch (ex) {
				error(`Invalid JSON: ${ex}`);
				return;
			}

			if (!checkPoint(json)) {
				return;
			}

			json.icon = data.icon.value;
			if (data.unmarked.checked) json.unmarked = true;

			dialog.get(0).close();
			resolve(json);
		});

		dialog.get(0).showModal();
	});
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

L.PanelButton = L.Button.extend({
	onAdd: function(){
		const panel = this.options.panel;
		panel.button = this;

		this.options.click = function() {
			panel.visible(!panel.visible());
		};

		return L.Button.prototype.onAdd.call(this);
	}
})

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

		if (panel.button) {
			$(panel.button._container).toggleClass('active', value);
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
						&& (!searchPanel.type() || searchPanel.type().name === 'all' || icons.find(point.icon).type === searchPanel.type().name)
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

const filterPanel = createPanel({ types: Array.from(types.values()) }, '.filter');

map.addControl(new L.Button({ text: `${lang.game}: ${game.title}`, click: () => {
	replaceQueryString('dlc', dlc, dlcs);
}}));

map.addControl(new L.Button({ text: `${lang.lang}: ${lang.title}`, click: () => {
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

map.addControl(new L.PanelButton({ text: lang.search, position: 'topleft', hotkey: 'F3', panel: searchPanel }));

map.addControl(new L.PanelButton({ text: lang.filter, position: 'topleft', hotkey: 'F4', panel: filterPanel }));

map.addControl(new L.CheckButton({ text: lang.visited, position: 'topleft', hotkey: 'F7', checked: model.showVisited }));

map.addControl(new L.CheckButton({ text: lang.unvisited, position: 'topleft', hotkey: 'F8', checked: model.showUnvisited }));

map.addControl(new L.CheckButton({ text: lang.unmarked, position: 'topleft', hotkey: 'F11', checked: model.showUnmarked }));

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
