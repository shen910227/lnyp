var shoppingCart = {};

shoppingCart.selectArr = {};
shoppingCart.viewinit = function() {

	//初始化增加店铺ID，购物车用
	if(location.href.indexOf('storeId') == -1) {
		if(localStorage.storeidForCart) {
			location.href = location.href + '?storeId=' + localStorage.storeidForCart;
		} else {
			location.href = location.href + '?storeId=0';
		}
	} else {
		localStorage.storeidForCart = ai.GetQueryString('storeId');
	}

	//清除是否修改收货地址标记
	if(localStorage.isChangeAddr == 1) {
		localStorage.isChangeAddr = 0;
	}
	var view = document.getElementsByClassName("view").item(0);
	view.style.height = view.clientHeight + 'px';
	view.style.position = 'relative';
	view.style.top = '0';
	view.style.bottom = '0';
	document.getElementsByClassName("cart-fot").item(0).style.position = 'relative';
}

//存储勾选的商品信息
shoppingCart.saveInfo = function() {
	shoppingCart.selectArr = [];
	shoppingCart.proForCoupon = [];
	var shop = document.getElementsByClassName('shop'),
		deliveryArr = [];
	for(var i = 0; i < shop.length; i++) {
		if(shop[i].firstElementChild.getElementsByTagName('input')[0].checked) {
			var proList = shop[i].getElementsByClassName('pro');
			for(var j = 0; j < proList.length; j++) {
				if(proList[j].getElementsByTagName('input')[0].checked) {
					var proData = {
						'id': proList[j].getAttribute('data-id'),
						'proid': proList[j].querySelector('[att=proTitle]').getAttribute('data-proid'),
						'skuid': proList[j].querySelector('[att=sku_final]').getAttribute('data-skuid'),
						'proTitle': proList[j].querySelector('[att=proTitle]').innerText,
						'imgSrc': proList[j].querySelector('.img').src,
						'sku': proList[j].querySelector('[att=sku_final]').innerText,
						'price': proList[j].querySelector('[att=price]').innerText,
						'num': proList[j].querySelector('.snum').value,
						'jgId': shop[i].querySelector('[goto=shop]').getAttribute('jgid'),
						'jgName': shop[i].querySelector('[goto=shop]').innerText,
						'storeid': proList[j].querySelector('[att=proTitle]').getAttribute('storeid'),
						'shareid': 0,
						'activityid': 0,
						'orderStyleid': 0,
						'isTaxGoods':proList[j].querySelector('[att=proTitle]').getAttribute('isTaxGoods')
					}
					shoppingCart.selectArr.push(proData);
					deliveryArr.push(proData.proid + '|' + proData.skuid + '|' + proData.num);
					shoppingCart.proForCoupon.push(proData.proid + '-' + proData.price + '-' + proData.num + '-' + proData.jgId);
				}
				
			}
		}
	}
	localStorage.proForCoupon = shoppingCart.proForCoupon.join(',');
	localStorage.proList = JSON.stringify(shoppingCart.selectArr);
	localStorage.pId_skuId_qty = deliveryArr.join(',');

	shoppingCart.strForConfirmPay = localStorage.proList + '@@' + localStorage.pId_skuId_qty + '@@' + localStorage.proForCoupon;
	//	location.href = '../confirmOrder/confirmOrder.html';
}

