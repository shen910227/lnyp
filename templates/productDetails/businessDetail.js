

var businessDetail = {};

businessDetail.getBusinessInfo = function() {
	ai.post({
		url:'ProductServer/Product/GainJiGouInfo',
		data:{
			jgid:ai.GetQueryString('jgid')
		},
		load:function(json){
			if(json.ResultCode == 1000){
				document.querySelector('[url=BrandBannerPic]').src = json.Data.BrandBannerPic;
				document.querySelector('[value=DisplayName]').innerHTML = json.Data.DisplayName;
				document.querySelector('[value=Address]').innerHTML = json.Data.Address;
				document.querySelector('[value=create_time]').innerHTML = json.Data.create_time;
				document.querySelector('[value=Phone]').innerHTML = json.Data.Phone;
			}
			
		}
	})
	
}

businessDetail.exe = function() {
	businessDetail.getBusinessInfo();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(businessDetail.exe)
}): ai.ready(businessDetail.exe);