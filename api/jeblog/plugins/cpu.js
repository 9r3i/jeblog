;window.cpu={
  version:'2.0.0',
  init:function(){
    var el=document.getElementById('cpu');
    if(!el){return false;}
    el.innerHTML='';
    el.style.textAlign='center';
    var id='cpu-test-button-'+Math.ceil((new Date).getTime()*Math.random()),
    btn=this.button();
    btn.id=id;
    btn.innerText='Start Test';
    el.appendChild(btn);
    btn.onclick=function(e){
      this.blur();
      this.innerText='Testing...';
      return setTimeout(function(){
        var res=cpu.start();
        el.innerText='Your CPU speed is\r\n'+Math.ceil(res)+' MHz';
      },50);
    };return true;
  },
  button:function(){
    var btn=document.createElement('button');
    btn.style.border='0px none';
    btn.style.borderRadius='3px';
    btn.style.padding='3px 9px';
    btn.style.margin='5px';
    btn.style.color='#ddd';
    btn.style.fontSize='16px';
    btn.style.backgroundColor='#591';
    btn.style.cursor='pointer';
    btn.onmouseover=function(){
      this.style.backgroundColor='#480';
    };
    btn.onmouseout=function(){
      this.style.backgroundColor='#591';
    };
    return btn;
  },
  start:function(el){
    var speed=0,
    length=Math.pow(10,3);
    if(window.navigator.userAgent.match(/opera\smini/ig)){
      length=Math.pow(10,6);
    }
    for(var r=0;r<length;r++){
      speed+=this.push();
    }
    return (speed/length);
  },
  push:function(){
    var limit=Math.pow(10,6),
    store=0,count=0,result=0;
    for(var r=0;r<limit;r++){
      var micro=(new Date()).getTime();
      if(store==0){
        store=micro;
      }else if((micro-store)>0){
        result=micro-store;
        break;
      }else{
        count++;
      }
    }return count;
  }
};