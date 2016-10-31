var drawback = {};

drawback.showPro = function() {
	drawback.drawBackPro = JSON.parse(localStorage.drawBackPro);
	var shopName = document.getElementsByClassName('proInfo__shopName')[0],
		shopPhone = document.getElementsByClassName('proInfo__TELIcon')[0],
		proImg = document.getElementsByClassName('proInfo__proImg')[0],
		proTitle = document.getElementsByClassName('proInfo__proTitle')[0],
		proSku = document.getElementsByClassName('proInfo__proSku')[0],
		proPrice = document.getElementsByClassName('proInfo__proPrice')[0],
		proNum = document.getElementsByClassName('proInfo__proNum')[0];
	shopName.innerHTML = drawback.drawBackPro.businessName;
	shopPhone.href = 'tel:' + drawback.drawBackPro.businessPhone;
	proImg.src = drawback.drawBackPro.productImage;
	proTitle.innerHTML = drawback.drawBackPro.productName;
	proSku.innerHTML = drawback.drawBackPro.specs;
	proPrice.innerHTML = '￥' + drawback.drawBackPro.productPrice;
	proNum.innerHTML = '×' + drawback.drawBackPro.quantity;
}

drawback.gainRefundInfo = function() {
	ai.post({
		url: 'OrderServer/Refund/CalcRefundMoney',
		data: {
			data: JSON.stringify({
				SubOrderNo: ai.GetQueryString('orderNo'),
				GoodsId: drawback.drawBackPro.id,
				SkuId: drawback.drawBackPro.SkuId
			})
		},
		isNonce: true,
		load: function(json) {
			if(json.ResultCode == 1000) {
				var addBtn = document.getElementsByClassName('infoItem__NumAdd')[0],
					decBtn = document.getElementsByClassName('infoItem__NumDec')[0],
					numInput = document.getElementsByClassName('infoItem__NumShow')[0],
					totalInput = document.getElementsByClassName('infoItem__loan')[0];

				if(drawback.drawBackPro.isUseElCoupons == 1) {
					numInput.value = json.Data.quantity;
					totalInput.value = (json.Data.total_price + json.Data.express_fee).toFixed(2);
					numInput.readOnly = true;
					totalInput.readOnly = true;
				} else {
					drawback.proPrice = (json.Data.real_price * 100 * parseInt(numInput.value)) / 100;
					drawback.realPrice = drawback.proPrice > json.Data.total_price ? json.Data.total_price : drawback.proPrice;
					totalInput.value = (drawback.realPrice > 0 ? (drawback.realPrice * 100 + json.Data.express_fee * 100) / 100 : json.Data.express_fee).toFixed(2);
					drawback.maxTotal = Number(totalInput.value);
					addBtn.addEventListener('click', function() {
						if(parseInt(numInput.value) >= json.Data.quantity) {
							numInput.value = json.Data.quantity;
							ai.alert('退款数量不能超过' + json.Data.quantity);
						} else {
							numInput.value++;
							if(numInput.value == json.Data.quantity) {
								totalInput.value = ((json.Data.total_price * 100 + json.Data.express_fee * 100) / 100).toFixed(2);
								drawback.maxTotal = Number(totalInput.value);
							} else {
								drawback.proPrice = (json.Data.real_price * 100 * parseInt(numInput.value)) / 100;
								drawback.realPrice = drawback.proPrice > json.Data.total_price ? json.Data.total_price : drawback.proPrice;
								totalInput.value = (drawback.realPrice > 0 ? (drawback.realPrice * 100 + json.Data.express_fee * 100) / 100 : json.Data.express_fee).toFixed(2);
								drawback.maxTotal = Number(totalInput.value);
							}
						}
					})
					decBtn.addEventListener('click', function() {
						if(parseInt(numInput.value) <= 1) {
							ai.alert('退款数量不能小于1');
						} else {
							numInput.value--;
							drawback.proPrice = (json.Data.real_price * 100 * parseInt(numInput.value)) / 100;
							drawback.realPrice = drawback.proPrice > json.Data.total_price ? json.Data.total_price : drawback.proPrice;
							totalInput.value = (drawback.realPrice > 0 ? (drawback.realPrice * 100 + json.Data.express_fee * 100) / 100 : json.Data.express_fee).toFixed(2);
							drawback.maxTotal = Number(totalInput.value);
						}
					})
					numInput.addEventListener('blur', function() {
						if(parseInt(numInput.value) > json.Data.quantity) {
							numInput.value = json.Data.quantity;
							ai.alert('退款数量不能超过' + json.Data.quantity);
						} else if(parseInt(numInput.value) <= 0) {
							parseInt(numInput.value) = 1;
							ai.alert('退款数量不能小于1');
						}
						if(numInput.value == json.Data.quantity) {
							totalInput.value = ((json.Data.total_price * 100 + json.Data.express_fee * 100) / 100).toFixed(2);
							drawback.maxTotal = Number(totalInput.value);
						} else {
							drawback.proPrice = (json.Data.real_price * 100 * parseInt(numInput.value)) / 100;
							drawback.realPrice = drawback.proPrice > json.Data.total_price ? json.Data.total_price : drawback.proPrice;
							totalInput.value = (drawback.realPrice > 0 ? (drawback.realPrice * 100 + json.Data.express_fee * 100) / 100 : json.Data.express_fee).toFixed(2);
							drawback.maxTotal = Number(totalInput.value);
						}
					})
					totalInput.addEventListener('blur', function() {
						if(parseFloat(totalInput.value) >= drawback.maxTotal) {
							totalInput.value = drawback.maxTotal;
							ai.alert('退款金额不能超过' + drawback.maxTotal);
						}
					})
				}
			}
		}
	})
}