//shoppingCart.ProOnloadId = '';
//shoppingCart.changeSku = function(evt) {
//	if(evt.currentTarget.dataset.proId != shoppingCart.ProOnloadId) {
//		shoppingCart.ProOnloadId = evt.currentTarget.dataset.proId;
//		var colorBox = document.getElementById('select-box__colorBox');
//		var unitBox = document.getElementById('select-box__unitBox');
//
//		if(colorBox.children.length > 0) {
//			colorBox.innerHTML = ''
//		}
//		if(unitBox.children.length > 0) {
//			unitBox.innerHTML = '';
//		}
//		ai.post({
//			url: 'ProductServer/Product/GetProductById',
//			token: false,
//			data: {
//				id: evt.currentTarget.dataset.proId
//			},
//			load: function(json) {
//
//				shoppingCart.proPostInfo = {
//						productId: json.Data.Id,
//						skuid: '',
//					}
//					//创建商品属性内容
//				shoppingCart.Stock = json.Data.Stock;
//				shoppingCart.skuData = json.Data.Skus;
//				shoppingCart.SellPrice = json.Data.SellPrice;
//				document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.SellPrice;
//				document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.Stock;
//				shoppingCart.colorData = [];
//				shoppingCart.unitData = [];
//				shoppingCart.packageData = [];
//				document.querySelector('[url=select-box-pic]').src = json.Data.ImageUrl;
//				for(var i = 0; i < shoppingCart.skuData.length; i++) {
//					if(shoppingCart.skuData[i].Color_Id != 0) {
//						if(!colorTitle) {
//							var colorTitle = document.createElement('p');
//							colorTitle.innerHTML = shoppingCart.skuData[i].Color_Basetitle;
//							colorTitle.className = 'select-box__colorTitle';
//							colorTitle.id = 'select-box__colorTitle';
//							colorBox.appendChild(colorTitle);
//						}
//						if(shoppingCart.colorData.indexOf(shoppingCart.skuData[i].Color_Title) == -1) {
//							var colorItem = document.createElement('div');
//							colorItem.innerHTML = shoppingCart.skuData[i].Color_Title;
//							colorItem.className = 'select-box__colorItem';
//							colorItem.dataset.id = shoppingCart.skuData[i].Color_Id;
//							colorBox.appendChild(colorItem);
//						}
//						shoppingCart.colorData.push(shoppingCart.skuData[i].Color_Title);
//					}
//					if(shoppingCart.skuData[i].Unit_Id != 0) {
//						if(!unitTitle) {
//							var unitTitle = document.createElement('p');
//							unitTitle.innerHTML = shoppingCart.skuData[i].Unit_Basetitle;
//							unitTitle.className = 'select-box__unitTitle';
//							unitTitle.id = 'select-box__unitTitle';
//							unitBox.appendChild(unitTitle);
//						}
//						if(shoppingCart.unitData.indexOf(shoppingCart.skuData[i].Unit_Title) == -1) {
//							var unitItem = document.createElement('div');
//							unitItem.innerHTML = shoppingCart.skuData[i].Unit_Title;
//							unitItem.className = 'select-box__unitItem';
//							unitItem.dataset.id = shoppingCart.skuData[i].Unit_Id;
//							unitBox.appendChild(unitItem);
//						}
//						shoppingCart.unitData.push(shoppingCart.skuData[i].Unit_Title);
//					}
//				}
//				//商品属性按钮设置点击事件
//				var unitItems = document.getElementById('select-box__unitBox').getElementsByTagName('div');
//				for(var i = 0; i < unitItems.length; i++) {
//					unitItems[i].addEventListener("click", shoppingCart.LoadColor, false);
//					unitItems[i].id = '';
//					unitItems[i].className = 'select-box__unitItem';
//				}
//
//				var colorItems = document.getElementById('select-box__colorBox').getElementsByTagName('div');
//				for(var i = 0; i < colorItems.length; i++) {
//					colorItems[i].addEventListener("click", shoppingCart.LoadUnit, false);
//					colorItems[i].id = '';
//					colorItems[i].className = 'select-box__colorItem';
//				}
//			}
//		})
//	} else {
//		document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.SellPrice;
//		document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.Stock;
//		//商品属性按钮设置点击事件
//		var unitItems = document.getElementById('select-box__unitBox').getElementsByTagName('div');
//		for(var i = 0; i < unitItems.length; i++) {
//			unitItems[i].addEventListener("click", shoppingCart.LoadColor, false);
//			unitItems[i].id = '';
//			unitItems[i].className = 'select-box__unitItem';
//		}
//		var colorItems = document.getElementById('select-box__colorBox').getElementsByTagName('div');
//		for(var i = 0; i < colorItems.length; i++) {
//			colorItems[i].addEventListener("click", shoppingCart.LoadUnit, false);
//			colorItems[i].id = '';
//			colorItems[i].className = 'select-box__colorItem';
//		}
//	}
//	document.getElementsByClassName('select-box__NoShow')[0].value = 1;
//	document.getElementById('select').style.display = 'block';
//	var select_box = document.getElementById('select_box');
//	select_box.classList.add('in');
//
//	function clearclass() {
//		select_box.style.webkitTransform = 'translate3d(0, 0, 0)';
//		select_box.classList.remove('in');
//		select_box.removeEventListener('webkitAnimationEnd', clearclass, false);
//	}
//	select_box.addEventListener('webkitAnimationEnd', clearclass, false);
//
//	document.getElementById('btnBuyOrAdd').dataset.bridgeId = evt.currentTarget.dataset.cartId;
//}
shoppingCart.getList = function() {
	ai.post({
		url: 'ProductServer/ShopCart/GainCartList',
		data: {
			storeid: ai.GetQueryString('storeId')
		},
		load: loadFun
	})

	function loadFun(json) {
		if(json.Data) {
			ai.repeat({
				view: document.getElementById("box"),
				arr: json.Data,
				fun: repeatFun
			})

			function repeatFun(tem, obj) {
				//			tem.querySelector('[goto=shop]').addEventListener('click', function(evt) {
				//				var obj = evt.currentTarget.parentElement.parentElement.obj;
				//				location.href = '../shopDetails/shopDetails.html?storeId=' + obj.storeid;
				//			});
				tem.querySelector('[goto=shop]').setAttribute('storeid', obj.CartList[0].storeid);
				tem.querySelector('[goto=shop]').setAttribute('jgid', obj.CartList[0].jgId);
				tem.querySelector('[att=shopname]').outerHTML = obj.jgName;
				//tem.querySelector('[goto=shop]').addEventListener('click', function(evt) {
				//location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + evt.currentTarget.getAttribute('storeid'); //需要处理
				//})

				var pro = tem.lastElementChild.cloneNode(true);
				tem.removeChild(tem.lastElementChild);

				tem.querySelector('[evt=shopcheck]').addEventListener('click', shopcheckFun);

				for(var i = 0; i < obj.CartList.length; i++) {

					var childTem = pro.cloneNode(true);
					var li = obj.CartList[i];
					childTem.obj = obj.CartList[i];

					childTem.dataset.id = childTem.obj.id;
					var proTitleEle = childTem.querySelector('[att=proTitle]');
					proTitleEle.dataset.proid = childTem.obj.goodsid;
					proTitleEle.setAttribute('storeid', li.storeid);
					proTitleEle.setAttribute('isTaxGoods', li.isTaxGoods);
					childTem.querySelector('[att=proname]').outerHTML = li.title;
					childTem.querySelector('.img').src = li.img_url;
					childTem.querySelector('[att=sku_final]').innerHTML = li.zhaiyao;
					childTem.querySelector('[att=sku_final]').dataset.skuid = childTem.obj.skuid;
					childTem.querySelector('[att=price]').innerText = li.currentPrice;
					childTem.querySelector('.snum').value = li.goodsnum;
					childTem.querySelector('.snum').name = obj.CartList[i].id;
					//					childTem.querySelector('a').dataset.proId = obj.CartList[i].goodsid;
					//					childTem.querySelector('a').dataset.cartId = obj.CartList[i].id;
					//					childTem.querySelector('a').dataset.onOff = 0;
					//					childTem.querySelector('a').addEventListener('click', shoppingCart.changeSku);

					childTem.querySelector('.clo').addEventListener('click', function(evt) {
						var delView = document.getElementById("isdel"),
							obj = evt.currentTarget.parentElement.parentElement.parentElement.obj,
							ele = evt.currentTarget.parentElement.parentElement.parentElement;
						shoppingCart.delproid = obj.id;
						shoppingCart.delproele = ele;
						delView.style.display = 'block';
					});

					childTem.querySelector('[evt=procheck]').addEventListener('click', procheckFun);

					childTem.querySelector('.add').addEventListener('click', changeSnum);

					childTem.querySelector('.red').addEventListener('click', changeSnum);
					childTem.querySelector('.snum').addEventListener('blur', blurEvt);
					childTem.querySelector('.snum').addEventListener('input', inputEvt);
					childTem.querySelector('.snum').addEventListener('focus', focusEvt);
					tem.appendChild(childTem);
				}

				function focusEvt(evt) {
					shoppingCart.countCache = evt.currentTarget.value;
				}

				function inputEvt(evt) {
					if(evt != undefined) {
						var pro = evt.currentTarget.parentElement.parentElement.parentElement,
							evtTarEle = evt.currentTarget,
							val = evtTarEle.value;
						var obj = pro.obj,
							shopObj = pro.parentElement.obj,
							procheck = pro.querySelector('[evt=procheck]');
						var re = /^\+?[1-9][0-9]*$/;
						if(re.test(val)) {
							ai.post({
								url: 'ProductServer/ShopCart/SetPrpductNum',
								data: {
									num: parseInt(val),
									productId: obj.goodsid,
									Skuid: obj.skuid,
									storeid: obj.storeid
								},
								load: function(json) {
									if(json.ResultCode == 1000) {
										if(procheck.checked) {
											shoppingCart.againCount();
										}
										shoppingCart.countCache = evtTarEle.value;
									} else {
										evt.target.value = shoppingCart.countCache;
										ai.alert(json.Message);
									}
								}
							});
						} else if(val != '') {
							evtTarEle.value = shoppingCart.countCache;
						}
					}
				}

				function blurEvt(evt) {
					if(evt.currentTarget.value == '') {
						evt.currentTarget.value = shoppingCart.countCache;
					}
				}

				function changeSnum(evt) {

					var pro = evt.currentTarget.parentElement.parentElement.parentElement;

					var obj = pro.obj,
						shopObj = pro.parentElement.obj,
						procheck = pro.querySelector('[evt=procheck]'),
						snum = evt.currentTarget.parentElement.querySelector('.snum'),
						type = evt.currentTarget.className == 'add' ? 'add' : 'plus';

					if(type != 'add' && !(Number(snum.value) > 1)) {
						return false;
					}

					if(type == 'add') {
						snum.value = Number(snum.value) + 1;
					} else {
						snum.value = Number(snum.value) - 1;
					}
					if(snum.value == 0) {
						snum.value = 1
					} else {
						ai.post({
							url: 'ProductServer/ShopCart/ModifyPrpductNum',
							data: {
								storeid: obj.storeid,
								type: type,
								productId: obj.goodsid,
								Skuid: obj.skuid,
							},
							load: function(json) {
								if(json.ResultCode == 1000) {
									isAgainCount();
								} else {
									ai.alert(json.Message);
									if(type == 'add') {
										snum.value = Number(snum.value) - 1;
									} else {
										snum.value = Number(snum.value) + 1;
									}
								}

							}
						});
					}

					function isAgainCount() {
						if(procheck.checked) {
							shoppingCart.againCount();
						}
					}

					return false;
				}

				function shopcheckFun(evt) {
					var prochecks = evt.currentTarget.parentElement.parentElement.querySelectorAll('[evt=procheck]'),
						bool = evt.currentTarget.checked;

					for(var i = 0; i < prochecks.length; i++) {
						if(bool) {
							if(false == prochecks[i].checked) {
								prochecks[i].click();
							}
						} else {
							if(true == prochecks[i].checked) {
								prochecks[i].click();
							}
						}
					}
				}

				function procheckFun(evt) {
					var prochecks = evt.currentTarget.parentElement.parentElement.querySelectorAll('[evt=procheck]'),
						shopcheck = evt.currentTarget.parentElement.parentElement.querySelector('[evt=shopcheck]'),
						allcheck = document.getElementsByClassName("sel").item(0).firstElementChild,
						allprocheck = document.querySelectorAll('[evt=procheck]'),
						alljudg = true,
						judg = false;
					for(var i = 0; i < prochecks.length; i++) {
						if(true == prochecks[i].checked) {
							judg = true
						}
					}

					for(var i = 0; i < allprocheck.length; i++) {
						if(allprocheck[i].checked == false) {
							alljudg = false;
						}
					}

					allcheck.checked = alljudg;

					shopcheck.checked = judg;

					shoppingCart.againCount();
				}

			}
		}

		var checks = document.querySelectorAll('[type=checkbox]');
		for(var i = 0; i < checks.length; i++) {
			checks[i].checked = false;
		};
	}

}

