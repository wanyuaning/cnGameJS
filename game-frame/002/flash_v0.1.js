
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
            o.FPS && (this.GameLoop.prototype.FPS = o.FPS)		
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
            this.isObject=function(elem){ return elem===Object(elem) }
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
    
    // 帧引擎
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
            FPS:10, 
            init:function(gameObj,o){ 
                o=o||{}; cg.core.extend(this,o); 
                this.gameObj=gameObj; 
                interval = 1000 / this.FPS; 
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

    // 精灵对象
    cnGame.register("cnGame",function(cg){
								  
        var postive_infinity=Number.POSITIVE_INFINITY;			
        
        var Sprite=function(options){ if(!(this instanceof arguments.callee)){ return new arguments.callee(options) }; this.init(options) }
        Sprite.prototype={
            x:0, y:0, minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity, 
            speedX:0, speedY:0, maxSpeedX:Infinity, maxSpeedY:Infinity,
            width:32, height:32, 
            angle:0, minAngle: -Infinity, maxAngle: Infinity, rotateSpeed:0,
            imgX:0, imgY:0,
            aR:0, aX:0, aY:0,
            init:function(options){
                options=options||{};
                cg.core.extend(this, options);
                this.spriteSheetList={};
                if(options.src){
                    this.setCurrentImage(options.src, options.imgX, options.imgY);
                } else if(options.spriteSheet){
                    this.addAnimation(options.spriteSheet);		
                    setCurrentAnimation(options.spriteSheet);
                }
            },
            getRect:function(){
                return new cg.shape.Rect({x:this.x,y:this.y,width:this.width,height:this.height});
                
            },
            addAnimation:function(spriteSheet){
                this.spriteSheetList[spriteSheet.id]=spriteSheet;	
            },
            setCurrentAnimation:function(id){
                if(!this.isCurrentAnimation(id)){
                    if(cg.core.isString(id)){
                        this.spriteSheet=this.spriteSheetList[id];
                        this.image = this.imgX = this.imgY = undefined;
                    } else if(cg.core.isObject(id)){
                        this.spriteSheet=id;
                        this.addAnimation(id);
                        this.image = this.imgX = this.imgY = undefined;
                    }
                }
            },
            isCurrentAnimation:function(id){
                if(cg.core.isString(id)){
                    return (this.spriteSheet&&this.spriteSheet.id===id);
                }
                else if(cg.core.isObject(id)){
                    return this.spriteSheet===id;
                }
            },
            setCurrentImage:function(src, imgX, imgY){
                if(!this.isCurrentImage(src, imgX, imgY)){
                    imgX = imgX||0;
                    imgY = imgY||0;
                    this.image= cg.loader.loadedImgs[src];
                    if(!this.image)	{
                        console.error('Resource "'+ src +'" does not exist, Please add it to the load list.')
                        return;
                    }
                    this.imgX = imgX;
                    this.imgY = imgY;	
                    this.spriteSheet=undefined;
                }
            },
            isCurrentImage:function(src,imgX,imgY){
                imgX=imgX||0;
                imgY=imgY||0;
                var image=this.image;
                if(cg.core.isString(src)){
                    return (image&&image.srcPath===src&&this.imgX===imgX&&this.imgY===imgY);
                }
            },
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
            update:function(duration){
                duration =0.001
                this.speedX = this.speedX + this.aX * duration;	
                if(this.maxSpeedX < 0){ this.maxSpeedX *= -1 };
                if(this.speedX < 0){ this.speedX=Math.max(this.speedX,this.maxSpeedX*-1) } else { this.speedX = Math.min(this.speedX, this.maxSpeedX) };
        
                this.speedY = this.speedY + this.aY * duration;	
                if(this.maxSpeedY < 0){ this.maxSpeedY *= -1 }
                if(this.speedY < 0){ this.speedY = Math.max(this.speedY,this.maxSpeedY*-1) } else { this.speedY = Math.min(this.speedY, this.maxSpeedY) };

                this.rotateSpeed = this.rotateSpeed + this.aR * duration;	
            
                this.rotate(this.rotateSpeed).move(this.speedX, this.speedY);
            
                if(this.spriteSheet){ this.spriteSheet.x = this.x; this.spriteSheet.y = this.y; this.spriteSheet.update() }
            },
            draw(){
                var context=cg.context, halfWith, halfHeight;
                if(this.spriteSheet){
                    this.spriteSheet.x=this.x; this.spriteSheet.y=this.y; this.spriteSheet.draw();
                } else if (this.image){
                    context.save()
                    halfWith=this.width/2; halfHeight=this.height/2;
                    context.translate(this.x+halfWith, this.y+halfHeight);
                    context.rotate(this.angle * Math.PI / 180*-1);                    
                    // 图片，图片剪切起点X/Y, 图片剪切W/H, 画布投影起点X/Y, 画布投影W/H  
                    context.drawImage(this.image, this.imgX, this.imgY, this.width, this.height, -halfWith,-halfHeight, this.width, this.height);
                    context.restore();
                }
            
            },
            move(dx,dy){ dx=dx||0; dy=dy||0; var x=this.x+dx, y=this.y+dy; this.x=Math.min(Math.max(this.minX,x),this.maxX); this.y=Math.min(Math.max(this.minY,y),this.maxY); return this },
            moveTo(x,y){ this.x=Math.min(Math.max(this.minX,x),this.maxX); this.y=Math.min(Math.max(this.minY,y),this.maxY); return this; },
            rotate(da){ da=da||0; var angle=this.angle+da; this.angle=Math.min(Math.max(this.minAngle,angle),this.maxAngle); return this },
            rotateTo(a){ this.angle = Math.min(Math.max(this.minAngle, a), this.maxAngle); return this },
            resize(dw,dh){ this.width += dw; this.height += dh; return this },
            resizeTo(width, height){ this.width = width; this.height = height; return this }
        }
        this.Sprite=Sprite;							  
                                      
    });

    // 精灵表单
    cnGame.register("cnGame",function(cg){
	
        var path = 1, caculateFrames = function(options, parent){
            var FRAMES_MAP_ORDER = {}, frames = [];
            var matrix = options.matrix, w = options.width, h = options.height, count = 0, cf;
            var childFrames = {}; // 子动画
            
            for(var y = 0; y < matrix.length; y++){
                var col = matrix[y]
                for(var x = 0; x < col.length; x++){
                    var cell = col[x];
                    if (cell) {
                        var frame = {x: x*w, y: y*h}
                        FRAMES_MAP_ORDER[count] = frame
                        frames.push(frame)
                        count++
                    }
                }
            }

            if (cf = options.childFrames) {
                for(var i = 0; i < cf.length; i++){
                    var item = {type: 'loop', currentIndex: 0, now: new Date().getTime(), last: new Date().getTime() }, arr = [];
                    cg.core.extend(item, parent)
                    cg.core.extend(item, cf[i])
                    item.indexs.forEach(e => { arr.push(FRAMES_MAP_ORDER[e]) })
                    item.frames = arr
                    childFrames[item.id] = item
                }
            }
            
            return {frames, FRAMES_MAP_ORDER, childFrames};
        }
       
        SpriteSheet=function(id, src, options){
            if(!id || !src || !cg.core.isObject(options)){ console.error('SpriteSheet: Constructor parameter {id:String}, {src:String}, {options:Object}'); return }  
            if(!options.matrix){ console.error('SpriteSheet: Options missing matrix! For example { matrix: [[1,1,1],[1,1,1]] }'); return } 
            if(!options.width || !options.width){ console.error('SpriteSheet: Please specify the frame size! For example { width:50, height:50 }'); return } 
            if(!options.duration) console.info('SpriteSheet: Please specify the frame duration! For example { duration: 1000 }; The default is Game timer')
            if(!(this instanceof arguments.callee)){ return new arguments.callee(id, src, options) }
            this.init(id,src,options);
        }
        SpriteSheet.prototype = {
            /**
             * @param id 查找与引用
             * @param src 雪碧图资源
             * @param options {
             *     x:0, y:0,                        舞台位置
             *     matrix: [[1,1,1],[1,1,1]],       资源矩阵
             *     width: 50, height: 60,           帧尺寸
             *     duration:100,                    帧时长
             *     type: 'loop',                    循环/往复loop/bounce 
             *                                      定义子动画
             *     childFrames: [
             *         {id: 'jump', indexs: [5,6], duration: 1000, type: loop}
             *     ]
             * }
             * 编序规范：
             *     0 1 2 
             *     3 4 5 6
             **/
            init(id, src, options){
                cg.core.extend(this, { x: 0, y: 0, duration: 33.3333, type: 'loop', currentIndex: 0, now: new Date().getTime(), last: new Date().getTime() });
                cg.core.extend(this, options);
                this.id = id;									
                this.src = src;
                this.image = cg.loader.loadedImgs[this.src];
                
                var obj = caculateFrames(options, {x: this.x, y: this.y, duration: this.duration});
                this.frames = obj.frames;
                this.childFrames = obj.childFrames;                // 子组合{'jump': {id: 'jump', indexs: [5,6], duration: 1000, type: loop}}

                this.FRAMES_MAP_ORDER = obj.FRAMES_MAP_ORDER       // 内部查询使用
            },
            createChild(id, options){
                var obj = options, frames = [], _this = this
                obj.indexs.forEach(e => { frames.push(_this.FRAMES_MAP_ORDER[e]) })
                obj.frames = frames
                this.childFrames[id] = obj
            },
            update(id){
                var that = id ? this.childFrames[id] : this;                
                that.now = new Date().getTime();
                var frames = that.frames;
                if((that.now - that.last) > that.duration){
                    var cIndex = that.currentIndex, len = that.frames.length;
                    that.last=that.now;
                    
                    if(cIndex >= len - 1){
                        if (that.type === 'loop'){	
                            return frames[that.currentIndex = 0];	
                        } else if (that.type !== 'bounce'){
                            that.onFinish && that.onFinish();
                            that.onFinish = undefined;
                            return frames[cIndex];
                        }
                    }
                    if((that.type === 'bounce') && ((cIndex>=len-1&&path>0) || (cIndex<=0&&path<0))) path*=(-1);
                    that.currentIndex += path;
                }
                return frames[that.currentIndex];
            },
            index(index, id){
                var that = id ? this.childFrames[id] : this
                that.currentIndex = index;
                return that.frames[that.currentIndex];	
            },
            getCurrentFrame(id){
                var that = id ? this.childFrames[id] : this
                return that.frames[that.currentIndex];	
            },
            draw(id){
                var frame = this.getCurrentFrame(id), w = this.width, h = this.height;
                cg.context.drawImage(this.image, frame.x, frame.y,w, h, this.x, this.y, w, h);
            }
            
        }
        this.SpriteSheet = SpriteSheet;                                            
    });

})(window,undefined);