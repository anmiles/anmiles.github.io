function Model(){
    var model = this;
    model.Seconds = ko.observable('');
    model.Minutes = ko.observable('');
    model.Hours = ko.observable('');

    model.TotalSeconds = ko.observable(100);
    model.TotalMinutes = ko.observable(10);
    model.TotalHours = ko.observable(100);

    model.Settings = ko.observable(true);

    model.HideSettings = function(){
        model.Settings(false);
    }

    var offset = new Date().getTimezoneOffset() * 60000;

    function format(rawValue, maxValue) {
        rawValue = rawValue %= maxValue;
        valueString = rawValue.toString();

        for (i = valueString.length; i < (maxValue - 1).toString().length; i ++) {
            valueString = "0" + valueString;
        }

        return valueString;
    }

    function clock() {
        var time = ((new Date().getTime() - offset) % 86400000) * (model.TotalSeconds() * model.TotalMinutes() * model.TotalHours()) / 86400000;

        var seconds = Math.floor(time);
        var minutes = Math.floor(seconds / model.TotalSeconds());
        var hours = Math.floor(minutes / model.TotalMinutes());

        seconds = format(seconds, model.TotalSeconds());
        minutes = format(minutes, model.TotalMinutes());
        hours = format(hours, model.TotalHours());

        model.Seconds(seconds);
        model.Minutes(minutes);
        model.Hours(hours);
    }

    clock();
    setInterval(clock, 50);
    setInterval(function(){location.reload()}, 3600000);
}

ko.applyBindings(new Model(), document.body);
