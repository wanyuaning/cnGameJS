/**
*
*输入记录模块
*
**/
cnGame.register("cnGame.input", function(cg) {
                                         
    this.mouse={};
    this.mouse.x = 0;
    this.mouse.y = 0;
    var m=[];
    m[0]= m[1] ="left";
    m[2]="right";
    /**
    *鼠标按下触发的处理函数
    **/
    var mousedown_callbacks = {};
    /**
    *鼠标松开触发的处理函数
    **/
    var mouseup_callbacks = {};
    /**
    *鼠标移动触发的处理函数
    **/
    var mousemove_callbacks = [];
    
    /**
    *记录鼠标在canvas内的位置
    **/
    var recordMouseMove = function(eve) {
        var pageX, pageY, x, y;
        eve = cg.core.getEventObj(eve);
        pageX = eve.pageX || eve.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
        pageY = eve.pageY || eve.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
        cg.input.mouse.x = pageX - cg.x;
        cg.input.mouse.y = pageY - cg.y;
        for (var i = 0, len = mousemove_callbacks.length; i < len; i++) {
            mousemove_callbacks[i]();
        }
    }
    /**
    *记录鼠标按键
    **/
    var recordMouseDown=function(eve){
        eve = cg.core.getEventObj(eve);
        var pressed_btn=m[eve.button];
        if(pressed_btn=="left"){//左键按下
            cg.input.mouse.left_pressed=true;
        }
        else if(pressed_btn=="right"){//右键按下
            cg.input.mouse.right_pressed=true;
        }
        var callBacksArr=mousedown_callbacks[pressed_btn];
        if(callBacksArr&&callBacksArr.length){
            for (var i = 0, len = callBacksArr.length; i < len; i++) {
                callBacksArr[i]();
            }   
        }
    }
    /**
    *记录鼠标松开的键
    **/
    var recordMouseUp=function(eve){
        
        eve = cg.core.getEventObj(eve);
        var pressed_btn=m[eve.button];
        if(pressed_btn=="left"){//左键松开
            cg.input.mouse.left_pressed=false;
        }
        else if(pressed_btn=="right"){//右键松开
            btn=cg.input.mouse.right_pressed=false;
        }
        var callBacksArr=mouseup_callbacks[pressed_btn];
        if(callBacksArr&&callBacksArr.length){
            for (var i = 0, len = callBacksArr.length; i < len; i++) {
                callBacksArr[i]();
            }   
        }
    }
    cg.core.bindHandler(window, "mousemove", recordMouseMove);
    cg.core.bindHandler(window, "mousedown", recordMouseDown);
    cg.core.bindHandler(window, "mouseup", recordMouseUp);
    
    

    /**
    *绑定鼠标按下事件
    **/
    this.onMouseDown = function(buttonName, handler) {
        buttonName = buttonName || "all";
        if (cg.core.isUndefined(mousedown_callbacks[buttonName])) {
            mousedown_callbacks[buttonName] = [];
        }
        mousedown_callbacks[buttonName].push(handler);
    };
    /**
    *绑定鼠标松开事件
    **/
    this.onMouseUp = function(buttonName, handler) {
        buttonName = buttonName || "all";
        if (cg.core.isUndefined(mouseup_callbacks[buttonName])) {
            mouseup_callbacks[buttonName] = [];
        }
        
        mouseup_callbacks[buttonName].push(handler);
    };
    /**
    *绑定鼠标松开事件
    **/
    this.onMouseMove = function(handler) {  
        mousemove_callbacks.push(handler);
    };
    

    /**
    *被按下的键的集合
    **/
    var pressed_keys = {};
    /**
    *要求禁止默认行为的键的集合
    **/
    var preventDefault_keys = {};
    /**
    *键盘按下触发的处理函数
    **/
    var keydown_callbacks = {};
    /**
    *键盘弹起触发的处理函数
    **/
    var keyup_callbacks = {};


    /**
    *键盘按键编码和键名
    **/
    var k = [];
    k[8] = "backspace"
    k[9] = "tab"
    k[13] = "enter"
    k[16] = "shift"
    k[17] = "ctrl"
    k[18] = "alt"
    k[19] = "pause"
    k[20] = "capslock"
    k[27] = "esc"
    k[32] = "space"
    k[33] = "pageup"
    k[34] = "pagedown"
    k[35] = "end"
    k[36] = "home"
    k[37] = "left"
    k[38] = "up"
    k[39] = "right"
    k[40] = "down"
    k[45] = "insert"
    k[46] = "delete"

    k[91] = "leftwindowkey"
    k[92] = "rightwindowkey"
    k[93] = "selectkey"
    k[106] = "multiply"
    k[107] = "add"
    k[109] = "subtract"
    k[110] = "decimalpoint"
    k[111] = "divide"

    k[144] = "numlock"
    k[145] = "scrollock"
    k[186] = "semicolon"
    k[187] = "equalsign"
    k[188] = "comma"
    k[189] = "dash"
    k[190] = "period"
    k[191] = "forwardslash"
    k[192] = "graveaccent"
    k[219] = "openbracket"
    k[220] = "backslash"
    k[221] = "closebracket"
    k[222] = "singlequote"

    var numpadkeys = ["numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9"]
    var fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"]
    var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    for (var i = 0; numbers[i]; i++) { k[48 + i] = numbers[i] }
    for (var i = 0; letters[i]; i++) { k[65 + i] = letters[i] }
    for (var i = 0; numpadkeys[i]; i++) { k[96 + i] = numpadkeys[i] }
    for (var i = 0; fkeys[i]; i++) { k[112 + i] = fkeys[i] }


    /**
    *记录键盘按下的键
    **/
    var recordPress = function(eve) {
        eve = cg.core.getEventObj(eve);
        var keyName = k[eve.keyCode];
        pressed_keys[keyName] = true;
        if (keydown_callbacks[keyName]) {
            for (var i = 0, len = keydown_callbacks[keyName].length; i < len; i++) {
                keydown_callbacks[keyName][i]();

            }

        }
        if (keydown_callbacks["allKeys"]) {
            for (var i = 0, len = keydown_callbacks["allKeys"].length; i < len; i++) {
                keydown_callbacks["allKeys"][i]();

            }
        }
        if (preventDefault_keys[keyName]) {
            cg.core.preventDefault(eve);
        }
    }
    /**
    *记录键盘松开的键
    **/
    var recordUp = function(eve) {
        eve = cg.core.getEventObj(eve);
        var keyName = k[eve.keyCode];
        pressed_keys[keyName] = false;
        if (keyup_callbacks[keyName]) {
            for (var i = 0, len = keyup_callbacks[keyName].length; i < len; i++) {
                keyup_callbacks[keyName][i]();

            }
        }
        if (keyup_callbacks["allKeys"]) {
            for (var i = 0, len = keyup_callbacks["allKeys"].length; i < len; i++) {
                keyup_callbacks["allKeys"][i]();

            }
        }
        if (preventDefault_keys[keyName]) {
            cg.core.preventDefault(eve);
        }
    }
    cg.core.bindHandler(window, "keydown", recordPress);
    cg.core.bindHandler(window, "keyup", recordUp);

    /**
    *判断某个键是否按下
    **/
    this.isPressed = function(keyName) {
        return !!pressed_keys[keyName];
    };
    /**
    *禁止某个键按下的默认行为
    **/
    this.preventDefault = function(keyName) {
        if (cg.core.isArray(keyName)) {
            for (var i = 0, len = keyName.length; i < len; i++) {
                arguments.callee.call(this, keyName[i]);
            }
        }
        else {
            preventDefault_keys[keyName] = true;
        }
    }
    /**
    *绑定键盘按下事件
    **/
    this.onKeyDown = function(keyName, handler) {
        keyName = keyName || "allKeys";
        if (cg.core.isUndefined(keydown_callbacks[keyName])) {
            keydown_callbacks[keyName] = [];
        }
        keydown_callbacks[keyName].push(handler);

    }
    /**
    *绑定键盘弹起事件
    **/
    this.onKeyUp = function(keyName, handler) {
        keyName = keyName || "allKeys";
        if (cg.core.isUndefined(keyup_callbacks[keyName])) {
            keyup_callbacks[keyName] = [];
        }
        keyup_callbacks[keyName].push(handler);

    }
    /**
    *清除键盘按下事件处理程序
    **/
    this.clearDownCallbacks = function(keyName) {
        if (keyName) {
            keydown_callbacks[keyName] = [];
        }
        else {
            keydown_callbacks = {};
        }

    }
    /**
    *清除键盘弹起事件处理程序
    **/
    this.clearUpCallbacks = function(keyName) {
        if (keyName) {
            keyup_callbacks[keyName] = [];
        }
        else {
            keyup_callbacks = {};
        }
    }
});
