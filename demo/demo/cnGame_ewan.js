;(function(win,undefined){
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
		init:function(id,options){
            options=options||{};
			this.canvas = this.core.$(id||"canvas");	
			this.context = this.canvas.getContext('2d');
			this.width = options.width||800;
			this.height = options.height||600;
			this.title = this.core.$$('title')[0];
			var canvasPos=getCanvasPos(this.canvas);
			this.x=canvasPos[0]||0;
			this.y=canvasPos[1]||0;
			this.canvas.width=this.width;
			this.canvas.height=this.height;
			this.canvas.style.left=this.x +"px";
			this.canvas.style.top=this.y +"px";
        },
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
		clean:function(){
			this.context.clearRect(this.width,this.height);
		}
	}	  
	win["cnGame"]=_cnGame;

    // 基本工具函数模块
    _cnGame.core = {
        $:id =>  document.getElementById(id),
        $$(tagName,parent){
			parent=parent||document;
			return parent.getElementsByTagName(tagName);	
		},
        $Class(className,parent){
			var arr=[],result=[];
			parent=parent||document;
			arr=this.$$("*");
			for(var i=0,len=arr.length;i<len;i++){
				if((" "+arr[i].className+" ").indexOf(" "+className+" ")>0){
					result.push(arr[i]);
				}
			}
			return result;	
		},
        bindHandler:(function(){
							
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
        })(),
        removeHandler:(function(){
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
        })(),
        getEventObj:function(eve){
			return eve||win.event;
		},
        getEventTarget:function(eve){
			var eve=this.getEventObj(eve);
			return eve.target||eve.srcElement;
		},
        preventDefault:function(eve){
			eve.preventDefault? eve.preventDefault() : eve.returnValue=false;
		},
        getComputerStyle: (function() {
			var body=document.body||document.documentElement;
			if(body.currentStyle){
				return function(elem){
					return elem.currentStyle;
				}
			} else if(document.defaultView.getComputedStyle){
				return function(elem){
					return document.defaultView.getComputedStyle(elem, null);	
				}
			}			
		})(),
        isUndefined: elem => typeof elem==='undefined',
        isArray: elem => Object.prototype.toString.call(elem)==="[object Array]",
        isObject: elem => elem===Object(elem),
        isString: elem => Object.prototype.toString.call(elem)==="[object String]",
        isNum: elem => Object.prototype.toString.call(elem)==="[object Number]",
        extend: function(destination,source,isCover){
			var isUndefined=this.isUndefined;
			(isUndefined(isCover))&&(isCover=true);
			for(var name in source){
				if(isCover||isUndefined(destination[name])){
					destination[name]=source[name];
				}
			}
			return destination;
		},
        inherit: function(child,parent){
			var func=function(){};
			func.prototype=parent.prototype;
			child.prototype=new func();
			child.prototype.constructor=child;
			child.prototype.parent=parent;
		}
    }
    cnGame.Sprite = {
		/**
		 * 初始化
		 **/
		init:function(options){
			
			/**
			 * 默认对象
			 **/	
			var defaultObj={
				x:0,
				y:0,
				imgX:0,
				imgY:0,
				width:32,
				height:32,
				angle:0,
				speedX:0,
				speedY:0,
				rotateSpeed:0,
				aR:0,
				aX:0,
				aY:0,
				maxSpeedX:postive_infinity,
				maxSpeedY:postive_infinity,
				maxX:postive_infinity,
				maxY:postive_infinity,
				minX:-postive_infinity,
				minY:-postive_infinity,
				minAngle:-postive_infinity,
				maxAngle:postive_infinity
			};
			options=options||{};
			options=cg.core.extend(defaultObj,options);
			this.x=options.x;
			this.y=options.y;
			this.angle=options.angle;
			this.width=options.width;
			this.height=options.height;
			this.angle=options.angle;
			this.speedX=options.speedX;
			this.speedY=options.speedY;
			this.rotateSpeed=options.rotateSpeed;
			this.aR=options.aR;
			this.aX=options.aX;
			this.aY=options.aY;
			this.maxSpeedX=options.maxSpeedX;
			this.maxSpeedY=options.maxSpeedY;
			this.maxX=options.maxX;
			this.maxY=options.maxY;
			this.maxAngle=options.maxAngle;
			this.minAngle=options.minAngle;
			this.minX=options.minX;
			this.minY=options.minY;
			this.spriteSheetList={};
			
			if(options.src){	//传入图片路径
				this.setCurrentImage(options.src,options.imgX,options.imgY);
			}
			else if(options.spriteSheet){//传入spriteSheet对象
				this.addAnimation(options.spriteSheet);		
				setCurrentAnimation(options.spriteSheet);
			}
			
		},
		/**
		 *返回包含该sprite的矩形对象
		 **/
		getRect:function(){
			return new cg.shape.Rect({x:this.x,y:this.y,width:this.width,height:this.height});
			
		},
		/**
		 * 添加动画
		 **/
		addAnimation:function(spriteSheet){
			this.spriteSheetList[spriteSheet.id]=spriteSheet;	
		},
		/**
		 * 设置当前显示动画
		 **/
		setCurrentAnimation:function(id){//可传入id或spriteSheet
			if(!this.isCurrentAnimation(id)){
				if(cg.core.isString(id)){
					this.spriteSheet=this.spriteSheetList[id];
					this.image=this.imgX=this.imgY=undefined;
				}
				else if(cg.core.isObject(id)){
					this.spriteSheet=id;
					this.addAnimation(id);
					this.image=this.imgX=this.imgY=undefined;
				}
			}
		
		},
		/**
		 * 判断当前动画是否为该id的动画
		 **/
		isCurrentAnimation:function(id){
			if(cg.core.isString(id)){
				return (this.spriteSheet&&this.spriteSheet.id===id);
			}
			else if(cg.core.isObject(id)){
				return this.spriteSheet===id;
			}
		},
		/**
		 * 设置当前显示图像
		 **/
		setCurrentImage:function(src,imgX,imgY){
			if(!this.isCurrentImage(src,imgX,imgY)){
				imgX=imgX||0;
				imgY=imgY||0;
				this.image=cg.loader.loadedImgs[src];	
				this.imgX=imgX;
				this.imgY=imgY;	
				this.spriteSheet=undefined;
			}
		},
		/**
		 * 判断当前图像是否为该src的图像
		 **/
		isCurrentImage:function(src,imgX,imgY){
			imgX=imgX||0;
			imgY=imgY||0;
			var image=this.image;
			if(cg.core.isString(src)){
				return (image&&image.srcPath===src&&this.imgX===imgX&&this.imgY===imgY);
			}
		},
			/**
		 *设置移动参数
		**/
		setMovement:function(options){
			isUndefined=cg.core.isUndefined;
			isUndefined(options.speedX)?this.speedX=this.speedX:this.speedX=options.speedX;
			isUndefined(options.speedY)?this.speedY=this.speedY:this.speedY=options.speedY;
			isUndefined(options.rotateSpeed)?this.rotateSpeed=this.rotateSpeed:this.rotateSpeed=options.rotateSpeed;
			isUndefined(options.aX)?this.aR=this.aR:this.aR=options.aR;
			isUndefined(options.aX)?this.aX=this.aX:this.aX=options.aX;
			isUndefined(options.aY)?this.aY=this.aY:this.aY=options.aY;
			isUndefined(options.maxX)?this.maxX=this.maxX:this.maxX=options.maxX;
			isUndefined(options.maxY)?this.maxY=this.maxY:this.maxY=options.maxY;
			isUndefined(options.maxAngle)?this.maxAngle=this.maxAngle:this.maxAngle=options.maxAngle;
			isUndefined(options.minAngle)?this.minAngle=this.minAngle:this.minAngle=options.minAngle;
			isUndefined(options.minX)?this.minX=this.minX:this.minX=options.minX;
			isUndefined(options.minY)?this.minY=this.minY:this.minY=options.minY;
			isUndefined(options.maxSpeedX)?this.maxSpeedX=this.maxSpeedX:this.maxSpeedX=options.maxSpeedX;	
			isUndefined(options.maxSpeedY)?this.maxSpeedY=this.maxSpeedY:this.maxSpeedY=options.maxSpeedY;	
			
			
		},
		/**
		 * 重置移动参数回到初始值
		 **/
		resetMovement:function(){
			this.speedX=0;
			this.speedY=0;
			this.rotateSpeed=0;
			this.aX=0;
			this.aY=0;
			this.aR=0;
			this.maxSpeedX=postive_infinity;
			this.maxSpeedY=postive_infinity;
			this.maxX=postive_infinity;
			this.minX=-postive_infinity;
			this.maxY=postive_infinity;
			this.minY=-postive_infinity;
			this.maxAngle=postive_infinity;
			this.minAngle=-postive_infinity;
		},
			/**
		 * 更新位置和帧动画
		 **/
		update:function(duration){//duration:��֡��ʱ ��λ����
			this.speedX=this.speedX+this.aX*duration;	
			if(this.maxSpeedX<0){
				this.maxSpeedX*=-1;
			}
			if(this.speedX<0){
				this.speedX=Math.max(this.speedX,this.maxSpeedX*-1)	;
			}
			else{
				this.speedX=Math.min(this.speedX,this.maxSpeedX);
			}
	
			this.speedY=this.speedY+this.aY*duration;	
			if(this.maxSpeedY<0){
				this.maxSpeedY*=-1;
			}
			if(this.speedY<0){
				this.speedY=Math.max(this.speedY,this.maxSpeedY*-1)	;
			}
			else{
				this.speedY=Math.min(this.speedY,this.maxSpeedY);
			}
			this.rotateSpeed=this.rotateSpeed+this.aR*duration;	
		
			this.rotate(this.rotateSpeed).move(this.speedX,this.speedY);
		
			if(this.spriteSheet){//����spriteSheet����
				this.spriteSheet.x=this.x
				this.spriteSheet.y=this.y;
				this.spriteSheet.update();
			}
		},
		/**
		 * 绘制出sprite
		 **/
		draw:function(){
			var context=cg.context;
			var halfWith;
			var halfHeight;
			if(this.spriteSheet){
				this.spriteSheet.x=this.x
				this.spriteSheet.y=this.y;
				this.spriteSheet.draw();
			}
			else if(this.image){
				context.save()
				halfWith=this.width/2;
				halfHeight=this.height/2;
				context.translate(this.x+halfWith, this.y+halfHeight);
				context.rotate(this.angle * Math.PI / 180*-1);
				context.drawImage(this.image,this.imgX,this.imgY,this.width,this.height,-halfWith,-halfHeight,this.width,this.height);
				context.restore();
			}
		
		},
		/**
		 * 移动一定距离
		 **/
		move:function(dx,dy){
			dx=dx||0;
			dy=dy||0;
			var x=this.x+dx;
			var y=this.y+dy;
			this.x=Math.min(Math.max(this.minX,x),this.maxX);
			this.y=Math.min(Math.max(this.minY,y),this.maxY);
			return this;
			
		},
		/**
		 * 移动到某处
		 **/
		moveTo:function(x,y){
			this.x=Math.min(Math.max(this.minX,x),this.maxX);
			this.y=Math.min(Math.max(this.minY,y),this.maxY);
			return this;
		},
		/**
		 * 旋转一定角度
		 **/
		rotate:function(da){
			da=da||0;
			var angle=this.angle+da;
			
			this.angle=Math.min(Math.max(this.minAngle,angle),this.maxAngle);
			return this;
		},
		/**
		 * 旋转到一定角度
		 **/
		rotateTo:function(a){
			this.angle=Math.min(Math.max(this.minAngle,a),this.maxAngle);
			return this;
			
		},
		/**
		 * 改变一定尺寸
		 **/
		resize:function(dw,dh){
			this.width+=dw;
			this.height+=dh;
			return this;
		},
		/**
		 * 改变到一定尺寸
		**/
		resizeTo:function(width,height){
			this.width=width;
			this.height=height;
			return this;
		}
		
	};
    cnGame.spriteList= {
        length:0,
        add:function(sprite){
            Array.prototype.push.call(this,sprite);
        },
        remove:function(sprite){
            for(var i=0,len=this.length;i<len;i++){
                if(this[i]===sprite){
                    Array.prototype.splice.call(this,i,1);
                }
            }
        },
        clean:function(){
            for(var i=0,len=this.length;i<len;i++){
                Array.prototype.pop.call(this);
            }	
        }
    };

    // 资源加载器
    cnGame.register("cnGame",function(cg){});

    // canvas基本形状对象
    cnGame.register("cnGame.shape",function(cg){});

    // 输入记录模块
    cnGame.register("cnGame.input",function(cg){});
		
    // 碰撞检测
    cnGame.register("cnGame.collision",function(cg){});
 
    // 动画
    cnGame.register("cnGame",function(cg){
        this.SpriteSheet=spriteSheet;	
    });

    // sprite对象
    cnGame.register("cnGame",function(cg){	
        this.Sprite=sprite;		  
    });

    // sprite�б�
    // cnGame.register("cnGame",function(cg){
    //     this.spriteList=spriteList;
    // });

    // 游戏循环
    cnGame.register("cnGame",function(cg){
        this.GameLoop=gameLoop;
    });

    // 地图
    cnGame.register("cnGame",function(cg){
        this.Map=map;				   
    });

    // 场景
    cnGame.register("cnGame",function(cg){
        this.View=view;
    });

})(window,undefined);