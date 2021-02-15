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
                    classProperty.indexOf(className) > -1 && matchResult.push(el);
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
                ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
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
            isArray: (elem) => Object.prototype.toString.call(elem) === "[object Array]",
            isObject: (elem) => elem === Object(elem),
            isString: (elem) => Object.prototype.toString.call(elem) === "[object String]",
            isNum: (elem) => Object.prototype.toString.call(elem) === "[object Number]",
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
     * 输入记录模块
     **/
    cnGame.register("cnGame.input", function (cg) {
        this.mouseX = 0;
        this.mouseY = 0;
        // 记录鼠标在canvas内的位置
        var recordMouseMove = function (eve) {
            var pageX, pageY, x, y;
            eve = cg.core.getEvent(eve);
            pageX = eve.pageX || eve.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
            pageY = eve.pageY || eve.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
            cg.input.mouseX = pageX - cg.x;
            cg.input.mouseY = pageY - cg.y;
        };
        cg.core.bind(window, "mousemove", recordMouseMove);

        // 被按下的键的集合
        var pressed_keys = {};
        // 要求禁止默认行为的键的集合
        var preventDefault_keys = {};
        // 键盘按下触发的处理函数
        var keydown_callbacks = {};
        // 键盘弹起触发的处理函数
        var keyup_callbacks = {};

        // 键盘按键编码和键名
        var k1 = { 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause", 20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown" },
            k2 = { 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "delete", 91: "leftwindowkey", 92: "rightwindowkey", 93: "selectkey" },
            k3 = { 106: "multiply", 107: "add", 109: "subtract", 110: "decimalpoint", 111: "divide", 144: "numlock", 145: "scrollock", 186: "semicolon", 187: "equalsign" },
            k4 = { 188: "comma", 189: "dash", 190: "period", 191: "forwardslash", 192: "graveaccent", 219: "openbracket", 220: "backslash", 221: "closebracket", 222: "singlequote" },
            numpadkeys = ["numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9"],
            fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"],
            numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var k = cnGame.core.extend(k1, k2);
        k = cnGame.core.extend(k, k3);
        k = cnGame.core.extend(k, k4);
        for (var i = 0; numbers[i]; i++) {
            k[48 + i] = numbers[i];
        }
        for (var i = 0; letters[i]; i++) {
            k[65 + i] = letters[i];
        }
        for (var i = 0; numpadkeys[i]; i++) {
            k[96 + i] = numpadkeys[i];
        }
        for (var i = 0; fkeys[i]; i++) {
            k[112 + i] = fkeys[i];
        }

        // 记录键盘按下的键
        var recordPress = function (eve) {
            eve = cg.core.getEvent(eve);
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
            if (preventDefault_keys[keyName]) cg.core.preventDefault(eve);
        };
        // 记录键盘松开的键
        var recordUp = function (eve) {
            eve = cg.core.getEvent(eve);
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
            if (preventDefault_keys[keyName]) cg.core.preventDefault(eve);
        };
        cg.core.bind(window, "keydown", recordPress);
        cg.core.bind(window, "keyup", recordUp);

        // 判断某个键是否按下
        this.isPressed = function (keyName) {
            return !!pressed_keys[keyName];
        };
        // 禁止某个键按下的默认行为
        this.preventDefault = function (keyName) {
            if (cg.core.isArray(keyName)) {
                for (var i = 0; i < keyName.length; i++) {
                    arguments.callee.call(this, keyName[i]);
                }
            } else {
                preventDefault_keys[keyName] = true;
            }
        };
        // 绑定键盘按下事件
        this.onKeyDown = function (keyName, handler) {
            keyName = keyName || "allKeys";
            if (cg.core.isUndefined(keydown_callbacks[keyName])) keydown_callbacks[keyName] = [];
            keydown_callbacks[keyName].push(handler);
        };
        // 绑定键盘弹起事件
        this.onKeyUp = function (keyName, handler) {
            keyName = keyName || "allKeys";
            if (cg.core.isUndefined(keyup_callbacks[keyName])) keyup_callbacks[keyName] = [];
            keyup_callbacks[keyName].push(handler);
        };
        // 清除键盘按下事件处理程序
        this.clearDownCallbacks = function (keyName) {
            keyName ? (keydown_callbacks[keyName] = []) : (keydown_callbacks = {});
        };
        // 清除键盘弹起事件处理程序
        this.clearUpCallbacks = function (keyName) {
            keyName ? (keyup_callbacks[keyName] = []) : (keyup_callbacks = {});
        };
    });

    /**
     * 资源加载器
     **/
    cnGame.register("cnGame", function (cg) {
        var FILE_TYPE = { json: "json", wav: "audio", mp3: "audio", ogg: "audio", png: "image", jpg: "image", jpeg: "image", gif: "image", bmp: "image", tiff: "image" };
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
                        if (cg.loop && !cg.loop.stop) cg.loop.end(); //结束上一个循环
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
                cg.spriteList.clean();

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

    /**
     * 精灵表单
     **/
    cnGame.register("cnGame", function (cg) {
        var path = 1;
        var caculateFrames = function (options) {
            var frames = [];
            var width = options.width;
            var height = options.height;
            var beginX = options.beginX;
            var beginY = options.beginY;
            var frameSize = options.frameSize;
            var direction = options.direction;
            var x, y;
            if (direction == "right") {
                for (var y = beginY; y < height; y += frameSize[1]) {
                    for (var x = beginX; x < width; x += frameSize[0]) {
                        var frame = {};
                        frame.x = x;
                        frame.y = y;
                        frames.push(frame);
                    }
                }
            } else {
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
        };
        // 包含多帧图像的大图片
        spriteSheet = function (id, src, options) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(id, src, options);
            }
            this.init(id, src, options);
        };
        spriteSheet.prototype = {
            init(id, src, options) {
                var defaultObj = { x: 0, y: 0, width: 120, height: 40, frameSize: [40, 40], frameDuration: 100, direction: "right", beginX: 0, beginY: 0, loop: false, bounce: false }; // direction 从左到右
                options = options || {};
                options = cg.core.extend(defaultObj, options);
                this.id = id; //spriteSheet的id
                this.src = src; //图片地址
                this.x = options.x; //动画X位置
                this.y = options.y; //动画Y位置
                this.width = options.width; //图片的宽度
                this.height = options.height; //图片的高度
                this.image = cg.loader.images[this.src]; //图片对象
                this.frameSize = options.frameSize; //每帧尺寸
                this.frameDuration = options.frameDuration; //每帧持续时间
                this.direction = options.direction; //读取帧的方向（从做到右或从上到下）
                this.currentIndex = 0; //目前帧索引
                this.beginX = options.beginX; //截取图片的起始位置X
                this.beginY = options.beginY; //截图图片的起始位置Y
                this.loop = options.loop; //是否循环播放
                this.bounce = options.bounce; //是否往返播放
                this.onFinish = options.onFinish; //播放完毕后的回调函数
                this.frames = caculateFrames(options); //帧信息集合
                this.now = new Date().getTime(); //当前时间
                this.last = new Date().getTime(); //上一帧开始时间
            },
            // 更新帧
            update() {
                this.now = new Date().getTime();
                var frames = this.frames;
                if (this.now - this.last > this.frameDuration) {
                    //如果间隔大于帧间间隔，则update
                    var currentIndex = this.currentIndex;
                    var length = this.frames.length;
                    this.last = this.now;
                    if (currentIndex >= length - 1) {
                        if (this.loop) {
                            return frames[(this.currentIndex = 0)];
                        } else if (!this.bounce) {
                            //没有循环并且没有往返滚动，则停止在最后一帧
                            this.onFinish && this.onFinish();
                            this.onFinish = undefined;
                            return frames[currentIndex];
                        }
                    }
                    if (this.bounce && ((currentIndex >= length - 1 && path > 0) || (currentIndex <= 0 && path < 0))) {
                        path *= -1; //往返
                    }
                    this.currentIndex += path;
                }
                return frames[this.currentIndex];
            },
            // 跳到特定帧
            index(index) {
                this.currentIndex = index;
                return this.frames[this.currentIndex];
            },
            // 获取现时帧
            getCurrentFrame() {
                return this.frames[this.currentIndex];
            },
            // 在特定位置绘制该帧
            draw() {
                var currentFrame = this.getCurrentFrame();
                var width = this.frameSize[0];
                var height = this.frameSize[1];
                cg.context.drawImage(this.image, currentFrame.x, currentFrame.y, width, height, this.x, this.y, width, height);
            },
        };
        this.SpriteSheet = spriteSheet;
    });

    /**
     * 精灵对象
     **/
    cnGame.register("cnGame", function (cg) {
        var sprite = function (id, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(id, options);
            this.init(id, options);
        };
        sprite.prototype = {
            init: function (options) {
                var defaultObj = { x: 0, y: 0, imgX: 0, imgY: 0, width: 32, height: 32, angle: 0, speedX: 0, speedY: 0, rotateSpeed: 0, aR: 0, aX: 0, aY: 0, maxSpeedX: Infinity, maxSpeedY: Infinity, maxX: Infinity, maxY: Infinity, minX: -Infinity, minY: -Infinity, minAngle: -Infinity, maxAngle: Infinity };
                options = options || {};
                options = cg.core.extend(defaultObj, options);
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
                // 图片路径 或 spriteSheet对象
                if (options.src) {
                    this.setCurrentImage(options.src, options.imgX, options.imgY);
                } else if (options.spriteSheet) {
                    this.addAnimation(options.spriteSheet);
                    setCurrentAnimation(options.spriteSheet);
                }
            },
            // 返回包含该sprite的矩形对象
            getRect() {
                var obj = { x: this.x, y: this.y, width: this.width, height: this.height };
                return new cg.shape.Rect(obj);
            },
            // 添加动画
            addAnimation(spriteSheet) {
                this.spriteSheetList[spriteSheet.id] = spriteSheet;
            },
            // 设置当前显示动画 可传入id或spriteSheet
            setCurrentAnimation(id) {
                if (!this.isCurrentAnimation(id)) {
                    if (cg.core.isString(id)) {
                        this.spriteSheet = this.spriteSheetList[id];
                        this.image = this.imgX = this.imgY = undefined;
                    } else if (cg.core.isObject(id)) {
                        this.spriteSheet = id;
                        this.addAnimation(id);
                        this.image = this.imgX = this.imgY = undefined;
                    }
                }
            },
            // 判断当前动画是否为该id的动画
            isCurrentAnimation(id) {
                if (cg.core.isString(id)) {
                    return this.spriteSheet && this.spriteSheet.id === id;
                } else if (cg.core.isObject(id)) {
                    return this.spriteSheet === id;
                }
            },
            // 设置当前显示图像
            setCurrentImage(src, imgX, imgY) {
                if (!this.isCurrentImage(src, imgX, imgY)) {
                    imgX = imgX || 0;
                    imgY = imgY || 0;
                    this.image = cg.loader.images[src];
                    this.imgX = imgX;
                    this.imgY = imgY;
                    this.spriteSheet = undefined;
                }
            },
            // 判断当前图像是否为该src的图像
            isCurrentImage: function (src, imgX, imgY) {
                imgX = imgX || 0;
                imgY = imgY || 0;
                var image = this.image;
                if (cg.core.isString(src)) return image && image.srcPath === src && this.imgX === imgX && this.imgY === imgY;
            },
            // 设置移动参数
            setMovement(options) {
                var isUn = cg.core.isUndefined;
                isUn(options.speedX) ? (this.speedX = this.speedX) : (this.speedX = options.speedX);
                isUn(options.speedY) ? (this.speedY = this.speedY) : (this.speedY = options.speedY);
                isUn(options.rotateSpeed) ? (this.rotateSpeed = this.rotateSpeed) : (this.rotateSpeed = options.rotateSpeed);
                isUn(options.aX) ? (this.aR = this.aR) : (this.aR = options.aR);
                isUn(options.aX) ? (this.aX = this.aX) : (this.aX = options.aX);
                isUn(options.aY) ? (this.aY = this.aY) : (this.aY = options.aY);
                isUn(options.maxX) ? (this.maxX = this.maxX) : (this.maxX = options.maxX);
                isUn(options.maxY) ? (this.maxY = this.maxY) : (this.maxY = options.maxY);
                isUn(options.maxAngle) ? (this.maxAngle = this.maxAngle) : (this.maxAngle = options.maxAngle);
                isUn(options.minAngle) ? (this.minAngle = this.minAngle) : (this.minAngle = options.minAngle);
                isUn(options.minX) ? (this.minX = this.minX) : (this.minX = options.minX);
                isUn(options.minY) ? (this.minY = this.minY) : (this.minY = options.minY);
                isUn(options.maxSpeedX) ? (this.maxSpeedX = this.maxSpeedX) : (this.maxSpeedX = options.maxSpeedX);
                isUn(options.maxSpeedY) ? (this.maxSpeedY = this.maxSpeedY) : (this.maxSpeedY = options.maxSpeedY);
            },
            // 重置移动参数回到初始值
            resetMovement() {
                this.speedX = this.speedY = this.rotateSpeed = this.aX = this.aY = this.aR = 0;
                this.maxSpeedX = this.maxSpeedY = this.maxX = this.maxY = this.maxAngle = Infinity;
                this.minX = this.minY = this.minAngle = -Infinity;
            },
            // 更新位置和帧动画
            update(duration) {
                //duration:��֡��ʱ ��λ����
                this.speedX = this.speedX + this.aX * duration;
                this.maxSpeedX < 0 && (this.maxSpeedX *= -1);
                this.speedX < 0 ? (this.speedX = Math.max(this.speedX, this.maxSpeedX * -1)) : (this.speedX = Math.min(this.speedX, this.maxSpeedX));

                this.speedY = this.speedY + this.aY * duration;
                this.maxSpeedY < 0 && (this.maxSpeedY *= -1);
                this.speedY < 0 ? (this.speedY = Math.max(this.speedY, this.maxSpeedY * -1)) : (this.speedY = Math.min(this.speedY, this.maxSpeedY));
                this.rotateSpeed = this.rotateSpeed + this.aR * duration;

                this.rotate(this.rotateSpeed).move(this.speedX, this.speedY);

                if (this.spriteSheet) {
                    this.spriteSheet.x = this.x;
                    this.spriteSheet.y = this.y;
                    this.spriteSheet.update();
                }
            },
            // 绘制出sprite
            draw() {
                var context = cg.context,
                    halfWith,
                    halfHeight;
                if (this.spriteSheet) {
                    this.spriteSheet.x = this.x;
                    this.spriteSheet.y = this.y;
                    this.spriteSheet.draw();
                } else if (this.image) {
                    context.save();
                    halfWith = this.width / 2;
                    halfHeight = this.height / 2;
                    context.translate(this.x + halfWith, this.y + halfHeight);
                    context.rotate(((this.angle * Math.PI) / 180) * -1);
                    context.drawImage(this.image, this.imgX, this.imgY, this.width, this.height, -halfWith, -halfHeight, this.width, this.height);
                    context.restore();
                }
            },
            // 移动一定距离
            move(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                var x = this.x + dx,
                    y = this.y + dy;
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            // 移动到某处
            moveTo(x, y) {
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            // 旋转一定角度
            rotate(da) {
                da = da || 0;
                var angle = this.angle + da;
                this.angle = Math.min(Math.max(this.minAngle, angle), this.maxAngle);
                return this;
            },
            // 旋转到一定角度
            rotateTo(a) {
                this.angle = Math.min(Math.max(this.minAngle, a), this.maxAngle);
                return this;
            },
            // 改变一定尺寸
            resize(dw, dh) {
                this.width += dw;
                this.height += dh;
                return this;
            },
            // 改变到一定尺寸
            resizeTo(width, height) {
                this.width = width;
                this.height = height;
                return this;
            },
        };
        this.Sprite = sprite;
    });

    /**
     * 精灵列表
     **/
    cnGame.register("cnGame", function (cg) {
        this.spriteList = {
            length: 0,
            add(sprite) {
                Array.prototype.push.call(this, sprite);
            },
            remove(sprite) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === sprite) {
                        Array.prototype.splice.call(this, i, 1);
                        break;
                    }
                }
            },
            clean: function () {
                for (var i = 0; i < this.length; i++) {
                    Array.prototype.pop.call(this);
                }
            },
        };
    });

    /**
     * 游戏循环
     **/
    cnGame.register("cnGame", function (cg) {
        var timeId, interval;
        // 循环方法
        var loop = function () {
            var self = this;
            return function () {
                if (!self.pause && !self.stop) {
                    var now = new Date().getTime(),
                        duration = (now - self.lastTime) / 1000, // 持续时长(秒)
                        spriteList = cg.spriteList;
                    console.log("self.now", self, self.now);
                    self.loopDuration = (self.startTime - self.now) / 1000;
                    if (self.gameObj.update) self.gameObj.update(duration);
                    if (self.gameObj.draw) {
                        cg.context.clearRect(0, 0, cg.width, cg.height);
                        self.gameObj.draw();
                    }
                    for (var i = 0; i < spriteList.length; i++) {
                        spriteList[i].update(duration);
                        spriteList[i].draw();
                    }
                    self.lastTime = now;
                }
                timeId = window.setTimeout(arguments.callee, interval);
            };
        };

        var gameLoop = function (gameObj, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(gameObj, options);
            this.init(gameObj, options);
        };
        gameLoop.prototype = {
            init(gameObj, options) {
                options = options || {};
                options = cg.core.extend({ fps: 1 }, options);
                this.gameObj = gameObj;
                this.fps = options.fps;
                interval = 1000 / this.fps;
                this.pause = false;
                this.stop = true;
            },
            start() {
                if (!this.stop) return; // 如果是结束状态则可以开始
                this.stop = false;
                var now = new Date().getTime();
                this.startTime = now;
                this.lastTime = now;
                this.loopDuration = 0;
                loop.call(this)();
            },
            run() {
                this.pause = false;
            },
            pause() {
                this.pause = true;
            },
            end() {
                this.stop = true;
                window.clearTimeout(timeId);
            },
        };
        this.GameLoop = gameLoop;
    });
})(window, undefined);
