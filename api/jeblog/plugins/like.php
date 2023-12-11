<?php
class like{
  public static function init($type,$id){
    $file=__DIR__.'/like.json';
    if(!is_file($file)){
      @file_put_contents($file,'{}');
    }
    $get=@file_get_contents($file);
    $data=@json_decode($get,true);
    $count=isset($data[$id])?intval($data[$id]):0;
    if($type=='get'){
      return $count.'';
    }elseif($type=='put'){
      $data[$id]=$count+1;
      $put=@file_put_contents($file,@json_encode($data));
      return $put?'OK':'Error: Failed to save data.';
    }return 'Error: Invalid request.';
  }
}
