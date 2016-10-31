var productDetals = {};

productDetals.init = function() {
	localStorage.storeidForCart = ai.GetQueryString('storeId');
	if(localStorage.isChangeAddr == 1) {
		localStorage.isChangeAddr = 0;
	}
	document.getElementsByClassName('swiper-container')[0].style.height = document.body.clientWidth + 'px';
}

//轮播图配置 
productDetals.swiper = function() {
	productDetals.swiperObj = new Swiper('.product-info>.swiper-container', {
		pagination: '.product-info>.swiper-container>.swiper-pagination',
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',
		paginationClickable: true,
		spaceBetween: 30,
		centeredSlides: true,
		autoplay: 2500,
		autoplayDisableOnInteraction: false
	});
}
productDetals.getProInfo = function() {
	var data = {
		id: ai.GetQueryString('proId')
	};
	if(location.href.indexOf('shareid') != -1) {
		data.shareid = ai.GetQueryString('shareid');
	}
	ai.post({
		url: 'ProductServer/Product/GetProductById',
		token: false,
		data: data,
		load: function(json) {
			//写轮播图片
			var picStr = '<div class="swiper-slide"><img class="swiper-slide__pic" src="' + json.Data.ImageUrl + '"/></div>';

			for(var i = 0; i < json.Data.Albums.length; i++) {
				picStr += '<div class="swiper-slide"><img class="swiper-slide__pic" src="' + json.Data.Albums[i].original_path + '"/></div>';
			}
			document.getElementsByClassName('swiper-wrapper')[0].innerHTML = picStr;
			productDetals.swiperObj.update(true);
			//页面写数据
			var proTitleEle = document.querySelector('[value=proName]');
			proTitleEle.setAttribute('jgid', json.Data.JgId);
			proTitleEle.setAttribute('jgname', json.Data.BusinessName);
			proTitleEle.setAttribute('isTaxGoods', json.Data.IsTaxGoods);
			proTitleEle.innerHTML = json.Data.ProductName;
			productDetals.proTitle = json.Data.ProductName;
			productDetals.proJson = json.Data;
			ai.post({
				url: 'ProductServer/Product/GetProductMarkById',
				data: {
					productid: ai.GetQueryString('proId'),
					skuid: 0
				},
				load: function(json) {
					if(json.ResultCode == 1000) {
						productDetals.markData = JSON.parse(JSON.stringify(json.Data));
						for(var i = 0; i < productDetals.markData.length; i++) {
							if(productDetals.markData[i].Type == 3) {
								proTitleEle.innerHTML = "<span class='mark'>" + productDetals.markData[i].Description + "</span>" + productDetals.proTitle;
								productDetals.markData.splice(i, 1);
								break;
							}
						}
						for(var i = 0; i < productDetals.markData.length; i++) {
							if(productDetals.markData[i].Type == 5) {
								productDetals.isO2O = true;
								document.getElementsByClassName('select-box__NoDec')[0].remove();
								document.getElementsByClassName('select-box__NoAdd')[0].remove();
								document.getElementsByClassName('select-box__NoShow')[0].readOnly = 'readOnly';
								productDetals.markData.splice(i, 1);
								break;
							}
						}
						for(var i = 0; i < productDetals.markData.length; i++) {
							if(productDetals.markData[i].Type == 1) {
								productDetals.isElCoupons = true;
								break;
							}
						}
						productDetals.markData = productDetals.markData.concat([{
							"Type": '',
							"Description": "正品保证"
						}, {
							"Type": '',
							"Description": "收货保障"
						}]);

						ai.repeat({
							view: document.getElementsByClassName('labelBox')[0],
							arr: productDetals.markData,
							fun: repeatMarkFun
						})

						function repeatMarkFun(tem, obj) {
							tem.querySelector('.labelBox__itemTxt').innerHTML = obj.Description;
						}
						//设置底部按钮
						productDetals.footerBtn(productDetals.proJson);
					} else {
						ai.alert(json.Message);
					}
				}
			})
			document.querySelector('[value=sellPrice]').innerHTML = "￥" + json.Data.SellPrice;
			document.querySelector('[value=marketPrice]').innerHTML = "￥" + json.Data.MarketPrice;
			document.querySelector('[value=stock]').innerHTML = "库存：" + json.Data.Stock;
			document.querySelector('[value=sales]').innerHTML = "已售：" + json.Data.Sales;
			if(json.Data.BusinessPhone != '') {
				BusinessPhone = json.Data.BusinessPhone;
			} else {
				BusinessPhone = json.Data.BusinessMobile;
			}
			document.querySelector('[att=telNo]').innerHTML = BusinessPhone;
			document.querySelector('.product-mune__phone').href = 'tel:' + BusinessPhone;
			ai.post({
				url: 'ProductServer/Product/GetProductDetailById',
				data: {
					productId: ai.GetQueryString('proId')
				},
				load: function(json) {
					document.getElementsByClassName('tuwen')[0].innerHTML = json.Data.content;
					var iframes = document.getElementsByClassName('videoPre');
					for(var i = 0; i < iframes.length; i++) {
						ai.iframeInitH(iframes[i]);
					}
					var videoLive = document.getElementsByClassName('mainContent__videoLive');
					for(var i = 0; i < videoLive.length; i++) {
						ai.videoLiveEvt(videoLive[i]);
					}
					if(json.Data.productService != '') {
						document.getElementsByClassName('service')[0].innerHTML = json.Data.productService;
						document.getElementsByClassName('service')[0].style.display = 'block'
					}
				}
			})

			//			创建倒计时
			var countdown = document.getElementsByClassName('countdown')[0],
				buyBtn = document.getElementById('buyDirect');
			if(json.Data.Type == 9 && location.href.indexOf('arctiveid') != -1 && location.href.indexOf('shareid') != -1) {
				buyBtn.disabled = 'disabled';
				buyBtn.style.backgroundColor = '#BBBBBB';
				ai.post({
					url: 'ProductServer/ActivitiesCheck/GainActivityProductById',
					data: {
						'ActivityType': 4,
						'StoreId': ai.GetQueryString('storeId'),
						'ProductId': ai.GetQueryString('proId'),
						'ActivityId': ai.GetQueryString('arctiveid')
					},
					baseURL: 2,
					load: function(json) {

						var re = /\d+/g;
						var startTime = json.Data.SellStartTime,
							endTime = json.Data.SellEndTime;

						var startArr = startTime.match(re),
							endArr = endTime.match(re);

						var iNow = null,
							iStart = null,
							iEnd = null;

						var str = '',
							title = '';

						var t = 0;
						var timer = null;
						var isCancel = false;

						countdownfn();

						function countdownfn() {

							clearInterval(timer);
							iStart = new Date(startArr[0], startArr[1] - 1, startArr[2], startArr[3], startArr[4], startArr[5]);
							iEnd = new Date(endArr[0], endArr[1] - 1, endArr[2], endArr[3], endArr[4], endArr[5]);
							iNow = new Date();

							if((Math.floor((iStart - iNow) / 1000)) > 0) {
								buyBtn.disabled = 'disabled';
								buyBtn.style.backgroundColor = '#BBBBBB';
								countdown.style.backgroundColor = '#BBBBBB';
								iNew = iStart;
								title = "距活动开始还有：";
								t = Math.floor((iNew - iNow) / 1000);
								var hh = Math.floor(t % 86400 / 3600) > 9 ? Math.floor(t % 86400 / 3600) : '0' + Math.floor(t % 86400 / 3600),
									mm = Math.floor(t % 86400 % 3600 / 60) > 9 ? Math.floor(t % 86400 % 3600 / 60) : '0' + Math.floor(t % 86400 % 3600 / 60),
									ss = t % 60 > 9 ? t % 60 : '0' + t % 60;
								countdown.innerHTML = title + Math.floor(t / 86400) + '天:' + hh + ':' + mm + ':' + ss;
							} else if(Math.floor((iEnd - iNow)) > 0) {
								iNew = iEnd;
								title = "本品抢购还剩：";
								buyBtn.disabled = '';
								buyBtn.style.backgroundColor = '#f02804';
								countdown.style.backgroundColor = '#f02804';
								t = Math.floor((iNew - iNow) / 1000);
								var hh = Math.floor(t % 86400 / 3600) > 9 ? Math.floor(t % 86400 / 3600) : '0' + Math.floor(t % 86400 / 3600),
									mm = Math.floor(t % 86400 % 3600 / 60) > 9 ? Math.floor(t % 86400 % 3600 / 60) : '0' + Math.floor(t % 86400 % 3600 / 60),
									ss = t % 60 > 9 ? t % 60 : '0' + t % 60;
								countdown.innerHTML = title + Math.floor(t / 86400) + '天:' + hh + ':' + mm + ':' + ss;
								isCancel = true;
							} else {
								buyBtn.disabled = 'disabled';
								buyBtn.style.backgroundColor = '#BBBBBB';
								countdown.style.backgroundColor = '#BBBBBB';
								countdown.innerHTML = '已结束';
								return false;
							}

							timer = setInterval(function() {
								iNow = new Date();
								t = Math.floor((iNew - iNow) / 1000);
								if(t > 0) {
									var hh = Math.floor(t % 86400 / 3600) > 9 ? Math.floor(t % 86400 / 3600) : '0' + Math.floor(t % 86400 / 3600),
										mm = Math.floor(t % 86400 % 3600 / 60) > 9 ? Math.floor(t % 86400 % 3600 / 60) : '0' + Math.floor(t % 86400 % 3600 / 60),
										ss = t % 60 > 9 ? t % 60 : '0' + t % 60;
									str = title + Math.floor(t / 86400) + '天:' + hh + ':' + mm + ':' + ss;

									countdown.innerHTML = str;

								} else {
									clearInterval(timer);
									countdown.innerHTML = title + '0天:00:00:00';
									if(isCancel) {
										buyBtn.disabled = 'disabled';
										buyBtn.style.backgroundColor = '#BBBBBB';
										countdown.style.backgroundColor = '#BBBBBB';
										countdown.innerHTML = '已结束';
									} else {
										countdownfn();
									}
								}

							}, 1000);
						}
					}
				})
			} else if(json.Data.Type == 9 && (location.href.indexOf('arctiveid') == -1 || location.href.indexOf('shareid') == -1)) {
				buyBtn.disabled = 'disabled';
				bugBtn.removeEventListener('click', buy, false);
				buyBtn.style.backgroundColor = '#BBBBBB';
				countdown.style.backgroundColor = '#BBBBBB';
				countdown.innerHTML = '该商品的链接地址不正确，请检查';
			}

			//			if(0) { //需要处理 收藏功能
			//				document.querySelector('[url=likeLogo]').src = '../../img/icon/icon_like@3x-min.png';
			//			}
			//加入购物车提交的部分数据提前存
			productDetals.proPostInfo = {
				productId: json.Data.Id,
				skuid: '',
			}

			//创建商品属性内容
			productDetals.Stock = json.Data.Stock;
			productDetals.skuData = json.Data.Skus;
			productDetals.SellPrice = json.Data.SellPrice;
			var colorTitle = document.getElementById('select-box__colorTitle');
			var unitTitle = document.getElementById('select-box__unitTitle');
			var packageTitle = document.getElementById('select-box__packageTitle');
			var colorBox = document.getElementById('select-box__colorBox');
			var unitBox = document.getElementById('select-box__unitBox');
			var packageBox = document.getElementById('select-box__packageBox');
			productDetals.colorData = [];
			productDetals.unitData = [];
			productDetals.packageData = [];
			document.querySelector('[value=skuPrice]').innerHTML = productDetals.SellPrice;
			document.querySelector('[value=skuStock]').innerHTML = "库存：" + productDetals.Stock;
			document.querySelector('[url=select-box-pic]').src = json.Data.ImageUrl;
			for(var i = 0; i < productDetals.skuData.length; i++) {
				if(productDetals.skuData[i].Color_Id != 0) {
					if(colorTitle.className == '') {
						colorTitle.className = 'select-box__colorTitle';
						colorTitle.innerHTML = productDetals.skuData[i].Color_Basetitle;
					}
					if(productDetals.colorData.indexOf(productDetals.skuData[i].Color_Title) == -1) {
						var colorItem = document.createElement('div');
						colorItem.innerHTML = productDetals.skuData[i].Color_Title;
						colorItem.className = 'select-box__colorItem';
						colorItem.dataset.id = productDetals.skuData[i].Color_Id;
						colorBox.appendChild(colorItem);
					}
					productDetals.colorData.push(productDetals.skuData[i].Color_Title);
				}
				if(productDetals.skuData[i].Unit_Id != 0) {
					if(unitTitle.className == '') {
						unitTitle.className = 'select-box__unitTitle';
						unitTitle.innerHTML = productDetals.skuData[i].Unit_Basetitle;
					}
					if(productDetals.unitData.indexOf(productDetals.skuData[i].Unit_Title) == -1) {
						var unitItem = document.createElement('div');
						unitItem.innerHTML = productDetals.skuData[i].Unit_Title;
						unitItem.className = 'select-box__unitItem';
						unitItem.dataset.id = productDetals.skuData[i].Unit_Id;
						unitBox.appendChild(unitItem);
					}
					productDetals.unitData.push(productDetals.skuData[i].Unit_Title);
				}
			}

			//商品属性按钮设置点击事件
			var unitItems = document.querySelectorAll('.select-box__unitItem');
			for(var i = 0; i < unitItems.length; i++) {
				unitItems[i].addEventListener("click", productDetals.LoadColor, false);
			}
			var colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].addEventListener("click", productDetals.LoadUnit, false);
			}

			//商品详情页面点击跳转所需信息提前存
			productDetals.tuwenUrl = json.Data.Url;
			productDetals.JdId = json.Data.JgId;
			productDetals.proImg = json.Data.ImageUrl;
			productDetals.BusinessName = json.Data.BusinessName;
		}
	})
}

