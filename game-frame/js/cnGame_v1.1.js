

(function(win,undefined){
	var canvasPos;
	/**
	*��ȡcanvas��ҳ���λ��
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
		 *��ʼ��
		**/
		init:function(id,options){
			options=options||{};
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
			
		},
		/**
		 *���������ռ�,��ִ����Ӧ����
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
		 *�������
		**/
		clean:function(){
			this.context.clearRect(this.width,this.height);
		}
		
		
		
			
	}
			  
		  	  
	win["cnGame"]=_cnGame;		  
		  
		  



    /**
     *
     *�������ߺ���
    *
    **/
    cnGame.register("cnGame.core",function(cg){
            /**
            ��id��ȡԪ��
            **/
            this.$=function(id){
                return document.getElementById(id);		
            };
            this.$$=function(tagName,parent){
                parent=parent||document;
                return parent.getElementsByTagName(tagName);	
            };
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
            this.getEventObj=function(eve){
                return eve||win.event;
            };
            this.isUndefined=function(elem){
                return typeof elem==='undefined';
            },
            this.isArray=function(elem){
                return Object.prototype.toString.call(elem)==="[object Array]";
            };
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
            this.inherit=function(child,parent){
                var func=function(){};
                func.prototype=parent.prototype;
                child.prototype=new func();
                child.prototype.constructor=child;
                child.prototype.parent=parent;
            };
        
    });

    cnGame.register("cnGame",function(cg){
	
        var file_type = {}
         file_type["json"] = "json"
         file_type["wav"] = "audio"
         file_type["mp3"] = "audio"
        file_type["ogg"] = "audio"
         file_type["png"] = "image"
        file_type["jpg"] = "image"
         file_type["jpeg"] = "image"
        file_type["gif"] = "image"
        file_type["bmp"] = "image"
        file_type["tiff"] = "image"
        var postfix_regexp = /\.([a-zA-Z0-9]+)/;
        /**
         *��Դ������ϵĴ�������
        **/	
        var resourceLoad=function(self,type){
            return function(){
                self.loadedCount+=1;
                type=="image"&&(self.loadedImgs[this.srcPath]=this);
                type=="audio"&&(self.loadedAudios[this.srcPath]=this);
                this.onLoad=null;					//��֤ͼƬ��onLoadִ��һ�κ�����
                self.loadedPercent=Math.floor(self.loadedCount/self.sum*100);
                self.onLoad&&self.onLoad(self.loadedPercent);
                if(self.loadedPercent===100){
                    self.loadedCount=0;
                    self.loadedPercent=0;
                    type=="image"&&(self.loadingImgs={});
                    type=="audio"&&(self.loadingAudios={});
                    if(self.gameObj&&self.gameObj.initialize){
                        self.gameObj.initialize(self.startOptions);
                        if(cg.loop&&!cg.loop.stop){//������һ��ѭ��
                            cg.loop.end();
                        }
                        cg.loop=new cg.GameLoop(self.gameObj);//��ʼ����Ϸѭ��
                        cg.loop.start();
                    }	
                }
            }
        }
        
        /**
         *ͼ�������
        **/	
        var loader={
            sum:0,			//ͼƬ����
            loadedCount:0,	//ͼƬ�Ѽ�����
            loadingImgs:{}, //δ����ͼƬ����
            loadedImgs:{},	//�Ѽ���ͼƬ����
            loadingAudios:{},//δ������Ƶ����
            loadedAudios:{},//�Ѽ�����Ƶ����
            /**
             *ͼ����أ�֮��������Ϸ
            **/	
            start:function(gameObj,options){//options:srcArray,onload
                var srcArr=options.srcArray;
                this.gameObj=gameObj;
                this.startOptions=options.startOptions;//��Ϸ��ʼ��Ҫ�ĳ�ʼ������
                this.onLoad=options.onLoad;
                cg.spriteList.clean();
                
                if(cg.core.isArray(srcArr)){ 
                    this.sum=srcArr.length;
                    for(var i=0,len=srcArr.length;i<len;i++){
                        var path=srcArr[i];
                        var suffix=srcArr[i].substring(srcArr[i].lastIndexOf(".")+1);
                        var type=file_type[suffix];
                        if(type=="image"){		
                            this.loadingImgs[path]=new Image();
                            cg.core.bindHandler(this.loadingImgs[path],"load",resourceLoad(this,type));
                            this.loadingImgs[path].src=path;
                            this.loadingImgs[path].srcPath=path;//û�о����Զ��任��src
                        }
                        else if(type=="audio"){
                            this.loadingAudios[path]=new Audio(path);
                            cg.core.bindHandler(this.loadingAudios[path],"canplay",resourceLoad(this,type));
                            this.loadingAudios[path].onload=resourceLoad(this,type);
                            this.loadingAudios[path].src=path;
                            this.loadingAudios[path].srcPath=path;//û�о����Զ��任��src
                        }
                    }
                        
                }
                
            }
            
        }
        
        
        this.loader=loader;
    });

    cnGame.register("cnGame.shape",function(cg){

        
        
        /**
         *��Բ�θı䵽�ض���С
        **/	
        var text=function(text,options){
            if(!(this instanceof arguments.callee)){
                return new arguments.callee(text,options);
            }
            this.init(text,options);
        
        }
        text.prototype={
            /**
             *��ʼ��
            **/
            init:function(text,options){
                /**
                 *Ĭ��ֵ����
                **/
                var defaultObj={
                    x:100,
                    y:100,
                    style:"red",
                    isFill:true
                    
                };
                options=options||{};
                options=cg.core.extend(defaultObj,options);
                this.setOptions(options);
                this.text=text;		
            },
            /**
            *����
            **/
            draw:function(){
                var context=cg.context;
                (!cg.core.isUndefined(this.font))&&(context.font=this.font);
                (!cg.core.isUndefined(this.textBaseline))&&(context.textBaseline=this.textBaseline);
                (!cg.core.isUndefined(this.textAlign))&&(context.textAlign=this.textAlign);
                (!cg.core.isUndefined(this.maxWidth))&&(context.maxWidth=this.maxWidth);
                if(this.isFill){
                    context.fillStyle=this.style;
                    this.maxWidth?context.fillText(this.text,this.x,this.y,this.maxWidth):context.fillText(this.text,this.x,this.y);
                }
                else{
                    context.strokeStyle=this.style;
                    this.maxWidth?context.strokeText(this.text,this.x,this.y,this.maxWidth):context.strokeText(this.text,this.x,this.y);
                }
            },
            /**
            *���ò���
            **/
            setOptions:function(options){
                this.x=options.x||this.x;
                this.y=options.y||this.y;
                this.maxWidth=options.maxWidth||this.maxWidth;
                this.font=options.font||this.font;
                this.textBaseline=options.textBaseline||this.textBaseline;
                this.textAlign=options.textAlign||this.textAlign;
                this.isFill=options.isFill||this.isFill;
                this.style=options.style||this.style;
                
            }
        }
        
        this.Text=text;
        
    });

    cnGame.register("cnGame.input",function(cg){
											
        this.mouseX=0;
        this.mouseY=0;
        /**
         *��¼�����canvas�ڵ�λ��
        **/	
        var recordMouseMove=function(eve){
            var pageX,pageY,x,y;
            eve=cg.core.getEventObj(eve);
            pageX = eve.pageX || eve.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
            pageY = eve.pageY || eve.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
            cg.input.mouseX=pageX-cg.x;
            cg.input.mouseY=pageY-cg.y;
                
        }		
        
        cg.core.bindHandler(window,"mousemove",recordMouseMove);
        
        /**
         *�����µļ��ļ���
        **/	
        var pressed_keys={};
        /**
         *Ҫ���ֹĬ����Ϊ�ļ��ļ���
        **/	
        var preventDefault_keys={};
        /**
         *���̰��´����Ĵ�������
        **/	
        var keydown_callbacks={};
        /**
         *���̵��𴥷��Ĵ�������
        **/	
        var keyup_callbacks={};
    
        
        /**
         *���̰�������ͼ���
        **/	
        var k=[];
        k[8] = "backspace"
        k[9] = "tab"
        k[13] = "enter"
        k[16] = "shift"
        k[17] = "ctrl"
        k[18] = "alt"
        k[19] = "pause"
        k[20] = "capslock"
        k[27] = "esc"
        k[32] = "space"
        k[33] = "pageup"
        k[34] = "pagedown"
        k[35] = "end"
        k[36] = "home"
        k[37] = "left"
        k[38] = "up"
        k[39] = "right"
        k[40] = "down" 
        k[45] = "insert"
        k[46] = "delete"
        
        k[91] = "leftwindowkey"
        k[92] = "rightwindowkey"
        k[93] = "selectkey"
        k[106] = "multiply"
        k[107] = "add"
        k[109] = "subtract"
        k[110] = "decimalpoint"
        k[111] = "divide"
        
        k[144] = "numlock"
        k[145] = "scrollock"
        k[186] = "semicolon"
        k[187] = "equalsign"
        k[188] = "comma"
        k[189] = "dash"
        k[190] = "period"
        k[191] = "forwardslash"
        k[192] = "graveaccent"
        k[219] = "openbracket"
        k[220] = "backslash"
        k[221] = "closebracket"
        k[222] = "singlequote"
        
        var numpadkeys = ["numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
        var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
        var numbers = ["0","1","2","3","4","5","6","7","8","9"]
        var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
        for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
        for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
        for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
        for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
        
        /**
         *��¼���̰��µļ�
        **/	
        var recordPress=function(eve){
            eve=cg.core.getEventObj(eve);
            var keyName=k[eve.keyCode];
            pressed_keys[keyName]=true;	
            if(keydown_callbacks[keyName]){
                for(var i=0,len=keydown_callbacks[keyName].length;i<len;i++){
                    keydown_callbacks[keyName][i]();
                    
                }
            
            }
            if(keydown_callbacks["allKeys"]){
                for(var i=0,len=keydown_callbacks["allKeys"].length;i<len;i++){
                    keydown_callbacks["allKeys"][i]();
                    
                }
            }
            if(preventDefault_keys[keyName]){
                cg.core.preventDefault(eve);
            }
        }
        /**
         *��¼�����ɿ��ļ�
        **/	
        var recordUp=function(eve){
            eve=cg.core.getEventObj(eve);
            var keyName=k[eve.keyCode];
            pressed_keys[keyName]=false;
            if(keyup_callbacks[keyName]){
                for(var i=0,len=keyup_callbacks[keyName].length;i<len;i++){
                    keyup_callbacks[keyName][i]();
                    
                }	
            }
            if(keyup_callbacks["allKeys"]){
                for(var i=0,len=keyup_callbacks["allKeys"].length;i<len;i++){
                    keyup_callbacks["allKeys"][i]();
                    
                }
            }
            if(preventDefault_keys[keyName]){
                cg.core.preventDefault(eve);
            }
        }
        cg.core.bindHandler(window,"keydown",recordPress);
        cg.core.bindHandler(window,"keyup",recordUp);
        
        this.preventDefault=function(keyName){
            if(cg.core.isArray(keyName)){
                for(var i=0,len=keyName.length;i<len;i++){
                    arguments.callee.call(this,keyName[i]);
                }
            }
            else{
                preventDefault_keys[keyName]=true;
            }
        }
        /**
         *�󶨼��̰����¼�
        **/	
        this.onKeyDown=function(keyName,handler){
            keyName=keyName||"allKeys";
            if(cg.core.isUndefined(keydown_callbacks[keyName])){
                keydown_callbacks[keyName]=[];							
            }
            keydown_callbacks[keyName].push(handler);
        
        }
        
        						
    });

    cnGame.register("cnGame",function(cg){
								  
        var postive_infinity=Number.POSITIVE_INFINITY;			
        
        var sprite=function(id,options){
            if(!(this instanceof arguments.callee)){
                return new arguments.callee(id,options);
            }
            this.init(id,options);
        }
        sprite.prototype={
            /**
             *��ʼ��
            **/
            init:function(options){
                
                /**
                 *Ĭ�϶���
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
                
                if(options.src){	//����ͼƬ·��
                    this.setCurrentImage(options.src,options.imgX,options.imgY);
                }
                else if(options.spriteSheet){//����spriteSheet����
                    this.addAnimation(options.spriteSheet);		
                    setCurrentAnimation(options.spriteSheet);
                }
                
            },
            
        }
        this.Sprite=sprite;							  
                                      
    });

    cnGame.register("cnGame",function(cg){
								  
        var spriteList={
            length:0,
            clean:function(){
                for(var i=0,len=this.length;i<len;i++){
                    Array.prototype.pop.call(this);
                }	
            }
        }
        this.spriteList=spriteList;
    });

    cnGame.register("cnGame",function(cg){

        var timeId;
        var interval;
        /**
        *ѭ������
        **/	
        var loop=function(){
            var self=this;
            return function(){
                if(!self.pause&&!self.stop){
                    var now=new Date().getTime();
                    var duration=(now-self.lastTime)/1000;//֡��ʱ
                    var spriteList=cg.spriteList;
                    self.loopDuration=(self.startTime-self.now)/1000;
            
                    if(self.gameObj.update){//������Ϸ�����update
                        self.gameObj.update(duration);
                    }
                    if(self.gameObj.draw){
                        cg.context.clearRect(0,0,cg.width,cg.height);
                        self.gameObj.draw();
                    }
                    for(var i=0,len=spriteList.length;i<len;i++){//��������sprite
                    
                        spriteList[i].update(duration);
                        spriteList[i].draw();
                    }
                    self.lastTime=now;
                }
                timeId=window.setTimeout(arguments.callee,interval);
            }
        }
        
        var gameLoop=function(gameObj,options){
        
            if(!(this instanceof arguments.callee)){
                return new arguments.callee(gameObj,options);
            }
            this.init(gameObj,options);	
        }
        gameLoop.prototype={
            /**
             *��ʼ��
            **/
            init:function(gameObj,options){
                /**
                 *Ĭ�϶���
                **/	
                var defaultObj={
                    fps:30
                };
                options=options||{};
                
                options=cg.core.extend(defaultObj,options);
                this.gameObj=gameObj;
                this.fps=options.fps;
                interval=1000/this.fps;
                
                this.pause=false;
                this.stop=true;
            },
            start:function(){
                if(this.stop){		//����ǽ���״̬����Կ�ʼ
                    this.stop=false;
                    var now=new Date().getTime();
                    this.startTime=now;
                    this.lastTime=now;
                    this.loopDuration=0;	
                    loop.call(this)();	
                }	
            },	
            
        }
        this.GameLoop=gameLoop;
    });



})(window,undefined);

