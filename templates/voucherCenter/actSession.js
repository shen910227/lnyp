var actSession = {};

actSession.addEvt = function() {
	var sortBoxs = document.getElementsByClassName('sortBox__itemBox');
	sortBoxs[0].addEventListener('click',function(evt){
		if(evt.currentTarget.firstElementChild.className != 'sortBox__txtAct' ){
			evt.currentTarget.parentElement.querySelector('.sortBox__txtAct').className = 'sortBox__txt';
			if(evt.currentTarget.parentElement.querySelector('.sortBox__iconUp')){
				evt.currentTarget.parentElement.querySelector('.sortBox__iconUp').className = 'sortBox__iconNone';
			}else if(evt.currentTarget.parentElement.querySelector('.sortBox__iconDown')){
				evt.currentTarget.parentElement.querySelector('.sortBox__iconDown').className = 'sortBox__iconNone';
			}
			evt.currentTarget.firstElementChild.className = 'sortBox__txtAct';
			actSession.sequence = 0;
			actSession.sort = evt.currentTarget.getAttribute('type');
			actSession.getList(actSession.sort,actSession.sequence);
		}
	})
	for (var i=1;i<sortBoxs.length;i++) {
		sortBoxs[i].addEventListener('click',function(evt){
			if(evt.currentTarget.firstElementChild.className != 'sortBox__txtAct' ){
				evt.currentTarget.parentElement.querySelector('.sortBox__txtAct').className = 'sortBox__txt';
				if(evt.currentTarget.parentElement.querySelector('.sortBox__iconUp')){
					evt.currentTarget.parentElement.querySelector('.sortBox__iconUp').className = 'sortBox__iconNone';
				}else if(evt.currentTarget.parentElement.querySelector('.sortBox__iconDown')){
					evt.currentTarget.parentElement.querySelector('.sortBox__iconDown').className = 'sortBox__iconNone';
				}
				evt.currentTarget.firstElementChild.className = 'sortBox__txtAct';
				evt.currentTarget.lastElementChild.className = 'sortBox__iconUp';
				actSession.sequence = 1;
				actSession.sort = evt.currentTarget.getAttribute('type');
				actSession.getList(actSession.sort,actSession.sequence);
			}else {
				if(evt.currentTarget.lastElementChild.className == 'sortBox__iconUp'){
					evt.currentTarget.lastElementChild.className = 'sortBox__iconDown';
					actSession.sequence = 0;
					actSession.sort = evt.currentTarget.getAttribute('type');
					actSession.getList(actSession.sort,actSession.sequence);
				}else{
					evt.currentTarget.lastElementChild.className = 'sortBox__iconUp';
					actSession.sequence = 1;
					actSession.sort = evt.currentTarget.getAttribute('type');
					actSession.getList(actSession.sort,actSession.sequence);
				}
			}
		})
	}
}


actSession.getList = function(sort,sequence) {
	
	
	
}







actSession.exe = function() {
	actSession.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
	ai.ready(actSession.exe)
}): ai.ready(actSession.exe);