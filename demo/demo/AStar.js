function AStar(options){
    this.pointsArr = []
    this.pointsMap = {}
    this.wallValueArr = options.wallValueArr || {}
    this.keyMapOpen = {}
    this.keyMapClose = {}
    this.path = []

    var map = options.mapMatrix || []
    for (var r = 0; r < map.length; r++) {
        var row = map[r]
        this.pointsArr[r] = []
        for (var c = 0; c < row.length; c++) {
            var key = c + '' + r
            var pointer = new NodePointer({ x: c, y: r, type: row[c], key })
            this.pointsArr[r][c] = pointer
            this.pointsMap[key] = pointer
        }
    }
}
AStar.prototype = {
    constructor: AStar,
    isInOpen(point){return !!this.keyMapOpen[point.key]},
    isInClose(point){return !!this.keyMapClose[point.key]},
    getPointWithMinF: function() { //获取开始列表中F值最小的结点
        var minPoint
        for (var i in this.keyMapOpen) {
            if (!minPoint || this.keyMapOpen[i].F < minPoint.F) minPoint = this.keyMapOpen[i]
        }
        return minPoint
    },
    addToClose: function(point) {
        if (this.isInOpen(point)) this.deleteFromOpen(point)
        this.keyMapClose[point.key] = point
    },
    deleteFromOpen: function(point) { delete this.keyMapOpen[point.key] },
    savePath: function(point) { // 保存路径
        this.path.unshift(point)
        if (point.parent) arguments.callee.call(this, point.parent)
    },
    isWall: function(point, wallValueArr) { return !!wallValueArr[point.type] },
    handle: function(point) { // 寻路
        // var x = point.x, _x = x - 1, x_ = x + 1, 
        //     y = point.y, _y = y - 1, y_ = y + 1
        
        // this.pointsMap[_x  + '' + _y ]
        // this.pointsMap[ x  + '' + _y ]
        // this.pointsMap[ x_ + '' + _y ]
        // this.pointsMap[_x  + '' +  y ]
        // this.pointsMap[ x_ + '' +  y ]
        // this.pointsMap[_x  + '' +  y_]
        // this.pointsMap[ x  + '' +  y_]
        // this.pointsMap[ x_ + '' +  y_]

        // this.addToClose(point) 


        var beginX = point.x - 1, beginY = point.y - 1, endX = point.x + 1, endY = point.y + 1,
            pointsArr = this.pointsArr   

        this.addToClose(point) //把传入的当前结点放进关闭列表
        for (var i = beginY; i <= endY; i++) {//遍历传入结点的四周的结点
            for (var j = beginX; j <= endX; j++) {                
                if (pointsArr[i] && pointsArr[i][j] && !this.isInClose(pointsArr[i][j])) {//如果该位置结点存在并且不是传入的结点
                    var pointer = pointsArr[i][j]
                    if (!this.isWall(pointer, this.wallValueArr)) {//不是障碍物
                        //拐角规则，如果检测某点四周的点时，该点和四周上某点之间隔着一个障碍物，则忽略该点，暂不添加到开始列表
                        if (this.isWall(pointsArr[i][point.x], this.wallValueArr) || this.isWall(pointsArr[point.y][j], this.wallValueArr)) continue

                        var G = pointer.caculateG(point)
                        if (this.isInOpen(pointer)) {//如果在开始列表，则根据传入的指定点计算是否改变G值
                            if (pointer.G > G) {//如果该结点的G值大于由传入结点计算出的G值，则该结点父指针指向传入结点
                                pointer.G = G
                                pointer.updateF()
                                pointer.parent = point
                            }
                        }
                        else if (!this.isInClose(pointer)) {//如果不在开始列表也不在关闭列表，则根据传入的指定点计算该点G值，并把该结点父节点指针指向传入结点
                            pointer.G = G
                            pointer.updateH(this.endPoint)
                            pointer.updateF()
                            pointer.parent = point
                            this.keyMapOpen[j + '' + i] = pointer //添加到开始列表
                        }
                    } else {//如果是障碍物，则添加到关闭列表
                        this.addToClose(pointer)
                    }
                }
            }
        }
        if (point != this.endPoint) {//如果被选中结点不是终点结点
            var nextPoint = this.getPointWithMinF() //获取开始列表中F值最小的结点
            arguments.callee.call(this, nextPoint) //递归重复上述操作
        } else {
            this.savePath(point) //如果当前结点是终点结点并且该结点被添加到关闭列表，则保存路径，寻路结束
        }
    },
    init: function(startPointPos, endPointPos) {
        this.keyMapOpen = {}
        this.keyMapClose = {}
        this.path = []
        for (var i in this.pointsMap) {
            this.pointsMap[i].parent = undefined
            this.pointsMap[i].F = this.pointsMap[i].G = this.pointsMap[i].H = 0
        }
        this.startPoint = this.pointsArr[startPointPos[1]][startPointPos[0]]     
        this.endPoint = this.pointsArr[endPointPos[1]][endPointPos[0]]
    },
    getPath: function(startPointPos, endPointPos) {
        var targetPointer = this.pointsArr[endPointPos[1]][endPointPos[0]]            
        if (this.isWall(targetPointer, this.wallValueArr)) return
        this.init(startPointPos, endPointPos)
        this.handle(this.startPoint)
        return this.path
    }
}