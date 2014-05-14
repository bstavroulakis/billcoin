<html>
<head>

<script src="js/jquery/jquery.js"></script>
<script src="js/lib/BigInteger.js"></script>
<script src="js/lib/Sha256.js"></script>
<script src="js/lib/Utils.js"></script>

<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/spacing.css">

<script>
	$(document).ready(function(){
		var sha256generator = new Sha256();
		$("#sha_key_submit").click(function(){
			var shaStringVal = $("#shaString").val();
			var bytes = Utils.stringToBytes(shaStringVal);
			$("#shaResult").html(sha256generator.generate(bytes));
		});
	});
</script>

</head>

<body>

	<div class="padding">
		<h1 class="margin_0_top">Sha256 Example</h1>

		<input style="width:100%;padding:5px;" type="text" value="" placeholder="Enter your string here" name="shaString" id="shaString" /><br/>
		<input type="submit" value="Generate" id="sha_key_submit" />
		<div id="shaResult"></div>

	</div>
	
</body>

</html>