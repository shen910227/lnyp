var drawbackDetail = {};

drawbackDetail.showInfo = function() {
	ai.post({
		url: '/OrderServer/Refund/CustomerGetDrawBackInfo',
		data: {
			DrawBackId: ai.GetQueryString('drawbackId')
		},
		isNonce: true,
		load: function(json) {
			if(json.ResultCode == 1000) {
				var status = document.getElementsByClassName('status__title')[0],
					total = document.getElementsByClassName('status__total')[0],
					time = document.getElementsByClassName('status__backTime')[0],
					type = document.getElementById('type'),
					reason = document.getElementById('reason'),
					explain = document.getElementById('explain'),
					orderNo = document.getElementById('orderNo'),
					dealNo = document.getElementById('dealNo'),
					drawbackNo = document.getElementById('drawbackNo');
				status.innerHTML = json.Data.status;
				total.innerHTML = '￥' + json.Data.total_money;
				if(json.Data.drawback_state == 12) {
					var timeType = document.getElementsByClassName('status__timeType')[0];
					timeType.innerHTML = '退款时间：';
					time.innerHTML = ai.changeTime(json.Data.FeedBackList[0].add_time);

					var div = document.createElement('div');
					div.className = 'infoDetail__item';
					div.innerHTML = '<p class="infoDetail__title">申请时间:</p><p class="infoDetail__main" id="startTime">' + ai.changeTime(json.Data.addtime) + '</p>';
					document.getElementsByClassName('infoDetail')[0].appendChild(div);
				} else {
					var timeType = document.getElementsByClassName('status__timeType')[0];
					timeType.innerHTML = '申请时间：';
					time.innerHTML = ai.changeTime(json.Data.addtime);
				}

				if(json.Data.express_title != '' && json.Data.express_no != '') {
					var expressBox = document.getElementsByClassName('logistical')[0],
						expressMain = expressBox.getElementsByClassName('logistical__main')[0];
					expressMain.innerHTML = json.Data.express_title + '-' + json.Data.express_no;
					expressBox.style.display = 'block';
				}

				if(json.Data.drawback_type == 0) {
					type.innerHTML = '退货退款';
				} else if(json.Data.drawback_type == 1) {
					type.innerHTML = '仅退款';
				}
				reason.innerHTML = json.Data.reson;
				if(json.Data.FeedBackList.length == 0 || json.Data.FeedBackList[json.Data.FeedBackList.length - 1].feedback == '') {
					explain.style.color = '#aaa';
					explain.innerHTML = '您没有留言';
				} else {
					explain.innerHTML = json.Data.FeedBackList[json.Data.FeedBackList.length - 1].feedback;
				}

				orderNo.innerHTML = json.Data.order_no;
				dealNo.innerHTML = json.Data.sub_order_no;
				drawbackNo.innerHTML = json.Data.drawback_no;
			} else {
				ai.alert(json.Message);
			}
		}
	})
}

drawbackDetail.exe = function() {
	drawbackDetail.showInfo();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(drawbackDetail.exe)
}): ai.ready(drawbackDetail.exe);