window.Uploader =
{
	labels:
	{
		welcome: "Drag and drop file here",
		process: "Processing..."
	},

	styles:
	{
		dropbox:
		{
			width: "425px",
			height: "300px",
			border: "2px solid #DDD",
			MozBorderRadius: "8px",
			WebkitBorderRadius: "8px",
			backgroundColor: "#FEFFEC",
			textAlign: "center",
			color: "#BBB",
		},

		droplabel:
		{
			position: "relative",
			top: "40%"
		}
	},

	processFile: function (e)
	{
		try
		{
			e.stopPropagation(); e.preventDefault();

			Uploader.files = e.dataTransfer.files;
			var count = Uploader.files.length;

			if (count > 0)
			{
				var file = Uploader.files[0];
				Uploader.droplabel.innerHTML = Uploader.labels.process;

				if (Uploader.processText)
				{
					var reader = new FileReader();
					reader.onload = function(e) {Uploader.processText(e.target.result);}
					reader.readAsText(file);
				}

				Uploader.droplabel.innerHTML = Uploader.labels.welcome;
			}
		}
		catch(ex)
		{
			Uploader.droplabel.innerHTML = Uploader.labels.welcome;
			alert(ex);
		}
	},

	activate: function (uploader)
	{
		this.dropHolder = document.getElementById(uploader.dropHolder);
		if (!this.dropHolder) { alert('Uploader error: dropHolder doesn\'t exist!');	return false; }

		if (uploader.labels && uploader.labels.welcome)	{ this.labels.welcome = uploader.labels.welcome; }
		if (uploader.labels && uploader.labels.process)	{ this.labels.process = uploader.labels.process; }
		if (uploader.execute)	{ this.execute = uploader.execute; }
		if (uploader.styles && uploader.styles.dropbox) {for (var s in uploader.styles.dropbox){this.styles.dropbox[s] = uploader.styles.dropbox[s]}}
		if (uploader.styles && uploader.styles.droplabel) {for (var s in uploader.styles.droplabel){this.styles.droplabel[s] = uploader.styles.droplabel[s]}}
		if (uploader.processText){this.processText = uploader.processText};

		this.droplabel = document.createElement('span');
		this.droplabel.id = "idUploaderDropLabel";
		this.droplabel.innerHTML = this.labels.welcome;
		for (s in this.styles.droplabel) { this.droplabel.style[s] = this.styles.droplabel[s]; }

		this.dropbox = document.createElement('div');
		this.dropbox.id = "idUploaderDropBox";
		for (s in this.styles.dropbox) { this.dropbox.style[s] = this.styles.dropbox[s]; }
		this.dropbox.appendChild(this.droplabel);

		this.dropHolder.appendChild(this.dropbox);
		this.dropbox.addEventListener("dragenter", function(e){e.stopPropagation(); e.preventDefault();}, false);
		this.dropbox.addEventListener("dragexit", function(e){e.stopPropagation(); e.preventDefault();}, false);
		this.dropbox.addEventListener("dragover", function(e){e.stopPropagation(); e.preventDefault();}, false);
		this.dropbox.addEventListener("drop", this.processFile, false);

	},

	showMessage: function(string)
	{
		this.droplabel.innerHTML = string;
	}
};