//设置底部按钮
productDetals.footerBtn = function(proJson) {
	var footer = document.getElementsByClassName('product-footer')[0];
	if(proJson.status) {
		footer.innerHTML = '<div class="gotoShop"><img class="gotoShop__img" src="../../img/icon/goodsdetail_shop@3x-min.png"><p class="gotoShop__txt">进店</p></div><button class="product-footer__down">该商品已下架</button>';
	} else {
		if(proJson.Type == 9 || location.href.indexOf('shareid') != -1 || productDetals.isO2O || productDetals.isElCoupons) {
			footer.innerHTML = '<div class="gotoShop"><img class="gotoShop__img" src="../../img/icon/goodsdetail_shop@3x-min.png"><p class="gotoShop__txt">进店</p></div><button id="buyDirect" class="product-footer__onlyBuy">立即购买</button>';
		} else {
			footer.innerHTML = '<div class="gotoShop"><img class="gotoShop__img" src="../../img/icon/goodsdetail_shop@3x-min.png"><p class="gotoShop__txt">进店</p></div><button id="buyDirect" class="product-footer__btn-buy">立即购买</button><button id="addShoppingCart" class="product-footer__btn-add">加入购物车</button>';
			//增加加入购物车的点击事件
			var addCartBtn = document.getElementById('addShoppingCart');
			addCartBtn.addEventListener('click', function() {
				ai.isLogin(function() {

					document.getElementById('btnBuyOrAdd').innerHTML = '加入购物车';
					document.getElementById('select').style.display = 'block';
					document.getElementById('select_box').className = 'select-box selectIn';

					function clearClass() {
						document.getElementById('select_box').className = 'select-box';
						document.getElementById('select_box').style.webkitTransform = 'translate3d(0, 0, 0)';
						document.getElementById('select_box').removeEventListener('webkitAnimationEnd', clearClass, false);
					}
					document.getElementById('select_box').addEventListener('webkitAnimationEnd', clearClass, false);
					productDetals.addOrbug = 'add';

				})
			}, false)
		}
		//增加购买按钮的点击事件
		var bugBtn = document.getElementById('buyDirect');
		bugBtn.addEventListener('click', buy, false);

		function buy() {
			ai.isLogin(function() {

				document.getElementById('btnBuyOrAdd').innerHTML = '立即购买';
				document.getElementById('select').style.display = 'block';
				document.getElementById('select_box').className = 'select-box selectIn';

				function clearClass() {
					document.getElementById('select_box').className = 'select-box';
					document.getElementById('select_box').style.webkitTransform = 'translate3d(0, 0, 0)';
					document.getElementById('select_box').removeEventListener('webkitAnimationEnd', clearClass, false);
				}
				document.getElementById('select_box').addEventListener('webkitAnimationEnd', clearClass, false);
				productDetals.addOrbug = 'buy';

			})
		}
	}
	document.getElementsByClassName('gotoShop')[0].addEventListener('click', function() {
		if(ai.GetQueryString('storeId') == "10375879") {
			//官方店铺跳到活动页面
			location.href = '../../templates/shopDetails/shopDetails.html?storeId=10459040';
		} else {
			var channelcode = ai.GetQueryString("channelcode");
			var citycode = ai.GetQueryString("citycode");
			var activityflag = ai.GetQueryString("activityflag");
			if(activityflag == null) {
				location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + ai.GetQueryString('storeId');
			} else {
				location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + ai.GetQueryString('storeId') + "&channelcode=" + ai.GetQueryString("channelcode") + "&citycode=" + ai.GetQueryString("citycode") + "&activityflag=" + ai.GetQueryString("activityflag");
			}
		}
	})
}

