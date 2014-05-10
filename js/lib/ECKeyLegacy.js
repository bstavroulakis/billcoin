// Random number generator - requires a PRNG backend, e.g. prng4.js

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.

var rng_psize = 256;
var rng_state;
var rng_pool;
var rng_pptr;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x) {
  rng_pool[rng_pptr++] ^= x & 255;
  rng_pool[rng_pptr++] ^= (x >> 8) & 255;
  rng_pool[rng_pptr++] ^= (x >> 16) & 255;
  rng_pool[rng_pptr++] ^= (x >> 24) & 255;
  if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if(rng_pool == null) {
  rng_pool = new Array();
  rng_pptr = 0;
  var t;
  if(navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
    // Extract entropy (256 bits) from NS4 RNG if available
    var z = window.crypto.random(32);
    for(t = 0; t < z.length; ++t)
      rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
  }  
  while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

function rng_get_byte() {
  if(rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool);
    for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
      rng_pool[rng_pptr] = 0;
    rng_pptr = 0;
    //rng_pool = null;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}

function prng_newstate() {
    return new Arcfour
}

function Arcfour() {
    this.i = 0, this.j = 0, this.S = new Array
}

function ARC4init(e) {
    var t, n, r;
    for (t = 0; t < 256; ++t) this.S[t] = t;
    n = 0;
    for (t = 0; t < 256; ++t) n = n + this.S[t] + e[t % e.length] & 255, r = this.S[t], this.S[t] = this.S[n], this.S[n] = r;
    this.i = 0, this.j = 0
}

function ARC4next() {
    var e;
    return this.i = this.i + 1 & 255, this.j = this.j + this.S[this.i] & 255, e = this.S[this.i], this.S[this.i] = this.S[this.j], this.S[this.j] = e, this.S[e + this.S[this.i] & 255]
}

Arcfour.prototype.init = ARC4init, Arcfour.prototype.next = ARC4next;

function rng_get_bytes(ba) {
  var i;
  for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

function SecureRandom() {}
SecureRandom.prototype.nextBytes = rng_get_bytes;

var ECKeyLegacy = function (privKey) {

  var self = this;

    self.e = new ECDSALegacy();
    self.priv = null;
    self.pub = null;
    self.t = getSECCurveByName("secp256k1");
    self.n = new SecureRandom;
    self.compressed = true;

    self.r = function (n) {
      if (!n) {
          var i = self.t.getN();
          self.priv = self.e.getBigRandom(i)
      } else n instanceof BigInteger ? self.priv = n : isArray(n) ? self.priv = BigInteger.fromByteArrayUnsigned(n) : "string" == typeof n && (n.length == 51 && n[0] == "5" 
        ? self.priv = BigInteger.fromByteArrayUnsigned(r.decodeString(n)) : self.priv = BigInteger.fromByteArrayUnsigned(base64ToBytes(n)));
    };

    self.r(privKey);

    self.getPub = function () {
        return self.getPubPoint().getEncoded(self.compressed);
    };

    self.getPubPoint = function () {
        return self.pub || (self.pub = self.t.getG().multiply(self.priv)), self.pub;
    };

    self.toString = function (e) {
        return e === "base64" ? bytesToBase64(self.priv.toByteArrayUnsigned()) : bytesToHex(self.priv.toByteArrayUnsigned());
    };

    self.sign = function (t) {
        return self.e.sign(t, self.priv);
    };
}

var ECDSALegacy = function () {
    var self = this;
    self.e = getSECCurveByName("secp256k1");
    self.t = new SecureRandom;
    self.i = null;

    self.r = function (e, t, n, r) {
        var i = Math.max(t.bitLength(), r.bitLength()),
            s = e.add2D(n),
            o = e.curve.getInfinity();
        for (var u = i - 1; u >= 0; --u) o = o.twice2D(), o.z = BigInteger.ONE, t.testBit(u) ? r.testBit(u) ? o = o.add2D(s) : o = o.add2D(e) : r.testBit(u) && (o = o.add2D(n));
        return o
    };

    self.getBigRandom = function (e) {
        return (new BigInteger(e.bitLength(), self.t)).mod(e.subtract(BigInteger.ONE)).add(BigInteger.ONE)
    };

    self.sign = function (t, n) {
        var elliptic = n;
        var s = self.e.getN();
        var o = BigInteger.fromByteArrayUnsigned(t);

        do { 
          var u = self.getBigRandom(s); 
          var a = self.e.getG();
          var f = a.multiply(u);
          var l0 = f.getX().toBigInteger();  
          var l = l0.mod(s); 
        } while (l.compareTo(BigInteger.ZERO) <= 0);

        var ellipticMultiply = elliptic.multiply(l);
        var c1 = u.modInverse(s).multiply(o.add(ellipticMultiply));
        var c = c1.mod(s);
        return self.serializeSig(l, c)
    };

    self.serializeSig = function (e, t) {
        var n = e.toByteArraySigned(),
            r = t.toByteArraySigned(),
            i = [];
        return i.push(2), i.push(n.length), i = i.concat(n), i.push(2), i.push(r.length), i = i.concat(r), i.unshift(i.length), i.unshift(48), i
    };
};