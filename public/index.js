function main() {
	detectLanguage();
	detectTheme();
}

function detectLanguage(){
	if (!['ru', 'uk', 'be', 'kk'].includes(navigator.language)) {
		document.querySelector('[lang="ru"]').style.display = 'none';
		document.querySelector('[lang="en"]').style.display = 'block';
	}
}

function detectTheme() {
	let isDark = getIsDark();
	setIsDark(isDark, false);

	document.querySelector('.theme').addEventListener('click', () => {
		isDark = !isDark;
		setIsDark(isDark, true);
	});
}

function getIsDark() {
	if ('theme' in localStorage) {
		return localStorage.getItem('theme') === 'dark';
	}

	if (window.matchMedia) {
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		query.addEventListener('change', (ev) => setIsDark(ev.matches, false));
		return query.matches;
	}
}

function setIsDark(isDark, save) {
	const theme = isDark ? 'dark' : 'light';

	if (save) {
		localStorage.setItem('theme', theme);
	}

	document.querySelector('body').setAttribute('data-theme', theme);
}

main();
