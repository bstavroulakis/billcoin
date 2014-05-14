<html>

<head>

<script src="js/jquery/jquery.js"></script>
<script src="js/jquery/jquery-ui.js"></script>
<script src="js/jquery/knockout.js"></script>
<script src="js/jquery/knockout.mapping.js"></script>
<script src="js/jquery/alertify.min.js"></script>
<link rel="stylesheet" href="js/jquery/alertify.core.css" />
<link rel="stylesheet" href="js/jquery/alertify.default.css" />

<script src="js/lib/BigInteger.js"></script>
<script src="js/lib/Ripemd160.js"></script>
<script src="js/lib/Sha256.js"></script>
<script src="js/lib/base58.js"></script>
<script src="js/lib/Crypto.js"></script>
<script src="js/lib/Opcode.js"></script>
<script src="js/lib/Script.js"></script>
<script src="js/lib/ECKeyLegacy.js"></script>
<script src="js/lib/Utils.js"></script>

<script src="js/BitcoinAddress.js"></script>
<script src="js/BillcoinTransaction.js"></script>
<script src="js/Transaction.js"></script>
<script src="js/TransactionIn.js"></script>
<script src="js/TransactionOut.js"></script>
<script src="js/Wallet.js"></script>
<script src="js/TX.js"></script>
<script src="js/Block.js"></script>
<script src="js/Block.js"></script>
<script src="js/Billcoin.js"></script>

<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/spacing.css">
<link rel="stylesheet" href="css/billcoin.css">

<script>

var billcoin;
$(document).ready(function(){
	billcoin = new Billcoin();
})

</script>

</head>

<body>

	<div class="stoppage">
		<div class="message">
			<span class="inner">Loading...</span>
		</div>
	</div>

	<header class="top_header">
		<img src="http://bstavroulakis.com/blog/wp-content/uploads/2014/04/billcoin.png" class="billcoin_logo left"/>
		<h1 class="padding left">Billcoin - Learn Bitcoin in 4 easy steps</h1>
		<div class="right">
			<div class="green_button">
				Total Billcoins: <span data-bind="text:totalBalance"></span>
			</div>
			<div class="balance_timer">
				Time to update: <span data-bind="text:balanceUpdateTime"></span>
			</div>
		</div>
		<div class="clearfix"></div>
	</header>

	<div id="dialog-form" title="Add New Transaction">
	  <p class="validateTips">All form fields are required.</p>
	  <form id="newTx">
		  <fieldset>
		  	<table class="table">
		  		<tr>
		  			<td>
		  				From&nbsp;Address:
		  			</td>
		  			<td>
<select class="wallets" data-bind="foreach:wallets">
	<option data-bind="text:address,value:address"></option>
</select>
		  			</td>
		  		</tr>
		  		<tr>
		  			<td>
		  				To&nbsp;Address:
		  			</td>
		  			<td>
<input type="text" name="to_address" id="newTxToAddress" value="" class="full text ui-widget-content ui-corner-all">
		  			</td>
		  		</tr>
		  		<tr>
		  			<td>
		  				Amount:
		  			</td>
		  			<td>
<input type="amount" name="amount" id="newTxAmount" value="" class="full text ui-widget-content ui-corner-all">
		  			</td>
		  		</tr>
		  	</table>
		  </fieldset>
	  </form>
	</div>

	<div id="dialog-block"></div>

	<section class="section">
		<header>		
			<h2 class="section_header">Step 1 - Your Billcoin Wallets</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=284">http://bstavroulakis.com/blog/?p=284</a>
			</span>
		</header>		
		<div class="clearfix"></div>
		<button class="gray_button left width_50" id="generate_btn">
			<a href="javascript:void(0)">Generate</a>
		</button>
		<button class="gray_button left width_50" id="clear_btn">
			<a href="javascript:void(0)">Clear</a>
		</button>
		
		<div class="clearfix"></div>
		<button class="gray_button left width_50" id="import_btn">
			<a href="javascript:void(0)">Import</a>
			<input type="file" class="hidden margin_top" id="import_wallet" />
		</button>
		<button class="gray_button left width_50" id="export_btn">
			<a href="javascript:void(0)">Export</a>
		</button>
		<div class="clearfix"></div>
		<button class="gray_button left full new_transaction_btn">
			<a href="javascript:void(0)">
				New Transaction
			</a>
		</button>
		<div class="clearfix"></div>
		<ul class="padding wrap" data-bind="foreach:wallets">
			<li>
				<b>Address:</b> <span data-bind="text:address"></span><br/>
				<b>Private Key:</b> <span data-bind="text:wifCompressed"></span><br/>
				<b>Public Key:</b> <span data-bind="text:publicKey"></span>
				<div class="clearfix"><br/></div>
			</li>
		</ul>
	</section>

	<section class="section">
		<header>
			<h2 class="section_header">Step 2 - Billcoin Block Chain</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=286">http://bstavroulakis.com/blog/?p=286</a>
			</span>
		</header>
		<div class="clearfix"></div>
		<div id="blockchain"></div>
	</section>

	<section class="section">
		<header>		
			<h2 class="section_header">Step 3 - Pending Transactions</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=344">http://bstavroulakis.com/blog/?p=344</a>
			</span>
		</header>		
		<div class="clearfix"></div>
		<ul id="pendingTransactions"></ul>
	</section>

	<section class="section">
		<header>
			<h2 class="section_header step_link">Step 4 - Mining</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=288">http://bstavroulakis.com/blog/?p=288</a>
			</span>
		</header>

		<div class="clearfix"></div>
		<span class="padding">
		Select a wallet to send wining Billcoins to:
		</span>
		<select id="miner_wallet" data-bind="foreach:wallets">
			<option data-bind="text:address,value:address,attr:{'data-private':wifCompressed,'data-publickey':publicKey}"></option>
		</select>
		<button class="gray_button right full block start_mining miner_btn">
			<a href="javascript:void(0)" data-bind="visible:(!mining.running())">Start Mining</a>
			<a href="javascript:void(0)" data-bind="visible:mining.running">
				<img src="images/gif-load.gif" class="left"/>
				Mining in Process... Click to Stop Mining.
			</a>
		</button>
		<ul>

		</ul>
	</section>

	<div class="clearfix"></div>

</body>

</html>