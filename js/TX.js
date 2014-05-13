var OP_CODESEPARATOR = 171;
var SIGHASH_ALL = 1;
var SIGHASH_NONE = 2;
var SIGHASH_SINGLE = 3;
var SIGHASH_ANYONECANPAY = 80;

var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var base = BigInteger.valueOf(58);

var positions = {};
for (var i=0 ; i < alphabet.length ; ++i) {
    positions[alphabet[i]] = i;
}

var TX = function () {

	var self = this;
    self.inputs = [];
    self.outputs = [];
    self.eckey = null;
    self.balance = 0;

    self.init = function(_eckey) {
        self.outputs = [];
        self.eckey = _eckey;
    }

	self.parseInputs = function(text, address) {
		var res = self.parseTxs(text, address);
        self.balance = res.balance;
        self.inputs = res.unspenttxs;
    }

	self.construct = function() {
      return self.rebuild(null, false);
    }

    self.addOutput = function(addr, fval) {
        self.outputs.push({address: addr, value: fval});
    };

    self.parseScript = function(script) {
	    var newScript = new Script();
	    var s = script.split(" ");
	    for (var i in s) {
	        if (Opcode.map.hasOwnProperty(s[i])){
	            newScript.writeOp(Opcode.map[s[i]]);
	        } else {
	            newScript.writeBytes(Utils.hexToBytes(s[i]));
	        }
	    }
	    return newScript;
	}

	self.rebuild = function(sendTx, resign) {
        if (!resign)
          sendTx = new Transaction();

        var selectedOuts = [];
        for (var hash in self.inputs) {
            if (!self.inputs.hasOwnProperty(hash))
                continue;
            for (var index in self.inputs[hash]) {
                if (!self.inputs[hash].hasOwnProperty(index))
                    continue;
                var script = self.parseScript(self.inputs[hash][index].script);
                var b64hash = Utils.bytesToBase64(Utils.hexToBytes(hash));
                var txin = new TransactionIn({outpoint: {hash: b64hash, index: index}, script: script, sequence: 4294967295});
                selectedOuts.push(txin);
                if (!resign)
                  sendTx.addInput(txin);
            }
        }

        for (var i in self.outputs) {
            var address = self.outputs[i].address;
            var fval = self.outputs[i].value;
            var value = new BigInteger('' + Math.round(fval * 1e8), 10);
            if (!resign){
              var bitAddress = new BitcoinAddress(address);
              sendTx.addOutput(bitAddress, value, address);
          	}
        }

        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var connectedScript = selectedOuts[i].script;
            var hash = sendTx.hashTransactionForSignature(connectedScript, i, hashType);
            var pubKeyHash = connectedScript.simpleOutPubKeyHash();
            var signature = self.eckey.sign(hash);
            signature.push(parseInt(hashType, 10));
            var pubKey = self.eckey.getPub();
            var script = new Script();
            script.writeBytes(signature);
            script.writeBytes(pubKey);
            sendTx.ins[i].script = script;
        }
        return sendTx;
    };

	self.toBBE = function(sendTx) {
        //serialize to Bitcoin Block Explorer format
        var buf = sendTx.serialize();
        var sha256 = new Sha256();
        var hash = sha256.generate(sha256.generate(buf, {asBytes: true}), {asBytes: true});
        var r = {};
        r['hash'] = Utils.bytesToHex(hash.reverse());
        r['ver'] = sendTx.version;
        r['vin_sz'] = sendTx.ins.length;
        r['vout_sz'] = sendTx.outs.length;
        r['lock_time'] = sendTx.lock_time;
        r['size'] = buf.length;
        r['in'] = []
        r['out'] = []

        for (var i = 0; i < sendTx.ins.length; i++) {
            var txin = sendTx.ins[i];
            var hash = base64ToBytes(txin.outpoint.hash);
            var n = txin.outpoint.index;
            var prev_out = {'hash': Utils.bytesToHex(hash.reverse()), 'n': n};
            var seq = txin.sequence;

            if (n == 4294967295) {
                var cb = Utils.bytesToHex(txin.script.buffer);
                r['in'].push({'prev_out': prev_out, 'coinbase' : cb, 'sequence':seq});
            } else {
                var ss = dumpScript(txin.script);
                r['in'].push({'prev_out': prev_out, 'scriptSig' : ss, 'sequence':seq});
            }
        }

        for (var i = 0; i < sendTx.outs.length; i++) {
            var txout = sendTx.outs[i];
            var bytes = txout.value.slice(0);
            var fval = parseFloat(self.formatValue(bytes.reverse()));
            var value = fval.toFixed(8);
            var spk = dumpScript(txout.script);
            r['out'].push({'value' : value, 'scriptPubKey': spk, 'address':txout.address});
        }

        return JSON.stringify(r, null, 4);
    };

    self.formatValue = function(valueBuffer) {
	  var value = valueToBigInt(valueBuffer).toString();
	  var integerPart = value.length > 8 ? value.substr(0, value.length - 8) : '0';
	  var decimalPart = value.length > 8 ? value.substr(value.length - 8) : value;
	  while (decimalPart.length < 8) {
	    decimalPart = "0" + decimalPart;
	  }
	  decimalPart = decimalPart.replace(/0*$/, '');
	  while (decimalPart.length < 2) {
	    decimalPart += "0";
	  }
	  return integerPart + "." + decimalPart;
	};

    self.parseTxs = function(data, address) {
		var address = address.toString();
		var tmp = JSON.parse(data);
		var txs = [];

		for (var a in tmp) {
			if (!tmp.hasOwnProperty(a))
				continue;
			txs.push(tmp[a]);
		}
		
		// Sort chronologically
		txs.sort(function(a,b) {
			if (a.time > b.time) return 1;
			else if (a.time < b.time) return -1;
			return 0;
		})

		delete unspenttxs;
		var unspenttxs = {}; // { "<hash>": { <output index>: { amount:<amount>, script:<script> }}}
		var balance = BigInteger.ZERO;

		// Enumerate the transactions 
		for (var a in txs) {
			if (!txs.hasOwnProperty(a))
				continue;
			var tx = txs[a];
			if (tx.ver != 1) throw "Unknown version found. Expected version 1, found version "+tx.ver;
			
			// Enumerate inputs
			for (var b in tx.in ) {
				if (!tx.in.hasOwnProperty(b))
					continue;
				var input = tx.in[b];
				var p = input.prev_out;
				var lilendHash = Utils.endian(p.hash)
				// if this came from a transaction to our address...
				if (lilendHash in unspenttxs) {
					unspenttx = unspenttxs[lilendHash];
					
					// remove from unspent transactions, and deduce the amount from the balance
					balance = balance.subtract(unspenttx[p.n].amount);
					delete unspenttx[p.n]
					if (Utils.isEmpty(unspenttx)) {
						delete unspenttxs[lilendHash]
					}
				}
			}
			
			// Enumerate outputs
			var i = 0;
			for (var b in tx.out) {
				if (!tx.out.hasOwnProperty(b))
					continue;
					
				var output = tx.out[b];
				
				// if this was sent to our address...
				if (output.address == address) {
					// remember the transaction, index, amount, and script, and add the amount to the wallet balance
					var value = Utils.btcstr2bignum(output.value);
					var lilendHash = Utils.endian(tx.hash)
					if (!(lilendHash in unspenttxs))
						unspenttxs[lilendHash] = {};
					unspenttxs[lilendHash][i] = {amount: value, script: output.scriptPubKey, address:address};
					balance = balance.add(value);
				}
				i = i + 1;
			}
		}

		return {balance:balance, unspenttxs:unspenttxs};
	};
};

var valueToBigInt = function (valueBuffer)
{
    if (valueBuffer instanceof BigInteger) return valueBuffer;
    return BigInteger.fromByteArrayUnsigned(valueBuffer);
};

var dumpScript = function(script) {
    var out = [];
    for (var i = 0; i < script.chunks.length; i++) {
        var chunk = script.chunks[i];
        var op = new Opcode(chunk);
        typeof chunk == 'number' ?  out.push(op.toString()) :
            out.push(Utils.bytesToHex(chunk));
    }
    return out.join(' ');
}