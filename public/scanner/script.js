function resizeScanner() {
	var minWidth = Math.min(window.innerWidth, window.innerHeight * 9 / 16, 540);
	document.querySelector('.scanner').style.width = minWidth + 'px';
	document.querySelector('.scanner').style.height = (minWidth * 16 / 9) + 'px';
}

window.onresize = resizeScanner;
resizeScanner();
