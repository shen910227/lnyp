var app = {};

app.addHeaderBackEvt = function() {
	var but = document.getElementsByClassName("back-but").item(0);
	if (but != null) {
		but.addEventListener('click', function() {
			history.back();
		});
	}
}

app.exe = function() {
	app.addHeaderBackEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(app.exe)
}): ai.ready(app.exe);