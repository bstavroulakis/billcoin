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

  // Convert big-endian 32-bit words to a byte array
var wordsToBytes = function (words) {
  if(words == null)
    return [];
  for (var bytes = [], b = 0; b < words.length * 32; b += 8)
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  return bytes;
};

function wordArrayToBytes(wordArray) {
  return wordsToBytes(wordArray.words);
}

var numToVarInt = function (i) {
    // TODO: THIS IS TOTALLY UNTESTED!
    if (i < 0xfd) {
      // unsigned char
      return [i];
    } else if (i <= 1<<16) {
      // unsigned short (LE)
      return [0xfd, i >>> 8, i & 255];
    } else if (i <= 1<<32) {
      // unsigned int (LE)
      return [0xfe].concat(wordsToBytes([i]));
    } else {
      // unsigned long long (LE)
      return [0xff].concat(wordsToBytes([i >>> 32, i]));
    }
  }

  var bytesToWords = function(bytes) {
    var words = [];
    for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
      words[b >>> 5] |= bytes[i] << (24 - b % 32)
    };
    return words;
  };

  var bytesToWordArray = function(bytes) {
    return new WordArray.init(bytesToWords(bytes), bytes.length)
  }

  var bytesToHex = function(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
  };


  var hexToBytes = function (hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  };

var BitcoinTransaction = function (doc) {
  this.version = 1;
  this.lock_time = 0;
  this.ins = [];
  this.outs = [];
  this.timestamp = null;
  this.block = null;

  if (doc) {
    if (doc.hash) this.hash = doc.hash;
    if (doc.version) this.version = doc.version;
    if (doc.lock_time) this.lock_time = doc.lock_time;
    if (doc.ins && doc.ins.length) {
      for (var i = 0; i < doc.ins.length; i++) {
        this.addInput(new TransactionIn(doc.ins[i]));
      }
    }
    if (doc.outs && doc.outs.length) {
      for (var i = 0; i < doc.outs.length; i++) {
        this.addOutput(new TransactionOut(doc.outs[i]));
      }
    }
    if (doc.timestamp) this.timestamp = doc.timestamp;
    if (doc.block) this.block = doc.block;
  }
};

BitcoinTransaction.prototype.deserialize = function(buffer) {
  if (typeof buffer == "string") {
    buffer = hexToBytes(buffer);
  }
  var pos = 0;
  var readAsInt = function(bytes) {
    if (bytes === 0) return 0;
    pos++;
    return buffer[pos-1] + readAsInt(bytes-1) * 256;
  };
  var readVarInt = function() {
    var bytes = buffer.slice(pos, pos + 9); // maximum possible number of bytes to read
    var result = varIntToNum(bytes);

    pos += result.bytes.length;
    return result.number;
  };
  var readBytes = function(bytes) {
    pos += bytes;
    return buffer.slice(pos - bytes, pos);
  };
  var readVarString = function() {
    var size = readVarInt();
    return readBytes(size);
  };
  var obj = {
    ins: [],
    outs: []
  };
  obj.version = readAsInt(4);
  var ins = readVarInt();
  var i;

  for (i = 0; i < ins; i++) {
    obj.ins.push({
      outpoint: {
        hash: bytesToHex(readBytes(32).reverse()),
        index: readAsInt(4)
      },
      script: new Script(readVarString()),
      sequence: readBytes(4)
    })
  };
  var outs = readVarInt();

  for (i = 0; i < outs; i++) {
    obj.outs.push({
      value: bytesToNum(readBytes(8)),
      script: new Script(readVarString())
    })
  }

  obj.locktime = readAsInt(4);

  return new BitcoinTransaction(obj);
}

BitcoinTransaction.prototype.addInput = function (tx, outIndex) {
  if (arguments[0] instanceof TransactionIn) {
    this.ins.push(arguments[0]);
  } else {
    this.ins.push(new TransactionIn({
      outpoint: {
        hash: tx.hash,
        index: outIndex
      },
      script: new Script(),
      sequence: 4294967295
    }));
  }
};

BitcoinTransaction.prototype.addOutput = function (address, value) {
  if (arguments[0] instanceof TransactionOut) {
    this.outs.push(arguments[0]);
  } else {
    if ("string" == typeof address) {
      address = new BitcoinAddress(address);
    }
    if ("number" == typeof value) {
      value = BigInteger.valueOf(value);
    }

    if (value instanceof BigInteger) {
      value = value.toByteArrayUnsigned().reverse();
      while (value.length < 8) value.push(0);
    } else if (util.isArray(value)) {
      // Nothing to do
    }

    this.outs.push(new TransactionOut({
      value: value,
      script: Script.createOutputScript(address)
    }));
  }
};

