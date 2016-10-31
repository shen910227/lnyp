var search = {};
search.hotWords = ['位元堂', '客家特产', '茂名特产', '悟电池', '新西兰', '美的', '米小胖', '韶关特产', '洋西香', '深圳'];
search.lock = true;

search.addLogEvt = function() {
	var log = document.getElementById("log");
	var logbox = document.getElementById("search-log");
	var sealog = logbox.children;
	var seainp = document.getElementById("inp");
	var clearBtn = document.getElementById("clearHistory");
	seainp.addEventListener('focus', function() {
		log.dataset.judg = false;
		log.classList.remove('hide');
		log.classList.add('show');
		log.style.display = 'block';

		var loglist = localStorage.getItem('lnyp-search-log')
		var logdata = loglist == null ? {
			arr: []
		} : JSON.parse(loglist);
		logbox.innerHTML = '';
		for(var i = 0; i < logdata.arr.length && i < 3; i++) {
			var div = document.createElement('div');
			div.className = 'border-linear-bottom';
			div.innerText = logdata.arr[i];
			div.addEventListener('click', function(evt) {
				seainp.value = evt.currentTarget.innerText;
				search.searchFor();
			})
			logbox.appendChild(div);
		}
	});
	seainp.focus();
	log.addEventListener('webkitAnimationEnd', function(evt) {
		var judg = evt.currentTarget.dataset.judg
		if(judg == true || judg == 'true') {
			log.style.display = 'none';
		}
		if(judg == false || judg == 'false') {
			log.style.display = 'block';
		}
	});
	clearBtn.addEventListener('click', function() {
			document.getElementById('search-log').innerHTML = '';
			localStorage.removeItem('lnyp-search-log');
		})
		//	var menuBtns = document.getElementsByClassName('MenuPub__box');
		//	menuBtns[0].addEventListener('click',function(){
		//		location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + ai.GetQueryString('storeId');
		//	})
		//	menuBtns[2].addEventListener('click',function(){
		//		location.href = '../../templates/find/find.html?storeId=' + ai.GetQueryString('storeId');
		//	})
}

search.searchFor = function() {

	var seainp = document.getElementById("inp");
	if(seainp.value.length == 0) {
		ai.alert('请填写搜索关键字');
	} else {
		var log = document.getElementById("log");
		var loglist = localStorage.getItem('lnyp-search-log')
		var logdata = loglist == null ? {
			arr: []
		} : JSON.parse(loglist);
		var view = document.getElementById("view");
		var judg = true;

		view.dataset.pageindex = 1;
		view.dataset.more = 'on';

		view.innerHTML = '';

		search.getList(seainp.value, 1);

		for(var i = 0; i < logdata.arr.length; i++) {
			if(logdata.arr[i] == seainp.value) {
				judg = false;
			}
		}
		if(judg) {
			logdata.arr.unshift(seainp.value);
		}
		if(logdata.arr.length >= 4) {
			logdata.arr.pop();
		}

		localStorage.setItem('lnyp-search-log', JSON.stringify(logdata));

		log.dataset.judg = true;
		log.classList.remove('show');
		log.classList.add('hide');
	}

}

search.addSearchEvt = function() {
	document.getElementById("smit").addEventListener('click', search.searchFor);
}

search.addScroll = function() {
	document.getElementById("box").addEventListener('scroll', function(evt) {

		var box = evt.currentTarget;
		var view = document.getElementById("view");

		if(box.scrollHeight - (box.scrollTop + box.clientHeight) < 50) {
			if(view.dataset.lock != 'off' && view.dataset.more != 'off') {
				var seainp = document.getElementById("inp");
				if(seainp.value.length == 0) {
					ai.alert('请填写搜索关键字');
				} else {
					view.dataset.lock = 'off';

					var pageIndex = Number(view.dataset.pageindex) + 1;

					search.getList(seainp.value, pageIndex);
					view.dataset.pageindex = pageIndex;
				}

			}
		}
	})
}

search.getList = function(keyword, pageindex) {

	var addele = document.getElementById("addpage"),
		view = document.getElementById("view");
	addele.style.display = 'block';

	ai.post({
		url: 'ProductServer/Product/GetStoreProductList',
		data: {
			storeid: ai.GetQueryString('storeId'),
			pageIndex: pageindex,
			pagesize: 10,
			sequence: 1,
			keywords: keyword
		},
		token: false,
		load: function(json) {

			if(json.ResultCode == 1000) {
				if(json.Data.length != 0) {
					ai.repeat({
						view: view,
						arr: json.Data,
						fun: repeatFun
					})
				} else {
					ai.alert(json.Message);
					view.dataset.more = 'off';
				}
			} else {
				ai.alert(json.Message);
			}

			view.dataset.lock = 'on';
			addele.style.display = 'none';

			function repeatFun(tem, obj) {

				tem.querySelector('[att=img]').src = obj.productImage;
				tem.querySelector('[att=tit]').innerText = obj.productName;
				tem.querySelector('[out=pirce]').outerHTML = obj.productPrice;
				tem.querySelector('[out=cou]').outerHTML = obj.sales;

				var channelcode = ai.GetQueryString('channelcode');
				var citycode = ai.GetQueryString('citycode');
				var activityflag = ai.GetQueryString("activityflag");
				if (activityflag == null || activityflag == "") {
				    tem.addEventListener('click', function (evt) {
				        location.href = obj.previewUrl;
				    })
				}
				else {
				    tem.addEventListener('click', function (evt) {
				        location.href = obj.previewUrl + '&channelcode=' + channelcode + '&citycode=' + citycode + '&activityflag=' + activityflag;
				    })
				}
				

			}

		}
	})

}
search.setHotWords = function() {
	for(var i = 0; i < search.hotWords.length; i++) {
		var hotWordsBox = document.getElementById('search-rec');
		var hotWord = document.createElement('span');
		hotWord.innerHTML = search.hotWords[i];
		hotWord.addEventListener('click', function(evt) {
			var seainp = document.getElementById("inp");
			seainp.value = evt.currentTarget.innerText;
			search.searchFor();
		})
		hotWordsBox.appendChild(hotWord);
	}
}

search.exe = function() {
	//初始化增加店铺ID，购物车用
	if(location.href.indexOf('storeId') == -1) {
		if(localStorage.storeidForCart) {
			location.href = location.href + '?storeId=' + localStorage.storeidForCart;
		} else if(localStorage.loginjson && localStorage.loginjson != 'null') {
			location.href = location.href + '?storeId=' + JSON.parse(localStorage.loginjson).storeid;
		} else {
			location.href = location.href + '?storeId=10375879';
		}
	}
	search.addLogEvt();
	search.addSearchEvt();
	search.addScroll();
	search.setHotWords();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(search.exe)
}): ai.ready(search.exe);