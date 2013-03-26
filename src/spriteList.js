/**
 *
 *Sprite列表
 *
**/
cnGame.register("cnGame", function(cg) {
    var SpriteList=cg.class(function(){   
        this.init();  
    }).methods({
        init:function(){
            this.list=[];
        },
        get:function(index){//传入索引或条件函数
            if(cg.core.isNum(index)){
                return this.list[index];
            }
            else if(cg.core.isFunction(index)){
                
                var arr=[];
                for(var i=0,len=this.list.length;i<len;i++){
                    if(index(this.list[i])){
                        arr.push(this.list[i]);
                    }
                }
                return arr;
            }
        },
        add: function(sprite) {
            this.list.push(sprite);
        },
        remove: function(sprite) {//传入sprite或条件函数
            for (var i = 0, len = this.list.length; i < len; i++) {
                if (this.list[i] === sprite||(cg.core.isFunction(sprite)&&sprite(this.list[i]))) {
                    this.list.splice(i, 1);
                    i--;
                    len--;
                }
            }
        },
        clean: function() {
            for (var i = 0, len = this.list.length; i < len; i++) {
                this.list.pop();
            }
        },
        sort: function(func) {
            this.list.sort(func);
        },
        getLength:function(){
            return this.list.length;
        },
        update:function(duration){
            for (var i = 0;i < this.list.length; i++) {
                if(this.list[i]&&this.list[i].update){
                    this.list[i].update(duration);
                }
            }
        },
        draw:function(){
            for (var i = 0;i < this.list.length; i++) {
                if(this.list[i]&&this.list[i].draw){
                    this.list[i].draw();
                }
            }               
            
        }
    });
    this.SpriteList=SpriteList;
});