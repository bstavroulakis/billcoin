<?php
	
	$transaction = $_POST['transaction'];
	$oldTransactions = file_get_contents("transactions.txt");

	if($oldTransactions == null || $oldTransactions == ""){
		file_put_contents("transactions.txt", $transaction, FILE_APPEND);
	}else{
		file_put_contents("transactions.txt", ",".$transaction, FILE_APPEND);
	}
	

?>