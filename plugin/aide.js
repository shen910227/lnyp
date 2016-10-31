var ai = (function() {
	"use strict"

	////正式配置
	var h5Url = 'http://lnyph5.vpclub.cn/';
	var adminUrl = 'http://cloud.vpclub.cn/';
	var apiUrl = 'http://lnyp.vpclub.cn/api/1.0/';
	var apiUrl1 = 'http://lnyp.vpclub.cn/';
	var actUrl = 'http://active.vpclub.cn/api/1.0/';
	var eleCouponsUrl = 'http://120.25.93.63:8088/api/1.0/';

	//	//镜像配置
	//	//暂时没用
	//	var h5Url = 'http://120.24.218.210:8025/';
	//	//上传图片用
	//	var adminUrl = 'http://120.24.218.210:9000/';
	//	//常规接口
	//	var apiUrl = 'http://120.24.154.14:8024/api/1.0/';
	//	var apiUrl1 = 'http://120.24.154.14:8024/';
	//	//活动接口
	//	var actUrl = 'http://120.24.218.210:8086/api/1.0/';
	//	//电子券接口
	//	var eleCouponsUrl = 'http://120.24.218.210:9012/api/1.0/'

	//		//预演配置
	//		var h5Url = 'http://120.25.93.63:8087/';
	//		var adminUrl = 'http://demogdadmin.vpclub.cn/';
	//		var apiUrl = 'http://demogdapi.vpclub.cn/api/1.0/';
	//		var apiUrl1 = 'http://demogdapi.vpclub.cn/';
	//		var actUrl = 'http://demogdact.vpclub.cn/api/1.0/';
	//		var eleCouponsUrl = 'http://120.25.93.63:8088/api/1.0/'

	//	//开发配置
	//	var h5Url = 'http://218.17.39.178:7007/';
	//	var adminUrl = 'http://218.17.39.178:7021/';
	//	var apiUrl = 'http://218.17.39.178:7009/api/1.0/';
	//	var apiUrl1 = 'http://218.17.39.178:7009/';
	//	var actUrl = 'http://218.17.39.178:7004/api/1.0/';
	//	var eleCouponsUrl = 'http://218.17.39.178:7035/api/1.0/'

	//核心对象
	var ai = {};

	//基础方法
	var method = function(name, fun) {
		Object.defineProperty(ai, name, {
			get: function() {
				return fun;
			}
		})
	}

	//原生扩展
	Element.prototype.obj = null;
	//配置物流url
	ai.logisticalUrl = h5Url;
	//配置图片上传服务器地址
	ai.uploadFileUrl = adminUrl;
	//图形验证码
	ai.apihost = apiUrl1;
	//异步参数配置
	method('ajaxTool', {
		baseurl1: apiUrl,
		baseurl2: actUrl,
		baseurl4: eleCouponsUrl,
		baseurl3: '', //自定义请求接口
		publicdata: function() {
			return { //公共参数
				token: localStorage.lnyptoken,
				v: 413,
				origin: 4,
				appkey: 100000058,
				digest: '0F8E2175FAC34A0476ADC3B20D0D5B50',
				timestamp: ai.getTimestamp()
			};
		},
		requests: [], //请求记录
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
			for(var i = 0; i < this.arr.length; i++) {
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
		if(indexedDB != undefined) {
			var opendb = indexedDB.open(ai.database.name);
			opendb.onupgradeneeded = function(evt) {
				//建表   
				var db = evt.target.result;
				var tabname = ai.database.tabname;
				if(!db.objectStoreNames.contains(tabname)) {
					db.createObjectStore(tabname, {
						keyPath: ai.database.keyname
					});
				}
			}
			opendb.onsuccess = function(evt) {
				ai.database.db = evt.target.result;

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
		} else {
			ai.database.db = false;
			ai.ajaxdbarr.send();
		}
	});

	//列表输出
	/*
	 * view: 列表容器
	 * arr: 绑定的数组
	 * fun: 循环的方法param1,param2(视图模板, 数组对象);
	 * 
	 */
	method('repeat', function(data) {
		var k = data.view.getAttribute('repeat');
		var view = ai.repeatcache.get(k);
		if(data.arr == null) {
			data.arr = [];
		}
		for(var i = 0; i < data.arr.length; i++) {
			var tem = view.cloneNode(true);
			tem.obj = data.arr[i];
			data.fun(tem, data.arr[i]);
			data.view.appendChild(tem);
		}
	});

	/*
	 * 初始化页面repeat模板
	 */
	method('initrepeat', function() {
		var views = document.querySelectorAll('[repeat]');
		for(var i = 0; i < views.length; i++) {
			var k = views[i].getAttribute('repeat');
			if(k == '' || k == null) {
				console.log('repeat属性未设置值');
				return false;
			} else {
				var view = views[i].firstElementChild;
				ai.repeatcache.add(k, view);
				views[i].removeChild(view);
			}
		}
	})

	/*
	 * 获取弹出框相关的资源，并设置对应的事件
	 */

	method('pubGetLogin', function() {
		if(!ai.hasShowLogin) {
			ai.hasShowLogin = true;
			var http = new XMLHttpRequest();
			http.open('GET', '../alert-login/alert-login.html', true);
			http.onload = function() {
				var tex = http.responseText;
				var htmltag = tex.substring((tex.indexOf('<body>') + 6), tex.indexOf('</body>'));
				var doc = document.createElement('div');
				doc.id = "loginBox";
				doc.innerHTML = htmltag;
				document.body.appendChild(doc);
				if(localStorage.loginBtnType == "login") {
					_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
					document.getElementById('login').className = 'show';
				} else if(localStorage.loginBtnType == "signup") {
					_czc.push(["_trackEvent", "登录&注册", "打开注册弹出层"]);
					document.getElementById('reg').className = 'show';
				} else {
					_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
					document.getElementById('login').className = 'show';
				}
				ai.pubAddEvt();
				ai.pubGetVeriyCode();
				ai.pubAddNext();
				ai.pubAddBack();
				ai.pubAddReg();
				ai.pubAddLogin();
			}
			http.send();
		}
	});

	//退出弹出框
	method('pubAddEvt', function() {
		var asi = document.getElementsByTagName('aside');
		for(var i = 0; i < asi.length; i++) {
			asi[i].addEventListener('click', function(evt) {
				localStorage.removeItem('loginBtnType');
				evt.currentTarget.className = 'hide';
			});
			asi[i].firstElementChild.addEventListener('click', function(evt) {
				evt.stopPropagation();
			});
		}
		document.getElementById("signup-but").addEventListener('click', function() {
			_czc.push(["_trackEvent", "登录&注册", "打开注册弹出层"]);
			document.getElementById('reg').className = 'show';
			document.getElementById('login').className = 'hide';
		})
	});

	//设置点击获取获取短信验证码
	method('pubGetVeriyCode', function() {

		document.getElementById("get-verImg").addEventListener('click', function(evt) {
			var phonenumber = document.getElementById("reg").querySelector('.phonenumber').value;
			if(!/\D/.test(phonenumber) && /^\d{11}$/.test(phonenumber)) {
				var url = ai.apihost + '/api/1.0/Store/Store/GraphicVerificationCodeH5?phone=' + phonenumber + "&v=" + Math.random();
				document.getElementById('get-verImg').style.border = 'none';
				document.getElementById('get-verImg').innerHTML = '<img src=' + url + ' />';
			} else {
				ai.alert('电话号码格式不对');
			}
		})

		document.getElementById("get-ver").addEventListener('click', function(evt) {
			var ele = evt.currentTarget;
			var otherEle = document.getElementById('get-verSpe');
			ai.getVerCode(ele, 'abled', 'disabled', otherEle, 'abledSpe', 'disabledSpe', '获取验证码', 1);
		})
		document.getElementById("get-verSpe").addEventListener('click', function(evt) {
			var ele = evt.currentTarget;
			var otherEle = document.getElementById('get-ver');
			ai.getVerCode(ele, 'abledSpe', 'disabledSpe', otherEle, 'abled', 'disabled', '试一试语音验证码', 8);
		});
	})

	method('getVerCode', function(ele, oldClass, newClass, otherEle, OOClass, ONClass, txt, type) {
		var phonenumber = document.getElementById("reg").querySelector('.phonenumber').value;
		if(!/\D/.test(phonenumber) && /^\d{11}$/.test(phonenumber)) {
			if(ele.dataset.lock == 'off') {
				return false;
			}
			var timeout = 60;
			var inter = setInterval(function() {
				ele.className = newClass;
				otherEle.className = ONClass;
				ele.innerText = '已发送(' + timeout + ')';
				if(--timeout == 0) {
					clearInt(inter, ele, oldClass, txt);
					otherEle.className = OOClass;
					otherEle.dataset.lock = 'on';
				}
			}, 1000);
			ele.dataset.lock = 'off';
			otherEle.dataset.lock = 'off';
			ai.post({
				url: 'SmsServer/SMS/SendSmsCode',
				token: false,
				v: false,
				origin: false,
				data: {
					smstype: type,
					vcode: document.getElementById('veriycodeImg').value,
					phonenumber: phonenumber
				},
				load: function(json) {
					if(json.ResultCode != 1000) {
						clearInt(inter, ele, oldClass, txt);
						otherEle.className = OOClass;
						otherEle.dataset.lock = 'on';
					}
					ai.alert(json.Message);
				}
			})
		} else {
			ai.alert('电话号码格式不对');
		}

		function clearInt(inte, ele, className, txt) {
			clearInterval(inte);
			ele.dataset.lock = 'on';
			ele.innerText = txt;
			ele.className = oldClass;
		}
	})

	//设置注册时的电话号码验证
	method('pubAddNext', function() {
		document.getElementById("next").addEventListener('click', function(evt) {
			var phonenumber = document.getElementById("reg").querySelector('.phonenumber').value,
				veriycode = document.getElementById("veriycode").value,
				checkBox = document.getElementsByClassName("regCheck")[0];
			if(!checkBox.checked) {
				ai.alert("请阅读并勾选使用协议！");
			} else if(/\D/.test(phonenumber) && !/^\d{11}$/.test(phonenumber)) {
				ai.alert('电话号码格式不对');
			} else if(!veriycode.length > 0) {
				ai.alert('验证码不能为空');
			} else {
				ai.pubNext(veriycode, phonenumber);
			}
		})
	})

	//设置注册页面返回登录页面
	method('pubAddBack', function() {
		document.getElementById("back").addEventListener('click', function(evt) {
			_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
			document.getElementById('reg').className = 'hide';
			document.getElementById('login').className = 'show';
		})
	})

	//手机验证码验证
	method('pubNext', function(veriycode, phonenumber) {
		ai.post({
			url: 'SmsServer/SMS/VerifySignCode',
			data: {
				signcode: veriycode,
				phonenumber: phonenumber
			},
			load: function(json) {
				if(json.ResultCode == 1000) {
					document.getElementById("reg").className = 'hide';
					document.getElementById("nex").className = 'show';
				} else {
					ai.alert(json.Message);
				}
			}
		});
	})

	//设置注册页面的必填项验证
	method('pubAddReg', function() {
		document.getElementById("conf").addEventListener('click', function() {
			var phonenumber = document.getElementById("reg").querySelector('.phonenumber').value;
			var veriycode = document.getElementById("veriycode").value;
			var newphonenumber = document.getElementById("nex").querySelector('.newphonenumber').value;
			var repeatnewphonenumber = document.getElementById("nex").querySelector('.repeatnewphonenumber').value;
			var regEmoji = /\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|[\u2000-\u2fff]/g,
				regChinese = /[\u4e00-\u9fa5]/,
				reg = /((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))^.{6,16}$/;
			var strForPW = newphonenumber;
			strForPW.replace(regEmoji, 'shen@.!-#.%');
			if(newphonenumber.length == 0) {
				ai.alert('密码设置不能为空');
			} else if(newphonenumber.indexOf('shen@.!-#.%') != -1 || regChinese.test(newphonenumber) || !reg.test(newphonenumber)) {
				ai.alert('密码仅支持6-16位的英文字母、数字、符号组合，不支持纯数字、字母或符号。');
			} else if(repeatnewphonenumber.length == 0) {
				ai.alert('再次密码填写不能为空');
			} else if(newphonenumber != repeatnewphonenumber) {
				ai.alert('两次输入的密码不正确');
			} else {
				ai.pubReg(veriycode, phonenumber, newphonenumber, repeatnewphonenumber);
			}
		})
	})

	//开店操作
	method('pubReg', function(veriycode, phonenumber, newphonenumber, repeatnewphonenumber) {
		ai.post({
			url: 'StoreServer/Store/RegisterStore',
			data: {
				smscode: veriycode,
				phonenumber: phonenumber,
				newPassword: newphonenumber,
				repeatNewPassword: repeatnewphonenumber
			},
			v: false,
			load: function(json) {
				if(json.ResultCode == 1000) {
					localStorage.loginResult = '成功注册';
					document.getElementById("nex").className = 'hide';
					ai.alert(json.Message);
					ai.pubLogin(phonenumber, newphonenumber);
				} else {
					ai.alert(json.Message);
				}
			}
		})

	})

	//设置登录页面的必填项验证
	method('pubAddLogin', function() {
		document.getElementById("login-but").addEventListener('click', function() {
			var phonenumber = document.getElementById("login").querySelector('.phonenumber').value;
			var password = document.getElementById("login").querySelector('.password').value;
			if(phonenumber.length == 0) {
				ai.alert('账号不能为空');
			} else if(password.length == 0) {
				ai.alert('密码不能为空');
			} else {
				ai.pubLogin(phonenumber, password);
			}
		})
	})

	method('pubLogin', function(username, password) {
		var aside = ai.alert('正在登录...');
		ai.post({
			url: 'StoreServer/Store/VerifyAccount',
			data: {
				username: username,
				password: password
			},
			load: function(json) {
				aside.click();
				if(json.ResultCode == 1000) {
					localStorage.loginResult = '成功登录';
					localStorage.lnyptoken = json.Data.token;
					localStorage.loginjson = JSON.stringify({
						storeLogo: json.Data.storeLogo,
						storeName: json.Data.storeName,
						phone: username,
						storeId: json.Data.id,
						UserId: json.Data.storeMasterId,
						nickName:json.Data.nickName
					});
					var login = document.getElementById("login");
					login.className = 'hide';
					if(localStorage.loginBtnType == "signup" || localStorage.loginBtnType == "login") {
						localStorage.removeItem('loginBtnType');
						if(location.href.indexOf('orderCenter') != -1) {
							var view = document.querySelector('#userdata .user');
							var buts = document.querySelector('#userdata .buts');
							view.querySelector('.img').src = json.Data.storeLogo;
							view.querySelector('[att=storeName]').innerText = json.Data.storeName;
							view.classList.add('show');
							buts.classList.remove('show');
						}
					}
					location.reload();
					aside.click();
				} else {
					ai.alert(json.Message);
				}
			}
		})

	});
	//登录注册统计
	method('loginCount', function() {
		if(localStorage.loginResult) {
			if(localStorage.loginResult == '成功登录') {
				_czc.push(["_trackEvent", "登录&注册", '成功登录']);
			} else if(localStorage.loginResult == '成功注册') {
				_czc.push(["_trackEvent", "登录&注册", '成功注册']);
			}
			localStorage.removeItem('loginResult');
		}
	})
	ai.loginCount();

	/*
	 * POST方法
	 * url:请求地址
	 * data:元数据
	 * db:是否请求数据库
	 * load:成功响应方法
	 */
	method('post', function(data) {

		//用数组记录阻止重复异步提交
		var urlkey = data.url + ai.dataToForm(data.data);
		var requestsStr = ai.ajaxTool.requests.join('@@');
		if(requestsStr.indexOf(urlkey) != -1 && urlkey.indexOf('ElectronicCoupons/GetECouponPayResult') == -1) {
			return false;
		} else {
			ai.ajaxTool.requests.push(urlkey);
		}

		//组装请求表单
		var publicdata = ai.ajaxTool.publicdata();
		if(data.token == false) {
			delete publicdata.token;
		}
		if(data.v == false) {
			delete publicdata.v;
		}
		if(data.origin == false) {
			delete publicdata.origin;
		}
		if(data.isNonce) {
			publicdata.nonce = Math.floor(Math.random() * 9000000 + 1000000);
			publicdata.digest = getDigFn(publicdata.timestamp, publicdata.v, publicdata.origin, publicdata.nonce);

		}
		if(data.baseURL == 2) {
			ai.ajaxTool.baseurl = ai.ajaxTool.baseurl2;
		} else if(data.baseURL == 99) {
			ai.ajaxTool.baseurl = ai.ajaxTool.baseurl3;
		} else if(data.baseURL == 4) {
			ai.ajaxTool.baseurl = ai.ajaxTool.baseurl4;
		} else {
			ai.ajaxTool.baseurl = ai.ajaxTool.baseurl1;
		}
		for(var k in publicdata) {
			data.data[k] = publicdata[k];
		}

		var formstr = ai.dataToForm(data.data);

		var http = new XMLHttpRequest();
		http.open('POST', ai.ajaxTool.baseurl + data.url, true);
		http.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
		http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

		http.onloadstart = function() {
			if(data.db == true) {
				ai.database.find(urlkey, function(json) {
					if(json != undefined) {
						console.log('命中数据库: ' + urlkey);
						data.load(json);
					}
				});
			}
		}
		http.onload = function() {
			data.load(JSON.parse(this.responseText))
		}
		http.onloadend = function() {
			if(typeof(JSON.parse(this.responseText)) == "object") {
				var json = JSON.parse(this.responseText);
			} else {
				var json = {};
			}

			//重置url的阻止请求
			for(var i = 0; i < ai.ajaxTool.requests.length; i++) {
				if(ai.ajaxTool.requests[i] == urlkey) {
					ai.ajaxTool.requests.splice(i, 1);
				}
			}

			//保存响应数据到数据库
			json.urlkey = urlkey;
			ai.database.add(json);

			//判断登录失效
			if(json.ResultCode == 1009 && urlkey != 'StoreServer/Store/CheckToken') {
				localStorage.removeItem('loginjson');
				localStorage.removeItem('lnyptoken');
				ai.pubGetLogin();
			}
		}
		if(data.db == true && ai.database.db == null) {
			ai.ajaxdbarr.add(http, formstr);
		} else {
			http.send(formstr);
		}
	});

	//元数据转ajax表单数据
	method('dataToForm', function(data) {
		var arg = '';
		for(var key in data) {
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
		if(document.readyState == 'complete') {
			fun();
		} else {
			document.addEventListener('readystatechange', function() {
				if(document.readyState == 'complete') {
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
		//唯一执行
		if(document.readyState == 'complete') {
			ai.initrepeat();
		} else {
			document.addEventListener('readystatechange', function() {
				if(document.readyState == 'complete') {
					ai.initrepeat();
				}
			})
		};
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
		for(var key in data) {
			if(data[key] < 10) {
				data[key] = '0' + data[key];
			}
		}
		return stamp.concat(time.getFullYear(), data.month, data.day, data.hours, data.minutes, data.seconds);
	});

	//弹出提示框
	method('alert', function(msg) {
		var alt = document.getElementById("alert-tex");
		if(alt == null) {
			var aside;
			aside = document.createElement('aside');
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
		alt.firstElementChild.innerHTML = msg;
		alt.style.display = 'block';
		return alt;
	});

	//弹出确认框
	method('confirm', function(msg, tex, fun) {
		var alert = document.getElementById("alert-tex");
		if(alert != null) {
			document.body.removeChild(alert);
		}
		var alt = document.querySelector("#alert-tex .confirm");
		if(alt == null) {
			var aside = document.createElement('aside');
			aside.id = 'alert-tex';
			var div = document.createElement('div');
			var span = document.createElement('span');
			var but = document.createElement('button');
			div.className = 'confirm';
			but.innerText = tex;
			but.addEventListener('click', function() {
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

	//获取url？后指定参数的值
	method('GetQueryString', function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return(r[2]);
		return null;
	})

	//时间格式转换
	method('changeTime', function(time) {
		var timeStr = time.substring(0, 16);
		return timeStr.split('T').join(' ');
	})

	//判断是否已选择sku
	method('isSelSku', function() {
		var colorBox = document.getElementById('select-box__colorBox');
		var colorTitle = document.getElementById('select-box__colorTitle');
		var colorList = document.getElementsByClassName('select-box__colorItem');
		var colorSelect = document.getElementById('colorSelect');
		var unitBox = document.getElementById('select-box__unitBox');
		var unitTitle = document.getElementById('select-box__unitTitle');
		var unitList = document.getElementsByClassName('select-box__unitItem');
		var unitSelect = document.getElementById('unitSelect');
		if(colorList.length > 0 && !colorSelect) {
			ai.alert('请选择' + colorTitle.innerHTML);
			return false;
		}
		if(unitList.length > 0 && !unitSelect) {
			ai.alert('请选择' + unitTitle.innerHTML);
			return false;
		}
		return true;
	})

	//获取页面滑动的距离
	method('getScrollTop', function() {
		var scrollTop = 0,
			bodyScrollTop = 0,
			documentScrollTop = 0;　　
		if(document.body) {　　　　
			bodyScrollTop = document.body.scrollTop;　　
		}　　
		if(document.documentElement) {　　　　
			documentScrollTop = document.documentElement.scrollTop;　　
		}　　
		scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
		return scrollTop;
	})

	//获取页面可视区域的高度
	method('getWindowHeight', function() {
		var windowHeight = 0;　　
		if(document.compatMode == "CSS1Compat") {　　　　
			windowHeight = document.documentElement.clientHeight;　　
		} else {　　　　
			windowHeight = document.body.clientHeight;　　
		}　　
		return windowHeight;
	})

	//获取页面内容总的高度
	method('getScrollHeight', function() {
			var scrollHeight = 0,
				bodyScrollHeight = 0,
				documentScrollHeight = 0;　　
			if(document.body) {　　　　
				bodyScrollHeight = document.body.scrollHeight;　　
			}　　
			if(document.documentElement) {　　　　
				documentScrollHeight = document.documentElement.scrollHeight;　　
			}　　
			scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;　　
			return scrollHeight;
		})
		//判断是否为微信
	method('isWeixin', function() {
		var ua = window.navigator.userAgent.toLowerCase();
		return ua.match(/MicroMessenger/i) == 'micromessenger' ? 1 : 0;
	})

	//初始化iframe高度
	method('iframeInitH', function(iframe) {
		if(iframe) {
			iframe.style.height = ((3 / 4) * iframe.offsetWidth) + "px";
		}
	})

	//启用单个直播视频
	method('videoLiveEvt', function(ele) {
		var video = ele.getElementsByTagName('video')[0],
			zhibo = ele.getElementsByClassName('zhibo')[0],
			play = ele.getElementsByClassName('play')[0],
			pause = ele.getElementsByClassName('pause')[0];

		play.onclick = function() {
			video.play();
		}
		pause.onclick = function() {
			video.pause();
		}

		video.oncanplay = function() {
			video.controls = true;
		}

		video.onclick = function() {
			if(play.style.display == 'none' && pause.style.display == 'none') {
				pause.style.display = 'block';
				play.style.display = 'none';
				clearTimeout(ele.timer);
				ele.timer = setTimeout(function() {
					pause.style.display = 'none';
				}, 2000)
			}
		}

		video.onplay = function() {
			pause.style.display = 'block';
			play.style.display = 'none';
			ele.timer = setTimeout(function() {
				pause.style.display = 'none';
			}, 2000)
		}

		video.onpause = function() {
			play.style.display = 'block';
			pause.style.display = 'none';
			clearTimeout(ele.timer);
		}
	})

	//执行前检查是否登录
	method('isLogin', function(fn) {
		if(localStorage.lnyptoken && localStorage.loginjson) {
			fn();
		} else {
			localStorage.removeItem('loginjson');
			localStorage.removeItem('lnyptoken');
			if(!document.getElementById('loginBox')) {
				ai.pubGetLogin();
			} else {
				_czc.push(["_trackEvent", "登录&注册", "打开登录弹出层"]);
				document.getElementById('login').className = 'show';
			}
		}
	})

	return ai;
})();
ai.createdb();
ai.load();