var orderDetails = {};

orderDetails.getDetails = function(no) {
	ai.post({
		url: 'OrderServer/Order/GainOrder',
		data: {
			orderNo: no
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				var orderStatus = document.getElementsByClassName('topInfo__status')[0],
					orderNo = document.getElementsByClassName('topInfo__orderNo')[0],
					comOrderTime = document.getElementsByClassName('topInfo__comOrderT')[0],
					payOrderTimeBox = document.getElementsByClassName('topInfo__payOrderBox')[0],
					payOrderTime = document.getElementsByClassName('topInfo__payOrderT')[0],
					name = document.getElementsByClassName('addressBox__topName')[0],
					TEl = document.getElementsByClassName('addressBox__topTel')[0],
					address = document.getElementsByClassName('addressBox__addr')[0],
					shopNameBox = document.getElementsByClassName('orderMain__topName')[0],
					shopName = document.getElementsByClassName('orderMain__name')[0],
					proList = document.getElementsByClassName('orderMain__proList')[0],
					footer = document.getElementsByClassName('footer')[0],
					buttons = footer.getElementsByTagName('button');

				orderStatus.innerHTML = json.Data.orderStatusName;
				orderNo.innerHTML = json.Data.orderNo;
				comOrderTime.innerHTML = json.Data.orderedTime;
				//				if(json.Data.orderStatusName == "待付款") {
				//					payOrderTimeBox.remove();
				//				} else {
				//					payOrderTime.innerHTML = json.Data.paymentTime;
				//				}
				payOrderTime.innerHTML = json.Data.paymentTime;
				if(json.Data.extType == 3 || json.Data.extType == 4) {
					name.innerHTML = '现场提取，不支持快递';
				} else {
					name.innerHTML = json.Data.customer.consignee;
					TEl.innerHTML = json.Data.customer.phoneNumber;
					address.innerHTML = json.Data.customer.deliveryAddress;
				}
				shopNameBox.setAttribute('storeid', json.Data.storeid);
				shopName.innerHTML = json.Data.businessName;

				ai.repeat({
					view: proList,
					arr: json.Data.productList,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					tem.querySelector('.orderMain__proImg').src = obj.productImage;
					tem.querySelector('.orderMain__proTitle').innerText = obj.productName;
					tem.querySelector('.orderMain__proSku').innerText = obj.specs;
					tem.querySelector('[att=proPrice]').outerHTML = '￥' + Number(obj.productPrice).toFixed(2);
					tem.querySelector('.orderMain__proNum').innerText = '×' + obj.quantity;
					if(obj.isShowDrawback == 1) {
						tem.querySelector('.proInfo__btnBox').style.height = '47px';
						if(obj.goodsDrawbackTitle == '') {
							tem.querySelector('.proInfo__btnBox').innerHTML = '<button class="proInfo__btn">申请退款</button>';
						} else {
							tem.querySelector('.proInfo__btnBox').innerHTML = '<p class="proInfo__tips">(' + obj.goodsDrawbackTitle + ')</p><button class="proInfo__btn">申请退款</button>';
						}
						tem.querySelector('.proInfo__btn').addEventListener('click', function() {
							obj.businessName = json.Data.businessName;
							obj.businessPhone = json.Data.businessPhone;
							localStorage.drawBackPro = JSON.stringify(obj);
							location.href = '../../templates/drawback/drawback.html?orderNo=' + json.Data.orderNo;
						})
					}
				}

				var message = document.getElementsByClassName('orderMain__text'),
					freight = document.getElementsByClassName('payInfo__freight')[0],
					total = document.getElementById('total'),
					coupon = document.getElementById('coupon'),
					elcoupon = document.getElementById('elcoupon'),
					realPay = document.getElementById('realPay');
				if(json.Data.customer.buyerRemark == '') {
					message[0].innerHTML = '您没有留言';
				} else {
					message[0].innerHTML = json.Data.customer.buyerRemark;
				}
				freight.innerHTML = json.Data.shippingRates.toFixed(2);

				for(var i = 0; i < json.Data.payList.length; i++) {
					if(json.Data.payList[i].payType == 1000) {
						total.innerHTML = '￥' + json.Data.payList[i].orderPayAmount;
					} else if(json.Data.payList[i].payType == 14 || json.Data.payList[i].payType == 16 || json.Data.payList[i].payType == 97 || json.Data.payList[i].payType == 115 || json.Data.payList[i].payType == 0) {
						realPay.innerHTML = '￥' + json.Data.payList[i].orderPayAmount;
					} else if(json.Data.payList[i].payType == 2) {
						coupon.innerHTML = '-￥' + json.Data.payList[i].orderPayAmount;
					} else if(json.Data.payList[i].payType == 7) {
						elcoupon.innerHTML = '-￥' + json.Data.payList[i].orderPayAmount;
					}
				}
				orderDetails.orderNo = json.Data.orderNo;
				if(json.Data.orderTitle == "等待买家支付") {
					document.getElementById('isPay').innerHTML = '还需支付'
					buttons[0].addEventListener('click', orderDetails.orderHandleFns.cancel);
					buttons[1].addEventListener('click', orderDetails.orderHandleFns.confirmPay);
					buttons[0].style.display = 'inline-block';
					buttons[1].style.display = 'inline-block';
				} else if(json.Data.orderTitle == "等待商家发货" && (json.Data.drawBackType == 0 || json.Data.drawBackType == 3)) {
					if(json.Data.extType != 3 && json.Data.extType != 4) {
						buttons[2].addEventListener('click', orderDetails.orderHandleFns.refund);
						buttons[2].style.display = 'inline-block';
						buttons[3].addEventListener('click', orderDetails.orderHandleFns.urge);
						buttons[3].style.display = 'inline-block';
					}
				} else if(json.Data.orderStatusName == "已发货") {
					if(json.Data.extType != 3 && json.Data.extType != 4) {
						buttons[4].addEventListener('click', orderDetails.orderHandleFns.logistical);
						buttons[4].style.display = 'inline-block';
					}
					buttons[5].addEventListener('click', orderDetails.orderHandleFns.confirmGet);
					buttons[5].style.display = 'inline-block';
				} else if(json.Data.orderStatusName == "已收货") {
					//buttons[6].addEventListener('click', orderDetails.orderHandleFns.afterSales);
					//buttons[6].style.display = 'inline-block';
					document.getElementsByClassName('payInfo')[0].style.marginBottom = "10px";

				} else {
					document.getElementsByClassName('payInfo')[0].style.marginBottom = "10px";
				}
			}
		}
	})
}

