var enabledFeatures = [];
var disabledFeatures = [];

var featuresHTML = [];

function checkFeatures(obj, prefix) {
	Object.keys(obj).sort().forEach(function(key) {
		var fullKey = (prefix ? prefix + '.' : '') + key;

		if (!obj[key]) {
			disabledFeatures.push(fullKey);
		} else {
			if (typeof obj[key] === 'object') {
				checkFeatures(obj[key], fullKey);
			} else {
				enabledFeatures.push(fullKey);
			}
		}
	});
}

function renderFeatures(features, enabled) {
	return features.map(function(feature){
		return renderFeature(feature, enabled);
	})
}

function renderFeature(feature, enabled) {
	var color = enabled ? 'green' : 'red';
	var sign = enabled ? '+' : '-';

	featuresHTML.push('<span style="color: ' + color + '">' + sign + ' ' + feature + '</span>');
}

checkFeatures(Modernizr);
renderFeatures(disabledFeatures, false);
renderFeatures(enabledFeatures, true);

document.getElementById('features').innerHTML = featuresHTML.join('<br />\n');
