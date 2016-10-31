var ai = (function() {
	"use strict"
	//核心对象
	var ai = {};

	//基础方法
	var method = function(name, fun) {
		Object.defineProperty(ai, name, {
			get: function(){
				return fun;
			}
		})
	}

	//原生扩展
	Element.prototype.obj = null;

	//异步参数配置
	method('ajaxTool', {
		//baseurl: 'http://127.0.0.1:9000/', //基础请求url
		baseurl: 'http://218.17.39.178:7009/api/1.0/',
		requests: [], //请求记录
		publicdata: function() {
				return {
					plugin: 'aide',
					token: localStorage.lnyptoken,
					digest: '0F8E2175FAC34A0476ADC3B20D0D5B50',
					timestamp: ai.getTimestamp()
				};
			} //公共参数
	});

	//ajax等待数据库数组
	method('ajaxdbarr', {
		arr: [],
		par: [],
		add: function(http, formstr) {
			this.arr.push(http);
			this.par.push(formstr);
		},
		send: function() {
			for (var i = 0; i < this.arr.length; i++) {
				this.arr[i].send(this.par[i]);
			}
		}
	});

	//模板缓存
	method('repeatcache', {
		data: {},
		add: function(k, tem) {
			this.data[k] = tem;
		},
		get: function(k) {
			return this.data[k];
		}
	});

	//数据库配置
	method('database', {
		name: 'aidedb', //数据库名称
		version: 1, //数据库版本号
		db: null, //数据库对象
		tabname: 'response', //需要创建的数据库表数组
		keyname: 'urlkey', //数据库表对应的key值名称
		find: function() {}, //数据库表查询方法
		add: function() {}, //数据库表添加方法
	});

	//创建和连接数据库方法
	method('createdb', function() {
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
		if (indexedDB != undefined) {
			var opendb = indexedDB.open(ai.database.name);
			opendb.onupgradeneeded = function(evt) {
				//建表   
				var db = evt.target.result;
				var tabname = ai.database.tabname;
				if (!db.objectStoreNames.contains(tabname)) {
					db.createObjectStore(tabname, {
						keyPath: ai.database.keyname
					});
				}
			}
			opendb.onsuccess = function(evt) {
				ai.database.db = evt.target.result;
				console.log('数据库连接成功!');

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
				ai.ajaxdbarr.send();
			}
			opendb.onerror = function() {
				ai.database.db = '数据库连接或创建失败!';
				ai.ajaxdbarr.send();
			}
		} else{
			ai.database.db = false;
			ai.ajaxdbarr.send();
		}
	});

	//列表输出
	/*
	 * view: 列表容器
	 * arr: 绑定的数组
	 * forction: 循环的方法
	 * 
	 */
	method('repeat', function(data) {
		var k = data.view.getAttribute('repeat');
		var view = ai.repeatcache.get(k);
		if (view == undefined) {
			view = data.view.firstElementChild;
			ai.repeatcache.add(k, view);
			data.view.removeChild(view);
		}
		for (var i = 0; i < data.arr.length; i++) {
			var tem = view.cloneNode(true);
			tem.obj = data.arr[i];
			data.forction(tem, data.arr[i]);
			data.view.appendChild(tem);
		}
	});

	/*
	 * POST方法
	 * url:请求地址
	 * data:元数据
	 * db:是否请求数据库
	 * success:成功响应方法
*/
	method('post', function(data) {

		//用数组记录阻止重复异步提交
		var urlkey = data.url + ai.dataToForm(data.data);
		for (var i = 0; i < ai.ajaxTool.length; i++) {
			if (ai.ajaxTool.requests[i] == urlkey) {
				return false;
			} else {
				ai.ajaxTool.requests.push(urlkey);
			}
		}

		//组装请求表单
		var publicdata = ai.ajaxTool.publicdata();
		for (var k in publicdata) {
			data.data[k] = publicdata[k];
		}
		var formstr = ai.dataToForm(data.data);

		var http = new XMLHttpRequest();
		http.open('POST', ai.ajaxTool.baseurl + data.url, true);
		http.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
		http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

		http.onloadstart = function() {
			if (data.db == true) {
				ai.database.find(urlkey, function(json) {
					if (json != undefined) {
						console.log('命中数据库: ' + urlkey);
						data.success(json);
					}
				});
			}
		}

		http.onload = function() {
			data.success(JSON.parse(this.responseText))
		}

		http.onloadend = function() {
			var json = JSON.parse(this.responseText);

			//重置url的阻止请求
			for (var i = 0; i < ai.ajaxTool.requests.length; i++) {
				if (ai.ajaxTool.requests[i] == urlkey) {
					ai.ajaxTool.requests.splice(i, 1);
				}
			}

			//保存响应数据到数据库
			json.urlkey = urlkey;
			ai.database.add(json);
		}

		if (data.db == true && ai.database.db == null) {
			ai.ajaxdbarr.add(http, formstr);
		} else {
			http.send(formstr);
		}

	});

	//元数据转ajax表单数据
	method('dataToForm', function(data) {
		var arg = '';
		for (var key in data) {
			arg += key + '=' + data[key] + '&';
		}
		arg = arg.substr(0, (arg.length - 1));
		return arg;
	})

	//页面就绪方法
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

	//aide的load事件发生方法
	method('load', function() {
		var aideready = document.createEvent('HTMLEvents');
		aideready.initEvent('aideload', false, true);
		document.dispatchEvent(aideready);
	});

	//获取时间戳方法
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