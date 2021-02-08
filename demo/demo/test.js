function AStar(options){      
    this.pointsArr = []
    this.pointsMap = {}
    this.wallValueArr = options.wallValueArr || [] 
    this.openArr = []
    this.closeArr = []
    this.path = []

    var map = options.mapMatrix || []
    for (var r = 0; r < map.length; r++) {
        this.pointsArr[r] = []
        this.pointsMap[r] = {}
        var row = map[r]
        for (var c = 0; c < row.length; c++) {
            var pointer = new NodePointer({ x: c, y: r, value: row[c] })
            this.pointsArr[r][c] = this.pointsMap[r][c] = pointer
        }
    }    
}


AStar.prototype = {
    constructor: AStar, 
    /*  判断该点是否围墙    */
    _isWall(point) {  
        debugger  
        for (var i = 0; i < this.wallValueArr.length; i++) {
            if (this.wallValueArr[i] == point.value) {
                return true;
            }
        }
        return false;
    },
    _isInOpen(point) {
        for (var i = 0; i < this.openArr.length; i++) {
            if (this.openArr[i] == point) return true 
        }
        return false;
    },
    _isInClose(point) {
        for (var i = 0; i < this.closeArr.length; i++) {
            if (this.closeArr[i] == point) return true 
        }
        return false
    },
    /*  获取开始列表中F值最小的结点 */
    _getPointWithMinF() {
        var minPoint
        for (var i = 0; i < this.openArr.length; i++) {
            if (!minPoint || this.openArr[i].F < minPoint.F) minPoint = this.openArr[i]
        }
        return minPoint;
    },
    _addToClose(point) {
        if (this._isInOpen(point)) {//如果在开始列表中，则把结点从开始列表中删除，再添加到关闭列表中
            this._deleteFromOpen(point);
        }
        this.closeArr.push(point);
    },
    _deleteFromOpen(point) {
        for (var i = 0; i < this.openArr.length; i++) {
            //console.log(this.openArr[i] == point)
            if (this.openArr[i] == point) {
                this.openArr.splice(i, 1)
                break
            }
        }
    },
    /*  保存路径    */
    _savePath(point) {
        this.path.unshift(point);
        if (point.parent) {
            arguments.callee(point.parent)
        }
    },
    _addressing() {
        var point = this.startPoint
        var beginX = point.x - 1;
        var beginY = point.y - 1;
        var endX = point.x + 1;
        var endY = point.y + 1;
        var pointsArr = this.pointsArr;
    
        this._addToClose(point); //把传入的当前结点放进关闭列表
    
        for (var i = beginY; i <= endY; i++) {//遍历传入结点的四周的结点
            for (var j = beginX; j <= endX; j++) {
                if (pointsArr[i] && pointsArr[i][j] && !this._isInClose(pointsArr[i][j])) {//如果该位置结点存在并且不是传入的结点
                    var p = pointsArr[i][j]
    
                    if (this._isWall(p)) { //如果是障碍物，则添加到关闭列表
                        this._addToClose(p);
                    } else {
                        //拐角规则，如果检测某点四周的点时，该点和四周上某点之间隔着一个障碍物，则忽略该点，暂不添加到开始列表
                        if (this._isWall(pointsArr[i][point.x]) || this._isWall(pointsArr[point.y][j])) continue;
                        
                        var G = p.caculateG(point);
                        if (this._isInOpen(p)) {//如果在开始列表，则根据传入的指定点计算是否改变G值
                            if (p.G > G) {//如果该结点的G值大于由传入结点计算出的G值，则该结点父指针指向传入结点
                                p.G = G;
                                p.updateF();
                                p.parent = point;
                            }
                        } else if (!this._isInClose(p)) {//如果不在开始列表也不在关闭列表，则根据传入的指定点计算该点G值，并把该结点父节点指针指向传入结点
                            p.G = G;
                            p.updateH(this.endPoint);
                            p.updateF();
                            p.parent = point;
                            this.openArr.push(p); //添加到开始列表
                        }
                    } 
                }
            }
        }
        if (point != this.endPoint) {//如果被选中结点不是终点结点
            var nextPoint = this._getPointWithMinF(); //获取开始列表中F值最小的结点
            arguments.callee.call(this, nextPoint); //递归重复上述操作
        } else {
            this._savePath(point); //如果当前结点是终点结点并且该结点被添加到关闭列表，则保存路径，寻路结束
        }
    
    },  
    
    init: function(startPointPos, endPointPos) { 
        this.openArr = this.closeArr = this.path = []
        this.startPoint = this.pointsMap[startPointPos[1]][startPointPos[0]]
        this.endPoint = this.pointsMap[endPointPos[1]][endPointPos[0]]
    },
    getPath: function() {
        this._addressing();
        return path;
    }
}