drawback.addEvt = function() {
	var fileBtn = document.getElementsByClassName('formBox__File')[0],
		select = document.getElementsByClassName('servicetype__sel')[0],

		submitBtn = document.getElementsByClassName('formBox__submit')[0];
	fileBtn.addEventListener('change', function(evt) {
		document.getElementsByClassName('loadingBg__text')[0].innerHTML = '图片上传中...';
		document.getElementsByClassName('loadingBg')[0].style.display = 'block';
		var picLength = document.getElementsByClassName('formBox__PicBox').length + this.files.length;
		if(picLength > 3) {
			addPicNum = 3 - document.getElementsByClassName('formBox__PicBox').length;
			ai.alert('最多只能上传3张图片');
		} else {
			addPicNum = this.files.length;
		}

		drawback.picShowLength = document.getElementsByClassName('formBox__PicBox').length;
		drawback.uploadFile(this.files, 0, drawback.picShowLength);
	})
	submitBtn.addEventListener('click', function() {
		var select = document.getElementsByClassName('servicetype__sel')[0],
			numInput = document.getElementsByClassName('infoItem__NumShow')[0],
			totalInput = document.getElementsByClassName('infoItem__loan')[0],
			reason = document.getElementsByClassName('reason__select')[0];
		var reg = /^\d+(\.\d{0,2})?$/;
		if(select.value == '') {
			ai.alert('请选择售后服务类型~');
		} else if(numInput.value == '') {
			ai.alert('请输入退款数量~');
		} else if(totalInput.value == '') {
			ai.alert('请输入退款金额~');
		} else if(!reg.test(totalInput.value)) {
			ai.alert('请输入正确的退款金额~</br>小数点后最多保留两位');
		} else if(reason.value == '') {
			ai.alert('请选择申请理由~');
		} else {
			document.getElementsByClassName('loadingBg__text')[0].innerHTML = '提交中...';
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			var drawBackPro = JSON.parse(localStorage.drawBackPro);
			var picList = document.getElementsByClassName('formBox__PicMain');
			var picListStr = '';
			if(picList.length > 0) {
				for(var i = 0; i < (picList.length - 1); i++) {
					picListStr += picList[i].src + ',';
				}
				picListStr += picList[picList.length - 1].src
			}
			ai.post({
				url: 'OrderServer/Refund/ApplyNewDrawBack',
				data: {
					data: JSON.stringify({
						SubOrderNo: ai.GetQueryString('orderNo'),
						GoodsId: drawBackPro.id,
						SkuId: drawBackPro.SkuId,
						BackCount: numInput.value,
						DrawbackMoney: totalInput.value,
						DrawbackType: select.value,
						Mobile: JSON.parse(localStorage.loginjson).phone,
						Reson: reason.value,
						FeeBack: document.getElementsByClassName('reason__input')[0].value,
						AttachmentUrl: picListStr,
						ReturnType: 2
					})
				},
				isNonce: true,
				load: function(json) {
					if(json.ResultCode == 1000) {
						localStorage.removeItem('drawBackPro');
						document.getElementsByClassName('loadingBg')[0].style.display = 'none';
						ai.confirm(json.Message, '确认', function() {
							history.back();
						})
					} else {
						ai.alert(json.Message);
						document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					}
				}
			})
		}
	})
}

//上传图片到服务器获取图片路径，并显示在页面中
drawback.uploadFile = function(files, idx, nowPicNum) {
	var file = files[idx];
	if(file && idx < (3 - nowPicNum)) {
		if(file.type.indexOf('image') != -1) {
			var oData = new FormData();
			oData.append("filedata", files[idx]);
			var oReq = new XMLHttpRequest();
			oReq.open("POST", ai.uploadFileUrl + "common/VPFileUpload.ashx?action=UpLoadImage&appid=10000058&from=client", true);
			oReq.onload = function(oEvent) {
				if(oReq.status == 200) {
					var onePic = JSON.parse(oReq.response);
					var picBox = document.getElementsByClassName('formBox__PicListBox')[0];
					var odiv = document.createElement('div');
					odiv.className = 'formBox__PicBox';
					var oImg = document.createElement('img');
					oImg.src = onePic.aliRoot + onePic.path;
					oImg.className = 'formBox__PicMain';
					odiv.appendChild(oImg);
					picBox.appendChild(odiv);
					if(document.getElementsByClassName('formBox__PicBox').length >= 3) {
						document.getElementsByClassName('formBox__FileBox')[0].style.display = 'none';
					}
					drawback.uploadFile(files, idx + 1, drawback.picShowLength);

				} else {
					drawback.uploadFile(files, idx + 1, drawback.picShowLength);
				}
			};
			oReq.send(oData);
		} else {
			ai.alert('亲，请上传图片类型');
			drawback.uploadFile(files, idx + 1, drawback.picShowLength);
		}
	} else {
		document.getElementsByClassName('loadingBg')[0].style.display = 'none';
	}
}

drawback.exe = function() {
	drawback.showPro();
	drawback.gainRefundInfo();
	drawback.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(drawback.exe)
}): ai.ready(drawback.exe);