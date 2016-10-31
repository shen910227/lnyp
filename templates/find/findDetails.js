var findDetails = {};

findDetails.showInfo = function() {
	ai.post({
		url: 'ProductServer/Artivities/GainDiscoveryInfo',
		data: {
			Id: ai.GetQueryString('FindId')
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				var mainTitle = document.getElementsByClassName('mainTitle')[0],
					creatTime = document.getElementsByClassName('creatTime')[0],
					ListBox = document.getElementsByClassName('mainContent')[0],
					item = document.getElementsByClassName('mainContent__item')[0];
				mainTitle.innerHTML = json.Data.discoveryname;
				creatTime.innerHTML = json.Data.createtime.substring(0, 10);
				ai.repeat({
					view: ListBox,
					arr: json.Data.hk_discovery_detailed,
					fun: repeatFun
				})

				function repeatFun(tem, obj) {
					if(obj.contents && obj.contents != '') {
						tem.querySelector('.mainContent__txt').innerHTML = obj.contents;
					} else {
						tem.querySelector('.mainContent__txt').remove();
					}
					if(obj.photourl && obj.photourl != '') {
						tem.querySelector('.mainContent__img').src = obj.photourl;
					} else {
						tem.querySelector('.mainContent__imgBox').remove();
					}
					if(obj.video_url && obj.video_url != '') {
						tem.querySelector('.mainContent__video').style.marginBottom = '10px';
						tem.querySelector('.mainContent__video').innerHTML = "<iframe class='videoPre' width='100%' src='" + obj.video_url + "' ></iframe>"
					}
					if(obj.live_video_url && obj.live_video_url != '') {
						tem.querySelector('.mainContent__videoLive').style.marginBottom = '10px';
						tem.querySelector('.mainContent__videoLive').innerHTML = '<img class="pause" src="http://lnyph5.vpclub.cn/lnyp/img/live/icon_Pause.png" /><img class="play" src="http://lnyph5.vpclub.cn/lnyp/img/live/icon_play.png" /><img class="zhibo" src="http://lnyph5.vpclub.cn/lnyp/img/live/icon_zhibo.png" /><video preload="none" class="videoLive" webkit-playsinline poster="http://lnyph5.vpclub.cn/lnyp/img/live/bg-live.png"><source src="' + obj.live_video_url + '" type="application/vnd.apple.mpegurl" /><p class="warning">当前浏览器不支持播放直播视频</p></video>';
						ai.videoLiveEvt(tem.querySelector('.mainContent__videoLive'));
					}
					if(obj.types == 2 && obj.hk_activities_info != null && location.href.indexOf('client') == -1) {
						tem.querySelector('.gotoNext').innerHTML = '点击查看';
						tem.querySelector('.gotoNext').style.display = 'block';
						var _activityId = obj.hk_activities_info.id;
						tem.querySelector('.mainContent__imgBox').addEventListener('click', function() {
							if(location.href.indexOf('activityId') == -1) {
								if(location.href.indexOf('?') != -1) {
									location.href = location.href + '&activityId=' + obj.hk_activities_info.id;
								} else {
									location.href = location.href + '?activityId=' + obj.hk_activities_info.id;
								}
							} else {
								var re = /activityId=(\d+)/,
									newUrl = location.href.replace(re, 'activityId=' + _activityId);
								location.href = newUrl;
							}
						})
					} else if(obj.types == 3 && obj.article != null) {
						tem.querySelector('.gotoNext').innerHTML = '￥' + obj.article._sell_price.toFixed(2);
						tem.querySelector('.gotoNext').style.display = 'block';
						var channelcode = ai.GetQueryString('channelcode');
						var citycode = ai.GetQueryString('citycode');
						var activityflag = ai.GetQueryString("activityflag");
						if(activityflag == null || activityflag == "") {
							tem.querySelector('.mainContent__imgBox').addEventListener('click', function() {
								location.href = '../../templates/productDetails/productDetails.html?storeId=10375879&proId=' + obj.article._id;
							})
						} else {
							tem.querySelector('.mainContent__imgBox').addEventListener('click', function() {
								location.href = '../../templates/productDetails/productDetails.html?storeId=10375879&proId=' + obj.article._id + '&channelcode=' + channelcode + '&citycode=' + citycode + '&activityflag=' + activityflag;
							})
						}
					}
				}
				var iframes = document.getElementsByClassName('videoPre');
				for(var i = 0; i < iframes.length; i++) {
					ai.iframeInitH(iframes[i]);
				}
			} else {
				ai.alert(json.Message);
			}
		}
	})
}

findDetails.addEvt = function() {
	var backBtn = document.getElementsByClassName('headerPub__back')[0],
		shareBtn = document.getElementsByClassName('headerPub__img')[0];
	backBtn.addEventListener('click', function() {
		//客户端分享出来链接增加‘client’
		if(location.href.indexOf('client') == -1) {
			if(location.href.indexOf('backnetflow') == -1) {
				if(location.href.indexOf('?') == -1) {
					location.href = location.href + '?backnetflow';
				} else {
					location.href = location.href + '&backnetflow';
				}
			} else {
				location.href = location.href;
			}
		} else {
			history.back();
		}
	})
	if(shareBtn) {
		shareBtn.addEventListener('click', function() {
			if(location.href.indexOf('shareToBrowser') == -1) {
				if(location.href.indexOf('?') == -1) {
					location.href = location.href + '?shareToBrowser';
				} else {
					location.href = location.href + '&shareToBrowser';
				}
			} else {
				location.href = location.href;
			}
		})
	}

}

findDetails.exe = function() {
	if(location.href.indexOf('client') != -1) {
		document.getElementsByClassName('headerPub__img')[0].remove();
	}
	findDetails.addEvt();
	findDetails.showInfo();
	ai.post({
		url: 'ProductServer/Artivities/AddDiscoveryVisits',
		data: {
			id: ai.GetQueryString('FindId')
		},
		load: function(json) {}
	})
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(findDetails.exe)
}): ai.ready(findDetails.exe);