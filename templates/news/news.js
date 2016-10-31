var news = {};

news.shouNews = function() {
	ai.post({
		url: 'ProductServer/Artivities/GainNewsInfo',
		data: {
			id: ai.GetQueryString('id')
		},
		load:function(json){
			document.body.innerHTML = json.Data.Sescription;
		}
	})
	
}

news.exe = function() {
	news.shouNews();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(news.exe)
}): ai.ready(news.exe);