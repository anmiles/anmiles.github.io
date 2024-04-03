const fs = require('fs');
const moment = require('moment');
require('@anmiles/prototypes');

const root = "public";
const exts = [ '.htm', '.html' ];
const time = moment().format('yyyy-MM-DD-HH-mm-ss');

fs.recurse(root, { file: (filepath) => {
	if (exts.filter(ext => filepath.endsWith(ext)).length > 0) {
		updateVersion(filepath, time);
	}
}});

function updateVersion(filepath, time) {
	const text = fs.readFileSync(filepath).toString();
	const updatedText = text.replace(/\{VERSION\}/g, time);

	if (text !== updatedText) {
		console.log(`	${filepath}`);
		fs.writeFileSync(filepath, updatedText);
	}
}
