var confirmPay = {};
confirmPay.isPaySle = false;

confirmPay.init = function() {
	var loadingBg = document.getElementsByClassName('loadingBg')[0];
	loadingBg.style.display = 'block';
	//获取支付方式
	ai.post({
		url: '/PayServer/Pay/GainH5PaymentList',
		data: {
			orderNo: ai.GetQueryString('orderNo')
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				var finPayType = json.Data;
				if(!confirmPay.isWeixin()) {
					for(var i = 0; i < finPayType.length; i++) {
						if(finPayType[i].Id == 16) {
							finPayType.splice(i, 1);
							break;
						}
					}
				}
				ai.repeat({
					view: document.getElementsByClassName("paymentBox__listBox")[0],
					arr: finPayType,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					tem.querySelector('.paymentBox__radio').setAttribute('payType', obj.Id);
					tem.querySelector('.paymentBox__radio').setAttribute('payTypeTxt', obj.Title);
					tem.querySelector('.paymentBox__icon').src = obj.Img_Url;
					tem.querySelector('.paymentBox__text').innerHTML = obj.Title;
					if(obj.Id == 115) {
						tem.querySelector('.paymentBox__radio').id = 'fanka';
					} else if(obj.Id == 14) {
						tem.querySelector('.paymentBox__radio').id = 'aLi';
					}
				}
				loadingBg.style.display = 'none';
				var payList = document.getElementsByClassName('paymentBox__listBox')[0];
				payList.getElementsByTagName('input')[0].checked = 'checked';

			} else if(json.ResultCode == 1009) {
				document.getElementsByClassName('payFooter__btn')[0].setAttribute('onclick', '');
			}
		}
	})

	confirmPay.forOrder = {
		payflowno: ai.GetQueryString('orderNo')
	}
	if(ai.GetQueryString('form') == 1) {
		confirmPay.forOrder.ordertype = 1;
		confirmPay.order_type = 2;
	} else if(ai.GetQueryString('form') == 2) {
		confirmPay.forOrder.ordertype = 2;
		confirmPay.order_type = 3;
	}
	ai.post({
		url: 'PayServer/Pay/GainOrderPay',
		data: confirmPay.forOrder,
		load: function(json) {
			document.getElementsByClassName('orderNo')[0].innerHTML = json.Data.payFlowNo;
			document.getElementsByClassName('payInfo__freight')[0].innerHTML = json.Data.orderExpressFee;
			document.getElementById('totalAmount').innerHTML = '￥' + json.Data.totalAmount;
			document.getElementById('couponAmount').innerHTML = '-￥' + json.Data.couponAmount;
			document.getElementById('elcouponAmount').innerHTML = '-￥' + json.Data.elcouponAmount;
			document.getElementById('orderAmount').innerHTML = '￥' + json.Data.orderAmount;
			document.getElementsByClassName('realPay')[0].innerHTML = json.Data.orderAmount;

			//	初始化隐藏域
			var form = document.getElementsByClassName('payFooter')[0];
			confirmPay.orderInfo = json.Data;
			form.appid.value = ai.ajaxTool.publicdata().appkey;
			form.sub_appid.value = 0;
			form.order_no.value = json.Data.payFlowNo;
			form.order_type.value = confirmPay.order_type;
			form.user_name.value = json.Data.payContactName;
			form.order_subject.value = '购买商品';
			form.version.value = ai.ajaxTool.publicdata().v;
		}
	})

}