shoppingCart.againCount = function() {
	var pros = document.getElementsByClassName("pro"),
		countele = document.getElementById("countall"),
		procount = document.getElementById("pro-count"),
		sl = 0,
		count = 0;
	for(var i = 0; i < pros.length; i++) {
		var judg = pros[i].querySelector('.check').checked;
		if(judg) {
			sl++;
			var price = pros[i].querySelector('[att=price]').innerText,
				snum = pros[i].querySelector('.snum').value;
			var cou = parseInt(parseFloat(price) * 10000) * Number(snum);
			count += parseInt(cou);
		}
	}
	procount.innerText = sl;
	countele.innerText = '￥' + count / 10000;
}

shoppingCart.addEvt = function() {
	//	document.getElementById("edit-del").addEventListener('click', function(evt) {
	//		document.getElementById("cart-edit").style.display = 'none';
	//		console.log(shoppingCart.editproid);
	//	})
	var closeBtn = document.getElementById('closeSelectBox');
	var decBtn = document.getElementsByClassName('select-box__NoDec');
	var addBtn = document.getElementsByClassName('select-box__NoAdd');
	var numberShow = document.getElementsByClassName('select-box__NoShow');
	document.getElementById("isdel-del").addEventListener('click', function(evt) {
		document.getElementById("isdel").style.display = 'none';
	})

	document.getElementById("sure-del").addEventListener('click', function(evt) {
		ai.post({
			url: 'ProductServer/ShopCart/ClearShopCartByProductId',
			data: {
				productid: shoppingCart.delproid
			},
			load: function(json) {
				if(json.ResultCode == 1000) {
					if(shoppingCart.delproele.parentElement.children.length == 2) {
						shoppingCart.delproele.parentElement.remove();
					} else {
						shoppingCart.delproele.remove();
					}
					shoppingCart.againCount();
					ai.alert(json.Message);
				} else {
					ai.alert(json.Message);
				}
				document.getElementById("isdel").style.display = 'none';
			}
		});
	})

	closeBtn.addEventListener('click', function() {
		document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, 0)';
		select_box.classList.add('out');

		function clearclass() {
			document.getElementById('select').style.display = 'none';
			document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
			select_box.classList.remove('out');
			select_box.style.webkitTransform = 'translate3d(0, 100%, 0)';
			select_box.removeEventListener('webkitAnimationEnd', clearclass, false);
		}
		select_box.addEventListener('webkitAnimationEnd', clearclass, false);

	}, false)
	decBtn[0].addEventListener('click', function() {
		if(parseInt(numberShow[0].value) == 1) {
			ai.alert('不能再减了~');
		} else {
			numberShow[0].value--;
		}
		shoppingCart.proPostInfo.Num = numberShow[0].value;
	}, false)
	addBtn[0].addEventListener('click', function() {
		var stockShow = parseInt(document.getElementsByClassName('select-box__stock')[0].innerHTML.substring(3))
		if(parseInt(numberShow[0].value) == stockShow) {
			ai.alert('购买数量不能超出库存~');
		} else {
			numberShow[0].value++;
		}
		shoppingCart.proPostInfo.Num = numberShow[0].value;
	}, false)
	numberShow[0].addEventListener('blur', function(event) {
		var stockShow = parseInt(document.getElementsByClassName('select-box__stock')[0].innerHTML.substring(3))
		if(parseInt(numberShow[0].value) > stockShow) {
			ai.alert('购买数量不能超出库存~');
			numberShow[0].value = stockShow;
		} else if(parseInt(numberShow[0].value) <= 0) {
			numberShow[0].value = 1;
		}
		shoppingCart.proPostInfo.Num = numberShow[0].value;
	}, false)

	document.getElementById('btnBuyOrAdd').addEventListener('click', shoppingCart.addOrBuy, false);
	document.getElementsByClassName('but')[0].addEventListener('click', function() {
		if(parseInt(document.getElementById('pro-count').innerHTML) > 0) {
			shoppingCart.saveInfo();
			ai.post({
				url: '/OrderServer/Order/GainOrderInfoCache',
				data: {
					cachecontent: shoppingCart.strForConfirmPay
				},
				load: function(json) {
					location.href = '../confirmOrder/confirmOrder.html?Key=' + json.Data;
				}
			})
		} else {
			ai.alert('请选择商品');
		}

	})
}

