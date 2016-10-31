var myorder = {};

myorder.confirmUrl = 'http://lnyph5.vpclub.cn/lnyp/payment/confirm/'

myorder.anlock = false;

myorder.addMenuEvt = function() {
	var div = document.getElementById("buts");
	var buts = div.children;
	var views = document.querySelectorAll('#views section');
	for(var i = 0; i < buts.length; i++) {
		buts[i].addEventListener('click', addOrderEvt);
		buts[i].addEventListener('click', butsClickEvt);
		views[i].addEventListener('webkitAnimationEnd', anEndEvt);
	}

	function anEndEvt(evt) {
		var init = document.querySelector('.init');
		if(init != null) {
			init.className = 'view hide';
		}
		evt.currentTarget.className = 'view init';
	}

	function butsClickEvt(evt) {

		if(evt.currentTarget.dataset.act != 'on') {
			var tagid = evt.currentTarget.dataset.tag;
			document.getElementById(tagid).className = 'view act';
		}

		var act = div.querySelector("[data-act='on']");
		if(div.querySelector("[data-act='on']") != evt.currentTarget) {
			if(act != null) {
				act.dataset.act = 'off';
				act.style.color = '#222';
				act.querySelector('.act').style.opacity = 0;
				act.querySelector('.sta').style.opacity = 1;
			}
			evt.currentTarget.dataset.act = 'on';
			evt.currentTarget.style.color = '#F02804';
			evt.currentTarget.querySelector('.sta').style.opacity = 0;
			evt.currentTarget.querySelector('.act').style.opacity = 1;
			var url = location.origin + location.pathname + evt.currentTarget.dataset.hash;
			history.replaceState(null, "", url);
		}
	}

	function addOrderEvt(evt) {
		if(div.querySelector("[data-act='on']") != evt.currentTarget) {
			var tagid = evt.currentTarget.dataset.tag;
			var view = document.getElementById(tagid);
			var type = view.dataset.type;
			if(view.scrollHeight == view.clientHeight) {
				if(type != 5) {
					myorder.getOrder(view, type, true);
				} else {
					myorder.getBackOrder(view, true);
				}
			}
		}
	}
}

myorder.addEvt = function() {
	document.getElementsByClassName('delPubBox__no')[0].addEventListener('click', function() {
		document.getElementsByClassName('isdelPub')[0].style.display = 'none';
	})
	document.getElementsByClassName('delPubBox__yes')[0].addEventListener('click', function(evt) {
		if(myorder.btnType == '关闭订单') {
			document.getElementsByClassName('isdelPub')[0].style.display = 'none';
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			ai.post({
				url: 'OrderServer/Order/CloseOrder',
				data: {
					orderno: myorder.delOrderNo
				},
				load: function(json) {
					myorder.orderCount();
					document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					ai.alert(json.Message);
					myorder.delEle.remove();
					myorder.delOrderNo = '';
				}
			})
		} else if(myorder.btnType == '确认收货') {
			document.getElementsByClassName('isdelPub')[0].style.display = 'none';
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			ai.post({
				url: 'OrderServer/OrderFlow/ConfirmReceipt',
				data: {
					suborderno: myorder.rejOrderNo
				},
				load: function(json) {
					document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					if(json.ResultCode == 1000) {
						myorder.orderCount();
						myorder.rejEle.remove();
						myorder.rejOrderNo = '';
					}
					ai.alert(json.Message);
				}
			})
		}

	})
}

//获取订单数量
myorder.orderCount = function() {
	ai.post({
		url: '/OrderServer/Order/GainMyOrderCount',
		data: {},
		load: function(json) {
			var paymentCount = document.getElementById('paymentCount'),
				deliveryCount = document.getElementById('deliveryCount'),
				receiptCount = document.getElementById('receiptCount'),
				refundCount = document.getElementById('refundCount');
			if(json.Data.nopaycount != 0) {
				paymentCount.innerHTML = json.Data.nopaycount;
				paymentCount.style.display = 'block';
			}
			if(json.Data.shippedcount != 0) {
				deliveryCount.innerHTML = json.Data.shippedcount;
				deliveryCount.style.display = 'block';
			}
			if(json.Data.sendedcount != 0) {
				receiptCount.innerHTML = json.Data.sendedcount;
				receiptCount.style.display = 'block';
			}
			//			if(json.Data.returncount != 0) {
			//				refundCount.innerHTML = json.Data.returncount;
			//				refundCount.style.display = 'block';
			//			}
		}

	})
}

