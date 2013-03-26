/**
*
*基本工具函数模块
*
**/
cnGame.register("cnGame.core", function(cg) {
    /**
    按id获取元素
    **/
    this.$ = function(id) {
        return document.getElementById(id);
    };
    /**
    按标签名获取元素
    **/
    this.$$ = function(tagName, parent) {
        parent = parent || document;
        return parent.getElementsByTagName(tagName);
    };
     /**
    按标签名创建元素
    **/
    this.$$$ = function(tagName) {
        return document.createElement(tagName);
    };
    /**
    按类名获取元素
    **/
    this.$Class = function(className, parent) {
        var arr = [], result = [];
        parent = parent || document;
        arr = this.$$("*");
        for (var i = 0, len = arr.length; i < len; i++) {
            if ((" " + arr[i].className + " ").indexOf(" " + className + " ") > 0) {
                result.push(arr[i]);
            }
        }
        return result;
    };
    /**
    事件绑定
    **/
    this.bindHandler = (function() {

        if (window.addEventListener) {
            return function(elem, type, handler) {
                elem.addEventListener(type, handler, false);
            }
        }
        else if (window.attachEvent) {
            return function(elem, type, handler) {
                elem.attachEvent("on" + type, handler);
            }
        }
    })();
    /**
    事件解除
    **/
    this.removeHandler = (function() {
        if (window.addEventListener) {
            return function(elem, type, handler) {
                elem.removeEventListener(type, handler, false);
            }
        }
        else if (window.attachEvent) {
            return function(elem, type, handler) {
                elem.detachEvent("on" + type, handler);
            }
        }
    })();
    /**
    获取事件对象
    **/
    this.getEventObj = function(eve) {
        return eve || win.event;
    };
    /**
    获取事件目标对象
    **/
    this.getEventTarget = function(eve) {
        var eve = this.getEventObj(eve);
        return eve.target || eve.srcElement;
    };
    /**
    禁止默认行为
    **/
    this.preventDefault = function(eve) {
        if (eve.preventDefault) {
            eve.preventDefault();
        }
        else {
            eve.returnValue = false;
        }

    };
    /**
    是否为undefined
    **/
    this.isUndefined = function(elem) {
        return typeof elem === 'undefined';
    };
    /**
    是否为数组
    **/
    this.isArray = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Array]";
    };
    /**
    是否为Object类型
    **/
    this.isObject = function(elem) {
        return elem === Object(elem);
    };
    /**
    是否为字符串类型
    **/
    this.isString = function(elem) {
        return Object.prototype.toString.call(elem) === "[object String]";
    };
    /**
    是否为数值类型
    **/
    this.isNum = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Number]";
    };
    /**
    是否为function
    **/
    this.isFunction = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Function]";
    };
    /**
    *复制对象属性
    **/
    this.extend = function(destination, source, isCover) {
        var isUndefined = this.isUndefined;
        (isUndefined(isCover)) && (isCover = true);
        for (var name in source) {
            if (isCover || isUndefined(destination[name])) {
                destination[name] = source[name];
            }

        }
        return destination;
    };

});