// TODO: migrate to react

$.getJSON('structure.json', function(data)
{
	for (var i = 0; i < data.length; i ++)
	{
		var row = data[i].id <= 16 ? '.side' : (data[i].id % 2 ? '.left' : '.right') + (data[i].id < 40 ? '1' : '2');
		var label = $('<h3></h3>').html(data[i].id);
		var list = $('<ul></ul>');

		for (var j = 0; j < data[i].items.length; j ++)
		{
			list.append($('<li></li>').html(data[i].items[j]));
		}

		$(row).append($('<div class="cell" data-cell-id="' + data[i].id + '" data-category="' + data[i].category + '"></div>').append(label).append(list));
	}
});
