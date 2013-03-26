/**
*
*Ajax模块
*
**/
cnGame.register("cnGame.ajax", function(cg) {
    var activeXString; //为IE特定版本保留的activeX字符串
    var onXHRload = function(xhr, options) {
        return function(eve) {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.state < 300) || xhr.status == 304) {
                    var onSuccess = options.onSuccess;
                    onSuccess && onSuccess();
                }
                else {
                    var onError = options.onError;
                    onError && onError();

                }
            }
        }
    };
    /**
    *生成XMLHttpRequest对象
    **/
    this.creatXHR = function() {
        if (!cg.core.isUndefined(XMLHttpRequest)) {
            return new XMLHttpRequest();
        }
        else if (!cg.core.isUndefined(ActiveXObject)) {
            if (!cg.core.isString(activeXString)) {
                var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
                for (var i = 0, len = versions.length; i < len; i++) {
                    try {
                        var xhr = new ActiveXObject(versions[i]);
                        activeXString = versions[i];
                        return xhr;
                    }
                    catch (e) {
                    }
                }
            }
            return new ActiveXObject(activeXString);
        }
    }
    /**
    *发送请求
    **/
    this.request = function(options) {
        var defaultObj = {
            type: "get"
        };
        cg.core.extend(defaultObj, options);
        var type = options.type;
        var xhr = this.creatXHR();

        cg.core.bindHandler(xhr, "readystatechange", function(eve) {//资源加载完成回调函数
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.state < 300) || xhr.status == 304) {
                    var onSuccess = options.onSuccess;
                    onSuccess && onSuccess();
                }
                else {
                    var onError = options.onError;
                    onError && onError();

                }
            }
        });

        var requestOpt = options.requestOpt;
        var url = options.url;

        if (type == "get") {//get请求数据处理
            if (url.indexOf("?") < 0) {
                url += "?";
            }
            else {
                url += "&";
            }

            for (name in requestOpt) {
                if (requestOpt.hasOwnProperty(name)) {
                    url += encodeURIComponent(name) + "=" + encodeURIComponent(requestOpt[name]) + "&";
                    url = url.slice(0, -1);
                    xhr.open(type, url, true);
                    xhr.send(null);
                }
            }
        }
        else if (type == "post") {//post请求数据处理
            var _requestOpt = {}
            for (name in requestOpt) {
                if (requestOpt.hasOwnProperty(name)) {
                    _requestOpt[encodeURIComponent(name)] = encodeURIComponent(requestOpt[name]);
                }
            }
            xhr.open(type, url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(_requestOpt);
        }
    }

});