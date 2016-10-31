var backLogistical = {};

//显示退款信息
backLogistical.showInfo = function() {
	ai.post({
		url: 'OrderServer/Refund/CustomerGetDrawBackInfo',
		data: {
			DrawBackId: ai.GetQueryString('drawbackId')
		},
		isNonce: true,
		load: function(json) {
			if(json.ResultCode == 1000) {
				var total = document.getElementsByClassName('status__total')[0],
					time = document.getElementsByClassName('status__backTime')[0],
					backAddr = document.getElementsByClassName('backAddr__txt')[0];
				total.innerHTML = '￥' + json.Data.total_money;
				time.innerHTML = ai.changeTime(json.Data.addtime);
				if(json.Data.org_address == '' || !json.Data.org_address) {
					json.Data.org_address = '商家未提供退货地址，建议拨打商家客服电话索要。';
				}
				backAddr.innerHTML = json.Data.org_address;

				backLogistical.pushJson = {
					DrawBackId: json.Data.Id,
					SubOrderNo: json.Data.sub_order_no,
					GoodsId: json.Data.goods_id,
					State: json.Data.drawback_state,
					ExtType: 0
				}
			} else {
				ai.alert(json.Message);
			}
		}
	})
}

//获取快递公司
backLogistical.gainLogistics = function() {
	ai.post({
		url: 'OrderServer/Refund/CustomerGetExpressList',
		data: {},
		isNonce: true,
		load: function(json) {
			if(json.ResultCode == 1000) {
				var select = document.getElementsByClassName('logistical__select')[0];
				ai.repeat({
					view: select,
					arr: json.Data,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					tem.innerHTML = obj.title;
					3
					tem.setAttribute('code', obj.express_code);
				}
			} else {
				ai.alert(json.Message);
			}

		}
	})
}

backLogistical.addEvt = function() {
	var btn = document.getElementsByClassName('btnBox__btn')[0];
	btn.addEventListener('click', function(evt) {
		var select = document.getElementsByClassName('logistical__select')[0],
			input = document.getElementsByClassName('logistical__input')[0];
		if(select.value == '') {
			ai.alert('请选择快递公司~');
		} else if(input.value == '') {
			ai.alert('请输入物流单号~');
		} else {
			backLogistical.pushJson.ExpressCode = select.options[select.selectedIndex].getAttribute('code');
			backLogistical.pushJson.ExpressTitle = select.value;
			backLogistical.pushJson.ExpressNo = input.value;
			ai.post({
				url: 'OrderServer/Refund/SubmitDrawBackExpress',
				data: backLogistical.pushJson,
				isNonce: true,
				load: function(json) {
					ai.confirm('提交成功', '确认', function() {
						location.replace('../drawbackDetail/drawbackDetail.html?drawbackId=' + backLogistical.pushJson.DrawBackId)
					})
				}
			})
		}

	})
}

backLogistical.exe = function() {
	backLogistical.showInfo();
	backLogistical.gainLogistics();
	backLogistical.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(backLogistical.exe)
}): ai.ready(backLogistical.exe);