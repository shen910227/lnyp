var refund = {};

refund.getPic = function() {
	var fileBtn = document.getElementsByClassName('formBox__File')[0];
	fileBtn.addEventListener('change',function(evt){
		var picLength = document.getElementsByClassName('formBox__PicBox').length + this.files.length;
		if(picLength >3){
			addPicNum = 3 - document.getElementsByClassName('formBox__PicBox').length;
			ai.alert('最多只能上传3张图片');
		}else{
			addPicNum = this.files.length;
		}
		for(var i=0;i<addPicNum;i++){
			if(this.files[i].type.indexOf('image')!=-1){
				var fd = new FileReader();
				fd.readAsDataURL( this.files[i] );
				fd.onload = function(){
					var picBox = document.getElementsByClassName('formBox__PicListBox')[0];
					var odiv = document.createElement('div');
					odiv.className = 'formBox__PicBox';
					var oImg = document.createElement('img');
					oImg.src = this.result;
					oImg.className = 'formBox__PicMain';
					odiv.appendChild(oImg);
					var oImg = document.createElement('img');
					oImg.src = "../../img/icon/icon_delete@3x.png";
					oImg.className = 'formBox__PicDel';
					oImg.addEventListener('click',function(evt){
						evt.currentTarget.parentElement.remove();
						document.getElementsByClassName('formBox__FileBox')[0].style.display = 'block';
					})
					odiv.appendChild(oImg);
					picBox.appendChild(odiv);
					if(document.getElementsByClassName('formBox__PicBox').length>=3){
						document.getElementsByClassName('formBox__FileBox')[0].style.display = 'none';
					}
				};
			}
			else{
				ai.alert('亲，请上传图片类型');
			}
		}
	})
}

refund.selRefundType = function(){
	var RefundType = document.getElementById('RefundType').getElementsByTagName('select')[0];
	RefundType.addEventListener('change',function(evt){
		var changeReason = document.getElementById('changeReason');
		var logisticStatus = document.getElementById('logisticStatus');
		var amount = document.getElementById('amount');
		var refundReason = document.getElementById('refundReason');
		var note = document.getElementById('note');
		if(this.value == '退货退款' || this.value == '仅退款' ){
			changeReason.style.display = 'none';
			logisticStatus.style.display = 'block';
			amount.style.display = 'block';
			refundReason.style.display = 'block';
			note.style.display = 'block';
		}else if(this.value == '换货'){
			changeReason.style.display = 'block';
			logisticStatus.style.display = 'none';
			amount.style.display = 'none';
			refundReason.style.display = 'none';
			note.style.display = 'none';
		}
	})
}

refund.exe = function() {
	refund.getPic();
	refund.selRefundType();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(refund.exe)
}): ai.ready(refund.exe);