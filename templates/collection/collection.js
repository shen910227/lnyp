var collection = {};

collection.addNavEvt = function(){
	
	var product = document.getElementById("product");
	var shops = document.getElementById("shops");
	var boxProduct = document.getElementById("box-product");
	var boxShops = document.getElementById("box-shops");
	
	product.addEventListener('click', function(){
		product.className = 'act';
		shops.className = '';
		boxShops.className = 'box';
		boxProduct.className = 'box view-left';
	});
	
	boxProduct.addEventListener('webkitAnimationEnd', function(){
		boxShops.className = 'box hide';
	})
	
	shops.addEventListener('click', function(){
		product.className = '';
		shops.className = 'act';
		boxProduct.className = 'box';
		boxShops.className = 'box view-right';
	})
	
	boxShops.addEventListener('webkitAnimationEnd', function(){
		boxProduct.className = 'box hide';
	})
	
}

collection.init = function(){
	switch (location.hash){
		case '#product':
			document.getElementById("product").className = 'act';
			document.getElementById("shops").className = '';
			document.getElementById("box-product").className = 'box';
			document.getElementById("box-shops").className = 'box hide';
			break;
		case '#shops':
			document.getElementById("product").className = '';
			document.getElementById("shops").className = 'act';
			document.getElementById("box-product").className = 'box hide';
			document.getElementById("box-shops").className = 'box';
			break;
		default:
			break;
	}
}

collection.getShops = function(){
	ai.post('')
}
collection.getPros = function(){
	ai.post('')
}

collection.exe = function() {
	collection.addNavEvt();
	collection.init();
}

typeof(window.ai)==="undefined"?document.addEventListener('aideload',function(){ai.ready(collection.exe)}):ai.ready(collection.exe);