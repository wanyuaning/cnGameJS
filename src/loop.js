/**
*
*游戏循环
*
**/
cnGame.register("cnGame", function(cg) {

    var timeId;
    var delay;
    /**
    *循环方法
    **/
    var loop = function() {
        var self = this;
        var currentFpsArr=[];

        return function() {

            var now = new Date().getTime();
            var duration = (now - self.lastTime); //帧历时

            if (!self.pause && !self.stop&&duration) {

                currentFpsArr.push(1000/duration);//计算实际平均fps
                if(currentFpsArr.length>=20){
                    var sumFps=0;
                    var fps;
                    while(fps=currentFpsArr.pop()){
                        sumFps+=fps;
                    }
                    self.avgFPS=Math.round(sumFps/20);

                }
                var Animation = cg.Animation;
                self.loopDuration = (self.startTime - now) / 1000;

                if (self.gameObj.update) {//调用游戏对象的update
                    self.gameObj.update(duration / 1000);
                }
                
                cg.clean();
                cg.drawBg();//绘制背景色
                if (self.gameObj.draw) {
                    self.gameObj.draw(duration / 1000);
                }
                //动画队列更新
                Animation.update();
                //更新所有sprite
                cg.spriteList.update(duration / 1000);                    
                cg.spriteList.draw();  

                if (duration > self.interval) {//修正delay时间
                    delay = Math.max(1, self.interval - (duration - self.interval));
                }
                else{
                    delay=self.interval;
                }
            }
            self.lastTime = now;
            timeId = window.setTimeout(arguments.callee, delay); 
        }
    };
    /**
    *游戏循环构造函数
    **/
    var gameLoop =cg.class(function(gameObj, options) {

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(gameObj, options);
        }
        this.init(gameObj, options);
    }).methods({
        /**
        *初始化
        **/
        init: function(gameObj, options) {
            /**
            *默认对象
            **/
            var defaultObj = {
                fps: 30
            };
            options = options || {};
            options = cg.core.extend(defaultObj, options);
            this.gameObj = gameObj;
            this.avgFPS=this.fps = options.fps;
            this.interval = delay = 1000 / this.fps;

            this.pause = false;
            this.stop = true;
        },

        /**
        *开始循环
        **/
        start: function() {
            if (this.stop) {        //如果是结束状态则可以开始
                this.stop = false;
                var now = new Date().getTime();
                this.startTime = now;
                this.lastTime = now;
                this.loopDuration = 0;
                window.setTimeout(loop.call(this),delay);
            }
        },  /**
     *继续循环
    **/
        run: function() {
            this.pause = false;
        },
        /**
        *暂停循环
        **/
        pause: function() {
            this.pause = true;
        },
        /**
        *停止循环
        **/
        end: function() {
            this.stop = true;
            window.clearTimeout(timeId);
        }
    });
    this.GameLoop = gameLoop;
});