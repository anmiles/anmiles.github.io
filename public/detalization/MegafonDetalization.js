

String.prototype.format = function(data)
{
    return this.replace(/\{([^\}]+)\}/g, function($0, $1){return data[$1];});
}

Uploader.activate(
{
    dropHolder: 'dropboxHolder',

    labels: 
    {
        welcome: "Перетащите сюда файл Детализация_********************.html, заказанный вами по e-mail из личного кабинета",
        process: "Обработка..."
    },

    styles:
    {
        dropbox:
        {
            width: "100%",
            height: "100%",
            border: "none",
            fontSize: "1.2em"
        }
    },

    processText: function(text)
    {
        var data = [];
        var m;
        var headers = {date: "Дата", number: "Контакт", count: "Время", type: "Тип", where: "Местонахождение", value: "Стоимость"};
        
        var myRe = /<tr[\s\S]*?<td[\s\S]*?>(\d+)\.(\d+)\.(\d+)<\/td><td[\s\S]*?>(\d+):(\d+):(\d+)<\/td><td[\s\S]*?>([^<]+?)<\/td><td[\s\S]*?>([^<]+?)<\/td><td[\s\S]*?>([^<]+?)<\/td><td[\s\S]*?>([^<]+?)<\/td><td[\s\S]*?>([^<]+?)<\/td><td[\s\S]*?>([^<]+?)<\/td>/g;

        while ((m = myRe.exec(text)) != null)
        {
            data.push(
            {
                date: "20{3}.{2}.{1} {4}:{5}:{6}".format(m),
                number: m[7] ? m[7] : m[11], 
                count: m[8],
                type: m[9],
                where: m[10],
                value: parseFloat(m[12])
            });
        }
        
        if (!data.length)
        {
            this.showMessage("Нет данных!");
            return;
        }

        window.callData = data;

        addRow = function(pTable, tag, array)
        {
            pTable.push("<tr>");
            for (x in data[0]){ pTable.push("<" + tag + " class='" + x + "'>" + array[x] + "</" +  tag + ">"); }
            pTable.push("</tr>");
        }

        renderTable = function(holderClassName, pTable)
        {
            var htmlTable = document.createElement('table');
            htmlTable.cellPadding = "5";
            htmlTable.cellSpacing = "0";
            htmlTable.border = "1";
            htmlTable.innerHTML = pTable.join('');

            for (var th in htmlTable.rows[0].cells) if (!isNaN(th))
            {
                htmlTable.rows[0].cells[th].onclick = function(e)
                {
                    fillData("dTableHolder", data, this.className);
                }
            }

            div = document.createElement("div");
            div.className = holderClassName;
            div.appendChild(htmlTable);
            document.body.appendChild(div);
        }

        fillData = function(holderClassName, data, sortField)
        {        
            var holders = document.getElementsByClassName(holderClassName);

            for (var h in holders) if (!isNaN(h))
            {
                holders[h].parentNode.removeChild(holders[h]);
            }

            var dTable = [];
            data.sort(function(a, b)
                    { 
                        if (a[sortField] > b[sortField]) return 1;
                        if (a[sortField] < b[sortField]) return -1;
                        return 0;
                    });

            addRow(dTable, "th", headers);    

            for (var d in data) if (!isNaN(d))
            {
                addRow(dTable, "td", data[d]);
            }

            renderTable(holderClassName, dTable);
        }

        
        var hTable = [];
        addRow(hTable, "th", headers);
        renderTable("hTableHolder", hTable);

        fillData("dTableHolder", data, "date");

        Uploader.dropHolder.style.display = "none";
    }
});   
