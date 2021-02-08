var openArr = [];
    var closeArr = [];
    var path = [];
    var isInOpen = function(point) {
        for (var i = 0, len = openArr.length; i < len; i++) {
            if (openArr[i] == point) {
                return true;
            }
        }
        return false;
    }
    var isInClose = function(point) {
        for (var i = 0, len = closeArr.length; i < len; i++) {
            if (closeArr[i] == point) {                
                return true;
            }
        }
        return false;

    }
    /*  获取开始列表中F值最小的结点 */
    var getPointWithMinF = function() {
        var minPoint;
        for (var i = 0, len = openArr.length; i < len; i++) {
            if (!minPoint || openArr[i].F < minPoint.F) {
                minPoint = openArr[i];
            }
        }
        return minPoint;
    }
    var addToClose = function(point) {
        if (isInOpen(point)) {//如果在开始列表中，则把结点从开始列表中删除，再添加到关闭列表中
            deleteFromOpen(point);
        }
        closeArr.push(point);
    }
    var deleteFromOpen = function(point) {
        for (var i = 0, len = openArr.length; i < len; i++) {
            if (openArr[i] == point) {
                openArr.splice(i, 1);
                break;
            }
        }

    }
    /*  保存路径    */
    var savePath = function(point) {
        path.unshift(point);
        if (point.parent) {
            arguments.callee(point.parent);
        }

    }
    
   

function AStar(options){      
    this.pointsArr = []; 
    this.wallValueArr = options.wallValueArr || [] 

    var map = options.mapMatrix || []
    for (var r = 0; r < map.length; r++) {
        this.pointsArr[r] = []
        var row = map[r]
        for (var c = 0; c < row.length; c++) {//行
            this.pointsArr[r][c] = new NodePointer({ x: c, y: r, value: row[c] })
        }
    }    
}
/*  判断该点是否围墙    */
AStar.isWall = function(point, wallArr) {    
    for (var i = 0, len = wallArr.length; i < len; i++) {
        if (wallArr[i] == point.value) {
            return true;
        }
    }
    return false;
}

AStar.prototype = {
    constructor: AStar, 
    addressing() {
        var point = this.startPoint
        var beginX = point.x - 1;
        var beginY = point.y - 1;
        var endX = point.x + 1;
        var endY = point.y + 1;
        var pointsArr = this.pointsArr;
    
        addToClose(point); //把传入的当前结点放进关闭列表
    
        for (var i = beginY; i <= endY; i++) {//遍历传入结点的四周的结点
            for (var j = beginX; j <= endX; j++) {
                if (pointsArr[i] && pointsArr[i][j] && !isInClose(pointsArr[i][j])) {//如果该位置结点存在并且不是传入的结点
                    var p = pointsArr[i][j]
    
                    if (AStar.isWall(p)) { //如果是障碍物，则添加到关闭列表
                        addToClose(p);
                    } else {
                        //拐角规则，如果检测某点四周的点时，该点和四周上某点之间隔着一个障碍物，则忽略该点，暂不添加到开始列表
                        if (AStar.isWall(pointsArr[i][point.x]) || AStar.isWall(pointsArr[point.y][j])) continue;
                        
                        var G = p.caculateG(point);
                        if (isInOpen(p)) {//如果在开始列表，则根据传入的指定点计算是否改变G值
                            if (p.G > G) {//如果该结点的G值大于由传入结点计算出的G值，则该结点父指针指向传入结点
                                p.G = G;
                                p.updateF();
                                p.parent = point;
                            }
                        } else if (!isInClose(p)) {//如果不在开始列表也不在关闭列表，则根据传入的指定点计算该点G值，并把该结点父节点指针指向传入结点
                            p.G = G;
                            p.updateH(this.endPoint);
                            p.updateF();
                            p.parent = point;
                            openArr.push(p); //添加到开始列表
                        }
                    } 
                }
            }
        }
        if (point != this.endPoint) {//如果被选中结点不是终点结点
            var nextPoint = getPointWithMinF(); //获取开始列表中F值最小的结点
            arguments.callee.call(this, nextPoint); //递归重复上述操作
        } else {
            savePath(point); //如果当前结点是终点结点并且该结点被添加到关闭列表，则保存路径，寻路结束
        }
    
    },  
    
    init: function(startPointPos, endPointPos) { 
        openArr = [];  // 开启列表
        closeArr = []; // 关闭列表
        path = [];

        // if (r == startPointPos[1] && j == startPointPos[0]) {
        //     this.startPoint = this.pointsArr[i][j];
        // }
        // else if (i == endPointPos[1] && j == endPointPos[0]) {
        //     this.endPoint = this.pointsArr[i][j];
        // }
    },
    getPath: function() {
        this.addressing();
        return path;
    }
}
