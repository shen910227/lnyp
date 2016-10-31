window.onload = function () {
    GetVCode();
}

var gift = {};

gift.addEvt = function() {
    document.getElementById("zm-but").addEventListener('click', function () {
        var vcode = document.getElementById("vcode").value;
        if (vcode == undefined || vcode == ""){
            ai.alert('请填写图形验证码');
            return;
        }
        var send_phone_num = document.getElementById("phone").value;
        document.querySelector('.backDrop').classList.add('ation');
        
    });

    document.getElementById("drop-cancale").addEventListener('click', function() {
        document.querySelector('.backDrop').classList.remove('ation');
        GetVCode();//刷新验证码
    });


    //var data1 = JSON.parse(localStorage.loginjson)
    //document.getElementById("phone").value = data1.phone;

    //document.getElementById("picspan_check").addEventListener('click', function() {
    //    document.getElementById("picspan_check").style.display = 'none';
    //    document.getElementById("picspan_info").style.display = 'inline-block';
    //    //此处增加获取图片验证码接口

    //});

    document.getElementById("get-imgver").addEventListener('click', function () {

        var baseurl = ai.ajaxTool.baseurl1;
        //var data = JSON.parse(localStorage.loginjson)
        //var phonenumber = data.phone;
        var token = localStorage.lnyptoken;
        var codetype = "exchange";
        //在此刷新图片，重新获取验证码
        var url = baseurl + "CouponServer/CMCCFlow/GraphicCodeH5Flow?&v=" + Math.random() + "&token=" + token + "&codetype=" + codetype;
        document.getElementById('get-imgver').innerHTML = '<img src=' + url + ' />';
    });

    
    document.getElementById("drop-sure").addEventListener('click', function() {
        var vcode = document.getElementById("vcode").value;
        var id = localStorage.lnyppaidno;
        document.querySelector('.backDrop').classList.remove('ation');
        document.getElementById('loadingImg').style.display = 'block';
        ai.post({
            url: 'CouponServer/CMCCFlow/ExchangeCmccFlow',
            data: {
                vcode: vcode,
                id: id
            },
            load: function (json) {
                if (json.ResultCode == 1000) {
                    ai.confirm(json.Message, '返回', function () {
                        document.getElementById('loadingImg').style.display = 'none';
                        var str = location.pathname;
                        var proname = str.substring(0, str.indexOf('/', 1));
                        location.href = location.origin + proname + '/templates/paid/paid.html';
                    })
                } else {
                    document.getElementById('loadingImg').style.display = 'none';
                    ai.alert(json.Message);
                    GetVCode();//刷新验证码
                }
            }
        });
        //GetVCode();//刷新验证码
    })
}

//生成验证码方法
function GetVCode() {
    var baseurl = ai.ajaxTool.baseurl1;
    var token = localStorage.lnyptoken;
    var codetype = "exchange";
    //在此刷新图片，重新获取验证码
    var url = baseurl + "CouponServer/CMCCFlow/GraphicCodeH5Flow?v=" + Math.random() + "&token=" + token + "&codetype=" + codetype;
    document.getElementById('get-imgver').innerHTML = '<img src=' + url + ' />';
}

gift.exe = function() {
    gift.addEvt();
}

typeof(window.ai) === "undefined" ? document.addEventListener('aideload', function() {
    ai.ready(gift.exe)
}): ai.ready(gift.exe);
