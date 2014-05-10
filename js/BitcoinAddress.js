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
  var sha256 = new Sha256();
  var checksum = sha256.generate(sha256.generate(hash, {asBytes: true}), {asBytes: true});
  var bytes = hash.concat(checksum.slice(0,4));
  return base58.encode(bytes);
};

BitcoinAddress.prototype.getHashBase64 = function () {
  return bytesToBase64(this.hash);
};

BitcoinAddress.decodeString = function (string) {
  var bytes = base58.decode(string);
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