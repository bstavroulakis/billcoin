<?php
	
	$block = $_POST["block"];
	$hash = $_POST["block"]["hash"];

	$previousBlock = $_POST["block"]["previousBlock"];
	$merkleRoot = $_POST["block"]["merkleRoot"];
	$time = $_POST["block"]["timestamp"];
	$nonce = $_POST["block"]["nonce"];
	$transactions = $_POST["block"]["transactions"];

	$blockchainTxt = file_get_contents("blockchain.txt");

	if($blockchain == ""){
		if(check_block($block))
			file_put_contents("blockchain.txt", $block, FILE_APPEND);
	}else{
		$blockchainTxt = "[" + str_replace("}{","},{",$blockchainTxt) + "]";
		$blockchain = json_decode($blockchainTxt);
		$block["previousBlock"] = $blockchain[strlen($blockchain) - 1]["hash"];
		if(check_block($block)){
			file_put_contents("blockchain.txt", $block, FILE_APPEND);
		}
	}

	function check_block($blk){

		$expectedHash = hash('sha256', $blk["previousBlock"].$blk["merkleRoot"].$blk["timestamp"].$blk["nonce"]);

		if($expectedHash == $blk["hash"] && $blk["hash"][0] == "0"){
			return true;
		}else{
			return false;
		}


	}
	
?>