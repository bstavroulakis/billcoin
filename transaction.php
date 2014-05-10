<html>
<head>

<script src="js/jquery/jquery.js"></script>
<script src="js/jquery/jquery-ui.js"></script>
<script src="js/jquery/knockout.js"></script>
<script src="js/jquery/knockout.mapping.js"></script>

<script src="js/lib/BigInteger.js"></script>
<script src="js/lib/Ripemd160.js"></script>
<script src="js/lib/Sha256.js"></script>
<script src="js/lib/base58.js"></script>
<script src="js/lib/Crypto.js"></script>
<script src="js/lib/Opcode.js"></script>
<script src="js/lib/Script.js"></script>
<script src="js/lib/ECKeyLegacy.js"></script>

<script src="js/BitcoinAddress.js"></script>
<script src="js/BillcoinTransaction.js"></script>
<script src="js/Transaction.js"></script>
<script src="js/TransactionIn.js"></script>
<script src="js/TransactionOut.js"></script>
<script src="js/Wallet.js"></script>
<script src="js/TX.js"></script>

<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/spacing.css">

<script>
	
	var transaction = new BillcoinTransaction();
	var model = {
		wallets : ko.observableArray([]),
		amount: ko.observable(0.0004)
	};

	$(document).ready(function(){

		for(i=0; i<=2; i++){
			//var wallet = new Wallet();
			//wallet.generate();
			model.wallets.push({
				address:ko.observable("1Q1qmwyVH7tzrCYa6pVCJCaMLFKVGeURag"),
				wifCompressed:ko.observable("L12LAzDEKgiYsjVEshdaCSRrTJwMtJGJ3tww5Rr8nMU98fV114zg")
			});
			model.wallets.push({
				address:ko.observable("18XxFfNtzLr9kSUYfVdtcFNoskNnZFyYam"),
				wifCompressed:ko.observable("")
			});
		}

		ko.applyBindings(model);

		$("#generate_transaction").click(function(){
			transaction.generate(model.wallets()[0], model.wallets()[1].address(), model.amount());
		});

	});

</script>
</head>
<body>

	<div class="padding">
		<h1>Billcoin Transaction Generation</h1>
		<section>
			<ul>
				<li>
					<header>
						<h2>Generate Transaction JSON</h2>
						<table class="full table">
							<tr>
								<td>Sending From:&nbsp;</td>
								<td>
									Address<input class="full" type="text" data-bind="value:wallets()[0].address"/><br/>
									Private Key<input class="full" type="text" data-bind="value:wallets()[0].wifCompressed"/>
								</td>
							</tr>
							<tr>
								<td>Sending To:&nbsp;</td>
								<td>
									Address<input class="full" type="text" data-bind="value:wallets()[1].address"/><br/>
								</td>
							</tr>
							<tr>
								<td>Balance:&nbsp;</td>
								<td>
									<span class="balance"></span>
								</td>
							</tr>
							<tr>
								<td>Amount:&nbsp;</td>
								<td>
									<input data-bind="value:amount" name="amount"/>
								</td>
							</tr>
							<tr>
								<td></td>
								<td>
		<input type="submit" value="Generate Transaction" id="generate_transaction" />
								</td>
							</tr>
						</table>
					</header>
				</li>
			</ul>
		</section>

		<section>
			<h3>
				This JSON would be sent to the network:
			</h3>
			<pre class="transaction_output"></pre>
			<h3>
				The Raw Transaction format:
			</h3>
			<pre class="json_output"></pre>
		</section>
	</div>

	<footer class="padding">
		<h2>Files with full code</h2>
		<ul>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/Wallet.js">http://bstavroulakis.com/demos/billcoin/js/BillcoinTransaction.js</a>
			</li>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/Wallet.js">http://bstavroulakis.com/demos/billcoin/js/TX.js</a>
			</li>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/Wallet.js">http://bstavroulakis.com/demos/billcoin/js/Transaction.js</a>
			</li>
		</ul>
	</footer>
	
</body>
</html>