<?php

    header('Access-Control-Allow-Origin: *');  
    $filename = "";

    if($_GET['dataType'] == "blockchain"){
    	$filename = "blockchain.txt";
    }else{
    	$filename = "transactions.txt";
    }

    $currentmodif = filemtime($filename);
    $lastmodif = isset( $_REQUEST['timestamp'])? $_REQUEST['timestamp']: 0 ;

    while ($currentmodif <= $lastmodif) {
        clearstatcache();
        sleep(1);
        $currentmodif = filemtime($filename);
    }

    clearstatcache();
    ob_end_flush(); 
    flush(); 
    ob_start(); 
    sleep(1);
    $content = file_get_contents($filename);
    $response = array();
	$response['data'] = $content;
    $response['timestamp']= $currentmodif;
    echo json_encode($response);

?>