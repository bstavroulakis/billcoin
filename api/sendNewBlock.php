<?php
	
	$pendingTransactionsTxt = file_get_contents("transactions.txt");
	$pendingTransactions = json_decode("[" . $pendingTransactionsTxt . "]");

	$success = false;
	$response = array();
    $response['success'] = $success;

	$block =    $_REQUEST["block"];
	$blockStr = $_REQUEST["blockStr"];
	$hash =     $_REQUEST["block"]["hash"];

	$previousBlock = $_REQUEST["block"]["previousBlock"];
	$merkleRoot =    $_REQUEST["block"]["merkleRoot"];
	$time =          $_REQUEST["block"]["timestamp"];
	$nonce =         $_REQUEST["block"]["nonce"];
	$transactions =  $_REQUEST["block"]["transactions"];

	$blockchainTxt = file_get_contents("blockchain.txt");

	if($blockchainTxt == null || $blockchainTxt == ""){
		if(check_block($block)){
			file_put_contents("blockchain.txt", $blockStr, FILE_APPEND);
			$response['success'] = true;
		}
	}else{
		$blockchainTxt = "[" + $blockchainTxt + "]";
		$blockchain = json_encode($blockchainTxt);
		$block["previousBlock"] = $previousBlock;
		if(check_block($block)){
			file_put_contents("blockchain.txt", ",".$blockStr, FILE_APPEND);
			$response['success'] = true;
		}
	}

	if($response['success']){
		$newPending = "";
		foreach($pendingTransactions as $trans){
			$found = false;
			$thisTransHash = $trans->hash;
			foreach($transactions as $blockTrans){
				if($thisTransHash == $blockTrans["hash"])
					$found = true;
			}
			if($found){
				try{
					$pendingTransactionsTxt = 
						preg_replace("{ \"hash\": \"".$thisTransHash."(.*?)OP_CHECKSIG\" } \] }", "", $pendingTransactionsTxt);
				}catch(Exception $error){};
			}
		}
		file_put_contents("transactions.txt", $pendingTransactionsTxt);
	}

	function check_block($blk){
		$expectedHash = hash('sha256', $blk["previousBlock"].$blk["merkleRoot"].$blk["timestamp"].$blk["nonce"]);
		if($expectedHash == $blk["hash"] && $blk["hash"][0] == 0 && $blk["hash"][1] == 0){
			return true;
		}else{
			return false;
		}
	}
	
    echo json_encode($response);
	
?>