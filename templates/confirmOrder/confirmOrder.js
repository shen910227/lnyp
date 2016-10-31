var confirmOrder = {};

//判断是否支持电子券
confirmOrder.isCanEleCoupons = function() {
	//重置电子券输入框
	document.getElementsByClassName('eleCoupons__input')[0].value = 0;
	ai.post({
		url: '/ElCouponsServer/ElCoupons/CheckMobileManage',
		data: {
			phone_num: JSON.parse(localStorage.loginjson).phone
		},
		load: function(json) {
			if(json.ResultCode == 1000 && json.Data == 1 && JSON.parse(localStorage.proList)[0].isElCoupons) {
				document.getElementsByClassName('eleCoupons')[0].style.display = 'block';
			}
		}
	})
}

//获取收货地址
confirmOrder.getAddress = function() {
	if(confirmOrder.proList[0].isO2O) {
		document.getElementsByClassName('addressBox__addressBox')[0].innerHTML = '现场提取，不支持快递';
		confirmOrder.showPro();
		confirmOrder.gainCoupon();
	} else {
		document.getElementsByClassName('addressBox__iconNext')[0].style.display = 'block';
		document.getElementsByClassName('addressBox')[0].onclick = function() {
			location.href = '../address/address.html?changeAddr';
		}
		confirmOrder.loadingBg.style.display = 'block';
		ai.post({
			url: '/StoreServer/Store/GainBook',
			data: {},
			load: function(json) {
				confirmOrder.loadingBg.style.display = 'none';
				if(json.Data.length == 0) {
					document.getElementsByClassName('isAddAddr')[0].style.display = 'block';
					document.getElementsByClassName('addressBox')[0].style.display = 'none';
					document.getElementsByClassName('proListBox')[0].style.display = 'none';
					document.getElementsByClassName('messageBox')[0].style.display = 'none';
					document.getElementsByClassName('payInfo')[0].style.display = 'none';
				} else {
					var name = document.getElementsByClassName('addressBox__name')[0];
					var telNum = document.getElementsByClassName('addressBox__telNum')[0];
					var addressInfo = document.getElementsByClassName('addressBox__address')[0];
					confirmOrder.changeAddr = (localStorage.isChangeAddr == 1) ? JSON.parse(localStorage.changeAddr) : json.Data[0];
					var receiveAddr = confirmOrder.changeAddr.provice + confirmOrder.changeAddr.city + confirmOrder.changeAddr.deliveryArea + confirmOrder.changeAddr.deliveryAddress;
					name.innerHTML = confirmOrder.changeAddr.receiveUserName;
					telNum.innerHTML = confirmOrder.changeAddr.receiveUserTel;
					addressInfo.innerHTML = receiveAddr;
					confirmOrder.showPro();
					confirmOrder.gainCoupon();
				}
			}
		})
	}

}

