/**
*
*UI类
*
**/
cnGame.register("cnGame.ui", function(cg) {
    /*  点击回调    */                                
    var clickCallBacks={};
    
    var recordClick=function(){
            
        
    }
    /*  按钮  */
    var button=cg.class(function(options){
        this.init(options);
        cg.core.bindHandler(cg.canvas,"click",recordClick);
        
    }).methods({
        init:function(options){
            
            this.setOptions(options);           
                        
        },
        onClick:function(){
            
        },
        setOptions:function(options){
            cg.core.extend(this,options);
            
        }
        
        
    });
                                      
});