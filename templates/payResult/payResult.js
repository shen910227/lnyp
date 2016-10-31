var payResult = {};

payResult.showInfo = function() {
	var topBg = document.getElementsByClassName('paystatu')[0],
		topImg = document.getElementsByClassName('paystatu__img')[0],
		topTxt = document.getElementsByClassName('paystatu__txt')[0];
	if(location.href.indexOf('paysuccess') != -1) {
		topImg.src = '../../img/icon/pay_banner_success-min.png';
		topTxt.innerHTML = '恭喜，您已成功支付！'
		_czc.push(["_trackEvent", "支付成功", '订单号：' + ai.GetQueryString('orderNo')]);
	} else if(location.href.indexOf('payfailed') != -1) {
		topImg.src = '../../img/icon/pay_banner_lose-min.png';
		topTxt.innerHTML = '支付失败！'
	} else {
		return false;
	}
	if(location.href.indexOf('orderNo') != -1) {
		ai.post({
			url: 'OrderServer/Order/GainOrder',
			data: {
				orderNo: ai.GetQueryString('orderNo')
			},
			load: function(json) {
				if(json.ResultCode == 1000 && json.Data) {
					var orderNo = document.getElementsByClassName('orderNo')[0],
						logistical = document.getElementsByClassName('orderInfo__logistical')[0],
						name = document.getElementsByClassName('orderInfo__name')[0],
						Tel = document.getElementsByClassName('orderInfo__Tel')[0],
						addr = document.getElementsByClassName('orderInfo__addr')[0],
						total = document.getElementsByClassName('total')[0],
						btn = document.getElementsByClassName('btn')[0];
					orderNo.innerHTML = json.Data.orderNo;
					if(json.Data.customer.consignee != '' && json.Data.customer.phoneNumber != '') {
						name.innerHTML = json.Data.customer.consignee;
						Tel.innerHTML = json.Data.customer.phoneNumber;
						addr.innerHTML = json.Data.customer.deliveryAddress;
						logistical.style.display = 'block';
					} else {
						logistical.remove();
					}
					total.innerHTML = json.Data.RealAmount;
					btn.setAttribute('storeid', json.Data.storeid);
				} else {
					topTxt.style.fontSize = '16px';
					topTxt.innerHTML = '订单查询失败，请到订单中心查看订单！'
				}
			}
		})
	}
}

payResult.addEvt = function() {
	var btn = document.getElementsByClassName('btn')[0],
		backBtn = document.getElementsByClassName('header__back')[0];
	btn.addEventListener('click', function(evt) {
		if(evt.currentTarget.getAttribute('storeid') == "10375879") {
			//官方店铺跳到活动页面
			location.href = '../../templates/shopDetails/shopDetails.html?storeId=10459040';
		} else {
			location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + evt.currentTarget.getAttribute('storeid');
		}
	})
}
payResult.exe = function() {
	payResult.showInfo();
	payResult.addEvt();
	localStorage.removeItem('pId_skuId_qty');
	localStorage.removeItem('proList');
	localStorage.removeItem('proForCoupon');

}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(payResult.exe)
}): ai.ready(payResult.exe);