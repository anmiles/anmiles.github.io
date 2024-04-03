var Dictionary =
	{
		title: "Мои Встречи",
		tab_future: "Будущие встречи",
		tab_past: "Прошедшие встречи",
		refresh: "Обновить",
		calendar_add_google: "Добавить в Google Calendar",
		calendar_add_ical: "Добавить в Apple Calendar",
		calendar_add_outlook: "Добавить в Outlook Calendar",
		invite_friends: "Пригласить друзей",
		feedback: "Отзывы и предложения",
		months_0: "января",
		months_1: "февраля",
		months_2: "марта",
		months_3: "апреля",
		months_4: "мая",
		months_5: "июня",
		months_6: "июля",
		months_7: "августа",
		months_8: "сентября",
		months_9: "октября",
		months_10: "ноября",
		months_11: "декабря",
		days_0: "воскресенье",
		days_1: "понедельник",
		days_2: "вторник",
		days_3: "среда",
		days_4: "четверг",
		days_5: "пятница",
		days_6: "суббота",
		members_title_0: "участник",
		members_title_1: "участника",
		members_title_2: "участников",
		date_format_vk: "{date} {month} {year} в {hour}:{minute} ({day})",
		date_format_export: "{year}{month}{date}T{hour}{minute}{second}",
		exception: "Не удаётся запросить VK API.\r\nПожалуйста, сообщите администратору приложения.\r\nТекст ошибки: {0}.",
		box_title: "Приложение обновлено!"
	};

	document.title = Dictionary.title;

/* Helpers */

String.prototype.Translites =
{
	lat: 'qwertyuiop[]asdfghjkl;\'zxcvbnm,./',
	cyr: 'йцукенгшщзхъфывапролджэячсмитьбю.',
}

String.prototype.getTranslit = function(from, to)
{
	var result = [];

	for (var i = 0; i < this.length; i ++)
	{
		result.push(this.Translites[to][this.Translites[from].indexOf(this[i])]);
	}

	return result.join('');
}

String.prototype.getTranslits = function()
{
	return [
		this,
		this.getTranslit('lat', 'cyr'),
		this.getTranslit('cyr', 'lat')
	];
}

String.prototype.clean = function(str)
{
	return this.replace(/[^A-Za-zА-Яа-я0-9]+/g, ' ').toLowerCase();
}

String.prototype.format = function(data)
{
	return this.replace(/\{([^\}]+)\}/g, function($0, $1){ return data[$1];});
}

String.prototype.pad = function(len, symbol, from_right)
{
	var str = '' + this.toString();

	while (str.length < len)
	{
		str = !from_right ? symbol + str : str + symbol;
	}

	return str;
}

Number.prototype.pad = function(len, symbol, from_right)
{
	return this.toString().pad(len, symbol, from_right);
}

Number.prototype.decline = function(titles)
{
	cases = [2, 0, 1, 1, 1, 2];
	return titles[ (this % 100 > 4 && this % 100 < 20) ? 2 : cases[ (this % 10 < 5) ? this % 10 : 5] ];
}

Date.prototype.getLocalizedMonth = function()
{
	return Dictionary['months_' + this.getMonth()];
}

Date.prototype.getLocalizedDay = function()
{
	return Dictionary['days_' + this.getDay()];
}

Date.prototype.getLocalizedDateString = function()
{
	return Dictionary.date_format_vk.format(
	{
		date: this.getDate(),
		month: this.getLocalizedMonth(),
		year: this.getFullYear(),
		hour: this.getHours(),
		minute: this.getMinutes().pad(2, 0),
		day: this.getLocalizedDay()
	});
}

Date.prototype.toExportDate = function()
{
	return Dictionary.date_format_export.format(
	{
		year: this.getFullYear().pad(4, 0),
		month: (this.getMonth() + 1).pad(2, 0),
		date: this.getDate().pad(2, 0),
		hour: this.getHours().pad(2, 0),
		minute: this.getMinutes().pad(2, 0),
		second: this.getSeconds().pad(2, 0)
	});
}

/* Utilities */

function getWindowHeight()
{
	return 113 + 121 * Math.max(window.eventsCount[window.apiFirstResult.section], 4);
}

function showException(ex)
{
	alert(Dictionary.exception.format([ex.toString()]));
}

function calculateOpacity(clicked)
{
	return clicked ? 0.16 : 1;
}

/* MVVM */

