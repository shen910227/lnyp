var coupon = {};

coupon.getCoupon = function() {
	ai.isLogin(function() {
		ai.post({
			url: 'CouponServer/Coupon/GainMyCoupon',
			data: {
				phoneNum: JSON.parse(localStorage.loginjson).phone
			},
			load: function(json) {
				ai.repeat({
					view: document.getElementsByClassName("couponList")[0],
					arr: json.Data,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					if(obj.status == 2 || obj.status == 3 || obj.status == 4) {
						tem.setAttribute('cardno', obj.couponCode);
						tem.setAttribute('couponid', obj.couponId);
						var couponItem__sum = tem.getElementsByClassName('couponItem__sum')[0],
							couponItem__title = tem.getElementsByClassName('couponItem__title')[0],
							date = tem.getElementsByClassName('date')[0],
							couponItem__text = tem.getElementsByClassName('couponItem__text')[0],
							couponItem__left = tem.querySelector('#couponItem__left'),
							couponItem__right = tem.querySelector('.couponItem__right');
						if(obj.status == 1 || obj.status == 2) {
							couponItem__left.className = 'couponItem__normal';
						} else if(obj.status == 3 || obj.status == 4) {
							couponItem__left.className = 'couponItem__useless';
							var img = document.createElement('img');
							img.className = 'couponItem__img';
							if(obj.status == 3) {
								img.src = '../../img/coupon/mycoupons_1-min.png';
							} else {
								img.src = '../../img/coupon/mycoupons_2-min.png';
							}
							couponItem__right.appendChild(img);
						}

						couponItem__sum.innerHTML = obj.amount;
						couponItem__title.innerHTML = obj.couponTitle;
						date.innerHTML = obj.beginData + '-' + obj.endData;
						if(obj.limitGoodsType == 0) {
							couponItem__text.innerHTML = obj.Description;
						} else {
							if(obj.status == 2 || obj.status == 1) {
								couponItem__text.style.color = '#f02804';
								couponItem__text.addEventListener('click', function(evt) {
									var item = evt.currentTarget.parentElement.parentElement;
									if(item.obj.limitGoods && item.obj.limitGoods.length == 1) {
										location.href = '../productDetails/productDetails.html?storeId=10375879&proId=' + item.obj.limitGoods[0];
									} else if(item.obj.limitGoods && item.obj.limitGoods.length > 1) {
										cardno = item.getAttribute('cardno');
										couponid = item.getAttribute('couponid');
										location.href = 'couponProduct.html?cardno=' + cardno + '&couponid=' + couponid;
									}
								})
							} else {
								couponItem__text.style.color = '#999';
							}
							couponItem__text.innerHTML = '查看适用商品';
						}

					}
				}
			}
		})

	})

}

coupon.addEvt = function() {
	document.getElementsByClassName('couponH__backBtn')[0].addEventListener('click', function() {
		history.back();
	})
}

coupon.exe = function() {
	coupon.getCoupon();
	coupon.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(coupon.exe)
}): ai.ready(coupon.exe);