BitcoinTransaction.prototype.clone = function ()
{
  var newTx = new BitcoinTransaction();
  newTx.version = this.version;
  newTx.lock_time = this.lock_time;
  for (var i = 0; i < this.ins.length; i++) {
    var txin = this.ins[i].clone();
    newTx.addInput(txin);
  }
  for (var i = 0; i < this.outs.length; i++) {
    var txout = this.outs[i].clone();
    newTx.addOutput(txout);
  }
  return newTx;
};

BitcoinTransaction.prototype.hashTransactionForSignature = function (connectedScript, inIndex, hashType){
  var txTmp = this.clone();

  // In case concatenating two scripts ends up with two codeseparators,
  // or an extra one at the end, this prevents all those possible
  // incompatibilities.
  /*scriptCode = scriptCode.filter(function (val) {
   return val !== OP_CODESEPARATOR;
   });*/

  // Blank out other inputs' signatures
  for (var i = 0; i < txTmp.ins.length; i++) {
    txTmp.ins[i].script = new Script();
  }

  txTmp.ins[inIndex].script = connectedScript;

  // Blank out some of the outputs
  if ((hashType & 0x1f) == SIGHASH_NONE) {
    txTmp.outs = [];

    // Let the others update at will
    for (var i = 0; i < txTmp.ins.length; i++)
      if (i != inIndex)
        txTmp.ins[i].sequence = 0;
  } else if ((hashType & 0x1f) == SIGHASH_SINGLE) {
    // TODO: Implement
  }

  // Blank out other inputs completely, not recommended for open transactions
  if (hashType & SIGHASH_ANYONECANPAY) {
    txTmp.ins = [txTmp.ins[inIndex]];
  }

  var buffer = txTmp.serialize();

  buffer = buffer.concat(wordsToBytes([parseInt(hashType)]).reverse());

  var sha256 = new Sha256();
  var hash1 = sha256.generate(buffer, {asBytes: true});

  return sha256.generate(hash1, {asBytes: true});
};


BitcoinTransaction.prototype.serialize = function ()
{
  var buffer = [];
  buffer = buffer.concat(wordsToBytes([parseInt(this.version)]).reverse());
  buffer = buffer.concat(numToVarInt(this.ins.length));
  for (var i = 0; i < this.ins.length; i++) {
    var txin = this.ins[i];

    buffer = buffer.concat(hexToBytes(txin.outpoint.hash).reverse());
    buffer = buffer.concat(wordsToBytes([parseInt(txin.outpoint.index)]).reverse());
    var scriptBytes = txin.script.buffer;
    buffer = buffer.concat(numToVarInt(scriptBytes.length));
    buffer = buffer.concat(scriptBytes);
    buffer = buffer.concat(wordsToBytes([parseInt(txin.sequence)]).reverse());
  }
  buffer = buffer.concat(numToVarInt(this.outs.length));
  for (var i = 0; i < this.outs.length; i++) {
    var txout = this.outs[i];
    buffer = buffer.concat(txout.value);
    var scriptBytes = txout.script.buffer;
    buffer = buffer.concat(numToVarInt(scriptBytes.length));
    buffer = buffer.concat(scriptBytes);
  }
  buffer = buffer.concat(wordsToBytes([parseInt(this.lock_time)]).reverse());

  return buffer;
};

var TransactionType = {
  Generation:"Generation",
  Address:"Address",
  Pubkey:"Pubkey"
};

var TransactionIn = function (data)
{
  this.outpoint = data.outpoint;
  if (data.script instanceof Script) {
    this.script = data.script;
  } else {
    if (data.scriptSig) {
      this.script = Script.fromScriptSig(data.scriptSig);
    }
    else {
      this.script = new Script(data.script);
    }
  }
  this.sequence = data.sequence;
};

TransactionIn.prototype.clone = function ()
{
  var newTxin = new TransactionIn({
    outpoint: {
      hash: this.outpoint.hash,
      index: this.outpoint.index
    },
    script: this.script.clone(),
    sequence: this.sequence
  });
  return newTxin;
};

