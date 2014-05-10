<?php
	
	$transaction = $_POST['transaction'];
	file_put_contents("transactions.txt", $transaction, FILE_APPEND);

?>