/*
 * orderStatus
 * 	0: //全部
 * 	1: //未支付 
 * 	2://待发货
 *	3://已发货 
 * 	4://已完成
 *	5://退款
 */
myorder.getOrder = function(view, type, judg) {
	var pageindex;
	if(view.dataset.index == undefined || judg) {
		pageindex = 1;
		view.dataset.index = 1;
	} else {
		pageindex = (Number(view.dataset.index) + 1);
		view.dataset.index = pageindex;
	}

	ai.post({
		url: 'OrderServer/Order/GainMyOrder',
		data: {
			pageindex: pageindex,
			pagesize: 10,
			orderStatus: type
		},
		load: function(json) {
			if(json.Data.length == 0 && !judg) {
				ai.alert('没有更多商品');
			}
			if(judg == true) {
				view.dataset.index = 1;
				view.innerHTML = '';
			}
			if(json.Data.length != 0) {
				ai.repeat({
					view: view,
					arr: json.Data,
					fun: function(tem, obj) {
						tem.querySelector('[att=storeName]').outerHTML = obj.businessName;
						ai.repeat({
							view: tem.getElementsByClassName('proList')[0],
							arr: obj.productList,
							fun: function(tem, obj) {
								tem.querySelector('[att=img]').src = obj.productImage;
								tem.querySelector('[att=product]').outerHTML = obj.productName;
								tem.querySelector('[att=sku]').outerHTML = obj.specs;
								tem.querySelector('[att=price]').outerHTML = Number(obj.productPrice).toFixed(2);
								tem.querySelector('[att=proNum]').outerHTML = obj.quantity;
							}
						})
						var allProNum = 0;
						for(var i = 0; i < obj.productList.length; i++) {
							allProNum += obj.productList[i].quantity;
						}
						tem.querySelector('[att=allProNum]').innerHTML = allProNum;
						tem.querySelector('[att=total]').innerHTML = obj.real_amount.toFixed(2);
						tem.children[1].addEventListener('click', gotoDetails);

						var tex = '';
						var delPubBoxText = document.getElementById('delPubBox__text');
						switch(type) {
							case '1':
								tex = '待付款';
								var div = document.createElement('div');
								var but = document.createElement('button');
								but.innerText = '关闭订单';
								but.addEventListener('click', function(evt) {
									delPubBoxText.innerHTML = '确定关闭该订单？';
									document.getElementsByClassName('isdelPub')[0].style.display = 'block';
									myorder.delEle = evt.currentTarget.parentElement.parentElement.parentElement;
									myorder.delOrderNo = myorder.delEle.obj.orderNo;
									myorder.btnType = '关闭订单';
								});
								div.appendChild(but);

								var but = document.createElement('button');
								but.innerText = '付款';
								but.className = 'payBtn';
								but.addEventListener('click', function(evt) {
									var objForNo = evt.currentTarget.parentElement.parentElement.parentElement.obj;
									ai.post({
										url: 'OrderServer/Order/IsFullDeduction',
										data: {
											subOrderNo: objForNo.orderNo
										},
										load: function(json) {
											if(json.ResultCode == 1000) {
												if(json.Data == 1) {
													ai.post({
														url: 'OrderServer/Order/ConfirmFullDeduction',
														data: {
															subOrderNo: objForNo.orderNo
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
													location.href = '../../templates/confirmPay/confirmPay.html?form=2&orderNo=' + objForNo.orderNo;
												}
											} else {
												ai.alert(json.Message);
											}

										}

									})
								});
								div.appendChild(but);
								tem.querySelector('footer').appendChild(div);
								break;
							case '2':
								tem.querySelector('[att=status]').innerText = obj.orderStatusName;
								if(obj.drawbackType == 0 || obj.drawbackType == 3) {
									var div = document.createElement('div');

									var but = document.createElement('button');
									but.innerText = '取消订单';
									but.addEventListener('click', function(evt) {
										location.href = '../../templates/cancelOrder/cancelOrder.html?orderNo=' + obj.orderNo;
									});
									div.appendChild(but);

									if(obj.extType != 3 && obj.extType != 4) {
										var but = document.createElement('button');
										but.innerText = '催发货';
										but.addEventListener('click', function(evt) {
											document.getElementsByClassName('loadingBg')[0].style.display = 'block';
											var obj = evt.currentTarget.parentElement.parentElement.parentElement.obj;
											ai.post({
												url: 'OrderServer/OrderFlow/Expedite',
												data: {
													suborderno: obj.orderNo
												},
												load: function(json) {
													document.getElementsByClassName('loadingBg')[0].style.display = 'none';
													ai.alert(json.Message);
												}
											})
										});
										div.appendChild(but);
									}

									tem.querySelector('footer').appendChild(div);
								} else {
									tem.querySelector('footer').remove();
								}
								break;
							case '3':
								var div = document.createElement('div');
								if(obj.extType != 3 && obj.extType != 4) {
									var but = document.createElement('button');
									but.innerText = '查看物流';
									but.setAttribute('orderNo', obj.mainOrderNo)
									but.addEventListener('click', function(evt) {
										var obj = evt.currentTarget.parentElement.parentElement.parentElement.obj;
										location.href = '../../templates/logistical/logistical.html?orderNo=' + evt.currentTarget.getAttribute('orderNo');
									});
									div.appendChild(but);
								}

								var but = document.createElement('button');
								but.className = 'logistical-mark';
								but.innerText = '确认收货';
								but.addEventListener('click', function(evt) {
									delPubBoxText.innerHTML = '确定收到该商品？';
									document.getElementsByClassName('isdelPub')[0].style.display = 'block';
									myorder.rejEle = evt.currentTarget.parentElement.parentElement.parentElement;
									myorder.rejOrderNo = myorder.rejEle.obj.orderNo;
									myorder.btnType = '确认收货';
								});
								div.appendChild(but);
								tem.querySelector('footer').appendChild(div);
								tex = '已发货';
								break;
							case '4':
								tem.querySelector('footer').remove();
								break;
						}

						function gotoConfirm(evt) {
							var obj = evt.currentTarget.parentElement.parentElement.parentElement.obj;
							location.href = myorder.confirmUrl + obj.orderNo + '.html';
						}

						function gotoDetails(evt) {
							var ele = evt.currentTarget.parentElement;
							location.href = '../orderDetails/orderDetails.html?orderNo=' + ele.obj.orderNo;
						}
					}
				})
			}
			if(myorder.anlock) {
				view.style.webkitTransform = "translate3d(0px, 0px, 0px)";
			}
		}
	});
}

myorder.getBackOrder = function(view, judg) {
	var pageindex;
	if(view.dataset.index == undefined || judg) {
		pageindex = 1;
		view.dataset.index = 1;
	} else {
		pageindex = (Number(view.dataset.index) + 1);
		view.dataset.index = pageindex;
	}

	ai.post({
		url: 'OrderServer/Refund/CustomerGetDrawBackPage',
		data: {
			PageNum: pageindex,
			PageSize: 10
		},
		isNonce: true,
		load: function(json) {
			if(json.Data.PageData.length == 0 && !judg) {
				ai.alert('没有更多商品');
			}
			if(judg == true) {
				view.dataset.index = 1;
				view.innerHTML = '';
			}
			if(json.Data.PageData.length != 0) {
				ai.repeat({
					view: view,
					arr: json.Data.PageData,
					fun: function(tem, obj) {
						tem.querySelector('[att=storeName]').outerHTML = obj.drawback.storeName;
						ai.repeat({
							view: tem.getElementsByClassName('proList')[0],
							arr: obj.goods,
							fun: function(tem, obj) {
								tem.querySelector('[att=img]').src = obj.img_x;
								tem.querySelector('[att=product]').outerHTML = obj.goods_title;
								tem.querySelector('[att=sku]').outerHTML = obj.specs;
								tem.querySelector('[att=price]').outerHTML = Number(obj.sellprice).toFixed(2);
								tem.querySelector('[att=proNum]').outerHTML = obj.sellcount;
							}
						})
						tem.querySelector('[att=orderTotal]').innerHTML = obj.drawback.order_amount;
						tem.querySelector('[att=refundTotal]').innerHTML = obj.drawback.drawback_totalmoney.toFixed(2);
						tem.children[1].addEventListener('click', gotoDetails);

						tem.querySelector('footer').remove();
						tem.querySelector('[att=status]').innerText = obj.drawback.status;

						function gotoConfirm(evt) {
							var obj = evt.currentTarget.parentElement.parentElement.parentElement.obj;
							location.href = myorder.confirmUrl + obj.orderNo + '.html';
						}

						function gotoDetails(evt) {
							if(obj.drawback.drawback_state == 2) {
								location.href = '../backLogistical/backLogistical.html?drawbackId=' + obj.drawback.Id;
							} else {
								location.href = '../drawbackDetail/drawbackDetail.html?drawbackId=' + obj.drawback.Id;
							}
						}
					}
				})
			}
			if(myorder.anlock) {
				view.style.webkitTransform = "translate3d(0px, 0px, 0px)";
			}

		}
	});
}

myorder.addTouchScroll = function() {
	var eles = document.querySelectorAll('#views section');
	var views = undefined;
	var param = {};
	param.lock = false;
	param.act = false;

	for(var i = 0; i < eles.length; i++) {
		eles[i].addEventListener('touchstart', startFun);
		eles[i].addEventListener('touchmove', moveFun);
		eles[i].addEventListener('touchend', endFun);
	}

	function startFun(evt) {
		var tfs = evt.currentTarget.style.webkitTransform;
		param.dval = /\d{2,3}(?=px)/g.exec(tfs);
		if(param.dval == null) {
			param.dval = 0;
		} else {
			param.dval = Number(param.dval[0]);
		}
		views = evt.currentTarget;
		param.y = evt.touches[0].pageY;
		evt.currentTarget.style.webkitTransitionProperty = 'none';
	}

	function moveFun(evt) {

		var judgvalue = views.scrollHeight - views.clientHeight;
		var value = views.scrollTop;
		if(param.y - evt.touches[0].pageY < 0 && value == 0) {
			ing();
		} else if(value >= judgvalue && param.y - evt.touches[0].pageY > 0) {
			ing();
		}

		function ing() {
			evt.preventDefault();
			param.lock = true;
			if(param.y - evt.touches[0].pageY > 0) {
				param.act = true;
				value = -(param.y - evt.touches[0].pageY) / (param.y / evt.touches[0].pageY * 2);
				if(param.dval >= 0) {
					param.dval = -param.dval;
				}
			} else {
				param.act = false;
				value = -(param.y - evt.touches[0].pageY) / (evt.touches[0].pageY * 2 / param.y);
			}
			evt.currentTarget.style.webkitTransform = "translate3d(0px, " + (value + param.dval) + "px, 0px)";
		}
	}

	function endFun(evt) {
		if(param.lock) {
			param.lock = false;
			if(param.act) {
				//追加
				myorder.anlock = true;
				if(evt.currentTarget.dataset.type != 5) {
					myorder.getOrder(evt.currentTarget, evt.currentTarget.dataset.type);
				} else {
					myorder.getBackOrder(evt.currentTarget);
				}
				//				myorder.getOrder(evt.currentTarget, evt.currentTarget.dataset.type);
				evt.currentTarget.style.webkitTransitionProperty = '-webkit-transform';
				evt.currentTarget.style.webkitTransform = "translate3d(0px, -50px, 0px)";
			} else {
				//刷新
				myorder.anlock = true;
				if(evt.currentTarget.dataset.type != 5) {
					myorder.getOrder(evt.currentTarget, evt.currentTarget.dataset.type, true);
				} else {
					myorder.getBackOrder(evt.currentTarget, true);
				}
				//				myorder.getOrder(evt.currentTarget, evt.currentTarget.dataset.type, true);
				evt.currentTarget.style.webkitTransitionProperty = '-webkit-transform';
				evt.currentTarget.style.webkitTransform = "translate3d(0px, 50px, 0px)";
			}
		}
	}
}

myorder.init = function() {
	var buts = document.getElementById("buts").children;
	switch(location.hash) {
		//		case '#all':
		//			buts[0].click();
		//			document.getElementById("all").className = 'view init';
		//			break;
		case '#payment':
			buts[0].click();
			document.getElementById("payment").className = 'view init';
			break;
		case '#delivery':
			buts[1].click();
			document.getElementById("delivery").className = 'view init';
			break;
		case '#receipt':
			buts[2].click();
			document.getElementById("receipt").className = 'view init';
			break;
		case '#complete':
			buts[3].click();
			document.getElementById("complete").className = 'view init';
			break;
		case '#refund':
			buts[4].click();
			document.getElementById("refund").className = 'view init';
			break;
		default:
			buts[0].click();
			document.getElementById("payment").className = 'view init';
			break;
	}
}

myorder.exe = function() {
	myorder.addEvt();
	myorder.addTouchScroll();
	myorder.addMenuEvt();
	myorder.init();
	myorder.orderCount();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(myorder.exe)
}): ai.ready(myorder.exe);