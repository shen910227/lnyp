var refund = {};

//设置商品单号，不可人为修改
refund.init = function(){
	var form = document.getElementsByClassName('formBox__main')[0];
	var orderno = form.querySelector('[name=orderno]');
	orderno.value = localStorage.drawbackNo;
}

//上传图片后判断数量和执行方法refund.uploadFile
refund.getPic = function() {
	var fileBtn = document.getElementsByClassName('formBox__File')[0];
	fileBtn.addEventListener('change',function(evt){
		document.getElementsByClassName('loadingBg')[0].style.display = 'block';
		var picLength = document.getElementsByClassName('formBox__PicBox').length + this.files.length;
		if(picLength >3){
			addPicNum = 3 - document.getElementsByClassName('formBox__PicBox').length;
			ai.alert('最多只能上传3张图片');
		}else{
			addPicNum = this.files.length;
		}
		
		refund.picShowLength = document.getElementsByClassName('formBox__PicBox').length;
		refund.uploadFile(this.files,0,refund.picShowLength);
	
	})
}

//上传图片到服务器获取图片路径，并显示在页面中
refund.uploadFile = function(files, idx, nowPicNum) {
	var file = files[idx];
	if (file  && idx < (3-nowPicNum) ) {
		if(file.type.indexOf('image')!=-1){
	        var oData = new FormData();
	        oData.append("filedata", files[idx]);
	        var oReq = new XMLHttpRequest();
	        oReq.open("POST", ai.uploadFileUrl + "common/VPFileUpload.ashx?action=UpLoadImage&appid=10000058&from=client", true);
	        oReq.onload = function (oEvent) {
	            if (oReq.status == 200) {
	                var onePic = JSON.parse(oReq.response);
	                var picBox = document.getElementsByClassName('formBox__PicListBox')[0];
					var odiv = document.createElement('div');
					odiv.className = 'formBox__PicBox';
					var oImg = document.createElement('img');
					oImg.src = ai.uploadFileUrl + onePic.path;
					oImg.className = 'formBox__PicMain';
					odiv.appendChild(oImg);
					picBox.appendChild(odiv);
					if(document.getElementsByClassName('formBox__PicBox').length>=3){
						document.getElementsByClassName('formBox__FileBox')[0].style.display = 'none';
					}
	            	refund.uploadFile(files, idx + 1,refund.picShowLength);
	                
	            } else {
	            	refund.uploadFile(files, idx + 1,refund.picShowLength);
	            }
	        };
	        oReq.send(oData);
	    }else {
	    	ai.alert('亲，请上传图片类型');
			refund.uploadFile(files, idx + 1,refund.picShowLength);
		}
	} else{
    	document.getElementsByClassName('loadingBg')[0].style.display = 'none';
    }	
}


refund.addEvt = function(){
	//提交退款申请：表单必填验证，接口请求
	document.getElementsByClassName('formBox__submit')[0].addEventListener('click',function(){
		var form = document.getElementsByClassName('formBox__main')[0];
		var drawback_reason = form.querySelector('[name=drawback_reason]');
		var mobile = form.querySelector('[name=mobile]');
		var bankno = form.querySelector('[name=bankno]');
		var bankname = form.querySelector('[name=bankname]');
		var bank_branch = form.querySelector('[name=bank_branch]');
		var username = form.querySelector('[name=username]');
		var orderno = form.querySelector('[name=orderno]');
		var picListStr = '';
		if(drawback_reason.value == ''){
			ai.alert('请选择退款原因');
		}else if(!(/^1[3|4|5|7|8]\d{9}$/.test(mobile.value))){
			ai.alert('请输入正确的手机号码');
		}else if(bankno.value == ''){
			ai.alert('请输入银行卡号');
		}else if(bankname.value == ''){
			ai.alert('请选择银行卡信息');
		}else if(bank_branch.value == ''){
			ai.alert('请输入支行信息');
		}else if(username.value == ''){
			ai.alert('请输入姓名');
		}else if(orderno.value == ''){
			ai.alert('请输入商品单号');
		}else {
			document.getElementsByClassName('loadingBg')[0].style.display = 'block';
			var picList = document.getElementsByClassName('formBox__PicMain');
			if(picList.length > 0){
				for(var i=0;i<(picList.length-1);i++){
					picListStr += picList[i].src + '|';	
				}
				picListStr += picList[picList.length-1].src
			}
			var drawbackData = {
				'drawback_reason' : drawback_reason.value,
				'mobile' : mobile.value,
				'bankaccount' : bankno.value,
				'bankname' : bankname.value,
				'bank_branch' : bank_branch.value,
				'username' : username.value,
				'orderno' : orderno.value,
				'goodsPic':picListStr,
				'province' : 0,
				'city' : 0,
				'area' : 0,
				'expressno' : 0
			}
			
			ai.post({
				url : 'OrderServer/OrderFlow/ApplyDrawback',
				data : {
					data:JSON.stringify(drawbackData)
				},
				load : function(json){
					document.getElementsByClassName('loadingBg')[0].style.display = 'none';
					document.getElementsByClassName('tips__main')[0].innerHTML = json.Message;
					if(json.ResultCode == 1000){
						document.getElementsByClassName('tips__yes')[0].addEventListener('click',function(){
							history.back();
						})
					}else {
						function none(){
							document.getElementsByClassName('tips')[0].style.display = 'none';
							document.getElementsByClassName('tips__yes')[0].removeEventListener('click',none,false);
						}
						document.getElementsByClassName('tips__yes')[0].addEventListener('click',none,false);
					}
					document.getElementsByClassName('tips')[0].style.display = 'block'
				}
			})
		}
	})
	
}

refund.exe = function() {
	refund.init();
	refund.getPic();
	refund.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(refund.exe)
}): ai.ready(refund.exe);