//显示商品信息
confirmOrder.showPro = function() {
	if(confirmOrder.changeAddr) {
		confirmOrder.loadingBg.style.display = 'block';
		ai.post({
			url: '/ProductServer/Product/GainDeliveryOptions',
			data: {
				citycode: confirmOrder.changeAddr.citycode,
				pId_skuId_qty: localStorage.pId_skuId_qty
			},
			load: function(json) {
				if(json.ResultCode == 1000) {
					confirmOrder.deliveryInfo = json.Data;
					if(confirmOrder.proList) {
						var proData = confirmOrder.proList;
						var proListBox = document.getElementsByClassName('proListBox')[0];
						var proTem = document.getElementsByClassName('proInfoBox__proItem')[0].cloneNode(true);
						document.getElementsByClassName('proInfoBox__proItem')[0].remove();
						var proBoxTem = document.getElementsByClassName('proInfoBox')[0].cloneNode(true);
						document.getElementsByClassName('proInfoBox')[0].remove();
						var ProductCombination = [];
						for(var i = 0; i < json.Data.length; i++) {
							var ProductsCombina = [];
							for(var j = 0; j < proData.length; j++) {
								if(confirmOrder.isExisted(json.Data[i].ProductIds, proData[j].proid)) {
									ProductsCombina.push(proData[j]);
								}
							}
							var itemProductCombination = {
								"SellerId": json.Data[i].SellerId,
								"SellerName": json.Data[i].SellerName,
								"ProductsCombina": ProductsCombina,
								"DeliveryTypes": json.Data[i].DeliveryTypes
							};
							ProductCombination.push(itemProductCombination);
						}
						for(var i = 0; i < ProductCombination.length; i++) {
							var proBox = proBoxTem.cloneNode(true);
							proBox.getElementsByClassName('proInfoBox__shopName')[0].innerHTML = ProductCombination[i].SellerName;
							proListBox.appendChild(proBox);
							for(var j = 0; j < ProductCombination[i].ProductsCombina.length; j++) {
								var pro = proTem.cloneNode(true);
								pro.getElementsByClassName('proInfoBox__proImg')[0].src = ProductCombination[i].ProductsCombina[j].imgSrc;
								pro.getElementsByClassName('proInfoBox__proTitle')[0].innerHTML = ProductCombination[i].ProductsCombina[j].proTitle;
								pro.getElementsByClassName('proInfoBox__proSku')[0].innerHTML = ProductCombination[i].ProductsCombina[j].sku;
								pro.querySelector('[att=price]').innerHTML = ProductCombination[i].ProductsCombina[j].price;
								pro.querySelector('[att=num]').innerHTML = ProductCombination[i].ProductsCombina[j].num;
								proBox.getElementsByClassName('proInfoBox__proList')[0].appendChild(pro);
							}

							var deliveryStr = '';
							for(var k = 0; k < ProductCombination[i].DeliveryTypes.length; k++) {
								deliveryStr += "<option data-freight='" + ProductCombination[i].DeliveryTypes[k].Freight + "' value='" + ProductCombination[i].DeliveryTypes[k].DeliveryType + "'>" + ProductCombination[i].DeliveryTypes[k].DeliveryText + "</option>";
							}
							var deliveryStrBox = "<select class='proInfoBox__selFreight'>" + deliveryStr + "</select>";
							var Freight = ProductCombination[i].DeliveryTypes[0].Freight > 0 ? '￥' + ProductCombination[i].DeliveryTypes[0].Freight : '包邮';
							var FreightBox = "<span class='proInfoBox__freight'>" + Freight + "</span>";

							var footer = document.createElement('footer');
							footer.className = 'proInfoBox__footer';
							footer.innerHTML = deliveryStrBox + FreightBox;
							var select = footer.getElementsByTagName('select')[0];
							select.onchange = function() {
								confirmOrder.ChangeFreight(this);
							}
							var itemTotal = document.createElement('p');
							itemTotal.className = 'totalBox';
							itemTotal.innerHTML = '共<span att="allProNum" class="allProNum"></span>件，合计：<span att="total" class="itemTotal"></span> (含运费)';
							footer.appendChild(itemTotal);
							proBox.appendChild(footer);
							confirmOrder.itemTotal(select);
						}
						confirmOrder.countFun();
						confirmOrder.loadingBg.style.display = 'none';
					}
				} else {
					ai.alert(json.Message);
				}
				confirmOrder.loadingBg.style.display = 'none';
			}
		})
	} else if(confirmOrder.proList[0].isO2O && confirmOrder.proList) {
		var proBoxTem = document.getElementsByClassName('proInfoBox')[0],
			shopName = document.getElementsByClassName('proInfoBox__shopName')[0],
			proImg = document.getElementsByClassName('proInfoBox__proImg')[0],
			proTitle = document.getElementsByClassName('proInfoBox__proTitle')[0],
			proSku = document.getElementsByClassName('proInfoBox__proSku')[0],
			price = document.getElementsByClassName('price')[0],
			num = document.getElementsByClassName('num')[0];

		shopName.innerHTML = confirmOrder.proList[0].jgName;
		proImg.src = confirmOrder.proList[0].imgSrc;
		proTitle.innerHTML = confirmOrder.proList[0].proTitle;
		proSku.innerHTML = confirmOrder.proList[0].sku;
		price.innerHTML = confirmOrder.proList[0].price;
		num.innerHTML = confirmOrder.proList[0].num;

		var footer = document.createElement('footer');
		footer.className = 'proInfoBox__footer';

		var itemTotal = document.createElement('p');
		itemTotal.className = 'totalBox';
		itemTotal.innerHTML = '共<span att="allProNum" class="allProNum"></span>件，合计：<span att="total" class="itemTotal"></span> (含运费)';
		footer.appendChild(itemTotal);
		proBoxTem.appendChild(footer);
		confirmOrder.itemTotal(itemTotal);
		confirmOrder.countFun();
	}
}

//请求优惠券
confirmOrder.gainCoupon = function() {
	ai.post({
		url: '/CouponServer/Coupon/GainCouponByCart',
		data: {
			products: localStorage.proForCoupon,
			phoneNum: JSON.parse(localStorage.loginjson).phone
		},
		load: function(json) {
			var coupon__main = document.getElementsByClassName('coupon__main')[0];
			coupon__main.innerHTML = json.Data.length + '张可用';
			confirmOrder.couponCount = json.Data.length;
			if(json.Data && json.Data.length > 0) {
				confirmOrder.couponInfo = json.Data;
				confirmOrder.couponFinish();
			}
		}
	})
}

//提交订单
confirmOrder.pushOrder = function(str) {
	var eleCoupons__checkbox = document.getElementById('eleCoupons__checkbox'),
		eleCouponsInput = document.getElementsByClassName('eleCoupons__input')[0];
	ai.post({
		url: '/OrderServer/Order/CommitH5BuyerOrder',
		data: {
			orderdata: str
		},
		load: function(json) {
			if(eleCoupons__checkbox.className == 'eleCouponsFalse' || eleCouponsInput.value == 0) {
				if(json.ResultCode == 1000) {
					var storeid = confirmOrder.proList[0].storeid;
					confirmOrder.addViewOrder(json.Data, storeid)
					location.href = '../../templates/confirmPay/confirmPay.html?form=1&orderNo=' + json.Data.orderno;
				} else if(json.ResultCode == 3003) {
					location.replace('../payResult/payResult.html?paysuccess&orderNo=' + json.Data.orderno);
				} else {
					ai.alert(json.Message);
				}
				var pustBtn = document.getElementsByClassName('payFooter__btn')[0];
				pustBtn.disabled = false;
				confirmOrder.loadingBg.style.display = 'none';
				confirmOrder.loadingBg.getElementsByClassName('loadingBg__text')[0].innerHTML = '加载中...';
			} else {
				if(json.ResultCode == 1000) {
					confirmOrder.DirectPayOffline(json.Data.orderno, eleCouponsInput.value);
				} else {
					confirmOrder.loadingBg.style.display = 'none';
					ai.alert(json.Message);
				}
			}
		}
	})
}

