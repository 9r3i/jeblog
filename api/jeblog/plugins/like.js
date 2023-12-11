;window.like={
  version:'2.1.0',
  init:function(){
    var el=document.getElementById('like');
    if(!el){return false;}
    if(!history.state.hasOwnProperty('path')){return false;}
    var match=history.state.path.match(/\?id=(\d+)/);
    if(!match){return false;}
    let post={
      id:parseInt(match[1])
    },
    is_liked=this.getCookie('likes_post_'+post.id)?true:false,
    likes=is_liked?1:0;
    if(typeof _jeblog.pluginRequest==='function'){
      return _jeblog.pluginRequest('like',[
          'get',post.id
        ],function(r){
        let total=likes;
        if(r.toString().match(/^\d+$/)){
          total=parseInt(r);
        }
        el.innerHTML=like.likeContent(post,total,is_liked);
        return like.likeButton();
      });
    }
    el.innerHTML=this.likeContent(post,likes,is_liked);
    return this.likeButton();
  },
  likeButton:function(){
    var dlike=document.getElementById('like-button');
    if(dlike){
      dlike.onclick=function(e){
        var id=this.dataset.id;
        if(window.like.getCookie('likes_post_'+id)){
          return false;
        }return window.like.likePost(id);
      };
    }return true;
  },
  likeContent:function(post,likes,is_liked){
    return '<div class="like'+(is_liked?' liked':'')+'" '
        +'title="Like'+(is_liked?'d':'')+' this post" '
        +'id="like-button" data-id="'+post.id+'">'
      +'<div class="like-image"></div>'
      +'<div class="like-label">Like'+(is_liked?'d':'')+'</div>'
      +'</div>'
      +'<div class="like-count" title="'+likes+'">'
      +'<div class="before"></div>'
      +'<div class="after">'+likes+'</div>'
      +'</div>';
  },
  likePost:function(id){
    var lf=document.getElementById('like-form');
    if(lf){lf.parentElement.removeChild(lf);}
    var lc=document.querySelector('div[class="like"]');
    if(lc){
      lc.setAttribute('class','like liked');
      lc.parentElement.setAttribute('title','Liked');
    }
    var ll=document.querySelector('div[class="like-label"]');
    if(ll){ll.innerHTML='Liked';}
    var lco=document.querySelector('div[class="like-count"]');
    if(lco){
      var count=parseInt(lco.getAttribute('title'));
      lco.setAttribute('title',(count+1));
      lco.children[1].innerHTML=(count+1);
    }
    if(typeof _jeblog.pluginRequest==='function'){
      return _jeblog.pluginRequest('like',['put',id],function(r){
        if(r.toString()=='OK'){
          like.setCookie('likes_post_'+id,'true');
          return true;
        }
        let lco=document.querySelector('div[class="like-count"]');
        if(lco){
          var count=parseInt(lco.getAttribute('title'));
          lco.setAttribute('title',(count-1));
          lco.children[1].innerHTML=(count-1);
        }
      });
    }
    var url='like.txt?id='+id;
    window.like.request(url,function(r){
      if(typeof r!=='string'||r!='OK'){return false;}
      like.setCookie('likes_post_'+id,'true');
      return true;
    },function(e){
      console.log(e);
      return false;
    });
  },
  request:function(url,cb,er,txt){
    cb=typeof cb==='function'?cb:function(){};
    er=typeof er==='function'?er:function(){};
    txt=txt===false?false:true;
    var xhr=new XMLHttpRequest();
    xhr.open('GET',url,true);
    xhr.send();
    xhr.onreadystatechange=function(e){
      if(xhr.readyState==4){
        if(xhr.status==200){
          var text=xhr.responseText?xhr.responseText:' ';
          if(txt){return cb(text);}
          var res=false;
          try{res=JSON.parse(text);}catch(e){}
          return cb(res?res:text);
        }else if(xhr.status==0){
          return er('Error: No internet connection.');
        }return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
      }else if(xhr.readyState<4){return false;}
      return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
    };return true;
  },
  setCookie:function(cname,cvalue,exdays){
    exdays=exdays?parseInt(exdays):366;
    var d=new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires="expires="+d.toGMTString();
    document.cookie=cname+"="+cvalue+"; "+expires;
  },
  getCookie:function(cname){
    var name=cname+"=",
    ca=document.cookie.split(';');
    for(var i=0;i<ca.length;i++){
      var c=ca[i].trim();
      if(c.indexOf(name)==0){
        return c.substring(name.length,c.length);
      }
    }return "";
  }
};