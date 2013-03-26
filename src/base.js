/**
*
*核心对象
*
**/
(function(win, undefined) {

    var cnGame = {
        /**
        *初始化
        **/
        init: function(id, options) {
            options = options || {};
            this.canvas = this.core.$(id || "canvas");
            this.context = this.canvas.getContext('2d');
            this.title = this.core.$$('title')[0];
            this.size=options.size||[400,400];
            this.canvas.width =this.width= this.size[0];
            this.canvas.height =this.height= this.size[1];
            this.pos=this.getCanvasPos(this.canvas);
            this.fps=options.fps||30;
            this.bgColor=options.bgColor;
            this.spriteList=new cnGame.SpriteList();
            this.bgImageSrc=options.bgImageSrc;
        },
        /**
         *获取canvas在页面的位置
         **/
        getCanvasPos:function(canvas) {
            var left = 0;
            var top = 0;
            while (canvas.offsetParent) {
                left += canvas.offsetLeft;
                top += canvas.offsetTop;
                canvas = canvas.offsetParent;
            }
            return [left, top];
        },
        /**
         *生成类
         **/
        class:function(newClass,parent){
            //静态方法
            newClass.static=function(funcObj){
                cnGame.core.extend(newClass,funcObj);
                return newClass;
            };
            //实例方法
            newClass.methods=function(funcObj){
                cnGame.core.extend(newClass.prototype,funcObj);
                return newClass;parent
            };
            //类继承
            if(this.core.isFunction()){
                var func = function() {};
                func.prototype = parent.prototype;
                newClass.prototype = new func();
                newClass.prototype.constructor = newClass;
                newClass.parent = parent;     
            }
            return newClass;
        },
        /**
        *生成命名空间,并执行相应操作
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
        *返回是否在canvas外
        **/
        isOutsideCanvas:function(elem){
            return elem.pos[0]+elem.size[0]<0||elem.pos[0]>this.canvas.width||elem.pos[1]+elem.size[1]<0||elem.pos[1]>this.canvas.height;
        },
        /**
        *清除画布
        **/
        clean: function() {
            this.context.clearRect(0,0,this.width, this.height);
        },
        /**
        *绘制画布背景色
        **/     
        drawBg:function(){
            if(this.bgColor){
                var bgRect=new this.shape.Rect({width:this.width,height:this.height,style:this.bgColor});//绘制背景色
                bgRect.draw();
            }   
            else if(this.bgImageSrc){
                if(this.loader.loadedImgs[this.bgImageSrc]){
                    this.context.drawImage(this.loader.loadedImgs[this.bgImageSrc],0,0,this.width,this.height);
                }
            }
        }
    }
    win["cnGame"] = cnGame;
    
})(window, undefined);