var canvas = document.createElement("canvas"); 
canvas.innerHTML = "请使用支持canvas的浏览器查看"; 
canvas.id = "gameCanvas"; 
document.getElementById("wrap").appendChild(canvas);

/* 初始化 */
cnGame.init("gameCanvas", { width: 500, height: 400, FPS: 5 });
/**
 * 游戏加载所需 资源列表
 * 游戏开始界面对象
 **/
var spriteList = []
cnGame.loader.start({
    initialize: function () {
        //画出开始界面
        cnGame.context.drawImage(cnGame.loader.loadedImgs["bg.png"], 0, 0, cnGame.width, cnGame.height);
        var text = cnGame.shape.Text("标题一样本", { x: 20, y: 280, style: "#FFF", font: "bold 22px sans-serif" }); text.draw();
        var sp = new cnGame.Sprite({ src: "01.jpg", width: 50, height: 60, x: 100, y: 100, angle: 45, speedX: 1, speedY: 1, rotateSpeed:5 })
        spriteList.push(sp)
        //setTimeout(function(){sp.move(200, 200)}, 2000)
        var ss = new cnGame.SpriteSheet("marry","player.png",{ 
            x: 0, y: 0,
            matrix: [[1,1,1],[1,1,1]],
            width: 50, height: 60,
            duration: 100,
            childFrames: [
                {id:'righter', indexs: [0,1,2]},
                {id:'lefter', indexs: [3,4,5]}
            ]
        })
        spriteList.push(ss)
    },
    draw: function () {
        for (var i = 0, len = spriteList.length; i < len; i++) {
            spriteList[i].update('lefter');
            spriteList[i].draw('lefter');
        }
    }
}, {srcArray: ["bg.png","player.png", '01.jpg']});


var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');

document.addEventListener(visibilityChangeEvent, function(){
    if (document[hiddenProperty]) { 
           
        cnGame.loop.pauses()
    }else{
        cnGame.loop.run()
    }
});