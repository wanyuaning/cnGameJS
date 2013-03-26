/**
*
*事件模块
*
**/
cnGame.register("cnGame", function(cg) {
    this.eventManager={
        /**
        *订阅
        **/
        subscribe:function(target,evtName,func,context){
            var newFunc;
            var targetEvts=target.events=target.events||{};
            targetEvts[evtName]=targetEvts[evtName]||[];
            if(!cg.core.isArray(func)){
               func=[func]; 
            }
            for(var i=0,len=func.length;i<len;i++){
                (newFunc=function(){func[arguments.callee.i].apply(context,arguments);}).i=i;
                newFunc.oriFunc=func[i];
                targetEvts[evtName].push(newFunc);
            }
        },
        /**
        *通知
        **/
        notify:function(target,evtName,evtObj){
            var evtsArr;
            if(target.events&&(evtsArr=target.events[evtName])){
                for(var i=0,len=evtsArr.length;i<len;i++){
                    if(cg.core.isFunction(evtsArr[i])){
                        evtsArr[i](evtObj);
                    }
                }
            }   
        },
        remove:function(target,evtName,func){
            var evtsArr=target.events[evtName];

            for(var i=0,len=evtsArr.length;i<len;i++){
                if(evtsArr[i].oriFunc===func){
                    evtsArr.splice(i,1);
                    return;
                }
            }

        }
    };
});