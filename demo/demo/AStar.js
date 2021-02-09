var aStarManager = (function() {     
    var keyMapOpen = {},
        listClose = [],
        path = []
    var isInOpen = function(point) {
        return keyMapOpen[point.key] ? true : false
    }
    var isInClose = function(point) {
        for (var i = 0, len = listClose.length; i < len; i++) {
            if (listClose[i] == point) return true
        }
        return false
    }
    /*  获取开始列表中F值最小的结点 */
    var getPointWithMinF = function() {
        var minPoint
        for (var i in keyMapOpen) {
            if (!minPoint || keyMapOpen[i].F < minPoint.F) minPoint = keyMapOpen[i]
        }
        return minPoint
    }
    var addToClose = function(point) {
        console.log('====',point.key);
        
        if (isInOpen(point)) deleteFromOpen(point)
        listClose.push(point)
    }
    var deleteFromOpen = function(point) {
        delete keyMapOpen[point.key]
    }
    /*  保存路径    */
    var savePath = function(point) {
        path.unshift(point)
        if (point.parent) arguments.callee(point.parent)
    }
    /*  判断该点是否围墙    */
    var isWall = function(point, wallValueArr) {
        for (var i = 0, len = wallValueArr.length; i < len; i++) {
            if (wallValueArr[i] == point.type) return true
        }
        return false
    }
    /*  开始寻路    */
    var handle = function(point) {
        var beginX = point.x - 1,
            beginY = point.y - 1,
            endX = point.x + 1,
            endY = point.y + 1,
            pointsArr = this.pointsArr   

        addToClose(point) //把传入的当前结点放进关闭列表

        for (var i = beginY; i <= endY; i++) {//遍历传入结点的四周的结点
            for (var j = beginX; j <= endX; j++) {
                if (pointsArr[i] && pointsArr[i][j] && !isInClose(pointsArr[i][j])) {//如果该位置结点存在并且不是传入的结点
                    if (!isWall(pointsArr[i][j], this.wallValueArr)) {//不是障碍物
                        //拐角规则，如果检测某点四周的点时，该点和四周上某点之间隔着一个障碍物，则忽略该点，暂不添加到开始列表
                        if (isWall(pointsArr[i][point.x], this.wallValueArr) || isWall(pointsArr[point.y][j], this.wallValueArr)) continue

                        var G = pointsArr[i][j].caculateG(point)
                        if (isInOpen(pointsArr[i][j])) {//如果在开始列表，则根据传入的指定点计算是否改变G值
                            if (pointsArr[i][j].G > G) {//如果该结点的G值大于由传入结点计算出的G值，则该结点父指针指向传入结点
                                pointsArr[i][j].G = G
                                pointsArr[i][j].updateF()
                                pointsArr[i][j].parent = point
                            }
                        }
                        else if (!isInClose(pointsArr[i][j])) {//如果不在开始列表也不在关闭列表，则根据传入的指定点计算该点G值，并把该结点父节点指针指向传入结点
                            pointsArr[i][j].G = G
                            pointsArr[i][j].updateH(this.endPoint)
                            pointsArr[i][j].updateF()
                            pointsArr[i][j].parent = point
                            keyMapOpen[j + '' + i] = pointsArr[i][j] //添加到开始列表
                        }
                    } else {//如果是障碍物，则添加到关闭列表
                        addToClose(pointsArr[i][j])
                    }
                }
            }
        }

        if (point != this.endPoint) {//如果被选中结点不是终点结点
            var nextPoint = getPointWithMinF() //获取开始列表中F值最小的结点
            arguments.callee.call(this, nextPoint) //递归重复上述操作
        } else {
            savePath(point) //如果当前结点是终点结点并且该结点被添加到关闭列表，则保存路径，寻路结束
        }
    }

    return {
        install(options){
            this.pointsArr = []
            this.pointsMap = {}
            this.wallValueArr = options.wallValueArr || []

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
        },
        init: function(startPointPos, endPointPos) {
            keyMapOpen = {}
            listClose = []
            path = []
            
            for (var i in this.pointsMap) {
                this.pointsMap[i].parent = undefined
                this.pointsMap[i].F = this.pointsMap[i].G = this.pointsMap[i].H = 0
            }
            this.startPoint = this.pointsArr[startPointPos[1]][startPointPos[0]]     
            this.endPoint = this.pointsArr[endPointPos[1]][endPointPos[0]]
                    
               
        },
        getPath: function(startPointPos, endPointPos) {
            var targetPointer = this.pointsArr[endPointPos[1]][endPointPos[0]]            
            if (isWall(targetPointer, this.wallValueArr)) return

            this.init(startPointPos, endPointPos)
            handle.call(this, this.startPoint)
            return path
        }
    }
})();