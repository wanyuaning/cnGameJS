(function (W, U) {
    W["cnGame"] = {
        width: 800, height: 600, x: 0, y: 0,
        init: function (id, options) {
            options = options || {}; this.core.extend(this, options)
            this.canvas = this.core.$(id || "canvas"); var canvasPos = this.core.getElementPos(this.canvas); this.x = canvasPos[0] || 0; this.y = canvasPos[1] || 0;
            this.context = this.canvas.getContext("2d");
            this.canvas.width = this.width; 
            this.canvas.height = this.height;
            this.canvas.style.left = this.x + "px";
            this.canvas.style.top = this.y + "px";
            !this.title && (this.title = this.core.$t("title")[0]);
        },
        register: function (ns, fn) {
            var parent = W, nsArr = ns.split(".");
            for (var i = 0; i < nsArr.length; i++) { var n = nsArr[i]; typeof parent[n] == "undefined" && (parent[n] = {}); parent = parent[n] }
            fn && fn.call(parent, this);
            return parent;
        },
        clean: function () { this.context.clearRect(this.width, this.height) },
        core: {
            $: id => document.getElementById(id),
            $t: (tagName, parent) => { parent = parent || document; return parent.getElementsByTagName(tagName) },
            $c(className, parent) {
                var eles = this.$t("*", parent), res = []; parent = parent || document; className = " " + className + " ";
                for (var i = 0; i < eles.length; i++) { var el = eles[i], cN = " " + el.className + " "; cN.indexOf(className) > -1 && res.push(el) }
                return res;
            },
            // 获取元素在页面中的位置 当存在 定位父元素 offsetLeft是相对于它的
            getElementPos: el => { var l = 0, t = 0; while (el.offsetParent) { l += el.offsetLeft; t += el.offsetTop; el = el.offsetParent }; return [l, t] },
            bind: (function () {
                if (window.addEventListener) { return function (el, type, handler) { el.addEventListener(type, handler, false) } } 
                else if (window.attachEvent) { return function (el, type, handler) { el.attachEvent("on" + type, handler) } }
            })(),
            unbind: (function () {
                if (window.removeEventListerner) { return function (el, type, handler) { el.removeEventListerner(type, handler, false) } } 
                else if (window.detachEvent) { return function (el, type, handler) { el.detachEvent("on" + type, handler) } }
            })(),
            getEvent: ev => ev || W.event,
            getTarget: function (ev) { ev = this.getEvent(ev); return ev.target || ev.srcElement },
            preventDefault: function (ev) { ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false) },
            getComputedStyle: (function () {
                var body = document.body || document.documentElement;
                if (body.currentStyle) { return function (el) { return el.currentStyle } } 
                else if (document.defaultView.getComputedStyle) { return function (el) { return document.defaultView.getComputedStyle(el, null) } }
            })(),
            isUndefined: x => typeof x === "undefined",
            isArray: elem => Object.prototype.toString.call(elem) === "[object Array]",
            isObject: elem => elem === Object(elem),
            isString: elem => Object.prototype.toString.call(elem) === "[object String]",
            isNum: elem => Object.prototype.toString.call(elem) === "[object Number]",
            extend: function (a, b, c) { var U = this.isUndefined; U(c) && (c = true); for (var key in b) { if (c || U(a[key])) a[key] = b[key] };return a },
            inherit: function (c, p) { var f = function () {}; f.prototype = p.prototype; c.prototype = new f(); c.prototype.constructor = c; c.prototype.p = p }
        }
    };

    ////////////////////* 资源加载器 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var FILE_TYPE = { json: "json", wav: "audio", mp3: "audio", ogg: "audio", png: "image", jpg: "image", jpeg: "image", gif: "image", bmp: "image", tiff: "image" };
        var load = function (loader, type) {
            return function () {
                loader.count++;
                loader.images[this.srcHold] = this;
                this.onLoad = null;                                         //资源的onLoad执行一次后销毁
                loader.onLoad && loader.onLoad(loader.count, loader.total);
                if (loader.count === loader.total) {
                    loader.count = 0;
                    if (loader.gameObj && loader.gameObj.initialize) {
                        loader.gameObj.initialize(loader.startOptions);
                        if (cg.loop && !cg.loop.stop) cg.loop.end();        //结束上一个循环
                        cg.loop = new cg.GameLoop(loader.gameObj);          //开始新游戏循环
                        cg.loop.start();
                    }
                }
            };
        };
        this.loader = {
            total: 0, count: 0, images: {}, // 图片总数 & 图片已加载数 & 加载完成的资源
            /**
             * gameObj {
             *     initialize: function (startOptions) {console.log("资源加载完成，游戏开始！")},
             * }
             * options {
             *     srcArray: []                     资源列表
             *     onLoad: function(count, total){} 第个资源加载完成回调 可获取进度
             *     startOptions                     游戏开始需要的初始化参数
             * }
             *
             * 属性
             * images:{'path': 资源对象} 可通过 cnGame.loader.images['path']访问
             **/
            start: function (gameObj, options) {
                cg.spriteList.clean();
                var srcArr = options.srcArray || [];

                this.gameObj = gameObj;
                this.startOptions = options.startOptions;
                this.onLoad = options.onLoad;
                this.total = srcArr.length;

                for (var i = 0; i < srcArr.length; i++) {
                    var path = srcArr[i], suffix = path.split(".")[1], type = FILE_TYPE[suffix];
                    switch (type) {
                        case "image":
                            var img = new Image();
                            cg.core.bind(img, "load", load(this, type));
                            img.src = path;     // 默认情况下浏览器会把src参数转换成完整的图片路径
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
        };
    });

    ////////////////////* 精灵表单 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var path = 1; // 往返运动 1 -1
        var caculateFrames = function (sheet) {
            var frames = [], x, y, w = sheet.width, h = sheet.height, bX = sheet.beginX, bY = sheet.beginY, frameSize = sheet.frameSize, direction = sheet.direction;            
            if (direction == "right") {
                for (var y = bY; y < h; y += frameSize[1]) { for (var x = bX; x < w; x += frameSize[0]) { frames.push({x, y}) } }
            } else {
                for (var x = bX; x < w; x += frameSize[0]) { for (var y = bY; y < h; y += frameSize[1]) { frames.push({x, y}) } }
            }
            return frames;
        };

        /**包含多帧图像的大图片
         * 
         */
        spriteSheet = function (id, src, options) {
            if (!(this instanceof arguments.callee))  return new arguments.callee(id, src, options);
            this.init(id, src, options);
        };
        spriteSheet.prototype = { // 动画位置 & 图片宽高 & 循环播放&往返播放 & 截图图片的起始位置 & 每帧尺寸 & 每帧持续时间 & 读取帧的方向(从左到右或从上到下)
            x: 0, y: 0, width: 120, height: 40, loop: false, bounce: false, beginX: 0, beginY: 0, frameSize: [40, 40], frameDuration: 100, direction: "right",
            init(id, src, options) {
                options = options || {};
                cg.core.extend(this, options)
                this.id = id; 
                this.src = src; 
                this.image = cg.loader.images[src];    // 图片地址&图片对象
                this.frames = caculateFrames(this); // 帧信息集合
                this.currentIndex = 0;                 // 目前帧索引
                this.now = new Date().getTime();       // 当前时间
                this.last = new Date().getTime();      // 上一帧开始时间 
            },
            update() {
                this.now = new Date().getTime();
                var frames = this.frames;
                if (this.now - this.last > this.frameDuration) { //如果间隔大于帧间间隔，则update
                    var cI = this.currentIndex, len = frames.length;
                    this.last = this.now;
                    if (cI >= len - 1) {
                        if (this.loop) return frames[(this.currentIndex = 0)];
                        if (!this.bounce) { this.onFinish && this.onFinish(); this.onFinish = undefined; return frames[cI] } // 没有循环和往返 则停止在最后一帧
                    }
                    if (this.bounce && ((cI >= len - 1 && path > 0) || (cI <= 0 && path < 0))) path *= -1; //往返
                    this.currentIndex += path;
                }
                return frames[this.currentIndex];
            },
            // 跳到特定帧
            index(index) { this.currentIndex = index; return this.frames[index] },
            // 获取现时帧
            getCurrentFrame() { return this.frames[this.currentIndex] },
            // 在特定位置绘制该帧
            draw() { var cF = this.getCurrentFrame(), sz = this.frameSize,  w = sz[0], h = sz[1]; cg.context.drawImage(this.image, cF.x, cF.y, w, h, this.x, this.y, w, h) },
        };
        this.SpriteSheet = spriteSheet;
    });

    ////////////////////* 精灵对象 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var sprite = function (id, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(id, options);
            this.init(id, options);
        };
        sprite.prototype = {
            x: 0, y: 0, imgX: 0, imgY: 0, width: 32, height: 32, angle: 0, speedX: 0, speedY: 0, rotateSpeed: 0, aR: 0, aX: 0, aY: 0, 
            maxSpeedX: Infinity, maxSpeedY: Infinity, maxX: Infinity, maxY: Infinity, minX: -Infinity, minY: -Infinity, minAngle: -Infinity, maxAngle: Infinity,
            init: function (options) {
                options = options || {};
                cg.core.extend(this, options);
                this.spriteSheetList = {};
                // 图片路径 或 spriteSheet对象
                if (this.src) { this.setCurrentImage(this.src, this.imgX, this.imgY) } 
                else if (this.spriteSheet) { this.addAnimation(this.spriteSheet); setCurrentAnimation(this.spriteSheet) }
            },
            // 返回包含该sprite的矩形对象
            getRect() { var obj = { x: this.x, y: this.y, width: this.width, height: this.height }; return new cg.shape.Rect(obj) },
            // 添加动画
            addAnimation(spriteSheet) { this.spriteSheetList[spriteSheet.id] = spriteSheet },
            // 设置当前显示动画 可传入id或spriteSheet
            setCurrentAnimation(id) {
                if(this.isCurrentAnimation(id)) return                
                if (cg.core.isString(id)) { this.spriteSheet = this.spriteSheetList[id]; this.image = this.imgX = this.imgY = undefined } 
                else if (cg.core.isObject(id)) { this.spriteSheet = id; this.addAnimation(id); this.image = this.imgX = this.imgY = undefined }
            },
            // 判断当前动画是否为该id的动画
            isCurrentAnimation(id) {
                if (cg.core.isString(id)) { return this.spriteSheet && this.spriteSheet.id === id } 
                else if (cg.core.isObject(id)) { return this.spriteSheet === id }
            },
            // 设置当前显示图像
            setCurrentImage(src, imgX, imgY) {
                if (this.isCurrentImage(src, imgX, imgY)) return;
                imgX = imgX || 0; imgY = imgY || 0;
                this.image = cg.loader.images[src];
                this.imgX = imgX; this.imgY = imgY;
                this.spriteSheet = undefined;
            },
            // 判断当前图像是否为该src的图像
            isCurrentImage: function (src, imgX, imgY) {
                imgX = imgX || 0; imgY = imgY || 0; var image = this.image;
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
            update(duration) { //duration:��֡��ʱ ��λ����
                this.speedX = this.speedX + this.aX * duration;
                this.maxSpeedX < 0 && (this.maxSpeedX *= -1);
                this.speedX < 0 ? (this.speedX = Math.max(this.speedX, this.maxSpeedX * -1)) : (this.speedX = Math.min(this.speedX, this.maxSpeedX));
                this.speedY = this.speedY + this.aY * duration;
                this.maxSpeedY < 0 && (this.maxSpeedY *= -1);
                this.speedY < 0 ? (this.speedY = Math.max(this.speedY, this.maxSpeedY * -1)) : (this.speedY = Math.min(this.speedY, this.maxSpeedY));
                this.rotateSpeed = this.rotateSpeed + this.aR * duration;
                this.rotate(this.rotateSpeed).move(this.speedX, this.speedY);
                if (this.spriteSheet) { this.spriteSheet.x = this.x; this.spriteSheet.y = this.y; this.spriteSheet.update() }
            },
            // 绘制出sprite
            draw() {
                var context = cg.context, halfWith, halfHeight;
                if (this.spriteSheet) {
                    this.spriteSheet.x = this.x; this.spriteSheet.y = this.y; this.spriteSheet.draw();
                } else if (this.image) {
                    context.save(); halfWith = this.width / 2; halfHeight = this.height / 2;
                    context.translate(this.x + halfWith, this.y + halfHeight);
                    context.rotate(((this.angle * Math.PI) / 180) * -1);
                    context.drawImage(this.image, this.imgX, this.imgY, this.width, this.height, -halfWith, -halfHeight, this.width, this.height);
                    context.restore();
                }
            },
            // 移动一定距离
            move(dx, dy) {
                dx = dx || 0; dy = dy || 0; var x = this.x + dx, y = this.y + dy;
                this.x = Math.min(Math.max(this.minX, x), this.maxX); this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            // 移动到某处
            moveTo(x, y) { this.x = Math.min(Math.max(this.minX, x), this.maxX); this.y = Math.min(Math.max(this.minY, y), this.maxY); return this },
            // 旋转一定角度
            rotate(da) { da = da || 0; var angle = this.angle + da; this.angle = Math.min(Math.max(this.minAngle, angle), this.maxAngle); return this },
            // 旋转到一定角度
            rotateTo(a) { this.angle = Math.min(Math.max(this.minAngle, a), this.maxAngle); return this },
            // 改变一定尺寸
            resize(dw, dh) { this.width += dw; this.height += dh; return this },
            // 改变到一定尺寸
            resizeTo(width, height) { this.width = width; this.height = height; return this }
        };
        this.Sprite = sprite;
    });

    ////////////////////* 精灵列表 *////////////////////
    cnGame.register("cnGame", function (cg) {
        this.spriteList = {
            length: 0,
            add(sprite) { Array.prototype.push.call(this, sprite) },
            remove(sprite) { for (var i = 0; i < this.length; i++) { if (this[i] === sprite) { Array.prototype.splice.call(this, i, 1); break } } },
            clean: function () { for (var i = 0; i < this.length; i++) { Array.prototype.pop.call(this) } },
        };
    });

    ////////////////////* 游戏循环 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var timeId, interval;
        var loop = function () {
            var gloop = this;
            return function () {
                if (!gloop.pause && !gloop.stop) {
                    var now = new Date().getTime(), duration = (now - gloop.lastTime) / 1000, spriteList = cg.spriteList; // duration持续时长(秒)
                    gloop.loopDuration = (gloop.startTime - gloop.now) / 1000;
                    if (gloop.gameObj.update) gloop.gameObj.update(duration);
                    if (gloop.gameObj.draw) { cg.context.clearRect(0, 0, cg.width, cg.height); gloop.gameObj.draw() }
                    for (var i = 0; i < spriteList.length; i++) { spriteList[i].update(duration); spriteList[i].draw() }
                    gloop.lastTime = now;
                }
                timeId = window.setTimeout(arguments.callee, interval);
            };
        };

        var gameLoop = function (gameObj, options) { if (!(this instanceof arguments.callee)) return new arguments.callee(gameObj, options); this.init(gameObj, options) };
        gameLoop.prototype = {
            init(gameObj, options) {
                options = options || {}; options = cg.core.extend({ fps: 1 }, options);
                this.gameObj = gameObj;
                this.fps = options.fps;
                this.pause = false;
                this.stop = true;
                interval = 1000 / this.fps;
            },
            start() {
                if (!this.stop) return; // 如果是结束状态则可以开始                
                var now = new Date().getTime();
                this.stop = false;
                this.startTime = now;
                this.lastTime = now;
                this.loopDuration = 0;
                loop.call(this)();
            },
            run() { this.pause = false },
            pause() { this.pause = true },
            end() { this.stop = true; window.clearTimeout(timeId) },
        };
        this.GameLoop = gameLoop;
    });

    ////////////////////* 输入记录模块 *////////////////////
    cnGame.register("cnGame.input", function (cg) {
        this.mouseX = 0; this.mouseY = 0; var T = cg.core;
        // 记录鼠标在canvas内的位置
        var recordMouseMove = function (eve) {
            var pageX, pageY, x, y; eve = T.getEvent(eve);
            pageX = eve.pageX || eve.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
            pageY = eve.pageY || eve.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
            cg.input.mouseX = pageX - cg.x; cg.input.mouseY = pageY - cg.y;
        };
        T.bind(window, "mousemove", recordMouseMove);
        // 被按下的键的集合 & 要求禁止默认行为的键的集合 & 键盘按下触发的处理函数 & 键盘弹起触发的处理函数
        var pressed_keys = {}, preventDefault_keys = {}, keydown_callbacks = {}, keyup_callbacks = {};
        // 键盘按键编码和键名
        var k1 = { 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause", 20: "capslock", 27: "esc", 32: "space", 33: "pageup" },
            k2 = { 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "delete", 91: "leftwindowkey" },
            k3 = { 92: "rightwindowkey", 93: "selectkey", 106: "multiply", 107: "add", 109: "subtract", 110: "decimalpoint", 111: "divide", 144: "numlock" },
            k4 = { 145: "scrollock", 186: "semicolon", 187: "equalsign", 188: "comma", 189: "dash", 190: "period", 191: "forwardslash", 192: "graveaccent" },
            k5 = { 219: "openbracket", 220: "backslash", 221: "closebracket", 222: "singlequote" };
            numpadkeys = ["numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9"],
            fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"], numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var k = cnGame.core.extend(k1, k2); k = cnGame.core.extend(k, k3); k = cnGame.core.extend(k, k4); k = cnGame.core.extend(k, k5);
        for (var i = 0; numbers[i]; i++) { k[48 + i] = numbers[i] }
        for (var i = 0; letters[i]; i++) { k[65 + i] = letters[i] }
        for (var i = 0; numpadkeys[i]; i++) { k[96 + i] = numpadkeys[i] }
        for (var i = 0; fkeys[i]; i++) { k[112 + i] = fkeys[i] }

        // 记录键盘按下的键
        var recordPress = function (e) {
            e = T.getEvent(e); var kN = k[e.keyCode]; pressed_keys[kN] = true;
            if (keydown_callbacks[kN]) for (var i = 0, len = keydown_callbacks[kN].length; i < len; i++) { keydown_callbacks[kN][i]() };
            if (keydown_callbacks["allKeys"]) for (var i = 0, len = keydown_callbacks["allKeys"].length; i < len; i++) { keydown_callbacks["allKeys"][i]() };
            if (preventDefault_keys[kN]) T.preventDefault(e);
        };
        // 记录键盘松开的键
        var recordUp = function (eve) {
            eve = T.getEvent(eve); var kN = k[eve.keyCode]; pressed_keys[kN] = false;
            if (keyup_callbacks[kN]) for (var i = 0, len = keyup_callbacks[kN].length; i < len; i++) { keyup_callbacks[kN][i]() };
            if (keyup_callbacks["allKeys"]) for (var i = 0, len = keyup_callbacks["allKeys"].length; i < len; i++) { keyup_callbacks["allKeys"][i]() };
            if (preventDefault_keys[kN]) T.preventDefault(eve);
        };
        T.bind(window, "keydown", recordPress); T.bind(window, "keyup", recordUp);
        // 判断某个键是否按下
        this.isPressed = function (keyName) { return !!pressed_keys[keyName] };
        // 禁止某个键按下的默认行为
        this.preventDefault = function (n) {if (T.isArray(n)) {for (var i = 0; i < n.length; i++) {arguments.callee.call(this, n[i])}}else{preventDefault_keys[n] = true}};
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
        this.clearDownCallbacks = function (keyName) { keyName ? (keydown_callbacks[keyName] = []) : (keydown_callbacks = {}) };
        // 清除键盘弹起事件处理程序
        this.clearUpCallbacks = function (keyName) {
            keyName ? (keyup_callbacks[keyName] = []) : (keyup_callbacks = {});
        };
    });

    ////////////////////* canvas基本形状对象 *////////////////////
    cnGame.register("cnGame.shape", function (cg) {
        // 更新right和bottom
        function resetRightBottom(ele) { ele.right = ele.x + ele.width; ele.bottom = ele.y + ele.height };
        
        function Rect(options) { if (!(this instanceof arguments.callee)) return new arguments.callee(options); this.init(options) };
        Rect.prototype = {
            x: 0, y: 0, width: 100, height: 100, style: "red", isFill: true,
            init(options) { options = options || {}; cg.core.extend(this, options); this.setOptions(this); resetRightBottom(this) },
            // 绘制矩形
            setOptions(options) { cg.core.extend(this, options) },
            // 绘制矩形
            draw() {
                var context = cg.context;
                if (this.isFill) { context.fillStyle = this.style; context.fillRect(this.x, this.y, this.width, this.height) } 
                else { context.strokeStyle = this.style; context.strokeRect(this.x, this.y, this.width, this.height) }
                return this;
            },
            // 将矩形移动一定距离
            move(dx, dy) { dx = dx || 0; dy = dy || 0; this.x += dx; this.y += dy; resetRightBottom(this); return this },
            // 将矩形移动到特定位置
            moveTo(x, y) { x && (this.x = x); y && (this.y = y); resetRightBottom(this); return this },
            // 将矩形改变一定大小
            resize(dW, dH) { dW = dW || 0; dH = dH || 0; this.width += dW; this.height += dH; resetRightBottom(this); return this },
            // 将矩形改变到特定大小
            resizeTo(w, h) { w && (this.width = w); h && (this.height = h); resetRightBottom(this); return this },
        };
        
        function Circle(options) { if (!(this instanceof arguments.callee)) return new arguments.callee(options); this.init(options) };
        Circle.prototype = {
            x: 100, y: 100, r: 100, startAngle: 0, endAngle: Math.PI * 2, antiClock: false, style: "red", isFill: true,
            init(o) { o = o || {}; cg.core.extend(this, o) },
            // 设置参数
            setOptions(options) { cg.core.extend(this, options) },
            // 绘制圆形
            draw() {
                var context = cg.context; context.beginPath(); context.arc(this.x, this.y, this.r, this.startAngle, this.endAngle, this.antiClock); context.closePath();
                if (this.isFill) { context.fillStyle = this.style; context.fill() } 
                else { context.strokeStyle = this.style; context.stroke() }
            },
            // 将圆形移动一定距离
            move(dx, dy) { dx = dx || 0; dy = dy || 0; this.x += dx; this.y += dy; return this },
            // 将圆形移动到特定位置
            moveTo(x, y) { x = x || this.x; y = y || this.y; this.x = x; this.y = y; return this },
            // 将圆形改变一定大小
            resize(dr) { dr = dr || 0; this.r += dr; return this },
            // 将圆形改变到特定大小
            resizeTo(r) { r = r || this.r; this.r = r; return this }
        };
        
        function Text(text, options) { if (!(this instanceof arguments.callee)) return new arguments.callee(text, options); this.init(text, options) };
        Text.prototype = {
            x: 100, y: 100, style: "red", isFill: true,
            init(text, options) { options = options || {}; cg.core.extend(this, options); this.text = text},
            draw() {
                var ctx = cg.context, isUn = cg.core.isUndefined;
                !isUn(this.font) && (ctx.font = this.font); !isUn(this.textBaseline) && (ctx.textBaseline = this.textBaseline);
                !isUn(this.textAlign) && (ctx.textAlign = this.textAlign); !isUn(this.maxWidth) && (ctx.maxWidth = this.maxWidth);
                if (this.isFill) { 
                    ctx.fillStyle = this.style; this.maxWidth ? ctx.fillText(this.text, this.x, this.y, this.maxWidth) : ctx.fillText(this.text, this.x, this.y) 
                } else { 
                    ctx.strokeStyle = this.style; this.maxWidth ? ctx.strokeText(this.text, this.x, this.y, this.maxWidth) : ctx.strokeText(this.text, this.x, this.y) 
                }
            },
            setOptions(options) { cg.core.extend(this, options) },
        };
        this.Text = Text; this.Rect = Rect; this.Circle = Circle;
    });

    ////////////////////* 碰撞检测 *////////////////////
    cnGame.register("cnGame.collision", function (cg) {
        // 点和矩形间的碰撞
        this.col_Point_Rect = (Px, Py, R) => (Px >= R.x && Px <= R.right) || (Py >= R.y && Py <= R.bottom);
        // 矩形和矩形间的碰撞
        this.col_Between_Rects = (R1,R2) => 
            ((R1.right>=R2.x && R1.right<=R2.right)||(R1.x>=R2.x && R1.x<=R2.right))&&((R1.bottom>=R2.y&&R1.bottom<=R2.bottom)||(R1.y<=R2.bottom&&R1.bottom>=R2.y));
        // 点和圆形间的碰撞
        this.col_Point_Circle = (Px, Py, C) => Math.pow(Px - C.x, 2) + Math.pow(Py - C.y, 2) < Math.pow(C.r, 2);
        // 圆形和圆形间的碰撞
        this.col_between_Circles = (C1, C2) => Math.pow(C1.x - C2.x, 2) + Math.pow(C1.y - C2.y, 2) < Math.pow((C1.r + C2).r, 2);
    });

    ////////////////////* 精灵列表 *////////////////////
    cnGame.register("cnGame", function (cg) {
        this.spriteList = {
            length: 0,
            add: function (sprite) { Array.prototype.push.call(this, sprite) },
            remove: function (sprite) { for (var i = 0; i < this.length; i++) { if (this[i] === sprite) Array.prototype.splice.call(this, i, 1) } },
            clean: function () { for (var i = 0; i < this.length; i++) { Array.prototype.pop.call(this) } },
        };
    });

    ////////////////////* 地图 *////////////////////
    cnGame.register("cnGame", function (cg) {
        function map(MAP, opt) { if (!(this instanceof arguments.callee)) return new arguments.callee(MAP, opt); this.init(MAP, opt) };
        map.prototype = {
            cellSize: [32, 32], beginX: 0, beginY: 0, // 方格宽高 地图起始x 地图起始y
            init(MAP, opt) { opt = opt || {}; cg.core.extend(this, opt); this.mapMatrix = MAP; this.row = MAP.length },
            // 根据map矩阵绘制map
            draw(opt) { //options：{"1":{src:"xxx.png",x:0,y:0},"2":{src:"xxx.png",x:1,y:1}}
                var MAP = this.mapMatrix, bX = this.beginX, bY = this.beginY, cS = this.cellSize, cRow, cCol, cObj, row = this.row, img;
                for (var i = bY, ylen = bY + row * cS[1]; i < ylen; i += cS[1]) {
                    cRow = (i - bY) / cS[1];
                    for (var j = bX, xlen = bX + MAP[cRow].length * cS[0]; j < xlen; j += cS[0]) {
                        cCol = (j - bX) / cS[0]; cObj = opt[MAP[cRow][cCol]]; cObj.x = cObj.x || 0; cObj.y = cObj.y || 0; img = cg.loader.images[cObj.src];
                        cg.context.drawImage(img, cObj.x, cObj.y, cS[0], cS[1], j, i, cS[0], cS[1]); //绘制特定坐标的图像
                        cg.context.strokeText(cCol + "/" + cRow, cCol * cS[0] + 12, cRow * cS[1] + 25);
                    }
                }
            },
            // 获取特定对象在地图中处于的方格的值
            getPosValue(x, y) {
                if (cg.core.isObject(x)) { y = x.y; x = x.x }
                var isUndefined = cg.core.isUndefined; y = Math.floor(y / this.cellSize[1]); x = Math.floor(x / this.cellSize[0]);
                if (!isUndefined(this.mapMatrix[y]) && !isUndefined(this.mapMatrix[y][x])) return this.mapMatrix[y][x];
                return undefined;
            },
            // 获取特定对象在layer中处于的方格索引
            getCurrentIndex(x, y) { if (cg.core.isObject(x)) { y = x.y; x = x.x }; return [Math.floor(x / this.cellSize[0]), Math.floor(y / this.cellSize[1])] },
            // 获取特定对象是否刚好与格子重合
            isMatchCell(x, y) { if (cg.core.isObject(x)) { y = x.y; x = x.x }; return x % this.cellSize[0] == 0 && y % this.cellSize[1] == 0 },
            // 设置layer对应位置的值
            setPosValue(x, y, value) { this.mapMatrix[y][x] = value },
        };
        this.Map = map;
    });

    ////////////////////* 场景 *////////////////////
    cnGame.register("cnGame", function (cg) {
        // 使指定对象在可视区域view内
        var inside = function (sprite) {
            var dir = sprite.insideDir;
            if (dir != "y") { if (sprite.x < 0) { sprite.x = 0 } else if (sprite.x > this.width - sprite.width) { sprite.x = this.width - sprite.width } }
            if (dir != "x") { if (sprite.y < 0) { sprite.y = 0 } else if (sprite.y > this.height - sprite.height) { sprite.y = this.height - sprite.height } }
        };

        function view(options) { this.init(options) };
        view.prototype = {
            width: cg.width, height: cg.height, imgWidth: cg.width, imgHeight: cg.height, x: 0, y: 0,
            init: function (options) {
                options = options || {}; cg.core.extend(this, options); this.centerX = this.width / 2; this.insideArr = []; this.isLoop = false; this.isCenterPlayer = false;
            },
            // 使player的位置保持在场景中点之前的移动背景
            centerPlayer(isLoop) { isLoop = isLoop || false; this.isLoop = isLoop; this.isCenterPlayer = true },
            // 使对象的位置保持在场景内
            insideView(sprite, dir) { //dir为限定哪个方向在view内，值为x或y，不传则两个方向皆限定
                if (cg.core.isArray(sprite)) { for (var i = 0; i < sprite.length; i++) { arguments.callee.call(this, sprite[i], dir) } } 
                else { sprite.insideDir = dir; this.insideArr.push(sprite) }
            },
            // 背景移动时的更新
            update(sl) { //传入所有sprite的数组
                if (this.isCenterPlayer) {
                    if (this.player.x > this.centerX) {
                        if (this.x < this.imgWidth - this.width) {
                            var marginX = this.player.x - this.centerX; this.x += marginX;
                            if (sl) { for (var i = 0; i < sl.length; i++) { sl[i] == this.player ? sl[i].x = this.centerX : sl[i].x -= marginX } }
                        } else if (this.isLoop) {
                            if (sl) { for (var i = 0; i < sl.length; i++) { if (sl[i] != this.player) sl[i].move(this.imgWidth - this.width) } }
                            this.x = 0;
                        } else { this.onEnd && this.onEnd() }
                    }
                }
                for (var i = 0, len = this.insideArr.length; i < len; i++) { inside.call(this, this.insideArr[i]) }
            },
            // 绘制场景
            draw() { cg.context.drawImage(cg.loader.loadedImgs[this.src], this.x, this.y, this.width, this.height, 0, 0, this.width, this.height) }
        };
        this.View = view;
    });
})(window, undefined);