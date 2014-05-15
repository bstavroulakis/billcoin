<html>

<head>

<script src="js/jquery/jquery.js"></script>
<script src="js/jquery/jquery-ui.js"></script>
<script src="js/jquery/knockout.js"></script>
<script src="js/jquery/knockout.mapping.js"></script>
<script src="js/jquery/jquery.tour.js"></script>
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
<link rel="stylesheet" href="css/tour.css">

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
		<div class="right margin">
			<a target="_blank" href="https://github.com/bstavroulakis/billcoin">
				<img style="height:40px;" src="http://bstavroulakis.com/blog/wp-content/themes/bstavrou/images/github.png">
			</a>
		</div>
		<div class="right margin_tb">
			<a target="_blank" href="http://www.reddit.com/r/billcoin/">
				<img style="height:40px;" src="images/reddit.jpg">
			</a>
		</div>		
		<div class="right">
			<div id="start_tour" class="tour_dialog_button margin_tr">Start Tour »</div>
		</div>
		<div class="clearfix"></div>
	</header>

	<div id="dialog-form" title="Add New Transaction" class="step_add_transaction">
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

	<section class="section step1">
		<header class="step2">		
			<h2 class="section_header">Section 1 - Your Billcoin Wallets</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=284">http://bstavroulakis.com/blog/?p=284</a>
			</span>
		</header>		
		<div class="clearfix"></div>
		<button class="gray_button left width_50 step3" id="generate_btn">
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
		<button class="gray_button left full new_transaction_btn step4">
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

	<section class="section step_block_chain">
		<header>
			<h2 class="section_header">Section 2 - Billcoin Block Chain</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=286">http://bstavroulakis.com/blog/?p=286</a>
			</span>
		</header>
		<div class="clearfix"></div>
		<div id="blockchain"></div>
	</section>

	<section class="section step_pending_transactions">
		<header>		
			<h2 class="section_header">Section 3 - Pending Transactions</h2>
			<span class="margin_left step_link">
				<a target="_blank" href="http://bstavroulakis.com/blog/?p=344">http://bstavroulakis.com/blog/?p=344</a>
			</span>
		</header>		
		<div class="clearfix"></div>
		<ul id="pendingTransactions"></ul>
	</section>

	<section class="section">
		<header>
			<h2 class="section_header step_link">Section 4 - Mining</h2>
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

	        <script>
            // Config tour steps
            var tourSteps = [
            {
                "msg": "Welcome to Billcoin! Ever tried to understand how Bitcoin works in depth? This is the best place to start!",
                "actionName": false,
                "selector": "body",
                "position": "center",
                "btnMsg": "Start Tour &raquo",
                "nextSelector": "#tour_dialog_btn",
                "waitForTrigger": false
            }, {
                "msg": "This page is divided in 4 sections. Each section has a header and the body.",
                    "selector": ".step1",
                    "position": "right",
                    "btnMsg": "Next &raquo",
            }, {
                "msg": "The header section has the title of the section and a link to a blog post which describes the section in depth. It is HIGHLY recommended that you read the blog post before playing with each section.",
                    "selector": ".step2",
                    "position": "right",
                    "btnMsg": "Next &raquo"
            }, {
                "msg": "In this first section click on Generate to generate a wallet. Wallets are public/private keys to save your Billcoins. The public key is your address and the private key is responsible for signing your transactions so everybody knows that only you orded a transaction from your address.",
                    "selector": ".step3",
                    "position": "right",
                    "nextSelector": "#generate_btn"
            }, {
                "msg": "Now that you created a wallet let us generate a transaction. We will send 0 billcoins from our wallet to our wallet again. So click on New Transaction to open up the popup. There is no good reason to do this transaction but it still can take place just for testing.",
                    "selector": ".step4",
                    "position": "right",
                    "nextSelector":".new_transaction_btn"
            },  {
                "msg": "I've pre-loaded in the 'To Address' your address and in the 'Amount' the value of 0. So now click on 'Add Transaction to Queue' to send the transaction request to the newtwork.",
                    "selector": ".step_add_transaction",
                    "position": "right",
                    "nextSelector": ".ui-button"
            },  {
                "msg": "In this section you can see the transactions that are pending. In a few seconds you'll see the transaction you generated as well.",
                    "selector": ".step_pending_transactions",
                    "position": "right",
                    "btnMsg": "Next &raquo"
            },  {
                "msg": "This is the Block Chain. It is nothing more that a list of Blocks. Each Block has a batch of transactions. To add a Block in the Block Chain you have to find a special number that will generate a new ID in relation to the current Block ID. To learn more about Blocks you can checkout the blog post link located in the header.",
                    "selector": ".step_block_chain",
                    "position": "right",
                    "btnMsg": "Next &raquo"
            },  {
                "msg": "This is the last step necessary. You'll have to mine a Block so you can add the transaction in the Block Chain. WARNING: Mining is a bit CPU intensive, so make sure you're not running anything heavy before clicking on the 'Start Mining' button. Once you start to mine you'll have to wait about a minute for it to finish. Also, you'll get 50 Billcoins as a prize!",
                    "selector": ".miner_btn",
                    "position": "left",
                    "nextSelector": ".miner_btn"
            }];

            // fire off the tour when ready
            var tour = new TourGuide(tourSteps);
        </script>

</body>

</html>