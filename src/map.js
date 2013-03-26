/**
*
*地图
*
**/
cnGame.register("cnGame", function(cg) {
    /**
    *层按zIndex由小到大排序
    **/                            
    var sortLayers=function(layersList){
        layersList.sort(function(layer1,layer2){
            if (layer1.zIndex > layer2.zIndex) {
                return 1;
            }
            else if (layer1.zIndex < layer2.zIndex) {
                return -1;
            }
            else {
                return 0;
            }                
        });     
    }
    /**
    *层对象
    **/                            
    var layer = cg.class(function(id,mapMatrix, options) {

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(id,mapMatrix, options);
        }
        this.init(id,mapMatrix, options);
    }).methods({
        
        /**
        *初始化
        **/
        init: function(id,mapMatrix,options) {
            /**
            *默认对象
            **/ 
            var defaultObj = {
                cellSize: [32, 32],   //方格宽，高
                x: 0,                 //layer起始x
                y: 0                  //layer起始y

            };  
            options = options || {};
            options = cg.core.extend(defaultObj, options);
            this.id=options.id;
            this.mapMatrix = mapMatrix;
            this.cellSize = options.cellSize;
            this.x = options.x;
            this.y = options.y;
            this.row = mapMatrix.length; //有多少行
            this.width=this.cellSize[0]* mapMatrix[0].length;
            this.height=this.cellSize[1]* this.row;
            this.spriteList=new cg.SpriteList();//该层上的sprite列表
            this.imgsReference=options.imgsReference;//图片引用字典：{"1":{src:"xxx.png",x:0,y:0},"2":{src:"xxx.png",x:1,y:1}}
            this.zIindex=options.zIndex;
        },
        /**
        *添加sprite
        **/         
        addSprites:function(sprites){
            if (cg.core.isArray(sprites)) {
                for (var i = 0, len = sprites.length; i < len; i++) {
                    arguments.callee.call(this, sprites[i]);
                }
            }
            else{
                this.spriteList.add(sprites);
                sprites.layer=this;
            }               
            
        },
        /**
        *获取特定对象在layer中处于的方格的值
        **/
        getPosValue: function(x, y) {
            if (cg.core.isObject(x)) {
                y = x.y;
                x = x.x;
            }
            var isUndefined = cg.core.isUndefined;
            y = Math.floor(y / this.cellSize[1]);
            x = Math.floor(x / this.cellSize[0]);
            if (!isUndefined(this.mapMatrix[y]) && !isUndefined(this.mapMatrix[y][x])) {
                return this.mapMatrix[y][x];
            }
            return undefined;
        },
        /**
        *获取特定对象在layer中处于的方格索引
        **/
        getCurrentIndex: function(x, y) {
            if (cg.core.isObject(x)) {
                y = x.y;
                x = x.x;
            }
            return [Math.floor(x / this.cellSize[0]), Math.floor(y / this.cellSize[1])];
        },
        /**
        *获取特定对象是否刚好与格子重合
        **/
        isMatchCell: function(x, y) {
            if (cg.core.isObject(x)) {
                y = x.y;
                x = x.x;
            }
            return (x % this.cellSize[0] == 0) && (y % this.cellSize[1] == 0);
        },
        /**
        *设置layer对应位置的值
        **/
        setPosValue: function(x, y, value) {
            this.mapMatrix[y][x] = value;
        },
        /**
        *更新层上的sprite列表
        **/         
        update:function(duration){
            this.spriteList.update(duration);
            
        },
        /**
        *根据layer的矩阵绘制layer和该layer上的所有sprite
        **/
        draw: function() {
            var mapMatrix = this.mapMatrix;
            var beginX = this.x;
            var beginY = this.y;
            var cellSize = this.cellSize;
            var currentRow;
            var currentCol
            var currentObj;
            var row = this.row;
            var img;
            var col;
            for (var i = beginY, ylen = beginY + row * cellSize[1]; i < ylen; i += cellSize[1]) {   //根据地图矩阵，绘制每个方格
                currentRow = (i - beginY) / cellSize[1];
                col=mapMatrix[currentRow].length;
                for (var j = beginX, xlen = beginX + col * cellSize[0]; j < xlen; j += cellSize[0]) {
                    currentCol = (j - beginX) / cellSize[0];
                    currentObj = this.imgsReference[mapMatrix[currentRow][currentCol]];
                    if(currentObj){
                        currentObj.x = currentObj.x || 0;
                        currentObj.y = currentObj.y || 0;
                        img = cg.loader.loadedImgs[currentObj.src];
                        //绘制特定坐标的图像
                        cg.context.drawImage(img, currentObj.x, currentObj.y, cellSize[0], cellSize[1], j, i, cellSize[0], cellSize[1]); 
                    }
                }
            }
            //更新该layer上所有sprite
            this.spriteList.draw();

        }
    });
    
    
    
    /**
    *地图对象
    **/
    var map = cg.class(function(options) {

        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(options);
        }
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
                layers:[],
                x:0,
                y:0,
                width:100,
                height:100

            };
            options = options || {};
            options = cg.core.extend(defaultObj, options);
            this.layers=options.layers;
            this.x=options.x;
            this.y=options.y;
            this.width=options.width;
            this.height=options.height;
            this.enviroment=options.enviroment;//地形layer
        },
        /**
        *添加layer
        **/
        addLayer:function(layers){
            if (cg.core.isArray(layers)) {
                for (var i = 0, len = layers.length; i < len; i++) {
                    arguments.callee.call(this, layers[i]);
                }
            }
            else{
                layers.x=this.x;
                layers.y=this.y;
                this.layers.push(layers);
                sortLayers(this.layers);
            }
            
        },
        /**
        *获取某个layer
        **/         
        getLayer:function(id){
            for (var i = 0, len = this.layers.length; i < len; i++) {
                if(this.layers[i].id==id){
                    return  this.layers[i];
                }
            }           
        },
        /**
        *更新所有layer
        **/
        update:function(duration){
            for(var i=0,len=this.layers.length;i<len;i++){
                this.layers[i].x=this.x;
                this.layers[i].y=this.y;
                this.layers[i].update(duration);                
            }               
        },          
        /**
        *绘制所有layer
        **/
        draw:function(){
            for(var i=0,len=this.layers.length;i<len;i++){
                this.layers[i].draw();              
            }               
        }
    });
    
    this.Layer = layer;
    this.Map = map;

});