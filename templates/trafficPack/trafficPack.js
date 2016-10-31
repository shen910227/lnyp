var trafficPack = {};

trafficPack.cashing = function() {
	document.getElementById("dh-but").addEventListener('click', function() {
	    location.href = '../exchange/gift.html';
	    //ai.alert('正在操作');
		//var id = localStorage.lnyppaidno;

		//ai.post({
		//	url: 'CouponServer/CMCCFlow/ExchangeCmccFlow',
		//	data: {
		//		id: id,
		//	},
		//	load: function(json) {
		//		ai.confirm(json.Message, '返回', function() {
		//			history.back();
		//		})
		//	}
		//});
	})
	document.getElementById("zz-but").addEventListener('click', function() {
		location.href = '../gift/gift.html';
	})
}

trafficPack.getData = function() {
	if(localStorage.lnyppaidm){
		document.getElementById("paid-name").innerText = localStorage.lnyppaidm;
	}
	
	document.getElementById("date").innerText =localStorage.lnypetime;
}

trafficPack.exe = function() {
	trafficPack.cashing();
	trafficPack.getData();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(trafficPack.exe)
}): ai.ready(trafficPack.exe);