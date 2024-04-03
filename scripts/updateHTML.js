const fs = require('fs');
const moment = require('moment');
require('@anmiles/prototypes');

const root = "public";
const exts = [ '.htm', '.html' ];
const time = moment().format('yyyy-MM-DD-HH-mm-ss');

fs.recurse(root, { file: (filepath) => {
	if (exts.filter(ext => filepath.endsWith(ext)).length > 0) {
		updateHTML(filepath);
		updateVersion(filepath, time);
		insertAnalytics(filepath);
	}
}});

function updateHTML(filepath) {
	const originalText = fs.readFileSync(filepath).toString();

	let text = originalText;
	text = updateVersion(text);
	text = insertAnalytics(text);

	if (text !== originalText) {
		console.log(`	${filepath}`);
		fs.writeFileSync(filepath, text);
	}
}

function updateVersion(text) {
	return text.replace(/\{VERSION\}/g, time);
}

function insertAnalytics(text) {
	return text.replace('</body>', `\
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92540327-1"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-92540327-1');
</script>

</body>\
`);
}
