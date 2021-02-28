
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
    cnGame.register("cnGame",function(cg){ var spriteList={ length:0, clean:function(){ for(var i=0;i<this.length;i++){ Array.prototype.pop.call(this) } } }; this.spriteList=spriteList });
    
    cnGame.register("cnGame",function(cg){
        var timeId, interval, loop=function(){
            var gLoop=this;
            return function(){
                if(!gLoop.pause&&!gLoop.stop){ 
                    var n=new Date().getTime(), d=(n-gLoop.lastTime)/1000, spriteList=cg.spriteList; 
                    gLoop.loopDuration = d;            
                    if(gLoop.gameObj.update){ gLoop.gameObj.update(d) } 
                    if(gLoop.gameObj.draw){ cg.context.clearRect(0,0,cg.width,cg.height); gLoop.gameObj.draw() }; 
                    for(var i=0;i<spriteList.length;i++){ spriteList[i].update(d); spriteList[i].draw() }; 
                    gLoop.lastTime=n;
                }
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
        }
        this.GameLoop = gameLoop
    });
})(window,undefined);