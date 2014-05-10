var HmacSHA256 = function(byteWordArray){

    var t = {};
    var self = this;

    self._createHmacHelper = function (a) {
        return function (c, d) {
            return (new t.HMAC.init(a,d)).finalize(c);
        }
    };

    return self._createHmacHelper(new HmacSHA256f());
};

var tHmac = function(){

        self.init = function (f, g) {
            f = this._hasher = new f.init;
            "string" == typeof g && (g = s.parse(g));
            var h = f.blockSize,
                m = 4 * h;
            g.sigBytes > m && (g = f.finalize(g));
            g.clamp();
            for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) k[j] ^= 1549556828, n[j] ^= 909522486;
            r.sigBytes = l.sigBytes = m;
            this.reset()
        },
        self.reset = function () {
            var f = this._hasher;
            f.reset();
            f.update(this._iKey)
        },
        self.update = function (f) {
            this._hasher.update(f);
            return this
        },
        self.finalize = function (f) {
            var g =
                this._hasher;
            f = g.finalize(f);
            g.reset();
            return g.finalize(this._oKey.clone().concat(f))
        }
};

var HmacSHA256f = function(){

    var self = this;
   self._doReset = function () {
        this._hash = new g.init(m.slice(0))
    };

    self._doProcessBlock = function (c, d) {
        for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
            if (16 > p) a[p] =
                c[d + p] | 0;
            else {
                var k = a[p - 15],
                    l = a[p - 2];
                a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16]
            }
            k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p];
            l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g);
            q = n;
            n = m;
            m = h;
            h = j + k | 0;
            j = g;
            g = f;
            f = e;
            e = k + l | 0
        }
        b[0] = b[0] + e | 0;
        b[1] = b[1] + f | 0;
        b[2] = b[2] + g | 0;
        b[3] = b[3] + j | 0;
        b[4] = b[4] + h | 0;
        b[5] = b[5] + m | 0;
        b[6] = b[6] + n | 0;
        b[7] = b[7] + q | 0
    },
    self._doFinalize = function () {
        var a = this._data,
            d = a.words,
            b = 8 * this._nDataBytes,
            e = 8 * a.sigBytes;
        d[e >>> 5] |= 128 << 24 - e % 32;
        d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
        d[(e + 64 >>> 9 << 4) + 15] = b;
        a.sigBytes = 4 * d.length;
        this._process();
        return this._hash
    },
    self.clone = function () {
        var a = q.clone.call(this);
        a._hash = this._hash.clone();
        return a
    }

};