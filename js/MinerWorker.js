self.addEventListener('message', function(e) {

  var nonce = 0;
  var data = e.data;
  var sha256 = new Sha256();

  switch (data.cmd) {
    case 'start':
    	while(true){
    		var hash2 = sha256.generate(data.hash + nonce);
    		
    		if(hash2[0] == "0"){
    			self.postMessage({success:true, nonce:nonce});
    			//self.close(); // Terminates the worker.
      			break;
    		}else{
    			//self.postMessage({success:false, nonce:nonce});
    		}
    		nonce++;
    	}
      break;
    case 'stop':
      self.postMessage({success:false, nonce:nonce});
      //self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);

//The Sha256 Algorithm - To be removed
var Sha256 = function(){

	var self = this;

	self.W = [];
	self.K = [];
	self.n = 2;
    self.nPrime = 0;

    self.isPrime = function(n) {
        var sqrtN = Math.sqrt(n);
        for (var factor = 2; factor <= sqrtN; factor++) {
            if (!(n % factor)) {
                return false;
            }
        }

        return true;
    };

    self.getFractionalBits = function(n) {
        return ((n - (n | 0)) * 0x100000000) | 0;
    };

    while (self.nPrime < 64) {
        if (self.isPrime(self.n)) {
            self.K[self.nPrime] = self.getFractionalBits(Math.pow(self.n, 1 / 3));
            self.nPrime++;
        }

        self.n++;
    };
	
	self.bytesToHex = function(bytes) {
		for (var hex = [], i = 0; i < bytes.length; i++) {
			hex.push((bytes[i] >>> 4).toString(16));
			hex.push((bytes[i] & 0xF).toString(16));
		}
		return hex.join("");
	};

	self.binaryBytesToString = function (bytes) {
		return bytes.map(function(x){ return String.fromCharCode(x) }).join('');
	};

	self.wordsToBytes = function (words) {
	    var bytes = [];
	    for (var b = 0; b < words.length * 32; b += 8) {
	        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	    }
	    return bytes;
	};

	self.bytesToWords = function (bytes) {
	  var words = []
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32)
	  }
	  return words
	}

	self.stringToBytes = function (str) {
		return self.binaryStringToBytes(unescape(encodeURIComponent(str)));
	};

	self.binaryStringToBytes = function (str) {
		for (var bytes = [], i = 0; i < str.length; i++)
			bytes.push(str.charCodeAt(i));
		return bytes;
	};

	self.bytesToString = function (bytes) {
	    for (var str = [], i = 0; i < bytes.length; i++)
	      str.push(String.fromCharCode(bytes[i]));
	    return str.join("");
	  }

	self.generate = function(message, options) {

		self.W = [];

	    if (message.constructor === String) {
		    message = self.stringToBytes(message);
		  }

		  var H =[ 0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
		           0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19 ];

		  var m = self.bytesToWords(message);
		  var l = message.length * 8;

		  m[l >> 5] |= 0x80 << (24 - l % 32);
		  m[((l + 64 >> 9) << 4) + 15] = l;

		  for (var i=0 ; i<m.length; i += 16) {
		    self.processBlock(H, m, i);
		  }

		  var digestbytes = self.wordsToBytes(H);
		  return options && options.asBytes ? digestbytes :
		         options && options.asString ? self.bytesToString(digestbytes) :
		         self.bytesToHex(digestbytes)

	};

	self.processBlock = function (H, M, offset) {

	    // Working variables
	    var a = H[0];
	    var b = H[1];
	    var c = H[2];
	    var d = H[3];
	    var e = H[4];
	    var f = H[5];
	    var g = H[6];
	    var h = H[7];

	    // Computation
	    for (var i = 0; i < 64; i++) {
	        if (i < 16) {
	            self.W[i] = M[offset + i] | 0;
	        } else {
	            var gamma0x = self.W[i - 15];
	            var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
	                          ((gamma0x << 14) | (gamma0x >>> 18)) ^
	                           (gamma0x >>> 3);

	            var gamma1x = self.W[i - 2];
	            var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
	                          ((gamma1x << 13) | (gamma1x >>> 19)) ^
	                           (gamma1x >>> 10);

	            self.W[i] = gamma0 + self.W[i - 7] + gamma1 + self.W[i - 16];
	        }

	        var ch  = (e & f) ^ (~e & g);
	        var maj = (a & b) ^ (a & c) ^ (b & c);

	        var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
	        var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

	        var t1 = h + sigma1 + ch + self.K[i] + self.W[i];
	        var t2 = sigma0 + maj;

	        h = g;
	        g = f;
	        f = e;
	        e = (d + t1) | 0;
	        d = c;
	        c = b;
	        b = a;
	        a = (t1 + t2) | 0;
	    }

	    // Intermediate hash value
	    H[0] = (H[0] + a) | 0;
	    H[1] = (H[1] + b) | 0;
	    H[2] = (H[2] + c) | 0;
	    H[3] = (H[3] + d) | 0;
	    H[4] = (H[4] + e) | 0;
	    H[5] = (H[5] + f) | 0;
	    H[6] = (H[6] + g) | 0;
	    H[7] = (H[7] + h) | 0;
	};

};