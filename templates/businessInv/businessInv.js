var businessInv = {};

businessInv.addEvt = function() {
	var backBtn = document.getElementsByClassName('headerPub__back')[0],
		shareBtn = document.getElementsByClassName('headerPub__img')[0];
	backBtn.addEventListener('click', function() {
		//客户端分享出来链接增加‘client’
		if(location.href.indexOf('client') == -1) {
			if(location.href.indexOf('backnetflow') == -1) {
				if(location.href.indexOf('?') == -1) {
					location.href = location.href + '?backnetflow';
				} else {
					location.href = location.href + '&backnetflow';
				}
			} else {
				location.href = location.href;
			}
		} else {
			history.back();
		}
	})
	if(shareBtn) {
		shareBtn.addEventListener('click', function() {
			if(location.href.indexOf('shareToBrowser') == -1) {
				if(location.href.indexOf('?') == -1) {
					location.href = location.href + '?shareToBrowser';
				} else {
					location.href = location.href + '&shareToBrowser';
				}
			} else {
				location.href = location.href;
			}
		})
	}
}

businessInv.exe = function() {
	if(location.href.indexOf('client') != -1) {
		document.getElementsByClassName('headerPub__img')[0].remove();
	}
	businessInv.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(businessInv.exe)
}): ai.ready(businessInv.exe);