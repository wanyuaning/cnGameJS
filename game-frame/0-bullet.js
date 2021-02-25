/* 飞弹对象 */
var bullet = function (options) {
    this.init(options);
    this.speedX = options.speedX;
};
cnGame.core.inherit(bullet, cnGame.Sprite);
