;(function(win,undefined){
    /**
    * 获取canvas在页面的位置
    **/      
    var getCanvasPos=function(canvas){
        var left = 0;
        var top = 0;
        while (canvas.offsetParent) {
            left += canvas.offsetLeft;
            top += canvas.offsetTop;
            canvas = canvas.offsetParent;
        }
        return [left, top];
    }

    var _cnGame={
        /**
         * 生成命名空间 并执行相应操作
         **/
        register:function(nameSpace,func){
            var nsArr=nameSpace.split(".");
            var parent=win;
            for(var i=0,len=nsArr.length;i<len;i++){
                (typeof parent[nsArr[i]]=='undefined')&&(parent[nsArr[i]]={});
                parent=parent[nsArr[i]];
            }
            if(func){
                func.call(parent,this);    
            }
            return parent;
        },
        /**
         *初始化
         **/
        init:function(id, options){
            options = options||{};
            this.canvas = this.core.$(id||"canvas");    
            this.context = this.canvas.getContext('2d');
            this.width = options.width||800;
            this.height = options.height||600;
            this.title = this.core.$$('title')[0];
            canvasPos=getCanvasPos(this.canvas);
            this.x=canvasPos[0]||0;
            this.y=canvasPos[1]||0;
            this.canvas.width=this.width;
            this.canvas.height=this.height;
            this.canvas.style.left=this.x +"px";
            this.canvas.style.top=this.y +"px";
        }
    }
    win["cnGame"]=_cnGame

    /**
     *
     *基本工具函数模块
     *
     **/
    cnGame.register("cnGame.core",function(cg){
        /**
        按id获取元素
        **/
        this.$=function(id){
            return document.getElementById(id);        
        };
        /**
        按标签名获取元素
        **/
        this.$$=function(tagName,parent){
            parent=parent||document;
            return parent.getElementsByTagName(tagName);    
        };
        /**
        按类名获取元素
        **/
        this.$Class=function(className,parent){
            var arr=[],result=[];
            parent=parent||document;
            arr=this.$$("*");
            for(var i=0,len=arr.length;i<len;i++){
                if((" "+arr[i].className+" ").indexOf(" "+className+" ")>0){
                    result.push(arr[i]);
                }
            }
            return result;    
        };
        /**
        事件绑定
        **/
        this.bindHandler=(function(){
                            
                        if(window.addEventListener){
                            return function(elem,type,handler){
                                elem.addEventListener(type,handler,false);
                                
                            }
                        }
                        else if(window.attachEvent){
                            return function(elem,type,handler){
                                elem.attachEvent("on"+type,handler);
                            }
                        }
        })();
        /**
        事件解除
        **/
        this.removeHandler=(function(){
                        if(window.removeEventListerner){
                            return function(elem,type,handler){
                                elem.removeEventListerner(type,handler,false);
                                
                            }
                        }
                        else if(window.detachEvent){
                            return function(elem,type,handler){
                                elem.detachEvent("on"+type,handler);
                            }
                        }
        })();
        /**
        获取事件对象
        **/
        this.getEventObj=function(eve){
            return eve||win.event;
        };
        /**
        获取事件目标对象
        **/
        this.getEventTarget=function(eve){
            var eve=this.getEventObj(eve);
            return eve.target||eve.srcElement;
        };
        /**
        禁止默认行为
        **/
        this.preventDefault=function(eve){
            if(eve.preventDefault){
                eve.preventDefault();
            }
            else{
                eve.returnValue=false;
            }
            
        };
        /**
        获取对象计算的样式
        **/
        this.getComputerStyle=(function(){
            var body=document.body;
            if(body.currentStyle){
                return function(elem){
                    return elem.currentStyle;
                }
            }
            else if(document.defaultView.getComputedStyle){
                return function(elem){
                    return document.defaultView.getComputedStyle(elem, null);    
                }
            }
            
        })();
        /**
        是否为undefined
        **/
        this.isUndefined=function(elem){
            return typeof elem==='undefined';
        },
        /**
        是否为数组
        **/
        this.isArray=function(elem){
            return Object.prototype.toString.call(elem)==="[object Array]";
        };
        /**
        是否为Object类型
        **/
        this.isObject=function(elem){
            return elem===Object(elem);
        };
        /**
        是否为字符串类型
        **/
        this.isString=function(elem){
            return Object.prototype.toString.call(elem)==="[object String]";
        };
        /**
        是否为数值类型
        **/
        this.isNum=function(elem){
            return Object.prototype.toString.call(elem)==="[object Number]";
        };
        /**
         *复制对象属性
        **/
        this.extend=function(destination,source,isCover){
            var isUndefined=this.isUndefined;
            (isUndefined(isCover))&&(isCover=true);
            for(var name in source){
                if(isCover||isUndefined(destination[name])){
                    destination[name]=source[name];
                }
            
            }
            return destination;
        };
        /**
         *原型继承对象
        **/
        this.inherit=function(child,parent){
            var func=function(){};
            func.prototype=parent.prototype;
            child.prototype=new func();
            child.prototype.constructor=child;
            child.prototype.parent=parent;
        };

    });
}(window,undefined));