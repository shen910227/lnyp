function innerJS(srcStr, tagetEle) {
	var newScript = document.createElement('script');
	newScript.src = srcStr + '?v=' + Math.random();
	newScript.type = 'text/javascript';
	newScript.charset = 'utf-8';
	newScript.async = 'async';
	document.head.insertBefore(newScript, tagetEle.nextSibling);
}

function innerLink(hrefStr) {
	var newLink = document.createElement('link');
	newLink.rel = 'stylesheet';
	newLink.type = 'text/css';
	newLink.href = hrefStr + '?v=' + Math.random();
	document.head.appendChild(newLink);
}