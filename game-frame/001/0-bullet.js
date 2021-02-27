/* 飞弹对象 */
function bullet(options) {
    this.init(options);
    this.speedX = options.speedX;
};
cnGame.core.inherit(bullet, cnGame.Sprite);
