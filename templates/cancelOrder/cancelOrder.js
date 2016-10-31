var cancelOrder = {};

cancelOrder.submit = function() {
	var submitBtn = document.getElementsByClassName('btnBox__btn')[0];

	submitBtn.addEventListener('click', function() {
		var reason = document.getElementsByClassName('reason__select')[0].value,
			explain = document.getElementsByClassName('reason__input')[0].value;
		if(reason != '') {
			ai.post({
				url: '/OrderServer/Refund/ApplyNewDrawBack',
				data: {
					data: JSON.stringify({
						SubOrderNo: ai.GetQueryString('orderNo'),
						DrawbackType: 1,
						Mobile: localStorage.loginjson ? JSON.parse(localStorage.loginjson).phone : 0,
						Reson: reason,
						FeeBack: explain,
						ReturnType: 0
					})
				},
				isNonce: true,
				load: function(json) {
					console.log(json);
					if(json.ResultCode == 1000) {
						ai.confirm(json.Message, '确认', function() {
							history.back();
						})
					} else {
						ai.alert(json.Message);
					}
				}
			})
		} else {
			ai.alert('请选择退款原因~');
		}
	})
}

cancelOrder.exe = function() {
	cancelOrder.submit();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(cancelOrder.exe)
}): ai.ready(cancelOrder.exe);