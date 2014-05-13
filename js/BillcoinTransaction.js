//var key = "";
//var hash = "";

var BillcoinTransaction = function(){
	var self = this;
	self.mainDomain = "api/";
	self.key = "";

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
		//console.log(key);
		self.key = key;
	};

	self.generate = function(senderWallet, receiver, amount, receiverHash160){
    
    var senderAddress = "";
    if(senderWallet != "Generate"){
		  self.priv2key(senderWallet.wifCompressed());
      senderAddress = senderWallet.publicHash160();
    }
		$.ajax({
        	url : self.mainDomain + "getTxHistory.php?address=" + senderAddress,
          async:false,
        	success : function (data) {

            var dataJson = {};
            if(data != null && data != []){
              data = JSON.parse(data);
              for(var key in data){
                dataJson[data[key].hash] = data[key];
              }
            }

if(senderWallet == "Generate"){
  //dataJson = '"test":{"hash":"test","ver":1,"vin_sz":1,"vout_sz":1,"lock_time":0,"in":[{"prev_out":{"hash":"0000000000000000000000000000000000000000000000000000000000000000","n":4294967295},"coinbase":"0375950411627920706f6c6d696e652e706c5371059dfabe6d6d24b1a7c66e7f2bfd4fd1bf3e805eb901eea695c3bb804bd5346f79bc0dd5f15601000000000000000400000000004414"}],"out":[{"value":"50","scriptPubKey":"OP_DUP OP_HASH160 ' + receiverHash160 + ' OP_EQUALVERIFY OP_CHECKSIG"}]}';
}
            
            dataJson = JSON.stringify(dataJson);

        		var transaction = new TX();
        		transaction.init(self.key);
            if(senderWallet != "Generate")
        		  transaction.parseInputs(dataJson, senderWallet.address());
            else
              transaction.parseInputs(dataJson, "");
        		transaction.addOutput(receiver, amount);
			      var sendTx = transaction.construct();
            var superSerial = sendTx.serialize();
            self.txJson = transaction.toBBE(sendTx);
            self.txRaw = bytesToHex(superSerial);
            self.balance = bignum2btcstr(transaction.balance);
            $(".balance").html(self.balance);
            $(".transaction_output").html(self.txJson);
            $(".json_output").html(self.txRaw);
        	}
    	});
	};
};


function hexToBytes2(hex) {
  return hex.match(/../g).map(function(x) {
    return parseInt(x,16)
  })
}


function numToBytes(num, bytes) {
  if (bytes === undefined) bytes = 8
  if (bytes === 0) return []
  return [num % 256].concat(numToBytes(Math.floor(num / 256), bytes - 1))
}

function numToVarInt(num) {
  if (num < 253) return [num]
  if (num < 65536) return [253].concat(numToBytes(num, 2))
  if (num < 4294967296) return [254].concat(numToBytes(num, 4))
  return [255].concat(numToBytes(num, 8))
}

var bytesToHex = function(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
};

function endian(string) {
  var out = []
  for(var i = string.length; i > 0; i-=2) {
    out.push(string.substring(i-2,i));
  }
  return out.join("");
}

function btcstr2bignum(btc) {
  //console.log(btc);
  btc = btc.toString();
  var i = btc.indexOf('.');
  var value = new BigInteger(btc.replace(/\./,''));
  var diff = 9 - (btc.length - i);
  if (i == -1) {
    var mul = "100000000";
  } else if (diff < 0) {
    return value.divide(new BigInteger(Math.pow(10,-1*diff).toString()));
  } else {
    var mul = Math.pow(10,diff).toString();
  }
    return value.multiply(new BigInteger(mul));
}

function bignum2btcstr(satoshi) {
  var s = String(satoshi);
  if (satoshi >= 100000000) {
    var i = s.length - 8;
    return s.substr(0, i) + "." + s.substr(i);
  } else {
    var i = 8 - s.length;
    return "0." + Array(i + 1).join("0") + s;
  }
}

function isEmpty(ob) {
    for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
    return true;
}

  var hexToBytes = function (hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  };