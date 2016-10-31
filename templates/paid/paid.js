var paid = {};

paid.getList = function(view) {
	var alert = ai.alert('正在获取数据...');
	ai.post({
		url: 'CouponServer/CMCCFlow/GainCMCCFlowOrderList',
		data: {},
		load: function(json) {
			if(json.ResultCode == 1000) {
				if(json.Data && json.Data.length != 0) {
					ai.repeat({
						view: document.getElementById("paidbox"),
						arr: json.Data,
						fun: function(tem, obj) {
							tem.addEventListener('click', paid.gotoNext);
							tem.querySelector('[att=Type_Name]').innerText = obj.Type_Name;
							tem.querySelector('[att=Effective_End_Time]').outerHTML = obj.Effective_End_Time;
							tem.querySelector('[att=Porduct_Name]').innerText = obj.Porduct_Name;
							var tex = '';
							//置灰判断逻辑
							if(obj.Is_Flowcard == 0) {
								//置灰
								tem.classList.add('isflow');
								tex = '提示: 确认收货方可使用';
								if(obj.Type_Flag == 4) {
									tex = '提示: 待购买人确认收货即可马上获得流量';
								}
							} else if(obj.Status == 2 || obj.Status == 1) {
								//置灰
								tem.classList.add('Status');
								tex = '提示: 该券已使用';
							} else if(obj.Status == 4) {
								//置灰
								tem.classList.add('Sending');
								tex = '提示: 该券请求中';
							} else if(obj.Status == 3) {
								//置灰
								tem.classList.add('Sending');
								tex = '提示: 该券兑换或转赠失败';
							}
							tem.querySelector('[att=tex]').innerText = tex;
							this.view.style.display = 'block';
						}
					})
				} else {
					document.getElementById("ticketno").style.display = 'block';
				}
			} else {
				ai.alert(json.Message);
			}
			alert.click();
		}
	});
}

paid.gotoNext = function(evt) {
	var ele = evt.currentTarget;
	if(ele.obj.Is_Flowcard == 0) {
		if(ele.obj.Type_Flag == 4) {
			return false;
		}
		if(location.search.indexOf('origin=4') != -1) {
			location.href = '../myOrder/myOrder.html#receipt'
		} else {
			location.href = location.origin + location.pathname + '?Is_Flowcard';
		}

	} else if(ele.obj.Status == 2 || ele.obj.Status == 1) {
		ai.alert('该券已使用');
	} else if(ele.obj.Status == 4) {
		ai.alert('该券请求中');
	} else if(ele.obj.Status == 3) {
		ai.alert('该券兑换或转赠失败');
	} else {
		localStorage.lnyppaidno = ele.obj.Id;
		localStorage.lnyppaidm = ele.obj.Porduct_Name;
		localStorage.lnypstime = ele.obj.Effective_Begin_Time;
		localStorage.lnypetime = ele.obj.Effective_End_Time;
		location.href = '../trafficPack/trafficPack.html';
	}
}

paid.addBackAppEvt = function() {
	document.querySelector('.back-butII').addEventListener('click', function(evt) {
		if(location.search.indexOf('origin=4') != -1) {
			history.back();
		} else {
			location.href = location.origin + location.pathname + '?backnetflow';
		};
	})
}

paid.exe = function() {
	paid.addBackAppEvt();
	var str = location.search;
	var s = str.indexOf('token');
	var is = str.indexOf('Is_Flowcard');
	var ba = str.indexOf('backnetflow');
	var islnyp = str.indexOf('isLNYP');
	if(s == -1) {
		if(localStorage.lnyptoken == undefined) {
			localStorage.removeItem('loginjson');
			localStorage.removeItem('lnyptoken');
			ai.pubGetLogin();
		}
	}
	if(is == -1 && ba == -1 && s != -1) {
		var value;
		var arr = str.split('&');
		for(var i = 0; i < arr.length; i++) {
			var sta = arr[i].indexOf('token');
			if(sta != -1) {
				value = arr[i].substring((sta + 6));
			}
		}
		localStorage.lnyptoken = value;
	}
	if(islnyp != -1) {
		document.title = '我的礼品';
		document.getElementById("paid-tit").innerText = '我的礼品';
	}
	paid.getList();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(paid.exe)
}): ai.ready(paid.exe);