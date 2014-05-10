<html>
<head>

<script src="js/jquery.js"></script>
<script src="js/BigInteger.js"></script>
<script src="js/Sha256.js"></script>

<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/spacing.css">

<script>
	$(document).ready(function(){
		var sha256generator = new Sha256();
		$("#sha_key_submit").click(function(){
			var shaStringVal = $("#shaString").val();
			var bytes = sha256generator.stringToBytes(shaStringVal);
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