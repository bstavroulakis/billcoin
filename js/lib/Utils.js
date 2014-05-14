var Utils = {
	hexToBytes : function(hex) {
		for (var bytes = [], c = 0; c < hex.length; c += 2)
			bytes.push(parseInt(hex.substr(c, 2), 16));
		return bytes;
	},
	bytesToHex : function(bytes) {
		for (var hex = [], i = 0; i < bytes.length; i++) {
			hex.push((bytes[i] >>> 4).toString(16));
			hex.push((bytes[i] & 0xF).toString(16));
		}
		return hex.join("");
	},
	bytesToString : function (bytes) {
		for (var str = [], i = 0; i < bytes.length; i++)
			str.push(String.fromCharCode(bytes[i]));
		return str.join("");
	},
	bytesToBase64 : function (bytes) {
		if (typeof btoa == "function") return btoa(Utils.bytesToString(bytes));

		for(var base64 = [], i = 0; i < bytes.length; i += 3) {
		  var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
		  for (var j = 0; j < 4; j++) {
		    if (i * 8 + j * 6 <= bytes.length * 8)
		      base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
		    else base64.push("=");
		  }
		}

		return base64.join("");
	},
	bignum2btcstr : function (satoshi) {
	  var s = String(satoshi);
	  if (satoshi >= 100000000) {
	    var i = s.length - 8;
	    return s.substr(0, i) + "." + s.substr(i);
	  } else {
	    var i = 8 - s.length;
	    return "0." + Array(i + 1).join("0") + s;
	  }
	},
	btcstr2bignum : function(btc) {
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
	},
	numToBytes : function(num, bytes) {
	  if (bytes === undefined) bytes = 8
	  if (bytes === 0) return []
	  return [num % 256].concat(Utils.numToBytes(Math.floor(num / 256), bytes - 1))
	},
	numToVarInt : function (num) {
	  if (num < 253) return [num]
	  if (num < 65536) return [253].concat(Utils.numToBytes(num, 2))
	  if (num < 4294967296) return [254].concat(Utils.numToBytes(num, 4))
	  return [255].concat(Utils.numToBytes(num, 8))
	},
	endian : function(string) {
	  var out = []
	  for(var i = string.length; i > 0; i-=2) {
	    out.push(string.substring(i-2,i));
	  }
	  return out.join("");
	},
	isEmpty : function (ob) {
    	for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
    	return true;
	},
	bytesToWords : function (bytes) {
	  var words = []
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32)
	  }
	  return words;
	},
	wordsToBytes : function (words) {
	    var bytes = [];
	    for (var b = 0; b < words.length * 32; b += 8) {
	        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	    }
	    return bytes;
	},
	binaryStringToBytes : function (str) {
		for (var bytes = [], i = 0; i < str.length; i++)
			bytes.push(str.charCodeAt(i));
		return bytes;
	},
	binaryBytesToString : function (bytes) {
		return bytes.map(function(x){ return String.fromCharCode(x) }).join('');
	},
	stringToBytes : function (str) {
		return Utils.binaryStringToBytes(unescape(encodeURIComponent(str)));
	}
}