var TransactionOut = function (data)
{
  if (data.script instanceof Script) {
    this.script = data.script;
  } else {
    if (data.scriptPubKey) {
      this.script = Script.fromScriptSig(data.scriptPubKey);
    }
    else {
      this.script = new Script(data.script);
    }
  }

  if (util.isArray(data.value)) {
    this.value = data.value;
  } else if ("string" == typeof data.value) {
    var valueHex = (new BigInteger(data.value, 10)).toString(16);
    while (valueHex.length < 16) valueHex = "0" + valueHex;
    this.value = hexToBytes(valueHex);
  }
};

TransactionOut.prototype.clone = function ()
{
  var newTxout = new TransactionOut({
    script: this.script.clone(),
    value: this.value.slice(0)
  });
  return newTxout;
};


var BitcoinAddress = function (bytes) {
  if ("string" == typeof bytes) {
    bytes = BitcoinAddress.decodeString(bytes);
  }
  this.hash = bytes;
  this.version = 0x00;
};

BitcoinAddress.prototype.toString = function () {
  // Get a copy of the hash
  var hash = this.hash.slice(0);

  // Version
  hash.unshift(this.version);

  var checksum = Crypto.SHA256(Crypto.SHA256(hash, {asBytes: true}), {asBytes: true});

  var bytes = hash.concat(checksum.slice(0,4));

  return Bitcoin.Base58.encode(bytes);
};

BitcoinAddress.prototype.getHashBase64 = function () {
  return bytesToBase64(this.hash);
};

BitcoinAddress.decodeString = function (string) {
  
  var bytes = base58decode(string);
  var hash = bytes.slice(0, 21);
  var sha256 = new Sha256();
  var checksum = sha256.generate(sha256.generate(hash, {asBytes: true}), {asBytes: true});

  if (checksum[0] != bytes[21] ||
    checksum[1] != bytes[22] ||
    checksum[2] != bytes[23] ||
    checksum[3] != bytes[24]) {
    throw "Checksum validation failed!";
  }

  var version = hash.shift();

  if (version != 0) {
    throw "Version "+version+" not supported!";
  }

  return hash;
};

var bytesToString = function (bytes) {
    for (var str = [], i = 0; i < bytes.length; i++)
      str.push(String.fromCharCode(bytes[i]));
    return str.join("");
  }

var bytesToBase64 = function (bytes) {

    // Use browser-native function if it exists
    if (typeof btoa == "function") return btoa(bytesToString(bytes));

    for(var base64 = [], i = 0; i < bytes.length; i += 3) {
      var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      for (var j = 0; j < 4; j++) {
        if (i * 8 + j * 6 <= bytes.length * 8)
          base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
        else base64.push("=");
      }
    }

    return base64.join("");

  };

  var base58encode = function(input) {

    var bi = BigInteger.fromByteArrayUnsigned(input);
    var chars = [];

    while (bi.compareTo(base) >= 0) {
        var mod = bi.mod(base);
        chars.push(alphabet[mod.intValue()]);
        bi = bi.subtract(mod).divide(base);
    }
    chars.push(alphabet[bi.intValue()]);

    // Convert leading zeros too.
    for (var i = 0; i < input.length; i++) {
        if (input[i] == 0x00) {
            chars.push(alphabet[0]);
        } else break;
    }
    return chars.reverse().join('');
  };

  var base58decode = function(input) {

    var base = BigInteger.valueOf(58);

    var length = input.length;
    var num = BigInteger.valueOf(0);
    var leading_zero = 0;
    var seen_other = false;
    for (var i=0; i<length ; ++i) {
        var char = input[i];
        var p = positions[char];

        // if we encounter an invalid character, decoding fails
        if (p === undefined) {
            throw new Error('invalid base58 string: ' + input);
        }

        num = num.multiply(base).add(BigInteger.valueOf(p));

        if (char == '1' && !seen_other) {
            ++leading_zero;
        }
        else {
            seen_other = true;
        }
    }

    var bytes = num.toByteArrayUnsigned();

    // remove leading zeros
    while (leading_zero-- > 0) {
        bytes.unshift(0);
    }
    return bytes;
  };

var WordArray = {
  init: function (words, sigBytes) {
      words = this.words = words || [];

      if (sigBytes != undefined) {
          this.sigBytes = sigBytes;
      } else {
          this.sigBytes = words.length * 4;
      }
  }
};