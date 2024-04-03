const disabledFeatures = [];

for (var key in Modernizr) {
	if (!Modernizr[key]) {
		disabledFeatures.push(key);
	}
}

document.getElementById('features').innerText = disabledFeatures.join('\n');
