<?php 
	
	header('Access-Control-Allow-Origin: *');  
	$address = $_REQUEST["address"];
	$publicKey = $_REQUEST["publicKey"];
	$transactions = [];

	$blockchainTxt = file_get_contents("blockchain.txt");
	$blockchainTxt = "[" . $blockchainTxt . "]";
	$blockchain = json_decode($blockchainTxt);

//var_dump($blockchainTxt);

	foreach($blockchain as $block){
		$trans = $block->transactions;
		foreach($trans as $t){
			$found = false;
			$outs = $t->out;
			foreach($outs as $out){
				$outAddress = $out->address;
				if($outAddress == $address){
					if(!$found){
						array_push($transactions, $t);
					}
					$found = true;
				}
			}
			$ins = $t->in;
			foreach($ins as $in){
				if(!property_exists($in,"scriptSig"))
					continue;
				$scriptSig = $in->scriptSig;
				if (strpos($scriptSig,$publicKey) !== false) {
					if(!$found){
						array_push($transactions, $t);
					}
					$found = true;
				}
			}
		}
	}

	echo(json_encode($transactions));

?>