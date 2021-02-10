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
            var key = c + '_' + r
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
    checkPoint33(pointer, G, parent){ 
        pointer.G = G
        pointer.updateH(this.endPoint)
        pointer.updateF()
        pointer.parent = parent
        this.keyMapOpen[pointer.key] = pointer //添加到开始列表
    },
    checkPoint3(pointer, G, parent){
        if (pointer.G <= G) return //如果该结点的G值大于由传入结点计算出的G值，则该结点父指针指向传入结点
        pointer.G = G
        pointer.updateF()
        pointer.parent = parent
    },
    checkPoint2(point, parent){ 
        if (this.isWall(this.pointsMap[point.x+'_'+parent.y], this.wallValueArr) || this.isWall(this.pointsMap[parent.x+'_'+point.y], this.wallValueArr) || this.isInClose(point)) return
        var G = point.caculateG(parent)
        this.isInOpen(point) ? this.checkPoint3(point, G, parent) : this.checkPoint33(point, G, parent)
    },
    checkPoint(point, parent){ this.isWall(point,this.wallValueArr) ? this.addToClose(point) : this.checkPoint2(point, parent) },
    handle: function(point) { // 寻路
        var x = point.x, _x = x - 1, x_ = x + 1, y = point.y, _y = y - 1, y_ = y + 1,
            p1 = this.pointsMap[_x  + '_' + _y ], p2 = this.pointsMap[ x  + '_' + _y ],
            p3 = this.pointsMap[ x_ + '_' + _y ], p4 = this.pointsMap[_x  + '_' +  y ],
            p5 = this.pointsMap[ x_ + '_' +  y ], p6 = this.pointsMap[_x  + '_' +  y_],
            p7 = this.pointsMap[ x  + '_' +  y_], p8 = this.pointsMap[ x_ + '_' +  y_]
        p1 && !this.isInClose(p1) && this.checkPoint(p1, point)
        p2 && !this.isInClose(p2) && this.checkPoint(p2, point)
        p3 && !this.isInClose(p3) && this.checkPoint(p3, point)
        p4 && !this.isInClose(p4) && this.checkPoint(p4, point)
        p5 && !this.isInClose(p5) && this.checkPoint(p5, point)
        p6 && !this.isInClose(p6) && this.checkPoint(p6, point)
        p7 && !this.isInClose(p7) && this.checkPoint(p7, point)
        p8 && !this.isInClose(p8) && this.checkPoint(p8, point)

        this.addToClose(point) 
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