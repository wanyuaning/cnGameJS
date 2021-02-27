/* 玩家与其他游戏元素的碰撞检测 */
var coliDetect = function (player, spriteList, duration) {
    var playerRect = player.getRect();
    var enemyRect;
    for (var i = 0, len = spriteList.length; i < len; i++) {
        //检测玩家和敌人的碰撞
        if (spriteList[i] !== player && !spriteList[i].hasDie) {
            spriteRect = spriteList[i].getRect();
            if (cnGame.collision.col_Between_Rects(playerRect, spriteRect)) {
                //player和敌人发生碰撞
                if (spriteList[i] instanceof enemy) {
                    if (player.speedY > 0) {
                        spriteList[i].die();
                        var speed = player.speedY; //踩到怪物后玩家Y方向速度取反，弹回
                        speed = Math.max(-15, (speed *= -1));
                        player.setMovement({ speedY: speed });
                    } else {
                        player.die();
                    }
                } else if (spriteList[i] instanceof bullet) {
                    player.die();
                } else if (spriteList[i] instanceof stone) {
                    if (playerRect.bottom > spriteRect.y && playerRect.y + playerRect.height / 2 < spriteRect.y) {
                        player.y = spriteRect.y - player.height; //修正y，使player在石头上，并且不再和石头产生collision
                        spriteList[i].state = "on";
                        player.setMovement({ speedY: 0, aY: 0 }); //踩上石头后速度和Y加速度为0
                        player.isJump = false;
                        player.moveDir = undefined;
                    } else if (playerRect.y < spriteRect.bottom && playerRect.bottom - playerRect.height / 2 > spriteRect.bottom) {
                        var speed = player.speedY; //从下往上撞石头则速度取反，弹回
                        speed *= -1;
                        player.setMovement({ speedY: speed });
                        player.y = spriteRect.y + spriteRect.height; //修正y
                    } else if (player.speedX < 0) {
                        player.setMovement({ speedX: 0, aX: 0 });
                        player.x = spriteList[i].x + spriteList[i].width;
                    } else if (player.speedX > 0) {
                        player.x = spriteList[i].x - player.width;
                        player.setMovement({ speedX: 0, aX: 0 });
                    }
                }
            }
        }
    }
    for (var i = 0, len = spriteList.length; i < len; i++) {
        if (spriteList[i] instanceof stone) {
            var spriteRect = spriteList[i].getRect();
            //当player离开石头，则恢复向下的重力加速度

            if (spriteList[i].state == "on" && (playerRect.x + playerRect.width < spriteRect.x || playerRect.x > spriteRect.right) && player.y == spriteRect.y - player.height) {
                spriteList[i].state = undefined;
                player.isJump = true;
                player.setMovement({ speedY: 0, aY: 17 });
            }
        }
        spriteList[i].update(duration);
    }
};
