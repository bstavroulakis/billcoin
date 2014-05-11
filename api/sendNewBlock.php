<?php
	
	$pendingTransactionsTxt = file_get_contents("transactions.txt");
	$pendingTransactions = json_decode("[" . $pendingTransactionsTxt . "]");

	$success = false;

	$block = $_REQUEST["block"];
	$blockStr = $_REQUEST["blockStr"];
	$hash = $_REQUEST["block"]["hash"];

	$previousBlock = $_REQUEST["block"]["previousBlock"];
	$merkleRoot = $_REQUEST["block"]["merkleRoot"];
	$time = $_REQUEST["block"]["timestamp"];
	$nonce = $_REQUEST["block"]["nonce"];
	$transactions = $_REQUEST["block"]["transactions"];

	$blockchainTxt = file_get_contents("blockchain.txt");

	if($blockchainTxt == null || $blockchainTxt == ""){
		if(check_block($block)){
			//var_dump($_REQUEST["blockStr"]);
			file_put_contents("blockchain.txt", $blockStr, FILE_APPEND);
			$success = true;
		}
	}else{
		//$blockchainTxt = "[" + str_replace("}{","},{",$blockchainTxt) + "]";
		$blockchainTxt = "[" + $blockchainTxt + "]";
		$blockchain = json_encode($blockchainTxt);
		$block["previousBlock"] = $blockchain[strlen($blockchain) - 1]["hash"];
		if(check_block($block)){
			file_put_contents("blockchain.txt", ",".$blockStr, FILE_APPEND);
			$success = true;
		}
	}

	if($success){
		$newPending = "";
		foreach($pendingTransactions as $trans){
			$found = false;
			$thisTransHash = $trans->hash;
			foreach($transactions as $blockTrans){
				if($thisTransHash == $blockTrans["hash"])
					$found = true;
			}
			if($found){
				$pendingTransactionsTxt = 
					preg_replace("{ \"hash\": \"".$thisTransHash."(.*?)OP_CHECKSIG\" } \] }", "", $pendingTransactionsTxt);
			}
		}
		file_put_contents("transactions.txt", $pendingTransactionsTxt);
	}

	function check_block($blk){
		//var_dump($blk);
		$expectedHash = hash('sha256', $blk["previousBlock"].$blk["merkleRoot"].$blk["timestamp"].$blk["nonce"]);

		//var_dump($blk);
		//echo($blk["previousBlock"].$blk["merkleRoot"].$blk["timestamp"].$blk["nonce"]."<br/>".$blk["hash"]);
		//echo("<br/>");
		//echo($blk["hash"][0]. ":". $blk["hash"][1]);
		if($expectedHash == $blk["hash"] && $blk["hash"][0] == 0 && $blk["hash"][1] == 0){
			//echo("return true;");
			return true;
		}else{
			//echo("return false;");
			return false;
		}


	}

	return json_encode('{"success":'.$success.'}');
	
?>