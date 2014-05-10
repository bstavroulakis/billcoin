var Wallet = function(){

	var self = this;

	self.privateKeyHex = "";
	self.privateKeyChecksum = "";
	self.privateKeyWithChecksum = "";
	self.privateKeyBytes = "";
	
	self.wif = "";
	self.wifCompressed = "";

	self.publicKeyHex = "";
	self.publicKeyBytes = "";

	self.address = "";

	self.alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
	self.base = BigInteger.valueOf(58);

	self.ripemd160 = new Ripemd160();
	self.sha256 = new Sha256();

	self.amount = 0;

	self.generate = function(){
		self.generatePrivateKey();
		self.generateChecksum();
		self.compressPrivateKey();
		self.generatePublicKey();
		self.generateWallet();
	};

	self.generateChecksum = function(){
		var privateKeyAndPrefix = "80" + self.privateKeyHex;
		var sha = self.sha256.generate(self.hexToBytes(self.sha256.generate(self.hexToBytes(privateKeyAndPrefix))))
		self.privateKeyChecksum = sha.substr(0, 8).toUpperCase();
		self.privateKeyWithChecksum = privateKeyAndPrefix + self.privateKeyChecksum;
		var base_encode_int = self.hexToBytes(self.privateKeyWithChecksum);
		self.wif = self.base58encode(base_encode_int);
	};

	self.generatePrivateKey = function(){
		var randArr = new Uint8Array(32);
		window.crypto.getRandomValues(randArr);

		//var randArr = self.sha256.generate("test", { asBytes: true });
       //var randArr = Crypto.util.bytesToHex(hash);

		self.privateKeyBytes = [];
		for (var i = 0; i < randArr.length; ++i)
		  self.privateKeyBytes[i] = randArr[i];

		self.privateKeyHex = self.bytesToHex(self.privateKeyBytes).toUpperCase();
	};

	self.stringToBytes = function (str) {
		for (var bytes = [], i = 0; i < str.length; i++)
			bytes.push(str.charCodeAt(i));
		return bytes;
	}

	self.generatePublicKey = function(){

		var curve = getSECCurveByName("secp256k1");
		var privateKeyBN = BigInteger.fromByteArrayUnsigned(self.privateKeyBytes);
		var curvePt = curve.getG().multiply(privateKeyBN);
		var x = curvePt.getX().toBigInteger();
		var y = curvePt.getY().toBigInteger();
		self.publicKeyBytes = integerToBytes(x,32);
		self.publicKeyBytes = self.publicKeyBytes.concat(integerToBytes(y,32));
		self.publicKeyBytes.unshift(0x04);
		self.publicKeyHex = self.bytesToHex(self.publicKeyBytes);
		//console.log(self.publicKeyHex);
    
    	var publicKeyBytesCompressed = integerToBytes(x,32) //x from above
		if (y.isEven())
		  publicKeyBytesCompressed.unshift(0x02)
		else
		  publicKeyBytesCompressed.unshift(0x03)

		//console.log(self.bytesToHex(publicKeyBytesCompressed));
		self.publicKeyBytes = publicKeyBytesCompressed;
		self.publicKeyHex = self.bytesToHex(publicKeyBytesCompressed);
		//console.log(publicKeyHexCompressed);
	};

	self.generateWallet = function(){
		//Crypto.RIPEMD160(Crypto.SHA256(e,{asBytes:!0}),{asBytes:!0})}
		var hash160 = self.ripemd160.generate(self.sha256.generate(self.publicKeyBytes,{asBytes:true}),{asBytes:false});
		//console.log(hash160);
		//var hash160 = self.ripemd160.generate(self.hexToBytes(self.sha256.generate(self.publicKeyBytes)));
		var hashAndBytes = self.hexToBytes(hash160);
		hashAndBytes.unshift(0x00);
		var doubleSHA = self.sha256.generate(self.hexToBytes(self.sha256.generate(hashAndBytes)));
		var addressChecksum = doubleSHA.substr(0,8);
		var unencodedAddress = "00" + hash160 + addressChecksum;
		self.address = self.base58encode(self.hexToBytes(unencodedAddress));
	};

	self.compressPrivateKey = function(){
		var privateKeyBytesCompressed = self.privateKeyBytes.slice(0);
		privateKeyBytesCompressed.push(0x01);
		var hash = privateKeyBytesCompressed.slice(0);
		hash.unshift(0x80);
		var checksum = self.sha256.generate(self.sha256.generate(hash, {asBytes: true}), {asBytes: true});
		var bytes = hash.concat(checksum.slice(0,4));
		self.wifCompressed = self.base58encode(bytes);
	};

	self.bytesToHex = function(bytes) {
		for (var hex = [], i = 0; i < bytes.length; i++) {
			hex.push((bytes[i] >>> 4).toString(16));
			hex.push((bytes[i] & 0xF).toString(16));
		}
		return hex.join("");
	};

	self.hexToBytes = function(hex) {
		for (var bytes = [], c = 0; c < hex.length; c += 2)
			bytes.push(parseInt(hex.substr(c, 2), 16));
		return bytes;
	};

	self.base58encode = function(input) {

        var bi = BigInteger.fromByteArrayUnsigned(input);
	    var chars = [];

	    while (bi.compareTo(self.base) >= 0) {
	        var mod = bi.mod(self.base);
	        chars.push(self.alphabet[mod.intValue()]);
	        bi = bi.subtract(mod).divide(self.base);
	    }
	    chars.push(self.alphabet[bi.intValue()]);

	    // Convert leading zeros too.
	    for (var i = 0; i < input.length; i++) {
	        if (input[i] == 0x00) {
	            chars.push(self.alphabet[0]);
	        } else break;
	    }

	    return chars.reverse().join('');

	};

};