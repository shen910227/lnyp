var shopDetals = {};

shopDetals.lock = true;
//每页请求个数
shopDetals.pagesize = 10;

/* 请求店铺信息  */
shopDetals.getStoreInfo = function() {
	if(ai.GetQueryString('storeId')) {
		var storeId = ai.GetQueryString('storeId');
	} else {
		location.search = '?storeId=10375879';
		storeId = 10375879;
	};
	ai.post({
		url: 'StoreServer/StoreBackgroundSet/GainBackgroundInfoWithH5',
		token: false,
		data: {
			storeId: storeId,
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				document.querySelector('.shop-show__photo').style.backgroundImage = 'url(' + json.Data.StoreInfo.Logo + ')';
				document.querySelector('[value=storeName]').innerHTML = json.Data.StoreInfo.StoreName;
				document.title = json.Data.StoreInfo.StoreName;
				//增加iframe让微信强制刷新,修改title
				var iframe = document.createElement('iframe');
				iframe.src = "../../img/icon/tabs_completed_selceted@3x-min.png";
				document.body.appendChild(iframe);
				setTimeout(function() {
					iframe.remove();
				}, 200);
			} else {
				document.querySelector('[url=storeLogo]').src = '../../img/icon/logo3x-min.png';
				document.querySelector('[value=storeName]').innerHTML = '';
			}

		}
	});
	//如果已经登录不显示我要开店按钮
	if(localStorage.lnyptoken && localStorage.loginjson) {
		document.getElementsByTagName('button')[0].className = 'shop-btnNone';
	};

}

/* 请求店铺商品   */
shopDetals.getProList = function() {
	if(ai.GetQueryString('storeId')) {
		var storeId = ai.GetQueryString('storeId');
	} else {
		storeId = 10375879;
	}
	ai.post({
		url: 'ProductServer/Product/GetStoreProductList',
		token: false,
		data: {
			categoryId: 0,
			pageindex: shopDetals.pageindex,
			sort: 2,
			pagesize: shopDetals.pagesize,
			sequence: 0,
			storeid: storeId
		},
		load: loadFun
	})

	/* 判断请求返回为0时，清除滚动事件，去除上拉加载事件   */
	function loadFun(json) {
		ai.repeat({
			view: document.getElementById("pro-list"),
			arr: json.Data,
			fun: repeatFun
		})

		function repeatFun(tem, obj) {
			tem.querySelector('[url=productImage]').src = obj.productImage;
			tem.querySelector('[url=productImage]').onerror = function() {
				this.src = '../../img/paid/move1.svg';
			}
			tem.querySelector('[value=productName]').innerHTML = obj.productName;
			tem.querySelector('[value=productPrice]').innerHTML = '￥' + obj.productPrice;
			tem.querySelector('[value=sales]').innerHTML = '已售' + obj.sales;

			var channelcode = ai.GetQueryString('channelcode');
			var citycode = ai.GetQueryString('citycode');
			var activityflag = ai.GetQueryString("activityflag");
			if(activityflag == null || activityflag == "") {
				tem.addEventListener('click', function() {
					location.href = obj.previewUrl;
				})
			} else {
				tem.addEventListener('click', function() {
					location.href = obj.previewUrl + '&channelcode=' + channelcode + '&citycode=' + citycode + '&activityflag=' + activityflag;
				})
			}
		}
		if(json.Data.length >= shopDetals.pagesize) {
			shopDetals.getMore();
			document.getElementsByClassName('loadTip')[0].innerHTML = '加载更多中...';
		} else {
			onscroll = null;
			document.getElementsByClassName('loadTip')[0].innerHTML = '没有更多商品~';
		}
		shopDetals.lock = true;
	}
}

/* 添加购物车和订单的跳转 */
shopDetals.addShopEvt = function() {
	document.getElementsByClassName('product-top__gotoCart')[0].addEventListener('click', function() {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			location.href = '../../templates/shoppingCart/shoppingCart.html';
		} else {
			localStorage.removeItem('loginjson');
			localStorage.removeItem('lnyptoken');
			if(!document.getElementById('loginBox')) {
				ai.pubGetLogin();
			} else {
				_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
				document.getElementById('login').className = 'show';
			}
		}
	})
	document.getElementsByClassName('product-top__gotoOrder')[0].addEventListener('click', function() {
		location.href = '../../templates/orderCenter/orderCenter.html';
	})

	document.getElementsByClassName('product-top__gotoSearchB')[0].addEventListener('click', function() {
		var channelcode = ai.GetQueryString("channelcode");
		var citycode = ai.GetQueryString("citycode");
		var activityflag = ai.GetQueryString("activityflag");
		if(activityflag == null) {
			location.href = '../../templates/search/search.html?storeId=' + ai.GetQueryString('storeId');
		} else {
			location.href = '../../templates/search/search.html?storeId=' + ai.GetQueryString('storeId') + "&channelcode=" + ai.GetQueryString("channelcode") + "&citycode=" + ai.GetQueryString("citycode") + "&activityflag=" + ai.GetQueryString("activityflag");
		}

	})

	document.getElementById('openShop').addEventListener('click', function() {
		localStorage.loginBtnType = "signup";
		localStorage.removeItem('loginjson');
		localStorage.removeItem('lnyptoken');
		if(!document.getElementById('loginBox')) {
			ai.pubGetLogin();
		} else {
			localStorage.removeItem('loginBtnType');
			_czc.push(["_trackEvent", "登录&注册","打开注册弹出层"]);
			document.getElementById('reg').className = 'show';
		}
	})

}

/* 上拉加载更多  */
shopDetals.getMore = function() {
	onscroll = function() {
		if(shopDetals.lock) {
			shopDetals.lock = false;
			var a = ai.getScrollTop() + ai.getWindowHeight() + 20;
			var b = ai.getScrollHeight();
			if(a > b) {
				shopDetals.pageindex++;
				shopDetals.getProList();
			} else {
				shopDetals.lock = true;
			}
		}
	};
}

shopDetals.addViewStore = function() {
	//浏览次数加1
	var channelcode = ai.GetQueryString('channelcode');
	var citycode = ai.GetQueryString('citycode');
	var activityflag = ai.GetQueryString("activityflag");
	var storeid = ai.GetQueryString('storeId');
	var pageurl = window.location.href;
	var url = "/tools/cmcc_ajax.ashx"; //GetApiUrl(webApi.AddStoreStatistic);
	var postData = {
		"type": "store",
		"channelcode": channelcode,
		"citycode": citycode,
		"activityflag": activityflag,
		"storeid": storeid,
		"pageurl": pageurl
	};
	//  $.ajax({
	//      type: "post",
	//      url: url,
	//      data: postData,
	//      dataType: "json",
	//      error: function (XMLHttpRequest, textStatus, errorThrown) {
	//          //$.AlertLoad('尝试发送失败，错误信息：' + errorThrown, "url");
	//      },
	//      success: function (data, textStatus) {
	//
	//      }
	//  });

	ai.post({
		url: url,
		data: postData,
		baseURL: 99,
		load: function(json) {}
	})
}

shopDetals.exe = function() {
	shopDetals.pageindex = 1;
	localStorage.storeidForCart = ai.GetQueryString('storeId');
	shopDetals.getStoreInfo();
	shopDetals.getProList();
	shopDetals.addShopEvt();
	shopDetals.addViewStore();
	_czc.push(["_trackEvent", "店铺页面", '店铺ID：' + ai.GetQueryString('storeId')]);
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(shopDetals.exe)
}): ai.ready(shopDetals.exe);