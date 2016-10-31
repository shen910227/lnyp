var orderCenter = {};

orderCenter.addEvt = function() {

	document.getElementById("show-login").addEventListener('click', function() {
		localStorage.loginBtnType = "login";
		orderCenter.login('login');
	})

	document.getElementById("show-rig").addEventListener('click', function() {
		localStorage.loginBtnType = "signup";
		orderCenter.login('reg');
	})

	var orderTypes = ['payment', 'delivery', 'receipt', 'complete', 'refund'];
	var orderBtnsBox = document.getElementsByClassName('box')[0];
	var orderBtns = orderBtnsBox.children;
	for(var i = 0; i < orderBtns.length; i++) {
		var index = i;
		orderBtns[i].addEventListener('click', function() {
			if(localStorage.lnyptoken && localStorage.loginjson) {
				location.href = '../../templates/myOrder/myOrder.html#' + orderTypes[this.getAttribute('type')];
			} else {
				orderCenter.login('login');
			}
		})
	}

	document.getElementsByClassName('gotoMyOrder')[0].addEventListener('click', function() {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			location.href = '../../templates/myOrder/myOrder.html';
		} else {
			orderCenter.login('login');
		}
	})

	document.getElementById('address').addEventListener('click', function() {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			location.href = '../../templates/address/address.html';
		} else {
			orderCenter.login('login');
		}
	})

	document.getElementById('pain').addEventListener('click', function() {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			location.href = '../../templates/paid/paid.html?origin=4';
		} else {
			orderCenter.login('login');
		}
	})
	document.getElementById('coupon').addEventListener('click', function() {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			location.href = '../../templates/coupon/coupon.html';
		} else {
			orderCenter.login('login');
		}
	})

	var user = document.getElementsByClassName('user')[0];
	user.addEventListener('click', function() {
		var storeid = localStorage.loginjson ? JSON.parse(localStorage.loginjson).storeId : 0;
		location.href = '../shopDetails/shopDetails.html?storeId=' + storeid;
	})
	var myMenus = document.getElementsByClassName('menuBox__item');
	myMenus[0].addEventListener('click', function() {
		if(!localStorage.loginjson || localStorage.loginjson == 'null') {
			ai.alert('当前为注销状态~');
		} else {
			document.getElementById('logout').className = 'show';
		}

	})
	var logoutY = document.getElementsByClassName('logout__yes')[0];
	var logoutN = document.getElementsByClassName('logout__no')[0];
	logoutY.addEventListener('click', function() {
		localStorage.clear();
		location.reload();
	});
	logoutN.addEventListener('click', function() {
		document.getElementById('logout').className = 'hide';
	});
	var myMenus = document.getElementsByClassName('menuBox__item');
	myMenus[0].addEventListener('click', function() {
		if(!localStorage.loginjson || localStorage.loginjson == 'null') {
			ai.alert('当前为注销状态~');
		} else {
			document.getElementById('logout').className = 'show';
		}

	})
	var logoutY = document.getElementsByClassName('logout__yes')[0];
	var logoutN = document.getElementsByClassName('logout__no')[0];
	logoutY.addEventListener('click', function() {
		localStorage.clear();
		location.reload();
	});
	logoutN.addEventListener('click', function() {
		document.getElementById('logout').className = 'hide';
	});
}

//获取订单数量
orderCenter.orderCount = function() {
	if(localStorage.lnyptoken && localStorage.loginjson) {
		ai.post({
			url: '/OrderServer/Order/GainMyOrderCount',
			data: {},
			load: function(json) {
				var orderCount = document.getElementsByClassName('orderCount');
				if(json.Data.nopaycount != 0) {
					orderCount[0].innerHTML = json.Data.nopaycount;
					orderCount[0].style.display = 'block';
				}
				if(json.Data.shippedcount != 0) {
					orderCount[1].innerHTML = json.Data.shippedcount;
					orderCount[1].style.display = 'block';
				}
				if(json.Data.sendedcount != 0) {
					orderCount[2].innerHTML = json.Data.sendedcount;
					orderCount[2].style.display = 'block';
				}
			}
		})
	}
}

//登录方法
orderCenter.login = function(id) {
	localStorage.removeItem('loginjson');
	localStorage.removeItem('lnyptoken');
	if(!document.getElementById('loginBox')) {
		ai.pubGetLogin();
	} else {
		localStorage.removeItem('loginBtnType');
		document.getElementById(id).className = 'show';
	}
	if(id == 'login') {
		_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
	} else if(id == 'reg') {
		_czc.push(["_trackEvent", "登录&注册", "打开注册弹出层"]);
	}

}

orderCenter.autologin = function() {
	if(localStorage.lnyptoken && localStorage.loginjson && localStorage.loginjson != 'null') {
		var data = JSON.parse(localStorage.loginjson);
		var view = document.querySelector('#userdata .user');
		var buts = document.querySelector('#userdata .buts');
		view.querySelector('.img').src = data.storeLogo;
		view.querySelector('[att=storeName]').innerText = data.storeName;
		document.querySelector('#userdata .user').classList.add('show');
		buts.classList.remove('show');
	}
}

orderCenter.exe = function() {
	if(localStorage.lnyptoken && localStorage.loginjson) {
		document.getElementsByClassName('menuBox__item')[0].style.display = 'block';
	}
	orderCenter.orderCount();
	orderCenter.autologin();
	orderCenter.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(orderCenter.exe)
}): ai.ready(orderCenter.exe);