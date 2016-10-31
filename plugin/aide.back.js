var ai = (function() {
	"use strict"
	var ai = {};
	var method = function(name, fun) {
		var config = {};
		config[name] = {
			get: function() {
				return fun;
			}
		};
		Object.defineProperties(ai, config);
	}

	XMLHttpRequest.prototype.dbkey = null;
	XMLHttpRequest.prototype.data = null;
	XMLHttpRequest.prototype.load = function(fun, cache) {

		var judg = true;

		this.onloadstart = function() {
			var json = ai.database.find(this.dbkey, function(json) {
				if (json != undefined) {
					judg = false;
					if (cache != false) {
						console.log('indexDB cache !');
						fun(json);
					}
				}
			});
		}

		this.onload = function() {
			if (judg || cache == false) {
				fun(JSON.parse(this.responseText));
			}
		}

		if (ai.database.find == null && ai.database.indexedDB != undefined) {
			ai.ajaxlist.push(this);
		} else {
			this.send(this.data);
		}
	}

	Element.prototype.obj = null;

	Event.prototype.getObj = function() {
		var obj;
		findObj(this.currentTarget);

		function findObj(ele) {
			if (ele && ele.obj == null) {
				findObj(ele.parentElement)
			} else {
				obj = ele.obj;
				return obj;
			}
		}
		return obj;
	}

	method('config', {
		v: 404,
		origin: 3,
		appkey: 100000058,
		digest: '0F8E2175FAC34A0476ADC3B20D0D5B50',
		baseurl: 'http://218.17.39.178:7009/api/1.0/',
		//baseurl: 'http://120.24.218.210:8090/api/1.0/',
		urllog: [],
	});

	method('database', {
		name: 'lnyp',
		version: 1,
		db: null,
		tabs: ['response'],
		keys: ['urlid'],
		find: null,
		add: null,
		indexedDB: null
	});

	method('ajaxlist', [])

	method('ready', function(fun) {
		fun = typeof(fun) === 'function' ? fun : function() {
			return false;
		};
		if (document.readyState == 'complete') {
			fun();
		} else {
			document.addEventListener('readystatechange', function() {
				if (document.readyState == 'complete') {
					fun();
				}
			})
		};
	});

	method('load', function() {
		var aideready = document.createEvent('HTMLEvents');
		aideready.initEvent('aideload', false, true);
		document.dispatchEvent(aideready);
	});

	method('createdb', function() {
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
		ai.database.indexedDB = indexedDB;
		if (indexedDB != undefined) {
			var opendb = indexedDB.open(ai.database.name);
			opendb.onupgradeneeded = function(evt) {
				//建表
				var db = evt.target.result;
				for (var i = 0; i < ai.database.tabs.length; i++) {
					var tabname = ai.database.tabs[i]
					if (!db.objectStoreNames.contains(tabname)) {
						db.createObjectStore(tabname, {
							keyPath: ai.database.keys[i]
						});
					}
				}
			}
			opendb.onsuccess = function(evt) {
				ai.database.db = evt.target.result;
				console.log('database open success!');

				//定义添加
				ai.database.add = function(data) {
					var tx = ai.database.db.transaction('response', 'readwrite');
					var store = tx.objectStore('response');
					store.put(data);
				}

				//定义查询
				ai.database.find = function(value, fun) {
					var tx = ai.database.db.transaction('response', 'readwrite');
					var store = tx.objectStore('response');
					store.get(value).onsuccess = function(evt) {
						fun(evt.target.result);
					};
				}

				//发送请求列队
				sendAjaxList();
			}
			opendb.onerror = function() {
				//发送请求列队
				sendAjaxList();
				console.debug('database open error!');
			}
		}

		function sendAjaxList() {
			for (var i = 0; i < ai.ajaxlist.length; i++) {
				ai.ajaxlist[i].send(ai.ajaxlist[i].data);
			}
		}
	});

	method('vm', function(view, model) {
		var vals = view.getElementsByTagName('param');
		var atts = view.querySelectorAll('[param]');
		var eles = view.querySelectorAll('[paramtex]');
		if (vals) {
			for (var i = 0; i < vals.length;) {
				var dataname = vals[i].getAttribute('value');
				if (dataname == null) {
					vals[i].outerHTML = '';
					continue
				}
				var vallist = dataname.split('.');
				if (vallist.length > 1) {
					var agen = getValue(vallist, model);
					setValue(agen, vals[i]);
				} else {
					if (model[dataname] != undefined) {
						setValue(model[dataname], vals[i]);
					} else {
						vals[i].outerHTML = undefined;
					}
				}
			}
		}
		if (atts) {
			for (var i = 0; i < atts.length; i++) {
				var paramstr = atts[i].getAttribute('param');
				var eleatts = paramstr.split(',');
				for (var j = 0; j < eleatts.length; j++) {
					var attarr = eleatts[j].split(':');
					var attvalarr = attarr[1].split('.');
					if (attvalarr.length > 1) {
						var agen = getValue(attvalarr, model);
						atts[i].setAttribute(attarr[0], agen);
					} else {
						if (model[attarr[1]] != undefined) {
							atts[i].setAttribute(attarr[0], model[attarr[1]]);
						} else {
							atts[i].setAttribute(attarr[0], undefined);
						}
					}
				}
			}
		}
		if (eles) {
			for (var i = 0; i < eles.length; i++) {
				var dataname = eles[i].getAttribute('paramtex');
				var vallist = dataname.split('.');
				if (vallist.length > 1) {
					var agen = getValue(vallist, model);
					eles[i].innerText = agen;
				} else {
					if (model[dataname] != undefined) {
						eles[i].innerText = model[dataname];
					} else {
						eles[i].innerText = undefined;
					}
				}
			}
		}

		function getValue(vallist, model) {
			var agen = model;
			for (var j = 0; j <= (vallist.length - 1); j++) {
				if (agen[vallist[j]] != undefined) {
					agen = agen[vallist[j]]
				} else {
					agen = undefined;
					break;
				}
			}
			return agen;
		}

		function setValue(value, ele) {
			if (ele.hasAttribute('then')) {
				value == ele.getAttribute('then') ? ele.outerHTML = ele.getAttribute('tex') : ele.outerHTML = '';
			} else {
				ele.outerHTML = value;
			}
		}
	});

	method('repeat', function(view, arr) {
		var views = view.querySelectorAll('[repeat]');
		if (arr.length != 0 && arr != undefined) {
			for (var i = 0; i < views.length; i++) {
				var box = views[i].parentElement;
				views[i].removeAttribute('style');
				for (var j = 0; j < arr.length; j++) {
					var tem = views[i].cloneNode(true);
					ai.vm(tem, arr[j]);
					tem.obj = arr[j];
					tem.removeAttribute('repeat');
					box.appendChild(tem);
				}
				views[i].style.display = 'none';
			}
		}
	});

	method('parsedata', function(data) {
		var arg = '';
		for (var key in data) {
			arg += key + '=' + data[key] + '&';
		}
		arg = arg.substr(0, (arg.length - 1));
		return arg;
	})

	method('ajax', function(type, url) {
		var http = new XMLHttpRequest();
		http.open(type, url, true);
		http.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
		http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		return http;
	});

	method('post', function(url, data, judg) {

		var datastr = ai.parsedata(data);
		var keyval = url + datastr;

		//阻止相同url请求重复
		for (var i = 0; i < ai.config.urllog.length; i++) {
			if (ai.config.urllog[i] == keyval) {
				return {
					load: function(fun) {}
				};
			}
		}
		ai.config.urllog.push(keyval);

		//加入接口规范数据和判断是否加入token
		if (judg != false && localStorage.lnyptoken != undefined) {
			data.token = localStorage.lnyptoken;
		}

		data.v = ai.config.v;
		data.appkey = ai.config.appkey;
		data.origin = ai.config.origin;
		data.digest = ai.config.digest;
		data.timestamp = ai.getTimestamp();

		//创建post ajax
		var http = ai.ajax('POST', ai.config.baseurl + url);

		http.data = ai.parsedata(data);
			
		
		http.dbkey = keyval;

		http.onloadend = function() {

			//重置相同url请求重复
			for (var i = 0; i < ai.config.urllog.length; i++) {
				if (ai.config.urllog[i] == keyval) {
					ai.config.urllog.splice(i, 1);
				}
			}

			var json = JSON.parse(this.responseText);
			//判断登陆失效
			if (json.ResultCode == 1009) {
				localStorage.loginjson = null;
				ai.confirm(json.Message, '返回登录', function () {
					var str = location.pathname;
					var proname = str.substring(0, str.indexOf('/', 1));
					location.href = location.origin + proname + '/templates/login/login.html';
				});
			}

			//保存到数据库
			json.urlid = this.dbkey;
			ai.database.add(json);
		}
		return http;
	});

	method('alert', function(msg) {
		var alt = document.getElementById("alert-tex");
		if (alt == null) {
			var aside = document.createElement('aside');
			aside.id = 'alert-tex';
			aside.addEventListener('click', function(evt) {
				evt.currentTarget.style.display = 'none';
			})
			var div = document.createElement('div');
			div.className = 'alert';
			aside.appendChild(div);
			document.body.appendChild(aside);
			alt = aside;
		}
		alt.firstElementChild.innerText = msg;
		alt.style.display = 'block';
	});

	method('confirm', function(msg, tex, fun) {
		var alert = document.getElementById("alert-tex");
		if (alert != null) {
			document.body.removeChild(alert);
		}
		var alt = document.querySelector("#alert-tex .confirm");
		if (alt == null) {

			var aside = document.createElement('aside');
			aside.id = 'alert-tex';
			var div = document.createElement('div');
			var span = document.createElement('span');
			var but = document.createElement('button');
			div.className = 'confirm';
			but.innerText = tex;
			but.addEventListener('click', function(){
				document.getElementById("alert-tex").style.display = 'none';
				fun();
			});
			span.innerText = msg;

			div.appendChild(span);
			div.appendChild(but);
			aside.appendChild(div);
			document.body.appendChild(aside);
			alt = aside;
		}
		alt.querySelector('span').innerText = msg;
		alt.style.display = 'block';
	})

	method('getTimestamp', function() {
		var time = new Date(),
			stamp = new String();
		var data = {
			month: (time.getMonth() + 1), //月
			day: time.getDate(), //日
			hours: time.getHours(), //小时
			minutes: time.getMinutes(), //分钟
			seconds: time.getSeconds() //秒钟
		}
		for (var key in data) {
			if (data[key] < 10) {
				data[key] = '0' + data[key];
			}
		}
		return stamp.concat(time.getFullYear(), data.month, data.day, data.hours, data.minutes, data.seconds);
	});
	
	return ai;
})();
ai.createdb();
ai.load();