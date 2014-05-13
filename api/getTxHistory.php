<?php 
	
	header('Access-Control-Allow-Origin: *');  
	$address = $_REQUEST["address"];
	$transactions = [];

	$blockchainTxt = file_get_contents("blockchain.txt");
	$blockchainTxt = "[" . $blockchainTxt . "]";
	$blockchain = json_decode($blockchainTxt);

	foreach($blockchain as $block){
		$trans = $block->transactions;
		foreach($trans as $t){
			if($t->out[0]->scriptPubKey == "OP_DUP OP_HASH160  ".$address." OP_EQUALVERIFY OP_CHECKSIG"){
				array_push($transactions, $t);
			}
		}
	}

	//preg_match_all("/{\"hash\":\".*cc3525597c58e807200e497ca70d85035c2deddd OP_EQUALVERIFY OP_CHECKSIG\"}]}]/", $blockchainTxt, $transactions);
	//var_dump($transactions);

	echo(json_encode($transactions));

?>