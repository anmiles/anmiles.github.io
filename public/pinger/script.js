const timeout = 3000;

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

	const allUrls = {
		sbg: {
			game_app : 'https://sbg-game.ru/app',
			game_desktop : 'https://sbg-game.ru/app/intel.js',
			game_mobile : 'https://sbg-game.ru/app/script.js',
			lib_ol: 'https://cdn.jsdelivr.net/npm/ol@v8.1.0/dist/ol.js',
			lib_splide: 'https://cdn.jsdelivr.net/npm/@splidejs/splide@latest/dist/js/splide.min.js',
			lib_toastify: 'https://cdn.jsdelivr.net/npm/toastify-js',
			lib_telegram: 'https://telegram.org/js/telegram-widget.js?21',
			fonts_manrope: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap',
			fonts_material: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
			scripts_cui : 'https://raw.githubusercontent.com/nicko-v/sbg-cui/main/index.js',
			scripts_eui : 'https://github.com/egorantonov/sbg-enhanced/releases/latest/download/eui.user.js',
			plus_desktop : 'https://anmiles.net/userscripts/sbg.plus.user.js',
			plus_mobile : 'https://anmiles.net/userscripts/sbg.plus.user.min.js',
			plus_dist_desktop : 'https://raw.githubusercontent.com/anmiles/userscripts/main/dist/sbg.plus.user.js',
			plus_dist_mobile : 'https://raw.githubusercontent.com/anmiles/userscripts/main/dist/sbg.plus.user.min.js',
			userscripts: 'https://anmiles.net/userscripts',
			gh_anmiles: 'https://anmiles.github.io',
			gh_chart: 'https://chartjs.github.io',
			gh_react: 'https://facebook.github.io/react',
			gh_tensorflow: 'https://tensorflow.github.io/playground',
			gl_anmiles: 'https://anmiles.gitlab.io/',
			gl_pages: 'https://pages.gitlab.io/',
			gl_bold: 'https://boldhearts.gitlab.io/',
			gl_dat: 'https://datlinux.gitlab.io/',
		}
	};

	const urls = allUrls[location.search.slice(1)];
	let total = 0;

	if (urls) {
		const maxKeyLength = Math.max(...Object.keys(urls).map(key => key.length));
		textarea.value = '';

		for (const key in urls) {
			textarea.value += key + ' '.repeat(maxKeyLength - key.length) + ' => ';

			try {
				const result = await ping(urls[key]);
				total += result;
				textarea.value += `PASS: ${result}ms\n`;
			} catch (result) {
				total += result;
				textarea.value += `FAIL: ${result}ms timeout\n`;
			}
		}

		textarea.value += '-'.repeat(maxKeyLength) + '\n';
		textarea.value += 'TOTAL: ' + total + 'ms';
	}
};

document.querySelector('#ping').addEventListener('click', (ev) => {
	ev.preventDefault();
	ev.target.disabled = true;
	start().then(() => ev.target.disabled = false);
	return false;
});
