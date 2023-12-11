<?php
$file='font.css';
$output='basic.font.css';

$base=file_get_contents($file);
$ptrn='/url\("([^"]+)"\)/';
//preg_match_all($ptrn,$base,$akur);
//print_r($akur[1]);
$res=preg_replace_callback($ptrn,function($m){
  $head='data:font/truetype;base64,';
  $raw=file_get_contents($m[1]);
  $b64=base64_encode($raw);
  //return 'url("'.$head.'")';
  return 'url("'.$head.$b64.'")';
},$base);

echo $output.':'.file_put_contents($output,$res)."\n";

//print_r($res);