/* 请求店铺信息  */
productDetals.getStoreInfo = function() {
	if(ai.GetQueryString('storeId')) {
		var storeId = ai.GetQueryString('storeId');
	} else {
		location.search = '?storeId=10375879' + '&proId=' + ai.GetQueryString('proId');;
		storeId = 10375879;
	}
	ai.post({
		url: 'StoreServer/StoreBackgroundSet/GainBackgroundInfoWithH5',
		token: false,
		data: {
			storeId: storeId,
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				document.querySelector('[url=storeLogo]').src = json.Data.StoreInfo.Logo;
				document.querySelector('[value=storeName]').innerHTML = json.Data.StoreInfo.StoreName;
			} else {
				document.querySelector('[url=storeLogo]').src = '../../img/icon/logo3x-min.png';
				document.querySelector('[value=storeName]').innerHTML = '';
			}

		}
	})
}

productDetals.addOrBuy = function() {
	if(ai.isSelSku()) {
		if(document.getElementById('select-box__colorBox').children.length == 1 && document.getElementById('select-box__unitBox').children.length == 1) {
			productDetals.proPostInfo.skuid = 0;
		}
		var stockEle = document.getElementsByClassName('select-box__stock')[0],
			bugNum = document.getElementsByClassName('select-box__NoShow')[0].value;
		var stock = parseInt(stockEle.innerText.slice(3));
		if(productDetals.isO2O && bugNum != 1) {
			ai.alert('020商品每次只能购买1个商品~');
			return;
		}
		if(bugNum <= stock) {
			if(productDetals.addOrbug == 'add') {
				ai.post({
					url: 'ProductServer/ShopCart/AddToShopCart',
					data: {
						productId: productDetals.proPostInfo.productId,
						skuid: productDetals.proPostInfo.skuid,
						storeId: ai.GetQueryString('storeId'),
						isReturnDataList: 0,
						Num: document.getElementsByClassName('select-box__NoShow')[0].value
					},
					load: function(json) {
						if(json.ResultCode == 1000) {

							ai.alert(json.Message);
							document.getElementById('select').style.display = 'none';
						} else {
							ai.alert(json.Message);
						}
					}
				})
			} else if(productDetals.addOrbug == 'buy') {
				if(productDetals.colorInfo || productDetals.colorInfo == '') {
					var sku = productDetals.colorInfo + ' ' + productDetals.unitInfo;
				} else {
					var sku = '';
				}
				var proTitleAll = document.getElementsByClassName('product-info__title')[0].innerHTML;
				var proData = {
					'id': '',
					'proid': ai.GetQueryString('proId'),
					'skuid': productDetals.proPostInfo.skuid,
					'proTitle': proTitleAll.substring((proTitleAll.indexOf('</span>') + 7)),
					'imgSrc': productDetals.proImg,
					'sku': sku,
					'price': parseFloat(document.querySelector('[value=skuPrice]').innerHTML),
					'num': parseInt(document.getElementsByClassName('select-box__NoShow')[0].value),
					'jgId': document.querySelector('[value=proName]').getAttribute('jgid'),
					'jgName': document.querySelector('[value=proName]').getAttribute('jgname'),
					'storeid': ai.GetQueryString('storeId'),
					'shareid': ai.GetQueryString('shareid') ? ai.GetQueryString('shareid') : 0,
					'activityid': ai.GetQueryString('arctiveid') ? ai.GetQueryString('arctiveid') : 0,
					'orderStyleid': ai.GetQueryString('arctiveid') ? 4 : 0,
					'isTaxGoods': document.querySelector('[value=proName]').getAttribute('isTaxGoods')
				}
				if(productDetals.isO2O) {
					proData.isO2O = true;
				}
				if(productDetals.isElCoupons) {
					proData.isElCoupons = true;
				}
				var proInfo = [];
				proInfo.push(proData);
				localStorage.proForCoupon = proData.proid + '-' + proData.price + '-' + proData.num + '-' + proData.jgId;
				localStorage.proList = JSON.stringify(proInfo);
				localStorage.pId_skuId_qty = proData.proid + '|' + proData.skuid + '|' + proData.num;
				var strForConfirmPay = localStorage.proList + '@@' + localStorage.pId_skuId_qty + '@@' + localStorage.proForCoupon;

				ai.post({
					url: '/OrderServer/Order/GainOrderInfoCache',
					data: {
						cachecontent: strForConfirmPay
					},
					load: function(json) {
						location.href = '../confirmOrder/confirmOrder.html?Key=' + json.Data;

					}
				})
			}
		} else {
			ai.alert('购买数量不能超出库存~');
		}
	}

}

