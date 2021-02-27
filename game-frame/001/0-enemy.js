/* 敌人对象 */
function enemy(options) {
    this.init(options);
    this.speedX = options.speedX;
};
cnGame.core.inherit(enemy, cnGame.Sprite);

/* 敌人死亡 */
enemy.prototype.die = function () {
    this.setCurrentAnimation("enemyDie");
    this.hasDie = true;
    this.speedX = 0;
};
