function tick() {
	const date = new Date();
	document.querySelector('.hours').innerHTML = date.getHours().toString().padStart(2, 0);
	document.querySelector('.minutes').innerHTML = date.getMinutes().toString().padStart(2, 0);
}

setInterval(tick, 1000);
tick();
