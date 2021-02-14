/*  结点对象    */
function NodePointer(options) {
    this.x = options.x;
    this.y = options.y;
    this.parent = options.parent;
    this.G = options.G;
    this.H = options.H;
    this.type = options.type;
    this.key = options.key;
}

NodePointer.prototype = {
    constructor: NodePointer,
    init() {
        this.parent = undefined;
        this.G = 0;
        this.H = 0;
    },
    /*  获取 起始点 到 该结点 的G值 */
    caculateG: function (fromPoint) {
        fromPoint.G = fromPoint.G || 0;
        if (fromPoint.x != this.x && fromPoint.y != this.y) {
            return fromPoint.G + 14; //在所选点斜方向，耗散值加14
        } else {
            return fromPoint.G + 10; //在所选点垂直方向，耗散值加10
        }
    },
    /*  根据结束结点计算该点的H值   */
    updateH: function (endPoint) {
        this.H =
            (Math.abs(endPoint.x - this.x) + Math.abs(endPoint.y - this.y)) *
            10;
    },
    /*  根据G和H值计算该点的F值 */
    updateF: function () {
        this.F = this.G + this.H;
    },
};