shoppingCart.addOrBuy = function(evt) {
	if(ai.isSelSku()) {
		document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, 0)';
		select_box.classList.add('out');

		function clearclass() {
			document.getElementById('select').style.display = 'none';
			document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
			select_box.classList.remove('out');
			select_box.style.webkitTransform = 'translate3d(0, 100%, 0)';
			select_box.removeEventListener('webkitAnimationEnd', clearclass, false);
		}
		select_box.addEventListener('webkitAnimationEnd', clearclass, false);

		if(document.getElementById('select-box__colorBox').children.length == 0 && document.getElementById('select-box__unitBox').children.length == 0) {
			shoppingCart.proPostInfo.skuid = 0;
		}

	}
}

shoppingCart.addAllCheck = function() {

	document.getElementsByClassName("sel").item(0).firstElementChild.addEventListener('click', function(evt) {
		var pros = document.querySelectorAll('[evt=procheck]');
		var judg = evt.currentTarget.checked;
		for(var i = 0; i < pros.length; i++) {
			if(judg) {
				if(false == pros[i].checked) {
					pros[i].click();
				}
			} else {
				if(true == pros[i].checked) {
					pros[i].click();
				}
			}
		}
	})

}

//点击颜色时处理所有颜色和属性按钮的显示和事件
shoppingCart.LoadUnit = function(evt) {
		var unitItems;
		var unitOffItems;
		var obj = evt.currentTarget;
		var colorid = evt.currentTarget.dataset.id;
		if(obj.id == "") {
			//选择属性联动单位
			//如果没有单位就直接设置sku
			if(shoppingCart.unitData != "") {
				//先移除所有属性按钮的事件
				unitItems = document.querySelectorAll('.select-box__unitItem');
				for(var i = 0; i < unitItems.length; i++) {
					unitItems[i].removeEventListener("click", shoppingCart.LoadColor, false);
					unitItems[i].className = 'select-box__unitOff';
				}
				//保存所有可点击的属性按钮
				var arr = [];
				//查找当前单位对应的属性，并给属性设置事件
				for(var j = 0; j < shoppingCart.skuData.length; j++) {
					if(shoppingCart.skuData[j].Color_Id == colorid) {
						var unitid = shoppingCart.skuData[j].Unit_Id;
						unitOffItems = document.querySelectorAll('.select-box__unitOff');
						for(var k = 0; k < unitOffItems.length; k++) {
							if(unitOffItems[k].dataset.id == unitid) {
								unitOffItems[k].addEventListener("click", shoppingCart.LoadColor, false);
								unitOffItems[k].className = "select-box__unitItem";
								arr.push(unitOffItems[k]);
							};
						}
					}
				}
			}
			//移除其它单位的选中
			var colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].id = '';
			}
			//选中当前单位
			obj.id = "colorSelect";
		} else {
			//重置价格和库存
			document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.SellPrice;
			document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.Stock;
			//取消选中的单位
			obj.id = "";
			if(shoppingCart.unitData != "") {
				//所有属性都添加事件
				unitOffItems = document.querySelectorAll('.select-box__unitOff');
				for(var i = 0; i < unitOffItems.length; i++) {
					unitOffItems[i].className = "select-box__unitItem";
				}
				unitItems = document.querySelectorAll('.select-box__unitItem');
				for(var i = 0; i < unitItems.length; i++) {
					unitItems[i].addEventListener("click", shoppingCart.LoadColor, false);
				}
			}
		}
		//设置SKU对应的信息
		shoppingCart.getsku();

	}
	//点击属性时处理所有颜色和属性按钮的显示和事件