//获取提交订单需要的数据
confirmOrder.getOrderInfo = function() {
	var orderProduct = [],
		allProInfo = confirmOrder.proList,
		leaveMessage = document.getElementsByClassName('messageBox__input')[0].value,
		deliveryInfo = {};

	for(var i = 0; i < allProInfo.length; i++) {
		var proItem = {
			"productid": allProInfo[i].proid,
			"skuid": allProInfo[i].skuid,
			"unitprice": allProInfo[i].price,
			"quantum": allProInfo[i].num,
			"shareid": allProInfo[i].shareid,
			"storeid": allProInfo[i].storeid,
			"activityid": allProInfo[i].activityid,
			"orderStyleid": allProInfo[i].orderStyleid
		}
		orderProduct.push(proItem);
	}
	if(confirmOrder.proList[0].isO2O) {
		orderProduct[0].extType = 3;
	} else {
		deliveryInfo = {
			"ReceiveUserName": confirmOrder.changeAddr.receiveUserName,
			"ReceiveUserTel": confirmOrder.changeAddr.receiveUserTel,
			"Provice": confirmOrder.changeAddr.provice,
			"provicecode": confirmOrder.changeAddr.provicecode,
			"City": confirmOrder.changeAddr.city,
			"citycode": confirmOrder.changeAddr.citycode,
			"DeliveryArea": confirmOrder.changeAddr.deliveryArea,
			"deliveryAreacode": confirmOrder.changeAddr.deliveryAreacode,
			"DeliveryAddress": confirmOrder.changeAddr.deliveryAddress,
			"DeliveryZip": confirmOrder.changeAddr.deliveryZip
		};
	}

	if(!confirmOrder.proList[0].isO2O) {
		var orderdataJson = {
			"payContactName": confirmOrder.changeAddr.pay_username == '' ? confirmOrder.changeAddr.pay_usertel : confirmOrder.changeAddr.pay_username,
			"payContactTel": confirmOrder.changeAddr.pay_usertel,
			"leaveMessage": leaveMessage,
			"invoice": '',
			"payment": 0,
			"orderType": 4,
			"orderProduct": orderProduct,
			"payways": []
		};
		orderdataJson.orderDeliveryFee = confirmOrder.getDeliveryInfo();
		orderdataJson.deliveryInfo = deliveryInfo;
	} else {
		var loginjson = JSON.parse(localStorage.loginjson);
		var orderdataJson = {
			"payContactName": loginjson.nickName == '' ? loginjson.phone : loginjson.nickName,
			"payContactTel": loginjson.phone,
			"leaveMessage": leaveMessage,
			"invoice": '',
			"payment": 0,
			"orderType": 4,
			"orderProduct": orderProduct,
			"payways": []
		};
	}
	var couponEle = document.getElementsByClassName('payInfo__coupon')[0],
		coupon__checkbox = document.getElementById('coupon__checkbox'),
		eleCoupons__checkbox = document.getElementById('eleCoupons__checkbox');
	if(coupon__checkbox.className == 'couponTrue') {
		if(couponEle.getAttribute('coupon') && couponEle.getAttribute('cardno') && couponEle.getAttribute('couponid')) {
			orderdataJson.payways.push({
				'couponId': couponEle.getAttribute('couponid'),
				'cardno': couponEle.getAttribute('cardno'),
				'favAccount': couponEle.getAttribute('coupon'),
				'paytype': 2
			});
		} else {
			ai.alert('请确认优惠券是否选择成功');
		}
	}
	if(eleCoupons__checkbox.className == 'eleCouponsTrue') {
		orderdataJson.payways.push({
			"paytype": 7,
			"favAccount": 0
		});
	}
	if(orderdataJson.orderProduct[0].activityid != 0) {
		orderdataJson.orderType = 5;
	} else if(orderdataJson.orderProduct[0].shareid != 0) {
		orderdataJson.orderType = 2;
	} else {
		orderdataJson.orderType = 4;
	}
	return orderdataJson;
}

