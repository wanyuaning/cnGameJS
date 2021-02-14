(function (W, U) {
    var _cnGame = {
        init: function (id, options) {
            options = options || {};

            this.canvas = this.core.$(id || "canvas");
            this.context = this.canvas.getContext("2d");

            this.width = options.width || 800;
            this.height = options.height || 600;

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.title = this.core.$t("title")[0];

            var canvasPos = this.core.getElementPos(this.canvas);
            this.x = canvasPos[0] || 0;
            this.y = canvasPos[1] || 0;
            this.canvas.style.left = this.x + "px";
            this.canvas.style.top = this.y + "px";
        },
        register: function (ns, fn) {
            var parent = W,
                nsArr = ns.split(".");
            for (var i = 0; i < nsArr.length; i++) {
                var key = nsArr[i];
                typeof parent[key] == "undefined" && (parent[key] = {});
                parent = parent[key];
            }
            fn && fn.call(parent, this);
            return parent;
        },
        clean: function () {
            this.context.clearRect(this.width, this.height);
        },
        core: {
            $: (id) => document.getElementById(id),
            $t: (tagName, parent) => {
                parent = parent || document;
                return parent.getElementsByTagName(tagName);
            },
            $c(className, parent) {
                var allElements = this.$t("*", parent),
                    matchResult = [];
                parent = parent || document;
                className = " " + className + " ";
                for (var i = 0; i < allElements.length; i++) {
                    var el = allElements[i],
                        classProperty = " " + el.className + " ";
                    classProperty.indexOf(className) > -1 &&
                        matchResult.push(el);
                }
                return matchResult;
            },
            // 获取元素在页面中的位置
            getElementPos: (el) => {
                var left = 0,
                    top = 0;
                // 当存在 定位父元素 offsetLeft是相对于它的
                while (el.offsetParent) {
                    left += el.offsetLeft;
                    top += el.offsetTop;
                    el = el.offsetParent;
                }
                return [left, top];
            },
            bind: (function () {
                if (window.addEventListener) {
                    return function (el, type, handler) {
                        el.addEventListener(type, handler, false);
                    };
                } else if (window.attachEvent) {
                    return function (el, type, handler) {
                        el.attachEvent("on" + type, handler);
                    };
                }
            })(),
            unbind: (function () {
                if (window.removeEventListerner) {
                    return function (el, type, handler) {
                        el.removeEventListerner(type, handler, false);
                    };
                } else if (window.detachEvent) {
                    return function (el, type, handler) {
                        el.detachEvent("on" + type, handler);
                    };
                }
            })(),
            getEvent: (ev) => ev || W.event,
            getTarget: function (ev) {
                ev = this.getEvent(ev);
                return ev.target || ev.srcElement;
            },
            preventDefault: function (ev) {
                ev.preventDefault
                    ? ev.preventDefault()
                    : (ev.returnValue = false);
            },
            getComputedStyle: (function () {
                var body = document.body || document.documentElement;
                if (body.currentStyle) {
                    return function (el) {
                        return el.currentStyle;
                    };
                } else if (document.defaultView.getComputedStyle) {
                    return function (el) {
                        return document.defaultView.getComputedStyle(el, null);
                    };
                }
            })(),
            isUndefined: (x) => typeof x === "undefined",
            isArray: (elem) =>
                Object.prototype.toString.call(elem) === "[object Array]",
            isObject: (elem) => elem === Object(elem),
            isString: (elem) =>
                Object.prototype.toString.call(elem) === "[object String]",
            isNum: (elem) =>
                Object.prototype.toString.call(elem) === "[object Number]",
            extend: function (destination, source, isCover) {
                var isUndefined = this.isUndefined;
                isUndefined(isCover) && (isCover = true);
                for (var name in source) {
                    if (isCover || isUndefined(destination[name])) {
                        destination[name] = source[name];
                    }
                }
                return destination;
            },
            inherit: function (child, parent) {
                var func = function () {};
                func.prototype = parent.prototype;
                child.prototype = new func();
                child.prototype.constructor = child;
                child.prototype.parent = parent;
            },
        },
    };
    W["cnGame"] = _cnGame;

    /**
     * 资源加载器
     **/
    cnGame.register("cnGame", function (cg) {
        var FILE_TYPE = {
            json: "json",
            wav: "audio",
            mp3: "audio",
            ogg: "audio",
            png: "image",
            jpg: "image",
            jpeg: "image",
            gif: "image",
            bmp: "image",
            tiff: "image",
        };
        var load = function (loader, type) {
            return function () {
                loader.count++;
                loader.images[this.srcHold] = this;
                this.onLoad = null; //资源的onLoad执行一次后销毁

                loader.onLoad && loader.onLoad(loader.count, loader.total);
                if (loader.count === loader.total) {
                    loader.count = 0;

                    if (loader.gameObj && loader.gameObj.initialize) {
                        loader.gameObj.initialize(loader.startOptions);
                        if (cg.loop && !cg.loop.stop) {
                            //结束上一个循环
                            cg.loop.end();
                        }
                        cg.loop = new cg.GameLoop(loader.gameObj); //开始新游戏循环
                        cg.loop.start();
                    }
                }
            };
        };
        this.loader = {
            total: 0, //图片总数
            count: 0, //图片已加载数
            images: {}, //加载完成的资源

            /**
             * gameObj {
             *     initialize: function (startOptions) {console.log("资源加载完成，游戏开始！")},
             * }
             * options {
             *     srcArray: [] 资源列表
             *     onLoad: function(count, total){} 第个资源加载完成回调 可获取进度
             *     startOptions  游戏开始需要的初始化参数
             * }
             *
             * 属性
             * images:{'path': 资源对象} 可通过 cnGame.loader.images['path']访问
             **/
            start: function (gameObj, options) {
                var srcArr = options.srcArray;
                this.gameObj = gameObj;
                this.startOptions = options.startOptions;
                this.onLoad = options.onLoad;
                //cg.spriteList.clean();

                if (cg.core.isArray(srcArr)) {
                    this.total = srcArr.length;
                    for (var i = 0; i < srcArr.length; i++) {
                        var path = srcArr[i],
                            suffix = srcArr[i].split(".")[1],
                            type = FILE_TYPE[suffix];
                        switch (type) {
                            case "image":
                                var img = new Image();
                                cg.core.bind(img, "load", load(this, type));
                                img.src = path; // 默认情况下浏览器会把src参数转换成完整的图片路径
                                img.srcHold = path; // 原始的src参数
                                break;
                            case "audio":
                                var ado = new Audio(path);
                                cg.core.bind(ado, "canplay", load(this, type));
                                ado.onload = load(this, type);
                                ado.src = path;
                                ado.srcHold = path;
                                break;
                        }
                    }
                }
            },
        };
    });
})(window, undefined);