//增加点击事件
productDetals.addEvtFun = function() {
		var closeBtn = document.getElementById('closeSelectBox');
		var decBtn = document.getElementsByClassName('select-box__NoDec');
		var addBtn = document.getElementsByClassName('select-box__NoAdd');
		var numberShow = document.getElementsByClassName('select-box__NoShow');

		closeBtn.addEventListener('click', function() {
			document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, 0)';
			document.getElementById('select_box').className = 'select-box selectOut';

			function clearClass() {
				document.getElementById('select_box').className = 'select-box';
				document.getElementById('select').style.display = 'none';
				document.getElementById('select').style.backgroundColor = 'rgba(0, 0, 0, .5)';
				document.getElementById('select_box').style.webkitTransform = 'translate3d(0, 100%, 0)';
				document.getElementById('select_box').removeEventListener('webkitAnimationEnd', clearClass, false);
			}
			document.getElementById('select_box').addEventListener('webkitAnimationEnd', clearClass, false);
		}, false)
		decBtn[0].addEventListener('click', function() {
			if(parseInt(numberShow[0].value) == 1) {
				ai.alert('不能再减了~');
			} else {
				numberShow[0].value--;
			}
			productDetals.proPostInfo.Num = numberShow[0].value;
		}, false)
		addBtn[0].addEventListener('click', function() {
			var stockShow = parseInt(document.getElementsByClassName('select-box__stock')[0].innerHTML.substring(3))
			if(parseInt(numberShow[0].value) >= stockShow) {
				ai.alert('购买数量不能超出库存~');
			} else {
				numberShow[0].value++;
			}
			productDetals.proPostInfo.Num = numberShow[0].value;
		}, false)
		numberShow[0].addEventListener('blur', function(event) {
			var stockShow = parseInt(document.getElementsByClassName('select-box__stock')[0].innerHTML.substring(3))
			if(parseInt(numberShow[0].value) > stockShow) {
				ai.alert('购买数量不能超出库存~');
				numberShow[0].value = stockShow;
			} else if(parseInt(numberShow[0].value) <= 0) {
				numberShow[0].value = 1;
			}
			productDetals.proPostInfo.Num = numberShow[0].value;
		}, false)
		document.getElementById('btnBuyOrAdd').addEventListener('click', productDetals.addOrBuy, false)
		document.getElementsByClassName('product-mune__item')[0].addEventListener('click', function() {
			if(ai.GetQueryString('storeId') == "10375879") {
				//官方店铺跳到活动页面
				location.href = '../../templates/shopDetails/shopDetails.html?storeId=10459040';
			} else {
				location.href = '../../templates/shopDetails/shopDetails.html?storeId=' + ai.GetQueryString('storeId');
			}
		})

		document.getElementsByClassName('product-top__gotoCartImg')[0].addEventListener('click', function() {
			ai.isLogin(function() {
				location.href = '../../templates/shoppingCart/shoppingCart.html';
			})
		})
		document.getElementsByClassName('product-top__gotoOrder')[0].addEventListener('click', function() {
			location.href = '../../templates/orderCenter/orderCenter.html';
		})

		//	var colBtn = document.getElementsByClassName('product-info__like')[0];
		//	colBtn.addEventListener('click',function(){
		//		ai.alert('点击收藏并高亮心形图标');
		//	})
		//	<div  class="product-info__like">
		//		<img class="product-info__heart" src="../../img/icon/heart-gray-min.png" url="likeLogo" />
		//		<p class="product-info__text">喜欢</p>
		//	</div>

	}
	//点击颜色时处理所有颜色和属性按钮的显示和事件
