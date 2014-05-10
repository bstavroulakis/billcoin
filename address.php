<html>
<head>

<script src="js/jquery/jquery.js"></script>
<script src="js/jquery/jquery-ui.js"></script>

<script src="js/lib/BigInteger.js"></script>
<script src="js/lib/Ripemd160.js"></script>
<script src="js/lib/Sha256.js"></script>

<script src="js/Wallet.js"></script>

<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/spacing.css">

<script>
	
	$(document).ready(function(){

		$("#random_key_submit").click(function(){

			var wallet = new Wallet();
			wallet.generate();
			
			$("#private_key").val(wallet.privateKeyHex);
			$("#public_key").val(wallet.publicKeyHex);
			$("#private_key_checksum").val(wallet.privateKeyChecksum);
			$("#private_key_with_checksum").val(wallet.privateKeyWithChecksum);
			$("#private_key_wif").val(wallet.wif);
			$("#address").val(wallet.address);
			$("#wif_compressed").val(wallet.wifCompressed);
			$(".generate_message").html("Your wallet is generated. Scroll to see the different keys generated");

		});

	});

</script>

</head>

<body>

	<div class="padding">
		<h1>Billcoin Wallet Generation</h1>

		<input type="submit" value="Generate" id="random_key_submit" />
		<div class="generate_message"></div>

<h2>Overview of the Wallet Generation</h2>
		<figure>
			<img src="images/bitcoinkeys.png" />
			<figcaption>
				Image from: http://www.righto.com/2014/02/bitcoins-hard-way-using-raw-bitcoin.html
			</figcaption>
		</figure>

		<section>
			<ul>
				<li>
					<header>
						<h2>Step 1 - Private Key</h2>
						<p>
							Generate a Private Key.
						</p>
					</header>
					<pre>
//Get some random values
var randArr = new Uint8Array(32);
window.crypto.getRandomValues(randArr);

//Fill up our array with random values
var privateKeyBytes = []
for (var i = 0; i < randArr.length; ++i)
  privateKeyBytes[i] = randArr[i];

//Checkout http://bstavroulakis.com/demos/billcoin/js/Wallet.js which basically has all of the code mentioned here.
var privateKeyHex = self.bytesToHex(privateKeyBytes).toUpperCase();
					</pre>
					<table class="full table">
						<tr>
							<td>Private Key Hex:</td>
							<td><input class="full" type="text" id="private_key" name="private_key" disabled/></td>
						</tr>
					</table>
				</li>
				<li>
					<header>
						<h2>Step 2 - WIF Format</h2>
						<p>
							Change the Private Key Format a bit to comply with the WIF standard.
						</p>
					</header>
					<pre>
//First we'll add a "80" string in front of the private key hex. This is necessay to transform to the base58 encoding. For more info you can read this page https://en.bitcoin.it/wiki/Base58Check_encoding					
var privateKeyAndPrefix = "80" + privateKeyHex;

//SHA256 Hash the privateKeyAndPrefix twice
var sha = self.SHA256(self.hexToBytes(self.SHA256(self.hexToBytes(privateKeyAndPrefix))));

//Take the first 8 characters
self.privateKeyChecksum = sha.substr(0, 8).toUpperCase();

//And add them to the end of the privateKeyAndPrefix
self.privateKeyWithChecksum = privateKeyAndPrefix + self.privateKeyChecksum;

//Transform to a base58 encoding
var base_encode_int = [0].concat(self.hexToBytes(self.privateKeyWithChecksum));
self.privateKeyWIF = self.base58encode(base_encode_int);
					</pre>
					<table class="full table">
						<tr>
							<td>Checksum: </td><td><input class="full" type="text" id="private_key_checksum" name="private_key_checksum" disabled/></td>
						</tr>
						<tr>
							<td>Private key with checksum: </td><td><input class="full" type="text" id="private_key_with_checksum" name="private_key_with_checksum" disabled/></td>
						</tr>
						<tr>
							<td>Private key after base58 encoding (WIF): </td><td><input class="full" type="text" id="private_key_wif" name="private_key_wif" disabled/></td>
						</tr>
					</table>
				</li>		
				<li>
					<header>
						<h2>Step 3 - Public Key</h2>
						<p>
							Get the Public Key from the Private Key.
						</p>
					</header>
					<pre>