//提交电子券支付申请
confirmOrder.DirectPayOffline = function(OrderNo, eleCoupons) {
	ai.isLogin(function() {
		var loginjson = JSON.parse(localStorage.loginjson),
			Mobile = loginjson.phone,
			UserId = loginjson.UserId;
		var proList = JSON.parse(localStorage.proList)[0],
			ProductName = proList.proTitle,
			ProductId = proList.proid,
			Num = proList.num;
		var Amount = Number(document.getElementsByClassName('eleCoupons__input')[0].value);
		var eleCouponsBtn = document.getElementsByClassName('eleCouponsPay__btn')[0],
			eleCouponsPay__fail = document.getElementsByClassName('eleCouponsPay__fail')[0];
		eleCouponsBtn.setAttribute('OrderNo', OrderNo);

		ai.post({
			url: '/ElectronicCoupons/DirectPayOffline',
			data: {
				OrderNo: OrderNo,
				Mobile: Mobile,
				UserId: UserId,
				Amount: eleCoupons,
				ProductId: ProductId,
				ProductName: ProductName,
				Num: Num
			},
			baseURL: 4,
			load: function(json) {
				if(json.ResultCode == 1000) {
					var eleCouponsPayBox = document.getElementsByClassName('eleCouponsPayBox')[0];
					confirmOrder.loadingBg.style.display = 'none';
					eleCouponsPayBox.style.display = 'block';
					confirmOrder.eleCouponsFor(OrderNo, Mobile, eleCoupons);
				} else {
					location.href = '../../templates/confirmPay/confirmPay.html?form=1&orderNo=' + OrderNo;
				}
			}
		})
	})
}

//循环检查电子券支付结果
confirmOrder.eleCouponsFor = function(OrderNo, Mobile, Amount) {

	var time = document.getElementsByClassName('eleCouponsPay__mark');
	var timeout = 179,
		minute, second;
	confirmOrder.inter = setInterval(function() {
		minute = '0' + Math.floor(timeout / 60);
		second = (timeout % 60).toFixed(0) < 10 ? '0' + (timeout % 60).toFixed(0) : (timeout % 60).toFixed(0);
		time[0].innerText = minute;
		time[1].innerText = second;

		if(timeout == 0) {
			clearInterval(confirmOrder.inter);
			confirmOrder.isStopFor = true;
		}
		timeout--;
	}, 1000);

	forResult();

	function forResult() {
		if(!confirmOrder.isStopFor) {
			ai.post({
				url: '/ElectronicCoupons/GetECouponPayResult',
				data: {
					OrderNo: OrderNo,
					Mobile: Mobile,
					Amount: Amount
				},
				baseURL: 4,
				load: function(json) {
					if(json.ResultCode == 1000) {
						confirmOrder.confirmBtnEvt(OrderNo, Amount, 'success');
					} else {
						setTimeout(function() {
							forResult();
						}, 5000);
					}
				}
			})
		} else {
			confirmOrder.confirmBtnEvt(OrderNo, Amount, 'fail');
		}
	}
}

//电子券支付确定按钮事件
confirmOrder.confirmBtnEvt = function(OrderNo, Amount, TorF) {
	var eleCouponsBtn = document.getElementsByClassName('eleCouponsPay__btn')[0],
		eleCouponsPay__success = document.getElementsByClassName('eleCouponsPay__success')[0],
		eleCouponsPay__fail = document.getElementsByClassName('eleCouponsPay__fail')[0],
		eleCouponsPay__time = document.getElementsByClassName('eleCouponsPay__time')[0];
	if(TorF == 'fail') {
		eleCouponsBtn.addEventListener('click', function(evt) {
			location.href = '../../templates/confirmPay/confirmPay.html?form=1&orderNo=' + OrderNo;
		})
		eleCouponsBtn.disabled = false;
		eleCouponsBtn.style.color = '#f02804';
		eleCouponsPay__time.style.display = 'none';
		eleCouponsPay__fail.style.display = 'block';
	} else {
		ai.post({
			url: '/OrderServer/Order/ElCouponsPayOrder',
			data: {
				orderNo: OrderNo,
				elCouponsAmount: Amount
			},
			load: function(json) {
				if(json.ResultCode == 1000) {
					eleCouponsBtn.addEventListener('click', function(evt) {
						if(json.Data.status == 3003) {
							location.replace('../payResult/payResult.html?paysuccess&orderNo=' + OrderNo);
						} else {
							location.href = '../../templates/confirmPay/confirmPay.html?form=1&orderNo=' + OrderNo;
						}
					})
					eleCouponsPay__time.style.display = 'none';
					eleCouponsPay__success.style.display = 'block';
					clearInterval(confirmOrder.inter);
					eleCouponsBtn.disabled = false;
					eleCouponsBtn.style.color = '#f02804';
				} else {
					ai.alert(json.Message);
				}
			}
		})
	}

}

//判断数组中是否含有某个元素
confirmOrder.isExisted = function(arr, item) {
	var bl = false;
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == item) {
			bl = true;
			break;
		};
	};
	return bl;
}

//修改物流方式
confirmOrder.ChangeFreight = function(selFreight) {
	var selOptionFre = selFreight.options[selFreight.selectedIndex].getAttribute('data-freight');
	if(selOptionFre == 0) {
		selFreight.parentElement.getElementsByTagName("span")[0].innerHTML = '包邮';
	} else {
		selFreight.parentElement.getElementsByTagName("span")[0].innerHTML = "￥" + selOptionFre;
	}
	confirmOrder.countFun();
	confirmOrder.itemTotal(selFreight);
	confirmOrder.eleCouponsChange();
}

