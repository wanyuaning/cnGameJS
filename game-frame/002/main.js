var canvas = document.createElement("canvas"); 
canvas.innerHTML = "请使用支持canvas的浏览器查看"; 
canvas.id = "gameCanvas"; 
document.getElementById("wrap").appendChild(canvas);

/* 初始化 */
cnGame.init("gameCanvas", { width: 500, height: 400 });
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
        var sp = new cnGame.Sprite({ src: "player.png", width: 50, height: 60, x: 100, y: 100 })
        sp.draw()
        var ss = new cnGame.SpriteSheet("marry","player.png",{ 
            x: 0,
            y: 0,
            width: 150,
            height: 120,
            frameSize: [50,60],
            frameDuration: 1000,
            direction: "right",
            beginX: 0,
            beginY: 0,
            loop: true
        })
        spriteList.push(ss)
    },
    draw: function () {
        for (var i = 0, len = spriteList.length; i < len; i++) {
            spriteList[i].update();
            spriteList[i].draw();
        }
    }
}, {srcArray: ["bg.png","player.png"]});


var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');

document.addEventListener(visibilityChangeEvent, function(){
    if (document[hiddenProperty]) { 
           
        cnGame.loop.pauses()
    }else{
        cnGame.loop.run()
    }
});