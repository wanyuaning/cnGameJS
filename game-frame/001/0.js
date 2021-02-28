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
        cnGame.context.drawImage(cnGame.loader.loadedImgs["gamestart.png"], 0, 0, cnGame.width, cnGame.height);
        var text = cnGame.shape.Text("超级玛丽游戏demo", { x: 20, y: 280, style: "#FFF", font: "bold 22px sans-serif" }); text.draw();
        text = cnGame.shape.Text("xxxxxxxx", { x: 145, y: 300, style: "#FFF", font: "15px sans-serif" }); text.draw();
        text = cnGame.shape.Text("按回车键开始", { x: 40, y: 350, style: "#FFF", font: "bold 18px sans-serif" }); text.draw();
        text = cnGame.shape.Text("方向键控制移动和跳跃", { x: 30, y: 380, style: "#FFF", font: "bold 14px sans-serif" }); text.draw();
        cnGame.input.preventDefault("enter");
    },
}, {srcArray: ["gamestart.png"]});
