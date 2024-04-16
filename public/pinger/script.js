const timeout = 5000;

async function ping(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const timer = setTimeout(() => reject(timeout), timeout);
		const startTime = new Date().getTime();
		img.onload = img.onerror = () => { clearTimeout(timer); resolve((new Date().getTime() - startTime)) };
		img.src = url + '?t=' + Math.random().toString().slice(2);
	})
}

async function start() {
	const textarea = document.querySelector('textarea');

	const allUrlsData = {
		sbg: [
			{ key: 'home', url: 'https://sbg-game.ru/app' },
			{ key: 'app', url: 'https://sbg-game.ru/app' },
			{ key: 'intel.js', url: 'https://sbg-game.ru/app/intel.js' },
			{ key: 'script.js', url: 'https://sbg-game.ru/app/script.js' },
			{ key: 'telegram', url: 'https://telegram.org/js/telegram-widget.js?21' },
			{ key: 'manrope', url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap' },
			{ key: 'material', url: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined' },
			{ key: 'eui', url: 'https://github.com/egorantonov/sbg-enhanced/releases/latest/download/eui.user.js' },
			{ key: 'cui', url: 'https://raw.githubusercontent.com/nicko-v/sbg-cui/main/index.js' },
			{ key: 'plus', url: 'https://raw.githubusercontent.com/anmiles/userscripts/main/dist/sbg.plus.user.js' },
			{ key: 'plus_min', url: 'https://raw.githubusercontent.com/anmiles/userscripts/main/dist/sbg.plus.user.min.js' },
			{ key: 'plus', url: 'https://anmiles.net/userscripts/sbg.plus.user.js' },
			{ key: 'plus_min', url: 'https://anmiles.net/userscripts/sbg.plus.user.min.js' },
			{ key: 'plus', url: 'https://anmiles.github.io/userscripts/sbg.plus.user.js' },
			{ key: 'plus_min', url: 'https://anmiles.github.io/userscripts/sbg.plus.user.min.js' },
			{ key: 'anmiles', url: 'https://anmiles.github.io' },
			{ key: 'chartjs', url: 'https://chartjs.github.io' },
			{ key: 'react', url: 'https://facebook.github.io/react' },
			{ key: 'tensorflow', url: 'https://tensorflow.github.io/playground' },
			{ key: 'anmiles', url: 'https://anmiles.gitlab.io/' },
			{ key: 'pages', url: 'https://pages.gitlab.io/' },
			{ key: 'boldhearts', url: 'https://boldhearts.gitlab.io/' },
			{ key: 'datlinux', url: 'https://datlinux.gitlab.io/' },
		]
	};

	const urlsData = allUrlsData[location.search.slice(1)];
	let total = 0;

	if (urlsData) {
		urlsData.map(urlData => {
			const domain = new URL(urlData.url).host.split('.').slice(-2).join('.');
			urlData.label = domain + ' @ ' + urlData.key;
		})

		const maxLabelLength = Math.max(...urlsData.map((item) => item.label.length));
		textarea.value = '';

		for (const { url, label } of urlsData) {
			textarea.value += label + ' '.repeat(maxLabelLength - label.length) + ' => ';

			try {
				const result = await ping(url);
				total += result;
				textarea.value += `PASS: ${result}ms\n`;
			} catch (result) {
				total += result;
				textarea.value += `FAIL: ${result}ms timeout\n`;
			}
		}

		textarea.value += '-'.repeat(maxLabelLength) + '\n';
		textarea.value += 'TOTAL: ' + total + 'ms';
	}
};

if (location.hash === '#start') {
	document.querySelector('#ping').style.display = 'none';
	start();
} else {
	document.querySelector('#ping').addEventListener('click', (ev) => {
		ev.preventDefault();
		ev.target.disabled = true;
		start().then(() => ev.target.disabled = false);
		return false;
	});
}