//显示费用
confirmOrder.countFun = function() {
	//新的计算方式
	var _count = new Number(0.00),
		_price_arr = document.getElementsByClassName("price"),
		_number_arr = document.getElementsByClassName("num"),
		_freight_arr = document.getElementsByClassName("proInfoBox__selFreight"),
		_freight_total = new Number(0.00),
		yunfei = document.getElementsByClassName('yunfei')[0],
		total = document.getElementsByClassName('payInfo__main')[0],
		coupon = document.getElementsByClassName('payInfo__coupon')[0],
		realPay = document.getElementsByClassName('payFooter__realPay')[0],
		_elCouponsPay = new Number(0.00);

	//商品价格单独计算
	for(var i = 0; i < _price_arr.length; i++) {
		var _price = Number(_price_arr[i].innerHTML) * 10000;
		var _number = Number(_number_arr[i].innerHTML);
		_count += Number(_price * _number);
	}

	//运费单独计算
	for(var _j = 0; _j < _freight_arr.length; _j++) {
		if(_freight_arr[_j].selectedIndex > -1) {
			_freight_total += Number(_freight_arr[_j].options[_freight_arr[_j].selectedIndex].dataset.freight) * 10000;
		}
	}

	//计算运费和商品价格总和
	var t = Number((_count / 10000 + _freight_total / 10000).toFixed(2));

	//显示价格
	var couponSum = Number(document.getElementsByClassName('payInfo__coupon')[0].innerHTML.slice(2)).toFixed(2);
	yunfei.innerHTML = _freight_total / 10000;
	total.innerHTML = '￥' + t.toFixed(2);
	realPay.innerHTML = '￥' + ((t * 10000 - couponSum * 10000) / 10000).toFixed(2);
	confirmOrder.decCoupon = ((t * 10000 - couponSum * 10000) / 10000).toFixed(2);
}

//获取传给后台 的运费参数
confirmOrder.getDeliveryInfo = function() {
	var deliveryInfo = JSON.stringify(confirmOrder.deliveryInfo),
		_freight_arr = document.getElementsByClassName("proInfoBox__selFreight");
	deliveryInfo = JSON.parse(deliveryInfo);
	for(var item in deliveryInfo) {
		delete deliveryInfo[item].SellerName;
		deliveryInfo[item].DeliveryTypes[0] = deliveryInfo[item].DeliveryTypes[_freight_arr[item].selectedIndex];
		deliveryInfo[item].DeliveryTypes.splice(1);
		delete deliveryInfo[item].DeliveryTypes[0].DeliveryText;
	}
	return deliveryInfo;
}

//优惠券加载完才可点击
confirmOrder.couponFinish = function() {
	var couponBox = document.getElementsByClassName('couponBox')[0],
		coupon__checkbox = document.getElementById('coupon__checkbox'),
		couponClick = document.getElementsByClassName('coupon__clickBox')[0],
		couponEle = document.getElementsByClassName('payInfo__coupon')[0];
	couponClick.addEventListener('click', function() {
		var couponBox = document.getElementsByClassName('couponBox')[0];
		if(couponBox) {
			couponBox.style.display = 'block';
			confirmOrder.selEle = document.getElementById('selShow');
		} else {
			confirmOrder.loadingBg.style.display = 'block';

			var couponBox = document.createElement('div');
			couponBox.className = 'couponBox';

			couponBox.innerHTML = '<header class="couponH"><img class="couponH__backBtn" src="../../img/icon/icon_back@3x.png"><p class="couponH__title">选择优惠券</p><button class="couponH__btnR" onclick="confirmOrder.selCoupon()">确定</button></header><section class="couponList" repeat="couponList"></section>';
			document.body.appendChild(couponBox);
			var temBox = couponBox.getElementsByClassName("couponList")[0];
			var tem = document.createElement('div');
			tem.className = 'couponItem';
			tem.innerHTML = '<div id="couponItem__left" class="couponItem__normal"><span class="couponItem__sum"></span>元</div>	<div class="couponItem__right"><p class="couponItem__title"></p><p class="couponItem__time">有效期：<span class="date"></span></p><p class="couponItem__text"></p><div class="couponItem__selShow"></div></div>';

			if(confirmOrder.couponInfo.length > 0) {
				for(var i = 0; i < confirmOrder.couponInfo.length; i++) {
					var appendEle = tem.cloneNode(true);
					var couponItem__sum = appendEle.getElementsByClassName('couponItem__sum')[0],
						couponItem__title = appendEle.getElementsByClassName('couponItem__title')[0],
						date = appendEle.getElementsByClassName('date')[0],
						couponItem__text = appendEle.getElementsByClassName('couponItem__text')[0],
						couponItem__left = appendEle.querySelector('#couponItem__left'),
						couponItem__right = appendEle.querySelector('.couponItem__right');

					appendEle.setAttribute('coupon', confirmOrder.couponInfo[i].amount);
					appendEle.setAttribute('cardno', confirmOrder.couponInfo[i].couponCode);
					appendEle.setAttribute('couponId', confirmOrder.couponInfo[i].couponId);
					appendEle.obj = confirmOrder.couponInfo[i];

					couponItem__sum.innerHTML = confirmOrder.couponInfo[i].amount;
					couponItem__title.innerHTML = confirmOrder.couponInfo[i].couponTitle;
					date.innerHTML = confirmOrder.couponInfo[i].beginData + '-' + confirmOrder.couponInfo[i].endData;
					couponItem__text.innerHTML = confirmOrder.couponInfo[i].Description;

					appendEle.addEventListener('click', function(evt) {
						var selShow = evt.currentTarget.querySelector('#selShow'),
							selShowByC = evt.currentTarget.querySelector('.couponItem__selShow');
						if(!selShow) {
							otherSel = document.getElementById('selShow');
							if(otherSel) {
								otherSel.removeAttribute('id');
							}
							selShowByC.id = 'selShow';
						} else {
							selShow.removeAttribute('id');
						}
					})
					temBox.appendChild(appendEle);
				}
			}

			var couponBack = document.getElementsByClassName('couponH__backBtn')[0];
			couponBack.addEventListener('click', function() {
				couponBox.style.display = 'none';
				var selShow = document.getElementById('selShow');
				if(selShow) {
					selShow.removeAttribute('id');
				}
				if(confirmOrder.selEle) {
					confirmOrder.selEle.id = 'selShow';
				}
			})
			confirmOrder.loadingBg.style.display = 'none';
		}
	})

	coupon__checkbox.addEventListener('click', function(evt) {
		if(evt.currentTarget.className == 'couponFalse' && (!couponEle.getAttribute('coupon') || !couponEle.getAttribute('cardno') || !couponEle.getAttribute('couponid'))) {
			couponClick.click();
		} else {
			confirmOrder.couponCheckbox = true;
			evt.currentTarget.className = evt.currentTarget.className == 'couponFalse' ? 'couponTrue' : 'couponFalse';
			if(evt.currentTarget.className == 'couponTrue') {
				confirmOrder.selCouponV = couponEle.getAttribute('coupon');
			} else {
				confirmOrder.selCouponV = 0;
			}
			confirmOrder.confirmCoupon();
		}
	})
}

