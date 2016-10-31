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
        document.getElementById("send-phone").innerText = send_phone_num;
        document.querySelector('.backDrop').classList.add('ation');
        
    });

    document.getElementById("drop-cancale").addEventListener('click', function() {
        document.querySelector('.backDrop').classList.remove('ation');
        GetVCode();//刷新验证码
    });

    document.getElementById("get-imgver").addEventListener('click', function () {
        var baseurl = ai.ajaxTool.baseurl1;
        var token = localStorage.lnyptoken;
        var codetype = "donation";
        //在此刷新图片，重新获取验证码
        var url = baseurl + "CouponServer/CMCCFlow/GraphicCodeH5Flow?v=" + Math.random() + "&token=" + token + "&codetype=" + codetype;
        document.getElementById('get-imgver').innerHTML = '<img src=' + url + ' />';
    });

    
    document.getElementById("drop-sure").addEventListener('click', function () {
        var send_phone_num = document.getElementById("phone").value;
        var vcode = document.getElementById("vcode").value;
        var id = localStorage.lnyppaidno;
        document.querySelector('.backDrop').classList.remove('ation');

        if (!/\D/.test(send_phone_num) && /^\d{11}$/.test(send_phone_num)) {
            document.getElementById('loadingImg').style.display = 'block';
            ai.post({
                url: 'CouponServer/CMCCFlow/DonationCmccFlow',
                data: {
                    send_phone_num: send_phone_num,
                    vcode: vcode,
                    id: id
                },
                load: function (json) {
                    if (json.ResultCode == 1000) {
                        document.getElementById('loadingImg').style.display = 'none';
                        ai.confirm(json.Message, '返回', function () {
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

        } else {
            ai.alert('电话号码格式不对');
            GetVCode();//刷新验证码
        }
    })
}

//生成验证码方法
function GetVCode() {
    var baseurl = ai.ajaxTool.baseurl1;
    var token = localStorage.lnyptoken;
    var codetype = "donation";
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