orderDetails.orderHandleFns = {
	'cancel': function() {
		var delPubBoxText = document.getElementById('delPubBox__text'),
			orderNo = document.getElementsByClassName('topInfo__orderNo')[0].innerHTML;
		delPubBoxText.innerHTML = '确定关闭该订单？';
		document.getElementsByClassName('isdelPub')[0].style.display = 'block';
		orderDetails.delOrderNo = orderNo;
		orderDetails.btnType = '关闭订单';
	},
	'confirmPay': function() {
		ai.post({
			url: 'OrderServer/Order/IsFullDeduction',
			data: {
				subOrderNo: ai.GetQueryString('orderNo')
			},
			load: function(json) {
				if(json.ResultCode == 1000) {
					if(json.Data == 1) {
						ai.post({
							url: 'OrderServer/Order/ConfirmFullDeduction',
							data: {
								subOrderNo: ai.GetQueryString('orderNo')
							},
							load: function(json) {
								if(json.ResultCode == 1000) {
									location.href = '../payResult/payResult.html?paysuccess&orderNo=' + json.Data.orderno;
								} else {
									ai.alert(json.Message);
								}
							}
						})
					} else {
						location.href = '../../templates/confirmPay/confirmPay.html?form=2&orderNo=' + orderDetails.orderNo;
					}
				} else {
					ai.alert(json.Message);
				}

			}

		})
	},
	'refund': function() {
		location.href = '../../templates/cancelOrder/cancelOrder.html?orderNo=' + orderDetails.orderNo;
	},
	'urge': function() {
		document.getElementsByClassName('loadingBg')[0].style.display = 'block';
		var orderNo = document.getElementsByClassName('topInfo__orderNo')[0].innerHTML;
		ai.post({
			url: 'OrderServer/OrderFlow/Expedite',
			data: {
				suborderno: orderNo
			},
			load: function(json) {
				document.getElementsByClassName('loadingBg')[0].style.display = 'none';
				ai.alert(json.Message);
			}
		})
	},
	'logistical': function() {
		var order = document.getElementsByClassName('topInfo__orderNo')[0];
		location.href = '../../templates/logistical/logistical.html?orderNo=' + order.innerHTML.slice(0, -1);
	},
	'confirmGet': function() {
			var delPubBoxText = document.getElementById('delPubBox__text'),
				orderNo = document.getElementsByClassName('topInfo__orderNo')[0].innerHTML;
			delPubBoxText.innerHTML = '确定收到该商品？';
			document.getElementsByClassName('isdelPub')[0].style.display = 'block';
			orderDetails.delOrderNo = orderNo;
			orderDetails.btnType = '确认收货';
		}
		//	'afterSales': function() {
		//		localStorage.drawbackNo = orderNo = document.getElementsByClassName('topInfo__orderNo')[0].innerHTML;
		//		location.href = '../refund/refund_old.html';
		//	}
}

orderDetails.addEvt = function() {
	document.getElementsByClassName('delPubBox__no')[0].addEventListener('click', function() {
		document.getElementsByClassName('isdelPub')[0].style.display = 'none';
	})
	document.getElementsByClassName('delPubBox__yes')[0].addEventListener('click', function(evt) {
		if(orderDetails.btnType == '关闭订单') {
			document.getElementsByClassName('isdelPub')[0].style.display = 'none';
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			ai.post({
				url: 'OrderServer/Order/CloseOrder',
				data: {
					orderno: orderDetails.delOrderNo
				},
				load: function(json) {
					document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					location.reload();
				}
			})
			console.log("1");
		} else if(orderDetails.btnType == '确认收货') {
			document.getElementsByClassName('isdelPub')[0].style.display = 'none';
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			ai.post({
				url: 'OrderServer/OrderFlow/ConfirmReceipt',
				data: {
					suborderno: orderDetails.delOrderNo
				},
				load: function(json) {
					document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					if(json.ResultCode == 1000) {
						document.getElementsByClassName('loadingBg')[0].style.display = 'none';
						location.reload();
					}
				}
			})
		}

	})

}

orderDetails.exe = function() {
	orderDetails.getDetails(ai.GetQueryString('orderNo'))
	orderDetails.addEvt();
}
typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(orderDetails.exe)
}): ai.ready(orderDetails.exe);