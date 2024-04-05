/* ES5 compatible */

var enabledFeatures = [];
var disabledFeatures = [];

var featuresHTML = [];
var featuresReport = [];

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
	features.forEach(function(feature){
		renderFeature(feature, enabled);
	});
}

function renderFeature(feature, enabled) {
	var color = enabled ? 'green' : 'red';
	var sign = enabled ? '+' : '-';

	featuresHTML.push('<span style="color: ' + color + '">' + sign + ' ' + feature + '</span>');
	featuresReport.push(sign + ' ' + feature);
}

checkFeatures(Modernizr);
renderFeatures(disabledFeatures, false);
renderFeatures(enabledFeatures, true);

document.querySelector('#features').innerHTML = featuresHTML.join('<br />\n');

document.querySelector('#copy').focus();
document.querySelector('#copy').click(function(){
	navigator.clipboard.writeText(featuresReport.join('\n'));
});
