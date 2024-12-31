function Model(){
	const model = this;

	model.TotalSeconds = ko.observable(0);
	model.TotalMinutes = ko.observable(0);
	model.TotalHours = ko.observable(0);
	model.TotalDays = ko.observable(0);
	model.TotalWeeks = ko.observable(0);

	model.Seconds = ko.observable('00');
	model.Minutes = ko.observable('00');
	model.Hours = ko.observable('00');
	model.Days = ko.observable('00');
	model.Weeks = ko.observable('00');

	model.ShowWeeks = ko.observable(true);
	model.ShowFireworks = ko.observable(false);

	const now = new Date();
	const newYear = new Date(now.getFullYear() + 1, 0, 1);
	const matches = location.search.match(/rest=(\d+)/);

	const adjustSeconds = matches
		? (newYear.getTime() - now.getTime()) / 1000 - parseInt(matches[1])
		: 0;

	function countdown() {
		const now = new Date();
		now.setSeconds(now.getSeconds() + adjustSeconds);
		const diff = newYear - now;

		if (diff <= 0 || (now.getMonth() === 0 && now.getDate() < 14)) {
			model.ShowFireworks(true);
			return;
		}

		let seconds = Math.floor(diff / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);
		let weeks = Math.floor(days / 7);

		model.TotalSeconds(seconds);
		model.TotalMinutes(minutes);
		model.TotalHours(hours);
		model.TotalDays(days);
		model.TotalWeeks(weeks);

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