//添加事件
confirmOrder.addEvt = function() {
	var pustBtn = document.getElementsByClassName('payFooter__btn')[0],
		couponBox = document.getElementsByClassName('couponBox')[0],
		coupon__checkbox = document.getElementById('coupon__checkbox'),
		couponClick = document.getElementsByClassName('coupon__clickBox')[0],
		couponEle = document.getElementsByClassName('payInfo__coupon')[0],
		eleCoupons__checkbox = document.getElementById('eleCoupons__checkbox'),
		eleCouponsInput = document.getElementsByClassName('eleCoupons__input')[0],
		eleCoupons__help = document.getElementsByClassName('eleCoupons__help')[0];

	eleCoupons__checkbox.addEventListener('click', function(evt) {
		evt.currentTarget.className = evt.currentTarget.className == 'eleCouponsFalse' ? 'eleCouponsTrue' : 'eleCouponsFalse';
		if(evt.currentTarget.className == 'eleCouponsFalse') {
			eleCouponsInput.value = 0;
			confirmOrder.eleCouponsChange();
		}
	})

	eleCoupons__help.addEventListener('click', function() {
		var eleCouponsTxt = document.getElementsByClassName('eleCouponsTxt')[0];
		if(eleCouponsTxt) {
			eleCouponsTxt.style.display = 'block';
		} else {
			var eleCouponsTxt = document.createElement('div');
			eleCouponsTxt.className = 'eleCouponsTxt';
			eleCouponsTxt.innerHTML = '<header class="couponH"><img class="eleCouponsH__backBtn" src="../../img/icon/icon_back@3x.png"><p class="couponH__title">电子券说明</p></header><section class="eleCouponsTxt__main"><p class="eleCouponsTxt__title">1. 什么是电子券？</p><p class="eleCouponsTxt__txt">电子券是中国移动发行的电子礼金，电子券的金额、有效期、适用商户等属性视具体活动规则而定，用户可在电子券有效期内使用其购买适用商户指定的商品，电子券可拆分或合并使用。</p><p class="eleCouponsTxt__title">2. 如何查询我的电子券余额？</p>	<div class="eleCouponsTxt__txt">用户可通过以下三种方式查询电子券余额：<p class="eleCouponsTxt__subTxt">①编辑短信CXMX到10658888查询电子券明细；</p><p class="eleCouponsTxt__subTxt">②登录中国移动和包官网 https://www.cmpay.com，在我的账户-电子券页面查看；</p><p class="eleCouponsTxt__subTxt">③登录和包手机客户端，在我的账户-电子券页面查看。</p></div><p class="eleCouponsTxt__title">3. 是否所有的电子券余额都可以在岭南优品使用？</p><p class="eleCouponsTxt__txt">不同的电子券，其适用商户可能不一样。您可以登录和包官网 https://www.cmpay.com 或手机客户端，在我的账户-电子券页面，查询电子券的适用商户。</p></section>';
			document.body.appendChild(eleCouponsTxt);
			eleCouponsTxt.getElementsByClassName('eleCouponsH__backBtn')[0].addEventListener('click', function() {
				eleCouponsTxt.style.display = 'none';
			})
			eleCouponsTxt.style.display = 'block';
		}
	})

	eleCouponsInput.addEventListener('focus', function(evt) {
		confirmOrder.eleCouponsDefault = evt.currentTarget.value;
		if(evt.currentTarget.value == 0) {
			evt.currentTarget.value = '';
		}
	})

	eleCouponsInput.addEventListener('blur', function(evt) {
		var regClear0 = /\b(0+)/gi;
		var reg = /^(0|[1-9][0-9]*)$/;
		var eleCouponsNum = evt.currentTarget.value == '0' ? '0' : evt.currentTarget.value.replace(regClear0, '');
		eleCouponsNum = eleCouponsNum == '' ? confirmOrder.eleCouponsDefault : eleCouponsNum;
		//			var eleCouponsNum = evt.currentTarget.value;
		//			if(reg.test(eleCouponsNum)) {
		if(!reg.test(eleCouponsNum)) {
			ai.alert('电子券必须为整数');
			evt.currentTarget.value = confirmOrder.eleCouponsDefault;
			//			} else if(evt.currentTarget.value > (confirmOrder.decCoupon)) {
		} else if(evt.currentTarget.value > Math.floor(confirmOrder.decCoupon)) {
			ai.alert('已超过应付金额，请重新输入');
			evt.currentTarget.value = Math.floor(confirmOrder.decCoupon);
		} else {
			evt.currentTarget.value = eleCouponsNum;
		}
		if(evt.currentTarget.value > 0) {
			eleCoupons__checkbox.className = 'eleCouponsTrue';
		} else {
			eleCoupons__checkbox.className = 'eleCouponsFalse';
		}
		confirmOrder.eleCouponsChange();
	})

	//点击提交订单
	pustBtn.addEventListener('click', function(evt) {
		ai.isLogin(function() {
			var messageInput = document.getElementsByClassName('messageBox__input')[0];
			if(messageInput.value.length < 1 && confirmOrder.messageReq) {
				ai.alert('购买商品包含跨境商品，请填写身份证信息');
			} else {
				confirmOrder.loadingBg.getElementsByClassName('loadingBg__text')[0].innerHTML = '提交中...';
				confirmOrder.loadingBg.style.display = 'block';
				evt.currentTarget.disabled = true;
				confirmOrder.pushOrder(JSON.stringify(confirmOrder.getOrderInfo()));
			}
		})
	});

	var isAddAddr__N = document.getElementsByClassName('isAddAddr__N')[0],
		isAddAddr__Y = document.getElementsByClassName('isAddAddr__Y')[0];
	isAddAddr__N.addEventListener('click', function() {
		document.getElementsByClassName('isAddAddr')[0].style.display = 'none';
		history.back();
	})
	isAddAddr__Y.addEventListener('click', function() {
		location.href = '../addressEdit/addressEdit.html?changeAddr';
	})
}

