const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('@anmiles/prototypes');

const root = './public';
const exts = [ '.htm', '.html' ];
const time = moment().format('yyyy-MM-DD-HH-mm-ss');
const versions = new Map();

fs.readdirSync(path.join(root, 'libs')).forEach(filename => {
	const match = filename.match(/^([A-Za-z0-9\-]+?)-([\d\.]+?)\.\D/);
	if (match) {
		versions.set(match[1], match[2]);
	}
})

fs.recurse(root, { file: (filepath) => {
	if (exts.filter(ext => filepath.endsWith(ext)).length > 0) {
		updateHTML(filepath);
	}
}});

function updateHTML(filepath) {
	const originalText = fs.readFileSync(filepath).toString();

	let text = originalText;
	text = updateVersions(text);
	text = insertAnalytics(text);

	if (text !== originalText) {
		console.log(`	${filepath}`);
		fs.writeFileSync(filepath, text);
	}
}

function updateVersions(text) {
	text = text.replaceAll('{VERSION}', time);

	versions.forEach((version, lib) => {
		text = text.replaceAll(new RegExp(`(?<=\\/libs\\/${lib.regexEscape()}-)([\\d\\.]+?)(?=\\.\\D)`, 'g'), version);
	});
	return text;
}

function insertAnalytics(text) {
	const analytics = [
		'<!-- Google tag (gtag.js) -->',
		'<script type="text/javascript" async src="https://www.googletagmanager.com/gtag/js?id=G-C66BR79P9J"></script>',
		'<script type="text/javascript">',
		'window.dataLayer = window.dataLayer || [];',
		'function gtag(){dataLayer.push(arguments);}',
		'gtag(\'js\', new Date());',
		'gtag(\'config\', \'G-C66BR79P9J\');',
		'</script>',
	];

	return text.includes(analytics[0])
		? text
		: text.replace(/(\r?\n)*<\/body>/, '\n\n' + analytics.join('\n') + '\n\n</body>');
}
