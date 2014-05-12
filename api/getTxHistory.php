<?php 
	
	header('Access-Control-Allow-Origin: *');  
	$address = $_REQUEST["address"];
	$transactions = [];

	$blockchainTxt = file_get_contents("blockchain.txt");
	$blockchainTxt = "[" . $blockchainTxt . "]";
	$blockchain = json_decode($blockchainTxt);

	foreach($blockchain as $block){
		
	}


	echo("[]");

?>