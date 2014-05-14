var BillcoinTransaction = function(){
	var self = this;
	self.mainDomain = "api/";
	self.key = "";

  self.transaction = {};
  self.txJson = "";
  self.txRaw = "";
  self.balance = "";

	self.priv2key = function(privBase58) {
		
		var bytes = base58.decode(privBase58);
		var sha256 = new Sha256();
		hash = bytes.slice(0, 33);
		var checksum = sha256.generate(sha256.generate(hash, {asBytes: true}), {asBytes: true});

		if (checksum[0] != bytes[33] ||
			checksum[1] != bytes[34] ||
			checksum[2] != bytes[35] ||
			checksum[3] != bytes[36]) {
			//throw "Checksum validation failed!";
		}

		var version = hash.shift();

		if (version != 0x80) {
			//throw "Version "+version+" not supported!";
		}

		key = new ECKeyLegacy(hash);
		self.key = key;
	};

	self.generate = function(senderWallet, receiver, amount){
    
    var isGenerate = false;

    if(senderWallet == "Generate"){
      isGenerate = true;
    }

    if(isGenerate){
      senderWallet = {
        address:function(){return "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN";},
        wifCompressed:function(){return "5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss";},
        publicKey:function(){return "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd";}
      }
    }
    //var senderAddress = "";
    //if(senderWallet != "Generate"){
		  self.priv2key(senderWallet.wifCompressed());
      var bitAddress = new BitcoinAddress(senderWallet.address());
      var senderAddressHash160 = Utils.bytesToHex(bitAddress.hash);

      var dumWallet = new Wallet();
      dumWallet.privateKeyBytes = Utils.hexToBytes(senderWallet.wifCompressed());
      dumWallet.generatePublicKey();

    //}
		$.ajax({
        	url : self.mainDomain + "getTxHistory.php?address=" + senderWallet.address() + "&publicKey=" + senderWallet.publicKey(),
          async:false,
        	success : function (data) {
            var dataJson = {};
            if(data != null && data != []){
              data = JSON.parse(data);
              for(var key=0;key<=data.length-1;key++){
                dataJson[data[key].hash] = data[key];
              }
            }
            dataJson = JSON.stringify(dataJson);
        		var transaction = new TX();
        		transaction.init(self.key);
            if(!isGenerate)
              transaction.parseInputs(dataJson, senderWallet.address());
        		transaction.addOutput(receiver, amount);
			      var sendTx = transaction.construct();
            var superSerial = sendTx.serialize();
            self.txJson = transaction.toBBE(sendTx);
            self.txRaw = Utils.bytesToHex(superSerial);
            self.balance = Utils.bignum2btcstr(transaction.balance);
            self.transaction = transaction;
        	}
    	});
	};
};