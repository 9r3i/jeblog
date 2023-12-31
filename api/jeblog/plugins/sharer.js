
;window.sharer={
  version:'1.1.0',
  init:function(){
    var PS=document.getElementById('sharer');
    if(PS){
      PS.title='Share this post';
      PS.innerHTML='<span class="sharer-image"></span>'
        +'<span class="sharer-label">Share</span>';
      var url=encodeURIComponent(document.location.href),
      title=encodeURIComponent(document.getElementsByTagName('title')[0].innerHTML),
      desc='',
      media=encodeURIComponent(document.location.protocol+'//'+document.location.host+'/files/images/luthfie-logo.png');
      PS.onclick=function(e){sharer.dialog(function(d){
        var wh=window.innerHeight,
        phone=window.ontouchstart!==undefined?true:false,
        stand=phone?305:265,
        dh=wh>(stand+20)?stand:(wh-20);
        d.style.marginTop='-'+(dh/2)+'px';
        d.style.height=dh+'px';
        d.innerHTML='<div class="sharer-header">Share to</div>';
        d.innerHTML+='<a href="javascript:sharer.open(\'facebook\')" title="Share to Facebook">'
          +'<div class="sharer-each sharer-facebook">Facebook</div></a>';
        d.innerHTML+='<a href="javascript:sharer.open(\'twitter\')" title="Share to Twitter">'
          +'<div class="sharer-each sharer-twitter">Twitter</div></a>';
        d.innerHTML+='<a href="javascript:sharer.open(\'gplus\')" title="Share to Google+">'
          +'<div class="sharer-each sharer-gplus">Google+</div></a>';
        d.innerHTML+='<a href="javascript:sharer.open(\'linkedin\')" title="Share to LinkedIn">'
          +'<div class="sharer-each sharer-linkedin">LinkedIn</div></a>';
        d.innerHTML+='<a href="javascript:sharer.open(\'pinterest\')" title="Share to Pinterest">'
          +'<div class="sharer-each sharer-pinterest">Pinterest</div></a>';
        d.innerHTML+='<a href="javascript:sharer.open(\'tumblr\')" title="Share to Tumblr">'
          +'<div class="sharer-each sharer-tumblr">Tumblr</div></a>';
        if(phone){
          d.innerHTML+='<a href="javascript:sharer.open(\'whatsapp\')" title="Share to Whatsapp">'
            +'<div class="sharer-each sharer-whatsapp">Whatsapp</div></a>';
        }
      });};
    }
  },
  open:function(l){
    var url=encodeURIComponent(document.location.href),
    title=encodeURIComponent(document.getElementsByTagName('title')[0].innerHTML),
    desc=encodeURIComponent(document.querySelector('meta[name="description"]').content),
    media=encodeURIComponent(document.location.protocol+'//'+document.location.host+'/files/images/luthfie-logo.png'),
    link={
      facebook:'http://www.facebook.com/share.php?v=4&u='+url+'&t='+title,
      twitter:'http://twitter.com/share?text='+title+'&url='+url+'&via=',
      gplus:'https://plus.google.com/share?url='+url,
      linkedin:'http://www.linkedin.com/shareArticle?mini=true&url='+url+'&title='+title+'&summary='+desc,
      pinterest:'http://pinterest.com/pin/create/button/?url='+url+'&media='+media+'&description='+title,
      tumblr:'http://tumblr.com/widgets/share/tool?canonicalUrl='+url+'&title='+title+'&caption='+desc,
      whatsapp:'whatsapp://send?text='+title+'%20-%20'+url,
    };
    sharer.dialog_close();
    if(link[l]){
      window.open(link[l],'_blank');
    }
  },
  dialog:function(c){
    var r=document.getElementById('sharer-dialog');
    if(r){r.parentElement.removeChild(r);}
    var d=document.createElement('div');
    d.id="sharer-dialog";
    d.innerHTML='<div id="sharer-bg"></div><div id="sharer-content"></div>';
    document.body.appendChild(d);
    var bg=document.getElementById('sharer-bg');
    if(bg){
      bg.onclick=function(e){sharer.dialog_close();};
      bg.oncontextmenu=function(e){sharer.dialog_close();};
    }
    var r=document.getElementById('sharer-content');
    if(c){c(r);}
  },
  dialog_close:function(){
    var r=document.getElementById('sharer-dialog');
    if(r){r.parentElement.removeChild(r);}
  }
};