function EventItem(apiItem)
{
	var start_date = new Date(apiItem.start_date * 1000);
	var finish_date = new Date(apiItem.finish_date * 1000);
	var self = this;
	self.id = apiItem.id;
	self.name = $('<div/>').html(apiItem.name).text();
	self.photo_medium = apiItem.photo_medium;

	self.ko_start_date = start_date.getLocalizedDateString();
	self.ko_members_count = apiItem.members_count + ' ' + apiItem.members_count.decline([Dictionary.members_title_0, Dictionary.members_title_1, Dictionary.members_title_2]);
	self.ko_url = '/event' + apiItem.id;
	self.ko_calendar_opacity = calculateOpacity(apiItem.calendarClicked);

	window.exportData = window.exportData || {};
	window.exportData[apiItem.id] = {
		title: self.name,
		title_encoded: encodeURIComponent(self.name),
		start_date: start_date.toExportDate(),
		finish_date: finish_date.toExportDate(),
		website: 'https://vk.com/event' + apiItem.id
	};

	self.ko_ical_calendar_url = "javascript: openIcalendar({0})".format([self.id]);
	self.ko_google_calendar_url = "javascript: openGoogleCalendar({0})".format([self.id]);
}

function EventsViewModel()
{
	var self = this;
	self.FutureEvents = ko.observableArray([]);
	self.PastEvents = ko.observableArray([]);

	self.addFutureEvents = function (apiEvents)
	{
		for (var i = 0; i < apiEvents.length; i ++)
		{
			self.FutureEvents.push(new EventItem(apiEvents[i]));
		}
	}

	self.addPastEvents = function (apiEvents)
	{
		for (var i = 0; i < apiEvents.length; i ++)
		{
			self.PastEvents.push(new EventItem(apiEvents[i]));
		}
	}
}

/* Application */

function loadApp(autoResize)
{
	$('#main-container').hide();
	showLoading();
	if (autoResize) resizeWindow();
	checkSettings();

	VK.api('groups.get',
		{
			extended: 1,
			fields: 'members_count,start_date,finish_date'
		},
		function(data)
		{
			if (data.response)
			{
				loadData(data.response.items);
			}

			hideLoading();
		}
	);
}

function checkSettings()
{
	var requiredSettings = 262144;
	if (!window.apiFirstResult.menu_notified[0].value) requiredSettings |= 256;
	VK.api('storage.set', {key: 'menu_notified', value: true});

	if ((window.apiFirstResult.settings & requiredSettings) != requiredSettings)
	{
		VK.callMethod('showSettingsBox', requiredSettings);
		VK.api('setNameInMenu', {name: Dictionary.title});
	}
}

function loadData(apiItems)
{
	var date = new Date().getTime();

	var eventsViewModel = new EventsViewModel();

	var apiFutureEvents = [];
	var apiPastEvents = [];
	window.calendarClicked = window.apiFirstResult.calendar_clicked[0].value.split(',');
	var calendarClickedNew = [];

	for (var i = 1; i < apiItems.length; i ++)
	{
		var id36 = apiItems[i].id.toString(36);

		if (apiItems[i].type == 'event')
		{
			if (apiItems[i].start_date * 1000 > date)
			{
				if (window.calendarClicked.indexOf(id36) != -1)
				{
					apiItems[i].calendarClicked = true;
					calendarClickedNew.push(id36);
				}

				apiFutureEvents.push(apiItems[i]);
			}
			else
			{
				apiItems[i].calendarClicked = true;
				apiPastEvents.push(apiItems[i]);
			}
		}
	}

	window.calendarClicked = calendarClickedNew;
	setCalendarClicked();

	apiFutureEvents.sort(function(e1, e2){ return e1.start_date - e2.start_date; })
	apiPastEvents.sort(function(e1, e2){ return e2.start_date - e1.start_date; })

	eventsViewModel.addFutureEvents(apiFutureEvents);
	eventsViewModel.addPastEvents(apiPastEvents);
	window.eventsCount = {'future': apiFutureEvents.length, 'past' : apiPastEvents.length};
	ko.applyBindings(eventsViewModel);
	switchSection(window.apiFirstResult.section);
	$('#main-container').show();
	checkVersion();
}

function checkVersion()
{
	var version = Math.abs($('#update-template').attr('data-current-version'));

	if (isNaN(window.apiFirstResult.current_version[0].value) || Math.abs(window.apiFirstResult.current_version[0].value) < version)
	{
		VK.api('storage.set', {key: 'current_version', value: version});
		showUpdateBox();
	}
}

/* Events */

