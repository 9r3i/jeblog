<?php
class jeblog{
  const version='1.0.0';
  protected $methods;
  protected $config;
  protected $users;
  protected $ini;
  protected $file;
  protected $data;
  protected $dir;
  protected $root;
  /* construct */
  public function __construct(string $dir){
    /* set directory */
    $dir=str_replace('\\','/',$dir);
    $dir.=substr($dir,-1)!='/'?'/':'';
    $this->dir=$dir;
    /* set root directory */
    $this->root=defined('JEBLOG_CLI_DIR')
      ?JEBLOG_CLI_DIR:__DIR__.'/';
    $this->root.=substr($this->root,-1)!='/'?'/':'';
    /* set data json file */
    $this->data=$this->dir.'jeblog.json';
    if(!is_file($this->data)){
      $data=[
        'posts'=>[
          1=>[
            'id'=>1,
            'title'=>'Welcome!',
            'content'=>'Welcome, everyone! \n#welcome',
            'status'=>'publish',
            'time'=>time(),
            'author'=>1,
          ],
        ],
        'authors'=>[
          1=>[
            'id'=>1,
            'username'=>'luthfie',
            'email'=>'luthfie@y7mail.com',
            'uri'=>'https://github.com/9r3i',
            'name'=>'Abu Ayyub Al Ansh&aacute;ry',
            'about'=>$this->about(),
            'picture'=>'images/luthfie-picture.jpg',
            'cover'=>'images/luthfie-cover.jpg',
          ],
        ],
      ];
      $put=@file_put_contents($this->data,@json_encode($data));
    }
    /* set config ini for users and methods */
    $file=$this->dir.'jeblog.ini';
    $users=[
      'luthfie'=>'$2y$10$VKDOgY/A8PuMMRpZqdAxo.QgS93FCsN7lc9qkheAfab/6XEX4x/5i',
    ];
    $methods=[
      'login'=>'1',
      'addUser'=>'1',
      'data'=>'1',
      'send'=>'1',
      'plugin'=>'1',
    ];
    if(!is_file($file)){
      $data="; auto-generated by 9r3i\jeblog\n\n[users]\n";
      foreach($users as $username=>$password){
        $data.="$username=\"$password\"\n";
      }
      $data.="\n[methods]\n";
      foreach($methods as $method=>$allow){
        $data.="$method=$allow\n";
      }
      $data.="\n[config]\n\n\n";
      @file_put_contents($file,$data);
    }
    /* config */
    $ini=@parse_ini_file($file,true);
    $this->ini=$ini;
    $this->file=$file;
    $this->config=$ini['config'];
    /* users */
    $this->users=$ini['users'];
    /* set registered method */
    $this->methods=[];
    foreach($ini['methods'] as $method=>$allow){
      if(intval($allow)>0){
        $this->methods[]=$method;
      }
    }
    /* auto start */
    return $this->start();
  }
  /* start api server */
  protected function start(){
    /* set default headers */
    $this->head();
    /* check request GET method */
    if(isset($_GET['embed'])){
      return $this->embed($_GET['embed']);
    }elseif(isset($_GET['script'])){
      return $this->script($_GET['script']);
    }elseif(isset($_GET['style'])){
      return $this->style($_GET['style']);
    }
    /* check request method as registered method */
    if(!isset($_POST['method'])
      ||!in_array($_POST['method'],$this->methods)
      ||!method_exists($this,$_POST['method'])){
      return $this->error('Invalid request.');
    }
    /* prepare argument decode from json array */
    $args=isset($_POST['args'])?@json_decode($_POST['args'],true):[];
    $args=is_array($args)?array_values($args):[];
    /* execute method */
    $out=@\call_user_func_array([$this,$_POST['method']],$args);
    /* return output to the result */
    return is_string($out)?$this->result($out)
      :$this->error('Request method "'.$_POST['method'].'" failed.');
  }
  /* ===== GET ===== */
  /* embed -- $_GET['embed'] */
  protected function embed(string $link){
    $out='<!DOCTYPE html><html lang="en-US" dir="ltr"><head><meta http-equiv="content-type" content="text/html;charset=utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" /><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" /><title>9r3i\jeblog::embed</title></head><body style="margin:0px;padding:0px;"><script src="https://emgithub.com/embed-v2.js?target='.urlencode($link).'&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on"></script></body></html>';
    header('Content-Type: text/html');
    return $this->result($out);
  }
  /* script -- $_GET['script'] */
  protected function script(string $sname){
    $sname=$sname==''?'jeblog':$sname;
    $file=$this->root.$sname.'.js';
    $out=@file_get_contents($file);
    header('Content-Type: application/javascript');
    return $this->result($out);
  }
  /* script -- $_GET['style'] */
  protected function style(string $sname){
    $sname=$sname==''?'basic':$sname;
    $file=$this->root.'styles/'.$sname.'.css';
    $out=@file_get_contents($file);
    header('Content-Type: text/css');
    return $this->result($out);
  }
  /* ===== POST ===== */
  /* about */
  protected function about(){
    return <<<EOD
Abu Ayyub is brilliant but lazy like the sly eagle who does not kill at whim.
He is known as 9r3i a.k.a. Luthfie Al Ansháry.

Abu Ayyub Al Ansháry adalah seorang Programmer, berpengalaman sejak tahun 2012 dibidang pemograman, console, desktop, mobile dan website.

Tahun 2018, Abu Ayyub memulai project AI (Ayyub-Isa) Console System, bukan Artificial Intellegent. System ini adalah system console mandiri, yang memungkinkan para penggunanya berkomunikasi secara aman dan terenkrip.

Project AI ini dapat di lihat di: https://github.com/9r3i/ai
Dan cara menginstallnya dapat dibaca di: https://github.com/9r3i/ai/blob/master/how-to-install-ai.txt

Remember one thing, the sly eagle who does not kill at whim.
EOD;
  }
  /* plugin */
  protected function plugin(){
    $args=func_get_args();
    if(!isset($args[0])){
      return 'Error: Requires plugin name.';
    }
    $pname=$args[0];
    unset($args[0]);
    $args=array_values($args);
    $file=$this->root.'plugins/'.$pname.'.php';
    if(!is_file($file)){
      return 'Error: Plugin is not available.';
    }
    @require_once($file);
    $out=@\call_user_func_array([$pname,'init'],$args);
    return $out;
  }
  /* send */
  protected function send($data){
    $put=@file_put_contents($this->data,@json_encode($data));
    return $put?'Sent!':'Failed!';
  }
  /* data */
  protected function data(){
    header('HTTP/1.1 200 OK');
    header('Content-Length: '.filesize($this->data));
    @readfile($this->data);
    exit;
  }
  /* addUser */
  protected function addUser($username,$password){
    if(!array_key_exists($username,$this->users)
      &&preg_match('/^[a-z0-9]+$/',$username)){
      $ini=$this->ini;
      $ini['users'][$username]=password_hash($password,1);
      $data="; auto-generated by 9r3i\jeblog\n\n";
      foreach($ini as $tag=>$line){
        $data.="[$tag]\n";
        foreach($line as $key=>$value){
          $val=$tag=='users'?'"'.$value.'"':$value;
          $data.="$key=$val\n";
        }
        $data.="\n";
      }
      $data.="\n\n";
      @file_put_contents($this->file,$data);
      return 'OK';
    }
    return 'Error: Invalid username.';
  }
  /* login */
  protected function login($username,$password){
    $users=$this->users;
    if(array_key_exists($username,$users)
      &&password_verify($password,$users[$username])){
      $token=implode('-',str_split(substr(str_shuffle(preg_replace('/[^A-Z0-9]+/','',strtoupper(base64_encode(md5(microtime(true),true))))),0,16),4));
      return json_encode([
        'status'=>'OK',
        'username'=>$username,
        'token'=>$token,
      ]);
    }
    return 'Error: Invalid username or password.';
  }
  /* error output --> method: result */
  final protected function error(string $s=''){
    $s=$s?$s:'Unknown error.';
    return $this->result('Error: '.$s);
  }
  /* result output */
  final protected function result(string $s=''){
    header('HTTP/1.1 200 OK');
    header('Content-Length: '.strlen($s));
    exit($s);
  }
  /* default api headers -- [stand-alone] */
  final protected function head(){
    /* access control - to allow the access via ajax */
    header('Access-Control-Allow-Origin: *'); /* allow origin */
    header('Access-Control-Request-Method: POST, GET, OPTIONS'); /* request method */
    header('Access-Control-Request-Headers: X-PINGOTHER, Content-Type'); /* request header */
    header('Access-Control-Max-Age: 86400'); /* max age (24 hours) */
    header('Access-Control-Allow-Credentials: true'); /* allow credentials */
    /* set content type of response header */
    header('Content-Type: text/plain;charset=utf-8;');
    /* checking options */
    if(isset($_SERVER['REQUEST_METHOD'])
      &&strtoupper($_SERVER['REQUEST_METHOD'])=='OPTIONS'){
      header('Content-Language: en-US');
      header('Content-Encoding: gzip');
      header('Content-Length: 0');
      header('Vary: Accept-Encoding, Origin');
      header('HTTP/1.1 200 OK');
      exit;
    }
  }
}

