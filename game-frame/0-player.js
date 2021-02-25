/* 玩家对象 */
var player = function (options) {
    this.init(options);
    this.speedX = 0;
    this.preSpeedX = 0;
    this.moveSpeed = 10;
    this.jumpSpeed = -10;
    this.speedY = 0;
    this.moveDir;
    this.isJump = false;
};
cnGame.core.inherit(player, cnGame.Sprite);
player.prototype.initialize = function () {
    this.addAnimation(new cnGame.SpriteSheet("playerRight", "images/v0/player.png", { frameSize: [50, 60], loop: true, width: 150, height: 60 }));
    this.addAnimation(new cnGame.SpriteSheet("playerLeft", "images/v0/player.png", { frameSize: [50, 60], loop: true, width: 150, height: 120, beginY: 60 }));
};
player.prototype.moveRight = function () {
    if (cnGame.core.isUndefined(this.moveDir) || this.moveDir != "right") {
        this.moveDir = "right";
        this.speedX < 0 && (this.speedX = 0);
        this.setMovement({ aX: 10, maxSpeedX: 15 });
        this.setCurrentAnimation("playerRight");
    }
};
player.prototype.moveLeft = function () {
    if (cnGame.core.isUndefined(this.moveDir) || this.moveDir != "left") {
        this.moveDir = "left";
        this.speedX > 0 && (this.speedX = 0);
        this.setMovement({ aX: -10, maxSpeedX: 15 });
        this.setCurrentAnimation("playerLeft");
    }
};
player.prototype.jump = function () {
    if (!this.isJump) {
        this.isJump = true;
        this.setMovement({ aY: 50, speedY: -18 });
        if (this.speedX < 0) {
            this.setCurrentImage("images/v0/player.png", 100, 60);
        } else {
            this.setCurrentImage("images/v0/player.png", 100);
        }
    } else {
        var speedY = this.speedY;
        if (speedY < 0) {
            speedY -= 1;
        }
        this.setMovement({ speedY: speedY });
    }
};
player.prototype.stopMove = function () {
    if (!this.isJump) {
        if (this.speedX < 0) {
            this.setCurrentImage("images/v0/player.png", 0, 60);
        } else if (this.speedX > 0) {
            this.setCurrentImage("images/v0/player.png");
        }
        this.moveDir = undefined;
        this.resetMovement();
    }
};
player.prototype.update = function (floorY) {
    player.prototype.parent.prototype.update.call(this); //调用父类update

    if (this.isJump) {
        //如果在跳跃中则X加速度为0
        this.setMovement({ aX: 0 });
    }
    if (this.y >= floorY - this.height && this.speedY > 0) {
        this.isJump = false;
        this.moveDir = undefined;
        this.y = floorY - this.height;
        this.setCurrentImage("images/v0/player.png");
        this.speedY = 0;
    }
    if (cnGame.input.isPressed("up")) {
        this.jump();
    } else if (cnGame.input.isPressed("right")) {
        this.moveRight();
    } else if (cnGame.input.isPressed("left")) {
        this.moveLeft();
    } else {
        this.stopMove();
    }
};
/* 玩家死亡 */
player.prototype.die = function () {
    alert("U lost!");
    cnGame.loop.end();
};