//选择优惠券
confirmOrder.selCoupon = function() {
	var couponBox = document.getElementsByClassName('couponBox')[0],
		couponEle = document.getElementsByClassName('payInfo__coupon')[0],
		selCoupon = document.getElementById('selShow');

	couponBox.style.display = 'none';

	if(selCoupon) {
		var couponItem = selCoupon.parentElement.parentElement;
		confirmOrder.selCouponV = couponItem.getAttribute('coupon');
		couponEle.setAttribute('coupon', couponItem.getAttribute('coupon'));
		couponEle.setAttribute('cardno', couponItem.getAttribute('cardno'));
		couponEle.setAttribute('couponId', couponItem.getAttribute('couponId'));
		coupon__checkbox.className = 'couponTrue';
	} else {
		confirmOrder.selCouponV = 0;
		couponEle.removeAttribute('coupon');
		couponEle.removeAttribute('cardno');
		couponEle.removeAttribute('couponId');
		coupon__checkbox.className = 'couponFalse';
	}
	confirmOrder.confirmCoupon();
}

//确定使用优惠券
confirmOrder.confirmCoupon = function() {
	var total = Number(document.getElementsByClassName('payInfo__main')[0].innerHTML.slice(1)).toFixed(2),
		yunfei = Number(document.getElementsByClassName('yunfei')[0].innerHTML).toFixed(2),
		couponEle = document.getElementsByClassName('payInfo__coupon')[0],
		realPay = document.getElementsByClassName('payFooter__realPay')[0],
		selCoupon = document.getElementById('selShow'),
		proTotal = ((total * 10000 - yunfei * 10000) / 10000);
	if(confirmOrder.selCouponV > proTotal) {
		couponEle.innerHTML = '-￥' + proTotal.toFixed(2);
		if(confirmOrder.couponCheckbox) {
			confirmOrder.couponCheckbox = false;
		} else {
			document.getElementsByClassName('coupon__main')[0].innerHTML = '可抵扣' + proTotal.toFixed(2) + '元';
		}
		confirmOrder.decCoupon = yunfei;
		//		realPay.innerHTML = '￥' + yunfei;
	} else {
		couponEle.innerHTML = '-￥' + Number(confirmOrder.selCouponV).toFixed(2);
		if(confirmOrder.couponCheckbox) {
			confirmOrder.couponCheckbox = false;
		} else if(selCoupon) {
			document.getElementsByClassName('coupon__main')[0].innerHTML = '可抵扣' + confirmOrder.selCouponV + '元';
		} else {
			document.getElementsByClassName('coupon__main')[0].innerHTML = confirmOrder.couponCount + '张可用';
		}
		confirmOrder.decCoupon = (total - confirmOrder.selCouponV).toFixed(2);
		//		realPay.innerHTML = '￥' + (total - confirmOrder.selCouponV).toFixed(2);
	}
	if(document.getElementById('eleCoupons__checkbox').className == 'eleCouponsTrue') {
		confirmOrder.eleCouponsChange();
	} else {
		realPay.innerHTML = '￥' + confirmOrder.decCoupon;
	}
}

