/**
*
*资源加载器
*
**/
cnGame.register("cnGame", function(cg) {
    var file_type = {}
    file_type["js"] = "js";
    file_type["json"] = "json";
    file_type["wav"] = "audio";
    file_type["mp3"] = "audio";
    file_type["ogg"] = "audio";
    file_type["png"] = "image";
    file_type["jpg"] = "image";
    file_type["jpeg"] = "image";
    file_type["gif"] = "image";
    file_type["bmp"] = "image";
    file_type["tiff"] = "image";

    /**
    *资源加载完毕的处理程序
    **/
    var resourceLoad = function(self, type) {
        return function() {
            
            type == "image" && (self.loadedImgs[this.srcPath] = this);
            type == "audio" && (self.loadedAudios[this.srcPath] = this);
            if(type == "error"){
                self.errorCount ++;
            }
            else{
                self.loadedCount ++;
            }
            cg.core.removeHandler(this, "load", arguments.callee);//保证图片的onLoad执行一次后销毁
            cg.core.removeHandler(this, "error", arguments.callee);
            cg.core.removeHandler(this, "canplay", arguments.callee);

            self.loadedPercent = Math.floor((self.loadedCount+self.errorCount) / self.sum * 100);
            self.onLoad && self.onLoad(self.loadedPercent);
            if (!type || self.loadedPercent === 100) {//如果没有资源需要加载或者资源已经加载完毕
                self.loadedCount = 0;
                self.errorCount = 0;
                self.loadedPercent = 0;
                type == "image" && (self.loadingImgs = {});
                type == "audio" && (self.loadingAudios = {});
                if (self.gameObj && self.gameObj.initialize) {
                    self.gameObj.initialize(self.startOptions);
                    if (cg.loop && !cg.loop.stop) {//结束上一个循环
                        cg.loop.end();
                    }
                    cg.loop = new cg.GameLoop(self.gameObj,{fps:cg.fps}); //开始新游戏循环
                    cg.loop.start();
                }
            }
        }
    }

    /**
    *图像加载器
    **/
    var loader = {
        sum: 0,         //图片总数
        loadedCount: 0, //图片已加载数
        errorCount:0,
        loadingImgs: {}, //未加载图片集合
        loadedImgs: {}, //已加载图片集合
        loadingAudios: {}, //未加载音频集合
        loadedAudios: {}, //已加载音频集合
        /**
        *图像加载，之后启动游戏
        **/
        start: function(gameObj, options) {//options:srcArray,onload
            options=options||{};
            var srcArr = options.srcArray;
            this.startOptions = options.startOptions; //游戏开始需要的初始化参数
            this.onLoad = options.onLoad;
            this.gameObj = gameObj;
            this.sum = 0;
            cg.spriteList.clean();
            if(!srcArr){//如果没有资源需要加载，直接执行resourceLoad回调
                resourceLoad(this)();
            }
            else if (cg.core.isArray(srcArr) || cg.core.isObject(srcArr)) {

                for (var i in srcArr) {
                    if (srcArr.hasOwnProperty(i)) {
                        this.sum++;
                        var path = srcArr[i];
                        var suffix = srcArr[i].substring(srcArr[i].lastIndexOf(".") + 1);
                        var type = file_type[suffix];
                        if (type == "image") {
                            var img=this.loadingImgs[path] = new Image();
                            cg.core.bindHandler(img, "load", resourceLoad(this, type));
                            cg.core.bindHandler(img, "error", resourceLoad(this, "error"));
                            img.src = path;
                            img.srcPath = path; //没有经过自动变换的src
                        }
                        else if (type == "audio") {
                            var audio=this.loadingAudios[path] = new Audio(path);
                            cg.core.bindHandler(audio, "canplay", resourceLoad(this, type));
                            cg.core.bindHandler(audio, "error", resourceLoad(this, "error"));
                            audio.src = path;
                            audio.srcPath = path; //没有经过自动变换的src
                        }
                        else if (type == "js") {//如果是脚本，加载后执行
                            var head = cg.core.$$("head")[0];
                            var script = document.createElement("script");
                            head.appendChild(script);
                            cg.core.bindHandler(script, "load", resourceLoad(this, type));
                            cg.core.bindHandler(script, "error", resourceLoad(this, "error"));
                            script.src = path;

                        }
                    }
                }

            }

        }
    };
    this.loader = loader;
});