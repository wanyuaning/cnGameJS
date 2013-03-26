/**
*
*本地存储
*
**/
cnGame.register("cnGame", function(cg) {
    var win=window;
    var localStorage={
        /**
        *设置名值对
        **/
        set:function(key,value){//可传入对象或名值对
            if(cg.core.isObject(key)){
                for(n in key){
                    if(key.hasOwnProperty(n)) arguments.callee(n,key[n]);
                }
                return;
            }
            win.localStorage.setItem(key,value);
        },
        /**
        *获取值
        **/
        get:function(name){
            return win.localStorage.getItem(name);
        },
        /**
        *删除结果
        **/        
        remove:function(name){
            win.localStorage.removeItem(name);
        },
        /**
        *清空localStorage
        **/         
        clear:function(){
            win.localStorage.clear();
        }
    }
    this.localStorage=localStorage;
});