productDetals.LoadUnit = function(evt) {
		var unitItems;
		var unitOffItems;
		var obj = evt.currentTarget;
		var colorid = evt.currentTarget.dataset.id;
		if(obj.id == "") {
			//选择属性联动单位
			//如果没有单位就直接设置sku
			if(productDetals.unitData != "") {
				//先移除所有属性按钮的事件
				unitItems = document.querySelectorAll('.select-box__unitItem');
				for(var i = 0; i < unitItems.length; i++) {
					unitItems[i].removeEventListener("click", productDetals.LoadColor, false);
					unitItems[i].className = 'select-box__unitOff';
				}
				//保存所有可点击的属性按钮
				var arr = [];
				//查找当前单位对应的属性，并给属性设置事件
				for(var j = 0; j < productDetals.skuData.length; j++) {
					if(productDetals.skuData[j].Color_Id == colorid) {
						var unitid = productDetals.skuData[j].Unit_Id;
						unitOffItems = document.querySelectorAll('.select-box__unitOff');
						for(var k = 0; k < unitOffItems.length; k++) {
							if(unitOffItems[k].dataset.id == unitid) {
								unitOffItems[k].addEventListener("click", productDetals.LoadColor, false);
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
			productDetals.colorInfo = document.getElementsByClassName('select-box__colorTitle')[0].innerHTML + document.getElementById('colorSelect').innerHTML;
			if(!productDetals.unitInfo) {
				productDetals.unitInfo = '';
			}
		} else {
			//重置价格和库存
			document.querySelector('[value=skuPrice]').innerHTML = productDetals.SellPrice;
			document.querySelector('[value=skuStock]').innerHTML = "库存：" + productDetals.Stock;
			//取消选中的单位
			obj.id = "";
			if(productDetals.unitData != "") {
				//所有属性都添加事件
				unitOffItems = document.querySelectorAll('.select-box__unitOff');
				for(var i = 0; i < unitOffItems.length; i++) {
					unitOffItems[i].className = "select-box__unitItem";
				}
				unitItems = document.querySelectorAll('.select-box__unitItem');
				for(var i = 0; i < unitItems.length; i++) {
					unitItems[i].addEventListener("click", productDetals.LoadColor, false);
				}
			}
			productDetals.colorInfo = '';
		}

		//设置SKU对应的信息
		productDetals.getsku();
	}
	//点击属性时处理所有颜色和属性按钮的显示和事件
productDetals.LoadColor = function(evt) {
	var colorItems;
	var colorOffItems;
	var obj = evt.currentTarget;
	var unitid = evt.currentTarget.dataset.id;
	if(obj.id == "") {
		//选择颜色联动单位
		//如果没有单位就直接设置sku
		if(productDetals.colorData != "") {
			//先移除所有颜色按钮的事件
			colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].removeEventListener("click", productDetals.LoadUnit, false);
				colorItems[i].className = 'select-box__colorOff';
			}
			//保存所有可点击的颜色按钮
			var arr = [];
			//查找当前单位对应的颜色，并给颜色设置事件
			for(var j = 0; j < productDetals.skuData.length; j++) {
				if(productDetals.skuData[j].Unit_Id == unitid) {
					var colorid = productDetals.skuData[j].Color_Id;
					colorOffItems = document.querySelectorAll('.select-box__colorOff');
					for(var k = 0; k < colorOffItems.length; k++) {
						if(colorOffItems[k].dataset.id == colorid) {
							colorOffItems[k].addEventListener("click", productDetals.LoadUnit, false);
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
		productDetals.unitInfo = document.getElementsByClassName('select-box__unitTitle')[0].innerHTML + document.getElementById('unitSelect').innerHTML;
		if(!productDetals.colorInfo) {
			productDetals.colorInfo = '';
		}
	} else {
		//重置价格和库存
		document.querySelector('[value=skuPrice]').innerHTML = productDetals.SellPrice;
		document.querySelector('[value=skuStock]').innerHTML = "库存：" + productDetals.Stock;
		//取消选中的单位
		obj.id = "";
		if(productDetals.colorData != "") {
			//所有颜色都添加事件
			colorOffItems = document.querySelectorAll('.select-box__colorOff');
			for(var i = 0; i < colorOffItems.length; i++) {
				colorOffItems[i].className = "select-box__colorItem";
			}
			colorItems = document.querySelectorAll('.select-box__colorItem');
			for(var i = 0; i < colorItems.length; i++) {
				colorItems[i].addEventListener("click", productDetals.LoadUnit, false);
			}
		}
		productDetals.unitInfo = '';
	}

	//设置SKU对应的信息
	productDetals.getsku();
}
productDetals.getsku = function() {
	var colorItems_mark = document.querySelectorAll('#colorSelect');
	var unitItems_mark = document.querySelectorAll('#unitSelect');
	if(unitItems_mark.length == 0 && colorItems_mark.length == 0) {
		document.querySelector('[value=skuPrice]').innerHTML = productDetals.SellPrice;
		document.querySelector('[value=skuStock]').innerHTML = "库存：" + productDetals.Stock;
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
		for(var i = 0; i < productDetals.skuData.length; i++) {
			//查找SKUID
			if(colorid_fin == productDetals.skuData[i].Color_Id && unitid_fin == productDetals.skuData[i].Unit_Id) {
				document.querySelector('[value=skuPrice]').innerHTML = productDetals.skuData[i].Price;
				document.querySelector('[value=skuStock]').innerHTML = "库存：" + productDetals.skuData[i].Stock;
				productDetals.proPostInfo.skuid = productDetals.skuData[i].Id;

			}
		}
	}
}

productDetals.addViewProduct = function() {
	//浏览次数加1
	var channelcode = ai.GetQueryString("channelcode");
	var citycode = ai.GetQueryString("citycode");
	var activityflag = ai.GetQueryString("activityflag");
	var storeid = ai.GetQueryString('storeId');
	var productid = ai.GetQueryString('proId');
	var arctiveid = ai.GetQueryString('arctiveid');
	var shareid = ai.GetQueryString('shareid');
	//var activitytype = GetQueryString("activitytype");

	if(activityflag == null || activityflag == "") {
		localStorage.removeItem("activityflag");
		localStorage.removeItem("citycode");
		localStorage.removeItem("channelcode");
	} else {
		localStorage.activityflag = activityflag;
		localStorage.citycode = citycode;
		localStorage.channelcode = channelcode;
	}

	var pageurl = window.location.href;
	var url = "/tools/cmcc_ajax.ashx";
	var postData = {
		"type": "product",
		"channelcode": channelcode,
		"citycode": citycode,
		"activityflag": activityflag,
		"storeid": storeid,
		//"pageurl": pageurl,
		"arctiveid": arctiveid,
		"shareid": shareid,
		"productid": productid
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

//irame自适应高度
productDetals.setIframeH = function() {

}

productDetals.exe = function() {
	productDetals.init();
	productDetals.getStoreInfo();
	productDetals.getProInfo();
	productDetals.addEvtFun();
	productDetals.swiper();
	productDetals.addViewProduct();
	_czc.push(["_trackEvent", "商品详情页面", '店铺ID：' + ai.GetQueryString('storeId') + '；商品ID：' + ai.GetQueryString('proId')]);
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(productDetals.exe)
}): ai.ready(productDetals.exe);