confirmPay.doSubmit = function() {
	var paymentList = document.getElementsByClassName('paymentBox__radio'),
		aLiPay = document.getElementById('aLi');
	if(ai.isWeixin() && aLiPay && aLiPay.checked) {
		var aLiTips = document.getElementsByClassName('aLiTips')[0];
		aLiTips.style.display = 'block';
	} else {
		var loadingBg = document.getElementsByClassName('loadingBg')[0],
			fankaSMSBg = document.getElementsByClassName('fankaSMSBg')[0],
			paymentStatu = '',
			paymentTxt = '',
			isSelect = false,
			issuccess = true;
		loadingBg.style.display = 'block';

		if(ai.GetQueryString('form') == 1) {
			confirmPay.url = 'OrderServer/Order/ConfirmH5PayOrder';
			confirmPay.data = {
				payFlowNo: confirmPay.orderInfo.payFlowNo,
			}
		} else if(ai.GetQueryString('form') == 2) {
			confirmPay.url = 'PayServer/Pay/GainH5PayInfo';
			confirmPay.data = {
				orderNo: confirmPay.orderInfo.payFlowNo,
			}
		}

		for(var i = 0; i < paymentList.length; i++) {
			if(paymentList[i].checked) {
				paymentStatu = paymentList[i].getAttribute('paytype');
				paymentTxt = paymentList[i].getAttribute('payTypeTxt');
				confirmPay.data.payment = paymentStatu;
				if(paymentStatu != 115) {
					ai.post({
						url: confirmPay.url,
						data: confirmPay.data,
						load: function(json) {
							if(json.ResultCode == 1000) {
								var form = document.getElementsByClassName('payFooter')[0],
									formAct = document.getElementById('pay_form');
								form.method.value = paymentStatu;
								form.order_body.value = paymentTxt;
								form.paysuccessUrl.value = json.Data.paysuccessUrl;
								form.payfailedUrl.value = json.Data.payfailedUrl;
								var reg = /((https|http|ftp|rtsp|mms):\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/g;
								var host = json.Data.pay_url.match(reg);
								formAct.action = host[0] + '/api/payment/pay.aspx';
								document.getElementById('pay_form').submit();
							} else {
								ai.alert(json.Message);
								issuccess = false;
							}
						}
					})
				} else {
					loadingBg.style.display = 'none';
					fankaSMSBg.style.display = 'block';
				}
				isSelect = true;
				break;
			}
		}
		if(!isSelect) {
			loadingBg.style.display = 'none';
			ai.alert("请选择支付方式！");
			return false;
		}

	}
}
confirmPay.addEvt = function() {
	var getSMSBtn = document.getElementsByClassName('fankaSMS__getBtn')[0],
		cancelBtn = document.getElementsByClassName('fankaSMS__N')[0],
		confirmBtn = document.getElementsByClassName('fankaSMS__Y')[0],
		fankaSMSBg = document.getElementsByClassName('fankaSMSBg')[0],
		loadingBg = document.getElementsByClassName('loadingBg')[0],
		aLiTips = document.getElementsByClassName('aLiTips')[0];
	if(!localStorage.loginjson || localStorage.loginjson == 'null') {
		localStorage.removeItem('loginjson');
		localStorage.removeItem('lnyptoken');
		//		ai.alert('登录信息失效，请重新登录');
	} else {
		var phonenumber = localStorage.loginjson ? JSON.parse(localStorage.loginjson).phone : 0;
	}

	getSMSBtn.addEventListener('click', function(evt) {
		if(evt.currentTarget.dataset.lock == 'off') {
			return false;
		}
		var timeout = 60;
		var inter = setInterval(function() {
			evt.target.innerText = '获取中(' + timeout + ')';
			if(--timeout == 0) {
				confirmPay.clearInt(inter, evt.target);
			}
		}, 1000);
		evt.currentTarget.dataset.lock = 'off';
		ai.post({
			url: 'SmsServer/SMS/SendSmsCode',
			v: false,
			origin: false,
			data: {
				smstype: 4,
				phonenumber: phonenumber
			},
			load: function(json) {
				if(json.ResultCode != 1000) {
					confirmPay.clearInt(inter, evt.target);
				}
				ai.alert(json.Message);
			}
		})
	})

	cancelBtn.addEventListener('click', function(evt) {
		fankaSMSBg.style.display = 'none';
	})

	confirmBtn.addEventListener('click', function(evt) {
		evt.currentTarget.disabled = true;
		var SMSInput = document.getElementsByClassName('fankaSMS__input')[0],
			SMSVal = SMSInput.value;

		if(SMSVal == '' || SMSVal == null) {
			ai.alert('请输入验证码！')
			return false;
		}
		fankaSMSBg.style.display = 'none';
		loadingBg.style.display = 'block';
		evt.currentTarget.disabled = false;
		ai.post({
			url: 'OrderServer/Order/VerifySignCodeToPayOrder',
			data: {
				phonenumber: phonenumber,
				signcode: SMSVal,
				payFlowNo: ai.GetQueryString('orderNo'),
				payment: 115
			},
			load: function(json) {
				loadingBg.style.display = 'none';
				if(json.ResultCode == 1000) {
					location.href = '../../templates/payResult/payResult.html?paysuccess&orderNo=' + ai.GetQueryString('orderNo');
				} else {
					SMSInput.value = '';
					ai.alert(json.Message);
				}
			}
		})
	})
	
	aLiTips.addEventListener('click',function(evt){
		aLiTips.style.display = 'none';
	})
}

confirmPay.isWeixin = function() {
	var ua = window.navigator.userAgent.toLowerCase();
	return ua.match(/MicroMessenger/i) == 'micromessenger' ? 1 : 0;
}

confirmPay.clearInt = function(inte, ele) {
	clearInterval(inte);
	ele.dataset.lock = 'on';
	ele.innerText = '获取验证码';
}

confirmPay.exe = function() {
	confirmPay.init();
	confirmPay.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(confirmPay.exe)
}): ai.ready(confirmPay.exe);