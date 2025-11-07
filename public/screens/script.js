// TODO: migrate to react

var json = {};

function addPhone(title, data)
{
	data = data || ['', '', '', '', ''];
	title = title || '';
	var div = $('<div />');
	div.append('<div class="line"><form id="form' + Math.random().toString().substring(2) + '">Телефон <div class="input wide"><input type="text" name="pTitle" value="' + title + '" /></div> размером <div class="input"><input type="text" name="pWidth" size="3" value="' + data[0] + '" /></div> на <div class="input"><input type="text" name="pHeight" size="3" value="' + data[1] + '" /></div> мм. с экраном <div class="input"><input type="text" name="sDiagonal" size="2" value="' + data[2] + '" /></div> дюймов и разрешением <div class="input"><input type="text" name="sWidth" size="3" value="' + data[3] + '" /></div> на <div class="input"><input type="text" name="sHeight" size="3" value="' + data[4] + '" /></div> пикселей.&nbsp;<input type="button" name="button" value="Показать" onclick="showPhone(this);"></form></div>');
	$('#holder').append(div);

	if (title)
	{
		div.find('input[type=button]').click();
	}
	else
	{
		div.find('input[type=text]').keypress(inputKeyPress).first().focus();
	}
}

function checkField(form, name, parser)
{
	var input = form.elements[name];
	var val = parser(input.value);

	if (isNaN(val))
	{
		$(input).animate({'background-color': '#ff8080'}, 100, function(){ $(this).removeAttr('style'); });
		return null;
	}

	return val;
}

function showPhone()
{
	var form = arguments[0].form;

	var pWidth = checkField(form, 'pWidth', parseInt);
	var pHeight = checkField(form, 'pHeight', parseInt);
	var sDiagonal = checkField(form, 'sDiagonal', parseFloat);
	var sWidth = checkField(form, 'sWidth', parseInt);
	var sHeight = checkField(form, 'sHeight', parseInt);
	var pTitle = form.elements.pTitle.value;

	if (!pWidth || !pHeight || !sDiagonal || !sWidth || !sHeight)
	{
		return;
	}

	json[pTitle] = [pWidth, pHeight, sDiagonal, sWidth, sHeight];
	location.hash = JSON.stringify(json).replaceAll("'", '%27').replaceAll('""', "'");

	if (form.button.value == 'Скрыть')
	{
		form.button.value = 'Показать';
		hidePhone(form.id);
	}
	else
	{
		form.button.value = 'Скрыть';
		buildPhone(form.id, pWidth, pHeight, pTitle, sDiagonal, sWidth, sHeight);
	}
}

function buildPhone(id, pWidth, pHeight, pTitle, sDiagonal, sWidth, sHeight)
{
	var phone = $('#phone' + id);

	if (!phone.length)
	{
		phone = $('<div />');
		phone.addClass('phone');
		phone.attr('id', 'phone' + id);
		phone.attr('title', pTitle);
		$('#canvas').append(phone);
	}

	phone.html('');

	var inner = $('<div />');
	inner.addClass('inner');
	phone.append(inner);

	var title = $('<div />');
	title.addClass('title');
	phone.append(title);

	var diagonal = Math.sqrt(sHeight * sHeight + sWidth * sWidth);
	var rWidth = sWidth * sDiagonal / diagonal;
	var rHeight = sHeight * sDiagonal / diagonal;

	inner.width(rWidth + 'in');
	inner.height(rHeight + 'in');

	phone.width(pWidth + 'mm');
	phone.height(pHeight + 'mm');

	phone.css('padding-left', (phone.width() - inner.width()) / 2);
	phone.css('padding-right', (phone.width() - inner.width()) / 2);
	phone.css('padding-top', (phone.height() - inner.height()) / 2);
	phone.css('padding-bottom', (phone.height() - inner.height()) / 2);
	phone.css('z-index', Math.floor(1000000 / Math.sqrt(pWidth * pHeight)));

	title.height((phone.height() - inner.height()) / 2);
	title.css('line-height', ((phone.height() - inner.height()) / 2) + 'px');
	title.text(pTitle);

	phone.width(inner.width());
	phone.height(inner.height());
	phone.animate({'background-color': '#80ff80', 'opacity': 1}, 100, function(){ $(this).animate({'background-color': '#ffffff', 'opacity': 0.5}, 100); });
}

function hidePhone(id)
{
	const phone = $('#phone' + id);
	delete json[phone.attr('title')];
	location.hash = JSON.stringify(json).replaceAll("'", '%27').replaceAll('""', "'");
	phone.remove();
}

try
{
	json = JSON.parse(decodeURI(location.hash).replace('#', ''));

	for (var i in json)
	{
		addPhone(i, json[i]);
	}
}
catch(ex)
{
	addPhone();
}

function inputKeyPress(e)
{
	if (e.keyCode == 10 || e.keyCode == 13)
	{
		$(this).parent().parent().find('input[type=button]').click();
	}
}

$('input[type=text]').keypress(inputKeyPress);
