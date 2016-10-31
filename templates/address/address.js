var address = {};

address.delId = null;
address.delEle = null;

address.getlist = function() {
	ai.post({
		url: '/StoreServer/Store/GainBook',
		data: {},
		load: loadFun
	})

	function loadFun(json) {
		ai.repeat({
			view: document.getElementById("list"),
			arr: json.Data,
			fun: repeatFun
		})

		function repeatFun(tem, obj) {
			tem.getElementsByTagName('input')[0].checked = false;
			tem.querySelector('[att=ischeck]').checkedBl = 0;
			var addr = obj.provice + obj.deliveryArea + obj.city + obj.deliveryAddress;

			tem.querySelector('[att=name]').innerText = obj.receiveUserName;
			tem.querySelector('[att=tel]').outerHTML = obj.receiveUserTel;
			tem.querySelector('[att=addr]').outerHTML = addr;

			if(obj.isdefult) {
				tem.querySelector('[att=ischeck]').checked = true;
				tem.querySelector('[att=ischeck]').checkedBl = 1;
			}

			tem.querySelector('[goto=edit]').addEventListener('click', function(evt) {
				var obj = evt.currentTarget.parentElement.parentElement.obj;
				localStorage.setItem('editAddrID', obj.consignee_id);
				if(location.search.indexOf('changeAddr') != -1) {
					location.href = '../addressEdit/addressEdit.html?edit&changeAddr';
				} else {
					location.href = '../addressEdit/addressEdit.html?edit';
				}

			})

			tem.querySelector('[goto=del]').addEventListener('click', function(evt) {
				var obj = evt.currentTarget.parentElement.parentElement.obj;
				address.delEle = evt.currentTarget.parentElement.parentElement;
				address.delId = obj.consignee_id;
				document.getElementById("isdel").style.display = 'block';
			})
			tem.querySelector('[att=ischeck]').addEventListener('click', function(evt) {
				if(evt.currentTarget.checkedBl != 1) {
					var obj = evt.currentTarget.parentElement.parentElement.obj;
					address.defaultId = obj.consignee_id;
					ai.post({
						url: '/StoreServer/Store/SettingDefaultBook',
						data: {
							consignee_id: address.defaultId
						},
						load: function(json) {
							if(json.ResultCode != 1009) {
								ai.alert(json.Message);
							}
						}
					})
					var inputs = document.getElementsByTagName('input');
					for(var i = 0; i < inputs.length; i++) {
						inputs[i].checkedBl = 0;
					}
					evt.currentTarget.checkedBl = 1;
				}

			})
			if(location.search.indexOf('changeAddr') != -1) {
				tem.firstElementChild.addEventListener('click', function(evt) {
					localStorage.changeAddr = JSON.stringify(evt.currentTarget.parentElement.obj);
					localStorage.isChangeAddr = 1;
					history.back();
				}, false)
			}

		}
	}
}

address.deleteEvt = function() {
	document.getElementById("sure-del").addEventListener('click', function() {
		if(address.delId != null) {
			ai.post({
				url: '/StoreServer/Store/CancelBook',
				data: {
					consignee_id: address.delId
				},
				load: function(json) {
					if(json.ResultCode == 1000) {
						address.delEle.remove();
						address.delEle = null;
						address.delId = null;
						document.getElementById("isdel").style.display = 'none';
						ai.alert(json.Message);
					} else if(json.ResultCode != 1009) {
						ai.alert(json.Message);
					}
				}
			})
		}
	});

	document.getElementById("cancale-del").addEventListener('click', function() {
		document.getElementById("isdel").style.display = 'none';
	});
}
address.addEvt = function() {
	document.getElementsByClassName('addrFooter')[0].addEventListener('click', function() {
		if(location.search.indexOf('changeAddr') != -1) {
			location.href = '../addressEdit/addressEdit.html?changeAddr';
		} else {
			location.href = '../addressEdit/addressEdit.html';
		}
	}, false)
}

address.exe = function() {
	if(localStorage.editAddress == 1) {
		localStorage.removeItem('editAddress');
		location.reload();
	}
	address.getlist();
	address.deleteEvt();
	address.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(address.exe)
}): ai.ready(address.exe);