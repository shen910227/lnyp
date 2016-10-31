var couponProduct = {};


couponProduct.showPro = function() {
	ai.post({
		url: '/CouponServer/Coupon/GainCouponInfo',
		data: {
			couponId: ai.GetQueryString('couponid'),
			couponCode: ai.GetQueryString('cardno')
		},
		load: function(json) {
			ai.repeat({
				view: document.getElementsByClassName("couponProList")[0],
				arr: json.Data,
				fun: repeatFun
			})

			function repeatFun(tem, obj) {
				tem.querySelector('.couponProItem__img').src = obj.productImage;
				tem.querySelector('.couponProItem__title').innerHTML = obj.productName;
				tem.querySelector('.couponProItem__price').innerHTML = '￥' + obj.productPrice;
				tem.querySelector('.couponProItem__sales').innerHTML = '已售' + obj.sales;
				tem.style.display = 'block';
				tem.addEventListener('click', function() {
					location.href = obj.previewUrl;
				})
			}
		}
	})
}



couponProduct.exe = function() {
	couponProduct.showPro();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(couponProduct.exe)
}): ai.ready(couponProduct.exe);