var canvas = document.createElement("canvas"); canvas.innerHTML = "请使用支持canvas的浏览器查看"; canvas.id = "gameCanvas"; document.getElementById("wrap").appendChild(canvas);
/* 初始化 */
cnGame.init("gameCanvas", { width: 500, height: 400 });
/**
 * 游戏加载所需 资源列表
 * 游戏开始界面对象
 **/
cnGame.loader.start({
    initialize: function () {
        //画出开始界面
        cnGame.context.drawImage(cnGame.loader.loadedImgs["images/v0/gamestart.png"], 0, 0, cnGame.width, cnGame.height);
        var text = cnGame.shape.Text("超级玛丽游戏demo", { x: 20, y: 280, style: "#FFF", font: "bold 22px sans-serif" }); text.draw();
        text = cnGame.shape.Text("xxxxxxxx", { x: 145, y: 300, style: "#FFF", font: "15px sans-serif" }); text.draw();
        text = cnGame.shape.Text("按回车键开始", { x: 40, y: 350, style: "#FFF", font: "bold 18px sans-serif" }); text.draw();
        text = cnGame.shape.Text("方向键控制移动和跳跃", { x: 30, y: 380, style: "#FFF", font: "bold 14px sans-serif" }); text.draw();
        cnGame.input.onKeyDown("enter", function () {
            cnGame.loader.start({
                background: new cnGame.View({ src: "images/v0/background.png", player: this.player, imgWidth: 2301 }),
                player: null,
                spriteList: [],
                floorY: cnGame.height - 40, //地面Y坐标
                times: 0,
                times2: 0,
                initialize: function () {
                    cnGame.input.preventDefault(["left", "right", "up", "down"]);  

                    this.spriteList.push(new stone({ src: "images/v0/stone2.png", width: 128, height: 33, x: 550, y: this.floorY - 100 }));
                    this.spriteList.push(new stone({ src: "images/v0/stone.png", width: 219, height: 30, x: 720, y: this.floorY - 200 }));
                    this.spriteList.push(new stone({ src: "images/v0/stone.png", width: 219, height: 30, x: 1000, y: this.floorY - 120 }));
                    this.spriteList.push(new stone({ src: "images/v0/stone.png", width: 219, height: 30, x: 1190, y: this.floorY - 240 }));
                    this.spriteList.push(new stone({ src: "images/v0/stone2.png", width: 128, height: 33, x: 1700, y: this.floorY - 220 }));
                    this.spriteList.push(new stone({ src: "images/v0/stone2.png", width: 128, height: 33, x: 1900, y: this.floorY - 240 }));
                    this.spriteList.push(new stone({ src: "images/v0/pillar.png", width: 91, height: 75, x: 200, y: this.floorY - 75 }));
                    this.spriteList.push(new stone({ src: "images/v0/pillar.png", width: 91, height: 75, x: 900, y: this.floorY - 75 }));
                    this.spriteList.push(new stone({ src: "images/v0/pillar.png", width: 91, height: 75, x: 1500, y: this.floorY - 75 }));
                    

                    this.player = new player({ src: "images/v0/player.png", width: 50, height: 60, x: 0, y: this.floorY - 60 });
                    this.player.initialize(); this.spriteList.push(this.player);
                    


                    this.background.centerPlayer(true); 
                    this.background.insideView(this.player, "x");
                    
                    var newEnemy = new enemy({ src: "images/v0/enemy.png", width: 50, height: 48, x: cnGame.width, y: this.floorY - 48, speedX: -3 }); 
                    newEnemy.addAnimation(new cnGame.SpriteSheet("enemyDie", "images/v0/enemy.png", { frameSize: [50, 48], width: 150, height: 48 }));
                    this.spriteList.push(newEnemy);
                },
                update: function () {
                    this.times++; this.times2++;
                    if (this.times == 100) { 
                        this.times = 0;
                        var newEnemy = new enemy({ src: "images/v0/enemy.png", width: 50, height: 48, x: cnGame.width, y: this.floorY - 48, speedX: -3 }); 
                        newEnemy.addAnimation(new cnGame.SpriteSheet("enemyDie", "images/v0/enemy.png", { frameSize: [50, 48], width: 150, height: 48 })); 
                        this.spriteList.push(newEnemy);
                    }
                    if (this.times2 == 150) { 
                        this.times2 = 0;
                        var ranNum = [45, 130, 180][Math.floor(Math.random() * 3)];
                        var newBullet = new bullet({ src: "images/v0/bullet.png", width: 56, height: 35, x: cnGame.width, y: this.floorY - ranNum, speedX: -15 });
                        this.spriteList.push(newBullet)   
                    }
                    coliDetect(this.player, this.spriteList, this.floorY);
                    //this.background.update(this.spriteList);
                },
                draw: function () { this.background.draw(); for (var i = 0, len = this.spriteList.length; i < len; i++) { this.spriteList[i].draw() } },
            }, {srcArray: ["images/v0/background.png", "images/v0/player.png", "images/v0/enemy.png", "images/v0/stone.png", "images/v0/stone2.png", "images/v0/bullet.png", "images/v0/pillar.png"]});
            cnGame.input.clearDownCallbacks("enter"); //保证只执行一次
        });
        cnGame.input.preventDefault("enter");
    },
}, {srcArray: ["images/v0/gamestart.png"]});
