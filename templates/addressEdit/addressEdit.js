 var addressedit = {};

 addressedit.consigneeId = null;

 addressedit.addevt = function() {
 	document.getElementById("but").addEventListener('click', function(evt) {

 		var form = document.getElementById("form");

 		var data = {
 			receiveUserName: form.elements.receiveUserName.value,
 			receiveUserTel: form.elements.receiveUserTel.value,
 			provice: form.elements.provicecode.dataset.provinceName,
 			provicecode: form.elements.provicecode.value,
 			city: form.elements.citycode.dataset.cityName,
 			citycode: form.elements.citycode.value,
 			deliveryArea: form.elements.deliveryAreacode.dataset.districtName,
 			deliveryAreacode: form.elements.deliveryAreacode.value,
 			deliveryAddress: form.elements.deliveryAddress.value,
 			isdefult: form.elements.isdefult.checked ? 1 : 0,
 		}

 		if(addressedit.consigneeId != null) {
 			data.consignee_id = addressedit.consigneeId;
 		}

 		if(/\D/.test(data.receiveUserTel) || !/^\d{11}$/.test(data.receiveUserTel)) {
 			ai.alert('电话号码格式不对');
 		} else if(data.receiveUserName.length == 0) {
 			ai.alert('收货人姓名不能为空');
 		} else if(data.provicecode.length == 0 || data.citycode.length == 0 || data.deliveryAreacode.length == 0) {
 			ai.alert('请选择地区');
 		} else {

 			ai.alert('正在添加地址...')

 			ai.post({
 				url: 'StoreServer/Store/EditBook',
 				data: data,
 				load: function(json) {
 					if(json.ResultCode == 1000) {
 						ai.confirm(json.Message, '确认', function() {
 							localStorage.editAddress = 1;
 							history.back();
 						})
 					} else if(json.ResultCode != 1009) {
 						ai.alert(json.Message)
 					}
 				}
 			})

 		}

 	})
 }

 addressedit.isEdit = function() {

 	var judg = location.search.indexOf('edit');

 	if(judg != -1) {

 		ai.post({
 			url: 'StoreServer/Store/GainSingleBook',
 			data: {
 				consignee_id: localStorage.editAddrID
 			},
 			load: function(json) {
 				if(json.ResultCode == 1000) {
 					addressedit.consigneeId = json.Data.consignee_id;

 					document.querySelector('[name=receiveUserName]').value = json.Data.receiveUserName;
 					document.querySelector('[name=receiveUserTel]').value = json.Data.receiveUserTel;

 					var pro = document.getElementById("contact_province_code");
 					pro.value = json.Data.provicecode;
 					pro.dataset.provinceName = json.Data.provice;

 					var cit = document.getElementById("contact_city_code");
 					cit.value = json.Data.citycode;
 					cit.dataset.cityName = json.Data.city;

 					var dis = document.getElementById("contact_district_code")
 					dis.value = json.Data.deliveryAreacode;
 					dis.dataset.districtName = json.Data.deliveryArea;

 					var show = json.Data.provice + ' ' + json.Data.city + ' ' + json.Data.deliveryArea;
 					document.getElementById("show_contact").innerText = show;

 					document.querySelector('[name=deliveryAddress]').value = json.Data.deliveryAddress;

 					if(json.Data.isdefult) {
 						document.querySelector('[name=isdefult]').checked = true;
 					}
 				} else if(json.ResultCode != 1009) {
 					ai.alert(json.Message);
 				}
 			}
 		})

 	}
 }

 addressedit.exe = function() {
 	addressedit.addevt();
 	addressedit.isEdit();
 }

 typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
 	ai.ready(addressedit.exe)
 }): ai.ready(addressedit.exe);