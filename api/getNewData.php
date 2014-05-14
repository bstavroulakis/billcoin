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
        usleep(10000);
        clearstatcache();
        $currentmodif = filemtime($filename);
    }

    clearstatcache();
    $content = file_get_contents($filename);
    $response = array();
	$response['data'] = $content;
    $response['timestamp']= $currentmodif;
    echo json_encode($response);

?>