//勾选电子券前提下，更新数据
confirmOrder.eleCouponsChange = function() {
	var eleCouponsInput = document.getElementsByClassName('eleCoupons__input')[0],
		realPay = document.getElementsByClassName('payFooter__realPay')[0];
	//	if(eleCouponsInput.value > (confirmOrder.decCoupon)) {
	if(eleCouponsInput.value > Math.floor(confirmOrder.decCoupon)) {
		ai.alert('请注意：电子券可用金额发生变化');
		eleCouponsInput.value = Math.floor(confirmOrder.decCoupon);
		if(eleCouponsInput.value == "0") {
			document.getElementById('eleCoupons__checkbox').className = 'eleCouponsFalse';
		}
	}
	realPay.innerHTML = '￥' + (confirmOrder.decCoupon - Number(eleCouponsInput.value)).toFixed(2);
}

//获取单个子订单的合计
confirmOrder.itemTotal = function(ele) {
	var parent = ele.parentElement.parentElement,
		itemNum = parent.getElementsByClassName('allProNum')[0],
		itemPrice = parent.getElementsByClassName('itemTotal')[0],
		freight = parent.getElementsByClassName('proInfoBox__freight')[0],
		priceS = parent.getElementsByClassName('price'),
		numS = parent.getElementsByClassName('num'),
		freightPay = 0,
		itemNumSum = 0,
		itemPriceSum = 0;
	for(var i = 0; i < priceS.length; i++) {
		itemNumSum += parseInt(numS[i].innerHTML);
		itemPriceSum += (Number(priceS[i].innerHTML) * 100) * parseInt(numS[i].innerHTML);
	}
	if(confirmOrder.proList[0].isO2O) {
		freightPay = 0;
	} else {
		freightPay = (freight.innerHTML == '包邮') ? 0 : Number(freight.innerHTML.slice(1));
	}
	itemNum.innerHTML = itemNumSum;
	itemPrice.innerHTML = '￥' + ((itemPriceSum + freightPay * 100) / 100).toFixed(2);
}

//后台数据统计
confirmOrder.addViewOrder = function(orderno, storeid) {
	//浏览次数加1
	var channelcode = localStorage.channelcode;
	var citycode = localStorage.citycode;
	var activityflag = localStorage.activityflag;
	if(channelcode != undefined) {
		var pageurl = window.location.href;
		var url = "/tools/cmcc_ajax.ashx"; //GetApiUrl(webApi.AddOrderStatistic);
		var postData = {
			"type": "order",
			"channelcode": channelcode,
			"citycode": citycode,
			"activityflag": activityflag,
			"storeid": storeid,
			//"pageurl": pageurl,
			"orderno": orderno
		};
		ai.post({
			url: url,
			data: postData,
			baseURL: 99,
			load: function(json) {}
		})
	}
}

confirmOrder.exe = function() {
	ai.isLogin(confirmOrder.isCanEleCoupons);
	confirmOrder.loadingBg = document.getElementsByClassName('loadingBg')[0];
	if(!(localStorage.proList && localStorage.pId_skuId_qty)) {
		ai.post({
			url: '/OrderServer/Order/GainOrderInfoCache',
			data: {
				cachekey: ai.GetQueryString('Key')
			},
			load: function(json) {
				if(json.Data && json.Data != '') {
					var arr = json.Data.split('@@');
					localStorage.proList = arr[0];
					localStorage.pId_skuId_qty = arr[1];
					localStorage.proForCoupon = arr[2];
					start();
				} else {
					ai.alert('购物信息过期，请重新选购')
				}
			}
		})
	} else {
		start();
	}

	//开始后续js
	function start() {
		confirmOrder.proList = JSON.parse(localStorage.proList);
		for(var i = 0; i < confirmOrder.proList.length; i++) {
			if(confirmOrder.proList[i].isTaxGoods == 1) {
				document.getElementsByClassName('messageBox__tips')[0].style.display = 'block';
				confirmOrder.messageReq = true;
				break;
			}
		}
		confirmOrder.getAddress();
		confirmOrder.addEvt();
	}
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(confirmOrder.exe)
}): ai.ready(confirmOrder.exe);