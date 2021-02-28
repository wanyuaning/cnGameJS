/**
*
* name:cnGame.js	
*`author:cson
*`date:2012-2-7
*`version:1.0
*
**/	

(function(win, undefined) {
    var canvasPos;
    /**
    *��ȡcanvas��ҳ���λ��
    **/
    var getCanvasPos = function(canvas) {
        var left = 0;
        var top = 0;
        while (canvas.offsetParent) {
            left += canvas.offsetLeft;
            top += canvas.offsetTop;
            canvas = canvas.offsetParent;

        }
        return [left, top];

    }

    var _cnGame = {
        /**
        *��ʼ��
        **/
        init: function(id, options) {
            options = options || {};
            this.canvas = this.core.$(id || "canvas");
            this.context = this.canvas.getContext('2d');
            this.width = options.width || 800;
            this.height = options.height || 600;
            this.title = this.core.$$('title')[0];
            canvasPos = getCanvasPos(this.canvas);
            this.x = canvasPos[0] || 0;
            this.y = canvasPos[1] || 0;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.left = this.x + "px";
            this.canvas.style.top = this.y + "px";

        },
        /**
        *���������ռ�,��ִ����Ӧ����
        **/
        register: function(nameSpace, func) {
            var nsArr = nameSpace.split(".");
            var parent = win;
            for (var i = 0, len = nsArr.length; i < len; i++) {
                (typeof parent[nsArr[i]] == 'undefined') && (parent[nsArr[i]] = {});
                parent = parent[nsArr[i]];
            }
            if (func) {
                func.call(parent, this);
            }
            return parent;
        },
        /**
        *�������
        **/
        clean: function() {
            this.context.clearRect(this.width, this.height);
        }




    }


    win["cnGame"] = _cnGame;





    /**
    *
    *�������ߺ���ģ��
    *
    **/
    cnGame.register("cnGame.core", function(cg) {
        /**
        ��id��ȡԪ��
        **/
        this.$ = function(id) {
            return document.getElementById(id);
        };
        /**
        ����ǩ����ȡԪ��
        **/
        this.$$ = function(tagName, parent) {
            parent = parent || document;
            return parent.getElementsByTagName(tagName);
        };
        /**
        ��������ȡԪ��
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
        �¼���
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
        �¼����
        **/
        this.removeHandler = (function() {
            if (window.removeEventListerner) {
                return function(elem, type, handler) {
                    elem.removeEventListerner(type, handler, false);

                }
            }
            else if (window.detachEvent) {
                return function(elem, type, handler) {
                    elem.detachEvent("on" + type, handler);
                }
            }
        })();
        /**
        ��ȡ�¼�����
        **/
        this.getEventObj = function(eve) {
            return eve || win.event;
        };
        /**
        ��ȡ�¼�Ŀ�����
        **/
        this.getEventTarget = function(eve) {
            var eve = this.getEventObj(eve);
            return eve.target || eve.srcElement;
        };
        /**
        ��ֹĬ����Ϊ
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
        ��ȡ����������ʽ
        **/
        this.getComputerStyle = (function() {
            var body = document.body || document.documentElement;
            if (body.currentStyle) {
                return function(elem) {
                    return elem.currentStyle;
                }
            }
            else if (document.defaultView.getComputedStyle) {
                return function(elem) {
                    return document.defaultView.getComputedStyle(elem, null);
                }
            }

        })();
        /**
        �Ƿ�Ϊundefined
        **/
        this.isUndefined = function(elem) {
            return typeof elem === 'undefined';
        },
        /**
        �Ƿ�Ϊ����
        **/
		this.isArray = function(elem) {
		    return Object.prototype.toString.call(elem) === "[object Array]";
		};
        /**
        �Ƿ�ΪObject����
        **/
        this.isObject = function(elem) {
            return elem === Object(elem);
        };
        /**
        �Ƿ�Ϊ�ַ�������
        **/
        this.isString = function(elem) {
            return Object.prototype.toString.call(elem) === "[object String]";
        };
        /**
        �Ƿ�Ϊ��ֵ����
        **/
        this.isNum = function(elem) {
            return Object.prototype.toString.call(elem) === "[object Number]";
        };
        /**
        *���ƶ�������
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
        /**
        *ԭ�ͼ̳ж���
        **/
        this.inherit = function(child, parent) {
            var func = function() { };
            func.prototype = parent.prototype;
            child.prototype = new func();
            child.prototype.constructor = child;
            child.prototype.parent = parent;
        };

    });

    /**
    *
    *Ajaxģ��
    *
    **/
    cnGame.register("cnGame.ajax", function(cg) {
        var activeXString; //ΪIE�ض��汾������activeX�ַ���
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
        }


        /**
        *����XMLHttpRequest����
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
        *��������
        **/
        this.request = function(options) {
            var defaultObj = {
                type: "get"
            };
            cg.core.extend(defaultObj, options);
            var type = options.type;
            var xhr = this.creatXHR();

            cg.core.bindHandler(xhr, "readystatechange", function(eve) {//��Դ������ɻص�����
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

            if (type == "get") {//get�������ݴ���
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
            else if (type == "post") {//post�������ݴ���
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

    /**
    *
    *��Դ������
    *
    **/
    cnGame.register("cnGame", function(cg) {

        var file_type = {}
        file_type["js"] = "js"
        file_type["json"] = "json"
        file_type["wav"] = "audio"
        file_type["mp3"] = "audio"
        file_type["ogg"] = "audio"
        file_type["png"] = "image"
        file_type["jpg"] = "image"
        file_type["jpeg"] = "image"
        file_type["gif"] = "image"
        file_type["bmp"] = "image"
        file_type["tiff"] = "image"
        var postfix_regexp = /\.([a-zA-Z0-9]+)/;
        /**
        *��Դ������ϵĴ�������
        **/
        var resourceLoad = function(self, type) {
            return function() {
                self.loadedCount += 1;
                type == "image" && (self.loadedImgs[this.srcPath] = this);
                type == "audio" && (self.loadedAudios[this.srcPath] = this);
                this.onLoad = null; 				//��֤ͼƬ��onLoadִ��һ�κ�����
                self.loadedPercent = Math.floor(self.loadedCount / self.sum * 100);
                self.onLoad && self.onLoad(self.loadedPercent);
                if (self.loadedPercent === 100) {
                    self.loadedCount = 0;
                    self.loadedPercent = 0;
                    type == "image" && (self.loadingImgs = {});
                    type == "audio" && (self.loadingAudios = {});
                    if (self.gameObj && self.gameObj.initialize) {
                        self.gameObj.initialize(self.startOptions);
                        if (cg.loop && !cg.loop.stop) {//������һ��ѭ��
                            cg.loop.end();
                        }
                        cg.loop = new cg.GameLoop(self.gameObj); //��ʼ����Ϸѭ��
                        cg.loop.start();
                    }
                }
            }
        }

        /**
        *ͼ�������
        **/
        var loader = {
            sum: 0, 		//ͼƬ����
            loadedCount: 0, //ͼƬ�Ѽ�����
            loadingImgs: {}, //δ����ͼƬ����
            loadedImgs: {}, //�Ѽ���ͼƬ����
            loadingAudios: {}, //δ������Ƶ����
            loadedAudios: {}, //�Ѽ�����Ƶ����
            /**
            *ͼ����أ�֮��������Ϸ
            **/
            start: function(gameObj, options) {//options:srcArray,onload
                var srcArr = options.srcArray;
                this.gameObj = gameObj;
                this.startOptions = options.startOptions; //��Ϸ��ʼ��Ҫ�ĳ�ʼ������
                this.onLoad = options.onLoad;
                this.sum = 0;
                cg.spriteList.clean();

                if (cg.core.isArray(srcArr) || cg.core.isObject(srcArr)) {

                    for (var i in srcArr) {
                        if (srcArr.hasOwnProperty(i)) {
                            this.sum++;
                            var path = srcArr[i];
                            var suffix = srcArr[i].substring(srcArr[i].lastIndexOf(".") + 1);
                            var type = file_type[suffix];
                            if (type == "image") {
                                this.loadingImgs[path] = new Image();
                                cg.core.bindHandler(this.loadingImgs[path], "load", resourceLoad(this, type));
                                this.loadingImgs[path].src = path;
                                this.loadingImgs[path].srcPath = path; //û�о����Զ��任��src
                            }
                            else if (type == "audio") {
                                this.loadingAudios[path] = new Audio(path);
                                cg.core.bindHandler(this.loadingAudios[path], "canplay", resourceLoad(this, type));
                                this.loadingAudios[path].onload = resourceLoad(this, type);
                                this.loadingAudios[path].src = path;
                                this.loadingAudios[path].srcPath = path; //û�о����Զ��任��src
                            }
                            else if (type == "js") {//����ǽű������غ�ִ��
                                var head = cg.core.$$("head")[0];
                                var script = document.createElement("script");
                                head.appendChild(script);
                                cg.core.bindHandler(script, "load", resourceLoad(this, type));
                                script.src = path;

                            }
                        }
                    }

                }

            }

        }


        this.loader = loader;
    });




    /**
    *
    *canvas������״����
    *
    **/
    cnGame.register("cnGame.shape", function(cg) {

        /**
        *���ζ���
        **/
        var rect = function(options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(options);
            }
            this.init(options);
        }
        rect.prototype = {
            /**
            *��ʼ��
            **/
            init: function(options) {
                /**
                *Ĭ��ֵ����
                **/
                var defaultObj = {
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    style: "red",
                    isFill: true

                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.setOptions(options);
            },
            /**
            *���ò���
            **/
            setOptions: function(options) {
                this.x = options.x || this.x;
                this.y = options.y || this.y;
                this.width = options.width || this.width;
                this.height = options.height || this.height;
                this.style = options.style || this.style;
                this.isFill = options.isFill || this.isFill;
                this.leftTop = [this.x, this.y];
                this.rightTop = [this.x + this.width, this.y];
                this.leftBottom = [this.x, this.y + this.height];
                this.rightBottom = [this.x + this.width, this.y + this.height];
                this.right = this.width + this.x;
                this.bottom = this.height + this.y;
            },
            /**
            *���ƾ���
            **/
            draw: function() {
                var context = cg.context;
                if (this.isFill) {
                    context.fillStyle = this.style;
                    context.fillRect(this.x, this.y, this.width, this.height);
                }
                else {
                    context.strokeStyle = this.style;
                    context.strokeRect(this.x, this.y, this.width, this.height);
                }

                return this;

            },
            /**
            *�������ƶ�һ������
            **/
            move: function(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                this.x += dx;
                this.y += dy;
                resetRightBottom(this);
                return this;
            },
            /**
            *�������ƶ����ض�λ��
            **/
            moveTo: function(x, y) {
                x = x || this.x;
                y = y || this.y;
                this.x = x;
                this.y = y;
                resetRightBottom(this);
                return this;
            },
            /**
            *�����θı�һ����С
            **/
            resize: function(dWidth, dHeight) {
                dWidth = dWidth || 0;
                dHeight = dHeight || 0;
                this.width += dWidth;
                this.height += dHeight;
                resetRightBottom(this);
                return this;

            },
            /**
            *�����θı䵽�ض���С
            **/
            resizeTo: function(width, height) {
                width = width || this.width;
                height = height || this.height;
                this.width = width;
                this.height = height;
                resetRightBottom(this);
                return this;
            }
        }

        /**
        *Բ�ζ���
        **/
        var circle = function(options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(options);
            }
            this.init(options);
        }
        circle.prototype = {
            /**
            *��ʼ��
            **/
            init: function(options) {
                /**
                *Ĭ��ֵ����
                **/
                var defaultObj = {
                    x: 100,
                    y: 100,
                    r: 100,
                    startAngle: 0,
                    endAngle: Math.PI * 2,
                    antiClock: false,
                    style: "red",
                    isFill: true
                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.setOptions(options);

            },
            /**
            *���ò���
            **/
            setOptions: function(options) {
                this.x = options.x || this.x;
                this.y = options.y || this.y;
                this.r = options.r || this.r;
                this.startAngle = options.startAngle || this.startAngle;
                this.endAngle = options.endAngle || this.endAngle;
                this.antiClock = options.antiClock || this.antiClock;
                this.isFill = options.isFill || this.isFill;
                this.style = options.style || this.style;
            },
            /**
            *����Բ��
            **/
            draw: function() {
                var context = cg.context;
                context.beginPath();
                context.arc(this.x, this.y, this.r, this.startAngle, this.endAngle, this.antiClock);
                context.closePath();
                if (this.isFill) {
                    context.fillStyle = this.style;
                    context.fill();
                }
                else {
                    context.strokeStyle = this.style;
                    context.stroke();
                }

            },
            /**
            *��Բ���ƶ�һ������
            **/
            move: function(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                this.x += dx;
                this.y += dy;
                return this;
            },
            /**
            *��Բ���ƶ����ض�λ��
            **/
            moveTo: function(x, y) {
                x = x || this.x;
                y = y || this.y;
                this.x = x;
                this.y = y;
                return this;
            },
            /**
            *��Բ�θı�һ����С
            **/
            resize: function(dr) {
                dr = dr || 0;
                this.r += dr;
                return this;

            },
            /**
            *��Բ�θı䵽�ض���С
            **/
            resizeTo: function(r) {
                r = r || this.r;
                this.r = r;
                return this;
            }
        }
        /**
        *��Բ�θı䵽�ض���С
        **/
        var text = function(text, options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(text, options);
            }
            this.init(text, options);

        }
        text.prototype = {
            /**
            *��ʼ��
            **/
            init: function(text, options) {
                /**
                *Ĭ��ֵ����
                **/
                var defaultObj = {
                    x: 100,
                    y: 100,
                    style: "red",
                    isFill: true,
					context:cg.context

                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.setOptions(options);
                this.text = text;
            },
            /**
            *����
            **/
            draw: function() {
                var context = this.context;
                (!cg.core.isUndefined(this.font)) && (context.font = this.font);
                (!cg.core.isUndefined(this.textBaseline)) && (context.textBaseline = this.textBaseline);
                (!cg.core.isUndefined(this.textAlign)) && (context.textAlign = this.textAlign);
                (!cg.core.isUndefined(this.maxWidth)) && (context.maxWidth = this.maxWidth);
                if (this.isFill) {
                    context.fillStyle = this.style;
                    this.maxWidth ? context.fillText(this.text, this.x, this.y, this.maxWidth) : context.fillText(this.text, this.x, this.y);
                }
                else {
                    context.strokeStyle = this.style;
                    this.maxWidth ? context.strokeText(this.text, this.x, this.y, this.maxWidth) : context.strokeText(this.text, this.x, this.y);
                }
            },
            /**
            *���ò���
            **/
            setOptions: function(options) {
				this.context=options.context||this.context;
                this.x = options.x || this.x;
                this.y = options.y || this.y;
                this.maxWidth = options.maxWidth || this.maxWidth;
                this.font = options.font || this.font;
                this.textBaseline = options.textBaseline || this.textBaseline;
                this.textAlign = options.textAlign || this.textAlign;
                this.isFill = options.isFill || this.isFill;
                this.style = options.style || this.style;

            }
        }

        this.Text = text;
        this.Rect = rect;
        this.Circle = circle;

    });



    /**
    *
    *�����¼ģ��
    *
    **/
    cnGame.register("cnGame.input", function(cg) {

        this.mouseX = 0;
        this.mouseY = 0;
        /**
        *��¼�����canvas�ڵ�λ��
        **/
        var recordMouseMove = function(eve) {
            var pageX, pageY, x, y;
            eve = cg.core.getEventObj(eve);
            pageX = eve.pageX || eve.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
            pageY = eve.pageY || eve.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
            cg.input.mouseX = pageX - cg.x;
            cg.input.mouseY = pageY - cg.y;

        }

        cg.core.bindHandler(window, "mousemove", recordMouseMove);

        /**
        *�����µļ��ļ���
        **/
        var pressed_keys = {};
        /**
        *Ҫ���ֹĬ����Ϊ�ļ��ļ���
        **/
        var preventDefault_keys = {};
        /**
        *���̰��´����Ĵ�������
        **/
        var keydown_callbacks = {};
        /**
        *���̵��𴥷��Ĵ�������
        **/
        var keyup_callbacks = {};


        /**
        *���̰�������ͼ���
        **/
        var k = [];
        k[8] = "backspace"
        k[9] = "tab"
        k[13] = "enter"
        k[16] = "shift"
        k[17] = "ctrl"
        k[18] = "alt"
        k[19] = "pause"
        k[20] = "capslock"
        k[27] = "esc"
        k[32] = "space"
        k[33] = "pageup"
        k[34] = "pagedown"
        k[35] = "end"
        k[36] = "home"
        k[37] = "left"
        k[38] = "up"
        k[39] = "right"
        k[40] = "down"
        k[45] = "insert"
        k[46] = "delete"

        k[91] = "leftwindowkey"
        k[92] = "rightwindowkey"
        k[93] = "selectkey"
        k[106] = "multiply"
        k[107] = "add"
        k[109] = "subtract"
        k[110] = "decimalpoint"
        k[111] = "divide"

        k[144] = "numlock"
        k[145] = "scrollock"
        k[186] = "semicolon"
        k[187] = "equalsign"
        k[188] = "comma"
        k[189] = "dash"
        k[190] = "period"
        k[191] = "forwardslash"
        k[192] = "graveaccent"
        k[219] = "openbracket"
        k[220] = "backslash"
        k[221] = "closebracket"
        k[222] = "singlequote"

        var numpadkeys = ["numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9"]
        var fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"]
        var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
        for (var i = 0; numbers[i]; i++) { k[48 + i] = numbers[i] }
        for (var i = 0; letters[i]; i++) { k[65 + i] = letters[i] }
        for (var i = 0; numpadkeys[i]; i++) { k[96 + i] = numpadkeys[i] }
        for (var i = 0; fkeys[i]; i++) { k[112 + i] = fkeys[i] }

        /**
        *��¼���̰��µļ�
        **/
        var recordPress = function(eve) {
            eve = cg.core.getEventObj(eve);
            var keyName = k[eve.keyCode];
            pressed_keys[keyName] = true;
            if (keydown_callbacks[keyName]) {
                for (var i = 0, len = keydown_callbacks[keyName].length; i < len; i++) {
                    keydown_callbacks[keyName][i]();

                }

            }
            if (keydown_callbacks["allKeys"]) {
                for (var i = 0, len = keydown_callbacks["allKeys"].length; i < len; i++) {
                    keydown_callbacks["allKeys"][i]();

                }
            }
            if (preventDefault_keys[keyName]) {
                cg.core.preventDefault(eve);
            }
        }
        /**
        *��¼�����ɿ��ļ�
        **/
        var recordUp = function(eve) {
            eve = cg.core.getEventObj(eve);
            var keyName = k[eve.keyCode];
            pressed_keys[keyName] = false;
            if (keyup_callbacks[keyName]) {
                for (var i = 0, len = keyup_callbacks[keyName].length; i < len; i++) {
                    keyup_callbacks[keyName][i]();

                }
            }
            if (keyup_callbacks["allKeys"]) {
                for (var i = 0, len = keyup_callbacks["allKeys"].length; i < len; i++) {
                    keyup_callbacks["allKeys"][i]();

                }
            }
            if (preventDefault_keys[keyName]) {
                cg.core.preventDefault(eve);
            }
        }
        cg.core.bindHandler(window, "keydown", recordPress);
        cg.core.bindHandler(window, "keyup", recordUp);

        /**
        *�ж�ĳ�����Ƿ���
        **/
        this.isPressed = function(keyName) {
            return !!pressed_keys[keyName];
        };
        /**
        *��ֹĳ�������µ�Ĭ����Ϊ
        **/
        this.preventDefault = function(keyName) {
            if (cg.core.isArray(keyName)) {
                for (var i = 0, len = keyName.length; i < len; i++) {
                    arguments.callee.call(this, keyName[i]);
                }
            }
            else {
                preventDefault_keys[keyName] = true;
            }
        }
        /**
        *�󶨼��̰����¼�
        **/
        this.onKeyDown = function(keyName, handler) {
            keyName = keyName || "allKeys";
            if (cg.core.isUndefined(keydown_callbacks[keyName])) {
                keydown_callbacks[keyName] = [];
            }
            keydown_callbacks[keyName].push(handler);

        }
        /**
        *�󶨼��̵����¼�
        **/
        this.onKeyUp = function(keyName, handler) {
            keyName = keyName || "allKeys";
            if (cg.core.isUndefined(keyup_callbacks[keyName])) {
                keyup_callbacks[keyName] = [];
            }
            keyup_callbacks[keyName].push(handler);

        }
        /**
        *������̰����¼���������
        **/
        this.clearDownCallbacks = function(keyName) {
            if (keyName) {
                keydown_callbacks[keyName] = [];
            }
            else {
                keydown_callbacks = {};
            }

        }
        /**
        *������̵����¼���������
        **/
        this.clearUpCallbacks = function(keyName) {
            if (keyName) {
                keyup_callbacks[keyName] = [];
            }
            else {
                keyup_callbacks = {};
            }

        }
    });

    /**
    *
    *��ײ���
    *
    **/
    cnGame.register("cnGame.collision", function(cg) {
        /**
        *��;��μ����ײ
        **/
        this.col_Point_Rect = function(pointX, pointY, rectObj) {
            return (pointX >= rectObj.x && pointX <= rectObj.right && pointY >= rectObj.y && pointY <= rectObj.bottom);
        }
        /**
        *���κ;��μ����ײ
        **/
        this.col_Between_Rects = function(rectObjA, rectObjB) {

            return ((rectObjA.right >= rectObjB.x && rectObjA.right <= rectObjB.right || rectObjA.x >= rectObjB.x && rectObjA.x <= rectObjB.right) && (rectObjA.bottom >= rectObjB.y && rectObjA.bottom <= rectObjB.bottom || rectObjA.y <= rectObjB.bottom && rectObjA.bottom >= rectObjB.y));
        }
        /**
        *���Բ�μ����ײ
        **/
        this.col_Point_Circle = function(pointX, pointY, circleObj) {
            return (Math.pow((pointX - circleObj.x), 2) + Math.pow((pointY - circleObj.y), 2) < Math.pow(circleObj.r, 2));

        }
        /**
        *Բ�κ�Բ�μ����ײ
        **/
        this.col_between_Circles = function(circleObjA, circleObjB) {
            return (Math.pow((circleObjA.x - circleObjB.x), 2) + Math.pow((circleObjA.y - circleObjB.y), 2) < Math.pow((circleObjA.r + circleObjB).r, 2));

        }

    });

    /**
    *
    *����
    *
    **/
    cnGame.register("cnGame", function(cg) {

        /**
        *֡������
        **/
        var path = 1;

        /**
        *��ȡ֡����
        **/
        var caculateFrames = function(options) {
            var frames = [];
            var width = options.width;
            var height = options.height;
            var beginX = options.beginX;
            var beginY = options.beginY;
            var frameSize = options.frameSize;
            var direction = options.direction;
            var x, y;
            /* ����ÿһ֡�ľ�ȷλ�� */
            if (direction == "right") {
                for (var y = beginY; y < height; y += frameSize[1]) {
                    for (var x = beginX; x < width; x += frameSize[0]) {
                        var frame = {};
                        frame.x = x;
                        frame.y = y;
                        frames.push(frame);

                    }

                }
            }
            else {
                for (var x = beginX; x < width; x += frameSize[0]) {
                    for (var y = beginY; y < height; y += frameSize[1]) {
                        var frame = {};
                        frame.x = x;
                        frame.y = y;
                        frames.push(frame);

                    }

                }

            }
            return frames;

        }
        /**
        *������֡ͼ��Ĵ�ͼƬ
        **/
        spriteSheet = function(id, src, options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(id, src, options);
            }
            this.init(id, src, options);
        }
        spriteSheet.prototype = {
            /**
            *��ʼ��
            **/
            init: function(id, src, options) {

                /**
                *Ĭ�϶���
                **/
                var defaultObj = {
                    x: 0,
                    y: 0,
                    width: 120,
                    height: 40,
                    frameSize: [40, 40],
                    frameDuration: 100,
                    direction: "right", //������
                    beginX: 0,
                    beginY: 0,
					scale:1,
                    loop: false,
                    bounce: false
                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.id = id; 								//spriteSheet��id
				this.context=options.context||cg.context;	//ʹ�õ������Ķ���Ĭ���ǿ�ܵ�context
                this.src = src; 							//ͼƬ��ַ
                this.x = options.x; 						//����Xλ��
                this.y = options.y; 						//����Yλ��
				this.scale=options.scale;					//���ű�
                this.width = options.width; 				//ͼƬ�Ŀ���
                this.height = options.height; 				//ͼƬ�ĸ߶�
                this.image = cg.loader.loadedImgs[this.src]; //ͼƬ����
                this.frameSize = options.frameSize; 		//ÿ֡�ߴ�
                this.frameDuration = options.frameDuration; //ÿ֡����ʱ��
                this.direction = options.direction; 		//��ȡ֡�ķ��򣨴������һ���ϵ��£�
                this.currentIndex = 0; 					//Ŀǰ֡����
                this.beginX = options.beginX; 				//��ȡͼƬ����ʼλ��X
                this.beginY = options.beginY; 				//��ͼͼƬ����ʼλ��Y
                this.loop = options.loop; 					//�Ƿ�ѭ������
                this.bounce = options.bounce; 				//�Ƿ���������
                this.onFinish = options.onFinish; 			//������Ϻ�Ļص�����
                this.frames = caculateFrames(options); 	//֡��Ϣ����
                this.now = new Date().getTime(); 			//��ǰʱ��
                this.last = new Date().getTime(); 		//��һ֡��ʼʱ��
            },
            /**
            *����֡
            **/
            update: function() {

                this.now = new Date().getTime();
                var frames = this.frames;
                if ((this.now - this.last) >= this.frameDuration) {//���������ڵ���֡��������update
                    var currentIndex = this.currentIndex;
                    var length = this.frames.length;
                    this.last = this.now;

                    if (currentIndex >= length - 1) {
                        if (this.loop) {	//ѭ��
                            return frames[this.currentIndex = 0];
                        }
                        else if (!this.bounce) {//û��ѭ������û��������������ֹͣ�����һ֡
                            this.onFinish && this.onFinish();
                            this.onFinish = undefined;
                            return frames[currentIndex];
                        }
                    }
                    if ((this.bounce) && ((currentIndex >= length - 1 && path > 0) || (currentIndex <= 0 && path < 0))) {	//����
                        path *= (-1);
                    }
                    this.currentIndex += path;

                }
                return frames[this.currentIndex];
            },
            /**
            *�����ض�֡
            **/
            index: function(index) {
                this.currentIndex = index;
                return this.frames[this.currentIndex];
            },
            /**
            *��ȡ��ʱ֡
            **/
            getCurrentFrame: function() {
                return this.frames[this.currentIndex];
            },
            /**
            *���ض�λ�û��Ƹ�֡
            **/
            draw: function() {

                var currentFrame = this.getCurrentFrame();
                var width = this.frameSize[0];
                var height = this.frameSize[1];
               	this.context.drawImage(this.image, currentFrame.x, currentFrame.y, width, height, this.x, this.y, width*this.scale, height*this.scale);
				
            }

        }
        this.SpriteSheet = spriteSheet;

    });

    /**
    *
    *sprite����
    *
    **/
    cnGame.register("cnGame", function(cg) {

        var postive_infinity = Number.POSITIVE_INFINITY;

        var sprite = function(id, options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(id, options);
            }
            this.init(id, options);
        }
        sprite.prototype = {
            /**
            *��ʼ��
            **/
            init: function(options) {

                /**
                *Ĭ�϶���
                **/
                var defaultObj = {
                    x: 0,
                    y: 0,
                    imgX: 0,
                    imgY: 0,
                    width: 32,
                    height: 32,
                    angle: 0,
                    speedX: 0,
                    speedY: 0,
                    rotateSpeed: 0,
                    aR: 0,
                    aX: 0,
                    aY: 0,
                    maxSpeedX: postive_infinity,
                    maxSpeedY: postive_infinity,
                    maxX: postive_infinity,
                    maxY: postive_infinity,
                    minX: -postive_infinity,
                    minY: -postive_infinity,
                    minAngle: -postive_infinity,
                    maxAngle: postive_infinity
                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
				this.context=options.context||cg.context;
                this.x = options.x;
                this.y = options.y;
                this.angle = options.angle;
                this.width = options.width;
                this.height = options.height;
                this.angle = options.angle;
                this.speedX = options.speedX;
                this.speedY = options.speedY;
                this.rotateSpeed = options.rotateSpeed;
                this.aR = options.aR;
                this.aX = options.aX;
                this.aY = options.aY;
                this.maxSpeedX = options.maxSpeedX;
                this.maxSpeedY = options.maxSpeedY;
                this.maxX = options.maxX;
                this.maxY = options.maxY;
                this.maxAngle = options.maxAngle;
                this.minAngle = options.minAngle;
                this.minX = options.minX;
                this.minY = options.minY;
                this.spriteSheetList = {};

                if (options.src) {	//����ͼƬ·��
                    this.setCurrentImage(options.src, options.imgX, options.imgY, options.imgWidth, options.imgHeight);
                }
                else if (options.spriteSheet) {//����spriteSheet����
                    this.addAnimation(options.spriteSheet);
                    setCurrentAnimation(options.spriteSheet);
                }

            },
            /**
            *���ذ�����sprite�ľ��ζ���
            **/
            getRect: function() {
                return new cg.shape.Rect({ x: this.x, y: this.y, width: this.width, height: this.height });

            },
            /**
            *���Ӷ���
            **/
            addAnimation: function(spriteSheet) {
				spriteSheet.relatedSprite=this;
                this.spriteSheetList[spriteSheet.id] = spriteSheet;
            },
            /**
            *���õ�ǰ��ʾ����
            **/
            setCurrentAnimation: function(id) {//�ɴ���id��spriteSheet
                if (!this.isCurrentAnimation(id)) {
                    if (cg.core.isString(id)) {
                        this.spriteSheet = this.spriteSheetList[id];
                        this.image = this.imgX = this.imgY = undefined;
                    }
                    else if (cg.core.isObject(id)) {
                        this.spriteSheet = id;
                        this.addAnimation(id);
                        this.image = this.imgX = this.imgY = undefined;
                    }
                }

            },
            /**
            *�жϵ�ǰ�����Ƿ�Ϊ��id�Ķ���
            **/
            isCurrentAnimation: function(id) {
                if (cg.core.isString(id)) {
                    return (this.spriteSheet && this.spriteSheet.id === id);
                }
                else if (cg.core.isObject(id)) {
                    return this.spriteSheet === id;
                }
            },
            /**
            *���õ�ǰ��ʾͼ��
            **/
            setCurrentImage: function(src, imgX, imgY,imgWidth,imgHeight) {
                if (!this.isCurrentImage(src, imgX, imgY,imgWidth,imgHeight)) {
				
                    imgX = imgX || 0;
                    imgY = imgY || 0;
                    this.image = cg.loader.loadedImgs[src];
                    this.imgX = imgX;
                    this.imgY = imgY;
					this.imgWidth=imgWidth||this.image.width;
					this.imgHeight=imgHeight||this.image.height;
                    this.spriteSheet = undefined;
				

                }
            },
            /**
            *�жϵ�ǰͼ���Ƿ�Ϊ��src��ͼ��
            **/
            isCurrentImage: function(src, imgX, imgY,imgWidth,imgHeight) {
				var image = this.image;
				if(image){
					imgX = imgX || 0;
					imgY = imgY || 0;
					imgWidth=imgWidth||image.width;
					imgHeight=imgHeight||image.height;
					
					
					if (cg.core.isString(src)) {
						return (image.srcPath === src && this.imgX === imgX && this.imgY === imgY&&this.imgWidth === imgWidth && this.imgHeight === imgHeight);
					}
					
				}
				return image==src;
            },
			/**
            *�����ض�֡
            **/
			index:function(index){
				this.spriteSheet&&this.spriteSheet.index(index);		
			},
            /**
            *�����ƶ�����
            **/
            setMovement: function(options) {
                isUndefined = cg.core.isUndefined;
                isUndefined(options.speedX) ? this.speedX = this.speedX : this.speedX = options.speedX;
                isUndefined(options.speedY) ? this.speedY = this.speedY : this.speedY = options.speedY;
                isUndefined(options.rotateSpeed) ? this.rotateSpeed = this.rotateSpeed : this.rotateSpeed = options.rotateSpeed;
                isUndefined(options.aX) ? this.aR = this.aR : this.aR = options.aR;
                isUndefined(options.aX) ? this.aX = this.aX : this.aX = options.aX;
                isUndefined(options.aY) ? this.aY = this.aY : this.aY = options.aY;
                isUndefined(options.maxX) ? this.maxX = this.maxX : this.maxX = options.maxX;
                isUndefined(options.maxY) ? this.maxY = this.maxY : this.maxY = options.maxY;
                isUndefined(options.maxAngle) ? this.maxAngle = this.maxAngle : this.maxAngle = options.maxAngle;
                isUndefined(options.minAngle) ? this.minAngle = this.minAngle : this.minAngle = options.minAngle;
                isUndefined(options.minX) ? this.minX = this.minX : this.minX = options.minX;
                isUndefined(options.minY) ? this.minY = this.minY : this.minY = options.minY;
                isUndefined(options.maxSpeedX) ? this.maxSpeedX = this.maxSpeedX : this.maxSpeedX = options.maxSpeedX;
                isUndefined(options.maxSpeedY) ? this.maxSpeedY = this.maxSpeedY : this.maxSpeedY = options.maxSpeedY;


            },
            /**
            *�����ƶ������ص���ʼֵ
            **/
            resetMovement: function() {
                this.speedX = 0;
                this.speedY = 0;
                this.rotateSpeed = 0;
                this.aX = 0;
                this.aY = 0;
                this.aR = 0;
                this.maxSpeedX = postive_infinity;
                this.maxSpeedY = postive_infinity;
                this.maxX = postive_infinity;
                this.minX = -postive_infinity;
                this.maxY = postive_infinity;
                this.minY = -postive_infinity;
                this.maxAngle = postive_infinity;
                this.minAngle = -postive_infinity;
            },
            /**
            *����λ�ú�֡����
            **/
            update: function(duration) {//duration:��֡��ʱ ��λ����
                this.speedX = this.speedX + this.aX * duration;
                if (this.maxSpeedX < 0) {
                    this.maxSpeedX *= -1;
                }
                if (this.speedX < 0) {
                    this.speedX = Math.max(this.speedX, this.maxSpeedX * -1);
                }
                else {
                    this.speedX = Math.min(this.speedX, this.maxSpeedX);
                }

                this.speedY = this.speedY + this.aY * duration;
                if (this.maxSpeedY < 0) {
                    this.maxSpeedY *= -1;
                }
                if (this.speedY < 0) {
                    this.speedY = Math.max(this.speedY, this.maxSpeedY * -1);
                }
                else {
                    this.speedY = Math.min(this.speedY, this.maxSpeedY);
                }
                this.rotateSpeed = this.rotateSpeed + this.aR * duration;

                this.rotate(this.rotateSpeed).move(this.speedX, this.speedY);

                if (this.spriteSheet) {//����spriteSheet����
                    this.spriteSheet.x = this.x
                    this.spriteSheet.y = this.y;
                    this.spriteSheet.update();
                }
            },
            /**
            *���Ƴ�sprite
            **/
            draw: function() {
                var context = this.context;
                var halfWith;
                var halfHeight;
                if (this.spriteSheet) {
                    this.spriteSheet.x = this.x
                    this.spriteSheet.y = this.y;
                    this.spriteSheet.draw();
                }
                else if (this.image) {
                    context.save()
                    halfWith = this.width / 2;
                    halfHeight = this.height / 2;
                    context.translate(this.x + halfWith, this.y + halfHeight);
                    context.rotate(this.angle * Math.PI / 180 * -1);
			
                    context.drawImage(this.image, this.imgX, this.imgY, this.imgWidth,this.imgHeight, -halfWith, -halfHeight, this.width, this.height);
                    context.restore();
                }

            },
            /**
            *�ƶ�һ������
            **/
            move: function(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                var x = this.x + dx;
                var y = this.y + dy;
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;

            },
            /**
            *�ƶ���ĳ��
            **/
            moveTo: function(x, y) {
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            /**
            *��תһ���Ƕ�
            **/
            rotate: function(da) {
                da = da || 0;
                var angle = this.angle + da;

                this.angle = Math.min(Math.max(this.minAngle, angle), this.maxAngle);
                return this;
            },
            /**
            *��ת��һ���Ƕ�
            **/
            rotateTo: function(a) {
                this.angle = Math.min(Math.max(this.minAngle, a), this.maxAngle);
                return this;

            },
            /**
            *�ı�һ���ߴ�
            **/
            resize: function(dw, dh) {
                this.width += dw;
                this.height += dh;
                return this;
            },
            /**
            *�ı䵽һ���ߴ�
            **/
            resizeTo: function(width, height) {
                this.width = width;
                this.height = height;
                return this;
            }

        }
        this.Sprite = sprite;

    });
    /**
    *
    *sprite�б�
    *
    **/
    cnGame.register("cnGame", function(cg) {

        var spriteList = {
            length: 0,
            add: function(sprite) {
                Array.prototype.push.call(this, sprite);
            },
            remove: function(sprite) {
                for (var i = 0, len = this.length; i < len; i++) {
				
                    if (this[i] === sprite) {
                        Array.prototype.splice.call(this, i, 1);
                        i--;
                        len--;
                    }
                }
            },
            clean: function() {
                for (var i = 0, len = this.length; i < len; i++) {
                    Array.prototype.pop.call(this);
                }
            },
            sort: function(func) {
                Array.prototype.sort.call(this,func);
            }
        }
        this.spriteList = spriteList;
    });

    /**
    *
    *��Ϸѭ��
    *
    **/
    cnGame.register("cnGame", function(cg) {

        var timeId;
        var delay;
        /**
        *ѭ������
        **/
        var loop = function() {
            var self = this;
            return function() {
                var now = new Date().getTime();
                if (!self.pause && !self.stop) {

                    var duration = (now - self.lastTime); //֡��ʱ
                    var spriteList = cg.spriteList;
                    self.loopDuration = (self.startTime - self.now) / 1000;

                    if (self.gameObj.update) {//������Ϸ�����update
                        self.gameObj.update(duration / 1000);
                    }
                    if (self.gameObj.draw) {
                        cg.context.clearRect(0, 0, cg.width, cg.height);
                        self.gameObj.draw(duration / 1000);
                    }
                    for (var i = 0; i < spriteList.length; i++) {//��������sprite
						spriteList[i].update(duration / 1000);                    	
						if(spriteList[i]){
                        	spriteList[i].draw();
						}
                    }

                    if (duration > self.interval) {//����delayʱ��
                        delay = Math.max(1, self.interval - (duration - self.interval));

                    }


                }
                timeId = window.setTimeout(arguments.callee, delay);
                self.lastTime = now;
            }
        }

        var gameLoop = function(gameObj, options) {

            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(gameObj, options);
            }
            this.init(gameObj, options);
        }
        gameLoop.prototype = {
            /**
            *��ʼ��
            **/
            init: function(gameObj, options) {
                /**
                *Ĭ�϶���
                **/
                var defaultObj = {
                    fps: 30
                };
                options = options || {};

                options = cg.core.extend(defaultObj, options);
                this.gameObj = gameObj;
                this.fps = options.fps;
                this.interval = delay = 1000 / this.fps;

                this.pause = false;
                this.stop = true;
            },

            /**
            *��ʼѭ��
            **/
            start: function() {
                if (this.stop) {		//����ǽ���״̬����Կ�ʼ
                    this.stop = false;
                    var now = new Date().getTime();
                    this.startTime = now;
                    this.lastTime = now;
                    this.loopDuration = 0;
                    loop.call(this)();
                }
            }, 	/**
		 *����ѭ��
		**/
            run: function() {
                this.pause = false;
            },
            /**
            *��ͣѭ��
            **/
            pause: function() {
                this.pause = true;
            },
            /**
            *ֹͣѭ��
            **/
            end: function() {
                this.stop = true;
                window.clearTimeout(timeId);
            }


        }
        this.GameLoop = gameLoop;
    });

    /**
    *
    *��ͼ
    *
    **/
    cnGame.register("cnGame", function(cg) {

        var map = function(mapMatrix, options) {

            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(mapMatrix, options);
            }
            this.init(mapMatrix, options);
        }
        map.prototype = {
            /**
            *��ʼ��
            **/
            init: function(mapMatrix, options) {
                /**
                *Ĭ�϶���
                **/
                var defaultObj = {
                    cellSize: [32, 32],   //���������
                    beginX: 0, 	    //��ͼ��ʼx
                    beginY: 0			//��ͼ��ʼy

                };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.mapMatrix = mapMatrix;
                this.cellSize = options.cellSize;
                this.beginX = options.beginX;
                this.beginY = options.beginY;
                this.row = mapMatrix.length; //�ж�����

            },
            /**
            *����map�������map
            **/
            draw: function(options) {//options��{"1":{src:"xxx.png",x:0,y:0},"2":{src:"xxx.png",x:1,y:1}}
                var mapMatrix = this.mapMatrix;
                var beginX = this.beginX;
                var beginY = this.beginY;
                var cellSize = this.cellSize;
                var currentRow;
                var currentCol
                var currentObj;
                var row = this.row;
                var img;
                for (var i = beginY, ylen = beginY + row * cellSize[1]; i < ylen; i += cellSize[1]) {	//���ݵ�ͼ���󣬻���ÿ������
                    currentRow = (i - beginY) / cellSize[1];
                    for (var j = beginX, xlen = beginX + mapMatrix[currentRow].length * cellSize[0]; j < xlen; j += cellSize[0]) {
                        currentCol = (j - beginX) / cellSize[0];
                        currentObj = options[mapMatrix[currentRow][currentCol]];
                        currentObj.x = currentObj.x || 0;
                        currentObj.y = currentObj.y || 0;
                        img = cg.loader.loadedImgs[currentObj.src];
                        cg.context.drawImage(img, currentObj.x, currentObj.y, cellSize[0], cellSize[1], j, i, cellSize[0], cellSize[1]); //�����ض������ͼ��
                    }
                }

            },
            /**
            *��ȡ�ض������ڵ�ͼ�д��ڵķ����ֵ
            **/
            getPosValue: function(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                var isUndefined = cg.core.isUndefined;
                y = Math.floor(y / this.cellSize[1]);
                x = Math.floor(x / this.cellSize[0]);
                if (!isUndefined(this.mapMatrix[y]) && !isUndefined(this.mapMatrix[y][x])) {
                    return this.mapMatrix[y][x];
                }
                return undefined;
            },
            /**
            *��ȡ�ض������ڵ�ͼ�д��ڵķ�������
            **/
            getCurrentIndex: function(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                return [Math.floor(x / this.cellSize[0]), Math.floor(y / this.cellSize[1])];
            },
            /**
            *
            */
            setIndexValue: function(index, value) {
                this.mapMatrix[index[1]][index[0]] = value;

            },
            /**
            *��ȡ�ض������Ƿ�պ�������غ�
            **/
            isMatchCell: function(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                return (x % this.cellSize[0] == 0) && (y % this.cellSize[1] == 0);
            },
            /**
            *���õ�ͼ��Ӧλ�õ�ֵ
            **/
            setPosValue: function(x, y, value) {
                this.mapMatrix[y][x] = value;
            }

        }
        this.Map = map;

    });

    /**
    *
    *����
    *
    **/
    cnGame.register("cnGame", function(cg) {

        /**
        *ʹָ�������ڿ�������view��
        **/
        var inside = function(sprite) {
            var dir = sprite.insideDir;
            if (dir != "y") {
                if (sprite.x < 0) {
                    sprite.x = 0;
                }
                else if (sprite.x > this.width - sprite.width) {
                    sprite.x = this.width - sprite.width;
                }
            }
            if (dir != "x") {
                if (sprite.y < 0) {
                    sprite.y = 0;
                }
                else if (sprite.y > this.height - sprite.height) {
                    sprite.y = this.height - sprite.height;
                }
            }

        }

        var view = function(options) {
            this.init(options);

        }
        view.prototype = {

            /**
            *��ʼ��
            **/
            init: function(options) {
                /**
                *Ĭ�϶���
                **/
                var defaultObj = {
                    width: cg.width,
                    height: cg.height,
                    imgWidth: cg.width,
                    imgHeight: cg.height,
                    x: 0,
                    y: 0

                }
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.player = options.player;
                this.width = options.width;
                this.height = options.height;
                this.imgWidth = options.imgWidth;
                this.imgHeight = options.imgHeight;
                this.centerX = this.width / 2;
                this.src = options.src;
                this.x = options.x;
                this.y = options.y;
                this.insideArr = [];
                this.isLoop = false; ;
                this.isCenterPlayer = false;
                this.onEnd = options.onEnd;

            },
            /**
            *ʹplayer��λ�ñ����ڳ����е�֮ǰ���ƶ�����
            **/
            centerPlayer: function(isLoop) {
                isLoop = isLoop || false;
                this.isLoop = isLoop;
                this.isCenterPlayer = true;
            },
            /**
            *ʹ�����λ�ñ����ڳ�����
            **/
            insideView: function(sprite, dir) {//dirΪ�޶��ĸ�������view�ڣ�ֵΪx��y������������������޶�
                if (cg.core.isArray(sprite)) {
                    for (var i = 0, len = sprite.length; i < len; i++) {
                        arguments.callee.call(this, sprite[i], dir);
                    }
                }
                else {
                    sprite.insideDir = dir;
                    this.insideArr.push(sprite);
                }
            },
            /**
            *�����ƶ�ʱ�ĸ���
            **/
            update: function(spritelist) {//��������sprite������
                if (this.isCenterPlayer) {
                    if (this.player.x > this.centerX) {
                        if (this.x < this.imgWidth - this.width) {
                            var marginX = this.player.x - this.centerX;
                            this.x += marginX;
                            if (spritelist) {
                                for (var i = 0, len = spritelist.length; i < len; i++) {
                                    if (spritelist[i] == this.player) {
                                        spritelist[i].x = this.centerX;
                                    }
                                    else {
                                        spritelist[i].x -= marginX;
                                    }
                                }
                            }
                        }
                        else if (this.isLoop) {
                            if (spritelist) {
                                for (var i = 0, len = spritelist.length; i < len; i++) {
                                    if (spritelist[i] != this.player) {
                                        spritelist[i].move(this.imgWidth - this.width);
                                    }
                                }
                            }
                            this.x = 0;
                        }
                        else {
                            this.onEnd && this.onEnd();
                        }
                    }
                }
                for (var i = 0, len = this.insideArr.length; i < len; i++) {
                    inside.call(this, this.insideArr[i]);
                }
            },
            /**
            *���Ƴ���
            **/
            draw: function() {
                cg.context.drawImage(cg.loader.loadedImgs[this.src], this.x, this.y, this.width, this.height, 0, 0, this.width, this.height);
            }


        }
        this.View = view;
    });

})(window, undefined);

