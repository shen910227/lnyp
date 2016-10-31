var tuwenDetail = {};

tuwenDetail.shouTuwen = function() {
	ai.post({
		url: 'ProductServer/Product/GetProductDetailById',
		data: {
			productId: ai.GetQueryString('proId')
		},
		load: function(json) {
			document.getElementsByClassName('tuwen')[0].innerHTML = json.Data.content;
			var iframes = document.getElementsByClassName('videoPre');
			for(var i = 0; i < iframes.length; i++) {
				ai.iframeInitH(iframes[i]);
			}
			var videoLive = document.getElementsByClassName('mainContent__videoLive');
			for(var i = 0; i < videoLive.length; i++) {
				ai.videoLiveEvt(videoLive[i]);
			}
			if(json.Data.productService != '') {
				document.getElementsByClassName('service')[0].innerHTML = json.Data.productService;
				document.getElementsByClassName('service')[0].style.display = 'block'
			}
		}
	})

}

tuwenDetail.exe = function() {
	tuwenDetail.shouTuwen();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(tuwenDetail.exe)
}): ai.ready(tuwenDetail.exe);