/** 
 * 9r3i\jeblog::site
 * ~ site app
 * authored by 9r3i
 * https://github.com/9r3i
 * started at september ? 2019
 * continued at february 6th 2022
 * continued at november 18th 2023 - v2.0.0
 * @requires: 
 *   locode v2.0.0 
 *   events v1.1.0
 *   cpu v2.0.0
 *   like v2.0.0
 *   sharer v1.1.0
 */
;function jeblog(config){
config=typeof config==='object'&&config!==null?config:{};
this.version='2.0.0';
this.author='9r3i';
this.site={
  apiURL:typeof config.apiURL==='string'?config.apiURL:'',
  plugins:Array.isArray(config.plugins)?config.plugins:[],
  styles:Array.isArray(config.styles)?config.styles:[],
  dataSize:typeof config.dataSize==='number'
    &&config.dataSize!==NaN?config.dataSize:0x64,
};
this.postTemplate={
  id:1,
  title:'title',
  content:'content',
  status:'publish',
  time:1234567890,
  author:1,
};
this.dataTemplate={
  "1":{
    id:1,
    title:'title',
    content:'content',
    status:'publish',
    time:1234567890,
    author:1,
  }
};
this.DATA={
  posts:{},
  authors:{},
};
this.wrapperBody=null;
this.executioner=false;
this.suffix=this.site.apiURL.replace(/[^a-z0-9]+/g,'-');
this.dataKey='jeblog-data-'+this.suffix;
this.userKey='jeblog-user-'+this.suffix;
this.plength=this.site.plugins.length+this.site.styles.length;
window._jeblog=this;
this.init=function(){
  if(typeof localStorage!=='object'||localStorage===null){
    return this.blocked('Error: Your browser is not compatible to this site.');
  }
  /* site name */
  let siteTitle=document.querySelector('title');
  this.site.name=siteTitle?siteTitle.innerText:'jeblog';
  /* load styles */
  this.styleLoad(function(r){
    /* load plugins */
    _jeblog.pluginLoad(function(r){
      /* initialize state and body */
      _jeblog.initState();
      _jeblog.bodyInit();
      if(window.hasOwnProperty('WINDOW_EVENTS')){
        WINDOW_EVENTS.execAll();
      }
      return _jeblog.dataInit(function(r){
        _jeblog.DATA=r;
        return _jeblog.onpopstate();
      });
    });
  });
};
/**
 * jeblog virtual file
 * f = string of file name; required
 * c = string : write
 *     false  : delete
 *     true   : check
 *     null   : read or undefined
 * return: string/true on success, and false on failed.
 */
this.virtualFile=function(f,c){
  if(typeof f!=='string'){return false;}
  let prefix='jeblog/virtual/',
  ff=prefix+f;
  if(typeof c==='string'){
    localStorage.setItem(ff,c);
    return true;
  }
  let res=localStorage.getItem(ff);
  if(typeof res!=='string'){
    return false;
  }
  if(typeof c==='undefined'||c===null){
    return res;
  }else if(c===true){
    return true;
  }else if(c===false){
    localStorage.removeItem(ff);
    return true;
  }return false;
};
this.styleLoad=function(cb,i){
  cb=typeof cb==='function'?cb:function(){};
  i=parseInt(i)?parseInt(i):0;
  if(!this.site.styles.hasOwnProperty(i)){
    return cb(true);
  }
  let sfile=this.site.styles[i],
  vfile='styles/'+sfile,
  slength=this.plength,
  url=this.site.apiURL+'?style='+sfile,
  sc=document.createElement('style');
  sc.type='text/css';
  sc.media='screen,print';
  sc.id=sfile;
  document.head.appendChild(sc);
  document.body.innerHTML='<div class="init-loader">'
    +Math.floor(i/slength*100)
    +'% Loading... (style: '+sfile+')</div>';
  i++;
  if(this.virtualFile(vfile,true)){
    sc.textContent=this.virtualFile(vfile);
    return _jeblog.styleLoad(cb,i);
  }
  return this.getContent(url,function(r){
    _jeblog.virtualFile(vfile,r);
    sc.textContent=r;
    return _jeblog.styleLoad(cb,i);
  },function(e){
    document.body.innerHTML='[error] '+e;
  });
};
this.pluginLoad=function(cb,i){
  cb=typeof cb==='function'?cb:function(){};
  i=parseInt(i)?parseInt(i):0;
  if(!this.site.plugins.hasOwnProperty(i)){
    document.body.innerHTML='';
    return cb(true);
  }
  let pfile=this.site.plugins[i],
  vfile='plugins/'+pfile,
  plength=this.plength,
  url=this.site.apiURL+'?script=plugins/'+pfile,
  sc=document.createElement('script');
  sc.type='text/javascript';
  sc.id=pfile;
  sc.async=true;
  document.head.appendChild(sc);
  document.body.innerHTML='<div class="init-loader">'
    +Math.floor(i/plength*100)
    +'% Loading... (plugin: '+pfile+')</div>';
  i++;
  if(this.virtualFile(vfile,true)){
    sc.textContent=this.virtualFile(vfile);
    return _jeblog.pluginLoad(cb,i);
  }
  return this.getContent(url,function(r){
    _jeblog.virtualFile(vfile,r);
    sc.textContent=r;
    return _jeblog.pluginLoad(cb,i);
  },function(e){
    document.body.innerHTML='[error] '+e;
  });
};
this.pluginRequest=function(pname,args,cb){
  cb=typeof cb==='function'?cb:function(){};
  args=Array.isArray(args)?args:[];
  pname=typeof pname==='string'?pname:'';
  let url=_jeblog.site.apiURL,
  data='method=plugin&args='+JSON.stringify([
    pname,
    ...args,
  ]);
  return _jeblog.getContent(url,function(r){
    return cb(r);
  },function(e){
    return cb(r);
  },false,null,null,data);
};
this.saveAuthor=function(submit){
  let def={
    id:1,
    username:'luthfie',
    email:'luthfie@y7mail.com',
    uri:'',
    name:'',
    about:'',
    picture:'',
    cover:'',
  },error=false,
  password=null,
  stype=document.querySelector('[name="type"]');
  if(!stype||['add','edit'].indexOf(stype.value)<0){
    return alert('Error: Invalid form.');
  }
  for(let dk in def){
    let dc=document.querySelector('[name="author-'+dk+'"]');
    if(!dc){
      error=dk;
      break;
    }
    def[dk]=['id'].indexOf(dk)>=0
      ?parseInt(dc.value):dc.value;
  }
  if(error){
    return alert('Error: Invalid data key "'+uri+'".');
  }
  if(!this.DATA.authors.hasOwnProperty(def.id)
    &&stype.value=='edit'){
    return alert('Error: Data is not found.');
  }
  if(this.DATA.authors.hasOwnProperty(def.id)
    &&stype.value=='add'){
    return alert('Error: Data key does exist.');
  }
  if(stype.value=='add'){
    let dc=document.querySelector('[name="author-password"]');
    if(!dc){
      return alert('Error: Requires password.');
    }
    password=dc.value;
    let url=_jeblog.site.apiURL,
    data='method=addUser&args='+JSON.stringify([
      def.username,
      password,
    ]);
    _jeblog.getContent(url,function(r){
      alert(r);
    },function(e){
      alert(e);
    },false,null,null,data);
  }
  submit.value='Saving...';
  this.DATA.authors[def.id]=def;
  localStorage.setItem(this.dataKey,JSON.stringify(this.DATA));
  return setTimeout(()=>{
    if(stype.value=='add'){
      return _jeblog.go('?admin=author&pid='+def.id);
    }
    submit.value='Saved!';
    setTimeout(()=>{
      submit.value='Save';
    },2048);
  },1024);
};
this.saveData=function(){
  let json=JSON.stringify(_jeblog.DATA),
  ax=document.createElement('a'),
  blob=new Blob([json],{type:'octet/stream'}),
  url=window.URL.createObjectURL(blob);
  ax.style.display='none';
  ax.href=url;
  ax.download='data.json';
  document.body.appendChild(ax);
  ax.click();
  window.URL.revokeObjectURL(url);
  ax.parentNode.removeChild(ax);
};
this.deleteData=function(submit){
  submit.value='Deleting...';
  submit.disabled=true;
  delete this.DATA;
  localStorage.removeItem('jeblog-data-update');
  localStorage.removeItem(this.dataKey);
  return setTimeout(()=>{
    submit.value='Deleted!';
    setTimeout(()=>{
      return window.location.reload();
    },2048);
  },1024);
};
this.sendData=function(submit){
  submit.value='Sending...';
  submit.disabled=true;
  let url=_jeblog.site.apiURL,
  data='method=send&args=['
    +encodeURIComponent(JSON.stringify(this.DATA))
    +']';
  return this.getContent(url,function(r){
    submit.value=r.toString().length<10?r:'Error!';
    setTimeout(()=>{
      submit.disabled=false;
      submit.value='Send';
    },2048);
  },function(e){
    alert(e);
  },false,null,function(e){
    let per=Math.floor(e.loaded/e.total*100)
    submit.value=per+'% Sending...';
  },data);
};
this.deletePost=function(submit){
  submit.value='Deleting...';
  submit.disabled=true;
  delete this.DATA.posts[submit.dataset.id];
  localStorage.setItem(this.dataKey,JSON.stringify(this.DATA));
  return setTimeout(()=>{
    submit.value='Deleted!';
    setTimeout(()=>{
      return _jeblog.go('?admin');
    },2048);
  },1024);
};
this.savePost=function(submit){
  let def={
    id:0,
    title:'',
    content:'',
    status:'draft',
    time:0,
    author:1,
  },error=false,
  stype=document.querySelector('[name="type"]');
  if(!stype||['add','edit'].indexOf(stype.value)<0){
    return alert('Error: Invalid form.');
  }
  for(let dk in def){
    let dc=document.querySelector('[name="post-'+dk+'"]');
    if(!dc){
      error=true;
      break;
    }
    def[dk]=['id','time','author'].indexOf(dk)>=0
      ?parseInt(dc.value):dc.value;
  }
  if(error){
    return alert('Error: Invalid data key.');
  }
  if(!this.DATA.posts.hasOwnProperty(def.id)
    &&stype.value=='edit'){
    return alert('Error: Data is not found.');
  }
  if(this.DATA.posts.hasOwnProperty(def.id)
    &&stype.value=='add'){
    return alert('Error: Data key does exist.');
  }
  submit.value='Saving...';
  this.DATA.posts[def.id]=def;
  localStorage.setItem(this.dataKey,JSON.stringify(this.DATA));
  return setTimeout(()=>{
    if(stype.value=='add'){
      return _jeblog.go('?admin=edit&pid='+def.id);
    }
    submit.value='Saved!';
    setTimeout(()=>{
      submit.value='Save';
    },2048);
  },1024);
};
this.adminPage=function(query,adminData){
  let admin={
      id:0,
      username:'unknown',
      name:'Unknown',
  },
  authors=this.DATA.authors,
  adraw=null;
  try{
    let adraw=JSON.parse(adminData);
    for(let aid in authors){
      let adu=authors[aid];
      if(adu.username==adraw.username){
        admin=adu;
        admin.token=adraw.token;
      }
    }
  }catch(e){}
  let adminName=admin.hasOwnProperty('name')
      ?' ('+admin.name+')':'',
  authorMenu=admin.username=='luthfie'
      ?'<a href="?admin=authors">Authors</a>':''
  amenu='<div class="admin-menu">'
    +'<a href="?admin=data">Data</a>'
    +'<a href="?admin">Posts</a>'
    +'<a href="?admin=add">Add Post</a>'
    +authorMenu
    +'<a href="?admin=logout">Logout</a>'
    +'</div>'
    +'<div class="admin-username">Login as <strong>'
      +admin.username+'</strong>'+adminName
    +'</div>',
  acontent='';
  if(query.admin=='data'){
    let timeNext=localStorage.getItem('jeblog-data-update'),
    timeUpdate=new Date(parseInt(timeNext)).toString();
    acontent+='<div class="admin-edit">'
      +'<input value="Send" type="submit" onclick="_jeblog.sendData(this)" /> '
      +'<input value="Delete" type="submit" onclick="_jeblog.deleteData(this)" /> '
      +'<input value="Download" type="submit" onclick="_jeblog.saveData()" /> '
      +'<input value="Clear All" type="submit" onclick="localStorage.clear();window.location.reload()" /> '
      +'</div>';
    for(let i=0;i<localStorage.length;i++){
      acontent+='<div>['+i+'] '+localStorage.key(i)+'</div>';
    }
    return amenu
      +'<div class="title">Data</div>'
      +'<div>Next Update: '+timeUpdate+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='delete'){
    if(query.hasOwnProperty('pid')
      &&this.DATA.posts.hasOwnProperty(query.pid)){
      acontent+='<div class="admin-edit"><input value="Delete" type="submit" onclick="_jeblog.deletePost(this)" data-id="'+query.pid+'" /></div>';
    }else{
      acontent+='<div class="login-error">Error: Post is not found.</div>';
    }
    return amenu
      +'<div class="title">Delete Post #'+query.pid+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='add'){
    let postTime=Math.ceil((new Date).getTime()/1000),
    pkeys=Object.keys(this.DATA.posts),
    newID=parseInt(pkeys[pkeys.length-1])+1;
    acontent+='<div><input name="post-id" value="'+newID+'" type="hidden" /></div>';
    acontent+='<div><input name="post-title" value="" type="text" placeholder="Title" /></div>';
      acontent+='<div><textarea name="post-content" placeholder="Content"></textarea></div>';
      acontent+='<div><input name="post-status" value="publish" type="text" data-form="option" />';
      acontent+='<input name="post-time" value="'+postTime+'" type="text" data-form="option" /></div>';
      acontent+='<div><input name="post-author" value="'+admin.id+'" type="hidden" /></div>';
      acontent+='<div><input name="type" value="add" type="hidden" /></div>';
      acontent+='<div><input value="Save" type="submit" onclick="_jeblog.savePost(this)" /></div>';
    return amenu
      +'<div class="title">Add Post #'+newID+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='edit'){
    if(query.hasOwnProperty('pid')
      &&this.DATA.posts.hasOwnProperty(query.pid)){
      let post=this.DATA.posts[query.pid];
      acontent+='<div><input name="post-id" value="'+post.id+'" type="hidden" /></div>';
      acontent+='<div><input name="post-title" value="'+post.title+'" type="text" placeholder="Title" /></div>';
      acontent+='<div><textarea name="post-content" placeholder="Content">'+post.content+'</textarea></div>';
      acontent+='<div><input name="post-status" value="'+post.status+'" type="text" data-form="option" placeholder="Status" />';
      acontent+='<input name="post-time" value="'+post.time+'" type="text" data-form="option" placeholder="Time" /></div>';
      acontent+='<div><input name="post-author" value="'+post.author+'" type="hidden" /></div>';
      acontent+='<div><input name="type" value="edit" type="hidden" /></div>';
      acontent+='<div><input value="Save" type="submit" onclick="_jeblog.savePost(this)" /> '
        +'<input value="Delete" type="submit" onclick="_jeblog.go(\'?admin=delete&pid=\'+this.dataset.id)" data-id="'+post.id+'" /> '
        +'<input value="View" type="submit" onclick="_jeblog.go(\'?id=\'+this.dataset.id)" data-id="'+post.id+'" />'
        +'</div>';
    }else{
      acontent+='<div class="login-error">Error: Post is not found.</div>';
    }
    return amenu
      +'<div class="title">Edit Post #'+query.pid+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='addauthor'){
    let akeys=Object.keys(this.DATA.authors),
    newID=parseInt(akeys[akeys.length-1])+1;
      acontent+='<div><input name="author-id" value="'+newID+'" type="hidden" readonly="readonly" /></div>';
      acontent+='<div><input name="author-username" value="" type="text" placeholder="Username" /></div>';
      acontent+='<div><input name="author-password" value="" type="password" placeholder="Password" /></div>';
      acontent+='<div><input name="author-email" value="" type="text" placeholder="Email" /></div>';
      acontent+='<div><input name="author-uri" value="" type="text" placeholder="URI" /></div>';
      acontent+='<div><input name="author-name" value="" type="text" placeholder="Name" /></div>';
      acontent+='<div><textarea name="author-about" placeholder="About"></textarea></div>';
      acontent+='<div><input name="author-picture" value="" type="text" placeholder="Picture URL" /></div>';
      acontent+='<div><input name="author-cover" value="" type="text" placeholder="Cover URL" /></div>';
      acontent+='<div><input name="type" value="add" type="hidden" /></div>';
      acontent+='<div><input value="Save" type="submit" onclick="_jeblog.saveAuthor(this)" /></div>';
    return amenu
      +'<div class="title">Add Author #'+newID+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='author'){
    if(query.hasOwnProperty('pid')
      &&this.DATA.authors.hasOwnProperty(query.pid)){
      let author=this.DATA.authors[query.pid];
      acontent+='<div><input name="author-id" value="'+author.id+'" type="hidden" readonly="readonly" /></div>';
      acontent+='<div><input name="author-username" value="'+author.username+'" type="text" readonly="readonly" /></div>';
      acontent+='<div><input name="author-email" value="'+author.email+'" type="text" placeholder="Email" /></div>';
      acontent+='<div><input name="author-uri" value="'+author.uri+'" type="text" placeholder="URI" /></div>';
      acontent+='<div><input name="author-name" value="'+author.name+'" type="text" placeholder="Name" /></div>';
      acontent+='<div><textarea name="author-about" placeholder="About">'+author.about+'</textarea></div>';
      acontent+='<div><input name="author-picture" value="'+author.picture+'" type="text" placeholder="Picture URL" /></div>';
      acontent+='<div><input name="author-cover" value="'+author.cover+'" type="text" placeholder="Cover URL" /></div>';
      acontent+='<div><input name="type" value="edit" type="hidden" /></div>';
      acontent+='<div><input value="Save" type="submit" onclick="_jeblog.saveAuthor(this)" /> '
        +'<input value="View" type="submit" onclick="_jeblog.go(\'?author=\'+this.dataset.id)" data-id="'+author.id+'" />'
        +'</div>';
    }else{
      acontent+='<div class="login-error">Error: Author is not found.</div>';
    }
    return amenu
      +'<div class="title">Edit Author #'+query.pid+'</div>'
      +'<div class="admin-edit">'+acontent+'</div>';
  }else if(query.admin=='authors'){
    for(let pid in this.DATA.authors){
      let author=this.DATA.authors[pid];
      acontent+='<div>['+pid+'] <a href="?admin=author&pid='
        +pid+'">'
        +author.name+'</a></div>';
    }
    return amenu
      +'<div class="title">Authors</div>'
      +'<div>'+acontent+'</div>'
      +'<div class="title"></div>'
      +'<div class="admin-menu"><a href="?admin=addauthor">Add Author</a></div>';
  }
  let div=document.createElement('div'),
  dca=document.createElement('div');
  div.appendChild(dca);
  for(let pid in this.DATA.posts){
    let post=this.DATA.posts[pid],
    dc=document.createElement('div');
    dc.innerHTML='['+pid+'] <a href="?admin=edit&pid='+pid+'">'
      +post.title+'</a>';
    div.insertBefore(dc,div.firstChild);
  }
  acontent+=div.innerHTML;
  return amenu
    +'<div class="title">Posts</div>'
    +'<div>'+acontent+'</div>';
};
this.initLoginForm=function(){
  var username=document.querySelector('input[name="username"]'),
  password=document.querySelector('input[name="password"]'),
  submit=document.querySelector('input[name="submit"]'),
  show=document.querySelector('input[name="show"]'),
  error=document.querySelector('div#login-error');
  if(!submit||!username||!password||!show||!error||submit.value!='Login'){
    return false;
  }
  show.onclick=function(e){
    if(this.value=='Show'){
      password.type='text';
      this.value='Hide';
    }else{
      password.type='password';
      this.value='Show';
    }
  };
  submit.onclick=function(e){
    e.preventDefault();
    let url=_jeblog.site.apiURL,
    data='method=login&args='+JSON.stringify([
      username.value,
      password.value,
    ]);
    _jeblog.loader('Requesting...',0);
    return _jeblog.getContent(url,function(r){
      _jeblog.loader(false);
      if(typeof r==='object'&&r!==null
        &&r.hasOwnProperty('username')
        &&r.hasOwnProperty('token')
        &&r.hasOwnProperty('status')
        &&r.status=='OK'&&r.username==username.value
        ){
        localStorage.setItem(_jeblog.userKey,JSON.stringify(r));
        return _jeblog.go('?admin='+r.username);
      }
      error.style.display='block';
      error.innerText=r.toString()+'';
      return setTimeout(function(){
        error.style.display='none';
      },30000);
    },function(e){
      _jeblog.loader(false);
      error.style.display='block';
      error.innerText=e;
      return setTimeout(function(){
        error.style.display='none';
      },3000);
    },false,null,null,data);
  };
};
this.initAnchors=function(){
  this.initSearchForm();
  var ans=document.querySelectorAll('a:not([target="_blank"])');
  var i=ans.length;
  while(i--){
    ans[i].onclick=this.execAnchor;
  }return true;
};
this.execAnchor=function(e){
  e.preventDefault();
  _jeblog.executioner=true;
  _jeblog.go(this.href);
  return false;
};
this.searchFormContent=function(){
  return '<div class="search-wrap">'
    +'<div class="search-form">'
    +'<div class="search-form-column-input">'
    +'<input class="search-form-input" data-search="keyword" '
      +'placeholder="Search..." value="" />'
    +'</div>'
    +'<div class="search-form-column-button">'
    +'<div class="search-button" data-search="submit"></div>'
    +'</div>'
    +'<div class="search-suggestion" data-search="suggestion"></div>'
    +'</div>'
    +'</div>';
};
this.initSearchForm=function(){
  var sinput=document.querySelector('input[data-search="keyword"]');
  var sbutton=document.querySelector('[data-search="submit"]');
  if(!sinput){return false;}
  sinput.onkeyup=function(e){
    _jeblog.searchSuggestion(this.value);
    if(e.keyCode!==13||!this.value){return false;}
    var url='?search='+this.value;
    return _jeblog.go(url);
  };
  if(sbutton){sbutton.onclick=function(e){
    if(!sinput.value){return false;}
    var url='?search='+sinput.value;
    return _jeblog.go(url);};
  }
};
this.searchSuggestion=function(value){
  var el=document.querySelector('[data-search="suggestion"]'),
  posts=this.objectToArray(this.DATA.posts);
  if(typeof value!=='string'||!value||!el||!Array.isArray(posts)){
    return false;
  }
  this.clearElement(el);
  posts.reverse();
  for(var i=0;i<posts.length;i++){
    if((new RegExp(value,'i')).test(posts[i].title)){
      var nel=document.createElement('div');
      var an=document.createElement('a');
      nel.classList.add('search-suggestion-row');
      nel.innerText=posts[i].title;
      an.title=posts[i].title;
      an.href='?id='+posts[i].id;
      an.onclick=this.execAnchor;
      an.appendChild(nel);
      el.appendChild(an);
    }
  }return true;
};
this.initState=function(){
  if(window.hasOwnProperty('WINDOW_EVENTS')){
    WINDOW_EVENTS.onpopstate.push(this.onpopstate);
  }else{
    window.onpopstate=this.onpopstate;
  }return true;
};
this.go=function(href){
  if(href==window.location.href){return false;}
  window.history.pushState({path:href},'',href);
  return this.onpopstate();
};
this.onpopstate=function(e){
  if(_jeblog.executioner){
    _jeblog.setTitle('Loading...');
    _jeblog.splash('Loading...');
    return setTimeout(function(){
      _jeblog.executioner=false;
      return _jeblog.putContent();
    },512);
  }return _jeblog.putContent();
};
this.contentLoginForm=function(){
  return '<div class="login">'
    +'<div class="login-header"></div>'
    +'<div class="login-body">'
    +'<div class="login-error" id="login-error" '
      +'style="display:none;">Invalid username or password.</div>'
    +'<div class="login-input">'
    +'<input type="text" name="username" placeholder="Username" /></div>'
    +'<div class="login-input">'
      +'<input type="submit" name="show" value="Show" />'
      +'<input type="password" name="password" placeholder="Password" />'
    +'</div>'
    +'<div class="login-input">'
      +'<input type="submit" name="submit" value="Login" />'
    +'</div>'
    +'</div>'
    +'<div class="login-footer"></div></div>';
};
this.contentSearchResult=function(keyword){
  var tagsHTML=document.createElement('div'),
  total=0,latest=[];
  tagsHTML.classList.add('bulk-parent');
  for(var i in this.DATA.posts){
    latest.push(this.DATA.posts[i].id);
  }
  latest.reverse();
  for(var e=0;e<latest.length;e++){
    var i=latest[e];
    var match=this.DATA.posts[i].content.match(new RegExp(keyword,'ig'));
    if(!match){continue;}
    var row=document.createElement('div'),
    rowTitle=document.createElement('div'),
    rowLink=document.createElement('a'),
    rowTime=document.createElement('div'),
    rowContent=document.createElement('div');
    row.classList.add('bulk-row');
    rowTitle.classList.add('bulk-title');
    rowTime.classList.add('bulk-time');
    rowContent.classList.add('bulk-content');
    rowLink.href='?id='+i;
    rowLink.title=this.DATA.posts[i].title;
    rowLink.innerText=this.DATA.posts[i].title;
    rowTime.innerText=this.timeToDate(this.DATA.posts[i].time);
    rowContent.innerText=this.contentDescription(this.DATA.posts[i].content);
    rowTitle.appendChild(rowLink);
    row.appendChild(rowTitle);
    row.appendChild(rowTime);
    row.appendChild(rowContent);
    tagsHTML.appendChild(row);
    total++;
  }
  return {total:total,element:tagsHTML};
};
this.contentAuthor=function(data){
  var content=document.createElement('div'),
  footer=document.createElement('div'),
  about=document.createElement('div'),
  cover=document.createElement('div'),
  picture=document.createElement('div'),
  coverImage=document.createElement('img'),
  pictureImage=document.createElement('img'),
  email=document.createElement('div'),
  emailText=document.createTextNode('Email: '),
  emailAn=document.createElement('a'),
  uri=document.createElement('div'),
  uriText=document.createTextNode('URI: '),
  uriAn=document.createElement('a');
  content.classList.add('author');
  about.classList.add('author-about');
  cover.classList.add('author-cover');
  picture.classList.add('author-picture');
  email.classList.add('author-email');
  uri.classList.add('author-uri');
  about.innerText=data.about;
  emailAn.target='_blank';
  emailAn.href='mailto:'+data.email;
  emailAn.innerText=data.email;
  uriAn.target='_blank';
  uriAn.href=data.uri;
  uriAn.innerText=data.uri;
  coverImage.src=data.cover.match(/^https?:/)
    ?data.cover:this.site.apiURL+data.cover;
  pictureImage.src=data.picture.match(/^https?:/)
    ?data.picture:this.site.apiURL+data.picture;
  picture.appendChild(pictureImage);
  cover.appendChild(coverImage);
  cover.appendChild(picture);
  email.appendChild(emailText);
  email.appendChild(emailAn);
  uri.appendChild(uriText);
  uri.appendChild(uriAn);
  content.appendChild(cover);
  content.appendChild(about);
  footer.appendChild(email);
  footer.appendChild(uri);
  return {content:content,footer:footer};
};
this.contentRecent=function(limit){
  limit=limit?parseInt(limit):20;
  limit=Math.max(limit,10);
  var tagsHTML=document.createElement('div'),
  totalTags=0,latest=[];
  tagsHTML.classList.add('bulk-parent');
  for(var i in this.DATA.posts){
    latest.push(this.DATA.posts[i].id);
  }
  latest.reverse();
  for(var e=0;e<latest.length;e++){
    var i=latest[e];
    var row=document.createElement('div'),
    rowTitle=document.createElement('div'),
    rowLink=document.createElement('a'),
    rowTime=document.createElement('div'),
    rowContent=document.createElement('div');
    row.classList.add('bulk-row');
    rowTitle.classList.add('bulk-title');
    rowTime.classList.add('bulk-time');
    rowContent.classList.add('bulk-content');
    rowLink.href='?id='+i;
    rowLink.title=this.DATA.posts[i].title;
    rowLink.innerText=this.DATA.posts[i].title;
    rowTime.innerText=this.timeToDate(this.DATA.posts[i].time);
    rowContent.innerText=this.contentDescription(this.DATA.posts[i].content);
    rowTitle.appendChild(rowLink);
    row.appendChild(rowTitle);
    row.appendChild(rowTime);
    row.appendChild(rowContent);
    tagsHTML.appendChild(row);
    totalTags++;
    if(totalTags>=limit){break;}
  }
  return {total:totalTags,element:tagsHTML};
};
this.contentTag=function(tagName){
  var tagsHTML=document.createElement('div'),
  totalTags=0,latest=[];
  tagsHTML.classList.add('bulk-parent');
  for(var i in this.DATA.posts){
    latest.push(this.DATA.posts[i].id);
  }
  latest.reverse();
  for(var e=0;e<latest.length;e++){
    var i=latest[e];
    var match=this.DATA.posts[i].content.match(new RegExp('#'+tagName,'ig'));
    if(!match){continue;}
    var row=document.createElement('div'),
    rowTitle=document.createElement('div'),
    rowLink=document.createElement('a'),
    rowTime=document.createElement('div'),
    rowContent=document.createElement('div');
    row.classList.add('bulk-row');
    rowTitle.classList.add('bulk-title');
    rowTime.classList.add('bulk-time');
    rowContent.classList.add('bulk-content');
    rowLink.href='?id='+i;
    rowLink.title=this.DATA.posts[i].title;
    rowLink.innerText=this.DATA.posts[i].title;
    rowTime.innerText=this.timeToDate(this.DATA.posts[i].time);
    rowContent.innerText=this.contentDescription(this.DATA.posts[i].content);
    rowTitle.appendChild(rowLink);
    row.appendChild(rowTitle);
    row.appendChild(rowTime);
    row.appendChild(rowContent);
    tagsHTML.appendChild(row);
    totalTags++;
  }
  return {total:totalTags,element:tagsHTML};
};
this.contentHome=function(){
  var tags={},tagName='#islam',tagsByName=[],
  tagsHTML=document.createElement('div');
  tagsHTML.classList.add('tags-content');
  for(var i in this.DATA.posts){
    var match=this.DATA.posts[i].content.match(/#[a-z]+/ig);
    if(!match){continue;}
    var postID=this.DATA.posts[i].id;
    for(var e=0;e<match.length;e++){
      tagName=match[e].toLowerCase();
      if(tagsByName.indexOf(tagName)<0){
        tagsByName.push(tagName);
      }
      if(!tags.hasOwnProperty(tagName)){
        tags[tagName]=[];
      }
      if(tags[tagName].indexOf(postID)>=0){continue;}
      tags[tagName].push(postID);
    }
  }
  tagsByName.sort();
  for(var e=0;e<tagsByName.length;e++){
    var i=tagsByName[e],
    an=document.createElement('a'),
    space=document.createTextNode(' ');
    an.classList.add('tag-count-'+this.tagClass(tags[i].length));
    an.classList.add('tags-each');
    an.href='?tag='+i.substr(1);
    an.title=i;
    an.dataset.content=i.substr(1)+'('+tags[i].length+')';
    tagsHTML.appendChild(an);
    tagsHTML.appendChild(space);
  }
  return {total:tagsByName.length,element:tagsHTML};
};
this.contentDescription=function(s,m){
  m=m?parseInt(m):300;
  s=typeof s==='string'?s:'';
  if(m>=s.length){return s;}
  s=s.replace(/"/g,'&quot;');
  var sp=s.split(/(\r\n|\r|\n)+/),n='',i=0;
  while(n.length<m){
    n+=sp[i]+' ';
    i++;
  }return n;
};
this.contentKeywords=function(s,m){
  m=m?parseInt(m):3;
  s=typeof s==='string'?s:'';
  var match=s.match(/#?[a-z]+/ig),
  words=[];
  for(var i=0;i<match.length;i++){
    if(match[i].length<5||words.indexOf(match[i])>=0){continue;}
    words.push(match[i]);
  }
  words=this.shuffle(words);
  return words.slice(0,m).join(', ').toLowerCase();
};
this.putContent=function(){
  var stated=false,
  realpath=window.location.search,
  srch=realpath.substr(1);
  if(history.state&&history.state.hasOwnProperty('path')){
    realpath=history.state.path;
    srch=realpath.split('?');
    srch=srch.hasOwnProperty(1)?srch[1]:'';
  }
  var query=this.parseStr(srch),
  name='none',
  data={
    title:'Error: 404 Not Found',
    content:'',
    detail:'',
    plugins:'',
    tags:'',
    footnote:'',
    description:'The sly eagle doesn\'t kill at whim',
    keywords:'Think, Learn, Action',
  };
  if(query.hasOwnProperty('id')&&this.DATA.posts.hasOwnProperty(query.id)){
    name='post';
    var dataRaw=JSON.stringify(this.DATA.posts[query.id]);
    var post=JSON.parse(dataRaw);
    var pcontent=post.content;
    pcontent=this.contentLink(pcontent);
    pcontent=this.contentParagraph(pcontent);
    if(window.hasOwnProperty('locode')&&typeof locode==='function'){
      pcontent=(new locode).convert(pcontent);
    }
    data.title=post.title;
    data.content=this.contentTags(pcontent);
    data.tags=this.getTags(post.content);
    data.detail='Published at '+this.timeToDate(post.time)
      +'<br />Authored by <a href="?author='+post.author+'">'
      +this.DATA.authors[post.author].name+'</a>';
    data.plugins='<div id="sharer"></div> <div id="like"></div>';
    data.id=post.id;
    data.description=this.contentDescription(post.content);
    data.keywords=this.contentKeywords(post.content);
    if(localStorage.getItem(this.userKey)){
      data.plugins+='<div class="admin-edit" id="post-admin-edit">'
        +'<input value="Edit" type="submit" onclick="_jeblog.go(\'?admin=edit&pid=\'+this.dataset.id)" data-id="'
        +post.id+'" /> '
        +'<input value="Close" type="submit" onclick="this.parentNode.parentNode.removeChild(this.parentNode)" /> '
        +'</div>';
    }
  }else if(query.hasOwnProperty('tag')){
    name='tag';
    var bulk=this.contentTag(query.tag);
    data.detail='Total: '+bulk.total+' entr'+(bulk.total>1?'ies':'y');
    data.content=bulk.element;
    data.title='#'+query.tag;
    data.description='Label tag for #'+query.tag;
    data.keywords=query.tag;
  }else if(query.hasOwnProperty('recent')){
    name='recent';
    var bulk=this.contentRecent(query.recent);
    data.detail='Total: '+bulk.total+' entr'+(bulk.total>1?'ies':'y');
    data.content=bulk.element;
    data.title='Recent Posts';
  }else if(query.hasOwnProperty('search')){
    name='search';
    var keyword=query.search.trim().length>0?query.search:false;
    if(keyword){
      var bulk=this.contentSearchResult(keyword);
      data.detail='Total: '+bulk.total+' entr'+(bulk.total>1?'ies':'y');
      data.content=bulk.element;
      data.title='Search'+(keyword?' for '+keyword:'');
      data.description='Search result for '+keyword;
      data.keywords=keyword;
    }else{
      data.detail='';
      data.title='Search';
      data.content=this.searchFormContent();
    }
  }
  else if(query.hasOwnProperty('author')
    &&this.DATA.authors.hasOwnProperty(query.author)){
    name='author';
    data['author']=this.DATA.authors[query.author];
    var user=this.contentAuthor(data.author),
    tos=document.createElement('div');
    tos.innerHTML=data.author.name;
    data.title=tos.innerHTML;
    data.content=user.content;
    data.footnote=user.footer;
    data.detail='Author Profile';
    data.description=this.contentDescription(data.author.about);
    data.keywords=this.contentKeywords(data.author.about);
  }else if(query.hasOwnProperty('admin')){
    name='admin';
    if(query.admin=='logout'){
      localStorage.removeItem(this.userKey);
      return this.go('?admin');
    }
    let admin=localStorage.getItem(this.userKey);
    if(admin){
      data.title='Admin';
      data.content=this.adminPage(query,admin);
    }else{
      data.title='Login';
      data.content=this.contentLoginForm();
    }
  }else if(query.hasOwnProperty('home')||JSON.stringify(query)==='{}'){
    name='home';
    var home=this.contentHome();
    data.detail='Total: '+home.total+' tags';
    data.content=home.element;
    data.title='The sly eagle doesn\'t kill at whim';
  }
  var template=this.newBodyTemplate(name);
  for(var i in template){
    if(typeof template[i]!=='object'
      ||template[i]===null
      ||!data.hasOwnProperty(i)
      ||i=='title'){continue;}
    if(typeof data[i]==='string'){
      template[i].innerHTML=data[i];
    }else if(typeof data[i]==='object'
      &&data[i]!==null
      &&typeof data[i].appendChild==='function'){
      template[i].appendChild(data[i]);
    }
  }
  this.setTitle(data.title);
  /* update/replace history state */
  if(stated){
    window.history.replaceState({title:data.title,template:name,},'',realpath);
  }
  var pingback=document.querySelector('link[rel="pingback"]'),
  canonical=document.querySelector('link[rel="canonical"]');
  if(pingback){pingback.href=realpath;}
  if(canonical){canonical.href=realpath;}
  var description=document.querySelector('meta[name="description"]'),
  keywords=document.querySelector('meta[name="keywords"]');
  if(description){description.content=data.description;}
  if(keywords){keywords.content=data.keywords;}
  if(window.hasOwnProperty('sharer')){sharer.init();}
  if(window.hasOwnProperty('like')){like.init();}
  if(window.hasOwnProperty('cpu')){cpu.init();}
  this.initSearchForm();
  this.initLoginForm();
  return this.initAnchors();
};
this.newBodyTemplate=function(name){
  this.clearElement(this.wrapperBody);
  document.scrollingElement.scrollTop=0;
  var names={
    post:['detail','title','plugins','tags','content'],
    home:['detail','title','content'],
    tag:['detail','title','content'],
    recent:['detail','title','content'],
    author:['detail','title','content','footnote'],
    search:['detail','title','content'],
    admin:['content'],
    none:['detail','title','content']
  },
  wrapper={name:'none'};
  if(typeof name!=='string'||!names.hasOwnProperty(name)){
    return false;
  }
  for(var i=0;i<names[name].length;i++){
    var wkey=names[name][i];
    wrapper[wkey]=this.newBody(wkey);
  }
  wrapper.name=name;
  return wrapper;
};
this.newBody=function(name){
  var el=document.createElement('div');
  el.classList.add(name);
  el.id=name;
  el.dataset.content='';
  this.wrapperBody.appendChild(el);
  return el;
};
this.bodyInit=function(){
  this.clearElement(document.body);
  var scr=document.getElementsByTagName('script');
  if(scr){
    var i=scr.length;
    while(i--){
      scr[i].parentElement.removeChild(scr[i]);
    }
  }
  if(!document.hasOwnProperty('body')){
    document['body']=document.createElement('body');
  }
  this.buildWrapper();
  return true;
};
this.buildWrapper=function(){
  var wrapper=document.getElementById('wrapper');
  if(wrapper){
    wrapper.parentElement.removeChild(wrapper);
  }
  wrapper=document.createElement('div');
  wrapper.classList.add('wrapper');
  wrapper.id='wrapper';
  var header=document.createElement('div');
  header.classList.add('header');
  header.dataset.content=this.site.name;
  wrapper.appendChild(header);
  var neck=document.createElement('div');
  neck.classList.add('neck');
  wrapper.appendChild(neck);
  var buttons={
    'home':'Home',
    'recent':'Recent',
    'search':'Search',
    'admin':'Admin',
  };
  for(var i in buttons){
    var btn=document.createElement('div'),
    ntg=document.createElement('a');
    btn.classList.add('neck-button');
    btn.dataset.content=buttons[i];
    ntg.title=buttons[i];
    ntg.href='?'+i;
    ntg.appendChild(btn);
    neck.appendChild(ntg);
  }
  var body=document.createElement('div');
  body.classList.add('body');
  wrapper.appendChild(body);
  this.wrapperBody=body;
  var footer=document.createElement('div');
  footer.classList.add('footer');
  footer.dataset.content='9r3i\\jeblog::site '+this.version;
  wrapper.appendChild(footer);
  document.body.appendChild(wrapper);
  return wrapper;
};
this.setTitle=function(txt,asHTML){
  var titleTag=document.getElementsByTagName('title'),
  blogTitle=document.getElementById('title');
  if(blogTitle){
    if(asHTML){
      blogTitle.innerHTML=txt;
    }else{
      blogTitle.innerText=txt;
    }
  }
  var suffix=(asHTML?' &#x2015; ':' \u2015 ')+this.site.name;
  if(!titleTag||titleTag.length==0){
    titleTag=document.createElement('title');
    if(asHTML){
      titleTag.innerHTML=txt.replace(/<[^>]+>/g,'')+suffix;
    }else{
      titleTag.innerText=txt+suffix;
    }
    document.head.appendChild(titleTag);
    return true;
  }
  var i=titleTag.length;
  while(i--){
    if(asHTML){
      titleTag[i].innerHTML=txt.replace(/<[^>]+>/g,'')+suffix;
    }else{
      titleTag[i].innerText=txt+suffix;
    }
  }return true;
};
this.getTags=function(content){
  content=typeof content==='string'?content:'';
  var mTags=content.match(/#[a-z]+/ig),
  tags=[];
  if(!mTags){return '';}
  for(var i=0;i<mTags.length;i++){
    var tag=mTags[i].toLowerCase().substr(1),
    tmp='<a href="?tag='+tag+'" title="#'+tag+'" '
      +'class="content-detail-tag-each">#'+tag+'</a>';
    if(tags.indexOf(tmp)<0){tags.push(tmp);}
  }return '<div class="content-detail-tag">'+tags.join(' ')+'</div>';
};
this.contentTags=function(content){
  content=typeof content==='string'?content:'';
  return content.replace(/#[a-z]+/ig,function(m){
    return '<a href="?tag='+m.substr(1).toLowerCase()
      +'" title="'+m.toLowerCase()+'">'+m+'</a>';
  }).replace(/oleh:\s([^\r\n]+)/i,function(m){
    return 'Oleh: <a href="?search='+encodeURIComponent(m.substr(6))
      +'" title="'+m.substr(6)+'">'+m.substr(6)+'</a>';
  });
};
this.contentParagraph=function(content,arabicClassName){
  content=typeof content==='string'?content:'';
  arabicClassName=typeof arabicClassName==='string'
    ?arabicClassName:'content-arabic';
  var spl=content.split(/\n/),
  minA=0x60c,maxA=0x201d,res=[];
  for(var i=0;i<spl.length;i++){
    var tr={min:0xfff,max:0,chr:0};
    for(var o=0;o<spl[i].length;o++){
      var ca=spl[i].charCodeAt(o);
      if(ca>0xff){
        tr.max=Math.max(tr.max,ca);
        tr.min=Math.min(tr.min.ca);
        tr.chr++;
      }
    }
    if(tr.chr/spl[i].length*100>=50){
      res.push('<div class="'+arabicClassName+'">'+spl[i]+'</div>');
    }else{
      res.push(spl[i].replace(/\n/g,''));
    }
  }return res.join('\n');
};
this.contentLink=function(content){
  content=typeof content==='string'?content:'';
  var pl=this.site.apiURL,
  yptrn=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_\.]+)\]/ig,
  yptrni=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_\.]+)\]/i,
  gptrn=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/ig,
  gptrni=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/i,
  iptrn=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/ig,
  iptrni=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/i,
  ptrn=/files\/(audio|video|image)s\/[^\s\'\"]+/ig;
  return content.replace(ptrn,function(m){
    if(m.match(/\.(jpg|jpeg|gif|png|ico|webp)$/i)){
      return '<a href="'+pl+m+'" title="'+m+'" target="_blank">'
        +'<img src="'+pl+m+'" alt="'+m
        +'" style="max-width:100%;" width="100%" />'
        +'</a>';
    }else if(m.match(/\.(mp3|wav|ogg)$/ig)){
      var ext=m.match(/mp3$/i)?'mp3':(m.match(/wav$/i)?'wav':'ogg');
      return '<a href="'+pl+m+'" title="'+m+'" target="_blank">'
        +m+'</a><br />'
        +'<audio controls width="100%" height="auto">'
        +'<source src="'+pl+m+'" type="audio/'+ext+'">'
        +'</audio>';
    }else if(m.match(/\.mp4$/i)){
      return '<a href="'+pl+m+'" title="'+m+'" target="_blank">'
        +m+'</a><br />'+'<video controls width="auto" height="auto">'
        +'<source src="'+pl+m+'" type="video/mp4">'
        +'</video>';
    }
    return '<a href="'+pl+m+'" title="'+m+'" target="_blank">'+m+'</a>';
  }).replace(iptrn,function(m){
    let im=m.match(iptrni),
    ilink=m,
    ialt=m;
    if(im){
      ilink=im[1];
      ialt=im[2];
    }
    return '<a href="'+ilink+'" title="'+ialt+'" target="_blank">'
      +'<img src="'+ilink+'" alt="'
      +ialt+'" style="max-width:100%;" width="100%" />'
      +'</a>';
  }).replace(yptrn,function(m){
    let ym=m.match(yptrni),
    ylinke=m,
    ylink=m;
    if(ym){
      ylinke='https://www.youtube.com/embed/'+ym[1];
      ylink='https://youtu.be/'+ym[1];
    }
    let ww=window.innerWidth,
    cw=Math.min(720,ww),
    ih=Math.floor(cw/16*9);
    return '<a href="'+ylink+'" target="_blank">'+m+'</a>'
      +'<div id="'+ylink+'">'
      +'<iframe style="height:'+ih+'px" src="'
      +ylinke+'"></iframe> '
      +'<button onclick="_jeblog.fullscreen(this)" data-frame="'+ylink+'"a>Fullscreen</button>'
      +'</div>';
  }).replace(gptrn,function(m){
    let gm=m.match(gptrni),
    glink=m,
    gheight='400px';
    if(gm){
      glink=gm[1];
      gheight=gm[2];
    }
    let glinke=encodeURIComponent(glink);
    return '<a href="'+glink+'" target="_blank">'+m+'</a>'
      +'<div id="'+glink+'">'
      +'<iframe style="height:'+gheight+';" src="'
      +_jeblog.site.apiURL+'?embed='+glinke+'"></iframe> '
      +'<button onclick="_jeblog.fullscreen(this)" data-frame="'+glink+'"a>Fullscreen</button>'
      +'</div>';
  });
};
this.fullscreen=function(btn){
  let fr=document.getElementById(btn.dataset.frame);
  if(!fr){return false;}
  if(fr.classList.contains('frame-fullscreen')){
    btn.innerText='Fullscreen';
    fr.firstChild.style.height=fr.firstChild.dataset.height;
    fr.classList.remove('frame-fullscreen');
    document.exitFullscreen();
  }else{
    btn.innerText='Exit Fullscreen';
    fr.firstChild.dataset.height=fr.firstChild.style.height;
    fr.firstChild.style.height='';
    fr.firstChild.style.removeProperty('height');
    fr.classList.add('frame-fullscreen');
    fr.requestFullscreen();
  }
};
this.dataClear=function(){
  localStorage.removeItem(this.dataKey);
  return true;
};
this.dataInit=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  let temp=localStorage.getItem(this.dataKey),
  timeUpdate=localStorage.getItem('jeblog-data-update'),
  timeNow=(new Date).getTime(),
  timeNext=timeNow+(1*60*60*1000),
  newData=null;
  if(!timeUpdate){
    localStorage.setItem('jeblog-data-update',timeNext.toString());
    timeUpdate=timeNext.toString();
  }
  if(temp&&timeNow<parseInt(timeUpdate)){
    try{newData=JSON.parse(temp);}catch(e){}
    if(newData){return cb(newData);}
    localStorage.removeItem(this.dataKey);
    return this.blocked('Error: Failed to parse data.');
  }
  return this.dataPrepare(function(r){
    localStorage.setItem(_jeblog.dataKey,JSON.stringify(r));
    localStorage.setItem('jeblog-data-update',timeNext.toString());
    return cb(r);
  });
};
this.dataPrepare=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  var url=this.site.apiURL,
  data='method=data&args=[all]';
  _jeblog.loader('Requesting...',0);
  return _jeblog.getContent(url,function(r){
    _jeblog.loader(false);
    if(typeof r!=='object'){
      r=typeof r==='string'?r:r.toString();
      return _jeblog.blocked(r);
    }return cb(r);
  },function(e){
    _jeblog.loader(false);
    return _jeblog.blocked(e);
  },false,function(e){
    var total=e.total?e.total:_jeblog.site.dataSize,
    percent=Math.floor(e.loaded/total*100);
    return _jeblog.loader('Loading...',percent);
  },function(e){
    return _jeblog.loader('Requesting...',0);
  },data);
};
this.shuffle=function(r){
  if(!Array.isArray(r)){return false;}
  if(r.length==0){return r;}
  var c=r.length,t,x;
  while(c>0){
    x=Math.floor(Math.random()*c);
    c--;t=r[c];r[c]=r[x];r[x]=t;
  }return r;
};
this.tagClass=function(count){
  count=count?parseInt(count):0;
  count=Math.max(count,0);
  var classes={
    'ultra-high':128,
    'very-high':64,
    'high':32,
    'moderate-high':16,
    'moderate':8,
    'moderate-low':4,
    'low':2,
    'very-low':1,
  },
  className='very-low';
  for(var i in classes){
    if(count>=classes[i]){className=i;break;}
  }return className;
};
this.objectToArray=function(raw){
  if(typeof raw!=='object'||raw===null){return false;}
  var res=[];
  for(var i in raw){
    res.push(raw[i]);
  }return res;
};
this.timeToDate=function(time){
  var d=time.toString().match(/^\d+$/)?new Date(parseInt(time)*1000):new Date,
  day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  month=['January','February','March','April','May','June','July','August','September','October','November','December'],
  ss=['','st','nd','rd','th','th','th','th','th','th','th','th','th','th','th','th','th','th','th','th','th','st','nd','rd','th','th','th','th','th','th','th','st'];
  return day[d.getDay()]+', '+month[d.getMonth()]+' '+d.getDate()
    +ss[d.getDate()]+' '+d.getFullYear();
};
this.clearElement=function(el){
  if(typeof el!=='object'||el===null){return false;}
  var i=el.childNodes.length;
  while(i--){
    el.removeChild(el.childNodes[i]);
  }return true;
};
this.parseStr=function(t){
  if(typeof t!=='string'){return false;}
  var s=t.split('&'), r={},c={};
  for(var i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    var p=s[i].split('='),
    k=decodeURIComponent(p[0]);
    if(k.match(/\[(.*)?\]$/g)){
      var l=k.replace(/\[(.*)?\]$/g,''),
      w=k.replace(/^.*\[(.*)?\]$/g,"$1");
      c[l]=c[l]?c[l]:0;
      if(w==''){
        w=c[l];
        c[l]+=1;
      }
      if(!r[l]){r[l]={};}
      r[l][w]=decodeURIComponent(p[1]);
      continue;
    }
    r[k]=p[1]?decodeURIComponent(p[1]):'';
  }return r;
};
this.getContent=function(url,cb,er,txt,dlp,upl,data){
  var xhr=new XMLHttpRequest(),
  version='1.2.0';
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  dlp=typeof dlp==='function'?dlp:function(){};
  upl=typeof upl==='function'?upl:function(){};
  txt=txt===false?false:true;
  data=typeof data==='string'?data:null;
  xhr.open(data?'POST':'GET',url,true);
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.send(data);
  xhr.onreadystatechange=function(e){
    if(xhr.readyState==4){
      if(xhr.status==200){
        var text=xhr.responseText?xhr.responseText:' ';
        if(txt){return cb(text);}
        var res=false;try{res=JSON.parse(text);}catch(e){}
        return cb(res?res:text);
      }else if(xhr.status==0){
        return er('Error: No internet connection.');
      }return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
    }else if(xhr.readyState<4){return false;}
    return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
  };
  xhr.addEventListener("progress",dlp,false);
  xhr.upload.onprogress=upl;
  return true;
};
this.loaderTest=function(i){
  i=i?parseInt(i):1;
  _jeblog.loader('Loading... ('+i+'%)',i);
  setTimeout(function(){
    if(i>=100){
      return _jeblog.loader(false);
    }i++;
    return _jeblog.loaderTest(i);
  },1000-(i*10));
};
this.loader=function(text,progress){
  var id='jeblog-loader',
  dl=document.getElementById(id);
  if(typeof text==='boolean'&&text===false){
    if(dl){dl.parentElement.removeChild(dl);}
    return false;
  }
  var dlc=null,dlp=null;
  progress=progress?parseInt(progress):0;
  progress=Math.max(Math.min(progress,100),0);
  if(!dl){
    dl=document.createElement('div');
    dlc=document.createElement('div');
    dlp=document.createElement('div');
    dlpp=document.createElement('progress');
    dlc.classList.add('loader-content');
    dlp.classList.add('loader-progress');
    dlpp.max=100;
    dlpp.value=0;
    dl.id=id;
    dl.classList.add('loader');
    dl.appendChild(dlc);
    dl.appendChild(dlp);
    dlp.appendChild(dlpp);
    document.body.appendChild(dl);
  }
  dlp=dl.children[1];
  dlc=dl.children[0];
  dlc.dataset.content=typeof text==='string'?text:'Loading...';
  dlpp.value=progress;
  return true;
};
this.splash=function(text){
  let id='jeblog-splash',
  dl=document.getElementById(id);
  if(dl){dl.parentElement.removeChild(dl);}
  dl=document.createElement('div');
  dlp=document.createElement('div');
  dl.id=id;
  dl.classList.add('splash');
  dlp.classList.add('splash-progress');
  dl.appendChild(dlp);
  document.body.appendChild(dl);
  dl.dataset.content=typeof text==='string'?text:'';
  document.body.classList.add('no-scroll');
  setTimeout(function(){
    dl.classList.add('fading-out');
    document.body.classList.remove('no-scroll');
    setTimeout(function(){
      if(typeof dl.parentElement.removeChild==='function'){
        dl.parentElement.removeChild(dl);
      }return true;
    },100);
  },512);
  return true;
};
this.blocked=function(text){
  var id='jeblog-blocked',
  dl=document.getElementById(id);
  if(typeof text==='boolean'&&text===false){
    if(dl){dl.parentElement.removeChild(dl);}
    return false;
  }
  if(!dl){
    dl=document.createElement('div');
    dl.id=id;
    dl.classList.add('blocked');
    document.body.appendChild(dl);
  }
  dl.dataset.content=typeof text==='string'?text:'';
  return true;
};
return this.init();
};