function switchSection(section)
{
	if (!section) section = 'future';
	if (section != 'future' && section != 'past') return;

	window.apiFirstResult.section = section;
	resizeWindow(section);
	VK.api('storage.set', {key: 'section', value: section});
	VK.callMethod('setLocation', section, false);

	$('.events_list').hide();
	$('#events_list_' + section).show();

	$('.switch_tab').removeClass('summary_tab_sel').addClass('summary_tab');
	$('#switch_tab_' + section).removeClass('summary_tab').addClass('summary_tab_sel');
}

function resizeWindow(section)
{
	if (window.eventsCount && section)
	{
		VK.callMethod('resizeWindow', 607, getWindowHeight());
	}
	else
	{
		VK.callMethod('resizeWindow', 607, 597);
	}
}

function checkEvent(e)
{
	return ((e = (e || window.event))
			&& (e.type == 'click' || e.type == 'mousedown' || e.type == 'mouseup')
			&& (e.which > 1 || e.button > 1 || e.ctrlKey || e.shiftKey || e.metaKey)
			) || false;
}

function updateSearch()
{
	if (!$('#groups_list_search').val().replace(/\s+/g, '').length)
	{
		resetSearch();
		return;
	}

	$('#groups_reset_search').hide();
	$('#groups_loading').show();
	if (window.searchTimeout) window.clearTimeout(window.searchTimeout);

	window.searchTimeout = window.setTimeout(function()
	{
		var searchString = $('#groups_list_search').val().clean();
		var translits = searchString.getTranslits();

		window.matchedEvents = $('.group_list_row').filter(function(index)
		{
			for (var i = 0; i < translits.length; i ++)
			{
				if (translits[i].length)
				{
					if ($(this).attr('data-event-name').indexOf(translits[i]) != -1)
					{
						return true;
					}
				}
			}

			return false;
		});

		$('.group_list_row').hide();
		window.matchedEvents.show();
		$('#groups_loading').hide();
		$('#groups_reset_search').show();

	}, 100);
}

function resetSearch()
{
	$('#groups_list_search').val('');
	$('#groups_reset_search').hide();
	$('.group_list_row').show();
}

function openIcalendar(id)
{
	try
	{
		shadeCalendarButtons(id);
		addCalendarClicked(id.toString(36));
		ifrm = document.createElement("iframe");
		ifrm.src = 'data:text/calendar;base64,' + Base64.encode('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nX-ORIGINAL-URL:{website}\r\nBEGIN:VEVENT\r\nDTSTART:{start_date}\r\nDTEND:{finish_date}\r\nSUMMARY:{title}\r\nURL:{website}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n'.format(window.exportData[id]));
		ifrm.style.width = "0px";
		ifrm.style.height = "0px";
		ifrm.style.display = "none";
		document.body.appendChild(ifrm);
	}
	catch(ex)
	{
		showException(ex);
	}
}

function openGoogleCalendar(id)
{
	try
	{
		shadeCalendarButtons(id);
		addCalendarClicked(id.toString(36));
		window.open("//www.google.com/calendar/event?action=TEMPLATE&text={title_encoded}&dates={start_date}/{finish_date}&details={website}".format(window.exportData[id]));
	}
	catch(ex)
	{
		showException(ex);
	}
}

function addCalendarClicked(id36)
{
	if (window.calendarClicked.indexOf(id36) != -1) return;

	var calendarClickedNew = window.calendarClicked;
	calendarClickedNew.push(id36);

	if (calendarClickedNew.join(',').length <= 4096)
	{
		window.calendarClicked = calendarClickedNew;
		setCalendarClicked();
	}
}

function setCalendarClicked()
{
	VK.api('storage.set', {key: 'calendar_clicked', value: window.calendarClicked.join(',')});
}

function shadeCalendarButtons(id)
{
	$('#calendar_add' + id).attr("style", "opacity: {0}".format([calculateOpacity(1)]));
}

function showUpdateBox()
{
	$('#box_layer_bg').show();
	$('#box_layer_wrap').show();
}

function hideUpdateBox()
{
	$('#box_layer_bg').hide();
	$('#box_layer_wrap').hide();
}

function showLoading()
{
	$('body').addClass('loading');
}

function hideLoading()
{
	$('body').removeClass('loading');
}

/* Entry point */

try
{
	var result = /\&api_result=(.*?)(\&|$)/.exec(location.search);
	window.apiFirstResult = JSON.parse(decodeURIComponent(result[1])).response

	window.userId = /&viewer_id=(\d+)/.exec(location.search)[1];
	VK.addCallback('onLocationChanged', switchSection);
	VK.init(loadApp);
}
catch (ex)
{
	hideLoading();
	showException(ex);
}
