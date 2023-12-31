/* events.js
 , ~ window events helper
 , authored by 9r3i
 , https://github.com/9r3i
 , started at august 8th 2018
 , version: 1.0.0
 , version: 1.1.0 - remove onmozfullscreenchange and onmozfullscreenerror, because deprecated.
 */
var WINDOW_EVENTS=window.WINDOW_EVENTS||{
  version:'1.1.0',
  execAll:function(){
    for(var i in WINDOW_EVENTS){
      if(!Array.isArray(WINDOW_EVENTS[i])){continue;}
      this.exec(i);
    }
  },
  exec:function(i){
    if(!WINDOW_EVENTS[i]){return false;}
    var t=WINDOW_EVENTS[i];
    if(!window.hasOwnProperty(i)){return false;}
    window[i]=function(e){
      if(!t){return false;}
      for(var v=0;v<t.length;v++){
        if(typeof t[v]!=='function'){continue;}
        t[v](e);
      }
    };
  },
  ontouchstart:[],
  ontouchend:[],
  ontouchmove:[],
  ontouchcancel:[],
  onvrdisplayconnect:[],
  onvrdisplaydisconnect:[],
  onvrdisplayactivate:[],
  onvrdisplaydeactivate:[],
  onvrdisplaypresentchange:[],
  onabort:[],
  onblur:[],
  onfocus:[],
  onauxclick:[],
  oncanplay:[],
  oncanplaythrough:[],
  onchange:[],
  onclick:[],
  onclose:[],
  oncontextmenu:[],
  ondblclick:[],
  ondrag:[],
  ondragend:[],
  ondragenter:[],
  ondragexit:[],
  ondragleave:[],
  ondragover:[],
  ondragstart:[],
  ondrop:[],
  ondurationchange:[],
  onemptied:[],
  onended:[],
  oninput:[],
  oninvalid:[],
  onkeydown:[],
  onkeypress:[],
  onkeyup:[],
  onloadeddata:[],
  onloadedmetadata:[],
  onloadend:[],
  onloadstart:[],
  onmousedown:[],
  onmouseenter:[],
  onmouseleave:[],
  onmousemove:[],
  onmouseout:[],
  onmouseover:[],
  onmouseup:[],
  onwheel:[],
  onpause:[],
  onplay:[],
  onplaying:[],
  onprogress:[],
  onratechange:[],
  onreset:[],
  onresize:[],
  onscroll:[],
  onseeked:[],
  onseeking:[],
  onselect:[],
  onshow:[],
  onstalled:[],
  onsubmit:[],
  onsuspend:[],
  ontimeupdate:[],
  onvolumechange:[],
  onwaiting:[],
  onselectstart:[],
  ontoggle:[],
  onpointercancel:[],
  onpointerdown:[],
  onpointerup:[],
  onpointermove:[],
  onpointerout:[],
  onpointerover:[],
  onpointerenter:[],
  onpointerleave:[],
  ongotpointercapture:[],
  onlostpointercapture:[],
  onanimationcancel:[],
  onanimationend:[],
  onanimationiteration:[],
  onanimationstart:[],
  ontransitioncancel:[],
  ontransitionend:[],
  ontransitionrun:[],
  ontransitionstart:[],
  onwebkitanimationend:[],
  onwebkitanimationiteration:[],
  onwebkitanimationstart:[],
  onwebkittransitionend:[],
  onerror:[],
  onafterprint:[],
  onbeforeprint:[],
  onbeforeunload:[],
  onhashchange:[],
  onlanguagechange:[],
  onmessage:[],
  onmessageerror:[],
  onoffline:[],
  ononline:[],
  onpagehide:[],
  onpageshow:[],
  onpopstate:[],
  onstorage:[],
  onunload:[],
  temp:null
};


