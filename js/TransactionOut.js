  var TransactionOut = function (data)
  {
    if (data.script instanceof Script) {
      this.script = data.script;
    } else {
      this.script = new Script(data.script);
    }

    if (isArray(data.value)) {
      this.value = data.value;
    } else if ("string" == typeof data.value) {
      var valueHex = (new BigInteger(data.value, 10)).toString(16);
      while (valueHex.length < 16) valueHex = "0" + valueHex;
      this.value = hexToBytes(valueHex);
    }
    this.address = data.address;
  };

  TransactionOut.prototype.clone = function ()
  {
    var newTxout = new TransactionOut({
      script: this.script.clone(),
      value: this.value.slice(0),
      address:this.address
    });
    return newTxout;
  };