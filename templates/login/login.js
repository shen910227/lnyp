var login = {};

login.addLogin = function() {
	document.querySelector('.fo').onsubmit = function() {
		var phonenumber = document.querySelector('.acc').value;
		var password = document.querySelector('.pas').value;
		if(phonenumber.length == 0) {
			ai.alert('账号不能为空');
		} else if(password.length == 0) {
			ai.alert('密码不能为空');
		} else {
			ai.alert('正在登录请稍等');
			login.login(phonenumber, password);
		}
		return false;
	}
}

login.login = function(username, password) {

	ai.post({
		url: 'StoreServer/Store/VerifyAccount',
		data: {
			username: username,
			password: password,
		},
		load: function(json) {
			if(json.ResultCode == 1000) {
				localStorage.loginjson = JSON.stringify({
					storeLogo: json.Data.storeLogo,
					storeName: json.Data.storeName,
					phone: username,
					storeId: json.Data.id,
					UserId: json.Data.storeMasterId,
					nickName: json.Data.nickName
				});
				localStorage.lnyptoken = json.Data.token;
				location.href = '../paid/paid.html?token=' + localStorage.lnyptoken;
			} else {
				ai.alert(json.Message);
			}
		}
	})
}

login.exe = function() {
	login.addLogin();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(login.exe)
}): ai.ready(login.exe);