shoppingCart.LoadColor = function(evt) {
	var colorItems;
	var colorOffItems;
	var obj = evt.currentTarget;
	var unitid = evt.currentTarget.dataset.id;
	if(obj.id == "") {
		//选择颜色联动单位
		//如果没有单位就直接设置sku
		if(shoppingCart.colorData != "") {
			//先移除所有颜色按钮的事件
			colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].removeEventListener("click", shoppingCart.LoadUnit, false);
				colorItems[i].className = 'select-box__colorOff';
			}
			//保存所有可点击的颜色按钮
			var arr = [];
			//查找当前单位对应的颜色，并给颜色设置事件
			for(var j = 0; j < shoppingCart.skuData.length; j++) {
				if(shoppingCart.skuData[j].Unit_Id == unitid) {
					var colorid = shoppingCart.skuData[j].Color_Id;
					colorOffItems = document.querySelectorAll('.select-box__colorOff');
					for(var k = 0; k < colorOffItems.length; k++) {
						if(colorOffItems[k].dataset.id == colorid) {
							colorOffItems[k].addEventListener("click", shoppingCart.LoadUnit, false);
							colorOffItems[k].className = "select-box__colorItem";
							arr.push(colorOffItems[k]);
						};
					}
				}
			}
		}
		//移除其它单位的选中
		var unitItems = document.querySelectorAll('.select-box__unitItem');
		for(var i = 0; i < unitItems.length; i++) {
			unitItems[i].id = '';
		}
		//选中当前单位
		obj.id = "unitSelect";
	} else {
		//重置价格和库存
		document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.SellPrice;
		document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.Stock;
		//取消选中的单位
		obj.id = "";
		if(shoppingCart.colorData != "") {
			//所有颜色都添加事件
			colorOffItems = document.querySelectorAll('.select-box__colorOff');
			for(var i = 0; i < colorOffItems.length; i++) {
				colorOffItems[i].className = "select-box__colorItem";
			}
			colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].addEventListener("click", shoppingCart.LoadUnit, false);
			}
		}
	}
	//设置SKU对应的信息
	shoppingCart.getsku();
}
shoppingCart.getsku = function() {
	var colorItems_mark = document.querySelectorAll('#colorSelect');
	var unitItems_mark = document.querySelectorAll('#unitSelect');
	if(unitItems_mark.length == 0 && colorItems_mark.length == 0) {
		document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.SellPrice;
		document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.Stock;
	} else {
		var unitid_fin = 0;
		if(unitItems_mark.length > 0) {
			var _ele = unitItems_mark;
			unitid_fin = _ele[0].dataset.id;
		}
		var colorid_fin = 0;
		if(colorItems_mark.length > 0) {
			var _ele = colorItems_mark;
			colorid_fin = _ele[0].dataset.id;
		}
		for(var i = 0; i < shoppingCart.skuData.length; i++) {
			//查找SKUID
			if(colorid_fin == shoppingCart.skuData[i].Color_Id && unitid_fin == shoppingCart.skuData[i].Unit_Id) {
				document.querySelector('[value=skuPrice]').innerHTML = "￥" + shoppingCart.skuData[i].Price;
				document.querySelector('[value=skuStock]').innerHTML = "库存：" + shoppingCart.skuData[i].Stock;
				shoppingCart.proPostInfo.skuid = shoppingCart.skuData[i].Id;
			}
		}
	}
}

shoppingCart.exe = function() {
	shoppingCart.viewinit();
	shoppingCart.getList();
	shoppingCart.addAllCheck();
	shoppingCart.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(shoppingCart.exe)
}): ai.ready(shoppingCart.exe);