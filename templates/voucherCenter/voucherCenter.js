var voucherCenter = {};



voucherCenter.addEvt = function() {
	var downUp = document.querySelector('[statu=down]');
	var spansBox = document.getElementsByClassName('men')[0];
	var chileSpansBox = document.getElementById('sel_main');
	downUp.addEventListener('click',function(evt){
		var downUp = evt.currentTarget;
		var selBox = document.getElementById('sel');
		var selMain = document.getElementById('sel_main');
		if(downUp.getAttribute('statu') == 'down'){
			selBox.style.backgroundColor = 'rgba(0,0,0,0.5)'
			selBox.style.display = 'block';
			downUp.style.webkitTransform = 'rotateX(180deg)';
			selMain.classList.remove('out');
			selMain.classList.add('in');
			downUp.setAttribute('statu','up');
		}else if(downUp.getAttribute('statu') == 'up'){
			selBox.style.backgroundColor = 'rgba(0,0,0,0)'
			downUp.style.webkitTransform = 'rotateX(0deg)';
			selMain.classList.add('out');
			setTimeout(function(){
				selMain.classList.remove('in');
				selBox.style.display = 'none';
			},300)
			downUp.setAttribute('statu','down');
		}
	})
	var spans = spansBox.getElementsByTagName('span');
	for(var i=0;i<spans.length;i++){
		spans[i].addEventListener('click',function(evt){
			if(evt.currentTarget.className != 'act'){
				evt.currentTarget.parentElement.querySelector('.act').className = '';
				evt.currentTarget.className = 'act';
			}
			
			
		})
	}
	
	var chileSpans = chileSpansBox.getElementsByTagName('span');
	for(var i=0;i<chileSpans.length;i++){
		chileSpans[i].addEventListener('click',function(evt){
			if(evt.currentTarget.className != 'act'){
				evt.currentTarget.parentElement.querySelector('.act').className = '';
				evt.currentTarget.className = 'act';
			}
			
			
		})
	}
	
	
}



voucherCenter.exe = function() {
	voucherCenter.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(voucherCenter.exe)
}): ai.ready(voucherCenter.exe);