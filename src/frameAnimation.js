/**
*
*帧动画
*
**/
cnGame.register("cnGame", function(cg) {
    /**
    *帧的增量
    **/
    var path = 1;
    /**
    *获取帧集合
    **/
    var caculateFrames = function() {
        var frames = [];
        var size = this.size;
        var beginPos = this.beginPos;
        var frameSize = this.frameSize;
        var direction = this.direction;

        /* 保存每一帧的精确位置 */
        if (direction == "right") {
            for (var y = beginPos[1]; y < size[1] ; y += frameSize[1]) {
                for (var x = beginPos[0]; x < size[0]; x += frameSize[0]) {
                    var frame = {};
                    frame.startPos=[];
                    frame.startPos[0] = x;
                    frame.startPos[1] = y;
                    frames.push(frame);
                }
            }
        }
        else {
            for (var x = beginPos[0]; x < size[0]; x += frameSize[0]) {
                for (var y = beginPos[1]; y < size[1]; y += frameSize[1]) {
                    var frame = {};
                    frame.startPos=[];
                    frame.startPos[0] = x;
                    frame.startPos[1] = y;
                    frames.push(frame);
                }
            }
        }
        return frames;

    }
    /**
    *包含多帧图像的大图片
    **/
    spriteSheet =cg.class(function(options) {
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(id, src, options);
        }
        this.init(options);
    }).methods({
        /**
        *初始化
        **/
        init: function(options) {
            /**
            *默认值
            **/
            this.id="0";
            this.pos=[0,0];
            this.size=[400,40];
            this.frameSize= [40, 40];//每帧尺寸
            this.frameDuration= 100;//每帧持续时间
            this.direction= "right", //从左到右
            this.beginPos=[0,0];//截取图片的起始位置
            this.loop= false;//是否循环播放
            this.bounce= false;//是否往返播放
            this.scale=1;//缩放比
            this.currentIndex = 0;                  //目前帧索引
            this.context=cg.context;//使用的上下文对象，默认是框架的context
            this.onFinish = null;           //播放完毕后的回调函数
            this.now = new Date().getTime();            //当前时间
            this.last = new Date().getTime();       //上一帧开始时间
            options = options || {};
            cg.core.extend(this, options);
            this.image = cg.loader.loadedImgs[this.src]; //图片对象
            this.frames = caculateFrames.call(this);    //帧信息集合
        },
        /**
        *设置参数
        **/
        setOptions:function(){
            cg.core.extend(this, options);
        },
        /**
        *更新帧
        **/
        update: function() {
            this.now = new Date().getTime();
            var frames = this.frames;
            if ((this.now - this.last) >= this.frameDuration) {//如果间隔大于等于帧间间隔，则update
                var currentIndex = this.currentIndex;
                var length = this.frames.length;
                this.last = this.now;

                if (currentIndex >= length - 1) {
                    if (this.loop) {    //循环
                        return frames[this.currentIndex = 0];
                    }
                    else if (!this.bounce) {//没有循环并且没有往返滚动，则停止在最后一帧
                        this.onFinish && this.onFinish();
                        return frames[currentIndex];
                    }
                }
                if ((this.bounce) && ((currentIndex >= length - 1 && path > 0) || (currentIndex <= 0 && path < 0))) {   //往返
                    path *= (-1);
                }
                this.currentIndex += path;

            }
            return frames[this.currentIndex];
        },
        /**
        *跳到特定帧
        **/
        index: function(index) {
            this.currentIndex = index;
            return this.frames[this.currentIndex];
        },
        /**
        *获取现时帧
        **/
        getCurrentFrame: function() {
            return this.frames[this.currentIndex];
        },
        /**
        *在特定位置绘制该帧
        **/
        draw: function() {

            var currentFrame = this.getCurrentFrame();
            var width = this.frameSize[0];
            var height = this.frameSize[1];
            this.context.drawImage(this.image, currentFrame.startPos[0], currentFrame.startPos[1], width, height, this.pos[0], this.pos[1], width*this.scale, height*this.scale);
            
        }
    });
    this.SpriteSheet = spriteSheet;

});
