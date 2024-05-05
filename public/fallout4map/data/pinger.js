const fs = require('fs/promises');
const path = require('path');

const root = path.resolve('.');

async function main(){
	const entries = await fs.readdir(root, { recursive : true });
	const files = entries.filter(entry => entry.endsWith('data.json'));

	for (const file of files) {
		const filename = path.join(root, file);
		console.log('> ' + filename);
		const json = (await fs.readFile(filename)).toString();
		const data = JSON.parse(json);

		for (const item of Object.values(data)) {
			if (item.links) {
				for (const link of Object.values(item.links)) {
					const resp = await fetch(link, {method: 'HEAD'});

					if (resp.status !== 200) {
						console.log('! ' + resp.status + ' ' + link);
					}

					await new Promise(res => setTimeout(res, 200));
				}
			}
		}
	}
}

main();
