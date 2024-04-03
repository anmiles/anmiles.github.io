var cellSize = 30;
var cells = {};
var currentWord = null;
var crosswordHistory = [];

function addCell(word, i) {
	var x = word.direction === 0 ? word.start[0] + i : word.start[0];
	var y = word.direction === 1 ? word.start[1] + i : word.start[1];
	var cell = cells[[x, y]];
	var style = {width: cellSize, height: cellSize, left: x * cellSize, top: y * cellSize};

	if (!cell) {
		cell = $('<div contenteditable></div>').css(style).appendTo('.crossword').get(0);
		cell.position = [x, y];
		cell.words = [];
		cells[[x, y]] = cell;
	}

	cell.words.push(word);

	if (i === 0) $('<i></i>').css(style).text(word.id).appendTo('.crossword');
}

function writeHistory(ev) {
	crosswordHistory.push({event: ev.type, cell: ev.currentTarget.position, value: ev.currentTarget.innerHTML, key: ev.originalEvent.key});
}

function load(json) {
	$('.load').hide();
	var size = [0, 0];

	json.forEach(function(word) {
		size[0] = Math.max(size[0], word.start[0] + word.length * (1 - word.direction));
		size[1] = Math.max(size[1], word.start[1] + word.length * word.direction);

		for (var i = 0; i < word.length; i ++) {
			addCell(word, i);
		}
	});

	$('.crossword').width(size[0] * cellSize).height(size[1] * cellSize).css({'font-size': cellSize + 'px'});

	$('.crossword [contenteditable]')
		.on('focus', function(ev) {
			$('.history').hide();
			writeHistory(ev);

			$('.questions').html(this.words.map(function(word) {
				return word.id + '. ' + word.question;
			}).join('<br />'));
		}).on('keydown paste', function(ev) {
			writeHistory(ev);

			if($(this).text().length === 1 && ev.keyCode !== 8) {
				$(this).text('');
			}
		}).on('keyup', function(ev) {
			writeHistory(ev);
			var cell = this;
			if($(cell).text().length === 0 && ev.keyCode !== 8) return;

			if (cell.words.length === 1) {
				currentWord = cell.words[0];
			}
			else {
				var newWord = null;
				var canContinueCurrentWord = false;

				cell.words.forEach(function(word) {
					if (word === currentWord) canContinueCurrentWord = true;

					if (word.start[word.direction] + word.length - 1 !== cell.position[word.direction]) {
						newWord = word;
					}
				});

				if (newWord != currentWord && !canContinueCurrentWord) {
					currentWord = newWord;
				}
			}

			newPosition = [cell.position[0], cell.position[1]];
			newPosition[currentWord.direction] += (ev.keyCode === 8 ? -1 : 1);

			if(newPosition[currentWord.direction] >= 0 && newPosition[currentWord.direction] < currentWord.start[currentWord.direction] + currentWord.length) {
				cells[newPosition].innerHTML = '';
				cells[newPosition].focus();
			}
		});
}

$('.load a').click(function(){
	var input = prompt('Insert crossword JSON here');
	var json = null;

	try {
		load(JSON.parse(input));
	} catch {
		alert('Bad JSON');
	}
});

$('.debug a').click(function(){
	var textarea = $('.history');

	if (textarea.is(':visible')) {
		textarea.hide();
	} else {
		textarea.val(JSON.stringify(crosswordHistory)).show().focus();
	}
});

(function(){
	var match = location.search.match(/id=(\d+)/);
	if (!match) return;

	var id = parseInt(match[1]);
	if (isNaN(id)) return;

	$.get('data/' + id + '.json', load);
})();
