var logistical = {};

logistical.show = function() {
	ai.post({
		url: 'OrderServer/OrderFlow/ExpressQuery',
		data: {
			orderNo: ai.GetQueryString('orderNo')
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				ai.repeat({
					view: document.getElementsByClassName('mainBox')[0],
					arr: json.Data,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					var img = tem.getElementsByClassName('logisticalTop__img')[0],
						proNum = tem.querySelector('[att=proNum]'),
						orderNo = tem.querySelector('[att=orderNo]'),
						company = tem.querySelector('[att=company]'),
						logisticalNo = tem.querySelector('[att=logisticalNo]'),
						logisticalList = tem.getElementsByClassName('logisticalList')[0];
					img.src = obj.experss_productList[0].img_url;
					proNum.innerHTML = obj.goods_count;
					orderNo.innerHTML = obj.order_no;
					company.innerHTML = obj.express_title;
					logisticalNo.innerHTML = obj.express_no;
					if(obj.experss_status == null || obj.experss_status.length == 0) {
						tem.getElementsByClassName('logisticalList')[0].id = 'noneText';
						tem.getElementsByClassName('logisticalList')[0].innerHTML = '：( 该单号暂无物流进展，请稍后再试。';
					} else {
						ai.repeat({
							view: logisticalList,
							arr: obj.experss_status,
							fun: repeatFunItem
						})

						function repeatFunItem(tem, obj) {
							var text = tem.getElementsByClassName('logisticalList__txt')[0],
								time = tem.getElementsByClassName('logisticalList__time')[0];
							text.innerHTML = obj.context;
							time.innerHTML = obj.ftime;
						}
					}

				}
			} else {
				ai.alert(json.Message);
			}

		}
	})
}

logistical.exe = function() {
	if(location.href.indexOf('client') == -1) {
		document.body.style.paddingTop = '40px';
		document.getElementsByClassName('headerPub')[0].style.display = 'block';
	}
	logistical.show();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(logistical.exe)
}): ai.ready(logistical.exe);