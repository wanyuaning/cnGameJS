
(function(win,undefined){
	var ps, Ps=function(canvas){ var left = 0, top = 0; while (canvas.offsetParent) { left += canvas.offsetLeft; top += canvas.offsetTop; canvas = canvas.offsetParent }; return [left, top] }	
	var _cnGame={
		init:function(id,o){
			o=o||{}; 
            var $ = this.core.$, $$ = this.core.$$;
			this.canvas = $(id||"canvas"); 
            this.context = this.canvas.getContext('2d'); 
            this.width = o.width||800; 
            this.height = o.height||600; 
            this.title = $$('title')[0]; ps=Ps(this.canvas);
			this.x=ps[0]||0; 
            this.y=ps[1]||0; 
            this.canvas.width=this.width; 
            this.canvas.height=this.height; 
            this.canvas.style.left=this.x +"px"; 
            this.canvas.style.top=this.y +"px";			
		},
		register:function(nameSpace,func){ 
            var A=nameSpace.split("."), p=win; 
            for(var i=0;i<A.length;i++){ (typeof p[A[i]]=='undefined')&&(p[A[i]]={}); p=p[A[i]] }; 
            if(func){ func.call(p,this) }; return p 
        },
		clean:function(){ this.context.clearRect(this.width,this.height) }
	}
	win["cnGame"]=_cnGame;
    cnGame.register("cnGame.core",function(cg){
            this.$=function(id){ return document.getElementById(id) }; this.$$=function(tagName,parent){ parent=parent||document; return parent.getElementsByTagName(tagName) };
            this.bindHandler=(function(){ if(window.addEventListener){ return function(e,t,fn){ e.addEventListener(t,fn,false) } } else if(window.attachEvent){ return function(e,t,fn){ e.attachEvent("on"+t,fn) } } })();
            this.preventDefault=function(eve){ if(eve.preventDefault){ eve.preventDefault() } else { eve.returnValue=false } };
            this.getEventObj=function(eve){ return eve||win.event }; this.isUndefined=function(elem){ return typeof elem==='undefined' },
            this.isArray=function(elem){ return Object.prototype.toString.call(elem)==="[object Array]" };
            this.isString=function(elem){ return Object.prototype.toString.call(elem)==="[object String]" };
            this.extend=function(o1,o2,isCover){ var isU=this.isUndefined; (isU(isCover))&&(isCover=true); for(var name in o2){ if(isCover||isU(o1[name])){ o1[name]=o2[name] } }; return o1 };
            this.inherit=function(child,parent){ var func=function(){}; func.prototype=parent.prototype; child.prototype=new func(); child.prototype.constructor=child; child.prototype.parent=parent };
    });
    cnGame.register("cnGame",function(cg){	
        var f = {"json": "json", "wav": "audio", "mp3": "audio", "ogg":"audio", "png": "image", "jpg": "image", "jpeg": "image", "gif": "image", "bmp": "image", "tiff": "image"}
        var resourceLoad=function(l,t){ // loader type
            return function(){
                l.loadedCount+=1; 
                t=="image"&&(l.loadedImgs[this.srcPath]=this); 
                t=="audio"&&(l.loadedAudios[this.srcPath]=this);
                this.onLoad=null; l.loadedPercent=Math.floor(l.loadedCount/l.sum*100); 
                l.onLoad&&l.onLoad(l.loadedPercent);
                if(l.loadedPercent<100) return;
                l.loadedCount=0; l.loadedPercent=0; t=="image"&&(l.loadingImgs={}); t=="audio"&&(l.loadingAudios={});
                if(l.gameObj&&l.gameObj.initialize){ 
                    l.gameObj.initialize(l.startOptions);
                    if(cg.loop&&!cg.loop.stop) cg.loop.end();
                    cg.loop=new cg.GameLoop(l.gameObj);
                    cg.loop.start() 
                }
            }
        }        
        this.loader={
            sum:0, loadedCount:0, loadingImgs:{}, loadedImgs:{}, loadingAudios:{}, loadedAudios:{},            
            start:function(gameObj,options){
                var A=options.srcArray; 
                this.gameObj=gameObj; 
                this.startOptions=options.startOptions; 
                this.onLoad=options.onLoad; 
                cg.spriteList.clean(); 
                this.sum=A.length;
                for(var i=0;i<A.length;i++){
                    var p=A[i], s=A[i].substring(A[i].lastIndexOf(".")+1), t=f[s], b = cg.core.bindHandler, r = resourceLoad;
                    if(t=="image"){ 
                        this.loadingImgs[p]=new Image(); 
                        b(this.loadingImgs[p],"load",r(this,t)); 
                        this.loadingImgs[p].src=p; 
                        this.loadingImgs[p].srcPath=p 
                    } 
                    else if(t=="audio"){ this.loadingAudios[p]=new Audio(p); b(this.loadingAudios[p],"canplay",r(this,t)); this.loadingAudios[p].onload=r(this,t); this.loadingAudios[p].src=p; this.loadingAudios[p].srcPath=p}
                }
            }
        }
    });
    cnGame.register("cnGame.shape",function(cg){
        function text(text,options){ if(!(this instanceof arguments.callee)){ return new arguments.callee(text,options); }; this.init(text,options) }
        text.prototype={
            x:100, y:100, style:"red", isFill:true,
            init:function(text,options){ options=options||{}; cg.core.extend(this,options); this.text=text },
            draw:function(){
                var c=cg.context, u = cg.core.isUndefined;
                (!u(this.font))&&(c.font=this.font); (!u(this.textBaseline))&&(c.textBaseline=this.textBaseline); (!u(this.textAlign))&&(c.textAlign=this.textAlign); (!u(this.maxWidth))&&(c.maxWidth=this.maxWidth);
                if(this.isFill){ c.fillStyle=this.style; this.maxWidth?c.fillText(this.text,this.x,this.y,this.maxWidth):c.fillText(this.text,this.x,this.y) } 
                else { c.strokeStyle=this.style; this.maxWidth?c.strokeText(this.text,this.x,this.y,this.maxWidth):c.strokeText(this.text,this.x,this.y) }
            },
            setOptions:function(options){ options = options || {}; cg.core.extend(this, options) }
        }; this.Text = text
    });
    cnGame.register("cnGame.input",function(cg){ var k={}; this.preventDefault=function(n){ if(cg.core.isArray(n)){ for(var i=0;i<n.length;i++){ arguments.callee.call(this,n[i]) } } else{ k[n]=true } } });
    cnGame.register("cnGame",function(cg){
        function sprite(id,options){ if(!(this instanceof arguments.callee)){ return new arguments.callee(id,options) }; this.init(id,options) }
        sprite.prototype={
            x:0, y:0, imgX:0, imgY:0, width:32, height:32, angle:0, speedX:0, speedY:0, rotateSpeed:0, aR:0, aX:0, aY:0, 
            maxSpeedX:Infinity, maxSpeedY:Infinity, maxX:Infinity, maxY:Infinity, minX:-Infinity, minY:-Infinity, minAngle:-Infinity, maxAngle:Infinity, spriteSheetList: {},
            init:function(o){ var o=o || {}; cg.core.extend(this, o); if(o.src){ this.setCurrentImage(o.src,o.imgX,o.imgY) } else if(o.spriteSheet){ this.addAnimation(o.spriteSheet); setCurrentAnimation(o.spriteSheet) } }
        } 
        this.Sprite = sprite    
    });
    cnGame.register("cnGame",function(cg){ 
        var spriteList={ 
            length:0, 
            clean:function(){ 
                for(var i=0;i<this.length;i++){ 
                    Array.prototype.pop.call(this) 
                } 
            } 
        }; 
        this.spriteList=spriteList 
    });
    
    cnGame.register("cnGame",function(cg){
        var timeId, interval,count = 0, loop=function(){
            var gLoop=this;
            return function(){
                console.log('count', count);                
                if(!gLoop.pause&&!gLoop.stop){ 
                    var n=new Date().getTime(), d=(n-gLoop.lastTime)/1000, spriteList=cg.spriteList; 
                    gLoop.loopDuration = d;            
                    if(gLoop.gameObj.update){ gLoop.gameObj.update(d) } 
                    if(gLoop.gameObj.draw){ cg.context.clearRect(0,0,cg.width,cg.height); gLoop.gameObj.draw() }; 
                    for(var i=0;i<spriteList.length;i++){ spriteList[i].update(d); spriteList[i].draw() }; 
                    gLoop.lastTime=n;
                }
                count++
                timeId=window.setTimeout(arguments.callee,interval);
            }
        }        
        function gameLoop(gameObj,options){ if(!(this instanceof arguments.callee)){ return new arguments.callee(gameObj,options) }; this.init(gameObj,options) }
        gameLoop.prototype={ 
            fps:1, 
            init:function(gameObj,o){ 
                o=o||{}; cg.core.extend(this,o); 
                this.gameObj=gameObj; 
                interval=1000/this.fps; 
                this.pause=false; 
                this.stop=true 
            },
            start:function(){ 
                if(this.stop){ 
                    this.stop=false; 
                    var now=new Date().getTime(); 
                    this.startTime=now; 
                    this.lastTime=now; 
                    this.loopDuration=0; 
                    loop.call(this)() 
                }	
            },	
            run:function(){ this.pause=false; loop.call(this)() },
            pauses:function(){ window.clearTimeout(timeId); this.pause=true },
        }
        this.GameLoop = gameLoop
    });


    cnGame.register("cnGame",function(cg){
								  
        var postive_infinity=Number.POSITIVE_INFINITY;			
        
        var sprite=function(options){
            if(!(this instanceof arguments.callee)){
                return new arguments.callee(options);
            }
            this.init(options);
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
                    console.log('options.src',options.src);
                    
                    this.setCurrentImage(options.src,options.imgX,options.imgY);
                } else if(options.spriteSheet){//����spriteSheet����
                    this.addAnimation(options.spriteSheet);		
                    setCurrentAnimation(options.spriteSheet);
                }
                
            },
            /**
             *���ذ�����sprite�ľ��ζ���
            **/
            getRect:function(){
                return new cg.shape.Rect({x:this.x,y:this.y,width:this.width,height:this.height});
                
            },
            /**
             *���Ӷ���
            **/
            addAnimation:function(spriteSheet){
                this.spriteSheetList[spriteSheet.id]=spriteSheet;	
            },
            /**
             *���õ�ǰ��ʾ����
            **/
            setCurrentAnimation:function(id){//�ɴ���id��spriteSheet
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
             *�жϵ�ǰ�����Ƿ�Ϊ��id�Ķ���
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
             *���õ�ǰ��ʾͼ��
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
             *�жϵ�ǰͼ���Ƿ�Ϊ��src��ͼ��
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
             *�����ƶ�����
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
             *�����ƶ������ص���ʼֵ
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
             *����λ�ú�֡����
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
             *���Ƴ�sprite
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
             *�ƶ�һ������
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
             *�ƶ���ĳ��
            **/
            moveTo:function(x,y){
                this.x=Math.min(Math.max(this.minX,x),this.maxX);
                this.y=Math.min(Math.max(this.minY,y),this.maxY);
                return this;
            },
            /**
             *��תһ���Ƕ�
            **/
            rotate:function(da){
                da=da||0;
                var angle=this.angle+da;
                
                this.angle=Math.min(Math.max(this.minAngle,angle),this.maxAngle);
                return this;
            },
            /**
             *��ת��һ���Ƕ�
            **/
            rotateTo:function(a){
                this.angle=Math.min(Math.max(this.minAngle,a),this.maxAngle);
                return this;
                
            },
            /**
             *�ı�һ���ߴ�
            **/
            resize:function(dw,dh){
                this.width+=dw;
                this.height+=dh;
                return this;
            },
            /**
             *�ı䵽һ���ߴ�
            **/
            resizeTo:function(width,height){
                this.width=width;
                this.height=height;
                return this;
            }
            
        }
        this.Sprite=sprite;							  
                                      
    });

    cnGame.register("cnGame",function(cg){
	
        /**
         *֡������
        **/
        var path=1;
            
        /**
         *��ȡ֡����
        **/
        var caculateFrames=function(options){
            var frames=[];
            var width=options.width;
            var height=options.height;
            var beginX=options.beginX;
            var beginY=options.beginY;
            var frameSize=options.frameSize;
            var direction=options.direction;
            var x,y;
            /* ����ÿһ֡�ľ�ȷλ�� */
            if(direction=="right"){
                for(var y=beginY;y<height;y+=frameSize[1]){
                    for(var x=beginX;x<width;x+=frameSize[0]){
                        var frame={};
                        frame.x=x;
                        frame.y=y;
                        frames.push(frame);
                    
                    }
                    
                }
            }
            else{
                for(var x=beginX;x<width;x+=frameSize[0]){
                    for(var y=beginY;y<height;y+=frameSize[1]){
                        var frame={};
                        frame.x=x;
                        frame.y=y;
                        frames.push(frame);
                    
                    }
                    
                }		
                
            }
            return frames;
            
        }
        /**
         *������֡ͼ��Ĵ�ͼƬ
        **/	
        spriteSheet=function(id,src,options){
            if(!(this instanceof arguments.callee)){
                return new arguments.callee(id,src,options);
            }
            this.init(id,src,options);
        }
        spriteSheet.prototype={
            /**
             *��ʼ��
            **/
            init:function(id,src,options){
                
                /**
                 *Ĭ�϶���
                **/	
                var defaultObj={
                    x:0,
                    y:0,
                    width:120,
                    height:40,
                    frameSize:[40,40],
                    frameDuration:100,
                    direction:"right",	//������
                    beginX:0,
                    beginY:0,
                    loop:false,
                    bounce:false		
                };
                options=options||{};
                options=cg.core.extend(defaultObj,options);
                this.id=id;									//spriteSheet��id
                this.src=src;								//ͼƬ��ַ
                this.x=options.x;							//����Xλ��
                this.y=options.y;							//����Yλ��
                this.width=options.width;					//ͼƬ�Ŀ���
                this.height=options.height;					//ͼƬ�ĸ߶�
                this.image=cg.loader.loadedImgs[this.src]; //ͼƬ����
                this.frameSize=options.frameSize;			//ÿ֡�ߴ�
                this.frameDuration=options.frameDuration;	//ÿ֡����ʱ��
                this.direction=options.direction;			//��ȡ֡�ķ��򣨴������һ���ϵ��£�
                this.currentIndex=0;						//Ŀǰ֡����
                this.beginX=options.beginX;					//��ȡͼƬ����ʼλ��X
                this.beginY=options.beginY;					//��ͼͼƬ����ʼλ��Y
                this.loop=options.loop;						//�Ƿ�ѭ������
                this.bounce=options.bounce;					//�Ƿ���������
                this.onFinish=options.onFinish;				//������Ϻ�Ļص�����
                this.frames=caculateFrames(options);		//֡��Ϣ����
                this.now=new Date().getTime();				//��ǰʱ��
                this.last=new Date().getTime();			//��һ֡��ʼʱ��
            },
            /**
             *����֡
            **/	
            update:function(){
                
                this.now=new Date().getTime();
                var frames=this.frames;
                if((this.now-this.last)>this.frameDuration){//����������֡��������update
                    var currentIndex=this.currentIndex;
                    var length=this.frames.length;
                    this.last=this.now;
                    
                    if(currentIndex>=length-1){
                        if(this.loop){	//ѭ��
                            return frames[this.currentIndex=0];	
                        } else if(!this.bounce){//û��ѭ������û��������������ֹͣ�����һ֡
                            this.onFinish&&this.onFinish();
                            this.onFinish=undefined;
                            return frames[currentIndex];
                        }
                    }
                    if((this.bounce)&&((currentIndex>=length-1&&path>0)||(currentIndex<=0&&path<0))){	//����
                        path*=(-1);
                    }
                    this.currentIndex+=path;
                    
                }
                return frames[this.currentIndex];
            },
            /**
             *�����ض�֡
            **/
            index:function(index){
                this.currentIndex=index;
                return this.frames[this.currentIndex];	
            },
            /**
             *��ȡ��ʱ֡
            **/
            getCurrentFrame:function(){
                return this.frames[this.currentIndex];	
            },
            /**
             *���ض�λ�û��Ƹ�֡
            **/
            draw:function(){
                
                var currentFrame=this.getCurrentFrame();
                var width=this.frameSize[0];
                var height=this.frameSize[1];
                cg.context.drawImage(this.image,currentFrame.x,currentFrame.y,width,height,this.x,this.y,width,height);
            }
            
        }
        this.SpriteSheet=spriteSheet;
                                            
    });

})(window,undefined);