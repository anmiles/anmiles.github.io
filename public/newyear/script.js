function Model(){
	var model = this;
	model.Seconds = ko.observable('00');
	model.Minutes = ko.observable('00');
	model.Hours = ko.observable('00');
	model.Days = ko.observable('00');
	model.Weeks = ko.observable('00');
	model.ShowWeeks = ko.observable(true);
	model.ShowFireworks = ko.observable(false);

	function countdown() {
		var now = new Date();
		var newYear = new Date(now.getFullYear() + 1, 0, 1);
		var diff = newYear - now;

		if (diff <= 0 || (now.getMonth() === 0 && now.getDate() < 14)) {
			model.ShowFireworks(true);
			return;
		}

		var seconds = Math.floor(diff / 1000);
		var minutes = Math.floor(seconds / 60);
		var hours = Math.floor(minutes / 60);
		var days = Math.floor(hours / 24);
		var weeks = Math.floor(days / 7);

		if (weeks < 5) model.ShowWeeks(false);

		seconds %= 60;
		minutes %= 60;
		hours %= 24;
		if (model.ShowWeeks() === true) days %= 7;

		if (seconds < 10) seconds = "0" + seconds;
		if (minutes < 10) minutes = "0" + minutes;
		if (hours < 10) hours = "0" + hours;
		if (days < 10) days = "0" + days;
		if (weeks < 10) weeks = "0" + weeks;

		model.Seconds(seconds);
		model.Minutes(minutes);
		model.Hours(hours);
		model.Days(days);
		model.Weeks(weeks);
	}

	countdown();
	setInterval(countdown, 1000);
	setInterval(function(){location.reload()}, 3600000);
}

ko.applyBindings(new Model(), document.body);
