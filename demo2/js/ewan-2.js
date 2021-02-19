(function (W, U) {
    W.cnGame = {
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        init: function (id, options) {
            options = options || {};
            this.core.extend(this, options);
            this.canvas = this.core.$(id || "canvas");
            this.canvas.width = this.width;
            this.context = this.canvas.getContext("2d");
            this.canvas.height = this.height;
            var p = this.core.getElementPos(this.canvas);
            this.x = p[0] || 0;
            this.y = p[1] || 0;
            this.canvas.style.left = this.x + "px";
            this.canvas.style.top = this.y + "px";
            !this.title && (this.title = this.core.$t("title")[0]);
        },
        register: function (s, f) {
            var p = W,
                a = s.split(".");
            for (var i = 0; i < a.length; i++) {
                var n = a[i];
                typeof p[n] == "undefined" && (p[n] = {});
                p = p[n];
            }
            f && f.call(p, this);
            return p;
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
            $c(c, p) {
                var t = this.$t("*", p),
                    r = [];
                p = p || document;
                c = " " + c + " ";
                for (var i = 0; i < t.length; i++) {
                    var e = t[i],
                        cN = " " + e.className + " ";
                    cN.indexOf(c) > -1 && r.push(e);
                }
                return r;
            },
            getElementPos: (el) => {
                var l = 0,
                    t = 0;
                while (el.offsetParent) {
                    l += el.offsetLeft;
                    t += el.offsetTop;
                    el = el.offsetParent;
                }
                return [l, t];
            },
            bind: (() =>
                window.addEventListener
                    ? function (e, t, h) {
                          e.addEventListener(t, h, false);
                      }
                    : function (e, t, h) {
                          e.attachEvent("on" + t, h);
                      })(),
            unbind: (() =>
                window.addEventListener
                    ? function (e, t, h) {
                          e.removeEventListerner(t, h, false);
                      }
                    : function (e, t, h) {
                          e.detachEvent("on" + t, h);
                      })(),
            getEvent: (ev) => ev || W.event,
            getTarget: function (ev) {
                ev = this.getEvent(ev);
                return ev.target || ev.srcElement;
            },
            preventDefault: function (ev) {
                ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
            },
            getStyle: (() => {
                var b = document.body || document.documentElement;
                return b.currentStyle ? (e) => e.currentStyle : (e) => document.defaultView.getComputedStyle(e, null);
            })(),
            isUndefined: (x) => typeof x === "undefined",
            isArray: (elem) => Object.prototype.toString.call(elem) === "[object Array]",
            isObject: (elem) => elem === Object(elem),
            isString: (elem) => Object.prototype.toString.call(elem) === "[object String]",
            isNum: (elem) => Object.prototype.toString.call(elem) === "[object Number]",
            extend: function (a, b, c) {
                var U = this.isUndefined;
                U(c) && (c = true);
                for (var key in b) {
                    if (c || U(a[key])) a[key] = b[key];
                }
                return a;
            },
            inherit: function (c, p) {
                var f = function () {};
                f.prototype = p.prototype;
                c.prototype = new f();
                c.prototype.constructor = c;
                c.prototype.parent = p;
            },
        },
    };

    ////////////////////* 资源加载器 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var FILE_TYPE = { json: "json", wav: "audio", mp3: "audio", ogg: "audio", png: "image", jpg: "image", jpeg: "image", gif: "image", bmp: "image", tiff: "image" };
        var load = function (ld, type) {
            return function () {
                ld.count++;
                ld.images[this.srcHold] = this;
                this.onLoad = null;
                ld.onLoad && ld.onLoad(ld.count, ld.total);
                if (ld.count < ld.total) return;
                ld.count = 0;
                if (ld.gameObj && ld.gameObj.initialize) {
                    ld.gameObj.initialize(ld.startOptions);
                    if (cg.loop && !cg.loop.stop) cg.loop.end();
                    cg.loop = new cg.GameLoop(ld.gameObj);
                    cg.loop.start();
                }
            };
        };
        this.loader = {
            total: 0,
            count: 0,
            images: {}, // 图片总数 & 图片已加载数 & 加载完成的资源
            start: function (g, o) {
                cg.spriteList.clean();
                var a = o.srcArray || [];
                this.gameObj = g;
                this.startOptions = o.startOptions;
                this.onLoad = o.onLoad;
                this.total = a.length;
                for (var j = 0; j < a.length; j++) {
                    var p = a[j],
                        s = p.split(".")[1],
                        t = FILE_TYPE[s];
                    if (t === "image") {
                        var i = new Image();
                        cg.core.bind(i, "load", load(this, t));
                        i.src = p;
                        i.srcHold = p;
                    }
                    if (t === "audio") {
                        var a = new Audio(p);
                        cg.core.bind(a, "canplay", load(this, t));
                        a.onload = load(this, t);
                        a.src = p;
                        a.srcHold = p;
                    }
                }
            },
        };
    });

    ////////////////////* 精灵表单 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var path = 1; // 往返运动 1 -1
        var caculateFrames = function (sS) {
            var f = [],
                x,
                y,
                w = sS.width,
                h = sS.height,
                X = sS.beginX,
                Y = sS.beginY,
                s = sS.frameSize,
                d = sS.direction;
            if (d == "right") {
                for (var y = Y; y < h; y += s[1]) {
                    for (var x = X; x < w; x += s[0]) {
                        f.push({ x, y });
                    }
                }
            } else {
                for (var x = X; x < w; x += s[0]) {
                    for (var y = Y; y < h; y += s[1]) {
                        f.push({ x, y });
                    }
                }
            }
            return f;
        };
        function SpriteSheet(id, src, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(id, src, options);
            this.init(id, src, options);
        }
        SpriteSheet.prototype = {
            // 动画位置 & 图片宽高 & 循环播放&往返播放 & 截图图片的起始位置 & 每帧尺寸 & 每帧持续时间 & 读取帧的方向(从左到右或从上到下)
            x: 0,
            y: 0,
            width: 120,
            height: 40,
            loop: false,
            bounce: false,
            beginX: 0,
            beginY: 0,
            frameSize: [40, 40],
            frameDuration: 100,
            direction: "right",
            init(id, src, o) {
                o = o || {};
                cg.core.extend(this, o);
                this.id = id;
                this.image = cg.loader.images[src];
                this.now = new Date().getTime();
                this.currentIndex = 0; // 图片地址&图片对象 & 当前时间 & 目前帧索引
                this.src = src;
                this.frames = caculateFrames(this);
                this.last = new Date().getTime(); // 图片地址&图片对象 & 上一帧开始时间
            },
            update() {
                this.now = new Date().getTime();
                var f = this.frames;
                if (this.now - this.last > this.frameDuration) {
                    //如果间隔大于帧间间隔，则update
                    var i = this.currentIndex,
                        l = f.length;
                    this.last = this.now;
                    if (i >= l - 1) {
                        if (this.loop) return f[(this.currentIndex = 0)];
                        if (!this.bounce) {
                            this.onFinish && this.onFinish();
                            this.onFinish = undefined;
                            return f[i];
                        } // 没有循环和往返 则停止在最后一帧
                    }
                    if (this.bounce && ((i >= l - 1 && path > 0) || (i <= 0 && path < 0))) path *= -1; //往返
                    this.currentIndex += path;
                }
                return f[this.currentIndex];
            },
            // 跳到特定帧
            index(index) {
                this.currentIndex = index;
                return this.frames[index];
            },
            // 获取现时帧
            getCurrentFrame() {
                return this.frames[this.currentIndex];
            },
            // 在特定位置绘制该帧
            draw() {
                var cF = this.getCurrentFrame(),
                    sz = this.frameSize,
                    w = sz[0],
                    h = sz[1];
                cg.context.drawImage(this.image, cF.x, cF.y, w, h, this.x, this.y, w, h);
            },
        };
        this.SpriteSheet = SpriteSheet;
    });

    ////////////////////* 精灵对象 *////////////////////
    cnGame.register("cnGame", function (cg) {
        function Sprite(id, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(id, options);
            this.init(id, options);
        }
        Sprite.prototype = {
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
            maxSpeedX: Infinity,
            maxSpeedY: Infinity,
            maxX: Infinity,
            maxY: Infinity,
            minX: -Infinity,
            minY: -Infinity,
            minAngle: -Infinity,
            maxAngle: Infinity,
            init: function (o) {
                o = o || {};
                cg.core.extend(this, o);
                this.spriteSheetList = {};
                if (this.src) {
                    this.setCurrentImage(this.src, this.imgX, this.imgY);
                } else if (this.spriteSheet) {
                    this.addAnimation(this.spriteSheet);
                    setCurrentAnimation(this.spriteSheet);
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
                if (this.isCurrentAnimation(id)) return;
                if (cg.core.isString(id)) {
                    this.spriteSheet = this.spriteSheetList[id];
                    this.image = this.imgX = this.imgY = undefined;
                } else if (cg.core.isObject(id)) {
                    this.spriteSheet = id;
                    this.addAnimation(id);
                    this.image = this.imgX = this.imgY = undefined;
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
                if (this.isCurrentImage(src, imgX, imgY)) return;
                imgX = imgX || 0;
                imgY = imgY || 0;
                this.image = cg.loader.images[src];
                this.imgX = imgX;
                this.imgY = imgY;
                this.spriteSheet = undefined;
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
                cg.core.extend(this, options);
            },
            // 重置移动参数回到初始值
            resetMovement() {
                this.speedX = this.speedY = this.rotateSpeed = this.aX = this.aY = this.aR = 0;
                this.maxSpeedX = this.maxSpeedY = this.maxX = this.maxY = this.maxAngle = Infinity;
                this.minX = this.minY = this.minAngle = -Infinity;
            },
            // 更新位置和帧动画
            update(duration) {
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
            move(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                var x = this.x + dx,
                    y = this.y + dy;
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            moveTo(x, y) {
                this.x = Math.min(Math.max(this.minX, x), this.maxX);
                this.y = Math.min(Math.max(this.minY, y), this.maxY);
                return this;
            },
            rotate(da) {
                da = da || 0;
                var angle = this.angle + da;
                this.angle = Math.min(Math.max(this.minAngle, angle), this.maxAngle);
                return this;
            },
            rotateTo(a) {
                this.angle = Math.min(Math.max(this.minAngle, a), this.maxAngle);
                return this;
            },
            resize(dw, dh) {
                this.width += dw;
                this.height += dh;
                return this;
            },
            resizeTo(width, height) {
                this.width = width;
                this.height = height;
                return this;
            },
        };
        this.Sprite = Sprite;
    });

    ////////////////////* 精灵列表 *////////////////////
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
            clean() {
                for (var i = 0; i < this.length; i++) {
                    Array.prototype.pop.call(this);
                }
            },
        };
    });

    ////////////////////* 游戏循环 *////////////////////
    cnGame.register("cnGame", function (cg) {
        var timeId, interval;
        var loop = function () {
            var gloop = this;
            return function () {
                if (!gloop.pause && !gloop.stop) {
                    var n = new Date().getTime(),
                        d = (n - gloop.lastTime) / 1000,
                        s = cg.spriteList;
                    gloop.loopDuration = (gloop.startTime - gloop.now) / 1000;
                    if (gloop.gameObj.update) gloop.gameObj.update(d);
                    if (gloop.gameObj.draw) {
                        cg.context.clearRect(0, 0, cg.width, cg.height);
                        gloop.gameObj.draw();
                    }
                    for (var i = 0; i < s.length; i++) {
                        s[i].update(d);
                        s[i].draw();
                    }
                    gloop.lastTime = n;
                }
                timeId = window.setTimeout(arguments.callee, interval);
            };
        };

        function GameLoop(gameObj, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(gameObj, options);
            this.init(gameObj, options);
        }
        GameLoop.prototype = {
            init(g, o) {
                o = o || {};
                o = cg.core.extend({ fps: 24 }, o);
                this.gameObj = g;
                this.fps = o.fps;
                this.pause = false;
                this.stop = true;
                interval = 1000 / this.fps;
            },
            start() {
                if (!this.stop) return;
                var n = new Date().getTime();
                this.stop = false;
                this.startTime = n;
                this.lastTime = n;
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
        this.GameLoop = GameLoop;
    });

    ////////////////////* 输入记录模块 *////////////////////
    cnGame.register("cnGame.input", function (cg) {
        this.mouseX = 0;
        this.mouseY = 0;
        var T = cg.core;
        // 记录鼠标在canvas内的位置
        function recordMouseMove(e) {
            var pageX, pageY, x, y;
            e = T.getEvent(e);
            pageX = e.pageX || e.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
            pageY = e.pageY || e.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
            cg.input.mouseX = pageX - cg.x;
            cg.input.mouseY = pageY - cg.y;
        }
        T.bind(window, "mousemove", recordMouseMove);
        // 被按下的键的集合 & 要求禁止默认行为的键的集合 & 键盘按下触发的处理函数 & 键盘弹起触发的处理函数
        var pressed_keys = {},
            preventDefault_keys = {},
            keydown_callbacks = {},
            keyup_callbacks = {};
        // 键盘按键编码和键名
        var k1 = { 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause", 20: "capslock", 27: "esc", 32: "space", 33: "pageup" },
            k2 = { 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "delete", 91: "leftwindowkey" },
            k3 = { 92: "rightwindowkey", 93: "selectkey", 106: "multiply", 107: "add", 109: "subtract", 110: "decimalpoint", 111: "divide", 144: "numlock" },
            k4 = { 145: "scrollock", 186: "semicolon", 187: "equalsign", 188: "comma", 189: "dash", 190: "period", 191: "forwardslash", 192: "graveaccent" },
            k5 = { 219: "openbracket", 220: "backslash", 221: "closebracket", 222: "singlequote" };
        (numpadkeys = ["numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9"]), (fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"]), (numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), (letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]);
        var k = cnGame.core.extend(k1, k2);
        k = cnGame.core.extend(k, k3);
        k = cnGame.core.extend(k, k4);
        k = cnGame.core.extend(k, k5);
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
        var recordPress = function (e) {
            e = T.getEvent(e);
            var kN = k[e.keyCode];
            pressed_keys[kN] = true;
            if (keydown_callbacks[kN])
                for (var i = 0, len = keydown_callbacks[kN].length; i < len; i++) {
                    keydown_callbacks[kN][i]();
                }
            if (keydown_callbacks["allKeys"])
                for (var i = 0, len = keydown_callbacks["allKeys"].length; i < len; i++) {
                    keydown_callbacks["allKeys"][i]();
                }
            if (preventDefault_keys[kN]) T.preventDefault(e);
        };
        // 记录键盘松开的键
        var recordUp = function (e) {
            e = T.getEvent(e);
            var kN = k[e.keyCode];
            pressed_keys[kN] = false;
            if (keyup_callbacks[kN])
                for (var i = 0, len = keyup_callbacks[kN].length; i < len; i++) {
                    keyup_callbacks[kN][i]();
                }
            if (keyup_callbacks["allKeys"])
                for (var i = 0, len = keyup_callbacks["allKeys"].length; i < len; i++) {
                    keyup_callbacks["allKeys"][i]();
                }
            if (preventDefault_keys[kN]) T.preventDefault(e);
        };
        T.bind(window, "keydown", recordPress);
        T.bind(window, "keyup", recordUp);
        // 判断某个键是否按下
        this.isPressed = function (keyName) {
            return !!pressed_keys[keyName];
        };
        // 禁止某个键按下的默认行为
        this.preventDefault = function (n) {
            if (T.isArray(n)) {
                for (var i = 0; i < n.length; i++) {
                    arguments.callee.call(this, n[i]);
                }
            } else {
                preventDefault_keys[n] = true;
            }
        };
        // 绑定键盘按下事件
        this.onKeyDown = function (k, f) {
            k = k || "allKeys";
            if (cg.core.isUndefined(keydown_callbacks[k])) keydown_callbacks[k] = [];
            keydown_callbacks[k].push(f);
        };
        // 绑定键盘弹起事件
        this.onKeyUp = function (k, f) {
            k = k || "allKeys";
            if (cg.core.isUndefined(keyup_callbacks[k])) keyup_callbacks[k] = [];
            keyup_callbacks[k].push(f);
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

    ////////////////////* canvas基本形状对象 *////////////////////
    cnGame.register("cnGame.shape", function (cg) {
        function resetRightBottom(ele) {
            ele.right = ele.x + ele.width;
            ele.bottom = ele.y + ele.height;
        }
        function Rect(options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(options);
            this.init(options);
        }
        Rect.prototype = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            style: "red",
            isFill: true,
            init(options) {
                options = options || {};
                cg.core.extend(this, options);
                this.setOptions(this);
                resetRightBottom(this);
            },
            setOptions(options) {
                cg.core.extend(this, options);
            },
            draw() {
                var c = cg.context;
                if (this.isFill) {
                    c.fillStyle = this.style;
                    c.fillRect(this.x, this.y, this.width, this.height);
                } else {
                    c.strokeStyle = this.style;
                    c.strokeRect(this.x, this.y, this.width, this.height);
                }
                return this;
            },
            move(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                this.x += dx;
                this.y += dy;
                resetRightBottom(this);
                return this;
            },
            moveTo(x, y) {
                x && (this.x = x);
                y && (this.y = y);
                resetRightBottom(this);
                return this;
            },
            resize(dW, dH) {
                dW = dW || 0;
                dH = dH || 0;
                this.width += dW;
                this.height += dH;
                resetRightBottom(this);
                return this;
            },
            resizeTo(w, h) {
                w && (this.width = w);
                h && (this.height = h);
                resetRightBottom(this);
                return this;
            },
        };

        function Circle(options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(options);
            this.init(options);
        }
        Circle.prototype = {
            x: 100,
            y: 100,
            r: 100,
            startAngle: 0,
            endAngle: Math.PI * 2,
            antiClock: false,
            style: "red",
            isFill: true,
            init(o) {
                o = o || {};
                cg.core.extend(this, o);
            },
            setOptions(options) {
                cg.core.extend(this, options);
            },
            draw() {
                var c = cg.context;
                c.beginPath();
                c.arc(this.x, this.y, this.r, this.startAngle, this.endAngle, this.antiClock);
                c.closePath();
                if (this.isFill) {
                    c.fillStyle = this.style;
                    c.fill();
                } else {
                    c.strokeStyle = this.style;
                    c.stroke();
                }
            },
            move(dx, dy) {
                dx = dx || 0;
                dy = dy || 0;
                this.x += dx;
                this.y += dy;
                return this;
            },
            moveTo(x, y) {
                x = x || this.x;
                y = y || this.y;
                this.x = x;
                this.y = y;
                return this;
            },
            resize(dr) {
                dr = dr || 0;
                this.r += dr;
                return this;
            },
            resizeTo(r) {
                r = r || this.r;
                this.r = r;
                return this;
            },
        };

        function Text(text, options) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(text, options);
            this.init(text, options);
        }
        Text.prototype = {
            x: 100,
            y: 100,
            style: "red",
            isFill: true,
            init(text, options) {
                options = options || {};
                cg.core.extend(this, options);
                this.text = text;
            },
            draw() {
                var c = cg.context;
                this.textAlign && (c.textAlign = this.textAlign);
                this.font && (c.font = this.font);
                this.maxWidth && (c.maxWidth = this.maxWidth);
                this.textBaseline && (c.textBaseline = this.textBaseline);
                if (this.isFill) {
                    c.fillStyle = this.style;
                    this.maxWidth ? c.fillText(this.text, this.x, this.y, this.maxWidth) : c.fillText(this.text, this.x, this.y);
                } else {
                    c.strokeStyle = this.style;
                    this.maxWidth ? c.strokeText(this.text, this.x, this.y, this.maxWidth) : c.strokeText(this.text, this.x, this.y);
                }
            },
            setOptions(options) {
                cg.core.extend(this, options);
            },
        };
        this.Text = Text;
        this.Rect = Rect;
        this.Circle = Circle;
    });

    ////////////////////* 碰撞检测 *////////////////////
    cnGame.register("cnGame.collision", function (cg) {
        this.P_R = (Px, Py, R) => (Px >= R.x && Px <= R.right) || (Py >= R.y && Py <= R.bottom);
        this.R_R = (r, R) => ((r.right >= R.x && r.right <= R.right) || (r.x >= R.x && r.x <= R.right)) && ((r.bottom >= R.y && r.bottom <= R.bottom) || (r.y <= R.bottom && r.bottom >= R.y));
        this.P_C = (Px, Py, C) => Math.pow(Px - C.x, 2) + Math.pow(Py - C.y, 2) < Math.pow(C.r, 2);
        this.C_C = (C1, C2) => Math.pow(C1.x - C2.x, 2) + Math.pow(C1.y - C2.y, 2) < Math.pow((C1.r + C2).r, 2);
    });

    ////////////////////* 精灵列表 *////////////////////
    cnGame.register("cnGame", function (cg) {
        this.spriteList = {
            length: 0,
            add: function (sprite) {
                Array.prototype.push.call(this, sprite);
            },
            remove: function (sprite) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === sprite) Array.prototype.splice.call(this, i, 1);
                }
            },
            clean: function () {
                for (var i = 0; i < this.length; i++) {
                    Array.prototype.pop.call(this);
                }
            },
        };
    });

    ////////////////////* 地图 *////////////////////
    cnGame.register("cnGame", function (cg) {
        function Map(MAP, opt) {
            if (!(this instanceof arguments.callee)) return new arguments.callee(MAP, opt);
            this.init(MAP, opt);
        }
        Map.prototype = {
            cellSize: [32, 32],
            beginX: 0,
            beginY: 0, // 方格宽高 地图起始x 地图起始y
            init(MAP, opt) {
                opt = opt || {};
                cg.core.extend(this, opt);
                this.mapMatrix = MAP;
                this.row = MAP.length;
            },
            // 根据map矩阵绘制map
            draw(opt) {
                //options：{"1":{src:"xxx.png",x:0,y:0},"2":{src:"xxx.png",x:1,y:1}}
                var MAP = this.mapMatrix,
                    bX = this.beginX,
                    bY = this.beginY,
                    cS = this.cellSize,
                    cRow,
                    cCol,
                    cObj,
                    row = this.row,
                    img;
                for (var i = bY, ylen = bY + row * cS[1]; i < ylen; i += cS[1]) {
                    cRow = (i - bY) / cS[1];
                    for (var j = bX, xlen = bX + MAP[cRow].length * cS[0]; j < xlen; j += cS[0]) {
                        cCol = (j - bX) / cS[0];
                        cObj = opt[MAP[cRow][cCol]];
                        cObj.x = cObj.x || 0;
                        cObj.y = cObj.y || 0;
                        img = cg.loader.images[cObj.src];
                        cg.context.drawImage(img, cObj.x, cObj.y, cS[0], cS[1], j, i, cS[0], cS[1]); //绘制特定坐标的图像
                        cg.context.strokeText(cCol + "/" + cRow, cCol * cS[0] + 12, cRow * cS[1] + 25);
                    }
                }
            },
            // 获取特定对象在地图中处于的方格的值
            getPosValue(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                var isUndefined = cg.core.isUndefined;
                y = Math.floor(y / this.cellSize[1]);
                x = Math.floor(x / this.cellSize[0]);
                if (!isUndefined(this.mapMatrix[y]) && !isUndefined(this.mapMatrix[y][x])) return this.mapMatrix[y][x];
                return undefined;
            },
            // 获取特定对象在layer中处于的方格索引
            getCurrentIndex(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                return [Math.floor(x / this.cellSize[0]), Math.floor(y / this.cellSize[1])];
            },
            // 获取特定对象是否刚好与格子重合
            isMatchCell(x, y) {
                if (cg.core.isObject(x)) {
                    y = x.y;
                    x = x.x;
                }
                return x % this.cellSize[0] == 0 && y % this.cellSize[1] == 0;
            },
            // 设置layer对应位置的值
            setPosValue(x, y, value) {
                this.mapMatrix[y][x] = value;
            },
        };
        this.Map = Map;
    });

    ////////////////////* 场景 *////////////////////
    cnGame.register("cnGame", function (cg) {
        // 使指定对象在可视区域view内
        function inside(sprite) {
            var dir = sprite.insideDir;
            if (dir != "y") {
                if (sprite.x < 0) {
                    sprite.x = 0;
                } else if (sprite.x > this.width - sprite.width) {
                    sprite.x = this.width - sprite.width;
                }
            }
            if (dir != "x") {
                if (sprite.y < 0) {
                    sprite.y = 0;
                } else if (sprite.y > this.height - sprite.height) {
                    sprite.y = this.height - sprite.height;
                }
            }
        }

        function View(options) {
            this.init(options);
        }
        View.prototype = {
            width: cg.width,
            height: cg.height,
            imgWidth: cg.width,
            imgHeight: cg.height,
            x: 0,
            y: 0,
            init(o) {
                o = o || {};
                cg.core.extend(this, o);
                this.centerX = this.width / 2;
                this.insideArr = [];
                this.isLoop = false;
                this.isCenterPlayer = false;
            },
            // 使player的位置保持在场景中点之前的移动背景
            centerPlayer(isLoop) {
                isLoop = isLoop || false;
                this.isLoop = isLoop;
                this.isCenterPlayer = true;
            },
            // 使对象的位置保持在场景内
            insideView(sprite, dir) {
                //dir为限定哪个方向在view内，值为x或y，不传则两个方向皆限定
                if (cg.core.isArray(sprite)) {
                    for (var i = 0; i < sprite.length; i++) {
                        arguments.callee.call(this, sprite[i], dir);
                    }
                } else {
                    sprite.insideDir = dir;
                    this.insideArr.push(sprite);
                }
            },
            // 背景移动时的更新
            update(sl) {
                //传入所有sprite的数组
                if (this.isCenterPlayer) {
                    if (this.player.x > this.centerX) {
                        if (this.x < this.imgWidth - this.width) {
                            var marginX = this.player.x - this.centerX;
                            this.x += marginX;
                            if (sl) {
                                for (var i = 0; i < sl.length; i++) {
                                    sl[i] == this.player ? (sl[i].x = this.centerX) : (sl[i].x -= marginX);
                                }
                            }
                        } else if (this.isLoop) {
                            if (sl) {
                                for (var i = 0; i < sl.length; i++) {
                                    if (sl[i] != this.player) sl[i].move(this.imgWidth - this.width);
                                }
                            }
                            this.x = 0;
                        } else {
                            this.onEnd && this.onEnd();
                        }
                    }
                }
                for (var i = 0, len = this.insideArr.length; i < len; i++) {
                    inside.call(this, this.insideArr[i]);
                }
            },
            draw() {
                cg.context.drawImage(cg.loader.loadedImgs[this.src], this.x, this.y, this.width, this.height, 0, 0, this.width, this.height);
            },
        };
        this.View = View;
    });
})(window, undefined);

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