var curve = getSECCurveByName("secp256k1") //found in bitcoinjs-lib/src/jsbn/sec.js

//convert our random array or private key to a Big Integer
var privateKeyBN = BigInteger.fromByteArrayUnsigned(input) 

//This is using the elliptic curve algorithm. For more info checkout https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm
//and http://www.certicom.com/index.php/ecc-tutorial
//and http://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography
//The elliptic curve used is y^2=x^3+7.
var curvePt = curve.getG().multiply(privateKeyBN)
var x = curvePt.getX().toBigInteger()
var y = curvePt.getY().toBigInteger()
var publicKeyBytes = integerToBytes(x,32) //integerToBytes is found in bitcoinjs-lib/src/ecdsa.js
publicKeyBytes = publicKeyBytes.concat(integerToBytes(y,32))
publicKeyBytes.unshift(0x04)
var publicKeyHex = Crypto.util.bytesToHex(publicKeyBytes)
					</pre>
					<table class="full table">
						<tr>
							<td>Public Key: </td><td><input class="full" type="text" id="public_key" name="public_key" disabled/></td>
						</tr>
					</table>
				</li>		

				<li>
					<header>
						<h2>Step 4 - Address</h2>
						<p>
							Generate the address from the public key with a bit of transformations.
						</p>
					</header>
					<pre>
var hash160 = self.ripemd160.generate(self.hexToBytes(self.SHA256(publicKeyBytes)));
var version = 0x00 ;
var hashAndBytes = self.hexToBytes(hash160);
hashAndBytes.unshift(version);
var doubleSHA = self.SHA256(self.hexToBytes(self.SHA256(hashAndBytes)));
var addressChecksum = doubleSHA.substr(0,8);
var unencodedAddress = "00" + hash160 + addressChecksum;
self.address = self.base58encode(self.hexToBytes(self.unencodedAddress));
					</pre>
					<table class="full table">
						<tr>
							<td>Address: </td><td><input class="full" type="text" id="address" name="address" disabled/></td>
						</tr>
					</table>
				</li>	

				<li>
					<header>
						<h2>Step 5 - Compress Private Key in WIF Format</h2>
						<p>
							Generate WIF Key Compressed
						</p>
					</header>
					<pre>
var privateKeyBytesCompressed = self.privateKeyBytes.slice(0);
privateKeyBytesCompressed.push(0x01);
var hash = this.hash.slice(0);
hash.unshift(this.version);
var checksum = self.sha256.generate(self.sha256.generate(hash, {asBytes: true}), {asBytes: true});
var bytes = hash.concat(checksum.slice(0,4));
self.privateKeyCompressed = self.base58encode(bytes);
					</pre>
					<table class="full table">
						<tr>
							<td>WIF Compressed: </td><td><input class="full" type="text" id="wif_compressed" name="wif_compressed" disabled/></td>
						</tr>
					</table>
				</li>	

			</ul>
		</section>
	</div>

	<footer class="padding">
		<h2>Files with full code</h2>
		<ul>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/Wallet.js">http://bstavroulakis.com/demos/billcoin/js/Wallet.js</a>
			</li>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/BigInteger.js">http://bstavroulakis.com/demos/billcoin/js/lib/BigInteger.js</a>
			</li>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/Ripemd160.js">http://bstavroulakis.com/demos/billcoin/js/lib/Ripemd160.js</a>
			</li>
			<li>
<a href="http://bstavroulakis.com/demos/billcoin/js/BigInteger.js">http://bstavroulakis.com/demos/billcoin/js/lib/Sha256.js</a>
			</li>
		</ul>
	</footer>
	
</body>

</html>