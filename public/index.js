function main() {
	detectLanguage();
	detectTheme();
}

function detectLanguage(){
	const lang = ['ru', 'uk', 'be', 'kk'].includes(navigator.language)
		? 'ru'
		: 'en';

	document.body.setAttribute('data-lang', lang);
}

function detectTheme() {
	if (typeof ThemeSwitcherElement === 'undefined')
		return;

	new ThemeSwitcherElement({ float: 'right' })
		.render(document.querySelector('.theme'));
}

main();
