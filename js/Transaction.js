  var OP_CODESEPARATOR = 171;

  var SIGHASH_ALL = 1;
  var SIGHASH_NONE = 2;
  var SIGHASH_SINGLE = 3;
  var SIGHASH_ANYONECANPAY = 80;

  var Transaction =  function (doc) {
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

  Transaction.prototype.serialize = function ()
  {
    var buffer = [];
    buffer = buffer.concat(wordsToBytes([parseInt(this.version)]).reverse());
    buffer = buffer.concat(Utils.numToVarInt(this.ins.length));
    for (var i = 0; i < this.ins.length; i++) {
      var txin = this.ins[i];
      buffer = buffer.concat(base64ToBytes(txin.outpoint.hash));
      buffer = buffer.concat(wordsToBytes([parseInt(txin.outpoint.index)]).reverse());
      var scriptBytes = txin.script.buffer;
      buffer = buffer.concat(Utils.numToVarInt(scriptBytes.length));
      buffer = buffer.concat(scriptBytes);
      buffer = buffer.concat(wordsToBytes([parseInt(txin.sequence)]).reverse());
    }
    buffer = buffer.concat(Utils.numToVarInt(this.outs.length));
    for (var i = 0; i < this.outs.length; i++) {
      var txout = this.outs[i];
      buffer = buffer.concat(txout.value);
      var scriptBytes = txout.script.buffer;
      buffer = buffer.concat(Utils.numToVarInt(scriptBytes.length));
      buffer = buffer.concat(scriptBytes);
    }
    buffer = buffer.concat(wordsToBytes([parseInt(this.lock_time)]).reverse());

    return buffer;
  };

var wordsToBytes = function (words) {
  for (var bytes = [], b = 0; b < words.length * 32; b += 8)
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  return bytes;
};

Transaction.prototype.clone = function ()
{
  var newTx = new Transaction()
  newTx.version = this.version
  newTx.locktime = this.locktime

  this.ins.forEach(function(txin) {
    newTx.addInput(txin.clone())
  })

  this.outs.forEach(function(txout) {
    newTx.addOutput(txout.clone())
  })

  return newTx
}

Transaction.prototype.hashTransactionForSignature =
  function (connectedScript, inIndex, hashType)
{
    var txTmp = this.clone();

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
}


  Transaction.prototype.addOutput = function (address, value, hexAddress) {
    if (arguments[0] instanceof TransactionOut) {
      this.outs.push(arguments[0]);
    } else {
      if (value instanceof BigInteger) {
        value = value.toByteArrayUnsigned().reverse();
        while (value.length < 8) value.push(0);
      } else if (isArray(value)) {
        // Nothing to do
      }

      this.outs.push(new TransactionOut({
        value: value,
        script: Script.createOutputScript(address),
        address:hexAddress
      }));
    }
  };

  Transaction.prototype.addInput = function (tx, outIndex) {
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