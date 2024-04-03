try {
	VK.init();
} catch (ex) {
	window.clearInterval(window.VKReadyInterval);
	alert('Unable to connect with VK API. Exception: "' + ex.toString() + '"');
}

document.querySelector('textarea').addEventListener('keydown', (ev) => {
	const el = ev.target;

	if ((ev.keyCode == 10 || ev.keyCode == 13) && ev.ctrlKey) {
		eval(el.value);
		return false;
	}

	if (ev.keyCode == 9) {
		ev.preventDefault();
		var start = el.selectionStart;
		var end = el.selectionEnd;
		el.value = el.value.substring(0, start) + '\t' + el.value.substring(end);
		el.selectionStart = el.selectionEnd = start + 1;
		return false;
	}

	return true;
});
