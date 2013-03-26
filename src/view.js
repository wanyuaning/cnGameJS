/**
*
*场景
*
**/
cnGame.register("cnGame", function(cg) {

    var view = cg.class(function(options) {
        this.init(options);

    }).methods({

        /**
        *初始化
        **/
        init: function(options) {
            /**
            *默认对象
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
            this.map=options.map;//view使用的地图对象
        },
        /**
        *使player的位置保持在场景中点之前的移动背景
        **/
        centerElem: function(elem,isInnerView) {
            this.elemToCenter=elem;
            this.isInnerView=isInnerView;
        },
        /**
        *取消对游戏元素的居中
        **/
        cancelCenter:function(){
            this.elemToCenter=undefined;
        },
        /**
        *更新
        **/
        update:function(){
            var elem=this.elemToCenter;
            if(elem){
                
                var map=this.map;
                var dir=this.centerDir;
            
                if(dir!="y"){//x方向居中
                    this.x=Math.max(map.x,Math.min(map.width-this.width,elem.x-this.width/2));
                    
                }
                if(dir!="x"){//y方向居中
                    this.y=Math.max(map.y,Math.min(map.height-this.height,elem.y-this.height/2));   
                }
                if(this.isInnerView){

                    if(elem.x<this.x){
                        elem.x=this.x;  
                    }
                    else if(elem.x>this.x+this.width-elem.width){
                        elem.x=this.x+this.width-elem.width;
                    }
                    if(elem.y<this.y){
                        elem.y=this.y;  
                    }
                    else if(elem.y>this.y+this.height-elem.height){
                        elem.y=this.y+this.height-elem.height;
                    }
            
                    
                }
            }
        },
        /**
        *判断对象是否在view内
        **/
        isPartlyInsideView:function(sprite){
            var spriteRect=sprite.getRect();
            var viewRect=this.getRect();
            return cg.collision.col_Between_Rects(spriteRect,viewRect);
            
        },
        /**
        *使坐标相对于view
        **/
        applyInView:function(func){ 
            cg.context.save();
            cg.context.translate(-this.x, -this.y);
            func();
            cg.context.restore();
        },
        /**
        *返回包含该view的矩形对象
        **/
        getRect: function() {
            return new cg.shape.Rect({ x: this.x, y: this.y, width: this.width, height: this.height });
        }

    });
    this.View = view;
});
