LavaPack.loadBundle([
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\through\\index.js", {"_process":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\process\\browser.js","stream":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\stream-browserify\\index.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cthrough%5Cindex.js
      return function (require, module, exports) {
(function (process){(function (){
var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data === null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}


}).call(this)}).call(this,require('_process'))

      };
    };
  }
  }
}, {package:"debounce-stream>through",file:"node_modules\\through\\index.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\tiny-secp256k1\\js.js", {"./rfc6979":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\tiny-secp256k1\\rfc6979.js","bn.js":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\bn.js\\lib\\bn.js","buffer":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\buffer\\index.js","elliptic":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\elliptic\\lib\\elliptic.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctiny-secp256k1%5Cjs.js
      return function (require, module, exports) {
(function (Buffer){(function (){
const BN = require('bn.js')
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
const deterministicGenerateK = require('./rfc6979')

const ZERO32 = Buffer.alloc(32, 0)
const EC_GROUP_ORDER = Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')
const EC_P = Buffer.from('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 'hex')

const n = secp256k1.curve.n
const nDiv2 = n.shrn(1)
const G = secp256k1.curve.g

const THROW_BAD_PRIVATE = 'Expected Private'
const THROW_BAD_POINT = 'Expected Point'
const THROW_BAD_TWEAK = 'Expected Tweak'
const THROW_BAD_HASH = 'Expected Hash'
const THROW_BAD_SIGNATURE = 'Expected Signature'
const THROW_BAD_EXTRA_DATA = 'Expected Extra Data (32 bytes)'

function isScalar (x) {
  return Buffer.isBuffer(x) && x.length === 32
}

function isOrderScalar (x) {
  if (!isScalar(x)) return false
  return x.compare(EC_GROUP_ORDER) < 0 // < G
}

function isPoint (p) {
  if (!Buffer.isBuffer(p)) return false
  if (p.length < 33) return false

  const t = p[0]
  const x = p.slice(1, 33)
  if (x.compare(ZERO32) === 0) return false
  if (x.compare(EC_P) >= 0) return false
  if ((t === 0x02 || t === 0x03) && p.length === 33) {
    try { decodeFrom(p) } catch (e) { return false } // TODO: temporary
    return true
  }

  const y = p.slice(33)
  if (y.compare(ZERO32) === 0) return false
  if (y.compare(EC_P) >= 0) return false
  if (t === 0x04 && p.length === 65) return true
  return false
}

function __isPointCompressed (p) {
  return p[0] !== 0x04
}

function isPointCompressed (p) {
  if (!isPoint(p)) return false
  return __isPointCompressed(p)
}

function isPrivate (x) {
  if (!isScalar(x)) return false
  return x.compare(ZERO32) > 0 && // > 0
    x.compare(EC_GROUP_ORDER) < 0 // < G
}

function isSignature (value) {
  const r = value.slice(0, 32)
  const s = value.slice(32, 64)
  return Buffer.isBuffer(value) && value.length === 64 &&
    r.compare(EC_GROUP_ORDER) < 0 &&
    s.compare(EC_GROUP_ORDER) < 0
}

function assumeCompression (value, pubkey) {
  if (value === undefined && pubkey !== undefined) return __isPointCompressed(pubkey)
  if (value === undefined) return true
  return value
}

function fromBuffer (d) { return new BN(d) }
function toBuffer (d) { return d.toArrayLike(Buffer, 'be', 32) }
function decodeFrom (P) { return secp256k1.curve.decodePoint(P) }
function getEncoded (P, compressed) { return Buffer.from(P._encode(compressed)) }

function pointAdd (pA, pB, __compressed) {
  if (!isPoint(pA)) throw new TypeError(THROW_BAD_POINT)
  if (!isPoint(pB)) throw new TypeError(THROW_BAD_POINT)

  const a = decodeFrom(pA)
  const b = decodeFrom(pB)
  const pp = a.add(b)
  if (pp.isInfinity()) return null

  const compressed = assumeCompression(__compressed, pA)
  return getEncoded(pp, compressed)
}

function pointAddScalar (p, tweak, __compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const compressed = assumeCompression(__compressed, p)
  const pp = decodeFrom(p)
  if (tweak.compare(ZERO32) === 0) return getEncoded(pp, compressed)

  const tt = fromBuffer(tweak)
  const qq = G.mul(tt)
  const uu = pp.add(qq)
  if (uu.isInfinity()) return null

  return getEncoded(uu, compressed)
}

function pointCompress (p, __compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)

  const pp = decodeFrom(p)
  if (pp.isInfinity()) throw new TypeError(THROW_BAD_POINT)

  const compressed = assumeCompression(__compressed, p)

  return getEncoded(pp, compressed)
}

function pointFromScalar (d, __compressed) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)

  const dd = fromBuffer(d)
  const pp = G.mul(dd)
  if (pp.isInfinity()) return null

  const compressed = assumeCompression(__compressed)
  return getEncoded(pp, compressed)
}

function pointMultiply (p, tweak, __compressed) {
  if (!isPoint(p)) throw new TypeError(THROW_BAD_POINT)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const compressed = assumeCompression(__compressed, p)
  const pp = decodeFrom(p)
  const tt = fromBuffer(tweak)
  const qq = pp.mul(tt)
  if (qq.isInfinity()) return null

  return getEncoded(qq, compressed)
}

function privateAdd (d, tweak) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const dd = fromBuffer(d)
  const tt = fromBuffer(tweak)
  const dt = toBuffer(dd.add(tt).umod(n))
  if (!isPrivate(dt)) return null

  return dt
}

function privateSub (d, tweak) {
  if (!isPrivate(d)) throw new TypeError(THROW_BAD_PRIVATE)
  if (!isOrderScalar(tweak)) throw new TypeError(THROW_BAD_TWEAK)

  const dd = fromBuffer(d)
  const tt = fromBuffer(tweak)
  const dt = toBuffer(dd.sub(tt).umod(n))
  if (!isPrivate(dt)) return null

  return dt
}

function sign (hash, x) {
  return __sign(hash, x)
}

function signWithEntropy (hash, x, addData) {
  return __sign(hash, x, addData)
}

function __sign (hash, x, addData) {
  if (!isScalar(hash)) throw new TypeError(THROW_BAD_HASH)
  if (!isPrivate(x)) throw new TypeError(THROW_BAD_PRIVATE)
  if (addData !== undefined && !isScalar(addData)) throw new TypeError(THROW_BAD_EXTRA_DATA)

  const d = fromBuffer(x)
  const e = fromBuffer(hash)

  let r, s
  const checkSig = function (k) {
    const kI = fromBuffer(k)
    const Q = G.mul(kI)

    if (Q.isInfinity()) return false

    r = Q.x.umod(n)
    if (r.isZero() === 0) return false

    s = kI
      .invm(n)
      .mul(e.add(d.mul(r)))
      .umod(n)
    if (s.isZero() === 0) return false

    return true
  }

  deterministicGenerateK(hash, x, checkSig, isPrivate, addData)

  // enforce low S values, see bip62: 'low s values in signatures'
  if (s.cmp(nDiv2) > 0) {
    s = n.sub(s)
  }

  const buffer = Buffer.allocUnsafe(64)
  toBuffer(r).copy(buffer, 0)
  toBuffer(s).copy(buffer, 32)
  return buffer
}

function verify (hash, q, signature, strict) {
  if (!isScalar(hash)) throw new TypeError(THROW_BAD_HASH)
  if (!isPoint(q)) throw new TypeError(THROW_BAD_POINT)

  // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1] (1, isSignature enforces '< n - 1')
  if (!isSignature(signature)) throw new TypeError(THROW_BAD_SIGNATURE)

  const Q = decodeFrom(q)
  const r = fromBuffer(signature.slice(0, 32))
  const s = fromBuffer(signature.slice(32, 64))

  if (strict && s.cmp(nDiv2) > 0) {
    return false
  }

  // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1] (2, enforces '> 0')
  if (r.gtn(0) <= 0 /* || r.compareTo(n) >= 0 */) return false
  if (s.gtn(0) <= 0 /* || s.compareTo(n) >= 0 */) return false

  // 1.4.2 H = Hash(M), already done by the user
  // 1.4.3 e = H
  const e = fromBuffer(hash)

  // Compute s^-1
  const sInv = s.invm(n)

  // 1.4.4 Compute u1 = es^−1 mod n
  //               u2 = rs^−1 mod n
  const u1 = e.mul(sInv).umod(n)
  const u2 = r.mul(sInv).umod(n)

  // 1.4.5 Compute R = (xR, yR)
  //               R = u1G + u2Q
  const R = G.mulAdd(u1, Q, u2)

  // 1.4.5 (cont.) Enforce R is not at infinity
  if (R.isInfinity()) return false

  // 1.4.6 Convert the field element R.x to an integer
  const xR = R.x

  // 1.4.7 Set v = xR mod n
  const v = xR.umod(n)

  // 1.4.8 If v = r, output "valid", and if v != r, output "invalid"
  return v.eq(r)
}

module.exports = {
  isPoint,
  isPointCompressed,
  isPrivate,
  pointAdd,
  pointAddScalar,
  pointCompress,
  pointFromScalar,
  pointMultiply,
  privateAdd,
  privateSub,
  sign,
  signWithEntropy,
  verify
}

}).call(this)}).call(this,require("buffer").Buffer)

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>tiny-secp256k1",file:"node_modules\\tiny-secp256k1\\js.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\tiny-secp256k1\\rfc6979.js", {"buffer":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\buffer\\index.js","create-hmac":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\create-hmac\\browser.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctiny-secp256k1%5Crfc6979.js
      return function (require, module, exports) {
(function (Buffer){(function (){
const createHmac = require('create-hmac')

const ONE1 = Buffer.alloc(1, 1)
const ZERO1 = Buffer.alloc(1, 0)

// https://tools.ietf.org/html/rfc6979#section-3.2
function deterministicGenerateK (hash, x, checkSig, isPrivate, extraEntropy) {
  // Step A, ignored as hash already provided
  // Step B
  // Step C
  let k = Buffer.alloc(32, 0)
  let v = Buffer.alloc(32, 1)

  // Step D
  k = createHmac('sha256', k)
    .update(v)
    .update(ZERO1)
    .update(x)
    .update(hash)
    .update(extraEntropy || '')
    .digest()

  // Step E
  v = createHmac('sha256', k).update(v).digest()

  // Step F
  k = createHmac('sha256', k)
    .update(v)
    .update(ONE1)
    .update(x)
    .update(hash)
    .update(extraEntropy || '')
    .digest()

  // Step G
  v = createHmac('sha256', k).update(v).digest()

  // Step H1/H2a, ignored as tlen === qlen (256 bit)
  // Step H2b
  v = createHmac('sha256', k).update(v).digest()

  let T = v

  // Step H3, repeat until T is within the interval [1, n - 1] and is suitable for ECDSA
  while (!isPrivate(T) || !checkSig(T)) {
    k = createHmac('sha256', k)
      .update(v)
      .update(ZERO1)
      .digest()

    v = createHmac('sha256', k).update(v).digest()

    // Step H1/H2a, again, ignored as tlen === qlen (256 bit)
    // Step H2b again
    v = createHmac('sha256', k).update(v).digest()
    T = v
  }

  return T
}

module.exports = deterministicGenerateK

}).call(this)}).call(this,require("buffer").Buffer)

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>tiny-secp256k1",file:"node_modules\\tiny-secp256k1\\rfc6979.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\to-data-view\\index.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cto-data-view%5Cindex.js
      return function (require, module, exports) {
module.exports = function toDataView (data) {
  if (data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    return new DataView(data.buffer, data.byteOffset, data.byteLength)
  }

  if (data instanceof ArrayBuffer) {
    return new DataView(data)
  }

  throw new TypeError('Expected `data` to be an ArrayBuffer, Buffer, Int8Array, Uint8Array or Uint8ClampedArray')
}

      };
    };
  }
  }
}, {package:"base32-encode>to-data-view",file:"node_modules\\to-data-view\\index.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\tweetnacl-util\\nacl-util.js", {"buffer":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\browser-resolve\\empty.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctweetnacl-util%5Cnacl-util.js
      return function (require, module, exports) {
(function (Buffer){(function (){
// Written in 2014-2016 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
(function(root, f) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = f();
  else if (root.nacl) root.nacl.util = f();
  else {
    root.nacl = {};
    root.nacl.util = f();
  }
}(this, function() {
  'use strict';

  var util = {};

  function validateBase64(s) {
    if (!(/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s))) {
      throw new TypeError('invalid encoding');
    }
  }

  util.decodeUTF8 = function(s) {
    if (typeof s !== 'string') throw new TypeError('expected string');
    var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
    for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
    return b;
  };

  util.encodeUTF8 = function(arr) {
    var i, s = [];
    for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
    return decodeURIComponent(escape(s.join('')));
  };

  if (typeof atob === 'undefined') {
    // Node.js

    if (typeof Buffer.from !== 'undefined') {
       // Node v6 and later
      util.encodeBase64 = function (arr) { // v6 and later
          return Buffer.from(arr).toString('base64');
      };

      util.decodeBase64 = function (s) {
        validateBase64(s);
        return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, 'base64'), 0));
      };

    } else {
      // Node earlier than v6
      util.encodeBase64 = function (arr) { // v6 and later
        return (new Buffer(arr)).toString('base64');
      };

      util.decodeBase64 = function(s) {
        validateBase64(s);
        return new Uint8Array(Array.prototype.slice.call(new Buffer(s, 'base64'), 0));
      };
    }

  } else {
    // Browsers

    util.encodeBase64 = function(arr) {
      var i, s = [], len = arr.length;
      for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
      return btoa(s.join(''));
    };

    util.decodeBase64 = function(s) {
      validateBase64(s);
      var i, d = atob(s), b = new Uint8Array(d.length);
      for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
      return b;
    };

  }

  return util;

}));

}).call(this)}).call(this,require("buffer").Buffer)

      };
    };
  }
  }
}, {package:"eth-sig-util>tweetnacl-util",file:"node_modules\\tweetnacl-util\\nacl-util.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\tweetnacl\\nacl-fast.js", {"crypto":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\browser-resolve\\empty.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctweetnacl%5Cnacl-fast.js
      return function (require, module, exports) {
(function(nacl) {
'use strict';

// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

var gf = function(init) {
  var i, r = new Float64Array(16);
  if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
  return r;
};

//  Pluggable, initialized in high-level API below.
var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

var _0 = new Uint8Array(16);
var _9 = new Uint8Array(32); _9[0] = 9;

var gf0 = gf(),
    gf1 = gf([1]),
    _121665 = gf([0xdb41, 1]),
    D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
    D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
    X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
    Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
    I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

function ts64(x, i, h, l) {
  x[i]   = (h >> 24) & 0xff;
  x[i+1] = (h >> 16) & 0xff;
  x[i+2] = (h >>  8) & 0xff;
  x[i+3] = h & 0xff;
  x[i+4] = (l >> 24)  & 0xff;
  x[i+5] = (l >> 16)  & 0xff;
  x[i+6] = (l >>  8)  & 0xff;
  x[i+7] = l & 0xff;
}

function vn(x, xi, y, yi, n) {
  var i,d = 0;
  for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
  return (1 & ((d - 1) >>> 8)) - 1;
}

function crypto_verify_16(x, xi, y, yi) {
  return vn(x,xi,y,yi,16);
}

function crypto_verify_32(x, xi, y, yi) {
  return vn(x,xi,y,yi,32);
}

function core_salsa20(o, p, k, c) {
  var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
      j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
      j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
      j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
      j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
      j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
      j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
      j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
      j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
      j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
      j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
      j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
      j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
      j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
      j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
      j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

  var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
      x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
      x15 = j15, u;

  for (var i = 0; i < 20; i += 2) {
    u = x0 + x12 | 0;
    x4 ^= u<<7 | u>>>(32-7);
    u = x4 + x0 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x4 | 0;
    x12 ^= u<<13 | u>>>(32-13);
    u = x12 + x8 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x1 | 0;
    x9 ^= u<<7 | u>>>(32-7);
    u = x9 + x5 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x9 | 0;
    x1 ^= u<<13 | u>>>(32-13);
    u = x1 + x13 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x6 | 0;
    x14 ^= u<<7 | u>>>(32-7);
    u = x14 + x10 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x14 | 0;
    x6 ^= u<<13 | u>>>(32-13);
    u = x6 + x2 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x11 | 0;
    x3 ^= u<<7 | u>>>(32-7);
    u = x3 + x15 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x3 | 0;
    x11 ^= u<<13 | u>>>(32-13);
    u = x11 + x7 | 0;
    x15 ^= u<<18 | u>>>(32-18);

    u = x0 + x3 | 0;
    x1 ^= u<<7 | u>>>(32-7);
    u = x1 + x0 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x1 | 0;
    x3 ^= u<<13 | u>>>(32-13);
    u = x3 + x2 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x4 | 0;
    x6 ^= u<<7 | u>>>(32-7);
    u = x6 + x5 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x6 | 0;
    x4 ^= u<<13 | u>>>(32-13);
    u = x4 + x7 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x9 | 0;
    x11 ^= u<<7 | u>>>(32-7);
    u = x11 + x10 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x11 | 0;
    x9 ^= u<<13 | u>>>(32-13);
    u = x9 + x8 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x14 | 0;
    x12 ^= u<<7 | u>>>(32-7);
    u = x12 + x15 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x12 | 0;
    x14 ^= u<<13 | u>>>(32-13);
    u = x14 + x13 | 0;
    x15 ^= u<<18 | u>>>(32-18);
  }
   x0 =  x0 +  j0 | 0;
   x1 =  x1 +  j1 | 0;
   x2 =  x2 +  j2 | 0;
   x3 =  x3 +  j3 | 0;
   x4 =  x4 +  j4 | 0;
   x5 =  x5 +  j5 | 0;
   x6 =  x6 +  j6 | 0;
   x7 =  x7 +  j7 | 0;
   x8 =  x8 +  j8 | 0;
   x9 =  x9 +  j9 | 0;
  x10 = x10 + j10 | 0;
  x11 = x11 + j11 | 0;
  x12 = x12 + j12 | 0;
  x13 = x13 + j13 | 0;
  x14 = x14 + j14 | 0;
  x15 = x15 + j15 | 0;

  o[ 0] = x0 >>>  0 & 0xff;
  o[ 1] = x0 >>>  8 & 0xff;
  o[ 2] = x0 >>> 16 & 0xff;
  o[ 3] = x0 >>> 24 & 0xff;

  o[ 4] = x1 >>>  0 & 0xff;
  o[ 5] = x1 >>>  8 & 0xff;
  o[ 6] = x1 >>> 16 & 0xff;
  o[ 7] = x1 >>> 24 & 0xff;

  o[ 8] = x2 >>>  0 & 0xff;
  o[ 9] = x2 >>>  8 & 0xff;
  o[10] = x2 >>> 16 & 0xff;
  o[11] = x2 >>> 24 & 0xff;

  o[12] = x3 >>>  0 & 0xff;
  o[13] = x3 >>>  8 & 0xff;
  o[14] = x3 >>> 16 & 0xff;
  o[15] = x3 >>> 24 & 0xff;

  o[16] = x4 >>>  0 & 0xff;
  o[17] = x4 >>>  8 & 0xff;
  o[18] = x4 >>> 16 & 0xff;
  o[19] = x4 >>> 24 & 0xff;

  o[20] = x5 >>>  0 & 0xff;
  o[21] = x5 >>>  8 & 0xff;
  o[22] = x5 >>> 16 & 0xff;
  o[23] = x5 >>> 24 & 0xff;

  o[24] = x6 >>>  0 & 0xff;
  o[25] = x6 >>>  8 & 0xff;
  o[26] = x6 >>> 16 & 0xff;
  o[27] = x6 >>> 24 & 0xff;

  o[28] = x7 >>>  0 & 0xff;
  o[29] = x7 >>>  8 & 0xff;
  o[30] = x7 >>> 16 & 0xff;
  o[31] = x7 >>> 24 & 0xff;

  o[32] = x8 >>>  0 & 0xff;
  o[33] = x8 >>>  8 & 0xff;
  o[34] = x8 >>> 16 & 0xff;
  o[35] = x8 >>> 24 & 0xff;

  o[36] = x9 >>>  0 & 0xff;
  o[37] = x9 >>>  8 & 0xff;
  o[38] = x9 >>> 16 & 0xff;
  o[39] = x9 >>> 24 & 0xff;

  o[40] = x10 >>>  0 & 0xff;
  o[41] = x10 >>>  8 & 0xff;
  o[42] = x10 >>> 16 & 0xff;
  o[43] = x10 >>> 24 & 0xff;

  o[44] = x11 >>>  0 & 0xff;
  o[45] = x11 >>>  8 & 0xff;
  o[46] = x11 >>> 16 & 0xff;
  o[47] = x11 >>> 24 & 0xff;

  o[48] = x12 >>>  0 & 0xff;
  o[49] = x12 >>>  8 & 0xff;
  o[50] = x12 >>> 16 & 0xff;
  o[51] = x12 >>> 24 & 0xff;

  o[52] = x13 >>>  0 & 0xff;
  o[53] = x13 >>>  8 & 0xff;
  o[54] = x13 >>> 16 & 0xff;
  o[55] = x13 >>> 24 & 0xff;

  o[56] = x14 >>>  0 & 0xff;
  o[57] = x14 >>>  8 & 0xff;
  o[58] = x14 >>> 16 & 0xff;
  o[59] = x14 >>> 24 & 0xff;

  o[60] = x15 >>>  0 & 0xff;
  o[61] = x15 >>>  8 & 0xff;
  o[62] = x15 >>> 16 & 0xff;
  o[63] = x15 >>> 24 & 0xff;
}

function core_hsalsa20(o,p,k,c) {
  var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
      j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
      j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
      j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
      j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
      j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
      j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
      j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
      j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
      j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
      j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
      j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
      j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
      j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
      j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
      j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

  var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
      x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
      x15 = j15, u;

  for (var i = 0; i < 20; i += 2) {
    u = x0 + x12 | 0;
    x4 ^= u<<7 | u>>>(32-7);
    u = x4 + x0 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x4 | 0;
    x12 ^= u<<13 | u>>>(32-13);
    u = x12 + x8 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x1 | 0;
    x9 ^= u<<7 | u>>>(32-7);
    u = x9 + x5 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x9 | 0;
    x1 ^= u<<13 | u>>>(32-13);
    u = x1 + x13 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x6 | 0;
    x14 ^= u<<7 | u>>>(32-7);
    u = x14 + x10 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x14 | 0;
    x6 ^= u<<13 | u>>>(32-13);
    u = x6 + x2 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x11 | 0;
    x3 ^= u<<7 | u>>>(32-7);
    u = x3 + x15 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x3 | 0;
    x11 ^= u<<13 | u>>>(32-13);
    u = x11 + x7 | 0;
    x15 ^= u<<18 | u>>>(32-18);

    u = x0 + x3 | 0;
    x1 ^= u<<7 | u>>>(32-7);
    u = x1 + x0 | 0;
    x2 ^= u<<9 | u>>>(32-9);
    u = x2 + x1 | 0;
    x3 ^= u<<13 | u>>>(32-13);
    u = x3 + x2 | 0;
    x0 ^= u<<18 | u>>>(32-18);

    u = x5 + x4 | 0;
    x6 ^= u<<7 | u>>>(32-7);
    u = x6 + x5 | 0;
    x7 ^= u<<9 | u>>>(32-9);
    u = x7 + x6 | 0;
    x4 ^= u<<13 | u>>>(32-13);
    u = x4 + x7 | 0;
    x5 ^= u<<18 | u>>>(32-18);

    u = x10 + x9 | 0;
    x11 ^= u<<7 | u>>>(32-7);
    u = x11 + x10 | 0;
    x8 ^= u<<9 | u>>>(32-9);
    u = x8 + x11 | 0;
    x9 ^= u<<13 | u>>>(32-13);
    u = x9 + x8 | 0;
    x10 ^= u<<18 | u>>>(32-18);

    u = x15 + x14 | 0;
    x12 ^= u<<7 | u>>>(32-7);
    u = x12 + x15 | 0;
    x13 ^= u<<9 | u>>>(32-9);
    u = x13 + x12 | 0;
    x14 ^= u<<13 | u>>>(32-13);
    u = x14 + x13 | 0;
    x15 ^= u<<18 | u>>>(32-18);
  }

  o[ 0] = x0 >>>  0 & 0xff;
  o[ 1] = x0 >>>  8 & 0xff;
  o[ 2] = x0 >>> 16 & 0xff;
  o[ 3] = x0 >>> 24 & 0xff;

  o[ 4] = x5 >>>  0 & 0xff;
  o[ 5] = x5 >>>  8 & 0xff;
  o[ 6] = x5 >>> 16 & 0xff;
  o[ 7] = x5 >>> 24 & 0xff;

  o[ 8] = x10 >>>  0 & 0xff;
  o[ 9] = x10 >>>  8 & 0xff;
  o[10] = x10 >>> 16 & 0xff;
  o[11] = x10 >>> 24 & 0xff;

  o[12] = x15 >>>  0 & 0xff;
  o[13] = x15 >>>  8 & 0xff;
  o[14] = x15 >>> 16 & 0xff;
  o[15] = x15 >>> 24 & 0xff;

  o[16] = x6 >>>  0 & 0xff;
  o[17] = x6 >>>  8 & 0xff;
  o[18] = x6 >>> 16 & 0xff;
  o[19] = x6 >>> 24 & 0xff;

  o[20] = x7 >>>  0 & 0xff;
  o[21] = x7 >>>  8 & 0xff;
  o[22] = x7 >>> 16 & 0xff;
  o[23] = x7 >>> 24 & 0xff;

  o[24] = x8 >>>  0 & 0xff;
  o[25] = x8 >>>  8 & 0xff;
  o[26] = x8 >>> 16 & 0xff;
  o[27] = x8 >>> 24 & 0xff;

  o[28] = x9 >>>  0 & 0xff;
  o[29] = x9 >>>  8 & 0xff;
  o[30] = x9 >>> 16 & 0xff;
  o[31] = x9 >>> 24 & 0xff;
}

function crypto_core_salsa20(out,inp,k,c) {
  core_salsa20(out,inp,k,c);
}

function crypto_core_hsalsa20(out,inp,k,c) {
  core_hsalsa20(out,inp,k,c);
}

var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
            // "expand 32-byte k"

function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
  var z = new Uint8Array(16), x = new Uint8Array(64);
  var u, i;
  for (i = 0; i < 16; i++) z[i] = 0;
  for (i = 0; i < 8; i++) z[i] = n[i];
  while (b >= 64) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
    u = 1;
    for (i = 8; i < 16; i++) {
      u = u + (z[i] & 0xff) | 0;
      z[i] = u & 0xff;
      u >>>= 8;
    }
    b -= 64;
    cpos += 64;
    mpos += 64;
  }
  if (b > 0) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
  }
  return 0;
}

function crypto_stream_salsa20(c,cpos,b,n,k) {
  var z = new Uint8Array(16), x = new Uint8Array(64);
  var u, i;
  for (i = 0; i < 16; i++) z[i] = 0;
  for (i = 0; i < 8; i++) z[i] = n[i];
  while (b >= 64) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < 64; i++) c[cpos+i] = x[i];
    u = 1;
    for (i = 8; i < 16; i++) {
      u = u + (z[i] & 0xff) | 0;
      z[i] = u & 0xff;
      u >>>= 8;
    }
    b -= 64;
    cpos += 64;
  }
  if (b > 0) {
    crypto_core_salsa20(x,z,k,sigma);
    for (i = 0; i < b; i++) c[cpos+i] = x[i];
  }
  return 0;
}

function crypto_stream(c,cpos,d,n,k) {
  var s = new Uint8Array(32);
  crypto_core_hsalsa20(s,n,k,sigma);
  var sn = new Uint8Array(8);
  for (var i = 0; i < 8; i++) sn[i] = n[i+16];
  return crypto_stream_salsa20(c,cpos,d,sn,s);
}

function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
  var s = new Uint8Array(32);
  crypto_core_hsalsa20(s,n,k,sigma);
  var sn = new Uint8Array(8);
  for (var i = 0; i < 8; i++) sn[i] = n[i+16];
  return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
}

/*
* Port of Andrew Moon's Poly1305-donna-16. Public domain.
* https://github.com/floodyberry/poly1305-donna
*/

var poly1305 = function(key) {
  this.buffer = new Uint8Array(16);
  this.r = new Uint16Array(10);
  this.h = new Uint16Array(10);
  this.pad = new Uint16Array(8);
  this.leftover = 0;
  this.fin = 0;

  var t0, t1, t2, t3, t4, t5, t6, t7;

  t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
  t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
  t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
  t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
  t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
  this.r[5] = ((t4 >>>  1)) & 0x1ffe;
  t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
  t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
  t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
  this.r[9] = ((t7 >>>  5)) & 0x007f;

  this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
  this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
  this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
  this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
  this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
  this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
  this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
  this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
};

poly1305.prototype.blocks = function(m, mpos, bytes) {
  var hibit = this.fin ? 0 : (1 << 11);
  var t0, t1, t2, t3, t4, t5, t6, t7, c;
  var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;

  var h0 = this.h[0],
      h1 = this.h[1],
      h2 = this.h[2],
      h3 = this.h[3],
      h4 = this.h[4],
      h5 = this.h[5],
      h6 = this.h[6],
      h7 = this.h[7],
      h8 = this.h[8],
      h9 = this.h[9];

  var r0 = this.r[0],
      r1 = this.r[1],
      r2 = this.r[2],
      r3 = this.r[3],
      r4 = this.r[4],
      r5 = this.r[5],
      r6 = this.r[6],
      r7 = this.r[7],
      r8 = this.r[8],
      r9 = this.r[9];

  while (bytes >= 16) {
    t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
    t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
    t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
    t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
    t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
    h5 += ((t4 >>>  1)) & 0x1fff;
    t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
    t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
    t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
    h9 += ((t7 >>> 5)) | hibit;

    c = 0;

    d0 = c;
    d0 += h0 * r0;
    d0 += h1 * (5 * r9);
    d0 += h2 * (5 * r8);
    d0 += h3 * (5 * r7);
    d0 += h4 * (5 * r6);
    c = (d0 >>> 13); d0 &= 0x1fff;
    d0 += h5 * (5 * r5);
    d0 += h6 * (5 * r4);
    d0 += h7 * (5 * r3);
    d0 += h8 * (5 * r2);
    d0 += h9 * (5 * r1);
    c += (d0 >>> 13); d0 &= 0x1fff;

    d1 = c;
    d1 += h0 * r1;
    d1 += h1 * r0;
    d1 += h2 * (5 * r9);
    d1 += h3 * (5 * r8);
    d1 += h4 * (5 * r7);
    c = (d1 >>> 13); d1 &= 0x1fff;
    d1 += h5 * (5 * r6);
    d1 += h6 * (5 * r5);
    d1 += h7 * (5 * r4);
    d1 += h8 * (5 * r3);
    d1 += h9 * (5 * r2);
    c += (d1 >>> 13); d1 &= 0x1fff;

    d2 = c;
    d2 += h0 * r2;
    d2 += h1 * r1;
    d2 += h2 * r0;
    d2 += h3 * (5 * r9);
    d2 += h4 * (5 * r8);
    c = (d2 >>> 13); d2 &= 0x1fff;
    d2 += h5 * (5 * r7);
    d2 += h6 * (5 * r6);
    d2 += h7 * (5 * r5);
    d2 += h8 * (5 * r4);
    d2 += h9 * (5 * r3);
    c += (d2 >>> 13); d2 &= 0x1fff;

    d3 = c;
    d3 += h0 * r3;
    d3 += h1 * r2;
    d3 += h2 * r1;
    d3 += h3 * r0;
    d3 += h4 * (5 * r9);
    c = (d3 >>> 13); d3 &= 0x1fff;
    d3 += h5 * (5 * r8);
    d3 += h6 * (5 * r7);
    d3 += h7 * (5 * r6);
    d3 += h8 * (5 * r5);
    d3 += h9 * (5 * r4);
    c += (d3 >>> 13); d3 &= 0x1fff;

    d4 = c;
    d4 += h0 * r4;
    d4 += h1 * r3;
    d4 += h2 * r2;
    d4 += h3 * r1;
    d4 += h4 * r0;
    c = (d4 >>> 13); d4 &= 0x1fff;
    d4 += h5 * (5 * r9);
    d4 += h6 * (5 * r8);
    d4 += h7 * (5 * r7);
    d4 += h8 * (5 * r6);
    d4 += h9 * (5 * r5);
    c += (d4 >>> 13); d4 &= 0x1fff;

    d5 = c;
    d5 += h0 * r5;
    d5 += h1 * r4;
    d5 += h2 * r3;
    d5 += h3 * r2;
    d5 += h4 * r1;
    c = (d5 >>> 13); d5 &= 0x1fff;
    d5 += h5 * r0;
    d5 += h6 * (5 * r9);
    d5 += h7 * (5 * r8);
    d5 += h8 * (5 * r7);
    d5 += h9 * (5 * r6);
    c += (d5 >>> 13); d5 &= 0x1fff;

    d6 = c;
    d6 += h0 * r6;
    d6 += h1 * r5;
    d6 += h2 * r4;
    d6 += h3 * r3;
    d6 += h4 * r2;
    c = (d6 >>> 13); d6 &= 0x1fff;
    d6 += h5 * r1;
    d6 += h6 * r0;
    d6 += h7 * (5 * r9);
    d6 += h8 * (5 * r8);
    d6 += h9 * (5 * r7);
    c += (d6 >>> 13); d6 &= 0x1fff;

    d7 = c;
    d7 += h0 * r7;
    d7 += h1 * r6;
    d7 += h2 * r5;
    d7 += h3 * r4;
    d7 += h4 * r3;
    c = (d7 >>> 13); d7 &= 0x1fff;
    d7 += h5 * r2;
    d7 += h6 * r1;
    d7 += h7 * r0;
    d7 += h8 * (5 * r9);
    d7 += h9 * (5 * r8);
    c += (d7 >>> 13); d7 &= 0x1fff;

    d8 = c;
    d8 += h0 * r8;
    d8 += h1 * r7;
    d8 += h2 * r6;
    d8 += h3 * r5;
    d8 += h4 * r4;
    c = (d8 >>> 13); d8 &= 0x1fff;
    d8 += h5 * r3;
    d8 += h6 * r2;
    d8 += h7 * r1;
    d8 += h8 * r0;
    d8 += h9 * (5 * r9);
    c += (d8 >>> 13); d8 &= 0x1fff;

    d9 = c;
    d9 += h0 * r9;
    d9 += h1 * r8;
    d9 += h2 * r7;
    d9 += h3 * r6;
    d9 += h4 * r5;
    c = (d9 >>> 13); d9 &= 0x1fff;
    d9 += h5 * r4;
    d9 += h6 * r3;
    d9 += h7 * r2;
    d9 += h8 * r1;
    d9 += h9 * r0;
    c += (d9 >>> 13); d9 &= 0x1fff;

    c = (((c << 2) + c)) | 0;
    c = (c + d0) | 0;
    d0 = c & 0x1fff;
    c = (c >>> 13);
    d1 += c;

    h0 = d0;
    h1 = d1;
    h2 = d2;
    h3 = d3;
    h4 = d4;
    h5 = d5;
    h6 = d6;
    h7 = d7;
    h8 = d8;
    h9 = d9;

    mpos += 16;
    bytes -= 16;
  }
  this.h[0] = h0;
  this.h[1] = h1;
  this.h[2] = h2;
  this.h[3] = h3;
  this.h[4] = h4;
  this.h[5] = h5;
  this.h[6] = h6;
  this.h[7] = h7;
  this.h[8] = h8;
  this.h[9] = h9;
};

poly1305.prototype.finish = function(mac, macpos) {
  var g = new Uint16Array(10);
  var c, mask, f, i;

  if (this.leftover) {
    i = this.leftover;
    this.buffer[i++] = 1;
    for (; i < 16; i++) this.buffer[i] = 0;
    this.fin = 1;
    this.blocks(this.buffer, 0, 16);
  }

  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  for (i = 2; i < 10; i++) {
    this.h[i] += c;
    c = this.h[i] >>> 13;
    this.h[i] &= 0x1fff;
  }
  this.h[0] += (c * 5);
  c = this.h[0] >>> 13;
  this.h[0] &= 0x1fff;
  this.h[1] += c;
  c = this.h[1] >>> 13;
  this.h[1] &= 0x1fff;
  this.h[2] += c;

  g[0] = this.h[0] + 5;
  c = g[0] >>> 13;
  g[0] &= 0x1fff;
  for (i = 1; i < 10; i++) {
    g[i] = this.h[i] + c;
    c = g[i] >>> 13;
    g[i] &= 0x1fff;
  }
  g[9] -= (1 << 13);

  mask = (c ^ 1) - 1;
  for (i = 0; i < 10; i++) g[i] &= mask;
  mask = ~mask;
  for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];

  this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
  this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
  this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
  this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
  this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
  this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
  this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
  this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;

  f = this.h[0] + this.pad[0];
  this.h[0] = f & 0xffff;
  for (i = 1; i < 8; i++) {
    f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
    this.h[i] = f & 0xffff;
  }

  mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
  mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
  mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
  mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
  mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
  mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
  mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
  mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
  mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
  mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
  mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
  mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
  mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
  mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
  mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
  mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
};

poly1305.prototype.update = function(m, mpos, bytes) {
  var i, want;

  if (this.leftover) {
    want = (16 - this.leftover);
    if (want > bytes)
      want = bytes;
    for (i = 0; i < want; i++)
      this.buffer[this.leftover + i] = m[mpos+i];
    bytes -= want;
    mpos += want;
    this.leftover += want;
    if (this.leftover < 16)
      return;
    this.blocks(this.buffer, 0, 16);
    this.leftover = 0;
  }

  if (bytes >= 16) {
    want = bytes - (bytes % 16);
    this.blocks(m, mpos, want);
    mpos += want;
    bytes -= want;
  }

  if (bytes) {
    for (i = 0; i < bytes; i++)
      this.buffer[this.leftover + i] = m[mpos+i];
    this.leftover += bytes;
  }
};

function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
  var s = new poly1305(k);
  s.update(m, mpos, n);
  s.finish(out, outpos);
  return 0;
}

function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
  var x = new Uint8Array(16);
  crypto_onetimeauth(x,0,m,mpos,n,k);
  return crypto_verify_16(h,hpos,x,0);
}

function crypto_secretbox(c,m,d,n,k) {
  var i;
  if (d < 32) return -1;
  crypto_stream_xor(c,0,m,0,d,n,k);
  crypto_onetimeauth(c, 16, c, 32, d - 32, c);
  for (i = 0; i < 16; i++) c[i] = 0;
  return 0;
}

function crypto_secretbox_open(m,c,d,n,k) {
  var i;
  var x = new Uint8Array(32);
  if (d < 32) return -1;
  crypto_stream(x,0,32,n,k);
  if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
  crypto_stream_xor(m,0,c,0,d,n,k);
  for (i = 0; i < 32; i++) m[i] = 0;
  return 0;
}

function set25519(r, a) {
  var i;
  for (i = 0; i < 16; i++) r[i] = a[i]|0;
}

function car25519(o) {
  var i, v, c = 1;
  for (i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c-1 + 37 * (c-1);
}

function sel25519(p, q, b) {
  var t, c = ~(b-1);
  for (var i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}

function pack25519(o, n) {
  var i, j, b;
  var m = gf(), t = gf();
  for (i = 0; i < 16; i++) t[i] = n[i];
  car25519(t);
  car25519(t);
  car25519(t);
  for (j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
      m[i-1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
    b = (m[15]>>16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1-b);
  }
  for (i = 0; i < 16; i++) {
    o[2*i] = t[i] & 0xff;
    o[2*i+1] = t[i]>>8;
  }
}

function neq25519(a, b) {
  var c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a);
  pack25519(d, b);
  return crypto_verify_32(c, 0, d, 0);
}

function par25519(a) {
  var d = new Uint8Array(32);
  pack25519(d, a);
  return d[0] & 1;
}

function unpack25519(o, n) {
  var i;
  for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
  o[15] &= 0x7fff;
}

function A(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
}

function Z(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
}

function M(o, a, b) {
  var v, c,
     t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
     t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
    t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
    t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
    b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11],
    b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];

  v = a[0];
  t0 += v * b0;
  t1 += v * b1;
  t2 += v * b2;
  t3 += v * b3;
  t4 += v * b4;
  t5 += v * b5;
  t6 += v * b6;
  t7 += v * b7;
  t8 += v * b8;
  t9 += v * b9;
  t10 += v * b10;
  t11 += v * b11;
  t12 += v * b12;
  t13 += v * b13;
  t14 += v * b14;
  t15 += v * b15;
  v = a[1];
  t1 += v * b0;
  t2 += v * b1;
  t3 += v * b2;
  t4 += v * b3;
  t5 += v * b4;
  t6 += v * b5;
  t7 += v * b6;
  t8 += v * b7;
  t9 += v * b8;
  t10 += v * b9;
  t11 += v * b10;
  t12 += v * b11;
  t13 += v * b12;
  t14 += v * b13;
  t15 += v * b14;
  t16 += v * b15;
  v = a[2];
  t2 += v * b0;
  t3 += v * b1;
  t4 += v * b2;
  t5 += v * b3;
  t6 += v * b4;
  t7 += v * b5;
  t8 += v * b6;
  t9 += v * b7;
  t10 += v * b8;
  t11 += v * b9;
  t12 += v * b10;
  t13 += v * b11;
  t14 += v * b12;
  t15 += v * b13;
  t16 += v * b14;
  t17 += v * b15;
  v = a[3];
  t3 += v * b0;
  t4 += v * b1;
  t5 += v * b2;
  t6 += v * b3;
  t7 += v * b4;
  t8 += v * b5;
  t9 += v * b6;
  t10 += v * b7;
  t11 += v * b8;
  t12 += v * b9;
  t13 += v * b10;
  t14 += v * b11;
  t15 += v * b12;
  t16 += v * b13;
  t17 += v * b14;
  t18 += v * b15;
  v = a[4];
  t4 += v * b0;
  t5 += v * b1;
  t6 += v * b2;
  t7 += v * b3;
  t8 += v * b4;
  t9 += v * b5;
  t10 += v * b6;
  t11 += v * b7;
  t12 += v * b8;
  t13 += v * b9;
  t14 += v * b10;
  t15 += v * b11;
  t16 += v * b12;
  t17 += v * b13;
  t18 += v * b14;
  t19 += v * b15;
  v = a[5];
  t5 += v * b0;
  t6 += v * b1;
  t7 += v * b2;
  t8 += v * b3;
  t9 += v * b4;
  t10 += v * b5;
  t11 += v * b6;
  t12 += v * b7;
  t13 += v * b8;
  t14 += v * b9;
  t15 += v * b10;
  t16 += v * b11;
  t17 += v * b12;
  t18 += v * b13;
  t19 += v * b14;
  t20 += v * b15;
  v = a[6];
  t6 += v * b0;
  t7 += v * b1;
  t8 += v * b2;
  t9 += v * b3;
  t10 += v * b4;
  t11 += v * b5;
  t12 += v * b6;
  t13 += v * b7;
  t14 += v * b8;
  t15 += v * b9;
  t16 += v * b10;
  t17 += v * b11;
  t18 += v * b12;
  t19 += v * b13;
  t20 += v * b14;
  t21 += v * b15;
  v = a[7];
  t7 += v * b0;
  t8 += v * b1;
  t9 += v * b2;
  t10 += v * b3;
  t11 += v * b4;
  t12 += v * b5;
  t13 += v * b6;
  t14 += v * b7;
  t15 += v * b8;
  t16 += v * b9;
  t17 += v * b10;
  t18 += v * b11;
  t19 += v * b12;
  t20 += v * b13;
  t21 += v * b14;
  t22 += v * b15;
  v = a[8];
  t8 += v * b0;
  t9 += v * b1;
  t10 += v * b2;
  t11 += v * b3;
  t12 += v * b4;
  t13 += v * b5;
  t14 += v * b6;
  t15 += v * b7;
  t16 += v * b8;
  t17 += v * b9;
  t18 += v * b10;
  t19 += v * b11;
  t20 += v * b12;
  t21 += v * b13;
  t22 += v * b14;
  t23 += v * b15;
  v = a[9];
  t9 += v * b0;
  t10 += v * b1;
  t11 += v * b2;
  t12 += v * b3;
  t13 += v * b4;
  t14 += v * b5;
  t15 += v * b6;
  t16 += v * b7;
  t17 += v * b8;
  t18 += v * b9;
  t19 += v * b10;
  t20 += v * b11;
  t21 += v * b12;
  t22 += v * b13;
  t23 += v * b14;
  t24 += v * b15;
  v = a[10];
  t10 += v * b0;
  t11 += v * b1;
  t12 += v * b2;
  t13 += v * b3;
  t14 += v * b4;
  t15 += v * b5;
  t16 += v * b6;
  t17 += v * b7;
  t18 += v * b8;
  t19 += v * b9;
  t20 += v * b10;
  t21 += v * b11;
  t22 += v * b12;
  t23 += v * b13;
  t24 += v * b14;
  t25 += v * b15;
  v = a[11];
  t11 += v * b0;
  t12 += v * b1;
  t13 += v * b2;
  t14 += v * b3;
  t15 += v * b4;
  t16 += v * b5;
  t17 += v * b6;
  t18 += v * b7;
  t19 += v * b8;
  t20 += v * b9;
  t21 += v * b10;
  t22 += v * b11;
  t23 += v * b12;
  t24 += v * b13;
  t25 += v * b14;
  t26 += v * b15;
  v = a[12];
  t12 += v * b0;
  t13 += v * b1;
  t14 += v * b2;
  t15 += v * b3;
  t16 += v * b4;
  t17 += v * b5;
  t18 += v * b6;
  t19 += v * b7;
  t20 += v * b8;
  t21 += v * b9;
  t22 += v * b10;
  t23 += v * b11;
  t24 += v * b12;
  t25 += v * b13;
  t26 += v * b14;
  t27 += v * b15;
  v = a[13];
  t13 += v * b0;
  t14 += v * b1;
  t15 += v * b2;
  t16 += v * b3;
  t17 += v * b4;
  t18 += v * b5;
  t19 += v * b6;
  t20 += v * b7;
  t21 += v * b8;
  t22 += v * b9;
  t23 += v * b10;
  t24 += v * b11;
  t25 += v * b12;
  t26 += v * b13;
  t27 += v * b14;
  t28 += v * b15;
  v = a[14];
  t14 += v * b0;
  t15 += v * b1;
  t16 += v * b2;
  t17 += v * b3;
  t18 += v * b4;
  t19 += v * b5;
  t20 += v * b6;
  t21 += v * b7;
  t22 += v * b8;
  t23 += v * b9;
  t24 += v * b10;
  t25 += v * b11;
  t26 += v * b12;
  t27 += v * b13;
  t28 += v * b14;
  t29 += v * b15;
  v = a[15];
  t15 += v * b0;
  t16 += v * b1;
  t17 += v * b2;
  t18 += v * b3;
  t19 += v * b4;
  t20 += v * b5;
  t21 += v * b6;
  t22 += v * b7;
  t23 += v * b8;
  t24 += v * b9;
  t25 += v * b10;
  t26 += v * b11;
  t27 += v * b12;
  t28 += v * b13;
  t29 += v * b14;
  t30 += v * b15;

  t0  += 38 * t16;
  t1  += 38 * t17;
  t2  += 38 * t18;
  t3  += 38 * t19;
  t4  += 38 * t20;
  t5  += 38 * t21;
  t6  += 38 * t22;
  t7  += 38 * t23;
  t8  += 38 * t24;
  t9  += 38 * t25;
  t10 += 38 * t26;
  t11 += 38 * t27;
  t12 += 38 * t28;
  t13 += 38 * t29;
  t14 += 38 * t30;
  // t15 left as is

  // first car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  // second car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  o[ 0] = t0;
  o[ 1] = t1;
  o[ 2] = t2;
  o[ 3] = t3;
  o[ 4] = t4;
  o[ 5] = t5;
  o[ 6] = t6;
  o[ 7] = t7;
  o[ 8] = t8;
  o[ 9] = t9;
  o[10] = t10;
  o[11] = t11;
  o[12] = t12;
  o[13] = t13;
  o[14] = t14;
  o[15] = t15;
}

function S(o, a) {
  M(o, a, a);
}

function inv25519(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 253; a >= 0; a--) {
    S(c, c);
    if(a !== 2 && a !== 4) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function pow2523(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 250; a >= 0; a--) {
      S(c, c);
      if(a !== 1) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function crypto_scalarmult(q, n, p) {
  var z = new Uint8Array(32);
  var x = new Float64Array(80), r, i;
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf();
  for (i = 0; i < 31; i++) z[i] = n[i];
  z[31]=(n[31]&127)|64;
  z[0]&=248;
  unpack25519(x,p);
  for (i = 0; i < 16; i++) {
    b[i]=x[i];
    d[i]=a[i]=c[i]=0;
  }
  a[0]=d[0]=1;
  for (i=254; i>=0; --i) {
    r=(z[i>>>3]>>>(i&7))&1;
    sel25519(a,b,r);
    sel25519(c,d,r);
    A(e,a,c);
    Z(a,a,c);
    A(c,b,d);
    Z(b,b,d);
    S(d,e);
    S(f,a);
    M(a,c,a);
    M(c,b,e);
    A(e,a,c);
    Z(a,a,c);
    S(b,a);
    Z(c,d,f);
    M(a,c,_121665);
    A(a,a,d);
    M(c,c,a);
    M(a,d,f);
    M(d,b,x);
    S(b,e);
    sel25519(a,b,r);
    sel25519(c,d,r);
  }
  for (i = 0; i < 16; i++) {
    x[i+16]=a[i];
    x[i+32]=c[i];
    x[i+48]=b[i];
    x[i+64]=d[i];
  }
  var x32 = x.subarray(32);
  var x16 = x.subarray(16);
  inv25519(x32,x32);
  M(x16,x16,x32);
  pack25519(q,x16);
  return 0;
}

function crypto_scalarmult_base(q, n) {
  return crypto_scalarmult(q, n, _9);
}

function crypto_box_keypair(y, x) {
  randombytes(x, 32);
  return crypto_scalarmult_base(y, x);
}

function crypto_box_beforenm(k, y, x) {
  var s = new Uint8Array(32);
  crypto_scalarmult(s, x, y);
  return crypto_core_hsalsa20(k, _0, s, sigma);
}

var crypto_box_afternm = crypto_secretbox;
var crypto_box_open_afternm = crypto_secretbox_open;

function crypto_box(c, m, d, n, y, x) {
  var k = new Uint8Array(32);
  crypto_box_beforenm(k, y, x);
  return crypto_box_afternm(c, m, d, n, k);
}

function crypto_box_open(m, c, d, n, y, x) {
  var k = new Uint8Array(32);
  crypto_box_beforenm(k, y, x);
  return crypto_box_open_afternm(m, c, d, n, k);
}

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function crypto_hashblocks_hl(hh, hl, m, n) {
  var wh = new Int32Array(16), wl = new Int32Array(16),
      bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
      bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
      th, tl, i, j, h, l, a, b, c, d;

  var ah0 = hh[0],
      ah1 = hh[1],
      ah2 = hh[2],
      ah3 = hh[3],
      ah4 = hh[4],
      ah5 = hh[5],
      ah6 = hh[6],
      ah7 = hh[7],

      al0 = hl[0],
      al1 = hl[1],
      al2 = hl[2],
      al3 = hl[3],
      al4 = hl[4],
      al5 = hl[5],
      al6 = hl[6],
      al7 = hl[7];

  var pos = 0;
  while (n >= 128) {
    for (i = 0; i < 16; i++) {
      j = 8 * i + pos;
      wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
      wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
    }
    for (i = 0; i < 80; i++) {
      bh0 = ah0;
      bh1 = ah1;
      bh2 = ah2;
      bh3 = ah3;
      bh4 = ah4;
      bh5 = ah5;
      bh6 = ah6;
      bh7 = ah7;

      bl0 = al0;
      bl1 = al1;
      bl2 = al2;
      bl3 = al3;
      bl4 = al4;
      bl5 = al5;
      bl6 = al6;
      bl7 = al7;

      // add
      h = ah7;
      l = al7;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma1
      h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
      l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Ch
      h = (ah4 & ah5) ^ (~ah4 & ah6);
      l = (al4 & al5) ^ (~al4 & al6);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // K
      h = K[i*2];
      l = K[i*2+1];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // w
      h = wh[i%16];
      l = wl[i%16];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      th = c & 0xffff | d << 16;
      tl = a & 0xffff | b << 16;

      // add
      h = th;
      l = tl;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma0
      h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
      l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Maj
      h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
      l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh7 = (c & 0xffff) | (d << 16);
      bl7 = (a & 0xffff) | (b << 16);

      // add
      h = bh3;
      l = bl3;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      h = th;
      l = tl;

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh3 = (c & 0xffff) | (d << 16);
      bl3 = (a & 0xffff) | (b << 16);

      ah1 = bh0;
      ah2 = bh1;
      ah3 = bh2;
      ah4 = bh3;
      ah5 = bh4;
      ah6 = bh5;
      ah7 = bh6;
      ah0 = bh7;

      al1 = bl0;
      al2 = bl1;
      al3 = bl2;
      al4 = bl3;
      al5 = bl4;
      al6 = bl5;
      al7 = bl6;
      al0 = bl7;

      if (i%16 === 15) {
        for (j = 0; j < 16; j++) {
          // add
          h = wh[j];
          l = wl[j];

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = wh[(j+9)%16];
          l = wl[(j+9)%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma0
          th = wh[(j+1)%16];
          tl = wl[(j+1)%16];
          h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
          l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma1
          th = wh[(j+14)%16];
          tl = wl[(j+14)%16];
          h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
          l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          wh[j] = (c & 0xffff) | (d << 16);
          wl[j] = (a & 0xffff) | (b << 16);
        }
      }
    }

    // add
    h = ah0;
    l = al0;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[0];
    l = hl[0];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[0] = ah0 = (c & 0xffff) | (d << 16);
    hl[0] = al0 = (a & 0xffff) | (b << 16);

    h = ah1;
    l = al1;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[1];
    l = hl[1];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[1] = ah1 = (c & 0xffff) | (d << 16);
    hl[1] = al1 = (a & 0xffff) | (b << 16);

    h = ah2;
    l = al2;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[2];
    l = hl[2];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[2] = ah2 = (c & 0xffff) | (d << 16);
    hl[2] = al2 = (a & 0xffff) | (b << 16);

    h = ah3;
    l = al3;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[3];
    l = hl[3];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[3] = ah3 = (c & 0xffff) | (d << 16);
    hl[3] = al3 = (a & 0xffff) | (b << 16);

    h = ah4;
    l = al4;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[4];
    l = hl[4];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[4] = ah4 = (c & 0xffff) | (d << 16);
    hl[4] = al4 = (a & 0xffff) | (b << 16);

    h = ah5;
    l = al5;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[5];
    l = hl[5];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[5] = ah5 = (c & 0xffff) | (d << 16);
    hl[5] = al5 = (a & 0xffff) | (b << 16);

    h = ah6;
    l = al6;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[6];
    l = hl[6];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[6] = ah6 = (c & 0xffff) | (d << 16);
    hl[6] = al6 = (a & 0xffff) | (b << 16);

    h = ah7;
    l = al7;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[7];
    l = hl[7];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[7] = ah7 = (c & 0xffff) | (d << 16);
    hl[7] = al7 = (a & 0xffff) | (b << 16);

    pos += 128;
    n -= 128;
  }

  return n;
}

function crypto_hash(out, m, n) {
  var hh = new Int32Array(8),
      hl = new Int32Array(8),
      x = new Uint8Array(256),
      i, b = n;

  hh[0] = 0x6a09e667;
  hh[1] = 0xbb67ae85;
  hh[2] = 0x3c6ef372;
  hh[3] = 0xa54ff53a;
  hh[4] = 0x510e527f;
  hh[5] = 0x9b05688c;
  hh[6] = 0x1f83d9ab;
  hh[7] = 0x5be0cd19;

  hl[0] = 0xf3bcc908;
  hl[1] = 0x84caa73b;
  hl[2] = 0xfe94f82b;
  hl[3] = 0x5f1d36f1;
  hl[4] = 0xade682d1;
  hl[5] = 0x2b3e6c1f;
  hl[6] = 0xfb41bd6b;
  hl[7] = 0x137e2179;

  crypto_hashblocks_hl(hh, hl, m, n);
  n %= 128;

  for (i = 0; i < n; i++) x[i] = m[b-n+i];
  x[n] = 128;

  n = 256-128*(n<112?1:0);
  x[n-9] = 0;
  ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
  crypto_hashblocks_hl(hh, hl, x, n);

  for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

  return 0;
}

function add(p, q) {
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf(),
      g = gf(), h = gf(), t = gf();

  Z(a, p[1], p[0]);
  Z(t, q[1], q[0]);
  M(a, a, t);
  A(b, p[0], p[1]);
  A(t, q[0], q[1]);
  M(b, b, t);
  M(c, p[3], q[3]);
  M(c, c, D2);
  M(d, p[2], q[2]);
  A(d, d, d);
  Z(e, b, a);
  Z(f, d, c);
  A(g, d, c);
  A(h, b, a);

  M(p[0], e, f);
  M(p[1], h, g);
  M(p[2], g, f);
  M(p[3], e, h);
}

function cswap(p, q, b) {
  var i;
  for (i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b);
  }
}

function pack(r, p) {
  var tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  M(tx, p[0], zi);
  M(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}

function scalarmult(p, q, s) {
  var b, i;
  set25519(p[0], gf0);
  set25519(p[1], gf1);
  set25519(p[2], gf1);
  set25519(p[3], gf0);
  for (i = 255; i >= 0; --i) {
    b = (s[(i/8)|0] >> (i&7)) & 1;
    cswap(p, q, b);
    add(q, p);
    add(p, p);
    cswap(p, q, b);
  }
}

function scalarbase(p, s) {
  var q = [gf(), gf(), gf(), gf()];
  set25519(q[0], X);
  set25519(q[1], Y);
  set25519(q[2], gf1);
  M(q[3], X, Y);
  scalarmult(p, q, s);
}

function crypto_sign_keypair(pk, sk, seeded) {
  var d = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()];
  var i;

  if (!seeded) randombytes(sk, 32);
  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  scalarbase(p, d);
  pack(pk, p);

  for (i = 0; i < 32; i++) sk[i+32] = pk[i];
  return 0;
}

var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

function modL(r, x) {
  var carry, i, j, k;
  for (i = 63; i >= 32; --i) {
    carry = 0;
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)];
      carry = Math.floor((x[j] + 128) / 256);
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (j = 0; j < 32; j++) x[j] -= carry * L[j];
  for (i = 0; i < 32; i++) {
    x[i+1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}

function reduce(r) {
  var x = new Float64Array(64), i;
  for (i = 0; i < 64; i++) x[i] = r[i];
  for (i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}

// Note: difference from C - smlen returned, not passed as argument.
function crypto_sign(sm, m, n, sk) {
  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
  var i, j, x = new Float64Array(64);
  var p = [gf(), gf(), gf(), gf()];

  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  var smlen = n + 64;
  for (i = 0; i < n; i++) sm[64 + i] = m[i];
  for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

  crypto_hash(r, sm.subarray(32), n+32);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 32; i < 64; i++) sm[i] = sk[i];
  crypto_hash(h, sm, n + 64);
  reduce(h);

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i+j] += h[i] * d[j];
    }
  }

  modL(sm.subarray(32), x);
  return smlen;
}

function unpackneg(r, p) {
  var t = gf(), chk = gf(), num = gf(),
      den = gf(), den2 = gf(), den4 = gf(),
      den6 = gf();

  set25519(r[2], gf1);
  unpack25519(r[1], p);
  S(num, r[1]);
  M(den, num, D);
  Z(num, num, r[2]);
  A(den, r[2], den);

  S(den2, den);
  S(den4, den2);
  M(den6, den4, den2);
  M(t, den6, num);
  M(t, t, den);

  pow2523(t, t);
  M(t, t, num);
  M(t, t, den);
  M(t, t, den);
  M(r[0], t, den);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) M(r[0], r[0], I);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) return -1;

  if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

  M(r[3], r[0], r[1]);
  return 0;
}

function crypto_sign_open(m, sm, n, pk) {
  var i;
  var t = new Uint8Array(32), h = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()],
      q = [gf(), gf(), gf(), gf()];

  if (n < 64) return -1;

  if (unpackneg(q, pk)) return -1;

  for (i = 0; i < n; i++) m[i] = sm[i];
  for (i = 0; i < 32; i++) m[i+32] = pk[i];
  crypto_hash(h, m, n);
  reduce(h);
  scalarmult(p, q, h);

  scalarbase(q, sm.subarray(32));
  add(p, q);
  pack(t, p);

  n -= 64;
  if (crypto_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0;
    return -1;
  }

  for (i = 0; i < n; i++) m[i] = sm[i + 64];
  return n;
}

var crypto_secretbox_KEYBYTES = 32,
    crypto_secretbox_NONCEBYTES = 24,
    crypto_secretbox_ZEROBYTES = 32,
    crypto_secretbox_BOXZEROBYTES = 16,
    crypto_scalarmult_BYTES = 32,
    crypto_scalarmult_SCALARBYTES = 32,
    crypto_box_PUBLICKEYBYTES = 32,
    crypto_box_SECRETKEYBYTES = 32,
    crypto_box_BEFORENMBYTES = 32,
    crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
    crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
    crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
    crypto_sign_BYTES = 64,
    crypto_sign_PUBLICKEYBYTES = 32,
    crypto_sign_SECRETKEYBYTES = 64,
    crypto_sign_SEEDBYTES = 32,
    crypto_hash_BYTES = 64;

nacl.lowlevel = {
  crypto_core_hsalsa20: crypto_core_hsalsa20,
  crypto_stream_xor: crypto_stream_xor,
  crypto_stream: crypto_stream,
  crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
  crypto_stream_salsa20: crypto_stream_salsa20,
  crypto_onetimeauth: crypto_onetimeauth,
  crypto_onetimeauth_verify: crypto_onetimeauth_verify,
  crypto_verify_16: crypto_verify_16,
  crypto_verify_32: crypto_verify_32,
  crypto_secretbox: crypto_secretbox,
  crypto_secretbox_open: crypto_secretbox_open,
  crypto_scalarmult: crypto_scalarmult,
  crypto_scalarmult_base: crypto_scalarmult_base,
  crypto_box_beforenm: crypto_box_beforenm,
  crypto_box_afternm: crypto_box_afternm,
  crypto_box: crypto_box,
  crypto_box_open: crypto_box_open,
  crypto_box_keypair: crypto_box_keypair,
  crypto_hash: crypto_hash,
  crypto_sign: crypto_sign,
  crypto_sign_keypair: crypto_sign_keypair,
  crypto_sign_open: crypto_sign_open,

  crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
  crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
  crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
  crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
  crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
  crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
  crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
  crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
  crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
  crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
  crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
  crypto_sign_BYTES: crypto_sign_BYTES,
  crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
  crypto_hash_BYTES: crypto_hash_BYTES,

  gf: gf,
  D: D,
  L: L,
  pack25519: pack25519,
  unpack25519: unpack25519,
  M: M,
  A: A,
  S: S,
  Z: Z,
  pow2523: pow2523,
  add: add,
  set25519: set25519,
  modL: modL,
  scalarmult: scalarmult,
  scalarbase: scalarbase,
};

/* High-level API */

function checkLengths(k, n) {
  if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
  if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
}

function checkBoxLengths(pk, sk) {
  if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
  if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
}

function checkArrayTypes() {
  for (var i = 0; i < arguments.length; i++) {
    if (!(arguments[i] instanceof Uint8Array))
      throw new TypeError('unexpected type, use Uint8Array');
  }
}

function cleanup(arr) {
  for (var i = 0; i < arr.length; i++) arr[i] = 0;
}

nacl.randomBytes = function(n) {
  var b = new Uint8Array(n);
  randombytes(b, n);
  return b;
};

nacl.secretbox = function(msg, nonce, key) {
  checkArrayTypes(msg, nonce, key);
  checkLengths(key, nonce);
  var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
  var c = new Uint8Array(m.length);
  for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
  crypto_secretbox(c, m, m.length, nonce, key);
  return c.subarray(crypto_secretbox_BOXZEROBYTES);
};

nacl.secretbox.open = function(box, nonce, key) {
  checkArrayTypes(box, nonce, key);
  checkLengths(key, nonce);
  var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
  var m = new Uint8Array(c.length);
  for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
  if (c.length < 32) return null;
  if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
  return m.subarray(crypto_secretbox_ZEROBYTES);
};

nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

nacl.scalarMult = function(n, p) {
  checkArrayTypes(n, p);
  if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
  if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
  var q = new Uint8Array(crypto_scalarmult_BYTES);
  crypto_scalarmult(q, n, p);
  return q;
};

nacl.scalarMult.base = function(n) {
  checkArrayTypes(n);
  if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
  var q = new Uint8Array(crypto_scalarmult_BYTES);
  crypto_scalarmult_base(q, n);
  return q;
};

nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

nacl.box = function(msg, nonce, publicKey, secretKey) {
  var k = nacl.box.before(publicKey, secretKey);
  return nacl.secretbox(msg, nonce, k);
};

nacl.box.before = function(publicKey, secretKey) {
  checkArrayTypes(publicKey, secretKey);
  checkBoxLengths(publicKey, secretKey);
  var k = new Uint8Array(crypto_box_BEFORENMBYTES);
  crypto_box_beforenm(k, publicKey, secretKey);
  return k;
};

nacl.box.after = nacl.secretbox;

nacl.box.open = function(msg, nonce, publicKey, secretKey) {
  var k = nacl.box.before(publicKey, secretKey);
  return nacl.secretbox.open(msg, nonce, k);
};

nacl.box.open.after = nacl.secretbox.open;

nacl.box.keyPair = function() {
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
  crypto_box_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.box.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_box_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  crypto_scalarmult_base(pk, secretKey);
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
nacl.box.nonceLength = crypto_box_NONCEBYTES;
nacl.box.overheadLength = nacl.secretbox.overheadLength;

nacl.sign = function(msg, secretKey) {
  checkArrayTypes(msg, secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
  crypto_sign(signedMsg, msg, msg.length, secretKey);
  return signedMsg;
};

nacl.sign.open = function(signedMsg, publicKey) {
  checkArrayTypes(signedMsg, publicKey);
  if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
    throw new Error('bad public key size');
  var tmp = new Uint8Array(signedMsg.length);
  var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
  if (mlen < 0) return null;
  var m = new Uint8Array(mlen);
  for (var i = 0; i < m.length; i++) m[i] = tmp[i];
  return m;
};

nacl.sign.detached = function(msg, secretKey) {
  var signedMsg = nacl.sign(msg, secretKey);
  var sig = new Uint8Array(crypto_sign_BYTES);
  for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
  return sig;
};

nacl.sign.detached.verify = function(msg, sig, publicKey) {
  checkArrayTypes(msg, sig, publicKey);
  if (sig.length !== crypto_sign_BYTES)
    throw new Error('bad signature size');
  if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
    throw new Error('bad public key size');
  var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
  var m = new Uint8Array(crypto_sign_BYTES + msg.length);
  var i;
  for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
  for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
  return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
};

nacl.sign.keyPair = function() {
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  crypto_sign_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.sign.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.sign.keyPair.fromSeed = function(seed) {
  checkArrayTypes(seed);
  if (seed.length !== crypto_sign_SEEDBYTES)
    throw new Error('bad seed size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  for (var i = 0; i < 32; i++) sk[i] = seed[i];
  crypto_sign_keypair(pk, sk, true);
  return {publicKey: pk, secretKey: sk};
};

nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
nacl.sign.seedLength = crypto_sign_SEEDBYTES;
nacl.sign.signatureLength = crypto_sign_BYTES;

nacl.hash = function(msg) {
  checkArrayTypes(msg);
  var h = new Uint8Array(crypto_hash_BYTES);
  crypto_hash(h, msg, msg.length);
  return h;
};

nacl.hash.hashLength = crypto_hash_BYTES;

nacl.verify = function(x, y) {
  checkArrayTypes(x, y);
  // Zero length arguments are considered not equal.
  if (x.length === 0 || y.length === 0) return false;
  if (x.length !== y.length) return false;
  return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
};

nacl.setPRNG = function(fn) {
  randombytes = fn;
};

(function() {
  // Initialize PRNG if environment provides CSPRNG.
  // If not, methods calling randombytes will throw.
  var crypto = typeof self !== 'undefined' ? (self.crypto || self.msCrypto) : null;
  if (crypto && crypto.getRandomValues) {
    // Browsers.
    var QUOTA = 65536;
    nacl.setPRNG(function(x, n) {
      var i, v = new Uint8Array(n);
      for (i = 0; i < n; i += QUOTA) {
        crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
      }
      for (i = 0; i < n; i++) x[i] = v[i];
      cleanup(v);
    });
  } else if (typeof require !== 'undefined') {
    // Node.js.
    crypto = require('crypto');
    if (crypto && crypto.randomBytes) {
      nacl.setPRNG(function(x, n) {
        var i, v = crypto.randomBytes(n);
        for (i = 0; i < n; i++) x[i] = v[i];
        cleanup(v);
      });
    }
  }
})();

})(typeof module !== 'undefined' && module.exports ? module.exports : (self.nacl = self.nacl || {}));

      };
    };
  }
  }
}, {package:"eth-sig-util>tweetnacl",file:"node_modules\\tweetnacl\\nacl-fast.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\errors.js", {"./native":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\native.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctypeforce%5Cerrors.js
      return function (require, module, exports) {
var native = require('./native')

function getTypeName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getValueTypeName (value) {
  return native.Nil(value) ? '' : getTypeName(value.constructor)
}

function getValue (value) {
  if (native.Function(value)) return ''
  if (native.String(value)) return JSON.stringify(value)
  if (value && native.Object(value)) return ''
  return value
}

function captureStackTrace (e, t) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t)
  }
}

function tfJSON (type) {
  if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type)
  if (native.Array(type)) return 'Array'
  if (type && native.Object(type)) return 'Object'

  return type !== undefined ? type : ''
}

function tfErrorString (type, value, valueTypeName) {
  var valueJson = getValue(value)

  return 'Expected ' + tfJSON(type) + ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
}

function TfTypeError (type, value, valueTypeName) {
  valueTypeName = valueTypeName || getValueTypeName(value)
  this.message = tfErrorString(type, value, valueTypeName)

  captureStackTrace(this, TfTypeError)
  this.__type = type
  this.__value = value
  this.__valueTypeName = valueTypeName
}

TfTypeError.prototype = Object.create(Error.prototype)
TfTypeError.prototype.constructor = TfTypeError

function tfPropertyErrorString (type, label, name, value, valueTypeName) {
  var description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName)
}

function TfPropertyTypeError (type, property, label, value, valueTypeName) {
  if (type) {
    valueTypeName = valueTypeName || getValueTypeName(value)
    this.message = tfPropertyErrorString(type, label, property, value, valueTypeName)
  } else {
    this.message = 'Unexpected property "' + property + '"'
  }

  captureStackTrace(this, TfTypeError)
  this.__label = label
  this.__property = property
  this.__type = type
  this.__value = value
  this.__valueTypeName = valueTypeName
}

TfPropertyTypeError.prototype = Object.create(Error.prototype)
TfPropertyTypeError.prototype.constructor = TfTypeError

function tfCustomError (expected, actual) {
  return new TfTypeError(expected, {}, actual)
}

function tfSubError (e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property

    e = new TfPropertyTypeError(
      e.__type, property, e.__label, e.__value, e.__valueTypeName
    )

  // child?
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(
      e.__type, property, label, e.__value, e.__valueTypeName
    )
  }

  captureStackTrace(e)
  return e
}

module.exports = {
  TfTypeError: TfTypeError,
  TfPropertyTypeError: TfPropertyTypeError,
  tfCustomError: tfCustomError,
  tfSubError: tfSubError,
  tfJSON: tfJSON,
  getValueTypeName: getValueTypeName
}

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>typeforce",file:"node_modules\\typeforce\\errors.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\extra.js", {"../is-buffer/index.js":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\is-buffer\\index.js","./errors":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\errors.js","./native":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\native.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctypeforce%5Cextra.js
      return function (require, module, exports) {
(function (Buffer){(function (){
var NATIVE = require('./native')
var ERRORS = require('./errors')

function _Buffer (value) {
  return Buffer.isBuffer(value)
}

function Hex (value) {
  return typeof value === 'string' && /^([0-9a-f]{2})+$/i.test(value)
}

function _LengthN (type, length) {
  var name = type.toJSON()

  function Length (value) {
    if (!type(value)) return false
    if (value.length === length) return true

    throw ERRORS.tfCustomError(name + '(Length: ' + length + ')', name + '(Length: ' + value.length + ')')
  }
  Length.toJSON = function () { return name }

  return Length
}

var _ArrayN = _LengthN.bind(null, NATIVE.Array)
var _BufferN = _LengthN.bind(null, _Buffer)
var _HexN = _LengthN.bind(null, Hex)
var _StringN = _LengthN.bind(null, NATIVE.String)

function Range (a, b, f) {
  f = f || NATIVE.Number
  function _range (value, strict) {
    return f(value, strict) && (value > a) && (value < b)
  }
  _range.toJSON = function () {
    return `${f.toJSON()} between [${a}, ${b}]`
  }
  return _range
}

var INT53_MAX = Math.pow(2, 53) - 1

function Finite (value) {
  return typeof value === 'number' && isFinite(value)
}
function Int8 (value) { return ((value << 24) >> 24) === value }
function Int16 (value) { return ((value << 16) >> 16) === value }
function Int32 (value) { return (value | 0) === value }
function Int53 (value) {
  return typeof value === 'number' &&
    value >= -INT53_MAX &&
    value <= INT53_MAX &&
    Math.floor(value) === value
}
function UInt8 (value) { return (value & 0xff) === value }
function UInt16 (value) { return (value & 0xffff) === value }
function UInt32 (value) { return (value >>> 0) === value }
function UInt53 (value) {
  return typeof value === 'number' &&
    value >= 0 &&
    value <= INT53_MAX &&
    Math.floor(value) === value
}

var types = {
  ArrayN: _ArrayN,
  Buffer: _Buffer,
  BufferN: _BufferN,
  Finite: Finite,
  Hex: Hex,
  HexN: _HexN,
  Int8: Int8,
  Int16: Int16,
  Int32: Int32,
  Int53: Int53,
  Range: Range,
  StringN: _StringN,
  UInt8: UInt8,
  UInt16: UInt16,
  UInt32: UInt32,
  UInt53: UInt53
}

for (var typeName in types) {
  types[typeName].toJSON = function (t) {
    return t
  }.bind(null, typeName)
}

module.exports = types

}).call(this)}).call(this,{"isBuffer":require("../is-buffer/index.js")})

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>typeforce",file:"node_modules\\typeforce\\extra.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\index.js", {"./errors":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\errors.js","./extra":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\extra.js","./native":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\native.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctypeforce%5Cindex.js
      return function (require, module, exports) {
var ERRORS = require('./errors')
var NATIVE = require('./native')

// short-hand
var tfJSON = ERRORS.tfJSON
var TfTypeError = ERRORS.TfTypeError
var TfPropertyTypeError = ERRORS.TfPropertyTypeError
var tfSubError = ERRORS.tfSubError
var getValueTypeName = ERRORS.getValueTypeName

var TYPES = {
  arrayOf: function arrayOf (type, options) {
    type = compile(type)
    options = options || {}

    function _arrayOf (array, strict) {
      if (!NATIVE.Array(array)) return false
      if (NATIVE.Nil(array)) return false
      if (options.minLength !== undefined && array.length < options.minLength) return false
      if (options.maxLength !== undefined && array.length > options.maxLength) return false
      if (options.length !== undefined && array.length !== options.length) return false

      return array.every(function (value, i) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }
    _arrayOf.toJSON = function () {
      var str = '[' + tfJSON(type) + ']'
      if (options.length !== undefined) {
        str += '{' + options.length + '}'
      } else if (options.minLength !== undefined || options.maxLength !== undefined) {
        str += '{' +
          (options.minLength === undefined ? 0 : options.minLength) + ',' +
          (options.maxLength === undefined ? Infinity : options.maxLength) + '}'
      }
      return str
    }

    return _arrayOf
  },

  maybe: function maybe (type) {
    type = compile(type)

    function _maybe (value, strict) {
      return NATIVE.Nil(value) || type(value, strict, maybe)
    }
    _maybe.toJSON = function () { return '?' + tfJSON(type) }

    return _maybe
  },

  map: function map (propertyType, propertyKeyType) {
    propertyType = compile(propertyType)
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType)

    function _map (value, strict) {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      for (var propertyName in value) {
        try {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict)
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key')
        }

        try {
          var propertyValue = value[propertyName]
          typeforce(propertyType, propertyValue, strict)
        } catch (e) {
          throw tfSubError(e, propertyName)
        }
      }

      return true
    }

    if (propertyKeyType) {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
      }
    } else {
      _map.toJSON = function () { return '{' + tfJSON(propertyType) + '}' }
    }

    return _map
  },

  object: function object (uncompiled) {
    var type = {}

    for (var typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName])
    }

    function _object (value, strict) {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      var propertyName

      try {
        for (propertyName in type) {
          var propertyType = type[propertyName]
          var propertyValue = value[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        throw tfSubError(e, propertyName)
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TfPropertyTypeError(undefined, propertyName)
        }
      }

      return true
    }
    _object.toJSON = function () { return tfJSON(type) }

    return _object
  },

  anyOf: function anyOf () {
    var types = [].slice.call(arguments).map(compile)

    function _anyOf (value, strict) {
      return types.some(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          return false
        }
      })
    }
    _anyOf.toJSON = function () { return types.map(tfJSON).join('|') }

    return _anyOf
  },

  allOf: function allOf () {
    var types = [].slice.call(arguments).map(compile)

    function _allOf (value, strict) {
      return types.every(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          return false
        }
      })
    }
    _allOf.toJSON = function () { return types.map(tfJSON).join(' & ') }

    return _allOf
  },

  quacksLike: function quacksLike (type) {
    function _quacksLike (value) {
      return type === getValueTypeName(value)
    }
    _quacksLike.toJSON = function () { return type }

    return _quacksLike
  },

  tuple: function tuple () {
    var types = [].slice.call(arguments).map(compile)

    function _tuple (values, strict) {
      if (NATIVE.Nil(values)) return false
      if (NATIVE.Nil(values.length)) return false
      if (strict && (values.length !== types.length)) return false

      return types.every(function (type, i) {
        try {
          return typeforce(type, values[i], strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }
    _tuple.toJSON = function () { return '(' + types.map(tfJSON).join(', ') + ')' }

    return _tuple
  },

  value: function value (expected) {
    function _value (actual) {
      return actual === expected
    }
    _value.toJSON = function () { return expected }

    return _value
  }
}

// TODO: deprecate
TYPES.oneOf = TYPES.anyOf

function compile (type) {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1))

    return NATIVE[type] || TYPES.quacksLike(type)
  } else if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) {
      if (type.length !== 1) throw new TypeError('Expected compile() parameter of type Array of length 1')
      return TYPES.arrayOf(type[0])
    }

    return TYPES.object(type)
  } else if (NATIVE.Function(type)) {
    return type
  }

  return TYPES.value(type)
}

function typeforce (type, value, strict, surrogate) {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true

    throw new TfTypeError(surrogate || type, value)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign types to typeforce function
for (var typeName in NATIVE) {
  typeforce[typeName] = NATIVE[typeName]
}

for (typeName in TYPES) {
  typeforce[typeName] = TYPES[typeName]
}

var EXTRA = require('./extra')
for (typeName in EXTRA) {
  typeforce[typeName] = EXTRA[typeName]
}

typeforce.compile = compile
typeforce.TfTypeError = TfTypeError
typeforce.TfPropertyTypeError = TfPropertyTypeError

module.exports = typeforce

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>typeforce",file:"node_modules\\typeforce\\index.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\typeforce\\native.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Ctypeforce%5Cnative.js
      return function (require, module, exports) {
var types = {
  Array: function (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean: function (value) { return typeof value === 'boolean' },
  Function: function (value) { return typeof value === 'function' },
  Nil: function (value) { return value === undefined || value === null },
  Number: function (value) { return typeof value === 'number' },
  Object: function (value) { return typeof value === 'object' },
  String: function (value) { return typeof value === 'string' },
  '': function () { return true }
}

// TODO: deprecate
types.Null = types.Nil

for (var typeName in types) {
  types[typeName].toJSON = function (t) {
    return t
  }.bind(null, typeName)
}

module.exports = types

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>typeforce",file:"node_modules\\typeforce\\native.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\uint8arrays\\concat.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cuint8arrays%5Cconcat.js
      return function (require, module, exports) {
'use strict'

/**
 * Returns a new Uint8Array created by concatenating the passed ArrayLikes
 *
 * @param {Array<ArrayLike<number>>} arrays
 * @param {number} [length]
 */
function concat (arrays, length) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0)
  }

  const output = new Uint8Array(length)
  let offset = 0

  for (const arr of arrays) {
    output.set(arr, offset)
    offset += arr.length
  }

  return output
}

module.exports = concat

      };
    };
  }
  }
}, {package:"@ensdomains/content-hash>cids>uint8arrays",file:"node_modules\\uint8arrays\\concat.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\uint8arrays\\equals.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cuint8arrays%5Cequals.js
      return function (require, module, exports) {
'use strict'

/**
 * Returns true if the two passed Uint8Arrays have the same content
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 */
function equals (a, b) {
  if (a === b) {
    return true
  }

  if (a.byteLength !== b.byteLength) {
    return false
  }

  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

module.exports = equals

      };
    };
  }
  }
}, {package:"@ensdomains/content-hash>cids>uint8arrays",file:"node_modules\\uint8arrays\\equals.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\uint8arrays\\from-string.js", {"multibase":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\multibase\\src\\index.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cuint8arrays%5Cfrom-string.js
      return function (require, module, exports) {
'use strict'

const { encoding: getCodec } = require('multibase')
const utf8Encoder = new TextEncoder()

/**
 * @typedef {__import__('multibase/src/types').BaseName | 'utf8' | 'utf-8' | 'ascii' | undefined} SupportedEncodings
 */

/**
 * Interprets each character in a string as a byte and
 * returns a Uint8Array of those bytes.
 *
 * @param {string} string - The string to turn into an array
 */
function asciiStringToUint8Array (string) {
  const array = new Uint8Array(string.length)

  for (let i = 0; i < string.length; i++) {
    array[i] = string.charCodeAt(i)
  }

  return array
}

/**
 * Create a `Uint8Array` from the passed string
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {string} string
 * @param {SupportedEncodings} [encoding=utf8] - utf8, base16, base64, base64urlpad, etc
 * @returns {Uint8Array}
 */
function fromString (string, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Encoder.encode(string)
  }

  if (encoding === 'ascii') {
    return asciiStringToUint8Array(string)
  }

  return getCodec(encoding).decode(string)
}

module.exports = fromString

      };
    };
  }
  }
}, {package:"@ensdomains/content-hash>cids>uint8arrays",file:"node_modules\\uint8arrays\\from-string.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\uint8arrays\\to-string.js", {"multibase":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\multibase\\src\\index.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cuint8arrays%5Cto-string.js
      return function (require, module, exports) {
'use strict'

const { encoding: getCodec } = require('multibase')
const utf8Decoder = new TextDecoder('utf8')

/**
 * @typedef {__import__('multibase/src/types').BaseName | 'utf8' | 'utf-8' | 'ascii' | undefined} SupportedEncodings
 */

/**
 * Turns a Uint8Array of bytes into a string with each
 * character being the char code of the corresponding byte
 *
 * @param {Uint8Array} array - The array to turn into a string
 */
function uint8ArrayToAsciiString (array) {
  let string = ''

  for (let i = 0; i < array.length; i++) {
    string += String.fromCharCode(array[i])
  }
  return string
}

/**
 * Turns a `Uint8Array` into a string.
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {Uint8Array} array - The array to turn into a string
 * @param {SupportedEncodings} [encoding=utf8] - The encoding to use
 * @returns {string}
 */
function toString (array, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Decoder.decode(array)
  }

  if (encoding === 'ascii') {
    return uint8ArrayToAsciiString(array)
  }

  return getCodec(encoding).encode(array)
}

module.exports = toString

      };
    };
  }
  }
}, {package:"@ensdomains/content-hash>cids>uint8arrays",file:"node_modules\\uint8arrays\\to-string.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\varuint-bitcoin\\index.js", {"safe-buffer":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\safe-buffer\\index.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cvaruint-bitcoin%5Cindex.js
      return function (require, module, exports) {
'use strict'
var Buffer = require('safe-buffer').Buffer

// Number.MAX_SAFE_INTEGER
var MAX_SAFE_INTEGER = 9007199254740991

function checkUInt53 (n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

function encode (number, buffer, offset) {
  checkUInt53(number)

  if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(number))
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

  // 8 bit
  if (number < 0xfd) {
    buffer.writeUInt8(number, offset)
    encode.bytes = 1

  // 16 bit
  } else if (number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset)
    buffer.writeUInt16LE(number, offset + 1)
    encode.bytes = 3

  // 32 bit
  } else if (number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset)
    buffer.writeUInt32LE(number, offset + 1)
    encode.bytes = 5

  // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset)
    buffer.writeUInt32LE(number >>> 0, offset + 1)
    buffer.writeUInt32LE((number / 0x100000000) | 0, offset + 5)
    encode.bytes = 9
  }

  return buffer
}

function decode (buffer, offset) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

  var first = buffer.readUInt8(offset)

  // 8 bit
  if (first < 0xfd) {
    decode.bytes = 1
    return first

  // 16 bit
  } else if (first === 0xfd) {
    decode.bytes = 3
    return buffer.readUInt16LE(offset + 1)

  // 32 bit
  } else if (first === 0xfe) {
    decode.bytes = 5
    return buffer.readUInt32LE(offset + 1)

  // 64 bit
  } else {
    decode.bytes = 9
    var lo = buffer.readUInt32LE(offset + 1)
    var hi = buffer.readUInt32LE(offset + 5)
    var number = hi * 0x0100000000 + lo
    checkUInt53(number)

    return number
  }
}

function encodingLength (number) {
  checkUInt53(number)

  return (
    number < 0xfd ? 1
      : number <= 0xffff ? 3
        : number <= 0xffffffff ? 5
          : 9
  )
}

module.exports = { encode: encode, decode: decode, encodingLength: encodingLength }

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>varuint-bitcoin",file:"node_modules\\varuint-bitcoin\\index.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\web-encoding\\src\\lib.js", {"util":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\util\\util.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cweb-encoding%5Csrc%5Clib.js
      return function (require, module, exports) {
"use strict"

exports.TextEncoder =
  typeof TextEncoder !== "undefined" ? TextEncoder : require("util").TextEncoder

exports.TextDecoder =
  typeof TextDecoder !== "undefined" ? TextDecoder : require("util").TextDecoder

      };
    };
  }
  }
}, {package:"@ensdomains/content-hash>multihashes>web-encoding",file:"node_modules\\web-encoding\\src\\lib.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\whatwg-fetch\\dist\\fetch.umd.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cwhatwg-fetch%5Cdist%5Cfetch.umd.js
      return function (require, module, exports) {
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    (typeof global !== 'undefined' && global);

  var support = {
    searchParams: 'URLSearchParams' in global,
    iterable: 'Symbol' in global && 'iterator' in Symbol,
    blob:
      'FileReader' in global &&
      'Blob' in global &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in global,
    arrayBuffer: 'ArrayBuffer' in global
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name: "' + name + '"')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          var isConsumed = consumed(this);
          if (isConsumed) {
            return isConsumed
          }
          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(
              this._bodyArrayBuffer.buffer.slice(
                this._bodyArrayBuffer.byteOffset,
                this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
              )
            )
          } else {
            return Promise.resolve(this._bodyArrayBuffer)
          }
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders
      .split('\r')
      .map(function(header) {
        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
      })
      .forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = global.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && global.location.href ? global.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer &&
          request.headers.get('Content-Type') &&
          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

      };
    };
  }
  }
}, {package:"@metamask/smart-transactions-controller>isomorphic-fetch>whatwg-fetch",file:"node_modules\\whatwg-fetch\\dist\\fetch.umd.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\wif\\index.js", {"bs58check":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\bs58check\\index.js","buffer":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\buffer\\index.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cnode_modules%5Cwif%5Cindex.js
      return function (require, module, exports) {
(function (Buffer){(function (){
var bs58check = require('bs58check')

function decodeRaw (buffer, version) {
  // check version only if defined
  if (version !== undefined && buffer[0] !== version) throw new Error('Invalid network version')

  // uncompressed
  if (buffer.length === 33) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33),
      compressed: false
    }
  }

  // invalid length
  if (buffer.length !== 34) throw new Error('Invalid WIF length')

  // invalid compression flag
  if (buffer[33] !== 0x01) throw new Error('Invalid compression flag')

  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33),
    compressed: true
  }
}

function encodeRaw (version, privateKey, compressed) {
  var result = new Buffer(compressed ? 34 : 33)

  result.writeUInt8(version, 0)
  privateKey.copy(result, 1)

  if (compressed) {
    result[33] = 0x01
  }

  return result
}

function decode (string, version) {
  return decodeRaw(bs58check.decode(string), version)
}

function encode (version, privateKey, compressed) {
  if (typeof version === 'number') return bs58check.encode(encodeRaw(version, privateKey, compressed))

  return bs58check.encode(
    encodeRaw(
      version.version,
      version.privateKey,
      version.compressed
    )
  )
}

module.exports = {
  decode: decode,
  decodeRaw: decodeRaw,
  encode: encode,
  encodeRaw: encodeRaw
}

}).call(this)}).call(this,require("buffer").Buffer)

      };
    };
  }
  }
}, {package:"@metamask/eth-trezor-keyring>@trezor/connect-web>@trezor/connect>@trezor/utxo-lib>wif",file:"node_modules\\wif\\index.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\alarms.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cshared%5Cconstants%5Calarms.js
      return function (require, module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.METAMETRICS_FINALIZE_EVENT_FRAGMENT_ALARM = exports.AUTO_LOCK_TIMEOUT_ALARM = void 0;
const AUTO_LOCK_TIMEOUT_ALARM = 'AUTO_LOCK_TIMEOUT_ALARM';
exports.AUTO_LOCK_TIMEOUT_ALARM = AUTO_LOCK_TIMEOUT_ALARM;
const METAMETRICS_FINALIZE_EVENT_FRAGMENT_ALARM = 'METAMETRICS_FINALIZE_EVENT_FRAGMENT_ALARM';
exports.METAMETRICS_FINALIZE_EVENT_FRAGMENT_ALARM = METAMETRICS_FINALIZE_EVENT_FRAGMENT_ALARM;

      };
    };
  }
  }
}, {package:"$root$",file:"shared\\constants\\alarms.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\smartTransactions.js", {"./time":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\time.ts"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cshared%5Cconstants%5CsmartTransactions.js
      return function (require, module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FALLBACK_SMART_TRANSACTIONS_REFRESH_TIME = exports.FALLBACK_SMART_TRANSACTIONS_MAX_FEE_MULTIPLIER = exports.FALLBACK_SMART_TRANSACTIONS_DEADLINE = void 0;
var _time = require("./time");
const FALLBACK_SMART_TRANSACTIONS_REFRESH_TIME = _time.SECOND * 10;
exports.FALLBACK_SMART_TRANSACTIONS_REFRESH_TIME = FALLBACK_SMART_TRANSACTIONS_REFRESH_TIME;
const FALLBACK_SMART_TRANSACTIONS_DEADLINE = 180;
exports.FALLBACK_SMART_TRANSACTIONS_DEADLINE = FALLBACK_SMART_TRANSACTIONS_DEADLINE;
const FALLBACK_SMART_TRANSACTIONS_MAX_FEE_MULTIPLIER = 2;
exports.FALLBACK_SMART_TRANSACTIONS_MAX_FEE_MULTIPLIER = FALLBACK_SMART_TRANSACTIONS_MAX_FEE_MULTIPLIER;

      };
    };
  }
  }
}, {package:"$root$",file:"shared\\constants\\smartTransactions.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\test-flags.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Cshared%5Cconstants%5Ctest-flags.js
      return function (require, module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ACTION_QUEUE_METRICS_E2E_TEST = void 0;
const ACTION_QUEUE_METRICS_E2E_TEST = 'action_queue_metrics_e2e_test';
exports.ACTION_QUEUE_METRICS_E2E_TEST = ACTION_QUEUE_METRICS_E2E_TEST;

      };
    };
  }
  }
}, {package:"$root$",file:"shared\\constants\\test-flags.js",}],
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\background.js", {"../../shared/constants/app":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\app.ts","../../shared/constants/metametrics":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\constants\\metametrics.ts","../../shared/modules/browser-runtime.utils":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\modules\\browser-runtime.utils.js","../../shared/modules/mv3.utils":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\modules\\mv3.utils.js","../../shared/modules/object.utils":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\shared\\modules\\object.utils.js","./first-time-state":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\first-time-state.js","./lib/createStreamSink":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\createStreamSink.js","./lib/ens-ipfs/setup":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\ens-ipfs\\setup.js","./lib/get-first-preferred-lang-code":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\get-first-preferred-lang-code.js","./lib/getObjStructure":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\getObjStructure.js","./lib/local-store":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\local-store.js","./lib/migrator":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\migrator\\index.js","./lib/network-store":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\network-store.js","./lib/notification-manager":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\notification-manager.js","./lib/setupSentry":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\setupSentry.js","./lib/util":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\lib\\util.ts","./metamask-controller":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\metamask-controller.js","./migrations":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\migrations\\index.js","./platforms/extension":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\platforms\\extension.js","@metamask/obs-store":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\@metamask\\obs-store\\dist\\index.js","debounce-stream":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\debounce-stream\\index.js","end-of-stream":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\end-of-stream\\index.js","eth-rpc-errors":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\eth-rpc-errors\\dist\\index.js","events":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\browserify\\node_modules\\events\\events.js","extension-port-stream":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\extension-port-stream\\dist\\index.js","loglevel":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\loglevel\\lib\\loglevel.js","pump":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\pump\\index.js","webextension-polyfill":"C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\node_modules\\webextension-polyfill\\dist\\browser-polyfill.js"}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Capp%5Cscripts%5Cbackground.js
      return function (require, module, exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadStateFromPersistence = loadStateFromPersistence;
exports.setupController = setupController;
exports.statePersistenceEvents = void 0;
var _events = _interopRequireDefault(require("events"));
var _endOfStream = _interopRequireDefault(require("end-of-stream"));
var _pump = _interopRequireDefault(require("pump"));
var _debounceStream = _interopRequireDefault(require("debounce-stream"));
var _loglevel = _interopRequireDefault(require("loglevel"));
var _webextensionPolyfill = _interopRequireDefault(require("webextension-polyfill"));
var _obsStore = require("@metamask/obs-store");
var _extensionPortStream = _interopRequireDefault(require("extension-port-stream"));
var _ethRpcErrors = require("eth-rpc-errors");
var _app = require("../../shared/constants/app");
var _metametrics = require("../../shared/constants/metametrics");
var _browserRuntime = require("../../shared/modules/browser-runtime.utils");
var _mv = require("../../shared/modules/mv3.utils");
var _object = require("../../shared/modules/object.utils");
var _util = require("./lib/util");
var _migrations = _interopRequireDefault(require("./migrations"));
var _migrator = _interopRequireDefault(require("./lib/migrator"));
var _extension = _interopRequireDefault(require("./platforms/extension"));
var _localStore = _interopRequireDefault(require("./lib/local-store"));
var _networkStore = _interopRequireDefault(require("./lib/network-store"));
var _setupSentry = require("./lib/setupSentry");
var _createStreamSink = _interopRequireDefault(require("./lib/createStreamSink"));
var _notificationManager = _interopRequireWildcard(require("./lib/notification-manager"));
var _metamaskController = _interopRequireWildcard(require("./metamask-controller"));
var _firstTimeState = _interopRequireDefault(require("./first-time-state"));
var _getFirstPreferredLangCode = _interopRequireDefault(require("./lib/get-first-preferred-lang-code"));
var _getObjStructure = _interopRequireDefault(require("./lib/getObjStructure"));
var _setup = _interopRequireDefault(require("./lib/ens-ipfs/setup"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @file The entry point for the web extension singleton process.
 */

/* eslint-enable import/first */

/* eslint-disable import/order */
/* eslint-enable import/order */
const {
  sentry
} = global;
const firstTimeState = {
  ..._firstTimeState.default
};
const metamaskInternalProcessHash = {
  [_app.ENVIRONMENT_TYPE_POPUP]: true,
  [_app.ENVIRONMENT_TYPE_NOTIFICATION]: true,
  [_app.ENVIRONMENT_TYPE_FULLSCREEN]: true
};
const metamaskBlockedPorts = ['trezor-connect'];
_loglevel.default.setDefaultLevel(true ? 'debug' : 'info');
const platform = new _extension.default();
const notificationManager = new _notificationManager.default();
let popupIsOpen = false;
let notificationIsOpen = false;
let uiIsTriggering = false;
const openMetamaskTabsIDs = {};
const openMetamaskConnections = new Map();
const requestAccountTabIds = {};
let controller;

// state persistence
const inTest = false;
const localStore = inTest ? new _networkStore.default() : new _localStore.default();
let versionedData;
if (inTest || true) {
  global.stateHooks.metamaskGetState = localStore.get.bind(localStore);
}
const phishingPageUrl = new URL("https://metamask.github.io/phishing-warning/v2.1.0/");
const ONE_SECOND_IN_MILLISECONDS = 1_000;
// Timeout for initializing phishing warning page.
const PHISHING_WARNING_PAGE_TIMEOUT = ONE_SECOND_IN_MILLISECONDS;
const ACK_KEEP_ALIVE_MESSAGE = 'ACK_KEEP_ALIVE_MESSAGE';
const WORKER_KEEP_ALIVE_MESSAGE = 'WORKER_KEEP_ALIVE_MESSAGE';

// Event emitter for state persistence
const statePersistenceEvents = new _events.default();

/**
 * This deferred Promise is used to track whether initialization has finished.
 *
 * It is very important to ensure that `resolveInitialization` is *always*
 * called once initialization has completed, and that `rejectInitialization` is
 * called if initialization fails in an unrecoverable way.
 */
exports.statePersistenceEvents = statePersistenceEvents;
const {
  promise: isInitialized,
  resolve: resolveInitialization,
  reject: rejectInitialization
} = (0, _util.deferredPromise)();

/**
 * Sends a message to the dapp(s) content script to signal it can connect to MetaMask background as
 * the backend is not active. It is required to re-connect dapps after service worker re-activates.
 * For non-dapp pages, the message will be sent and ignored.
 */
const sendReadyMessageToTabs = async () => {
  const tabs = await _webextensionPolyfill.default.tabs.query({
    /**
     * Only query tabs that our extension can run in. To do this, we query for all URLs that our
     * extension can inject scripts in, which is by using the "<all_urls>" value and __without__
     * the "tabs" manifest permission. If we included the "tabs" permission, this would also fetch
     * URLs that we'd not be able to inject in, e.g. chrome://pages, chrome://extension, which
     * is not what we'd want.
     *
     * You might be wondering, how does the "url" param work without the "tabs" permission?
     *
     * @see {@link https://bugs.chromium.org/p/chromium/issues/detail?id=661311#c1}
     *  "If the extension has access to inject scripts into Tab, then we can return the url
     *   of Tab (because the extension could just inject a script to message the location.href)."
     */
    url: '<all_urls>',
    windowType: 'normal'
  }).then(result => {
    (0, _browserRuntime.checkForLastErrorAndLog)();
    return result;
  }).catch(() => {
    (0, _browserRuntime.checkForLastErrorAndLog)();
  });

  /** @todo we should only sendMessage to dapp tabs, not all tabs. */
  for (const tab of tabs) {
    _webextensionPolyfill.default.tabs.sendMessage(tab.id, {
      name: _app.EXTENSION_MESSAGES.READY
    }).then(() => {
      (0, _browserRuntime.checkForLastErrorAndLog)();
    }).catch(() => {
      // An error may happen if the contentscript is blocked from loading,
      // and thus there is no runtime.onMessage handler to listen to the message.
      (0, _browserRuntime.checkForLastErrorAndLog)();
    });
  }
};

// These are set after initialization
let connectRemote;
let connectExternal;
_webextensionPolyfill.default.runtime.onConnect.addListener(async (...args) => {
  // Queue up connection attempts here, waiting until after initialization
  await isInitialized;
  const remotePort = args[0];
  const {
    sender
  } = remotePort;
  const url = sender === null || sender === void 0 ? void 0 : sender.url;
  const detectedProcessName = url ? (0, _util.getEnvironmentType)(url) : '';
  const connectionId = generateConnectionId(remotePort, detectedProcessName);
  const openConnections = openMetamaskConnections.get(connectionId) || 0;
  if (openConnections === 0 || detectedProcessName === 'background' && openConnections < 2
  // 2 background connections are allowed, one for phishing warning page and one for the ledger bridge keyring
  ) {
    // This is set in `setupController`, which is called as part of initialization
    connectRemote(...args);
    openMetamaskConnections.set(connectionId, openConnections + 1);
  } else {
    throw new Error('CONNECTION_ALREADY_EXISTS');
  }
});
_webextensionPolyfill.default.runtime.onConnectExternal.addListener(async (...args) => {
  // Queue up connection attempts here, waiting until after initialization
  await isInitialized;

  // This is set in `setupController`, which is called as part of initialization
  connectExternal(...args);
});

/**
 * @typedef {__import__('../../shared/constants/transaction').TransactionMeta} TransactionMeta
 */

/**
 * The data emitted from the MetaMaskController.store EventEmitter, also used to initialize the MetaMaskController. Available in UI on React state as state.metamask.
 *
 * @typedef MetaMaskState
 * @property {boolean} isInitialized - Whether the first vault has been created.
 * @property {boolean} isUnlocked - Whether the vault is currently decrypted and accounts are available for selection.
 * @property {boolean} isAccountMenuOpen - Represents whether the main account selection UI is currently displayed.
 * @property {boolean} isNetworkMenuOpen - Represents whether the main network selection UI is currently displayed.
 * @property {object} identities - An object matching lower-case hex addresses to Identity objects with "address" and "name" (nickname) keys.
 * @property {object} unapprovedTxs - An object mapping transaction hashes to unapproved transactions.
 * @property {object} networkConfigurations - A list of network configurations, containing RPC provider details (eg chainId, rpcUrl, rpcPreferences).
 * @property {Array} addressBook - A list of previously sent to addresses.
 * @property {object} contractExchangeRates - Info about current token prices.
 * @property {Array} tokens - Tokens held by the current user, including their balances.
 * @property {object} send - TODO: Document
 * @property {boolean} useBlockie - Indicates preferred user identicon format. True for blockie, false for Jazzicon.
 * @property {object} featureFlags - An object for optional feature flags.
 * @property {boolean} welcomeScreen - True if welcome screen should be shown.
 * @property {string} currentLocale - A locale string matching the user's preferred display language.
 * @property {object} providerConfig - The current selected network provider.
 * @property {string} providerConfig.rpcUrl - The address for the RPC API, if using an RPC API.
 * @property {string} providerConfig.type - An identifier for the type of network selected, allows MetaMask to use custom provider strategies for known networks.
 * @property {string} networkId - The stringified number of the current network ID.
 * @property {string} networkStatus - Either "unknown", "available", "unavailable", or "blocked", depending on the status of the currently selected network.
 * @property {object} accounts - An object mapping lower-case hex addresses to objects with "balance" and "address" keys, both storing hex string values.
 * @property {hex} currentBlockGasLimit - The most recently seen block gas limit, in a lower case hex prefixed string.
 * @property {TransactionMeta[]} currentNetworkTxList - An array of transactions associated with the currently selected network.
 * @property {object} unapprovedMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedMsgCount - The number of messages in unapprovedMsgs.
 * @property {object} unapprovedPersonalMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedPersonalMsgCount - The number of messages in unapprovedPersonalMsgs.
 * @property {object} unapprovedEncryptionPublicKeyMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedEncryptionPublicKeyMsgCount - The number of messages in EncryptionPublicKeyMsgs.
 * @property {object} unapprovedDecryptMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedDecryptMsgCount - The number of messages in unapprovedDecryptMsgs.
 * @property {object} unapprovedTypedMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedTypedMsgCount - The number of messages in unapprovedTypedMsgs.
 * @property {number} pendingApprovalCount - The number of pending request in the approval controller.
 * @property {string[]} keyringTypes - An array of unique keyring identifying strings, representing available strategies for creating accounts.
 * @property {Keyring[]} keyrings - An array of keyring descriptions, summarizing the accounts that are available for use, and what keyrings they belong to.
 * @property {string} selectedAddress - A lower case hex string of the currently selected address.
 * @property {string} currentCurrency - A string identifying the user's preferred display currency, for use in showing conversion rates.
 * @property {number} conversionRate - A number representing the current exchange rate from the user's preferred currency to Ether.
 * @property {number} conversionDate - A unix epoch date (ms) for the time the current conversion rate was last retrieved.
 * @property {boolean} forgottenPassword - Returns true if the user has initiated the password recovery screen, is recovering from seed phrase.
 */

/**
 * @typedef VersionedData
 * @property {MetaMaskState} data - The data emitted from MetaMask controller, or used to initialize it.
 * @property {number} version - The latest migration version that has been run.
 */

/**
 * Initializes the MetaMask controller, and sets up all platform configuration.
 *
 * @returns {Promise} Setup complete.
 */
async function initialize() {
  try {
    const initState = await loadStateFromPersistence();
    const initLangCode = await (0, _getFirstPreferredLangCode.default)();
    let isFirstMetaMaskControllerSetup;
    if (_mv.isManifestV3) {
      const sessionData = await _webextensionPolyfill.default.storage.session.get(['isFirstMetaMaskControllerSetup']);
      isFirstMetaMaskControllerSetup = (sessionData === null || sessionData === void 0 ? void 0 : sessionData.isFirstMetaMaskControllerSetup) === undefined;
      await _webextensionPolyfill.default.storage.session.set({
        isFirstMetaMaskControllerSetup
      });
    }
    setupController(initState, initLangCode, {}, isFirstMetaMaskControllerSetup);
    if (!_mv.isManifestV3) {
      await loadPhishingWarningPage();
    }
    await sendReadyMessageToTabs();
    _loglevel.default.info('MetaMask initialization complete.');
    resolveInitialization();
  } catch (error) {
    rejectInitialization(error);
  }
}

/**
 * An error thrown if the phishing warning page takes too long to load.
 */
class PhishingWarningPageTimeoutError extends Error {
  constructor() {
    super('Timeout failed');
  }
}

/**
 * Load the phishing warning page temporarily to ensure the service
 * worker has been registered, so that the warning page works offline.
 */
async function loadPhishingWarningPage() {
  let iframe;
  try {
    const extensionStartupPhishingPageUrl = new URL("https://metamask.github.io/phishing-warning/v2.1.0/");
    // The `extensionStartup` hash signals to the phishing warning page that it should not bother
    // setting up streams for user interaction. Otherwise this page load would cause a console
    // error.
    extensionStartupPhishingPageUrl.hash = '#extensionStartup';
    iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', extensionStartupPhishingPageUrl.href);
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

    // Create "deferred Promise" to allow passing resolve/reject to event handlers
    let deferredResolve;
    let deferredReject;
    const loadComplete = new Promise((resolve, reject) => {
      deferredResolve = resolve;
      deferredReject = reject;
    });

    // The load event is emitted once loading has completed, even if the loading failed.
    // If loading failed we can't do anything about it, so we don't need to check.
    iframe.addEventListener('load', deferredResolve);

    // This step initiates the page loading.
    window.document.body.appendChild(iframe);

    // This timeout ensures that this iframe gets cleaned up in a reasonable
    // timeframe, and ensures that the "initialization complete" message
    // doesn't get delayed too long.
    setTimeout(() => deferredReject(new PhishingWarningPageTimeoutError()), PHISHING_WARNING_PAGE_TIMEOUT);
    await loadComplete;
  } catch (error) {
    if (error instanceof PhishingWarningPageTimeoutError) {
      console.warn('Phishing warning page timeout; page not guaraneteed to work offline.');
    } else {
      console.error('Failed to initialize phishing warning page', error);
    }
  } finally {
    if (iframe) {
      iframe.remove();
    }
  }
}

//
// State and Persistence
//

/**
 * Loads any stored data, prioritizing the latest storage strategy.
 * Migrates that data schema in case it was last loaded on an older version.
 *
 * @returns {Promise<MetaMaskState>} Last data emitted from previous instance of MetaMask.
 */
async function loadStateFromPersistence() {
  // migrations
  const migrator = new _migrator.default({
    migrations: _migrations.default
  });
  migrator.on('error', console.warn);

  // read from disk
  // first from preferred, async API:
  versionedData = (await localStore.get()) || migrator.generateInitialState(firstTimeState);

  // check if somehow state is empty
  // this should never happen but new error reporting suggests that it has
  // for a small number of users
  // https://github.com/metamask/metamask-extension/issues/3919
  if (versionedData && !versionedData.data) {
    // unable to recover, clear state
    versionedData = migrator.generateInitialState(firstTimeState);
    sentry.captureMessage('MetaMask - Empty vault found - unable to recover');
  }

  // report migration errors to sentry
  migrator.on('error', err => {
    // get vault structure without secrets
    const vaultStructure = (0, _getObjStructure.default)(versionedData);
    sentry.captureException(err, {
      // "extra" key is required by Sentry
      extra: {
        vaultStructure
      }
    });
  });

  // migrate data
  versionedData = await migrator.migrateData(versionedData);
  if (!versionedData) {
    throw new Error('MetaMask - migrator returned undefined');
  }
  // this initializes the meta/version data as a class variable to be used for future writes
  localStore.setMetadata(versionedData.meta);

  // write to disk
  localStore.set(versionedData.data);

  // return just the data
  return versionedData.data;
}
function generateConnectionId(remotePort, detectedProcessName) {
  const {
    sender
  } = remotePort;
  const id = sender !== null && sender !== void 0 && sender.tab ? sender.tab.id : sender === null || sender === void 0 ? void 0 : sender.id;
  if (!id || !detectedProcessName) {
    console.error('Must provide id and detectedProcessName to generate connection id.', id, detectedProcessName); // eslint-disable-line no-console
    throw new Error('Must provide id and detectedProcessName to generate connection id.');
  }
  return `${id}-${detectedProcessName}`;
}
/**
 * Initializes the MetaMask Controller with any initial state and default language.
 * Configures platform-specific error reporting strategy.
 * Streams emitted state updates to platform-specific storage strategy.
 * Creates platform listeners for new Dapps/Contexts, and sets up their data connections to the controller.
 *
 * @param {object} initState - The initial state to start the controller with, matches the state that is emitted from the controller.
 * @param {string} initLangCode - The region code for the language preferred by the current user.
 * @param {object} overrides - object with callbacks that are allowed to override the setup controller logic (usefull for desktop app)
 * @param isFirstMetaMaskControllerSetup
 */
function setupController(initState, initLangCode, overrides, isFirstMetaMaskControllerSetup) {
  //
  // MetaMask Controller
  //

  controller = new _metamaskController.default({
    infuraProjectId: "a71ec5187858469f87e5e36080765f7d",
    // User confirmation callbacks:
    showUserConfirmation: triggerUi,
    // initial state
    initState,
    // initial locale code
    initLangCode,
    // platform specific api
    platform,
    notificationManager,
    browser: _webextensionPolyfill.default,
    getRequestAccountTabIds: () => {
      return requestAccountTabIds;
    },
    getOpenMetamaskTabsIds: () => {
      return openMetamaskTabsIDs;
    },
    localStore,
    overrides,
    isFirstMetaMaskControllerSetup
  });
  (0, _setup.default)({
    getCurrentChainId: () => controller.networkController.store.getState().providerConfig.chainId,
    getIpfsGateway: controller.preferencesController.getIpfsGateway.bind(controller.preferencesController),
    provider: controller.provider
  });

  // setup state persistence
  (0, _pump.default)((0, _obsStore.storeAsStream)(controller.store), (0, _debounceStream.default)(1000), (0, _createStreamSink.default)(async state => {
    await localStore.set(state);
    statePersistenceEvents.emit('state-persisted', state);
  }), error => {
    _loglevel.default.error('MetaMask - Persistence pipeline failed', error);
  });
  setupSentryGetStateGlobal(controller);
  const isClientOpenStatus = () => {
    return popupIsOpen || Boolean(Object.keys(openMetamaskTabsIDs).length) || notificationIsOpen;
  };
  const onCloseEnvironmentInstances = (isClientOpen, environmentType) => {
    // if all instances of metamask are closed we call a method on the controller to stop gasFeeController polling
    if (isClientOpen === false) {
      controller.onClientClosed();
      // otherwise we want to only remove the polling tokens for the environment type that has closed
    } else {
      // in the case of fullscreen environment a user might have multiple tabs open so we don't want to disconnect all of
      // its corresponding polling tokens unless all tabs are closed.
      if (environmentType === _app.ENVIRONMENT_TYPE_FULLSCREEN && Boolean(Object.keys(openMetamaskTabsIDs).length)) {
        return;
      }
      controller.onEnvironmentTypeClosed(environmentType);
    }
  };

  /**
   * A runtime.Port object, as provided by the browser:
   *
   * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/Port
   * @typedef Port
   * @type Object
   */

  /**
   * Connects a Port to the MetaMask controller via a multiplexed duplex stream.
   * This method identifies trusted (MetaMask) interfaces, and connects them differently from untrusted (web pages).
   *
   * @param {Port} remotePort - The port provided by a new context.
   */
  connectRemote = async remotePort => {
    var _remotePort$sender;
    const processName = remotePort.name;
    if (metamaskBlockedPorts.includes(remotePort.name)) {
      return;
    }
    let isMetaMaskInternalProcess = false;
    const sourcePlatform = (0, _util.getPlatform)();
    const senderUrl = (_remotePort$sender = remotePort.sender) !== null && _remotePort$sender !== void 0 && _remotePort$sender.url ? new URL(remotePort.sender.url) : null;
    if (sourcePlatform === _app.PLATFORM_FIREFOX) {
      isMetaMaskInternalProcess = metamaskInternalProcessHash[processName];
    } else {
      isMetaMaskInternalProcess = (senderUrl === null || senderUrl === void 0 ? void 0 : senderUrl.origin) === `chrome-extension://${_webextensionPolyfill.default.runtime.id}`;
    }
    if (isMetaMaskInternalProcess) {
      var _overrides$getPortStr;
      const portStream = (overrides === null || overrides === void 0 ? void 0 : (_overrides$getPortStr = overrides.getPortStream) === null || _overrides$getPortStr === void 0 ? void 0 : _overrides$getPortStr.call(overrides, remotePort)) || new _extensionPortStream.default(remotePort);
      // communication with popup
      controller.isClientOpen = true;
      controller.setupTrustedCommunication(portStream, remotePort.sender);
      if (_mv.isManifestV3) {
        // If we get a WORKER_KEEP_ALIVE message, we respond with an ACK
        remotePort.onMessage.addListener(message => {
          if (message.name === WORKER_KEEP_ALIVE_MESSAGE) {
            // To test un-comment this line and wait for 1 minute. An error should be shown on MetaMask UI.
            remotePort.postMessage({
              name: ACK_KEEP_ALIVE_MESSAGE
            });
            controller.appStateController.setServiceWorkerLastActiveTime(Date.now());
          }
        });
      }
      const connectionId = generateConnectionId(remotePort, processName);
      if (processName === _app.ENVIRONMENT_TYPE_POPUP) {
        popupIsOpen = true;
        (0, _endOfStream.default)(portStream, () => {
          openMetamaskConnections.set(connectionId, 0);
          popupIsOpen = false;
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(isClientOpen, _app.ENVIRONMENT_TYPE_POPUP);
        });
      }
      if (processName === _app.ENVIRONMENT_TYPE_NOTIFICATION) {
        notificationIsOpen = true;
        (0, _endOfStream.default)(portStream, () => {
          openMetamaskConnections.set(connectionId, 0);
          notificationIsOpen = false;
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(isClientOpen, _app.ENVIRONMENT_TYPE_NOTIFICATION);
        });
      }
      if (processName === _app.ENVIRONMENT_TYPE_FULLSCREEN) {
        const tabId = remotePort.sender.tab.id;
        openMetamaskTabsIDs[tabId] = true;
        (0, _endOfStream.default)(portStream, () => {
          openMetamaskConnections.set(connectionId, 0);
          delete openMetamaskTabsIDs[tabId];
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(isClientOpen, _app.ENVIRONMENT_TYPE_FULLSCREEN);
        });
      }
    } else if (senderUrl && senderUrl.origin === phishingPageUrl.origin && senderUrl.pathname === phishingPageUrl.pathname) {
      var _overrides$getPortStr2;
      const portStream = (overrides === null || overrides === void 0 ? void 0 : (_overrides$getPortStr2 = overrides.getPortStream) === null || _overrides$getPortStr2 === void 0 ? void 0 : _overrides$getPortStr2.call(overrides, remotePort)) || new _extensionPortStream.default(remotePort);
      controller.setupPhishingCommunication({
        connectionStream: portStream
      });
    } else {
      if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url) {
        const tabId = remotePort.sender.tab.id;
        const url = new URL(remotePort.sender.url);
        const {
          origin
        } = url;
        remotePort.onMessage.addListener(msg => {
          if (msg.data && msg.data.method === 'eth_requestAccounts') {
            requestAccountTabIds[origin] = tabId;
          }
        });
      }
      connectExternal(remotePort);
    }
  };

  // communication with page or other extension
  connectExternal = remotePort => {
    var _overrides$getPortStr3;
    const portStream = (overrides === null || overrides === void 0 ? void 0 : (_overrides$getPortStr3 = overrides.getPortStream) === null || _overrides$getPortStr3 === void 0 ? void 0 : _overrides$getPortStr3.call(overrides, remotePort)) || new _extensionPortStream.default(remotePort);
    controller.setupUntrustedCommunication({
      connectionStream: portStream,
      sender: remotePort.sender
    });
  };
  if (overrides !== null && overrides !== void 0 && overrides.registerConnectListeners) {
    overrides.registerConnectListeners(connectRemote, connectExternal);
  }

  //
  // User Interface setup
  //

  controller.txController.initApprovals().then(() => {
    updateBadge();
  });
  controller.txController.on(_metamaskController.METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE, updateBadge);
  controller.decryptMessageController.hub.on(_metamaskController.METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE, updateBadge);
  controller.encryptionPublicKeyController.hub.on(_metamaskController.METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE, updateBadge);
  controller.signatureController.hub.on(_metamaskController.METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE, updateBadge);
  controller.appStateController.on(_metamaskController.METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE, updateBadge);
  controller.controllerMessenger.subscribe(_metamaskController.METAMASK_CONTROLLER_EVENTS.APPROVAL_STATE_CHANGE, updateBadge);

  /**
   * Updates the Web Extension's "badge" number, on the little fox in the toolbar.
   * The number reflects the current number of pending transactions or message signatures needing user approval.
   */
  function updateBadge() {
    let label = '';
    const count = getUnapprovedTransactionCount();
    if (count) {
      label = String(count);
    }
    // browserAction has been replaced by action in MV3
    if (_mv.isManifestV3) {
      _webextensionPolyfill.default.action.setBadgeText({
        text: label
      });
      _webextensionPolyfill.default.action.setBadgeBackgroundColor({
        color: '#037DD6'
      });
    } else {
      _webextensionPolyfill.default.browserAction.setBadgeText({
        text: label
      });
      _webextensionPolyfill.default.browserAction.setBadgeBackgroundColor({
        color: '#037DD6'
      });
    }
  }
  function getUnapprovedTransactionCount() {
    const pendingApprovalCount = controller.approvalController.getTotalApprovalCount();
    const waitingForUnlockCount = controller.appStateController.waitingForUnlock.length;
    return pendingApprovalCount + waitingForUnlockCount;
  }
  notificationManager.on(_notificationManager.NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, ({
    automaticallyClosed
  }) => {
    if (!automaticallyClosed) {
      rejectUnapprovedNotifications();
    } else if (getUnapprovedTransactionCount() > 0) {
      triggerUi();
    }
  });
  function rejectUnapprovedNotifications() {
    Object.keys(controller.txController.txStateManager.getUnapprovedTxList()).forEach(txId => controller.txController.txStateManager.setTxStatusRejected(txId));
    controller.signatureController.rejectUnapproved(_metametrics.REJECT_NOTIFICATION_CLOSE_SIG);
    controller.decryptMessageController.rejectUnapproved(_metametrics.REJECT_NOTIFICATION_CLOSE);
    controller.encryptionPublicKeyController.rejectUnapproved(_metametrics.REJECT_NOTIFICATION_CLOSE);

    // Finally, resolve snap dialog approvals on Flask and reject all the others managed by the ApprovalController.
    Object.values(controller.approvalController.state.pendingApprovals).forEach(({
      id,
      type
    }) => {
      switch (type) {
        default:
          controller.approvalController.reject(id, _ethRpcErrors.ethErrors.provider.userRejectedRequest());
          break;
      }
    });
    updateBadge();
  }
}

//
// Etc...
//

/**
 * Opens the browser popup for user confirmation
 */
async function triggerUi() {
  const tabs = await platform.getActiveTabs();
  const currentlyActiveMetamaskTab = Boolean(tabs.find(tab => openMetamaskTabsIDs[tab.id]));
  // Vivaldi is not closing port connection on popup close, so popupIsOpen does not work correctly
  // To be reviewed in the future if this behaviour is fixed - also the way we determine isVivaldi variable might change at some point
  const isVivaldi = tabs.length > 0 && tabs[0].extData && tabs[0].extData.indexOf('vivaldi_tab') > -1;
  if (!uiIsTriggering && (isVivaldi || !popupIsOpen) && !currentlyActiveMetamaskTab) {
    uiIsTriggering = true;
    try {
      const currentPopupId = controller.appStateController.getCurrentPopupId();
      await notificationManager.showPopup(newPopupId => controller.appStateController.setCurrentPopupId(newPopupId), currentPopupId);
    } finally {
      uiIsTriggering = false;
    }
  }
}

// It adds the "App Installed" event into a queue of events, which will be tracked only after a user opts into metrics.
const addAppInstalledEvent = () => {
  if (controller) {
    controller.metaMetricsController.updateTraits({
      [_metametrics.MetaMetricsUserTrait.InstallDateExt]: new Date().toISOString().split('T')[0] // yyyy-mm-dd
    });

    controller.metaMetricsController.addEventBeforeMetricsOptIn({
      category: _metametrics.MetaMetricsEventCategory.App,
      event: _metametrics.MetaMetricsEventName.AppInstalled,
      properties: {}
    });
    return;
  }
  setTimeout(() => {
    // If the controller is not set yet, we wait and try to add the "App Installed" event again.
    addAppInstalledEvent();
  }, 1000);
};

// On first install, open a new tab with MetaMask
_webextensionPolyfill.default.runtime.onInstalled.addListener(({
  reason
}) => {
  if (reason === 'install' && !(true || false)) {
    addAppInstalledEvent();
    platform.openExtensionInBrowser();
  }
});
function setupSentryGetStateGlobal(store) {
  global.stateHooks.getSentryState = function () {
    const fullState = store.getState();
    const debugState = (0, _object.maskObject)({
      metamask: fullState
    }, _setupSentry.SENTRY_STATE);
    return {
      browser: window.navigator.userAgent,
      store: debugState,
      version: platform.getVersion()
    };
  };
}
function initBackground() {
  initialize().catch(_loglevel.default.error);
}
if (!false) {
  initBackground();
}


      };
    };
  }
  }
}, {package:"$root$",file:"app\\scripts\\background.js",}]],["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\scripts\\background.js"],{})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy90aHJvdWdoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Rpbnktc2VjcDI1NmsxL2pzLmpzIiwibm9kZV9tb2R1bGVzL3Rpbnktc2VjcDI1NmsxL3JmYzY5NzkuanMiLCJub2RlX21vZHVsZXMvdG8tZGF0YS12aWV3L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3R3ZWV0bmFjbC11dGlsL25hY2wtdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy90d2VldG5hY2wvbmFjbC1mYXN0LmpzIiwibm9kZV9tb2R1bGVzL3R5cGVmb3JjZS9lcnJvcnMuanMiLCJub2RlX21vZHVsZXMvdHlwZWZvcmNlL2V4dHJhLmpzIiwibm9kZV9tb2R1bGVzL3R5cGVmb3JjZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90eXBlZm9yY2UvbmF0aXZlLmpzIiwibm9kZV9tb2R1bGVzL3VpbnQ4YXJyYXlzL2NvbmNhdC5qcyIsIm5vZGVfbW9kdWxlcy91aW50OGFycmF5cy9lcXVhbHMuanMiLCJub2RlX21vZHVsZXMvdWludDhhcnJheXMvZnJvbS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvdWludDhhcnJheXMvdG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3ZhcnVpbnQtYml0Y29pbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93ZWItZW5jb2Rpbmcvc3JjL2xpYi5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZGlzdC9mZXRjaC51bWQuanMiLCJub2RlX21vZHVsZXMvd2lmL2luZGV4LmpzIiwic2hhcmVkL2NvbnN0YW50cy9hbGFybXMuanMiLCJzaGFyZWQvY29uc3RhbnRzL3NtYXJ0VHJhbnNhY3Rpb25zLmpzIiwic2hhcmVkL2NvbnN0YW50cy90ZXN0LWZsYWdzLmpzIiwiYXBwL3NjcmlwdHMvYmFja2dyb3VuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3YxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9ETyxNQUFNLHVCQUF1QixHQUFHLHlCQUF5QjtBQUFDLE9BQUEsQ0FBQSx1QkFBQSxHQUFBLHVCQUFBO0FBQzFELE1BQU0seUNBQXlDLEdBQ3BELDJDQUEyQztBQUFDLE9BQUEsQ0FBQSx5Q0FBQSxHQUFBLHlDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0Y5QyxJQUFBLEtBQUEsR0FBQSxPQUFBO0FBRU8sTUFBTSx3Q0FBd0MsR0FBRyxZQUFNLEdBQUcsRUFBRTtBQUFDLE9BQUEsQ0FBQSx3Q0FBQSxHQUFBLHdDQUFBO0FBQzdELE1BQU0sb0NBQW9DLEdBQUcsR0FBRztBQUFDLE9BQUEsQ0FBQSxvQ0FBQSxHQUFBLG9DQUFBO0FBQ2pELE1BQU0sOENBQThDLEdBQUcsQ0FBQztBQUFDLE9BQUEsQ0FBQSw4Q0FBQSxHQUFBLDhDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0p6RCxNQUFNLDZCQUE2QixHQUFHLCtCQUErQjtBQUFDLE9BQUEsQ0FBQSw2QkFBQSxHQUFBLDZCQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSTdFLElBQUEsVUFBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxlQUFBLHNCQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFFBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsa0JBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFlBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsd0JBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFlBQUEsT0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsdUJBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBLENBQUE7QUFFQSxJQUFBLGdCQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxJQUFBLE9BQUEsT0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQU9BLElBQUEsZUFBQSxPQUFBLENBQUEsb0NBQUEsQ0FBQSxDQUFBO0FBT0EsSUFBQSxrQkFBQSxPQUFBLENBQUEsNENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxNQUFBLE9BQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLFVBQUEsT0FBQSxDQUFBLG1DQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsUUFBQSxPQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxJQUFBLGNBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsWUFBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsYUFBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsY0FBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsZ0JBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEscUJBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLGVBQUEsT0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtBQUVBLElBQUEsb0JBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLHVCQUFBLHVCQUFBLENBQUEsT0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQSxDQUFBO0FBR0EsSUFBQSxzQkFBQSx1QkFBQSxDQUFBLE9BQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsQ0FBQTtBQUdBLElBQUEsa0JBQUEsc0JBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxJQUFBLDZCQUFBLHNCQUFBLENBQUEsT0FBQSxDQUFBLHFDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxtQkFBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLElBQUEsU0FBQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUF3RCwrQ0FBQSxFQUFBLElBQUEsT0FBQSxPQUFBLEtBQUEsVUFBQSxFQUFBLE9BQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxvQkFBQSxJQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxtQkFBQSxJQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLDJCQUFBLHVCQUFBLEVBQUEsT0FBQSxXQUFBLEdBQUEsZ0JBQUEsR0FBQSxpQkFBQSxDQUFBLEVBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQSxFQUFBO0FBQUEsbURBQUEsRUFBQSxJQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsRUFBQSxFQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxJQUFBLElBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUFBLE9BQUEsR0FBQSxLQUFBLFVBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLFFBQUEsd0JBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsS0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxTQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsd0JBQUEsTUFBQSxlQUFBLElBQUEsTUFBQSx5QkFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEVBQUEsRUFBQSxJQUFBLEdBQUEsS0FBQSxTQUFBLElBQUEsTUFBQSxVQUFBLGVBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsT0FBQSxxQkFBQSxHQUFBLE1BQUEseUJBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsSUFBQSxJQUFBLElBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsZUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLE1BQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsS0FBQSxFQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQUEscUNBQUEsRUFBQSxPQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUE7Ozs7Ozs7OztBQU94RCxNQUFNOztDQUFVLEdBQUcsTUFBTSxDQUFBO0FBQ3pCLE1BQU0saUJBQWlCO0VBQUUsR0FBRyxlQUFBLFFBQUE7Q0FBbUIsQ0FBQTtBQUUvQyxNQUFNLDhCQUE4QjtFQUNsQyxDQUFDLElBQUEsdUJBQXNCLEdBQUcsSUFBSTtFQUM5QixDQUFDLElBQUEsOEJBQTZCLEdBQUcsSUFBSTtFQUNyQyxDQUFDLElBQUEsNEJBQTJCLEdBQUcsSUFBQTtDQUNoQyxDQUFBO0FBRUQsTUFBTSx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBRS9DLFNBQUEsUUFBRyxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksZUFBZSxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQTtBQUVsRSxNQUFNLFdBQVcsSUFBSSxVQUFBLFFBQWlCLEVBQUUsQ0FBQTtBQUN4QyxNQUFNLHNCQUFzQixJQUFJLG9CQUFBLFFBQW1CLEVBQUUsQ0FBQTtBQUVyRCxJQUFJLGNBQWMsS0FBSyxDQUFBO0FBQ3ZCLElBQUkscUJBQXFCLEtBQUssQ0FBQTtBQUM5QixJQUFJLGlCQUFpQixLQUFLLENBQUE7QUFDMUIsTUFBTSxzQkFBc0IsRUFBRSxDQUFBO0FBQzlCLE1BQU0sMEJBQTBCLElBQUksR0FBRyxFQUFFLENBQUE7QUFDekMsTUFBTSx1QkFBdUIsRUFBRSxDQUFBO0FBQy9CLElBQUksVUFBVSxDQUFBOzs7QUFHZCxNQUFNLFNBQVMsT0FBTyxJQUFJLFFBQVEsQ0FBQTtBQUNsQyxNQUFNLGFBQWEsTUFBTSxHQUFHLElBQUksYUFBQSxRQUFvQixFQUFFLEdBQUcsSUFBSSxXQUFBLFFBQVUsRUFBRSxDQUFBO0FBQ3pFLElBQUksYUFBYSxDQUFBO0FBRWpCLElBQUksTUFBTSxJQUFJLE9BQU8sSUFBSSxlQUFlLEVBQUU7RUFDeEMsTUFBTSxXQUFXLGlCQUFpQixHQUFHLFVBQVUsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7Q0FDdEU7QUFFQSxNQUFNLGtCQUFrQixJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksMEJBQTBCLENBQUMsQ0FBQTtBQUV0RSxNQUFNLDZCQUE2QixLQUFLLENBQUE7O0FBRXhDLE1BQU0sZ0NBQWdDLDBCQUEwQixDQUFBO0FBRWhFLE1BQU0seUJBQXlCLHdCQUF3QixDQUFBO0FBQ3ZELE1BQU0sNEJBQTRCLDJCQUEyQixDQUFBOzs7QUFJdEQsTUFBTSx5QkFBeUIsSUFBSSxPQUFBLFFBQVksRUFBRSxDQUFBOzs7Ozs7Ozs7QUFFeEQsT0FBQSx1QkFBQSxHQUFBLHNCQUFBLENBQUE7QUFPQSxNQUFNOzs7O0NBSUwsR0FBRyxDQUFBLENBQUEsRUFBQSxLQUFBLGdCQUFlLEdBQUUsQ0FBQTs7Ozs7OztBQU9yQixNQUFNLHlCQUF5QixZQUFZO0VBQ3pDLE1BQU0sT0FBTyxNQUFNLHFCQUFBLFFBQU8sS0FBSyxNQUN2QixDQUFDOzs7Ozs7Ozs7Ozs7OztJQWNMLEtBQUssWUFBWTtJQUNqQixZQUFZLFFBQUE7R0FDYixDQUFDLEtBQ0csQ0FBRSxVQUFXO0lBQ2hCLENBQUEsQ0FBQSxFQUFBLGVBQUEsd0JBQXVCLEdBQUUsQ0FBQTtJQUN6QixPQUFPLE1BQU0sQ0FBQTtHQUNkLENBQUMsTUFDSSxDQUFDLE1BQU07SUFDWCxDQUFBLENBQUEsRUFBQSxlQUFBLHdCQUF1QixHQUFFLENBQUE7R0FDMUIsQ0FBQyxDQUFBOzs7RUFHSixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtJQUN0QixxQkFBQSxRQUFPLEtBQUssWUFDRSxDQUFDLEdBQUcsR0FBRyxFQUFFO01BQ25CLE1BQU0sSUFBQSxtQkFBa0IsTUFBQztLQUMxQixDQUFDLEtBQ0csQ0FBQyxNQUFNO01BQ1YsQ0FBQSxDQUFBLEVBQUEsZUFBQSx3QkFBdUIsR0FBRSxDQUFBO0tBQzFCLENBQUMsTUFDSSxDQUFDLE1BQU07OztNQUdYLENBQUEsQ0FBQSxFQUFBLGVBQUEsd0JBQXVCLEdBQUUsQ0FBQTtLQUMxQixDQUFDLENBQUE7R0FDTjtDQUNELENBQUE7OztBQUdELElBQUksYUFBYSxDQUFBO0FBQ2pCLElBQUksZUFBZSxDQUFBO0FBRW5CLHFCQUFBLFFBQU8sUUFBUSxVQUFVLFlBQVksQ0FBQyxPQUFPLE9BQU8sS0FBSzs7RUFFdkQsTUFBTSxhQUFhLENBQUE7RUFDbkIsTUFBTSxhQUFhLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUMxQixNQUFNOztHQUFVLEdBQUcsVUFBVSxDQUFBO0VBRTdCLE1BQU0sTUFBTSxNQUFNLEtBQUEsSUFBQSxJQUFOLE1BQU0sS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBTixNQUFNLElBQUssQ0FBQTtFQUN2QixNQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQSxDQUFBLEVBQUEsS0FBQSxtQkFBa0IsRUFBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7RUFFOUQsTUFBTSxlQUFlLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFBO0VBQzFFLE1BQU0sa0JBQWtCLHVCQUF1QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0VBRXRFLElBQ0UsZUFBZSxLQUFLLENBQUMsSUFDcEIsbUJBQW1CLEtBQUssWUFBWSxJQUFJLGVBQWUsR0FBRyxDQUFBOztJQUUzRDs7SUFFQSxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUN0Qix1QkFBdUIsSUFBSSxDQUFDLFlBQVksRUFBRSxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDL0QsTUFBTTtJQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtHQUM5QztDQUNELENBQUMsQ0FBQTtBQUVGLHFCQUFBLFFBQU8sUUFBUSxrQkFBa0IsWUFBWSxDQUFDLE9BQU8sT0FBTyxLQUFLOztFQUUvRCxNQUFNLGFBQWEsQ0FBQTs7O0VBR25CLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0NBQ3pCLENBQUMsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdFRiw0QkFBNEI7RUFDMUIsSUFBSTtJQUNGLE1BQU0sWUFBWSxNQUFNLHdCQUF3QixFQUFFLENBQUE7SUFDbEQsTUFBTSxlQUFlLE1BQU0sQ0FBQSxDQUFBLEVBQUEsMEJBQUEsUUFBeUIsR0FBRSxDQUFBO0lBR3RELElBQUksOEJBQThCLENBQUE7SUFDbEMsSUFBSSxHQUFBLGFBQVksRUFBRTtNQUNoQixNQUFNLGNBQWMsTUFBTSxxQkFBQSxRQUFPLFFBQVEsUUFBUSxJQUFJLENBQUMsQ0FDcEQsZ0NBQWdDLENBQ2pDLENBQUMsQ0FBQTtNQUVGLGlDQUNFLENBQUEsV0FBVyxLQUFBLElBQUEsSUFBWCxXQUFXLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQVgsV0FBVywrQkFBZ0MsTUFBSyxTQUFTLENBQUE7TUFDM0QsTUFBTSxxQkFBQSxRQUFPLFFBQVEsUUFBUSxJQUFJLENBQUM7UUFBRSw4QkFBQTtPQUFnQyxDQUFDLENBQUE7S0FDdkU7SUFFQSxlQUFlLENBQ2IsU0FBUyxFQUNULFlBQVksRUFDWixFQUFFLEVBQ0YsOEJBQ0YsQ0FBQyxDQUFBO0lBQ0QsSUFBSSxDQUFDLEdBQUEsYUFBWSxFQUFFO01BQ2pCLE1BQU0sdUJBQXVCLEVBQUUsQ0FBQTtLQUNqQztJQUNBLE1BQU0sc0JBQXNCLEVBQUUsQ0FBQTtJQUM5QixTQUFBLFFBQUcsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7SUFDN0MscUJBQXFCLEVBQUUsQ0FBQTtHQUN4QixDQUFDLGNBQWM7SUFDZCxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUM3QjtDQUNGOzs7OztBQUtBLDhDQUE4QyxLQUFLLENBQUM7RUFDbEQsV0FBVyxHQUFHO0lBQ1osS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUE7R0FDekI7Q0FDRjs7Ozs7O0FBTUEseUNBQXlDO0VBQ3ZDLElBQUksTUFBTSxDQUFBO0VBQ1YsSUFBSTtJQUNGLE1BQU0sa0NBQWtDLElBQUksR0FBRyxDQUM3QyxPQUFPLElBQUksMEJBQ2IsQ0FBQyxDQUFBOzs7O0lBSUQsK0JBQStCLEtBQUssR0FBRyxtQkFBbUIsQ0FBQTtJQUUxRCxTQUFTLE1BQU0sU0FBUyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDaEQsTUFBTSxhQUFhLENBQUMsS0FBSyxFQUFFLCtCQUErQixLQUFLLENBQUMsQ0FBQTtJQUNoRSxNQUFNLGFBQWEsQ0FBQyxTQUFTLEVBQUUsaUNBQWlDLENBQUMsQ0FBQTs7O0lBR2pFLElBQUksZUFBZSxDQUFBO0lBQ25CLElBQUksY0FBYyxDQUFBO0lBQ2xCLE1BQU0sZUFBZSxJQUFJLE9BQU8sQ0FBQyxxQkFBcUI7TUFDcEQsa0JBQWtCLE9BQU8sQ0FBQTtNQUN6QixpQkFBaUIsTUFBTSxDQUFBO0tBQ3hCLENBQUMsQ0FBQTs7OztJQUlGLE1BQU0saUJBQWlCLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFBOzs7SUFHaEQsTUFBTSxTQUFTLEtBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBOzs7OztJQUt4QyxVQUFVLENBQ1IsTUFBTSxjQUFjLENBQUMsSUFBSSwrQkFBK0IsRUFBRSxDQUFDLEVBQzNELDZCQUNGLENBQUMsQ0FBQTtJQUNELE1BQU0sWUFBWSxDQUFBO0dBQ25CLENBQUMsY0FBYztJQUNkLElBQUksS0FBSyxZQUFZLCtCQUErQixFQUFFO01BQ3BELE9BQU8sS0FBSyxDQUNWLHNFQUNGLENBQUMsQ0FBQTtLQUNGLE1BQU07TUFDTCxPQUFPLE1BQU0sQ0FBQyw0Q0FBNEMsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUNwRTtHQUNELFNBQVM7SUFDUixJQUFJLE1BQU0sRUFBRTtNQUNWLE1BQU0sT0FBTyxFQUFFLENBQUE7S0FDakI7R0FDRjtDQUNGOzs7Ozs7Ozs7Ozs7QUFZTywwQ0FBMEM7O0VBRS9DLE1BQU0sV0FBVyxJQUFJLFNBQUEsUUFBUSxDQUFDO0lBQUUsWUFBQSxXQUFBLFFBQUE7R0FBWSxDQUFDLENBQUE7RUFDN0MsUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sS0FBSyxDQUFDLENBQUE7Ozs7RUFJbEMsZ0JBQ0UsQ0FBQyxNQUFNLFVBQVUsSUFBSSxFQUFFLEtBQUssUUFBUSxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsQ0FBQTs7Ozs7O0VBTTNFLElBQUksYUFBYSxJQUFJLENBQUMsYUFBYSxLQUFLLEVBQUU7O0lBRXhDLGdCQUFnQixRQUFRLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQzdELE1BQU0sZUFBZSxDQUFDLGtEQUFrRCxDQUFDLENBQUE7R0FDM0U7OztFQUdBLFFBQVEsR0FBRyxDQUFDLE9BQU8sRUFBRyxPQUFROztJQUU1QixNQUFNLGlCQUFpQixDQUFBLENBQUEsRUFBQSxnQkFBQSxRQUFlLEVBQUMsYUFBYSxDQUFDLENBQUE7SUFDckQsTUFBTSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7O01BRTNCLE9BQU87UUFBRSxjQUFBO09BQWU7S0FDekIsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOzs7RUFHRixnQkFBZ0IsTUFBTSxRQUFRLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQTtFQUN6RCxJQUFJLENBQUMsYUFBYSxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtHQUMzRDs7RUFFQSxVQUFVLFlBQVksQ0FBQyxhQUFhLEtBQUssQ0FBQyxDQUFBOzs7RUFHMUMsVUFBVSxJQUFJLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQTs7O0VBR2xDLE9BQU8sYUFBYSxLQUFLLENBQUE7Q0FDM0I7QUFFQSwrREFBK0Q7RUFDN0QsTUFBTTs7R0FBVSxHQUFHLFVBQVUsQ0FBQTtFQUM3QixNQUFNLEtBQUssTUFBTSxLQUFBLElBQUEsSUFBTixNQUFNLEtBQUEsS0FBQSxDQUFBLElBQU4sTUFBTSxJQUFLLEdBQUcsTUFBTSxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUEsSUFBQSxJQUFOLE1BQU0sS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBTixNQUFNLEdBQUksQ0FBQTtFQUNuRCxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7SUFDL0IsT0FBTyxNQUFNLENBQ1gsb0VBQW9FLEVBQ3BFLEVBQUUsRUFDRixtQkFDRixDQUFDLENBQUM7SUFDRixNQUFNLElBQUksS0FBSyxDQUNiLG9FQUNGLENBQUMsQ0FBQTtHQUNIO0VBQ0EsT0FBUSxDQUFBLEVBQUUsRUFBRyxDQUFBLENBQUEsRUFBRyxtQkFBb0IsQ0FBQSxDQUFDLENBQUE7Q0FDdkM7Ozs7Ozs7Ozs7OztBQVlPLDZGQUtMOzs7OztFQUtBLGFBQWEsSUFBSSxtQkFBQSxRQUFrQixDQUFDO0lBQ2xDLGlCQUFpQixPQUFPLElBQUksa0JBQWtCOztJQUU5QyxzQkFBc0IsU0FBUzs7SUFFL0IsU0FBUzs7SUFFVCxZQUFZOztJQUVaLFFBQVE7SUFDUixtQkFBbUI7SUFDbkIsU0FBQSxxQkFBQSxRQUFPO0lBQ1AseUJBQXlCLE1BQU07TUFDN0IsT0FBTyxvQkFBb0IsQ0FBQTtLQUM1QjtJQUNELHdCQUF3QixNQUFNO01BQzVCLE9BQU8sbUJBQW1CLENBQUE7S0FDM0I7SUFDRCxVQUFVO0lBQ1YsU0FBUztJQUNULDhCQUFBO0dBQ0QsQ0FBQyxDQUFBO0VBRUYsQ0FBQSxDQUFBLEVBQUEsTUFBQSxRQUFvQixFQUFDO0lBQ25CLG1CQUFtQixNQUNqQixVQUFVLGtCQUFrQixNQUFNLFNBQVMsRUFBRSxlQUFlLFFBQVE7SUFDdEUsZ0JBQWdCLFVBQVUsc0JBQXNCLGVBQWUsS0FBSyxDQUNsRSxVQUFVLHNCQUNaLENBQUM7SUFDRCxVQUFVLFVBQVUsU0FBQztHQUN0QixDQUFDLENBQUE7OztFQUdGLENBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBSSxFQUNGLENBQUEsQ0FBQSxFQUFBLFNBQUEsY0FBYSxFQUFDLFVBQVUsTUFBTSxDQUFDLEVBQy9CLENBQUEsQ0FBQSxFQUFBLGVBQUEsUUFBUSxFQUFDLElBQUksQ0FBQyxFQUNkLENBQUEsQ0FBQSxFQUFBLGlCQUFBLFFBQWdCLEVBQUMsZUFBaUI7SUFDaEMsTUFBTSxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMzQixzQkFBc0IsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQ3RELENBQUMsRUFDRCxTQUFVO0lBQ1QsU0FBQSxRQUFHLE1BQU0sQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUU5RCxDQUFDLENBQUE7RUFFRCx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtFQUVyQyxNQUFNLHFCQUFxQixNQUFNO0lBQy9CLE9BQ0UsV0FBVyxJQUNYLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFDaEQsa0JBQWtCLENBQUE7R0FFckIsQ0FBQTtFQUVELE1BQU0sOEJBQThCLG1DQUFtQzs7SUFFckUsSUFBSSxZQUFZLEtBQUssS0FBSyxFQUFFO01BQzFCLFVBQVUsZUFBZSxFQUFFLENBQUE7O0tBRTVCLE1BQU07OztNQUdMLElBQ0UsZUFBZSxLQUFLLElBQUEsNEJBQTJCLElBQy9DLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFDaEQ7UUFDQSxPQUFBO09BQ0Y7TUFDQSxVQUFVLHdCQUF3QixDQUFDLGVBQWUsQ0FBQyxDQUFBO0tBQ3JEO0dBQ0QsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRCxnQkFBZ0Isb0JBQXNCO0lBQUEsSUFBQSxrQkFBQSxDQUFBO0lBRXBDLE1BQU0sY0FBYyxVQUFVLEtBQUssQ0FBQTtJQUVuQyxJQUFJLG9CQUFvQixTQUFTLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRTtNQUNsRCxPQUFBO0tBQ0Y7SUFFQSxJQUFJLDRCQUE0QixLQUFLLENBQUE7SUFDckMsTUFBTSxpQkFBaUIsQ0FBQSxDQUFBLEVBQUEsS0FBQSxZQUFXLEdBQUUsQ0FBQTtJQUNwQyxNQUFNLFlBQVksQ0FBQSxxQkFBQSxVQUFVLE9BQU8sTUFBQSxJQUFBLElBQUEsa0JBQUEsS0FBQSxLQUFBLENBQUEsSUFBakIsa0JBQUEsSUFBc0IsR0FDcEMsSUFBSSxHQUFHLENBQUMsVUFBVSxPQUFPLElBQUksQ0FBQyxHQUM5QixJQUFJLENBQUE7SUFFUixJQUFJLGNBQWMsS0FBSyxJQUFBLGlCQUFnQixFQUFFO01BQ3ZDLDRCQUE0QiwyQkFBMkIsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUNyRSxNQUFNO01BQ0wsNEJBQ0UsQ0FBQSxTQUFTLEtBQUEsSUFBQSxJQUFULFNBQVMsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBVCxTQUFTLE9BQVEsTUFBTSxDQUFBLG1CQUFBLEVBQXFCLHFCQUFBLFFBQU8sUUFBUSxHQUFJLENBQUEsQ0FBQyxDQUFBO0tBQ3BFO0lBRUEsSUFBSSx5QkFBeUIsRUFBRTtNQUFBLElBQUEscUJBQUEsQ0FBQTtNQUM3QixNQUFNLGFBQ0osQ0FBQSxTQUFTLEtBQUEsSUFBQSxJQUFULFNBQVMsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHdCQUFULFNBQVMsY0FBZSxNQUFBLElBQUEsSUFBQSxxQkFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUF4QixxQkFBQSxLQUFBLENBQUEsU0FBUyxFQUFrQixVQUFVLENBQUMsS0FBSSxJQUFJLG9CQUFBLFFBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7TUFFdEUsVUFBVSxhQUFhLEdBQUcsSUFBSSxDQUFBO01BQzlCLFVBQVUsMEJBQTBCLENBQUMsVUFBVSxFQUFFLFVBQVUsT0FBTyxDQUFDLENBQUE7TUFDbkUsSUFBSSxHQUFBLGFBQVksRUFBRTs7UUFFaEIsVUFBVSxVQUFVLFlBQVksQ0FBRSxXQUFZO1VBQzVDLElBQUksT0FBTyxLQUFLLEtBQUsseUJBQXlCLEVBQUU7O1lBRTlDLFVBQVUsWUFBWSxDQUFDO2NBQUUsTUFBTSxzQkFBQTthQUF3QixDQUFDLENBQUE7WUFFeEQsVUFBVSxtQkFBbUIsK0JBQStCLENBQzFELElBQUksSUFBSSxFQUNWLENBQUMsQ0FBQTtXQUNIO1NBQ0QsQ0FBQyxDQUFBO09BQ0o7TUFFQSxNQUFNLGVBQWUsb0JBQW9CLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFBO01BQ2xFLElBQUksV0FBVyxLQUFLLElBQUEsdUJBQXNCLEVBQUU7UUFDMUMsY0FBYyxJQUFJLENBQUE7UUFDbEIsQ0FBQSxDQUFBLEVBQUEsWUFBQSxRQUFXLEVBQUMsVUFBVSxFQUFFLE1BQU07VUFDNUIsdUJBQXVCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7VUFDNUMsY0FBYyxLQUFLLENBQUE7VUFDbkIsTUFBTSxlQUFlLGtCQUFrQixFQUFFLENBQUE7VUFDekMsVUFBVSxhQUFhLEdBQUcsWUFBWSxDQUFBO1VBQ3RDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxJQUFBLHVCQUFzQixDQUFDLENBQUE7U0FDbEUsQ0FBQyxDQUFBO09BQ0o7TUFFQSxJQUFJLFdBQVcsS0FBSyxJQUFBLDhCQUE2QixFQUFFO1FBQ2pELHFCQUFxQixJQUFJLENBQUE7UUFDekIsQ0FBQSxDQUFBLEVBQUEsWUFBQSxRQUFXLEVBQUMsVUFBVSxFQUFFLE1BQU07VUFDNUIsdUJBQXVCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7VUFDNUMscUJBQXFCLEtBQUssQ0FBQTtVQUMxQixNQUFNLGVBQWUsa0JBQWtCLEVBQUUsQ0FBQTtVQUN6QyxVQUFVLGFBQWEsR0FBRyxZQUFZLENBQUE7VUFDdEMsMkJBQTJCLENBQ3pCLFlBQVksRUFDWixJQUFBLDhCQUNGLENBQUMsQ0FBQTtTQUNGLENBQUMsQ0FBQTtPQUNKO01BRUEsSUFBSSxXQUFXLEtBQUssSUFBQSw0QkFBMkIsRUFBRTtRQUMvQyxNQUFNLFFBQVEsVUFBVSxPQUFPLElBQUksR0FBRyxDQUFBO1FBQ3RDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUVqQyxDQUFBLENBQUEsRUFBQSxZQUFBLFFBQVcsRUFBQyxVQUFVLEVBQUUsTUFBTTtVQUM1Qix1QkFBdUIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQTtVQUM1QyxPQUFPLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFBO1VBQ2pDLE1BQU0sZUFBZSxrQkFBa0IsRUFBRSxDQUFBO1VBQ3pDLFVBQVUsYUFBYSxHQUFHLFlBQVksQ0FBQTtVQUN0QywyQkFBMkIsQ0FDekIsWUFBWSxFQUNaLElBQUEsNEJBQ0YsQ0FBQyxDQUFBO1NBQ0YsQ0FBQyxDQUFBO09BQ0o7S0FDRCxNQUFNLElBQ0wsU0FBUyxJQUNULFNBQVMsT0FBTyxLQUFLLGVBQWUsT0FBTyxJQUMzQyxTQUFTLFNBQVMsS0FBSyxlQUFlLFNBQVMsRUFDL0M7TUFBQSxJQUFBLHNCQUFBLENBQUE7TUFDQSxNQUFNLGFBQ0osQ0FBQSxTQUFTLEtBQUEsSUFBQSxJQUFULFNBQVMsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHlCQUFULFNBQVMsY0FBZSxNQUFBLElBQUEsSUFBQSxzQkFBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUF4QixzQkFBQSxLQUFBLENBQUEsU0FBUyxFQUFrQixVQUFVLENBQUMsS0FBSSxJQUFJLG9CQUFBLFFBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtNQUN0RSxVQUFVLDJCQUEyQixDQUFDO1FBQ3BDLGtCQUFrQixVQUFBO09BQ25CLENBQUMsQ0FBQTtLQUNILE1BQU07TUFDTCxJQUFJLFVBQVUsT0FBTyxJQUFJLFVBQVUsT0FBTyxJQUFJLElBQUksVUFBVSxPQUFPLElBQUksRUFBRTtRQUN2RSxNQUFNLFFBQVEsVUFBVSxPQUFPLElBQUksR0FBRyxDQUFBO1FBQ3RDLE1BQU0sTUFBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLE9BQU8sSUFBSSxDQUFDLENBQUE7UUFDMUMsTUFBTTs7U0FBVSxHQUFHLEdBQUcsQ0FBQTtRQUV0QixVQUFVLFVBQVUsWUFBWSxDQUFFLE9BQVE7VUFDeEMsSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssT0FBTyxLQUFLLHFCQUFxQixFQUFFO1lBQ3pELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQTtXQUN0QztTQUNELENBQUMsQ0FBQTtPQUNKO01BQ0EsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzdCO0dBQ0QsQ0FBQTs7O0VBR0Qsa0JBQW1CLGNBQWU7SUFBQSxJQUFBLHNCQUFBLENBQUE7SUFFaEMsTUFBTSxhQUNKLENBQUEsU0FBUyxLQUFBLElBQUEsSUFBVCxTQUFTLEtBQUEsS0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSx5QkFBVCxTQUFTLGNBQWUsTUFBQSxJQUFBLElBQUEsc0JBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsR0FBeEIsc0JBQUEsS0FBQSxDQUFBLFNBQVMsRUFBa0IsVUFBVSxDQUFDLEtBQUksSUFBSSxvQkFBQSxRQUFVLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDdEUsVUFBVSw0QkFBNEIsQ0FBQztNQUNyQyxrQkFBa0IsVUFBVTtNQUM1QixRQUFRLFVBQVUsT0FBQztLQUNwQixDQUFDLENBQUE7R0FDSCxDQUFBO0VBRUQsSUFBSSxTQUFTLEtBQUEsSUFBQSxJQUFULFNBQVMsS0FBQSxLQUFBLENBQUEsSUFBVCxTQUFTLHlCQUEwQixFQUFFO0lBQ3ZDLFNBQVMseUJBQXlCLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0dBQ3BFOzs7Ozs7RUFNQSxVQUFVLGFBQWEsY0FBYyxFQUFFLEtBQUssQ0FBQyxNQUFNO0lBQ2pELFdBQVcsRUFBRSxDQUFBO0dBQ2QsQ0FBQyxDQUFBO0VBQ0YsVUFBVSxhQUFhLEdBQUcsQ0FDeEIsbUJBQUEsMkJBQTBCLGFBQWEsRUFDdkMsV0FDRixDQUFDLENBQUE7RUFDRCxVQUFVLHlCQUF5QixJQUFJLEdBQUcsQ0FDeEMsbUJBQUEsMkJBQTBCLGFBQWEsRUFDdkMsV0FDRixDQUFDLENBQUE7RUFDRCxVQUFVLDhCQUE4QixJQUFJLEdBQUcsQ0FDN0MsbUJBQUEsMkJBQTBCLGFBQWEsRUFDdkMsV0FDRixDQUFDLENBQUE7RUFDRCxVQUFVLG9CQUFvQixJQUFJLEdBQUcsQ0FDbkMsbUJBQUEsMkJBQTBCLGFBQWEsRUFDdkMsV0FDRixDQUFDLENBQUE7RUFDRCxVQUFVLG1CQUFtQixHQUFHLENBQzlCLG1CQUFBLDJCQUEwQixhQUFhLEVBQ3ZDLFdBQ0YsQ0FBQyxDQUFBO0VBRUQsVUFBVSxvQkFBb0IsVUFBVSxDQUN0QyxtQkFBQSwyQkFBMEIsc0JBQXNCLEVBQ2hELFdBQ0YsQ0FBQyxDQUFBOzs7Ozs7RUFNRCx1QkFBdUI7SUFDckIsSUFBSSxRQUFRLEVBQUUsQ0FBQTtJQUNkLE1BQU0sUUFBUSw2QkFBNkIsRUFBRSxDQUFBO0lBQzdDLElBQUksS0FBSyxFQUFFO01BQ1QsUUFBUSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDdkI7O0lBRUEsSUFBSSxHQUFBLGFBQVksRUFBRTtNQUNoQixxQkFBQSxRQUFPLE9BQU8sYUFBYSxDQUFDO1FBQUUsTUFBTSxLQUFBO09BQU8sQ0FBQyxDQUFBO01BQzVDLHFCQUFBLFFBQU8sT0FBTyx3QkFBd0IsQ0FBQztRQUFFLE9BQU8sU0FBQTtPQUFXLENBQUMsQ0FBQTtLQUM3RCxNQUFNO01BQ0wscUJBQUEsUUFBTyxjQUFjLGFBQWEsQ0FBQztRQUFFLE1BQU0sS0FBQTtPQUFPLENBQUMsQ0FBQTtNQUNuRCxxQkFBQSxRQUFPLGNBQWMsd0JBQXdCLENBQUM7UUFBRSxPQUFPLFNBQUE7T0FBVyxDQUFDLENBQUE7S0FDckU7R0FDRjtFQUVBLHlDQUF5QztJQUN2QyxNQUFNLHVCQUNKLFVBQVUsbUJBQW1CLHNCQUFzQixFQUFFLENBQUE7SUFDdkQsTUFBTSx3QkFDSixVQUFVLG1CQUFtQixpQkFBaUIsT0FBTyxDQUFBO0lBQ3ZELE9BQU8sb0JBQW9CLEdBQUcscUJBQXFCLENBQUE7R0FDckQ7RUFFQSxtQkFBbUIsR0FBRyxDQUNwQixvQkFBQSw0QkFBMkIsYUFBYSxFQUN4QyxDQUFDOztHQUF1QixLQUFLO0lBQzNCLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtNQUN4Qiw2QkFBNkIsRUFBRSxDQUFBO0tBQ2hDLE1BQU0sSUFBSSw2QkFBNkIsRUFBRSxHQUFHLENBQUMsRUFBRTtNQUM5QyxTQUFTLEVBQUUsQ0FBQTtLQUNiO0dBRUosQ0FBQyxDQUFBO0VBRUQseUNBQXlDO0lBQ3ZDLE1BQU0sS0FBSyxDQUNULFVBQVUsYUFBYSxlQUFlLG9CQUFvQixFQUM1RCxDQUFDLFFBQVEsQ0FBRSxRQUNULFVBQVUsYUFBYSxlQUFlLG9CQUFvQixDQUFDLElBQUksQ0FDakUsQ0FBQyxDQUFBO0lBQ0QsVUFBVSxvQkFBb0IsaUJBQWlCLENBQzdDLFlBQUEsOEJBQ0YsQ0FBQyxDQUFBO0lBQ0QsVUFBVSx5QkFBeUIsaUJBQWlCLENBQ2xELFlBQUEsMEJBQ0YsQ0FBQyxDQUFBO0lBQ0QsVUFBVSw4QkFBOEIsaUJBQWlCLENBQ3ZELFlBQUEsMEJBQ0YsQ0FBQyxDQUFBOzs7SUFHRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLG1CQUFtQixNQUFNLGlCQUFpQixDQUFDLFFBQVEsQ0FDekUsQ0FBQzs7O0tBQVksS0FBSztNQUNoQixRQUFRLElBQUk7O1VBRVIsVUFBVSxtQkFBbUIsT0FBTyxDQUNsQyxFQUFFLEVBQ0YsYUFBQSxVQUFTLFNBQVMsb0JBQW9CLEVBQ3hDLENBQUMsQ0FBQTtVQUNELE1BQUE7T0FDSjtLQUVKLENBQUMsQ0FBQTtJQUVELFdBQVcsRUFBRSxDQUFBO0dBQ2Y7Q0FFRjs7Ozs7Ozs7O0FBU0EsMkJBQTJCO0VBQ3pCLE1BQU0sT0FBTyxNQUFNLFFBQVEsY0FBYyxFQUFFLENBQUE7RUFDM0MsTUFBTSw2QkFBNkIsT0FBTyxDQUN4QyxJQUFJLEtBQUssQ0FBRSxPQUFRLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQ2hELENBQUMsQ0FBQTs7O0VBR0QsTUFBTSxZQUNKLElBQUksT0FBTyxHQUFHLENBQUMsSUFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBQzdDLElBQ0UsQ0FBQyxjQUFjLEtBQ2QsU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQzNCLENBQUMsMEJBQTBCLEVBQzNCO0lBQ0EsaUJBQWlCLElBQUksQ0FBQTtJQUNyQixJQUFJO01BQ0YsTUFBTSxpQkFBaUIsVUFBVSxtQkFBbUIsa0JBQWtCLEVBQUUsQ0FBQTtNQUN4RSxNQUFNLG1CQUFtQixVQUFVLENBQ2hDLGNBQ0MsVUFBVSxtQkFBbUIsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQzdELGNBQ0YsQ0FBQyxDQUFBO0tBQ0YsU0FBUztNQUNSLGlCQUFpQixLQUFLLENBQUE7S0FDeEI7R0FDRjtDQUNGOzs7QUFHQSxNQUFNLHVCQUF1QixNQUFNO0VBQ2pDLElBQUksVUFBVSxFQUFFO0lBQ2QsVUFBVSxzQkFBc0IsYUFBYSxDQUFDO01BQzVDLENBQUMsWUFBQSxxQkFBb0IsZUFBZSxHQUFHLElBQUksSUFBSSxFQUFFLFlBQ25DLEVBQUUsTUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQixDQUFDLENBQUE7O0lBQ0YsVUFBVSxzQkFBc0IsMkJBQTJCLENBQUM7TUFDMUQsVUFBVSxZQUFBLHlCQUF3QixJQUFJO01BQ3RDLE9BQU8sWUFBQSxxQkFBb0IsYUFBYTtNQUN4QyxZQUFZLEVBQUM7S0FDZCxDQUFDLENBQUE7SUFDRixPQUFBO0dBQ0Y7RUFDQSxVQUFVLENBQUMsTUFBTTs7SUFFZixvQkFBb0IsRUFBRSxDQUFBO0dBQ3ZCLEVBQUUsSUFBSSxDQUFDLENBQUE7Q0FDVCxDQUFBOzs7QUFHRCxxQkFBQSxRQUFPLFFBQVEsWUFBWSxZQUFZLENBQUMsQ0FBQzs7Q0FBVSxLQUFLO0VBQ3RELElBQ0UsTUFBTSxLQUFLLFNBQVMsSUFDcEIsRUFBRSxPQUFPLElBQUksZUFBZSxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsRUFDcEQ7SUFDQSxvQkFBb0IsRUFBRSxDQUFBO0lBQ3RCLFFBQVEsdUJBQXVCLEVBQUUsQ0FBQTtHQUNuQztDQUNELENBQUMsQ0FBQTtBQUVGLDBDQUEwQztFQUN4QyxNQUFNLFdBQVcsZUFBZSxHQUFHLFlBQVk7SUFDN0MsTUFBTSxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUE7SUFDbEMsTUFBTSxhQUFhLENBQUEsQ0FBQSxFQUFBLE9BQUEsV0FBVSxFQUFDO01BQUUsVUFBVSxTQUFBO0tBQVcsRUFBRSxZQUFBLGFBQVksQ0FBQyxDQUFBO0lBQ3BFLE9BQU87TUFDTCxTQUFTLE1BQU0sVUFBVSxVQUFVO01BQ25DLE9BQU8sVUFBVTtNQUNqQixTQUFTLFFBQVEsV0FBVyxFQUFDO0tBQzlCLENBQUE7R0FDRixDQUFBO0NBQ0g7QUFFQSwwQkFBMEI7RUFDeEIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxTQUFBLFFBQUcsTUFBTSxDQUFDLENBQUE7Q0FDL0I7QUFFQSxJQUFJLENBQUMsT0FBTyxJQUFJLCtCQUErQixFQUFFO0VBQy9DLGNBQWMsRUFBRSxDQUFBO0NBQ2xCIiwiZmlsZSI6ImJhY2tncm91bmQtNi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKVxuXG4vLyB0aHJvdWdoXG4vL1xuLy8gYSBzdHJlYW0gdGhhdCBkb2VzIG5vdGhpbmcgYnV0IHJlLWVtaXQgdGhlIGlucHV0LlxuLy8gdXNlZnVsIGZvciBhZ2dyZWdhdGluZyBhIHNlcmllcyBvZiBjaGFuZ2luZyBidXQgbm90IGVuZGluZyBzdHJlYW1zIGludG8gb25lIHN0cmVhbSlcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdGhyb3VnaFxudGhyb3VnaC50aHJvdWdoID0gdGhyb3VnaFxuXG4vL2NyZWF0ZSBhIHJlYWRhYmxlIHdyaXRhYmxlIHN0cmVhbS5cblxuZnVuY3Rpb24gdGhyb3VnaCAod3JpdGUsIGVuZCwgb3B0cykge1xuICB3cml0ZSA9IHdyaXRlIHx8IGZ1bmN0aW9uIChkYXRhKSB7IHRoaXMucXVldWUoZGF0YSkgfVxuICBlbmQgPSBlbmQgfHwgZnVuY3Rpb24gKCkgeyB0aGlzLnF1ZXVlKG51bGwpIH1cblxuICB2YXIgZW5kZWQgPSBmYWxzZSwgZGVzdHJveWVkID0gZmFsc2UsIGJ1ZmZlciA9IFtdLCBfZW5kZWQgPSBmYWxzZVxuICB2YXIgc3RyZWFtID0gbmV3IFN0cmVhbSgpXG4gIHN0cmVhbS5yZWFkYWJsZSA9IHN0cmVhbS53cml0YWJsZSA9IHRydWVcbiAgc3RyZWFtLnBhdXNlZCA9IGZhbHNlXG5cbi8vICBzdHJlYW0uYXV0b1BhdXNlICAgPSAhKG9wdHMgJiYgb3B0cy5hdXRvUGF1c2UgICA9PT0gZmFsc2UpXG4gIHN0cmVhbS5hdXRvRGVzdHJveSA9ICEob3B0cyAmJiBvcHRzLmF1dG9EZXN0cm95ID09PSBmYWxzZSlcblxuICBzdHJlYW0ud3JpdGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHdyaXRlLmNhbGwodGhpcywgZGF0YSlcbiAgICByZXR1cm4gIXN0cmVhbS5wYXVzZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYWluKCkge1xuICAgIHdoaWxlKGJ1ZmZlci5sZW5ndGggJiYgIXN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIHZhciBkYXRhID0gYnVmZmVyLnNoaWZ0KClcbiAgICAgIGlmKG51bGwgPT09IGRhdGEpXG4gICAgICAgIHJldHVybiBzdHJlYW0uZW1pdCgnZW5kJylcbiAgICAgIGVsc2VcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBkYXRhKVxuICAgIH1cbiAgfVxuXG4gIHN0cmVhbS5xdWV1ZSA9IHN0cmVhbS5wdXNoID0gZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgIGNvbnNvbGUuZXJyb3IoZW5kZWQpXG4gICAgaWYoX2VuZGVkKSByZXR1cm4gc3RyZWFtXG4gICAgaWYoZGF0YSA9PT0gbnVsbCkgX2VuZGVkID0gdHJ1ZVxuICAgIGJ1ZmZlci5wdXNoKGRhdGEpXG4gICAgZHJhaW4oKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuXG4gIC8vdGhpcyB3aWxsIGJlIHJlZ2lzdGVyZWQgYXMgdGhlIGZpcnN0ICdlbmQnIGxpc3RlbmVyXG4gIC8vbXVzdCBjYWxsIGRlc3Ryb3kgbmV4dCB0aWNrLCB0byBtYWtlIHN1cmUgd2UncmUgYWZ0ZXIgYW55XG4gIC8vc3RyZWFtIHBpcGVkIGZyb20gaGVyZS5cbiAgLy90aGlzIGlzIG9ubHkgYSBwcm9ibGVtIGlmIGVuZCBpcyBub3QgZW1pdHRlZCBzeW5jaHJvbm91c2x5LlxuICAvL2EgbmljZXIgd2F5IHRvIGRvIHRoaXMgaXMgdG8gbWFrZSBzdXJlIHRoaXMgaXMgdGhlIGxhc3QgbGlzdGVuZXIgZm9yICdlbmQnXG5cbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICBpZighc3RyZWFtLndyaXRhYmxlICYmIHN0cmVhbS5hdXRvRGVzdHJveSlcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHJlYW0uZGVzdHJveSgpXG4gICAgICB9KVxuICB9KVxuXG4gIGZ1bmN0aW9uIF9lbmQgKCkge1xuICAgIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlXG4gICAgZW5kLmNhbGwoc3RyZWFtKVxuICAgIGlmKCFzdHJlYW0ucmVhZGFibGUgJiYgc3RyZWFtLmF1dG9EZXN0cm95KVxuICAgICAgc3RyZWFtLmRlc3Ryb3koKVxuICB9XG5cbiAgc3RyZWFtLmVuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYoZW5kZWQpIHJldHVyblxuICAgIGVuZGVkID0gdHJ1ZVxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGgpIHN0cmVhbS53cml0ZShkYXRhKVxuICAgIF9lbmQoKSAvLyB3aWxsIGVtaXQgb3IgcXVldWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0uZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihkZXN0cm95ZWQpIHJldHVyblxuICAgIGRlc3Ryb3llZCA9IHRydWVcbiAgICBlbmRlZCA9IHRydWVcbiAgICBidWZmZXIubGVuZ3RoID0gMFxuICAgIHN0cmVhbS53cml0YWJsZSA9IHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlXG4gICAgc3RyZWFtLmVtaXQoJ2Nsb3NlJylcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoc3RyZWFtLnBhdXNlZCkgcmV0dXJuXG4gICAgc3RyZWFtLnBhdXNlZCA9IHRydWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIHN0cmVhbS5wYXVzZWQgPSBmYWxzZVxuICAgICAgc3RyZWFtLmVtaXQoJ3Jlc3VtZScpXG4gICAgfVxuICAgIGRyYWluKClcbiAgICAvL21heSBoYXZlIGJlY29tZSBwYXVzZWQgYWdhaW4sXG4gICAgLy9hcyBkcmFpbiBlbWl0cyAnZGF0YScuXG4gICAgaWYoIXN0cmVhbS5wYXVzZWQpXG4gICAgICBzdHJlYW0uZW1pdCgnZHJhaW4nKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuICByZXR1cm4gc3RyZWFtXG59XG5cbiIsImNvbnN0IEJOID0gcmVxdWlyZSgnYm4uanMnKVxuY29uc3QgRUMgPSByZXF1aXJlKCdlbGxpcHRpYycpLmVjXG5jb25zdCBzZWNwMjU2azEgPSBuZXcgRUMoJ3NlY3AyNTZrMScpXG5jb25zdCBkZXRlcm1pbmlzdGljR2VuZXJhdGVLID0gcmVxdWlyZSgnLi9yZmM2OTc5JylcblxuY29uc3QgWkVSTzMyID0gQnVmZmVyLmFsbG9jKDMyLCAwKVxuY29uc3QgRUNfR1JPVVBfT1JERVIgPSBCdWZmZXIuZnJvbSgnZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmViYWFlZGNlNmFmNDhhMDNiYmZkMjVlOGNkMDM2NDE0MScsICdoZXgnKVxuY29uc3QgRUNfUCA9IEJ1ZmZlci5mcm9tKCdmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmYzJmJywgJ2hleCcpXG5cbmNvbnN0IG4gPSBzZWNwMjU2azEuY3VydmUublxuY29uc3QgbkRpdjIgPSBuLnNocm4oMSlcbmNvbnN0IEcgPSBzZWNwMjU2azEuY3VydmUuZ1xuXG5jb25zdCBUSFJPV19CQURfUFJJVkFURSA9ICdFeHBlY3RlZCBQcml2YXRlJ1xuY29uc3QgVEhST1dfQkFEX1BPSU5UID0gJ0V4cGVjdGVkIFBvaW50J1xuY29uc3QgVEhST1dfQkFEX1RXRUFLID0gJ0V4cGVjdGVkIFR3ZWFrJ1xuY29uc3QgVEhST1dfQkFEX0hBU0ggPSAnRXhwZWN0ZWQgSGFzaCdcbmNvbnN0IFRIUk9XX0JBRF9TSUdOQVRVUkUgPSAnRXhwZWN0ZWQgU2lnbmF0dXJlJ1xuY29uc3QgVEhST1dfQkFEX0VYVFJBX0RBVEEgPSAnRXhwZWN0ZWQgRXh0cmEgRGF0YSAoMzIgYnl0ZXMpJ1xuXG5mdW5jdGlvbiBpc1NjYWxhciAoeCkge1xuICByZXR1cm4gQnVmZmVyLmlzQnVmZmVyKHgpICYmIHgubGVuZ3RoID09PSAzMlxufVxuXG5mdW5jdGlvbiBpc09yZGVyU2NhbGFyICh4KSB7XG4gIGlmICghaXNTY2FsYXIoeCkpIHJldHVybiBmYWxzZVxuICByZXR1cm4geC5jb21wYXJlKEVDX0dST1VQX09SREVSKSA8IDAgLy8gPCBHXG59XG5cbmZ1bmN0aW9uIGlzUG9pbnQgKHApIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIocCkpIHJldHVybiBmYWxzZVxuICBpZiAocC5sZW5ndGggPCAzMykgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgdCA9IHBbMF1cbiAgY29uc3QgeCA9IHAuc2xpY2UoMSwgMzMpXG4gIGlmICh4LmNvbXBhcmUoWkVSTzMyKSA9PT0gMCkgcmV0dXJuIGZhbHNlXG4gIGlmICh4LmNvbXBhcmUoRUNfUCkgPj0gMCkgcmV0dXJuIGZhbHNlXG4gIGlmICgodCA9PT0gMHgwMiB8fCB0ID09PSAweDAzKSAmJiBwLmxlbmd0aCA9PT0gMzMpIHtcbiAgICB0cnkgeyBkZWNvZGVGcm9tKHApIH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlIH0gLy8gVE9ETzogdGVtcG9yYXJ5XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNvbnN0IHkgPSBwLnNsaWNlKDMzKVxuICBpZiAoeS5jb21wYXJlKFpFUk8zMikgPT09IDApIHJldHVybiBmYWxzZVxuICBpZiAoeS5jb21wYXJlKEVDX1ApID49IDApIHJldHVybiBmYWxzZVxuICBpZiAodCA9PT0gMHgwNCAmJiBwLmxlbmd0aCA9PT0gNjUpIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBfX2lzUG9pbnRDb21wcmVzc2VkIChwKSB7XG4gIHJldHVybiBwWzBdICE9PSAweDA0XG59XG5cbmZ1bmN0aW9uIGlzUG9pbnRDb21wcmVzc2VkIChwKSB7XG4gIGlmICghaXNQb2ludChwKSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBfX2lzUG9pbnRDb21wcmVzc2VkKHApXG59XG5cbmZ1bmN0aW9uIGlzUHJpdmF0ZSAoeCkge1xuICBpZiAoIWlzU2NhbGFyKHgpKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHguY29tcGFyZShaRVJPMzIpID4gMCAmJiAvLyA+IDBcbiAgICB4LmNvbXBhcmUoRUNfR1JPVVBfT1JERVIpIDwgMCAvLyA8IEdcbn1cblxuZnVuY3Rpb24gaXNTaWduYXR1cmUgKHZhbHVlKSB7XG4gIGNvbnN0IHIgPSB2YWx1ZS5zbGljZSgwLCAzMilcbiAgY29uc3QgcyA9IHZhbHVlLnNsaWNlKDMyLCA2NClcbiAgcmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSA2NCAmJlxuICAgIHIuY29tcGFyZShFQ19HUk9VUF9PUkRFUikgPCAwICYmXG4gICAgcy5jb21wYXJlKEVDX0dST1VQX09SREVSKSA8IDBcbn1cblxuZnVuY3Rpb24gYXNzdW1lQ29tcHJlc3Npb24gKHZhbHVlLCBwdWJrZXkpIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgcHVia2V5ICE9PSB1bmRlZmluZWQpIHJldHVybiBfX2lzUG9pbnRDb21wcmVzc2VkKHB1YmtleSlcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiB0cnVlXG4gIHJldHVybiB2YWx1ZVxufVxuXG5mdW5jdGlvbiBmcm9tQnVmZmVyIChkKSB7IHJldHVybiBuZXcgQk4oZCkgfVxuZnVuY3Rpb24gdG9CdWZmZXIgKGQpIHsgcmV0dXJuIGQudG9BcnJheUxpa2UoQnVmZmVyLCAnYmUnLCAzMikgfVxuZnVuY3Rpb24gZGVjb2RlRnJvbSAoUCkgeyByZXR1cm4gc2VjcDI1NmsxLmN1cnZlLmRlY29kZVBvaW50KFApIH1cbmZ1bmN0aW9uIGdldEVuY29kZWQgKFAsIGNvbXByZXNzZWQpIHsgcmV0dXJuIEJ1ZmZlci5mcm9tKFAuX2VuY29kZShjb21wcmVzc2VkKSkgfVxuXG5mdW5jdGlvbiBwb2ludEFkZCAocEEsIHBCLCBfX2NvbXByZXNzZWQpIHtcbiAgaWYgKCFpc1BvaW50KHBBKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihUSFJPV19CQURfUE9JTlQpXG4gIGlmICghaXNQb2ludChwQikpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1BPSU5UKVxuXG4gIGNvbnN0IGEgPSBkZWNvZGVGcm9tKHBBKVxuICBjb25zdCBiID0gZGVjb2RlRnJvbShwQilcbiAgY29uc3QgcHAgPSBhLmFkZChiKVxuICBpZiAocHAuaXNJbmZpbml0eSgpKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGNvbXByZXNzZWQgPSBhc3N1bWVDb21wcmVzc2lvbihfX2NvbXByZXNzZWQsIHBBKVxuICByZXR1cm4gZ2V0RW5jb2RlZChwcCwgY29tcHJlc3NlZClcbn1cblxuZnVuY3Rpb24gcG9pbnRBZGRTY2FsYXIgKHAsIHR3ZWFrLCBfX2NvbXByZXNzZWQpIHtcbiAgaWYgKCFpc1BvaW50KHApKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9QT0lOVClcbiAgaWYgKCFpc09yZGVyU2NhbGFyKHR3ZWFrKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihUSFJPV19CQURfVFdFQUspXG5cbiAgY29uc3QgY29tcHJlc3NlZCA9IGFzc3VtZUNvbXByZXNzaW9uKF9fY29tcHJlc3NlZCwgcClcbiAgY29uc3QgcHAgPSBkZWNvZGVGcm9tKHApXG4gIGlmICh0d2Vhay5jb21wYXJlKFpFUk8zMikgPT09IDApIHJldHVybiBnZXRFbmNvZGVkKHBwLCBjb21wcmVzc2VkKVxuXG4gIGNvbnN0IHR0ID0gZnJvbUJ1ZmZlcih0d2VhaylcbiAgY29uc3QgcXEgPSBHLm11bCh0dClcbiAgY29uc3QgdXUgPSBwcC5hZGQocXEpXG4gIGlmICh1dS5pc0luZmluaXR5KCkpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIGdldEVuY29kZWQodXUsIGNvbXByZXNzZWQpXG59XG5cbmZ1bmN0aW9uIHBvaW50Q29tcHJlc3MgKHAsIF9fY29tcHJlc3NlZCkge1xuICBpZiAoIWlzUG9pbnQocCkpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1BPSU5UKVxuXG4gIGNvbnN0IHBwID0gZGVjb2RlRnJvbShwKVxuICBpZiAocHAuaXNJbmZpbml0eSgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9QT0lOVClcblxuICBjb25zdCBjb21wcmVzc2VkID0gYXNzdW1lQ29tcHJlc3Npb24oX19jb21wcmVzc2VkLCBwKVxuXG4gIHJldHVybiBnZXRFbmNvZGVkKHBwLCBjb21wcmVzc2VkKVxufVxuXG5mdW5jdGlvbiBwb2ludEZyb21TY2FsYXIgKGQsIF9fY29tcHJlc3NlZCkge1xuICBpZiAoIWlzUHJpdmF0ZShkKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihUSFJPV19CQURfUFJJVkFURSlcblxuICBjb25zdCBkZCA9IGZyb21CdWZmZXIoZClcbiAgY29uc3QgcHAgPSBHLm11bChkZClcbiAgaWYgKHBwLmlzSW5maW5pdHkoKSkgcmV0dXJuIG51bGxcblxuICBjb25zdCBjb21wcmVzc2VkID0gYXNzdW1lQ29tcHJlc3Npb24oX19jb21wcmVzc2VkKVxuICByZXR1cm4gZ2V0RW5jb2RlZChwcCwgY29tcHJlc3NlZClcbn1cblxuZnVuY3Rpb24gcG9pbnRNdWx0aXBseSAocCwgdHdlYWssIF9fY29tcHJlc3NlZCkge1xuICBpZiAoIWlzUG9pbnQocCkpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1BPSU5UKVxuICBpZiAoIWlzT3JkZXJTY2FsYXIodHdlYWspKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9UV0VBSylcblxuICBjb25zdCBjb21wcmVzc2VkID0gYXNzdW1lQ29tcHJlc3Npb24oX19jb21wcmVzc2VkLCBwKVxuICBjb25zdCBwcCA9IGRlY29kZUZyb20ocClcbiAgY29uc3QgdHQgPSBmcm9tQnVmZmVyKHR3ZWFrKVxuICBjb25zdCBxcSA9IHBwLm11bCh0dClcbiAgaWYgKHFxLmlzSW5maW5pdHkoKSkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gZ2V0RW5jb2RlZChxcSwgY29tcHJlc3NlZClcbn1cblxuZnVuY3Rpb24gcHJpdmF0ZUFkZCAoZCwgdHdlYWspIHtcbiAgaWYgKCFpc1ByaXZhdGUoZCkpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1BSSVZBVEUpXG4gIGlmICghaXNPcmRlclNjYWxhcih0d2VhaykpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1RXRUFLKVxuXG4gIGNvbnN0IGRkID0gZnJvbUJ1ZmZlcihkKVxuICBjb25zdCB0dCA9IGZyb21CdWZmZXIodHdlYWspXG4gIGNvbnN0IGR0ID0gdG9CdWZmZXIoZGQuYWRkKHR0KS51bW9kKG4pKVxuICBpZiAoIWlzUHJpdmF0ZShkdCkpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIGR0XG59XG5cbmZ1bmN0aW9uIHByaXZhdGVTdWIgKGQsIHR3ZWFrKSB7XG4gIGlmICghaXNQcml2YXRlKGQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9QUklWQVRFKVxuICBpZiAoIWlzT3JkZXJTY2FsYXIodHdlYWspKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9UV0VBSylcblxuICBjb25zdCBkZCA9IGZyb21CdWZmZXIoZClcbiAgY29uc3QgdHQgPSBmcm9tQnVmZmVyKHR3ZWFrKVxuICBjb25zdCBkdCA9IHRvQnVmZmVyKGRkLnN1Yih0dCkudW1vZChuKSlcbiAgaWYgKCFpc1ByaXZhdGUoZHQpKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiBkdFxufVxuXG5mdW5jdGlvbiBzaWduIChoYXNoLCB4KSB7XG4gIHJldHVybiBfX3NpZ24oaGFzaCwgeClcbn1cblxuZnVuY3Rpb24gc2lnbldpdGhFbnRyb3B5IChoYXNoLCB4LCBhZGREYXRhKSB7XG4gIHJldHVybiBfX3NpZ24oaGFzaCwgeCwgYWRkRGF0YSlcbn1cblxuZnVuY3Rpb24gX19zaWduIChoYXNoLCB4LCBhZGREYXRhKSB7XG4gIGlmICghaXNTY2FsYXIoaGFzaCkpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX0hBU0gpXG4gIGlmICghaXNQcml2YXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9QUklWQVRFKVxuICBpZiAoYWRkRGF0YSAhPT0gdW5kZWZpbmVkICYmICFpc1NjYWxhcihhZGREYXRhKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihUSFJPV19CQURfRVhUUkFfREFUQSlcblxuICBjb25zdCBkID0gZnJvbUJ1ZmZlcih4KVxuICBjb25zdCBlID0gZnJvbUJ1ZmZlcihoYXNoKVxuXG4gIGxldCByLCBzXG4gIGNvbnN0IGNoZWNrU2lnID0gZnVuY3Rpb24gKGspIHtcbiAgICBjb25zdCBrSSA9IGZyb21CdWZmZXIoaylcbiAgICBjb25zdCBRID0gRy5tdWwoa0kpXG5cbiAgICBpZiAoUS5pc0luZmluaXR5KCkpIHJldHVybiBmYWxzZVxuXG4gICAgciA9IFEueC51bW9kKG4pXG4gICAgaWYgKHIuaXNaZXJvKCkgPT09IDApIHJldHVybiBmYWxzZVxuXG4gICAgcyA9IGtJXG4gICAgICAuaW52bShuKVxuICAgICAgLm11bChlLmFkZChkLm11bChyKSkpXG4gICAgICAudW1vZChuKVxuICAgIGlmIChzLmlzWmVybygpID09PSAwKSByZXR1cm4gZmFsc2VcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBkZXRlcm1pbmlzdGljR2VuZXJhdGVLKGhhc2gsIHgsIGNoZWNrU2lnLCBpc1ByaXZhdGUsIGFkZERhdGEpXG5cbiAgLy8gZW5mb3JjZSBsb3cgUyB2YWx1ZXMsIHNlZSBiaXA2MjogJ2xvdyBzIHZhbHVlcyBpbiBzaWduYXR1cmVzJ1xuICBpZiAocy5jbXAobkRpdjIpID4gMCkge1xuICAgIHMgPSBuLnN1YihzKVxuICB9XG5cbiAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKDY0KVxuICB0b0J1ZmZlcihyKS5jb3B5KGJ1ZmZlciwgMClcbiAgdG9CdWZmZXIocykuY29weShidWZmZXIsIDMyKVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIHZlcmlmeSAoaGFzaCwgcSwgc2lnbmF0dXJlLCBzdHJpY3QpIHtcbiAgaWYgKCFpc1NjYWxhcihoYXNoKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihUSFJPV19CQURfSEFTSClcbiAgaWYgKCFpc1BvaW50KHEpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFRIUk9XX0JBRF9QT0lOVClcblxuICAvLyAxLjQuMSBFbmZvcmNlIHIgYW5kIHMgYXJlIGJvdGggaW50ZWdlcnMgaW4gdGhlIGludGVydmFsIFsxLCBuIOKIkiAxXSAoMSwgaXNTaWduYXR1cmUgZW5mb3JjZXMgJzwgbiAtIDEnKVxuICBpZiAoIWlzU2lnbmF0dXJlKHNpZ25hdHVyZSkpIHRocm93IG5ldyBUeXBlRXJyb3IoVEhST1dfQkFEX1NJR05BVFVSRSlcblxuICBjb25zdCBRID0gZGVjb2RlRnJvbShxKVxuICBjb25zdCByID0gZnJvbUJ1ZmZlcihzaWduYXR1cmUuc2xpY2UoMCwgMzIpKVxuICBjb25zdCBzID0gZnJvbUJ1ZmZlcihzaWduYXR1cmUuc2xpY2UoMzIsIDY0KSlcblxuICBpZiAoc3RyaWN0ICYmIHMuY21wKG5EaXYyKSA+IDApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIDEuNC4xIEVuZm9yY2UgciBhbmQgcyBhcmUgYm90aCBpbnRlZ2VycyBpbiB0aGUgaW50ZXJ2YWwgWzEsIG4g4oiSIDFdICgyLCBlbmZvcmNlcyAnPiAwJylcbiAgaWYgKHIuZ3RuKDApIDw9IDAgLyogfHwgci5jb21wYXJlVG8obikgPj0gMCAqLykgcmV0dXJuIGZhbHNlXG4gIGlmIChzLmd0bigwKSA8PSAwIC8qIHx8IHMuY29tcGFyZVRvKG4pID49IDAgKi8pIHJldHVybiBmYWxzZVxuXG4gIC8vIDEuNC4yIEggPSBIYXNoKE0pLCBhbHJlYWR5IGRvbmUgYnkgdGhlIHVzZXJcbiAgLy8gMS40LjMgZSA9IEhcbiAgY29uc3QgZSA9IGZyb21CdWZmZXIoaGFzaClcblxuICAvLyBDb21wdXRlIHNeLTFcbiAgY29uc3Qgc0ludiA9IHMuaW52bShuKVxuXG4gIC8vIDEuNC40IENvbXB1dGUgdTEgPSBlc17iiJIxIG1vZCBuXG4gIC8vICAgICAgICAgICAgICAgdTIgPSByc17iiJIxIG1vZCBuXG4gIGNvbnN0IHUxID0gZS5tdWwoc0ludikudW1vZChuKVxuICBjb25zdCB1MiA9IHIubXVsKHNJbnYpLnVtb2QobilcblxuICAvLyAxLjQuNSBDb21wdXRlIFIgPSAoeFIsIHlSKVxuICAvLyAgICAgICAgICAgICAgIFIgPSB1MUcgKyB1MlFcbiAgY29uc3QgUiA9IEcubXVsQWRkKHUxLCBRLCB1MilcblxuICAvLyAxLjQuNSAoY29udC4pIEVuZm9yY2UgUiBpcyBub3QgYXQgaW5maW5pdHlcbiAgaWYgKFIuaXNJbmZpbml0eSgpKSByZXR1cm4gZmFsc2VcblxuICAvLyAxLjQuNiBDb252ZXJ0IHRoZSBmaWVsZCBlbGVtZW50IFIueCB0byBhbiBpbnRlZ2VyXG4gIGNvbnN0IHhSID0gUi54XG5cbiAgLy8gMS40LjcgU2V0IHYgPSB4UiBtb2QgblxuICBjb25zdCB2ID0geFIudW1vZChuKVxuXG4gIC8vIDEuNC44IElmIHYgPSByLCBvdXRwdXQgXCJ2YWxpZFwiLCBhbmQgaWYgdiAhPSByLCBvdXRwdXQgXCJpbnZhbGlkXCJcbiAgcmV0dXJuIHYuZXEocilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzUG9pbnQsXG4gIGlzUG9pbnRDb21wcmVzc2VkLFxuICBpc1ByaXZhdGUsXG4gIHBvaW50QWRkLFxuICBwb2ludEFkZFNjYWxhcixcbiAgcG9pbnRDb21wcmVzcyxcbiAgcG9pbnRGcm9tU2NhbGFyLFxuICBwb2ludE11bHRpcGx5LFxuICBwcml2YXRlQWRkLFxuICBwcml2YXRlU3ViLFxuICBzaWduLFxuICBzaWduV2l0aEVudHJvcHksXG4gIHZlcmlmeVxufVxuIiwiY29uc3QgY3JlYXRlSG1hYyA9IHJlcXVpcmUoJ2NyZWF0ZS1obWFjJylcblxuY29uc3QgT05FMSA9IEJ1ZmZlci5hbGxvYygxLCAxKVxuY29uc3QgWkVSTzEgPSBCdWZmZXIuYWxsb2MoMSwgMClcblxuLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzY5Nzkjc2VjdGlvbi0zLjJcbmZ1bmN0aW9uIGRldGVybWluaXN0aWNHZW5lcmF0ZUsgKGhhc2gsIHgsIGNoZWNrU2lnLCBpc1ByaXZhdGUsIGV4dHJhRW50cm9weSkge1xuICAvLyBTdGVwIEEsIGlnbm9yZWQgYXMgaGFzaCBhbHJlYWR5IHByb3ZpZGVkXG4gIC8vIFN0ZXAgQlxuICAvLyBTdGVwIENcbiAgbGV0IGsgPSBCdWZmZXIuYWxsb2MoMzIsIDApXG4gIGxldCB2ID0gQnVmZmVyLmFsbG9jKDMyLCAxKVxuXG4gIC8vIFN0ZXAgRFxuICBrID0gY3JlYXRlSG1hYygnc2hhMjU2JywgaylcbiAgICAudXBkYXRlKHYpXG4gICAgLnVwZGF0ZShaRVJPMSlcbiAgICAudXBkYXRlKHgpXG4gICAgLnVwZGF0ZShoYXNoKVxuICAgIC51cGRhdGUoZXh0cmFFbnRyb3B5IHx8ICcnKVxuICAgIC5kaWdlc3QoKVxuXG4gIC8vIFN0ZXAgRVxuICB2ID0gY3JlYXRlSG1hYygnc2hhMjU2JywgaykudXBkYXRlKHYpLmRpZ2VzdCgpXG5cbiAgLy8gU3RlcCBGXG4gIGsgPSBjcmVhdGVIbWFjKCdzaGEyNTYnLCBrKVxuICAgIC51cGRhdGUodilcbiAgICAudXBkYXRlKE9ORTEpXG4gICAgLnVwZGF0ZSh4KVxuICAgIC51cGRhdGUoaGFzaClcbiAgICAudXBkYXRlKGV4dHJhRW50cm9weSB8fCAnJylcbiAgICAuZGlnZXN0KClcblxuICAvLyBTdGVwIEdcbiAgdiA9IGNyZWF0ZUhtYWMoJ3NoYTI1NicsIGspLnVwZGF0ZSh2KS5kaWdlc3QoKVxuXG4gIC8vIFN0ZXAgSDEvSDJhLCBpZ25vcmVkIGFzIHRsZW4gPT09IHFsZW4gKDI1NiBiaXQpXG4gIC8vIFN0ZXAgSDJiXG4gIHYgPSBjcmVhdGVIbWFjKCdzaGEyNTYnLCBrKS51cGRhdGUodikuZGlnZXN0KClcblxuICBsZXQgVCA9IHZcblxuICAvLyBTdGVwIEgzLCByZXBlYXQgdW50aWwgVCBpcyB3aXRoaW4gdGhlIGludGVydmFsIFsxLCBuIC0gMV0gYW5kIGlzIHN1aXRhYmxlIGZvciBFQ0RTQVxuICB3aGlsZSAoIWlzUHJpdmF0ZShUKSB8fCAhY2hlY2tTaWcoVCkpIHtcbiAgICBrID0gY3JlYXRlSG1hYygnc2hhMjU2JywgaylcbiAgICAgIC51cGRhdGUodilcbiAgICAgIC51cGRhdGUoWkVSTzEpXG4gICAgICAuZGlnZXN0KClcblxuICAgIHYgPSBjcmVhdGVIbWFjKCdzaGEyNTYnLCBrKS51cGRhdGUodikuZGlnZXN0KClcblxuICAgIC8vIFN0ZXAgSDEvSDJhLCBhZ2FpbiwgaWdub3JlZCBhcyB0bGVuID09PSBxbGVuICgyNTYgYml0KVxuICAgIC8vIFN0ZXAgSDJiIGFnYWluXG4gICAgdiA9IGNyZWF0ZUhtYWMoJ3NoYTI1NicsIGspLnVwZGF0ZSh2KS5kaWdlc3QoKVxuICAgIFQgPSB2XG4gIH1cblxuICByZXR1cm4gVFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRldGVybWluaXN0aWNHZW5lcmF0ZUtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9EYXRhVmlldyAoZGF0YSkge1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEludDhBcnJheSB8fCBkYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCBkYXRhIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXkpIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aClcbiAgfVxuXG4gIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KGRhdGEpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBgZGF0YWAgdG8gYmUgYW4gQXJyYXlCdWZmZXIsIEJ1ZmZlciwgSW50OEFycmF5LCBVaW50OEFycmF5IG9yIFVpbnQ4Q2xhbXBlZEFycmF5Jylcbn1cbiIsIi8vIFdyaXR0ZW4gaW4gMjAxNC0yMDE2IGJ5IERtaXRyeSBDaGVzdG55a2ggYW5kIERldmkgTWFuZGlyaS5cbi8vIFB1YmxpYyBkb21haW4uXG4oZnVuY3Rpb24ocm9vdCwgZikge1xuICAndXNlIHN0cmljdCc7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBmKCk7XG4gIGVsc2UgaWYgKHJvb3QubmFjbCkgcm9vdC5uYWNsLnV0aWwgPSBmKCk7XG4gIGVsc2Uge1xuICAgIHJvb3QubmFjbCA9IHt9O1xuICAgIHJvb3QubmFjbC51dGlsID0gZigpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHV0aWwgPSB7fTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhc2U2NChzKSB7XG4gICAgaWYgKCEoL14oPzpbQS1aYS16MC05K1xcL117Mn1bQS1aYS16MC05K1xcL117Mn0pKig/OltBLVphLXowLTkrXFwvXXsyfT09fFtBLVphLXowLTkrXFwvXXszfT0pPyQvLnRlc3QocykpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIGVuY29kaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgdXRpbC5kZWNvZGVVVEY4ID0gZnVuY3Rpb24ocykge1xuICAgIGlmICh0eXBlb2YgcyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIHN0cmluZycpO1xuICAgIHZhciBpLCBkID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHMpKSwgYiA9IG5ldyBVaW50OEFycmF5KGQubGVuZ3RoKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgZC5sZW5ndGg7IGkrKykgYltpXSA9IGQuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYjtcbiAgfTtcblxuICB1dGlsLmVuY29kZVVURjggPSBmdW5jdGlvbihhcnIpIHtcbiAgICB2YXIgaSwgcyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGFycltpXSkpO1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKHMuam9pbignJykpKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIGF0b2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm9kZS5qc1xuXG4gICAgaWYgKHR5cGVvZiBCdWZmZXIuZnJvbSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAvLyBOb2RlIHY2IGFuZCBsYXRlclxuICAgICAgdXRpbC5lbmNvZGVCYXNlNjQgPSBmdW5jdGlvbiAoYXJyKSB7IC8vIHY2IGFuZCBsYXRlclxuICAgICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShhcnIpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgIH07XG5cbiAgICAgIHV0aWwuZGVjb2RlQmFzZTY0ID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgdmFsaWRhdGVCYXNlNjQocyk7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChCdWZmZXIuZnJvbShzLCAnYmFzZTY0JyksIDApKTtcbiAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm9kZSBlYXJsaWVyIHRoYW4gdjZcbiAgICAgIHV0aWwuZW5jb2RlQmFzZTY0ID0gZnVuY3Rpb24gKGFycikgeyAvLyB2NiBhbmQgbGF0ZXJcbiAgICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKGFycikpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgIH07XG5cbiAgICAgIHV0aWwuZGVjb2RlQmFzZTY0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YWxpZGF0ZUJhc2U2NChzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5ldyBCdWZmZXIocywgJ2Jhc2U2NCcpLCAwKSk7XG4gICAgICB9O1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXJzXG5cbiAgICB1dGlsLmVuY29kZUJhc2U2NCA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgdmFyIGksIHMgPSBbXSwgbGVuID0gYXJyLmxlbmd0aDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgcy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyW2ldKSk7XG4gICAgICByZXR1cm4gYnRvYShzLmpvaW4oJycpKTtcbiAgICB9O1xuXG4gICAgdXRpbC5kZWNvZGVCYXNlNjQgPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YWxpZGF0ZUJhc2U2NChzKTtcbiAgICAgIHZhciBpLCBkID0gYXRvYihzKSwgYiA9IG5ldyBVaW50OEFycmF5KGQubGVuZ3RoKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkLmxlbmd0aDsgaSsrKSBiW2ldID0gZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgcmV0dXJuIGI7XG4gICAgfTtcblxuICB9XG5cbiAgcmV0dXJuIHV0aWw7XG5cbn0pKTtcbiIsIihmdW5jdGlvbihuYWNsKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIFBvcnRlZCBpbiAyMDE0IGJ5IERtaXRyeSBDaGVzdG55a2ggYW5kIERldmkgTWFuZGlyaS5cbi8vIFB1YmxpYyBkb21haW4uXG4vL1xuLy8gSW1wbGVtZW50YXRpb24gZGVyaXZlZCBmcm9tIFR3ZWV0TmFDbCB2ZXJzaW9uIDIwMTQwNDI3LlxuLy8gU2VlIGZvciBkZXRhaWxzOiBodHRwOi8vdHdlZXRuYWNsLmNyLnlwLnRvL1xuXG52YXIgZ2YgPSBmdW5jdGlvbihpbml0KSB7XG4gIHZhciBpLCByID0gbmV3IEZsb2F0NjRBcnJheSgxNik7XG4gIGlmIChpbml0KSBmb3IgKGkgPSAwOyBpIDwgaW5pdC5sZW5ndGg7IGkrKykgcltpXSA9IGluaXRbaV07XG4gIHJldHVybiByO1xufTtcblxuLy8gIFBsdWdnYWJsZSwgaW5pdGlhbGl6ZWQgaW4gaGlnaC1sZXZlbCBBUEkgYmVsb3cuXG52YXIgcmFuZG9tYnl0ZXMgPSBmdW5jdGlvbigvKiB4LCBuICovKSB7IHRocm93IG5ldyBFcnJvcignbm8gUFJORycpOyB9O1xuXG52YXIgXzAgPSBuZXcgVWludDhBcnJheSgxNik7XG52YXIgXzkgPSBuZXcgVWludDhBcnJheSgzMik7IF85WzBdID0gOTtcblxudmFyIGdmMCA9IGdmKCksXG4gICAgZ2YxID0gZ2YoWzFdKSxcbiAgICBfMTIxNjY1ID0gZ2YoWzB4ZGI0MSwgMV0pLFxuICAgIEQgPSBnZihbMHg3OGEzLCAweDEzNTksIDB4NGRjYSwgMHg3NWViLCAweGQ4YWIsIDB4NDE0MSwgMHgwYTRkLCAweDAwNzAsIDB4ZTg5OCwgMHg3Nzc5LCAweDQwNzksIDB4OGNjNywgMHhmZTczLCAweDJiNmYsIDB4NmNlZSwgMHg1MjAzXSksXG4gICAgRDIgPSBnZihbMHhmMTU5LCAweDI2YjIsIDB4OWI5NCwgMHhlYmQ2LCAweGIxNTYsIDB4ODI4MywgMHgxNDlhLCAweDAwZTAsIDB4ZDEzMCwgMHhlZWYzLCAweDgwZjIsIDB4MTk4ZSwgMHhmY2U3LCAweDU2ZGYsIDB4ZDlkYywgMHgyNDA2XSksXG4gICAgWCA9IGdmKFsweGQ1MWEsIDB4OGYyNSwgMHgyZDYwLCAweGM5NTYsIDB4YTdiMiwgMHg5NTI1LCAweGM3NjAsIDB4NjkyYywgMHhkYzVjLCAweGZkZDYsIDB4ZTIzMSwgMHhjMGE0LCAweDUzZmUsIDB4Y2Q2ZSwgMHgzNmQzLCAweDIxNjldKSxcbiAgICBZID0gZ2YoWzB4NjY1OCwgMHg2NjY2LCAweDY2NjYsIDB4NjY2NiwgMHg2NjY2LCAweDY2NjYsIDB4NjY2NiwgMHg2NjY2LCAweDY2NjYsIDB4NjY2NiwgMHg2NjY2LCAweDY2NjYsIDB4NjY2NiwgMHg2NjY2LCAweDY2NjYsIDB4NjY2Nl0pLFxuICAgIEkgPSBnZihbMHhhMGIwLCAweDRhMGUsIDB4MWIyNywgMHhjNGVlLCAweGU0NzgsIDB4YWQyZiwgMHgxODA2LCAweDJmNDMsIDB4ZDdhNywgMHgzZGZiLCAweDAwOTksIDB4MmI0ZCwgMHhkZjBiLCAweDRmYzEsIDB4MjQ4MCwgMHgyYjgzXSk7XG5cbmZ1bmN0aW9uIHRzNjQoeCwgaSwgaCwgbCkge1xuICB4W2ldICAgPSAoaCA+PiAyNCkgJiAweGZmO1xuICB4W2krMV0gPSAoaCA+PiAxNikgJiAweGZmO1xuICB4W2krMl0gPSAoaCA+PiAgOCkgJiAweGZmO1xuICB4W2krM10gPSBoICYgMHhmZjtcbiAgeFtpKzRdID0gKGwgPj4gMjQpICAmIDB4ZmY7XG4gIHhbaSs1XSA9IChsID4+IDE2KSAgJiAweGZmO1xuICB4W2krNl0gPSAobCA+PiAgOCkgICYgMHhmZjtcbiAgeFtpKzddID0gbCAmIDB4ZmY7XG59XG5cbmZ1bmN0aW9uIHZuKHgsIHhpLCB5LCB5aSwgbikge1xuICB2YXIgaSxkID0gMDtcbiAgZm9yIChpID0gMDsgaSA8IG47IGkrKykgZCB8PSB4W3hpK2ldXnlbeWkraV07XG4gIHJldHVybiAoMSAmICgoZCAtIDEpID4+PiA4KSkgLSAxO1xufVxuXG5mdW5jdGlvbiBjcnlwdG9fdmVyaWZ5XzE2KHgsIHhpLCB5LCB5aSkge1xuICByZXR1cm4gdm4oeCx4aSx5LHlpLDE2KTtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX3ZlcmlmeV8zMih4LCB4aSwgeSwgeWkpIHtcbiAgcmV0dXJuIHZuKHgseGkseSx5aSwzMik7XG59XG5cbmZ1bmN0aW9uIGNvcmVfc2Fsc2EyMChvLCBwLCBrLCBjKSB7XG4gIHZhciBqMCAgPSBjWyAwXSAmIDB4ZmYgfCAoY1sgMV0gJiAweGZmKTw8OCB8IChjWyAyXSAmIDB4ZmYpPDwxNiB8IChjWyAzXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGoxICA9IGtbIDBdICYgMHhmZiB8IChrWyAxXSAmIDB4ZmYpPDw4IHwgKGtbIDJdICYgMHhmZik8PDE2IHwgKGtbIDNdICYgMHhmZik8PDI0LFxuICAgICAgajIgID0ga1sgNF0gJiAweGZmIHwgKGtbIDVdICYgMHhmZik8PDggfCAoa1sgNl0gJiAweGZmKTw8MTYgfCAoa1sgN10gJiAweGZmKTw8MjQsXG4gICAgICBqMyAgPSBrWyA4XSAmIDB4ZmYgfCAoa1sgOV0gJiAweGZmKTw8OCB8IChrWzEwXSAmIDB4ZmYpPDwxNiB8IChrWzExXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGo0ICA9IGtbMTJdICYgMHhmZiB8IChrWzEzXSAmIDB4ZmYpPDw4IHwgKGtbMTRdICYgMHhmZik8PDE2IHwgKGtbMTVdICYgMHhmZik8PDI0LFxuICAgICAgajUgID0gY1sgNF0gJiAweGZmIHwgKGNbIDVdICYgMHhmZik8PDggfCAoY1sgNl0gJiAweGZmKTw8MTYgfCAoY1sgN10gJiAweGZmKTw8MjQsXG4gICAgICBqNiAgPSBwWyAwXSAmIDB4ZmYgfCAocFsgMV0gJiAweGZmKTw8OCB8IChwWyAyXSAmIDB4ZmYpPDwxNiB8IChwWyAzXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGo3ICA9IHBbIDRdICYgMHhmZiB8IChwWyA1XSAmIDB4ZmYpPDw4IHwgKHBbIDZdICYgMHhmZik8PDE2IHwgKHBbIDddICYgMHhmZik8PDI0LFxuICAgICAgajggID0gcFsgOF0gJiAweGZmIHwgKHBbIDldICYgMHhmZik8PDggfCAocFsxMF0gJiAweGZmKTw8MTYgfCAocFsxMV0gJiAweGZmKTw8MjQsXG4gICAgICBqOSAgPSBwWzEyXSAmIDB4ZmYgfCAocFsxM10gJiAweGZmKTw8OCB8IChwWzE0XSAmIDB4ZmYpPDwxNiB8IChwWzE1XSAmIDB4ZmYpPDwyNCxcbiAgICAgIGoxMCA9IGNbIDhdICYgMHhmZiB8IChjWyA5XSAmIDB4ZmYpPDw4IHwgKGNbMTBdICYgMHhmZik8PDE2IHwgKGNbMTFdICYgMHhmZik8PDI0LFxuICAgICAgajExID0ga1sxNl0gJiAweGZmIHwgKGtbMTddICYgMHhmZik8PDggfCAoa1sxOF0gJiAweGZmKTw8MTYgfCAoa1sxOV0gJiAweGZmKTw8MjQsXG4gICAgICBqMTIgPSBrWzIwXSAmIDB4ZmYgfCAoa1syMV0gJiAweGZmKTw8OCB8IChrWzIyXSAmIDB4ZmYpPDwxNiB8IChrWzIzXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGoxMyA9IGtbMjRdICYgMHhmZiB8IChrWzI1XSAmIDB4ZmYpPDw4IHwgKGtbMjZdICYgMHhmZik8PDE2IHwgKGtbMjddICYgMHhmZik8PDI0LFxuICAgICAgajE0ID0ga1syOF0gJiAweGZmIHwgKGtbMjldICYgMHhmZik8PDggfCAoa1szMF0gJiAweGZmKTw8MTYgfCAoa1szMV0gJiAweGZmKTw8MjQsXG4gICAgICBqMTUgPSBjWzEyXSAmIDB4ZmYgfCAoY1sxM10gJiAweGZmKTw8OCB8IChjWzE0XSAmIDB4ZmYpPDwxNiB8IChjWzE1XSAmIDB4ZmYpPDwyNDtcblxuICB2YXIgeDAgPSBqMCwgeDEgPSBqMSwgeDIgPSBqMiwgeDMgPSBqMywgeDQgPSBqNCwgeDUgPSBqNSwgeDYgPSBqNiwgeDcgPSBqNyxcbiAgICAgIHg4ID0gajgsIHg5ID0gajksIHgxMCA9IGoxMCwgeDExID0gajExLCB4MTIgPSBqMTIsIHgxMyA9IGoxMywgeDE0ID0gajE0LFxuICAgICAgeDE1ID0gajE1LCB1O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkgKz0gMikge1xuICAgIHUgPSB4MCArIHgxMiB8IDA7XG4gICAgeDQgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHg0ICsgeDAgfCAwO1xuICAgIHg4IF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4OCArIHg0IHwgMDtcbiAgICB4MTIgXj0gdTw8MTMgfCB1Pj4+KDMyLTEzKTtcbiAgICB1ID0geDEyICsgeDggfCAwO1xuICAgIHgwIF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG5cbiAgICB1ID0geDUgKyB4MSB8IDA7XG4gICAgeDkgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHg5ICsgeDUgfCAwO1xuICAgIHgxMyBePSB1PDw5IHwgdT4+PigzMi05KTtcbiAgICB1ID0geDEzICsgeDkgfCAwO1xuICAgIHgxIF49IHU8PDEzIHwgdT4+PigzMi0xMyk7XG4gICAgdSA9IHgxICsgeDEzIHwgMDtcbiAgICB4NSBePSB1PDwxOCB8IHU+Pj4oMzItMTgpO1xuXG4gICAgdSA9IHgxMCArIHg2IHwgMDtcbiAgICB4MTQgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHgxNCArIHgxMCB8IDA7XG4gICAgeDIgXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHgyICsgeDE0IHwgMDtcbiAgICB4NiBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4NiArIHgyIHwgMDtcbiAgICB4MTAgXj0gdTw8MTggfCB1Pj4+KDMyLTE4KTtcblxuICAgIHUgPSB4MTUgKyB4MTEgfCAwO1xuICAgIHgzIF49IHU8PDcgfCB1Pj4+KDMyLTcpO1xuICAgIHUgPSB4MyArIHgxNSB8IDA7XG4gICAgeDcgXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHg3ICsgeDMgfCAwO1xuICAgIHgxMSBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4MTEgKyB4NyB8IDA7XG4gICAgeDE1IF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG5cbiAgICB1ID0geDAgKyB4MyB8IDA7XG4gICAgeDEgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHgxICsgeDAgfCAwO1xuICAgIHgyIF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4MiArIHgxIHwgMDtcbiAgICB4MyBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4MyArIHgyIHwgMDtcbiAgICB4MCBePSB1PDwxOCB8IHU+Pj4oMzItMTgpO1xuXG4gICAgdSA9IHg1ICsgeDQgfCAwO1xuICAgIHg2IF49IHU8PDcgfCB1Pj4+KDMyLTcpO1xuICAgIHUgPSB4NiArIHg1IHwgMDtcbiAgICB4NyBePSB1PDw5IHwgdT4+PigzMi05KTtcbiAgICB1ID0geDcgKyB4NiB8IDA7XG4gICAgeDQgXj0gdTw8MTMgfCB1Pj4+KDMyLTEzKTtcbiAgICB1ID0geDQgKyB4NyB8IDA7XG4gICAgeDUgXj0gdTw8MTggfCB1Pj4+KDMyLTE4KTtcblxuICAgIHUgPSB4MTAgKyB4OSB8IDA7XG4gICAgeDExIF49IHU8PDcgfCB1Pj4+KDMyLTcpO1xuICAgIHUgPSB4MTEgKyB4MTAgfCAwO1xuICAgIHg4IF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4OCArIHgxMSB8IDA7XG4gICAgeDkgXj0gdTw8MTMgfCB1Pj4+KDMyLTEzKTtcbiAgICB1ID0geDkgKyB4OCB8IDA7XG4gICAgeDEwIF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG5cbiAgICB1ID0geDE1ICsgeDE0IHwgMDtcbiAgICB4MTIgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHgxMiArIHgxNSB8IDA7XG4gICAgeDEzIF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4MTMgKyB4MTIgfCAwO1xuICAgIHgxNCBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4MTQgKyB4MTMgfCAwO1xuICAgIHgxNSBePSB1PDwxOCB8IHU+Pj4oMzItMTgpO1xuICB9XG4gICB4MCA9ICB4MCArICBqMCB8IDA7XG4gICB4MSA9ICB4MSArICBqMSB8IDA7XG4gICB4MiA9ICB4MiArICBqMiB8IDA7XG4gICB4MyA9ICB4MyArICBqMyB8IDA7XG4gICB4NCA9ICB4NCArICBqNCB8IDA7XG4gICB4NSA9ICB4NSArICBqNSB8IDA7XG4gICB4NiA9ICB4NiArICBqNiB8IDA7XG4gICB4NyA9ICB4NyArICBqNyB8IDA7XG4gICB4OCA9ICB4OCArICBqOCB8IDA7XG4gICB4OSA9ICB4OSArICBqOSB8IDA7XG4gIHgxMCA9IHgxMCArIGoxMCB8IDA7XG4gIHgxMSA9IHgxMSArIGoxMSB8IDA7XG4gIHgxMiA9IHgxMiArIGoxMiB8IDA7XG4gIHgxMyA9IHgxMyArIGoxMyB8IDA7XG4gIHgxNCA9IHgxNCArIGoxNCB8IDA7XG4gIHgxNSA9IHgxNSArIGoxNSB8IDA7XG5cbiAgb1sgMF0gPSB4MCA+Pj4gIDAgJiAweGZmO1xuICBvWyAxXSA9IHgwID4+PiAgOCAmIDB4ZmY7XG4gIG9bIDJdID0geDAgPj4+IDE2ICYgMHhmZjtcbiAgb1sgM10gPSB4MCA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bIDRdID0geDEgPj4+ICAwICYgMHhmZjtcbiAgb1sgNV0gPSB4MSA+Pj4gIDggJiAweGZmO1xuICBvWyA2XSA9IHgxID4+PiAxNiAmIDB4ZmY7XG4gIG9bIDddID0geDEgPj4+IDI0ICYgMHhmZjtcblxuICBvWyA4XSA9IHgyID4+PiAgMCAmIDB4ZmY7XG4gIG9bIDldID0geDIgPj4+ICA4ICYgMHhmZjtcbiAgb1sxMF0gPSB4MiA+Pj4gMTYgJiAweGZmO1xuICBvWzExXSA9IHgyID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1sxMl0gPSB4MyA+Pj4gIDAgJiAweGZmO1xuICBvWzEzXSA9IHgzID4+PiAgOCAmIDB4ZmY7XG4gIG9bMTRdID0geDMgPj4+IDE2ICYgMHhmZjtcbiAgb1sxNV0gPSB4MyA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bMTZdID0geDQgPj4+ICAwICYgMHhmZjtcbiAgb1sxN10gPSB4NCA+Pj4gIDggJiAweGZmO1xuICBvWzE4XSA9IHg0ID4+PiAxNiAmIDB4ZmY7XG4gIG9bMTldID0geDQgPj4+IDI0ICYgMHhmZjtcblxuICBvWzIwXSA9IHg1ID4+PiAgMCAmIDB4ZmY7XG4gIG9bMjFdID0geDUgPj4+ICA4ICYgMHhmZjtcbiAgb1syMl0gPSB4NSA+Pj4gMTYgJiAweGZmO1xuICBvWzIzXSA9IHg1ID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1syNF0gPSB4NiA+Pj4gIDAgJiAweGZmO1xuICBvWzI1XSA9IHg2ID4+PiAgOCAmIDB4ZmY7XG4gIG9bMjZdID0geDYgPj4+IDE2ICYgMHhmZjtcbiAgb1syN10gPSB4NiA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bMjhdID0geDcgPj4+ICAwICYgMHhmZjtcbiAgb1syOV0gPSB4NyA+Pj4gIDggJiAweGZmO1xuICBvWzMwXSA9IHg3ID4+PiAxNiAmIDB4ZmY7XG4gIG9bMzFdID0geDcgPj4+IDI0ICYgMHhmZjtcblxuICBvWzMyXSA9IHg4ID4+PiAgMCAmIDB4ZmY7XG4gIG9bMzNdID0geDggPj4+ICA4ICYgMHhmZjtcbiAgb1szNF0gPSB4OCA+Pj4gMTYgJiAweGZmO1xuICBvWzM1XSA9IHg4ID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1szNl0gPSB4OSA+Pj4gIDAgJiAweGZmO1xuICBvWzM3XSA9IHg5ID4+PiAgOCAmIDB4ZmY7XG4gIG9bMzhdID0geDkgPj4+IDE2ICYgMHhmZjtcbiAgb1szOV0gPSB4OSA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bNDBdID0geDEwID4+PiAgMCAmIDB4ZmY7XG4gIG9bNDFdID0geDEwID4+PiAgOCAmIDB4ZmY7XG4gIG9bNDJdID0geDEwID4+PiAxNiAmIDB4ZmY7XG4gIG9bNDNdID0geDEwID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1s0NF0gPSB4MTEgPj4+ICAwICYgMHhmZjtcbiAgb1s0NV0gPSB4MTEgPj4+ICA4ICYgMHhmZjtcbiAgb1s0Nl0gPSB4MTEgPj4+IDE2ICYgMHhmZjtcbiAgb1s0N10gPSB4MTEgPj4+IDI0ICYgMHhmZjtcblxuICBvWzQ4XSA9IHgxMiA+Pj4gIDAgJiAweGZmO1xuICBvWzQ5XSA9IHgxMiA+Pj4gIDggJiAweGZmO1xuICBvWzUwXSA9IHgxMiA+Pj4gMTYgJiAweGZmO1xuICBvWzUxXSA9IHgxMiA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bNTJdID0geDEzID4+PiAgMCAmIDB4ZmY7XG4gIG9bNTNdID0geDEzID4+PiAgOCAmIDB4ZmY7XG4gIG9bNTRdID0geDEzID4+PiAxNiAmIDB4ZmY7XG4gIG9bNTVdID0geDEzID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1s1Nl0gPSB4MTQgPj4+ICAwICYgMHhmZjtcbiAgb1s1N10gPSB4MTQgPj4+ICA4ICYgMHhmZjtcbiAgb1s1OF0gPSB4MTQgPj4+IDE2ICYgMHhmZjtcbiAgb1s1OV0gPSB4MTQgPj4+IDI0ICYgMHhmZjtcblxuICBvWzYwXSA9IHgxNSA+Pj4gIDAgJiAweGZmO1xuICBvWzYxXSA9IHgxNSA+Pj4gIDggJiAweGZmO1xuICBvWzYyXSA9IHgxNSA+Pj4gMTYgJiAweGZmO1xuICBvWzYzXSA9IHgxNSA+Pj4gMjQgJiAweGZmO1xufVxuXG5mdW5jdGlvbiBjb3JlX2hzYWxzYTIwKG8scCxrLGMpIHtcbiAgdmFyIGowICA9IGNbIDBdICYgMHhmZiB8IChjWyAxXSAmIDB4ZmYpPDw4IHwgKGNbIDJdICYgMHhmZik8PDE2IHwgKGNbIDNdICYgMHhmZik8PDI0LFxuICAgICAgajEgID0ga1sgMF0gJiAweGZmIHwgKGtbIDFdICYgMHhmZik8PDggfCAoa1sgMl0gJiAweGZmKTw8MTYgfCAoa1sgM10gJiAweGZmKTw8MjQsXG4gICAgICBqMiAgPSBrWyA0XSAmIDB4ZmYgfCAoa1sgNV0gJiAweGZmKTw8OCB8IChrWyA2XSAmIDB4ZmYpPDwxNiB8IChrWyA3XSAmIDB4ZmYpPDwyNCxcbiAgICAgIGozICA9IGtbIDhdICYgMHhmZiB8IChrWyA5XSAmIDB4ZmYpPDw4IHwgKGtbMTBdICYgMHhmZik8PDE2IHwgKGtbMTFdICYgMHhmZik8PDI0LFxuICAgICAgajQgID0ga1sxMl0gJiAweGZmIHwgKGtbMTNdICYgMHhmZik8PDggfCAoa1sxNF0gJiAweGZmKTw8MTYgfCAoa1sxNV0gJiAweGZmKTw8MjQsXG4gICAgICBqNSAgPSBjWyA0XSAmIDB4ZmYgfCAoY1sgNV0gJiAweGZmKTw8OCB8IChjWyA2XSAmIDB4ZmYpPDwxNiB8IChjWyA3XSAmIDB4ZmYpPDwyNCxcbiAgICAgIGo2ICA9IHBbIDBdICYgMHhmZiB8IChwWyAxXSAmIDB4ZmYpPDw4IHwgKHBbIDJdICYgMHhmZik8PDE2IHwgKHBbIDNdICYgMHhmZik8PDI0LFxuICAgICAgajcgID0gcFsgNF0gJiAweGZmIHwgKHBbIDVdICYgMHhmZik8PDggfCAocFsgNl0gJiAweGZmKTw8MTYgfCAocFsgN10gJiAweGZmKTw8MjQsXG4gICAgICBqOCAgPSBwWyA4XSAmIDB4ZmYgfCAocFsgOV0gJiAweGZmKTw8OCB8IChwWzEwXSAmIDB4ZmYpPDwxNiB8IChwWzExXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGo5ICA9IHBbMTJdICYgMHhmZiB8IChwWzEzXSAmIDB4ZmYpPDw4IHwgKHBbMTRdICYgMHhmZik8PDE2IHwgKHBbMTVdICYgMHhmZik8PDI0LFxuICAgICAgajEwID0gY1sgOF0gJiAweGZmIHwgKGNbIDldICYgMHhmZik8PDggfCAoY1sxMF0gJiAweGZmKTw8MTYgfCAoY1sxMV0gJiAweGZmKTw8MjQsXG4gICAgICBqMTEgPSBrWzE2XSAmIDB4ZmYgfCAoa1sxN10gJiAweGZmKTw8OCB8IChrWzE4XSAmIDB4ZmYpPDwxNiB8IChrWzE5XSAmIDB4ZmYpPDwyNCxcbiAgICAgIGoxMiA9IGtbMjBdICYgMHhmZiB8IChrWzIxXSAmIDB4ZmYpPDw4IHwgKGtbMjJdICYgMHhmZik8PDE2IHwgKGtbMjNdICYgMHhmZik8PDI0LFxuICAgICAgajEzID0ga1syNF0gJiAweGZmIHwgKGtbMjVdICYgMHhmZik8PDggfCAoa1syNl0gJiAweGZmKTw8MTYgfCAoa1syN10gJiAweGZmKTw8MjQsXG4gICAgICBqMTQgPSBrWzI4XSAmIDB4ZmYgfCAoa1syOV0gJiAweGZmKTw8OCB8IChrWzMwXSAmIDB4ZmYpPDwxNiB8IChrWzMxXSAmIDB4ZmYpPDwyNCxcbiAgICAgIGoxNSA9IGNbMTJdICYgMHhmZiB8IChjWzEzXSAmIDB4ZmYpPDw4IHwgKGNbMTRdICYgMHhmZik8PDE2IHwgKGNbMTVdICYgMHhmZik8PDI0O1xuXG4gIHZhciB4MCA9IGowLCB4MSA9IGoxLCB4MiA9IGoyLCB4MyA9IGozLCB4NCA9IGo0LCB4NSA9IGo1LCB4NiA9IGo2LCB4NyA9IGo3LFxuICAgICAgeDggPSBqOCwgeDkgPSBqOSwgeDEwID0gajEwLCB4MTEgPSBqMTEsIHgxMiA9IGoxMiwgeDEzID0gajEzLCB4MTQgPSBqMTQsXG4gICAgICB4MTUgPSBqMTUsIHU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDsgaSArPSAyKSB7XG4gICAgdSA9IHgwICsgeDEyIHwgMDtcbiAgICB4NCBePSB1PDw3IHwgdT4+PigzMi03KTtcbiAgICB1ID0geDQgKyB4MCB8IDA7XG4gICAgeDggXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHg4ICsgeDQgfCAwO1xuICAgIHgxMiBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4MTIgKyB4OCB8IDA7XG4gICAgeDAgXj0gdTw8MTggfCB1Pj4+KDMyLTE4KTtcblxuICAgIHUgPSB4NSArIHgxIHwgMDtcbiAgICB4OSBePSB1PDw3IHwgdT4+PigzMi03KTtcbiAgICB1ID0geDkgKyB4NSB8IDA7XG4gICAgeDEzIF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4MTMgKyB4OSB8IDA7XG4gICAgeDEgXj0gdTw8MTMgfCB1Pj4+KDMyLTEzKTtcbiAgICB1ID0geDEgKyB4MTMgfCAwO1xuICAgIHg1IF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG5cbiAgICB1ID0geDEwICsgeDYgfCAwO1xuICAgIHgxNCBePSB1PDw3IHwgdT4+PigzMi03KTtcbiAgICB1ID0geDE0ICsgeDEwIHwgMDtcbiAgICB4MiBePSB1PDw5IHwgdT4+PigzMi05KTtcbiAgICB1ID0geDIgKyB4MTQgfCAwO1xuICAgIHg2IF49IHU8PDEzIHwgdT4+PigzMi0xMyk7XG4gICAgdSA9IHg2ICsgeDIgfCAwO1xuICAgIHgxMCBePSB1PDwxOCB8IHU+Pj4oMzItMTgpO1xuXG4gICAgdSA9IHgxNSArIHgxMSB8IDA7XG4gICAgeDMgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHgzICsgeDE1IHwgMDtcbiAgICB4NyBePSB1PDw5IHwgdT4+PigzMi05KTtcbiAgICB1ID0geDcgKyB4MyB8IDA7XG4gICAgeDExIF49IHU8PDEzIHwgdT4+PigzMi0xMyk7XG4gICAgdSA9IHgxMSArIHg3IHwgMDtcbiAgICB4MTUgXj0gdTw8MTggfCB1Pj4+KDMyLTE4KTtcblxuICAgIHUgPSB4MCArIHgzIHwgMDtcbiAgICB4MSBePSB1PDw3IHwgdT4+PigzMi03KTtcbiAgICB1ID0geDEgKyB4MCB8IDA7XG4gICAgeDIgXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHgyICsgeDEgfCAwO1xuICAgIHgzIF49IHU8PDEzIHwgdT4+PigzMi0xMyk7XG4gICAgdSA9IHgzICsgeDIgfCAwO1xuICAgIHgwIF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG5cbiAgICB1ID0geDUgKyB4NCB8IDA7XG4gICAgeDYgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHg2ICsgeDUgfCAwO1xuICAgIHg3IF49IHU8PDkgfCB1Pj4+KDMyLTkpO1xuICAgIHUgPSB4NyArIHg2IHwgMDtcbiAgICB4NCBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4NCArIHg3IHwgMDtcbiAgICB4NSBePSB1PDwxOCB8IHU+Pj4oMzItMTgpO1xuXG4gICAgdSA9IHgxMCArIHg5IHwgMDtcbiAgICB4MTEgXj0gdTw8NyB8IHU+Pj4oMzItNyk7XG4gICAgdSA9IHgxMSArIHgxMCB8IDA7XG4gICAgeDggXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHg4ICsgeDExIHwgMDtcbiAgICB4OSBePSB1PDwxMyB8IHU+Pj4oMzItMTMpO1xuICAgIHUgPSB4OSArIHg4IHwgMDtcbiAgICB4MTAgXj0gdTw8MTggfCB1Pj4+KDMyLTE4KTtcblxuICAgIHUgPSB4MTUgKyB4MTQgfCAwO1xuICAgIHgxMiBePSB1PDw3IHwgdT4+PigzMi03KTtcbiAgICB1ID0geDEyICsgeDE1IHwgMDtcbiAgICB4MTMgXj0gdTw8OSB8IHU+Pj4oMzItOSk7XG4gICAgdSA9IHgxMyArIHgxMiB8IDA7XG4gICAgeDE0IF49IHU8PDEzIHwgdT4+PigzMi0xMyk7XG4gICAgdSA9IHgxNCArIHgxMyB8IDA7XG4gICAgeDE1IF49IHU8PDE4IHwgdT4+PigzMi0xOCk7XG4gIH1cblxuICBvWyAwXSA9IHgwID4+PiAgMCAmIDB4ZmY7XG4gIG9bIDFdID0geDAgPj4+ICA4ICYgMHhmZjtcbiAgb1sgMl0gPSB4MCA+Pj4gMTYgJiAweGZmO1xuICBvWyAzXSA9IHgwID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1sgNF0gPSB4NSA+Pj4gIDAgJiAweGZmO1xuICBvWyA1XSA9IHg1ID4+PiAgOCAmIDB4ZmY7XG4gIG9bIDZdID0geDUgPj4+IDE2ICYgMHhmZjtcbiAgb1sgN10gPSB4NSA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bIDhdID0geDEwID4+PiAgMCAmIDB4ZmY7XG4gIG9bIDldID0geDEwID4+PiAgOCAmIDB4ZmY7XG4gIG9bMTBdID0geDEwID4+PiAxNiAmIDB4ZmY7XG4gIG9bMTFdID0geDEwID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1sxMl0gPSB4MTUgPj4+ICAwICYgMHhmZjtcbiAgb1sxM10gPSB4MTUgPj4+ICA4ICYgMHhmZjtcbiAgb1sxNF0gPSB4MTUgPj4+IDE2ICYgMHhmZjtcbiAgb1sxNV0gPSB4MTUgPj4+IDI0ICYgMHhmZjtcblxuICBvWzE2XSA9IHg2ID4+PiAgMCAmIDB4ZmY7XG4gIG9bMTddID0geDYgPj4+ICA4ICYgMHhmZjtcbiAgb1sxOF0gPSB4NiA+Pj4gMTYgJiAweGZmO1xuICBvWzE5XSA9IHg2ID4+PiAyNCAmIDB4ZmY7XG5cbiAgb1syMF0gPSB4NyA+Pj4gIDAgJiAweGZmO1xuICBvWzIxXSA9IHg3ID4+PiAgOCAmIDB4ZmY7XG4gIG9bMjJdID0geDcgPj4+IDE2ICYgMHhmZjtcbiAgb1syM10gPSB4NyA+Pj4gMjQgJiAweGZmO1xuXG4gIG9bMjRdID0geDggPj4+ICAwICYgMHhmZjtcbiAgb1syNV0gPSB4OCA+Pj4gIDggJiAweGZmO1xuICBvWzI2XSA9IHg4ID4+PiAxNiAmIDB4ZmY7XG4gIG9bMjddID0geDggPj4+IDI0ICYgMHhmZjtcblxuICBvWzI4XSA9IHg5ID4+PiAgMCAmIDB4ZmY7XG4gIG9bMjldID0geDkgPj4+ICA4ICYgMHhmZjtcbiAgb1szMF0gPSB4OSA+Pj4gMTYgJiAweGZmO1xuICBvWzMxXSA9IHg5ID4+PiAyNCAmIDB4ZmY7XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19jb3JlX3NhbHNhMjAob3V0LGlucCxrLGMpIHtcbiAgY29yZV9zYWxzYTIwKG91dCxpbnAsayxjKTtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX2NvcmVfaHNhbHNhMjAob3V0LGlucCxrLGMpIHtcbiAgY29yZV9oc2Fsc2EyMChvdXQsaW5wLGssYyk7XG59XG5cbnZhciBzaWdtYSA9IG5ldyBVaW50OEFycmF5KFsxMDEsIDEyMCwgMTEyLCA5NywgMTEwLCAxMDAsIDMyLCA1MSwgNTAsIDQ1LCA5OCwgMTIxLCAxMTYsIDEwMSwgMzIsIDEwN10pO1xuICAgICAgICAgICAgLy8gXCJleHBhbmQgMzItYnl0ZSBrXCJcblxuZnVuY3Rpb24gY3J5cHRvX3N0cmVhbV9zYWxzYTIwX3hvcihjLGNwb3MsbSxtcG9zLGIsbixrKSB7XG4gIHZhciB6ID0gbmV3IFVpbnQ4QXJyYXkoMTYpLCB4ID0gbmV3IFVpbnQ4QXJyYXkoNjQpO1xuICB2YXIgdSwgaTtcbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHpbaV0gPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgODsgaSsrKSB6W2ldID0gbltpXTtcbiAgd2hpbGUgKGIgPj0gNjQpIHtcbiAgICBjcnlwdG9fY29yZV9zYWxzYTIwKHgseixrLHNpZ21hKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykgY1tjcG9zK2ldID0gbVttcG9zK2ldIF4geFtpXTtcbiAgICB1ID0gMTtcbiAgICBmb3IgKGkgPSA4OyBpIDwgMTY7IGkrKykge1xuICAgICAgdSA9IHUgKyAoeltpXSAmIDB4ZmYpIHwgMDtcbiAgICAgIHpbaV0gPSB1ICYgMHhmZjtcbiAgICAgIHUgPj4+PSA4O1xuICAgIH1cbiAgICBiIC09IDY0O1xuICAgIGNwb3MgKz0gNjQ7XG4gICAgbXBvcyArPSA2NDtcbiAgfVxuICBpZiAoYiA+IDApIHtcbiAgICBjcnlwdG9fY29yZV9zYWxzYTIwKHgseixrLHNpZ21hKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYjsgaSsrKSBjW2Nwb3MraV0gPSBtW21wb3MraV0gXiB4W2ldO1xuICB9XG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBjcnlwdG9fc3RyZWFtX3NhbHNhMjAoYyxjcG9zLGIsbixrKSB7XG4gIHZhciB6ID0gbmV3IFVpbnQ4QXJyYXkoMTYpLCB4ID0gbmV3IFVpbnQ4QXJyYXkoNjQpO1xuICB2YXIgdSwgaTtcbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHpbaV0gPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgODsgaSsrKSB6W2ldID0gbltpXTtcbiAgd2hpbGUgKGIgPj0gNjQpIHtcbiAgICBjcnlwdG9fY29yZV9zYWxzYTIwKHgseixrLHNpZ21hKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykgY1tjcG9zK2ldID0geFtpXTtcbiAgICB1ID0gMTtcbiAgICBmb3IgKGkgPSA4OyBpIDwgMTY7IGkrKykge1xuICAgICAgdSA9IHUgKyAoeltpXSAmIDB4ZmYpIHwgMDtcbiAgICAgIHpbaV0gPSB1ICYgMHhmZjtcbiAgICAgIHUgPj4+PSA4O1xuICAgIH1cbiAgICBiIC09IDY0O1xuICAgIGNwb3MgKz0gNjQ7XG4gIH1cbiAgaWYgKGIgPiAwKSB7XG4gICAgY3J5cHRvX2NvcmVfc2Fsc2EyMCh4LHosayxzaWdtYSk7XG4gICAgZm9yIChpID0gMDsgaSA8IGI7IGkrKykgY1tjcG9zK2ldID0geFtpXTtcbiAgfVxuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX3N0cmVhbShjLGNwb3MsZCxuLGspIHtcbiAgdmFyIHMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGNyeXB0b19jb3JlX2hzYWxzYTIwKHMsbixrLHNpZ21hKTtcbiAgdmFyIHNuID0gbmV3IFVpbnQ4QXJyYXkoOCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSBzbltpXSA9IG5baSsxNl07XG4gIHJldHVybiBjcnlwdG9fc3RyZWFtX3NhbHNhMjAoYyxjcG9zLGQsc24scyk7XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19zdHJlYW1feG9yKGMsY3BvcyxtLG1wb3MsZCxuLGspIHtcbiAgdmFyIHMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGNyeXB0b19jb3JlX2hzYWxzYTIwKHMsbixrLHNpZ21hKTtcbiAgdmFyIHNuID0gbmV3IFVpbnQ4QXJyYXkoOCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSBzbltpXSA9IG5baSsxNl07XG4gIHJldHVybiBjcnlwdG9fc3RyZWFtX3NhbHNhMjBfeG9yKGMsY3BvcyxtLG1wb3MsZCxzbixzKTtcbn1cblxuLypcbiogUG9ydCBvZiBBbmRyZXcgTW9vbidzIFBvbHkxMzA1LWRvbm5hLTE2LiBQdWJsaWMgZG9tYWluLlxuKiBodHRwczovL2dpdGh1Yi5jb20vZmxvb2R5YmVycnkvcG9seTEzMDUtZG9ubmFcbiovXG5cbnZhciBwb2x5MTMwNSA9IGZ1bmN0aW9uKGtleSkge1xuICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgdGhpcy5yID0gbmV3IFVpbnQxNkFycmF5KDEwKTtcbiAgdGhpcy5oID0gbmV3IFVpbnQxNkFycmF5KDEwKTtcbiAgdGhpcy5wYWQgPSBuZXcgVWludDE2QXJyYXkoOCk7XG4gIHRoaXMubGVmdG92ZXIgPSAwO1xuICB0aGlzLmZpbiA9IDA7XG5cbiAgdmFyIHQwLCB0MSwgdDIsIHQzLCB0NCwgdDUsIHQ2LCB0NztcblxuICB0MCA9IGtleVsgMF0gJiAweGZmIHwgKGtleVsgMV0gJiAweGZmKSA8PCA4OyB0aGlzLnJbMF0gPSAoIHQwICAgICAgICAgICAgICAgICAgICAgKSAmIDB4MWZmZjtcbiAgdDEgPSBrZXlbIDJdICYgMHhmZiB8IChrZXlbIDNdICYgMHhmZikgPDwgODsgdGhpcy5yWzFdID0gKCh0MCA+Pj4gMTMpIHwgKHQxIDw8ICAzKSkgJiAweDFmZmY7XG4gIHQyID0ga2V5WyA0XSAmIDB4ZmYgfCAoa2V5WyA1XSAmIDB4ZmYpIDw8IDg7IHRoaXMuclsyXSA9ICgodDEgPj4+IDEwKSB8ICh0MiA8PCAgNikpICYgMHgxZjAzO1xuICB0MyA9IGtleVsgNl0gJiAweGZmIHwgKGtleVsgN10gJiAweGZmKSA8PCA4OyB0aGlzLnJbM10gPSAoKHQyID4+PiAgNykgfCAodDMgPDwgIDkpKSAmIDB4MWZmZjtcbiAgdDQgPSBrZXlbIDhdICYgMHhmZiB8IChrZXlbIDldICYgMHhmZikgPDwgODsgdGhpcy5yWzRdID0gKCh0MyA+Pj4gIDQpIHwgKHQ0IDw8IDEyKSkgJiAweDAwZmY7XG4gIHRoaXMucls1XSA9ICgodDQgPj4+ICAxKSkgJiAweDFmZmU7XG4gIHQ1ID0ga2V5WzEwXSAmIDB4ZmYgfCAoa2V5WzExXSAmIDB4ZmYpIDw8IDg7IHRoaXMucls2XSA9ICgodDQgPj4+IDE0KSB8ICh0NSA8PCAgMikpICYgMHgxZmZmO1xuICB0NiA9IGtleVsxMl0gJiAweGZmIHwgKGtleVsxM10gJiAweGZmKSA8PCA4OyB0aGlzLnJbN10gPSAoKHQ1ID4+PiAxMSkgfCAodDYgPDwgIDUpKSAmIDB4MWY4MTtcbiAgdDcgPSBrZXlbMTRdICYgMHhmZiB8IChrZXlbMTVdICYgMHhmZikgPDwgODsgdGhpcy5yWzhdID0gKCh0NiA+Pj4gIDgpIHwgKHQ3IDw8ICA4KSkgJiAweDFmZmY7XG4gIHRoaXMucls5XSA9ICgodDcgPj4+ICA1KSkgJiAweDAwN2Y7XG5cbiAgdGhpcy5wYWRbMF0gPSBrZXlbMTZdICYgMHhmZiB8IChrZXlbMTddICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbMV0gPSBrZXlbMThdICYgMHhmZiB8IChrZXlbMTldICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbMl0gPSBrZXlbMjBdICYgMHhmZiB8IChrZXlbMjFdICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbM10gPSBrZXlbMjJdICYgMHhmZiB8IChrZXlbMjNdICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbNF0gPSBrZXlbMjRdICYgMHhmZiB8IChrZXlbMjVdICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbNV0gPSBrZXlbMjZdICYgMHhmZiB8IChrZXlbMjddICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbNl0gPSBrZXlbMjhdICYgMHhmZiB8IChrZXlbMjldICYgMHhmZikgPDwgODtcbiAgdGhpcy5wYWRbN10gPSBrZXlbMzBdICYgMHhmZiB8IChrZXlbMzFdICYgMHhmZikgPDwgODtcbn07XG5cbnBvbHkxMzA1LnByb3RvdHlwZS5ibG9ja3MgPSBmdW5jdGlvbihtLCBtcG9zLCBieXRlcykge1xuICB2YXIgaGliaXQgPSB0aGlzLmZpbiA/IDAgOiAoMSA8PCAxMSk7XG4gIHZhciB0MCwgdDEsIHQyLCB0MywgdDQsIHQ1LCB0NiwgdDcsIGM7XG4gIHZhciBkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOTtcblxuICB2YXIgaDAgPSB0aGlzLmhbMF0sXG4gICAgICBoMSA9IHRoaXMuaFsxXSxcbiAgICAgIGgyID0gdGhpcy5oWzJdLFxuICAgICAgaDMgPSB0aGlzLmhbM10sXG4gICAgICBoNCA9IHRoaXMuaFs0XSxcbiAgICAgIGg1ID0gdGhpcy5oWzVdLFxuICAgICAgaDYgPSB0aGlzLmhbNl0sXG4gICAgICBoNyA9IHRoaXMuaFs3XSxcbiAgICAgIGg4ID0gdGhpcy5oWzhdLFxuICAgICAgaDkgPSB0aGlzLmhbOV07XG5cbiAgdmFyIHIwID0gdGhpcy5yWzBdLFxuICAgICAgcjEgPSB0aGlzLnJbMV0sXG4gICAgICByMiA9IHRoaXMuclsyXSxcbiAgICAgIHIzID0gdGhpcy5yWzNdLFxuICAgICAgcjQgPSB0aGlzLnJbNF0sXG4gICAgICByNSA9IHRoaXMucls1XSxcbiAgICAgIHI2ID0gdGhpcy5yWzZdLFxuICAgICAgcjcgPSB0aGlzLnJbN10sXG4gICAgICByOCA9IHRoaXMucls4XSxcbiAgICAgIHI5ID0gdGhpcy5yWzldO1xuXG4gIHdoaWxlIChieXRlcyA+PSAxNikge1xuICAgIHQwID0gbVttcG9zKyAwXSAmIDB4ZmYgfCAobVttcG9zKyAxXSAmIDB4ZmYpIDw8IDg7IGgwICs9ICggdDAgICAgICAgICAgICAgICAgICAgICApICYgMHgxZmZmO1xuICAgIHQxID0gbVttcG9zKyAyXSAmIDB4ZmYgfCAobVttcG9zKyAzXSAmIDB4ZmYpIDw8IDg7IGgxICs9ICgodDAgPj4+IDEzKSB8ICh0MSA8PCAgMykpICYgMHgxZmZmO1xuICAgIHQyID0gbVttcG9zKyA0XSAmIDB4ZmYgfCAobVttcG9zKyA1XSAmIDB4ZmYpIDw8IDg7IGgyICs9ICgodDEgPj4+IDEwKSB8ICh0MiA8PCAgNikpICYgMHgxZmZmO1xuICAgIHQzID0gbVttcG9zKyA2XSAmIDB4ZmYgfCAobVttcG9zKyA3XSAmIDB4ZmYpIDw8IDg7IGgzICs9ICgodDIgPj4+ICA3KSB8ICh0MyA8PCAgOSkpICYgMHgxZmZmO1xuICAgIHQ0ID0gbVttcG9zKyA4XSAmIDB4ZmYgfCAobVttcG9zKyA5XSAmIDB4ZmYpIDw8IDg7IGg0ICs9ICgodDMgPj4+ICA0KSB8ICh0NCA8PCAxMikpICYgMHgxZmZmO1xuICAgIGg1ICs9ICgodDQgPj4+ICAxKSkgJiAweDFmZmY7XG4gICAgdDUgPSBtW21wb3MrMTBdICYgMHhmZiB8IChtW21wb3MrMTFdICYgMHhmZikgPDwgODsgaDYgKz0gKCh0NCA+Pj4gMTQpIHwgKHQ1IDw8ICAyKSkgJiAweDFmZmY7XG4gICAgdDYgPSBtW21wb3MrMTJdICYgMHhmZiB8IChtW21wb3MrMTNdICYgMHhmZikgPDwgODsgaDcgKz0gKCh0NSA+Pj4gMTEpIHwgKHQ2IDw8ICA1KSkgJiAweDFmZmY7XG4gICAgdDcgPSBtW21wb3MrMTRdICYgMHhmZiB8IChtW21wb3MrMTVdICYgMHhmZikgPDwgODsgaDggKz0gKCh0NiA+Pj4gIDgpIHwgKHQ3IDw8ICA4KSkgJiAweDFmZmY7XG4gICAgaDkgKz0gKCh0NyA+Pj4gNSkpIHwgaGliaXQ7XG5cbiAgICBjID0gMDtcblxuICAgIGQwID0gYztcbiAgICBkMCArPSBoMCAqIHIwO1xuICAgIGQwICs9IGgxICogKDUgKiByOSk7XG4gICAgZDAgKz0gaDIgKiAoNSAqIHI4KTtcbiAgICBkMCArPSBoMyAqICg1ICogcjcpO1xuICAgIGQwICs9IGg0ICogKDUgKiByNik7XG4gICAgYyA9IChkMCA+Pj4gMTMpOyBkMCAmPSAweDFmZmY7XG4gICAgZDAgKz0gaDUgKiAoNSAqIHI1KTtcbiAgICBkMCArPSBoNiAqICg1ICogcjQpO1xuICAgIGQwICs9IGg3ICogKDUgKiByMyk7XG4gICAgZDAgKz0gaDggKiAoNSAqIHIyKTtcbiAgICBkMCArPSBoOSAqICg1ICogcjEpO1xuICAgIGMgKz0gKGQwID4+PiAxMyk7IGQwICY9IDB4MWZmZjtcblxuICAgIGQxID0gYztcbiAgICBkMSArPSBoMCAqIHIxO1xuICAgIGQxICs9IGgxICogcjA7XG4gICAgZDEgKz0gaDIgKiAoNSAqIHI5KTtcbiAgICBkMSArPSBoMyAqICg1ICogcjgpO1xuICAgIGQxICs9IGg0ICogKDUgKiByNyk7XG4gICAgYyA9IChkMSA+Pj4gMTMpOyBkMSAmPSAweDFmZmY7XG4gICAgZDEgKz0gaDUgKiAoNSAqIHI2KTtcbiAgICBkMSArPSBoNiAqICg1ICogcjUpO1xuICAgIGQxICs9IGg3ICogKDUgKiByNCk7XG4gICAgZDEgKz0gaDggKiAoNSAqIHIzKTtcbiAgICBkMSArPSBoOSAqICg1ICogcjIpO1xuICAgIGMgKz0gKGQxID4+PiAxMyk7IGQxICY9IDB4MWZmZjtcblxuICAgIGQyID0gYztcbiAgICBkMiArPSBoMCAqIHIyO1xuICAgIGQyICs9IGgxICogcjE7XG4gICAgZDIgKz0gaDIgKiByMDtcbiAgICBkMiArPSBoMyAqICg1ICogcjkpO1xuICAgIGQyICs9IGg0ICogKDUgKiByOCk7XG4gICAgYyA9IChkMiA+Pj4gMTMpOyBkMiAmPSAweDFmZmY7XG4gICAgZDIgKz0gaDUgKiAoNSAqIHI3KTtcbiAgICBkMiArPSBoNiAqICg1ICogcjYpO1xuICAgIGQyICs9IGg3ICogKDUgKiByNSk7XG4gICAgZDIgKz0gaDggKiAoNSAqIHI0KTtcbiAgICBkMiArPSBoOSAqICg1ICogcjMpO1xuICAgIGMgKz0gKGQyID4+PiAxMyk7IGQyICY9IDB4MWZmZjtcblxuICAgIGQzID0gYztcbiAgICBkMyArPSBoMCAqIHIzO1xuICAgIGQzICs9IGgxICogcjI7XG4gICAgZDMgKz0gaDIgKiByMTtcbiAgICBkMyArPSBoMyAqIHIwO1xuICAgIGQzICs9IGg0ICogKDUgKiByOSk7XG4gICAgYyA9IChkMyA+Pj4gMTMpOyBkMyAmPSAweDFmZmY7XG4gICAgZDMgKz0gaDUgKiAoNSAqIHI4KTtcbiAgICBkMyArPSBoNiAqICg1ICogcjcpO1xuICAgIGQzICs9IGg3ICogKDUgKiByNik7XG4gICAgZDMgKz0gaDggKiAoNSAqIHI1KTtcbiAgICBkMyArPSBoOSAqICg1ICogcjQpO1xuICAgIGMgKz0gKGQzID4+PiAxMyk7IGQzICY9IDB4MWZmZjtcblxuICAgIGQ0ID0gYztcbiAgICBkNCArPSBoMCAqIHI0O1xuICAgIGQ0ICs9IGgxICogcjM7XG4gICAgZDQgKz0gaDIgKiByMjtcbiAgICBkNCArPSBoMyAqIHIxO1xuICAgIGQ0ICs9IGg0ICogcjA7XG4gICAgYyA9IChkNCA+Pj4gMTMpOyBkNCAmPSAweDFmZmY7XG4gICAgZDQgKz0gaDUgKiAoNSAqIHI5KTtcbiAgICBkNCArPSBoNiAqICg1ICogcjgpO1xuICAgIGQ0ICs9IGg3ICogKDUgKiByNyk7XG4gICAgZDQgKz0gaDggKiAoNSAqIHI2KTtcbiAgICBkNCArPSBoOSAqICg1ICogcjUpO1xuICAgIGMgKz0gKGQ0ID4+PiAxMyk7IGQ0ICY9IDB4MWZmZjtcblxuICAgIGQ1ID0gYztcbiAgICBkNSArPSBoMCAqIHI1O1xuICAgIGQ1ICs9IGgxICogcjQ7XG4gICAgZDUgKz0gaDIgKiByMztcbiAgICBkNSArPSBoMyAqIHIyO1xuICAgIGQ1ICs9IGg0ICogcjE7XG4gICAgYyA9IChkNSA+Pj4gMTMpOyBkNSAmPSAweDFmZmY7XG4gICAgZDUgKz0gaDUgKiByMDtcbiAgICBkNSArPSBoNiAqICg1ICogcjkpO1xuICAgIGQ1ICs9IGg3ICogKDUgKiByOCk7XG4gICAgZDUgKz0gaDggKiAoNSAqIHI3KTtcbiAgICBkNSArPSBoOSAqICg1ICogcjYpO1xuICAgIGMgKz0gKGQ1ID4+PiAxMyk7IGQ1ICY9IDB4MWZmZjtcblxuICAgIGQ2ID0gYztcbiAgICBkNiArPSBoMCAqIHI2O1xuICAgIGQ2ICs9IGgxICogcjU7XG4gICAgZDYgKz0gaDIgKiByNDtcbiAgICBkNiArPSBoMyAqIHIzO1xuICAgIGQ2ICs9IGg0ICogcjI7XG4gICAgYyA9IChkNiA+Pj4gMTMpOyBkNiAmPSAweDFmZmY7XG4gICAgZDYgKz0gaDUgKiByMTtcbiAgICBkNiArPSBoNiAqIHIwO1xuICAgIGQ2ICs9IGg3ICogKDUgKiByOSk7XG4gICAgZDYgKz0gaDggKiAoNSAqIHI4KTtcbiAgICBkNiArPSBoOSAqICg1ICogcjcpO1xuICAgIGMgKz0gKGQ2ID4+PiAxMyk7IGQ2ICY9IDB4MWZmZjtcblxuICAgIGQ3ID0gYztcbiAgICBkNyArPSBoMCAqIHI3O1xuICAgIGQ3ICs9IGgxICogcjY7XG4gICAgZDcgKz0gaDIgKiByNTtcbiAgICBkNyArPSBoMyAqIHI0O1xuICAgIGQ3ICs9IGg0ICogcjM7XG4gICAgYyA9IChkNyA+Pj4gMTMpOyBkNyAmPSAweDFmZmY7XG4gICAgZDcgKz0gaDUgKiByMjtcbiAgICBkNyArPSBoNiAqIHIxO1xuICAgIGQ3ICs9IGg3ICogcjA7XG4gICAgZDcgKz0gaDggKiAoNSAqIHI5KTtcbiAgICBkNyArPSBoOSAqICg1ICogcjgpO1xuICAgIGMgKz0gKGQ3ID4+PiAxMyk7IGQ3ICY9IDB4MWZmZjtcblxuICAgIGQ4ID0gYztcbiAgICBkOCArPSBoMCAqIHI4O1xuICAgIGQ4ICs9IGgxICogcjc7XG4gICAgZDggKz0gaDIgKiByNjtcbiAgICBkOCArPSBoMyAqIHI1O1xuICAgIGQ4ICs9IGg0ICogcjQ7XG4gICAgYyA9IChkOCA+Pj4gMTMpOyBkOCAmPSAweDFmZmY7XG4gICAgZDggKz0gaDUgKiByMztcbiAgICBkOCArPSBoNiAqIHIyO1xuICAgIGQ4ICs9IGg3ICogcjE7XG4gICAgZDggKz0gaDggKiByMDtcbiAgICBkOCArPSBoOSAqICg1ICogcjkpO1xuICAgIGMgKz0gKGQ4ID4+PiAxMyk7IGQ4ICY9IDB4MWZmZjtcblxuICAgIGQ5ID0gYztcbiAgICBkOSArPSBoMCAqIHI5O1xuICAgIGQ5ICs9IGgxICogcjg7XG4gICAgZDkgKz0gaDIgKiByNztcbiAgICBkOSArPSBoMyAqIHI2O1xuICAgIGQ5ICs9IGg0ICogcjU7XG4gICAgYyA9IChkOSA+Pj4gMTMpOyBkOSAmPSAweDFmZmY7XG4gICAgZDkgKz0gaDUgKiByNDtcbiAgICBkOSArPSBoNiAqIHIzO1xuICAgIGQ5ICs9IGg3ICogcjI7XG4gICAgZDkgKz0gaDggKiByMTtcbiAgICBkOSArPSBoOSAqIHIwO1xuICAgIGMgKz0gKGQ5ID4+PiAxMyk7IGQ5ICY9IDB4MWZmZjtcblxuICAgIGMgPSAoKChjIDw8IDIpICsgYykpIHwgMDtcbiAgICBjID0gKGMgKyBkMCkgfCAwO1xuICAgIGQwID0gYyAmIDB4MWZmZjtcbiAgICBjID0gKGMgPj4+IDEzKTtcbiAgICBkMSArPSBjO1xuXG4gICAgaDAgPSBkMDtcbiAgICBoMSA9IGQxO1xuICAgIGgyID0gZDI7XG4gICAgaDMgPSBkMztcbiAgICBoNCA9IGQ0O1xuICAgIGg1ID0gZDU7XG4gICAgaDYgPSBkNjtcbiAgICBoNyA9IGQ3O1xuICAgIGg4ID0gZDg7XG4gICAgaDkgPSBkOTtcblxuICAgIG1wb3MgKz0gMTY7XG4gICAgYnl0ZXMgLT0gMTY7XG4gIH1cbiAgdGhpcy5oWzBdID0gaDA7XG4gIHRoaXMuaFsxXSA9IGgxO1xuICB0aGlzLmhbMl0gPSBoMjtcbiAgdGhpcy5oWzNdID0gaDM7XG4gIHRoaXMuaFs0XSA9IGg0O1xuICB0aGlzLmhbNV0gPSBoNTtcbiAgdGhpcy5oWzZdID0gaDY7XG4gIHRoaXMuaFs3XSA9IGg3O1xuICB0aGlzLmhbOF0gPSBoODtcbiAgdGhpcy5oWzldID0gaDk7XG59O1xuXG5wb2x5MTMwNS5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24obWFjLCBtYWNwb3MpIHtcbiAgdmFyIGcgPSBuZXcgVWludDE2QXJyYXkoMTApO1xuICB2YXIgYywgbWFzaywgZiwgaTtcblxuICBpZiAodGhpcy5sZWZ0b3Zlcikge1xuICAgIGkgPSB0aGlzLmxlZnRvdmVyO1xuICAgIHRoaXMuYnVmZmVyW2krK10gPSAxO1xuICAgIGZvciAoOyBpIDwgMTY7IGkrKykgdGhpcy5idWZmZXJbaV0gPSAwO1xuICAgIHRoaXMuZmluID0gMTtcbiAgICB0aGlzLmJsb2Nrcyh0aGlzLmJ1ZmZlciwgMCwgMTYpO1xuICB9XG5cbiAgYyA9IHRoaXMuaFsxXSA+Pj4gMTM7XG4gIHRoaXMuaFsxXSAmPSAweDFmZmY7XG4gIGZvciAoaSA9IDI7IGkgPCAxMDsgaSsrKSB7XG4gICAgdGhpcy5oW2ldICs9IGM7XG4gICAgYyA9IHRoaXMuaFtpXSA+Pj4gMTM7XG4gICAgdGhpcy5oW2ldICY9IDB4MWZmZjtcbiAgfVxuICB0aGlzLmhbMF0gKz0gKGMgKiA1KTtcbiAgYyA9IHRoaXMuaFswXSA+Pj4gMTM7XG4gIHRoaXMuaFswXSAmPSAweDFmZmY7XG4gIHRoaXMuaFsxXSArPSBjO1xuICBjID0gdGhpcy5oWzFdID4+PiAxMztcbiAgdGhpcy5oWzFdICY9IDB4MWZmZjtcbiAgdGhpcy5oWzJdICs9IGM7XG5cbiAgZ1swXSA9IHRoaXMuaFswXSArIDU7XG4gIGMgPSBnWzBdID4+PiAxMztcbiAgZ1swXSAmPSAweDFmZmY7XG4gIGZvciAoaSA9IDE7IGkgPCAxMDsgaSsrKSB7XG4gICAgZ1tpXSA9IHRoaXMuaFtpXSArIGM7XG4gICAgYyA9IGdbaV0gPj4+IDEzO1xuICAgIGdbaV0gJj0gMHgxZmZmO1xuICB9XG4gIGdbOV0gLT0gKDEgPDwgMTMpO1xuXG4gIG1hc2sgPSAoYyBeIDEpIC0gMTtcbiAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIGdbaV0gJj0gbWFzaztcbiAgbWFzayA9IH5tYXNrO1xuICBmb3IgKGkgPSAwOyBpIDwgMTA7IGkrKykgdGhpcy5oW2ldID0gKHRoaXMuaFtpXSAmIG1hc2spIHwgZ1tpXTtcblxuICB0aGlzLmhbMF0gPSAoKHRoaXMuaFswXSAgICAgICApIHwgKHRoaXMuaFsxXSA8PCAxMykgICAgICAgICAgICAgICAgICAgICkgJiAweGZmZmY7XG4gIHRoaXMuaFsxXSA9ICgodGhpcy5oWzFdID4+PiAgMykgfCAodGhpcy5oWzJdIDw8IDEwKSAgICAgICAgICAgICAgICAgICAgKSAmIDB4ZmZmZjtcbiAgdGhpcy5oWzJdID0gKCh0aGlzLmhbMl0gPj4+ICA2KSB8ICh0aGlzLmhbM10gPDwgIDcpICAgICAgICAgICAgICAgICAgICApICYgMHhmZmZmO1xuICB0aGlzLmhbM10gPSAoKHRoaXMuaFszXSA+Pj4gIDkpIHwgKHRoaXMuaFs0XSA8PCAgNCkgICAgICAgICAgICAgICAgICAgICkgJiAweGZmZmY7XG4gIHRoaXMuaFs0XSA9ICgodGhpcy5oWzRdID4+PiAxMikgfCAodGhpcy5oWzVdIDw8ICAxKSB8ICh0aGlzLmhbNl0gPDwgMTQpKSAmIDB4ZmZmZjtcbiAgdGhpcy5oWzVdID0gKCh0aGlzLmhbNl0gPj4+ICAyKSB8ICh0aGlzLmhbN10gPDwgMTEpICAgICAgICAgICAgICAgICAgICApICYgMHhmZmZmO1xuICB0aGlzLmhbNl0gPSAoKHRoaXMuaFs3XSA+Pj4gIDUpIHwgKHRoaXMuaFs4XSA8PCAgOCkgICAgICAgICAgICAgICAgICAgICkgJiAweGZmZmY7XG4gIHRoaXMuaFs3XSA9ICgodGhpcy5oWzhdID4+PiAgOCkgfCAodGhpcy5oWzldIDw8ICA1KSAgICAgICAgICAgICAgICAgICAgKSAmIDB4ZmZmZjtcblxuICBmID0gdGhpcy5oWzBdICsgdGhpcy5wYWRbMF07XG4gIHRoaXMuaFswXSA9IGYgJiAweGZmZmY7XG4gIGZvciAoaSA9IDE7IGkgPCA4OyBpKyspIHtcbiAgICBmID0gKCgodGhpcy5oW2ldICsgdGhpcy5wYWRbaV0pIHwgMCkgKyAoZiA+Pj4gMTYpKSB8IDA7XG4gICAgdGhpcy5oW2ldID0gZiAmIDB4ZmZmZjtcbiAgfVxuXG4gIG1hY1ttYWNwb3MrIDBdID0gKHRoaXMuaFswXSA+Pj4gMCkgJiAweGZmO1xuICBtYWNbbWFjcG9zKyAxXSA9ICh0aGlzLmhbMF0gPj4+IDgpICYgMHhmZjtcbiAgbWFjW21hY3BvcysgMl0gPSAodGhpcy5oWzFdID4+PiAwKSAmIDB4ZmY7XG4gIG1hY1ttYWNwb3MrIDNdID0gKHRoaXMuaFsxXSA+Pj4gOCkgJiAweGZmO1xuICBtYWNbbWFjcG9zKyA0XSA9ICh0aGlzLmhbMl0gPj4+IDApICYgMHhmZjtcbiAgbWFjW21hY3BvcysgNV0gPSAodGhpcy5oWzJdID4+PiA4KSAmIDB4ZmY7XG4gIG1hY1ttYWNwb3MrIDZdID0gKHRoaXMuaFszXSA+Pj4gMCkgJiAweGZmO1xuICBtYWNbbWFjcG9zKyA3XSA9ICh0aGlzLmhbM10gPj4+IDgpICYgMHhmZjtcbiAgbWFjW21hY3BvcysgOF0gPSAodGhpcy5oWzRdID4+PiAwKSAmIDB4ZmY7XG4gIG1hY1ttYWNwb3MrIDldID0gKHRoaXMuaFs0XSA+Pj4gOCkgJiAweGZmO1xuICBtYWNbbWFjcG9zKzEwXSA9ICh0aGlzLmhbNV0gPj4+IDApICYgMHhmZjtcbiAgbWFjW21hY3BvcysxMV0gPSAodGhpcy5oWzVdID4+PiA4KSAmIDB4ZmY7XG4gIG1hY1ttYWNwb3MrMTJdID0gKHRoaXMuaFs2XSA+Pj4gMCkgJiAweGZmO1xuICBtYWNbbWFjcG9zKzEzXSA9ICh0aGlzLmhbNl0gPj4+IDgpICYgMHhmZjtcbiAgbWFjW21hY3BvcysxNF0gPSAodGhpcy5oWzddID4+PiAwKSAmIDB4ZmY7XG4gIG1hY1ttYWNwb3MrMTVdID0gKHRoaXMuaFs3XSA+Pj4gOCkgJiAweGZmO1xufTtcblxucG9seTEzMDUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG0sIG1wb3MsIGJ5dGVzKSB7XG4gIHZhciBpLCB3YW50O1xuXG4gIGlmICh0aGlzLmxlZnRvdmVyKSB7XG4gICAgd2FudCA9ICgxNiAtIHRoaXMubGVmdG92ZXIpO1xuICAgIGlmICh3YW50ID4gYnl0ZXMpXG4gICAgICB3YW50ID0gYnl0ZXM7XG4gICAgZm9yIChpID0gMDsgaSA8IHdhbnQ7IGkrKylcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMubGVmdG92ZXIgKyBpXSA9IG1bbXBvcytpXTtcbiAgICBieXRlcyAtPSB3YW50O1xuICAgIG1wb3MgKz0gd2FudDtcbiAgICB0aGlzLmxlZnRvdmVyICs9IHdhbnQ7XG4gICAgaWYgKHRoaXMubGVmdG92ZXIgPCAxNilcbiAgICAgIHJldHVybjtcbiAgICB0aGlzLmJsb2Nrcyh0aGlzLmJ1ZmZlciwgMCwgMTYpO1xuICAgIHRoaXMubGVmdG92ZXIgPSAwO1xuICB9XG5cbiAgaWYgKGJ5dGVzID49IDE2KSB7XG4gICAgd2FudCA9IGJ5dGVzIC0gKGJ5dGVzICUgMTYpO1xuICAgIHRoaXMuYmxvY2tzKG0sIG1wb3MsIHdhbnQpO1xuICAgIG1wb3MgKz0gd2FudDtcbiAgICBieXRlcyAtPSB3YW50O1xuICB9XG5cbiAgaWYgKGJ5dGVzKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGJ5dGVzOyBpKyspXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLmxlZnRvdmVyICsgaV0gPSBtW21wb3MraV07XG4gICAgdGhpcy5sZWZ0b3ZlciArPSBieXRlcztcbiAgfVxufTtcblxuZnVuY3Rpb24gY3J5cHRvX29uZXRpbWVhdXRoKG91dCwgb3V0cG9zLCBtLCBtcG9zLCBuLCBrKSB7XG4gIHZhciBzID0gbmV3IHBvbHkxMzA1KGspO1xuICBzLnVwZGF0ZShtLCBtcG9zLCBuKTtcbiAgcy5maW5pc2gob3V0LCBvdXRwb3MpO1xuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX29uZXRpbWVhdXRoX3ZlcmlmeShoLCBocG9zLCBtLCBtcG9zLCBuLCBrKSB7XG4gIHZhciB4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICBjcnlwdG9fb25ldGltZWF1dGgoeCwwLG0sbXBvcyxuLGspO1xuICByZXR1cm4gY3J5cHRvX3ZlcmlmeV8xNihoLGhwb3MseCwwKTtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX3NlY3JldGJveChjLG0sZCxuLGspIHtcbiAgdmFyIGk7XG4gIGlmIChkIDwgMzIpIHJldHVybiAtMTtcbiAgY3J5cHRvX3N0cmVhbV94b3IoYywwLG0sMCxkLG4sayk7XG4gIGNyeXB0b19vbmV0aW1lYXV0aChjLCAxNiwgYywgMzIsIGQgLSAzMiwgYyk7XG4gIGZvciAoaSA9IDA7IGkgPCAxNjsgaSsrKSBjW2ldID0gMDtcbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19zZWNyZXRib3hfb3BlbihtLGMsZCxuLGspIHtcbiAgdmFyIGk7XG4gIHZhciB4ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xuICBpZiAoZCA8IDMyKSByZXR1cm4gLTE7XG4gIGNyeXB0b19zdHJlYW0oeCwwLDMyLG4sayk7XG4gIGlmIChjcnlwdG9fb25ldGltZWF1dGhfdmVyaWZ5KGMsIDE2LGMsIDMyLGQgLSAzMix4KSAhPT0gMCkgcmV0dXJuIC0xO1xuICBjcnlwdG9fc3RyZWFtX3hvcihtLDAsYywwLGQsbixrKTtcbiAgZm9yIChpID0gMDsgaSA8IDMyOyBpKyspIG1baV0gPSAwO1xuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gc2V0MjU1MTkociwgYSkge1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHJbaV0gPSBhW2ldfDA7XG59XG5cbmZ1bmN0aW9uIGNhcjI1NTE5KG8pIHtcbiAgdmFyIGksIHYsIGMgPSAxO1xuICBmb3IgKGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgIHYgPSBvW2ldICsgYyArIDY1NTM1O1xuICAgIGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7XG4gICAgb1tpXSA9IHYgLSBjICogNjU1MzY7XG4gIH1cbiAgb1swXSArPSBjLTEgKyAzNyAqIChjLTEpO1xufVxuXG5mdW5jdGlvbiBzZWwyNTUxOShwLCBxLCBiKSB7XG4gIHZhciB0LCBjID0gfihiLTEpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICB0ID0gYyAmIChwW2ldIF4gcVtpXSk7XG4gICAgcFtpXSBePSB0O1xuICAgIHFbaV0gXj0gdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYWNrMjU1MTkobywgbikge1xuICB2YXIgaSwgaiwgYjtcbiAgdmFyIG0gPSBnZigpLCB0ID0gZ2YoKTtcbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHRbaV0gPSBuW2ldO1xuICBjYXIyNTUxOSh0KTtcbiAgY2FyMjU1MTkodCk7XG4gIGNhcjI1NTE5KHQpO1xuICBmb3IgKGogPSAwOyBqIDwgMjsgaisrKSB7XG4gICAgbVswXSA9IHRbMF0gLSAweGZmZWQ7XG4gICAgZm9yIChpID0gMTsgaSA8IDE1OyBpKyspIHtcbiAgICAgIG1baV0gPSB0W2ldIC0gMHhmZmZmIC0gKChtW2ktMV0+PjE2KSAmIDEpO1xuICAgICAgbVtpLTFdICY9IDB4ZmZmZjtcbiAgICB9XG4gICAgbVsxNV0gPSB0WzE1XSAtIDB4N2ZmZiAtICgobVsxNF0+PjE2KSAmIDEpO1xuICAgIGIgPSAobVsxNV0+PjE2KSAmIDE7XG4gICAgbVsxNF0gJj0gMHhmZmZmO1xuICAgIHNlbDI1NTE5KHQsIG0sIDEtYik7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICBvWzIqaV0gPSB0W2ldICYgMHhmZjtcbiAgICBvWzIqaSsxXSA9IHRbaV0+Pjg7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmVxMjU1MTkoYSwgYikge1xuICB2YXIgYyA9IG5ldyBVaW50OEFycmF5KDMyKSwgZCA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgcGFjazI1NTE5KGMsIGEpO1xuICBwYWNrMjU1MTkoZCwgYik7XG4gIHJldHVybiBjcnlwdG9fdmVyaWZ5XzMyKGMsIDAsIGQsIDApO1xufVxuXG5mdW5jdGlvbiBwYXIyNTUxOShhKSB7XG4gIHZhciBkID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xuICBwYWNrMjU1MTkoZCwgYSk7XG4gIHJldHVybiBkWzBdICYgMTtcbn1cblxuZnVuY3Rpb24gdW5wYWNrMjU1MTkobywgbikge1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIG9baV0gPSBuWzIqaV0gKyAoblsyKmkrMV0gPDwgOCk7XG4gIG9bMTVdICY9IDB4N2ZmZjtcbn1cblxuZnVuY3Rpb24gQShvLCBhLCBiKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykgb1tpXSA9IGFbaV0gKyBiW2ldO1xufVxuXG5mdW5jdGlvbiBaKG8sIGEsIGIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSBvW2ldID0gYVtpXSAtIGJbaV07XG59XG5cbmZ1bmN0aW9uIE0obywgYSwgYikge1xuICB2YXIgdiwgYyxcbiAgICAgdDAgPSAwLCAgdDEgPSAwLCAgdDIgPSAwLCAgdDMgPSAwLCAgdDQgPSAwLCAgdDUgPSAwLCAgdDYgPSAwLCAgdDcgPSAwLFxuICAgICB0OCA9IDAsICB0OSA9IDAsIHQxMCA9IDAsIHQxMSA9IDAsIHQxMiA9IDAsIHQxMyA9IDAsIHQxNCA9IDAsIHQxNSA9IDAsXG4gICAgdDE2ID0gMCwgdDE3ID0gMCwgdDE4ID0gMCwgdDE5ID0gMCwgdDIwID0gMCwgdDIxID0gMCwgdDIyID0gMCwgdDIzID0gMCxcbiAgICB0MjQgPSAwLCB0MjUgPSAwLCB0MjYgPSAwLCB0MjcgPSAwLCB0MjggPSAwLCB0MjkgPSAwLCB0MzAgPSAwLFxuICAgIGIwID0gYlswXSxcbiAgICBiMSA9IGJbMV0sXG4gICAgYjIgPSBiWzJdLFxuICAgIGIzID0gYlszXSxcbiAgICBiNCA9IGJbNF0sXG4gICAgYjUgPSBiWzVdLFxuICAgIGI2ID0gYls2XSxcbiAgICBiNyA9IGJbN10sXG4gICAgYjggPSBiWzhdLFxuICAgIGI5ID0gYls5XSxcbiAgICBiMTAgPSBiWzEwXSxcbiAgICBiMTEgPSBiWzExXSxcbiAgICBiMTIgPSBiWzEyXSxcbiAgICBiMTMgPSBiWzEzXSxcbiAgICBiMTQgPSBiWzE0XSxcbiAgICBiMTUgPSBiWzE1XTtcblxuICB2ID0gYVswXTtcbiAgdDAgKz0gdiAqIGIwO1xuICB0MSArPSB2ICogYjE7XG4gIHQyICs9IHYgKiBiMjtcbiAgdDMgKz0gdiAqIGIzO1xuICB0NCArPSB2ICogYjQ7XG4gIHQ1ICs9IHYgKiBiNTtcbiAgdDYgKz0gdiAqIGI2O1xuICB0NyArPSB2ICogYjc7XG4gIHQ4ICs9IHYgKiBiODtcbiAgdDkgKz0gdiAqIGI5O1xuICB0MTAgKz0gdiAqIGIxMDtcbiAgdDExICs9IHYgKiBiMTE7XG4gIHQxMiArPSB2ICogYjEyO1xuICB0MTMgKz0gdiAqIGIxMztcbiAgdDE0ICs9IHYgKiBiMTQ7XG4gIHQxNSArPSB2ICogYjE1O1xuICB2ID0gYVsxXTtcbiAgdDEgKz0gdiAqIGIwO1xuICB0MiArPSB2ICogYjE7XG4gIHQzICs9IHYgKiBiMjtcbiAgdDQgKz0gdiAqIGIzO1xuICB0NSArPSB2ICogYjQ7XG4gIHQ2ICs9IHYgKiBiNTtcbiAgdDcgKz0gdiAqIGI2O1xuICB0OCArPSB2ICogYjc7XG4gIHQ5ICs9IHYgKiBiODtcbiAgdDEwICs9IHYgKiBiOTtcbiAgdDExICs9IHYgKiBiMTA7XG4gIHQxMiArPSB2ICogYjExO1xuICB0MTMgKz0gdiAqIGIxMjtcbiAgdDE0ICs9IHYgKiBiMTM7XG4gIHQxNSArPSB2ICogYjE0O1xuICB0MTYgKz0gdiAqIGIxNTtcbiAgdiA9IGFbMl07XG4gIHQyICs9IHYgKiBiMDtcbiAgdDMgKz0gdiAqIGIxO1xuICB0NCArPSB2ICogYjI7XG4gIHQ1ICs9IHYgKiBiMztcbiAgdDYgKz0gdiAqIGI0O1xuICB0NyArPSB2ICogYjU7XG4gIHQ4ICs9IHYgKiBiNjtcbiAgdDkgKz0gdiAqIGI3O1xuICB0MTAgKz0gdiAqIGI4O1xuICB0MTEgKz0gdiAqIGI5O1xuICB0MTIgKz0gdiAqIGIxMDtcbiAgdDEzICs9IHYgKiBiMTE7XG4gIHQxNCArPSB2ICogYjEyO1xuICB0MTUgKz0gdiAqIGIxMztcbiAgdDE2ICs9IHYgKiBiMTQ7XG4gIHQxNyArPSB2ICogYjE1O1xuICB2ID0gYVszXTtcbiAgdDMgKz0gdiAqIGIwO1xuICB0NCArPSB2ICogYjE7XG4gIHQ1ICs9IHYgKiBiMjtcbiAgdDYgKz0gdiAqIGIzO1xuICB0NyArPSB2ICogYjQ7XG4gIHQ4ICs9IHYgKiBiNTtcbiAgdDkgKz0gdiAqIGI2O1xuICB0MTAgKz0gdiAqIGI3O1xuICB0MTEgKz0gdiAqIGI4O1xuICB0MTIgKz0gdiAqIGI5O1xuICB0MTMgKz0gdiAqIGIxMDtcbiAgdDE0ICs9IHYgKiBiMTE7XG4gIHQxNSArPSB2ICogYjEyO1xuICB0MTYgKz0gdiAqIGIxMztcbiAgdDE3ICs9IHYgKiBiMTQ7XG4gIHQxOCArPSB2ICogYjE1O1xuICB2ID0gYVs0XTtcbiAgdDQgKz0gdiAqIGIwO1xuICB0NSArPSB2ICogYjE7XG4gIHQ2ICs9IHYgKiBiMjtcbiAgdDcgKz0gdiAqIGIzO1xuICB0OCArPSB2ICogYjQ7XG4gIHQ5ICs9IHYgKiBiNTtcbiAgdDEwICs9IHYgKiBiNjtcbiAgdDExICs9IHYgKiBiNztcbiAgdDEyICs9IHYgKiBiODtcbiAgdDEzICs9IHYgKiBiOTtcbiAgdDE0ICs9IHYgKiBiMTA7XG4gIHQxNSArPSB2ICogYjExO1xuICB0MTYgKz0gdiAqIGIxMjtcbiAgdDE3ICs9IHYgKiBiMTM7XG4gIHQxOCArPSB2ICogYjE0O1xuICB0MTkgKz0gdiAqIGIxNTtcbiAgdiA9IGFbNV07XG4gIHQ1ICs9IHYgKiBiMDtcbiAgdDYgKz0gdiAqIGIxO1xuICB0NyArPSB2ICogYjI7XG4gIHQ4ICs9IHYgKiBiMztcbiAgdDkgKz0gdiAqIGI0O1xuICB0MTAgKz0gdiAqIGI1O1xuICB0MTEgKz0gdiAqIGI2O1xuICB0MTIgKz0gdiAqIGI3O1xuICB0MTMgKz0gdiAqIGI4O1xuICB0MTQgKz0gdiAqIGI5O1xuICB0MTUgKz0gdiAqIGIxMDtcbiAgdDE2ICs9IHYgKiBiMTE7XG4gIHQxNyArPSB2ICogYjEyO1xuICB0MTggKz0gdiAqIGIxMztcbiAgdDE5ICs9IHYgKiBiMTQ7XG4gIHQyMCArPSB2ICogYjE1O1xuICB2ID0gYVs2XTtcbiAgdDYgKz0gdiAqIGIwO1xuICB0NyArPSB2ICogYjE7XG4gIHQ4ICs9IHYgKiBiMjtcbiAgdDkgKz0gdiAqIGIzO1xuICB0MTAgKz0gdiAqIGI0O1xuICB0MTEgKz0gdiAqIGI1O1xuICB0MTIgKz0gdiAqIGI2O1xuICB0MTMgKz0gdiAqIGI3O1xuICB0MTQgKz0gdiAqIGI4O1xuICB0MTUgKz0gdiAqIGI5O1xuICB0MTYgKz0gdiAqIGIxMDtcbiAgdDE3ICs9IHYgKiBiMTE7XG4gIHQxOCArPSB2ICogYjEyO1xuICB0MTkgKz0gdiAqIGIxMztcbiAgdDIwICs9IHYgKiBiMTQ7XG4gIHQyMSArPSB2ICogYjE1O1xuICB2ID0gYVs3XTtcbiAgdDcgKz0gdiAqIGIwO1xuICB0OCArPSB2ICogYjE7XG4gIHQ5ICs9IHYgKiBiMjtcbiAgdDEwICs9IHYgKiBiMztcbiAgdDExICs9IHYgKiBiNDtcbiAgdDEyICs9IHYgKiBiNTtcbiAgdDEzICs9IHYgKiBiNjtcbiAgdDE0ICs9IHYgKiBiNztcbiAgdDE1ICs9IHYgKiBiODtcbiAgdDE2ICs9IHYgKiBiOTtcbiAgdDE3ICs9IHYgKiBiMTA7XG4gIHQxOCArPSB2ICogYjExO1xuICB0MTkgKz0gdiAqIGIxMjtcbiAgdDIwICs9IHYgKiBiMTM7XG4gIHQyMSArPSB2ICogYjE0O1xuICB0MjIgKz0gdiAqIGIxNTtcbiAgdiA9IGFbOF07XG4gIHQ4ICs9IHYgKiBiMDtcbiAgdDkgKz0gdiAqIGIxO1xuICB0MTAgKz0gdiAqIGIyO1xuICB0MTEgKz0gdiAqIGIzO1xuICB0MTIgKz0gdiAqIGI0O1xuICB0MTMgKz0gdiAqIGI1O1xuICB0MTQgKz0gdiAqIGI2O1xuICB0MTUgKz0gdiAqIGI3O1xuICB0MTYgKz0gdiAqIGI4O1xuICB0MTcgKz0gdiAqIGI5O1xuICB0MTggKz0gdiAqIGIxMDtcbiAgdDE5ICs9IHYgKiBiMTE7XG4gIHQyMCArPSB2ICogYjEyO1xuICB0MjEgKz0gdiAqIGIxMztcbiAgdDIyICs9IHYgKiBiMTQ7XG4gIHQyMyArPSB2ICogYjE1O1xuICB2ID0gYVs5XTtcbiAgdDkgKz0gdiAqIGIwO1xuICB0MTAgKz0gdiAqIGIxO1xuICB0MTEgKz0gdiAqIGIyO1xuICB0MTIgKz0gdiAqIGIzO1xuICB0MTMgKz0gdiAqIGI0O1xuICB0MTQgKz0gdiAqIGI1O1xuICB0MTUgKz0gdiAqIGI2O1xuICB0MTYgKz0gdiAqIGI3O1xuICB0MTcgKz0gdiAqIGI4O1xuICB0MTggKz0gdiAqIGI5O1xuICB0MTkgKz0gdiAqIGIxMDtcbiAgdDIwICs9IHYgKiBiMTE7XG4gIHQyMSArPSB2ICogYjEyO1xuICB0MjIgKz0gdiAqIGIxMztcbiAgdDIzICs9IHYgKiBiMTQ7XG4gIHQyNCArPSB2ICogYjE1O1xuICB2ID0gYVsxMF07XG4gIHQxMCArPSB2ICogYjA7XG4gIHQxMSArPSB2ICogYjE7XG4gIHQxMiArPSB2ICogYjI7XG4gIHQxMyArPSB2ICogYjM7XG4gIHQxNCArPSB2ICogYjQ7XG4gIHQxNSArPSB2ICogYjU7XG4gIHQxNiArPSB2ICogYjY7XG4gIHQxNyArPSB2ICogYjc7XG4gIHQxOCArPSB2ICogYjg7XG4gIHQxOSArPSB2ICogYjk7XG4gIHQyMCArPSB2ICogYjEwO1xuICB0MjEgKz0gdiAqIGIxMTtcbiAgdDIyICs9IHYgKiBiMTI7XG4gIHQyMyArPSB2ICogYjEzO1xuICB0MjQgKz0gdiAqIGIxNDtcbiAgdDI1ICs9IHYgKiBiMTU7XG4gIHYgPSBhWzExXTtcbiAgdDExICs9IHYgKiBiMDtcbiAgdDEyICs9IHYgKiBiMTtcbiAgdDEzICs9IHYgKiBiMjtcbiAgdDE0ICs9IHYgKiBiMztcbiAgdDE1ICs9IHYgKiBiNDtcbiAgdDE2ICs9IHYgKiBiNTtcbiAgdDE3ICs9IHYgKiBiNjtcbiAgdDE4ICs9IHYgKiBiNztcbiAgdDE5ICs9IHYgKiBiODtcbiAgdDIwICs9IHYgKiBiOTtcbiAgdDIxICs9IHYgKiBiMTA7XG4gIHQyMiArPSB2ICogYjExO1xuICB0MjMgKz0gdiAqIGIxMjtcbiAgdDI0ICs9IHYgKiBiMTM7XG4gIHQyNSArPSB2ICogYjE0O1xuICB0MjYgKz0gdiAqIGIxNTtcbiAgdiA9IGFbMTJdO1xuICB0MTIgKz0gdiAqIGIwO1xuICB0MTMgKz0gdiAqIGIxO1xuICB0MTQgKz0gdiAqIGIyO1xuICB0MTUgKz0gdiAqIGIzO1xuICB0MTYgKz0gdiAqIGI0O1xuICB0MTcgKz0gdiAqIGI1O1xuICB0MTggKz0gdiAqIGI2O1xuICB0MTkgKz0gdiAqIGI3O1xuICB0MjAgKz0gdiAqIGI4O1xuICB0MjEgKz0gdiAqIGI5O1xuICB0MjIgKz0gdiAqIGIxMDtcbiAgdDIzICs9IHYgKiBiMTE7XG4gIHQyNCArPSB2ICogYjEyO1xuICB0MjUgKz0gdiAqIGIxMztcbiAgdDI2ICs9IHYgKiBiMTQ7XG4gIHQyNyArPSB2ICogYjE1O1xuICB2ID0gYVsxM107XG4gIHQxMyArPSB2ICogYjA7XG4gIHQxNCArPSB2ICogYjE7XG4gIHQxNSArPSB2ICogYjI7XG4gIHQxNiArPSB2ICogYjM7XG4gIHQxNyArPSB2ICogYjQ7XG4gIHQxOCArPSB2ICogYjU7XG4gIHQxOSArPSB2ICogYjY7XG4gIHQyMCArPSB2ICogYjc7XG4gIHQyMSArPSB2ICogYjg7XG4gIHQyMiArPSB2ICogYjk7XG4gIHQyMyArPSB2ICogYjEwO1xuICB0MjQgKz0gdiAqIGIxMTtcbiAgdDI1ICs9IHYgKiBiMTI7XG4gIHQyNiArPSB2ICogYjEzO1xuICB0MjcgKz0gdiAqIGIxNDtcbiAgdDI4ICs9IHYgKiBiMTU7XG4gIHYgPSBhWzE0XTtcbiAgdDE0ICs9IHYgKiBiMDtcbiAgdDE1ICs9IHYgKiBiMTtcbiAgdDE2ICs9IHYgKiBiMjtcbiAgdDE3ICs9IHYgKiBiMztcbiAgdDE4ICs9IHYgKiBiNDtcbiAgdDE5ICs9IHYgKiBiNTtcbiAgdDIwICs9IHYgKiBiNjtcbiAgdDIxICs9IHYgKiBiNztcbiAgdDIyICs9IHYgKiBiODtcbiAgdDIzICs9IHYgKiBiOTtcbiAgdDI0ICs9IHYgKiBiMTA7XG4gIHQyNSArPSB2ICogYjExO1xuICB0MjYgKz0gdiAqIGIxMjtcbiAgdDI3ICs9IHYgKiBiMTM7XG4gIHQyOCArPSB2ICogYjE0O1xuICB0MjkgKz0gdiAqIGIxNTtcbiAgdiA9IGFbMTVdO1xuICB0MTUgKz0gdiAqIGIwO1xuICB0MTYgKz0gdiAqIGIxO1xuICB0MTcgKz0gdiAqIGIyO1xuICB0MTggKz0gdiAqIGIzO1xuICB0MTkgKz0gdiAqIGI0O1xuICB0MjAgKz0gdiAqIGI1O1xuICB0MjEgKz0gdiAqIGI2O1xuICB0MjIgKz0gdiAqIGI3O1xuICB0MjMgKz0gdiAqIGI4O1xuICB0MjQgKz0gdiAqIGI5O1xuICB0MjUgKz0gdiAqIGIxMDtcbiAgdDI2ICs9IHYgKiBiMTE7XG4gIHQyNyArPSB2ICogYjEyO1xuICB0MjggKz0gdiAqIGIxMztcbiAgdDI5ICs9IHYgKiBiMTQ7XG4gIHQzMCArPSB2ICogYjE1O1xuXG4gIHQwICArPSAzOCAqIHQxNjtcbiAgdDEgICs9IDM4ICogdDE3O1xuICB0MiAgKz0gMzggKiB0MTg7XG4gIHQzICArPSAzOCAqIHQxOTtcbiAgdDQgICs9IDM4ICogdDIwO1xuICB0NSAgKz0gMzggKiB0MjE7XG4gIHQ2ICArPSAzOCAqIHQyMjtcbiAgdDcgICs9IDM4ICogdDIzO1xuICB0OCAgKz0gMzggKiB0MjQ7XG4gIHQ5ICArPSAzOCAqIHQyNTtcbiAgdDEwICs9IDM4ICogdDI2O1xuICB0MTEgKz0gMzggKiB0Mjc7XG4gIHQxMiArPSAzOCAqIHQyODtcbiAgdDEzICs9IDM4ICogdDI5O1xuICB0MTQgKz0gMzggKiB0MzA7XG4gIC8vIHQxNSBsZWZ0IGFzIGlzXG5cbiAgLy8gZmlyc3QgY2FyXG4gIGMgPSAxO1xuICB2ID0gIHQwICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDAgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQxICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDEgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQyICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDIgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQzICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDMgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ0ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDQgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ1ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDUgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ2ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDYgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ3ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDcgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ4ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDggPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gIHQ5ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyAgdDkgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDEwICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTAgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDExICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTEgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDEyICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTIgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDEzICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTMgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDE0ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTQgPSB2IC0gYyAqIDY1NTM2O1xuICB2ID0gdDE1ICsgYyArIDY1NTM1OyBjID0gTWF0aC5mbG9vcih2IC8gNjU1MzYpOyB0MTUgPSB2IC0gYyAqIDY1NTM2O1xuICB0MCArPSBjLTEgKyAzNyAqIChjLTEpO1xuXG4gIC8vIHNlY29uZCBjYXJcbiAgYyA9IDE7XG4gIHYgPSAgdDAgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0MCA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDEgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0MSA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDIgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0MiA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDMgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0MyA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDQgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0NCA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDUgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0NSA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDYgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0NiA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDcgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0NyA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDggKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0OCA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSAgdDkgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7ICB0OSA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTAgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxMCA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTEgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxMSA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTIgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxMiA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTMgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxMyA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTQgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxNCA9IHYgLSBjICogNjU1MzY7XG4gIHYgPSB0MTUgKyBjICsgNjU1MzU7IGMgPSBNYXRoLmZsb29yKHYgLyA2NTUzNik7IHQxNSA9IHYgLSBjICogNjU1MzY7XG4gIHQwICs9IGMtMSArIDM3ICogKGMtMSk7XG5cbiAgb1sgMF0gPSB0MDtcbiAgb1sgMV0gPSB0MTtcbiAgb1sgMl0gPSB0MjtcbiAgb1sgM10gPSB0MztcbiAgb1sgNF0gPSB0NDtcbiAgb1sgNV0gPSB0NTtcbiAgb1sgNl0gPSB0NjtcbiAgb1sgN10gPSB0NztcbiAgb1sgOF0gPSB0ODtcbiAgb1sgOV0gPSB0OTtcbiAgb1sxMF0gPSB0MTA7XG4gIG9bMTFdID0gdDExO1xuICBvWzEyXSA9IHQxMjtcbiAgb1sxM10gPSB0MTM7XG4gIG9bMTRdID0gdDE0O1xuICBvWzE1XSA9IHQxNTtcbn1cblxuZnVuY3Rpb24gUyhvLCBhKSB7XG4gIE0obywgYSwgYSk7XG59XG5cbmZ1bmN0aW9uIGludjI1NTE5KG8sIGkpIHtcbiAgdmFyIGMgPSBnZigpO1xuICB2YXIgYTtcbiAgZm9yIChhID0gMDsgYSA8IDE2OyBhKyspIGNbYV0gPSBpW2FdO1xuICBmb3IgKGEgPSAyNTM7IGEgPj0gMDsgYS0tKSB7XG4gICAgUyhjLCBjKTtcbiAgICBpZihhICE9PSAyICYmIGEgIT09IDQpIE0oYywgYywgaSk7XG4gIH1cbiAgZm9yIChhID0gMDsgYSA8IDE2OyBhKyspIG9bYV0gPSBjW2FdO1xufVxuXG5mdW5jdGlvbiBwb3cyNTIzKG8sIGkpIHtcbiAgdmFyIGMgPSBnZigpO1xuICB2YXIgYTtcbiAgZm9yIChhID0gMDsgYSA8IDE2OyBhKyspIGNbYV0gPSBpW2FdO1xuICBmb3IgKGEgPSAyNTA7IGEgPj0gMDsgYS0tKSB7XG4gICAgICBTKGMsIGMpO1xuICAgICAgaWYoYSAhPT0gMSkgTShjLCBjLCBpKTtcbiAgfVxuICBmb3IgKGEgPSAwOyBhIDwgMTY7IGErKykgb1thXSA9IGNbYV07XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19zY2FsYXJtdWx0KHEsIG4sIHApIHtcbiAgdmFyIHogPSBuZXcgVWludDhBcnJheSgzMik7XG4gIHZhciB4ID0gbmV3IEZsb2F0NjRBcnJheSg4MCksIHIsIGk7XG4gIHZhciBhID0gZ2YoKSwgYiA9IGdmKCksIGMgPSBnZigpLFxuICAgICAgZCA9IGdmKCksIGUgPSBnZigpLCBmID0gZ2YoKTtcbiAgZm9yIChpID0gMDsgaSA8IDMxOyBpKyspIHpbaV0gPSBuW2ldO1xuICB6WzMxXT0oblszMV0mMTI3KXw2NDtcbiAgelswXSY9MjQ4O1xuICB1bnBhY2syNTUxOSh4LHApO1xuICBmb3IgKGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgIGJbaV09eFtpXTtcbiAgICBkW2ldPWFbaV09Y1tpXT0wO1xuICB9XG4gIGFbMF09ZFswXT0xO1xuICBmb3IgKGk9MjU0OyBpPj0wOyAtLWkpIHtcbiAgICByPSh6W2k+Pj4zXT4+PihpJjcpKSYxO1xuICAgIHNlbDI1NTE5KGEsYixyKTtcbiAgICBzZWwyNTUxOShjLGQscik7XG4gICAgQShlLGEsYyk7XG4gICAgWihhLGEsYyk7XG4gICAgQShjLGIsZCk7XG4gICAgWihiLGIsZCk7XG4gICAgUyhkLGUpO1xuICAgIFMoZixhKTtcbiAgICBNKGEsYyxhKTtcbiAgICBNKGMsYixlKTtcbiAgICBBKGUsYSxjKTtcbiAgICBaKGEsYSxjKTtcbiAgICBTKGIsYSk7XG4gICAgWihjLGQsZik7XG4gICAgTShhLGMsXzEyMTY2NSk7XG4gICAgQShhLGEsZCk7XG4gICAgTShjLGMsYSk7XG4gICAgTShhLGQsZik7XG4gICAgTShkLGIseCk7XG4gICAgUyhiLGUpO1xuICAgIHNlbDI1NTE5KGEsYixyKTtcbiAgICBzZWwyNTUxOShjLGQscik7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICB4W2krMTZdPWFbaV07XG4gICAgeFtpKzMyXT1jW2ldO1xuICAgIHhbaSs0OF09YltpXTtcbiAgICB4W2krNjRdPWRbaV07XG4gIH1cbiAgdmFyIHgzMiA9IHguc3ViYXJyYXkoMzIpO1xuICB2YXIgeDE2ID0geC5zdWJhcnJheSgxNik7XG4gIGludjI1NTE5KHgzMix4MzIpO1xuICBNKHgxNix4MTYseDMyKTtcbiAgcGFjazI1NTE5KHEseDE2KTtcbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19zY2FsYXJtdWx0X2Jhc2UocSwgbikge1xuICByZXR1cm4gY3J5cHRvX3NjYWxhcm11bHQocSwgbiwgXzkpO1xufVxuXG5mdW5jdGlvbiBjcnlwdG9fYm94X2tleXBhaXIoeSwgeCkge1xuICByYW5kb21ieXRlcyh4LCAzMik7XG4gIHJldHVybiBjcnlwdG9fc2NhbGFybXVsdF9iYXNlKHksIHgpO1xufVxuXG5mdW5jdGlvbiBjcnlwdG9fYm94X2JlZm9yZW5tKGssIHksIHgpIHtcbiAgdmFyIHMgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGNyeXB0b19zY2FsYXJtdWx0KHMsIHgsIHkpO1xuICByZXR1cm4gY3J5cHRvX2NvcmVfaHNhbHNhMjAoaywgXzAsIHMsIHNpZ21hKTtcbn1cblxudmFyIGNyeXB0b19ib3hfYWZ0ZXJubSA9IGNyeXB0b19zZWNyZXRib3g7XG52YXIgY3J5cHRvX2JveF9vcGVuX2FmdGVybm0gPSBjcnlwdG9fc2VjcmV0Ym94X29wZW47XG5cbmZ1bmN0aW9uIGNyeXB0b19ib3goYywgbSwgZCwgbiwgeSwgeCkge1xuICB2YXIgayA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgY3J5cHRvX2JveF9iZWZvcmVubShrLCB5LCB4KTtcbiAgcmV0dXJuIGNyeXB0b19ib3hfYWZ0ZXJubShjLCBtLCBkLCBuLCBrKTtcbn1cblxuZnVuY3Rpb24gY3J5cHRvX2JveF9vcGVuKG0sIGMsIGQsIG4sIHksIHgpIHtcbiAgdmFyIGsgPSBuZXcgVWludDhBcnJheSgzMik7XG4gIGNyeXB0b19ib3hfYmVmb3Jlbm0oaywgeSwgeCk7XG4gIHJldHVybiBjcnlwdG9fYm94X29wZW5fYWZ0ZXJubShtLCBjLCBkLCBuLCBrKTtcbn1cblxudmFyIEsgPSBbXG4gIDB4NDI4YTJmOTgsIDB4ZDcyOGFlMjIsIDB4NzEzNzQ0OTEsIDB4MjNlZjY1Y2QsXG4gIDB4YjVjMGZiY2YsIDB4ZWM0ZDNiMmYsIDB4ZTliNWRiYTUsIDB4ODE4OWRiYmMsXG4gIDB4Mzk1NmMyNWIsIDB4ZjM0OGI1MzgsIDB4NTlmMTExZjEsIDB4YjYwNWQwMTksXG4gIDB4OTIzZjgyYTQsIDB4YWYxOTRmOWIsIDB4YWIxYzVlZDUsIDB4ZGE2ZDgxMTgsXG4gIDB4ZDgwN2FhOTgsIDB4YTMwMzAyNDIsIDB4MTI4MzViMDEsIDB4NDU3MDZmYmUsXG4gIDB4MjQzMTg1YmUsIDB4NGVlNGIyOGMsIDB4NTUwYzdkYzMsIDB4ZDVmZmI0ZTIsXG4gIDB4NzJiZTVkNzQsIDB4ZjI3Yjg5NmYsIDB4ODBkZWIxZmUsIDB4M2IxNjk2YjEsXG4gIDB4OWJkYzA2YTcsIDB4MjVjNzEyMzUsIDB4YzE5YmYxNzQsIDB4Y2Y2OTI2OTQsXG4gIDB4ZTQ5YjY5YzEsIDB4OWVmMTRhZDIsIDB4ZWZiZTQ3ODYsIDB4Mzg0ZjI1ZTMsXG4gIDB4MGZjMTlkYzYsIDB4OGI4Y2Q1YjUsIDB4MjQwY2ExY2MsIDB4NzdhYzljNjUsXG4gIDB4MmRlOTJjNmYsIDB4NTkyYjAyNzUsIDB4NGE3NDg0YWEsIDB4NmVhNmU0ODMsXG4gIDB4NWNiMGE5ZGMsIDB4YmQ0MWZiZDQsIDB4NzZmOTg4ZGEsIDB4ODMxMTUzYjUsXG4gIDB4OTgzZTUxNTIsIDB4ZWU2NmRmYWIsIDB4YTgzMWM2NmQsIDB4MmRiNDMyMTAsXG4gIDB4YjAwMzI3YzgsIDB4OThmYjIxM2YsIDB4YmY1OTdmYzcsIDB4YmVlZjBlZTQsXG4gIDB4YzZlMDBiZjMsIDB4M2RhODhmYzIsIDB4ZDVhNzkxNDcsIDB4OTMwYWE3MjUsXG4gIDB4MDZjYTYzNTEsIDB4ZTAwMzgyNmYsIDB4MTQyOTI5NjcsIDB4MGEwZTZlNzAsXG4gIDB4MjdiNzBhODUsIDB4NDZkMjJmZmMsIDB4MmUxYjIxMzgsIDB4NWMyNmM5MjYsXG4gIDB4NGQyYzZkZmMsIDB4NWFjNDJhZWQsIDB4NTMzODBkMTMsIDB4OWQ5NWIzZGYsXG4gIDB4NjUwYTczNTQsIDB4OGJhZjYzZGUsIDB4NzY2YTBhYmIsIDB4M2M3N2IyYTgsXG4gIDB4ODFjMmM5MmUsIDB4NDdlZGFlZTYsIDB4OTI3MjJjODUsIDB4MTQ4MjM1M2IsXG4gIDB4YTJiZmU4YTEsIDB4NGNmMTAzNjQsIDB4YTgxYTY2NGIsIDB4YmM0MjMwMDEsXG4gIDB4YzI0YjhiNzAsIDB4ZDBmODk3OTEsIDB4Yzc2YzUxYTMsIDB4MDY1NGJlMzAsXG4gIDB4ZDE5MmU4MTksIDB4ZDZlZjUyMTgsIDB4ZDY5OTA2MjQsIDB4NTU2NWE5MTAsXG4gIDB4ZjQwZTM1ODUsIDB4NTc3MTIwMmEsIDB4MTA2YWEwNzAsIDB4MzJiYmQxYjgsXG4gIDB4MTlhNGMxMTYsIDB4YjhkMmQwYzgsIDB4MWUzNzZjMDgsIDB4NTE0MWFiNTMsXG4gIDB4Mjc0ODc3NGMsIDB4ZGY4ZWViOTksIDB4MzRiMGJjYjUsIDB4ZTE5YjQ4YTgsXG4gIDB4MzkxYzBjYjMsIDB4YzVjOTVhNjMsIDB4NGVkOGFhNGEsIDB4ZTM0MThhY2IsXG4gIDB4NWI5Y2NhNGYsIDB4Nzc2M2UzNzMsIDB4NjgyZTZmZjMsIDB4ZDZiMmI4YTMsXG4gIDB4NzQ4ZjgyZWUsIDB4NWRlZmIyZmMsIDB4NzhhNTYzNmYsIDB4NDMxNzJmNjAsXG4gIDB4ODRjODc4MTQsIDB4YTFmMGFiNzIsIDB4OGNjNzAyMDgsIDB4MWE2NDM5ZWMsXG4gIDB4OTBiZWZmZmEsIDB4MjM2MzFlMjgsIDB4YTQ1MDZjZWIsIDB4ZGU4MmJkZTksXG4gIDB4YmVmOWEzZjcsIDB4YjJjNjc5MTUsIDB4YzY3MTc4ZjIsIDB4ZTM3MjUzMmIsXG4gIDB4Y2EyNzNlY2UsIDB4ZWEyNjYxOWMsIDB4ZDE4NmI4YzcsIDB4MjFjMGMyMDcsXG4gIDB4ZWFkYTdkZDYsIDB4Y2RlMGViMWUsIDB4ZjU3ZDRmN2YsIDB4ZWU2ZWQxNzgsXG4gIDB4MDZmMDY3YWEsIDB4NzIxNzZmYmEsIDB4MGE2MzdkYzUsIDB4YTJjODk4YTYsXG4gIDB4MTEzZjk4MDQsIDB4YmVmOTBkYWUsIDB4MWI3MTBiMzUsIDB4MTMxYzQ3MWIsXG4gIDB4MjhkYjc3ZjUsIDB4MjMwNDdkODQsIDB4MzJjYWFiN2IsIDB4NDBjNzI0OTMsXG4gIDB4M2M5ZWJlMGEsIDB4MTVjOWJlYmMsIDB4NDMxZDY3YzQsIDB4OWMxMDBkNGMsXG4gIDB4NGNjNWQ0YmUsIDB4Y2IzZTQyYjYsIDB4NTk3ZjI5OWMsIDB4ZmM2NTdlMmEsXG4gIDB4NWZjYjZmYWIsIDB4M2FkNmZhZWMsIDB4NmM0NDE5OGMsIDB4NGE0NzU4MTdcbl07XG5cbmZ1bmN0aW9uIGNyeXB0b19oYXNoYmxvY2tzX2hsKGhoLCBobCwgbSwgbikge1xuICB2YXIgd2ggPSBuZXcgSW50MzJBcnJheSgxNiksIHdsID0gbmV3IEludDMyQXJyYXkoMTYpLFxuICAgICAgYmgwLCBiaDEsIGJoMiwgYmgzLCBiaDQsIGJoNSwgYmg2LCBiaDcsXG4gICAgICBibDAsIGJsMSwgYmwyLCBibDMsIGJsNCwgYmw1LCBibDYsIGJsNyxcbiAgICAgIHRoLCB0bCwgaSwgaiwgaCwgbCwgYSwgYiwgYywgZDtcblxuICB2YXIgYWgwID0gaGhbMF0sXG4gICAgICBhaDEgPSBoaFsxXSxcbiAgICAgIGFoMiA9IGhoWzJdLFxuICAgICAgYWgzID0gaGhbM10sXG4gICAgICBhaDQgPSBoaFs0XSxcbiAgICAgIGFoNSA9IGhoWzVdLFxuICAgICAgYWg2ID0gaGhbNl0sXG4gICAgICBhaDcgPSBoaFs3XSxcblxuICAgICAgYWwwID0gaGxbMF0sXG4gICAgICBhbDEgPSBobFsxXSxcbiAgICAgIGFsMiA9IGhsWzJdLFxuICAgICAgYWwzID0gaGxbM10sXG4gICAgICBhbDQgPSBobFs0XSxcbiAgICAgIGFsNSA9IGhsWzVdLFxuICAgICAgYWw2ID0gaGxbNl0sXG4gICAgICBhbDcgPSBobFs3XTtcblxuICB2YXIgcG9zID0gMDtcbiAgd2hpbGUgKG4gPj0gMTI4KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgIGogPSA4ICogaSArIHBvcztcbiAgICAgIHdoW2ldID0gKG1baiswXSA8PCAyNCkgfCAobVtqKzFdIDw8IDE2KSB8IChtW2orMl0gPDwgOCkgfCBtW2orM107XG4gICAgICB3bFtpXSA9IChtW2orNF0gPDwgMjQpIHwgKG1bais1XSA8PCAxNikgfCAobVtqKzZdIDw8IDgpIHwgbVtqKzddO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgODA7IGkrKykge1xuICAgICAgYmgwID0gYWgwO1xuICAgICAgYmgxID0gYWgxO1xuICAgICAgYmgyID0gYWgyO1xuICAgICAgYmgzID0gYWgzO1xuICAgICAgYmg0ID0gYWg0O1xuICAgICAgYmg1ID0gYWg1O1xuICAgICAgYmg2ID0gYWg2O1xuICAgICAgYmg3ID0gYWg3O1xuXG4gICAgICBibDAgPSBhbDA7XG4gICAgICBibDEgPSBhbDE7XG4gICAgICBibDIgPSBhbDI7XG4gICAgICBibDMgPSBhbDM7XG4gICAgICBibDQgPSBhbDQ7XG4gICAgICBibDUgPSBhbDU7XG4gICAgICBibDYgPSBhbDY7XG4gICAgICBibDcgPSBhbDc7XG5cbiAgICAgIC8vIGFkZFxuICAgICAgaCA9IGFoNztcbiAgICAgIGwgPSBhbDc7XG5cbiAgICAgIGEgPSBsICYgMHhmZmZmOyBiID0gbCA+Pj4gMTY7XG4gICAgICBjID0gaCAmIDB4ZmZmZjsgZCA9IGggPj4+IDE2O1xuXG4gICAgICAvLyBTaWdtYTFcbiAgICAgIGggPSAoKGFoNCA+Pj4gMTQpIHwgKGFsNCA8PCAoMzItMTQpKSkgXiAoKGFoNCA+Pj4gMTgpIHwgKGFsNCA8PCAoMzItMTgpKSkgXiAoKGFsNCA+Pj4gKDQxLTMyKSkgfCAoYWg0IDw8ICgzMi0oNDEtMzIpKSkpO1xuICAgICAgbCA9ICgoYWw0ID4+PiAxNCkgfCAoYWg0IDw8ICgzMi0xNCkpKSBeICgoYWw0ID4+PiAxOCkgfCAoYWg0IDw8ICgzMi0xOCkpKSBeICgoYWg0ID4+PiAoNDEtMzIpKSB8IChhbDQgPDwgKDMyLSg0MS0zMikpKSk7XG5cbiAgICAgIGEgKz0gbCAmIDB4ZmZmZjsgYiArPSBsID4+PiAxNjtcbiAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgLy8gQ2hcbiAgICAgIGggPSAoYWg0ICYgYWg1KSBeICh+YWg0ICYgYWg2KTtcbiAgICAgIGwgPSAoYWw0ICYgYWw1KSBeICh+YWw0ICYgYWw2KTtcblxuICAgICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgICAgYyArPSBoICYgMHhmZmZmOyBkICs9IGggPj4+IDE2O1xuXG4gICAgICAvLyBLXG4gICAgICBoID0gS1tpKjJdO1xuICAgICAgbCA9IEtbaSoyKzFdO1xuXG4gICAgICBhICs9IGwgJiAweGZmZmY7IGIgKz0gbCA+Pj4gMTY7XG4gICAgICBjICs9IGggJiAweGZmZmY7IGQgKz0gaCA+Pj4gMTY7XG5cbiAgICAgIC8vIHdcbiAgICAgIGggPSB3aFtpJTE2XTtcbiAgICAgIGwgPSB3bFtpJTE2XTtcblxuICAgICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgICAgYyArPSBoICYgMHhmZmZmOyBkICs9IGggPj4+IDE2O1xuXG4gICAgICBiICs9IGEgPj4+IDE2O1xuICAgICAgYyArPSBiID4+PiAxNjtcbiAgICAgIGQgKz0gYyA+Pj4gMTY7XG5cbiAgICAgIHRoID0gYyAmIDB4ZmZmZiB8IGQgPDwgMTY7XG4gICAgICB0bCA9IGEgJiAweGZmZmYgfCBiIDw8IDE2O1xuXG4gICAgICAvLyBhZGRcbiAgICAgIGggPSB0aDtcbiAgICAgIGwgPSB0bDtcblxuICAgICAgYSA9IGwgJiAweGZmZmY7IGIgPSBsID4+PiAxNjtcbiAgICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICAgIC8vIFNpZ21hMFxuICAgICAgaCA9ICgoYWgwID4+PiAyOCkgfCAoYWwwIDw8ICgzMi0yOCkpKSBeICgoYWwwID4+PiAoMzQtMzIpKSB8IChhaDAgPDwgKDMyLSgzNC0zMikpKSkgXiAoKGFsMCA+Pj4gKDM5LTMyKSkgfCAoYWgwIDw8ICgzMi0oMzktMzIpKSkpO1xuICAgICAgbCA9ICgoYWwwID4+PiAyOCkgfCAoYWgwIDw8ICgzMi0yOCkpKSBeICgoYWgwID4+PiAoMzQtMzIpKSB8IChhbDAgPDwgKDMyLSgzNC0zMikpKSkgXiAoKGFoMCA+Pj4gKDM5LTMyKSkgfCAoYWwwIDw8ICgzMi0oMzktMzIpKSkpO1xuXG4gICAgICBhICs9IGwgJiAweGZmZmY7IGIgKz0gbCA+Pj4gMTY7XG4gICAgICBjICs9IGggJiAweGZmZmY7IGQgKz0gaCA+Pj4gMTY7XG5cbiAgICAgIC8vIE1halxuICAgICAgaCA9IChhaDAgJiBhaDEpIF4gKGFoMCAmIGFoMikgXiAoYWgxICYgYWgyKTtcbiAgICAgIGwgPSAoYWwwICYgYWwxKSBeIChhbDAgJiBhbDIpIF4gKGFsMSAmIGFsMik7XG5cbiAgICAgIGEgKz0gbCAmIDB4ZmZmZjsgYiArPSBsID4+PiAxNjtcbiAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgYiArPSBhID4+PiAxNjtcbiAgICAgIGMgKz0gYiA+Pj4gMTY7XG4gICAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgICBiaDcgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgICBibDcgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICAgIC8vIGFkZFxuICAgICAgaCA9IGJoMztcbiAgICAgIGwgPSBibDM7XG5cbiAgICAgIGEgPSBsICYgMHhmZmZmOyBiID0gbCA+Pj4gMTY7XG4gICAgICBjID0gaCAmIDB4ZmZmZjsgZCA9IGggPj4+IDE2O1xuXG4gICAgICBoID0gdGg7XG4gICAgICBsID0gdGw7XG5cbiAgICAgIGEgKz0gbCAmIDB4ZmZmZjsgYiArPSBsID4+PiAxNjtcbiAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgYiArPSBhID4+PiAxNjtcbiAgICAgIGMgKz0gYiA+Pj4gMTY7XG4gICAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgICBiaDMgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgICBibDMgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICAgIGFoMSA9IGJoMDtcbiAgICAgIGFoMiA9IGJoMTtcbiAgICAgIGFoMyA9IGJoMjtcbiAgICAgIGFoNCA9IGJoMztcbiAgICAgIGFoNSA9IGJoNDtcbiAgICAgIGFoNiA9IGJoNTtcbiAgICAgIGFoNyA9IGJoNjtcbiAgICAgIGFoMCA9IGJoNztcblxuICAgICAgYWwxID0gYmwwO1xuICAgICAgYWwyID0gYmwxO1xuICAgICAgYWwzID0gYmwyO1xuICAgICAgYWw0ID0gYmwzO1xuICAgICAgYWw1ID0gYmw0O1xuICAgICAgYWw2ID0gYmw1O1xuICAgICAgYWw3ID0gYmw2O1xuICAgICAgYWwwID0gYmw3O1xuXG4gICAgICBpZiAoaSUxNiA9PT0gMTUpIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDE2OyBqKyspIHtcbiAgICAgICAgICAvLyBhZGRcbiAgICAgICAgICBoID0gd2hbal07XG4gICAgICAgICAgbCA9IHdsW2pdO1xuXG4gICAgICAgICAgYSA9IGwgJiAweGZmZmY7IGIgPSBsID4+PiAxNjtcbiAgICAgICAgICBjID0gaCAmIDB4ZmZmZjsgZCA9IGggPj4+IDE2O1xuXG4gICAgICAgICAgaCA9IHdoWyhqKzkpJTE2XTtcbiAgICAgICAgICBsID0gd2xbKGorOSklMTZdO1xuXG4gICAgICAgICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgICAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgICAgIC8vIHNpZ21hMFxuICAgICAgICAgIHRoID0gd2hbKGorMSklMTZdO1xuICAgICAgICAgIHRsID0gd2xbKGorMSklMTZdO1xuICAgICAgICAgIGggPSAoKHRoID4+PiAxKSB8ICh0bCA8PCAoMzItMSkpKSBeICgodGggPj4+IDgpIHwgKHRsIDw8ICgzMi04KSkpIF4gKHRoID4+PiA3KTtcbiAgICAgICAgICBsID0gKCh0bCA+Pj4gMSkgfCAodGggPDwgKDMyLTEpKSkgXiAoKHRsID4+PiA4KSB8ICh0aCA8PCAoMzItOCkpKSBeICgodGwgPj4+IDcpIHwgKHRoIDw8ICgzMi03KSkpO1xuXG4gICAgICAgICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgICAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgICAgIC8vIHNpZ21hMVxuICAgICAgICAgIHRoID0gd2hbKGorMTQpJTE2XTtcbiAgICAgICAgICB0bCA9IHdsWyhqKzE0KSUxNl07XG4gICAgICAgICAgaCA9ICgodGggPj4+IDE5KSB8ICh0bCA8PCAoMzItMTkpKSkgXiAoKHRsID4+PiAoNjEtMzIpKSB8ICh0aCA8PCAoMzItKDYxLTMyKSkpKSBeICh0aCA+Pj4gNik7XG4gICAgICAgICAgbCA9ICgodGwgPj4+IDE5KSB8ICh0aCA8PCAoMzItMTkpKSkgXiAoKHRoID4+PiAoNjEtMzIpKSB8ICh0bCA8PCAoMzItKDYxLTMyKSkpKSBeICgodGwgPj4+IDYpIHwgKHRoIDw8ICgzMi02KSkpO1xuXG4gICAgICAgICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgICAgICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgICAgICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgICAgICAgYyArPSBiID4+PiAxNjtcbiAgICAgICAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgICAgICAgd2hbal0gPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgICAgICAgd2xbal0gPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhZGRcbiAgICBoID0gYWgwO1xuICAgIGwgPSBhbDA7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbMF07XG4gICAgbCA9IGhsWzBdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbMF0gPSBhaDAgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbMF0gPSBhbDAgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWgxO1xuICAgIGwgPSBhbDE7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbMV07XG4gICAgbCA9IGhsWzFdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbMV0gPSBhaDEgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbMV0gPSBhbDEgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWgyO1xuICAgIGwgPSBhbDI7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbMl07XG4gICAgbCA9IGhsWzJdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbMl0gPSBhaDIgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbMl0gPSBhbDIgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWgzO1xuICAgIGwgPSBhbDM7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbM107XG4gICAgbCA9IGhsWzNdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbM10gPSBhaDMgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbM10gPSBhbDMgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWg0O1xuICAgIGwgPSBhbDQ7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbNF07XG4gICAgbCA9IGhsWzRdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbNF0gPSBhaDQgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbNF0gPSBhbDQgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWg1O1xuICAgIGwgPSBhbDU7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbNV07XG4gICAgbCA9IGhsWzVdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbNV0gPSBhaDUgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbNV0gPSBhbDUgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWg2O1xuICAgIGwgPSBhbDY7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbNl07XG4gICAgbCA9IGhsWzZdO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbNl0gPSBhaDYgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbNl0gPSBhbDYgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBoID0gYWg3O1xuICAgIGwgPSBhbDc7XG5cbiAgICBhID0gbCAmIDB4ZmZmZjsgYiA9IGwgPj4+IDE2O1xuICAgIGMgPSBoICYgMHhmZmZmOyBkID0gaCA+Pj4gMTY7XG5cbiAgICBoID0gaGhbN107XG4gICAgbCA9IGhsWzddO1xuXG4gICAgYSArPSBsICYgMHhmZmZmOyBiICs9IGwgPj4+IDE2O1xuICAgIGMgKz0gaCAmIDB4ZmZmZjsgZCArPSBoID4+PiAxNjtcblxuICAgIGIgKz0gYSA+Pj4gMTY7XG4gICAgYyArPSBiID4+PiAxNjtcbiAgICBkICs9IGMgPj4+IDE2O1xuXG4gICAgaGhbN10gPSBhaDcgPSAoYyAmIDB4ZmZmZikgfCAoZCA8PCAxNik7XG4gICAgaGxbN10gPSBhbDcgPSAoYSAmIDB4ZmZmZikgfCAoYiA8PCAxNik7XG5cbiAgICBwb3MgKz0gMTI4O1xuICAgIG4gLT0gMTI4O1xuICB9XG5cbiAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19oYXNoKG91dCwgbSwgbikge1xuICB2YXIgaGggPSBuZXcgSW50MzJBcnJheSg4KSxcbiAgICAgIGhsID0gbmV3IEludDMyQXJyYXkoOCksXG4gICAgICB4ID0gbmV3IFVpbnQ4QXJyYXkoMjU2KSxcbiAgICAgIGksIGIgPSBuO1xuXG4gIGhoWzBdID0gMHg2YTA5ZTY2NztcbiAgaGhbMV0gPSAweGJiNjdhZTg1O1xuICBoaFsyXSA9IDB4M2M2ZWYzNzI7XG4gIGhoWzNdID0gMHhhNTRmZjUzYTtcbiAgaGhbNF0gPSAweDUxMGU1MjdmO1xuICBoaFs1XSA9IDB4OWIwNTY4OGM7XG4gIGhoWzZdID0gMHgxZjgzZDlhYjtcbiAgaGhbN10gPSAweDViZTBjZDE5O1xuXG4gIGhsWzBdID0gMHhmM2JjYzkwODtcbiAgaGxbMV0gPSAweDg0Y2FhNzNiO1xuICBobFsyXSA9IDB4ZmU5NGY4MmI7XG4gIGhsWzNdID0gMHg1ZjFkMzZmMTtcbiAgaGxbNF0gPSAweGFkZTY4MmQxO1xuICBobFs1XSA9IDB4MmIzZTZjMWY7XG4gIGhsWzZdID0gMHhmYjQxYmQ2YjtcbiAgaGxbN10gPSAweDEzN2UyMTc5O1xuXG4gIGNyeXB0b19oYXNoYmxvY2tzX2hsKGhoLCBobCwgbSwgbik7XG4gIG4gJT0gMTI4O1xuXG4gIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHhbaV0gPSBtW2ItbitpXTtcbiAgeFtuXSA9IDEyODtcblxuICBuID0gMjU2LTEyOCoobjwxMTI/MTowKTtcbiAgeFtuLTldID0gMDtcbiAgdHM2NCh4LCBuLTgsICAoYiAvIDB4MjAwMDAwMDApIHwgMCwgYiA8PCAzKTtcbiAgY3J5cHRvX2hhc2hibG9ja3NfaGwoaGgsIGhsLCB4LCBuKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgODsgaSsrKSB0czY0KG91dCwgOCppLCBoaFtpXSwgaGxbaV0pO1xuXG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBhZGQocCwgcSkge1xuICB2YXIgYSA9IGdmKCksIGIgPSBnZigpLCBjID0gZ2YoKSxcbiAgICAgIGQgPSBnZigpLCBlID0gZ2YoKSwgZiA9IGdmKCksXG4gICAgICBnID0gZ2YoKSwgaCA9IGdmKCksIHQgPSBnZigpO1xuXG4gIFooYSwgcFsxXSwgcFswXSk7XG4gIFoodCwgcVsxXSwgcVswXSk7XG4gIE0oYSwgYSwgdCk7XG4gIEEoYiwgcFswXSwgcFsxXSk7XG4gIEEodCwgcVswXSwgcVsxXSk7XG4gIE0oYiwgYiwgdCk7XG4gIE0oYywgcFszXSwgcVszXSk7XG4gIE0oYywgYywgRDIpO1xuICBNKGQsIHBbMl0sIHFbMl0pO1xuICBBKGQsIGQsIGQpO1xuICBaKGUsIGIsIGEpO1xuICBaKGYsIGQsIGMpO1xuICBBKGcsIGQsIGMpO1xuICBBKGgsIGIsIGEpO1xuXG4gIE0ocFswXSwgZSwgZik7XG4gIE0ocFsxXSwgaCwgZyk7XG4gIE0ocFsyXSwgZywgZik7XG4gIE0ocFszXSwgZSwgaCk7XG59XG5cbmZ1bmN0aW9uIGNzd2FwKHAsIHEsIGIpIHtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICBzZWwyNTUxOShwW2ldLCBxW2ldLCBiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYWNrKHIsIHApIHtcbiAgdmFyIHR4ID0gZ2YoKSwgdHkgPSBnZigpLCB6aSA9IGdmKCk7XG4gIGludjI1NTE5KHppLCBwWzJdKTtcbiAgTSh0eCwgcFswXSwgemkpO1xuICBNKHR5LCBwWzFdLCB6aSk7XG4gIHBhY2syNTUxOShyLCB0eSk7XG4gIHJbMzFdIF49IHBhcjI1NTE5KHR4KSA8PCA3O1xufVxuXG5mdW5jdGlvbiBzY2FsYXJtdWx0KHAsIHEsIHMpIHtcbiAgdmFyIGIsIGk7XG4gIHNldDI1NTE5KHBbMF0sIGdmMCk7XG4gIHNldDI1NTE5KHBbMV0sIGdmMSk7XG4gIHNldDI1NTE5KHBbMl0sIGdmMSk7XG4gIHNldDI1NTE5KHBbM10sIGdmMCk7XG4gIGZvciAoaSA9IDI1NTsgaSA+PSAwOyAtLWkpIHtcbiAgICBiID0gKHNbKGkvOCl8MF0gPj4gKGkmNykpICYgMTtcbiAgICBjc3dhcChwLCBxLCBiKTtcbiAgICBhZGQocSwgcCk7XG4gICAgYWRkKHAsIHApO1xuICAgIGNzd2FwKHAsIHEsIGIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjYWxhcmJhc2UocCwgcykge1xuICB2YXIgcSA9IFtnZigpLCBnZigpLCBnZigpLCBnZigpXTtcbiAgc2V0MjU1MTkocVswXSwgWCk7XG4gIHNldDI1NTE5KHFbMV0sIFkpO1xuICBzZXQyNTUxOShxWzJdLCBnZjEpO1xuICBNKHFbM10sIFgsIFkpO1xuICBzY2FsYXJtdWx0KHAsIHEsIHMpO1xufVxuXG5mdW5jdGlvbiBjcnlwdG9fc2lnbl9rZXlwYWlyKHBrLCBzaywgc2VlZGVkKSB7XG4gIHZhciBkID0gbmV3IFVpbnQ4QXJyYXkoNjQpO1xuICB2YXIgcCA9IFtnZigpLCBnZigpLCBnZigpLCBnZigpXTtcbiAgdmFyIGk7XG5cbiAgaWYgKCFzZWVkZWQpIHJhbmRvbWJ5dGVzKHNrLCAzMik7XG4gIGNyeXB0b19oYXNoKGQsIHNrLCAzMik7XG4gIGRbMF0gJj0gMjQ4O1xuICBkWzMxXSAmPSAxMjc7XG4gIGRbMzFdIHw9IDY0O1xuXG4gIHNjYWxhcmJhc2UocCwgZCk7XG4gIHBhY2socGssIHApO1xuXG4gIGZvciAoaSA9IDA7IGkgPCAzMjsgaSsrKSBza1tpKzMyXSA9IHBrW2ldO1xuICByZXR1cm4gMDtcbn1cblxudmFyIEwgPSBuZXcgRmxvYXQ2NEFycmF5KFsweGVkLCAweGQzLCAweGY1LCAweDVjLCAweDFhLCAweDYzLCAweDEyLCAweDU4LCAweGQ2LCAweDljLCAweGY3LCAweGEyLCAweGRlLCAweGY5LCAweGRlLCAweDE0LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAweDEwXSk7XG5cbmZ1bmN0aW9uIG1vZEwociwgeCkge1xuICB2YXIgY2FycnksIGksIGosIGs7XG4gIGZvciAoaSA9IDYzOyBpID49IDMyOyAtLWkpIHtcbiAgICBjYXJyeSA9IDA7XG4gICAgZm9yIChqID0gaSAtIDMyLCBrID0gaSAtIDEyOyBqIDwgazsgKytqKSB7XG4gICAgICB4W2pdICs9IGNhcnJ5IC0gMTYgKiB4W2ldICogTFtqIC0gKGkgLSAzMildO1xuICAgICAgY2FycnkgPSBNYXRoLmZsb29yKCh4W2pdICsgMTI4KSAvIDI1Nik7XG4gICAgICB4W2pdIC09IGNhcnJ5ICogMjU2O1xuICAgIH1cbiAgICB4W2pdICs9IGNhcnJ5O1xuICAgIHhbaV0gPSAwO1xuICB9XG4gIGNhcnJ5ID0gMDtcbiAgZm9yIChqID0gMDsgaiA8IDMyOyBqKyspIHtcbiAgICB4W2pdICs9IGNhcnJ5IC0gKHhbMzFdID4+IDQpICogTFtqXTtcbiAgICBjYXJyeSA9IHhbal0gPj4gODtcbiAgICB4W2pdICY9IDI1NTtcbiAgfVxuICBmb3IgKGogPSAwOyBqIDwgMzI7IGorKykgeFtqXSAtPSBjYXJyeSAqIExbal07XG4gIGZvciAoaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgeFtpKzFdICs9IHhbaV0gPj4gODtcbiAgICByW2ldID0geFtpXSAmIDI1NTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWR1Y2Uocikge1xuICB2YXIgeCA9IG5ldyBGbG9hdDY0QXJyYXkoNjQpLCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykgeFtpXSA9IHJbaV07XG4gIGZvciAoaSA9IDA7IGkgPCA2NDsgaSsrKSByW2ldID0gMDtcbiAgbW9kTChyLCB4KTtcbn1cblxuLy8gTm90ZTogZGlmZmVyZW5jZSBmcm9tIEMgLSBzbWxlbiByZXR1cm5lZCwgbm90IHBhc3NlZCBhcyBhcmd1bWVudC5cbmZ1bmN0aW9uIGNyeXB0b19zaWduKHNtLCBtLCBuLCBzaykge1xuICB2YXIgZCA9IG5ldyBVaW50OEFycmF5KDY0KSwgaCA9IG5ldyBVaW50OEFycmF5KDY0KSwgciA9IG5ldyBVaW50OEFycmF5KDY0KTtcbiAgdmFyIGksIGosIHggPSBuZXcgRmxvYXQ2NEFycmF5KDY0KTtcbiAgdmFyIHAgPSBbZ2YoKSwgZ2YoKSwgZ2YoKSwgZ2YoKV07XG5cbiAgY3J5cHRvX2hhc2goZCwgc2ssIDMyKTtcbiAgZFswXSAmPSAyNDg7XG4gIGRbMzFdICY9IDEyNztcbiAgZFszMV0gfD0gNjQ7XG5cbiAgdmFyIHNtbGVuID0gbiArIDY0O1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSBzbVs2NCArIGldID0gbVtpXTtcbiAgZm9yIChpID0gMDsgaSA8IDMyOyBpKyspIHNtWzMyICsgaV0gPSBkWzMyICsgaV07XG5cbiAgY3J5cHRvX2hhc2gociwgc20uc3ViYXJyYXkoMzIpLCBuKzMyKTtcbiAgcmVkdWNlKHIpO1xuICBzY2FsYXJiYXNlKHAsIHIpO1xuICBwYWNrKHNtLCBwKTtcblxuICBmb3IgKGkgPSAzMjsgaSA8IDY0OyBpKyspIHNtW2ldID0gc2tbaV07XG4gIGNyeXB0b19oYXNoKGgsIHNtLCBuICsgNjQpO1xuICByZWR1Y2UoaCk7XG5cbiAgZm9yIChpID0gMDsgaSA8IDY0OyBpKyspIHhbaV0gPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgMzI7IGkrKykgeFtpXSA9IHJbaV07XG4gIGZvciAoaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgZm9yIChqID0gMDsgaiA8IDMyOyBqKyspIHtcbiAgICAgIHhbaStqXSArPSBoW2ldICogZFtqXTtcbiAgICB9XG4gIH1cblxuICBtb2RMKHNtLnN1YmFycmF5KDMyKSwgeCk7XG4gIHJldHVybiBzbWxlbjtcbn1cblxuZnVuY3Rpb24gdW5wYWNrbmVnKHIsIHApIHtcbiAgdmFyIHQgPSBnZigpLCBjaGsgPSBnZigpLCBudW0gPSBnZigpLFxuICAgICAgZGVuID0gZ2YoKSwgZGVuMiA9IGdmKCksIGRlbjQgPSBnZigpLFxuICAgICAgZGVuNiA9IGdmKCk7XG5cbiAgc2V0MjU1MTkoclsyXSwgZ2YxKTtcbiAgdW5wYWNrMjU1MTkoclsxXSwgcCk7XG4gIFMobnVtLCByWzFdKTtcbiAgTShkZW4sIG51bSwgRCk7XG4gIFoobnVtLCBudW0sIHJbMl0pO1xuICBBKGRlbiwgclsyXSwgZGVuKTtcblxuICBTKGRlbjIsIGRlbik7XG4gIFMoZGVuNCwgZGVuMik7XG4gIE0oZGVuNiwgZGVuNCwgZGVuMik7XG4gIE0odCwgZGVuNiwgbnVtKTtcbiAgTSh0LCB0LCBkZW4pO1xuXG4gIHBvdzI1MjModCwgdCk7XG4gIE0odCwgdCwgbnVtKTtcbiAgTSh0LCB0LCBkZW4pO1xuICBNKHQsIHQsIGRlbik7XG4gIE0oclswXSwgdCwgZGVuKTtcblxuICBTKGNoaywgclswXSk7XG4gIE0oY2hrLCBjaGssIGRlbik7XG4gIGlmIChuZXEyNTUxOShjaGssIG51bSkpIE0oclswXSwgclswXSwgSSk7XG5cbiAgUyhjaGssIHJbMF0pO1xuICBNKGNoaywgY2hrLCBkZW4pO1xuICBpZiAobmVxMjU1MTkoY2hrLCBudW0pKSByZXR1cm4gLTE7XG5cbiAgaWYgKHBhcjI1NTE5KHJbMF0pID09PSAocFszMV0+PjcpKSBaKHJbMF0sIGdmMCwgclswXSk7XG5cbiAgTShyWzNdLCByWzBdLCByWzFdKTtcbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGNyeXB0b19zaWduX29wZW4obSwgc20sIG4sIHBrKSB7XG4gIHZhciBpO1xuICB2YXIgdCA9IG5ldyBVaW50OEFycmF5KDMyKSwgaCA9IG5ldyBVaW50OEFycmF5KDY0KTtcbiAgdmFyIHAgPSBbZ2YoKSwgZ2YoKSwgZ2YoKSwgZ2YoKV0sXG4gICAgICBxID0gW2dmKCksIGdmKCksIGdmKCksIGdmKCldO1xuXG4gIGlmIChuIDwgNjQpIHJldHVybiAtMTtcblxuICBpZiAodW5wYWNrbmVnKHEsIHBrKSkgcmV0dXJuIC0xO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIG1baV0gPSBzbVtpXTtcbiAgZm9yIChpID0gMDsgaSA8IDMyOyBpKyspIG1baSszMl0gPSBwa1tpXTtcbiAgY3J5cHRvX2hhc2goaCwgbSwgbik7XG4gIHJlZHVjZShoKTtcbiAgc2NhbGFybXVsdChwLCBxLCBoKTtcblxuICBzY2FsYXJiYXNlKHEsIHNtLnN1YmFycmF5KDMyKSk7XG4gIGFkZChwLCBxKTtcbiAgcGFjayh0LCBwKTtcblxuICBuIC09IDY0O1xuICBpZiAoY3J5cHRvX3ZlcmlmeV8zMihzbSwgMCwgdCwgMCkpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSBtW2ldID0gMDtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSBtW2ldID0gc21baSArIDY0XTtcbiAgcmV0dXJuIG47XG59XG5cbnZhciBjcnlwdG9fc2VjcmV0Ym94X0tFWUJZVEVTID0gMzIsXG4gICAgY3J5cHRvX3NlY3JldGJveF9OT05DRUJZVEVTID0gMjQsXG4gICAgY3J5cHRvX3NlY3JldGJveF9aRVJPQllURVMgPSAzMixcbiAgICBjcnlwdG9fc2VjcmV0Ym94X0JPWFpFUk9CWVRFUyA9IDE2LFxuICAgIGNyeXB0b19zY2FsYXJtdWx0X0JZVEVTID0gMzIsXG4gICAgY3J5cHRvX3NjYWxhcm11bHRfU0NBTEFSQllURVMgPSAzMixcbiAgICBjcnlwdG9fYm94X1BVQkxJQ0tFWUJZVEVTID0gMzIsXG4gICAgY3J5cHRvX2JveF9TRUNSRVRLRVlCWVRFUyA9IDMyLFxuICAgIGNyeXB0b19ib3hfQkVGT1JFTk1CWVRFUyA9IDMyLFxuICAgIGNyeXB0b19ib3hfTk9OQ0VCWVRFUyA9IGNyeXB0b19zZWNyZXRib3hfTk9OQ0VCWVRFUyxcbiAgICBjcnlwdG9fYm94X1pFUk9CWVRFUyA9IGNyeXB0b19zZWNyZXRib3hfWkVST0JZVEVTLFxuICAgIGNyeXB0b19ib3hfQk9YWkVST0JZVEVTID0gY3J5cHRvX3NlY3JldGJveF9CT1haRVJPQllURVMsXG4gICAgY3J5cHRvX3NpZ25fQllURVMgPSA2NCxcbiAgICBjcnlwdG9fc2lnbl9QVUJMSUNLRVlCWVRFUyA9IDMyLFxuICAgIGNyeXB0b19zaWduX1NFQ1JFVEtFWUJZVEVTID0gNjQsXG4gICAgY3J5cHRvX3NpZ25fU0VFREJZVEVTID0gMzIsXG4gICAgY3J5cHRvX2hhc2hfQllURVMgPSA2NDtcblxubmFjbC5sb3dsZXZlbCA9IHtcbiAgY3J5cHRvX2NvcmVfaHNhbHNhMjA6IGNyeXB0b19jb3JlX2hzYWxzYTIwLFxuICBjcnlwdG9fc3RyZWFtX3hvcjogY3J5cHRvX3N0cmVhbV94b3IsXG4gIGNyeXB0b19zdHJlYW06IGNyeXB0b19zdHJlYW0sXG4gIGNyeXB0b19zdHJlYW1fc2Fsc2EyMF94b3I6IGNyeXB0b19zdHJlYW1fc2Fsc2EyMF94b3IsXG4gIGNyeXB0b19zdHJlYW1fc2Fsc2EyMDogY3J5cHRvX3N0cmVhbV9zYWxzYTIwLFxuICBjcnlwdG9fb25ldGltZWF1dGg6IGNyeXB0b19vbmV0aW1lYXV0aCxcbiAgY3J5cHRvX29uZXRpbWVhdXRoX3ZlcmlmeTogY3J5cHRvX29uZXRpbWVhdXRoX3ZlcmlmeSxcbiAgY3J5cHRvX3ZlcmlmeV8xNjogY3J5cHRvX3ZlcmlmeV8xNixcbiAgY3J5cHRvX3ZlcmlmeV8zMjogY3J5cHRvX3ZlcmlmeV8zMixcbiAgY3J5cHRvX3NlY3JldGJveDogY3J5cHRvX3NlY3JldGJveCxcbiAgY3J5cHRvX3NlY3JldGJveF9vcGVuOiBjcnlwdG9fc2VjcmV0Ym94X29wZW4sXG4gIGNyeXB0b19zY2FsYXJtdWx0OiBjcnlwdG9fc2NhbGFybXVsdCxcbiAgY3J5cHRvX3NjYWxhcm11bHRfYmFzZTogY3J5cHRvX3NjYWxhcm11bHRfYmFzZSxcbiAgY3J5cHRvX2JveF9iZWZvcmVubTogY3J5cHRvX2JveF9iZWZvcmVubSxcbiAgY3J5cHRvX2JveF9hZnRlcm5tOiBjcnlwdG9fYm94X2FmdGVybm0sXG4gIGNyeXB0b19ib3g6IGNyeXB0b19ib3gsXG4gIGNyeXB0b19ib3hfb3BlbjogY3J5cHRvX2JveF9vcGVuLFxuICBjcnlwdG9fYm94X2tleXBhaXI6IGNyeXB0b19ib3hfa2V5cGFpcixcbiAgY3J5cHRvX2hhc2g6IGNyeXB0b19oYXNoLFxuICBjcnlwdG9fc2lnbjogY3J5cHRvX3NpZ24sXG4gIGNyeXB0b19zaWduX2tleXBhaXI6IGNyeXB0b19zaWduX2tleXBhaXIsXG4gIGNyeXB0b19zaWduX29wZW46IGNyeXB0b19zaWduX29wZW4sXG5cbiAgY3J5cHRvX3NlY3JldGJveF9LRVlCWVRFUzogY3J5cHRvX3NlY3JldGJveF9LRVlCWVRFUyxcbiAgY3J5cHRvX3NlY3JldGJveF9OT05DRUJZVEVTOiBjcnlwdG9fc2VjcmV0Ym94X05PTkNFQllURVMsXG4gIGNyeXB0b19zZWNyZXRib3hfWkVST0JZVEVTOiBjcnlwdG9fc2VjcmV0Ym94X1pFUk9CWVRFUyxcbiAgY3J5cHRvX3NlY3JldGJveF9CT1haRVJPQllURVM6IGNyeXB0b19zZWNyZXRib3hfQk9YWkVST0JZVEVTLFxuICBjcnlwdG9fc2NhbGFybXVsdF9CWVRFUzogY3J5cHRvX3NjYWxhcm11bHRfQllURVMsXG4gIGNyeXB0b19zY2FsYXJtdWx0X1NDQUxBUkJZVEVTOiBjcnlwdG9fc2NhbGFybXVsdF9TQ0FMQVJCWVRFUyxcbiAgY3J5cHRvX2JveF9QVUJMSUNLRVlCWVRFUzogY3J5cHRvX2JveF9QVUJMSUNLRVlCWVRFUyxcbiAgY3J5cHRvX2JveF9TRUNSRVRLRVlCWVRFUzogY3J5cHRvX2JveF9TRUNSRVRLRVlCWVRFUyxcbiAgY3J5cHRvX2JveF9CRUZPUkVOTUJZVEVTOiBjcnlwdG9fYm94X0JFRk9SRU5NQllURVMsXG4gIGNyeXB0b19ib3hfTk9OQ0VCWVRFUzogY3J5cHRvX2JveF9OT05DRUJZVEVTLFxuICBjcnlwdG9fYm94X1pFUk9CWVRFUzogY3J5cHRvX2JveF9aRVJPQllURVMsXG4gIGNyeXB0b19ib3hfQk9YWkVST0JZVEVTOiBjcnlwdG9fYm94X0JPWFpFUk9CWVRFUyxcbiAgY3J5cHRvX3NpZ25fQllURVM6IGNyeXB0b19zaWduX0JZVEVTLFxuICBjcnlwdG9fc2lnbl9QVUJMSUNLRVlCWVRFUzogY3J5cHRvX3NpZ25fUFVCTElDS0VZQllURVMsXG4gIGNyeXB0b19zaWduX1NFQ1JFVEtFWUJZVEVTOiBjcnlwdG9fc2lnbl9TRUNSRVRLRVlCWVRFUyxcbiAgY3J5cHRvX3NpZ25fU0VFREJZVEVTOiBjcnlwdG9fc2lnbl9TRUVEQllURVMsXG4gIGNyeXB0b19oYXNoX0JZVEVTOiBjcnlwdG9faGFzaF9CWVRFUyxcblxuICBnZjogZ2YsXG4gIEQ6IEQsXG4gIEw6IEwsXG4gIHBhY2syNTUxOTogcGFjazI1NTE5LFxuICB1bnBhY2syNTUxOTogdW5wYWNrMjU1MTksXG4gIE06IE0sXG4gIEE6IEEsXG4gIFM6IFMsXG4gIFo6IFosXG4gIHBvdzI1MjM6IHBvdzI1MjMsXG4gIGFkZDogYWRkLFxuICBzZXQyNTUxOTogc2V0MjU1MTksXG4gIG1vZEw6IG1vZEwsXG4gIHNjYWxhcm11bHQ6IHNjYWxhcm11bHQsXG4gIHNjYWxhcmJhc2U6IHNjYWxhcmJhc2UsXG59O1xuXG4vKiBIaWdoLWxldmVsIEFQSSAqL1xuXG5mdW5jdGlvbiBjaGVja0xlbmd0aHMoaywgbikge1xuICBpZiAoay5sZW5ndGggIT09IGNyeXB0b19zZWNyZXRib3hfS0VZQllURVMpIHRocm93IG5ldyBFcnJvcignYmFkIGtleSBzaXplJyk7XG4gIGlmIChuLmxlbmd0aCAhPT0gY3J5cHRvX3NlY3JldGJveF9OT05DRUJZVEVTKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBub25jZSBzaXplJyk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQm94TGVuZ3Rocyhwaywgc2spIHtcbiAgaWYgKHBrLmxlbmd0aCAhPT0gY3J5cHRvX2JveF9QVUJMSUNLRVlCWVRFUykgdGhyb3cgbmV3IEVycm9yKCdiYWQgcHVibGljIGtleSBzaXplJyk7XG4gIGlmIChzay5sZW5ndGggIT09IGNyeXB0b19ib3hfU0VDUkVUS0VZQllURVMpIHRocm93IG5ldyBFcnJvcignYmFkIHNlY3JldCBrZXkgc2l6ZScpO1xufVxuXG5mdW5jdGlvbiBjaGVja0FycmF5VHlwZXMoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCEoYXJndW1lbnRzW2ldIGluc3RhbmNlb2YgVWludDhBcnJheSkpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmV4cGVjdGVkIHR5cGUsIHVzZSBVaW50OEFycmF5Jyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYW51cChhcnIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycltpXSA9IDA7XG59XG5cbm5hY2wucmFuZG9tQnl0ZXMgPSBmdW5jdGlvbihuKSB7XG4gIHZhciBiID0gbmV3IFVpbnQ4QXJyYXkobik7XG4gIHJhbmRvbWJ5dGVzKGIsIG4pO1xuICByZXR1cm4gYjtcbn07XG5cbm5hY2wuc2VjcmV0Ym94ID0gZnVuY3Rpb24obXNnLCBub25jZSwga2V5KSB7XG4gIGNoZWNrQXJyYXlUeXBlcyhtc2csIG5vbmNlLCBrZXkpO1xuICBjaGVja0xlbmd0aHMoa2V5LCBub25jZSk7XG4gIHZhciBtID0gbmV3IFVpbnQ4QXJyYXkoY3J5cHRvX3NlY3JldGJveF9aRVJPQllURVMgKyBtc2cubGVuZ3RoKTtcbiAgdmFyIGMgPSBuZXcgVWludDhBcnJheShtLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnLmxlbmd0aDsgaSsrKSBtW2krY3J5cHRvX3NlY3JldGJveF9aRVJPQllURVNdID0gbXNnW2ldO1xuICBjcnlwdG9fc2VjcmV0Ym94KGMsIG0sIG0ubGVuZ3RoLCBub25jZSwga2V5KTtcbiAgcmV0dXJuIGMuc3ViYXJyYXkoY3J5cHRvX3NlY3JldGJveF9CT1haRVJPQllURVMpO1xufTtcblxubmFjbC5zZWNyZXRib3gub3BlbiA9IGZ1bmN0aW9uKGJveCwgbm9uY2UsIGtleSkge1xuICBjaGVja0FycmF5VHlwZXMoYm94LCBub25jZSwga2V5KTtcbiAgY2hlY2tMZW5ndGhzKGtleSwgbm9uY2UpO1xuICB2YXIgYyA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zZWNyZXRib3hfQk9YWkVST0JZVEVTICsgYm94Lmxlbmd0aCk7XG4gIHZhciBtID0gbmV3IFVpbnQ4QXJyYXkoYy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJveC5sZW5ndGg7IGkrKykgY1tpK2NyeXB0b19zZWNyZXRib3hfQk9YWkVST0JZVEVTXSA9IGJveFtpXTtcbiAgaWYgKGMubGVuZ3RoIDwgMzIpIHJldHVybiBudWxsO1xuICBpZiAoY3J5cHRvX3NlY3JldGJveF9vcGVuKG0sIGMsIGMubGVuZ3RoLCBub25jZSwga2V5KSAhPT0gMCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBtLnN1YmFycmF5KGNyeXB0b19zZWNyZXRib3hfWkVST0JZVEVTKTtcbn07XG5cbm5hY2wuc2VjcmV0Ym94LmtleUxlbmd0aCA9IGNyeXB0b19zZWNyZXRib3hfS0VZQllURVM7XG5uYWNsLnNlY3JldGJveC5ub25jZUxlbmd0aCA9IGNyeXB0b19zZWNyZXRib3hfTk9OQ0VCWVRFUztcbm5hY2wuc2VjcmV0Ym94Lm92ZXJoZWFkTGVuZ3RoID0gY3J5cHRvX3NlY3JldGJveF9CT1haRVJPQllURVM7XG5cbm5hY2wuc2NhbGFyTXVsdCA9IGZ1bmN0aW9uKG4sIHApIHtcbiAgY2hlY2tBcnJheVR5cGVzKG4sIHApO1xuICBpZiAobi5sZW5ndGggIT09IGNyeXB0b19zY2FsYXJtdWx0X1NDQUxBUkJZVEVTKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBuIHNpemUnKTtcbiAgaWYgKHAubGVuZ3RoICE9PSBjcnlwdG9fc2NhbGFybXVsdF9CWVRFUykgdGhyb3cgbmV3IEVycm9yKCdiYWQgcCBzaXplJyk7XG4gIHZhciBxID0gbmV3IFVpbnQ4QXJyYXkoY3J5cHRvX3NjYWxhcm11bHRfQllURVMpO1xuICBjcnlwdG9fc2NhbGFybXVsdChxLCBuLCBwKTtcbiAgcmV0dXJuIHE7XG59O1xuXG5uYWNsLnNjYWxhck11bHQuYmFzZSA9IGZ1bmN0aW9uKG4pIHtcbiAgY2hlY2tBcnJheVR5cGVzKG4pO1xuICBpZiAobi5sZW5ndGggIT09IGNyeXB0b19zY2FsYXJtdWx0X1NDQUxBUkJZVEVTKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBuIHNpemUnKTtcbiAgdmFyIHEgPSBuZXcgVWludDhBcnJheShjcnlwdG9fc2NhbGFybXVsdF9CWVRFUyk7XG4gIGNyeXB0b19zY2FsYXJtdWx0X2Jhc2UocSwgbik7XG4gIHJldHVybiBxO1xufTtcblxubmFjbC5zY2FsYXJNdWx0LnNjYWxhckxlbmd0aCA9IGNyeXB0b19zY2FsYXJtdWx0X1NDQUxBUkJZVEVTO1xubmFjbC5zY2FsYXJNdWx0Lmdyb3VwRWxlbWVudExlbmd0aCA9IGNyeXB0b19zY2FsYXJtdWx0X0JZVEVTO1xuXG5uYWNsLmJveCA9IGZ1bmN0aW9uKG1zZywgbm9uY2UsIHB1YmxpY0tleSwgc2VjcmV0S2V5KSB7XG4gIHZhciBrID0gbmFjbC5ib3guYmVmb3JlKHB1YmxpY0tleSwgc2VjcmV0S2V5KTtcbiAgcmV0dXJuIG5hY2wuc2VjcmV0Ym94KG1zZywgbm9uY2UsIGspO1xufTtcblxubmFjbC5ib3guYmVmb3JlID0gZnVuY3Rpb24ocHVibGljS2V5LCBzZWNyZXRLZXkpIHtcbiAgY2hlY2tBcnJheVR5cGVzKHB1YmxpY0tleSwgc2VjcmV0S2V5KTtcbiAgY2hlY2tCb3hMZW5ndGhzKHB1YmxpY0tleSwgc2VjcmV0S2V5KTtcbiAgdmFyIGsgPSBuZXcgVWludDhBcnJheShjcnlwdG9fYm94X0JFRk9SRU5NQllURVMpO1xuICBjcnlwdG9fYm94X2JlZm9yZW5tKGssIHB1YmxpY0tleSwgc2VjcmV0S2V5KTtcbiAgcmV0dXJuIGs7XG59O1xuXG5uYWNsLmJveC5hZnRlciA9IG5hY2wuc2VjcmV0Ym94O1xuXG5uYWNsLmJveC5vcGVuID0gZnVuY3Rpb24obXNnLCBub25jZSwgcHVibGljS2V5LCBzZWNyZXRLZXkpIHtcbiAgdmFyIGsgPSBuYWNsLmJveC5iZWZvcmUocHVibGljS2V5LCBzZWNyZXRLZXkpO1xuICByZXR1cm4gbmFjbC5zZWNyZXRib3gub3Blbihtc2csIG5vbmNlLCBrKTtcbn07XG5cbm5hY2wuYm94Lm9wZW4uYWZ0ZXIgPSBuYWNsLnNlY3JldGJveC5vcGVuO1xuXG5uYWNsLmJveC5rZXlQYWlyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwayA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19ib3hfUFVCTElDS0VZQllURVMpO1xuICB2YXIgc2sgPSBuZXcgVWludDhBcnJheShjcnlwdG9fYm94X1NFQ1JFVEtFWUJZVEVTKTtcbiAgY3J5cHRvX2JveF9rZXlwYWlyKHBrLCBzayk7XG4gIHJldHVybiB7cHVibGljS2V5OiBwaywgc2VjcmV0S2V5OiBza307XG59O1xuXG5uYWNsLmJveC5rZXlQYWlyLmZyb21TZWNyZXRLZXkgPSBmdW5jdGlvbihzZWNyZXRLZXkpIHtcbiAgY2hlY2tBcnJheVR5cGVzKHNlY3JldEtleSk7XG4gIGlmIChzZWNyZXRLZXkubGVuZ3RoICE9PSBjcnlwdG9fYm94X1NFQ1JFVEtFWUJZVEVTKVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIHNlY3JldCBrZXkgc2l6ZScpO1xuICB2YXIgcGsgPSBuZXcgVWludDhBcnJheShjcnlwdG9fYm94X1BVQkxJQ0tFWUJZVEVTKTtcbiAgY3J5cHRvX3NjYWxhcm11bHRfYmFzZShwaywgc2VjcmV0S2V5KTtcbiAgcmV0dXJuIHtwdWJsaWNLZXk6IHBrLCBzZWNyZXRLZXk6IG5ldyBVaW50OEFycmF5KHNlY3JldEtleSl9O1xufTtcblxubmFjbC5ib3gucHVibGljS2V5TGVuZ3RoID0gY3J5cHRvX2JveF9QVUJMSUNLRVlCWVRFUztcbm5hY2wuYm94LnNlY3JldEtleUxlbmd0aCA9IGNyeXB0b19ib3hfU0VDUkVUS0VZQllURVM7XG5uYWNsLmJveC5zaGFyZWRLZXlMZW5ndGggPSBjcnlwdG9fYm94X0JFRk9SRU5NQllURVM7XG5uYWNsLmJveC5ub25jZUxlbmd0aCA9IGNyeXB0b19ib3hfTk9OQ0VCWVRFUztcbm5hY2wuYm94Lm92ZXJoZWFkTGVuZ3RoID0gbmFjbC5zZWNyZXRib3gub3ZlcmhlYWRMZW5ndGg7XG5cbm5hY2wuc2lnbiA9IGZ1bmN0aW9uKG1zZywgc2VjcmV0S2V5KSB7XG4gIGNoZWNrQXJyYXlUeXBlcyhtc2csIHNlY3JldEtleSk7XG4gIGlmIChzZWNyZXRLZXkubGVuZ3RoICE9PSBjcnlwdG9fc2lnbl9TRUNSRVRLRVlCWVRFUylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBzZWNyZXQga2V5IHNpemUnKTtcbiAgdmFyIHNpZ25lZE1zZyA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zaWduX0JZVEVTK21zZy5sZW5ndGgpO1xuICBjcnlwdG9fc2lnbihzaWduZWRNc2csIG1zZywgbXNnLmxlbmd0aCwgc2VjcmV0S2V5KTtcbiAgcmV0dXJuIHNpZ25lZE1zZztcbn07XG5cbm5hY2wuc2lnbi5vcGVuID0gZnVuY3Rpb24oc2lnbmVkTXNnLCBwdWJsaWNLZXkpIHtcbiAgY2hlY2tBcnJheVR5cGVzKHNpZ25lZE1zZywgcHVibGljS2V5KTtcbiAgaWYgKHB1YmxpY0tleS5sZW5ndGggIT09IGNyeXB0b19zaWduX1BVQkxJQ0tFWUJZVEVTKVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIHB1YmxpYyBrZXkgc2l6ZScpO1xuICB2YXIgdG1wID0gbmV3IFVpbnQ4QXJyYXkoc2lnbmVkTXNnLmxlbmd0aCk7XG4gIHZhciBtbGVuID0gY3J5cHRvX3NpZ25fb3Blbih0bXAsIHNpZ25lZE1zZywgc2lnbmVkTXNnLmxlbmd0aCwgcHVibGljS2V5KTtcbiAgaWYgKG1sZW4gPCAwKSByZXR1cm4gbnVsbDtcbiAgdmFyIG0gPSBuZXcgVWludDhBcnJheShtbGVuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSsrKSBtW2ldID0gdG1wW2ldO1xuICByZXR1cm4gbTtcbn07XG5cbm5hY2wuc2lnbi5kZXRhY2hlZCA9IGZ1bmN0aW9uKG1zZywgc2VjcmV0S2V5KSB7XG4gIHZhciBzaWduZWRNc2cgPSBuYWNsLnNpZ24obXNnLCBzZWNyZXRLZXkpO1xuICB2YXIgc2lnID0gbmV3IFVpbnQ4QXJyYXkoY3J5cHRvX3NpZ25fQllURVMpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZy5sZW5ndGg7IGkrKykgc2lnW2ldID0gc2lnbmVkTXNnW2ldO1xuICByZXR1cm4gc2lnO1xufTtcblxubmFjbC5zaWduLmRldGFjaGVkLnZlcmlmeSA9IGZ1bmN0aW9uKG1zZywgc2lnLCBwdWJsaWNLZXkpIHtcbiAgY2hlY2tBcnJheVR5cGVzKG1zZywgc2lnLCBwdWJsaWNLZXkpO1xuICBpZiAoc2lnLmxlbmd0aCAhPT0gY3J5cHRvX3NpZ25fQllURVMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgc2lnbmF0dXJlIHNpemUnKTtcbiAgaWYgKHB1YmxpY0tleS5sZW5ndGggIT09IGNyeXB0b19zaWduX1BVQkxJQ0tFWUJZVEVTKVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIHB1YmxpYyBrZXkgc2l6ZScpO1xuICB2YXIgc20gPSBuZXcgVWludDhBcnJheShjcnlwdG9fc2lnbl9CWVRFUyArIG1zZy5sZW5ndGgpO1xuICB2YXIgbSA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zaWduX0JZVEVTICsgbXNnLmxlbmd0aCk7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgY3J5cHRvX3NpZ25fQllURVM7IGkrKykgc21baV0gPSBzaWdbaV07XG4gIGZvciAoaSA9IDA7IGkgPCBtc2cubGVuZ3RoOyBpKyspIHNtW2krY3J5cHRvX3NpZ25fQllURVNdID0gbXNnW2ldO1xuICByZXR1cm4gKGNyeXB0b19zaWduX29wZW4obSwgc20sIHNtLmxlbmd0aCwgcHVibGljS2V5KSA+PSAwKTtcbn07XG5cbm5hY2wuc2lnbi5rZXlQYWlyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwayA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zaWduX1BVQkxJQ0tFWUJZVEVTKTtcbiAgdmFyIHNrID0gbmV3IFVpbnQ4QXJyYXkoY3J5cHRvX3NpZ25fU0VDUkVUS0VZQllURVMpO1xuICBjcnlwdG9fc2lnbl9rZXlwYWlyKHBrLCBzayk7XG4gIHJldHVybiB7cHVibGljS2V5OiBwaywgc2VjcmV0S2V5OiBza307XG59O1xuXG5uYWNsLnNpZ24ua2V5UGFpci5mcm9tU2VjcmV0S2V5ID0gZnVuY3Rpb24oc2VjcmV0S2V5KSB7XG4gIGNoZWNrQXJyYXlUeXBlcyhzZWNyZXRLZXkpO1xuICBpZiAoc2VjcmV0S2V5Lmxlbmd0aCAhPT0gY3J5cHRvX3NpZ25fU0VDUkVUS0VZQllURVMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgc2VjcmV0IGtleSBzaXplJyk7XG4gIHZhciBwayA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zaWduX1BVQkxJQ0tFWUJZVEVTKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBway5sZW5ndGg7IGkrKykgcGtbaV0gPSBzZWNyZXRLZXlbMzIraV07XG4gIHJldHVybiB7cHVibGljS2V5OiBwaywgc2VjcmV0S2V5OiBuZXcgVWludDhBcnJheShzZWNyZXRLZXkpfTtcbn07XG5cbm5hY2wuc2lnbi5rZXlQYWlyLmZyb21TZWVkID0gZnVuY3Rpb24oc2VlZCkge1xuICBjaGVja0FycmF5VHlwZXMoc2VlZCk7XG4gIGlmIChzZWVkLmxlbmd0aCAhPT0gY3J5cHRvX3NpZ25fU0VFREJZVEVTKVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIHNlZWQgc2l6ZScpO1xuICB2YXIgcGsgPSBuZXcgVWludDhBcnJheShjcnlwdG9fc2lnbl9QVUJMSUNLRVlCWVRFUyk7XG4gIHZhciBzayA9IG5ldyBVaW50OEFycmF5KGNyeXB0b19zaWduX1NFQ1JFVEtFWUJZVEVTKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKSBza1tpXSA9IHNlZWRbaV07XG4gIGNyeXB0b19zaWduX2tleXBhaXIocGssIHNrLCB0cnVlKTtcbiAgcmV0dXJuIHtwdWJsaWNLZXk6IHBrLCBzZWNyZXRLZXk6IHNrfTtcbn07XG5cbm5hY2wuc2lnbi5wdWJsaWNLZXlMZW5ndGggPSBjcnlwdG9fc2lnbl9QVUJMSUNLRVlCWVRFUztcbm5hY2wuc2lnbi5zZWNyZXRLZXlMZW5ndGggPSBjcnlwdG9fc2lnbl9TRUNSRVRLRVlCWVRFUztcbm5hY2wuc2lnbi5zZWVkTGVuZ3RoID0gY3J5cHRvX3NpZ25fU0VFREJZVEVTO1xubmFjbC5zaWduLnNpZ25hdHVyZUxlbmd0aCA9IGNyeXB0b19zaWduX0JZVEVTO1xuXG5uYWNsLmhhc2ggPSBmdW5jdGlvbihtc2cpIHtcbiAgY2hlY2tBcnJheVR5cGVzKG1zZyk7XG4gIHZhciBoID0gbmV3IFVpbnQ4QXJyYXkoY3J5cHRvX2hhc2hfQllURVMpO1xuICBjcnlwdG9faGFzaChoLCBtc2csIG1zZy5sZW5ndGgpO1xuICByZXR1cm4gaDtcbn07XG5cbm5hY2wuaGFzaC5oYXNoTGVuZ3RoID0gY3J5cHRvX2hhc2hfQllURVM7XG5cbm5hY2wudmVyaWZ5ID0gZnVuY3Rpb24oeCwgeSkge1xuICBjaGVja0FycmF5VHlwZXMoeCwgeSk7XG4gIC8vIFplcm8gbGVuZ3RoIGFyZ3VtZW50cyBhcmUgY29uc2lkZXJlZCBub3QgZXF1YWwuXG4gIGlmICh4Lmxlbmd0aCA9PT0gMCB8fCB5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoeC5sZW5ndGggIT09IHkubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAodm4oeCwgMCwgeSwgMCwgeC5sZW5ndGgpID09PSAwKSA/IHRydWUgOiBmYWxzZTtcbn07XG5cbm5hY2wuc2V0UFJORyA9IGZ1bmN0aW9uKGZuKSB7XG4gIHJhbmRvbWJ5dGVzID0gZm47XG59O1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIEluaXRpYWxpemUgUFJORyBpZiBlbnZpcm9ubWVudCBwcm92aWRlcyBDU1BSTkcuXG4gIC8vIElmIG5vdCwgbWV0aG9kcyBjYWxsaW5nIHJhbmRvbWJ5dGVzIHdpbGwgdGhyb3cuXG4gIHZhciBjcnlwdG8gPSB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyAoc2VsZi5jcnlwdG8gfHwgc2VsZi5tc0NyeXB0bykgOiBudWxsO1xuICBpZiAoY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBCcm93c2Vycy5cbiAgICB2YXIgUVVPVEEgPSA2NTUzNjtcbiAgICBuYWNsLnNldFBSTkcoZnVuY3Rpb24oeCwgbikge1xuICAgICAgdmFyIGksIHYgPSBuZXcgVWludDhBcnJheShuKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpICs9IFFVT1RBKSB7XG4gICAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXModi5zdWJhcnJheShpLCBpICsgTWF0aC5taW4obiAtIGksIFFVT1RBKSkpO1xuICAgICAgfVxuICAgICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykgeFtpXSA9IHZbaV07XG4gICAgICBjbGVhbnVwKHYpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vZGUuanMuXG4gICAgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gICAgaWYgKGNyeXB0byAmJiBjcnlwdG8ucmFuZG9tQnl0ZXMpIHtcbiAgICAgIG5hY2wuc2V0UFJORyhmdW5jdGlvbih4LCBuKSB7XG4gICAgICAgIHZhciBpLCB2ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKG4pO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB4W2ldID0gdltpXTtcbiAgICAgICAgY2xlYW51cCh2KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSkoKTtcblxufSkodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA6IChzZWxmLm5hY2wgPSBzZWxmLm5hY2wgfHwge30pKTtcbiIsInZhciBuYXRpdmUgPSByZXF1aXJlKCcuL25hdGl2ZScpXG5cbmZ1bmN0aW9uIGdldFR5cGVOYW1lIChmbikge1xuICByZXR1cm4gZm4ubmFtZSB8fCBmbi50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvbiAoLio/KVxccypcXCgvKVsxXVxufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVR5cGVOYW1lICh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlLk5pbCh2YWx1ZSkgPyAnJyA6IGdldFR5cGVOYW1lKHZhbHVlLmNvbnN0cnVjdG9yKVxufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZSAodmFsdWUpIHtcbiAgaWYgKG5hdGl2ZS5GdW5jdGlvbih2YWx1ZSkpIHJldHVybiAnJ1xuICBpZiAobmF0aXZlLlN0cmluZyh2YWx1ZSkpIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgaWYgKHZhbHVlICYmIG5hdGl2ZS5PYmplY3QodmFsdWUpKSByZXR1cm4gJydcbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIGNhcHR1cmVTdGFja1RyYWNlIChlLCB0KSB7XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGUsIHQpXG4gIH1cbn1cblxuZnVuY3Rpb24gdGZKU09OICh0eXBlKSB7XG4gIGlmIChuYXRpdmUuRnVuY3Rpb24odHlwZSkpIHJldHVybiB0eXBlLnRvSlNPTiA/IHR5cGUudG9KU09OKCkgOiBnZXRUeXBlTmFtZSh0eXBlKVxuICBpZiAobmF0aXZlLkFycmF5KHR5cGUpKSByZXR1cm4gJ0FycmF5J1xuICBpZiAodHlwZSAmJiBuYXRpdmUuT2JqZWN0KHR5cGUpKSByZXR1cm4gJ09iamVjdCdcblxuICByZXR1cm4gdHlwZSAhPT0gdW5kZWZpbmVkID8gdHlwZSA6ICcnXG59XG5cbmZ1bmN0aW9uIHRmRXJyb3JTdHJpbmcgKHR5cGUsIHZhbHVlLCB2YWx1ZVR5cGVOYW1lKSB7XG4gIHZhciB2YWx1ZUpzb24gPSBnZXRWYWx1ZSh2YWx1ZSlcblxuICByZXR1cm4gJ0V4cGVjdGVkICcgKyB0ZkpTT04odHlwZSkgKyAnLCBnb3QnICtcbiAgICAodmFsdWVUeXBlTmFtZSAhPT0gJycgPyAnICcgKyB2YWx1ZVR5cGVOYW1lIDogJycpICtcbiAgICAodmFsdWVKc29uICE9PSAnJyA/ICcgJyArIHZhbHVlSnNvbiA6ICcnKVxufVxuXG5mdW5jdGlvbiBUZlR5cGVFcnJvciAodHlwZSwgdmFsdWUsIHZhbHVlVHlwZU5hbWUpIHtcbiAgdmFsdWVUeXBlTmFtZSA9IHZhbHVlVHlwZU5hbWUgfHwgZ2V0VmFsdWVUeXBlTmFtZSh2YWx1ZSlcbiAgdGhpcy5tZXNzYWdlID0gdGZFcnJvclN0cmluZyh0eXBlLCB2YWx1ZSwgdmFsdWVUeXBlTmFtZSlcblxuICBjYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBUZlR5cGVFcnJvcilcbiAgdGhpcy5fX3R5cGUgPSB0eXBlXG4gIHRoaXMuX192YWx1ZSA9IHZhbHVlXG4gIHRoaXMuX192YWx1ZVR5cGVOYW1lID0gdmFsdWVUeXBlTmFtZVxufVxuXG5UZlR5cGVFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcblRmVHlwZUVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRmVHlwZUVycm9yXG5cbmZ1bmN0aW9uIHRmUHJvcGVydHlFcnJvclN0cmluZyAodHlwZSwgbGFiZWwsIG5hbWUsIHZhbHVlLCB2YWx1ZVR5cGVOYW1lKSB7XG4gIHZhciBkZXNjcmlwdGlvbiA9ICdcIiBvZiB0eXBlICdcbiAgaWYgKGxhYmVsID09PSAna2V5JykgZGVzY3JpcHRpb24gPSAnXCIgd2l0aCBrZXkgdHlwZSAnXG5cbiAgcmV0dXJuIHRmRXJyb3JTdHJpbmcoJ3Byb3BlcnR5IFwiJyArIHRmSlNPTihuYW1lKSArIGRlc2NyaXB0aW9uICsgdGZKU09OKHR5cGUpLCB2YWx1ZSwgdmFsdWVUeXBlTmFtZSlcbn1cblxuZnVuY3Rpb24gVGZQcm9wZXJ0eVR5cGVFcnJvciAodHlwZSwgcHJvcGVydHksIGxhYmVsLCB2YWx1ZSwgdmFsdWVUeXBlTmFtZSkge1xuICBpZiAodHlwZSkge1xuICAgIHZhbHVlVHlwZU5hbWUgPSB2YWx1ZVR5cGVOYW1lIHx8IGdldFZhbHVlVHlwZU5hbWUodmFsdWUpXG4gICAgdGhpcy5tZXNzYWdlID0gdGZQcm9wZXJ0eUVycm9yU3RyaW5nKHR5cGUsIGxhYmVsLCBwcm9wZXJ0eSwgdmFsdWUsIHZhbHVlVHlwZU5hbWUpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gJ1VuZXhwZWN0ZWQgcHJvcGVydHkgXCInICsgcHJvcGVydHkgKyAnXCInXG4gIH1cblxuICBjYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBUZlR5cGVFcnJvcilcbiAgdGhpcy5fX2xhYmVsID0gbGFiZWxcbiAgdGhpcy5fX3Byb3BlcnR5ID0gcHJvcGVydHlcbiAgdGhpcy5fX3R5cGUgPSB0eXBlXG4gIHRoaXMuX192YWx1ZSA9IHZhbHVlXG4gIHRoaXMuX192YWx1ZVR5cGVOYW1lID0gdmFsdWVUeXBlTmFtZVxufVxuXG5UZlByb3BlcnR5VHlwZUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuVGZQcm9wZXJ0eVR5cGVFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUZlR5cGVFcnJvclxuXG5mdW5jdGlvbiB0ZkN1c3RvbUVycm9yIChleHBlY3RlZCwgYWN0dWFsKSB7XG4gIHJldHVybiBuZXcgVGZUeXBlRXJyb3IoZXhwZWN0ZWQsIHt9LCBhY3R1YWwpXG59XG5cbmZ1bmN0aW9uIHRmU3ViRXJyb3IgKGUsIHByb3BlcnR5LCBsYWJlbCkge1xuICAvLyBzdWIgY2hpbGQ/XG4gIGlmIChlIGluc3RhbmNlb2YgVGZQcm9wZXJ0eVR5cGVFcnJvcikge1xuICAgIHByb3BlcnR5ID0gcHJvcGVydHkgKyAnLicgKyBlLl9fcHJvcGVydHlcblxuICAgIGUgPSBuZXcgVGZQcm9wZXJ0eVR5cGVFcnJvcihcbiAgICAgIGUuX190eXBlLCBwcm9wZXJ0eSwgZS5fX2xhYmVsLCBlLl9fdmFsdWUsIGUuX192YWx1ZVR5cGVOYW1lXG4gICAgKVxuXG4gIC8vIGNoaWxkP1xuICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBUZlR5cGVFcnJvcikge1xuICAgIGUgPSBuZXcgVGZQcm9wZXJ0eVR5cGVFcnJvcihcbiAgICAgIGUuX190eXBlLCBwcm9wZXJ0eSwgbGFiZWwsIGUuX192YWx1ZSwgZS5fX3ZhbHVlVHlwZU5hbWVcbiAgICApXG4gIH1cblxuICBjYXB0dXJlU3RhY2tUcmFjZShlKVxuICByZXR1cm4gZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGZUeXBlRXJyb3I6IFRmVHlwZUVycm9yLFxuICBUZlByb3BlcnR5VHlwZUVycm9yOiBUZlByb3BlcnR5VHlwZUVycm9yLFxuICB0ZkN1c3RvbUVycm9yOiB0ZkN1c3RvbUVycm9yLFxuICB0ZlN1YkVycm9yOiB0ZlN1YkVycm9yLFxuICB0ZkpTT046IHRmSlNPTixcbiAgZ2V0VmFsdWVUeXBlTmFtZTogZ2V0VmFsdWVUeXBlTmFtZVxufVxuIiwidmFyIE5BVElWRSA9IHJlcXVpcmUoJy4vbmF0aXZlJylcbnZhciBFUlJPUlMgPSByZXF1aXJlKCcuL2Vycm9ycycpXG5cbmZ1bmN0aW9uIF9CdWZmZXIgKHZhbHVlKSB7XG4gIHJldHVybiBCdWZmZXIuaXNCdWZmZXIodmFsdWUpXG59XG5cbmZ1bmN0aW9uIEhleCAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgL14oWzAtOWEtZl17Mn0pKyQvaS50ZXN0KHZhbHVlKVxufVxuXG5mdW5jdGlvbiBfTGVuZ3RoTiAodHlwZSwgbGVuZ3RoKSB7XG4gIHZhciBuYW1lID0gdHlwZS50b0pTT04oKVxuXG4gIGZ1bmN0aW9uIExlbmd0aCAodmFsdWUpIHtcbiAgICBpZiAoIXR5cGUodmFsdWUpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAodmFsdWUubGVuZ3RoID09PSBsZW5ndGgpIHJldHVybiB0cnVlXG5cbiAgICB0aHJvdyBFUlJPUlMudGZDdXN0b21FcnJvcihuYW1lICsgJyhMZW5ndGg6ICcgKyBsZW5ndGggKyAnKScsIG5hbWUgKyAnKExlbmd0aDogJyArIHZhbHVlLmxlbmd0aCArICcpJylcbiAgfVxuICBMZW5ndGgudG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmFtZSB9XG5cbiAgcmV0dXJuIExlbmd0aFxufVxuXG52YXIgX0FycmF5TiA9IF9MZW5ndGhOLmJpbmQobnVsbCwgTkFUSVZFLkFycmF5KVxudmFyIF9CdWZmZXJOID0gX0xlbmd0aE4uYmluZChudWxsLCBfQnVmZmVyKVxudmFyIF9IZXhOID0gX0xlbmd0aE4uYmluZChudWxsLCBIZXgpXG52YXIgX1N0cmluZ04gPSBfTGVuZ3RoTi5iaW5kKG51bGwsIE5BVElWRS5TdHJpbmcpXG5cbmZ1bmN0aW9uIFJhbmdlIChhLCBiLCBmKSB7XG4gIGYgPSBmIHx8IE5BVElWRS5OdW1iZXJcbiAgZnVuY3Rpb24gX3JhbmdlICh2YWx1ZSwgc3RyaWN0KSB7XG4gICAgcmV0dXJuIGYodmFsdWUsIHN0cmljdCkgJiYgKHZhbHVlID4gYSkgJiYgKHZhbHVlIDwgYilcbiAgfVxuICBfcmFuZ2UudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBgJHtmLnRvSlNPTigpfSBiZXR3ZWVuIFske2F9LCAke2J9XWBcbiAgfVxuICByZXR1cm4gX3JhbmdlXG59XG5cbnZhciBJTlQ1M19NQVggPSBNYXRoLnBvdygyLCA1MykgLSAxXG5cbmZ1bmN0aW9uIEZpbml0ZSAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsdWUpXG59XG5mdW5jdGlvbiBJbnQ4ICh2YWx1ZSkgeyByZXR1cm4gKCh2YWx1ZSA8PCAyNCkgPj4gMjQpID09PSB2YWx1ZSB9XG5mdW5jdGlvbiBJbnQxNiAodmFsdWUpIHsgcmV0dXJuICgodmFsdWUgPDwgMTYpID4+IDE2KSA9PT0gdmFsdWUgfVxuZnVuY3Rpb24gSW50MzIgKHZhbHVlKSB7IHJldHVybiAodmFsdWUgfCAwKSA9PT0gdmFsdWUgfVxuZnVuY3Rpb24gSW50NTMgKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPj0gLUlOVDUzX01BWCAmJlxuICAgIHZhbHVlIDw9IElOVDUzX01BWCAmJlxuICAgIE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZVxufVxuZnVuY3Rpb24gVUludDggKHZhbHVlKSB7IHJldHVybiAodmFsdWUgJiAweGZmKSA9PT0gdmFsdWUgfVxuZnVuY3Rpb24gVUludDE2ICh2YWx1ZSkgeyByZXR1cm4gKHZhbHVlICYgMHhmZmZmKSA9PT0gdmFsdWUgfVxuZnVuY3Rpb24gVUludDMyICh2YWx1ZSkgeyByZXR1cm4gKHZhbHVlID4+PiAwKSA9PT0gdmFsdWUgfVxuZnVuY3Rpb24gVUludDUzICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID49IDAgJiZcbiAgICB2YWx1ZSA8PSBJTlQ1M19NQVggJiZcbiAgICBNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWVcbn1cblxudmFyIHR5cGVzID0ge1xuICBBcnJheU46IF9BcnJheU4sXG4gIEJ1ZmZlcjogX0J1ZmZlcixcbiAgQnVmZmVyTjogX0J1ZmZlck4sXG4gIEZpbml0ZTogRmluaXRlLFxuICBIZXg6IEhleCxcbiAgSGV4TjogX0hleE4sXG4gIEludDg6IEludDgsXG4gIEludDE2OiBJbnQxNixcbiAgSW50MzI6IEludDMyLFxuICBJbnQ1MzogSW50NTMsXG4gIFJhbmdlOiBSYW5nZSxcbiAgU3RyaW5nTjogX1N0cmluZ04sXG4gIFVJbnQ4OiBVSW50OCxcbiAgVUludDE2OiBVSW50MTYsXG4gIFVJbnQzMjogVUludDMyLFxuICBVSW50NTM6IFVJbnQ1M1xufVxuXG5mb3IgKHZhciB0eXBlTmFtZSBpbiB0eXBlcykge1xuICB0eXBlc1t0eXBlTmFtZV0udG9KU09OID0gZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gdFxuICB9LmJpbmQobnVsbCwgdHlwZU5hbWUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZXNcbiIsInZhciBFUlJPUlMgPSByZXF1aXJlKCcuL2Vycm9ycycpXG52YXIgTkFUSVZFID0gcmVxdWlyZSgnLi9uYXRpdmUnKVxuXG4vLyBzaG9ydC1oYW5kXG52YXIgdGZKU09OID0gRVJST1JTLnRmSlNPTlxudmFyIFRmVHlwZUVycm9yID0gRVJST1JTLlRmVHlwZUVycm9yXG52YXIgVGZQcm9wZXJ0eVR5cGVFcnJvciA9IEVSUk9SUy5UZlByb3BlcnR5VHlwZUVycm9yXG52YXIgdGZTdWJFcnJvciA9IEVSUk9SUy50ZlN1YkVycm9yXG52YXIgZ2V0VmFsdWVUeXBlTmFtZSA9IEVSUk9SUy5nZXRWYWx1ZVR5cGVOYW1lXG5cbnZhciBUWVBFUyA9IHtcbiAgYXJyYXlPZjogZnVuY3Rpb24gYXJyYXlPZiAodHlwZSwgb3B0aW9ucykge1xuICAgIHR5cGUgPSBjb21waWxlKHR5cGUpXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIGZ1bmN0aW9uIF9hcnJheU9mIChhcnJheSwgc3RyaWN0KSB7XG4gICAgICBpZiAoIU5BVElWRS5BcnJheShhcnJheSkpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKE5BVElWRS5OaWwoYXJyYXkpKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChvcHRpb25zLm1pbkxlbmd0aCAhPT0gdW5kZWZpbmVkICYmIGFycmF5Lmxlbmd0aCA8IG9wdGlvbnMubWluTGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChvcHRpb25zLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkICYmIGFycmF5Lmxlbmd0aCA+IG9wdGlvbnMubWF4TGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChvcHRpb25zLmxlbmd0aCAhPT0gdW5kZWZpbmVkICYmIGFycmF5Lmxlbmd0aCAhPT0gb3B0aW9ucy5sZW5ndGgpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gYXJyYXkuZXZlcnkoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIHR5cGVmb3JjZSh0eXBlLCB2YWx1ZSwgc3RyaWN0KVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3cgdGZTdWJFcnJvcihlLCBpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBfYXJyYXlPZi50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RyID0gJ1snICsgdGZKU09OKHR5cGUpICsgJ10nXG4gICAgICBpZiAob3B0aW9ucy5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdHIgKz0gJ3snICsgb3B0aW9ucy5sZW5ndGggKyAnfSdcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5taW5MZW5ndGggIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0ciArPSAneycgK1xuICAgICAgICAgIChvcHRpb25zLm1pbkxlbmd0aCA9PT0gdW5kZWZpbmVkID8gMCA6IG9wdGlvbnMubWluTGVuZ3RoKSArICcsJyArXG4gICAgICAgICAgKG9wdGlvbnMubWF4TGVuZ3RoID09PSB1bmRlZmluZWQgPyBJbmZpbml0eSA6IG9wdGlvbnMubWF4TGVuZ3RoKSArICd9J1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0clxuICAgIH1cblxuICAgIHJldHVybiBfYXJyYXlPZlxuICB9LFxuXG4gIG1heWJlOiBmdW5jdGlvbiBtYXliZSAodHlwZSkge1xuICAgIHR5cGUgPSBjb21waWxlKHR5cGUpXG5cbiAgICBmdW5jdGlvbiBfbWF5YmUgKHZhbHVlLCBzdHJpY3QpIHtcbiAgICAgIHJldHVybiBOQVRJVkUuTmlsKHZhbHVlKSB8fCB0eXBlKHZhbHVlLCBzdHJpY3QsIG1heWJlKVxuICAgIH1cbiAgICBfbWF5YmUudG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJz8nICsgdGZKU09OKHR5cGUpIH1cblxuICAgIHJldHVybiBfbWF5YmVcbiAgfSxcblxuICBtYXA6IGZ1bmN0aW9uIG1hcCAocHJvcGVydHlUeXBlLCBwcm9wZXJ0eUtleVR5cGUpIHtcbiAgICBwcm9wZXJ0eVR5cGUgPSBjb21waWxlKHByb3BlcnR5VHlwZSlcbiAgICBpZiAocHJvcGVydHlLZXlUeXBlKSBwcm9wZXJ0eUtleVR5cGUgPSBjb21waWxlKHByb3BlcnR5S2V5VHlwZSlcblxuICAgIGZ1bmN0aW9uIF9tYXAgKHZhbHVlLCBzdHJpY3QpIHtcbiAgICAgIGlmICghTkFUSVZFLk9iamVjdCh2YWx1ZSkpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKE5BVElWRS5OaWwodmFsdWUpKSByZXR1cm4gZmFsc2VcblxuICAgICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5S2V5VHlwZSkge1xuICAgICAgICAgICAgdHlwZWZvcmNlKHByb3BlcnR5S2V5VHlwZSwgcHJvcGVydHlOYW1lLCBzdHJpY3QpXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3cgdGZTdWJFcnJvcihlLCBwcm9wZXJ0eU5hbWUsICdrZXknKVxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgcHJvcGVydHlWYWx1ZSA9IHZhbHVlW3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICB0eXBlZm9yY2UocHJvcGVydHlUeXBlLCBwcm9wZXJ0eVZhbHVlLCBzdHJpY3QpXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aHJvdyB0ZlN1YkVycm9yKGUsIHByb3BlcnR5TmFtZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChwcm9wZXJ0eUtleVR5cGUpIHtcbiAgICAgIF9tYXAudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ3snICsgdGZKU09OKHByb3BlcnR5S2V5VHlwZSkgKyAnOiAnICsgdGZKU09OKHByb3BlcnR5VHlwZSkgKyAnfSdcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgX21hcC50b0pTT04gPSBmdW5jdGlvbiAoKSB7IHJldHVybiAneycgKyB0ZkpTT04ocHJvcGVydHlUeXBlKSArICd9JyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9tYXBcbiAgfSxcblxuICBvYmplY3Q6IGZ1bmN0aW9uIG9iamVjdCAodW5jb21waWxlZCkge1xuICAgIHZhciB0eXBlID0ge31cblxuICAgIGZvciAodmFyIHR5cGVQcm9wZXJ0eU5hbWUgaW4gdW5jb21waWxlZCkge1xuICAgICAgdHlwZVt0eXBlUHJvcGVydHlOYW1lXSA9IGNvbXBpbGUodW5jb21waWxlZFt0eXBlUHJvcGVydHlOYW1lXSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb2JqZWN0ICh2YWx1ZSwgc3RyaWN0KSB7XG4gICAgICBpZiAoIU5BVElWRS5PYmplY3QodmFsdWUpKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChOQVRJVkUuTmlsKHZhbHVlKSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHZhciBwcm9wZXJ0eU5hbWVcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gdHlwZSkge1xuICAgICAgICAgIHZhciBwcm9wZXJ0eVR5cGUgPSB0eXBlW3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICB2YXIgcHJvcGVydHlWYWx1ZSA9IHZhbHVlW3Byb3BlcnR5TmFtZV1cblxuICAgICAgICAgIHR5cGVmb3JjZShwcm9wZXJ0eVR5cGUsIHByb3BlcnR5VmFsdWUsIHN0cmljdClcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyB0ZlN1YkVycm9yKGUsIHByb3BlcnR5TmFtZSlcbiAgICAgIH1cblxuICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICBmb3IgKHByb3BlcnR5TmFtZSBpbiB2YWx1ZSkge1xuICAgICAgICAgIGlmICh0eXBlW3Byb3BlcnR5TmFtZV0pIGNvbnRpbnVlXG5cbiAgICAgICAgICB0aHJvdyBuZXcgVGZQcm9wZXJ0eVR5cGVFcnJvcih1bmRlZmluZWQsIHByb3BlcnR5TmFtZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBfb2JqZWN0LnRvSlNPTiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRmSlNPTih0eXBlKSB9XG5cbiAgICByZXR1cm4gX29iamVjdFxuICB9LFxuXG4gIGFueU9mOiBmdW5jdGlvbiBhbnlPZiAoKSB7XG4gICAgdmFyIHR5cGVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLm1hcChjb21waWxlKVxuXG4gICAgZnVuY3Rpb24gX2FueU9mICh2YWx1ZSwgc3RyaWN0KSB7XG4gICAgICByZXR1cm4gdHlwZXMuc29tZShmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiB0eXBlZm9yY2UodHlwZSwgdmFsdWUsIHN0cmljdClcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBfYW55T2YudG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdHlwZXMubWFwKHRmSlNPTikuam9pbignfCcpIH1cblxuICAgIHJldHVybiBfYW55T2ZcbiAgfSxcblxuICBhbGxPZjogZnVuY3Rpb24gYWxsT2YgKCkge1xuICAgIHZhciB0eXBlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5tYXAoY29tcGlsZSlcblxuICAgIGZ1bmN0aW9uIF9hbGxPZiAodmFsdWUsIHN0cmljdCkge1xuICAgICAgcmV0dXJuIHR5cGVzLmV2ZXJ5KGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIHR5cGVmb3JjZSh0eXBlLCB2YWx1ZSwgc3RyaWN0KVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIF9hbGxPZi50b0pTT04gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0eXBlcy5tYXAodGZKU09OKS5qb2luKCcgJiAnKSB9XG5cbiAgICByZXR1cm4gX2FsbE9mXG4gIH0sXG5cbiAgcXVhY2tzTGlrZTogZnVuY3Rpb24gcXVhY2tzTGlrZSAodHlwZSkge1xuICAgIGZ1bmN0aW9uIF9xdWFja3NMaWtlICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGUgPT09IGdldFZhbHVlVHlwZU5hbWUodmFsdWUpXG4gICAgfVxuICAgIF9xdWFja3NMaWtlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR5cGUgfVxuXG4gICAgcmV0dXJuIF9xdWFja3NMaWtlXG4gIH0sXG5cbiAgdHVwbGU6IGZ1bmN0aW9uIHR1cGxlICgpIHtcbiAgICB2YXIgdHlwZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykubWFwKGNvbXBpbGUpXG5cbiAgICBmdW5jdGlvbiBfdHVwbGUgKHZhbHVlcywgc3RyaWN0KSB7XG4gICAgICBpZiAoTkFUSVZFLk5pbCh2YWx1ZXMpKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChOQVRJVkUuTmlsKHZhbHVlcy5sZW5ndGgpKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChzdHJpY3QgJiYgKHZhbHVlcy5sZW5ndGggIT09IHR5cGVzLmxlbmd0aCkpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gdHlwZXMuZXZlcnkoZnVuY3Rpb24gKHR5cGUsIGkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gdHlwZWZvcmNlKHR5cGUsIHZhbHVlc1tpXSwgc3RyaWN0KVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3cgdGZTdWJFcnJvcihlLCBpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBfdHVwbGUudG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJygnICsgdHlwZXMubWFwKHRmSlNPTikuam9pbignLCAnKSArICcpJyB9XG5cbiAgICByZXR1cm4gX3R1cGxlXG4gIH0sXG5cbiAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlIChleHBlY3RlZCkge1xuICAgIGZ1bmN0aW9uIF92YWx1ZSAoYWN0dWFsKSB7XG4gICAgICByZXR1cm4gYWN0dWFsID09PSBleHBlY3RlZFxuICAgIH1cbiAgICBfdmFsdWUudG9KU09OID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZXhwZWN0ZWQgfVxuXG4gICAgcmV0dXJuIF92YWx1ZVxuICB9XG59XG5cbi8vIFRPRE86IGRlcHJlY2F0ZVxuVFlQRVMub25lT2YgPSBUWVBFUy5hbnlPZlxuXG5mdW5jdGlvbiBjb21waWxlICh0eXBlKSB7XG4gIGlmIChOQVRJVkUuU3RyaW5nKHR5cGUpKSB7XG4gICAgaWYgKHR5cGVbMF0gPT09ICc/JykgcmV0dXJuIFRZUEVTLm1heWJlKHR5cGUuc2xpY2UoMSkpXG5cbiAgICByZXR1cm4gTkFUSVZFW3R5cGVdIHx8IFRZUEVTLnF1YWNrc0xpa2UodHlwZSlcbiAgfSBlbHNlIGlmICh0eXBlICYmIE5BVElWRS5PYmplY3QodHlwZSkpIHtcbiAgICBpZiAoTkFUSVZFLkFycmF5KHR5cGUpKSB7XG4gICAgICBpZiAodHlwZS5sZW5ndGggIT09IDEpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGNvbXBpbGUoKSBwYXJhbWV0ZXIgb2YgdHlwZSBBcnJheSBvZiBsZW5ndGggMScpXG4gICAgICByZXR1cm4gVFlQRVMuYXJyYXlPZih0eXBlWzBdKVxuICAgIH1cblxuICAgIHJldHVybiBUWVBFUy5vYmplY3QodHlwZSlcbiAgfSBlbHNlIGlmIChOQVRJVkUuRnVuY3Rpb24odHlwZSkpIHtcbiAgICByZXR1cm4gdHlwZVxuICB9XG5cbiAgcmV0dXJuIFRZUEVTLnZhbHVlKHR5cGUpXG59XG5cbmZ1bmN0aW9uIHR5cGVmb3JjZSAodHlwZSwgdmFsdWUsIHN0cmljdCwgc3Vycm9nYXRlKSB7XG4gIGlmIChOQVRJVkUuRnVuY3Rpb24odHlwZSkpIHtcbiAgICBpZiAodHlwZSh2YWx1ZSwgc3RyaWN0KSkgcmV0dXJuIHRydWVcblxuICAgIHRocm93IG5ldyBUZlR5cGVFcnJvcihzdXJyb2dhdGUgfHwgdHlwZSwgdmFsdWUpXG4gIH1cblxuICAvLyBKSVRcbiAgcmV0dXJuIHR5cGVmb3JjZShjb21waWxlKHR5cGUpLCB2YWx1ZSwgc3RyaWN0KVxufVxuXG4vLyBhc3NpZ24gdHlwZXMgdG8gdHlwZWZvcmNlIGZ1bmN0aW9uXG5mb3IgKHZhciB0eXBlTmFtZSBpbiBOQVRJVkUpIHtcbiAgdHlwZWZvcmNlW3R5cGVOYW1lXSA9IE5BVElWRVt0eXBlTmFtZV1cbn1cblxuZm9yICh0eXBlTmFtZSBpbiBUWVBFUykge1xuICB0eXBlZm9yY2VbdHlwZU5hbWVdID0gVFlQRVNbdHlwZU5hbWVdXG59XG5cbnZhciBFWFRSQSA9IHJlcXVpcmUoJy4vZXh0cmEnKVxuZm9yICh0eXBlTmFtZSBpbiBFWFRSQSkge1xuICB0eXBlZm9yY2VbdHlwZU5hbWVdID0gRVhUUkFbdHlwZU5hbWVdXG59XG5cbnR5cGVmb3JjZS5jb21waWxlID0gY29tcGlsZVxudHlwZWZvcmNlLlRmVHlwZUVycm9yID0gVGZUeXBlRXJyb3JcbnR5cGVmb3JjZS5UZlByb3BlcnR5VHlwZUVycm9yID0gVGZQcm9wZXJ0eVR5cGVFcnJvclxuXG5tb2R1bGUuZXhwb3J0cyA9IHR5cGVmb3JjZVxuIiwidmFyIHR5cGVzID0ge1xuICBBcnJheTogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSB9LFxuICBCb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nIH0sXG4gIEZ1bmN0aW9uOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyB9LFxuICBOaWw6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB9LFxuICBOdW1iZXI6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB9LFxuICBPYmplY3Q6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB9LFxuICBTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB9LFxuICAnJzogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZSB9XG59XG5cbi8vIFRPRE86IGRlcHJlY2F0ZVxudHlwZXMuTnVsbCA9IHR5cGVzLk5pbFxuXG5mb3IgKHZhciB0eXBlTmFtZSBpbiB0eXBlcykge1xuICB0eXBlc1t0eXBlTmFtZV0udG9KU09OID0gZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gdFxuICB9LmJpbmQobnVsbCwgdHlwZU5hbWUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgVWludDhBcnJheSBjcmVhdGVkIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIHBhc3NlZCBBcnJheUxpa2VzXG4gKlxuICogQHBhcmFtIHtBcnJheTxBcnJheUxpa2U8bnVtYmVyPj59IGFycmF5c1xuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGhdXG4gKi9cbmZ1bmN0aW9uIGNvbmNhdCAoYXJyYXlzLCBsZW5ndGgpIHtcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSBhcnJheXMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIubGVuZ3RoLCAwKVxuICB9XG5cbiAgY29uc3Qgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICBsZXQgb2Zmc2V0ID0gMFxuXG4gIGZvciAoY29uc3QgYXJyIG9mIGFycmF5cykge1xuICAgIG91dHB1dC5zZXQoYXJyLCBvZmZzZXQpXG4gICAgb2Zmc2V0ICs9IGFyci5sZW5ndGhcbiAgfVxuXG4gIHJldHVybiBvdXRwdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25jYXRcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIHBhc3NlZCBVaW50OEFycmF5cyBoYXZlIHRoZSBzYW1lIGNvbnRlbnRcbiAqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGFcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYlxuICovXG5mdW5jdGlvbiBlcXVhbHMgKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGEuYnl0ZUxlbmd0aCAhPT0gYi5ieXRlTGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGEuYnl0ZUxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxzXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgeyBlbmNvZGluZzogZ2V0Q29kZWMgfSA9IHJlcXVpcmUoJ211bHRpYmFzZScpXG5jb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpXG5cbi8qKlxuICogQHR5cGVkZWYge19faW1wb3J0X18oJ211bHRpYmFzZS9zcmMvdHlwZXMnKS5CYXNlTmFtZSB8ICd1dGY4JyB8ICd1dGYtOCcgfCAnYXNjaWknIHwgdW5kZWZpbmVkfSBTdXBwb3J0ZWRFbmNvZGluZ3NcbiAqL1xuXG4vKipcbiAqIEludGVycHJldHMgZWFjaCBjaGFyYWN0ZXIgaW4gYSBzdHJpbmcgYXMgYSBieXRlIGFuZFxuICogcmV0dXJucyBhIFVpbnQ4QXJyYXkgb2YgdGhvc2UgYnl0ZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIFRoZSBzdHJpbmcgdG8gdHVybiBpbnRvIGFuIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGFzY2lpU3RyaW5nVG9VaW50OEFycmF5IChzdHJpbmcpIHtcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShzdHJpbmcubGVuZ3RoKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXlbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICB9XG5cbiAgcmV0dXJuIGFycmF5XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYFVpbnQ4QXJyYXlgIGZyb20gdGhlIHBhc3NlZCBzdHJpbmdcbiAqXG4gKiBTdXBwb3J0cyBgdXRmOGAsIGB1dGYtOGAgYW5kIGFueSBlbmNvZGluZyBzdXBwb3J0ZWQgYnkgdGhlIG11bHRpYmFzZSBtb2R1bGUuXG4gKlxuICogQWxzbyBgYXNjaWlgIHdoaWNoIGlzIHNpbWlsYXIgdG8gbm9kZSdzICdiaW5hcnknIGVuY29kaW5nLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAqIEBwYXJhbSB7U3VwcG9ydGVkRW5jb2RpbmdzfSBbZW5jb2Rpbmc9dXRmOF0gLSB1dGY4LCBiYXNlMTYsIGJhc2U2NCwgYmFzZTY0dXJscGFkLCBldGNcbiAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICovXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcsIGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gIGlmIChlbmNvZGluZyA9PT0gJ3V0ZjgnIHx8IGVuY29kaW5nID09PSAndXRmLTgnKSB7XG4gICAgcmV0dXJuIHV0ZjhFbmNvZGVyLmVuY29kZShzdHJpbmcpXG4gIH1cblxuICBpZiAoZW5jb2RpbmcgPT09ICdhc2NpaScpIHtcbiAgICByZXR1cm4gYXNjaWlTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyaW5nKVxuICB9XG5cbiAgcmV0dXJuIGdldENvZGVjKGVuY29kaW5nKS5kZWNvZGUoc3RyaW5nKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZyb21TdHJpbmdcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCB7IGVuY29kaW5nOiBnZXRDb2RlYyB9ID0gcmVxdWlyZSgnbXVsdGliYXNlJylcbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCd1dGY4JylcblxuLyoqXG4gKiBAdHlwZWRlZiB7X19pbXBvcnRfXygnbXVsdGliYXNlL3NyYy90eXBlcycpLkJhc2VOYW1lIHwgJ3V0ZjgnIHwgJ3V0Zi04JyB8ICdhc2NpaScgfCB1bmRlZmluZWR9IFN1cHBvcnRlZEVuY29kaW5nc1xuICovXG5cbi8qKlxuICogVHVybnMgYSBVaW50OEFycmF5IG9mIGJ5dGVzIGludG8gYSBzdHJpbmcgd2l0aCBlYWNoXG4gKiBjaGFyYWN0ZXIgYmVpbmcgdGhlIGNoYXIgY29kZSBvZiB0aGUgY29ycmVzcG9uZGluZyBieXRlXG4gKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBhcnJheSAtIFRoZSBhcnJheSB0byB0dXJuIGludG8gYSBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gdWludDhBcnJheVRvQXNjaWlTdHJpbmcgKGFycmF5KSB7XG4gIGxldCBzdHJpbmcgPSAnJ1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICBzdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShhcnJheVtpXSlcbiAgfVxuICByZXR1cm4gc3RyaW5nXG59XG5cbi8qKlxuICogVHVybnMgYSBgVWludDhBcnJheWAgaW50byBhIHN0cmluZy5cbiAqXG4gKiBTdXBwb3J0cyBgdXRmOGAsIGB1dGYtOGAgYW5kIGFueSBlbmNvZGluZyBzdXBwb3J0ZWQgYnkgdGhlIG11bHRpYmFzZSBtb2R1bGUuXG4gKlxuICogQWxzbyBgYXNjaWlgIHdoaWNoIGlzIHNpbWlsYXIgdG8gbm9kZSdzICdiaW5hcnknIGVuY29kaW5nLlxuICpcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYXJyYXkgLSBUaGUgYXJyYXkgdG8gdHVybiBpbnRvIGEgc3RyaW5nXG4gKiBAcGFyYW0ge1N1cHBvcnRlZEVuY29kaW5nc30gW2VuY29kaW5nPXV0ZjhdIC0gVGhlIGVuY29kaW5nIHRvIHVzZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcgKGFycmF5LCBlbmNvZGluZyA9ICd1dGY4Jykge1xuICBpZiAoZW5jb2RpbmcgPT09ICd1dGY4JyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi04Jykge1xuICAgIHJldHVybiB1dGY4RGVjb2Rlci5kZWNvZGUoYXJyYXkpXG4gIH1cblxuICBpZiAoZW5jb2RpbmcgPT09ICdhc2NpaScpIHtcbiAgICByZXR1cm4gdWludDhBcnJheVRvQXNjaWlTdHJpbmcoYXJyYXkpXG4gIH1cblxuICByZXR1cm4gZ2V0Q29kZWMoZW5jb2RpbmcpLmVuY29kZShhcnJheSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1N0cmluZ1xuIiwiJ3VzZSBzdHJpY3QnXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnc2FmZS1idWZmZXInKS5CdWZmZXJcblxuLy8gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MVxuXG5mdW5jdGlvbiBjaGVja1VJbnQ1MyAobikge1xuICBpZiAobiA8IDAgfHwgbiA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgbiAlIDEgIT09IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCd2YWx1ZSBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiBlbmNvZGUgKG51bWJlciwgYnVmZmVyLCBvZmZzZXQpIHtcbiAgY2hlY2tVSW50NTMobnVtYmVyKVxuXG4gIGlmICghYnVmZmVyKSBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUoZW5jb2RpbmdMZW5ndGgobnVtYmVyKSlcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmZmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYnVmZmVyIG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAoIW9mZnNldCkgb2Zmc2V0ID0gMFxuXG4gIC8vIDggYml0XG4gIGlmIChudW1iZXIgPCAweGZkKSB7XG4gICAgYnVmZmVyLndyaXRlVUludDgobnVtYmVyLCBvZmZzZXQpXG4gICAgZW5jb2RlLmJ5dGVzID0gMVxuXG4gIC8vIDE2IGJpdFxuICB9IGVsc2UgaWYgKG51bWJlciA8PSAweGZmZmYpIHtcbiAgICBidWZmZXIud3JpdGVVSW50OCgweGZkLCBvZmZzZXQpXG4gICAgYnVmZmVyLndyaXRlVUludDE2TEUobnVtYmVyLCBvZmZzZXQgKyAxKVxuICAgIGVuY29kZS5ieXRlcyA9IDNcblxuICAvLyAzMiBiaXRcbiAgfSBlbHNlIGlmIChudW1iZXIgPD0gMHhmZmZmZmZmZikge1xuICAgIGJ1ZmZlci53cml0ZVVJbnQ4KDB4ZmUsIG9mZnNldClcbiAgICBidWZmZXIud3JpdGVVSW50MzJMRShudW1iZXIsIG9mZnNldCArIDEpXG4gICAgZW5jb2RlLmJ5dGVzID0gNVxuXG4gIC8vIDY0IGJpdFxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlci53cml0ZVVJbnQ4KDB4ZmYsIG9mZnNldClcbiAgICBidWZmZXIud3JpdGVVSW50MzJMRShudW1iZXIgPj4+IDAsIG9mZnNldCArIDEpXG4gICAgYnVmZmVyLndyaXRlVUludDMyTEUoKG51bWJlciAvIDB4MTAwMDAwMDAwKSB8IDAsIG9mZnNldCArIDUpXG4gICAgZW5jb2RlLmJ5dGVzID0gOVxuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBkZWNvZGUgKGJ1ZmZlciwgb2Zmc2V0KSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2J1ZmZlciBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKCFvZmZzZXQpIG9mZnNldCA9IDBcblxuICB2YXIgZmlyc3QgPSBidWZmZXIucmVhZFVJbnQ4KG9mZnNldClcblxuICAvLyA4IGJpdFxuICBpZiAoZmlyc3QgPCAweGZkKSB7XG4gICAgZGVjb2RlLmJ5dGVzID0gMVxuICAgIHJldHVybiBmaXJzdFxuXG4gIC8vIDE2IGJpdFxuICB9IGVsc2UgaWYgKGZpcnN0ID09PSAweGZkKSB7XG4gICAgZGVjb2RlLmJ5dGVzID0gM1xuICAgIHJldHVybiBidWZmZXIucmVhZFVJbnQxNkxFKG9mZnNldCArIDEpXG5cbiAgLy8gMzIgYml0XG4gIH0gZWxzZSBpZiAoZmlyc3QgPT09IDB4ZmUpIHtcbiAgICBkZWNvZGUuYnl0ZXMgPSA1XG4gICAgcmV0dXJuIGJ1ZmZlci5yZWFkVUludDMyTEUob2Zmc2V0ICsgMSlcblxuICAvLyA2NCBiaXRcbiAgfSBlbHNlIHtcbiAgICBkZWNvZGUuYnl0ZXMgPSA5XG4gICAgdmFyIGxvID0gYnVmZmVyLnJlYWRVSW50MzJMRShvZmZzZXQgKyAxKVxuICAgIHZhciBoaSA9IGJ1ZmZlci5yZWFkVUludDMyTEUob2Zmc2V0ICsgNSlcbiAgICB2YXIgbnVtYmVyID0gaGkgKiAweDAxMDAwMDAwMDAgKyBsb1xuICAgIGNoZWNrVUludDUzKG51bWJlcilcblxuICAgIHJldHVybiBudW1iZXJcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGluZ0xlbmd0aCAobnVtYmVyKSB7XG4gIGNoZWNrVUludDUzKG51bWJlcilcblxuICByZXR1cm4gKFxuICAgIG51bWJlciA8IDB4ZmQgPyAxXG4gICAgICA6IG51bWJlciA8PSAweGZmZmYgPyAzXG4gICAgICAgIDogbnVtYmVyIDw9IDB4ZmZmZmZmZmYgPyA1XG4gICAgICAgICAgOiA5XG4gIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IGVuY29kZTogZW5jb2RlLCBkZWNvZGU6IGRlY29kZSwgZW5jb2RpbmdMZW5ndGg6IGVuY29kaW5nTGVuZ3RoIH1cbiIsIlwidXNlIHN0cmljdFwiXG5cbmV4cG9ydHMuVGV4dEVuY29kZXIgPVxuICB0eXBlb2YgVGV4dEVuY29kZXIgIT09IFwidW5kZWZpbmVkXCIgPyBUZXh0RW5jb2RlciA6IHJlcXVpcmUoXCJ1dGlsXCIpLlRleHRFbmNvZGVyXG5cbmV4cG9ydHMuVGV4dERlY29kZXIgPVxuICB0eXBlb2YgVGV4dERlY29kZXIgIT09IFwidW5kZWZpbmVkXCIgPyBUZXh0RGVjb2RlciA6IHJlcXVpcmUoXCJ1dGlsXCIpLlRleHREZWNvZGVyXG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuV0hBVFdHRmV0Y2ggPSB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZ2xvYmFsID1cbiAgICAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbFRoaXMpIHx8XG4gICAgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmKSB8fFxuICAgICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwpO1xuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gZ2xvYmFsLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBnbG9iYWwgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjpcbiAgICAgICdGaWxlUmVhZGVyJyBpbiBnbG9iYWwgJiZcbiAgICAgICdCbG9iJyBpbiBnbG9iYWwgJiZcbiAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBnbG9iYWwsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gZ2xvYmFsXG4gIH07XG5cbiAgZnVuY3Rpb24gaXNEYXRhVmlldyhvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXTtcblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9XG4gICAgICBBcnJheUJ1ZmZlci5pc1ZpZXcgfHxcbiAgICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fiFdL2kudGVzdChuYW1lKSB8fCBuYW1lID09PSAnJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWU6IFwiJyArIG5hbWUgKyAnXCInKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge307XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpO1xuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdO1xuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSArICcsICcgKyB2YWx1ZSA6IHZhbHVlO1xuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV07XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpO1xuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgaXRlbXMucHVzaChuYW1lKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpdGVtcy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH07XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdCk7XG4gICAgICB9O1xuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcik7XG4gICAgICB9O1xuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcik7XG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKTtcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKTtcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKTtcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpO1xuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIC8qXG4gICAgICAgIGZldGNoLW1vY2sgd3JhcHMgdGhlIFJlc3BvbnNlIG9iamVjdCBpbiBhbiBFUzYgUHJveHkgdG9cbiAgICAgICAgcHJvdmlkZSB1c2VmdWwgdGVzdCBoYXJuZXNzIGZlYXR1cmVzIHN1Y2ggYXMgZmx1c2guIEhvd2V2ZXIsIG9uXG4gICAgICAgIEVTNSBicm93c2VycyB3aXRob3V0IGZldGNoIG9yIFByb3h5IHN1cHBvcnQgcG9sbHlmaWxscyBtdXN0IGJlIHVzZWQ7XG4gICAgICAgIHRoZSBwcm94eS1wb2xseWZpbGwgaXMgdW5hYmxlIHRvIHByb3h5IGFuIGF0dHJpYnV0ZSB1bmxlc3MgaXQgZXhpc3RzXG4gICAgICAgIG9uIHRoZSBvYmplY3QgYmVmb3JlIHRoZSBQcm94eSBpcyBjcmVhdGVkLiBUaGlzIGNoYW5nZSBlbnN1cmVzXG4gICAgICAgIFJlc3BvbnNlLmJvZHlVc2VkIGV4aXN0cyBvbiB0aGUgaW5zdGFuY2UsIHdoaWxlIG1haW50YWluaW5nIHRoZVxuICAgICAgICBzZW1hbnRpYyBvZiBzZXR0aW5nIFJlcXVlc3QuYm9keVVzZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGJlZm9yZVxuICAgICAgICBfaW5pdEJvZHkgaXMgY2FsbGVkLlxuICAgICAgKi9cbiAgICAgIHRoaXMuYm9keVVzZWQgPSB0aGlzLmJvZHlVc2VkO1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5O1xuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5O1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKCk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpO1xuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5ID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICB2YXIgaXNDb25zdW1lZCA9IGNvbnN1bWVkKHRoaXMpO1xuICAgICAgICAgIGlmIChpc0NvbnN1bWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNDb25zdW1lZFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlci5idWZmZXIuc2xpY2UoXG4gICAgICAgICAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyLmJ5dGVPZmZzZXQsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyLmJ5dGVPZmZzZXQgKyB0aGlzLl9ib2R5QXJyYXlCdWZmZXIuYnl0ZUxlbmd0aFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXTtcblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICByZXR1cm4gbWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQbGVhc2UgdXNlIHRoZSBcIm5ld1wiIG9wZXJhdG9yLCB0aGlzIERPTSBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLicpXG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHk7XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0O1xuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KTtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdzYW1lLW9yaWdpbic7XG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJyk7XG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsO1xuICAgIHRoaXMuc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgfHwgdGhpcy5zaWduYWw7XG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGw7XG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpO1xuXG4gICAgaWYgKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSB7XG4gICAgICBpZiAob3B0aW9ucy5jYWNoZSA9PT0gJ25vLXN0b3JlJyB8fCBvcHRpb25zLmNhY2hlID09PSAnbm8tY2FjaGUnKSB7XG4gICAgICAgIC8vIFNlYXJjaCBmb3IgYSAnXycgcGFyYW1ldGVyIGluIHRoZSBxdWVyeSBzdHJpbmdcbiAgICAgICAgdmFyIHJlUGFyYW1TZWFyY2ggPSAvKFs/Jl0pXz1bXiZdKi87XG4gICAgICAgIGlmIChyZVBhcmFtU2VhcmNoLnRlc3QodGhpcy51cmwpKSB7XG4gICAgICAgICAgLy8gSWYgaXQgYWxyZWFkeSBleGlzdHMgdGhlbiBzZXQgdGhlIHZhbHVlIHdpdGggdGhlIGN1cnJlbnQgdGltZVxuICAgICAgICAgIHRoaXMudXJsID0gdGhpcy51cmwucmVwbGFjZShyZVBhcmFtU2VhcmNoLCAnJDFfPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBhIG5ldyAnXycgcGFyYW1ldGVyIHRvIHRoZSBlbmQgd2l0aCB0aGUgY3VycmVudCB0aW1lXG4gICAgICAgICAgdmFyIHJlUXVlcnlTdHJpbmcgPSAvXFw/LztcbiAgICAgICAgICB0aGlzLnVybCArPSAocmVRdWVyeVN0cmluZy50ZXN0KHRoaXMudXJsKSA/ICcmJyA6ICc/JykgKyAnXz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxuICB9O1xuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKTtcbiAgICBib2R5XG4gICAgICAudHJpbSgpXG4gICAgICAuc3BsaXQoJyYnKVxuICAgICAgLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKTtcbiAgICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgICAvLyBSZXBsYWNlIGluc3RhbmNlcyBvZiBcXHJcXG4gYW5kIFxcbiBmb2xsb3dlZCBieSBhdCBsZWFzdCBvbmUgc3BhY2Ugb3IgaG9yaXpvbnRhbCB0YWIgd2l0aCBhIHNwYWNlXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgICB2YXIgcHJlUHJvY2Vzc2VkSGVhZGVycyA9IHJhd0hlYWRlcnMucmVwbGFjZSgvXFxyP1xcbltcXHQgXSsvZywgJyAnKTtcbiAgICAvLyBBdm9pZGluZyBzcGxpdCB2aWEgcmVnZXggdG8gd29yayBhcm91bmQgYSBjb21tb24gSUUxMSBidWcgd2l0aCB0aGUgY29yZS1qcyAzLjYuMCByZWdleCBwb2x5ZmlsbFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9naXRodWIvZmV0Y2gvaXNzdWVzLzc0OFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy83NTFcbiAgICBwcmVQcm9jZXNzZWRIZWFkZXJzXG4gICAgICAuc3BsaXQoJ1xccicpXG4gICAgICAubWFwKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICByZXR1cm4gaGVhZGVyLmluZGV4T2YoJ1xcbicpID09PSAwID8gaGVhZGVyLnN1YnN0cigxLCBoZWFkZXIubGVuZ3RoKSA6IGhlYWRlclxuICAgICAgfSlcbiAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpO1xuICAgICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKCk7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpO1xuICAgICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKTtcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZXNwb25zZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BsZWFzZSB1c2UgdGhlIFwibmV3XCIgb3BlcmF0b3IsIHRoaXMgRE9NIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uJylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgPT09IHVuZGVmaW5lZCA/IDIwMCA6IG9wdGlvbnMuc3RhdHVzO1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0ID09PSB1bmRlZmluZWQgPyAnJyA6ICcnICsgb3B0aW9ucy5zdGF0dXNUZXh0O1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJztcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdCk7XG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9O1xuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSk7XG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcic7XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH07XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdO1xuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH07XG5cbiAgZXhwb3J0cy5ET01FeGNlcHRpb24gPSBnbG9iYWwuRE9NRXhjZXB0aW9uO1xuICB0cnkge1xuICAgIG5ldyBleHBvcnRzLkRPTUV4Y2VwdGlvbigpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBleHBvcnRzLkRPTUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdmFyIGVycm9yID0gRXJyb3IobWVzc2FnZSk7XG4gICAgICB0aGlzLnN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gICAgfTtcbiAgICBleHBvcnRzLkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG4gICAgZXhwb3J0cy5ET01FeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZXhwb3J0cy5ET01FeGNlcHRpb247XG4gIH1cblxuICBmdW5jdGlvbiBmZXRjaChpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpO1xuXG4gICAgICBpZiAocmVxdWVzdC5zaWduYWwgJiYgcmVxdWVzdC5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBleHBvcnRzLkRPTUV4Y2VwdGlvbignQWJvcnRlZCcsICdBYm9ydEVycm9yJykpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgZnVuY3Rpb24gYWJvcnRYaHIoKSB7XG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9O1xuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpO1xuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfTtcblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfTtcblxuICAgICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZWplY3QobmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gZml4VXJsKHVybCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiB1cmwgPT09ICcnICYmIGdsb2JhbC5sb2NhdGlvbi5ocmVmID8gZ2xvYmFsLmxvY2F0aW9uLmhyZWYgOiB1cmxcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiB1cmxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgZml4VXJsKHJlcXVlc3QudXJsKSwgdHJ1ZSk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIpIHtcbiAgICAgICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgc3VwcG9ydC5hcnJheUJ1ZmZlciAmJlxuICAgICAgICAgIHJlcXVlc3QuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpICYmXG4gICAgICAgICAgcmVxdWVzdC5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykuaW5kZXhPZignYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJykgIT09IC0xXG4gICAgICAgICkge1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpbml0ICYmIHR5cGVvZiBpbml0LmhlYWRlcnMgPT09ICdvYmplY3QnICYmICEoaW5pdC5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykpIHtcbiAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5pdC5oZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCBub3JtYWxpemVWYWx1ZShpbml0LmhlYWRlcnNbbmFtZV0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXF1ZXN0LnNpZ25hbCkge1xuICAgICAgICByZXF1ZXN0LnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKTtcblxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRE9ORSAoc3VjY2VzcyBvciBmYWlsdXJlKVxuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgcmVxdWVzdC5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KTtcbiAgICB9KVxuICB9XG5cbiAgZmV0Y2gucG9seWZpbGwgPSB0cnVlO1xuXG4gIGlmICghZ2xvYmFsLmZldGNoKSB7XG4gICAgZ2xvYmFsLmZldGNoID0gZmV0Y2g7XG4gICAgZ2xvYmFsLkhlYWRlcnMgPSBIZWFkZXJzO1xuICAgIGdsb2JhbC5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgICBnbG9iYWwuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgfVxuXG4gIGV4cG9ydHMuSGVhZGVycyA9IEhlYWRlcnM7XG4gIGV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIGV4cG9ydHMuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgZXhwb3J0cy5mZXRjaCA9IGZldGNoO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCJ2YXIgYnM1OGNoZWNrID0gcmVxdWlyZSgnYnM1OGNoZWNrJylcblxuZnVuY3Rpb24gZGVjb2RlUmF3IChidWZmZXIsIHZlcnNpb24pIHtcbiAgLy8gY2hlY2sgdmVyc2lvbiBvbmx5IGlmIGRlZmluZWRcbiAgaWYgKHZlcnNpb24gIT09IHVuZGVmaW5lZCAmJiBidWZmZXJbMF0gIT09IHZlcnNpb24pIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBuZXR3b3JrIHZlcnNpb24nKVxuXG4gIC8vIHVuY29tcHJlc3NlZFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMzMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogYnVmZmVyWzBdLFxuICAgICAgcHJpdmF0ZUtleTogYnVmZmVyLnNsaWNlKDEsIDMzKSxcbiAgICAgIGNvbXByZXNzZWQ6IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLy8gaW52YWxpZCBsZW5ndGhcbiAgaWYgKGJ1ZmZlci5sZW5ndGggIT09IDM0KSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgV0lGIGxlbmd0aCcpXG5cbiAgLy8gaW52YWxpZCBjb21wcmVzc2lvbiBmbGFnXG4gIGlmIChidWZmZXJbMzNdICE9PSAweDAxKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29tcHJlc3Npb24gZmxhZycpXG5cbiAgcmV0dXJuIHtcbiAgICB2ZXJzaW9uOiBidWZmZXJbMF0sXG4gICAgcHJpdmF0ZUtleTogYnVmZmVyLnNsaWNlKDEsIDMzKSxcbiAgICBjb21wcmVzc2VkOiB0cnVlXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlUmF3ICh2ZXJzaW9uLCBwcml2YXRlS2V5LCBjb21wcmVzc2VkKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgQnVmZmVyKGNvbXByZXNzZWQgPyAzNCA6IDMzKVxuXG4gIHJlc3VsdC53cml0ZVVJbnQ4KHZlcnNpb24sIDApXG4gIHByaXZhdGVLZXkuY29weShyZXN1bHQsIDEpXG5cbiAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICByZXN1bHRbMzNdID0gMHgwMVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBkZWNvZGUgKHN0cmluZywgdmVyc2lvbikge1xuICByZXR1cm4gZGVjb2RlUmF3KGJzNThjaGVjay5kZWNvZGUoc3RyaW5nKSwgdmVyc2lvbilcbn1cblxuZnVuY3Rpb24gZW5jb2RlICh2ZXJzaW9uLCBwcml2YXRlS2V5LCBjb21wcmVzc2VkKSB7XG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ251bWJlcicpIHJldHVybiBiczU4Y2hlY2suZW5jb2RlKGVuY29kZVJhdyh2ZXJzaW9uLCBwcml2YXRlS2V5LCBjb21wcmVzc2VkKSlcblxuICByZXR1cm4gYnM1OGNoZWNrLmVuY29kZShcbiAgICBlbmNvZGVSYXcoXG4gICAgICB2ZXJzaW9uLnZlcnNpb24sXG4gICAgICB2ZXJzaW9uLnByaXZhdGVLZXksXG4gICAgICB2ZXJzaW9uLmNvbXByZXNzZWRcbiAgICApXG4gIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlY29kZTogZGVjb2RlLFxuICBkZWNvZGVSYXc6IGRlY29kZVJhdyxcbiAgZW5jb2RlOiBlbmNvZGUsXG4gIGVuY29kZVJhdzogZW5jb2RlUmF3XG59XG4iLCJleHBvcnQgY29uc3QgQVVUT19MT0NLX1RJTUVPVVRfQUxBUk0gPSAnQVVUT19MT0NLX1RJTUVPVVRfQUxBUk0nO1xuZXhwb3J0IGNvbnN0IE1FVEFNRVRSSUNTX0ZJTkFMSVpFX0VWRU5UX0ZSQUdNRU5UX0FMQVJNID1cbiAgJ01FVEFNRVRSSUNTX0ZJTkFMSVpFX0VWRU5UX0ZSQUdNRU5UX0FMQVJNJztcbiIsImltcG9ydCB7IFNFQ09ORCB9IGZyb20gJy4vdGltZSc7XG5cbmV4cG9ydCBjb25zdCBGQUxMQkFDS19TTUFSVF9UUkFOU0FDVElPTlNfUkVGUkVTSF9USU1FID0gU0VDT05EICogMTA7XG5leHBvcnQgY29uc3QgRkFMTEJBQ0tfU01BUlRfVFJBTlNBQ1RJT05TX0RFQURMSU5FID0gMTgwO1xuZXhwb3J0IGNvbnN0IEZBTExCQUNLX1NNQVJUX1RSQU5TQUNUSU9OU19NQVhfRkVFX01VTFRJUExJRVIgPSAyO1xuIiwiZXhwb3J0IGNvbnN0IEFDVElPTl9RVUVVRV9NRVRSSUNTX0UyRV9URVNUID0gJ2FjdGlvbl9xdWV1ZV9tZXRyaWNzX2UyZV90ZXN0JztcbiIsIi8qKlxuICogQGZpbGUgVGhlIGVudHJ5IHBvaW50IGZvciB0aGUgd2ViIGV4dGVuc2lvbiBzaW5nbGV0b24gcHJvY2Vzcy5cbiAqL1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgZW5kT2ZTdHJlYW0gZnJvbSAnZW5kLW9mLXN0cmVhbSc7XG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdkZWJvdW5jZS1zdHJlYW0nO1xuaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XG5pbXBvcnQgYnJvd3NlciBmcm9tICd3ZWJleHRlbnNpb24tcG9seWZpbGwnO1xuaW1wb3J0IHsgc3RvcmVBc1N0cmVhbSB9IGZyb20gJ0BtZXRhbWFzay9vYnMtc3RvcmUnO1xuaW1wb3J0IFBvcnRTdHJlYW0gZnJvbSAnZXh0ZW5zaW9uLXBvcnQtc3RyZWFtJztcblxuaW1wb3J0IHsgZXRoRXJyb3JzIH0gZnJvbSAnZXRoLXJwYy1lcnJvcnMnO1xuaW1wb3J0IHtcbiAgRU5WSVJPTk1FTlRfVFlQRV9QT1BVUCxcbiAgRU5WSVJPTk1FTlRfVFlQRV9OT1RJRklDQVRJT04sXG4gIEVOVklST05NRU5UX1RZUEVfRlVMTFNDUkVFTixcbiAgRVhURU5TSU9OX01FU1NBR0VTLFxuICBQTEFURk9STV9GSVJFRk9YLFxufSBmcm9tICcuLi8uLi9zaGFyZWQvY29uc3RhbnRzL2FwcCc7XG5pbXBvcnQge1xuICBSRUpFQ1RfTk9USUZJQ0FUSU9OX0NMT1NFLFxuICBSRUpFQ1RfTk9USUZJQ0FUSU9OX0NMT1NFX1NJRyxcbiAgTWV0YU1ldHJpY3NFdmVudENhdGVnb3J5LFxuICBNZXRhTWV0cmljc0V2ZW50TmFtZSxcbiAgTWV0YU1ldHJpY3NVc2VyVHJhaXQsXG59IGZyb20gJy4uLy4uL3NoYXJlZC9jb25zdGFudHMvbWV0YW1ldHJpY3MnO1xuaW1wb3J0IHsgY2hlY2tGb3JMYXN0RXJyb3JBbmRMb2cgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kdWxlcy9icm93c2VyLXJ1bnRpbWUudXRpbHMnO1xuaW1wb3J0IHsgaXNNYW5pZmVzdFYzIH0gZnJvbSAnLi4vLi4vc2hhcmVkL21vZHVsZXMvbXYzLnV0aWxzJztcbmltcG9ydCB7IG1hc2tPYmplY3QgfSBmcm9tICcuLi8uLi9zaGFyZWQvbW9kdWxlcy9vYmplY3QudXRpbHMnO1xuaW1wb3J0IHsgZ2V0RW52aXJvbm1lbnRUeXBlLCBkZWZlcnJlZFByb21pc2UsIGdldFBsYXRmb3JtIH0gZnJvbSAnLi9saWIvdXRpbCc7XG5pbXBvcnQgbWlncmF0aW9ucyBmcm9tICcuL21pZ3JhdGlvbnMnO1xuaW1wb3J0IE1pZ3JhdG9yIGZyb20gJy4vbGliL21pZ3JhdG9yJztcbmltcG9ydCBFeHRlbnNpb25QbGF0Zm9ybSBmcm9tICcuL3BsYXRmb3Jtcy9leHRlbnNpb24nO1xuaW1wb3J0IExvY2FsU3RvcmUgZnJvbSAnLi9saWIvbG9jYWwtc3RvcmUnO1xuaW1wb3J0IFJlYWRPbmx5TmV0d29ya1N0b3JlIGZyb20gJy4vbGliL25ldHdvcmstc3RvcmUnO1xuaW1wb3J0IHsgU0VOVFJZX1NUQVRFIH0gZnJvbSAnLi9saWIvc2V0dXBTZW50cnknO1xuXG5pbXBvcnQgY3JlYXRlU3RyZWFtU2luayBmcm9tICcuL2xpYi9jcmVhdGVTdHJlYW1TaW5rJztcbmltcG9ydCBOb3RpZmljYXRpb25NYW5hZ2VyLCB7XG4gIE5PVElGSUNBVElPTl9NQU5BR0VSX0VWRU5UUyxcbn0gZnJvbSAnLi9saWIvbm90aWZpY2F0aW9uLW1hbmFnZXInO1xuaW1wb3J0IE1ldGFtYXNrQ29udHJvbGxlciwge1xuICBNRVRBTUFTS19DT05UUk9MTEVSX0VWRU5UUyxcbn0gZnJvbSAnLi9tZXRhbWFzay1jb250cm9sbGVyJztcbmltcG9ydCByYXdGaXJzdFRpbWVTdGF0ZSBmcm9tICcuL2ZpcnN0LXRpbWUtc3RhdGUnO1xuaW1wb3J0IGdldEZpcnN0UHJlZmVycmVkTGFuZ0NvZGUgZnJvbSAnLi9saWIvZ2V0LWZpcnN0LXByZWZlcnJlZC1sYW5nLWNvZGUnO1xuaW1wb3J0IGdldE9ialN0cnVjdHVyZSBmcm9tICcuL2xpYi9nZXRPYmpTdHJ1Y3R1cmUnO1xuaW1wb3J0IHNldHVwRW5zSXBmc1Jlc29sdmVyIGZyb20gJy4vbGliL2Vucy1pcGZzL3NldHVwJztcblxuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvZmlyc3QgKi9cblxuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L29yZGVyICovXG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9vcmRlciAqL1xuXG5jb25zdCB7IHNlbnRyeSB9ID0gZ2xvYmFsO1xuY29uc3QgZmlyc3RUaW1lU3RhdGUgPSB7IC4uLnJhd0ZpcnN0VGltZVN0YXRlIH07XG5cbmNvbnN0IG1ldGFtYXNrSW50ZXJuYWxQcm9jZXNzSGFzaCA9IHtcbiAgW0VOVklST05NRU5UX1RZUEVfUE9QVVBdOiB0cnVlLFxuICBbRU5WSVJPTk1FTlRfVFlQRV9OT1RJRklDQVRJT05dOiB0cnVlLFxuICBbRU5WSVJPTk1FTlRfVFlQRV9GVUxMU0NSRUVOXTogdHJ1ZSxcbn07XG5cbmNvbnN0IG1ldGFtYXNrQmxvY2tlZFBvcnRzID0gWyd0cmV6b3ItY29ubmVjdCddO1xuXG5sb2cuc2V0RGVmYXVsdExldmVsKHByb2Nlc3MuZW52Lk1FVEFNQVNLX0RFQlVHID8gJ2RlYnVnJyA6ICdpbmZvJyk7XG5cbmNvbnN0IHBsYXRmb3JtID0gbmV3IEV4dGVuc2lvblBsYXRmb3JtKCk7XG5jb25zdCBub3RpZmljYXRpb25NYW5hZ2VyID0gbmV3IE5vdGlmaWNhdGlvbk1hbmFnZXIoKTtcblxubGV0IHBvcHVwSXNPcGVuID0gZmFsc2U7XG5sZXQgbm90aWZpY2F0aW9uSXNPcGVuID0gZmFsc2U7XG5sZXQgdWlJc1RyaWdnZXJpbmcgPSBmYWxzZTtcbmNvbnN0IG9wZW5NZXRhbWFza1RhYnNJRHMgPSB7fTtcbmNvbnN0IG9wZW5NZXRhbWFza0Nvbm5lY3Rpb25zID0gbmV3IE1hcCgpO1xuY29uc3QgcmVxdWVzdEFjY291bnRUYWJJZHMgPSB7fTtcbmxldCBjb250cm9sbGVyO1xuXG4vLyBzdGF0ZSBwZXJzaXN0ZW5jZVxuY29uc3QgaW5UZXN0ID0gcHJvY2Vzcy5lbnYuSU5fVEVTVDtcbmNvbnN0IGxvY2FsU3RvcmUgPSBpblRlc3QgPyBuZXcgUmVhZE9ubHlOZXR3b3JrU3RvcmUoKSA6IG5ldyBMb2NhbFN0b3JlKCk7XG5sZXQgdmVyc2lvbmVkRGF0YTtcblxuaWYgKGluVGVzdCB8fCBwcm9jZXNzLmVudi5NRVRBTUFTS19ERUJVRykge1xuICBnbG9iYWwuc3RhdGVIb29rcy5tZXRhbWFza0dldFN0YXRlID0gbG9jYWxTdG9yZS5nZXQuYmluZChsb2NhbFN0b3JlKTtcbn1cblxuY29uc3QgcGhpc2hpbmdQYWdlVXJsID0gbmV3IFVSTChwcm9jZXNzLmVudi5QSElTSElOR19XQVJOSU5HX1BBR0VfVVJMKTtcblxuY29uc3QgT05FX1NFQ09ORF9JTl9NSUxMSVNFQ09ORFMgPSAxXzAwMDtcbi8vIFRpbWVvdXQgZm9yIGluaXRpYWxpemluZyBwaGlzaGluZyB3YXJuaW5nIHBhZ2UuXG5jb25zdCBQSElTSElOR19XQVJOSU5HX1BBR0VfVElNRU9VVCA9IE9ORV9TRUNPTkRfSU5fTUlMTElTRUNPTkRTO1xuXG5jb25zdCBBQ0tfS0VFUF9BTElWRV9NRVNTQUdFID0gJ0FDS19LRUVQX0FMSVZFX01FU1NBR0UnO1xuY29uc3QgV09SS0VSX0tFRVBfQUxJVkVfTUVTU0FHRSA9ICdXT1JLRVJfS0VFUF9BTElWRV9NRVNTQUdFJztcblxuXG4vLyBFdmVudCBlbWl0dGVyIGZvciBzdGF0ZSBwZXJzaXN0ZW5jZVxuZXhwb3J0IGNvbnN0IHN0YXRlUGVyc2lzdGVuY2VFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbi8qKlxuICogVGhpcyBkZWZlcnJlZCBQcm9taXNlIGlzIHVzZWQgdG8gdHJhY2sgd2hldGhlciBpbml0aWFsaXphdGlvbiBoYXMgZmluaXNoZWQuXG4gKlxuICogSXQgaXMgdmVyeSBpbXBvcnRhbnQgdG8gZW5zdXJlIHRoYXQgYHJlc29sdmVJbml0aWFsaXphdGlvbmAgaXMgKmFsd2F5cypcbiAqIGNhbGxlZCBvbmNlIGluaXRpYWxpemF0aW9uIGhhcyBjb21wbGV0ZWQsIGFuZCB0aGF0IGByZWplY3RJbml0aWFsaXphdGlvbmAgaXNcbiAqIGNhbGxlZCBpZiBpbml0aWFsaXphdGlvbiBmYWlscyBpbiBhbiB1bnJlY292ZXJhYmxlIHdheS5cbiAqL1xuY29uc3Qge1xuICBwcm9taXNlOiBpc0luaXRpYWxpemVkLFxuICByZXNvbHZlOiByZXNvbHZlSW5pdGlhbGl6YXRpb24sXG4gIHJlamVjdDogcmVqZWN0SW5pdGlhbGl6YXRpb24sXG59ID0gZGVmZXJyZWRQcm9taXNlKCk7XG5cbi8qKlxuICogU2VuZHMgYSBtZXNzYWdlIHRvIHRoZSBkYXBwKHMpIGNvbnRlbnQgc2NyaXB0IHRvIHNpZ25hbCBpdCBjYW4gY29ubmVjdCB0byBNZXRhTWFzayBiYWNrZ3JvdW5kIGFzXG4gKiB0aGUgYmFja2VuZCBpcyBub3QgYWN0aXZlLiBJdCBpcyByZXF1aXJlZCB0byByZS1jb25uZWN0IGRhcHBzIGFmdGVyIHNlcnZpY2Ugd29ya2VyIHJlLWFjdGl2YXRlcy5cbiAqIEZvciBub24tZGFwcCBwYWdlcywgdGhlIG1lc3NhZ2Ugd2lsbCBiZSBzZW50IGFuZCBpZ25vcmVkLlxuICovXG5jb25zdCBzZW5kUmVhZHlNZXNzYWdlVG9UYWJzID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCB0YWJzID0gYXdhaXQgYnJvd3Nlci50YWJzXG4gICAgLnF1ZXJ5KHtcbiAgICAgIC8qKlxuICAgICAgICogT25seSBxdWVyeSB0YWJzIHRoYXQgb3VyIGV4dGVuc2lvbiBjYW4gcnVuIGluLiBUbyBkbyB0aGlzLCB3ZSBxdWVyeSBmb3IgYWxsIFVSTHMgdGhhdCBvdXJcbiAgICAgICAqIGV4dGVuc2lvbiBjYW4gaW5qZWN0IHNjcmlwdHMgaW4sIHdoaWNoIGlzIGJ5IHVzaW5nIHRoZSBcIjxhbGxfdXJscz5cIiB2YWx1ZSBhbmQgX193aXRob3V0X19cbiAgICAgICAqIHRoZSBcInRhYnNcIiBtYW5pZmVzdCBwZXJtaXNzaW9uLiBJZiB3ZSBpbmNsdWRlZCB0aGUgXCJ0YWJzXCIgcGVybWlzc2lvbiwgdGhpcyB3b3VsZCBhbHNvIGZldGNoXG4gICAgICAgKiBVUkxzIHRoYXQgd2UnZCBub3QgYmUgYWJsZSB0byBpbmplY3QgaW4sIGUuZy4gY2hyb21lOi8vcGFnZXMsIGNocm9tZTovL2V4dGVuc2lvbiwgd2hpY2hcbiAgICAgICAqIGlzIG5vdCB3aGF0IHdlJ2Qgd2FudC5cbiAgICAgICAqXG4gICAgICAgKiBZb3UgbWlnaHQgYmUgd29uZGVyaW5nLCBob3cgZG9lcyB0aGUgXCJ1cmxcIiBwYXJhbSB3b3JrIHdpdGhvdXQgdGhlIFwidGFic1wiIHBlcm1pc3Npb24/XG4gICAgICAgKlxuICAgICAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NjYxMzExI2MxfVxuICAgICAgICogIFwiSWYgdGhlIGV4dGVuc2lvbiBoYXMgYWNjZXNzIHRvIGluamVjdCBzY3JpcHRzIGludG8gVGFiLCB0aGVuIHdlIGNhbiByZXR1cm4gdGhlIHVybFxuICAgICAgICogICBvZiBUYWIgKGJlY2F1c2UgdGhlIGV4dGVuc2lvbiBjb3VsZCBqdXN0IGluamVjdCBhIHNjcmlwdCB0byBtZXNzYWdlIHRoZSBsb2NhdGlvbi5ocmVmKS5cIlxuICAgICAgICovXG4gICAgICB1cmw6ICc8YWxsX3VybHM+JyxcbiAgICAgIHdpbmRvd1R5cGU6ICdub3JtYWwnLFxuICAgIH0pXG4gICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgY2hlY2tGb3JMYXN0RXJyb3JBbmRMb2coKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSlcbiAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgY2hlY2tGb3JMYXN0RXJyb3JBbmRMb2coKTtcbiAgICB9KTtcblxuICAvKiogQHRvZG8gd2Ugc2hvdWxkIG9ubHkgc2VuZE1lc3NhZ2UgdG8gZGFwcCB0YWJzLCBub3QgYWxsIHRhYnMuICovXG4gIGZvciAoY29uc3QgdGFiIG9mIHRhYnMpIHtcbiAgICBicm93c2VyLnRhYnNcbiAgICAgIC5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcbiAgICAgICAgbmFtZTogRVhURU5TSU9OX01FU1NBR0VTLlJFQURZLFxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY2hlY2tGb3JMYXN0RXJyb3JBbmRMb2coKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAvLyBBbiBlcnJvciBtYXkgaGFwcGVuIGlmIHRoZSBjb250ZW50c2NyaXB0IGlzIGJsb2NrZWQgZnJvbSBsb2FkaW5nLFxuICAgICAgICAvLyBhbmQgdGh1cyB0aGVyZSBpcyBubyBydW50aW1lLm9uTWVzc2FnZSBoYW5kbGVyIHRvIGxpc3RlbiB0byB0aGUgbWVzc2FnZS5cbiAgICAgICAgY2hlY2tGb3JMYXN0RXJyb3JBbmRMb2coKTtcbiAgICAgIH0pO1xuICB9XG59O1xuXG4vLyBUaGVzZSBhcmUgc2V0IGFmdGVyIGluaXRpYWxpemF0aW9uXG5sZXQgY29ubmVjdFJlbW90ZTtcbmxldCBjb25uZWN0RXh0ZXJuYWw7XG5cbmJyb3dzZXIucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoYXN5bmMgKC4uLmFyZ3MpID0+IHtcbiAgLy8gUXVldWUgdXAgY29ubmVjdGlvbiBhdHRlbXB0cyBoZXJlLCB3YWl0aW5nIHVudGlsIGFmdGVyIGluaXRpYWxpemF0aW9uXG4gIGF3YWl0IGlzSW5pdGlhbGl6ZWQ7XG4gIGNvbnN0IHJlbW90ZVBvcnQgPSBhcmdzWzBdO1xuICBjb25zdCB7IHNlbmRlciB9ID0gcmVtb3RlUG9ydDtcblxuICBjb25zdCB1cmwgPSBzZW5kZXI/LnVybDtcbiAgY29uc3QgZGV0ZWN0ZWRQcm9jZXNzTmFtZSA9IHVybCA/IGdldEVudmlyb25tZW50VHlwZSh1cmwpIDogJyc7XG5cbiAgY29uc3QgY29ubmVjdGlvbklkID0gZ2VuZXJhdGVDb25uZWN0aW9uSWQocmVtb3RlUG9ydCwgZGV0ZWN0ZWRQcm9jZXNzTmFtZSk7XG4gIGNvbnN0IG9wZW5Db25uZWN0aW9ucyA9IG9wZW5NZXRhbWFza0Nvbm5lY3Rpb25zLmdldChjb25uZWN0aW9uSWQpIHx8IDA7XG5cbiAgaWYgKFxuICAgIG9wZW5Db25uZWN0aW9ucyA9PT0gMCB8fFxuICAgIChkZXRlY3RlZFByb2Nlc3NOYW1lID09PSAnYmFja2dyb3VuZCcgJiYgb3BlbkNvbm5lY3Rpb25zIDwgMilcbiAgICAvLyAyIGJhY2tncm91bmQgY29ubmVjdGlvbnMgYXJlIGFsbG93ZWQsIG9uZSBmb3IgcGhpc2hpbmcgd2FybmluZyBwYWdlIGFuZCBvbmUgZm9yIHRoZSBsZWRnZXIgYnJpZGdlIGtleXJpbmdcbiAgKSB7XG4gICAgLy8gVGhpcyBpcyBzZXQgaW4gYHNldHVwQ29udHJvbGxlcmAsIHdoaWNoIGlzIGNhbGxlZCBhcyBwYXJ0IG9mIGluaXRpYWxpemF0aW9uXG4gICAgY29ubmVjdFJlbW90ZSguLi5hcmdzKTtcbiAgICBvcGVuTWV0YW1hc2tDb25uZWN0aW9ucy5zZXQoY29ubmVjdGlvbklkLCBvcGVuQ29ubmVjdGlvbnMgKyAxKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NPTk5FQ1RJT05fQUxSRUFEWV9FWElTVFMnKTtcbiAgfVxufSk7XG5cbmJyb3dzZXIucnVudGltZS5vbkNvbm5lY3RFeHRlcm5hbC5hZGRMaXN0ZW5lcihhc3luYyAoLi4uYXJncykgPT4ge1xuICAvLyBRdWV1ZSB1cCBjb25uZWN0aW9uIGF0dGVtcHRzIGhlcmUsIHdhaXRpbmcgdW50aWwgYWZ0ZXIgaW5pdGlhbGl6YXRpb25cbiAgYXdhaXQgaXNJbml0aWFsaXplZDtcblxuICAvLyBUaGlzIGlzIHNldCBpbiBgc2V0dXBDb250cm9sbGVyYCwgd2hpY2ggaXMgY2FsbGVkIGFzIHBhcnQgb2YgaW5pdGlhbGl6YXRpb25cbiAgY29ubmVjdEV4dGVybmFsKC4uLmFyZ3MpO1xufSk7XG5cbi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnLi4vLi4vc2hhcmVkL2NvbnN0YW50cy90cmFuc2FjdGlvbicpLlRyYW5zYWN0aW9uTWV0YX0gVHJhbnNhY3Rpb25NZXRhXG4gKi9cblxuLyoqXG4gKiBUaGUgZGF0YSBlbWl0dGVkIGZyb20gdGhlIE1ldGFNYXNrQ29udHJvbGxlci5zdG9yZSBFdmVudEVtaXR0ZXIsIGFsc28gdXNlZCB0byBpbml0aWFsaXplIHRoZSBNZXRhTWFza0NvbnRyb2xsZXIuIEF2YWlsYWJsZSBpbiBVSSBvbiBSZWFjdCBzdGF0ZSBhcyBzdGF0ZS5tZXRhbWFzay5cbiAqXG4gKiBAdHlwZWRlZiBNZXRhTWFza1N0YXRlXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGlzSW5pdGlhbGl6ZWQgLSBXaGV0aGVyIHRoZSBmaXJzdCB2YXVsdCBoYXMgYmVlbiBjcmVhdGVkLlxuICogQHByb3BlcnR5IHtib29sZWFufSBpc1VubG9ja2VkIC0gV2hldGhlciB0aGUgdmF1bHQgaXMgY3VycmVudGx5IGRlY3J5cHRlZCBhbmQgYWNjb3VudHMgYXJlIGF2YWlsYWJsZSBmb3Igc2VsZWN0aW9uLlxuICogQHByb3BlcnR5IHtib29sZWFufSBpc0FjY291bnRNZW51T3BlbiAtIFJlcHJlc2VudHMgd2hldGhlciB0aGUgbWFpbiBhY2NvdW50IHNlbGVjdGlvbiBVSSBpcyBjdXJyZW50bHkgZGlzcGxheWVkLlxuICogQHByb3BlcnR5IHtib29sZWFufSBpc05ldHdvcmtNZW51T3BlbiAtIFJlcHJlc2VudHMgd2hldGhlciB0aGUgbWFpbiBuZXR3b3JrIHNlbGVjdGlvbiBVSSBpcyBjdXJyZW50bHkgZGlzcGxheWVkLlxuICogQHByb3BlcnR5IHtvYmplY3R9IGlkZW50aXRpZXMgLSBBbiBvYmplY3QgbWF0Y2hpbmcgbG93ZXItY2FzZSBoZXggYWRkcmVzc2VzIHRvIElkZW50aXR5IG9iamVjdHMgd2l0aCBcImFkZHJlc3NcIiBhbmQgXCJuYW1lXCIgKG5pY2tuYW1lKSBrZXlzLlxuICogQHByb3BlcnR5IHtvYmplY3R9IHVuYXBwcm92ZWRUeHMgLSBBbiBvYmplY3QgbWFwcGluZyB0cmFuc2FjdGlvbiBoYXNoZXMgdG8gdW5hcHByb3ZlZCB0cmFuc2FjdGlvbnMuXG4gKiBAcHJvcGVydHkge29iamVjdH0gbmV0d29ya0NvbmZpZ3VyYXRpb25zIC0gQSBsaXN0IG9mIG5ldHdvcmsgY29uZmlndXJhdGlvbnMsIGNvbnRhaW5pbmcgUlBDIHByb3ZpZGVyIGRldGFpbHMgKGVnIGNoYWluSWQsIHJwY1VybCwgcnBjUHJlZmVyZW5jZXMpLlxuICogQHByb3BlcnR5IHtBcnJheX0gYWRkcmVzc0Jvb2sgLSBBIGxpc3Qgb2YgcHJldmlvdXNseSBzZW50IHRvIGFkZHJlc3Nlcy5cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBjb250cmFjdEV4Y2hhbmdlUmF0ZXMgLSBJbmZvIGFib3V0IGN1cnJlbnQgdG9rZW4gcHJpY2VzLlxuICogQHByb3BlcnR5IHtBcnJheX0gdG9rZW5zIC0gVG9rZW5zIGhlbGQgYnkgdGhlIGN1cnJlbnQgdXNlciwgaW5jbHVkaW5nIHRoZWlyIGJhbGFuY2VzLlxuICogQHByb3BlcnR5IHtvYmplY3R9IHNlbmQgLSBUT0RPOiBEb2N1bWVudFxuICogQHByb3BlcnR5IHtib29sZWFufSB1c2VCbG9ja2llIC0gSW5kaWNhdGVzIHByZWZlcnJlZCB1c2VyIGlkZW50aWNvbiBmb3JtYXQuIFRydWUgZm9yIGJsb2NraWUsIGZhbHNlIGZvciBKYXp6aWNvbi5cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBmZWF0dXJlRmxhZ3MgLSBBbiBvYmplY3QgZm9yIG9wdGlvbmFsIGZlYXR1cmUgZmxhZ3MuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHdlbGNvbWVTY3JlZW4gLSBUcnVlIGlmIHdlbGNvbWUgc2NyZWVuIHNob3VsZCBiZSBzaG93bi5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjdXJyZW50TG9jYWxlIC0gQSBsb2NhbGUgc3RyaW5nIG1hdGNoaW5nIHRoZSB1c2VyJ3MgcHJlZmVycmVkIGRpc3BsYXkgbGFuZ3VhZ2UuXG4gKiBAcHJvcGVydHkge29iamVjdH0gcHJvdmlkZXJDb25maWcgLSBUaGUgY3VycmVudCBzZWxlY3RlZCBuZXR3b3JrIHByb3ZpZGVyLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByb3ZpZGVyQ29uZmlnLnJwY1VybCAtIFRoZSBhZGRyZXNzIGZvciB0aGUgUlBDIEFQSSwgaWYgdXNpbmcgYW4gUlBDIEFQSS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwcm92aWRlckNvbmZpZy50eXBlIC0gQW4gaWRlbnRpZmllciBmb3IgdGhlIHR5cGUgb2YgbmV0d29yayBzZWxlY3RlZCwgYWxsb3dzIE1ldGFNYXNrIHRvIHVzZSBjdXN0b20gcHJvdmlkZXIgc3RyYXRlZ2llcyBmb3Iga25vd24gbmV0d29ya3MuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmV0d29ya0lkIC0gVGhlIHN0cmluZ2lmaWVkIG51bWJlciBvZiB0aGUgY3VycmVudCBuZXR3b3JrIElELlxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5ldHdvcmtTdGF0dXMgLSBFaXRoZXIgXCJ1bmtub3duXCIsIFwiYXZhaWxhYmxlXCIsIFwidW5hdmFpbGFibGVcIiwgb3IgXCJibG9ja2VkXCIsIGRlcGVuZGluZyBvbiB0aGUgc3RhdHVzIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbmV0d29yay5cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBhY2NvdW50cyAtIEFuIG9iamVjdCBtYXBwaW5nIGxvd2VyLWNhc2UgaGV4IGFkZHJlc3NlcyB0byBvYmplY3RzIHdpdGggXCJiYWxhbmNlXCIgYW5kIFwiYWRkcmVzc1wiIGtleXMsIGJvdGggc3RvcmluZyBoZXggc3RyaW5nIHZhbHVlcy5cbiAqIEBwcm9wZXJ0eSB7aGV4fSBjdXJyZW50QmxvY2tHYXNMaW1pdCAtIFRoZSBtb3N0IHJlY2VudGx5IHNlZW4gYmxvY2sgZ2FzIGxpbWl0LCBpbiBhIGxvd2VyIGNhc2UgaGV4IHByZWZpeGVkIHN0cmluZy5cbiAqIEBwcm9wZXJ0eSB7VHJhbnNhY3Rpb25NZXRhW119IGN1cnJlbnROZXR3b3JrVHhMaXN0IC0gQW4gYXJyYXkgb2YgdHJhbnNhY3Rpb25zIGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG5ldHdvcmsuXG4gKiBAcHJvcGVydHkge29iamVjdH0gdW5hcHByb3ZlZE1zZ3MgLSBBbiBvYmplY3Qgb2YgbWVzc2FnZXMgcGVuZGluZyBhcHByb3ZhbCwgbWFwcGluZyBhIHVuaXF1ZSBJRCB0byB0aGUgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bmFwcHJvdmVkTXNnQ291bnQgLSBUaGUgbnVtYmVyIG9mIG1lc3NhZ2VzIGluIHVuYXBwcm92ZWRNc2dzLlxuICogQHByb3BlcnR5IHtvYmplY3R9IHVuYXBwcm92ZWRQZXJzb25hbE1zZ3MgLSBBbiBvYmplY3Qgb2YgbWVzc2FnZXMgcGVuZGluZyBhcHByb3ZhbCwgbWFwcGluZyBhIHVuaXF1ZSBJRCB0byB0aGUgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bmFwcHJvdmVkUGVyc29uYWxNc2dDb3VudCAtIFRoZSBudW1iZXIgb2YgbWVzc2FnZXMgaW4gdW5hcHByb3ZlZFBlcnNvbmFsTXNncy5cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB1bmFwcHJvdmVkRW5jcnlwdGlvblB1YmxpY0tleU1zZ3MgLSBBbiBvYmplY3Qgb2YgbWVzc2FnZXMgcGVuZGluZyBhcHByb3ZhbCwgbWFwcGluZyBhIHVuaXF1ZSBJRCB0byB0aGUgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bmFwcHJvdmVkRW5jcnlwdGlvblB1YmxpY0tleU1zZ0NvdW50IC0gVGhlIG51bWJlciBvZiBtZXNzYWdlcyBpbiBFbmNyeXB0aW9uUHVibGljS2V5TXNncy5cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB1bmFwcHJvdmVkRGVjcnlwdE1zZ3MgLSBBbiBvYmplY3Qgb2YgbWVzc2FnZXMgcGVuZGluZyBhcHByb3ZhbCwgbWFwcGluZyBhIHVuaXF1ZSBJRCB0byB0aGUgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB1bmFwcHJvdmVkRGVjcnlwdE1zZ0NvdW50IC0gVGhlIG51bWJlciBvZiBtZXNzYWdlcyBpbiB1bmFwcHJvdmVkRGVjcnlwdE1zZ3MuXG4gKiBAcHJvcGVydHkge29iamVjdH0gdW5hcHByb3ZlZFR5cGVkTXNncyAtIEFuIG9iamVjdCBvZiBtZXNzYWdlcyBwZW5kaW5nIGFwcHJvdmFsLCBtYXBwaW5nIGEgdW5pcXVlIElEIHRvIHRoZSBvcHRpb25zLlxuICogQHByb3BlcnR5IHtudW1iZXJ9IHVuYXBwcm92ZWRUeXBlZE1zZ0NvdW50IC0gVGhlIG51bWJlciBvZiBtZXNzYWdlcyBpbiB1bmFwcHJvdmVkVHlwZWRNc2dzLlxuICogQHByb3BlcnR5IHtudW1iZXJ9IHBlbmRpbmdBcHByb3ZhbENvdW50IC0gVGhlIG51bWJlciBvZiBwZW5kaW5nIHJlcXVlc3QgaW4gdGhlIGFwcHJvdmFsIGNvbnRyb2xsZXIuXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBrZXlyaW5nVHlwZXMgLSBBbiBhcnJheSBvZiB1bmlxdWUga2V5cmluZyBpZGVudGlmeWluZyBzdHJpbmdzLCByZXByZXNlbnRpbmcgYXZhaWxhYmxlIHN0cmF0ZWdpZXMgZm9yIGNyZWF0aW5nIGFjY291bnRzLlxuICogQHByb3BlcnR5IHtLZXlyaW5nW119IGtleXJpbmdzIC0gQW4gYXJyYXkgb2Yga2V5cmluZyBkZXNjcmlwdGlvbnMsIHN1bW1hcml6aW5nIHRoZSBhY2NvdW50cyB0aGF0IGFyZSBhdmFpbGFibGUgZm9yIHVzZSwgYW5kIHdoYXQga2V5cmluZ3MgdGhleSBiZWxvbmcgdG8uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2VsZWN0ZWRBZGRyZXNzIC0gQSBsb3dlciBjYXNlIGhleCBzdHJpbmcgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBhZGRyZXNzLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGN1cnJlbnRDdXJyZW5jeSAtIEEgc3RyaW5nIGlkZW50aWZ5aW5nIHRoZSB1c2VyJ3MgcHJlZmVycmVkIGRpc3BsYXkgY3VycmVuY3ksIGZvciB1c2UgaW4gc2hvd2luZyBjb252ZXJzaW9uIHJhdGVzLlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGNvbnZlcnNpb25SYXRlIC0gQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IGV4Y2hhbmdlIHJhdGUgZnJvbSB0aGUgdXNlcidzIHByZWZlcnJlZCBjdXJyZW5jeSB0byBFdGhlci5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBjb252ZXJzaW9uRGF0ZSAtIEEgdW5peCBlcG9jaCBkYXRlIChtcykgZm9yIHRoZSB0aW1lIHRoZSBjdXJyZW50IGNvbnZlcnNpb24gcmF0ZSB3YXMgbGFzdCByZXRyaWV2ZWQuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGZvcmdvdHRlblBhc3N3b3JkIC0gUmV0dXJucyB0cnVlIGlmIHRoZSB1c2VyIGhhcyBpbml0aWF0ZWQgdGhlIHBhc3N3b3JkIHJlY292ZXJ5IHNjcmVlbiwgaXMgcmVjb3ZlcmluZyBmcm9tIHNlZWQgcGhyYXNlLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgVmVyc2lvbmVkRGF0YVxuICogQHByb3BlcnR5IHtNZXRhTWFza1N0YXRlfSBkYXRhIC0gVGhlIGRhdGEgZW1pdHRlZCBmcm9tIE1ldGFNYXNrIGNvbnRyb2xsZXIsIG9yIHVzZWQgdG8gaW5pdGlhbGl6ZSBpdC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB2ZXJzaW9uIC0gVGhlIGxhdGVzdCBtaWdyYXRpb24gdmVyc2lvbiB0aGF0IGhhcyBiZWVuIHJ1bi5cbiAqL1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBNZXRhTWFzayBjb250cm9sbGVyLCBhbmQgc2V0cyB1cCBhbGwgcGxhdGZvcm0gY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gU2V0dXAgY29tcGxldGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaW5pdFN0YXRlID0gYXdhaXQgbG9hZFN0YXRlRnJvbVBlcnNpc3RlbmNlKCk7XG4gICAgY29uc3QgaW5pdExhbmdDb2RlID0gYXdhaXQgZ2V0Rmlyc3RQcmVmZXJyZWRMYW5nQ29kZSgpO1xuXG5cbiAgICBsZXQgaXNGaXJzdE1ldGFNYXNrQ29udHJvbGxlclNldHVwO1xuICAgIGlmIChpc01hbmlmZXN0VjMpIHtcbiAgICAgIGNvbnN0IHNlc3Npb25EYXRhID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KFtcbiAgICAgICAgJ2lzRmlyc3RNZXRhTWFza0NvbnRyb2xsZXJTZXR1cCcsXG4gICAgICBdKTtcblxuICAgICAgaXNGaXJzdE1ldGFNYXNrQ29udHJvbGxlclNldHVwID1cbiAgICAgICAgc2Vzc2lvbkRhdGE/LmlzRmlyc3RNZXRhTWFza0NvbnRyb2xsZXJTZXR1cCA9PT0gdW5kZWZpbmVkO1xuICAgICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KHsgaXNGaXJzdE1ldGFNYXNrQ29udHJvbGxlclNldHVwIH0pO1xuICAgIH1cblxuICAgIHNldHVwQ29udHJvbGxlcihcbiAgICAgIGluaXRTdGF0ZSxcbiAgICAgIGluaXRMYW5nQ29kZSxcbiAgICAgIHt9LFxuICAgICAgaXNGaXJzdE1ldGFNYXNrQ29udHJvbGxlclNldHVwLFxuICAgICk7XG4gICAgaWYgKCFpc01hbmlmZXN0VjMpIHtcbiAgICAgIGF3YWl0IGxvYWRQaGlzaGluZ1dhcm5pbmdQYWdlKCk7XG4gICAgfVxuICAgIGF3YWl0IHNlbmRSZWFkeU1lc3NhZ2VUb1RhYnMoKTtcbiAgICBsb2cuaW5mbygnTWV0YU1hc2sgaW5pdGlhbGl6YXRpb24gY29tcGxldGUuJyk7XG4gICAgcmVzb2x2ZUluaXRpYWxpemF0aW9uKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0SW5pdGlhbGl6YXRpb24oZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQW4gZXJyb3IgdGhyb3duIGlmIHRoZSBwaGlzaGluZyB3YXJuaW5nIHBhZ2UgdGFrZXMgdG9vIGxvbmcgdG8gbG9hZC5cbiAqL1xuY2xhc3MgUGhpc2hpbmdXYXJuaW5nUGFnZVRpbWVvdXRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ1RpbWVvdXQgZmFpbGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkIHRoZSBwaGlzaGluZyB3YXJuaW5nIHBhZ2UgdGVtcG9yYXJpbHkgdG8gZW5zdXJlIHRoZSBzZXJ2aWNlXG4gKiB3b3JrZXIgaGFzIGJlZW4gcmVnaXN0ZXJlZCwgc28gdGhhdCB0aGUgd2FybmluZyBwYWdlIHdvcmtzIG9mZmxpbmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQaGlzaGluZ1dhcm5pbmdQYWdlKCkge1xuICBsZXQgaWZyYW1lO1xuICB0cnkge1xuICAgIGNvbnN0IGV4dGVuc2lvblN0YXJ0dXBQaGlzaGluZ1BhZ2VVcmwgPSBuZXcgVVJMKFxuICAgICAgcHJvY2Vzcy5lbnYuUEhJU0hJTkdfV0FSTklOR19QQUdFX1VSTCxcbiAgICApO1xuICAgIC8vIFRoZSBgZXh0ZW5zaW9uU3RhcnR1cGAgaGFzaCBzaWduYWxzIHRvIHRoZSBwaGlzaGluZyB3YXJuaW5nIHBhZ2UgdGhhdCBpdCBzaG91bGQgbm90IGJvdGhlclxuICAgIC8vIHNldHRpbmcgdXAgc3RyZWFtcyBmb3IgdXNlciBpbnRlcmFjdGlvbi4gT3RoZXJ3aXNlIHRoaXMgcGFnZSBsb2FkIHdvdWxkIGNhdXNlIGEgY29uc29sZVxuICAgIC8vIGVycm9yLlxuICAgIGV4dGVuc2lvblN0YXJ0dXBQaGlzaGluZ1BhZ2VVcmwuaGFzaCA9ICcjZXh0ZW5zaW9uU3RhcnR1cCc7XG5cbiAgICBpZnJhbWUgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywgZXh0ZW5zaW9uU3RhcnR1cFBoaXNoaW5nUGFnZVVybC5ocmVmKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzYW5kYm94JywgJ2FsbG93LXNjcmlwdHMgYWxsb3ctc2FtZS1vcmlnaW4nKTtcblxuICAgIC8vIENyZWF0ZSBcImRlZmVycmVkIFByb21pc2VcIiB0byBhbGxvdyBwYXNzaW5nIHJlc29sdmUvcmVqZWN0IHRvIGV2ZW50IGhhbmRsZXJzXG4gICAgbGV0IGRlZmVycmVkUmVzb2x2ZTtcbiAgICBsZXQgZGVmZXJyZWRSZWplY3Q7XG4gICAgY29uc3QgbG9hZENvbXBsZXRlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVmZXJyZWRSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIGRlZmVycmVkUmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIGxvYWQgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIGxvYWRpbmcgaGFzIGNvbXBsZXRlZCwgZXZlbiBpZiB0aGUgbG9hZGluZyBmYWlsZWQuXG4gICAgLy8gSWYgbG9hZGluZyBmYWlsZWQgd2UgY2FuJ3QgZG8gYW55dGhpbmcgYWJvdXQgaXQsIHNvIHdlIGRvbid0IG5lZWQgdG8gY2hlY2suXG4gICAgaWZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBkZWZlcnJlZFJlc29sdmUpO1xuXG4gICAgLy8gVGhpcyBzdGVwIGluaXRpYXRlcyB0aGUgcGFnZSBsb2FkaW5nLlxuICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cbiAgICAvLyBUaGlzIHRpbWVvdXQgZW5zdXJlcyB0aGF0IHRoaXMgaWZyYW1lIGdldHMgY2xlYW5lZCB1cCBpbiBhIHJlYXNvbmFibGVcbiAgICAvLyB0aW1lZnJhbWUsIGFuZCBlbnN1cmVzIHRoYXQgdGhlIFwiaW5pdGlhbGl6YXRpb24gY29tcGxldGVcIiBtZXNzYWdlXG4gICAgLy8gZG9lc24ndCBnZXQgZGVsYXllZCB0b28gbG9uZy5cbiAgICBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4gZGVmZXJyZWRSZWplY3QobmV3IFBoaXNoaW5nV2FybmluZ1BhZ2VUaW1lb3V0RXJyb3IoKSksXG4gICAgICBQSElTSElOR19XQVJOSU5HX1BBR0VfVElNRU9VVCxcbiAgICApO1xuICAgIGF3YWl0IGxvYWRDb21wbGV0ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQaGlzaGluZ1dhcm5pbmdQYWdlVGltZW91dEVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdQaGlzaGluZyB3YXJuaW5nIHBhZ2UgdGltZW91dDsgcGFnZSBub3QgZ3VhcmFuZXRlZWQgdG8gd29yayBvZmZsaW5lLicsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW5pdGlhbGl6ZSBwaGlzaGluZyB3YXJuaW5nIHBhZ2UnLCBlcnJvcik7XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIGlmIChpZnJhbWUpIHtcbiAgICAgIGlmcmFtZS5yZW1vdmUoKTtcbiAgICB9XG4gIH1cbn1cblxuLy9cbi8vIFN0YXRlIGFuZCBQZXJzaXN0ZW5jZVxuLy9cblxuLyoqXG4gKiBMb2FkcyBhbnkgc3RvcmVkIGRhdGEsIHByaW9yaXRpemluZyB0aGUgbGF0ZXN0IHN0b3JhZ2Ugc3RyYXRlZ3kuXG4gKiBNaWdyYXRlcyB0aGF0IGRhdGEgc2NoZW1hIGluIGNhc2UgaXQgd2FzIGxhc3QgbG9hZGVkIG9uIGFuIG9sZGVyIHZlcnNpb24uXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8TWV0YU1hc2tTdGF0ZT59IExhc3QgZGF0YSBlbWl0dGVkIGZyb20gcHJldmlvdXMgaW5zdGFuY2Ugb2YgTWV0YU1hc2suXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkU3RhdGVGcm9tUGVyc2lzdGVuY2UoKSB7XG4gIC8vIG1pZ3JhdGlvbnNcbiAgY29uc3QgbWlncmF0b3IgPSBuZXcgTWlncmF0b3IoeyBtaWdyYXRpb25zIH0pO1xuICBtaWdyYXRvci5vbignZXJyb3InLCBjb25zb2xlLndhcm4pO1xuXG4gIC8vIHJlYWQgZnJvbSBkaXNrXG4gIC8vIGZpcnN0IGZyb20gcHJlZmVycmVkLCBhc3luYyBBUEk6XG4gIHZlcnNpb25lZERhdGEgPVxuICAgIChhd2FpdCBsb2NhbFN0b3JlLmdldCgpKSB8fCBtaWdyYXRvci5nZW5lcmF0ZUluaXRpYWxTdGF0ZShmaXJzdFRpbWVTdGF0ZSk7XG5cbiAgLy8gY2hlY2sgaWYgc29tZWhvdyBzdGF0ZSBpcyBlbXB0eVxuICAvLyB0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4gYnV0IG5ldyBlcnJvciByZXBvcnRpbmcgc3VnZ2VzdHMgdGhhdCBpdCBoYXNcbiAgLy8gZm9yIGEgc21hbGwgbnVtYmVyIG9mIHVzZXJzXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRhbWFzay9tZXRhbWFzay1leHRlbnNpb24vaXNzdWVzLzM5MTlcbiAgaWYgKHZlcnNpb25lZERhdGEgJiYgIXZlcnNpb25lZERhdGEuZGF0YSkge1xuICAgIC8vIHVuYWJsZSB0byByZWNvdmVyLCBjbGVhciBzdGF0ZVxuICAgIHZlcnNpb25lZERhdGEgPSBtaWdyYXRvci5nZW5lcmF0ZUluaXRpYWxTdGF0ZShmaXJzdFRpbWVTdGF0ZSk7XG4gICAgc2VudHJ5LmNhcHR1cmVNZXNzYWdlKCdNZXRhTWFzayAtIEVtcHR5IHZhdWx0IGZvdW5kIC0gdW5hYmxlIHRvIHJlY292ZXInKTtcbiAgfVxuXG4gIC8vIHJlcG9ydCBtaWdyYXRpb24gZXJyb3JzIHRvIHNlbnRyeVxuICBtaWdyYXRvci5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgLy8gZ2V0IHZhdWx0IHN0cnVjdHVyZSB3aXRob3V0IHNlY3JldHNcbiAgICBjb25zdCB2YXVsdFN0cnVjdHVyZSA9IGdldE9ialN0cnVjdHVyZSh2ZXJzaW9uZWREYXRhKTtcbiAgICBzZW50cnkuY2FwdHVyZUV4Y2VwdGlvbihlcnIsIHtcbiAgICAgIC8vIFwiZXh0cmFcIiBrZXkgaXMgcmVxdWlyZWQgYnkgU2VudHJ5XG4gICAgICBleHRyYTogeyB2YXVsdFN0cnVjdHVyZSB9LFxuICAgIH0pO1xuICB9KTtcblxuICAvLyBtaWdyYXRlIGRhdGFcbiAgdmVyc2lvbmVkRGF0YSA9IGF3YWl0IG1pZ3JhdG9yLm1pZ3JhdGVEYXRhKHZlcnNpb25lZERhdGEpO1xuICBpZiAoIXZlcnNpb25lZERhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGFNYXNrIC0gbWlncmF0b3IgcmV0dXJuZWQgdW5kZWZpbmVkJyk7XG4gIH1cbiAgLy8gdGhpcyBpbml0aWFsaXplcyB0aGUgbWV0YS92ZXJzaW9uIGRhdGEgYXMgYSBjbGFzcyB2YXJpYWJsZSB0byBiZSB1c2VkIGZvciBmdXR1cmUgd3JpdGVzXG4gIGxvY2FsU3RvcmUuc2V0TWV0YWRhdGEodmVyc2lvbmVkRGF0YS5tZXRhKTtcblxuICAvLyB3cml0ZSB0byBkaXNrXG4gIGxvY2FsU3RvcmUuc2V0KHZlcnNpb25lZERhdGEuZGF0YSk7XG5cbiAgLy8gcmV0dXJuIGp1c3QgdGhlIGRhdGFcbiAgcmV0dXJuIHZlcnNpb25lZERhdGEuZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVDb25uZWN0aW9uSWQocmVtb3RlUG9ydCwgZGV0ZWN0ZWRQcm9jZXNzTmFtZSkge1xuICBjb25zdCB7IHNlbmRlciB9ID0gcmVtb3RlUG9ydDtcbiAgY29uc3QgaWQgPSBzZW5kZXI/LnRhYiA/IHNlbmRlci50YWIuaWQgOiBzZW5kZXI/LmlkO1xuICBpZiAoIWlkIHx8ICFkZXRlY3RlZFByb2Nlc3NOYW1lKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICdNdXN0IHByb3ZpZGUgaWQgYW5kIGRldGVjdGVkUHJvY2Vzc05hbWUgdG8gZ2VuZXJhdGUgY29ubmVjdGlvbiBpZC4nLFxuICAgICAgaWQsXG4gICAgICBkZXRlY3RlZFByb2Nlc3NOYW1lLFxuICAgICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdNdXN0IHByb3ZpZGUgaWQgYW5kIGRldGVjdGVkUHJvY2Vzc05hbWUgdG8gZ2VuZXJhdGUgY29ubmVjdGlvbiBpZC4nLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGAke2lkfS0ke2RldGVjdGVkUHJvY2Vzc05hbWV9YDtcbn1cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhlIE1ldGFNYXNrIENvbnRyb2xsZXIgd2l0aCBhbnkgaW5pdGlhbCBzdGF0ZSBhbmQgZGVmYXVsdCBsYW5ndWFnZS5cbiAqIENvbmZpZ3VyZXMgcGxhdGZvcm0tc3BlY2lmaWMgZXJyb3IgcmVwb3J0aW5nIHN0cmF0ZWd5LlxuICogU3RyZWFtcyBlbWl0dGVkIHN0YXRlIHVwZGF0ZXMgdG8gcGxhdGZvcm0tc3BlY2lmaWMgc3RvcmFnZSBzdHJhdGVneS5cbiAqIENyZWF0ZXMgcGxhdGZvcm0gbGlzdGVuZXJzIGZvciBuZXcgRGFwcHMvQ29udGV4dHMsIGFuZCBzZXRzIHVwIHRoZWlyIGRhdGEgY29ubmVjdGlvbnMgdG8gdGhlIGNvbnRyb2xsZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGluaXRTdGF0ZSAtIFRoZSBpbml0aWFsIHN0YXRlIHRvIHN0YXJ0IHRoZSBjb250cm9sbGVyIHdpdGgsIG1hdGNoZXMgdGhlIHN0YXRlIHRoYXQgaXMgZW1pdHRlZCBmcm9tIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IGluaXRMYW5nQ29kZSAtIFRoZSByZWdpb24gY29kZSBmb3IgdGhlIGxhbmd1YWdlIHByZWZlcnJlZCBieSB0aGUgY3VycmVudCB1c2VyLlxuICogQHBhcmFtIHtvYmplY3R9IG92ZXJyaWRlcyAtIG9iamVjdCB3aXRoIGNhbGxiYWNrcyB0aGF0IGFyZSBhbGxvd2VkIHRvIG92ZXJyaWRlIHRoZSBzZXR1cCBjb250cm9sbGVyIGxvZ2ljICh1c2VmdWxsIGZvciBkZXNrdG9wIGFwcClcbiAqIEBwYXJhbSBpc0ZpcnN0TWV0YU1hc2tDb250cm9sbGVyU2V0dXBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQ29udHJvbGxlcihcbiAgaW5pdFN0YXRlLFxuICBpbml0TGFuZ0NvZGUsXG4gIG92ZXJyaWRlcyxcbiAgaXNGaXJzdE1ldGFNYXNrQ29udHJvbGxlclNldHVwLFxuKSB7XG4gIC8vXG4gIC8vIE1ldGFNYXNrIENvbnRyb2xsZXJcbiAgLy9cblxuICBjb250cm9sbGVyID0gbmV3IE1ldGFtYXNrQ29udHJvbGxlcih7XG4gICAgaW5mdXJhUHJvamVjdElkOiBwcm9jZXNzLmVudi5JTkZVUkFfUFJPSkVDVF9JRCxcbiAgICAvLyBVc2VyIGNvbmZpcm1hdGlvbiBjYWxsYmFja3M6XG4gICAgc2hvd1VzZXJDb25maXJtYXRpb246IHRyaWdnZXJVaSxcbiAgICAvLyBpbml0aWFsIHN0YXRlXG4gICAgaW5pdFN0YXRlLFxuICAgIC8vIGluaXRpYWwgbG9jYWxlIGNvZGVcbiAgICBpbml0TGFuZ0NvZGUsXG4gICAgLy8gcGxhdGZvcm0gc3BlY2lmaWMgYXBpXG4gICAgcGxhdGZvcm0sXG4gICAgbm90aWZpY2F0aW9uTWFuYWdlcixcbiAgICBicm93c2VyLFxuICAgIGdldFJlcXVlc3RBY2NvdW50VGFiSWRzOiAoKSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdEFjY291bnRUYWJJZHM7XG4gICAgfSxcbiAgICBnZXRPcGVuTWV0YW1hc2tUYWJzSWRzOiAoKSA9PiB7XG4gICAgICByZXR1cm4gb3Blbk1ldGFtYXNrVGFic0lEcztcbiAgICB9LFxuICAgIGxvY2FsU3RvcmUsXG4gICAgb3ZlcnJpZGVzLFxuICAgIGlzRmlyc3RNZXRhTWFza0NvbnRyb2xsZXJTZXR1cCxcbiAgfSk7XG5cbiAgc2V0dXBFbnNJcGZzUmVzb2x2ZXIoe1xuICAgIGdldEN1cnJlbnRDaGFpbklkOiAoKSA9PlxuICAgICAgY29udHJvbGxlci5uZXR3b3JrQ29udHJvbGxlci5zdG9yZS5nZXRTdGF0ZSgpLnByb3ZpZGVyQ29uZmlnLmNoYWluSWQsXG4gICAgZ2V0SXBmc0dhdGV3YXk6IGNvbnRyb2xsZXIucHJlZmVyZW5jZXNDb250cm9sbGVyLmdldElwZnNHYXRld2F5LmJpbmQoXG4gICAgICBjb250cm9sbGVyLnByZWZlcmVuY2VzQ29udHJvbGxlcixcbiAgICApLFxuICAgIHByb3ZpZGVyOiBjb250cm9sbGVyLnByb3ZpZGVyLFxuICB9KTtcblxuICAvLyBzZXR1cCBzdGF0ZSBwZXJzaXN0ZW5jZVxuICBwdW1wKFxuICAgIHN0b3JlQXNTdHJlYW0oY29udHJvbGxlci5zdG9yZSksXG4gICAgZGVib3VuY2UoMTAwMCksXG4gICAgY3JlYXRlU3RyZWFtU2luayhhc3luYyAoc3RhdGUpID0+IHtcbiAgICAgIGF3YWl0IGxvY2FsU3RvcmUuc2V0KHN0YXRlKTtcbiAgICAgIHN0YXRlUGVyc2lzdGVuY2VFdmVudHMuZW1pdCgnc3RhdGUtcGVyc2lzdGVkJywgc3RhdGUpO1xuICAgIH0pLFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgbG9nLmVycm9yKCdNZXRhTWFzayAtIFBlcnNpc3RlbmNlIHBpcGVsaW5lIGZhaWxlZCcsIGVycm9yKTtcbiAgICB9LFxuICApO1xuXG4gIHNldHVwU2VudHJ5R2V0U3RhdGVHbG9iYWwoY29udHJvbGxlcik7XG5cbiAgY29uc3QgaXNDbGllbnRPcGVuU3RhdHVzID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICBwb3B1cElzT3BlbiB8fFxuICAgICAgQm9vbGVhbihPYmplY3Qua2V5cyhvcGVuTWV0YW1hc2tUYWJzSURzKS5sZW5ndGgpIHx8XG4gICAgICBub3RpZmljYXRpb25Jc09wZW5cbiAgICApO1xuICB9O1xuXG4gIGNvbnN0IG9uQ2xvc2VFbnZpcm9ubWVudEluc3RhbmNlcyA9IChpc0NsaWVudE9wZW4sIGVudmlyb25tZW50VHlwZSkgPT4ge1xuICAgIC8vIGlmIGFsbCBpbnN0YW5jZXMgb2YgbWV0YW1hc2sgYXJlIGNsb3NlZCB3ZSBjYWxsIGEgbWV0aG9kIG9uIHRoZSBjb250cm9sbGVyIHRvIHN0b3AgZ2FzRmVlQ29udHJvbGxlciBwb2xsaW5nXG4gICAgaWYgKGlzQ2xpZW50T3BlbiA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnRyb2xsZXIub25DbGllbnRDbG9zZWQoKTtcbiAgICAgIC8vIG90aGVyd2lzZSB3ZSB3YW50IHRvIG9ubHkgcmVtb3ZlIHRoZSBwb2xsaW5nIHRva2VucyBmb3IgdGhlIGVudmlyb25tZW50IHR5cGUgdGhhdCBoYXMgY2xvc2VkXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGluIHRoZSBjYXNlIG9mIGZ1bGxzY3JlZW4gZW52aXJvbm1lbnQgYSB1c2VyIG1pZ2h0IGhhdmUgbXVsdGlwbGUgdGFicyBvcGVuIHNvIHdlIGRvbid0IHdhbnQgdG8gZGlzY29ubmVjdCBhbGwgb2ZcbiAgICAgIC8vIGl0cyBjb3JyZXNwb25kaW5nIHBvbGxpbmcgdG9rZW5zIHVubGVzcyBhbGwgdGFicyBhcmUgY2xvc2VkLlxuICAgICAgaWYgKFxuICAgICAgICBlbnZpcm9ubWVudFR5cGUgPT09IEVOVklST05NRU5UX1RZUEVfRlVMTFNDUkVFTiAmJlxuICAgICAgICBCb29sZWFuKE9iamVjdC5rZXlzKG9wZW5NZXRhbWFza1RhYnNJRHMpLmxlbmd0aClcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb250cm9sbGVyLm9uRW52aXJvbm1lbnRUeXBlQ2xvc2VkKGVudmlyb25tZW50VHlwZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBBIHJ1bnRpbWUuUG9ydCBvYmplY3QsIGFzIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyOlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvcnVudGltZS9Qb3J0XG4gICAqIEB0eXBlZGVmIFBvcnRcbiAgICogQHR5cGUgT2JqZWN0XG4gICAqL1xuXG4gIC8qKlxuICAgKiBDb25uZWN0cyBhIFBvcnQgdG8gdGhlIE1ldGFNYXNrIGNvbnRyb2xsZXIgdmlhIGEgbXVsdGlwbGV4ZWQgZHVwbGV4IHN0cmVhbS5cbiAgICogVGhpcyBtZXRob2QgaWRlbnRpZmllcyB0cnVzdGVkIChNZXRhTWFzaykgaW50ZXJmYWNlcywgYW5kIGNvbm5lY3RzIHRoZW0gZGlmZmVyZW50bHkgZnJvbSB1bnRydXN0ZWQgKHdlYiBwYWdlcykuXG4gICAqXG4gICAqIEBwYXJhbSB7UG9ydH0gcmVtb3RlUG9ydCAtIFRoZSBwb3J0IHByb3ZpZGVkIGJ5IGEgbmV3IGNvbnRleHQuXG4gICAqL1xuICBjb25uZWN0UmVtb3RlID0gYXN5bmMgKHJlbW90ZVBvcnQpID0+IHtcblxuICAgIGNvbnN0IHByb2Nlc3NOYW1lID0gcmVtb3RlUG9ydC5uYW1lO1xuXG4gICAgaWYgKG1ldGFtYXNrQmxvY2tlZFBvcnRzLmluY2x1ZGVzKHJlbW90ZVBvcnQubmFtZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgaXNNZXRhTWFza0ludGVybmFsUHJvY2VzcyA9IGZhbHNlO1xuICAgIGNvbnN0IHNvdXJjZVBsYXRmb3JtID0gZ2V0UGxhdGZvcm0oKTtcbiAgICBjb25zdCBzZW5kZXJVcmwgPSByZW1vdGVQb3J0LnNlbmRlcj8udXJsXG4gICAgICA/IG5ldyBVUkwocmVtb3RlUG9ydC5zZW5kZXIudXJsKVxuICAgICAgOiBudWxsO1xuXG4gICAgaWYgKHNvdXJjZVBsYXRmb3JtID09PSBQTEFURk9STV9GSVJFRk9YKSB7XG4gICAgICBpc01ldGFNYXNrSW50ZXJuYWxQcm9jZXNzID0gbWV0YW1hc2tJbnRlcm5hbFByb2Nlc3NIYXNoW3Byb2Nlc3NOYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNNZXRhTWFza0ludGVybmFsUHJvY2VzcyA9XG4gICAgICAgIHNlbmRlclVybD8ub3JpZ2luID09PSBgY2hyb21lLWV4dGVuc2lvbjovLyR7YnJvd3Nlci5ydW50aW1lLmlkfWA7XG4gICAgfVxuXG4gICAgaWYgKGlzTWV0YU1hc2tJbnRlcm5hbFByb2Nlc3MpIHtcbiAgICAgIGNvbnN0IHBvcnRTdHJlYW0gPVxuICAgICAgICBvdmVycmlkZXM/LmdldFBvcnRTdHJlYW0/LihyZW1vdGVQb3J0KSB8fCBuZXcgUG9ydFN0cmVhbShyZW1vdGVQb3J0KTtcbiAgICAgIC8vIGNvbW11bmljYXRpb24gd2l0aCBwb3B1cFxuICAgICAgY29udHJvbGxlci5pc0NsaWVudE9wZW4gPSB0cnVlO1xuICAgICAgY29udHJvbGxlci5zZXR1cFRydXN0ZWRDb21tdW5pY2F0aW9uKHBvcnRTdHJlYW0sIHJlbW90ZVBvcnQuc2VuZGVyKTtcbiAgICAgIGlmIChpc01hbmlmZXN0VjMpIHtcbiAgICAgICAgLy8gSWYgd2UgZ2V0IGEgV09SS0VSX0tFRVBfQUxJVkUgbWVzc2FnZSwgd2UgcmVzcG9uZCB3aXRoIGFuIEFDS1xuICAgICAgICByZW1vdGVQb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSkgPT4ge1xuICAgICAgICAgIGlmIChtZXNzYWdlLm5hbWUgPT09IFdPUktFUl9LRUVQX0FMSVZFX01FU1NBR0UpIHtcbiAgICAgICAgICAgIC8vIFRvIHRlc3QgdW4tY29tbWVudCB0aGlzIGxpbmUgYW5kIHdhaXQgZm9yIDEgbWludXRlLiBBbiBlcnJvciBzaG91bGQgYmUgc2hvd24gb24gTWV0YU1hc2sgVUkuXG4gICAgICAgICAgICByZW1vdGVQb3J0LnBvc3RNZXNzYWdlKHsgbmFtZTogQUNLX0tFRVBfQUxJVkVfTUVTU0FHRSB9KTtcblxuICAgICAgICAgICAgY29udHJvbGxlci5hcHBTdGF0ZUNvbnRyb2xsZXIuc2V0U2VydmljZVdvcmtlckxhc3RBY3RpdmVUaW1lKFxuICAgICAgICAgICAgICBEYXRlLm5vdygpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb25uZWN0aW9uSWQgPSBnZW5lcmF0ZUNvbm5lY3Rpb25JZChyZW1vdGVQb3J0LCBwcm9jZXNzTmFtZSk7XG4gICAgICBpZiAocHJvY2Vzc05hbWUgPT09IEVOVklST05NRU5UX1RZUEVfUE9QVVApIHtcbiAgICAgICAgcG9wdXBJc09wZW4gPSB0cnVlO1xuICAgICAgICBlbmRPZlN0cmVhbShwb3J0U3RyZWFtLCAoKSA9PiB7XG4gICAgICAgICAgb3Blbk1ldGFtYXNrQ29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb25JZCwgMCk7XG4gICAgICAgICAgcG9wdXBJc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICBjb25zdCBpc0NsaWVudE9wZW4gPSBpc0NsaWVudE9wZW5TdGF0dXMoKTtcbiAgICAgICAgICBjb250cm9sbGVyLmlzQ2xpZW50T3BlbiA9IGlzQ2xpZW50T3BlbjtcbiAgICAgICAgICBvbkNsb3NlRW52aXJvbm1lbnRJbnN0YW5jZXMoaXNDbGllbnRPcGVuLCBFTlZJUk9OTUVOVF9UWVBFX1BPUFVQKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9jZXNzTmFtZSA9PT0gRU5WSVJPTk1FTlRfVFlQRV9OT1RJRklDQVRJT04pIHtcbiAgICAgICAgbm90aWZpY2F0aW9uSXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgZW5kT2ZTdHJlYW0ocG9ydFN0cmVhbSwgKCkgPT4ge1xuICAgICAgICAgIG9wZW5NZXRhbWFza0Nvbm5lY3Rpb25zLnNldChjb25uZWN0aW9uSWQsIDApO1xuICAgICAgICAgIG5vdGlmaWNhdGlvbklzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgIGNvbnN0IGlzQ2xpZW50T3BlbiA9IGlzQ2xpZW50T3BlblN0YXR1cygpO1xuICAgICAgICAgIGNvbnRyb2xsZXIuaXNDbGllbnRPcGVuID0gaXNDbGllbnRPcGVuO1xuICAgICAgICAgIG9uQ2xvc2VFbnZpcm9ubWVudEluc3RhbmNlcyhcbiAgICAgICAgICAgIGlzQ2xpZW50T3BlbixcbiAgICAgICAgICAgIEVOVklST05NRU5UX1RZUEVfTk9USUZJQ0FUSU9OLFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvY2Vzc05hbWUgPT09IEVOVklST05NRU5UX1RZUEVfRlVMTFNDUkVFTikge1xuICAgICAgICBjb25zdCB0YWJJZCA9IHJlbW90ZVBvcnQuc2VuZGVyLnRhYi5pZDtcbiAgICAgICAgb3Blbk1ldGFtYXNrVGFic0lEc1t0YWJJZF0gPSB0cnVlO1xuXG4gICAgICAgIGVuZE9mU3RyZWFtKHBvcnRTdHJlYW0sICgpID0+IHtcbiAgICAgICAgICBvcGVuTWV0YW1hc2tDb25uZWN0aW9ucy5zZXQoY29ubmVjdGlvbklkLCAwKTtcbiAgICAgICAgICBkZWxldGUgb3Blbk1ldGFtYXNrVGFic0lEc1t0YWJJZF07XG4gICAgICAgICAgY29uc3QgaXNDbGllbnRPcGVuID0gaXNDbGllbnRPcGVuU3RhdHVzKCk7XG4gICAgICAgICAgY29udHJvbGxlci5pc0NsaWVudE9wZW4gPSBpc0NsaWVudE9wZW47XG4gICAgICAgICAgb25DbG9zZUVudmlyb25tZW50SW5zdGFuY2VzKFxuICAgICAgICAgICAgaXNDbGllbnRPcGVuLFxuICAgICAgICAgICAgRU5WSVJPTk1FTlRfVFlQRV9GVUxMU0NSRUVOLFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzZW5kZXJVcmwgJiZcbiAgICAgIHNlbmRlclVybC5vcmlnaW4gPT09IHBoaXNoaW5nUGFnZVVybC5vcmlnaW4gJiZcbiAgICAgIHNlbmRlclVybC5wYXRobmFtZSA9PT0gcGhpc2hpbmdQYWdlVXJsLnBhdGhuYW1lXG4gICAgKSB7XG4gICAgICBjb25zdCBwb3J0U3RyZWFtID1cbiAgICAgICAgb3ZlcnJpZGVzPy5nZXRQb3J0U3RyZWFtPy4ocmVtb3RlUG9ydCkgfHwgbmV3IFBvcnRTdHJlYW0ocmVtb3RlUG9ydCk7XG4gICAgICBjb250cm9sbGVyLnNldHVwUGhpc2hpbmdDb21tdW5pY2F0aW9uKHtcbiAgICAgICAgY29ubmVjdGlvblN0cmVhbTogcG9ydFN0cmVhbSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocmVtb3RlUG9ydC5zZW5kZXIgJiYgcmVtb3RlUG9ydC5zZW5kZXIudGFiICYmIHJlbW90ZVBvcnQuc2VuZGVyLnVybCkge1xuICAgICAgICBjb25zdCB0YWJJZCA9IHJlbW90ZVBvcnQuc2VuZGVyLnRhYi5pZDtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZW1vdGVQb3J0LnNlbmRlci51cmwpO1xuICAgICAgICBjb25zdCB7IG9yaWdpbiB9ID0gdXJsO1xuXG4gICAgICAgIHJlbW90ZVBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChtc2cpID0+IHtcbiAgICAgICAgICBpZiAobXNnLmRhdGEgJiYgbXNnLmRhdGEubWV0aG9kID09PSAnZXRoX3JlcXVlc3RBY2NvdW50cycpIHtcbiAgICAgICAgICAgIHJlcXVlc3RBY2NvdW50VGFiSWRzW29yaWdpbl0gPSB0YWJJZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgY29ubmVjdEV4dGVybmFsKHJlbW90ZVBvcnQpO1xuICAgIH1cbiAgfTtcblxuICAvLyBjb21tdW5pY2F0aW9uIHdpdGggcGFnZSBvciBvdGhlciBleHRlbnNpb25cbiAgY29ubmVjdEV4dGVybmFsID0gKHJlbW90ZVBvcnQpID0+IHtcblxuICAgIGNvbnN0IHBvcnRTdHJlYW0gPVxuICAgICAgb3ZlcnJpZGVzPy5nZXRQb3J0U3RyZWFtPy4ocmVtb3RlUG9ydCkgfHwgbmV3IFBvcnRTdHJlYW0ocmVtb3RlUG9ydCk7XG4gICAgY29udHJvbGxlci5zZXR1cFVudHJ1c3RlZENvbW11bmljYXRpb24oe1xuICAgICAgY29ubmVjdGlvblN0cmVhbTogcG9ydFN0cmVhbSxcbiAgICAgIHNlbmRlcjogcmVtb3RlUG9ydC5zZW5kZXIsXG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKG92ZXJyaWRlcz8ucmVnaXN0ZXJDb25uZWN0TGlzdGVuZXJzKSB7XG4gICAgb3ZlcnJpZGVzLnJlZ2lzdGVyQ29ubmVjdExpc3RlbmVycyhjb25uZWN0UmVtb3RlLCBjb25uZWN0RXh0ZXJuYWwpO1xuICB9XG5cbiAgLy9cbiAgLy8gVXNlciBJbnRlcmZhY2Ugc2V0dXBcbiAgLy9cblxuICBjb250cm9sbGVyLnR4Q29udHJvbGxlci5pbml0QXBwcm92YWxzKCkudGhlbigoKSA9PiB7XG4gICAgdXBkYXRlQmFkZ2UoKTtcbiAgfSk7XG4gIGNvbnRyb2xsZXIudHhDb250cm9sbGVyLm9uKFxuICAgIE1FVEFNQVNLX0NPTlRST0xMRVJfRVZFTlRTLlVQREFURV9CQURHRSxcbiAgICB1cGRhdGVCYWRnZSxcbiAgKTtcbiAgY29udHJvbGxlci5kZWNyeXB0TWVzc2FnZUNvbnRyb2xsZXIuaHViLm9uKFxuICAgIE1FVEFNQVNLX0NPTlRST0xMRVJfRVZFTlRTLlVQREFURV9CQURHRSxcbiAgICB1cGRhdGVCYWRnZSxcbiAgKTtcbiAgY29udHJvbGxlci5lbmNyeXB0aW9uUHVibGljS2V5Q29udHJvbGxlci5odWIub24oXG4gICAgTUVUQU1BU0tfQ09OVFJPTExFUl9FVkVOVFMuVVBEQVRFX0JBREdFLFxuICAgIHVwZGF0ZUJhZGdlLFxuICApO1xuICBjb250cm9sbGVyLnNpZ25hdHVyZUNvbnRyb2xsZXIuaHViLm9uKFxuICAgIE1FVEFNQVNLX0NPTlRST0xMRVJfRVZFTlRTLlVQREFURV9CQURHRSxcbiAgICB1cGRhdGVCYWRnZSxcbiAgKTtcbiAgY29udHJvbGxlci5hcHBTdGF0ZUNvbnRyb2xsZXIub24oXG4gICAgTUVUQU1BU0tfQ09OVFJPTExFUl9FVkVOVFMuVVBEQVRFX0JBREdFLFxuICAgIHVwZGF0ZUJhZGdlLFxuICApO1xuXG4gIGNvbnRyb2xsZXIuY29udHJvbGxlck1lc3Nlbmdlci5zdWJzY3JpYmUoXG4gICAgTUVUQU1BU0tfQ09OVFJPTExFUl9FVkVOVFMuQVBQUk9WQUxfU1RBVEVfQ0hBTkdFLFxuICAgIHVwZGF0ZUJhZGdlLFxuICApO1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBXZWIgRXh0ZW5zaW9uJ3MgXCJiYWRnZVwiIG51bWJlciwgb24gdGhlIGxpdHRsZSBmb3ggaW4gdGhlIHRvb2xiYXIuXG4gICAqIFRoZSBudW1iZXIgcmVmbGVjdHMgdGhlIGN1cnJlbnQgbnVtYmVyIG9mIHBlbmRpbmcgdHJhbnNhY3Rpb25zIG9yIG1lc3NhZ2Ugc2lnbmF0dXJlcyBuZWVkaW5nIHVzZXIgYXBwcm92YWwuXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVCYWRnZSgpIHtcbiAgICBsZXQgbGFiZWwgPSAnJztcbiAgICBjb25zdCBjb3VudCA9IGdldFVuYXBwcm92ZWRUcmFuc2FjdGlvbkNvdW50KCk7XG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBsYWJlbCA9IFN0cmluZyhjb3VudCk7XG4gICAgfVxuICAgIC8vIGJyb3dzZXJBY3Rpb24gaGFzIGJlZW4gcmVwbGFjZWQgYnkgYWN0aW9uIGluIE1WM1xuICAgIGlmIChpc01hbmlmZXN0VjMpIHtcbiAgICAgIGJyb3dzZXIuYWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6IGxhYmVsIH0pO1xuICAgICAgYnJvd3Nlci5hY3Rpb24uc2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3IoeyBjb2xvcjogJyMwMzdERDYnIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBicm93c2VyLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogbGFiZWwgfSk7XG4gICAgICBicm93c2VyLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3IoeyBjb2xvcjogJyMwMzdERDYnIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFVuYXBwcm92ZWRUcmFuc2FjdGlvbkNvdW50KCkge1xuICAgIGNvbnN0IHBlbmRpbmdBcHByb3ZhbENvdW50ID1cbiAgICAgIGNvbnRyb2xsZXIuYXBwcm92YWxDb250cm9sbGVyLmdldFRvdGFsQXBwcm92YWxDb3VudCgpO1xuICAgIGNvbnN0IHdhaXRpbmdGb3JVbmxvY2tDb3VudCA9XG4gICAgICBjb250cm9sbGVyLmFwcFN0YXRlQ29udHJvbGxlci53YWl0aW5nRm9yVW5sb2NrLmxlbmd0aDtcbiAgICByZXR1cm4gcGVuZGluZ0FwcHJvdmFsQ291bnQgKyB3YWl0aW5nRm9yVW5sb2NrQ291bnQ7XG4gIH1cblxuICBub3RpZmljYXRpb25NYW5hZ2VyLm9uKFxuICAgIE5PVElGSUNBVElPTl9NQU5BR0VSX0VWRU5UUy5QT1BVUF9DTE9TRUQsXG4gICAgKHsgYXV0b21hdGljYWxseUNsb3NlZCB9KSA9PiB7XG4gICAgICBpZiAoIWF1dG9tYXRpY2FsbHlDbG9zZWQpIHtcbiAgICAgICAgcmVqZWN0VW5hcHByb3ZlZE5vdGlmaWNhdGlvbnMoKTtcbiAgICAgIH0gZWxzZSBpZiAoZ2V0VW5hcHByb3ZlZFRyYW5zYWN0aW9uQ291bnQoKSA+IDApIHtcbiAgICAgICAgdHJpZ2dlclVpKCk7XG4gICAgICB9XG4gICAgfSxcbiAgKTtcblxuICBmdW5jdGlvbiByZWplY3RVbmFwcHJvdmVkTm90aWZpY2F0aW9ucygpIHtcbiAgICBPYmplY3Qua2V5cyhcbiAgICAgIGNvbnRyb2xsZXIudHhDb250cm9sbGVyLnR4U3RhdGVNYW5hZ2VyLmdldFVuYXBwcm92ZWRUeExpc3QoKSxcbiAgICApLmZvckVhY2goKHR4SWQpID0+XG4gICAgICBjb250cm9sbGVyLnR4Q29udHJvbGxlci50eFN0YXRlTWFuYWdlci5zZXRUeFN0YXR1c1JlamVjdGVkKHR4SWQpLFxuICAgICk7XG4gICAgY29udHJvbGxlci5zaWduYXR1cmVDb250cm9sbGVyLnJlamVjdFVuYXBwcm92ZWQoXG4gICAgICBSRUpFQ1RfTk9USUZJQ0FUSU9OX0NMT1NFX1NJRyxcbiAgICApO1xuICAgIGNvbnRyb2xsZXIuZGVjcnlwdE1lc3NhZ2VDb250cm9sbGVyLnJlamVjdFVuYXBwcm92ZWQoXG4gICAgICBSRUpFQ1RfTk9USUZJQ0FUSU9OX0NMT1NFLFxuICAgICk7XG4gICAgY29udHJvbGxlci5lbmNyeXB0aW9uUHVibGljS2V5Q29udHJvbGxlci5yZWplY3RVbmFwcHJvdmVkKFxuICAgICAgUkVKRUNUX05PVElGSUNBVElPTl9DTE9TRSxcbiAgICApO1xuXG4gICAgLy8gRmluYWxseSwgcmVzb2x2ZSBzbmFwIGRpYWxvZyBhcHByb3ZhbHMgb24gRmxhc2sgYW5kIHJlamVjdCBhbGwgdGhlIG90aGVycyBtYW5hZ2VkIGJ5IHRoZSBBcHByb3ZhbENvbnRyb2xsZXIuXG4gICAgT2JqZWN0LnZhbHVlcyhjb250cm9sbGVyLmFwcHJvdmFsQ29udHJvbGxlci5zdGF0ZS5wZW5kaW5nQXBwcm92YWxzKS5mb3JFYWNoKFxuICAgICAgKHsgaWQsIHR5cGUgfSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29udHJvbGxlci5hcHByb3ZhbENvbnRyb2xsZXIucmVqZWN0KFxuICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgZXRoRXJyb3JzLnByb3ZpZGVyLnVzZXJSZWplY3RlZFJlcXVlc3QoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuXG4gICAgdXBkYXRlQmFkZ2UoKTtcbiAgfVxuXG59XG5cbi8vXG4vLyBFdGMuLi5cbi8vXG5cbi8qKlxuICogT3BlbnMgdGhlIGJyb3dzZXIgcG9wdXAgZm9yIHVzZXIgY29uZmlybWF0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyaWdnZXJVaSgpIHtcbiAgY29uc3QgdGFicyA9IGF3YWl0IHBsYXRmb3JtLmdldEFjdGl2ZVRhYnMoKTtcbiAgY29uc3QgY3VycmVudGx5QWN0aXZlTWV0YW1hc2tUYWIgPSBCb29sZWFuKFxuICAgIHRhYnMuZmluZCgodGFiKSA9PiBvcGVuTWV0YW1hc2tUYWJzSURzW3RhYi5pZF0pLFxuICApO1xuICAvLyBWaXZhbGRpIGlzIG5vdCBjbG9zaW5nIHBvcnQgY29ubmVjdGlvbiBvbiBwb3B1cCBjbG9zZSwgc28gcG9wdXBJc09wZW4gZG9lcyBub3Qgd29yayBjb3JyZWN0bHlcbiAgLy8gVG8gYmUgcmV2aWV3ZWQgaW4gdGhlIGZ1dHVyZSBpZiB0aGlzIGJlaGF2aW91ciBpcyBmaXhlZCAtIGFsc28gdGhlIHdheSB3ZSBkZXRlcm1pbmUgaXNWaXZhbGRpIHZhcmlhYmxlIG1pZ2h0IGNoYW5nZSBhdCBzb21lIHBvaW50XG4gIGNvbnN0IGlzVml2YWxkaSA9XG4gICAgdGFicy5sZW5ndGggPiAwICYmXG4gICAgdGFic1swXS5leHREYXRhICYmXG4gICAgdGFic1swXS5leHREYXRhLmluZGV4T2YoJ3ZpdmFsZGlfdGFiJykgPiAtMTtcbiAgaWYgKFxuICAgICF1aUlzVHJpZ2dlcmluZyAmJlxuICAgIChpc1ZpdmFsZGkgfHwgIXBvcHVwSXNPcGVuKSAmJlxuICAgICFjdXJyZW50bHlBY3RpdmVNZXRhbWFza1RhYlxuICApIHtcbiAgICB1aUlzVHJpZ2dlcmluZyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3B1cElkID0gY29udHJvbGxlci5hcHBTdGF0ZUNvbnRyb2xsZXIuZ2V0Q3VycmVudFBvcHVwSWQoKTtcbiAgICAgIGF3YWl0IG5vdGlmaWNhdGlvbk1hbmFnZXIuc2hvd1BvcHVwKFxuICAgICAgICAobmV3UG9wdXBJZCkgPT5cbiAgICAgICAgICBjb250cm9sbGVyLmFwcFN0YXRlQ29udHJvbGxlci5zZXRDdXJyZW50UG9wdXBJZChuZXdQb3B1cElkKSxcbiAgICAgICAgY3VycmVudFBvcHVwSWQsXG4gICAgICApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB1aUlzVHJpZ2dlcmluZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG4vLyBJdCBhZGRzIHRoZSBcIkFwcCBJbnN0YWxsZWRcIiBldmVudCBpbnRvIGEgcXVldWUgb2YgZXZlbnRzLCB3aGljaCB3aWxsIGJlIHRyYWNrZWQgb25seSBhZnRlciBhIHVzZXIgb3B0cyBpbnRvIG1ldHJpY3MuXG5jb25zdCBhZGRBcHBJbnN0YWxsZWRFdmVudCA9ICgpID0+IHtcbiAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICBjb250cm9sbGVyLm1ldGFNZXRyaWNzQ29udHJvbGxlci51cGRhdGVUcmFpdHMoe1xuICAgICAgW01ldGFNZXRyaWNzVXNlclRyYWl0Lkluc3RhbGxEYXRlRXh0XTogbmV3IERhdGUoKVxuICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAuc3BsaXQoJ1QnKVswXSwgLy8geXl5eS1tbS1kZFxuICAgIH0pO1xuICAgIGNvbnRyb2xsZXIubWV0YU1ldHJpY3NDb250cm9sbGVyLmFkZEV2ZW50QmVmb3JlTWV0cmljc09wdEluKHtcbiAgICAgIGNhdGVnb3J5OiBNZXRhTWV0cmljc0V2ZW50Q2F0ZWdvcnkuQXBwLFxuICAgICAgZXZlbnQ6IE1ldGFNZXRyaWNzRXZlbnROYW1lLkFwcEluc3RhbGxlZCxcbiAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAvLyBJZiB0aGUgY29udHJvbGxlciBpcyBub3Qgc2V0IHlldCwgd2Ugd2FpdCBhbmQgdHJ5IHRvIGFkZCB0aGUgXCJBcHAgSW5zdGFsbGVkXCIgZXZlbnQgYWdhaW4uXG4gICAgYWRkQXBwSW5zdGFsbGVkRXZlbnQoKTtcbiAgfSwgMTAwMCk7XG59O1xuXG4vLyBPbiBmaXJzdCBpbnN0YWxsLCBvcGVuIGEgbmV3IHRhYiB3aXRoIE1ldGFNYXNrXG5icm93c2VyLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKHsgcmVhc29uIH0pID0+IHtcbiAgaWYgKFxuICAgIHJlYXNvbiA9PT0gJ2luc3RhbGwnICYmXG4gICAgIShwcm9jZXNzLmVudi5NRVRBTUFTS19ERUJVRyB8fCBwcm9jZXNzLmVudi5JTl9URVNUKVxuICApIHtcbiAgICBhZGRBcHBJbnN0YWxsZWRFdmVudCgpO1xuICAgIHBsYXRmb3JtLm9wZW5FeHRlbnNpb25JbkJyb3dzZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNldHVwU2VudHJ5R2V0U3RhdGVHbG9iYWwoc3RvcmUpIHtcbiAgZ2xvYmFsLnN0YXRlSG9va3MuZ2V0U2VudHJ5U3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZnVsbFN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKTtcbiAgICBjb25zdCBkZWJ1Z1N0YXRlID0gbWFza09iamVjdCh7IG1ldGFtYXNrOiBmdWxsU3RhdGUgfSwgU0VOVFJZX1NUQVRFKTtcbiAgICByZXR1cm4ge1xuICAgICAgYnJvd3Nlcjogd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICBzdG9yZTogZGVidWdTdGF0ZSxcbiAgICAgIHZlcnNpb246IHBsYXRmb3JtLmdldFZlcnNpb24oKSxcbiAgICB9O1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbml0QmFja2dyb3VuZCgpIHtcbiAgaW5pdGlhbGl6ZSgpLmNhdGNoKGxvZy5lcnJvcik7XG59XG5cbmlmICghcHJvY2Vzcy5lbnYuU0tJUF9CQUNLR1JPVU5EX0lOSVRJQUxJWkFUSU9OKSB7XG4gIGluaXRCYWNrZ3JvdW5kKCk7XG59XG4iXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OTBhSEp2ZFdkb0wybHVaR1Y0TG1weklpd2libTlrWlY5dGIyUjFiR1Z6TDNScGJua3RjMlZqY0RJMU5tc3hMMnB6TG1weklpd2libTlrWlY5dGIyUjFiR1Z6TDNScGJua3RjMlZqY0RJMU5tc3hMM0ptWXpZNU56a3Vhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZkRzh0WkdGMFlTMTJhV1YzTDJsdVpHVjRMbXB6SWl3aWJtOWtaVjl0YjJSMWJHVnpMM1IzWldWMGJtRmpiQzExZEdsc0wyNWhZMnd0ZFhScGJDNXFjeUlzSW01dlpHVmZiVzlrZFd4bGN5OTBkMlZsZEc1aFkyd3ZibUZqYkMxbVlYTjBMbXB6SWl3aWJtOWtaVjl0YjJSMWJHVnpMM1I1Y0dWbWIzSmpaUzlsY25KdmNuTXVhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZkSGx3WldadmNtTmxMMlY0ZEhKaExtcHpJaXdpYm05a1pWOXRiMlIxYkdWekwzUjVjR1ZtYjNKalpTOXBibVJsZUM1cWN5SXNJbTV2WkdWZmJXOWtkV3hsY3k5MGVYQmxabTl5WTJVdmJtRjBhWFpsTG1weklpd2libTlrWlY5dGIyUjFiR1Z6TDNWcGJuUTRZWEp5WVhsekwyTnZibU5oZEM1cWN5SXNJbTV2WkdWZmJXOWtkV3hsY3k5MWFXNTBPR0Z5Y21GNWN5OWxjWFZoYkhNdWFuTWlMQ0p1YjJSbFgyMXZaSFZzWlhNdmRXbHVkRGhoY25KaGVYTXZabkp2YlMxemRISnBibWN1YW5NaUxDSnViMlJsWDIxdlpIVnNaWE12ZFdsdWREaGhjbkpoZVhNdmRHOHRjM1J5YVc1bkxtcHpJaXdpYm05a1pWOXRiMlIxYkdWekwzWmhjblZwYm5RdFltbDBZMjlwYmk5cGJtUmxlQzVxY3lJc0ltNXZaR1ZmYlc5a2RXeGxjeTkzWldJdFpXNWpiMlJwYm1jdmMzSmpMMnhwWWk1cWN5SXNJbTV2WkdWZmJXOWtkV3hsY3k5M2FHRjBkMmN0Wm1WMFkyZ3ZaR2x6ZEM5bVpYUmphQzUxYldRdWFuTWlMQ0p1YjJSbFgyMXZaSFZzWlhNdmQybG1MMmx1WkdWNExtcHpJaXdpYzJoaGNtVmtMMk52Ym5OMFlXNTBjeTloYkdGeWJYTXVhbk1pTENKemFHRnlaV1F2WTI5dWMzUmhiblJ6TDNOdFlYSjBWSEpoYm5OaFkzUnBiMjV6TG1weklpd2ljMmhoY21Wa0wyTnZibk4wWVc1MGN5OTBaWE4wTFdac1lXZHpMbXB6SWl3aVlYQndMM05qY21sd2RITXZZbUZqYTJkeWIzVnVaQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3UVVGQlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdPenM3T3pzN096czdPenM3T3p0QlF6VkhRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdPenM3T3pzN096czdPenM3T3p0QlF6RlNRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN096czdPenM3T3pzN096czdPenRCUXpsRVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPenM3T3pzN096czdPenM3TzBGRFdFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPenM3T3pzN096czdPenM3T3p0QlEycEdRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN096czdPenM3T3pzN096dEJRM1l4UlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96czdPenM3T3pzN096czdPenRCUXpsSFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3pzN096czdPenM3T3pzN096czdRVU16UmtFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenM3T3pzN096czdPenM3TzBGRGNGRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96czdPenM3T3pzN096czdPMEZEY2tKQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN096czdPenM3T3pzN096czdRVU42UWtFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN096czdPenM3T3pzN096czdRVU16UWtFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdPenM3T3pzN096czdPenRCUTJwRVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN096czdPenM3T3pzN096dEJRMmhFUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN096czdPenM3T3pzN096dEJRekZHUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3pzN096czdPenM3T3pzN08wRkRVRUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96czdPenM3T3pzN096czdPenRCUXpWdFFrRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPenM3T3pzN096czdPenM3T3pzN096czdPenRCUXk5RVR5eE5RVUZOTEhWQ1FVRjFRaXhIUVVGSExIbENRVUY1UWp0QlFVRkRMRTlCUVVFc1EwRkJRU3gxUWtGQlFTeEhRVUZCTEhWQ1FVRkJPMEZCUXpGRUxFMUJRVTBzZVVOQlFYbERMRWRCUTNCRUxESkRRVUV5UXp0QlFVRkRMRTlCUVVFc1EwRkJRU3g1UTBGQlFTeEhRVUZCTEhsRFFVRkJPenM3T3pzN096czdPenM3T3pzN096czdPenRCUTBZNVF5eEpRVUZCTEV0QlFVRXNSMEZCUVN4UFFVRkJPMEZCUlU4c1RVRkJUU3gzUTBGQmQwTXNSMEZCUnl4WlFVRk5MRWRCUVVjc1JVRkJSVHRCUVVGRExFOUJRVUVzUTBGQlFTeDNRMEZCUVN4SFFVRkJMSGREUVVGQk8wRkJRemRFTEUxQlFVMHNiME5CUVc5RExFZEJRVWNzUjBGQlJ6dEJRVUZETEU5QlFVRXNRMEZCUVN4dlEwRkJRU3hIUVVGQkxHOURRVUZCTzBGQlEycEVMRTFCUVUwc09FTkJRVGhETEVkQlFVY3NRMEZCUXp0QlFVRkRMRTlCUVVFc1EwRkJRU3c0UTBGQlFTeEhRVUZCTERoRFFVRkJPenM3T3pzN096czdPenM3T3pzN096czdPenRCUTBwNlJDeE5RVUZOTERaQ1FVRTJRaXhIUVVGSExDdENRVUVyUWp0QlFVRkRMRTlCUVVFc1EwRkJRU3cyUWtGQlFTeEhRVUZCTERaQ1FVRkJPenM3T3pzN096czdPenM3T3pzN096czdPenM3TzBGRFNUZEZMRWxCUVVFc1ZVRkJRU3h6UWtGQlFTeERRVUZCTEU5QlFVRXNRMEZCUVN4UlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQk8wRkJRMEVzU1VGQlFTeGxRVUZCTEhOQ1FVRkJMRU5CUVVFc1QwRkJRU3hEUVVGQkxHVkJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRTdRVUZEUVN4SlFVRkJMRkZCUVVFc2MwSkJRVUVzUTBGQlFTeFBRVUZCTEVOQlFVRXNUVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRVHRCUVVOQkxFbEJRVUVzYTBKQlFVRXNjMEpCUVVFc1EwRkJRU3hQUVVGQkxFTkJRVUVzYVVKQlFVRXNRMEZCUVN4RFFVRkJMRU5CUVVFN1FVRkRRU3hKUVVGQkxGbEJRVUVzYzBKQlFVRXNRMEZCUVN4UFFVRkJMRU5CUVVFc1ZVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFUdEJRVU5CTEVsQlFVRXNkMEpCUVVFc2MwSkJRVUVzUTBGQlFTeFBRVUZCTEVOQlFVRXNkVUpCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUU3UVVGRFFTeEpRVUZCTEZsQlFVRXNUMEZCUVN4RFFVRkJMSEZDUVVGQkxFTkJRVUVzUTBGQlFUdEJRVU5CTEVsQlFVRXNkVUpCUVVFc2MwSkJRVUVzUTBGQlFTeFBRVUZCTEVOQlFVRXNkVUpCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUU3UVVGRlFTeEpRVUZCTEdkQ1FVRkJMRTlCUVVFc1EwRkJRU3huUWtGQlFTeERRVUZCTEVOQlFVRTdRVUZEUVN4SlFVRkJMRTlCUVVFc1QwRkJRU3hEUVVGQkxEUkNRVUZCTEVOQlFVRXNRMEZCUVR0QlFVOUJMRWxCUVVFc1pVRkJRU3hQUVVGQkxFTkJRVUVzYjBOQlFVRXNRMEZCUVN4RFFVRkJPMEZCVDBFc1NVRkJRU3hyUWtGQlFTeFBRVUZCTEVOQlFVRXNORU5CUVVFc1EwRkJRU3hEUVVGQk8wRkJRMEVzU1VGQlFTeE5RVUZCTEU5QlFVRXNRMEZCUVN4blEwRkJRU3hEUVVGQkxFTkJRVUU3UVVGRFFTeEpRVUZCTEZWQlFVRXNUMEZCUVN4RFFVRkJMRzFEUVVGQkxFTkJRVUVzUTBGQlFUdEJRVU5CTEVsQlFVRXNVVUZCUVN4UFFVRkJMRU5CUVVFc1dVRkJRU3hEUVVGQkxFTkJRVUU3UVVGRFFTeEpRVUZCTEdOQlFVRXNjMEpCUVVFc1EwRkJRU3hQUVVGQkxFTkJRVUVzWTBGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVR0QlFVTkJMRWxCUVVFc1dVRkJRU3h6UWtGQlFTeERRVUZCTEU5QlFVRXNRMEZCUVN4blFrRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFUdEJRVU5CTEVsQlFVRXNZVUZCUVN4elFrRkJRU3hEUVVGQkxFOUJRVUVzUTBGQlFTeDFRa0ZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRVHRCUVVOQkxFbEJRVUVzWTBGQlFTeHpRa0ZCUVN4RFFVRkJMRTlCUVVFc1EwRkJRU3h0UWtGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVR0QlFVTkJMRWxCUVVFc1owSkJRVUVzYzBKQlFVRXNRMEZCUVN4UFFVRkJMRU5CUVVFc2NVSkJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRTdRVUZEUVN4SlFVRkJMR1ZCUVVFc1QwRkJRU3hEUVVGQkxHMUNRVUZCTEVOQlFVRXNRMEZCUVR0QlFVVkJMRWxCUVVFc2IwSkJRVUVzYzBKQlFVRXNRMEZCUVN4UFFVRkJMRU5CUVVFc2QwSkJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRTdRVUZEUVN4SlFVRkJMSFZDUVVGQkxIVkNRVUZCTEVOQlFVRXNUMEZCUVN4RFFVRkJMRFJDUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTzBGQlIwRXNTVUZCUVN4elFrRkJRU3gxUWtGQlFTeERRVUZCTEU5QlFVRXNRMEZCUVN4MVFrRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFUdEJRVWRCTEVsQlFVRXNhMEpCUVVFc2MwSkJRVUVzUTBGQlFTeFBRVUZCTEVOQlFVRXNiMEpCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUU3UVVGRFFTeEpRVUZCTERaQ1FVRkJMSE5DUVVGQkxFTkJRVUVzVDBGQlFTeERRVUZCTEhGRFFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQk8wRkJRMEVzU1VGQlFTeHRRa0ZCUVN4elFrRkJRU3hEUVVGQkxFOUJRVUVzUTBGQlFTeDFRa0ZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRVHRCUVVOQkxFbEJRVUVzVTBGQlFTeHpRa0ZCUVN4RFFVRkJMRTlCUVVFc1EwRkJRU3h6UWtGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVR0QlFVRjNSQ3dyUTBGQlFTeEZRVUZCTEVsQlFVRXNUMEZCUVN4UFFVRkJMRXRCUVVFc1ZVRkJRU3hGUVVGQkxFOUJRVUVzU1VGQlFTeERRVUZCTEVOQlFVRXNTVUZCUVN4dlFrRkJRU3hKUVVGQkxFOUJRVUVzUlVGQlFTeERRVUZCTEVOQlFVRXNTVUZCUVN4dFFrRkJRU3hKUVVGQkxFOUJRVUVzUlVGQlFTeERRVUZCTEVOQlFVRXNUMEZCUVN4RFFVRkJMREpDUVVGQkxIVkNRVUZCTEVWQlFVRXNUMEZCUVN4WFFVRkJMRWRCUVVFc1owSkJRVUVzUjBGQlFTeHBRa0ZCUVN4RFFVRkJMRVZCUVVFc1JVRkJRU3hYUVVGQkxFTkJRVUVzUTBGQlFTeEZRVUZCTzBGQlFVRXNiVVJCUVVFc1JVRkJRU3hKUVVGQkxFTkJRVUVzVjBGQlFTeEpRVUZCTEVkQlFVRXNTVUZCUVN4SFFVRkJMRmRCUVVFc1JVRkJRU3hGUVVGQkxFOUJRVUVzUjBGQlFTeERRVUZCTEVWQlFVRXNRMEZCUVN4SlFVRkJMRWRCUVVFc1MwRkJRU3hKUVVGQkxFbEJRVUVzVDBGQlFTeEhRVUZCTEV0QlFVRXNVVUZCUVN4SlFVRkJMRTlCUVVFc1IwRkJRU3hMUVVGQkxGVkJRVUVzUlVGQlFTeEZRVUZCTEU5QlFVRXNSVUZCUVN4VFFVRkJMRWRCUVVFc1JVRkJRU3hEUVVGQkxFVkJRVUVzUTBGQlFTeEpRVUZCTEZGQlFVRXNkMEpCUVVFc1EwRkJRU3hYUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNTMEZCUVN4SlFVRkJMRXRCUVVFc1NVRkJRU3hEUVVGQkxFZEJRVUVzUTBGQlFTeEZRVUZCTEVWQlFVRXNUMEZCUVN4TFFVRkJMRWxCUVVFc1EwRkJRU3hIUVVGQkxFTkJRVUVzUTBGQlFTeEZRVUZCTEVOQlFVRXNTVUZCUVN4VFFVRkJMRVZCUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzZDBKQlFVRXNUVUZCUVN4bFFVRkJMRWxCUVVFc1RVRkJRU3g1UWtGQlFTeERRVUZCTEVOQlFVRXNTMEZCUVN4SlFVRkJMRWRCUVVFc1NVRkJRU3hIUVVGQkxFVkJRVUVzUlVGQlFTeEpRVUZCTEVkQlFVRXNTMEZCUVN4VFFVRkJMRWxCUVVFc1RVRkJRU3hWUVVGQkxHVkJRVUVzUzBGQlFTeERRVUZCTEVkQlFVRXNSVUZCUVN4SFFVRkJMRU5CUVVFc1JVRkJRU3hGUVVGQkxFbEJRVUVzVDBGQlFTeHhRa0ZCUVN4SFFVRkJMRTFCUVVFc2VVSkJRVUVzUTBGQlFTeEhRVUZCTEVWQlFVRXNSMEZCUVN4RFFVRkJMRWRCUVVFc1NVRkJRU3hEUVVGQkxFTkJRVUVzU1VGQlFTeEpRVUZCTEV0QlFVRXNTVUZCUVN4SlFVRkJMRWxCUVVFc1NVRkJRU3hKUVVGQkxFTkJRVUVzUlVGQlFTeEZRVUZCTEUxQlFVRXNaVUZCUVN4RFFVRkJMRTFCUVVFc1JVRkJRU3hIUVVGQkxFVkJRVUVzU1VGQlFTeERRVUZCTEVOQlFVRXNSVUZCUVN4TlFVRkJMRVZCUVVFc1RVRkJRU3hEUVVGQkxFZEJRVUVzUTBGQlFTeEhRVUZCTEVkQlFVRXNRMEZCUVN4SFFVRkJMRU5CUVVFc1EwRkJRU3hGUVVGQkxFVkJRVUVzUlVGQlFTeERRVUZCTEUxQlFVRXNVVUZCUVN4SFFVRkJMRWRCUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUzBGQlFTeEZRVUZCTEVWQlFVRXNTMEZCUVN4SlFVRkJMRU5CUVVFc1IwRkJRU3hGUVVGQkxFMUJRVUVzUTBGQlFTeERRVUZCTEVWQlFVRXNRMEZCUVN4UFFVRkJMRTFCUVVFc1EwRkJRU3hGUVVGQk8wRkJRVUVzY1VOQlFVRXNSVUZCUVN4UFFVRkJMRWRCUVVFc1NVRkJRU3hIUVVGQkxGZEJRVUVzUjBGQlFTeEhRVUZCTEVkQlFVRXNSVUZCUVN4VFFVRkJMRWRCUVVFc1JVRkJRU3hEUVVGQkxFVkJRVUU3T3pzN096czdPenRCUVU5NFJDeE5RVUZOT3p0RFFVRlZMRWRCUVVjc1RVRkJUU3hEUVVGQk8wRkJRM3BDTEUxQlFVMHNhVUpCUVdsQ08wVkJRVVVzUjBGQlJ5eGxRVUZCTEZGQlFVRTdRMEZCYlVJc1EwRkJRVHRCUVVVdlF5eE5RVUZOTERoQ1FVRTRRanRGUVVOc1F5eERRVUZETEVsQlFVRXNkVUpCUVhOQ0xFZEJRVWNzU1VGQlNUdEZRVU01UWl4RFFVRkRMRWxCUVVFc09FSkJRVFpDTEVkQlFVY3NTVUZCU1R0RlFVTnlReXhEUVVGRExFbEJRVUVzTkVKQlFUSkNMRWRCUVVjc1NVRkJRVHREUVVOb1F5eERRVUZCTzBGQlJVUXNUVUZCVFN4MVFrRkJkVUlzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhEUVVGQk8wRkJSUzlETEZOQlFVRXNVVUZCUnl4blFrRkJaMElzUTBGQlF5eFBRVUZQTEVsQlFVa3NaVUZCWlN4SFFVRkhMRTlCUVU4c1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlFUdEJRVVZzUlN4TlFVRk5MRmRCUVZjc1NVRkJTU3hWUVVGQkxGRkJRV2xDTEVWQlFVVXNRMEZCUVR0QlFVTjRReXhOUVVGTkxITkNRVUZ6UWl4SlFVRkpMRzlDUVVGQkxGRkJRVzFDTEVWQlFVVXNRMEZCUVR0QlFVVnlSQ3hKUVVGSkxHTkJRV01zUzBGQlN5eERRVUZCTzBGQlEzWkNMRWxCUVVrc2NVSkJRWEZDTEV0QlFVc3NRMEZCUVR0QlFVTTVRaXhKUVVGSkxHbENRVUZwUWl4TFFVRkxMRU5CUVVFN1FVRkRNVUlzVFVGQlRTeHpRa0ZCYzBJc1JVRkJSU3hEUVVGQk8wRkJRemxDTEUxQlFVMHNNRUpCUVRCQ0xFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVRTdRVUZEZWtNc1RVRkJUU3gxUWtGQmRVSXNSVUZCUlN4RFFVRkJPMEZCUXk5Q0xFbEJRVWtzVlVGQlZTeERRVUZCT3pzN1FVRkhaQ3hOUVVGTkxGTkJRVk1zVDBGQlR5eEpRVUZKTEZGQlFWRXNRMEZCUVR0QlFVTnNReXhOUVVGTkxHRkJRV0VzVFVGQlRTeEhRVUZITEVsQlFVa3NZVUZCUVN4UlFVRnZRaXhGUVVGRkxFZEJRVWNzU1VGQlNTeFhRVUZCTEZGQlFWVXNSVUZCUlN4RFFVRkJPMEZCUTNwRkxFbEJRVWtzWVVGQllTeERRVUZCTzBGQlJXcENMRWxCUVVrc1RVRkJUU3hKUVVGSkxFOUJRVThzU1VGQlNTeGxRVUZsTEVWQlFVVTdSVUZEZUVNc1RVRkJUU3hYUVVGWExHbENRVUZwUWl4SFFVRkhMRlZCUVZVc1NVRkJTU3hMUVVGTExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVRTdRMEZEZEVVN1FVRkZRU3hOUVVGTkxHdENRVUZyUWl4SlFVRkpMRWRCUVVjc1EwRkJReXhQUVVGUExFbEJRVWtzTUVKQlFUQkNMRU5CUVVNc1EwRkJRVHRCUVVWMFJTeE5RVUZOTERaQ1FVRTJRaXhMUVVGTExFTkJRVUU3TzBGQlJYaERMRTFCUVUwc1owTkJRV2RETERCQ1FVRXdRaXhEUVVGQk8wRkJSV2hGTEUxQlFVMHNlVUpCUVhsQ0xIZENRVUYzUWl4RFFVRkJPMEZCUTNaRUxFMUJRVTBzTkVKQlFUUkNMREpDUVVFeVFpeERRVUZCT3pzN1FVRkpkRVFzVFVGQlRTeDVRa0ZCZVVJc1NVRkJTU3hQUVVGQkxGRkJRVmtzUlVGQlJTeERRVUZCT3pzN096czdPenM3UVVGRmVFUXNUMEZCUVN4MVFrRkJRU3hIUVVGQkxITkNRVUZCTEVOQlFVRTdRVUZQUVN4TlFVRk5PenM3TzBOQlNVd3NSMEZCUnl4RFFVRkJMRU5CUVVFc1JVRkJRU3hMUVVGQkxHZENRVUZsTEVkQlFVVXNRMEZCUVRzN096czdPenRCUVU5eVFpeE5RVUZOTEhsQ1FVRjVRaXhaUVVGWk8wVkJRM3BETEUxQlFVMHNUMEZCVHl4TlFVRk5MSEZDUVVGQkxGRkJRVThzUzBGQlN5eE5RVU4yUWl4RFFVRkRPenM3T3pzN096czdPenM3T3p0SlFXTk1MRXRCUVVzc1dVRkJXVHRKUVVOcVFpeFpRVUZaTEZGQlFVRTdSMEZEWWl4RFFVRkRMRXRCUTBjc1EwRkJSU3hWUVVGWE8wbEJRMmhDTEVOQlFVRXNRMEZCUVN4RlFVRkJMR1ZCUVVFc2QwSkJRWFZDTEVkQlFVVXNRMEZCUVR0SlFVTjZRaXhQUVVGUExFMUJRVTBzUTBGQlFUdEhRVU5rTEVOQlFVTXNUVUZEU1N4RFFVRkRMRTFCUVUwN1NVRkRXQ3hEUVVGQkxFTkJRVUVzUlVGQlFTeGxRVUZCTEhkQ1FVRjFRaXhIUVVGRkxFTkJRVUU3UjBGRE1VSXNRMEZCUXl4RFFVRkJPenM3UlVGSFNpeExRVUZMTEUxQlFVMHNSMEZCUnl4SlFVRkpMRWxCUVVrc1JVRkJSVHRKUVVOMFFpeHhRa0ZCUVN4UlFVRlBMRXRCUVVzc1dVRkRSU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEZRVUZGTzAxQlEyNUNMRTFCUVUwc1NVRkJRU3h0UWtGQmEwSXNUVUZCUXp0TFFVTXhRaXhEUVVGRExFdEJRMGNzUTBGQlF5eE5RVUZOTzAxQlExWXNRMEZCUVN4RFFVRkJMRVZCUVVFc1pVRkJRU3gzUWtGQmRVSXNSMEZCUlN4RFFVRkJPMHRCUXpGQ0xFTkJRVU1zVFVGRFNTeERRVUZETEUxQlFVMDdPenROUVVkWUxFTkJRVUVzUTBGQlFTeEZRVUZCTEdWQlFVRXNkMEpCUVhWQ0xFZEJRVVVzUTBGQlFUdExRVU14UWl4RFFVRkRMRU5CUVVFN1IwRkRUanREUVVORUxFTkJRVUU3T3p0QlFVZEVMRWxCUVVrc1lVRkJZU3hEUVVGQk8wRkJRMnBDTEVsQlFVa3NaVUZCWlN4RFFVRkJPMEZCUlc1Q0xIRkNRVUZCTEZGQlFVOHNVVUZCVVN4VlFVRlZMRmxCUVZrc1EwRkJReXhQUVVGUExFOUJRVThzUzBGQlN6czdSVUZGZGtRc1RVRkJUU3hoUVVGaExFTkJRVUU3UlVGRGJrSXNUVUZCVFN4aFFVRmhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEZRVU14UWl4TlFVRk5PenRIUVVGVkxFZEJRVWNzVlVGQlZTeERRVUZCTzBWQlJUZENMRTFCUVUwc1RVRkJUU3hOUVVGTkxFdEJRVUVzU1VGQlFTeEpRVUZPTEUxQlFVMHNTMEZCUVN4TFFVRkJMRU5CUVVFc1IwRkJRU3hMUVVGQkxFTkJRVUVzUjBGQlRpeE5RVUZOTEVsQlFVc3NRMEZCUVR0RlFVTjJRaXhOUVVGTkxITkNRVUZ6UWl4SFFVRkhMRWRCUVVjc1EwRkJRU3hEUVVGQkxFVkJRVUVzUzBGQlFTeHRRa0ZCYTBJc1JVRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVOQlFVRTdSVUZGT1VRc1RVRkJUU3hsUVVGbExHOUNRVUZ2UWl4RFFVRkRMRlZCUVZVc1JVRkJSU3h0UWtGQmJVSXNRMEZCUXl4RFFVRkJPMFZCUXpGRkxFMUJRVTBzYTBKQlFXdENMSFZDUVVGMVFpeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGQk8wVkJSWFJGTEVsQlEwVXNaVUZCWlN4TFFVRkxMRU5CUVVNc1NVRkRjRUlzYlVKQlFXMUNMRXRCUVVzc1dVRkJXU3hKUVVGSkxHVkJRV1VzUjBGQlJ5eERRVUZCT3p0SlFVVXpSRHM3U1VGRlFTeGhRVUZoTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRVHRKUVVOMFFpeDFRa0ZCZFVJc1NVRkJTU3hEUVVGRExGbEJRVmtzUlVGQlJTeGxRVUZsTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkRMMFFzVFVGQlRUdEpRVU5NTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNRMEZCUVR0SFFVTTVRenREUVVORUxFTkJRVU1zUTBGQlFUdEJRVVZHTEhGQ1FVRkJMRkZCUVU4c1VVRkJVU3hyUWtGQmEwSXNXVUZCV1N4RFFVRkRMRTlCUVU4c1QwRkJUeXhMUVVGTE96dEZRVVV2UkN4TlFVRk5MR0ZCUVdFc1EwRkJRVHM3TzBWQlIyNUNMR1ZCUVdVc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZCTzBOQlEzcENMRU5CUVVNc1EwRkJRVHM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenRCUVdkRlJpdzBRa0ZCTkVJN1JVRkRNVUlzU1VGQlNUdEpRVU5HTEUxQlFVMHNXVUZCV1N4TlFVRk5MSGRDUVVGM1FpeEZRVUZGTEVOQlFVRTdTVUZEYkVRc1RVRkJUU3hsUVVGbExFMUJRVTBzUTBGQlFTeERRVUZCTEVWQlFVRXNNRUpCUVVFc1VVRkJlVUlzUjBGQlJTeERRVUZCTzBsQlIzUkVMRWxCUVVrc09FSkJRVGhDTEVOQlFVRTdTVUZEYkVNc1NVRkJTU3hIUVVGQkxHRkJRVmtzUlVGQlJUdE5RVU5vUWl4TlFVRk5MR05CUVdNc1RVRkJUU3h4UWtGQlFTeFJRVUZQTEZGQlFWRXNVVUZCVVN4SlFVRkpMRU5CUVVNc1EwRkRjRVFzWjBOQlFXZERMRU5CUTJwRExFTkJRVU1zUTBGQlFUdE5RVVZHTEdsRFFVTkZMRU5CUVVFc1YwRkJWeXhMUVVGQkxFbEJRVUVzU1VGQldDeFhRVUZYTEV0QlFVRXNTMEZCUVN4RFFVRkJMRWRCUVVFc1MwRkJRU3hEUVVGQkxFZEJRVmdzVjBGQlZ5d3JRa0ZCWjBNc1RVRkJTeXhUUVVGVExFTkJRVUU3VFVGRE0wUXNUVUZCVFN4eFFrRkJRU3hSUVVGUExGRkJRVkVzVVVGQlVTeEpRVUZKTEVOQlFVTTdVVUZCUlN3NFFrRkJRVHRQUVVGblF5eERRVUZETEVOQlFVRTdTMEZEZGtVN1NVRkZRU3hsUVVGbExFTkJRMklzVTBGQlV5eEZRVU5VTEZsQlFWa3NSVUZEV2l4RlFVRkZMRVZCUTBZc09FSkJRMFlzUTBGQlF5eERRVUZCTzBsQlEwUXNTVUZCU1N4RFFVRkRMRWRCUVVFc1lVRkJXU3hGUVVGRk8wMUJRMnBDTEUxQlFVMHNkVUpCUVhWQ0xFVkJRVVVzUTBGQlFUdExRVU5xUXp0SlFVTkJMRTFCUVUwc2MwSkJRWE5DTEVWQlFVVXNRMEZCUVR0SlFVTTVRaXhUUVVGQkxGRkJRVWNzUzBGQlN5eERRVUZETEcxRFFVRnRReXhEUVVGRExFTkJRVUU3U1VGRE4wTXNjVUpCUVhGQ0xFVkJRVVVzUTBGQlFUdEhRVU40UWl4RFFVRkRMR05CUVdNN1NVRkRaQ3h2UWtGQmIwSXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRVHRIUVVNM1FqdERRVU5HT3pzN096dEJRVXRCTERoRFFVRTRReXhMUVVGTExFTkJRVU03UlVGRGJFUXNWMEZCVnl4SFFVRkhPMGxCUTFvc1MwRkJTeXhEUVVGRExHZENRVUZuUWl4RFFVRkRMRU5CUVVFN1IwRkRla0k3UTBGRFJqczdPenM3TzBGQlRVRXNlVU5CUVhsRE8wVkJRM1pETEVsQlFVa3NUVUZCVFN4RFFVRkJPMFZCUTFZc1NVRkJTVHRKUVVOR0xFMUJRVTBzYTBOQlFXdERMRWxCUVVrc1IwRkJSeXhEUVVNM1F5eFBRVUZQTEVsQlFVa3NNRUpCUTJJc1EwRkJReXhEUVVGQk96czdPMGxCU1VRc0swSkJRU3RDTEV0QlFVc3NSMEZCUnl4dFFrRkJiVUlzUTBGQlFUdEpRVVV4UkN4VFFVRlRMRTFCUVUwc1UwRkJVeXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVRTdTVUZEYUVRc1RVRkJUU3hoUVVGaExFTkJRVU1zUzBGQlN5eEZRVUZGTEN0Q1FVRXJRaXhMUVVGTExFTkJRVU1zUTBGQlFUdEpRVU5vUlN4TlFVRk5MR0ZCUVdFc1EwRkJReXhUUVVGVExFVkJRVVVzYVVOQlFXbERMRU5CUVVNc1EwRkJRVHM3TzBsQlIycEZMRWxCUVVrc1pVRkJaU3hEUVVGQk8wbEJRMjVDTEVsQlFVa3NZMEZCWXl4RFFVRkJPMGxCUTJ4Q0xFMUJRVTBzWlVGQlpTeEpRVUZKTEU5QlFVOHNRMEZCUXl4eFFrRkJjVUk3VFVGRGNFUXNhMEpCUVd0Q0xFOUJRVThzUTBGQlFUdE5RVU42UWl4cFFrRkJhVUlzVFVGQlRTeERRVUZCTzB0QlEzaENMRU5CUVVNc1EwRkJRVHM3T3p0SlFVbEdMRTFCUVUwc2FVSkJRV2xDTEVOQlFVTXNUVUZCVFN4RlFVRkZMR1ZCUVdVc1EwRkJReXhEUVVGQk96czdTVUZIYUVRc1RVRkJUU3hUUVVGVExFdEJRVXNzV1VGQldTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkJPenM3T3p0SlFVdDRReXhWUVVGVkxFTkJRMUlzVFVGQlRTeGpRVUZqTEVOQlFVTXNTVUZCU1N3clFrRkJLMElzUlVGQlJTeERRVUZETEVWQlF6TkVMRFpDUVVOR0xFTkJRVU1zUTBGQlFUdEpRVU5FTEUxQlFVMHNXVUZCV1N4RFFVRkJPMGRCUTI1Q0xFTkJRVU1zWTBGQll6dEpRVU5rTEVsQlFVa3NTMEZCU3l4WlFVRlpMQ3RDUVVFclFpeEZRVUZGTzAxQlEzQkVMRTlCUVU4c1MwRkJTeXhEUVVOV0xITkZRVU5HTEVOQlFVTXNRMEZCUVR0TFFVTkdMRTFCUVUwN1RVRkRUQ3hQUVVGUExFMUJRVTBzUTBGQlF5dzBRMEZCTkVNc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlFUdExRVU53UlR0SFFVTkVMRk5CUVZNN1NVRkRVaXhKUVVGSkxFMUJRVTBzUlVGQlJUdE5RVU5XTEUxQlFVMHNUMEZCVHl4RlFVRkZMRU5CUVVFN1MwRkRha0k3UjBGRFJqdERRVU5HT3pzN096czdPenM3T3pzN1FVRlpUeXd3UTBGQk1FTTdPMFZCUlM5RExFMUJRVTBzVjBGQlZ5eEpRVUZKTEZOQlFVRXNVVUZCVVN4RFFVRkRPMGxCUVVVc1dVRkJRU3hYUVVGQkxGRkJRVUU3UjBGQldTeERRVUZETEVOQlFVRTdSVUZETjBNc1VVRkJVU3hIUVVGSExFTkJRVU1zVDBGQlR5eEZRVUZGTEU5QlFVOHNTMEZCU3l4RFFVRkRMRU5CUVVFN096czdSVUZKYkVNc1owSkJRMFVzUTBGQlF5eE5RVUZOTEZWQlFWVXNTVUZCU1N4RlFVRkZMRXRCUVVzc1VVRkJVU3h4UWtGQmNVSXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRVHM3T3pzN08wVkJUVE5GTEVsQlFVa3NZVUZCWVN4SlFVRkpMRU5CUVVNc1lVRkJZU3hMUVVGTExFVkJRVVU3TzBsQlJYaERMR2RDUVVGblFpeFJRVUZSTEhGQ1FVRnhRaXhEUVVGRExHTkJRV01zUTBGQlF5eERRVUZCTzBsQlF6ZEVMRTFCUVUwc1pVRkJaU3hEUVVGRExHdEVRVUZyUkN4RFFVRkRMRU5CUVVFN1IwRkRNMFU3T3p0RlFVZEJMRkZCUVZFc1IwRkJSeXhEUVVGRExFOUJRVThzUlVGQlJ5eFBRVUZST3p0SlFVVTFRaXhOUVVGTkxHbENRVUZwUWl4RFFVRkJMRU5CUVVFc1JVRkJRU3huUWtGQlFTeFJRVUZsTEVWQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVFN1NVRkRja1FzVFVGQlRTeHBRa0ZCYVVJc1EwRkJReXhIUVVGSExFVkJRVVU3TzAxQlJUTkNMRTlCUVU4N1VVRkJSU3hqUVVGQk8wOUJRV1U3UzBGRGVrSXNRMEZCUXl4RFFVRkJPMGRCUTBnc1EwRkJReXhEUVVGQk96czdSVUZIUml4blFrRkJaMElzVFVGQlRTeFJRVUZSTEZsQlFWa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRVHRGUVVONlJDeEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZPMGxCUTJ4Q0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNkME5CUVhkRExFTkJRVU1zUTBGQlFUdEhRVU16UkRzN1JVRkZRU3hWUVVGVkxGbEJRVmtzUTBGQlF5eGhRVUZoTEV0QlFVc3NRMEZCUXl4RFFVRkJPenM3UlVGSE1VTXNWVUZCVlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hMUVVGTExFTkJRVU1zUTBGQlFUczdPMFZCUjJ4RExFOUJRVThzWVVGQllTeExRVUZMTEVOQlFVRTdRMEZETTBJN1FVRkZRU3dyUkVGQkswUTdSVUZETjBRc1RVRkJUVHM3UjBGQlZTeEhRVUZITEZWQlFWVXNRMEZCUVR0RlFVTTNRaXhOUVVGTkxFdEJRVXNzVFVGQlRTeExRVUZCTEVsQlFVRXNTVUZCVGl4TlFVRk5MRXRCUVVFc1MwRkJRU3hEUVVGQkxFbEJRVTRzVFVGQlRTeEpRVUZMTEVkQlFVY3NUVUZCVFN4SlFVRkpMRWRCUVVjc1IwRkJSeXhOUVVGTkxFdEJRVUVzU1VGQlFTeEpRVUZPTEUxQlFVMHNTMEZCUVN4TFFVRkJMRU5CUVVFc1IwRkJRU3hMUVVGQkxFTkJRVUVzUjBGQlRpeE5RVUZOTEVkQlFVa3NRMEZCUVR0RlFVTnVSQ3hKUVVGSkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVU3U1VGREwwSXNUMEZCVHl4TlFVRk5MRU5CUTFnc2IwVkJRVzlGTEVWQlEzQkZMRVZCUVVVc1JVRkRSaXh0UWtGRFJpeERRVUZETEVOQlFVTTdTVUZEUml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVOaUxHOUZRVU5HTEVOQlFVTXNRMEZCUVR0SFFVTklPMFZCUTBFc1QwRkJVU3hEUVVGQkxFVkJRVVVzUlVGQlJ5eERRVUZCTEVOQlFVRXNSVUZCUnl4dFFrRkJiMElzUTBGQlFTeERRVUZETEVOQlFVRTdRMEZEZGtNN096czdPenM3T3pzN096dEJRVmxQTERaR1FVdE1PenM3T3p0RlFVdEJMR0ZCUVdFc1NVRkJTU3h0UWtGQlFTeFJRVUZyUWl4RFFVRkRPMGxCUTJ4RExHbENRVUZwUWl4UFFVRlBMRWxCUVVrc2EwSkJRV3RDT3p0SlFVVTVReXh6UWtGQmMwSXNVMEZCVXpzN1NVRkZMMElzVTBGQlV6czdTVUZGVkN4WlFVRlpPenRKUVVWYUxGRkJRVkU3U1VGRFVpeHRRa0ZCYlVJN1NVRkRia0lzVTBGQlFTeHhRa0ZCUVN4UlFVRlBPMGxCUTFBc2VVSkJRWGxDTEUxQlFVMDdUVUZETjBJc1QwRkJUeXh2UWtGQmIwSXNRMEZCUVR0TFFVTTFRanRKUVVORUxIZENRVUYzUWl4TlFVRk5PMDFCUXpWQ0xFOUJRVThzYlVKQlFXMUNMRU5CUVVFN1MwRkRNMEk3U1VGRFJDeFZRVUZWTzBsQlExWXNVMEZCVXp0SlFVTlVMRGhDUVVGQk8wZEJRMFFzUTBGQlF5eERRVUZCTzBWQlJVWXNRMEZCUVN4RFFVRkJMRVZCUVVFc1RVRkJRU3hSUVVGdlFpeEZRVUZETzBsQlEyNUNMRzFDUVVGdFFpeE5RVU5xUWl4VlFVRlZMR3RDUVVGclFpeE5RVUZOTEZOQlFWTXNSVUZCUlN4bFFVRmxMRkZCUVZFN1NVRkRkRVVzWjBKQlFXZENMRlZCUVZVc2MwSkJRWE5DTEdWQlFXVXNTMEZCU3l4RFFVTnNSU3hWUVVGVkxITkNRVU5hTEVOQlFVTTdTVUZEUkN4VlFVRlZMRlZCUVZVc1UwRkJRenRIUVVOMFFpeERRVUZETEVOQlFVRTdPenRGUVVkR0xFTkJRVUVzUTBGQlFTeEZRVUZCTEV0QlFVRXNVVUZCU1N4RlFVTkdMRU5CUVVFc1EwRkJRU3hGUVVGQkxGTkJRVUVzWTBGQllTeEZRVUZETEZWQlFWVXNUVUZCVFN4RFFVRkRMRVZCUXk5Q0xFTkJRVUVzUTBGQlFTeEZRVUZCTEdWQlFVRXNVVUZCVVN4RlFVRkRMRWxCUVVrc1EwRkJReXhGUVVOa0xFTkJRVUVzUTBGQlFTeEZRVUZCTEdsQ1FVRkJMRkZCUVdkQ0xFVkJRVU1zWlVGQmFVSTdTVUZEYUVNc1RVRkJUU3hWUVVGVkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUVR0SlFVTXpRaXh6UWtGQmMwSXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkJPMGRCUTNSRUxFTkJRVU1zUlVGRFJDeFRRVUZWTzBsQlExUXNVMEZCUVN4UlFVRkhMRTFCUVUwc1EwRkJReXgzUTBGQmQwTXNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRVHRIUVVVNVJDeERRVUZETEVOQlFVRTdSVUZGUkN4NVFrRkJlVUlzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUVR0RlFVVnlReXhOUVVGTkxIRkNRVUZ4UWl4TlFVRk5PMGxCUXk5Q0xFOUJRMFVzVjBGQlZ5eEpRVU5ZTEU5QlFVOHNRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkRhRVFzYTBKQlFXdENMRU5CUVVFN1IwRkZja0lzUTBGQlFUdEZRVVZFTEUxQlFVMHNPRUpCUVRoQ0xHMURRVUZ0UXpzN1NVRkZja1VzU1VGQlNTeFpRVUZaTEV0QlFVc3NTMEZCU3l4RlFVRkZPMDFCUXpGQ0xGVkJRVlVzWlVGQlpTeEZRVUZGTEVOQlFVRTdPMHRCUlRWQ0xFMUJRVTA3T3p0TlFVZE1MRWxCUTBVc1pVRkJaU3hMUVVGTExFbEJRVUVzTkVKQlFUSkNMRWxCUXk5RExFOUJRVThzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZEYUVRN1VVRkRRU3hQUVVGQk8wOUJRMFk3VFVGRFFTeFZRVUZWTEhkQ1FVRjNRaXhEUVVGRExHVkJRV1VzUTBGQlF5eERRVUZCTzB0QlEzSkVPMGRCUTBRc1EwRkJRVHM3T3pzN096czdPenM3T3pzN096dEZRV2RDUkN4blFrRkJaMElzYjBKQlFYTkNPMGxCUVVFc1NVRkJRU3hyUWtGQlFTeERRVUZCTzBsQlJYQkRMRTFCUVUwc1kwRkJZeXhWUVVGVkxFdEJRVXNzUTBGQlFUdEpRVVZ1UXl4SlFVRkpMRzlDUVVGdlFpeFRRVUZUTEVOQlFVTXNWVUZCVlN4TFFVRkxMRU5CUVVNc1JVRkJSVHROUVVOc1JDeFBRVUZCTzB0QlEwWTdTVUZGUVN4SlFVRkpMRFJDUVVFMFFpeExRVUZMTEVOQlFVRTdTVUZEY2tNc1RVRkJUU3hwUWtGQmFVSXNRMEZCUVN4RFFVRkJMRVZCUVVFc1MwRkJRU3haUVVGWExFZEJRVVVzUTBGQlFUdEpRVU53UXl4TlFVRk5MRmxCUVZrc1EwRkJRU3h4UWtGQlFTeFZRVUZWTEU5QlFVOHNUVUZCUVN4SlFVRkJMRWxCUVVFc2EwSkJRVUVzUzBGQlFTeExRVUZCTEVOQlFVRXNTVUZCYWtJc2EwSkJRVUVzU1VGQmMwSXNSMEZEY0VNc1NVRkJTU3hIUVVGSExFTkJRVU1zVlVGQlZTeFBRVUZQTEVsQlFVa3NRMEZCUXl4SFFVTTVRaXhKUVVGSkxFTkJRVUU3U1VGRlVpeEpRVUZKTEdOQlFXTXNTMEZCU3l4SlFVRkJMR2xDUVVGblFpeEZRVUZGTzAxQlEzWkRMRFJDUVVFMFFpd3lRa0ZCTWtJc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlFUdExRVU55UlN4TlFVRk5PMDFCUTB3c05FSkJRMFVzUTBGQlFTeFRRVUZUTEV0QlFVRXNTVUZCUVN4SlFVRlVMRk5CUVZNc1MwRkJRU3hMUVVGQkxFTkJRVUVzUjBGQlFTeExRVUZCTEVOQlFVRXNSMEZCVkN4VFFVRlRMRTlCUVZFc1RVRkJUU3hEUVVGQkxHMUNRVUZCTEVWQlFYRkNMSEZDUVVGQkxGRkJRVThzVVVGQlVTeEhRVUZKTEVOQlFVRXNRMEZCUXl4RFFVRkJPMHRCUTNCRk8wbEJSVUVzU1VGQlNTeDVRa0ZCZVVJc1JVRkJSVHROUVVGQkxFbEJRVUVzY1VKQlFVRXNRMEZCUVR0TlFVTTNRaXhOUVVGTkxHRkJRMG9zUTBGQlFTeFRRVUZUTEV0QlFVRXNTVUZCUVN4SlFVRlVMRk5CUVZNc1MwRkJRU3hMUVVGQkxFTkJRVUVzUjBGQlFTeExRVUZCTEVOQlFVRXNSMEZCUVN4RFFVRkJMSGRDUVVGVUxGTkJRVk1zWTBGQlpTeE5RVUZCTEVsQlFVRXNTVUZCUVN4eFFrRkJRU3hMUVVGQkxFdEJRVUVzUTBGQlFTeEhRVUZCTEV0QlFVRXNRMEZCUVN4SFFVRjRRaXh4UWtGQlFTeExRVUZCTEVOQlFVRXNVMEZCVXl4RlFVRnJRaXhWUVVGVkxFTkJRVU1zUzBGQlNTeEpRVUZKTEc5Q1FVRkJMRkZCUVZVc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlFUczdUVUZGZEVVc1ZVRkJWU3hoUVVGaExFZEJRVWNzU1VGQlNTeERRVUZCTzAxQlF6bENMRlZCUVZVc01FSkJRVEJDTEVOQlFVTXNWVUZCVlN4RlFVRkZMRlZCUVZVc1QwRkJUeXhEUVVGRExFTkJRVUU3VFVGRGJrVXNTVUZCU1N4SFFVRkJMR0ZCUVZrc1JVRkJSVHM3VVVGRmFFSXNWVUZCVlN4VlFVRlZMRmxCUVZrc1EwRkJSU3hYUVVGWk8xVkJRelZETEVsQlFVa3NUMEZCVHl4TFFVRkxMRXRCUVVzc2VVSkJRWGxDTEVWQlFVVTdPMWxCUlRsRExGVkJRVlVzV1VGQldTeERRVUZETzJOQlFVVXNUVUZCVFN4elFrRkJRVHRoUVVGM1FpeERRVUZETEVOQlFVRTdXVUZGZUVRc1ZVRkJWU3h0UWtGQmJVSXNLMEpCUVN0Q0xFTkJRekZFTEVsQlFVa3NTVUZCU1N4RlFVTldMRU5CUVVNc1EwRkJRVHRYUVVOSU8xTkJRMFFzUTBGQlF5eERRVUZCTzA5QlEwbzdUVUZGUVN4TlFVRk5MR1ZCUVdVc2IwSkJRVzlDTEVOQlFVTXNWVUZCVlN4RlFVRkZMRmRCUVZjc1EwRkJReXhEUVVGQk8wMUJRMnhGTEVsQlFVa3NWMEZCVnl4TFFVRkxMRWxCUVVFc2RVSkJRWE5DTEVWQlFVVTdVVUZETVVNc1kwRkJZeXhKUVVGSkxFTkJRVUU3VVVGRGJFSXNRMEZCUVN4RFFVRkJMRVZCUVVFc1dVRkJRU3hSUVVGWExFVkJRVU1zVlVGQlZTeEZRVUZGTEUxQlFVMDdWVUZETlVJc2RVSkJRWFZDTEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVUU3VlVGRE5VTXNZMEZCWXl4TFFVRkxMRU5CUVVFN1ZVRkRia0lzVFVGQlRTeGxRVUZsTEd0Q1FVRnJRaXhGUVVGRkxFTkJRVUU3VlVGRGVrTXNWVUZCVlN4aFFVRmhMRWRCUVVjc1dVRkJXU3hEUVVGQk8xVkJRM1JETERKQ1FVRXlRaXhEUVVGRExGbEJRVmtzUlVGQlJTeEpRVUZCTEhWQ1FVRnpRaXhEUVVGRExFTkJRVUU3VTBGRGJFVXNRMEZCUXl4RFFVRkJPMDlCUTBvN1RVRkZRU3hKUVVGSkxGZEJRVmNzUzBGQlN5eEpRVUZCTERoQ1FVRTJRaXhGUVVGRk8xRkJRMnBFTEhGQ1FVRnhRaXhKUVVGSkxFTkJRVUU3VVVGRGVrSXNRMEZCUVN4RFFVRkJMRVZCUVVFc1dVRkJRU3hSUVVGWExFVkJRVU1zVlVGQlZTeEZRVUZGTEUxQlFVMDdWVUZETlVJc2RVSkJRWFZDTEVsQlFVa3NRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVUU3VlVGRE5VTXNjVUpCUVhGQ0xFdEJRVXNzUTBGQlFUdFZRVU14UWl4TlFVRk5MR1ZCUVdVc2EwSkJRV3RDTEVWQlFVVXNRMEZCUVR0VlFVTjZReXhWUVVGVkxHRkJRV0VzUjBGQlJ5eFpRVUZaTEVOQlFVRTdWVUZEZEVNc01rSkJRVEpDTEVOQlEzcENMRmxCUVZrc1JVRkRXaXhKUVVGQkxEaENRVU5HTEVOQlFVTXNRMEZCUVR0VFFVTkdMRU5CUVVNc1EwRkJRVHRQUVVOS08wMUJSVUVzU1VGQlNTeFhRVUZYTEV0QlFVc3NTVUZCUVN3MFFrRkJNa0lzUlVGQlJUdFJRVU12UXl4TlFVRk5MRkZCUVZFc1ZVRkJWU3hQUVVGUExFbEJRVWtzUjBGQlJ5eERRVUZCTzFGQlEzUkRMRzFDUVVGdFFpeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJRVHRSUVVWcVF5eERRVUZCTEVOQlFVRXNSVUZCUVN4WlFVRkJMRkZCUVZjc1JVRkJReXhWUVVGVkxFVkJRVVVzVFVGQlRUdFZRVU0xUWl4MVFrRkJkVUlzU1VGQlNTeERRVUZETEZsQlFWa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRVHRWUVVNMVF5eFBRVUZQTEcxQ1FVRnRRaXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZCTzFWQlEycERMRTFCUVUwc1pVRkJaU3hyUWtGQmEwSXNSVUZCUlN4RFFVRkJPMVZCUTNwRExGVkJRVlVzWVVGQllTeEhRVUZITEZsQlFWa3NRMEZCUVR0VlFVTjBReXd5UWtGQk1rSXNRMEZEZWtJc1dVRkJXU3hGUVVOYUxFbEJRVUVzTkVKQlEwWXNRMEZCUXl4RFFVRkJPMU5CUTBZc1EwRkJReXhEUVVGQk8wOUJRMG83UzBGRFJDeE5RVUZOTEVsQlEwd3NVMEZCVXl4SlFVTlVMRk5CUVZNc1QwRkJUeXhMUVVGTExHVkJRV1VzVDBGQlR5eEpRVU16UXl4VFFVRlRMRk5CUVZNc1MwRkJTeXhsUVVGbExGTkJRVk1zUlVGREwwTTdUVUZCUVN4SlFVRkJMSE5DUVVGQkxFTkJRVUU3VFVGRFFTeE5RVUZOTEdGQlEwb3NRMEZCUVN4VFFVRlRMRXRCUVVFc1NVRkJRU3hKUVVGVUxGTkJRVk1zUzBGQlFTeExRVUZCTEVOQlFVRXNSMEZCUVN4TFFVRkJMRU5CUVVFc1IwRkJRU3hEUVVGQkxIbENRVUZVTEZOQlFWTXNZMEZCWlN4TlFVRkJMRWxCUVVFc1NVRkJRU3h6UWtGQlFTeExRVUZCTEV0QlFVRXNRMEZCUVN4SFFVRkJMRXRCUVVFc1EwRkJRU3hIUVVGNFFpeHpRa0ZCUVN4TFFVRkJMRU5CUVVFc1UwRkJVeXhGUVVGclFpeFZRVUZWTEVOQlFVTXNTMEZCU1N4SlFVRkpMRzlDUVVGQkxGRkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUVR0TlFVTjBSU3hWUVVGVkxESkNRVUV5UWl4RFFVRkRPMUZCUTNCRExHdENRVUZyUWl4VlFVRkJPMDlCUTI1Q0xFTkJRVU1zUTBGQlFUdExRVU5JTEUxQlFVMDdUVUZEVEN4SlFVRkpMRlZCUVZVc1QwRkJUeXhKUVVGSkxGVkJRVlVzVDBGQlR5eEpRVUZKTEVsQlFVa3NWVUZCVlN4UFFVRlBMRWxCUVVrc1JVRkJSVHRSUVVOMlJTeE5RVUZOTEZGQlFWRXNWVUZCVlN4UFFVRlBMRWxCUVVrc1IwRkJSeXhEUVVGQk8xRkJRM1JETEUxQlFVMHNUVUZCVFN4SlFVRkpMRWRCUVVjc1EwRkJReXhWUVVGVkxFOUJRVThzU1VGQlNTeERRVUZETEVOQlFVRTdVVUZETVVNc1RVRkJUVHM3VTBGQlZTeEhRVUZITEVkQlFVY3NRMEZCUVR0UlFVVjBRaXhWUVVGVkxGVkJRVlVzV1VGQldTeERRVUZGTEU5QlFWRTdWVUZEZUVNc1NVRkJTU3hIUVVGSExFdEJRVXNzU1VGQlNTeEhRVUZITEV0QlFVc3NUMEZCVHl4TFFVRkxMSEZDUVVGeFFpeEZRVUZGTzFsQlEzcEVMRzlDUVVGdlFpeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJRVHRYUVVOMFF6dFRRVU5FTEVOQlFVTXNRMEZCUVR0UFFVTktPMDFCUTBFc1pVRkJaU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZCTzB0QlF6ZENPMGRCUTBRc1EwRkJRVHM3TzBWQlIwUXNhMEpCUVcxQ0xHTkJRV1U3U1VGQlFTeEpRVUZCTEhOQ1FVRkJMRU5CUVVFN1NVRkZhRU1zVFVGQlRTeGhRVU5LTEVOQlFVRXNVMEZCVXl4TFFVRkJMRWxCUVVFc1NVRkJWQ3hUUVVGVExFdEJRVUVzUzBGQlFTeERRVUZCTEVkQlFVRXNTMEZCUVN4RFFVRkJMRWRCUVVFc1EwRkJRU3g1UWtGQlZDeFRRVUZUTEdOQlFXVXNUVUZCUVN4SlFVRkJMRWxCUVVFc2MwSkJRVUVzUzBGQlFTeExRVUZCTEVOQlFVRXNSMEZCUVN4TFFVRkJMRU5CUVVFc1IwRkJlRUlzYzBKQlFVRXNTMEZCUVN4RFFVRkJMRk5CUVZNc1JVRkJhMElzVlVGQlZTeERRVUZETEV0QlFVa3NTVUZCU1N4dlFrRkJRU3hSUVVGVkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVRTdTVUZEZEVVc1ZVRkJWU3cwUWtGQk5FSXNRMEZCUXp0TlFVTnlReXhyUWtGQmEwSXNWVUZCVlR0TlFVTTFRaXhSUVVGUkxGVkJRVlVzVDBGQlF6dExRVU53UWl4RFFVRkRMRU5CUVVFN1IwRkRTQ3hEUVVGQk8wVkJSVVFzU1VGQlNTeFRRVUZUTEV0QlFVRXNTVUZCUVN4SlFVRlVMRk5CUVZNc1MwRkJRU3hMUVVGQkxFTkJRVUVzU1VGQlZDeFRRVUZUTEhsQ1FVRXdRaXhGUVVGRk8wbEJRM1pETEZOQlFWTXNlVUpCUVhsQ0xFTkJRVU1zWVVGQllTeEZRVUZGTEdWQlFXVXNRMEZCUXl4RFFVRkJPMGRCUTNCRk96czdPenM3UlVGTlFTeFZRVUZWTEdGQlFXRXNZMEZCWXl4RlFVRkZMRXRCUVVzc1EwRkJReXhOUVVGTk8wbEJRMnBFTEZkQlFWY3NSVUZCUlN4RFFVRkJPMGRCUTJRc1EwRkJReXhEUVVGQk8wVkJRMFlzVlVGQlZTeGhRVUZoTEVkQlFVY3NRMEZEZUVJc2JVSkJRVUVzTWtKQlFUQkNMR0ZCUVdFc1JVRkRka01zVjBGRFJpeERRVUZETEVOQlFVRTdSVUZEUkN4VlFVRlZMSGxDUVVGNVFpeEpRVUZKTEVkQlFVY3NRMEZEZUVNc2JVSkJRVUVzTWtKQlFUQkNMR0ZCUVdFc1JVRkRka01zVjBGRFJpeERRVUZETEVOQlFVRTdSVUZEUkN4VlFVRlZMRGhDUVVFNFFpeEpRVUZKTEVkQlFVY3NRMEZETjBNc2JVSkJRVUVzTWtKQlFUQkNMR0ZCUVdFc1JVRkRka01zVjBGRFJpeERRVUZETEVOQlFVRTdSVUZEUkN4VlFVRlZMRzlDUVVGdlFpeEpRVUZKTEVkQlFVY3NRMEZEYmtNc2JVSkJRVUVzTWtKQlFUQkNMR0ZCUVdFc1JVRkRka01zVjBGRFJpeERRVUZETEVOQlFVRTdSVUZEUkN4VlFVRlZMRzFDUVVGdFFpeEhRVUZITEVOQlF6bENMRzFDUVVGQkxESkNRVUV3UWl4aFFVRmhMRVZCUTNaRExGZEJRMFlzUTBGQlF5eERRVUZCTzBWQlJVUXNWVUZCVlN4dlFrRkJiMElzVlVGQlZTeERRVU4wUXl4dFFrRkJRU3d5UWtGQk1FSXNjMEpCUVhOQ0xFVkJRMmhFTEZkQlEwWXNRMEZCUXl4RFFVRkJPenM3T3pzN1JVRk5SQ3gxUWtGQmRVSTdTVUZEY2tJc1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlFUdEpRVU5rTEUxQlFVMHNVVUZCVVN3MlFrRkJOa0lzUlVGQlJTeERRVUZCTzBsQlF6ZERMRWxCUVVrc1MwRkJTeXhGUVVGRk8wMUJRMVFzVVVGQlVTeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVFN1MwRkRka0k3TzBsQlJVRXNTVUZCU1N4SFFVRkJMR0ZCUVZrc1JVRkJSVHROUVVOb1FpeHhRa0ZCUVN4UlFVRlBMRTlCUVU4c1lVRkJZU3hEUVVGRE8xRkJRVVVzVFVGQlRTeExRVUZCTzA5QlFVOHNRMEZCUXl4RFFVRkJPMDFCUXpWRExIRkNRVUZCTEZGQlFVOHNUMEZCVHl4M1FrRkJkMElzUTBGQlF6dFJRVUZGTEU5QlFVOHNVMEZCUVR0UFFVRlhMRU5CUVVNc1EwRkJRVHRMUVVNM1JDeE5RVUZOTzAxQlEwd3NjVUpCUVVFc1VVRkJUeXhqUVVGakxHRkJRV0VzUTBGQlF6dFJRVUZGTEUxQlFVMHNTMEZCUVR0UFFVRlBMRU5CUVVNc1EwRkJRVHROUVVOdVJDeHhRa0ZCUVN4UlFVRlBMR05CUVdNc2QwSkJRWGRDTEVOQlFVTTdVVUZCUlN4UFFVRlBMRk5CUVVFN1QwRkJWeXhEUVVGRExFTkJRVUU3UzBGRGNrVTdSMEZEUmp0RlFVVkJMSGxEUVVGNVF6dEpRVU4yUXl4TlFVRk5MSFZDUVVOS0xGVkJRVlVzYlVKQlFXMUNMSE5DUVVGelFpeEZRVUZGTEVOQlFVRTdTVUZEZGtRc1RVRkJUU3gzUWtGRFNpeFZRVUZWTEcxQ1FVRnRRaXhwUWtGQmFVSXNUMEZCVHl4RFFVRkJPMGxCUTNaRUxFOUJRVThzYjBKQlFXOUNMRWRCUVVjc2NVSkJRWEZDTEVOQlFVRTdSMEZEY2tRN1JVRkZRU3h0UWtGQmJVSXNSMEZCUnl4RFFVTndRaXh2UWtGQlFTdzBRa0ZCTWtJc1lVRkJZU3hGUVVONFF5eERRVUZET3p0SFFVRjFRaXhMUVVGTE8wbEJRek5DTEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUlVGQlJUdE5RVU40UWl3MlFrRkJOa0lzUlVGQlJTeERRVUZCTzB0QlEyaERMRTFCUVUwc1NVRkJTU3cyUWtGQk5rSXNSVUZCUlN4SFFVRkhMRU5CUVVNc1JVRkJSVHROUVVNNVF5eFRRVUZUTEVWQlFVVXNRMEZCUVR0TFFVTmlPMGRCUlVvc1EwRkJReXhEUVVGQk8wVkJSVVFzZVVOQlFYbERPMGxCUTNaRExFMUJRVTBzUzBGQlN5eERRVU5VTEZWQlFWVXNZVUZCWVN4bFFVRmxMRzlDUVVGdlFpeEZRVU0xUkN4RFFVRkRMRkZCUVZFc1EwRkJSU3hSUVVOVUxGVkJRVlVzWVVGQllTeGxRVUZsTEc5Q1FVRnZRaXhEUVVGRExFbEJRVWtzUTBGRGFrVXNRMEZCUXl4RFFVRkJPMGxCUTBRc1ZVRkJWU3h2UWtGQmIwSXNhVUpCUVdsQ0xFTkJRemRETEZsQlFVRXNPRUpCUTBZc1EwRkJReXhEUVVGQk8wbEJRMFFzVlVGQlZTeDVRa0ZCZVVJc2FVSkJRV2xDTEVOQlEyeEVMRmxCUVVFc01FSkJRMFlzUTBGQlF5eERRVUZCTzBsQlEwUXNWVUZCVlN3NFFrRkJPRUlzYVVKQlFXbENMRU5CUTNaRUxGbEJRVUVzTUVKQlEwWXNRMEZCUXl4RFFVRkJPenM3U1VGSFJDeE5RVUZOTEU5QlFVOHNRMEZCUXl4VlFVRlZMRzFDUVVGdFFpeE5RVUZOTEdsQ1FVRnBRaXhEUVVGRExGRkJRVkVzUTBGRGVrVXNRMEZCUXpzN08wdEJRVmtzUzBGQlN6dE5RVU5vUWl4UlFVRlJMRWxCUVVrN08xVkJSVklzVlVGQlZTeHRRa0ZCYlVJc1QwRkJUeXhEUVVOc1F5eEZRVUZGTEVWQlEwWXNZVUZCUVN4VlFVRlRMRk5CUVZNc2IwSkJRVzlDTEVWQlEzaERMRU5CUVVNc1EwRkJRVHRWUVVORUxFMUJRVUU3VDBGRFNqdExRVVZLTEVOQlFVTXNRMEZCUVR0SlFVVkVMRmRCUVZjc1JVRkJSU3hEUVVGQk8wZEJRMlk3UTBGRlJqczdPenM3T3pzN08wRkJVMEVzTWtKQlFUSkNPMFZCUTNwQ0xFMUJRVTBzVDBGQlR5eE5RVUZOTEZGQlFWRXNZMEZCWXl4RlFVRkZMRU5CUVVFN1JVRkRNME1zVFVGQlRTdzJRa0ZCTmtJc1QwRkJUeXhEUVVONFF5eEpRVUZKTEV0QlFVc3NRMEZCUlN4UFFVRlJMRzFDUVVGdFFpeERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUTJoRUxFTkJRVU1zUTBGQlFUczdPMFZCUjBRc1RVRkJUU3haUVVOS0xFbEJRVWtzVDBGQlR5eEhRVUZITEVOQlFVTXNTVUZEWml4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzU1VGRFppeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRkZCUVZFc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkJPMFZCUXpkRExFbEJRMFVzUTBGQlF5eGpRVUZqTEV0QlEyUXNVMEZCVXl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRek5DTEVOQlFVTXNNRUpCUVRCQ0xFVkJRek5DTzBsQlEwRXNhVUpCUVdsQ0xFbEJRVWtzUTBGQlFUdEpRVU55UWl4SlFVRkpPMDFCUTBZc1RVRkJUU3hwUWtGQmFVSXNWVUZCVlN4dFFrRkJiVUlzYTBKQlFXdENMRVZCUVVVc1EwRkJRVHROUVVONFJTeE5RVUZOTEcxQ1FVRnRRaXhWUVVGVkxFTkJRMmhETEdOQlEwTXNWVUZCVlN4dFFrRkJiVUlzYTBKQlFXdENMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRemRFTEdOQlEwWXNRMEZCUXl4RFFVRkJPMHRCUTBZc1UwRkJVenROUVVOU0xHbENRVUZwUWl4TFFVRkxMRU5CUVVFN1MwRkRlRUk3UjBGRFJqdERRVU5HT3pzN1FVRkhRU3hOUVVGTkxIVkNRVUYxUWl4TlFVRk5PMFZCUTJwRExFbEJRVWtzVlVGQlZTeEZRVUZGTzBsQlEyUXNWVUZCVlN4elFrRkJjMElzWVVGQllTeERRVUZETzAxQlF6VkRMRU5CUVVNc1dVRkJRU3h4UWtGQmIwSXNaVUZCWlN4SFFVRkhMRWxCUVVrc1NVRkJTU3hGUVVGRkxGbEJRMjVETEVWQlFVVXNUVUZEVWl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dExRVU5xUWl4RFFVRkRMRU5CUVVFN08wbEJRMFlzVlVGQlZTeHpRa0ZCYzBJc01rSkJRVEpDTEVOQlFVTTdUVUZETVVRc1ZVRkJWU3haUVVGQkxIbENRVUYzUWl4SlFVRkpPMDFCUTNSRExFOUJRVThzV1VGQlFTeHhRa0ZCYjBJc1lVRkJZVHROUVVONFF5eFpRVUZaTEVWQlFVTTdTMEZEWkN4RFFVRkRMRU5CUVVFN1NVRkRSaXhQUVVGQk8wZEJRMFk3UlVGRFFTeFZRVUZWTEVOQlFVTXNUVUZCVFRzN1NVRkZaaXh2UWtGQmIwSXNSVUZCUlN4RFFVRkJPMGRCUTNaQ0xFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVRTdRMEZEVkN4RFFVRkJPenM3UVVGSFJDeHhRa0ZCUVN4UlFVRlBMRkZCUVZFc1dVRkJXU3haUVVGWkxFTkJRVU1zUTBGQlF6czdRMEZCVlN4TFFVRkxPMFZCUTNSRUxFbEJRMFVzVFVGQlRTeExRVUZMTEZOQlFWTXNTVUZEY0VJc1JVRkJSU3hQUVVGUExFbEJRVWtzWlVGQlpTeEpRVUZKTEU5QlFVOHNTVUZCU1N4UlFVRlJMRU5CUVVNc1JVRkRjRVE3U1VGRFFTeHZRa0ZCYjBJc1JVRkJSU3hEUVVGQk8wbEJRM1JDTEZGQlFWRXNkVUpCUVhWQ0xFVkJRVVVzUTBGQlFUdEhRVU51UXp0RFFVTkVMRU5CUVVNc1EwRkJRVHRCUVVWR0xEQkRRVUV3UXp0RlFVTjRReXhOUVVGTkxGZEJRVmNzWlVGQlpTeEhRVUZITEZsQlFWazdTVUZETjBNc1RVRkJUU3haUVVGWkxFdEJRVXNzVTBGQlV5eEZRVUZGTEVOQlFVRTdTVUZEYkVNc1RVRkJUU3hoUVVGaExFTkJRVUVzUTBGQlFTeEZRVUZCTEU5QlFVRXNWMEZCVlN4RlFVRkRPMDFCUVVVc1ZVRkJWU3hUUVVGQk8wdEJRVmNzUlVGQlJTeFpRVUZCTEdGQlFWa3NRMEZCUXl4RFFVRkJPMGxCUTNCRkxFOUJRVTg3VFVGRFRDeFRRVUZUTEUxQlFVMHNWVUZCVlN4VlFVRlZPMDFCUTI1RExFOUJRVThzVlVGQlZUdE5RVU5xUWl4VFFVRlRMRkZCUVZFc1YwRkJWeXhGUVVGRE8wdEJRemxDTEVOQlFVRTdSMEZEUml4RFFVRkJPME5CUTBnN1FVRkZRU3d3UWtGQk1FSTdSVUZEZUVJc1ZVRkJWU3hGUVVGRkxFMUJRVTBzUTBGQlF5eFRRVUZCTEZGQlFVY3NUVUZCVFN4RFFVRkRMRU5CUVVFN1EwRkRMMEk3UVVGRlFTeEpRVUZKTEVOQlFVTXNUMEZCVHl4SlFVRkpMQ3RDUVVFclFpeEZRVUZGTzBWQlF5OURMR05CUVdNc1JVRkJSU3hEUVVGQk8wTkJRMnhDSWl3aVptbHNaU0k2SW1kbGJtVnlZWFJsWkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SjJZWElnVTNSeVpXRnRJRDBnY21WeGRXbHlaU2duYzNSeVpXRnRKeWxjYmx4dUx5OGdkR2h5YjNWbmFGeHVMeTljYmk4dklHRWdjM1J5WldGdElIUm9ZWFFnWkc5bGN5QnViM1JvYVc1bklHSjFkQ0J5WlMxbGJXbDBJSFJvWlNCcGJuQjFkQzVjYmk4dklIVnpaV1oxYkNCbWIzSWdZV2RuY21WbllYUnBibWNnWVNCelpYSnBaWE1nYjJZZ1kyaGhibWRwYm1jZ1luVjBJRzV2ZENCbGJtUnBibWNnYzNSeVpXRnRjeUJwYm5SdklHOXVaU0J6ZEhKbFlXMHBYRzVjYm1WNGNHOXlkSE1nUFNCdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUhSb2NtOTFaMmhjYm5Sb2NtOTFaMmd1ZEdoeWIzVm5hQ0E5SUhSb2NtOTFaMmhjYmx4dUx5OWpjbVZoZEdVZ1lTQnlaV0ZrWVdKc1pTQjNjbWwwWVdKc1pTQnpkSEpsWVcwdVhHNWNibVoxYm1OMGFXOXVJSFJvY205MVoyZ2dLSGR5YVhSbExDQmxibVFzSUc5d2RITXBJSHRjYmlBZ2QzSnBkR1VnUFNCM2NtbDBaU0I4ZkNCbWRXNWpkR2x2YmlBb1pHRjBZU2tnZXlCMGFHbHpMbkYxWlhWbEtHUmhkR0VwSUgxY2JpQWdaVzVrSUQwZ1pXNWtJSHg4SUdaMWJtTjBhVzl1SUNncElIc2dkR2hwY3k1eGRXVjFaU2h1ZFd4c0tTQjlYRzVjYmlBZ2RtRnlJR1Z1WkdWa0lEMGdabUZzYzJVc0lHUmxjM1J5YjNsbFpDQTlJR1poYkhObExDQmlkV1ptWlhJZ1BTQmJYU3dnWDJWdVpHVmtJRDBnWm1Gc2MyVmNiaUFnZG1GeUlITjBjbVZoYlNBOUlHNWxkeUJUZEhKbFlXMG9LVnh1SUNCemRISmxZVzB1Y21WaFpHRmliR1VnUFNCemRISmxZVzB1ZDNKcGRHRmliR1VnUFNCMGNuVmxYRzRnSUhOMGNtVmhiUzV3WVhWelpXUWdQU0JtWVd4elpWeHVYRzR2THlBZ2MzUnlaV0Z0TG1GMWRHOVFZWFZ6WlNBZ0lEMGdJU2h2Y0hSeklDWW1JRzl3ZEhNdVlYVjBiMUJoZFhObElDQWdQVDA5SUdaaGJITmxLVnh1SUNCemRISmxZVzB1WVhWMGIwUmxjM1J5YjNrZ1BTQWhLRzl3ZEhNZ0ppWWdiM0IwY3k1aGRYUnZSR1Z6ZEhKdmVTQTlQVDBnWm1Gc2MyVXBYRzVjYmlBZ2MzUnlaV0Z0TG5keWFYUmxJRDBnWm5WdVkzUnBiMjRnS0dSaGRHRXBJSHRjYmlBZ0lDQjNjbWwwWlM1allXeHNLSFJvYVhNc0lHUmhkR0VwWEc0Z0lDQWdjbVYwZFhKdUlDRnpkSEpsWVcwdWNHRjFjMlZrWEc0Z0lIMWNibHh1SUNCbWRXNWpkR2x2YmlCa2NtRnBiaWdwSUh0Y2JpQWdJQ0IzYUdsc1pTaGlkV1ptWlhJdWJHVnVaM1JvSUNZbUlDRnpkSEpsWVcwdWNHRjFjMlZrS1NCN1hHNGdJQ0FnSUNCMllYSWdaR0YwWVNBOUlHSjFabVpsY2k1emFHbG1kQ2dwWEc0Z0lDQWdJQ0JwWmlodWRXeHNJRDA5UFNCa1lYUmhLVnh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjM1J5WldGdExtVnRhWFFvSjJWdVpDY3BYRzRnSUNBZ0lDQmxiSE5sWEc0Z0lDQWdJQ0FnSUhOMGNtVmhiUzVsYldsMEtDZGtZWFJoSnl3Z1pHRjBZU2xjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0J6ZEhKbFlXMHVjWFZsZFdVZ1BTQnpkSEpsWVcwdWNIVnphQ0E5SUdaMWJtTjBhVzl1SUNoa1lYUmhLU0I3WEc0dkx5QWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtHVnVaR1ZrS1Z4dUlDQWdJR2xtS0Y5bGJtUmxaQ2tnY21WMGRYSnVJSE4wY21WaGJWeHVJQ0FnSUdsbUtHUmhkR0VnUFQwOUlHNTFiR3dwSUY5bGJtUmxaQ0E5SUhSeWRXVmNiaUFnSUNCaWRXWm1aWEl1Y0hWemFDaGtZWFJoS1Z4dUlDQWdJR1J5WVdsdUtDbGNiaUFnSUNCeVpYUjFjbTRnYzNSeVpXRnRYRzRnSUgxY2JseHVJQ0F2TDNSb2FYTWdkMmxzYkNCaVpTQnlaV2RwYzNSbGNtVmtJR0Z6SUhSb1pTQm1hWEp6ZENBblpXNWtKeUJzYVhOMFpXNWxjbHh1SUNBdkwyMTFjM1FnWTJGc2JDQmtaWE4wY205NUlHNWxlSFFnZEdsamF5d2dkRzhnYldGclpTQnpkWEpsSUhkbEozSmxJR0ZtZEdWeUlHRnVlVnh1SUNBdkwzTjBjbVZoYlNCd2FYQmxaQ0JtY205dElHaGxjbVV1WEc0Z0lDOHZkR2hwY3lCcGN5QnZibXg1SUdFZ2NISnZZbXhsYlNCcFppQmxibVFnYVhNZ2JtOTBJR1Z0YVhSMFpXUWdjM2x1WTJoeWIyNXZkWE5zZVM1Y2JpQWdMeTloSUc1cFkyVnlJSGRoZVNCMGJ5QmtieUIwYUdseklHbHpJSFJ2SUcxaGEyVWdjM1Z5WlNCMGFHbHpJR2x6SUhSb1pTQnNZWE4wSUd4cGMzUmxibVZ5SUdadmNpQW5aVzVrSjF4dVhHNGdJSE4wY21WaGJTNXZiaWduWlc1a0p5d2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJSE4wY21WaGJTNXlaV0ZrWVdKc1pTQTlJR1poYkhObFhHNGdJQ0FnYVdZb0lYTjBjbVZoYlM1M2NtbDBZV0pzWlNBbUppQnpkSEpsWVcwdVlYVjBiMFJsYzNSeWIza3BYRzRnSUNBZ0lDQndjbTlqWlhOekxtNWxlSFJVYVdOcktHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnYzNSeVpXRnRMbVJsYzNSeWIza29LVnh1SUNBZ0lDQWdmU2xjYmlBZ2ZTbGNibHh1SUNCbWRXNWpkR2x2YmlCZlpXNWtJQ2dwSUh0Y2JpQWdJQ0J6ZEhKbFlXMHVkM0pwZEdGaWJHVWdQU0JtWVd4elpWeHVJQ0FnSUdWdVpDNWpZV3hzS0hOMGNtVmhiU2xjYmlBZ0lDQnBaaWdoYzNSeVpXRnRMbkpsWVdSaFlteGxJQ1ltSUhOMGNtVmhiUzVoZFhSdlJHVnpkSEp2ZVNsY2JpQWdJQ0FnSUhOMGNtVmhiUzVrWlhOMGNtOTVLQ2xjYmlBZ2ZWeHVYRzRnSUhOMGNtVmhiUzVsYm1RZ1BTQm1kVzVqZEdsdmJpQW9aR0YwWVNrZ2UxeHVJQ0FnSUdsbUtHVnVaR1ZrS1NCeVpYUjFjbTVjYmlBZ0lDQmxibVJsWkNBOUlIUnlkV1ZjYmlBZ0lDQnBaaWhoY21kMWJXVnVkSE11YkdWdVozUm9LU0J6ZEhKbFlXMHVkM0pwZEdVb1pHRjBZU2xjYmlBZ0lDQmZaVzVrS0NrZ0x5OGdkMmxzYkNCbGJXbDBJRzl5SUhGMVpYVmxYRzRnSUNBZ2NtVjBkWEp1SUhOMGNtVmhiVnh1SUNCOVhHNWNiaUFnYzNSeVpXRnRMbVJsYzNSeWIza2dQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnYVdZb1pHVnpkSEp2ZVdWa0tTQnlaWFIxY201Y2JpQWdJQ0JrWlhOMGNtOTVaV1FnUFNCMGNuVmxYRzRnSUNBZ1pXNWtaV1FnUFNCMGNuVmxYRzRnSUNBZ1luVm1abVZ5TG14bGJtZDBhQ0E5SURCY2JpQWdJQ0J6ZEhKbFlXMHVkM0pwZEdGaWJHVWdQU0J6ZEhKbFlXMHVjbVZoWkdGaWJHVWdQU0JtWVd4elpWeHVJQ0FnSUhOMGNtVmhiUzVsYldsMEtDZGpiRzl6WlNjcFhHNGdJQ0FnY21WMGRYSnVJSE4wY21WaGJWeHVJQ0I5WEc1Y2JpQWdjM1J5WldGdExuQmhkWE5sSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lHbG1LSE4wY21WaGJTNXdZWFZ6WldRcElISmxkSFZ5Ymx4dUlDQWdJSE4wY21WaGJTNXdZWFZ6WldRZ1BTQjBjblZsWEc0Z0lDQWdjbVYwZFhKdUlITjBjbVZoYlZ4dUlDQjlYRzVjYmlBZ2MzUnlaV0Z0TG5KbGMzVnRaU0E5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNCcFppaHpkSEpsWVcwdWNHRjFjMlZrS1NCN1hHNGdJQ0FnSUNCemRISmxZVzB1Y0dGMWMyVmtJRDBnWm1Gc2MyVmNiaUFnSUNBZ0lITjBjbVZoYlM1bGJXbDBLQ2R5WlhOMWJXVW5LVnh1SUNBZ0lIMWNiaUFnSUNCa2NtRnBiaWdwWEc0Z0lDQWdMeTl0WVhrZ2FHRjJaU0JpWldOdmJXVWdjR0YxYzJWa0lHRm5ZV2x1TEZ4dUlDQWdJQzh2WVhNZ1pISmhhVzRnWlcxcGRITWdKMlJoZEdFbkxseHVJQ0FnSUdsbUtDRnpkSEpsWVcwdWNHRjFjMlZrS1Z4dUlDQWdJQ0FnYzNSeVpXRnRMbVZ0YVhRb0oyUnlZV2x1SnlsY2JpQWdJQ0J5WlhSMWNtNGdjM1J5WldGdFhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhOMGNtVmhiVnh1ZlZ4dVhHNGlMQ0pqYjI1emRDQkNUaUE5SUhKbGNYVnBjbVVvSjJKdUxtcHpKeWxjYm1OdmJuTjBJRVZESUQwZ2NtVnhkV2x5WlNnblpXeHNhWEIwYVdNbktTNWxZMXh1WTI5dWMzUWdjMlZqY0RJMU5tc3hJRDBnYm1WM0lFVkRLQ2R6WldOd01qVTJhekVuS1Z4dVkyOXVjM1FnWkdWMFpYSnRhVzVwYzNScFkwZGxibVZ5WVhSbFN5QTlJSEpsY1hWcGNtVW9KeTR2Y21aak5qazNPU2NwWEc1Y2JtTnZibk4wSUZwRlVrOHpNaUE5SUVKMVptWmxjaTVoYkd4dll5Z3pNaXdnTUNsY2JtTnZibk4wSUVWRFgwZFNUMVZRWDA5U1JFVlNJRDBnUW5WbVptVnlMbVp5YjIwb0oyWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVpsWW1GaFpXUmpaVFpoWmpRNFlUQXpZbUptWkRJMVpUaGpaREF6TmpReE5ERW5MQ0FuYUdWNEp5bGNibU52Ym5OMElFVkRYMUFnUFNCQ2RXWm1aWEl1Wm5KdmJTZ25abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVptWm1abVZtWm1abVptTXlaaWNzSUNkb1pYZ25LVnh1WEc1amIyNXpkQ0J1SUQwZ2MyVmpjREkxTm1zeExtTjFjblpsTG01Y2JtTnZibk4wSUc1RWFYWXlJRDBnYmk1emFISnVLREVwWEc1amIyNXpkQ0JISUQwZ2MyVmpjREkxTm1zeExtTjFjblpsTG1kY2JseHVZMjl1YzNRZ1ZFaFNUMWRmUWtGRVgxQlNTVlpCVkVVZ1BTQW5SWGh3WldOMFpXUWdVSEpwZG1GMFpTZGNibU52Ym5OMElGUklVazlYWDBKQlJGOVFUMGxPVkNBOUlDZEZlSEJsWTNSbFpDQlFiMmx1ZENkY2JtTnZibk4wSUZSSVVrOVhYMEpCUkY5VVYwVkJTeUE5SUNkRmVIQmxZM1JsWkNCVWQyVmhheWRjYm1OdmJuTjBJRlJJVWs5WFgwSkJSRjlJUVZOSUlEMGdKMFY0Y0dWamRHVmtJRWhoYzJnblhHNWpiMjV6ZENCVVNGSlBWMTlDUVVSZlUwbEhUa0ZVVlZKRklEMGdKMFY0Y0dWamRHVmtJRk5wWjI1aGRIVnlaU2RjYm1OdmJuTjBJRlJJVWs5WFgwSkJSRjlGV0ZSU1FWOUVRVlJCSUQwZ0owVjRjR1ZqZEdWa0lFVjRkSEpoSUVSaGRHRWdLRE15SUdKNWRHVnpLU2RjYmx4dVpuVnVZM1JwYjI0Z2FYTlRZMkZzWVhJZ0tIZ3BJSHRjYmlBZ2NtVjBkWEp1SUVKMVptWmxjaTVwYzBKMVptWmxjaWg0S1NBbUppQjRMbXhsYm1kMGFDQTlQVDBnTXpKY2JuMWNibHh1Wm5WdVkzUnBiMjRnYVhOUGNtUmxjbE5qWVd4aGNpQW9lQ2tnZTF4dUlDQnBaaUFvSVdselUyTmhiR0Z5S0hncEtTQnlaWFIxY200Z1ptRnNjMlZjYmlBZ2NtVjBkWEp1SUhndVkyOXRjR0Z5WlNoRlExOUhVazlWVUY5UFVrUkZVaWtnUENBd0lDOHZJRHdnUjF4dWZWeHVYRzVtZFc1amRHbHZiaUJwYzFCdmFXNTBJQ2h3S1NCN1hHNGdJR2xtSUNnaFFuVm1abVZ5TG1selFuVm1abVZ5S0hBcEtTQnlaWFIxY200Z1ptRnNjMlZjYmlBZ2FXWWdLSEF1YkdWdVozUm9JRHdnTXpNcElISmxkSFZ5YmlCbVlXeHpaVnh1WEc0Z0lHTnZibk4wSUhRZ1BTQndXekJkWEc0Z0lHTnZibk4wSUhnZ1BTQndMbk5zYVdObEtERXNJRE16S1Z4dUlDQnBaaUFvZUM1amIyMXdZWEpsS0ZwRlVrOHpNaWtnUFQwOUlEQXBJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQnBaaUFvZUM1amIyMXdZWEpsS0VWRFgxQXBJRDQ5SURBcElISmxkSFZ5YmlCbVlXeHpaVnh1SUNCcFppQW9LSFFnUFQwOUlEQjRNRElnZkh3Z2RDQTlQVDBnTUhnd015a2dKaVlnY0M1c1pXNW5kR2dnUFQwOUlETXpLU0I3WEc0Z0lDQWdkSEo1SUhzZ1pHVmpiMlJsUm5KdmJTaHdLU0I5SUdOaGRHTm9JQ2hsS1NCN0lISmxkSFZ5YmlCbVlXeHpaU0I5SUM4dklGUlBSRTg2SUhSbGJYQnZjbUZ5ZVZ4dUlDQWdJSEpsZEhWeWJpQjBjblZsWEc0Z0lIMWNibHh1SUNCamIyNXpkQ0I1SUQwZ2NDNXpiR2xqWlNnek15bGNiaUFnYVdZZ0tIa3VZMjl0Y0dGeVpTaGFSVkpQTXpJcElEMDlQU0F3S1NCeVpYUjFjbTRnWm1Gc2MyVmNiaUFnYVdZZ0tIa3VZMjl0Y0dGeVpTaEZRMTlRS1NBK1BTQXdLU0J5WlhSMWNtNGdabUZzYzJWY2JpQWdhV1lnS0hRZ1BUMDlJREI0TURRZ0ppWWdjQzVzWlc1bmRHZ2dQVDA5SURZMUtTQnlaWFIxY200Z2RISjFaVnh1SUNCeVpYUjFjbTRnWm1Gc2MyVmNibjFjYmx4dVpuVnVZM1JwYjI0Z1gxOXBjMUJ2YVc1MFEyOXRjSEpsYzNObFpDQW9jQ2tnZTF4dUlDQnlaWFIxY200Z2NGc3dYU0FoUFQwZ01IZ3dORnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQnBjMUJ2YVc1MFEyOXRjSEpsYzNObFpDQW9jQ2tnZTF4dUlDQnBaaUFvSVdselVHOXBiblFvY0NrcElISmxkSFZ5YmlCbVlXeHpaVnh1SUNCeVpYUjFjbTRnWDE5cGMxQnZhVzUwUTI5dGNISmxjM05sWkNod0tWeHVmVnh1WEc1bWRXNWpkR2x2YmlCcGMxQnlhWFpoZEdVZ0tIZ3BJSHRjYmlBZ2FXWWdLQ0ZwYzFOallXeGhjaWg0S1NrZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUhKbGRIVnliaUI0TG1OdmJYQmhjbVVvV2tWU1R6TXlLU0ErSURBZ0ppWWdMeThnUGlBd1hHNGdJQ0FnZUM1amIyMXdZWEpsS0VWRFgwZFNUMVZRWDA5U1JFVlNLU0E4SURBZ0x5OGdQQ0JIWEc1OVhHNWNibVoxYm1OMGFXOXVJR2x6VTJsbmJtRjBkWEpsSUNoMllXeDFaU2tnZTF4dUlDQmpiMjV6ZENCeUlEMGdkbUZzZFdVdWMyeHBZMlVvTUN3Z016SXBYRzRnSUdOdmJuTjBJSE1nUFNCMllXeDFaUzV6YkdsalpTZ3pNaXdnTmpRcFhHNGdJSEpsZEhWeWJpQkNkV1ptWlhJdWFYTkNkV1ptWlhJb2RtRnNkV1VwSUNZbUlIWmhiSFZsTG14bGJtZDBhQ0E5UFQwZ05qUWdKaVpjYmlBZ0lDQnlMbU52YlhCaGNtVW9SVU5mUjFKUFZWQmZUMUpFUlZJcElEd2dNQ0FtSmx4dUlDQWdJSE11WTI5dGNHRnlaU2hGUTE5SFVrOVZVRjlQVWtSRlVpa2dQQ0F3WEc1OVhHNWNibVoxYm1OMGFXOXVJR0Z6YzNWdFpVTnZiWEJ5WlhOemFXOXVJQ2gyWVd4MVpTd2djSFZpYTJWNUtTQjdYRzRnSUdsbUlDaDJZV3gxWlNBOVBUMGdkVzVrWldacGJtVmtJQ1ltSUhCMVltdGxlU0FoUFQwZ2RXNWtaV1pwYm1Wa0tTQnlaWFIxY200Z1gxOXBjMUJ2YVc1MFEyOXRjSEpsYzNObFpDaHdkV0pyWlhrcFhHNGdJR2xtSUNoMllXeDFaU0E5UFQwZ2RXNWtaV1pwYm1Wa0tTQnlaWFIxY200Z2RISjFaVnh1SUNCeVpYUjFjbTRnZG1Gc2RXVmNibjFjYmx4dVpuVnVZM1JwYjI0Z1puSnZiVUoxWm1abGNpQW9aQ2tnZXlCeVpYUjFjbTRnYm1WM0lFSk9LR1FwSUgxY2JtWjFibU4wYVc5dUlIUnZRblZtWm1WeUlDaGtLU0I3SUhKbGRIVnliaUJrTG5SdlFYSnlZWGxNYVd0bEtFSjFabVpsY2l3Z0oySmxKeXdnTXpJcElIMWNibVoxYm1OMGFXOXVJR1JsWTI5a1pVWnliMjBnS0ZBcElIc2djbVYwZFhKdUlITmxZM0F5TlRack1TNWpkWEoyWlM1a1pXTnZaR1ZRYjJsdWRDaFFLU0I5WEc1bWRXNWpkR2x2YmlCblpYUkZibU52WkdWa0lDaFFMQ0JqYjIxd2NtVnpjMlZrS1NCN0lISmxkSFZ5YmlCQ2RXWm1aWEl1Wm5KdmJTaFFMbDlsYm1OdlpHVW9ZMjl0Y0hKbGMzTmxaQ2twSUgxY2JseHVablZ1WTNScGIyNGdjRzlwYm5SQlpHUWdLSEJCTENCd1Fpd2dYMTlqYjIxd2NtVnpjMlZrS1NCN1hHNGdJR2xtSUNnaGFYTlFiMmx1ZENod1FTa3BJSFJvY205M0lHNWxkeUJVZVhCbFJYSnliM0lvVkVoU1QxZGZRa0ZFWDFCUFNVNVVLVnh1SUNCcFppQW9JV2x6VUc5cGJuUW9jRUlwS1NCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGUklVazlYWDBKQlJGOVFUMGxPVkNsY2JseHVJQ0JqYjI1emRDQmhJRDBnWkdWamIyUmxSbkp2YlNod1FTbGNiaUFnWTI5dWMzUWdZaUE5SUdSbFkyOWtaVVp5YjIwb2NFSXBYRzRnSUdOdmJuTjBJSEJ3SUQwZ1lTNWhaR1FvWWlsY2JpQWdhV1lnS0hCd0xtbHpTVzVtYVc1cGRIa29LU2tnY21WMGRYSnVJRzUxYkd4Y2JseHVJQ0JqYjI1emRDQmpiMjF3Y21WemMyVmtJRDBnWVhOemRXMWxRMjl0Y0hKbGMzTnBiMjRvWDE5amIyMXdjbVZ6YzJWa0xDQndRU2xjYmlBZ2NtVjBkWEp1SUdkbGRFVnVZMjlrWldRb2NIQXNJR052YlhCeVpYTnpaV1FwWEc1OVhHNWNibVoxYm1OMGFXOXVJSEJ2YVc1MFFXUmtVMk5oYkdGeUlDaHdMQ0IwZDJWaGF5d2dYMTlqYjIxd2NtVnpjMlZrS1NCN1hHNGdJR2xtSUNnaGFYTlFiMmx1ZENod0tTa2dkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhVU0ZKUFYxOUNRVVJmVUU5SlRsUXBYRzRnSUdsbUlDZ2hhWE5QY21SbGNsTmpZV3hoY2loMGQyVmhheWtwSUhSb2NtOTNJRzVsZHlCVWVYQmxSWEp5YjNJb1ZFaFNUMWRmUWtGRVgxUlhSVUZMS1Z4dVhHNGdJR052Ym5OMElHTnZiWEJ5WlhOelpXUWdQU0JoYzNOMWJXVkRiMjF3Y21WemMybHZiaWhmWDJOdmJYQnlaWE56WldRc0lIQXBYRzRnSUdOdmJuTjBJSEJ3SUQwZ1pHVmpiMlJsUm5KdmJTaHdLVnh1SUNCcFppQW9kSGRsWVdzdVkyOXRjR0Z5WlNoYVJWSlBNeklwSUQwOVBTQXdLU0J5WlhSMWNtNGdaMlYwUlc1amIyUmxaQ2h3Y0N3Z1kyOXRjSEpsYzNObFpDbGNibHh1SUNCamIyNXpkQ0IwZENBOUlHWnliMjFDZFdabVpYSW9kSGRsWVdzcFhHNGdJR052Ym5OMElIRnhJRDBnUnk1dGRXd29kSFFwWEc0Z0lHTnZibk4wSUhWMUlEMGdjSEF1WVdSa0tIRnhLVnh1SUNCcFppQW9kWFV1YVhOSmJtWnBibWwwZVNncEtTQnlaWFIxY200Z2JuVnNiRnh1WEc0Z0lISmxkSFZ5YmlCblpYUkZibU52WkdWa0tIVjFMQ0JqYjIxd2NtVnpjMlZrS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJ3YjJsdWRFTnZiWEJ5WlhOeklDaHdMQ0JmWDJOdmJYQnlaWE56WldRcElIdGNiaUFnYVdZZ0tDRnBjMUJ2YVc1MEtIQXBLU0IwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0ZSSVVrOVhYMEpCUkY5UVQwbE9WQ2xjYmx4dUlDQmpiMjV6ZENCd2NDQTlJR1JsWTI5a1pVWnliMjBvY0NsY2JpQWdhV1lnS0hCd0xtbHpTVzVtYVc1cGRIa29LU2tnZEdoeWIzY2dibVYzSUZSNWNHVkZjbkp2Y2loVVNGSlBWMTlDUVVSZlVFOUpUbFFwWEc1Y2JpQWdZMjl1YzNRZ1kyOXRjSEpsYzNObFpDQTlJR0Z6YzNWdFpVTnZiWEJ5WlhOemFXOXVLRjlmWTI5dGNISmxjM05sWkN3Z2NDbGNibHh1SUNCeVpYUjFjbTRnWjJWMFJXNWpiMlJsWkNod2NDd2dZMjl0Y0hKbGMzTmxaQ2xjYm4xY2JseHVablZ1WTNScGIyNGdjRzlwYm5SR2NtOXRVMk5oYkdGeUlDaGtMQ0JmWDJOdmJYQnlaWE56WldRcElIdGNiaUFnYVdZZ0tDRnBjMUJ5YVhaaGRHVW9aQ2twSUhSb2NtOTNJRzVsZHlCVWVYQmxSWEp5YjNJb1ZFaFNUMWRmUWtGRVgxQlNTVlpCVkVVcFhHNWNiaUFnWTI5dWMzUWdaR1FnUFNCbWNtOXRRblZtWm1WeUtHUXBYRzRnSUdOdmJuTjBJSEJ3SUQwZ1J5NXRkV3dvWkdRcFhHNGdJR2xtSUNod2NDNXBjMGx1Wm1sdWFYUjVLQ2twSUhKbGRIVnliaUJ1ZFd4c1hHNWNiaUFnWTI5dWMzUWdZMjl0Y0hKbGMzTmxaQ0E5SUdGemMzVnRaVU52YlhCeVpYTnphVzl1S0Y5ZlkyOXRjSEpsYzNObFpDbGNiaUFnY21WMGRYSnVJR2RsZEVWdVkyOWtaV1FvY0hBc0lHTnZiWEJ5WlhOelpXUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlIQnZhVzUwVFhWc2RHbHdiSGtnS0hBc0lIUjNaV0ZyTENCZlgyTnZiWEJ5WlhOelpXUXBJSHRjYmlBZ2FXWWdLQ0ZwYzFCdmFXNTBLSEFwS1NCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGUklVazlYWDBKQlJGOVFUMGxPVkNsY2JpQWdhV1lnS0NGcGMwOXlaR1Z5VTJOaGJHRnlLSFIzWldGcktTa2dkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhVU0ZKUFYxOUNRVVJmVkZkRlFVc3BYRzVjYmlBZ1kyOXVjM1FnWTI5dGNISmxjM05sWkNBOUlHRnpjM1Z0WlVOdmJYQnlaWE56YVc5dUtGOWZZMjl0Y0hKbGMzTmxaQ3dnY0NsY2JpQWdZMjl1YzNRZ2NIQWdQU0JrWldOdlpHVkdjbTl0S0hBcFhHNGdJR052Ym5OMElIUjBJRDBnWm5KdmJVSjFabVpsY2loMGQyVmhheWxjYmlBZ1kyOXVjM1FnY1hFZ1BTQndjQzV0ZFd3b2RIUXBYRzRnSUdsbUlDaHhjUzVwYzBsdVptbHVhWFI1S0NrcElISmxkSFZ5YmlCdWRXeHNYRzVjYmlBZ2NtVjBkWEp1SUdkbGRFVnVZMjlrWldRb2NYRXNJR052YlhCeVpYTnpaV1FwWEc1OVhHNWNibVoxYm1OMGFXOXVJSEJ5YVhaaGRHVkJaR1FnS0dRc0lIUjNaV0ZyS1NCN1hHNGdJR2xtSUNnaGFYTlFjbWwyWVhSbEtHUXBLU0IwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0ZSSVVrOVhYMEpCUkY5UVVrbFdRVlJGS1Z4dUlDQnBaaUFvSVdselQzSmtaWEpUWTJGc1lYSW9kSGRsWVdzcEtTQjBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLRlJJVWs5WFgwSkJSRjlVVjBWQlN5bGNibHh1SUNCamIyNXpkQ0JrWkNBOUlHWnliMjFDZFdabVpYSW9aQ2xjYmlBZ1kyOXVjM1FnZEhRZ1BTQm1jbTl0UW5WbVptVnlLSFIzWldGcktWeHVJQ0JqYjI1emRDQmtkQ0E5SUhSdlFuVm1abVZ5S0dSa0xtRmtaQ2gwZENrdWRXMXZaQ2h1S1NsY2JpQWdhV1lnS0NGcGMxQnlhWFpoZEdVb1pIUXBLU0J5WlhSMWNtNGdiblZzYkZ4dVhHNGdJSEpsZEhWeWJpQmtkRnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQndjbWwyWVhSbFUzVmlJQ2hrTENCMGQyVmhheWtnZTF4dUlDQnBaaUFvSVdselVISnBkbUYwWlNoa0tTa2dkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhVU0ZKUFYxOUNRVVJmVUZKSlZrRlVSU2xjYmlBZ2FXWWdLQ0ZwYzA5eVpHVnlVMk5oYkdGeUtIUjNaV0ZyS1NrZ2RHaHliM2NnYm1WM0lGUjVjR1ZGY25KdmNpaFVTRkpQVjE5Q1FVUmZWRmRGUVVzcFhHNWNiaUFnWTI5dWMzUWdaR1FnUFNCbWNtOXRRblZtWm1WeUtHUXBYRzRnSUdOdmJuTjBJSFIwSUQwZ1puSnZiVUoxWm1abGNpaDBkMlZoYXlsY2JpQWdZMjl1YzNRZ1pIUWdQU0IwYjBKMVptWmxjaWhrWkM1emRXSW9kSFFwTG5WdGIyUW9iaWtwWEc0Z0lHbG1JQ2doYVhOUWNtbDJZWFJsS0dSMEtTa2djbVYwZFhKdUlHNTFiR3hjYmx4dUlDQnlaWFIxY200Z1pIUmNibjFjYmx4dVpuVnVZM1JwYjI0Z2MybG5iaUFvYUdGemFDd2dlQ2tnZTF4dUlDQnlaWFIxY200Z1gxOXphV2R1S0doaGMyZ3NJSGdwWEc1OVhHNWNibVoxYm1OMGFXOXVJSE5wWjI1WGFYUm9SVzUwY205d2VTQW9hR0Z6YUN3Z2VDd2dZV1JrUkdGMFlTa2dlMXh1SUNCeVpYUjFjbTRnWDE5emFXZHVLR2hoYzJnc0lIZ3NJR0ZrWkVSaGRHRXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOWZjMmxuYmlBb2FHRnphQ3dnZUN3Z1lXUmtSR0YwWVNrZ2UxeHVJQ0JwWmlBb0lXbHpVMk5oYkdGeUtHaGhjMmdwS1NCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGUklVazlYWDBKQlJGOUlRVk5JS1Z4dUlDQnBaaUFvSVdselVISnBkbUYwWlNoNEtTa2dkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhVU0ZKUFYxOUNRVVJmVUZKSlZrRlVSU2xjYmlBZ2FXWWdLR0ZrWkVSaGRHRWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQWhhWE5UWTJGc1lYSW9ZV1JrUkdGMFlTa3BJSFJvY205M0lHNWxkeUJVZVhCbFJYSnliM0lvVkVoU1QxZGZRa0ZFWDBWWVZGSkJYMFJCVkVFcFhHNWNiaUFnWTI5dWMzUWdaQ0E5SUdaeWIyMUNkV1ptWlhJb2VDbGNiaUFnWTI5dWMzUWdaU0E5SUdaeWIyMUNkV1ptWlhJb2FHRnphQ2xjYmx4dUlDQnNaWFFnY2l3Z2MxeHVJQ0JqYjI1emRDQmphR1ZqYTFOcFp5QTlJR1oxYm1OMGFXOXVJQ2hyS1NCN1hHNGdJQ0FnWTI5dWMzUWdhMGtnUFNCbWNtOXRRblZtWm1WeUtHc3BYRzRnSUNBZ1kyOXVjM1FnVVNBOUlFY3ViWFZzS0d0SktWeHVYRzRnSUNBZ2FXWWdLRkV1YVhOSmJtWnBibWwwZVNncEtTQnlaWFIxY200Z1ptRnNjMlZjYmx4dUlDQWdJSElnUFNCUkxuZ3VkVzF2WkNodUtWeHVJQ0FnSUdsbUlDaHlMbWx6V21WeWJ5Z3BJRDA5UFNBd0tTQnlaWFIxY200Z1ptRnNjMlZjYmx4dUlDQWdJSE1nUFNCclNWeHVJQ0FnSUNBZ0xtbHVkbTBvYmlsY2JpQWdJQ0FnSUM1dGRXd29aUzVoWkdRb1pDNXRkV3dvY2lrcEtWeHVJQ0FnSUNBZ0xuVnRiMlFvYmlsY2JpQWdJQ0JwWmlBb2N5NXBjMXBsY204b0tTQTlQVDBnTUNrZ2NtVjBkWEp1SUdaaGJITmxYRzVjYmlBZ0lDQnlaWFIxY200Z2RISjFaVnh1SUNCOVhHNWNiaUFnWkdWMFpYSnRhVzVwYzNScFkwZGxibVZ5WVhSbFN5aG9ZWE5vTENCNExDQmphR1ZqYTFOcFp5d2dhWE5RY21sMllYUmxMQ0JoWkdSRVlYUmhLVnh1WEc0Z0lDOHZJR1Z1Wm05eVkyVWdiRzkzSUZNZ2RtRnNkV1Z6TENCelpXVWdZbWx3TmpJNklDZHNiM2NnY3lCMllXeDFaWE1nYVc0Z2MybG5ibUYwZFhKbGN5ZGNiaUFnYVdZZ0tITXVZMjF3S0c1RWFYWXlLU0ErSURBcElIdGNiaUFnSUNCeklEMGdiaTV6ZFdJb2N5bGNiaUFnZlZ4dVhHNGdJR052Ym5OMElHSjFabVpsY2lBOUlFSjFabVpsY2k1aGJHeHZZMVZ1YzJGbVpTZzJOQ2xjYmlBZ2RHOUNkV1ptWlhJb2Npa3VZMjl3ZVNoaWRXWm1aWElzSURBcFhHNGdJSFJ2UW5WbVptVnlLSE1wTG1OdmNIa29ZblZtWm1WeUxDQXpNaWxjYmlBZ2NtVjBkWEp1SUdKMVptWmxjbHh1ZlZ4dVhHNW1kVzVqZEdsdmJpQjJaWEpwWm5rZ0tHaGhjMmdzSUhFc0lITnBaMjVoZEhWeVpTd2djM1J5YVdOMEtTQjdYRzRnSUdsbUlDZ2hhWE5UWTJGc1lYSW9hR0Z6YUNrcElIUm9jbTkzSUc1bGR5QlVlWEJsUlhKeWIzSW9WRWhTVDFkZlFrRkVYMGhCVTBncFhHNGdJR2xtSUNnaGFYTlFiMmx1ZENoeEtTa2dkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhVU0ZKUFYxOUNRVVJmVUU5SlRsUXBYRzVjYmlBZ0x5OGdNUzQwTGpFZ1JXNW1iM0pqWlNCeUlHRnVaQ0J6SUdGeVpTQmliM1JvSUdsdWRHVm5aWEp6SUdsdUlIUm9aU0JwYm5SbGNuWmhiQ0JiTVN3Z2JpRGlpSklnTVYwZ0tERXNJR2x6VTJsbmJtRjBkWEpsSUdWdVptOXlZMlZ6SUNjOElHNGdMU0F4SnlsY2JpQWdhV1lnS0NGcGMxTnBaMjVoZEhWeVpTaHphV2R1WVhSMWNtVXBLU0IwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0ZSSVVrOVhYMEpCUkY5VFNVZE9RVlJWVWtVcFhHNWNiaUFnWTI5dWMzUWdVU0E5SUdSbFkyOWtaVVp5YjIwb2NTbGNiaUFnWTI5dWMzUWdjaUE5SUdaeWIyMUNkV1ptWlhJb2MybG5ibUYwZFhKbExuTnNhV05sS0RBc0lETXlLU2xjYmlBZ1kyOXVjM1FnY3lBOUlHWnliMjFDZFdabVpYSW9jMmxuYm1GMGRYSmxMbk5zYVdObEtETXlMQ0EyTkNrcFhHNWNiaUFnYVdZZ0tITjBjbWxqZENBbUppQnpMbU50Y0NodVJHbDJNaWtnUGlBd0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUgxY2JseHVJQ0F2THlBeExqUXVNU0JGYm1admNtTmxJSElnWVc1a0lITWdZWEpsSUdKdmRHZ2dhVzUwWldkbGNuTWdhVzRnZEdobElHbHVkR1Z5ZG1Gc0lGc3hMQ0J1SU9LSWtpQXhYU0FvTWl3Z1pXNW1iM0pqWlhNZ0p6NGdNQ2NwWEc0Z0lHbG1JQ2h5TG1kMGJpZ3dLU0E4UFNBd0lDOHFJSHg4SUhJdVkyOXRjR0Z5WlZSdktHNHBJRDQ5SURBZ0tpOHBJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQnBaaUFvY3k1bmRHNG9NQ2tnUEQwZ01DQXZLaUI4ZkNCekxtTnZiWEJoY21WVWJ5aHVLU0ErUFNBd0lDb3ZLU0J5WlhSMWNtNGdabUZzYzJWY2JseHVJQ0F2THlBeExqUXVNaUJJSUQwZ1NHRnphQ2hOS1N3Z1lXeHlaV0ZrZVNCa2IyNWxJR0o1SUhSb1pTQjFjMlZ5WEc0Z0lDOHZJREV1TkM0eklHVWdQU0JJWEc0Z0lHTnZibk4wSUdVZ1BTQm1jbTl0UW5WbVptVnlLR2hoYzJncFhHNWNiaUFnTHk4Z1EyOXRjSFYwWlNCelhpMHhYRzRnSUdOdmJuTjBJSE5KYm5ZZ1BTQnpMbWx1ZG0wb2JpbGNibHh1SUNBdkx5QXhMalF1TkNCRGIyMXdkWFJsSUhVeElEMGdaWE5lNG9pU01TQnRiMlFnYmx4dUlDQXZMeUFnSUNBZ0lDQWdJQ0FnSUNBZ0lIVXlJRDBnY25OZTRvaVNNU0J0YjJRZ2JseHVJQ0JqYjI1emRDQjFNU0E5SUdVdWJYVnNLSE5KYm5ZcExuVnRiMlFvYmlsY2JpQWdZMjl1YzNRZ2RUSWdQU0J5TG0xMWJDaHpTVzUyS1M1MWJXOWtLRzRwWEc1Y2JpQWdMeThnTVM0MExqVWdRMjl0Y0hWMFpTQlNJRDBnS0hoU0xDQjVVaWxjYmlBZ0x5OGdJQ0FnSUNBZ0lDQWdJQ0FnSUNCU0lEMGdkVEZISUNzZ2RUSlJYRzRnSUdOdmJuTjBJRklnUFNCSExtMTFiRUZrWkNoMU1Td2dVU3dnZFRJcFhHNWNiaUFnTHk4Z01TNDBMalVnS0dOdmJuUXVLU0JGYm1admNtTmxJRklnYVhNZ2JtOTBJR0YwSUdsdVptbHVhWFI1WEc0Z0lHbG1JQ2hTTG1selNXNW1hVzVwZEhrb0tTa2djbVYwZFhKdUlHWmhiSE5sWEc1Y2JpQWdMeThnTVM0MExqWWdRMjl1ZG1WeWRDQjBhR1VnWm1sbGJHUWdaV3hsYldWdWRDQlNMbmdnZEc4Z1lXNGdhVzUwWldkbGNseHVJQ0JqYjI1emRDQjRVaUE5SUZJdWVGeHVYRzRnSUM4dklERXVOQzQzSUZObGRDQjJJRDBnZUZJZ2JXOWtJRzVjYmlBZ1kyOXVjM1FnZGlBOUlIaFNMblZ0YjJRb2JpbGNibHh1SUNBdkx5QXhMalF1T0NCSlppQjJJRDBnY2l3Z2IzVjBjSFYwSUZ3aWRtRnNhV1JjSWl3Z1lXNWtJR2xtSUhZZ0lUMGdjaXdnYjNWMGNIVjBJRndpYVc1MllXeHBaRndpWEc0Z0lISmxkSFZ5YmlCMkxtVnhLSElwWEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdlMXh1SUNCcGMxQnZhVzUwTEZ4dUlDQnBjMUJ2YVc1MFEyOXRjSEpsYzNObFpDeGNiaUFnYVhOUWNtbDJZWFJsTEZ4dUlDQndiMmx1ZEVGa1pDeGNiaUFnY0c5cGJuUkJaR1JUWTJGc1lYSXNYRzRnSUhCdmFXNTBRMjl0Y0hKbGMzTXNYRzRnSUhCdmFXNTBSbkp2YlZOallXeGhjaXhjYmlBZ2NHOXBiblJOZFd4MGFYQnNlU3hjYmlBZ2NISnBkbUYwWlVGa1pDeGNiaUFnY0hKcGRtRjBaVk4xWWl4Y2JpQWdjMmxuYml4Y2JpQWdjMmxuYmxkcGRHaEZiblJ5YjNCNUxGeHVJQ0IyWlhKcFpubGNibjFjYmlJc0ltTnZibk4wSUdOeVpXRjBaVWh0WVdNZ1BTQnlaWEYxYVhKbEtDZGpjbVZoZEdVdGFHMWhZeWNwWEc1Y2JtTnZibk4wSUU5T1JURWdQU0JDZFdabVpYSXVZV3hzYjJNb01Td2dNU2xjYm1OdmJuTjBJRnBGVWs4eElEMGdRblZtWm1WeUxtRnNiRzlqS0RFc0lEQXBYRzVjYmk4dklHaDBkSEJ6T2k4dmRHOXZiSE11YVdWMFppNXZjbWN2YUhSdGJDOXlabU0yT1RjNUkzTmxZM1JwYjI0dE15NHlYRzVtZFc1amRHbHZiaUJrWlhSbGNtMXBibWx6ZEdsalIyVnVaWEpoZEdWTElDaG9ZWE5vTENCNExDQmphR1ZqYTFOcFp5d2dhWE5RY21sMllYUmxMQ0JsZUhSeVlVVnVkSEp2Y0hrcElIdGNiaUFnTHk4Z1UzUmxjQ0JCTENCcFoyNXZjbVZrSUdGeklHaGhjMmdnWVd4eVpXRmtlU0J3Y205MmFXUmxaRnh1SUNBdkx5QlRkR1Z3SUVKY2JpQWdMeThnVTNSbGNDQkRYRzRnSUd4bGRDQnJJRDBnUW5WbVptVnlMbUZzYkc5aktETXlMQ0F3S1Z4dUlDQnNaWFFnZGlBOUlFSjFabVpsY2k1aGJHeHZZeWd6TWl3Z01TbGNibHh1SUNBdkx5QlRkR1Z3SUVSY2JpQWdheUE5SUdOeVpXRjBaVWh0WVdNb0ozTm9ZVEkxTmljc0lHc3BYRzRnSUNBZ0xuVndaR0YwWlNoMktWeHVJQ0FnSUM1MWNHUmhkR1VvV2tWU1R6RXBYRzRnSUNBZ0xuVndaR0YwWlNoNEtWeHVJQ0FnSUM1MWNHUmhkR1VvYUdGemFDbGNiaUFnSUNBdWRYQmtZWFJsS0dWNGRISmhSVzUwY205d2VTQjhmQ0FuSnlsY2JpQWdJQ0F1WkdsblpYTjBLQ2xjYmx4dUlDQXZMeUJUZEdWd0lFVmNiaUFnZGlBOUlHTnlaV0YwWlVodFlXTW9KM05vWVRJMU5pY3NJR3NwTG5Wd1pHRjBaU2gyS1M1a2FXZGxjM1FvS1Z4dVhHNGdJQzh2SUZOMFpYQWdSbHh1SUNCcklEMGdZM0psWVhSbFNHMWhZeWduYzJoaE1qVTJKeXdnYXlsY2JpQWdJQ0F1ZFhCa1lYUmxLSFlwWEc0Z0lDQWdMblZ3WkdGMFpTaFBUa1V4S1Z4dUlDQWdJQzUxY0dSaGRHVW9lQ2xjYmlBZ0lDQXVkWEJrWVhSbEtHaGhjMmdwWEc0Z0lDQWdMblZ3WkdGMFpTaGxlSFJ5WVVWdWRISnZjSGtnZkh3Z0p5Y3BYRzRnSUNBZ0xtUnBaMlZ6ZENncFhHNWNiaUFnTHk4Z1UzUmxjQ0JIWEc0Z0lIWWdQU0JqY21WaGRHVkliV0ZqS0NkemFHRXlOVFluTENCcktTNTFjR1JoZEdVb2Rpa3VaR2xuWlhOMEtDbGNibHh1SUNBdkx5QlRkR1Z3SUVneEwwZ3lZU3dnYVdkdWIzSmxaQ0JoY3lCMGJHVnVJRDA5UFNCeGJHVnVJQ2d5TlRZZ1ltbDBLVnh1SUNBdkx5QlRkR1Z3SUVneVlseHVJQ0IySUQwZ1kzSmxZWFJsU0cxaFl5Z25jMmhoTWpVMkp5d2dheWt1ZFhCa1lYUmxLSFlwTG1ScFoyVnpkQ2dwWEc1Y2JpQWdiR1YwSUZRZ1BTQjJYRzVjYmlBZ0x5OGdVM1JsY0NCSU15d2djbVZ3WldGMElIVnVkR2xzSUZRZ2FYTWdkMmwwYUdsdUlIUm9aU0JwYm5SbGNuWmhiQ0JiTVN3Z2JpQXRJREZkSUdGdVpDQnBjeUJ6ZFdsMFlXSnNaU0JtYjNJZ1JVTkVVMEZjYmlBZ2QyaHBiR1VnS0NGcGMxQnlhWFpoZEdVb1ZDa2dmSHdnSVdOb1pXTnJVMmxuS0ZRcEtTQjdYRzRnSUNBZ2F5QTlJR055WldGMFpVaHRZV01vSjNOb1lUSTFOaWNzSUdzcFhHNGdJQ0FnSUNBdWRYQmtZWFJsS0hZcFhHNGdJQ0FnSUNBdWRYQmtZWFJsS0ZwRlVrOHhLVnh1SUNBZ0lDQWdMbVJwWjJWemRDZ3BYRzVjYmlBZ0lDQjJJRDBnWTNKbFlYUmxTRzFoWXlnbmMyaGhNalUySnl3Z2F5a3VkWEJrWVhSbEtIWXBMbVJwWjJWemRDZ3BYRzVjYmlBZ0lDQXZMeUJUZEdWd0lFZ3hMMGd5WVN3Z1lXZGhhVzRzSUdsbmJtOXlaV1FnWVhNZ2RHeGxiaUE5UFQwZ2NXeGxiaUFvTWpVMklHSnBkQ2xjYmlBZ0lDQXZMeUJUZEdWd0lFZ3lZaUJoWjJGcGJseHVJQ0FnSUhZZ1BTQmpjbVZoZEdWSWJXRmpLQ2R6YUdFeU5UWW5MQ0JyS1M1MWNHUmhkR1VvZGlrdVpHbG5aWE4wS0NsY2JpQWdJQ0JVSUQwZ2RseHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlGUmNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCa1pYUmxjbTFwYm1semRHbGpSMlZ1WlhKaGRHVkxYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdaMWJtTjBhVzl1SUhSdlJHRjBZVlpwWlhjZ0tHUmhkR0VwSUh0Y2JpQWdhV1lnS0dSaGRHRWdhVzV6ZEdGdVkyVnZaaUJKYm5RNFFYSnlZWGtnZkh3Z1pHRjBZU0JwYm5OMFlXNWpaVzltSUZWcGJuUTRRWEp5WVhrZ2ZId2daR0YwWVNCcGJuTjBZVzVqWlc5bUlGVnBiblE0UTJ4aGJYQmxaRUZ5Y21GNUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUc1bGR5QkVZWFJoVm1sbGR5aGtZWFJoTG1KMVptWmxjaXdnWkdGMFlTNWllWFJsVDJabWMyVjBMQ0JrWVhSaExtSjVkR1ZNWlc1bmRHZ3BYRzRnSUgxY2JseHVJQ0JwWmlBb1pHRjBZU0JwYm5OMFlXNWpaVzltSUVGeWNtRjVRblZtWm1WeUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUc1bGR5QkVZWFJoVm1sbGR5aGtZWFJoS1Z4dUlDQjlYRzVjYmlBZ2RHaHliM2NnYm1WM0lGUjVjR1ZGY25KdmNpZ25SWGh3WldOMFpXUWdZR1JoZEdGZ0lIUnZJR0psSUdGdUlFRnljbUY1UW5WbVptVnlMQ0JDZFdabVpYSXNJRWx1ZERoQmNuSmhlU3dnVldsdWREaEJjbkpoZVNCdmNpQlZhVzUwT0VOc1lXMXdaV1JCY25KaGVTY3BYRzU5WEc0aUxDSXZMeUJYY21sMGRHVnVJR2x1SURJd01UUXRNakF4TmlCaWVTQkViV2wwY25rZ1EyaGxjM1J1ZVd0b0lHRnVaQ0JFWlhacElFMWhibVJwY21rdVhHNHZMeUJRZFdKc2FXTWdaRzl0WVdsdUxseHVLR1oxYm1OMGFXOXVLSEp2YjNRc0lHWXBJSHRjYmlBZ0ozVnpaU0J6ZEhKcFkzUW5PMXh1SUNCcFppQW9kSGx3Wlc5bUlHMXZaSFZzWlNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ2JXOWtkV3hsTG1WNGNHOXlkSE1wSUcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWmlncE8xeHVJQ0JsYkhObElHbG1JQ2h5YjI5MExtNWhZMndwSUhKdmIzUXVibUZqYkM1MWRHbHNJRDBnWmlncE8xeHVJQ0JsYkhObElIdGNiaUFnSUNCeWIyOTBMbTVoWTJ3Z1BTQjdmVHRjYmlBZ0lDQnliMjkwTG01aFkyd3VkWFJwYkNBOUlHWW9LVHRjYmlBZ2ZWeHVmU2gwYUdsekxDQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0ozVnpaU0J6ZEhKcFkzUW5PMXh1WEc0Z0lIWmhjaUIxZEdsc0lEMGdlMzA3WEc1Y2JpQWdablZ1WTNScGIyNGdkbUZzYVdSaGRHVkNZWE5sTmpRb2N5a2dlMXh1SUNBZ0lHbG1JQ2doS0M5ZUtEODZXMEV0V21FdGVqQXRPU3RjWEM5ZGV6SjlXMEV0V21FdGVqQXRPU3RjWEM5ZGV6SjlLU29vUHpwYlFTMWFZUzE2TUMwNUsxeGNMMTE3TW4wOVBYeGJRUzFhWVMxNk1DMDVLMXhjTDExN00zMDlLVDhrTHk1MFpYTjBLSE1wS1NrZ2UxeHVJQ0FnSUNBZ2RHaHliM2NnYm1WM0lGUjVjR1ZGY25KdmNpZ25hVzUyWVd4cFpDQmxibU52WkdsdVp5Y3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSFYwYVd3dVpHVmpiMlJsVlZSR09DQTlJR1oxYm1OMGFXOXVLSE1wSUh0Y2JpQWdJQ0JwWmlBb2RIbHdaVzltSUhNZ0lUMDlJQ2R6ZEhKcGJtY25LU0IwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0NkbGVIQmxZM1JsWkNCemRISnBibWNuS1R0Y2JpQWdJQ0IyWVhJZ2FTd2daQ0E5SUhWdVpYTmpZWEJsS0dWdVkyOWtaVlZTU1VOdmJYQnZibVZ1ZENoektTa3NJR0lnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hrTG14bGJtZDBhQ2s3WEc0Z0lDQWdabTl5SUNocElEMGdNRHNnYVNBOElHUXViR1Z1WjNSb095QnBLeXNwSUdKYmFWMGdQU0JrTG1Ob1lYSkRiMlJsUVhRb2FTazdYRzRnSUNBZ2NtVjBkWEp1SUdJN1hHNGdJSDA3WEc1Y2JpQWdkWFJwYkM1bGJtTnZaR1ZWVkVZNElEMGdablZ1WTNScGIyNG9ZWEp5S1NCN1hHNGdJQ0FnZG1GeUlHa3NJSE1nUFNCYlhUdGNiaUFnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnWVhKeUxteGxibWQwYURzZ2FTc3JLU0J6TG5CMWMyZ29VM1J5YVc1bkxtWnliMjFEYUdGeVEyOWtaU2hoY25KYmFWMHBLVHRjYmlBZ0lDQnlaWFIxY200Z1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtHVnpZMkZ3WlNoekxtcHZhVzRvSnljcEtTazdYRzRnSUgwN1hHNWNiaUFnYVdZZ0tIUjVjR1Z2WmlCaGRHOWlJRDA5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNBZ0lDOHZJRTV2WkdVdWFuTmNibHh1SUNBZ0lHbG1JQ2gwZVhCbGIyWWdRblZtWm1WeUxtWnliMjBnSVQwOUlDZDFibVJsWm1sdVpXUW5LU0I3WEc0Z0lDQWdJQ0FnTHk4Z1RtOWtaU0IyTmlCaGJtUWdiR0YwWlhKY2JpQWdJQ0FnSUhWMGFXd3VaVzVqYjJSbFFtRnpaVFkwSUQwZ1puVnVZM1JwYjI0Z0tHRnljaWtnZXlBdkx5QjJOaUJoYm1RZ2JHRjBaWEpjYmlBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnUW5WbVptVnlMbVp5YjIwb1lYSnlLUzUwYjFOMGNtbHVaeWduWW1GelpUWTBKeWs3WEc0Z0lDQWdJQ0I5TzF4dVhHNGdJQ0FnSUNCMWRHbHNMbVJsWTI5a1pVSmhjMlUyTkNBOUlHWjFibU4wYVc5dUlDaHpLU0I3WEc0Z0lDQWdJQ0FnSUhaaGJHbGtZWFJsUW1GelpUWTBLSE1wTzF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnYm1WM0lGVnBiblE0UVhKeVlYa29RWEp5WVhrdWNISnZkRzkwZVhCbExuTnNhV05sTG1OaGJHd29RblZtWm1WeUxtWnliMjBvY3l3Z0oySmhjMlUyTkNjcExDQXdLU2s3WEc0Z0lDQWdJQ0I5TzF4dVhHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQzh2SUU1dlpHVWdaV0Z5YkdsbGNpQjBhR0Z1SUhZMlhHNGdJQ0FnSUNCMWRHbHNMbVZ1WTI5a1pVSmhjMlUyTkNBOUlHWjFibU4wYVc5dUlDaGhjbklwSUhzZ0x5OGdkallnWVc1a0lHeGhkR1Z5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUFvYm1WM0lFSjFabVpsY2loaGNuSXBLUzUwYjFOMGNtbHVaeWduWW1GelpUWTBKeWs3WEc0Z0lDQWdJQ0I5TzF4dVhHNGdJQ0FnSUNCMWRHbHNMbVJsWTI5a1pVSmhjMlUyTkNBOUlHWjFibU4wYVc5dUtITXBJSHRjYmlBZ0lDQWdJQ0FnZG1Gc2FXUmhkR1ZDWVhObE5qUW9jeWs3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ1WlhjZ1ZXbHVkRGhCY25KaGVTaEJjbkpoZVM1d2NtOTBiM1I1Y0dVdWMyeHBZMlV1WTJGc2JDaHVaWGNnUW5WbVptVnlLSE1zSUNkaVlYTmxOalFuS1N3Z01Da3BPMXh1SUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0F2THlCQ2NtOTNjMlZ5YzF4dVhHNGdJQ0FnZFhScGJDNWxibU52WkdWQ1lYTmxOalFnUFNCbWRXNWpkR2x2YmloaGNuSXBJSHRjYmlBZ0lDQWdJSFpoY2lCcExDQnpJRDBnVzEwc0lHeGxiaUE5SUdGeWNpNXNaVzVuZEdnN1hHNGdJQ0FnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYkdWdU95QnBLeXNwSUhNdWNIVnphQ2hUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0dGeWNsdHBYU2twTzF4dUlDQWdJQ0FnY21WMGRYSnVJR0owYjJFb2N5NXFiMmx1S0NjbktTazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lIVjBhV3d1WkdWamIyUmxRbUZ6WlRZMElEMGdablZ1WTNScGIyNG9jeWtnZTF4dUlDQWdJQ0FnZG1Gc2FXUmhkR1ZDWVhObE5qUW9jeWs3WEc0Z0lDQWdJQ0IyWVhJZ2FTd2daQ0E5SUdGMGIySW9jeWtzSUdJZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoa0xteGxibWQwYUNrN1hHNGdJQ0FnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnWkM1c1pXNW5kR2c3SUdrckt5a2dZbHRwWFNBOUlHUXVZMmhoY2tOdlpHVkJkQ2hwS1R0Y2JpQWdJQ0FnSUhKbGRIVnliaUJpTzF4dUlDQWdJSDA3WEc1Y2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCMWRHbHNPMXh1WEc1OUtTazdYRzRpTENJb1puVnVZM1JwYjI0b2JtRmpiQ2tnZTF4dUozVnpaU0J6ZEhKcFkzUW5PMXh1WEc0dkx5QlFiM0owWldRZ2FXNGdNakF4TkNCaWVTQkViV2wwY25rZ1EyaGxjM1J1ZVd0b0lHRnVaQ0JFWlhacElFMWhibVJwY21rdVhHNHZMeUJRZFdKc2FXTWdaRzl0WVdsdUxseHVMeTljYmk4dklFbHRjR3hsYldWdWRHRjBhVzl1SUdSbGNtbDJaV1FnWm5KdmJTQlVkMlZsZEU1aFEyd2dkbVZ5YzJsdmJpQXlNREUwTURReU55NWNiaTh2SUZObFpTQm1iM0lnWkdWMFlXbHNjem9nYUhSMGNEb3ZMM1IzWldWMGJtRmpiQzVqY2k1NWNDNTBieTljYmx4dWRtRnlJR2RtSUQwZ1puVnVZM1JwYjI0b2FXNXBkQ2tnZTF4dUlDQjJZWElnYVN3Z2NpQTlJRzVsZHlCR2JHOWhkRFkwUVhKeVlYa29NVFlwTzF4dUlDQnBaaUFvYVc1cGRDa2dabTl5SUNocElEMGdNRHNnYVNBOElHbHVhWFF1YkdWdVozUm9PeUJwS3lzcElISmJhVjBnUFNCcGJtbDBXMmxkTzF4dUlDQnlaWFIxY200Z2NqdGNibjA3WEc1Y2JpOHZJQ0JRYkhWbloyRmliR1VzSUdsdWFYUnBZV3hwZW1Wa0lHbHVJR2hwWjJndGJHVjJaV3dnUVZCSklHSmxiRzkzTGx4dWRtRnlJSEpoYm1SdmJXSjVkR1Z6SUQwZ1puVnVZM1JwYjI0b0x5b2dlQ3dnYmlBcUx5a2dleUIwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMjV2SUZCU1RrY25LVHNnZlR0Y2JseHVkbUZ5SUY4d0lEMGdibVYzSUZWcGJuUTRRWEp5WVhrb01UWXBPMXh1ZG1GeUlGODVJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29NeklwT3lCZk9Wc3dYU0E5SURrN1hHNWNiblpoY2lCblpqQWdQU0JuWmlncExGeHVJQ0FnSUdkbU1TQTlJR2RtS0ZzeFhTa3NYRzRnSUNBZ1h6RXlNVFkyTlNBOUlHZG1LRnN3ZUdSaU5ERXNJREZkS1N4Y2JpQWdJQ0JFSUQwZ1oyWW9XekI0TnpoaE15d2dNSGd4TXpVNUxDQXdlRFJrWTJFc0lEQjROelZsWWl3Z01IaGtPR0ZpTENBd2VEUXhOREVzSURCNE1HRTBaQ3dnTUhnd01EY3dMQ0F3ZUdVNE9UZ3NJREI0TnpjM09Td2dNSGcwTURjNUxDQXdlRGhqWXpjc0lEQjRabVUzTXl3Z01IZ3lZalptTENBd2VEWmpaV1VzSURCNE5USXdNMTBwTEZ4dUlDQWdJRVF5SUQwZ1oyWW9XekI0WmpFMU9Td2dNSGd5Tm1JeUxDQXdlRGxpT1RRc0lEQjRaV0prTml3Z01IaGlNVFUyTENBd2VEZ3lPRE1zSURCNE1UUTVZU3dnTUhnd01HVXdMQ0F3ZUdReE16QXNJREI0WldWbU15d2dNSGc0TUdZeUxDQXdlREU1T0dVc0lEQjRabU5sTnl3Z01IZzFObVJtTENBd2VHUTVaR01zSURCNE1qUXdObDBwTEZ4dUlDQWdJRmdnUFNCblppaGJNSGhrTlRGaExDQXdlRGhtTWpVc0lEQjRNbVEyTUN3Z01IaGpPVFUyTENBd2VHRTNZaklzSURCNE9UVXlOU3dnTUhoak56WXdMQ0F3ZURZNU1tTXNJREI0WkdNMVl5d2dNSGhtWkdRMkxDQXdlR1V5TXpFc0lEQjRZekJoTkN3Z01IZzFNMlpsTENBd2VHTmtObVVzSURCNE16WmtNeXdnTUhneU1UWTVYU2tzWEc0Z0lDQWdXU0E5SUdkbUtGc3dlRFkyTlRnc0lEQjROalkyTml3Z01IZzJOalkyTENBd2VEWTJOallzSURCNE5qWTJOaXdnTUhnMk5qWTJMQ0F3ZURZMk5qWXNJREI0TmpZMk5pd2dNSGcyTmpZMkxDQXdlRFkyTmpZc0lEQjROalkyTml3Z01IZzJOalkyTENBd2VEWTJOallzSURCNE5qWTJOaXdnTUhnMk5qWTJMQ0F3ZURZMk5qWmRLU3hjYmlBZ0lDQkpJRDBnWjJZb1d6QjRZVEJpTUN3Z01IZzBZVEJsTENBd2VERmlNamNzSURCNFl6UmxaU3dnTUhobE5EYzRMQ0F3ZUdGa01tWXNJREI0TVRnd05pd2dNSGd5WmpRekxDQXdlR1EzWVRjc0lEQjRNMlJtWWl3Z01IZ3dNRGs1TENBd2VESmlOR1FzSURCNFpHWXdZaXdnTUhnMFptTXhMQ0F3ZURJME9EQXNJREI0TW1JNE0xMHBPMXh1WEc1bWRXNWpkR2x2YmlCMGN6WTBLSGdzSUdrc0lHZ3NJR3dwSUh0Y2JpQWdlRnRwWFNBZ0lEMGdLR2dnUGo0Z01qUXBJQ1lnTUhobVpqdGNiaUFnZUZ0cEt6RmRJRDBnS0dnZ1BqNGdNVFlwSUNZZ01IaG1aanRjYmlBZ2VGdHBLekpkSUQwZ0tHZ2dQajRnSURncElDWWdNSGhtWmp0Y2JpQWdlRnRwS3pOZElEMGdhQ0FtSURCNFptWTdYRzRnSUhoYmFTczBYU0E5SUNoc0lENCtJREkwS1NBZ0ppQXdlR1ptTzF4dUlDQjRXMmtyTlYwZ1BTQW9iQ0ErUGlBeE5pa2dJQ1lnTUhobVpqdGNiaUFnZUZ0cEt6WmRJRDBnS0d3Z1BqNGdJRGdwSUNBbUlEQjRabVk3WEc0Z0lIaGJhU3MzWFNBOUlHd2dKaUF3ZUdabU8xeHVmVnh1WEc1bWRXNWpkR2x2YmlCMmJpaDRMQ0I0YVN3Z2VTd2dlV2tzSUc0cElIdGNiaUFnZG1GeUlHa3NaQ0E5SURBN1hHNGdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQnVPeUJwS3lzcElHUWdmRDBnZUZ0NGFTdHBYVjU1VzNscEsybGRPMXh1SUNCeVpYUjFjbTRnS0RFZ0ppQW9LR1FnTFNBeEtTQStQajRnT0NrcElDMGdNVHRjYm4xY2JseHVablZ1WTNScGIyNGdZM0o1Y0hSdlgzWmxjbWxtZVY4eE5paDRMQ0I0YVN3Z2VTd2dlV2twSUh0Y2JpQWdjbVYwZFhKdUlIWnVLSGdzZUdrc2VTeDVhU3d4TmlrN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOeWVYQjBiMTkyWlhKcFpubGZNeklvZUN3Z2VHa3NJSGtzSUhscEtTQjdYRzRnSUhKbGRIVnliaUIyYmloNExIaHBMSGtzZVdrc016SXBPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpiM0psWDNOaGJITmhNakFvYnl3Z2NDd2dheXdnWXlrZ2UxeHVJQ0IyWVhJZ2FqQWdJRDBnWTFzZ01GMGdKaUF3ZUdabUlId2dLR05iSURGZElDWWdNSGhtWmlrOFBEZ2dmQ0FvWTFzZ01sMGdKaUF3ZUdabUtUdzhNVFlnZkNBb1kxc2dNMTBnSmlBd2VHWm1LVHc4TWpRc1hHNGdJQ0FnSUNCcU1TQWdQU0JyV3lBd1hTQW1JREI0Wm1ZZ2ZDQW9hMXNnTVYwZ0ppQXdlR1ptS1R3OE9DQjhJQ2hyV3lBeVhTQW1JREI0Wm1ZcFBEd3hOaUI4SUNocld5QXpYU0FtSURCNFptWXBQRHd5TkN4Y2JpQWdJQ0FnSUdveUlDQTlJR3RiSURSZElDWWdNSGhtWmlCOElDaHJXeUExWFNBbUlEQjRabVlwUER3NElId2dLR3RiSURaZElDWWdNSGhtWmlrOFBERTJJSHdnS0d0YklEZGRJQ1lnTUhobVppazhQREkwTEZ4dUlDQWdJQ0FnYWpNZ0lEMGdhMXNnT0YwZ0ppQXdlR1ptSUh3Z0tHdGJJRGxkSUNZZ01IaG1aaWs4UERnZ2ZDQW9hMXN4TUYwZ0ppQXdlR1ptS1R3OE1UWWdmQ0FvYTFzeE1WMGdKaUF3ZUdabUtUdzhNalFzWEc0Z0lDQWdJQ0JxTkNBZ1BTQnJXekV5WFNBbUlEQjRabVlnZkNBb2Exc3hNMTBnSmlBd2VHWm1LVHc4T0NCOElDaHJXekUwWFNBbUlEQjRabVlwUER3eE5pQjhJQ2hyV3pFMVhTQW1JREI0Wm1ZcFBEd3lOQ3hjYmlBZ0lDQWdJR28xSUNBOUlHTmJJRFJkSUNZZ01IaG1aaUI4SUNoald5QTFYU0FtSURCNFptWXBQRHc0SUh3Z0tHTmJJRFpkSUNZZ01IaG1aaWs4UERFMklId2dLR05iSURkZElDWWdNSGhtWmlrOFBESTBMRnh1SUNBZ0lDQWdhallnSUQwZ2NGc2dNRjBnSmlBd2VHWm1JSHdnS0hCYklERmRJQ1lnTUhobVppazhQRGdnZkNBb2NGc2dNbDBnSmlBd2VHWm1LVHc4TVRZZ2ZDQW9jRnNnTTEwZ0ppQXdlR1ptS1R3OE1qUXNYRzRnSUNBZ0lDQnFOeUFnUFNCd1d5QTBYU0FtSURCNFptWWdmQ0FvY0ZzZ05WMGdKaUF3ZUdabUtUdzhPQ0I4SUNod1d5QTJYU0FtSURCNFptWXBQRHd4TmlCOElDaHdXeUEzWFNBbUlEQjRabVlwUER3eU5DeGNiaUFnSUNBZ0lHbzRJQ0E5SUhCYklEaGRJQ1lnTUhobVppQjhJQ2h3V3lBNVhTQW1JREI0Wm1ZcFBEdzRJSHdnS0hCYk1UQmRJQ1lnTUhobVppazhQREUySUh3Z0tIQmJNVEZkSUNZZ01IaG1aaWs4UERJMExGeHVJQ0FnSUNBZ2Fqa2dJRDBnY0ZzeE1sMGdKaUF3ZUdabUlId2dLSEJiTVROZElDWWdNSGhtWmlrOFBEZ2dmQ0FvY0ZzeE5GMGdKaUF3ZUdabUtUdzhNVFlnZkNBb2NGc3hOVjBnSmlBd2VHWm1LVHc4TWpRc1hHNGdJQ0FnSUNCcU1UQWdQU0JqV3lBNFhTQW1JREI0Wm1ZZ2ZDQW9ZMXNnT1YwZ0ppQXdlR1ptS1R3OE9DQjhJQ2hqV3pFd1hTQW1JREI0Wm1ZcFBEd3hOaUI4SUNoald6RXhYU0FtSURCNFptWXBQRHd5TkN4Y2JpQWdJQ0FnSUdveE1TQTlJR3RiTVRaZElDWWdNSGhtWmlCOElDaHJXekUzWFNBbUlEQjRabVlwUER3NElId2dLR3RiTVRoZElDWWdNSGhtWmlrOFBERTJJSHdnS0d0Yk1UbGRJQ1lnTUhobVppazhQREkwTEZ4dUlDQWdJQ0FnYWpFeUlEMGdhMXN5TUYwZ0ppQXdlR1ptSUh3Z0tHdGJNakZkSUNZZ01IaG1aaWs4UERnZ2ZDQW9hMXN5TWwwZ0ppQXdlR1ptS1R3OE1UWWdmQ0FvYTFzeU0xMGdKaUF3ZUdabUtUdzhNalFzWEc0Z0lDQWdJQ0JxTVRNZ1BTQnJXekkwWFNBbUlEQjRabVlnZkNBb2Exc3lOVjBnSmlBd2VHWm1LVHc4T0NCOElDaHJXekkyWFNBbUlEQjRabVlwUER3eE5pQjhJQ2hyV3pJM1hTQW1JREI0Wm1ZcFBEd3lOQ3hjYmlBZ0lDQWdJR294TkNBOUlHdGJNamhkSUNZZ01IaG1aaUI4SUNocld6STVYU0FtSURCNFptWXBQRHc0SUh3Z0tHdGJNekJkSUNZZ01IaG1aaWs4UERFMklId2dLR3RiTXpGZElDWWdNSGhtWmlrOFBESTBMRnh1SUNBZ0lDQWdhakUxSUQwZ1kxc3hNbDBnSmlBd2VHWm1JSHdnS0dOYk1UTmRJQ1lnTUhobVppazhQRGdnZkNBb1kxc3hORjBnSmlBd2VHWm1LVHc4TVRZZ2ZDQW9ZMXN4TlYwZ0ppQXdlR1ptS1R3OE1qUTdYRzVjYmlBZ2RtRnlJSGd3SUQwZ2FqQXNJSGd4SUQwZ2FqRXNJSGd5SUQwZ2FqSXNJSGd6SUQwZ2FqTXNJSGcwSUQwZ2FqUXNJSGcxSUQwZ2FqVXNJSGcySUQwZ2FqWXNJSGczSUQwZ2FqY3NYRzRnSUNBZ0lDQjRPQ0E5SUdvNExDQjRPU0E5SUdvNUxDQjRNVEFnUFNCcU1UQXNJSGd4TVNBOUlHb3hNU3dnZURFeUlEMGdhakV5TENCNE1UTWdQU0JxTVRNc0lIZ3hOQ0E5SUdveE5DeGNiaUFnSUNBZ0lIZ3hOU0E5SUdveE5Td2dkVHRjYmx4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJREl3T3lCcElDczlJRElwSUh0Y2JpQWdJQ0IxSUQwZ2VEQWdLeUI0TVRJZ2ZDQXdPMXh1SUNBZ0lIZzBJRjQ5SUhVOFBEY2dmQ0IxUGo0K0tETXlMVGNwTzF4dUlDQWdJSFVnUFNCNE5DQXJJSGd3SUh3Z01EdGNiaUFnSUNCNE9DQmVQU0IxUER3NUlId2dkVDQrUGlnek1pMDVLVHRjYmlBZ0lDQjFJRDBnZURnZ0t5QjROQ0I4SURBN1hHNGdJQ0FnZURFeUlGNDlJSFU4UERFeklId2dkVDQrUGlnek1pMHhNeWs3WEc0Z0lDQWdkU0E5SUhneE1pQXJJSGc0SUh3Z01EdGNiaUFnSUNCNE1DQmVQU0IxUER3eE9DQjhJSFUrUGo0b016SXRNVGdwTzF4dVhHNGdJQ0FnZFNBOUlIZzFJQ3NnZURFZ2ZDQXdPMXh1SUNBZ0lIZzVJRjQ5SUhVOFBEY2dmQ0IxUGo0K0tETXlMVGNwTzF4dUlDQWdJSFVnUFNCNE9TQXJJSGcxSUh3Z01EdGNiaUFnSUNCNE1UTWdYajBnZFR3OE9TQjhJSFUrUGo0b016SXRPU2s3WEc0Z0lDQWdkU0E5SUhneE15QXJJSGc1SUh3Z01EdGNiaUFnSUNCNE1TQmVQU0IxUER3eE15QjhJSFUrUGo0b016SXRNVE1wTzF4dUlDQWdJSFVnUFNCNE1TQXJJSGd4TXlCOElEQTdYRzRnSUNBZ2VEVWdYajBnZFR3OE1UZ2dmQ0IxUGo0K0tETXlMVEU0S1R0Y2JseHVJQ0FnSUhVZ1BTQjRNVEFnS3lCNE5pQjhJREE3WEc0Z0lDQWdlREUwSUY0OUlIVThQRGNnZkNCMVBqNCtLRE15TFRjcE8xeHVJQ0FnSUhVZ1BTQjRNVFFnS3lCNE1UQWdmQ0F3TzF4dUlDQWdJSGd5SUY0OUlIVThQRGtnZkNCMVBqNCtLRE15TFRrcE8xeHVJQ0FnSUhVZ1BTQjRNaUFySUhneE5DQjhJREE3WEc0Z0lDQWdlRFlnWGowZ2RUdzhNVE1nZkNCMVBqNCtLRE15TFRFektUdGNiaUFnSUNCMUlEMGdlRFlnS3lCNE1pQjhJREE3WEc0Z0lDQWdlREV3SUY0OUlIVThQREU0SUh3Z2RUNCtQaWd6TWkweE9DazdYRzVjYmlBZ0lDQjFJRDBnZURFMUlDc2dlREV4SUh3Z01EdGNiaUFnSUNCNE15QmVQU0IxUER3M0lId2dkVDQrUGlnek1pMDNLVHRjYmlBZ0lDQjFJRDBnZURNZ0t5QjRNVFVnZkNBd08xeHVJQ0FnSUhnM0lGNDlJSFU4UERrZ2ZDQjFQajQrS0RNeUxUa3BPMXh1SUNBZ0lIVWdQU0I0TnlBcklIZ3pJSHdnTUR0Y2JpQWdJQ0I0TVRFZ1hqMGdkVHc4TVRNZ2ZDQjFQajQrS0RNeUxURXpLVHRjYmlBZ0lDQjFJRDBnZURFeElDc2dlRGNnZkNBd08xeHVJQ0FnSUhneE5TQmVQU0IxUER3eE9DQjhJSFUrUGo0b016SXRNVGdwTzF4dVhHNGdJQ0FnZFNBOUlIZ3dJQ3NnZURNZ2ZDQXdPMXh1SUNBZ0lIZ3hJRjQ5SUhVOFBEY2dmQ0IxUGo0K0tETXlMVGNwTzF4dUlDQWdJSFVnUFNCNE1TQXJJSGd3SUh3Z01EdGNiaUFnSUNCNE1pQmVQU0IxUER3NUlId2dkVDQrUGlnek1pMDVLVHRjYmlBZ0lDQjFJRDBnZURJZ0t5QjRNU0I4SURBN1hHNGdJQ0FnZURNZ1hqMGdkVHc4TVRNZ2ZDQjFQajQrS0RNeUxURXpLVHRjYmlBZ0lDQjFJRDBnZURNZ0t5QjRNaUI4SURBN1hHNGdJQ0FnZURBZ1hqMGdkVHc4TVRnZ2ZDQjFQajQrS0RNeUxURTRLVHRjYmx4dUlDQWdJSFVnUFNCNE5TQXJJSGcwSUh3Z01EdGNiaUFnSUNCNE5pQmVQU0IxUER3M0lId2dkVDQrUGlnek1pMDNLVHRjYmlBZ0lDQjFJRDBnZURZZ0t5QjROU0I4SURBN1hHNGdJQ0FnZURjZ1hqMGdkVHc4T1NCOElIVStQajRvTXpJdE9TazdYRzRnSUNBZ2RTQTlJSGczSUNzZ2VEWWdmQ0F3TzF4dUlDQWdJSGcwSUY0OUlIVThQREV6SUh3Z2RUNCtQaWd6TWkweE15azdYRzRnSUNBZ2RTQTlJSGcwSUNzZ2VEY2dmQ0F3TzF4dUlDQWdJSGcxSUY0OUlIVThQREU0SUh3Z2RUNCtQaWd6TWkweE9DazdYRzVjYmlBZ0lDQjFJRDBnZURFd0lDc2dlRGtnZkNBd08xeHVJQ0FnSUhneE1TQmVQU0IxUER3M0lId2dkVDQrUGlnek1pMDNLVHRjYmlBZ0lDQjFJRDBnZURFeElDc2dlREV3SUh3Z01EdGNiaUFnSUNCNE9DQmVQU0IxUER3NUlId2dkVDQrUGlnek1pMDVLVHRjYmlBZ0lDQjFJRDBnZURnZ0t5QjRNVEVnZkNBd08xeHVJQ0FnSUhnNUlGNDlJSFU4UERFeklId2dkVDQrUGlnek1pMHhNeWs3WEc0Z0lDQWdkU0E5SUhnNUlDc2dlRGdnZkNBd08xeHVJQ0FnSUhneE1DQmVQU0IxUER3eE9DQjhJSFUrUGo0b016SXRNVGdwTzF4dVhHNGdJQ0FnZFNBOUlIZ3hOU0FySUhneE5DQjhJREE3WEc0Z0lDQWdlREV5SUY0OUlIVThQRGNnZkNCMVBqNCtLRE15TFRjcE8xeHVJQ0FnSUhVZ1BTQjRNVElnS3lCNE1UVWdmQ0F3TzF4dUlDQWdJSGd4TXlCZVBTQjFQRHc1SUh3Z2RUNCtQaWd6TWkwNUtUdGNiaUFnSUNCMUlEMGdlREV6SUNzZ2VERXlJSHdnTUR0Y2JpQWdJQ0I0TVRRZ1hqMGdkVHc4TVRNZ2ZDQjFQajQrS0RNeUxURXpLVHRjYmlBZ0lDQjFJRDBnZURFMElDc2dlREV6SUh3Z01EdGNiaUFnSUNCNE1UVWdYajBnZFR3OE1UZ2dmQ0IxUGo0K0tETXlMVEU0S1R0Y2JpQWdmVnh1SUNBZ2VEQWdQU0FnZURBZ0t5QWdhakFnZkNBd08xeHVJQ0FnZURFZ1BTQWdlREVnS3lBZ2FqRWdmQ0F3TzF4dUlDQWdlRElnUFNBZ2VESWdLeUFnYWpJZ2ZDQXdPMXh1SUNBZ2VETWdQU0FnZURNZ0t5QWdhak1nZkNBd08xeHVJQ0FnZURRZ1BTQWdlRFFnS3lBZ2FqUWdmQ0F3TzF4dUlDQWdlRFVnUFNBZ2VEVWdLeUFnYWpVZ2ZDQXdPMXh1SUNBZ2VEWWdQU0FnZURZZ0t5QWdhallnZkNBd08xeHVJQ0FnZURjZ1BTQWdlRGNnS3lBZ2FqY2dmQ0F3TzF4dUlDQWdlRGdnUFNBZ2VEZ2dLeUFnYWpnZ2ZDQXdPMXh1SUNBZ2VEa2dQU0FnZURrZ0t5QWdhamtnZkNBd08xeHVJQ0I0TVRBZ1BTQjRNVEFnS3lCcU1UQWdmQ0F3TzF4dUlDQjRNVEVnUFNCNE1URWdLeUJxTVRFZ2ZDQXdPMXh1SUNCNE1USWdQU0I0TVRJZ0t5QnFNVElnZkNBd08xeHVJQ0I0TVRNZ1BTQjRNVE1nS3lCcU1UTWdmQ0F3TzF4dUlDQjRNVFFnUFNCNE1UUWdLeUJxTVRRZ2ZDQXdPMXh1SUNCNE1UVWdQU0I0TVRVZ0t5QnFNVFVnZkNBd08xeHVYRzRnSUc5YklEQmRJRDBnZURBZ1BqNCtJQ0F3SUNZZ01IaG1aanRjYmlBZ2Ixc2dNVjBnUFNCNE1DQStQajRnSURnZ0ppQXdlR1ptTzF4dUlDQnZXeUF5WFNBOUlIZ3dJRDQrUGlBeE5pQW1JREI0Wm1ZN1hHNGdJRzliSUROZElEMGdlREFnUGo0K0lESTBJQ1lnTUhobVpqdGNibHh1SUNCdld5QTBYU0E5SUhneElENCtQaUFnTUNBbUlEQjRabVk3WEc0Z0lHOWJJRFZkSUQwZ2VERWdQajQrSUNBNElDWWdNSGhtWmp0Y2JpQWdiMXNnTmwwZ1BTQjRNU0ErUGo0Z01UWWdKaUF3ZUdabU8xeHVJQ0J2V3lBM1hTQTlJSGd4SUQ0K1BpQXlOQ0FtSURCNFptWTdYRzVjYmlBZ2Ixc2dPRjBnUFNCNE1pQStQajRnSURBZ0ppQXdlR1ptTzF4dUlDQnZXeUE1WFNBOUlIZ3lJRDQrUGlBZ09DQW1JREI0Wm1ZN1hHNGdJRzliTVRCZElEMGdlRElnUGo0K0lERTJJQ1lnTUhobVpqdGNiaUFnYjFzeE1WMGdQU0I0TWlBK1BqNGdNalFnSmlBd2VHWm1PMXh1WEc0Z0lHOWJNVEpkSUQwZ2VETWdQajQrSUNBd0lDWWdNSGhtWmp0Y2JpQWdiMXN4TTEwZ1BTQjRNeUErUGo0Z0lEZ2dKaUF3ZUdabU8xeHVJQ0J2V3pFMFhTQTlJSGd6SUQ0K1BpQXhOaUFtSURCNFptWTdYRzRnSUc5Yk1UVmRJRDBnZURNZ1BqNCtJREkwSUNZZ01IaG1aanRjYmx4dUlDQnZXekUyWFNBOUlIZzBJRDQrUGlBZ01DQW1JREI0Wm1ZN1hHNGdJRzliTVRkZElEMGdlRFFnUGo0K0lDQTRJQ1lnTUhobVpqdGNiaUFnYjFzeE9GMGdQU0I0TkNBK1BqNGdNVFlnSmlBd2VHWm1PMXh1SUNCdld6RTVYU0E5SUhnMElENCtQaUF5TkNBbUlEQjRabVk3WEc1Y2JpQWdiMXN5TUYwZ1BTQjROU0ErUGo0Z0lEQWdKaUF3ZUdabU8xeHVJQ0J2V3pJeFhTQTlJSGcxSUQ0K1BpQWdPQ0FtSURCNFptWTdYRzRnSUc5Yk1qSmRJRDBnZURVZ1BqNCtJREUySUNZZ01IaG1aanRjYmlBZ2Ixc3lNMTBnUFNCNE5TQStQajRnTWpRZ0ppQXdlR1ptTzF4dVhHNGdJRzliTWpSZElEMGdlRFlnUGo0K0lDQXdJQ1lnTUhobVpqdGNiaUFnYjFzeU5WMGdQU0I0TmlBK1BqNGdJRGdnSmlBd2VHWm1PMXh1SUNCdld6STJYU0E5SUhnMklENCtQaUF4TmlBbUlEQjRabVk3WEc0Z0lHOWJNamRkSUQwZ2VEWWdQajQrSURJMElDWWdNSGhtWmp0Y2JseHVJQ0J2V3pJNFhTQTlJSGczSUQ0K1BpQWdNQ0FtSURCNFptWTdYRzRnSUc5Yk1qbGRJRDBnZURjZ1BqNCtJQ0E0SUNZZ01IaG1aanRjYmlBZ2Ixc3pNRjBnUFNCNE55QStQajRnTVRZZ0ppQXdlR1ptTzF4dUlDQnZXek14WFNBOUlIZzNJRDQrUGlBeU5DQW1JREI0Wm1ZN1hHNWNiaUFnYjFzek1sMGdQU0I0T0NBK1BqNGdJREFnSmlBd2VHWm1PMXh1SUNCdld6TXpYU0E5SUhnNElENCtQaUFnT0NBbUlEQjRabVk3WEc0Z0lHOWJNelJkSUQwZ2VEZ2dQajQrSURFMklDWWdNSGhtWmp0Y2JpQWdiMXN6TlYwZ1BTQjRPQ0ErUGo0Z01qUWdKaUF3ZUdabU8xeHVYRzRnSUc5Yk16WmRJRDBnZURrZ1BqNCtJQ0F3SUNZZ01IaG1aanRjYmlBZ2Ixc3pOMTBnUFNCNE9TQStQajRnSURnZ0ppQXdlR1ptTzF4dUlDQnZXek00WFNBOUlIZzVJRDQrUGlBeE5pQW1JREI0Wm1ZN1hHNGdJRzliTXpsZElEMGdlRGtnUGo0K0lESTBJQ1lnTUhobVpqdGNibHh1SUNCdld6UXdYU0E5SUhneE1DQStQajRnSURBZ0ppQXdlR1ptTzF4dUlDQnZXelF4WFNBOUlIZ3hNQ0ErUGo0Z0lEZ2dKaUF3ZUdabU8xeHVJQ0J2V3pReVhTQTlJSGd4TUNBK1BqNGdNVFlnSmlBd2VHWm1PMXh1SUNCdld6UXpYU0E5SUhneE1DQStQajRnTWpRZ0ppQXdlR1ptTzF4dVhHNGdJRzliTkRSZElEMGdlREV4SUQ0K1BpQWdNQ0FtSURCNFptWTdYRzRnSUc5Yk5EVmRJRDBnZURFeElENCtQaUFnT0NBbUlEQjRabVk3WEc0Z0lHOWJORFpkSUQwZ2VERXhJRDQrUGlBeE5pQW1JREI0Wm1ZN1hHNGdJRzliTkRkZElEMGdlREV4SUQ0K1BpQXlOQ0FtSURCNFptWTdYRzVjYmlBZ2IxczBPRjBnUFNCNE1USWdQajQrSUNBd0lDWWdNSGhtWmp0Y2JpQWdiMXMwT1YwZ1BTQjRNVElnUGo0K0lDQTRJQ1lnTUhobVpqdGNiaUFnYjFzMU1GMGdQU0I0TVRJZ1BqNCtJREUySUNZZ01IaG1aanRjYmlBZ2IxczFNVjBnUFNCNE1USWdQajQrSURJMElDWWdNSGhtWmp0Y2JseHVJQ0J2V3pVeVhTQTlJSGd4TXlBK1BqNGdJREFnSmlBd2VHWm1PMXh1SUNCdld6VXpYU0E5SUhneE15QStQajRnSURnZ0ppQXdlR1ptTzF4dUlDQnZXelUwWFNBOUlIZ3hNeUErUGo0Z01UWWdKaUF3ZUdabU8xeHVJQ0J2V3pVMVhTQTlJSGd4TXlBK1BqNGdNalFnSmlBd2VHWm1PMXh1WEc0Z0lHOWJOVFpkSUQwZ2VERTBJRDQrUGlBZ01DQW1JREI0Wm1ZN1hHNGdJRzliTlRkZElEMGdlREUwSUQ0K1BpQWdPQ0FtSURCNFptWTdYRzRnSUc5Yk5UaGRJRDBnZURFMElENCtQaUF4TmlBbUlEQjRabVk3WEc0Z0lHOWJOVGxkSUQwZ2VERTBJRDQrUGlBeU5DQW1JREI0Wm1ZN1hHNWNiaUFnYjFzMk1GMGdQU0I0TVRVZ1BqNCtJQ0F3SUNZZ01IaG1aanRjYmlBZ2IxczJNVjBnUFNCNE1UVWdQajQrSUNBNElDWWdNSGhtWmp0Y2JpQWdiMXMyTWwwZ1BTQjRNVFVnUGo0K0lERTJJQ1lnTUhobVpqdGNiaUFnYjFzMk0xMGdQU0I0TVRVZ1BqNCtJREkwSUNZZ01IaG1aanRjYm4xY2JseHVablZ1WTNScGIyNGdZMjl5WlY5b2MyRnNjMkV5TUNodkxIQXNheXhqS1NCN1hHNGdJSFpoY2lCcU1DQWdQU0JqV3lBd1hTQW1JREI0Wm1ZZ2ZDQW9ZMXNnTVYwZ0ppQXdlR1ptS1R3OE9DQjhJQ2hqV3lBeVhTQW1JREI0Wm1ZcFBEd3hOaUI4SUNoald5QXpYU0FtSURCNFptWXBQRHd5TkN4Y2JpQWdJQ0FnSUdveElDQTlJR3RiSURCZElDWWdNSGhtWmlCOElDaHJXeUF4WFNBbUlEQjRabVlwUER3NElId2dLR3RiSURKZElDWWdNSGhtWmlrOFBERTJJSHdnS0d0YklETmRJQ1lnTUhobVppazhQREkwTEZ4dUlDQWdJQ0FnYWpJZ0lEMGdhMXNnTkYwZ0ppQXdlR1ptSUh3Z0tHdGJJRFZkSUNZZ01IaG1aaWs4UERnZ2ZDQW9hMXNnTmwwZ0ppQXdlR1ptS1R3OE1UWWdmQ0FvYTFzZ04xMGdKaUF3ZUdabUtUdzhNalFzWEc0Z0lDQWdJQ0JxTXlBZ1BTQnJXeUE0WFNBbUlEQjRabVlnZkNBb2Exc2dPVjBnSmlBd2VHWm1LVHc4T0NCOElDaHJXekV3WFNBbUlEQjRabVlwUER3eE5pQjhJQ2hyV3pFeFhTQW1JREI0Wm1ZcFBEd3lOQ3hjYmlBZ0lDQWdJR28wSUNBOUlHdGJNVEpkSUNZZ01IaG1aaUI4SUNocld6RXpYU0FtSURCNFptWXBQRHc0SUh3Z0tHdGJNVFJkSUNZZ01IaG1aaWs4UERFMklId2dLR3RiTVRWZElDWWdNSGhtWmlrOFBESTBMRnh1SUNBZ0lDQWdhalVnSUQwZ1kxc2dORjBnSmlBd2VHWm1JSHdnS0dOYklEVmRJQ1lnTUhobVppazhQRGdnZkNBb1kxc2dObDBnSmlBd2VHWm1LVHc4TVRZZ2ZDQW9ZMXNnTjEwZ0ppQXdlR1ptS1R3OE1qUXNYRzRnSUNBZ0lDQnFOaUFnUFNCd1d5QXdYU0FtSURCNFptWWdmQ0FvY0ZzZ01WMGdKaUF3ZUdabUtUdzhPQ0I4SUNod1d5QXlYU0FtSURCNFptWXBQRHd4TmlCOElDaHdXeUF6WFNBbUlEQjRabVlwUER3eU5DeGNiaUFnSUNBZ0lHbzNJQ0E5SUhCYklEUmRJQ1lnTUhobVppQjhJQ2h3V3lBMVhTQW1JREI0Wm1ZcFBEdzRJSHdnS0hCYklEWmRJQ1lnTUhobVppazhQREUySUh3Z0tIQmJJRGRkSUNZZ01IaG1aaWs4UERJMExGeHVJQ0FnSUNBZ2FqZ2dJRDBnY0ZzZ09GMGdKaUF3ZUdabUlId2dLSEJiSURsZElDWWdNSGhtWmlrOFBEZ2dmQ0FvY0ZzeE1GMGdKaUF3ZUdabUtUdzhNVFlnZkNBb2NGc3hNVjBnSmlBd2VHWm1LVHc4TWpRc1hHNGdJQ0FnSUNCcU9TQWdQU0J3V3pFeVhTQW1JREI0Wm1ZZ2ZDQW9jRnN4TTEwZ0ppQXdlR1ptS1R3OE9DQjhJQ2h3V3pFMFhTQW1JREI0Wm1ZcFBEd3hOaUI4SUNod1d6RTFYU0FtSURCNFptWXBQRHd5TkN4Y2JpQWdJQ0FnSUdveE1DQTlJR05iSURoZElDWWdNSGhtWmlCOElDaGpXeUE1WFNBbUlEQjRabVlwUER3NElId2dLR05iTVRCZElDWWdNSGhtWmlrOFBERTJJSHdnS0dOYk1URmRJQ1lnTUhobVppazhQREkwTEZ4dUlDQWdJQ0FnYWpFeElEMGdhMXN4TmwwZ0ppQXdlR1ptSUh3Z0tHdGJNVGRkSUNZZ01IaG1aaWs4UERnZ2ZDQW9hMXN4T0YwZ0ppQXdlR1ptS1R3OE1UWWdmQ0FvYTFzeE9WMGdKaUF3ZUdabUtUdzhNalFzWEc0Z0lDQWdJQ0JxTVRJZ1BTQnJXekl3WFNBbUlEQjRabVlnZkNBb2Exc3lNVjBnSmlBd2VHWm1LVHc4T0NCOElDaHJXekl5WFNBbUlEQjRabVlwUER3eE5pQjhJQ2hyV3pJelhTQW1JREI0Wm1ZcFBEd3lOQ3hjYmlBZ0lDQWdJR294TXlBOUlHdGJNalJkSUNZZ01IaG1aaUI4SUNocld6STFYU0FtSURCNFptWXBQRHc0SUh3Z0tHdGJNalpkSUNZZ01IaG1aaWs4UERFMklId2dLR3RiTWpkZElDWWdNSGhtWmlrOFBESTBMRnh1SUNBZ0lDQWdhakUwSUQwZ2Exc3lPRjBnSmlBd2VHWm1JSHdnS0d0Yk1qbGRJQ1lnTUhobVppazhQRGdnZkNBb2Exc3pNRjBnSmlBd2VHWm1LVHc4TVRZZ2ZDQW9hMXN6TVYwZ0ppQXdlR1ptS1R3OE1qUXNYRzRnSUNBZ0lDQnFNVFVnUFNCald6RXlYU0FtSURCNFptWWdmQ0FvWTFzeE0xMGdKaUF3ZUdabUtUdzhPQ0I4SUNoald6RTBYU0FtSURCNFptWXBQRHd4TmlCOElDaGpXekUxWFNBbUlEQjRabVlwUER3eU5EdGNibHh1SUNCMllYSWdlREFnUFNCcU1Dd2dlREVnUFNCcU1Td2dlRElnUFNCcU1pd2dlRE1nUFNCcU15d2dlRFFnUFNCcU5Dd2dlRFVnUFNCcU5Td2dlRFlnUFNCcU5pd2dlRGNnUFNCcU55eGNiaUFnSUNBZ0lIZzRJRDBnYWpnc0lIZzVJRDBnYWprc0lIZ3hNQ0E5SUdveE1Dd2dlREV4SUQwZ2FqRXhMQ0I0TVRJZ1BTQnFNVElzSUhneE15QTlJR294TXl3Z2VERTBJRDBnYWpFMExGeHVJQ0FnSUNBZ2VERTFJRDBnYWpFMUxDQjFPMXh1WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dNakE3SUdrZ0t6MGdNaWtnZTF4dUlDQWdJSFVnUFNCNE1DQXJJSGd4TWlCOElEQTdYRzRnSUNBZ2VEUWdYajBnZFR3OE55QjhJSFUrUGo0b016SXROeWs3WEc0Z0lDQWdkU0E5SUhnMElDc2dlREFnZkNBd08xeHVJQ0FnSUhnNElGNDlJSFU4UERrZ2ZDQjFQajQrS0RNeUxUa3BPMXh1SUNBZ0lIVWdQU0I0T0NBcklIZzBJSHdnTUR0Y2JpQWdJQ0I0TVRJZ1hqMGdkVHc4TVRNZ2ZDQjFQajQrS0RNeUxURXpLVHRjYmlBZ0lDQjFJRDBnZURFeUlDc2dlRGdnZkNBd08xeHVJQ0FnSUhnd0lGNDlJSFU4UERFNElId2dkVDQrUGlnek1pMHhPQ2s3WEc1Y2JpQWdJQ0IxSUQwZ2VEVWdLeUI0TVNCOElEQTdYRzRnSUNBZ2VEa2dYajBnZFR3OE55QjhJSFUrUGo0b016SXROeWs3WEc0Z0lDQWdkU0E5SUhnNUlDc2dlRFVnZkNBd08xeHVJQ0FnSUhneE15QmVQU0IxUER3NUlId2dkVDQrUGlnek1pMDVLVHRjYmlBZ0lDQjFJRDBnZURFeklDc2dlRGtnZkNBd08xeHVJQ0FnSUhneElGNDlJSFU4UERFeklId2dkVDQrUGlnek1pMHhNeWs3WEc0Z0lDQWdkU0E5SUhneElDc2dlREV6SUh3Z01EdGNiaUFnSUNCNE5TQmVQU0IxUER3eE9DQjhJSFUrUGo0b016SXRNVGdwTzF4dVhHNGdJQ0FnZFNBOUlIZ3hNQ0FySUhnMklId2dNRHRjYmlBZ0lDQjRNVFFnWGowZ2RUdzhOeUI4SUhVK1BqNG9Nekl0TnlrN1hHNGdJQ0FnZFNBOUlIZ3hOQ0FySUhneE1DQjhJREE3WEc0Z0lDQWdlRElnWGowZ2RUdzhPU0I4SUhVK1BqNG9Nekl0T1NrN1hHNGdJQ0FnZFNBOUlIZ3lJQ3NnZURFMElId2dNRHRjYmlBZ0lDQjROaUJlUFNCMVBEd3hNeUI4SUhVK1BqNG9Nekl0TVRNcE8xeHVJQ0FnSUhVZ1BTQjROaUFySUhneUlId2dNRHRjYmlBZ0lDQjRNVEFnWGowZ2RUdzhNVGdnZkNCMVBqNCtLRE15TFRFNEtUdGNibHh1SUNBZ0lIVWdQU0I0TVRVZ0t5QjRNVEVnZkNBd08xeHVJQ0FnSUhneklGNDlJSFU4UERjZ2ZDQjFQajQrS0RNeUxUY3BPMXh1SUNBZ0lIVWdQU0I0TXlBcklIZ3hOU0I4SURBN1hHNGdJQ0FnZURjZ1hqMGdkVHc4T1NCOElIVStQajRvTXpJdE9TazdYRzRnSUNBZ2RTQTlJSGczSUNzZ2VETWdmQ0F3TzF4dUlDQWdJSGd4TVNCZVBTQjFQRHd4TXlCOElIVStQajRvTXpJdE1UTXBPMXh1SUNBZ0lIVWdQU0I0TVRFZ0t5QjROeUI4SURBN1hHNGdJQ0FnZURFMUlGNDlJSFU4UERFNElId2dkVDQrUGlnek1pMHhPQ2s3WEc1Y2JpQWdJQ0IxSUQwZ2VEQWdLeUI0TXlCOElEQTdYRzRnSUNBZ2VERWdYajBnZFR3OE55QjhJSFUrUGo0b016SXROeWs3WEc0Z0lDQWdkU0E5SUhneElDc2dlREFnZkNBd08xeHVJQ0FnSUhneUlGNDlJSFU4UERrZ2ZDQjFQajQrS0RNeUxUa3BPMXh1SUNBZ0lIVWdQU0I0TWlBcklIZ3hJSHdnTUR0Y2JpQWdJQ0I0TXlCZVBTQjFQRHd4TXlCOElIVStQajRvTXpJdE1UTXBPMXh1SUNBZ0lIVWdQU0I0TXlBcklIZ3lJSHdnTUR0Y2JpQWdJQ0I0TUNCZVBTQjFQRHd4T0NCOElIVStQajRvTXpJdE1UZ3BPMXh1WEc0Z0lDQWdkU0E5SUhnMUlDc2dlRFFnZkNBd08xeHVJQ0FnSUhnMklGNDlJSFU4UERjZ2ZDQjFQajQrS0RNeUxUY3BPMXh1SUNBZ0lIVWdQU0I0TmlBcklIZzFJSHdnTUR0Y2JpQWdJQ0I0TnlCZVBTQjFQRHc1SUh3Z2RUNCtQaWd6TWkwNUtUdGNiaUFnSUNCMUlEMGdlRGNnS3lCNE5pQjhJREE3WEc0Z0lDQWdlRFFnWGowZ2RUdzhNVE1nZkNCMVBqNCtLRE15TFRFektUdGNiaUFnSUNCMUlEMGdlRFFnS3lCNE55QjhJREE3WEc0Z0lDQWdlRFVnWGowZ2RUdzhNVGdnZkNCMVBqNCtLRE15TFRFNEtUdGNibHh1SUNBZ0lIVWdQU0I0TVRBZ0t5QjRPU0I4SURBN1hHNGdJQ0FnZURFeElGNDlJSFU4UERjZ2ZDQjFQajQrS0RNeUxUY3BPMXh1SUNBZ0lIVWdQU0I0TVRFZ0t5QjRNVEFnZkNBd08xeHVJQ0FnSUhnNElGNDlJSFU4UERrZ2ZDQjFQajQrS0RNeUxUa3BPMXh1SUNBZ0lIVWdQU0I0T0NBcklIZ3hNU0I4SURBN1hHNGdJQ0FnZURrZ1hqMGdkVHc4TVRNZ2ZDQjFQajQrS0RNeUxURXpLVHRjYmlBZ0lDQjFJRDBnZURrZ0t5QjRPQ0I4SURBN1hHNGdJQ0FnZURFd0lGNDlJSFU4UERFNElId2dkVDQrUGlnek1pMHhPQ2s3WEc1Y2JpQWdJQ0IxSUQwZ2VERTFJQ3NnZURFMElId2dNRHRjYmlBZ0lDQjRNVElnWGowZ2RUdzhOeUI4SUhVK1BqNG9Nekl0TnlrN1hHNGdJQ0FnZFNBOUlIZ3hNaUFySUhneE5TQjhJREE3WEc0Z0lDQWdlREV6SUY0OUlIVThQRGtnZkNCMVBqNCtLRE15TFRrcE8xeHVJQ0FnSUhVZ1BTQjRNVE1nS3lCNE1USWdmQ0F3TzF4dUlDQWdJSGd4TkNCZVBTQjFQRHd4TXlCOElIVStQajRvTXpJdE1UTXBPMXh1SUNBZ0lIVWdQU0I0TVRRZ0t5QjRNVE1nZkNBd08xeHVJQ0FnSUhneE5TQmVQU0IxUER3eE9DQjhJSFUrUGo0b016SXRNVGdwTzF4dUlDQjlYRzVjYmlBZ2Ixc2dNRjBnUFNCNE1DQStQajRnSURBZ0ppQXdlR1ptTzF4dUlDQnZXeUF4WFNBOUlIZ3dJRDQrUGlBZ09DQW1JREI0Wm1ZN1hHNGdJRzliSURKZElEMGdlREFnUGo0K0lERTJJQ1lnTUhobVpqdGNiaUFnYjFzZ00xMGdQU0I0TUNBK1BqNGdNalFnSmlBd2VHWm1PMXh1WEc0Z0lHOWJJRFJkSUQwZ2VEVWdQajQrSUNBd0lDWWdNSGhtWmp0Y2JpQWdiMXNnTlYwZ1BTQjROU0ErUGo0Z0lEZ2dKaUF3ZUdabU8xeHVJQ0J2V3lBMlhTQTlJSGcxSUQ0K1BpQXhOaUFtSURCNFptWTdYRzRnSUc5YklEZGRJRDBnZURVZ1BqNCtJREkwSUNZZ01IaG1aanRjYmx4dUlDQnZXeUE0WFNBOUlIZ3hNQ0ErUGo0Z0lEQWdKaUF3ZUdabU8xeHVJQ0J2V3lBNVhTQTlJSGd4TUNBK1BqNGdJRGdnSmlBd2VHWm1PMXh1SUNCdld6RXdYU0E5SUhneE1DQStQajRnTVRZZ0ppQXdlR1ptTzF4dUlDQnZXekV4WFNBOUlIZ3hNQ0ErUGo0Z01qUWdKaUF3ZUdabU8xeHVYRzRnSUc5Yk1USmRJRDBnZURFMUlENCtQaUFnTUNBbUlEQjRabVk3WEc0Z0lHOWJNVE5kSUQwZ2VERTFJRDQrUGlBZ09DQW1JREI0Wm1ZN1hHNGdJRzliTVRSZElEMGdlREUxSUQ0K1BpQXhOaUFtSURCNFptWTdYRzRnSUc5Yk1UVmRJRDBnZURFMUlENCtQaUF5TkNBbUlEQjRabVk3WEc1Y2JpQWdiMXN4TmwwZ1BTQjROaUErUGo0Z0lEQWdKaUF3ZUdabU8xeHVJQ0J2V3pFM1hTQTlJSGcySUQ0K1BpQWdPQ0FtSURCNFptWTdYRzRnSUc5Yk1UaGRJRDBnZURZZ1BqNCtJREUySUNZZ01IaG1aanRjYmlBZ2Ixc3hPVjBnUFNCNE5pQStQajRnTWpRZ0ppQXdlR1ptTzF4dVhHNGdJRzliTWpCZElEMGdlRGNnUGo0K0lDQXdJQ1lnTUhobVpqdGNiaUFnYjFzeU1WMGdQU0I0TnlBK1BqNGdJRGdnSmlBd2VHWm1PMXh1SUNCdld6SXlYU0E5SUhnM0lENCtQaUF4TmlBbUlEQjRabVk3WEc0Z0lHOWJNak5kSUQwZ2VEY2dQajQrSURJMElDWWdNSGhtWmp0Y2JseHVJQ0J2V3pJMFhTQTlJSGc0SUQ0K1BpQWdNQ0FtSURCNFptWTdYRzRnSUc5Yk1qVmRJRDBnZURnZ1BqNCtJQ0E0SUNZZ01IaG1aanRjYmlBZ2Ixc3lObDBnUFNCNE9DQStQajRnTVRZZ0ppQXdlR1ptTzF4dUlDQnZXekkzWFNBOUlIZzRJRDQrUGlBeU5DQW1JREI0Wm1ZN1hHNWNiaUFnYjFzeU9GMGdQU0I0T1NBK1BqNGdJREFnSmlBd2VHWm1PMXh1SUNCdld6STVYU0E5SUhnNUlENCtQaUFnT0NBbUlEQjRabVk3WEc0Z0lHOWJNekJkSUQwZ2VEa2dQajQrSURFMklDWWdNSGhtWmp0Y2JpQWdiMXN6TVYwZ1BTQjRPU0ErUGo0Z01qUWdKaUF3ZUdabU8xeHVmVnh1WEc1bWRXNWpkR2x2YmlCamNubHdkRzlmWTI5eVpWOXpZV3h6WVRJd0tHOTFkQ3hwYm5Bc2F5eGpLU0I3WEc0Z0lHTnZjbVZmYzJGc2MyRXlNQ2h2ZFhRc2FXNXdMR3NzWXlrN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOeWVYQjBiMTlqYjNKbFgyaHpZV3h6WVRJd0tHOTFkQ3hwYm5Bc2F5eGpLU0I3WEc0Z0lHTnZjbVZmYUhOaGJITmhNakFvYjNWMExHbHVjQ3hyTEdNcE8xeHVmVnh1WEc1MllYSWdjMmxuYldFZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoYk1UQXhMQ0F4TWpBc0lERXhNaXdnT1Rjc0lERXhNQ3dnTVRBd0xDQXpNaXdnTlRFc0lEVXdMQ0EwTlN3Z09UZ3NJREV5TVN3Z01URTJMQ0F4TURFc0lETXlMQ0F4TURkZEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklGd2laWGh3WVc1a0lETXlMV0o1ZEdVZ2Exd2lYRzVjYm1aMWJtTjBhVzl1SUdOeWVYQjBiMTl6ZEhKbFlXMWZjMkZzYzJFeU1GOTRiM0lvWXl4amNHOXpMRzBzYlhCdmN5eGlMRzRzYXlrZ2UxeHVJQ0IyWVhJZ2VpQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtERTJLU3dnZUNBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0RZMEtUdGNiaUFnZG1GeUlIVXNJR2s3WEc0Z0lHWnZjaUFvYVNBOUlEQTdJR2tnUENBeE5qc2dhU3NyS1NCNlcybGRJRDBnTUR0Y2JpQWdabTl5SUNocElEMGdNRHNnYVNBOElEZzdJR2tyS3lrZ2VsdHBYU0E5SUc1YmFWMDdYRzRnSUhkb2FXeGxJQ2hpSUQ0OUlEWTBLU0I3WEc0Z0lDQWdZM0o1Y0hSdlgyTnZjbVZmYzJGc2MyRXlNQ2g0TEhvc2F5eHphV2R0WVNrN1hHNGdJQ0FnWm05eUlDaHBJRDBnTURzZ2FTQThJRFkwT3lCcEt5c3BJR05iWTNCdmN5dHBYU0E5SUcxYmJYQnZjeXRwWFNCZUlIaGJhVjA3WEc0Z0lDQWdkU0E5SURFN1hHNGdJQ0FnWm05eUlDaHBJRDBnT0RzZ2FTQThJREUyT3lCcEt5c3BJSHRjYmlBZ0lDQWdJSFVnUFNCMUlDc2dLSHBiYVYwZ0ppQXdlR1ptS1NCOElEQTdYRzRnSUNBZ0lDQjZXMmxkSUQwZ2RTQW1JREI0Wm1ZN1hHNGdJQ0FnSUNCMUlENCtQajBnT0R0Y2JpQWdJQ0I5WEc0Z0lDQWdZaUF0UFNBMk5EdGNiaUFnSUNCamNHOXpJQ3M5SURZME8xeHVJQ0FnSUcxd2IzTWdLejBnTmpRN1hHNGdJSDFjYmlBZ2FXWWdLR0lnUGlBd0tTQjdYRzRnSUNBZ1kzSjVjSFJ2WDJOdmNtVmZjMkZzYzJFeU1DaDRMSG9zYXl4emFXZHRZU2s3WEc0Z0lDQWdabTl5SUNocElEMGdNRHNnYVNBOElHSTdJR2tyS3lrZ1kxdGpjRzl6SzJsZElEMGdiVnR0Y0c5eksybGRJRjRnZUZ0cFhUdGNiaUFnZlZ4dUlDQnlaWFIxY200Z01EdGNibjFjYmx4dVpuVnVZM1JwYjI0Z1kzSjVjSFJ2WDNOMGNtVmhiVjl6WVd4ellUSXdLR01zWTNCdmN5eGlMRzRzYXlrZ2UxeHVJQ0IyWVhJZ2VpQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtERTJLU3dnZUNBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0RZMEtUdGNiaUFnZG1GeUlIVXNJR2s3WEc0Z0lHWnZjaUFvYVNBOUlEQTdJR2tnUENBeE5qc2dhU3NyS1NCNlcybGRJRDBnTUR0Y2JpQWdabTl5SUNocElEMGdNRHNnYVNBOElEZzdJR2tyS3lrZ2VsdHBYU0E5SUc1YmFWMDdYRzRnSUhkb2FXeGxJQ2hpSUQ0OUlEWTBLU0I3WEc0Z0lDQWdZM0o1Y0hSdlgyTnZjbVZmYzJGc2MyRXlNQ2g0TEhvc2F5eHphV2R0WVNrN1hHNGdJQ0FnWm05eUlDaHBJRDBnTURzZ2FTQThJRFkwT3lCcEt5c3BJR05iWTNCdmN5dHBYU0E5SUhoYmFWMDdYRzRnSUNBZ2RTQTlJREU3WEc0Z0lDQWdabTl5SUNocElEMGdPRHNnYVNBOElERTJPeUJwS3lzcElIdGNiaUFnSUNBZ0lIVWdQU0IxSUNzZ0tIcGJhVjBnSmlBd2VHWm1LU0I4SURBN1hHNGdJQ0FnSUNCNlcybGRJRDBnZFNBbUlEQjRabVk3WEc0Z0lDQWdJQ0IxSUQ0K1BqMGdPRHRjYmlBZ0lDQjlYRzRnSUNBZ1lpQXRQU0EyTkR0Y2JpQWdJQ0JqY0c5eklDczlJRFkwTzF4dUlDQjlYRzRnSUdsbUlDaGlJRDRnTUNrZ2UxeHVJQ0FnSUdOeWVYQjBiMTlqYjNKbFgzTmhiSE5oTWpBb2VDeDZMR3NzYzJsbmJXRXBPMXh1SUNBZ0lHWnZjaUFvYVNBOUlEQTdJR2tnUENCaU95QnBLeXNwSUdOYlkzQnZjeXRwWFNBOUlIaGJhVjA3WEc0Z0lIMWNiaUFnY21WMGRYSnVJREE3WEc1OVhHNWNibVoxYm1OMGFXOXVJR055ZVhCMGIxOXpkSEpsWVcwb1l5eGpjRzl6TEdRc2JpeHJLU0I3WEc0Z0lIWmhjaUJ6SUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvTXpJcE8xeHVJQ0JqY25sd2RHOWZZMjl5WlY5b2MyRnNjMkV5TUNoekxHNHNheXh6YVdkdFlTazdYRzRnSUhaaGNpQnpiaUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLRGdwTzF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJRGc3SUdrckt5a2djMjViYVYwZ1BTQnVXMmtyTVRaZE8xeHVJQ0J5WlhSMWNtNGdZM0o1Y0hSdlgzTjBjbVZoYlY5ellXeHpZVEl3S0dNc1kzQnZjeXhrTEhOdUxITXBPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpjbmx3ZEc5ZmMzUnlaV0Z0WDNodmNpaGpMR053YjNNc2JTeHRjRzl6TEdRc2JpeHJLU0I3WEc0Z0lIWmhjaUJ6SUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvTXpJcE8xeHVJQ0JqY25sd2RHOWZZMjl5WlY5b2MyRnNjMkV5TUNoekxHNHNheXh6YVdkdFlTazdYRzRnSUhaaGNpQnpiaUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLRGdwTzF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJRGc3SUdrckt5a2djMjViYVYwZ1BTQnVXMmtyTVRaZE8xeHVJQ0J5WlhSMWNtNGdZM0o1Y0hSdlgzTjBjbVZoYlY5ellXeHpZVEl3WDNodmNpaGpMR053YjNNc2JTeHRjRzl6TEdRc2MyNHNjeWs3WEc1OVhHNWNiaThxWEc0cUlGQnZjblFnYjJZZ1FXNWtjbVYzSUUxdmIyNG5jeUJRYjJ4NU1UTXdOUzFrYjI1dVlTMHhOaTRnVUhWaWJHbGpJR1J2YldGcGJpNWNiaW9nYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJac2IyOWtlV0psY25KNUwzQnZiSGt4TXpBMUxXUnZibTVoWEc0cUwxeHVYRzUyWVhJZ2NHOXNlVEV6TURVZ1BTQm1kVzVqZEdsdmJpaHJaWGtwSUh0Y2JpQWdkR2hwY3k1aWRXWm1aWElnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2d4TmlrN1hHNGdJSFJvYVhNdWNpQTlJRzVsZHlCVmFXNTBNVFpCY25KaGVTZ3hNQ2s3WEc0Z0lIUm9hWE11YUNBOUlHNWxkeUJWYVc1ME1UWkJjbkpoZVNneE1DazdYRzRnSUhSb2FYTXVjR0ZrSUQwZ2JtVjNJRlZwYm5ReE5rRnljbUY1S0RncE8xeHVJQ0IwYUdsekxteGxablJ2ZG1WeUlEMGdNRHRjYmlBZ2RHaHBjeTVtYVc0Z1BTQXdPMXh1WEc0Z0lIWmhjaUIwTUN3Z2RERXNJSFF5TENCME15d2dkRFFzSUhRMUxDQjBOaXdnZERjN1hHNWNiaUFnZERBZ1BTQnJaWGxiSURCZElDWWdNSGhtWmlCOElDaHJaWGxiSURGZElDWWdNSGhtWmlrZ1BEd2dPRHNnZEdocGN5NXlXekJkSUQwZ0tDQjBNQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNrZ0ppQXdlREZtWm1ZN1hHNGdJSFF4SUQwZ2EyVjVXeUF5WFNBbUlEQjRabVlnZkNBb2EyVjVXeUF6WFNBbUlEQjRabVlwSUR3OElEZzdJSFJvYVhNdWNsc3hYU0E5SUNnb2REQWdQajQrSURFektTQjhJQ2gwTVNBOFBDQWdNeWtwSUNZZ01IZ3habVptTzF4dUlDQjBNaUE5SUd0bGVWc2dORjBnSmlBd2VHWm1JSHdnS0d0bGVWc2dOVjBnSmlBd2VHWm1LU0E4UENBNE95QjBhR2x6TG5KYk1sMGdQU0FvS0hReElENCtQaUF4TUNrZ2ZDQW9kRElnUER3Z0lEWXBLU0FtSURCNE1XWXdNenRjYmlBZ2RETWdQU0JyWlhsYklEWmRJQ1lnTUhobVppQjhJQ2hyWlhsYklEZGRJQ1lnTUhobVppa2dQRHdnT0RzZ2RHaHBjeTV5V3pOZElEMGdLQ2gwTWlBK1BqNGdJRGNwSUh3Z0tIUXpJRHc4SUNBNUtTa2dKaUF3ZURGbVptWTdYRzRnSUhRMElEMGdhMlY1V3lBNFhTQW1JREI0Wm1ZZ2ZDQW9hMlY1V3lBNVhTQW1JREI0Wm1ZcElEdzhJRGc3SUhSb2FYTXVjbHMwWFNBOUlDZ29kRE1nUGo0K0lDQTBLU0I4SUNoME5DQThQQ0F4TWlrcElDWWdNSGd3TUdabU8xeHVJQ0IwYUdsekxuSmJOVjBnUFNBb0tIUTBJRDQrUGlBZ01Ta3BJQ1lnTUhneFptWmxPMXh1SUNCME5TQTlJR3RsZVZzeE1GMGdKaUF3ZUdabUlId2dLR3RsZVZzeE1WMGdKaUF3ZUdabUtTQThQQ0E0T3lCMGFHbHpMbkpiTmwwZ1BTQW9LSFEwSUQ0K1BpQXhOQ2tnZkNBb2REVWdQRHdnSURJcEtTQW1JREI0TVdabVpqdGNiaUFnZERZZ1BTQnJaWGxiTVRKZElDWWdNSGhtWmlCOElDaHJaWGxiTVROZElDWWdNSGhtWmlrZ1BEd2dPRHNnZEdocGN5NXlXemRkSUQwZ0tDaDBOU0ErUGo0Z01URXBJSHdnS0hRMklEdzhJQ0ExS1NrZ0ppQXdlREZtT0RFN1hHNGdJSFEzSUQwZ2EyVjVXekUwWFNBbUlEQjRabVlnZkNBb2EyVjVXekUxWFNBbUlEQjRabVlwSUR3OElEZzdJSFJvYVhNdWNsczRYU0E5SUNnb2REWWdQajQrSUNBNEtTQjhJQ2gwTnlBOFBDQWdPQ2twSUNZZ01IZ3habVptTzF4dUlDQjBhR2x6TG5KYk9WMGdQU0FvS0hRM0lENCtQaUFnTlNrcElDWWdNSGd3TURkbU8xeHVYRzRnSUhSb2FYTXVjR0ZrV3pCZElEMGdhMlY1V3pFMlhTQW1JREI0Wm1ZZ2ZDQW9hMlY1V3pFM1hTQW1JREI0Wm1ZcElEdzhJRGc3WEc0Z0lIUm9hWE11Y0dGa1d6RmRJRDBnYTJWNVd6RTRYU0FtSURCNFptWWdmQ0FvYTJWNVd6RTVYU0FtSURCNFptWXBJRHc4SURnN1hHNGdJSFJvYVhNdWNHRmtXekpkSUQwZ2EyVjVXekl3WFNBbUlEQjRabVlnZkNBb2EyVjVXekl4WFNBbUlEQjRabVlwSUR3OElEZzdYRzRnSUhSb2FYTXVjR0ZrV3pOZElEMGdhMlY1V3pJeVhTQW1JREI0Wm1ZZ2ZDQW9hMlY1V3pJelhTQW1JREI0Wm1ZcElEdzhJRGc3WEc0Z0lIUm9hWE11Y0dGa1d6UmRJRDBnYTJWNVd6STBYU0FtSURCNFptWWdmQ0FvYTJWNVd6STFYU0FtSURCNFptWXBJRHc4SURnN1hHNGdJSFJvYVhNdWNHRmtXelZkSUQwZ2EyVjVXekkyWFNBbUlEQjRabVlnZkNBb2EyVjVXekkzWFNBbUlEQjRabVlwSUR3OElEZzdYRzRnSUhSb2FYTXVjR0ZrV3paZElEMGdhMlY1V3pJNFhTQW1JREI0Wm1ZZ2ZDQW9hMlY1V3pJNVhTQW1JREI0Wm1ZcElEdzhJRGc3WEc0Z0lIUm9hWE11Y0dGa1d6ZGRJRDBnYTJWNVd6TXdYU0FtSURCNFptWWdmQ0FvYTJWNVd6TXhYU0FtSURCNFptWXBJRHc4SURnN1hHNTlPMXh1WEc1d2IyeDVNVE13TlM1d2NtOTBiM1I1Y0dVdVlteHZZMnR6SUQwZ1puVnVZM1JwYjI0b2JTd2diWEJ2Y3l3Z1lubDBaWE1wSUh0Y2JpQWdkbUZ5SUdocFltbDBJRDBnZEdocGN5NW1hVzRnUHlBd0lEb2dLREVnUER3Z01URXBPMXh1SUNCMllYSWdkREFzSUhReExDQjBNaXdnZERNc0lIUTBMQ0IwTlN3Z2REWXNJSFEzTENCak8xeHVJQ0IyWVhJZ1pEQXNJR1F4TENCa01pd2daRE1zSUdRMExDQmtOU3dnWkRZc0lHUTNMQ0JrT0N3Z1pEazdYRzVjYmlBZ2RtRnlJR2d3SUQwZ2RHaHBjeTVvV3pCZExGeHVJQ0FnSUNBZ2FERWdQU0IwYUdsekxtaGJNVjBzWEc0Z0lDQWdJQ0JvTWlBOUlIUm9hWE11YUZzeVhTeGNiaUFnSUNBZ0lHZ3pJRDBnZEdocGN5NW9Xek5kTEZ4dUlDQWdJQ0FnYURRZ1BTQjBhR2x6TG1oYk5GMHNYRzRnSUNBZ0lDQm9OU0E5SUhSb2FYTXVhRnMxWFN4Y2JpQWdJQ0FnSUdnMklEMGdkR2hwY3k1b1d6WmRMRnh1SUNBZ0lDQWdhRGNnUFNCMGFHbHpMbWhiTjEwc1hHNGdJQ0FnSUNCb09DQTlJSFJvYVhNdWFGczRYU3hjYmlBZ0lDQWdJR2c1SUQwZ2RHaHBjeTVvV3psZE8xeHVYRzRnSUhaaGNpQnlNQ0E5SUhSb2FYTXVjbHN3WFN4Y2JpQWdJQ0FnSUhJeElEMGdkR2hwY3k1eVd6RmRMRnh1SUNBZ0lDQWdjaklnUFNCMGFHbHpMbkpiTWwwc1hHNGdJQ0FnSUNCeU15QTlJSFJvYVhNdWNsc3pYU3hjYmlBZ0lDQWdJSEkwSUQwZ2RHaHBjeTV5V3pSZExGeHVJQ0FnSUNBZ2NqVWdQU0IwYUdsekxuSmJOVjBzWEc0Z0lDQWdJQ0J5TmlBOUlIUm9hWE11Y2xzMlhTeGNiaUFnSUNBZ0lISTNJRDBnZEdocGN5NXlXemRkTEZ4dUlDQWdJQ0FnY2pnZ1BTQjBhR2x6TG5KYk9GMHNYRzRnSUNBZ0lDQnlPU0E5SUhSb2FYTXVjbHM1WFR0Y2JseHVJQ0IzYUdsc1pTQW9ZbmwwWlhNZ1BqMGdNVFlwSUh0Y2JpQWdJQ0IwTUNBOUlHMWJiWEJ2Y3lzZ01GMGdKaUF3ZUdabUlId2dLRzFiYlhCdmN5c2dNVjBnSmlBd2VHWm1LU0E4UENBNE95Qm9NQ0FyUFNBb0lIUXdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS1NBbUlEQjRNV1ptWmp0Y2JpQWdJQ0IwTVNBOUlHMWJiWEJ2Y3lzZ01sMGdKaUF3ZUdabUlId2dLRzFiYlhCdmN5c2dNMTBnSmlBd2VHWm1LU0E4UENBNE95Qm9NU0FyUFNBb0tIUXdJRDQrUGlBeE15a2dmQ0FvZERFZ1BEd2dJRE1wS1NBbUlEQjRNV1ptWmp0Y2JpQWdJQ0IwTWlBOUlHMWJiWEJ2Y3lzZ05GMGdKaUF3ZUdabUlId2dLRzFiYlhCdmN5c2dOVjBnSmlBd2VHWm1LU0E4UENBNE95Qm9NaUFyUFNBb0tIUXhJRDQrUGlBeE1Da2dmQ0FvZERJZ1BEd2dJRFlwS1NBbUlEQjRNV1ptWmp0Y2JpQWdJQ0IwTXlBOUlHMWJiWEJ2Y3lzZ05sMGdKaUF3ZUdabUlId2dLRzFiYlhCdmN5c2dOMTBnSmlBd2VHWm1LU0E4UENBNE95Qm9NeUFyUFNBb0tIUXlJRDQrUGlBZ055a2dmQ0FvZERNZ1BEd2dJRGtwS1NBbUlEQjRNV1ptWmp0Y2JpQWdJQ0IwTkNBOUlHMWJiWEJ2Y3lzZ09GMGdKaUF3ZUdabUlId2dLRzFiYlhCdmN5c2dPVjBnSmlBd2VHWm1LU0E4UENBNE95Qm9OQ0FyUFNBb0tIUXpJRDQrUGlBZ05Da2dmQ0FvZERRZ1BEd2dNVElwS1NBbUlEQjRNV1ptWmp0Y2JpQWdJQ0JvTlNBclBTQW9LSFEwSUQ0K1BpQWdNU2twSUNZZ01IZ3habVptTzF4dUlDQWdJSFExSUQwZ2JWdHRjRzl6S3pFd1hTQW1JREI0Wm1ZZ2ZDQW9iVnR0Y0c5ekt6RXhYU0FtSURCNFptWXBJRHc4SURnN0lHZzJJQ3M5SUNnb2REUWdQajQrSURFMEtTQjhJQ2gwTlNBOFBDQWdNaWtwSUNZZ01IZ3habVptTzF4dUlDQWdJSFEySUQwZ2JWdHRjRzl6S3pFeVhTQW1JREI0Wm1ZZ2ZDQW9iVnR0Y0c5ekt6RXpYU0FtSURCNFptWXBJRHc4SURnN0lHZzNJQ3M5SUNnb2REVWdQajQrSURFeEtTQjhJQ2gwTmlBOFBDQWdOU2twSUNZZ01IZ3habVptTzF4dUlDQWdJSFEzSUQwZ2JWdHRjRzl6S3pFMFhTQW1JREI0Wm1ZZ2ZDQW9iVnR0Y0c5ekt6RTFYU0FtSURCNFptWXBJRHc4SURnN0lHZzRJQ3M5SUNnb2REWWdQajQrSUNBNEtTQjhJQ2gwTnlBOFBDQWdPQ2twSUNZZ01IZ3habVptTzF4dUlDQWdJR2c1SUNzOUlDZ29kRGNnUGo0K0lEVXBLU0I4SUdocFltbDBPMXh1WEc0Z0lDQWdZeUE5SURBN1hHNWNiaUFnSUNCa01DQTlJR003WEc0Z0lDQWdaREFnS3owZ2FEQWdLaUJ5TUR0Y2JpQWdJQ0JrTUNBclBTQm9NU0FxSUNnMUlDb2djamtwTzF4dUlDQWdJR1F3SUNzOUlHZ3lJQ29nS0RVZ0tpQnlPQ2s3WEc0Z0lDQWdaREFnS3owZ2FETWdLaUFvTlNBcUlISTNLVHRjYmlBZ0lDQmtNQ0FyUFNCb05DQXFJQ2cxSUNvZ2NqWXBPMXh1SUNBZ0lHTWdQU0FvWkRBZ1BqNCtJREV6S1RzZ1pEQWdKajBnTUhneFptWm1PMXh1SUNBZ0lHUXdJQ3M5SUdnMUlDb2dLRFVnS2lCeU5TazdYRzRnSUNBZ1pEQWdLejBnYURZZ0tpQW9OU0FxSUhJMEtUdGNiaUFnSUNCa01DQXJQU0JvTnlBcUlDZzFJQ29nY2pNcE8xeHVJQ0FnSUdRd0lDczlJR2c0SUNvZ0tEVWdLaUJ5TWlrN1hHNGdJQ0FnWkRBZ0t6MGdhRGtnS2lBb05TQXFJSEl4S1R0Y2JpQWdJQ0JqSUNzOUlDaGtNQ0ErUGo0Z01UTXBPeUJrTUNBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa01TQTlJR003WEc0Z0lDQWdaREVnS3owZ2FEQWdLaUJ5TVR0Y2JpQWdJQ0JrTVNBclBTQm9NU0FxSUhJd08xeHVJQ0FnSUdReElDczlJR2d5SUNvZ0tEVWdLaUJ5T1NrN1hHNGdJQ0FnWkRFZ0t6MGdhRE1nS2lBb05TQXFJSEk0S1R0Y2JpQWdJQ0JrTVNBclBTQm9OQ0FxSUNnMUlDb2djamNwTzF4dUlDQWdJR01nUFNBb1pERWdQajQrSURFektUc2daREVnSmowZ01IZ3habVptTzF4dUlDQWdJR1F4SUNzOUlHZzFJQ29nS0RVZ0tpQnlOaWs3WEc0Z0lDQWdaREVnS3owZ2FEWWdLaUFvTlNBcUlISTFLVHRjYmlBZ0lDQmtNU0FyUFNCb055QXFJQ2cxSUNvZ2NqUXBPMXh1SUNBZ0lHUXhJQ3M5SUdnNElDb2dLRFVnS2lCeU15azdYRzRnSUNBZ1pERWdLejBnYURrZ0tpQW9OU0FxSUhJeUtUdGNiaUFnSUNCaklDczlJQ2hrTVNBK1BqNGdNVE1wT3lCa01TQW1QU0F3ZURGbVptWTdYRzVjYmlBZ0lDQmtNaUE5SUdNN1hHNGdJQ0FnWkRJZ0t6MGdhREFnS2lCeU1qdGNiaUFnSUNCa01pQXJQU0JvTVNBcUlISXhPMXh1SUNBZ0lHUXlJQ3M5SUdneUlDb2djakE3WEc0Z0lDQWdaRElnS3owZ2FETWdLaUFvTlNBcUlISTVLVHRjYmlBZ0lDQmtNaUFyUFNCb05DQXFJQ2cxSUNvZ2NqZ3BPMXh1SUNBZ0lHTWdQU0FvWkRJZ1BqNCtJREV6S1RzZ1pESWdKajBnTUhneFptWm1PMXh1SUNBZ0lHUXlJQ3M5SUdnMUlDb2dLRFVnS2lCeU55azdYRzRnSUNBZ1pESWdLejBnYURZZ0tpQW9OU0FxSUhJMktUdGNiaUFnSUNCa01pQXJQU0JvTnlBcUlDZzFJQ29nY2pVcE8xeHVJQ0FnSUdReUlDczlJR2c0SUNvZ0tEVWdLaUJ5TkNrN1hHNGdJQ0FnWkRJZ0t6MGdhRGtnS2lBb05TQXFJSEl6S1R0Y2JpQWdJQ0JqSUNzOUlDaGtNaUErUGo0Z01UTXBPeUJrTWlBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa015QTlJR003WEc0Z0lDQWdaRE1nS3owZ2FEQWdLaUJ5TXp0Y2JpQWdJQ0JrTXlBclBTQm9NU0FxSUhJeU8xeHVJQ0FnSUdReklDczlJR2d5SUNvZ2NqRTdYRzRnSUNBZ1pETWdLejBnYURNZ0tpQnlNRHRjYmlBZ0lDQmtNeUFyUFNCb05DQXFJQ2cxSUNvZ2Nqa3BPMXh1SUNBZ0lHTWdQU0FvWkRNZ1BqNCtJREV6S1RzZ1pETWdKajBnTUhneFptWm1PMXh1SUNBZ0lHUXpJQ3M5SUdnMUlDb2dLRFVnS2lCeU9DazdYRzRnSUNBZ1pETWdLejBnYURZZ0tpQW9OU0FxSUhJM0tUdGNiaUFnSUNCa015QXJQU0JvTnlBcUlDZzFJQ29nY2pZcE8xeHVJQ0FnSUdReklDczlJR2c0SUNvZ0tEVWdLaUJ5TlNrN1hHNGdJQ0FnWkRNZ0t6MGdhRGtnS2lBb05TQXFJSEkwS1R0Y2JpQWdJQ0JqSUNzOUlDaGtNeUErUGo0Z01UTXBPeUJrTXlBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa05DQTlJR003WEc0Z0lDQWdaRFFnS3owZ2FEQWdLaUJ5TkR0Y2JpQWdJQ0JrTkNBclBTQm9NU0FxSUhJek8xeHVJQ0FnSUdRMElDczlJR2d5SUNvZ2NqSTdYRzRnSUNBZ1pEUWdLejBnYURNZ0tpQnlNVHRjYmlBZ0lDQmtOQ0FyUFNCb05DQXFJSEl3TzF4dUlDQWdJR01nUFNBb1pEUWdQajQrSURFektUc2daRFFnSmowZ01IZ3habVptTzF4dUlDQWdJR1EwSUNzOUlHZzFJQ29nS0RVZ0tpQnlPU2s3WEc0Z0lDQWdaRFFnS3owZ2FEWWdLaUFvTlNBcUlISTRLVHRjYmlBZ0lDQmtOQ0FyUFNCb055QXFJQ2cxSUNvZ2NqY3BPMXh1SUNBZ0lHUTBJQ3M5SUdnNElDb2dLRFVnS2lCeU5pazdYRzRnSUNBZ1pEUWdLejBnYURrZ0tpQW9OU0FxSUhJMUtUdGNiaUFnSUNCaklDczlJQ2hrTkNBK1BqNGdNVE1wT3lCa05DQW1QU0F3ZURGbVptWTdYRzVjYmlBZ0lDQmtOU0E5SUdNN1hHNGdJQ0FnWkRVZ0t6MGdhREFnS2lCeU5UdGNiaUFnSUNCa05TQXJQU0JvTVNBcUlISTBPMXh1SUNBZ0lHUTFJQ3M5SUdneUlDb2djak03WEc0Z0lDQWdaRFVnS3owZ2FETWdLaUJ5TWp0Y2JpQWdJQ0JrTlNBclBTQm9OQ0FxSUhJeE8xeHVJQ0FnSUdNZ1BTQW9aRFVnUGo0K0lERXpLVHNnWkRVZ0pqMGdNSGd4Wm1abU8xeHVJQ0FnSUdRMUlDczlJR2cxSUNvZ2NqQTdYRzRnSUNBZ1pEVWdLejBnYURZZ0tpQW9OU0FxSUhJNUtUdGNiaUFnSUNCa05TQXJQU0JvTnlBcUlDZzFJQ29nY2pncE8xeHVJQ0FnSUdRMUlDczlJR2c0SUNvZ0tEVWdLaUJ5TnlrN1hHNGdJQ0FnWkRVZ0t6MGdhRGtnS2lBb05TQXFJSEkyS1R0Y2JpQWdJQ0JqSUNzOUlDaGtOU0ErUGo0Z01UTXBPeUJrTlNBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa05pQTlJR003WEc0Z0lDQWdaRFlnS3owZ2FEQWdLaUJ5Tmp0Y2JpQWdJQ0JrTmlBclBTQm9NU0FxSUhJMU8xeHVJQ0FnSUdRMklDczlJR2d5SUNvZ2NqUTdYRzRnSUNBZ1pEWWdLejBnYURNZ0tpQnlNenRjYmlBZ0lDQmtOaUFyUFNCb05DQXFJSEl5TzF4dUlDQWdJR01nUFNBb1pEWWdQajQrSURFektUc2daRFlnSmowZ01IZ3habVptTzF4dUlDQWdJR1EySUNzOUlHZzFJQ29nY2pFN1hHNGdJQ0FnWkRZZ0t6MGdhRFlnS2lCeU1EdGNiaUFnSUNCa05pQXJQU0JvTnlBcUlDZzFJQ29nY2prcE8xeHVJQ0FnSUdRMklDczlJR2c0SUNvZ0tEVWdLaUJ5T0NrN1hHNGdJQ0FnWkRZZ0t6MGdhRGtnS2lBb05TQXFJSEkzS1R0Y2JpQWdJQ0JqSUNzOUlDaGtOaUErUGo0Z01UTXBPeUJrTmlBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa055QTlJR003WEc0Z0lDQWdaRGNnS3owZ2FEQWdLaUJ5Tnp0Y2JpQWdJQ0JrTnlBclBTQm9NU0FxSUhJMk8xeHVJQ0FnSUdRM0lDczlJR2d5SUNvZ2NqVTdYRzRnSUNBZ1pEY2dLejBnYURNZ0tpQnlORHRjYmlBZ0lDQmtOeUFyUFNCb05DQXFJSEl6TzF4dUlDQWdJR01nUFNBb1pEY2dQajQrSURFektUc2daRGNnSmowZ01IZ3habVptTzF4dUlDQWdJR1EzSUNzOUlHZzFJQ29nY2pJN1hHNGdJQ0FnWkRjZ0t6MGdhRFlnS2lCeU1UdGNiaUFnSUNCa055QXJQU0JvTnlBcUlISXdPMXh1SUNBZ0lHUTNJQ3M5SUdnNElDb2dLRFVnS2lCeU9TazdYRzRnSUNBZ1pEY2dLejBnYURrZ0tpQW9OU0FxSUhJNEtUdGNiaUFnSUNCaklDczlJQ2hrTnlBK1BqNGdNVE1wT3lCa055QW1QU0F3ZURGbVptWTdYRzVjYmlBZ0lDQmtPQ0E5SUdNN1hHNGdJQ0FnWkRnZ0t6MGdhREFnS2lCeU9EdGNiaUFnSUNCa09DQXJQU0JvTVNBcUlISTNPMXh1SUNBZ0lHUTRJQ3M5SUdneUlDb2djalk3WEc0Z0lDQWdaRGdnS3owZ2FETWdLaUJ5TlR0Y2JpQWdJQ0JrT0NBclBTQm9OQ0FxSUhJME8xeHVJQ0FnSUdNZ1BTQW9aRGdnUGo0K0lERXpLVHNnWkRnZ0pqMGdNSGd4Wm1abU8xeHVJQ0FnSUdRNElDczlJR2cxSUNvZ2NqTTdYRzRnSUNBZ1pEZ2dLejBnYURZZ0tpQnlNanRjYmlBZ0lDQmtPQ0FyUFNCb055QXFJSEl4TzF4dUlDQWdJR1E0SUNzOUlHZzRJQ29nY2pBN1hHNGdJQ0FnWkRnZ0t6MGdhRGtnS2lBb05TQXFJSEk1S1R0Y2JpQWdJQ0JqSUNzOUlDaGtPQ0ErUGo0Z01UTXBPeUJrT0NBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCa09TQTlJR003WEc0Z0lDQWdaRGtnS3owZ2FEQWdLaUJ5T1R0Y2JpQWdJQ0JrT1NBclBTQm9NU0FxSUhJNE8xeHVJQ0FnSUdRNUlDczlJR2d5SUNvZ2NqYzdYRzRnSUNBZ1pEa2dLejBnYURNZ0tpQnlOanRjYmlBZ0lDQmtPU0FyUFNCb05DQXFJSEkxTzF4dUlDQWdJR01nUFNBb1pEa2dQajQrSURFektUc2daRGtnSmowZ01IZ3habVptTzF4dUlDQWdJR1E1SUNzOUlHZzFJQ29nY2pRN1hHNGdJQ0FnWkRrZ0t6MGdhRFlnS2lCeU16dGNiaUFnSUNCa09TQXJQU0JvTnlBcUlISXlPMXh1SUNBZ0lHUTVJQ3M5SUdnNElDb2djakU3WEc0Z0lDQWdaRGtnS3owZ2FEa2dLaUJ5TUR0Y2JpQWdJQ0JqSUNzOUlDaGtPU0ErUGo0Z01UTXBPeUJrT1NBbVBTQXdlREZtWm1ZN1hHNWNiaUFnSUNCaklEMGdLQ2dvWXlBOFBDQXlLU0FySUdNcEtTQjhJREE3WEc0Z0lDQWdZeUE5SUNoaklDc2daREFwSUh3Z01EdGNiaUFnSUNCa01DQTlJR01nSmlBd2VERm1abVk3WEc0Z0lDQWdZeUE5SUNoaklENCtQaUF4TXlrN1hHNGdJQ0FnWkRFZ0t6MGdZenRjYmx4dUlDQWdJR2d3SUQwZ1pEQTdYRzRnSUNBZ2FERWdQU0JrTVR0Y2JpQWdJQ0JvTWlBOUlHUXlPMXh1SUNBZ0lHZ3pJRDBnWkRNN1hHNGdJQ0FnYURRZ1BTQmtORHRjYmlBZ0lDQm9OU0E5SUdRMU8xeHVJQ0FnSUdnMklEMGdaRFk3WEc0Z0lDQWdhRGNnUFNCa056dGNiaUFnSUNCb09DQTlJR1E0TzF4dUlDQWdJR2c1SUQwZ1pEazdYRzVjYmlBZ0lDQnRjRzl6SUNzOUlERTJPMXh1SUNBZ0lHSjVkR1Z6SUMwOUlERTJPMXh1SUNCOVhHNGdJSFJvYVhNdWFGc3dYU0E5SUdnd08xeHVJQ0IwYUdsekxtaGJNVjBnUFNCb01UdGNiaUFnZEdocGN5NW9XekpkSUQwZ2FESTdYRzRnSUhSb2FYTXVhRnN6WFNBOUlHZ3pPMXh1SUNCMGFHbHpMbWhiTkYwZ1BTQm9ORHRjYmlBZ2RHaHBjeTVvV3pWZElEMGdhRFU3WEc0Z0lIUm9hWE11YUZzMlhTQTlJR2cyTzF4dUlDQjBhR2x6TG1oYk4xMGdQU0JvTnp0Y2JpQWdkR2hwY3k1b1d6aGRJRDBnYURnN1hHNGdJSFJvYVhNdWFGczVYU0E5SUdnNU8xeHVmVHRjYmx4dWNHOXNlVEV6TURVdWNISnZkRzkwZVhCbExtWnBibWx6YUNBOUlHWjFibU4wYVc5dUtHMWhZeXdnYldGamNHOXpLU0I3WEc0Z0lIWmhjaUJuSUQwZ2JtVjNJRlZwYm5ReE5rRnljbUY1S0RFd0tUdGNiaUFnZG1GeUlHTXNJRzFoYzJzc0lHWXNJR2s3WEc1Y2JpQWdhV1lnS0hSb2FYTXViR1ZtZEc5MlpYSXBJSHRjYmlBZ0lDQnBJRDBnZEdocGN5NXNaV1owYjNabGNqdGNiaUFnSUNCMGFHbHpMbUoxWm1abGNsdHBLeXRkSUQwZ01UdGNiaUFnSUNCbWIzSWdLRHNnYVNBOElERTJPeUJwS3lzcElIUm9hWE11WW5WbVptVnlXMmxkSUQwZ01EdGNiaUFnSUNCMGFHbHpMbVpwYmlBOUlERTdYRzRnSUNBZ2RHaHBjeTVpYkc5amEzTW9kR2hwY3k1aWRXWm1aWElzSURBc0lERTJLVHRjYmlBZ2ZWeHVYRzRnSUdNZ1BTQjBhR2x6TG1oYk1WMGdQajQrSURFek8xeHVJQ0IwYUdsekxtaGJNVjBnSmowZ01IZ3habVptTzF4dUlDQm1iM0lnS0drZ1BTQXlPeUJwSUR3Z01UQTdJR2tyS3lrZ2UxeHVJQ0FnSUhSb2FYTXVhRnRwWFNBclBTQmpPMXh1SUNBZ0lHTWdQU0IwYUdsekxtaGJhVjBnUGo0K0lERXpPMXh1SUNBZ0lIUm9hWE11YUZ0cFhTQW1QU0F3ZURGbVptWTdYRzRnSUgxY2JpQWdkR2hwY3k1b1d6QmRJQ3M5SUNoaklDb2dOU2s3WEc0Z0lHTWdQU0IwYUdsekxtaGJNRjBnUGo0K0lERXpPMXh1SUNCMGFHbHpMbWhiTUYwZ0pqMGdNSGd4Wm1abU8xeHVJQ0IwYUdsekxtaGJNVjBnS3owZ1l6dGNiaUFnWXlBOUlIUm9hWE11YUZzeFhTQStQajRnTVRNN1hHNGdJSFJvYVhNdWFGc3hYU0FtUFNBd2VERm1abVk3WEc0Z0lIUm9hWE11YUZzeVhTQXJQU0JqTzF4dVhHNGdJR2RiTUYwZ1BTQjBhR2x6TG1oYk1GMGdLeUExTzF4dUlDQmpJRDBnWjFzd1hTQStQajRnTVRNN1hHNGdJR2RiTUYwZ0pqMGdNSGd4Wm1abU8xeHVJQ0JtYjNJZ0tHa2dQU0F4T3lCcElEd2dNVEE3SUdrckt5a2dlMXh1SUNBZ0lHZGJhVjBnUFNCMGFHbHpMbWhiYVYwZ0t5QmpPMXh1SUNBZ0lHTWdQU0JuVzJsZElENCtQaUF4TXp0Y2JpQWdJQ0JuVzJsZElDWTlJREI0TVdabVpqdGNiaUFnZlZ4dUlDQm5XemxkSUMwOUlDZ3hJRHc4SURFektUdGNibHh1SUNCdFlYTnJJRDBnS0dNZ1hpQXhLU0F0SURFN1hHNGdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQXhNRHNnYVNzcktTQm5XMmxkSUNZOUlHMWhjMnM3WEc0Z0lHMWhjMnNnUFNCK2JXRnphenRjYmlBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SURFd095QnBLeXNwSUhSb2FYTXVhRnRwWFNBOUlDaDBhR2x6TG1oYmFWMGdKaUJ0WVhOcktTQjhJR2RiYVYwN1hHNWNiaUFnZEdocGN5NW9XekJkSUQwZ0tDaDBhR2x6TG1oYk1GMGdJQ0FnSUNBZ0tTQjhJQ2gwYUdsekxtaGJNVjBnUER3Z01UTXBJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FwSUNZZ01IaG1abVptTzF4dUlDQjBhR2x6TG1oYk1WMGdQU0FvS0hSb2FYTXVhRnN4WFNBK1BqNGdJRE1wSUh3Z0tIUm9hWE11YUZzeVhTQThQQ0F4TUNrZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDa2dKaUF3ZUdabVptWTdYRzRnSUhSb2FYTXVhRnN5WFNBOUlDZ29kR2hwY3k1b1d6SmRJRDQrUGlBZ05pa2dmQ0FvZEdocGN5NW9Xek5kSUR3OElDQTNLU0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS1NBbUlEQjRabVptWmp0Y2JpQWdkR2hwY3k1b1d6TmRJRDBnS0NoMGFHbHpMbWhiTTEwZ1BqNCtJQ0E1S1NCOElDaDBhR2x6TG1oYk5GMGdQRHdnSURRcElDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXBJQ1lnTUhobVptWm1PMXh1SUNCMGFHbHpMbWhiTkYwZ1BTQW9LSFJvYVhNdWFGczBYU0ErUGo0Z01USXBJSHdnS0hSb2FYTXVhRnMxWFNBOFBDQWdNU2tnZkNBb2RHaHBjeTVvV3paZElEdzhJREUwS1NrZ0ppQXdlR1ptWm1ZN1hHNGdJSFJvYVhNdWFGczFYU0E5SUNnb2RHaHBjeTVvV3paZElENCtQaUFnTWlrZ2ZDQW9kR2hwY3k1b1d6ZGRJRHc4SURFeEtTQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdLU0FtSURCNFptWm1aanRjYmlBZ2RHaHBjeTVvV3paZElEMGdLQ2gwYUdsekxtaGJOMTBnUGo0K0lDQTFLU0I4SUNoMGFHbHpMbWhiT0YwZ1BEd2dJRGdwSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBcElDWWdNSGhtWm1abU8xeHVJQ0IwYUdsekxtaGJOMTBnUFNBb0tIUm9hWE11YUZzNFhTQStQajRnSURncElId2dLSFJvYVhNdWFGczVYU0E4UENBZ05Ta2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2tnSmlBd2VHWm1abVk3WEc1Y2JpQWdaaUE5SUhSb2FYTXVhRnN3WFNBcklIUm9hWE11Y0dGa1d6QmRPMXh1SUNCMGFHbHpMbWhiTUYwZ1BTQm1JQ1lnTUhobVptWm1PMXh1SUNCbWIzSWdLR2tnUFNBeE95QnBJRHdnT0RzZ2FTc3JLU0I3WEc0Z0lDQWdaaUE5SUNnb0tIUm9hWE11YUZ0cFhTQXJJSFJvYVhNdWNHRmtXMmxkS1NCOElEQXBJQ3NnS0dZZ1BqNCtJREUyS1NrZ2ZDQXdPMXh1SUNBZ0lIUm9hWE11YUZ0cFhTQTlJR1lnSmlBd2VHWm1abVk3WEc0Z0lIMWNibHh1SUNCdFlXTmJiV0ZqY0c5ekt5QXdYU0E5SUNoMGFHbHpMbWhiTUYwZ1BqNCtJREFwSUNZZ01IaG1aanRjYmlBZ2JXRmpXMjFoWTNCdmN5c2dNVjBnUFNBb2RHaHBjeTVvV3pCZElENCtQaUE0S1NBbUlEQjRabVk3WEc0Z0lHMWhZMXR0WVdOd2IzTXJJREpkSUQwZ0tIUm9hWE11YUZzeFhTQStQajRnTUNrZ0ppQXdlR1ptTzF4dUlDQnRZV05iYldGamNHOXpLeUF6WFNBOUlDaDBhR2x6TG1oYk1WMGdQajQrSURncElDWWdNSGhtWmp0Y2JpQWdiV0ZqVzIxaFkzQnZjeXNnTkYwZ1BTQW9kR2hwY3k1b1d6SmRJRDQrUGlBd0tTQW1JREI0Wm1ZN1hHNGdJRzFoWTF0dFlXTndiM01ySURWZElEMGdLSFJvYVhNdWFGc3lYU0ErUGo0Z09Da2dKaUF3ZUdabU8xeHVJQ0J0WVdOYmJXRmpjRzl6S3lBMlhTQTlJQ2gwYUdsekxtaGJNMTBnUGo0K0lEQXBJQ1lnTUhobVpqdGNiaUFnYldGalcyMWhZM0J2Y3lzZ04xMGdQU0FvZEdocGN5NW9Xek5kSUQ0K1BpQTRLU0FtSURCNFptWTdYRzRnSUcxaFkxdHRZV053YjNNcklEaGRJRDBnS0hSb2FYTXVhRnMwWFNBK1BqNGdNQ2tnSmlBd2VHWm1PMXh1SUNCdFlXTmJiV0ZqY0c5ekt5QTVYU0E5SUNoMGFHbHpMbWhiTkYwZ1BqNCtJRGdwSUNZZ01IaG1aanRjYmlBZ2JXRmpXMjFoWTNCdmN5c3hNRjBnUFNBb2RHaHBjeTVvV3pWZElENCtQaUF3S1NBbUlEQjRabVk3WEc0Z0lHMWhZMXR0WVdOd2IzTXJNVEZkSUQwZ0tIUm9hWE11YUZzMVhTQStQajRnT0NrZ0ppQXdlR1ptTzF4dUlDQnRZV05iYldGamNHOXpLekV5WFNBOUlDaDBhR2x6TG1oYk5sMGdQajQrSURBcElDWWdNSGhtWmp0Y2JpQWdiV0ZqVzIxaFkzQnZjeXN4TTEwZ1BTQW9kR2hwY3k1b1d6WmRJRDQrUGlBNEtTQW1JREI0Wm1ZN1hHNGdJRzFoWTF0dFlXTndiM01yTVRSZElEMGdLSFJvYVhNdWFGczNYU0ErUGo0Z01Da2dKaUF3ZUdabU8xeHVJQ0J0WVdOYmJXRmpjRzl6S3pFMVhTQTlJQ2gwYUdsekxtaGJOMTBnUGo0K0lEZ3BJQ1lnTUhobVpqdGNibjA3WEc1Y2JuQnZiSGt4TXpBMUxuQnliM1J2ZEhsd1pTNTFjR1JoZEdVZ1BTQm1kVzVqZEdsdmJpaHRMQ0J0Y0c5ekxDQmllWFJsY3lrZ2UxeHVJQ0IyWVhJZ2FTd2dkMkZ1ZER0Y2JseHVJQ0JwWmlBb2RHaHBjeTVzWldaMGIzWmxjaWtnZTF4dUlDQWdJSGRoYm5RZ1BTQW9NVFlnTFNCMGFHbHpMbXhsWm5SdmRtVnlLVHRjYmlBZ0lDQnBaaUFvZDJGdWRDQStJR0o1ZEdWektWeHVJQ0FnSUNBZ2QyRnVkQ0E5SUdKNWRHVnpPMXh1SUNBZ0lHWnZjaUFvYVNBOUlEQTdJR2tnUENCM1lXNTBPeUJwS3lzcFhHNGdJQ0FnSUNCMGFHbHpMbUoxWm1abGNsdDBhR2x6TG14bFpuUnZkbVZ5SUNzZ2FWMGdQU0J0VzIxd2IzTXJhVjA3WEc0Z0lDQWdZbmwwWlhNZ0xUMGdkMkZ1ZER0Y2JpQWdJQ0J0Y0c5eklDczlJSGRoYm5RN1hHNGdJQ0FnZEdocGN5NXNaV1owYjNabGNpQXJQU0IzWVc1ME8xeHVJQ0FnSUdsbUlDaDBhR2x6TG14bFpuUnZkbVZ5SUR3Z01UWXBYRzRnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnZEdocGN5NWliRzlqYTNNb2RHaHBjeTVpZFdabVpYSXNJREFzSURFMktUdGNiaUFnSUNCMGFHbHpMbXhsWm5SdmRtVnlJRDBnTUR0Y2JpQWdmVnh1WEc0Z0lHbG1JQ2hpZVhSbGN5QStQU0F4TmlrZ2UxeHVJQ0FnSUhkaGJuUWdQU0JpZVhSbGN5QXRJQ2hpZVhSbGN5QWxJREUyS1R0Y2JpQWdJQ0IwYUdsekxtSnNiMk5yY3lodExDQnRjRzl6TENCM1lXNTBLVHRjYmlBZ0lDQnRjRzl6SUNzOUlIZGhiblE3WEc0Z0lDQWdZbmwwWlhNZ0xUMGdkMkZ1ZER0Y2JpQWdmVnh1WEc0Z0lHbG1JQ2hpZVhSbGN5a2dlMXh1SUNBZ0lHWnZjaUFvYVNBOUlEQTdJR2tnUENCaWVYUmxjenNnYVNzcktWeHVJQ0FnSUNBZ2RHaHBjeTVpZFdabVpYSmJkR2hwY3k1c1pXWjBiM1psY2lBcklHbGRJRDBnYlZ0dGNHOXpLMmxkTzF4dUlDQWdJSFJvYVhNdWJHVm1kRzkyWlhJZ0t6MGdZbmwwWlhNN1hHNGdJSDFjYm4wN1hHNWNibVoxYm1OMGFXOXVJR055ZVhCMGIxOXZibVYwYVcxbFlYVjBhQ2h2ZFhRc0lHOTFkSEJ2Y3l3Z2JTd2diWEJ2Y3l3Z2Jpd2dheWtnZTF4dUlDQjJZWElnY3lBOUlHNWxkeUJ3YjJ4NU1UTXdOU2hyS1R0Y2JpQWdjeTUxY0dSaGRHVW9iU3dnYlhCdmN5d2diaWs3WEc0Z0lITXVabWx1YVhOb0tHOTFkQ3dnYjNWMGNHOXpLVHRjYmlBZ2NtVjBkWEp1SURBN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOeWVYQjBiMTl2Ym1WMGFXMWxZWFYwYUY5MlpYSnBabmtvYUN3Z2FIQnZjeXdnYlN3Z2JYQnZjeXdnYml3Z2F5a2dlMXh1SUNCMllYSWdlQ0E5SUc1bGR5QlZhVzUwT0VGeWNtRjVLREUyS1R0Y2JpQWdZM0o1Y0hSdlgyOXVaWFJwYldWaGRYUm9LSGdzTUN4dExHMXdiM01zYml4cktUdGNiaUFnY21WMGRYSnVJR055ZVhCMGIxOTJaWEpwWm5sZk1UWW9hQ3hvY0c5ekxIZ3NNQ2s3WEc1OVhHNWNibVoxYm1OMGFXOXVJR055ZVhCMGIxOXpaV055WlhSaWIzZ29ZeXh0TEdRc2JpeHJLU0I3WEc0Z0lIWmhjaUJwTzF4dUlDQnBaaUFvWkNBOElETXlLU0J5WlhSMWNtNGdMVEU3WEc0Z0lHTnllWEIwYjE5emRISmxZVzFmZUc5eUtHTXNNQ3h0TERBc1pDeHVMR3NwTzF4dUlDQmpjbmx3ZEc5ZmIyNWxkR2x0WldGMWRHZ29ZeXdnTVRZc0lHTXNJRE15TENCa0lDMGdNeklzSUdNcE8xeHVJQ0JtYjNJZ0tHa2dQU0F3T3lCcElEd2dNVFk3SUdrckt5a2dZMXRwWFNBOUlEQTdYRzRnSUhKbGRIVnliaUF3TzF4dWZWeHVYRzVtZFc1amRHbHZiaUJqY25sd2RHOWZjMlZqY21WMFltOTRYMjl3Wlc0b2JTeGpMR1FzYml4cktTQjdYRzRnSUhaaGNpQnBPMXh1SUNCMllYSWdlQ0E5SUc1bGR5QlZhVzUwT0VGeWNtRjVLRE15S1R0Y2JpQWdhV1lnS0dRZ1BDQXpNaWtnY21WMGRYSnVJQzB4TzF4dUlDQmpjbmx3ZEc5ZmMzUnlaV0Z0S0hnc01Dd3pNaXh1TEdzcE8xeHVJQ0JwWmlBb1kzSjVjSFJ2WDI5dVpYUnBiV1ZoZFhSb1gzWmxjbWxtZVNoakxDQXhOaXhqTENBek1peGtJQzBnTXpJc2VDa2dJVDA5SURBcElISmxkSFZ5YmlBdE1UdGNiaUFnWTNKNWNIUnZYM04wY21WaGJWOTRiM0lvYlN3d0xHTXNNQ3hrTEc0c2F5azdYRzRnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0F6TWpzZ2FTc3JLU0J0VzJsZElEMGdNRHRjYmlBZ2NtVjBkWEp1SURBN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUhObGRESTFOVEU1S0hJc0lHRXBJSHRjYmlBZ2RtRnlJR2s3WEc0Z0lHWnZjaUFvYVNBOUlEQTdJR2tnUENBeE5qc2dhU3NyS1NCeVcybGRJRDBnWVZ0cFhYd3dPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpZWEl5TlRVeE9TaHZLU0I3WEc0Z0lIWmhjaUJwTENCMkxDQmpJRDBnTVR0Y2JpQWdabTl5SUNocElEMGdNRHNnYVNBOElERTJPeUJwS3lzcElIdGNiaUFnSUNCMklEMGdiMXRwWFNBcklHTWdLeUEyTlRVek5UdGNiaUFnSUNCaklEMGdUV0YwYUM1bWJHOXZjaWgySUM4Z05qVTFNellwTzF4dUlDQWdJRzliYVYwZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjlYRzRnSUc5Yk1GMGdLejBnWXkweElDc2dNemNnS2lBb1l5MHhLVHRjYm4xY2JseHVablZ1WTNScGIyNGdjMlZzTWpVMU1Ua29jQ3dnY1N3Z1lpa2dlMXh1SUNCMllYSWdkQ3dnWXlBOUlING9ZaTB4S1R0Y2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0F4TmpzZ2FTc3JLU0I3WEc0Z0lDQWdkQ0E5SUdNZ0ppQW9jRnRwWFNCZUlIRmJhVjBwTzF4dUlDQWdJSEJiYVYwZ1hqMGdkRHRjYmlBZ0lDQnhXMmxkSUY0OUlIUTdYRzRnSUgxY2JuMWNibHh1Wm5WdVkzUnBiMjRnY0dGamF6STFOVEU1S0c4c0lHNHBJSHRjYmlBZ2RtRnlJR2tzSUdvc0lHSTdYRzRnSUhaaGNpQnRJRDBnWjJZb0tTd2dkQ0E5SUdkbUtDazdYRzRnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0F4TmpzZ2FTc3JLU0IwVzJsZElEMGdibHRwWFR0Y2JpQWdZMkZ5TWpVMU1Ua29kQ2s3WEc0Z0lHTmhjakkxTlRFNUtIUXBPMXh1SUNCallYSXlOVFV4T1NoMEtUdGNiaUFnWm05eUlDaHFJRDBnTURzZ2FpQThJREk3SUdvckt5a2dlMXh1SUNBZ0lHMWJNRjBnUFNCMFd6QmRJQzBnTUhobVptVmtPMXh1SUNBZ0lHWnZjaUFvYVNBOUlERTdJR2tnUENBeE5Uc2dhU3NyS1NCN1hHNGdJQ0FnSUNCdFcybGRJRDBnZEZ0cFhTQXRJREI0Wm1abVppQXRJQ2dvYlZ0cExURmRQajR4TmlrZ0ppQXhLVHRjYmlBZ0lDQWdJRzFiYVMweFhTQW1QU0F3ZUdabVptWTdYRzRnSUNBZ2ZWeHVJQ0FnSUcxYk1UVmRJRDBnZEZzeE5WMGdMU0F3ZURkbVptWWdMU0FvS0cxYk1UUmRQajR4TmlrZ0ppQXhLVHRjYmlBZ0lDQmlJRDBnS0cxYk1UVmRQajR4TmlrZ0ppQXhPMXh1SUNBZ0lHMWJNVFJkSUNZOUlEQjRabVptWmp0Y2JpQWdJQ0J6Wld3eU5UVXhPU2gwTENCdExDQXhMV0lwTzF4dUlDQjlYRzRnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0F4TmpzZ2FTc3JLU0I3WEc0Z0lDQWdiMXN5S21sZElEMGdkRnRwWFNBbUlEQjRabVk3WEc0Z0lDQWdiMXN5S21rck1WMGdQU0IwVzJsZFBqNDRPMXh1SUNCOVhHNTlYRzVjYm1aMWJtTjBhVzl1SUc1bGNUSTFOVEU1S0dFc0lHSXBJSHRjYmlBZ2RtRnlJR01nUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2d6TWlrc0lHUWdQU0J1WlhjZ1ZXbHVkRGhCY25KaGVTZ3pNaWs3WEc0Z0lIQmhZMnN5TlRVeE9TaGpMQ0JoS1R0Y2JpQWdjR0ZqYXpJMU5URTVLR1FzSUdJcE8xeHVJQ0J5WlhSMWNtNGdZM0o1Y0hSdlgzWmxjbWxtZVY4ek1paGpMQ0F3TENCa0xDQXdLVHRjYm4xY2JseHVablZ1WTNScGIyNGdjR0Z5TWpVMU1Ua29ZU2tnZTF4dUlDQjJZWElnWkNBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0RNeUtUdGNiaUFnY0dGamF6STFOVEU1S0dRc0lHRXBPMXh1SUNCeVpYUjFjbTRnWkZzd1hTQW1JREU3WEc1OVhHNWNibVoxYm1OMGFXOXVJSFZ1Y0dGamF6STFOVEU1S0c4c0lHNHBJSHRjYmlBZ2RtRnlJR2s3WEc0Z0lHWnZjaUFvYVNBOUlEQTdJR2tnUENBeE5qc2dhU3NyS1NCdlcybGRJRDBnYmxzeUttbGRJQ3NnS0c1Yk1pcHBLekZkSUR3OElEZ3BPMXh1SUNCdld6RTFYU0FtUFNBd2VEZG1abVk3WEc1OVhHNWNibVoxYm1OMGFXOXVJRUVvYnl3Z1lTd2dZaWtnZTF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJREUyT3lCcEt5c3BJRzliYVYwZ1BTQmhXMmxkSUNzZ1lsdHBYVHRjYm4xY2JseHVablZ1WTNScGIyNGdXaWh2TENCaExDQmlLU0I3WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dNVFk3SUdrckt5a2diMXRwWFNBOUlHRmJhVjBnTFNCaVcybGRPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQk5LRzhzSUdFc0lHSXBJSHRjYmlBZ2RtRnlJSFlzSUdNc1hHNGdJQ0FnSUhRd0lEMGdNQ3dnSUhReElEMGdNQ3dnSUhReUlEMGdNQ3dnSUhReklEMGdNQ3dnSUhRMElEMGdNQ3dnSUhRMUlEMGdNQ3dnSUhRMklEMGdNQ3dnSUhRM0lEMGdNQ3hjYmlBZ0lDQWdkRGdnUFNBd0xDQWdkRGtnUFNBd0xDQjBNVEFnUFNBd0xDQjBNVEVnUFNBd0xDQjBNVElnUFNBd0xDQjBNVE1nUFNBd0xDQjBNVFFnUFNBd0xDQjBNVFVnUFNBd0xGeHVJQ0FnSUhReE5pQTlJREFzSUhReE55QTlJREFzSUhReE9DQTlJREFzSUhReE9TQTlJREFzSUhReU1DQTlJREFzSUhReU1TQTlJREFzSUhReU1pQTlJREFzSUhReU15QTlJREFzWEc0Z0lDQWdkREkwSUQwZ01Dd2dkREkxSUQwZ01Dd2dkREkySUQwZ01Dd2dkREkzSUQwZ01Dd2dkREk0SUQwZ01Dd2dkREk1SUQwZ01Dd2dkRE13SUQwZ01DeGNiaUFnSUNCaU1DQTlJR0piTUYwc1hHNGdJQ0FnWWpFZ1BTQmlXekZkTEZ4dUlDQWdJR0l5SUQwZ1lsc3lYU3hjYmlBZ0lDQmlNeUE5SUdKYk0xMHNYRzRnSUNBZ1lqUWdQU0JpV3pSZExGeHVJQ0FnSUdJMUlEMGdZbHMxWFN4Y2JpQWdJQ0JpTmlBOUlHSmJObDBzWEc0Z0lDQWdZamNnUFNCaVd6ZGRMRnh1SUNBZ0lHSTRJRDBnWWxzNFhTeGNiaUFnSUNCaU9TQTlJR0piT1Ywc1hHNGdJQ0FnWWpFd0lEMGdZbHN4TUYwc1hHNGdJQ0FnWWpFeElEMGdZbHN4TVYwc1hHNGdJQ0FnWWpFeUlEMGdZbHN4TWwwc1hHNGdJQ0FnWWpFeklEMGdZbHN4TTEwc1hHNGdJQ0FnWWpFMElEMGdZbHN4TkYwc1hHNGdJQ0FnWWpFMUlEMGdZbHN4TlYwN1hHNWNiaUFnZGlBOUlHRmJNRjA3WEc0Z0lIUXdJQ3M5SUhZZ0tpQmlNRHRjYmlBZ2RERWdLejBnZGlBcUlHSXhPMXh1SUNCME1pQXJQU0IySUNvZ1lqSTdYRzRnSUhReklDczlJSFlnS2lCaU16dGNiaUFnZERRZ0t6MGdkaUFxSUdJME8xeHVJQ0IwTlNBclBTQjJJQ29nWWpVN1hHNGdJSFEySUNzOUlIWWdLaUJpTmp0Y2JpQWdkRGNnS3owZ2RpQXFJR0kzTzF4dUlDQjBPQ0FyUFNCMklDb2dZamc3WEc0Z0lIUTVJQ3M5SUhZZ0tpQmlPVHRjYmlBZ2RERXdJQ3M5SUhZZ0tpQmlNVEE3WEc0Z0lIUXhNU0FyUFNCMklDb2dZakV4TzF4dUlDQjBNVElnS3owZ2RpQXFJR0l4TWp0Y2JpQWdkREV6SUNzOUlIWWdLaUJpTVRNN1hHNGdJSFF4TkNBclBTQjJJQ29nWWpFME8xeHVJQ0IwTVRVZ0t6MGdkaUFxSUdJeE5UdGNiaUFnZGlBOUlHRmJNVjA3WEc0Z0lIUXhJQ3M5SUhZZ0tpQmlNRHRjYmlBZ2RESWdLejBnZGlBcUlHSXhPMXh1SUNCME15QXJQU0IySUNvZ1lqSTdYRzRnSUhRMElDczlJSFlnS2lCaU16dGNiaUFnZERVZ0t6MGdkaUFxSUdJME8xeHVJQ0IwTmlBclBTQjJJQ29nWWpVN1hHNGdJSFEzSUNzOUlIWWdLaUJpTmp0Y2JpQWdkRGdnS3owZ2RpQXFJR0kzTzF4dUlDQjBPU0FyUFNCMklDb2dZamc3WEc0Z0lIUXhNQ0FyUFNCMklDb2dZams3WEc0Z0lIUXhNU0FyUFNCMklDb2dZakV3TzF4dUlDQjBNVElnS3owZ2RpQXFJR0l4TVR0Y2JpQWdkREV6SUNzOUlIWWdLaUJpTVRJN1hHNGdJSFF4TkNBclBTQjJJQ29nWWpFek8xeHVJQ0IwTVRVZ0t6MGdkaUFxSUdJeE5EdGNiaUFnZERFMklDczlJSFlnS2lCaU1UVTdYRzRnSUhZZ1BTQmhXekpkTzF4dUlDQjBNaUFyUFNCMklDb2dZakE3WEc0Z0lIUXpJQ3M5SUhZZ0tpQmlNVHRjYmlBZ2REUWdLejBnZGlBcUlHSXlPMXh1SUNCME5TQXJQU0IySUNvZ1lqTTdYRzRnSUhRMklDczlJSFlnS2lCaU5EdGNiaUFnZERjZ0t6MGdkaUFxSUdJMU8xeHVJQ0IwT0NBclBTQjJJQ29nWWpZN1hHNGdJSFE1SUNzOUlIWWdLaUJpTnp0Y2JpQWdkREV3SUNzOUlIWWdLaUJpT0R0Y2JpQWdkREV4SUNzOUlIWWdLaUJpT1R0Y2JpQWdkREV5SUNzOUlIWWdLaUJpTVRBN1hHNGdJSFF4TXlBclBTQjJJQ29nWWpFeE8xeHVJQ0IwTVRRZ0t6MGdkaUFxSUdJeE1qdGNiaUFnZERFMUlDczlJSFlnS2lCaU1UTTdYRzRnSUhReE5pQXJQU0IySUNvZ1lqRTBPMXh1SUNCME1UY2dLejBnZGlBcUlHSXhOVHRjYmlBZ2RpQTlJR0ZiTTEwN1hHNGdJSFF6SUNzOUlIWWdLaUJpTUR0Y2JpQWdkRFFnS3owZ2RpQXFJR0l4TzF4dUlDQjBOU0FyUFNCMklDb2dZakk3WEc0Z0lIUTJJQ3M5SUhZZ0tpQmlNenRjYmlBZ2REY2dLejBnZGlBcUlHSTBPMXh1SUNCME9DQXJQU0IySUNvZ1lqVTdYRzRnSUhRNUlDczlJSFlnS2lCaU5qdGNiaUFnZERFd0lDczlJSFlnS2lCaU56dGNiaUFnZERFeElDczlJSFlnS2lCaU9EdGNiaUFnZERFeUlDczlJSFlnS2lCaU9UdGNiaUFnZERFeklDczlJSFlnS2lCaU1UQTdYRzRnSUhReE5DQXJQU0IySUNvZ1lqRXhPMXh1SUNCME1UVWdLejBnZGlBcUlHSXhNanRjYmlBZ2RERTJJQ3M5SUhZZ0tpQmlNVE03WEc0Z0lIUXhOeUFyUFNCMklDb2dZakUwTzF4dUlDQjBNVGdnS3owZ2RpQXFJR0l4TlR0Y2JpQWdkaUE5SUdGYk5GMDdYRzRnSUhRMElDczlJSFlnS2lCaU1EdGNiaUFnZERVZ0t6MGdkaUFxSUdJeE8xeHVJQ0IwTmlBclBTQjJJQ29nWWpJN1hHNGdJSFEzSUNzOUlIWWdLaUJpTXp0Y2JpQWdkRGdnS3owZ2RpQXFJR0kwTzF4dUlDQjBPU0FyUFNCMklDb2dZalU3WEc0Z0lIUXhNQ0FyUFNCMklDb2dZalk3WEc0Z0lIUXhNU0FyUFNCMklDb2dZamM3WEc0Z0lIUXhNaUFyUFNCMklDb2dZamc3WEc0Z0lIUXhNeUFyUFNCMklDb2dZams3WEc0Z0lIUXhOQ0FyUFNCMklDb2dZakV3TzF4dUlDQjBNVFVnS3owZ2RpQXFJR0l4TVR0Y2JpQWdkREUySUNzOUlIWWdLaUJpTVRJN1hHNGdJSFF4TnlBclBTQjJJQ29nWWpFek8xeHVJQ0IwTVRnZ0t6MGdkaUFxSUdJeE5EdGNiaUFnZERFNUlDczlJSFlnS2lCaU1UVTdYRzRnSUhZZ1BTQmhXelZkTzF4dUlDQjBOU0FyUFNCMklDb2dZakE3WEc0Z0lIUTJJQ3M5SUhZZ0tpQmlNVHRjYmlBZ2REY2dLejBnZGlBcUlHSXlPMXh1SUNCME9DQXJQU0IySUNvZ1lqTTdYRzRnSUhRNUlDczlJSFlnS2lCaU5EdGNiaUFnZERFd0lDczlJSFlnS2lCaU5UdGNiaUFnZERFeElDczlJSFlnS2lCaU5qdGNiaUFnZERFeUlDczlJSFlnS2lCaU56dGNiaUFnZERFeklDczlJSFlnS2lCaU9EdGNiaUFnZERFMElDczlJSFlnS2lCaU9UdGNiaUFnZERFMUlDczlJSFlnS2lCaU1UQTdYRzRnSUhReE5pQXJQU0IySUNvZ1lqRXhPMXh1SUNCME1UY2dLejBnZGlBcUlHSXhNanRjYmlBZ2RERTRJQ3M5SUhZZ0tpQmlNVE03WEc0Z0lIUXhPU0FyUFNCMklDb2dZakUwTzF4dUlDQjBNakFnS3owZ2RpQXFJR0l4TlR0Y2JpQWdkaUE5SUdGYk5sMDdYRzRnSUhRMklDczlJSFlnS2lCaU1EdGNiaUFnZERjZ0t6MGdkaUFxSUdJeE8xeHVJQ0IwT0NBclBTQjJJQ29nWWpJN1hHNGdJSFE1SUNzOUlIWWdLaUJpTXp0Y2JpQWdkREV3SUNzOUlIWWdLaUJpTkR0Y2JpQWdkREV4SUNzOUlIWWdLaUJpTlR0Y2JpQWdkREV5SUNzOUlIWWdLaUJpTmp0Y2JpQWdkREV6SUNzOUlIWWdLaUJpTnp0Y2JpQWdkREUwSUNzOUlIWWdLaUJpT0R0Y2JpQWdkREUxSUNzOUlIWWdLaUJpT1R0Y2JpQWdkREUySUNzOUlIWWdLaUJpTVRBN1hHNGdJSFF4TnlBclBTQjJJQ29nWWpFeE8xeHVJQ0IwTVRnZ0t6MGdkaUFxSUdJeE1qdGNiaUFnZERFNUlDczlJSFlnS2lCaU1UTTdYRzRnSUhReU1DQXJQU0IySUNvZ1lqRTBPMXh1SUNCME1qRWdLejBnZGlBcUlHSXhOVHRjYmlBZ2RpQTlJR0ZiTjEwN1hHNGdJSFEzSUNzOUlIWWdLaUJpTUR0Y2JpQWdkRGdnS3owZ2RpQXFJR0l4TzF4dUlDQjBPU0FyUFNCMklDb2dZakk3WEc0Z0lIUXhNQ0FyUFNCMklDb2dZak03WEc0Z0lIUXhNU0FyUFNCMklDb2dZalE3WEc0Z0lIUXhNaUFyUFNCMklDb2dZalU3WEc0Z0lIUXhNeUFyUFNCMklDb2dZalk3WEc0Z0lIUXhOQ0FyUFNCMklDb2dZamM3WEc0Z0lIUXhOU0FyUFNCMklDb2dZamc3WEc0Z0lIUXhOaUFyUFNCMklDb2dZams3WEc0Z0lIUXhOeUFyUFNCMklDb2dZakV3TzF4dUlDQjBNVGdnS3owZ2RpQXFJR0l4TVR0Y2JpQWdkREU1SUNzOUlIWWdLaUJpTVRJN1hHNGdJSFF5TUNBclBTQjJJQ29nWWpFek8xeHVJQ0IwTWpFZ0t6MGdkaUFxSUdJeE5EdGNiaUFnZERJeUlDczlJSFlnS2lCaU1UVTdYRzRnSUhZZ1BTQmhXemhkTzF4dUlDQjBPQ0FyUFNCMklDb2dZakE3WEc0Z0lIUTVJQ3M5SUhZZ0tpQmlNVHRjYmlBZ2RERXdJQ3M5SUhZZ0tpQmlNanRjYmlBZ2RERXhJQ3M5SUhZZ0tpQmlNenRjYmlBZ2RERXlJQ3M5SUhZZ0tpQmlORHRjYmlBZ2RERXpJQ3M5SUhZZ0tpQmlOVHRjYmlBZ2RERTBJQ3M5SUhZZ0tpQmlOanRjYmlBZ2RERTFJQ3M5SUhZZ0tpQmlOenRjYmlBZ2RERTJJQ3M5SUhZZ0tpQmlPRHRjYmlBZ2RERTNJQ3M5SUhZZ0tpQmlPVHRjYmlBZ2RERTRJQ3M5SUhZZ0tpQmlNVEE3WEc0Z0lIUXhPU0FyUFNCMklDb2dZakV4TzF4dUlDQjBNakFnS3owZ2RpQXFJR0l4TWp0Y2JpQWdkREl4SUNzOUlIWWdLaUJpTVRNN1hHNGdJSFF5TWlBclBTQjJJQ29nWWpFME8xeHVJQ0IwTWpNZ0t6MGdkaUFxSUdJeE5UdGNiaUFnZGlBOUlHRmJPVjA3WEc0Z0lIUTVJQ3M5SUhZZ0tpQmlNRHRjYmlBZ2RERXdJQ3M5SUhZZ0tpQmlNVHRjYmlBZ2RERXhJQ3M5SUhZZ0tpQmlNanRjYmlBZ2RERXlJQ3M5SUhZZ0tpQmlNenRjYmlBZ2RERXpJQ3M5SUhZZ0tpQmlORHRjYmlBZ2RERTBJQ3M5SUhZZ0tpQmlOVHRjYmlBZ2RERTFJQ3M5SUhZZ0tpQmlOanRjYmlBZ2RERTJJQ3M5SUhZZ0tpQmlOenRjYmlBZ2RERTNJQ3M5SUhZZ0tpQmlPRHRjYmlBZ2RERTRJQ3M5SUhZZ0tpQmlPVHRjYmlBZ2RERTVJQ3M5SUhZZ0tpQmlNVEE3WEc0Z0lIUXlNQ0FyUFNCMklDb2dZakV4TzF4dUlDQjBNakVnS3owZ2RpQXFJR0l4TWp0Y2JpQWdkREl5SUNzOUlIWWdLaUJpTVRNN1hHNGdJSFF5TXlBclBTQjJJQ29nWWpFME8xeHVJQ0IwTWpRZ0t6MGdkaUFxSUdJeE5UdGNiaUFnZGlBOUlHRmJNVEJkTzF4dUlDQjBNVEFnS3owZ2RpQXFJR0l3TzF4dUlDQjBNVEVnS3owZ2RpQXFJR0l4TzF4dUlDQjBNVElnS3owZ2RpQXFJR0l5TzF4dUlDQjBNVE1nS3owZ2RpQXFJR0l6TzF4dUlDQjBNVFFnS3owZ2RpQXFJR0kwTzF4dUlDQjBNVFVnS3owZ2RpQXFJR0kxTzF4dUlDQjBNVFlnS3owZ2RpQXFJR0kyTzF4dUlDQjBNVGNnS3owZ2RpQXFJR0kzTzF4dUlDQjBNVGdnS3owZ2RpQXFJR0k0TzF4dUlDQjBNVGtnS3owZ2RpQXFJR0k1TzF4dUlDQjBNakFnS3owZ2RpQXFJR0l4TUR0Y2JpQWdkREl4SUNzOUlIWWdLaUJpTVRFN1hHNGdJSFF5TWlBclBTQjJJQ29nWWpFeU8xeHVJQ0IwTWpNZ0t6MGdkaUFxSUdJeE16dGNiaUFnZERJMElDczlJSFlnS2lCaU1UUTdYRzRnSUhReU5TQXJQU0IySUNvZ1lqRTFPMXh1SUNCMklEMGdZVnN4TVYwN1hHNGdJSFF4TVNBclBTQjJJQ29nWWpBN1hHNGdJSFF4TWlBclBTQjJJQ29nWWpFN1hHNGdJSFF4TXlBclBTQjJJQ29nWWpJN1hHNGdJSFF4TkNBclBTQjJJQ29nWWpNN1hHNGdJSFF4TlNBclBTQjJJQ29nWWpRN1hHNGdJSFF4TmlBclBTQjJJQ29nWWpVN1hHNGdJSFF4TnlBclBTQjJJQ29nWWpZN1hHNGdJSFF4T0NBclBTQjJJQ29nWWpjN1hHNGdJSFF4T1NBclBTQjJJQ29nWWpnN1hHNGdJSFF5TUNBclBTQjJJQ29nWWprN1hHNGdJSFF5TVNBclBTQjJJQ29nWWpFd08xeHVJQ0IwTWpJZ0t6MGdkaUFxSUdJeE1UdGNiaUFnZERJeklDczlJSFlnS2lCaU1USTdYRzRnSUhReU5DQXJQU0IySUNvZ1lqRXpPMXh1SUNCME1qVWdLejBnZGlBcUlHSXhORHRjYmlBZ2RESTJJQ3M5SUhZZ0tpQmlNVFU3WEc0Z0lIWWdQU0JoV3pFeVhUdGNiaUFnZERFeUlDczlJSFlnS2lCaU1EdGNiaUFnZERFeklDczlJSFlnS2lCaU1UdGNiaUFnZERFMElDczlJSFlnS2lCaU1qdGNiaUFnZERFMUlDczlJSFlnS2lCaU16dGNiaUFnZERFMklDczlJSFlnS2lCaU5EdGNiaUFnZERFM0lDczlJSFlnS2lCaU5UdGNiaUFnZERFNElDczlJSFlnS2lCaU5qdGNiaUFnZERFNUlDczlJSFlnS2lCaU56dGNiaUFnZERJd0lDczlJSFlnS2lCaU9EdGNiaUFnZERJeElDczlJSFlnS2lCaU9UdGNiaUFnZERJeUlDczlJSFlnS2lCaU1UQTdYRzRnSUhReU15QXJQU0IySUNvZ1lqRXhPMXh1SUNCME1qUWdLejBnZGlBcUlHSXhNanRjYmlBZ2RESTFJQ3M5SUhZZ0tpQmlNVE03WEc0Z0lIUXlOaUFyUFNCMklDb2dZakUwTzF4dUlDQjBNamNnS3owZ2RpQXFJR0l4TlR0Y2JpQWdkaUE5SUdGYk1UTmRPMXh1SUNCME1UTWdLejBnZGlBcUlHSXdPMXh1SUNCME1UUWdLejBnZGlBcUlHSXhPMXh1SUNCME1UVWdLejBnZGlBcUlHSXlPMXh1SUNCME1UWWdLejBnZGlBcUlHSXpPMXh1SUNCME1UY2dLejBnZGlBcUlHSTBPMXh1SUNCME1UZ2dLejBnZGlBcUlHSTFPMXh1SUNCME1Ua2dLejBnZGlBcUlHSTJPMXh1SUNCME1qQWdLejBnZGlBcUlHSTNPMXh1SUNCME1qRWdLejBnZGlBcUlHSTRPMXh1SUNCME1qSWdLejBnZGlBcUlHSTVPMXh1SUNCME1qTWdLejBnZGlBcUlHSXhNRHRjYmlBZ2RESTBJQ3M5SUhZZ0tpQmlNVEU3WEc0Z0lIUXlOU0FyUFNCMklDb2dZakV5TzF4dUlDQjBNallnS3owZ2RpQXFJR0l4TXp0Y2JpQWdkREkzSUNzOUlIWWdLaUJpTVRRN1hHNGdJSFF5T0NBclBTQjJJQ29nWWpFMU8xeHVJQ0IySUQwZ1lWc3hORjA3WEc0Z0lIUXhOQ0FyUFNCMklDb2dZakE3WEc0Z0lIUXhOU0FyUFNCMklDb2dZakU3WEc0Z0lIUXhOaUFyUFNCMklDb2dZakk3WEc0Z0lIUXhOeUFyUFNCMklDb2dZak03WEc0Z0lIUXhPQ0FyUFNCMklDb2dZalE3WEc0Z0lIUXhPU0FyUFNCMklDb2dZalU3WEc0Z0lIUXlNQ0FyUFNCMklDb2dZalk3WEc0Z0lIUXlNU0FyUFNCMklDb2dZamM3WEc0Z0lIUXlNaUFyUFNCMklDb2dZamc3WEc0Z0lIUXlNeUFyUFNCMklDb2dZams3WEc0Z0lIUXlOQ0FyUFNCMklDb2dZakV3TzF4dUlDQjBNalVnS3owZ2RpQXFJR0l4TVR0Y2JpQWdkREkySUNzOUlIWWdLaUJpTVRJN1hHNGdJSFF5TnlBclBTQjJJQ29nWWpFek8xeHVJQ0IwTWpnZ0t6MGdkaUFxSUdJeE5EdGNiaUFnZERJNUlDczlJSFlnS2lCaU1UVTdYRzRnSUhZZ1BTQmhXekUxWFR0Y2JpQWdkREUxSUNzOUlIWWdLaUJpTUR0Y2JpQWdkREUySUNzOUlIWWdLaUJpTVR0Y2JpQWdkREUzSUNzOUlIWWdLaUJpTWp0Y2JpQWdkREU0SUNzOUlIWWdLaUJpTXp0Y2JpQWdkREU1SUNzOUlIWWdLaUJpTkR0Y2JpQWdkREl3SUNzOUlIWWdLaUJpTlR0Y2JpQWdkREl4SUNzOUlIWWdLaUJpTmp0Y2JpQWdkREl5SUNzOUlIWWdLaUJpTnp0Y2JpQWdkREl6SUNzOUlIWWdLaUJpT0R0Y2JpQWdkREkwSUNzOUlIWWdLaUJpT1R0Y2JpQWdkREkxSUNzOUlIWWdLaUJpTVRBN1hHNGdJSFF5TmlBclBTQjJJQ29nWWpFeE8xeHVJQ0IwTWpjZ0t6MGdkaUFxSUdJeE1qdGNiaUFnZERJNElDczlJSFlnS2lCaU1UTTdYRzRnSUhReU9TQXJQU0IySUNvZ1lqRTBPMXh1SUNCME16QWdLejBnZGlBcUlHSXhOVHRjYmx4dUlDQjBNQ0FnS3owZ016Z2dLaUIwTVRZN1hHNGdJSFF4SUNBclBTQXpPQ0FxSUhReE56dGNiaUFnZERJZ0lDczlJRE00SUNvZ2RERTRPMXh1SUNCME15QWdLejBnTXpnZ0tpQjBNVGs3WEc0Z0lIUTBJQ0FyUFNBek9DQXFJSFF5TUR0Y2JpQWdkRFVnSUNzOUlETTRJQ29nZERJeE8xeHVJQ0IwTmlBZ0t6MGdNemdnS2lCME1qSTdYRzRnSUhRM0lDQXJQU0F6T0NBcUlIUXlNenRjYmlBZ2REZ2dJQ3M5SURNNElDb2dkREkwTzF4dUlDQjBPU0FnS3owZ016Z2dLaUIwTWpVN1hHNGdJSFF4TUNBclBTQXpPQ0FxSUhReU5qdGNiaUFnZERFeElDczlJRE00SUNvZ2RESTNPMXh1SUNCME1USWdLejBnTXpnZ0tpQjBNamc3WEc0Z0lIUXhNeUFyUFNBek9DQXFJSFF5T1R0Y2JpQWdkREUwSUNzOUlETTRJQ29nZERNd08xeHVJQ0F2THlCME1UVWdiR1ZtZENCaGN5QnBjMXh1WEc0Z0lDOHZJR1pwY25OMElHTmhjbHh1SUNCaklEMGdNVHRjYmlBZ2RpQTlJQ0IwTUNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFF3SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTVNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFF4SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTWlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFF5SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTXlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFF6SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTkNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFEwSUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTlNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFExSUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTmlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFEySUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwTnlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFEzSUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwT0NBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFE0SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJQ0IwT1NBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dJSFE1SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TUNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREV3SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TVNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREV4SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TWlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREV5SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TXlBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREV6SUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TkNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREUwSUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2RpQTlJSFF4TlNBcklHTWdLeUEyTlRVek5Uc2dZeUE5SUUxaGRHZ3VabXh2YjNJb2RpQXZJRFkxTlRNMktUc2dkREUxSUQwZ2RpQXRJR01nS2lBMk5UVXpOanRjYmlBZ2REQWdLejBnWXkweElDc2dNemNnS2lBb1l5MHhLVHRjYmx4dUlDQXZMeUJ6WldOdmJtUWdZMkZ5WEc0Z0lHTWdQU0F4TzF4dUlDQjJJRDBnSUhRd0lDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERBZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhReElDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERFZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhReUlDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERJZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhReklDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERNZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRMElDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERRZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRMUlDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERVZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRMklDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERZZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRM0lDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERjZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRNElDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERnZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnSUhRNUlDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUFnZERrZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFd0lDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRBZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFeElDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRFZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFeUlDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRJZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFeklDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRNZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFMElDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRRZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjJJRDBnZERFMUlDc2dZeUFySURZMU5UTTFPeUJqSUQwZ1RXRjBhQzVtYkc5dmNpaDJJQzhnTmpVMU16WXBPeUIwTVRVZ1BTQjJJQzBnWXlBcUlEWTFOVE0yTzF4dUlDQjBNQ0FyUFNCakxURWdLeUF6TnlBcUlDaGpMVEVwTzF4dVhHNGdJRzliSURCZElEMGdkREE3WEc0Z0lHOWJJREZkSUQwZ2RERTdYRzRnSUc5YklESmRJRDBnZERJN1hHNGdJRzliSUROZElEMGdkRE03WEc0Z0lHOWJJRFJkSUQwZ2REUTdYRzRnSUc5YklEVmRJRDBnZERVN1hHNGdJRzliSURaZElEMGdkRFk3WEc0Z0lHOWJJRGRkSUQwZ2REYzdYRzRnSUc5YklEaGRJRDBnZERnN1hHNGdJRzliSURsZElEMGdkRGs3WEc0Z0lHOWJNVEJkSUQwZ2RERXdPMXh1SUNCdld6RXhYU0E5SUhReE1UdGNiaUFnYjFzeE1sMGdQU0IwTVRJN1hHNGdJRzliTVROZElEMGdkREV6TzF4dUlDQnZXekUwWFNBOUlIUXhORHRjYmlBZ2Ixc3hOVjBnUFNCME1UVTdYRzU5WEc1Y2JtWjFibU4wYVc5dUlGTW9ieXdnWVNrZ2UxeHVJQ0JOS0c4c0lHRXNJR0VwTzF4dWZWeHVYRzVtZFc1amRHbHZiaUJwYm5ZeU5UVXhPU2h2TENCcEtTQjdYRzRnSUhaaGNpQmpJRDBnWjJZb0tUdGNiaUFnZG1GeUlHRTdYRzRnSUdadmNpQW9ZU0E5SURBN0lHRWdQQ0F4TmpzZ1lTc3JLU0JqVzJGZElEMGdhVnRoWFR0Y2JpQWdabTl5SUNoaElEMGdNalV6T3lCaElENDlJREE3SUdFdExTa2dlMXh1SUNBZ0lGTW9ZeXdnWXlrN1hHNGdJQ0FnYVdZb1lTQWhQVDBnTWlBbUppQmhJQ0U5UFNBMEtTQk5LR01zSUdNc0lHa3BPMXh1SUNCOVhHNGdJR1p2Y2lBb1lTQTlJREE3SUdFZ1BDQXhOanNnWVNzcktTQnZXMkZkSUQwZ1kxdGhYVHRjYm4xY2JseHVablZ1WTNScGIyNGdjRzkzTWpVeU15aHZMQ0JwS1NCN1hHNGdJSFpoY2lCaklEMGdaMllvS1R0Y2JpQWdkbUZ5SUdFN1hHNGdJR1p2Y2lBb1lTQTlJREE3SUdFZ1BDQXhOanNnWVNzcktTQmpXMkZkSUQwZ2FWdGhYVHRjYmlBZ1ptOXlJQ2hoSUQwZ01qVXdPeUJoSUQ0OUlEQTdJR0V0TFNrZ2UxeHVJQ0FnSUNBZ1V5aGpMQ0JqS1R0Y2JpQWdJQ0FnSUdsbUtHRWdJVDA5SURFcElFMG9ZeXdnWXl3Z2FTazdYRzRnSUgxY2JpQWdabTl5SUNoaElEMGdNRHNnWVNBOElERTJPeUJoS3lzcElHOWJZVjBnUFNCalcyRmRPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpjbmx3ZEc5ZmMyTmhiR0Z5YlhWc2RDaHhMQ0J1TENCd0tTQjdYRzRnSUhaaGNpQjZJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29NeklwTzF4dUlDQjJZWElnZUNBOUlHNWxkeUJHYkc5aGREWTBRWEp5WVhrb09EQXBMQ0J5TENCcE8xeHVJQ0IyWVhJZ1lTQTlJR2RtS0Nrc0lHSWdQU0JuWmlncExDQmpJRDBnWjJZb0tTeGNiaUFnSUNBZ0lHUWdQU0JuWmlncExDQmxJRDBnWjJZb0tTd2daaUE5SUdkbUtDazdYRzRnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0F6TVRzZ2FTc3JLU0I2VzJsZElEMGdibHRwWFR0Y2JpQWdlbHN6TVYwOUtHNWJNekZkSmpFeU55bDhOalE3WEc0Z0lIcGJNRjBtUFRJME9EdGNiaUFnZFc1d1lXTnJNalUxTVRrb2VDeHdLVHRjYmlBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SURFMk95QnBLeXNwSUh0Y2JpQWdJQ0JpVzJsZFBYaGJhVjA3WEc0Z0lDQWdaRnRwWFQxaFcybGRQV05iYVYwOU1EdGNiaUFnZlZ4dUlDQmhXekJkUFdSYk1GMDlNVHRjYmlBZ1ptOXlJQ2hwUFRJMU5Ec2dhVDQ5TURzZ0xTMXBLU0I3WEc0Z0lDQWdjajBvZWx0cFBqNCtNMTArUGo0b2FTWTNLU2ttTVR0Y2JpQWdJQ0J6Wld3eU5UVXhPU2hoTEdJc2NpazdYRzRnSUNBZ2MyVnNNalUxTVRrb1l5eGtMSElwTzF4dUlDQWdJRUVvWlN4aExHTXBPMXh1SUNBZ0lGb29ZU3hoTEdNcE8xeHVJQ0FnSUVFb1l5eGlMR1FwTzF4dUlDQWdJRm9vWWl4aUxHUXBPMXh1SUNBZ0lGTW9aQ3hsS1R0Y2JpQWdJQ0JUS0dZc1lTazdYRzRnSUNBZ1RTaGhMR01zWVNrN1hHNGdJQ0FnVFNoakxHSXNaU2s3WEc0Z0lDQWdRU2hsTEdFc1l5azdYRzRnSUNBZ1dpaGhMR0VzWXlrN1hHNGdJQ0FnVXloaUxHRXBPMXh1SUNBZ0lGb29ZeXhrTEdZcE8xeHVJQ0FnSUUwb1lTeGpMRjh4TWpFMk5qVXBPMXh1SUNBZ0lFRW9ZU3hoTEdRcE8xeHVJQ0FnSUUwb1l5eGpMR0VwTzF4dUlDQWdJRTBvWVN4a0xHWXBPMXh1SUNBZ0lFMG9aQ3hpTEhncE8xeHVJQ0FnSUZNb1lpeGxLVHRjYmlBZ0lDQnpaV3d5TlRVeE9TaGhMR0lzY2lrN1hHNGdJQ0FnYzJWc01qVTFNVGtvWXl4a0xISXBPMXh1SUNCOVhHNGdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQXhOanNnYVNzcktTQjdYRzRnSUNBZ2VGdHBLekUyWFQxaFcybGRPMXh1SUNBZ0lIaGJhU3N6TWwwOVkxdHBYVHRjYmlBZ0lDQjRXMmtyTkRoZFBXSmJhVjA3WEc0Z0lDQWdlRnRwS3pZMFhUMWtXMmxkTzF4dUlDQjlYRzRnSUhaaGNpQjRNeklnUFNCNExuTjFZbUZ5Y21GNUtETXlLVHRjYmlBZ2RtRnlJSGd4TmlBOUlIZ3VjM1ZpWVhKeVlYa29NVFlwTzF4dUlDQnBibll5TlRVeE9TaDRNeklzZURNeUtUdGNiaUFnVFNoNE1UWXNlREUyTEhnek1pazdYRzRnSUhCaFkyc3lOVFV4T1NoeExIZ3hOaWs3WEc0Z0lISmxkSFZ5YmlBd08xeHVmVnh1WEc1bWRXNWpkR2x2YmlCamNubHdkRzlmYzJOaGJHRnliWFZzZEY5aVlYTmxLSEVzSUc0cElIdGNiaUFnY21WMGRYSnVJR055ZVhCMGIxOXpZMkZzWVhKdGRXeDBLSEVzSUc0c0lGODVLVHRjYm4xY2JseHVablZ1WTNScGIyNGdZM0o1Y0hSdlgySnZlRjlyWlhsd1lXbHlLSGtzSUhncElIdGNiaUFnY21GdVpHOXRZbmwwWlhNb2VDd2dNeklwTzF4dUlDQnlaWFIxY200Z1kzSjVjSFJ2WDNOallXeGhjbTExYkhSZlltRnpaU2g1TENCNEtUdGNibjFjYmx4dVpuVnVZM1JwYjI0Z1kzSjVjSFJ2WDJKdmVGOWlaV1p2Y21WdWJTaHJMQ0I1TENCNEtTQjdYRzRnSUhaaGNpQnpJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29NeklwTzF4dUlDQmpjbmx3ZEc5ZmMyTmhiR0Z5YlhWc2RDaHpMQ0I0TENCNUtUdGNiaUFnY21WMGRYSnVJR055ZVhCMGIxOWpiM0psWDJoellXeHpZVEl3S0dzc0lGOHdMQ0J6TENCemFXZHRZU2s3WEc1OVhHNWNiblpoY2lCamNubHdkRzlmWW05NFgyRm1kR1Z5Ym0wZ1BTQmpjbmx3ZEc5ZmMyVmpjbVYwWW05NE8xeHVkbUZ5SUdOeWVYQjBiMTlpYjNoZmIzQmxibDloWm5SbGNtNXRJRDBnWTNKNWNIUnZYM05sWTNKbGRHSnZlRjl2Y0dWdU8xeHVYRzVtZFc1amRHbHZiaUJqY25sd2RHOWZZbTk0S0dNc0lHMHNJR1FzSUc0c0lIa3NJSGdwSUh0Y2JpQWdkbUZ5SUdzZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNnek1pazdYRzRnSUdOeWVYQjBiMTlpYjNoZlltVm1iM0psYm0wb2F5d2dlU3dnZUNrN1hHNGdJSEpsZEhWeWJpQmpjbmx3ZEc5ZlltOTRYMkZtZEdWeWJtMG9ZeXdnYlN3Z1pDd2diaXdnYXlrN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdOeWVYQjBiMTlpYjNoZmIzQmxiaWh0TENCakxDQmtMQ0J1TENCNUxDQjRLU0I3WEc0Z0lIWmhjaUJySUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvTXpJcE8xeHVJQ0JqY25sd2RHOWZZbTk0WDJKbFptOXlaVzV0S0dzc0lIa3NJSGdwTzF4dUlDQnlaWFIxY200Z1kzSjVjSFJ2WDJKdmVGOXZjR1Z1WDJGbWRHVnlibTBvYlN3Z1l5d2daQ3dnYml3Z2F5azdYRzU5WEc1Y2JuWmhjaUJMSUQwZ1cxeHVJQ0F3ZURReU9HRXlaams0TENBd2VHUTNNamhoWlRJeUxDQXdlRGN4TXpjME5Ea3hMQ0F3ZURJelpXWTJOV05rTEZ4dUlDQXdlR0kxWXpCbVltTm1MQ0F3ZUdWak5HUXpZakptTENBd2VHVTVZalZrWW1FMUxDQXdlRGd4T0Rsa1ltSmpMRnh1SUNBd2VETTVOVFpqTWpWaUxDQXdlR1l6TkRoaU5UTTRMQ0F3ZURVNVpqRXhNV1l4TENBd2VHSTJNRFZrTURFNUxGeHVJQ0F3ZURreU0yWTRNbUUwTENBd2VHRm1NVGswWmpsaUxDQXdlR0ZpTVdNMVpXUTFMQ0F3ZUdSaE5tUTRNVEU0TEZ4dUlDQXdlR1E0TURkaFlUazRMQ0F3ZUdFek1ETXdNalF5TENBd2VERXlPRE0xWWpBeExDQXdlRFExTnpBMlptSmxMRnh1SUNBd2VESTBNekU0TldKbExDQXdlRFJsWlRSaU1qaGpMQ0F3ZURVMU1HTTNaR016TENBd2VHUTFabVppTkdVeUxGeHVJQ0F3ZURjeVltVTFaRGMwTENBd2VHWXlOMkk0T1RabUxDQXdlRGd3WkdWaU1XWmxMQ0F3ZUROaU1UWTVObUl4TEZ4dUlDQXdlRGxpWkdNd05tRTNMQ0F3ZURJMVl6Y3hNak0xTENBd2VHTXhPV0ptTVRjMExDQXdlR05tTmpreU5qazBMRnh1SUNBd2VHVTBPV0kyT1dNeExDQXdlRGxsWmpFMFlXUXlMQ0F3ZUdWbVltVTBOemcyTENBd2VETTROR1l5TldVekxGeHVJQ0F3ZURCbVl6RTVaR00yTENBd2VEaGlPR05rTldJMUxDQXdlREkwTUdOaE1XTmpMQ0F3ZURjM1lXTTVZelkxTEZ4dUlDQXdlREprWlRreVl6Wm1MQ0F3ZURVNU1tSXdNamMxTENBd2VEUmhOelE0TkdGaExDQXdlRFpsWVRabE5EZ3pMRnh1SUNBd2VEVmpZakJoT1dSakxDQXdlR0prTkRGbVltUTBMQ0F3ZURjMlpqazRPR1JoTENBd2VEZ3pNVEUxTTJJMUxGeHVJQ0F3ZURrNE0yVTFNVFV5TENBd2VHVmxOalprWm1GaUxDQXdlR0U0TXpGak5qWmtMQ0F3ZURKa1lqUXpNakV3TEZ4dUlDQXdlR0l3TURNeU4yTTRMQ0F3ZURrNFptSXlNVE5tTENBd2VHSm1OVGszWm1NM0xDQXdlR0psWldZd1pXVTBMRnh1SUNBd2VHTTJaVEF3WW1ZekxDQXdlRE5rWVRnNFptTXlMQ0F3ZUdRMVlUYzVNVFEzTENBd2VEa3pNR0ZoTnpJMUxGeHVJQ0F3ZURBMlkyRTJNelV4TENBd2VHVXdNRE00TWpabUxDQXdlREUwTWpreU9UWTNMQ0F3ZURCaE1HVTJaVGN3TEZ4dUlDQXdlREkzWWpjd1lUZzFMQ0F3ZURRMlpESXlabVpqTENBd2VESmxNV0l5TVRNNExDQXdlRFZqTWpaak9USTJMRnh1SUNBd2VEUmtNbU0yWkdaakxDQXdlRFZoWXpReVlXVmtMQ0F3ZURVek16Z3daREV6TENBd2VEbGtPVFZpTTJSbUxGeHVJQ0F3ZURZMU1HRTNNelUwTENBd2VEaGlZV1kyTTJSbExDQXdlRGMyTm1Fd1lXSmlMQ0F3ZUROak56ZGlNbUU0TEZ4dUlDQXdlRGd4WXpKak9USmxMQ0F3ZURRM1pXUmhaV1UyTENBd2VEa3lOekl5WXpnMUxDQXdlREUwT0RJek5UTmlMRnh1SUNBd2VHRXlZbVpsT0dFeExDQXdlRFJqWmpFd016WTBMQ0F3ZUdFNE1XRTJOalJpTENBd2VHSmpOREl6TURBeExGeHVJQ0F3ZUdNeU5HSTRZamN3TENBd2VHUXdaamc1TnpreExDQXdlR00zTm1NMU1XRXpMQ0F3ZURBMk5UUmlaVE13TEZ4dUlDQXdlR1F4T1RKbE9ERTVMQ0F3ZUdRMlpXWTFNakU0TENBd2VHUTJPVGt3TmpJMExDQXdlRFUxTmpWaE9URXdMRnh1SUNBd2VHWTBNR1V6TlRnMUxDQXdlRFUzTnpFeU1ESmhMQ0F3ZURFd05tRmhNRGN3TENBd2VETXlZbUprTVdJNExGeHVJQ0F3ZURFNVlUUmpNVEUyTENBd2VHSTRaREprTUdNNExDQXdlREZsTXpjMll6QTRMQ0F3ZURVeE5ERmhZalV6TEZ4dUlDQXdlREkzTkRnM056UmpMQ0F3ZUdSbU9HVmxZams1TENBd2VETTBZakJpWTJJMUxDQXdlR1V4T1dJME9HRTRMRnh1SUNBd2VETTVNV013WTJJekxDQXdlR00xWXprMVlUWXpMQ0F3ZURSbFpEaGhZVFJoTENBd2VHVXpOREU0WVdOaUxGeHVJQ0F3ZURWaU9XTmpZVFJtTENBd2VEYzNOak5sTXpjekxDQXdlRFk0TW1VMlptWXpMQ0F3ZUdRMllqSmlPR0V6TEZ4dUlDQXdlRGMwT0dZNE1tVmxMQ0F3ZURWa1pXWmlNbVpqTENBd2VEYzRZVFUyTXpabUxDQXdlRFF6TVRjeVpqWXdMRnh1SUNBd2VEZzBZemczT0RFMExDQXdlR0V4WmpCaFlqY3lMQ0F3ZURoall6Y3dNakE0TENBd2VERmhOalF6T1dWakxGeHVJQ0F3ZURrd1ltVm1abVpoTENBd2VESXpOak14WlRJNExDQXdlR0UwTlRBMlkyVmlMQ0F3ZUdSbE9ESmlaR1U1TEZ4dUlDQXdlR0psWmpsaE0yWTNMQ0F3ZUdJeVl6WTNPVEUxTENBd2VHTTJOekUzT0dZeUxDQXdlR1V6TnpJMU16SmlMRnh1SUNBd2VHTmhNamN6WldObExDQXdlR1ZoTWpZMk1UbGpMQ0F3ZUdReE9EWmlPR00zTENBd2VESXhZekJqTWpBM0xGeHVJQ0F3ZUdWaFpHRTNaR1EyTENBd2VHTmtaVEJsWWpGbExDQXdlR1kxTjJRMFpqZG1MQ0F3ZUdWbE5tVmtNVGM0TEZ4dUlDQXdlREEyWmpBMk4yRmhMQ0F3ZURjeU1UYzJabUpoTENBd2VEQmhOak0zWkdNMUxDQXdlR0V5WXpnNU9HRTJMRnh1SUNBd2VERXhNMlk1T0RBMExDQXdlR0psWmprd1pHRmxMQ0F3ZURGaU56RXdZak0xTENBd2VERXpNV00wTnpGaUxGeHVJQ0F3ZURJNFpHSTNOMlkxTENBd2VESXpNRFEzWkRnMExDQXdlRE15WTJGaFlqZGlMQ0F3ZURRd1l6Y3lORGt6TEZ4dUlDQXdlRE5qT1dWaVpUQmhMQ0F3ZURFMVl6bGlaV0pqTENBd2VEUXpNV1EyTjJNMExDQXdlRGxqTVRBd1pEUmpMRnh1SUNBd2VEUmpZelZrTkdKbExDQXdlR05pTTJVME1tSTJMQ0F3ZURVNU4yWXlPVGxqTENBd2VHWmpOalUzWlRKaExGeHVJQ0F3ZURWbVkySTJabUZpTENBd2VETmhaRFptWVdWakxDQXdlRFpqTkRReE9UaGpMQ0F3ZURSaE5EYzFPREUzWEc1ZE8xeHVYRzVtZFc1amRHbHZiaUJqY25sd2RHOWZhR0Z6YUdKc2IyTnJjMTlvYkNob2FDd2dhR3dzSUcwc0lHNHBJSHRjYmlBZ2RtRnlJSGRvSUQwZ2JtVjNJRWx1ZERNeVFYSnlZWGtvTVRZcExDQjNiQ0E5SUc1bGR5QkpiblF6TWtGeWNtRjVLREUyS1N4Y2JpQWdJQ0FnSUdKb01Dd2dZbWd4TENCaWFESXNJR0pvTXl3Z1ltZzBMQ0JpYURVc0lHSm9OaXdnWW1nM0xGeHVJQ0FnSUNBZ1ltd3dMQ0JpYkRFc0lHSnNNaXdnWW13ekxDQmliRFFzSUdKc05Td2dZbXcyTENCaWJEY3NYRzRnSUNBZ0lDQjBhQ3dnZEd3c0lHa3NJR29zSUdnc0lHd3NJR0VzSUdJc0lHTXNJR1E3WEc1Y2JpQWdkbUZ5SUdGb01DQTlJR2hvV3pCZExGeHVJQ0FnSUNBZ1lXZ3hJRDBnYUdoYk1WMHNYRzRnSUNBZ0lDQmhhRElnUFNCb2FGc3lYU3hjYmlBZ0lDQWdJR0ZvTXlBOUlHaG9Xek5kTEZ4dUlDQWdJQ0FnWVdnMElEMGdhR2hiTkYwc1hHNGdJQ0FnSUNCaGFEVWdQU0JvYUZzMVhTeGNiaUFnSUNBZ0lHRm9OaUE5SUdob1d6WmRMRnh1SUNBZ0lDQWdZV2czSUQwZ2FHaGJOMTBzWEc1Y2JpQWdJQ0FnSUdGc01DQTlJR2hzV3pCZExGeHVJQ0FnSUNBZ1lXd3hJRDBnYUd4Yk1WMHNYRzRnSUNBZ0lDQmhiRElnUFNCb2JGc3lYU3hjYmlBZ0lDQWdJR0ZzTXlBOUlHaHNXek5kTEZ4dUlDQWdJQ0FnWVd3MElEMGdhR3hiTkYwc1hHNGdJQ0FnSUNCaGJEVWdQU0JvYkZzMVhTeGNiaUFnSUNBZ0lHRnNOaUE5SUdoc1d6WmRMRnh1SUNBZ0lDQWdZV3czSUQwZ2FHeGJOMTA3WEc1Y2JpQWdkbUZ5SUhCdmN5QTlJREE3WEc0Z0lIZG9hV3hsSUNodUlENDlJREV5T0NrZ2UxeHVJQ0FnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0F4TmpzZ2FTc3JLU0I3WEc0Z0lDQWdJQ0JxSUQwZ09DQXFJR2tnS3lCd2IzTTdYRzRnSUNBZ0lDQjNhRnRwWFNBOUlDaHRXMm9yTUYwZ1BEd2dNalFwSUh3Z0tHMWJhaXN4WFNBOFBDQXhOaWtnZkNBb2JWdHFLekpkSUR3OElEZ3BJSHdnYlZ0cUt6TmRPMXh1SUNBZ0lDQWdkMnhiYVYwZ1BTQW9iVnRxS3pSZElEdzhJREkwS1NCOElDaHRXMm9yTlYwZ1BEd2dNVFlwSUh3Z0tHMWJhaXMyWFNBOFBDQTRLU0I4SUcxYmFpczNYVHRjYmlBZ0lDQjlYRzRnSUNBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SURnd095QnBLeXNwSUh0Y2JpQWdJQ0FnSUdKb01DQTlJR0ZvTUR0Y2JpQWdJQ0FnSUdKb01TQTlJR0ZvTVR0Y2JpQWdJQ0FnSUdKb01pQTlJR0ZvTWp0Y2JpQWdJQ0FnSUdKb015QTlJR0ZvTXp0Y2JpQWdJQ0FnSUdKb05DQTlJR0ZvTkR0Y2JpQWdJQ0FnSUdKb05TQTlJR0ZvTlR0Y2JpQWdJQ0FnSUdKb05pQTlJR0ZvTmp0Y2JpQWdJQ0FnSUdKb055QTlJR0ZvTnp0Y2JseHVJQ0FnSUNBZ1ltd3dJRDBnWVd3d08xeHVJQ0FnSUNBZ1ltd3hJRDBnWVd3eE8xeHVJQ0FnSUNBZ1ltd3lJRDBnWVd3eU8xeHVJQ0FnSUNBZ1ltd3pJRDBnWVd3ek8xeHVJQ0FnSUNBZ1ltdzBJRDBnWVd3ME8xeHVJQ0FnSUNBZ1ltdzFJRDBnWVd3MU8xeHVJQ0FnSUNBZ1ltdzJJRDBnWVd3Mk8xeHVJQ0FnSUNBZ1ltdzNJRDBnWVd3M08xeHVYRzRnSUNBZ0lDQXZMeUJoWkdSY2JpQWdJQ0FnSUdnZ1BTQmhhRGM3WEc0Z0lDQWdJQ0JzSUQwZ1lXdzNPMXh1WEc0Z0lDQWdJQ0JoSUQwZ2JDQW1JREI0Wm1abVpqc2dZaUE5SUd3Z1BqNCtJREUyTzF4dUlDQWdJQ0FnWXlBOUlHZ2dKaUF3ZUdabVptWTdJR1FnUFNCb0lENCtQaUF4Tmp0Y2JseHVJQ0FnSUNBZ0x5OGdVMmxuYldFeFhHNGdJQ0FnSUNCb0lEMGdLQ2hoYURRZ1BqNCtJREUwS1NCOElDaGhiRFFnUER3Z0tETXlMVEUwS1NrcElGNGdLQ2hoYURRZ1BqNCtJREU0S1NCOElDaGhiRFFnUER3Z0tETXlMVEU0S1NrcElGNGdLQ2hoYkRRZ1BqNCtJQ2cwTVMwek1pa3BJSHdnS0dGb05DQThQQ0FvTXpJdEtEUXhMVE15S1NrcEtUdGNiaUFnSUNBZ0lHd2dQU0FvS0dGc05DQStQajRnTVRRcElId2dLR0ZvTkNBOFBDQW9Nekl0TVRRcEtTa2dYaUFvS0dGc05DQStQajRnTVRncElId2dLR0ZvTkNBOFBDQW9Nekl0TVRncEtTa2dYaUFvS0dGb05DQStQajRnS0RReExUTXlLU2tnZkNBb1lXdzBJRHc4SUNnek1pMG9OREV0TXpJcEtTa3BPMXh1WEc0Z0lDQWdJQ0JoSUNzOUlHd2dKaUF3ZUdabVptWTdJR0lnS3owZ2JDQStQajRnTVRZN1hHNGdJQ0FnSUNCaklDczlJR2dnSmlBd2VHWm1abVk3SUdRZ0t6MGdhQ0ErUGo0Z01UWTdYRzVjYmlBZ0lDQWdJQzh2SUVOb1hHNGdJQ0FnSUNCb0lEMGdLR0ZvTkNBbUlHRm9OU2tnWGlBb2ZtRm9OQ0FtSUdGb05pazdYRzRnSUNBZ0lDQnNJRDBnS0dGc05DQW1JR0ZzTlNrZ1hpQW9mbUZzTkNBbUlHRnNOaWs3WEc1Y2JpQWdJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNBZ0lHTWdLejBnYUNBbUlEQjRabVptWmpzZ1pDQXJQU0JvSUQ0K1BpQXhOanRjYmx4dUlDQWdJQ0FnTHk4Z1MxeHVJQ0FnSUNBZ2FDQTlJRXRiYVNveVhUdGNiaUFnSUNBZ0lHd2dQU0JMVzJrcU1pc3hYVHRjYmx4dUlDQWdJQ0FnWVNBclBTQnNJQ1lnTUhobVptWm1PeUJpSUNzOUlHd2dQajQrSURFMk8xeHVJQ0FnSUNBZ1l5QXJQU0JvSUNZZ01IaG1abVptT3lCa0lDczlJR2dnUGo0K0lERTJPMXh1WEc0Z0lDQWdJQ0F2THlCM1hHNGdJQ0FnSUNCb0lEMGdkMmhiYVNVeE5sMDdYRzRnSUNBZ0lDQnNJRDBnZDJ4YmFTVXhObDA3WEc1Y2JpQWdJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNBZ0lHTWdLejBnYUNBbUlEQjRabVptWmpzZ1pDQXJQU0JvSUQ0K1BpQXhOanRjYmx4dUlDQWdJQ0FnWWlBclBTQmhJRDQrUGlBeE5qdGNiaUFnSUNBZ0lHTWdLejBnWWlBK1BqNGdNVFk3WEc0Z0lDQWdJQ0JrSUNzOUlHTWdQajQrSURFMk8xeHVYRzRnSUNBZ0lDQjBhQ0E5SUdNZ0ppQXdlR1ptWm1ZZ2ZDQmtJRHc4SURFMk8xeHVJQ0FnSUNBZ2RHd2dQU0JoSUNZZ01IaG1abVptSUh3Z1lpQThQQ0F4Tmp0Y2JseHVJQ0FnSUNBZ0x5OGdZV1JrWEc0Z0lDQWdJQ0JvSUQwZ2RHZzdYRzRnSUNBZ0lDQnNJRDBnZEd3N1hHNWNiaUFnSUNBZ0lHRWdQU0JzSUNZZ01IaG1abVptT3lCaUlEMGdiQ0ErUGo0Z01UWTdYRzRnSUNBZ0lDQmpJRDBnYUNBbUlEQjRabVptWmpzZ1pDQTlJR2dnUGo0K0lERTJPMXh1WEc0Z0lDQWdJQ0F2THlCVGFXZHRZVEJjYmlBZ0lDQWdJR2dnUFNBb0tHRm9NQ0ErUGo0Z01qZ3BJSHdnS0dGc01DQThQQ0FvTXpJdE1qZ3BLU2tnWGlBb0tHRnNNQ0ErUGo0Z0tETTBMVE15S1NrZ2ZDQW9ZV2d3SUR3OElDZ3pNaTBvTXpRdE16SXBLU2twSUY0Z0tDaGhiREFnUGo0K0lDZ3pPUzB6TWlrcElId2dLR0ZvTUNBOFBDQW9Nekl0S0RNNUxUTXlLU2twS1R0Y2JpQWdJQ0FnSUd3Z1BTQW9LR0ZzTUNBK1BqNGdNamdwSUh3Z0tHRm9NQ0E4UENBb016SXRNamdwS1NrZ1hpQW9LR0ZvTUNBK1BqNGdLRE0wTFRNeUtTa2dmQ0FvWVd3d0lEdzhJQ2d6TWkwb016UXRNeklwS1NrcElGNGdLQ2hoYURBZ1BqNCtJQ2d6T1Mwek1pa3BJSHdnS0dGc01DQThQQ0FvTXpJdEtETTVMVE15S1NrcEtUdGNibHh1SUNBZ0lDQWdZU0FyUFNCc0lDWWdNSGhtWm1abU95QmlJQ3M5SUd3Z1BqNCtJREUyTzF4dUlDQWdJQ0FnWXlBclBTQm9JQ1lnTUhobVptWm1PeUJrSUNzOUlHZ2dQajQrSURFMk8xeHVYRzRnSUNBZ0lDQXZMeUJOWVdwY2JpQWdJQ0FnSUdnZ1BTQW9ZV2d3SUNZZ1lXZ3hLU0JlSUNoaGFEQWdKaUJoYURJcElGNGdLR0ZvTVNBbUlHRm9NaWs3WEc0Z0lDQWdJQ0JzSUQwZ0tHRnNNQ0FtSUdGc01Ta2dYaUFvWVd3d0lDWWdZV3d5S1NCZUlDaGhiREVnSmlCaGJESXBPMXh1WEc0Z0lDQWdJQ0JoSUNzOUlHd2dKaUF3ZUdabVptWTdJR0lnS3owZ2JDQStQajRnTVRZN1hHNGdJQ0FnSUNCaklDczlJR2dnSmlBd2VHWm1abVk3SUdRZ0t6MGdhQ0ErUGo0Z01UWTdYRzVjYmlBZ0lDQWdJR0lnS3owZ1lTQStQajRnTVRZN1hHNGdJQ0FnSUNCaklDczlJR0lnUGo0K0lERTJPMXh1SUNBZ0lDQWdaQ0FyUFNCaklENCtQaUF4Tmp0Y2JseHVJQ0FnSUNBZ1ltZzNJRDBnS0dNZ0ppQXdlR1ptWm1ZcElId2dLR1FnUER3Z01UWXBPMXh1SUNBZ0lDQWdZbXczSUQwZ0tHRWdKaUF3ZUdabVptWXBJSHdnS0dJZ1BEd2dNVFlwTzF4dVhHNGdJQ0FnSUNBdkx5QmhaR1JjYmlBZ0lDQWdJR2dnUFNCaWFETTdYRzRnSUNBZ0lDQnNJRDBnWW13ek8xeHVYRzRnSUNBZ0lDQmhJRDBnYkNBbUlEQjRabVptWmpzZ1lpQTlJR3dnUGo0K0lERTJPMXh1SUNBZ0lDQWdZeUE5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdQU0JvSUQ0K1BpQXhOanRjYmx4dUlDQWdJQ0FnYUNBOUlIUm9PMXh1SUNBZ0lDQWdiQ0E5SUhSc08xeHVYRzRnSUNBZ0lDQmhJQ3M5SUd3Z0ppQXdlR1ptWm1ZN0lHSWdLejBnYkNBK1BqNGdNVFk3WEc0Z0lDQWdJQ0JqSUNzOUlHZ2dKaUF3ZUdabVptWTdJR1FnS3owZ2FDQStQajRnTVRZN1hHNWNiaUFnSUNBZ0lHSWdLejBnWVNBK1BqNGdNVFk3WEc0Z0lDQWdJQ0JqSUNzOUlHSWdQajQrSURFMk8xeHVJQ0FnSUNBZ1pDQXJQU0JqSUQ0K1BpQXhOanRjYmx4dUlDQWdJQ0FnWW1neklEMGdLR01nSmlBd2VHWm1abVlwSUh3Z0tHUWdQRHdnTVRZcE8xeHVJQ0FnSUNBZ1ltd3pJRDBnS0dFZ0ppQXdlR1ptWm1ZcElId2dLR0lnUER3Z01UWXBPMXh1WEc0Z0lDQWdJQ0JoYURFZ1BTQmlhREE3WEc0Z0lDQWdJQ0JoYURJZ1BTQmlhREU3WEc0Z0lDQWdJQ0JoYURNZ1BTQmlhREk3WEc0Z0lDQWdJQ0JoYURRZ1BTQmlhRE03WEc0Z0lDQWdJQ0JoYURVZ1BTQmlhRFE3WEc0Z0lDQWdJQ0JoYURZZ1BTQmlhRFU3WEc0Z0lDQWdJQ0JoYURjZ1BTQmlhRFk3WEc0Z0lDQWdJQ0JoYURBZ1BTQmlhRGM3WEc1Y2JpQWdJQ0FnSUdGc01TQTlJR0pzTUR0Y2JpQWdJQ0FnSUdGc01pQTlJR0pzTVR0Y2JpQWdJQ0FnSUdGc015QTlJR0pzTWp0Y2JpQWdJQ0FnSUdGc05DQTlJR0pzTXp0Y2JpQWdJQ0FnSUdGc05TQTlJR0pzTkR0Y2JpQWdJQ0FnSUdGc05pQTlJR0pzTlR0Y2JpQWdJQ0FnSUdGc055QTlJR0pzTmp0Y2JpQWdJQ0FnSUdGc01DQTlJR0pzTnp0Y2JseHVJQ0FnSUNBZ2FXWWdLR2tsTVRZZ1BUMDlJREUxS1NCN1hHNGdJQ0FnSUNBZ0lHWnZjaUFvYWlBOUlEQTdJR29nUENBeE5qc2dhaXNyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdMeThnWVdSa1hHNGdJQ0FnSUNBZ0lDQWdhQ0E5SUhkb1cycGRPMXh1SUNBZ0lDQWdJQ0FnSUd3Z1BTQjNiRnRxWFR0Y2JseHVJQ0FnSUNBZ0lDQWdJR0VnUFNCc0lDWWdNSGhtWm1abU95QmlJRDBnYkNBK1BqNGdNVFk3WEc0Z0lDQWdJQ0FnSUNBZ1l5QTlJR2dnSmlBd2VHWm1abVk3SUdRZ1BTQm9JRDQrUGlBeE5qdGNibHh1SUNBZ0lDQWdJQ0FnSUdnZ1BTQjNhRnNvYWlzNUtTVXhObDA3WEc0Z0lDQWdJQ0FnSUNBZ2JDQTlJSGRzV3locUt6a3BKVEUyWFR0Y2JseHVJQ0FnSUNBZ0lDQWdJR0VnS3owZ2JDQW1JREI0Wm1abVpqc2dZaUFyUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0FnSUNBZ0lDQmpJQ3M5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdLejBnYUNBK1BqNGdNVFk3WEc1Y2JpQWdJQ0FnSUNBZ0lDQXZMeUJ6YVdkdFlUQmNiaUFnSUNBZ0lDQWdJQ0IwYUNBOUlIZG9XeWhxS3pFcEpURTJYVHRjYmlBZ0lDQWdJQ0FnSUNCMGJDQTlJSGRzV3locUt6RXBKVEUyWFR0Y2JpQWdJQ0FnSUNBZ0lDQm9JRDBnS0NoMGFDQStQajRnTVNrZ2ZDQW9kR3dnUER3Z0tETXlMVEVwS1NrZ1hpQW9LSFJvSUQ0K1BpQTRLU0I4SUNoMGJDQThQQ0FvTXpJdE9Da3BLU0JlSUNoMGFDQStQajRnTnlrN1hHNGdJQ0FnSUNBZ0lDQWdiQ0E5SUNnb2RHd2dQajQrSURFcElId2dLSFJvSUR3OElDZ3pNaTB4S1NrcElGNGdLQ2gwYkNBK1BqNGdPQ2tnZkNBb2RHZ2dQRHdnS0RNeUxUZ3BLU2tnWGlBb0tIUnNJRDQrUGlBM0tTQjhJQ2gwYUNBOFBDQW9Nekl0TnlrcEtUdGNibHh1SUNBZ0lDQWdJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNBZ0lDQWdJQ0JqSUNzOUlHZ2dKaUF3ZUdabVptWTdJR1FnS3owZ2FDQStQajRnTVRZN1hHNWNiaUFnSUNBZ0lDQWdJQ0F2THlCemFXZHRZVEZjYmlBZ0lDQWdJQ0FnSUNCMGFDQTlJSGRvV3locUt6RTBLU1V4TmwwN1hHNGdJQ0FnSUNBZ0lDQWdkR3dnUFNCM2JGc29haXN4TkNrbE1UWmRPMXh1SUNBZ0lDQWdJQ0FnSUdnZ1BTQW9LSFJvSUQ0K1BpQXhPU2tnZkNBb2RHd2dQRHdnS0RNeUxURTVLU2twSUY0Z0tDaDBiQ0ErUGo0Z0tEWXhMVE15S1NrZ2ZDQW9kR2dnUER3Z0tETXlMU2cyTVMwek1pa3BLU2tnWGlBb2RHZ2dQajQrSURZcE8xeHVJQ0FnSUNBZ0lDQWdJR3dnUFNBb0tIUnNJRDQrUGlBeE9Ta2dmQ0FvZEdnZ1BEd2dLRE15TFRFNUtTa3BJRjRnS0NoMGFDQStQajRnS0RZeExUTXlLU2tnZkNBb2RHd2dQRHdnS0RNeUxTZzJNUzB6TWlrcEtTa2dYaUFvS0hSc0lENCtQaUEyS1NCOElDaDBhQ0E4UENBb016SXROaWtwS1R0Y2JseHVJQ0FnSUNBZ0lDQWdJR0VnS3owZ2JDQW1JREI0Wm1abVpqc2dZaUFyUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0FnSUNBZ0lDQmpJQ3M5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdLejBnYUNBK1BqNGdNVFk3WEc1Y2JpQWdJQ0FnSUNBZ0lDQmlJQ3M5SUdFZ1BqNCtJREUyTzF4dUlDQWdJQ0FnSUNBZ0lHTWdLejBnWWlBK1BqNGdNVFk3WEc0Z0lDQWdJQ0FnSUNBZ1pDQXJQU0JqSUQ0K1BpQXhOanRjYmx4dUlDQWdJQ0FnSUNBZ0lIZG9XMnBkSUQwZ0tHTWdKaUF3ZUdabVptWXBJSHdnS0dRZ1BEd2dNVFlwTzF4dUlDQWdJQ0FnSUNBZ0lIZHNXMnBkSUQwZ0tHRWdKaUF3ZUdabVptWXBJSHdnS0dJZ1BEd2dNVFlwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNGdJQ0FnTHk4Z1lXUmtYRzRnSUNBZ2FDQTlJR0ZvTUR0Y2JpQWdJQ0JzSUQwZ1lXd3dPMXh1WEc0Z0lDQWdZU0E5SUd3Z0ppQXdlR1ptWm1ZN0lHSWdQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJRDBnYUNBbUlEQjRabVptWmpzZ1pDQTlJR2dnUGo0K0lERTJPMXh1WEc0Z0lDQWdhQ0E5SUdob1d6QmRPMXh1SUNBZ0lHd2dQU0JvYkZzd1hUdGNibHh1SUNBZ0lHRWdLejBnYkNBbUlEQjRabVptWmpzZ1lpQXJQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJQ3M5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdLejBnYUNBK1BqNGdNVFk3WEc1Y2JpQWdJQ0JpSUNzOUlHRWdQajQrSURFMk8xeHVJQ0FnSUdNZ0t6MGdZaUErUGo0Z01UWTdYRzRnSUNBZ1pDQXJQU0JqSUQ0K1BpQXhOanRjYmx4dUlDQWdJR2hvV3pCZElEMGdZV2d3SUQwZ0tHTWdKaUF3ZUdabVptWXBJSHdnS0dRZ1BEd2dNVFlwTzF4dUlDQWdJR2hzV3pCZElEMGdZV3d3SUQwZ0tHRWdKaUF3ZUdabVptWXBJSHdnS0dJZ1BEd2dNVFlwTzF4dVhHNGdJQ0FnYUNBOUlHRm9NVHRjYmlBZ0lDQnNJRDBnWVd3eE8xeHVYRzRnSUNBZ1lTQTlJR3dnSmlBd2VHWm1abVk3SUdJZ1BTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklEMGdhQ0FtSURCNFptWm1aanNnWkNBOUlHZ2dQajQrSURFMk8xeHVYRzRnSUNBZ2FDQTlJR2hvV3pGZE8xeHVJQ0FnSUd3Z1BTQm9iRnN4WFR0Y2JseHVJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklDczlJR2dnSmlBd2VHWm1abVk3SUdRZ0t6MGdhQ0ErUGo0Z01UWTdYRzVjYmlBZ0lDQmlJQ3M5SUdFZ1BqNCtJREUyTzF4dUlDQWdJR01nS3owZ1lpQStQajRnTVRZN1hHNGdJQ0FnWkNBclBTQmpJRDQrUGlBeE5qdGNibHh1SUNBZ0lHaG9XekZkSUQwZ1lXZ3hJRDBnS0dNZ0ppQXdlR1ptWm1ZcElId2dLR1FnUER3Z01UWXBPMXh1SUNBZ0lHaHNXekZkSUQwZ1lXd3hJRDBnS0dFZ0ppQXdlR1ptWm1ZcElId2dLR0lnUER3Z01UWXBPMXh1WEc0Z0lDQWdhQ0E5SUdGb01qdGNiaUFnSUNCc0lEMGdZV3d5TzF4dVhHNGdJQ0FnWVNBOUlHd2dKaUF3ZUdabVptWTdJR0lnUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0JqSUQwZ2FDQW1JREI0Wm1abVpqc2daQ0E5SUdnZ1BqNCtJREUyTzF4dVhHNGdJQ0FnYUNBOUlHaG9XekpkTzF4dUlDQWdJR3dnUFNCb2JGc3lYVHRjYmx4dUlDQWdJR0VnS3owZ2JDQW1JREI0Wm1abVpqc2dZaUFyUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0JqSUNzOUlHZ2dKaUF3ZUdabVptWTdJR1FnS3owZ2FDQStQajRnTVRZN1hHNWNiaUFnSUNCaUlDczlJR0VnUGo0K0lERTJPMXh1SUNBZ0lHTWdLejBnWWlBK1BqNGdNVFk3WEc0Z0lDQWdaQ0FyUFNCaklENCtQaUF4Tmp0Y2JseHVJQ0FnSUdob1d6SmRJRDBnWVdneUlEMGdLR01nSmlBd2VHWm1abVlwSUh3Z0tHUWdQRHdnTVRZcE8xeHVJQ0FnSUdoc1d6SmRJRDBnWVd3eUlEMGdLR0VnSmlBd2VHWm1abVlwSUh3Z0tHSWdQRHdnTVRZcE8xeHVYRzRnSUNBZ2FDQTlJR0ZvTXp0Y2JpQWdJQ0JzSUQwZ1lXd3pPMXh1WEc0Z0lDQWdZU0E5SUd3Z0ppQXdlR1ptWm1ZN0lHSWdQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJRDBnYUNBbUlEQjRabVptWmpzZ1pDQTlJR2dnUGo0K0lERTJPMXh1WEc0Z0lDQWdhQ0E5SUdob1d6TmRPMXh1SUNBZ0lHd2dQU0JvYkZzelhUdGNibHh1SUNBZ0lHRWdLejBnYkNBbUlEQjRabVptWmpzZ1lpQXJQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJQ3M5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdLejBnYUNBK1BqNGdNVFk3WEc1Y2JpQWdJQ0JpSUNzOUlHRWdQajQrSURFMk8xeHVJQ0FnSUdNZ0t6MGdZaUErUGo0Z01UWTdYRzRnSUNBZ1pDQXJQU0JqSUQ0K1BpQXhOanRjYmx4dUlDQWdJR2hvV3pOZElEMGdZV2d6SUQwZ0tHTWdKaUF3ZUdabVptWXBJSHdnS0dRZ1BEd2dNVFlwTzF4dUlDQWdJR2hzV3pOZElEMGdZV3d6SUQwZ0tHRWdKaUF3ZUdabVptWXBJSHdnS0dJZ1BEd2dNVFlwTzF4dVhHNGdJQ0FnYUNBOUlHRm9ORHRjYmlBZ0lDQnNJRDBnWVd3ME8xeHVYRzRnSUNBZ1lTQTlJR3dnSmlBd2VHWm1abVk3SUdJZ1BTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklEMGdhQ0FtSURCNFptWm1aanNnWkNBOUlHZ2dQajQrSURFMk8xeHVYRzRnSUNBZ2FDQTlJR2hvV3pSZE8xeHVJQ0FnSUd3Z1BTQm9iRnMwWFR0Y2JseHVJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklDczlJR2dnSmlBd2VHWm1abVk3SUdRZ0t6MGdhQ0ErUGo0Z01UWTdYRzVjYmlBZ0lDQmlJQ3M5SUdFZ1BqNCtJREUyTzF4dUlDQWdJR01nS3owZ1lpQStQajRnTVRZN1hHNGdJQ0FnWkNBclBTQmpJRDQrUGlBeE5qdGNibHh1SUNBZ0lHaG9XelJkSUQwZ1lXZzBJRDBnS0dNZ0ppQXdlR1ptWm1ZcElId2dLR1FnUER3Z01UWXBPMXh1SUNBZ0lHaHNXelJkSUQwZ1lXdzBJRDBnS0dFZ0ppQXdlR1ptWm1ZcElId2dLR0lnUER3Z01UWXBPMXh1WEc0Z0lDQWdhQ0E5SUdGb05UdGNiaUFnSUNCc0lEMGdZV3cxTzF4dVhHNGdJQ0FnWVNBOUlHd2dKaUF3ZUdabVptWTdJR0lnUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0JqSUQwZ2FDQW1JREI0Wm1abVpqc2daQ0E5SUdnZ1BqNCtJREUyTzF4dVhHNGdJQ0FnYUNBOUlHaG9XelZkTzF4dUlDQWdJR3dnUFNCb2JGczFYVHRjYmx4dUlDQWdJR0VnS3owZ2JDQW1JREI0Wm1abVpqc2dZaUFyUFNCc0lENCtQaUF4Tmp0Y2JpQWdJQ0JqSUNzOUlHZ2dKaUF3ZUdabVptWTdJR1FnS3owZ2FDQStQajRnTVRZN1hHNWNiaUFnSUNCaUlDczlJR0VnUGo0K0lERTJPMXh1SUNBZ0lHTWdLejBnWWlBK1BqNGdNVFk3WEc0Z0lDQWdaQ0FyUFNCaklENCtQaUF4Tmp0Y2JseHVJQ0FnSUdob1d6VmRJRDBnWVdnMUlEMGdLR01nSmlBd2VHWm1abVlwSUh3Z0tHUWdQRHdnTVRZcE8xeHVJQ0FnSUdoc1d6VmRJRDBnWVd3MUlEMGdLR0VnSmlBd2VHWm1abVlwSUh3Z0tHSWdQRHdnTVRZcE8xeHVYRzRnSUNBZ2FDQTlJR0ZvTmp0Y2JpQWdJQ0JzSUQwZ1lXdzJPMXh1WEc0Z0lDQWdZU0E5SUd3Z0ppQXdlR1ptWm1ZN0lHSWdQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJRDBnYUNBbUlEQjRabVptWmpzZ1pDQTlJR2dnUGo0K0lERTJPMXh1WEc0Z0lDQWdhQ0E5SUdob1d6WmRPMXh1SUNBZ0lHd2dQU0JvYkZzMlhUdGNibHh1SUNBZ0lHRWdLejBnYkNBbUlEQjRabVptWmpzZ1lpQXJQU0JzSUQ0K1BpQXhOanRjYmlBZ0lDQmpJQ3M5SUdnZ0ppQXdlR1ptWm1ZN0lHUWdLejBnYUNBK1BqNGdNVFk3WEc1Y2JpQWdJQ0JpSUNzOUlHRWdQajQrSURFMk8xeHVJQ0FnSUdNZ0t6MGdZaUErUGo0Z01UWTdYRzRnSUNBZ1pDQXJQU0JqSUQ0K1BpQXhOanRjYmx4dUlDQWdJR2hvV3paZElEMGdZV2cySUQwZ0tHTWdKaUF3ZUdabVptWXBJSHdnS0dRZ1BEd2dNVFlwTzF4dUlDQWdJR2hzV3paZElEMGdZV3cySUQwZ0tHRWdKaUF3ZUdabVptWXBJSHdnS0dJZ1BEd2dNVFlwTzF4dVhHNGdJQ0FnYUNBOUlHRm9OenRjYmlBZ0lDQnNJRDBnWVd3M08xeHVYRzRnSUNBZ1lTQTlJR3dnSmlBd2VHWm1abVk3SUdJZ1BTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklEMGdhQ0FtSURCNFptWm1aanNnWkNBOUlHZ2dQajQrSURFMk8xeHVYRzRnSUNBZ2FDQTlJR2hvV3pkZE8xeHVJQ0FnSUd3Z1BTQm9iRnMzWFR0Y2JseHVJQ0FnSUdFZ0t6MGdiQ0FtSURCNFptWm1aanNnWWlBclBTQnNJRDQrUGlBeE5qdGNiaUFnSUNCaklDczlJR2dnSmlBd2VHWm1abVk3SUdRZ0t6MGdhQ0ErUGo0Z01UWTdYRzVjYmlBZ0lDQmlJQ3M5SUdFZ1BqNCtJREUyTzF4dUlDQWdJR01nS3owZ1lpQStQajRnTVRZN1hHNGdJQ0FnWkNBclBTQmpJRDQrUGlBeE5qdGNibHh1SUNBZ0lHaG9XemRkSUQwZ1lXZzNJRDBnS0dNZ0ppQXdlR1ptWm1ZcElId2dLR1FnUER3Z01UWXBPMXh1SUNBZ0lHaHNXemRkSUQwZ1lXdzNJRDBnS0dFZ0ppQXdlR1ptWm1ZcElId2dLR0lnUER3Z01UWXBPMXh1WEc0Z0lDQWdjRzl6SUNzOUlERXlPRHRjYmlBZ0lDQnVJQzA5SURFeU9EdGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnVPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpjbmx3ZEc5ZmFHRnphQ2h2ZFhRc0lHMHNJRzRwSUh0Y2JpQWdkbUZ5SUdob0lEMGdibVYzSUVsdWRETXlRWEp5WVhrb09Da3NYRzRnSUNBZ0lDQm9iQ0E5SUc1bGR5QkpiblF6TWtGeWNtRjVLRGdwTEZ4dUlDQWdJQ0FnZUNBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0RJMU5pa3NYRzRnSUNBZ0lDQnBMQ0JpSUQwZ2JqdGNibHh1SUNCb2FGc3dYU0E5SURCNE5tRXdPV1UyTmpjN1hHNGdJR2hvV3pGZElEMGdNSGhpWWpZM1lXVTROVHRjYmlBZ2FHaGJNbDBnUFNBd2VETmpObVZtTXpjeU8xeHVJQ0JvYUZzelhTQTlJREI0WVRVMFptWTFNMkU3WEc0Z0lHaG9XelJkSUQwZ01IZzFNVEJsTlRJM1pqdGNiaUFnYUdoYk5WMGdQU0F3ZURsaU1EVTJPRGhqTzF4dUlDQm9hRnMyWFNBOUlEQjRNV1k0TTJRNVlXSTdYRzRnSUdob1d6ZGRJRDBnTUhnMVltVXdZMlF4T1R0Y2JseHVJQ0JvYkZzd1hTQTlJREI0WmpOaVkyTTVNRGc3WEc0Z0lHaHNXekZkSUQwZ01IZzROR05oWVRjellqdGNiaUFnYUd4Yk1sMGdQU0F3ZUdabE9UUm1PREppTzF4dUlDQm9iRnN6WFNBOUlEQjROV1l4WkRNMlpqRTdYRzRnSUdoc1d6UmRJRDBnTUhoaFpHVTJPREprTVR0Y2JpQWdhR3hiTlYwZ1BTQXdlREppTTJVMll6Rm1PMXh1SUNCb2JGczJYU0E5SURCNFptSTBNV0prTm1JN1hHNGdJR2hzV3pkZElEMGdNSGd4TXpkbE1qRTNPVHRjYmx4dUlDQmpjbmx3ZEc5ZmFHRnphR0pzYjJOcmMxOW9iQ2hvYUN3Z2FHd3NJRzBzSUc0cE8xeHVJQ0J1SUNVOUlERXlPRHRjYmx4dUlDQm1iM0lnS0drZ1BTQXdPeUJwSUR3Z2Jqc2dhU3NyS1NCNFcybGRJRDBnYlZ0aUxXNHJhVjA3WEc0Z0lIaGJibDBnUFNBeE1qZzdYRzVjYmlBZ2JpQTlJREkxTmkweE1qZ3FLRzQ4TVRFeVB6RTZNQ2s3WEc0Z0lIaGJiaTA1WFNBOUlEQTdYRzRnSUhSek5qUW9lQ3dnYmkwNExDQWdLR0lnTHlBd2VESXdNREF3TURBd0tTQjhJREFzSUdJZ1BEd2dNeWs3WEc0Z0lHTnllWEIwYjE5b1lYTm9ZbXh2WTJ0elgyaHNLR2hvTENCb2JDd2dlQ3dnYmlrN1hHNWNiaUFnWm05eUlDaHBJRDBnTURzZ2FTQThJRGc3SUdrckt5a2dkSE0yTkNodmRYUXNJRGdxYVN3Z2FHaGJhVjBzSUdoc1cybGRLVHRjYmx4dUlDQnlaWFIxY200Z01EdGNibjFjYmx4dVpuVnVZM1JwYjI0Z1lXUmtLSEFzSUhFcElIdGNiaUFnZG1GeUlHRWdQU0JuWmlncExDQmlJRDBnWjJZb0tTd2dZeUE5SUdkbUtDa3NYRzRnSUNBZ0lDQmtJRDBnWjJZb0tTd2daU0E5SUdkbUtDa3NJR1lnUFNCblppZ3BMRnh1SUNBZ0lDQWdaeUE5SUdkbUtDa3NJR2dnUFNCblppZ3BMQ0IwSUQwZ1oyWW9LVHRjYmx4dUlDQmFLR0VzSUhCYk1WMHNJSEJiTUYwcE8xeHVJQ0JhS0hRc0lIRmJNVjBzSUhGYk1GMHBPMXh1SUNCTktHRXNJR0VzSUhRcE8xeHVJQ0JCS0dJc0lIQmJNRjBzSUhCYk1WMHBPMXh1SUNCQktIUXNJSEZiTUYwc0lIRmJNVjBwTzF4dUlDQk5LR0lzSUdJc0lIUXBPMXh1SUNCTktHTXNJSEJiTTEwc0lIRmJNMTBwTzF4dUlDQk5LR01zSUdNc0lFUXlLVHRjYmlBZ1RTaGtMQ0J3V3pKZExDQnhXekpkS1R0Y2JpQWdRU2hrTENCa0xDQmtLVHRjYmlBZ1dpaGxMQ0JpTENCaEtUdGNiaUFnV2lobUxDQmtMQ0JqS1R0Y2JpQWdRU2huTENCa0xDQmpLVHRjYmlBZ1FTaG9MQ0JpTENCaEtUdGNibHh1SUNCTktIQmJNRjBzSUdVc0lHWXBPMXh1SUNCTktIQmJNVjBzSUdnc0lHY3BPMXh1SUNCTktIQmJNbDBzSUdjc0lHWXBPMXh1SUNCTktIQmJNMTBzSUdVc0lHZ3BPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmpjM2RoY0Nod0xDQnhMQ0JpS1NCN1hHNGdJSFpoY2lCcE8xeHVJQ0JtYjNJZ0tHa2dQU0F3T3lCcElEd2dORHNnYVNzcktTQjdYRzRnSUNBZ2MyVnNNalUxTVRrb2NGdHBYU3dnY1Z0cFhTd2dZaWs3WEc0Z0lIMWNibjFjYmx4dVpuVnVZM1JwYjI0Z2NHRmpheWh5TENCd0tTQjdYRzRnSUhaaGNpQjBlQ0E5SUdkbUtDa3NJSFI1SUQwZ1oyWW9LU3dnZW1rZ1BTQm5aaWdwTzF4dUlDQnBibll5TlRVeE9TaDZhU3dnY0ZzeVhTazdYRzRnSUUwb2RIZ3NJSEJiTUYwc0lIcHBLVHRjYmlBZ1RTaDBlU3dnY0ZzeFhTd2dlbWtwTzF4dUlDQndZV05yTWpVMU1Ua29jaXdnZEhrcE8xeHVJQ0J5V3pNeFhTQmVQU0J3WVhJeU5UVXhPU2gwZUNrZ1BEd2dOenRjYm4xY2JseHVablZ1WTNScGIyNGdjMk5oYkdGeWJYVnNkQ2h3TENCeExDQnpLU0I3WEc0Z0lIWmhjaUJpTENCcE8xeHVJQ0J6WlhReU5UVXhPU2h3V3pCZExDQm5aakFwTzF4dUlDQnpaWFF5TlRVeE9TaHdXekZkTENCblpqRXBPMXh1SUNCelpYUXlOVFV4T1Nod1d6SmRMQ0JuWmpFcE8xeHVJQ0J6WlhReU5UVXhPU2h3V3pOZExDQm5aakFwTzF4dUlDQm1iM0lnS0drZ1BTQXlOVFU3SUdrZ1BqMGdNRHNnTFMxcEtTQjdYRzRnSUNBZ1lpQTlJQ2h6V3locEx6Z3BmREJkSUQ0K0lDaHBKamNwS1NBbUlERTdYRzRnSUNBZ1kzTjNZWEFvY0N3Z2NTd2dZaWs3WEc0Z0lDQWdZV1JrS0hFc0lIQXBPMXh1SUNBZ0lHRmtaQ2h3TENCd0tUdGNiaUFnSUNCamMzZGhjQ2h3TENCeExDQmlLVHRjYmlBZ2ZWeHVmVnh1WEc1bWRXNWpkR2x2YmlCelkyRnNZWEppWVhObEtIQXNJSE1wSUh0Y2JpQWdkbUZ5SUhFZ1BTQmJaMllvS1N3Z1oyWW9LU3dnWjJZb0tTd2daMllvS1YwN1hHNGdJSE5sZERJMU5URTVLSEZiTUYwc0lGZ3BPMXh1SUNCelpYUXlOVFV4T1NoeFd6RmRMQ0JaS1R0Y2JpQWdjMlYwTWpVMU1Ua29jVnN5WFN3Z1oyWXhLVHRjYmlBZ1RTaHhXek5kTENCWUxDQlpLVHRjYmlBZ2MyTmhiR0Z5YlhWc2RDaHdMQ0J4TENCektUdGNibjFjYmx4dVpuVnVZM1JwYjI0Z1kzSjVjSFJ2WDNOcFoyNWZhMlY1Y0dGcGNpaHdheXdnYzJzc0lITmxaV1JsWkNrZ2UxeHVJQ0IyWVhJZ1pDQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtEWTBLVHRjYmlBZ2RtRnlJSEFnUFNCYloyWW9LU3dnWjJZb0tTd2daMllvS1N3Z1oyWW9LVjA3WEc0Z0lIWmhjaUJwTzF4dVhHNGdJR2xtSUNnaGMyVmxaR1ZrS1NCeVlXNWtiMjFpZVhSbGN5aHpheXdnTXpJcE8xeHVJQ0JqY25sd2RHOWZhR0Z6YUNoa0xDQnpheXdnTXpJcE8xeHVJQ0JrV3pCZElDWTlJREkwT0R0Y2JpQWdaRnN6TVYwZ0pqMGdNVEkzTzF4dUlDQmtXek14WFNCOFBTQTJORHRjYmx4dUlDQnpZMkZzWVhKaVlYTmxLSEFzSUdRcE8xeHVJQ0J3WVdOcktIQnJMQ0J3S1R0Y2JseHVJQ0JtYjNJZ0tHa2dQU0F3T3lCcElEd2dNekk3SUdrckt5a2djMnRiYVNzek1sMGdQU0J3YTF0cFhUdGNiaUFnY21WMGRYSnVJREE3WEc1OVhHNWNiblpoY2lCTUlEMGdibVYzSUVac2IyRjBOalJCY25KaGVTaGJNSGhsWkN3Z01IaGtNeXdnTUhobU5Td2dNSGcxWXl3Z01IZ3hZU3dnTUhnMk15d2dNSGd4TWl3Z01IZzFPQ3dnTUhoa05pd2dNSGc1WXl3Z01IaG1OeXdnTUhoaE1pd2dNSGhrWlN3Z01IaG1PU3dnTUhoa1pTd2dNSGd4TkN3Z01Dd2dNQ3dnTUN3Z01Dd2dNQ3dnTUN3Z01Dd2dNQ3dnTUN3Z01Dd2dNQ3dnTUN3Z01Dd2dNQ3dnTUN3Z01IZ3hNRjBwTzF4dVhHNW1kVzVqZEdsdmJpQnRiMlJNS0hJc0lIZ3BJSHRjYmlBZ2RtRnlJR05oY25KNUxDQnBMQ0JxTENCck8xeHVJQ0JtYjNJZ0tHa2dQU0EyTXpzZ2FTQStQU0F6TWpzZ0xTMXBLU0I3WEc0Z0lDQWdZMkZ5Y25rZ1BTQXdPMXh1SUNBZ0lHWnZjaUFvYWlBOUlHa2dMU0F6TWl3Z2F5QTlJR2tnTFNBeE1qc2dhaUE4SUdzN0lDc3JhaWtnZTF4dUlDQWdJQ0FnZUZ0cVhTQXJQU0JqWVhKeWVTQXRJREUySUNvZ2VGdHBYU0FxSUV4YmFpQXRJQ2hwSUMwZ016SXBYVHRjYmlBZ0lDQWdJR05oY25KNUlEMGdUV0YwYUM1bWJHOXZjaWdvZUZ0cVhTQXJJREV5T0NrZ0x5QXlOVFlwTzF4dUlDQWdJQ0FnZUZ0cVhTQXRQU0JqWVhKeWVTQXFJREkxTmp0Y2JpQWdJQ0I5WEc0Z0lDQWdlRnRxWFNBclBTQmpZWEp5ZVR0Y2JpQWdJQ0I0VzJsZElEMGdNRHRjYmlBZ2ZWeHVJQ0JqWVhKeWVTQTlJREE3WEc0Z0lHWnZjaUFvYWlBOUlEQTdJR29nUENBek1qc2dhaXNyS1NCN1hHNGdJQ0FnZUZ0cVhTQXJQU0JqWVhKeWVTQXRJQ2g0V3pNeFhTQStQaUEwS1NBcUlFeGJhbDA3WEc0Z0lDQWdZMkZ5Y25rZ1BTQjRXMnBkSUQ0K0lEZzdYRzRnSUNBZ2VGdHFYU0FtUFNBeU5UVTdYRzRnSUgxY2JpQWdabTl5SUNocUlEMGdNRHNnYWlBOElETXlPeUJxS3lzcElIaGJhbDBnTFQwZ1kyRnljbmtnS2lCTVcycGRPMXh1SUNCbWIzSWdLR2tnUFNBd095QnBJRHdnTXpJN0lHa3JLeWtnZTF4dUlDQWdJSGhiYVNzeFhTQXJQU0I0VzJsZElENCtJRGc3WEc0Z0lDQWdjbHRwWFNBOUlIaGJhVjBnSmlBeU5UVTdYRzRnSUgxY2JuMWNibHh1Wm5WdVkzUnBiMjRnY21Wa2RXTmxLSElwSUh0Y2JpQWdkbUZ5SUhnZ1BTQnVaWGNnUm14dllYUTJORUZ5Y21GNUtEWTBLU3dnYVR0Y2JpQWdabTl5SUNocElEMGdNRHNnYVNBOElEWTBPeUJwS3lzcElIaGJhVjBnUFNCeVcybGRPMXh1SUNCbWIzSWdLR2tnUFNBd095QnBJRHdnTmpRN0lHa3JLeWtnY2x0cFhTQTlJREE3WEc0Z0lHMXZaRXdvY2l3Z2VDazdYRzU5WEc1Y2JpOHZJRTV2ZEdVNklHUnBabVpsY21WdVkyVWdabkp2YlNCRElDMGdjMjFzWlc0Z2NtVjBkWEp1WldRc0lHNXZkQ0J3WVhOelpXUWdZWE1nWVhKbmRXMWxiblF1WEc1bWRXNWpkR2x2YmlCamNubHdkRzlmYzJsbmJpaHpiU3dnYlN3Z2Jpd2djMnNwSUh0Y2JpQWdkbUZ5SUdRZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNnMk5Da3NJR2dnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2cyTkNrc0lISWdQU0J1WlhjZ1ZXbHVkRGhCY25KaGVTZzJOQ2s3WEc0Z0lIWmhjaUJwTENCcUxDQjRJRDBnYm1WM0lFWnNiMkYwTmpSQmNuSmhlU2cyTkNrN1hHNGdJSFpoY2lCd0lEMGdXMmRtS0Nrc0lHZG1LQ2tzSUdkbUtDa3NJR2RtS0NsZE8xeHVYRzRnSUdOeWVYQjBiMTlvWVhOb0tHUXNJSE5yTENBek1pazdYRzRnSUdSYk1GMGdKajBnTWpRNE8xeHVJQ0JrV3pNeFhTQW1QU0F4TWpjN1hHNGdJR1JiTXpGZElIdzlJRFkwTzF4dVhHNGdJSFpoY2lCemJXeGxiaUE5SUc0Z0t5QTJORHRjYmlBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SUc0N0lHa3JLeWtnYzIxYk5qUWdLeUJwWFNBOUlHMWJhVjA3WEc0Z0lHWnZjaUFvYVNBOUlEQTdJR2tnUENBek1qc2dhU3NyS1NCemJWc3pNaUFySUdsZElEMGdaRnN6TWlBcklHbGRPMXh1WEc0Z0lHTnllWEIwYjE5b1lYTm9LSElzSUhOdExuTjFZbUZ5Y21GNUtETXlLU3dnYmlzek1pazdYRzRnSUhKbFpIVmpaU2h5S1R0Y2JpQWdjMk5oYkdGeVltRnpaU2h3TENCeUtUdGNiaUFnY0dGamF5aHpiU3dnY0NrN1hHNWNiaUFnWm05eUlDaHBJRDBnTXpJN0lHa2dQQ0EyTkRzZ2FTc3JLU0J6YlZ0cFhTQTlJSE5yVzJsZE8xeHVJQ0JqY25sd2RHOWZhR0Z6YUNob0xDQnpiU3dnYmlBcklEWTBLVHRjYmlBZ2NtVmtkV05sS0dncE8xeHVYRzRnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0EyTkRzZ2FTc3JLU0I0VzJsZElEMGdNRHRjYmlBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SURNeU95QnBLeXNwSUhoYmFWMGdQU0J5VzJsZE8xeHVJQ0JtYjNJZ0tHa2dQU0F3T3lCcElEd2dNekk3SUdrckt5a2dlMXh1SUNBZ0lHWnZjaUFvYWlBOUlEQTdJR29nUENBek1qc2dhaXNyS1NCN1hHNGdJQ0FnSUNCNFcya3JhbDBnS3owZ2FGdHBYU0FxSUdSYmFsMDdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdiVzlrVENoemJTNXpkV0poY25KaGVTZ3pNaWtzSUhncE8xeHVJQ0J5WlhSMWNtNGdjMjFzWlc0N1hHNTlYRzVjYm1aMWJtTjBhVzl1SUhWdWNHRmphMjVsWnloeUxDQndLU0I3WEc0Z0lIWmhjaUIwSUQwZ1oyWW9LU3dnWTJocklEMGdaMllvS1N3Z2JuVnRJRDBnWjJZb0tTeGNiaUFnSUNBZ0lHUmxiaUE5SUdkbUtDa3NJR1JsYmpJZ1BTQm5aaWdwTENCa1pXNDBJRDBnWjJZb0tTeGNiaUFnSUNBZ0lHUmxiallnUFNCblppZ3BPMXh1WEc0Z0lITmxkREkxTlRFNUtISmJNbDBzSUdkbU1TazdYRzRnSUhWdWNHRmphekkxTlRFNUtISmJNVjBzSUhBcE8xeHVJQ0JUS0c1MWJTd2djbHN4WFNrN1hHNGdJRTBvWkdWdUxDQnVkVzBzSUVRcE8xeHVJQ0JhS0c1MWJTd2diblZ0TENCeVd6SmRLVHRjYmlBZ1FTaGtaVzRzSUhKYk1sMHNJR1JsYmlrN1hHNWNiaUFnVXloa1pXNHlMQ0JrWlc0cE8xeHVJQ0JUS0dSbGJqUXNJR1JsYmpJcE8xeHVJQ0JOS0dSbGJqWXNJR1JsYmpRc0lHUmxiaklwTzF4dUlDQk5LSFFzSUdSbGJqWXNJRzUxYlNrN1hHNGdJRTBvZEN3Z2RDd2daR1Z1S1R0Y2JseHVJQ0J3YjNjeU5USXpLSFFzSUhRcE8xeHVJQ0JOS0hRc0lIUXNJRzUxYlNrN1hHNGdJRTBvZEN3Z2RDd2daR1Z1S1R0Y2JpQWdUU2gwTENCMExDQmtaVzRwTzF4dUlDQk5LSEpiTUYwc0lIUXNJR1JsYmlrN1hHNWNiaUFnVXloamFHc3NJSEpiTUYwcE8xeHVJQ0JOS0dOb2F5d2dZMmhyTENCa1pXNHBPMXh1SUNCcFppQW9ibVZ4TWpVMU1Ua29ZMmhyTENCdWRXMHBLU0JOS0hKYk1GMHNJSEpiTUYwc0lFa3BPMXh1WEc0Z0lGTW9ZMmhyTENCeVd6QmRLVHRjYmlBZ1RTaGphR3NzSUdOb2F5d2daR1Z1S1R0Y2JpQWdhV1lnS0c1bGNUSTFOVEU1S0dOb2F5d2diblZ0S1NrZ2NtVjBkWEp1SUMweE8xeHVYRzRnSUdsbUlDaHdZWEl5TlRVeE9TaHlXekJkS1NBOVBUMGdLSEJiTXpGZFBqNDNLU2tnV2loeVd6QmRMQ0JuWmpBc0lISmJNRjBwTzF4dVhHNGdJRTBvY2xzelhTd2djbHN3WFN3Z2Nsc3hYU2s3WEc0Z0lISmxkSFZ5YmlBd08xeHVmVnh1WEc1bWRXNWpkR2x2YmlCamNubHdkRzlmYzJsbmJsOXZjR1Z1S0cwc0lITnRMQ0J1TENCd2F5a2dlMXh1SUNCMllYSWdhVHRjYmlBZ2RtRnlJSFFnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2d6TWlrc0lHZ2dQU0J1WlhjZ1ZXbHVkRGhCY25KaGVTZzJOQ2s3WEc0Z0lIWmhjaUJ3SUQwZ1cyZG1LQ2tzSUdkbUtDa3NJR2RtS0Nrc0lHZG1LQ2xkTEZ4dUlDQWdJQ0FnY1NBOUlGdG5aaWdwTENCblppZ3BMQ0JuWmlncExDQm5aaWdwWFR0Y2JseHVJQ0JwWmlBb2JpQThJRFkwS1NCeVpYUjFjbTRnTFRFN1hHNWNiaUFnYVdZZ0tIVnVjR0ZqYTI1bFp5aHhMQ0J3YXlrcElISmxkSFZ5YmlBdE1UdGNibHh1SUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYmpzZ2FTc3JLU0J0VzJsZElEMGdjMjFiYVYwN1hHNGdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQXpNanNnYVNzcktTQnRXMmtyTXpKZElEMGdjR3RiYVYwN1hHNGdJR055ZVhCMGIxOW9ZWE5vS0dnc0lHMHNJRzRwTzF4dUlDQnlaV1IxWTJVb2FDazdYRzRnSUhOallXeGhjbTExYkhRb2NDd2djU3dnYUNrN1hHNWNiaUFnYzJOaGJHRnlZbUZ6WlNoeExDQnpiUzV6ZFdKaGNuSmhlU2d6TWlrcE8xeHVJQ0JoWkdRb2NDd2djU2s3WEc0Z0lIQmhZMnNvZEN3Z2NDazdYRzVjYmlBZ2JpQXRQU0EyTkR0Y2JpQWdhV1lnS0dOeWVYQjBiMTkyWlhKcFpubGZNeklvYzIwc0lEQXNJSFFzSURBcEtTQjdYRzRnSUNBZ1ptOXlJQ2hwSUQwZ01Ec2dhU0E4SUc0N0lHa3JLeWtnYlZ0cFhTQTlJREE3WEc0Z0lDQWdjbVYwZFhKdUlDMHhPMXh1SUNCOVhHNWNiaUFnWm05eUlDaHBJRDBnTURzZ2FTQThJRzQ3SUdrckt5a2diVnRwWFNBOUlITnRXMmtnS3lBMk5GMDdYRzRnSUhKbGRIVnliaUJ1TzF4dWZWeHVYRzUyWVhJZ1kzSjVjSFJ2WDNObFkzSmxkR0p2ZUY5TFJWbENXVlJGVXlBOUlETXlMRnh1SUNBZ0lHTnllWEIwYjE5elpXTnlaWFJpYjNoZlRrOU9RMFZDV1ZSRlV5QTlJREkwTEZ4dUlDQWdJR055ZVhCMGIxOXpaV055WlhSaWIzaGZXa1ZTVDBKWlZFVlRJRDBnTXpJc1hHNGdJQ0FnWTNKNWNIUnZYM05sWTNKbGRHSnZlRjlDVDFoYVJWSlBRbGxVUlZNZ1BTQXhOaXhjYmlBZ0lDQmpjbmx3ZEc5ZmMyTmhiR0Z5YlhWc2RGOUNXVlJGVXlBOUlETXlMRnh1SUNBZ0lHTnllWEIwYjE5elkyRnNZWEp0ZFd4MFgxTkRRVXhCVWtKWlZFVlRJRDBnTXpJc1hHNGdJQ0FnWTNKNWNIUnZYMkp2ZUY5UVZVSk1TVU5MUlZsQ1dWUkZVeUE5SURNeUxGeHVJQ0FnSUdOeWVYQjBiMTlpYjNoZlUwVkRVa1ZVUzBWWlFsbFVSVk1nUFNBek1peGNiaUFnSUNCamNubHdkRzlmWW05NFgwSkZSazlTUlU1TlFsbFVSVk1nUFNBek1peGNiaUFnSUNCamNubHdkRzlmWW05NFgwNVBUa05GUWxsVVJWTWdQU0JqY25sd2RHOWZjMlZqY21WMFltOTRYMDVQVGtORlFsbFVSVk1zWEc0Z0lDQWdZM0o1Y0hSdlgySnZlRjlhUlZKUFFsbFVSVk1nUFNCamNubHdkRzlmYzJWamNtVjBZbTk0WDFwRlVrOUNXVlJGVXl4Y2JpQWdJQ0JqY25sd2RHOWZZbTk0WDBKUFdGcEZVazlDV1ZSRlV5QTlJR055ZVhCMGIxOXpaV055WlhSaWIzaGZRazlZV2tWU1QwSlpWRVZUTEZ4dUlDQWdJR055ZVhCMGIxOXphV2R1WDBKWlZFVlRJRDBnTmpRc1hHNGdJQ0FnWTNKNWNIUnZYM05wWjI1ZlVGVkNURWxEUzBWWlFsbFVSVk1nUFNBek1peGNiaUFnSUNCamNubHdkRzlmYzJsbmJsOVRSVU5TUlZSTFJWbENXVlJGVXlBOUlEWTBMRnh1SUNBZ0lHTnllWEIwYjE5emFXZHVYMU5GUlVSQ1dWUkZVeUE5SURNeUxGeHVJQ0FnSUdOeWVYQjBiMTlvWVhOb1gwSlpWRVZUSUQwZ05qUTdYRzVjYm01aFkyd3ViRzkzYkdWMlpXd2dQU0I3WEc0Z0lHTnllWEIwYjE5amIzSmxYMmh6WVd4ellUSXdPaUJqY25sd2RHOWZZMjl5WlY5b2MyRnNjMkV5TUN4Y2JpQWdZM0o1Y0hSdlgzTjBjbVZoYlY5NGIzSTZJR055ZVhCMGIxOXpkSEpsWVcxZmVHOXlMRnh1SUNCamNubHdkRzlmYzNSeVpXRnRPaUJqY25sd2RHOWZjM1J5WldGdExGeHVJQ0JqY25sd2RHOWZjM1J5WldGdFgzTmhiSE5oTWpCZmVHOXlPaUJqY25sd2RHOWZjM1J5WldGdFgzTmhiSE5oTWpCZmVHOXlMRnh1SUNCamNubHdkRzlmYzNSeVpXRnRYM05oYkhOaE1qQTZJR055ZVhCMGIxOXpkSEpsWVcxZmMyRnNjMkV5TUN4Y2JpQWdZM0o1Y0hSdlgyOXVaWFJwYldWaGRYUm9PaUJqY25sd2RHOWZiMjVsZEdsdFpXRjFkR2dzWEc0Z0lHTnllWEIwYjE5dmJtVjBhVzFsWVhWMGFGOTJaWEpwWm5rNklHTnllWEIwYjE5dmJtVjBhVzFsWVhWMGFGOTJaWEpwWm5rc1hHNGdJR055ZVhCMGIxOTJaWEpwWm5sZk1UWTZJR055ZVhCMGIxOTJaWEpwWm5sZk1UWXNYRzRnSUdOeWVYQjBiMTkyWlhKcFpubGZNekk2SUdOeWVYQjBiMTkyWlhKcFpubGZNeklzWEc0Z0lHTnllWEIwYjE5elpXTnlaWFJpYjNnNklHTnllWEIwYjE5elpXTnlaWFJpYjNnc1hHNGdJR055ZVhCMGIxOXpaV055WlhSaWIzaGZiM0JsYmpvZ1kzSjVjSFJ2WDNObFkzSmxkR0p2ZUY5dmNHVnVMRnh1SUNCamNubHdkRzlmYzJOaGJHRnliWFZzZERvZ1kzSjVjSFJ2WDNOallXeGhjbTExYkhRc1hHNGdJR055ZVhCMGIxOXpZMkZzWVhKdGRXeDBYMkpoYzJVNklHTnllWEIwYjE5elkyRnNZWEp0ZFd4MFgySmhjMlVzWEc0Z0lHTnllWEIwYjE5aWIzaGZZbVZtYjNKbGJtMDZJR055ZVhCMGIxOWliM2hmWW1WbWIzSmxibTBzWEc0Z0lHTnllWEIwYjE5aWIzaGZZV1owWlhKdWJUb2dZM0o1Y0hSdlgySnZlRjloWm5SbGNtNXRMRnh1SUNCamNubHdkRzlmWW05NE9pQmpjbmx3ZEc5ZlltOTRMRnh1SUNCamNubHdkRzlmWW05NFgyOXdaVzQ2SUdOeWVYQjBiMTlpYjNoZmIzQmxiaXhjYmlBZ1kzSjVjSFJ2WDJKdmVGOXJaWGx3WVdseU9pQmpjbmx3ZEc5ZlltOTRYMnRsZVhCaGFYSXNYRzRnSUdOeWVYQjBiMTlvWVhOb09pQmpjbmx3ZEc5ZmFHRnphQ3hjYmlBZ1kzSjVjSFJ2WDNOcFoyNDZJR055ZVhCMGIxOXphV2R1TEZ4dUlDQmpjbmx3ZEc5ZmMybG5ibDlyWlhsd1lXbHlPaUJqY25sd2RHOWZjMmxuYmw5clpYbHdZV2x5TEZ4dUlDQmpjbmx3ZEc5ZmMybG5ibDl2Y0dWdU9pQmpjbmx3ZEc5ZmMybG5ibDl2Y0dWdUxGeHVYRzRnSUdOeWVYQjBiMTl6WldOeVpYUmliM2hmUzBWWlFsbFVSVk02SUdOeWVYQjBiMTl6WldOeVpYUmliM2hmUzBWWlFsbFVSVk1zWEc0Z0lHTnllWEIwYjE5elpXTnlaWFJpYjNoZlRrOU9RMFZDV1ZSRlV6b2dZM0o1Y0hSdlgzTmxZM0psZEdKdmVGOU9UMDVEUlVKWlZFVlRMRnh1SUNCamNubHdkRzlmYzJWamNtVjBZbTk0WDFwRlVrOUNXVlJGVXpvZ1kzSjVjSFJ2WDNObFkzSmxkR0p2ZUY5YVJWSlBRbGxVUlZNc1hHNGdJR055ZVhCMGIxOXpaV055WlhSaWIzaGZRazlZV2tWU1QwSlpWRVZUT2lCamNubHdkRzlmYzJWamNtVjBZbTk0WDBKUFdGcEZVazlDV1ZSRlV5eGNiaUFnWTNKNWNIUnZYM05qWVd4aGNtMTFiSFJmUWxsVVJWTTZJR055ZVhCMGIxOXpZMkZzWVhKdGRXeDBYMEpaVkVWVExGeHVJQ0JqY25sd2RHOWZjMk5oYkdGeWJYVnNkRjlUUTBGTVFWSkNXVlJGVXpvZ1kzSjVjSFJ2WDNOallXeGhjbTExYkhSZlUwTkJURUZTUWxsVVJWTXNYRzRnSUdOeWVYQjBiMTlpYjNoZlVGVkNURWxEUzBWWlFsbFVSVk02SUdOeWVYQjBiMTlpYjNoZlVGVkNURWxEUzBWWlFsbFVSVk1zWEc0Z0lHTnllWEIwYjE5aWIzaGZVMFZEVWtWVVMwVlpRbGxVUlZNNklHTnllWEIwYjE5aWIzaGZVMFZEVWtWVVMwVlpRbGxVUlZNc1hHNGdJR055ZVhCMGIxOWliM2hmUWtWR1QxSkZUazFDV1ZSRlV6b2dZM0o1Y0hSdlgySnZlRjlDUlVaUFVrVk9UVUpaVkVWVExGeHVJQ0JqY25sd2RHOWZZbTk0WDA1UFRrTkZRbGxVUlZNNklHTnllWEIwYjE5aWIzaGZUazlPUTBWQ1dWUkZVeXhjYmlBZ1kzSjVjSFJ2WDJKdmVGOWFSVkpQUWxsVVJWTTZJR055ZVhCMGIxOWliM2hmV2tWU1QwSlpWRVZUTEZ4dUlDQmpjbmx3ZEc5ZlltOTRYMEpQV0ZwRlVrOUNXVlJGVXpvZ1kzSjVjSFJ2WDJKdmVGOUNUMWhhUlZKUFFsbFVSVk1zWEc0Z0lHTnllWEIwYjE5emFXZHVYMEpaVkVWVE9pQmpjbmx3ZEc5ZmMybG5ibDlDV1ZSRlV5eGNiaUFnWTNKNWNIUnZYM05wWjI1ZlVGVkNURWxEUzBWWlFsbFVSVk02SUdOeWVYQjBiMTl6YVdkdVgxQlZRa3hKUTB0RldVSlpWRVZUTEZ4dUlDQmpjbmx3ZEc5ZmMybG5ibDlUUlVOU1JWUkxSVmxDV1ZSRlV6b2dZM0o1Y0hSdlgzTnBaMjVmVTBWRFVrVlVTMFZaUWxsVVJWTXNYRzRnSUdOeWVYQjBiMTl6YVdkdVgxTkZSVVJDV1ZSRlV6b2dZM0o1Y0hSdlgzTnBaMjVmVTBWRlJFSlpWRVZUTEZ4dUlDQmpjbmx3ZEc5ZmFHRnphRjlDV1ZSRlV6b2dZM0o1Y0hSdlgyaGhjMmhmUWxsVVJWTXNYRzVjYmlBZ1oyWTZJR2RtTEZ4dUlDQkVPaUJFTEZ4dUlDQk1PaUJNTEZ4dUlDQndZV05yTWpVMU1UazZJSEJoWTJzeU5UVXhPU3hjYmlBZ2RXNXdZV05yTWpVMU1UazZJSFZ1Y0dGamF6STFOVEU1TEZ4dUlDQk5PaUJOTEZ4dUlDQkJPaUJCTEZ4dUlDQlRPaUJUTEZ4dUlDQmFPaUJhTEZ4dUlDQndiM2N5TlRJek9pQndiM2N5TlRJekxGeHVJQ0JoWkdRNklHRmtaQ3hjYmlBZ2MyVjBNalUxTVRrNklITmxkREkxTlRFNUxGeHVJQ0J0YjJSTU9pQnRiMlJNTEZ4dUlDQnpZMkZzWVhKdGRXeDBPaUJ6WTJGc1lYSnRkV3gwTEZ4dUlDQnpZMkZzWVhKaVlYTmxPaUJ6WTJGc1lYSmlZWE5sTEZ4dWZUdGNibHh1THlvZ1NHbG5hQzFzWlhabGJDQkJVRWtnS2k5Y2JseHVablZ1WTNScGIyNGdZMmhsWTJ0TVpXNW5kR2h6S0dzc0lHNHBJSHRjYmlBZ2FXWWdLR3N1YkdWdVozUm9JQ0U5UFNCamNubHdkRzlmYzJWamNtVjBZbTk0WDB0RldVSlpWRVZUS1NCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjJKaFpDQnJaWGtnYzJsNlpTY3BPMXh1SUNCcFppQW9iaTVzWlc1bmRHZ2dJVDA5SUdOeWVYQjBiMTl6WldOeVpYUmliM2hmVGs5T1EwVkNXVlJGVXlrZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkaVlXUWdibTl1WTJVZ2MybDZaU2NwTzF4dWZWeHVYRzVtZFc1amRHbHZiaUJqYUdWamEwSnZlRXhsYm1kMGFITW9jR3NzSUhOcktTQjdYRzRnSUdsbUlDaHdheTVzWlc1bmRHZ2dJVDA5SUdOeWVYQjBiMTlpYjNoZlVGVkNURWxEUzBWWlFsbFVSVk1wSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduWW1Ga0lIQjFZbXhwWXlCclpYa2djMmw2WlNjcE8xeHVJQ0JwWmlBb2Myc3ViR1Z1WjNSb0lDRTlQU0JqY25sd2RHOWZZbTk0WDFORlExSkZWRXRGV1VKWlZFVlRLU0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMkpoWkNCelpXTnlaWFFnYTJWNUlITnBlbVVuS1R0Y2JuMWNibHh1Wm5WdVkzUnBiMjRnWTJobFkydEJjbkpoZVZSNWNHVnpLQ2tnZTF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUdsbUlDZ2hLR0Z5WjNWdFpXNTBjMXRwWFNCcGJuTjBZVzVqWlc5bUlGVnBiblE0UVhKeVlYa3BLVnh1SUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWduZFc1bGVIQmxZM1JsWkNCMGVYQmxMQ0IxYzJVZ1ZXbHVkRGhCY25KaGVTY3BPMXh1SUNCOVhHNTlYRzVjYm1aMWJtTjBhVzl1SUdOc1pXRnVkWEFvWVhKeUtTQjdYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z1lYSnlMbXhsYm1kMGFEc2dhU3NyS1NCaGNuSmJhVjBnUFNBd08xeHVmVnh1WEc1dVlXTnNMbkpoYm1SdmJVSjVkR1Z6SUQwZ1puVnVZM1JwYjI0b2Jpa2dlMXh1SUNCMllYSWdZaUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLRzRwTzF4dUlDQnlZVzVrYjIxaWVYUmxjeWhpTENCdUtUdGNiaUFnY21WMGRYSnVJR0k3WEc1OU8xeHVYRzV1WVdOc0xuTmxZM0psZEdKdmVDQTlJR1oxYm1OMGFXOXVLRzF6Wnl3Z2JtOXVZMlVzSUd0bGVTa2dlMXh1SUNCamFHVmphMEZ5Y21GNVZIbHdaWE1vYlhObkxDQnViMjVqWlN3Z2EyVjVLVHRjYmlBZ1kyaGxZMnRNWlc1bmRHaHpLR3RsZVN3Z2JtOXVZMlVwTzF4dUlDQjJZWElnYlNBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0dOeWVYQjBiMTl6WldOeVpYUmliM2hmV2tWU1QwSlpWRVZUSUNzZ2JYTm5MbXhsYm1kMGFDazdYRzRnSUhaaGNpQmpJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29iUzVzWlc1bmRHZ3BPMXh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHMXpaeTVzWlc1bmRHZzdJR2tyS3lrZ2JWdHBLMk55ZVhCMGIxOXpaV055WlhSaWIzaGZXa1ZTVDBKWlZFVlRYU0E5SUcxeloxdHBYVHRjYmlBZ1kzSjVjSFJ2WDNObFkzSmxkR0p2ZUNoakxDQnRMQ0J0TG14bGJtZDBhQ3dnYm05dVkyVXNJR3RsZVNrN1hHNGdJSEpsZEhWeWJpQmpMbk4xWW1GeWNtRjVLR055ZVhCMGIxOXpaV055WlhSaWIzaGZRazlZV2tWU1QwSlpWRVZUS1R0Y2JuMDdYRzVjYm01aFkyd3VjMlZqY21WMFltOTRMbTl3Wlc0Z1BTQm1kVzVqZEdsdmJpaGliM2dzSUc1dmJtTmxMQ0JyWlhrcElIdGNiaUFnWTJobFkydEJjbkpoZVZSNWNHVnpLR0p2ZUN3Z2JtOXVZMlVzSUd0bGVTazdYRzRnSUdOb1pXTnJUR1Z1WjNSb2N5aHJaWGtzSUc1dmJtTmxLVHRjYmlBZ2RtRnlJR01nUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hqY25sd2RHOWZjMlZqY21WMFltOTRYMEpQV0ZwRlVrOUNXVlJGVXlBcklHSnZlQzVzWlc1bmRHZ3BPMXh1SUNCMllYSWdiU0E5SUc1bGR5QlZhVzUwT0VGeWNtRjVLR011YkdWdVozUm9LVHRjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQmliM2d1YkdWdVozUm9PeUJwS3lzcElHTmJhU3RqY25sd2RHOWZjMlZqY21WMFltOTRYMEpQV0ZwRlVrOUNXVlJGVTEwZ1BTQmliM2hiYVYwN1hHNGdJR2xtSUNoakxteGxibWQwYUNBOElETXlLU0J5WlhSMWNtNGdiblZzYkR0Y2JpQWdhV1lnS0dOeWVYQjBiMTl6WldOeVpYUmliM2hmYjNCbGJpaHRMQ0JqTENCakxteGxibWQwYUN3Z2JtOXVZMlVzSUd0bGVTa2dJVDA5SURBcElISmxkSFZ5YmlCdWRXeHNPMXh1SUNCeVpYUjFjbTRnYlM1emRXSmhjbkpoZVNoamNubHdkRzlmYzJWamNtVjBZbTk0WDFwRlVrOUNXVlJGVXlrN1hHNTlPMXh1WEc1dVlXTnNMbk5sWTNKbGRHSnZlQzVyWlhsTVpXNW5kR2dnUFNCamNubHdkRzlmYzJWamNtVjBZbTk0WDB0RldVSlpWRVZUTzF4dWJtRmpiQzV6WldOeVpYUmliM2d1Ym05dVkyVk1aVzVuZEdnZ1BTQmpjbmx3ZEc5ZmMyVmpjbVYwWW05NFgwNVBUa05GUWxsVVJWTTdYRzV1WVdOc0xuTmxZM0psZEdKdmVDNXZkbVZ5YUdWaFpFeGxibWQwYUNBOUlHTnllWEIwYjE5elpXTnlaWFJpYjNoZlFrOVlXa1ZTVDBKWlZFVlRPMXh1WEc1dVlXTnNMbk5qWVd4aGNrMTFiSFFnUFNCbWRXNWpkR2x2YmlodUxDQndLU0I3WEc0Z0lHTm9aV05yUVhKeVlYbFVlWEJsY3lodUxDQndLVHRjYmlBZ2FXWWdLRzR1YkdWdVozUm9JQ0U5UFNCamNubHdkRzlmYzJOaGJHRnliWFZzZEY5VFEwRk1RVkpDV1ZSRlV5a2dkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZGlZV1FnYmlCemFYcGxKeWs3WEc0Z0lHbG1JQ2h3TG14bGJtZDBhQ0FoUFQwZ1kzSjVjSFJ2WDNOallXeGhjbTExYkhSZlFsbFVSVk1wSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduWW1Ga0lIQWdjMmw2WlNjcE8xeHVJQ0IyWVhJZ2NTQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtHTnllWEIwYjE5elkyRnNZWEp0ZFd4MFgwSlpWRVZUS1R0Y2JpQWdZM0o1Y0hSdlgzTmpZV3hoY20xMWJIUW9jU3dnYml3Z2NDazdYRzRnSUhKbGRIVnliaUJ4TzF4dWZUdGNibHh1Ym1GamJDNXpZMkZzWVhKTmRXeDBMbUpoYzJVZ1BTQm1kVzVqZEdsdmJpaHVLU0I3WEc0Z0lHTm9aV05yUVhKeVlYbFVlWEJsY3lodUtUdGNiaUFnYVdZZ0tHNHViR1Z1WjNSb0lDRTlQU0JqY25sd2RHOWZjMk5oYkdGeWJYVnNkRjlUUTBGTVFWSkNXVlJGVXlrZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkaVlXUWdiaUJ6YVhwbEp5azdYRzRnSUhaaGNpQnhJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29ZM0o1Y0hSdlgzTmpZV3hoY20xMWJIUmZRbGxVUlZNcE8xeHVJQ0JqY25sd2RHOWZjMk5oYkdGeWJYVnNkRjlpWVhObEtIRXNJRzRwTzF4dUlDQnlaWFIxY200Z2NUdGNibjA3WEc1Y2JtNWhZMnd1YzJOaGJHRnlUWFZzZEM1elkyRnNZWEpNWlc1bmRHZ2dQU0JqY25sd2RHOWZjMk5oYkdGeWJYVnNkRjlUUTBGTVFWSkNXVlJGVXp0Y2JtNWhZMnd1YzJOaGJHRnlUWFZzZEM1bmNtOTFjRVZzWlcxbGJuUk1aVzVuZEdnZ1BTQmpjbmx3ZEc5ZmMyTmhiR0Z5YlhWc2RGOUNXVlJGVXp0Y2JseHVibUZqYkM1aWIzZ2dQU0JtZFc1amRHbHZiaWh0YzJjc0lHNXZibU5sTENCd2RXSnNhV05MWlhrc0lITmxZM0psZEV0bGVTa2dlMXh1SUNCMllYSWdheUE5SUc1aFkyd3VZbTk0TG1KbFptOXlaU2h3ZFdKc2FXTkxaWGtzSUhObFkzSmxkRXRsZVNrN1hHNGdJSEpsZEhWeWJpQnVZV05zTG5ObFkzSmxkR0p2ZUNodGMyY3NJRzV2Ym1ObExDQnJLVHRjYm4wN1hHNWNibTVoWTJ3dVltOTRMbUpsWm05eVpTQTlJR1oxYm1OMGFXOXVLSEIxWW14cFkwdGxlU3dnYzJWamNtVjBTMlY1S1NCN1hHNGdJR05vWldOclFYSnlZWGxVZVhCbGN5aHdkV0pzYVdOTFpYa3NJSE5sWTNKbGRFdGxlU2s3WEc0Z0lHTm9aV05yUW05NFRHVnVaM1JvY3lod2RXSnNhV05MWlhrc0lITmxZM0psZEV0bGVTazdYRzRnSUhaaGNpQnJJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29ZM0o1Y0hSdlgySnZlRjlDUlVaUFVrVk9UVUpaVkVWVEtUdGNiaUFnWTNKNWNIUnZYMkp2ZUY5aVpXWnZjbVZ1YlNockxDQndkV0pzYVdOTFpYa3NJSE5sWTNKbGRFdGxlU2s3WEc0Z0lISmxkSFZ5YmlCck8xeHVmVHRjYmx4dWJtRmpiQzVpYjNndVlXWjBaWElnUFNCdVlXTnNMbk5sWTNKbGRHSnZlRHRjYmx4dWJtRmpiQzVpYjNndWIzQmxiaUE5SUdaMWJtTjBhVzl1S0cxelp5d2dibTl1WTJVc0lIQjFZbXhwWTB0bGVTd2djMlZqY21WMFMyVjVLU0I3WEc0Z0lIWmhjaUJySUQwZ2JtRmpiQzVpYjNndVltVm1iM0psS0hCMVlteHBZMHRsZVN3Z2MyVmpjbVYwUzJWNUtUdGNiaUFnY21WMGRYSnVJRzVoWTJ3dWMyVmpjbVYwWW05NExtOXdaVzRvYlhObkxDQnViMjVqWlN3Z2F5azdYRzU5TzF4dVhHNXVZV05zTG1KdmVDNXZjR1Z1TG1GbWRHVnlJRDBnYm1GamJDNXpaV055WlhSaWIzZ3ViM0JsYmp0Y2JseHVibUZqYkM1aWIzZ3VhMlY1VUdGcGNpQTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQjJZWElnY0dzZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoamNubHdkRzlmWW05NFgxQlZRa3hKUTB0RldVSlpWRVZUS1R0Y2JpQWdkbUZ5SUhOcklEMGdibVYzSUZWcGJuUTRRWEp5WVhrb1kzSjVjSFJ2WDJKdmVGOVRSVU5TUlZSTFJWbENXVlJGVXlrN1hHNGdJR055ZVhCMGIxOWliM2hmYTJWNWNHRnBjaWh3YXl3Z2Myc3BPMXh1SUNCeVpYUjFjbTRnZTNCMVlteHBZMHRsZVRvZ2NHc3NJSE5sWTNKbGRFdGxlVG9nYzJ0OU8xeHVmVHRjYmx4dWJtRmpiQzVpYjNndWEyVjVVR0ZwY2k1bWNtOXRVMlZqY21WMFMyVjVJRDBnWm5WdVkzUnBiMjRvYzJWamNtVjBTMlY1S1NCN1hHNGdJR05vWldOclFYSnlZWGxVZVhCbGN5aHpaV055WlhSTFpYa3BPMXh1SUNCcFppQW9jMlZqY21WMFMyVjVMbXhsYm1kMGFDQWhQVDBnWTNKNWNIUnZYMkp2ZUY5VFJVTlNSVlJMUlZsQ1dWUkZVeWxjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0oySmhaQ0J6WldOeVpYUWdhMlY1SUhOcGVtVW5LVHRjYmlBZ2RtRnlJSEJySUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvWTNKNWNIUnZYMkp2ZUY5UVZVSk1TVU5MUlZsQ1dWUkZVeWs3WEc0Z0lHTnllWEIwYjE5elkyRnNZWEp0ZFd4MFgySmhjMlVvY0dzc0lITmxZM0psZEV0bGVTazdYRzRnSUhKbGRIVnliaUI3Y0hWaWJHbGpTMlY1T2lCd2F5d2djMlZqY21WMFMyVjVPaUJ1WlhjZ1ZXbHVkRGhCY25KaGVTaHpaV055WlhSTFpYa3BmVHRjYm4wN1hHNWNibTVoWTJ3dVltOTRMbkIxWW14cFkwdGxlVXhsYm1kMGFDQTlJR055ZVhCMGIxOWliM2hmVUZWQ1RFbERTMFZaUWxsVVJWTTdYRzV1WVdOc0xtSnZlQzV6WldOeVpYUkxaWGxNWlc1bmRHZ2dQU0JqY25sd2RHOWZZbTk0WDFORlExSkZWRXRGV1VKWlZFVlRPMXh1Ym1GamJDNWliM2d1YzJoaGNtVmtTMlY1VEdWdVozUm9JRDBnWTNKNWNIUnZYMkp2ZUY5Q1JVWlBVa1ZPVFVKWlZFVlRPMXh1Ym1GamJDNWliM2d1Ym05dVkyVk1aVzVuZEdnZ1BTQmpjbmx3ZEc5ZlltOTRYMDVQVGtORlFsbFVSVk03WEc1dVlXTnNMbUp2ZUM1dmRtVnlhR1ZoWkV4bGJtZDBhQ0E5SUc1aFkyd3VjMlZqY21WMFltOTRMbTkyWlhKb1pXRmtUR1Z1WjNSb08xeHVYRzV1WVdOc0xuTnBaMjRnUFNCbWRXNWpkR2x2YmlodGMyY3NJSE5sWTNKbGRFdGxlU2tnZTF4dUlDQmphR1ZqYTBGeWNtRjVWSGx3WlhNb2JYTm5MQ0J6WldOeVpYUkxaWGtwTzF4dUlDQnBaaUFvYzJWamNtVjBTMlY1TG14bGJtZDBhQ0FoUFQwZ1kzSjVjSFJ2WDNOcFoyNWZVMFZEVWtWVVMwVlpRbGxVUlZNcFhHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RpWVdRZ2MyVmpjbVYwSUd0bGVTQnphWHBsSnlrN1hHNGdJSFpoY2lCemFXZHVaV1JOYzJjZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoamNubHdkRzlmYzJsbmJsOUNXVlJGVXl0dGMyY3ViR1Z1WjNSb0tUdGNiaUFnWTNKNWNIUnZYM05wWjI0b2MybG5ibVZrVFhObkxDQnRjMmNzSUcxelp5NXNaVzVuZEdnc0lITmxZM0psZEV0bGVTazdYRzRnSUhKbGRIVnliaUJ6YVdkdVpXUk5jMmM3WEc1OU8xeHVYRzV1WVdOc0xuTnBaMjR1YjNCbGJpQTlJR1oxYm1OMGFXOXVLSE5wWjI1bFpFMXpaeXdnY0hWaWJHbGpTMlY1S1NCN1hHNGdJR05vWldOclFYSnlZWGxVZVhCbGN5aHphV2R1WldSTmMyY3NJSEIxWW14cFkwdGxlU2s3WEc0Z0lHbG1JQ2h3ZFdKc2FXTkxaWGt1YkdWdVozUm9JQ0U5UFNCamNubHdkRzlmYzJsbmJsOVFWVUpNU1VOTFJWbENXVlJGVXlsY2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMkpoWkNCd2RXSnNhV01nYTJWNUlITnBlbVVuS1R0Y2JpQWdkbUZ5SUhSdGNDQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtITnBaMjVsWkUxelp5NXNaVzVuZEdncE8xeHVJQ0IyWVhJZ2JXeGxiaUE5SUdOeWVYQjBiMTl6YVdkdVgyOXdaVzRvZEcxd0xDQnphV2R1WldSTmMyY3NJSE5wWjI1bFpFMXpaeTVzWlc1bmRHZ3NJSEIxWW14cFkwdGxlU2s3WEc0Z0lHbG1JQ2h0YkdWdUlEd2dNQ2tnY21WMGRYSnVJRzUxYkd3N1hHNGdJSFpoY2lCdElEMGdibVYzSUZWcGJuUTRRWEp5WVhrb2JXeGxiaWs3WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2diUzVzWlc1bmRHZzdJR2tyS3lrZ2JWdHBYU0E5SUhSdGNGdHBYVHRjYmlBZ2NtVjBkWEp1SUcwN1hHNTlPMXh1WEc1dVlXTnNMbk5wWjI0dVpHVjBZV05vWldRZ1BTQm1kVzVqZEdsdmJpaHRjMmNzSUhObFkzSmxkRXRsZVNrZ2UxeHVJQ0IyWVhJZ2MybG5ibVZrVFhObklEMGdibUZqYkM1emFXZHVLRzF6Wnl3Z2MyVmpjbVYwUzJWNUtUdGNiaUFnZG1GeUlITnBaeUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLR055ZVhCMGIxOXphV2R1WDBKWlZFVlRLVHRjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnphV2N1YkdWdVozUm9PeUJwS3lzcElITnBaMXRwWFNBOUlITnBaMjVsWkUxeloxdHBYVHRjYmlBZ2NtVjBkWEp1SUhOcFp6dGNibjA3WEc1Y2JtNWhZMnd1YzJsbmJpNWtaWFJoWTJobFpDNTJaWEpwWm5rZ1BTQm1kVzVqZEdsdmJpaHRjMmNzSUhOcFp5d2djSFZpYkdsalMyVjVLU0I3WEc0Z0lHTm9aV05yUVhKeVlYbFVlWEJsY3lodGMyY3NJSE5wWnl3Z2NIVmliR2xqUzJWNUtUdGNiaUFnYVdZZ0tITnBaeTVzWlc1bmRHZ2dJVDA5SUdOeWVYQjBiMTl6YVdkdVgwSlpWRVZUS1Z4dUlDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25ZbUZrSUhOcFoyNWhkSFZ5WlNCemFYcGxKeWs3WEc0Z0lHbG1JQ2h3ZFdKc2FXTkxaWGt1YkdWdVozUm9JQ0U5UFNCamNubHdkRzlmYzJsbmJsOVFWVUpNU1VOTFJWbENXVlJGVXlsY2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMkpoWkNCd2RXSnNhV01nYTJWNUlITnBlbVVuS1R0Y2JpQWdkbUZ5SUhOdElEMGdibVYzSUZWcGJuUTRRWEp5WVhrb1kzSjVjSFJ2WDNOcFoyNWZRbGxVUlZNZ0t5QnRjMmN1YkdWdVozUm9LVHRjYmlBZ2RtRnlJRzBnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hqY25sd2RHOWZjMmxuYmw5Q1dWUkZVeUFySUcxelp5NXNaVzVuZEdncE8xeHVJQ0IyWVhJZ2FUdGNiaUFnWm05eUlDaHBJRDBnTURzZ2FTQThJR055ZVhCMGIxOXphV2R1WDBKWlZFVlRPeUJwS3lzcElITnRXMmxkSUQwZ2MybG5XMmxkTzF4dUlDQm1iM0lnS0drZ1BTQXdPeUJwSUR3Z2JYTm5MbXhsYm1kMGFEc2dhU3NyS1NCemJWdHBLMk55ZVhCMGIxOXphV2R1WDBKWlZFVlRYU0E5SUcxeloxdHBYVHRjYmlBZ2NtVjBkWEp1SUNoamNubHdkRzlmYzJsbmJsOXZjR1Z1S0cwc0lITnRMQ0J6YlM1c1pXNW5kR2dzSUhCMVlteHBZMHRsZVNrZ1BqMGdNQ2s3WEc1OU8xeHVYRzV1WVdOc0xuTnBaMjR1YTJWNVVHRnBjaUE5SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0IyWVhJZ2NHc2dQU0J1WlhjZ1ZXbHVkRGhCY25KaGVTaGpjbmx3ZEc5ZmMybG5ibDlRVlVKTVNVTkxSVmxDV1ZSRlV5azdYRzRnSUhaaGNpQnpheUE5SUc1bGR5QlZhVzUwT0VGeWNtRjVLR055ZVhCMGIxOXphV2R1WDFORlExSkZWRXRGV1VKWlZFVlRLVHRjYmlBZ1kzSjVjSFJ2WDNOcFoyNWZhMlY1Y0dGcGNpaHdheXdnYzJzcE8xeHVJQ0J5WlhSMWNtNGdlM0IxWW14cFkwdGxlVG9nY0dzc0lITmxZM0psZEV0bGVUb2djMnQ5TzF4dWZUdGNibHh1Ym1GamJDNXphV2R1TG10bGVWQmhhWEl1Wm5KdmJWTmxZM0psZEV0bGVTQTlJR1oxYm1OMGFXOXVLSE5sWTNKbGRFdGxlU2tnZTF4dUlDQmphR1ZqYTBGeWNtRjVWSGx3WlhNb2MyVmpjbVYwUzJWNUtUdGNiaUFnYVdZZ0tITmxZM0psZEV0bGVTNXNaVzVuZEdnZ0lUMDlJR055ZVhCMGIxOXphV2R1WDFORlExSkZWRXRGV1VKWlZFVlRLVnh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblltRmtJSE5sWTNKbGRDQnJaWGtnYzJsNlpTY3BPMXh1SUNCMllYSWdjR3NnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hqY25sd2RHOWZjMmxuYmw5UVZVSk1TVU5MUlZsQ1dWUkZVeWs3WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2djR3N1YkdWdVozUm9PeUJwS3lzcElIQnJXMmxkSUQwZ2MyVmpjbVYwUzJWNVd6TXlLMmxkTzF4dUlDQnlaWFIxY200Z2UzQjFZbXhwWTB0bGVUb2djR3NzSUhObFkzSmxkRXRsZVRvZ2JtVjNJRlZwYm5RNFFYSnlZWGtvYzJWamNtVjBTMlY1S1gwN1hHNTlPMXh1WEc1dVlXTnNMbk5wWjI0dWEyVjVVR0ZwY2k1bWNtOXRVMlZsWkNBOUlHWjFibU4wYVc5dUtITmxaV1FwSUh0Y2JpQWdZMmhsWTJ0QmNuSmhlVlI1Y0dWektITmxaV1FwTzF4dUlDQnBaaUFvYzJWbFpDNXNaVzVuZEdnZ0lUMDlJR055ZVhCMGIxOXphV2R1WDFORlJVUkNXVlJGVXlsY2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMkpoWkNCelpXVmtJSE5wZW1VbktUdGNiaUFnZG1GeUlIQnJJRDBnYm1WM0lGVnBiblE0UVhKeVlYa29ZM0o1Y0hSdlgzTnBaMjVmVUZWQ1RFbERTMFZaUWxsVVJWTXBPMXh1SUNCMllYSWdjMnNnUFNCdVpYY2dWV2x1ZERoQmNuSmhlU2hqY25sd2RHOWZjMmxuYmw5VFJVTlNSVlJMUlZsQ1dWUkZVeWs3WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dNekk3SUdrckt5a2djMnRiYVYwZ1BTQnpaV1ZrVzJsZE8xeHVJQ0JqY25sd2RHOWZjMmxuYmw5clpYbHdZV2x5S0hCckxDQnpheXdnZEhKMVpTazdYRzRnSUhKbGRIVnliaUI3Y0hWaWJHbGpTMlY1T2lCd2F5d2djMlZqY21WMFMyVjVPaUJ6YTMwN1hHNTlPMXh1WEc1dVlXTnNMbk5wWjI0dWNIVmliR2xqUzJWNVRHVnVaM1JvSUQwZ1kzSjVjSFJ2WDNOcFoyNWZVRlZDVEVsRFMwVlpRbGxVUlZNN1hHNXVZV05zTG5OcFoyNHVjMlZqY21WMFMyVjVUR1Z1WjNSb0lEMGdZM0o1Y0hSdlgzTnBaMjVmVTBWRFVrVlVTMFZaUWxsVVJWTTdYRzV1WVdOc0xuTnBaMjR1YzJWbFpFeGxibWQwYUNBOUlHTnllWEIwYjE5emFXZHVYMU5GUlVSQ1dWUkZVenRjYm01aFkyd3VjMmxuYmk1emFXZHVZWFIxY21WTVpXNW5kR2dnUFNCamNubHdkRzlmYzJsbmJsOUNXVlJGVXp0Y2JseHVibUZqYkM1b1lYTm9JRDBnWm5WdVkzUnBiMjRvYlhObktTQjdYRzRnSUdOb1pXTnJRWEp5WVhsVWVYQmxjeWh0YzJjcE8xeHVJQ0IyWVhJZ2FDQTlJRzVsZHlCVmFXNTBPRUZ5Y21GNUtHTnllWEIwYjE5b1lYTm9YMEpaVkVWVEtUdGNiaUFnWTNKNWNIUnZYMmhoYzJnb2FDd2diWE5uTENCdGMyY3ViR1Z1WjNSb0tUdGNiaUFnY21WMGRYSnVJR2c3WEc1OU8xeHVYRzV1WVdOc0xtaGhjMmd1YUdGemFFeGxibWQwYUNBOUlHTnllWEIwYjE5b1lYTm9YMEpaVkVWVE8xeHVYRzV1WVdOc0xuWmxjbWxtZVNBOUlHWjFibU4wYVc5dUtIZ3NJSGtwSUh0Y2JpQWdZMmhsWTJ0QmNuSmhlVlI1Y0dWektIZ3NJSGtwTzF4dUlDQXZMeUJhWlhKdklHeGxibWQwYUNCaGNtZDFiV1Z1ZEhNZ1lYSmxJR052Ym5OcFpHVnlaV1FnYm05MElHVnhkV0ZzTGx4dUlDQnBaaUFvZUM1c1pXNW5kR2dnUFQwOUlEQWdmSHdnZVM1c1pXNW5kR2dnUFQwOUlEQXBJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdhV1lnS0hndWJHVnVaM1JvSUNFOVBTQjVMbXhsYm1kMGFDa2djbVYwZFhKdUlHWmhiSE5sTzF4dUlDQnlaWFIxY200Z0tIWnVLSGdzSURBc0lIa3NJREFzSUhndWJHVnVaM1JvS1NBOVBUMGdNQ2tnUHlCMGNuVmxJRG9nWm1Gc2MyVTdYRzU5TzF4dVhHNXVZV05zTG5ObGRGQlNUa2NnUFNCbWRXNWpkR2x2YmlobWJpa2dlMXh1SUNCeVlXNWtiMjFpZVhSbGN5QTlJR1p1TzF4dWZUdGNibHh1S0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0F2THlCSmJtbDBhV0ZzYVhwbElGQlNUa2NnYVdZZ1pXNTJhWEp2Ym0xbGJuUWdjSEp2ZG1sa1pYTWdRMU5RVWs1SExseHVJQ0F2THlCSlppQnViM1FzSUcxbGRHaHZaSE1nWTJGc2JHbHVaeUJ5WVc1a2IyMWllWFJsY3lCM2FXeHNJSFJvY205M0xseHVJQ0IyWVhJZ1kzSjVjSFJ2SUQwZ2RIbHdaVzltSUhObGJHWWdJVDA5SUNkMWJtUmxabWx1WldRbklEOGdLSE5sYkdZdVkzSjVjSFJ2SUh4OElITmxiR1l1YlhORGNubHdkRzhwSURvZ2JuVnNiRHRjYmlBZ2FXWWdLR055ZVhCMGJ5QW1KaUJqY25sd2RHOHVaMlYwVW1GdVpHOXRWbUZzZFdWektTQjdYRzRnSUNBZ0x5OGdRbkp2ZDNObGNuTXVYRzRnSUNBZ2RtRnlJRkZWVDFSQklEMGdOalUxTXpZN1hHNGdJQ0FnYm1GamJDNXpaWFJRVWs1SEtHWjFibU4wYVc5dUtIZ3NJRzRwSUh0Y2JpQWdJQ0FnSUhaaGNpQnBMQ0IySUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvYmlrN1hHNGdJQ0FnSUNCbWIzSWdLR2tnUFNBd095QnBJRHdnYmpzZ2FTQXJQU0JSVlU5VVFTa2dlMXh1SUNBZ0lDQWdJQ0JqY25sd2RHOHVaMlYwVW1GdVpHOXRWbUZzZFdWektIWXVjM1ZpWVhKeVlYa29hU3dnYVNBcklFMWhkR2d1YldsdUtHNGdMU0JwTENCUlZVOVVRU2twS1R0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0FnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0J1T3lCcEt5c3BJSGhiYVYwZ1BTQjJXMmxkTzF4dUlDQWdJQ0FnWTJ4bFlXNTFjQ2gyS1R0Y2JpQWdJQ0I5S1R0Y2JpQWdmU0JsYkhObElHbG1JQ2gwZVhCbGIyWWdjbVZ4ZFdseVpTQWhQVDBnSjNWdVpHVm1hVzVsWkNjcElIdGNiaUFnSUNBdkx5Qk9iMlJsTG1wekxseHVJQ0FnSUdOeWVYQjBieUE5SUhKbGNYVnBjbVVvSjJOeWVYQjBieWNwTzF4dUlDQWdJR2xtSUNoamNubHdkRzhnSmlZZ1kzSjVjSFJ2TG5KaGJtUnZiVUo1ZEdWektTQjdYRzRnSUNBZ0lDQnVZV05zTG5ObGRGQlNUa2NvWm5WdVkzUnBiMjRvZUN3Z2Jpa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2FTd2dkaUE5SUdOeWVYQjBieTV5WVc1a2IyMUNlWFJsY3lodUtUdGNiaUFnSUNBZ0lDQWdabTl5SUNocElEMGdNRHNnYVNBOElHNDdJR2tyS3lrZ2VGdHBYU0E5SUhaYmFWMDdYRzRnSUNBZ0lDQWdJR05zWldGdWRYQW9kaWs3WEc0Z0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc0Z0lIMWNibjBwS0NrN1hHNWNibjBwS0hSNWNHVnZaaUJ0YjJSMWJHVWdJVDA5SUNkMWJtUmxabWx1WldRbklDWW1JRzF2WkhWc1pTNWxlSEJ2Y25SeklEOGdiVzlrZFd4bExtVjRjRzl5ZEhNZ09pQW9jMlZzWmk1dVlXTnNJRDBnYzJWc1ppNXVZV05zSUh4OElIdDlLU2s3WEc0aUxDSjJZWElnYm1GMGFYWmxJRDBnY21WeGRXbHlaU2duTGk5dVlYUnBkbVVuS1Z4dVhHNW1kVzVqZEdsdmJpQm5aWFJVZVhCbFRtRnRaU0FvWm00cElIdGNiaUFnY21WMGRYSnVJR1p1TG01aGJXVWdmSHdnWm00dWRHOVRkSEpwYm1jb0tTNXRZWFJqYUNndlpuVnVZM1JwYjI0Z0tDNHFQeWxjWEhNcVhGd29MeWxiTVYxY2JuMWNibHh1Wm5WdVkzUnBiMjRnWjJWMFZtRnNkV1ZVZVhCbFRtRnRaU0FvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUc1aGRHbDJaUzVPYVd3b2RtRnNkV1VwSUQ4Z0p5Y2dPaUJuWlhSVWVYQmxUbUZ0WlNoMllXeDFaUzVqYjI1emRISjFZM1J2Y2lsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWjJWMFZtRnNkV1VnS0haaGJIVmxLU0I3WEc0Z0lHbG1JQ2h1WVhScGRtVXVSblZ1WTNScGIyNG9kbUZzZFdVcEtTQnlaWFIxY200Z0p5ZGNiaUFnYVdZZ0tHNWhkR2wyWlM1VGRISnBibWNvZG1Gc2RXVXBLU0J5WlhSMWNtNGdTbE5QVGk1emRISnBibWRwWm5rb2RtRnNkV1VwWEc0Z0lHbG1JQ2gyWVd4MVpTQW1KaUJ1WVhScGRtVXVUMkpxWldOMEtIWmhiSFZsS1NrZ2NtVjBkWEp1SUNjblhHNGdJSEpsZEhWeWJpQjJZV3gxWlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJqWVhCMGRYSmxVM1JoWTJ0VWNtRmpaU0FvWlN3Z2RDa2dlMXh1SUNCcFppQW9SWEp5YjNJdVkyRndkSFZ5WlZOMFlXTnJWSEpoWTJVcElIdGNiaUFnSUNCRmNuSnZjaTVqWVhCMGRYSmxVM1JoWTJ0VWNtRmpaU2hsTENCMEtWeHVJQ0I5WEc1OVhHNWNibVoxYm1OMGFXOXVJSFJtU2xOUFRpQW9kSGx3WlNrZ2UxeHVJQ0JwWmlBb2JtRjBhWFpsTGtaMWJtTjBhVzl1S0hSNWNHVXBLU0J5WlhSMWNtNGdkSGx3WlM1MGIwcFRUMDRnUHlCMGVYQmxMblJ2U2xOUFRpZ3BJRG9nWjJWMFZIbHdaVTVoYldVb2RIbHdaU2xjYmlBZ2FXWWdLRzVoZEdsMlpTNUJjbkpoZVNoMGVYQmxLU2tnY21WMGRYSnVJQ2RCY25KaGVTZGNiaUFnYVdZZ0tIUjVjR1VnSmlZZ2JtRjBhWFpsTGs5aWFtVmpkQ2gwZVhCbEtTa2djbVYwZFhKdUlDZFBZbXBsWTNRblhHNWNiaUFnY21WMGRYSnVJSFI1Y0dVZ0lUMDlJSFZ1WkdWbWFXNWxaQ0EvSUhSNWNHVWdPaUFuSjF4dWZWeHVYRzVtZFc1amRHbHZiaUIwWmtWeWNtOXlVM1J5YVc1bklDaDBlWEJsTENCMllXeDFaU3dnZG1Gc2RXVlVlWEJsVG1GdFpTa2dlMXh1SUNCMllYSWdkbUZzZFdWS2MyOXVJRDBnWjJWMFZtRnNkV1VvZG1Gc2RXVXBYRzVjYmlBZ2NtVjBkWEp1SUNkRmVIQmxZM1JsWkNBbklDc2dkR1pLVTA5T0tIUjVjR1VwSUNzZ0p5d2daMjkwSnlBclhHNGdJQ0FnS0haaGJIVmxWSGx3WlU1aGJXVWdJVDA5SUNjbklEOGdKeUFuSUNzZ2RtRnNkV1ZVZVhCbFRtRnRaU0E2SUNjbktTQXJYRzRnSUNBZ0tIWmhiSFZsU25OdmJpQWhQVDBnSnljZ1B5QW5JQ2NnS3lCMllXeDFaVXB6YjI0Z09pQW5KeWxjYm4xY2JseHVablZ1WTNScGIyNGdWR1pVZVhCbFJYSnliM0lnS0hSNWNHVXNJSFpoYkhWbExDQjJZV3gxWlZSNWNHVk9ZVzFsS1NCN1hHNGdJSFpoYkhWbFZIbHdaVTVoYldVZ1BTQjJZV3gxWlZSNWNHVk9ZVzFsSUh4OElHZGxkRlpoYkhWbFZIbHdaVTVoYldVb2RtRnNkV1VwWEc0Z0lIUm9hWE11YldWemMyRm5aU0E5SUhSbVJYSnliM0pUZEhKcGJtY29kSGx3WlN3Z2RtRnNkV1VzSUhaaGJIVmxWSGx3WlU1aGJXVXBYRzVjYmlBZ1kyRndkSFZ5WlZOMFlXTnJWSEpoWTJVb2RHaHBjeXdnVkdaVWVYQmxSWEp5YjNJcFhHNGdJSFJvYVhNdVgxOTBlWEJsSUQwZ2RIbHdaVnh1SUNCMGFHbHpMbDlmZG1Gc2RXVWdQU0IyWVd4MVpWeHVJQ0IwYUdsekxsOWZkbUZzZFdWVWVYQmxUbUZ0WlNBOUlIWmhiSFZsVkhsd1pVNWhiV1ZjYm4xY2JseHVWR1pVZVhCbFJYSnliM0l1Y0hKdmRHOTBlWEJsSUQwZ1QySnFaV04wTG1OeVpXRjBaU2hGY25KdmNpNXdjbTkwYjNSNWNHVXBYRzVVWmxSNWNHVkZjbkp2Y2k1d2NtOTBiM1I1Y0dVdVkyOXVjM1J5ZFdOMGIzSWdQU0JVWmxSNWNHVkZjbkp2Y2x4dVhHNW1kVzVqZEdsdmJpQjBabEJ5YjNCbGNuUjVSWEp5YjNKVGRISnBibWNnS0hSNWNHVXNJR3hoWW1Wc0xDQnVZVzFsTENCMllXeDFaU3dnZG1Gc2RXVlVlWEJsVG1GdFpTa2dlMXh1SUNCMllYSWdaR1Z6WTNKcGNIUnBiMjRnUFNBblhDSWdiMllnZEhsd1pTQW5YRzRnSUdsbUlDaHNZV0psYkNBOVBUMGdKMnRsZVNjcElHUmxjMk55YVhCMGFXOXVJRDBnSjF3aUlIZHBkR2dnYTJWNUlIUjVjR1VnSjF4dVhHNGdJSEpsZEhWeWJpQjBaa1Z5Y205eVUzUnlhVzVuS0Nkd2NtOXdaWEowZVNCY0lpY2dLeUIwWmtwVFQwNG9ibUZ0WlNrZ0t5QmtaWE5qY21sd2RHbHZiaUFySUhSbVNsTlBUaWgwZVhCbEtTd2dkbUZzZFdVc0lIWmhiSFZsVkhsd1pVNWhiV1VwWEc1OVhHNWNibVoxYm1OMGFXOXVJRlJtVUhKdmNHVnlkSGxVZVhCbFJYSnliM0lnS0hSNWNHVXNJSEJ5YjNCbGNuUjVMQ0JzWVdKbGJDd2dkbUZzZFdVc0lIWmhiSFZsVkhsd1pVNWhiV1VwSUh0Y2JpQWdhV1lnS0hSNWNHVXBJSHRjYmlBZ0lDQjJZV3gxWlZSNWNHVk9ZVzFsSUQwZ2RtRnNkV1ZVZVhCbFRtRnRaU0I4ZkNCblpYUldZV3gxWlZSNWNHVk9ZVzFsS0haaGJIVmxLVnh1SUNBZ0lIUm9hWE11YldWemMyRm5aU0E5SUhSbVVISnZjR1Z5ZEhsRmNuSnZjbE4wY21sdVp5aDBlWEJsTENCc1lXSmxiQ3dnY0hKdmNHVnlkSGtzSUhaaGJIVmxMQ0IyWVd4MVpWUjVjR1ZPWVcxbEtWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lIUm9hWE11YldWemMyRm5aU0E5SUNkVmJtVjRjR1ZqZEdWa0lIQnliM0JsY25SNUlGd2lKeUFySUhCeWIzQmxjblI1SUNzZ0oxd2lKMXh1SUNCOVhHNWNiaUFnWTJGd2RIVnlaVk4wWVdOclZISmhZMlVvZEdocGN5d2dWR1pVZVhCbFJYSnliM0lwWEc0Z0lIUm9hWE11WDE5c1lXSmxiQ0E5SUd4aFltVnNYRzRnSUhSb2FYTXVYMTl3Y205d1pYSjBlU0E5SUhCeWIzQmxjblI1WEc0Z0lIUm9hWE11WDE5MGVYQmxJRDBnZEhsd1pWeHVJQ0IwYUdsekxsOWZkbUZzZFdVZ1BTQjJZV3gxWlZ4dUlDQjBhR2x6TGw5ZmRtRnNkV1ZVZVhCbFRtRnRaU0E5SUhaaGJIVmxWSGx3WlU1aGJXVmNibjFjYmx4dVZHWlFjbTl3WlhKMGVWUjVjR1ZGY25KdmNpNXdjbTkwYjNSNWNHVWdQU0JQWW1wbFkzUXVZM0psWVhSbEtFVnljbTl5TG5CeWIzUnZkSGx3WlNsY2JsUm1VSEp2Y0dWeWRIbFVlWEJsUlhKeWIzSXVjSEp2ZEc5MGVYQmxMbU52Ym5OMGNuVmpkRzl5SUQwZ1ZHWlVlWEJsUlhKeWIzSmNibHh1Wm5WdVkzUnBiMjRnZEdaRGRYTjBiMjFGY25KdmNpQW9aWGh3WldOMFpXUXNJR0ZqZEhWaGJDa2dlMXh1SUNCeVpYUjFjbTRnYm1WM0lGUm1WSGx3WlVWeWNtOXlLR1Y0Y0dWamRHVmtMQ0I3ZlN3Z1lXTjBkV0ZzS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUIwWmxOMVlrVnljbTl5SUNobExDQndjbTl3WlhKMGVTd2diR0ZpWld3cElIdGNiaUFnTHk4Z2MzVmlJR05vYVd4a1AxeHVJQ0JwWmlBb1pTQnBibk4wWVc1alpXOW1JRlJtVUhKdmNHVnlkSGxVZVhCbFJYSnliM0lwSUh0Y2JpQWdJQ0J3Y205d1pYSjBlU0E5SUhCeWIzQmxjblI1SUNzZ0p5NG5JQ3NnWlM1ZlgzQnliM0JsY25SNVhHNWNiaUFnSUNCbElEMGdibVYzSUZSbVVISnZjR1Z5ZEhsVWVYQmxSWEp5YjNJb1hHNGdJQ0FnSUNCbExsOWZkSGx3WlN3Z2NISnZjR1Z5ZEhrc0lHVXVYMTlzWVdKbGJDd2daUzVmWDNaaGJIVmxMQ0JsTGw5ZmRtRnNkV1ZVZVhCbFRtRnRaVnh1SUNBZ0lDbGNibHh1SUNBdkx5QmphR2xzWkQ5Y2JpQWdmU0JsYkhObElHbG1JQ2hsSUdsdWMzUmhibU5sYjJZZ1ZHWlVlWEJsUlhKeWIzSXBJSHRjYmlBZ0lDQmxJRDBnYm1WM0lGUm1VSEp2Y0dWeWRIbFVlWEJsUlhKeWIzSW9YRzRnSUNBZ0lDQmxMbDlmZEhsd1pTd2djSEp2Y0dWeWRIa3NJR3hoWW1Wc0xDQmxMbDlmZG1Gc2RXVXNJR1V1WDE5MllXeDFaVlI1Y0dWT1lXMWxYRzRnSUNBZ0tWeHVJQ0I5WEc1Y2JpQWdZMkZ3ZEhWeVpWTjBZV05yVkhKaFkyVW9aU2xjYmlBZ2NtVjBkWEp1SUdWY2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0I3WEc0Z0lGUm1WSGx3WlVWeWNtOXlPaUJVWmxSNWNHVkZjbkp2Y2l4Y2JpQWdWR1pRY205d1pYSjBlVlI1Y0dWRmNuSnZjam9nVkdaUWNtOXdaWEowZVZSNWNHVkZjbkp2Y2l4Y2JpQWdkR1pEZFhOMGIyMUZjbkp2Y2pvZ2RHWkRkWE4wYjIxRmNuSnZjaXhjYmlBZ2RHWlRkV0pGY25KdmNqb2dkR1pUZFdKRmNuSnZjaXhjYmlBZ2RHWktVMDlPT2lCMFprcFRUMDRzWEc0Z0lHZGxkRlpoYkhWbFZIbHdaVTVoYldVNklHZGxkRlpoYkhWbFZIbHdaVTVoYldWY2JuMWNiaUlzSW5aaGNpQk9RVlJKVmtVZ1BTQnlaWEYxYVhKbEtDY3VMMjVoZEdsMlpTY3BYRzUyWVhJZ1JWSlNUMUpUSUQwZ2NtVnhkV2x5WlNnbkxpOWxjbkp2Y25NbktWeHVYRzVtZFc1amRHbHZiaUJmUW5WbVptVnlJQ2gyWVd4MVpTa2dlMXh1SUNCeVpYUjFjbTRnUW5WbVptVnlMbWx6UW5WbVptVnlLSFpoYkhWbEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCSVpYZ2dLSFpoYkhWbEtTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2R6ZEhKcGJtY25JQ1ltSUM5ZUtGc3dMVGxoTFdaZGV6SjlLU3NrTDJrdWRHVnpkQ2gyWVd4MVpTbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gweGxibWQwYUU0Z0tIUjVjR1VzSUd4bGJtZDBhQ2tnZTF4dUlDQjJZWElnYm1GdFpTQTlJSFI1Y0dVdWRHOUtVMDlPS0NsY2JseHVJQ0JtZFc1amRHbHZiaUJNWlc1bmRHZ2dLSFpoYkhWbEtTQjdYRzRnSUNBZ2FXWWdLQ0YwZVhCbEtIWmhiSFZsS1NrZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUNBZ2FXWWdLSFpoYkhWbExteGxibWQwYUNBOVBUMGdiR1Z1WjNSb0tTQnlaWFIxY200Z2RISjFaVnh1WEc0Z0lDQWdkR2h5YjNjZ1JWSlNUMUpUTG5SbVEzVnpkRzl0UlhKeWIzSW9ibUZ0WlNBcklDY29UR1Z1WjNSb09pQW5JQ3NnYkdWdVozUm9JQ3NnSnlrbkxDQnVZVzFsSUNzZ0p5aE1aVzVuZEdnNklDY2dLeUIyWVd4MVpTNXNaVzVuZEdnZ0t5QW5LU2NwWEc0Z0lIMWNiaUFnVEdWdVozUm9MblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2dwSUhzZ2NtVjBkWEp1SUc1aGJXVWdmVnh1WEc0Z0lISmxkSFZ5YmlCTVpXNW5kR2hjYm4xY2JseHVkbUZ5SUY5QmNuSmhlVTRnUFNCZlRHVnVaM1JvVGk1aWFXNWtLRzUxYkd3c0lFNUJWRWxXUlM1QmNuSmhlU2xjYm5aaGNpQmZRblZtWm1WeVRpQTlJRjlNWlc1bmRHaE9MbUpwYm1Rb2JuVnNiQ3dnWDBKMVptWmxjaWxjYm5aaGNpQmZTR1Y0VGlBOUlGOU1aVzVuZEdoT0xtSnBibVFvYm5Wc2JDd2dTR1Y0S1Z4dWRtRnlJRjlUZEhKcGJtZE9JRDBnWDB4bGJtZDBhRTR1WW1sdVpDaHVkV3hzTENCT1FWUkpWa1V1VTNSeWFXNW5LVnh1WEc1bWRXNWpkR2x2YmlCU1lXNW5aU0FvWVN3Z1lpd2daaWtnZTF4dUlDQm1JRDBnWmlCOGZDQk9RVlJKVmtVdVRuVnRZbVZ5WEc0Z0lHWjFibU4wYVc5dUlGOXlZVzVuWlNBb2RtRnNkV1VzSUhOMGNtbGpkQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1LSFpoYkhWbExDQnpkSEpwWTNRcElDWW1JQ2gyWVd4MVpTQStJR0VwSUNZbUlDaDJZV3gxWlNBOElHSXBYRzRnSUgxY2JpQWdYM0poYm1kbExuUnZTbE5QVGlBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQnlaWFIxY200Z1lDUjdaaTUwYjBwVFQwNG9LWDBnWW1WMGQyVmxiaUJiSkh0aGZTd2dKSHRpZlYxZ1hHNGdJSDFjYmlBZ2NtVjBkWEp1SUY5eVlXNW5aVnh1ZlZ4dVhHNTJZWElnU1U1VU5UTmZUVUZZSUQwZ1RXRjBhQzV3YjNjb01pd2dOVE1wSUMwZ01WeHVYRzVtZFc1amRHbHZiaUJHYVc1cGRHVWdLSFpoYkhWbEtTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2R1ZFcxaVpYSW5JQ1ltSUdselJtbHVhWFJsS0haaGJIVmxLVnh1ZlZ4dVpuVnVZM1JwYjI0Z1NXNTBPQ0FvZG1Gc2RXVXBJSHNnY21WMGRYSnVJQ2dvZG1Gc2RXVWdQRHdnTWpRcElENCtJREkwS1NBOVBUMGdkbUZzZFdVZ2ZWeHVablZ1WTNScGIyNGdTVzUwTVRZZ0tIWmhiSFZsS1NCN0lISmxkSFZ5YmlBb0tIWmhiSFZsSUR3OElERTJLU0ErUGlBeE5pa2dQVDA5SUhaaGJIVmxJSDFjYm1aMWJtTjBhVzl1SUVsdWRETXlJQ2gyWVd4MVpTa2dleUJ5WlhSMWNtNGdLSFpoYkhWbElId2dNQ2tnUFQwOUlIWmhiSFZsSUgxY2JtWjFibU4wYVc5dUlFbHVkRFV6SUNoMllXeDFaU2tnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUhaaGJIVmxJRDA5UFNBbmJuVnRZbVZ5SnlBbUpseHVJQ0FnSUhaaGJIVmxJRDQ5SUMxSlRsUTFNMTlOUVZnZ0ppWmNiaUFnSUNCMllXeDFaU0E4UFNCSlRsUTFNMTlOUVZnZ0ppWmNiaUFnSUNCTllYUm9MbVpzYjI5eUtIWmhiSFZsS1NBOVBUMGdkbUZzZFdWY2JuMWNibVoxYm1OMGFXOXVJRlZKYm5RNElDaDJZV3gxWlNrZ2V5QnlaWFIxY200Z0tIWmhiSFZsSUNZZ01IaG1aaWtnUFQwOUlIWmhiSFZsSUgxY2JtWjFibU4wYVc5dUlGVkpiblF4TmlBb2RtRnNkV1VwSUhzZ2NtVjBkWEp1SUNoMllXeDFaU0FtSURCNFptWm1aaWtnUFQwOUlIWmhiSFZsSUgxY2JtWjFibU4wYVc5dUlGVkpiblF6TWlBb2RtRnNkV1VwSUhzZ2NtVjBkWEp1SUNoMllXeDFaU0ErUGo0Z01Da2dQVDA5SUhaaGJIVmxJSDFjYm1aMWJtTjBhVzl1SUZWSmJuUTFNeUFvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUhSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI1MWJXSmxjaWNnSmlaY2JpQWdJQ0IyWVd4MVpTQStQU0F3SUNZbVhHNGdJQ0FnZG1Gc2RXVWdQRDBnU1U1VU5UTmZUVUZZSUNZbVhHNGdJQ0FnVFdGMGFDNW1iRzl2Y2loMllXeDFaU2tnUFQwOUlIWmhiSFZsWEc1OVhHNWNiblpoY2lCMGVYQmxjeUE5SUh0Y2JpQWdRWEp5WVhsT09pQmZRWEp5WVhsT0xGeHVJQ0JDZFdabVpYSTZJRjlDZFdabVpYSXNYRzRnSUVKMVptWmxjazQ2SUY5Q2RXWm1aWEpPTEZ4dUlDQkdhVzVwZEdVNklFWnBibWwwWlN4Y2JpQWdTR1Y0T2lCSVpYZ3NYRzRnSUVobGVFNDZJRjlJWlhoT0xGeHVJQ0JKYm5RNE9pQkpiblE0TEZ4dUlDQkpiblF4TmpvZ1NXNTBNVFlzWEc0Z0lFbHVkRE15T2lCSmJuUXpNaXhjYmlBZ1NXNTBOVE02SUVsdWREVXpMRnh1SUNCU1lXNW5aVG9nVW1GdVoyVXNYRzRnSUZOMGNtbHVaMDQ2SUY5VGRISnBibWRPTEZ4dUlDQlZTVzUwT0RvZ1ZVbHVkRGdzWEc0Z0lGVkpiblF4TmpvZ1ZVbHVkREUyTEZ4dUlDQlZTVzUwTXpJNklGVkpiblF6TWl4Y2JpQWdWVWx1ZERVek9pQlZTVzUwTlROY2JuMWNibHh1Wm05eUlDaDJZWElnZEhsd1pVNWhiV1VnYVc0Z2RIbHdaWE1wSUh0Y2JpQWdkSGx3WlhOYmRIbHdaVTVoYldWZExuUnZTbE5QVGlBOUlHWjFibU4wYVc5dUlDaDBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIUmNiaUFnZlM1aWFXNWtLRzUxYkd3c0lIUjVjR1ZPWVcxbEtWeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUhSNWNHVnpYRzRpTENKMllYSWdSVkpTVDFKVElEMGdjbVZ4ZFdseVpTZ25MaTlsY25KdmNuTW5LVnh1ZG1GeUlFNUJWRWxXUlNBOUlISmxjWFZwY21Vb0p5NHZibUYwYVhabEp5bGNibHh1THk4Z2MyaHZjblF0YUdGdVpGeHVkbUZ5SUhSbVNsTlBUaUE5SUVWU1VrOVNVeTUwWmtwVFQwNWNiblpoY2lCVVpsUjVjR1ZGY25KdmNpQTlJRVZTVWs5U1V5NVVabFI1Y0dWRmNuSnZjbHh1ZG1GeUlGUm1VSEp2Y0dWeWRIbFVlWEJsUlhKeWIzSWdQU0JGVWxKUFVsTXVWR1pRY205d1pYSjBlVlI1Y0dWRmNuSnZjbHh1ZG1GeUlIUm1VM1ZpUlhKeWIzSWdQU0JGVWxKUFVsTXVkR1pUZFdKRmNuSnZjbHh1ZG1GeUlHZGxkRlpoYkhWbFZIbHdaVTVoYldVZ1BTQkZVbEpQVWxNdVoyVjBWbUZzZFdWVWVYQmxUbUZ0WlZ4dVhHNTJZWElnVkZsUVJWTWdQU0I3WEc0Z0lHRnljbUY1VDJZNklHWjFibU4wYVc5dUlHRnljbUY1VDJZZ0tIUjVjR1VzSUc5d2RHbHZibk1wSUh0Y2JpQWdJQ0IwZVhCbElEMGdZMjl0Y0dsc1pTaDBlWEJsS1Z4dUlDQWdJRzl3ZEdsdmJuTWdQU0J2Y0hScGIyNXpJSHg4SUh0OVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZllYSnlZWGxQWmlBb1lYSnlZWGtzSUhOMGNtbGpkQ2tnZTF4dUlDQWdJQ0FnYVdZZ0tDRk9RVlJKVmtVdVFYSnlZWGtvWVhKeVlYa3BLU0J5WlhSMWNtNGdabUZzYzJWY2JpQWdJQ0FnSUdsbUlDaE9RVlJKVmtVdVRtbHNLR0Z5Y21GNUtTa2djbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0JwWmlBb2IzQjBhVzl1Y3k1dGFXNU1aVzVuZEdnZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCaGNuSmhlUzVzWlc1bmRHZ2dQQ0J2Y0hScGIyNXpMbTFwYmt4bGJtZDBhQ2tnY21WMGRYSnVJR1poYkhObFhHNGdJQ0FnSUNCcFppQW9iM0IwYVc5dWN5NXRZWGhNWlc1bmRHZ2dJVDA5SUhWdVpHVm1hVzVsWkNBbUppQmhjbkpoZVM1c1pXNW5kR2dnUGlCdmNIUnBiMjV6TG0xaGVFeGxibWQwYUNrZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUNBZ0lDQnBaaUFvYjNCMGFXOXVjeTVzWlc1bmRHZ2dJVDA5SUhWdVpHVm1hVzVsWkNBbUppQmhjbkpoZVM1c1pXNW5kR2dnSVQwOUlHOXdkR2x2Ym5NdWJHVnVaM1JvS1NCeVpYUjFjbTRnWm1Gc2MyVmNibHh1SUNBZ0lDQWdjbVYwZFhKdUlHRnljbUY1TG1WMlpYSjVLR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2dhU2tnZTF4dUlDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUIwZVhCbFptOXlZMlVvZEhsd1pTd2dkbUZzZFdVc0lITjBjbWxqZENsY2JpQWdJQ0FnSUNBZ2ZTQmpZWFJqYUNBb1pTa2dlMXh1SUNBZ0lDQWdJQ0FnSUhSb2NtOTNJSFJtVTNWaVJYSnliM0lvWlN3Z2FTbGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmU2xjYmlBZ0lDQjlYRzRnSUNBZ1gyRnljbUY1VDJZdWRHOUtVMDlPSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdkbUZ5SUhOMGNpQTlJQ2RiSnlBcklIUm1TbE5QVGloMGVYQmxLU0FySUNkZEoxeHVJQ0FnSUNBZ2FXWWdLRzl3ZEdsdmJuTXViR1Z1WjNSb0lDRTlQU0IxYm1SbFptbHVaV1FwSUh0Y2JpQWdJQ0FnSUNBZ2MzUnlJQ3M5SUNkN0p5QXJJRzl3ZEdsdmJuTXViR1Z1WjNSb0lDc2dKMzBuWEc0Z0lDQWdJQ0I5SUdWc2MyVWdhV1lnS0c5d2RHbHZibk11YldsdVRHVnVaM1JvSUNFOVBTQjFibVJsWm1sdVpXUWdmSHdnYjNCMGFXOXVjeTV0WVhoTVpXNW5kR2dnSVQwOUlIVnVaR1ZtYVc1bFpDa2dlMXh1SUNBZ0lDQWdJQ0J6ZEhJZ0t6MGdKM3NuSUN0Y2JpQWdJQ0FnSUNBZ0lDQW9iM0IwYVc5dWN5NXRhVzVNWlc1bmRHZ2dQVDA5SUhWdVpHVm1hVzVsWkNBL0lEQWdPaUJ2Y0hScGIyNXpMbTFwYmt4bGJtZDBhQ2tnS3lBbkxDY2dLMXh1SUNBZ0lDQWdJQ0FnSUNodmNIUnBiMjV6TG0xaGVFeGxibWQwYUNBOVBUMGdkVzVrWldacGJtVmtJRDhnU1c1bWFXNXBkSGtnT2lCdmNIUnBiMjV6TG0xaGVFeGxibWQwYUNrZ0t5QW5mU2RjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJSEpsZEhWeWJpQnpkSEpjYmlBZ0lDQjlYRzVjYmlBZ0lDQnlaWFIxY200Z1gyRnljbUY1VDJaY2JpQWdmU3hjYmx4dUlDQnRZWGxpWlRvZ1puVnVZM1JwYjI0Z2JXRjVZbVVnS0hSNWNHVXBJSHRjYmlBZ0lDQjBlWEJsSUQwZ1kyOXRjR2xzWlNoMGVYQmxLVnh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMjFoZVdKbElDaDJZV3gxWlN3Z2MzUnlhV04wS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnVGtGVVNWWkZMazVwYkNoMllXeDFaU2tnZkh3Z2RIbHdaU2gyWVd4MVpTd2djM1J5YVdOMExDQnRZWGxpWlNsY2JpQWdJQ0I5WEc0Z0lDQWdYMjFoZVdKbExuUnZTbE5QVGlBOUlHWjFibU4wYVc5dUlDZ3BJSHNnY21WMGRYSnVJQ2MvSnlBcklIUm1TbE5QVGloMGVYQmxLU0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdYMjFoZVdKbFhHNGdJSDBzWEc1Y2JpQWdiV0Z3T2lCbWRXNWpkR2x2YmlCdFlYQWdLSEJ5YjNCbGNuUjVWSGx3WlN3Z2NISnZjR1Z5ZEhsTFpYbFVlWEJsS1NCN1hHNGdJQ0FnY0hKdmNHVnlkSGxVZVhCbElEMGdZMjl0Y0dsc1pTaHdjbTl3WlhKMGVWUjVjR1VwWEc0Z0lDQWdhV1lnS0hCeWIzQmxjblI1UzJWNVZIbHdaU2tnY0hKdmNHVnlkSGxMWlhsVWVYQmxJRDBnWTI5dGNHbHNaU2h3Y205d1pYSjBlVXRsZVZSNWNHVXBYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZiV0Z3SUNoMllXeDFaU3dnYzNSeWFXTjBLU0I3WEc0Z0lDQWdJQ0JwWmlBb0lVNUJWRWxXUlM1UFltcGxZM1FvZG1Gc2RXVXBLU0J5WlhSMWNtNGdabUZzYzJWY2JpQWdJQ0FnSUdsbUlDaE9RVlJKVmtVdVRtbHNLSFpoYkhWbEtTa2djbVYwZFhKdUlHWmhiSE5sWEc1Y2JpQWdJQ0FnSUdadmNpQW9kbUZ5SUhCeWIzQmxjblI1VG1GdFpTQnBiaUIyWVd4MVpTa2dlMXh1SUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJR2xtSUNod2NtOXdaWEowZVV0bGVWUjVjR1VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFI1Y0dWbWIzSmpaU2h3Y205d1pYSjBlVXRsZVZSNWNHVXNJSEJ5YjNCbGNuUjVUbUZ0WlN3Z2MzUnlhV04wS1Z4dUlDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU0JqWVhSamFDQW9aU2tnZTF4dUlDQWdJQ0FnSUNBZ0lIUm9jbTkzSUhSbVUzVmlSWEp5YjNJb1pTd2djSEp2Y0dWeWRIbE9ZVzFsTENBbmEyVjVKeWxjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lIUnllU0I3WEc0Z0lDQWdJQ0FnSUNBZ2RtRnlJSEJ5YjNCbGNuUjVWbUZzZFdVZ1BTQjJZV3gxWlZ0d2NtOXdaWEowZVU1aGJXVmRYRzRnSUNBZ0lDQWdJQ0FnZEhsd1pXWnZjbU5sS0hCeWIzQmxjblI1Vkhsd1pTd2djSEp2Y0dWeWRIbFdZV3gxWlN3Z2MzUnlhV04wS1Z4dUlDQWdJQ0FnSUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dkR1pUZFdKRmNuSnZjaWhsTENCd2NtOXdaWEowZVU1aGJXVXBYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnY21WMGRYSnVJSFJ5ZFdWY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JwWmlBb2NISnZjR1Z5ZEhsTFpYbFVlWEJsS1NCN1hHNGdJQ0FnSUNCZmJXRndMblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUNkN0p5QXJJSFJtU2xOUFRpaHdjbTl3WlhKMGVVdGxlVlI1Y0dVcElDc2dKem9nSnlBcklIUm1TbE5QVGlod2NtOXdaWEowZVZSNWNHVXBJQ3NnSjMwblhHNGdJQ0FnSUNCOVhHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJRjl0WVhBdWRHOUtVMDlPSUQwZ1puVnVZM1JwYjI0Z0tDa2dleUJ5WlhSMWNtNGdKM3NuSUNzZ2RHWktVMDlPS0hCeWIzQmxjblI1Vkhsd1pTa2dLeUFuZlNjZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUJmYldGd1hHNGdJSDBzWEc1Y2JpQWdiMkpxWldOME9pQm1kVzVqZEdsdmJpQnZZbXBsWTNRZ0tIVnVZMjl0Y0dsc1pXUXBJSHRjYmlBZ0lDQjJZWElnZEhsd1pTQTlJSHQ5WEc1Y2JpQWdJQ0JtYjNJZ0tIWmhjaUIwZVhCbFVISnZjR1Z5ZEhsT1lXMWxJR2x1SUhWdVkyOXRjR2xzWldRcElIdGNiaUFnSUNBZ0lIUjVjR1ZiZEhsd1pWQnliM0JsY25SNVRtRnRaVjBnUFNCamIyMXdhV3hsS0hWdVkyOXRjR2xzWldSYmRIbHdaVkJ5YjNCbGNuUjVUbUZ0WlYwcFhHNGdJQ0FnZlZ4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDI5aWFtVmpkQ0FvZG1Gc2RXVXNJSE4wY21samRDa2dlMXh1SUNBZ0lDQWdhV1lnS0NGT1FWUkpWa1V1VDJKcVpXTjBLSFpoYkhWbEtTa2djbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0JwWmlBb1RrRlVTVlpGTGs1cGJDaDJZV3gxWlNrcElISmxkSFZ5YmlCbVlXeHpaVnh1WEc0Z0lDQWdJQ0IyWVhJZ2NISnZjR1Z5ZEhsT1lXMWxYRzVjYmlBZ0lDQWdJSFJ5ZVNCN1hHNGdJQ0FnSUNBZ0lHWnZjaUFvY0hKdmNHVnlkSGxPWVcxbElHbHVJSFI1Y0dVcElIdGNiaUFnSUNBZ0lDQWdJQ0IyWVhJZ2NISnZjR1Z5ZEhsVWVYQmxJRDBnZEhsd1pWdHdjbTl3WlhKMGVVNWhiV1ZkWEc0Z0lDQWdJQ0FnSUNBZ2RtRnlJSEJ5YjNCbGNuUjVWbUZzZFdVZ1BTQjJZV3gxWlZ0d2NtOXdaWEowZVU1aGJXVmRYRzVjYmlBZ0lDQWdJQ0FnSUNCMGVYQmxabTl5WTJVb2NISnZjR1Z5ZEhsVWVYQmxMQ0J3Y205d1pYSjBlVlpoYkhWbExDQnpkSEpwWTNRcFhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lIMGdZMkYwWTJnZ0tHVXBJSHRjYmlBZ0lDQWdJQ0FnZEdoeWIzY2dkR1pUZFdKRmNuSnZjaWhsTENCd2NtOXdaWEowZVU1aGJXVXBYRzRnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJR2xtSUNoemRISnBZM1FwSUh0Y2JpQWdJQ0FnSUNBZ1ptOXlJQ2h3Y205d1pYSjBlVTVoYldVZ2FXNGdkbUZzZFdVcElIdGNiaUFnSUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVnR3Y205d1pYSjBlVTVoYldWZEtTQmpiMjUwYVc1MVpWeHVYRzRnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUZSbVVISnZjR1Z5ZEhsVWVYQmxSWEp5YjNJb2RXNWtaV1pwYm1Wa0xDQndjbTl3WlhKMGVVNWhiV1VwWEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2NtVjBkWEp1SUhSeWRXVmNiaUFnSUNCOVhHNGdJQ0FnWDI5aWFtVmpkQzUwYjBwVFQwNGdQU0JtZFc1amRHbHZiaUFvS1NCN0lISmxkSFZ5YmlCMFprcFRUMDRvZEhsd1pTa2dmVnh1WEc0Z0lDQWdjbVYwZFhKdUlGOXZZbXBsWTNSY2JpQWdmU3hjYmx4dUlDQmhibmxQWmpvZ1puVnVZM1JwYjI0Z1lXNTVUMllnS0NrZ2UxeHVJQ0FnSUhaaGNpQjBlWEJsY3lBOUlGdGRMbk5zYVdObExtTmhiR3dvWVhKbmRXMWxiblJ6S1M1dFlYQW9ZMjl0Y0dsc1pTbGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWhibmxQWmlBb2RtRnNkV1VzSUhOMGNtbGpkQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJSFI1Y0dWekxuTnZiV1VvWm5WdVkzUnBiMjRnS0hSNWNHVXBJSHRjYmlBZ0lDQWdJQ0FnZEhKNUlIdGNiaUFnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdkSGx3WldadmNtTmxLSFI1Y0dVc0lIWmhiSFZsTENCemRISnBZM1FwWEc0Z0lDQWdJQ0FnSUgwZ1kyRjBZMmdnS0dVcElIdGNiaUFnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdabUZzYzJWY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZTbGNiaUFnSUNCOVhHNGdJQ0FnWDJGdWVVOW1MblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2dwSUhzZ2NtVjBkWEp1SUhSNWNHVnpMbTFoY0NoMFprcFRUMDRwTG1wdmFXNG9KM3duS1NCOVhHNWNiaUFnSUNCeVpYUjFjbTRnWDJGdWVVOW1YRzRnSUgwc1hHNWNiaUFnWVd4c1QyWTZJR1oxYm1OMGFXOXVJR0ZzYkU5bUlDZ3BJSHRjYmlBZ0lDQjJZWElnZEhsd1pYTWdQU0JiWFM1emJHbGpaUzVqWVd4c0tHRnlaM1Z0Wlc1MGN5a3ViV0Z3S0dOdmJYQnBiR1VwWEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWVd4c1QyWWdLSFpoYkhWbExDQnpkSEpwWTNRcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCMGVYQmxjeTVsZG1WeWVTaG1kVzVqZEdsdmJpQW9kSGx3WlNrZ2UxeHVJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGVYQmxabTl5WTJVb2RIbHdaU3dnZG1Gc2RXVXNJSE4wY21samRDbGNiaUFnSUNBZ0lDQWdmU0JqWVhSamFDQW9aU2tnZTF4dUlDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbVlXeHpaVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0I5S1Z4dUlDQWdJSDFjYmlBZ0lDQmZZV3hzVDJZdWRHOUtVMDlPSUQwZ1puVnVZM1JwYjI0Z0tDa2dleUJ5WlhSMWNtNGdkSGx3WlhNdWJXRndLSFJtU2xOUFRpa3VhbTlwYmlnbklDWWdKeWtnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJRjloYkd4UFpseHVJQ0I5TEZ4dVhHNGdJSEYxWVdOcmMweHBhMlU2SUdaMWJtTjBhVzl1SUhGMVlXTnJjMHhwYTJVZ0tIUjVjR1VwSUh0Y2JpQWdJQ0JtZFc1amRHbHZiaUJmY1hWaFkydHpUR2xyWlNBb2RtRnNkV1VwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUIwZVhCbElEMDlQU0JuWlhSV1lXeDFaVlI1Y0dWT1lXMWxLSFpoYkhWbEtWeHVJQ0FnSUgxY2JpQWdJQ0JmY1hWaFkydHpUR2xyWlM1MGIwcFRUMDRnUFNCbWRXNWpkR2x2YmlBb0tTQjdJSEpsZEhWeWJpQjBlWEJsSUgxY2JseHVJQ0FnSUhKbGRIVnliaUJmY1hWaFkydHpUR2xyWlZ4dUlDQjlMRnh1WEc0Z0lIUjFjR3hsT2lCbWRXNWpkR2x2YmlCMGRYQnNaU0FvS1NCN1hHNGdJQ0FnZG1GeUlIUjVjR1Z6SUQwZ1cxMHVjMnhwWTJVdVkyRnNiQ2hoY21kMWJXVnVkSE1wTG0xaGNDaGpiMjF3YVd4bEtWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzUjFjR3hsSUNoMllXeDFaWE1zSUhOMGNtbGpkQ2tnZTF4dUlDQWdJQ0FnYVdZZ0tFNUJWRWxXUlM1T2FXd29kbUZzZFdWektTa2djbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0JwWmlBb1RrRlVTVlpGTGs1cGJDaDJZV3gxWlhNdWJHVnVaM1JvS1NrZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUNBZ0lDQnBaaUFvYzNSeWFXTjBJQ1ltSUNoMllXeDFaWE11YkdWdVozUm9JQ0U5UFNCMGVYQmxjeTVzWlc1bmRHZ3BLU0J5WlhSMWNtNGdabUZzYzJWY2JseHVJQ0FnSUNBZ2NtVjBkWEp1SUhSNWNHVnpMbVYyWlhKNUtHWjFibU4wYVc5dUlDaDBlWEJsTENCcEtTQjdYRzRnSUNBZ0lDQWdJSFJ5ZVNCN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIUjVjR1ZtYjNKalpTaDBlWEJsTENCMllXeDFaWE5iYVYwc0lITjBjbWxqZENsY2JpQWdJQ0FnSUNBZ2ZTQmpZWFJqYUNBb1pTa2dlMXh1SUNBZ0lDQWdJQ0FnSUhSb2NtOTNJSFJtVTNWaVJYSnliM0lvWlN3Z2FTbGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmU2xjYmlBZ0lDQjlYRzRnSUNBZ1gzUjFjR3hsTG5SdlNsTlBUaUE5SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlDY29KeUFySUhSNWNHVnpMbTFoY0NoMFprcFRUMDRwTG1wdmFXNG9KeXdnSnlrZ0t5QW5LU2NnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJRjkwZFhCc1pWeHVJQ0I5TEZ4dVhHNGdJSFpoYkhWbE9pQm1kVzVqZEdsdmJpQjJZV3gxWlNBb1pYaHdaV04wWldRcElIdGNiaUFnSUNCbWRXNWpkR2x2YmlCZmRtRnNkV1VnS0dGamRIVmhiQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR0ZqZEhWaGJDQTlQVDBnWlhod1pXTjBaV1JjYmlBZ0lDQjlYRzRnSUNBZ1gzWmhiSFZsTG5SdlNsTlBUaUE5SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlHVjRjR1ZqZEdWa0lIMWNibHh1SUNBZ0lISmxkSFZ5YmlCZmRtRnNkV1ZjYmlBZ2ZWeHVmVnh1WEc0dkx5QlVUMFJQT2lCa1pYQnlaV05oZEdWY2JsUlpVRVZUTG05dVpVOW1JRDBnVkZsUVJWTXVZVzU1VDJaY2JseHVablZ1WTNScGIyNGdZMjl0Y0dsc1pTQW9kSGx3WlNrZ2UxeHVJQ0JwWmlBb1RrRlVTVlpGTGxOMGNtbHVaeWgwZVhCbEtTa2dlMXh1SUNBZ0lHbG1JQ2gwZVhCbFd6QmRJRDA5UFNBblB5Y3BJSEpsZEhWeWJpQlVXVkJGVXk1dFlYbGlaU2gwZVhCbExuTnNhV05sS0RFcEtWeHVYRzRnSUNBZ2NtVjBkWEp1SUU1QlZFbFdSVnQwZVhCbFhTQjhmQ0JVV1ZCRlV5NXhkV0ZqYTNOTWFXdGxLSFI1Y0dVcFhHNGdJSDBnWld4elpTQnBaaUFvZEhsd1pTQW1KaUJPUVZSSlZrVXVUMkpxWldOMEtIUjVjR1VwS1NCN1hHNGdJQ0FnYVdZZ0tFNUJWRWxXUlM1QmNuSmhlU2gwZVhCbEtTa2dlMXh1SUNBZ0lDQWdhV1lnS0hSNWNHVXViR1Z1WjNSb0lDRTlQU0F4S1NCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtDZEZlSEJsWTNSbFpDQmpiMjF3YVd4bEtDa2djR0Z5WVcxbGRHVnlJRzltSUhSNWNHVWdRWEp5WVhrZ2IyWWdiR1Z1WjNSb0lERW5LVnh1SUNBZ0lDQWdjbVYwZFhKdUlGUlpVRVZUTG1GeWNtRjVUMllvZEhsd1pWc3dYU2xjYmlBZ0lDQjlYRzVjYmlBZ0lDQnlaWFIxY200Z1ZGbFFSVk11YjJKcVpXTjBLSFI1Y0dVcFhHNGdJSDBnWld4elpTQnBaaUFvVGtGVVNWWkZMa1oxYm1OMGFXOXVLSFI1Y0dVcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSNWNHVmNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQlVXVkJGVXk1MllXeDFaU2gwZVhCbEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCMGVYQmxabTl5WTJVZ0tIUjVjR1VzSUhaaGJIVmxMQ0J6ZEhKcFkzUXNJSE4xY25KdloyRjBaU2tnZTF4dUlDQnBaaUFvVGtGVVNWWkZMa1oxYm1OMGFXOXVLSFI1Y0dVcEtTQjdYRzRnSUNBZ2FXWWdLSFI1Y0dVb2RtRnNkV1VzSUhOMGNtbGpkQ2twSUhKbGRIVnliaUIwY25WbFhHNWNiaUFnSUNCMGFISnZkeUJ1WlhjZ1ZHWlVlWEJsUlhKeWIzSW9jM1Z5Y205bllYUmxJSHg4SUhSNWNHVXNJSFpoYkhWbEtWeHVJQ0I5WEc1Y2JpQWdMeThnU2tsVVhHNGdJSEpsZEhWeWJpQjBlWEJsWm05eVkyVW9ZMjl0Y0dsc1pTaDBlWEJsS1N3Z2RtRnNkV1VzSUhOMGNtbGpkQ2xjYm4xY2JseHVMeThnWVhOemFXZHVJSFI1Y0dWeklIUnZJSFI1Y0dWbWIzSmpaU0JtZFc1amRHbHZibHh1Wm05eUlDaDJZWElnZEhsd1pVNWhiV1VnYVc0Z1RrRlVTVlpGS1NCN1hHNGdJSFI1Y0dWbWIzSmpaVnQwZVhCbFRtRnRaVjBnUFNCT1FWUkpWa1ZiZEhsd1pVNWhiV1ZkWEc1OVhHNWNibVp2Y2lBb2RIbHdaVTVoYldVZ2FXNGdWRmxRUlZNcElIdGNiaUFnZEhsd1pXWnZjbU5sVzNSNWNHVk9ZVzFsWFNBOUlGUlpVRVZUVzNSNWNHVk9ZVzFsWFZ4dWZWeHVYRzUyWVhJZ1JWaFVVa0VnUFNCeVpYRjFhWEpsS0NjdUwyVjRkSEpoSnlsY2JtWnZjaUFvZEhsd1pVNWhiV1VnYVc0Z1JWaFVVa0VwSUh0Y2JpQWdkSGx3WldadmNtTmxXM1I1Y0dWT1lXMWxYU0E5SUVWWVZGSkJXM1I1Y0dWT1lXMWxYVnh1ZlZ4dVhHNTBlWEJsWm05eVkyVXVZMjl0Y0dsc1pTQTlJR052YlhCcGJHVmNiblI1Y0dWbWIzSmpaUzVVWmxSNWNHVkZjbkp2Y2lBOUlGUm1WSGx3WlVWeWNtOXlYRzUwZVhCbFptOXlZMlV1VkdaUWNtOXdaWEowZVZSNWNHVkZjbkp2Y2lBOUlGUm1VSEp2Y0dWeWRIbFVlWEJsUlhKeWIzSmNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0IwZVhCbFptOXlZMlZjYmlJc0luWmhjaUIwZVhCbGN5QTlJSHRjYmlBZ1FYSnlZWGs2SUdaMWJtTjBhVzl1SUNoMllXeDFaU2tnZXlCeVpYUjFjbTRnZG1Gc2RXVWdJVDA5SUc1MWJHd2dKaVlnZG1Gc2RXVWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQjJZV3gxWlM1amIyNXpkSEoxWTNSdmNpQTlQVDBnUVhKeVlYa2dmU3hjYmlBZ1FtOXZiR1ZoYmpvZ1puVnVZM1JwYjI0Z0tIWmhiSFZsS1NCN0lISmxkSFZ5YmlCMGVYQmxiMllnZG1Gc2RXVWdQVDA5SUNkaWIyOXNaV0Z1SnlCOUxGeHVJQ0JHZFc1amRHbHZiam9nWm5WdVkzUnBiMjRnS0haaGJIVmxLU0I3SUhKbGRIVnliaUIwZVhCbGIyWWdkbUZzZFdVZ1BUMDlJQ2RtZFc1amRHbHZiaWNnZlN4Y2JpQWdUbWxzT2lCbWRXNWpkR2x2YmlBb2RtRnNkV1VwSUhzZ2NtVjBkWEp1SUhaaGJIVmxJRDA5UFNCMWJtUmxabWx1WldRZ2ZId2dkbUZzZFdVZ1BUMDlJRzUxYkd3Z2ZTeGNiaUFnVG5WdFltVnlPaUJtZFc1amRHbHZiaUFvZG1Gc2RXVXBJSHNnY21WMGRYSnVJSFI1Y0dWdlppQjJZV3gxWlNBOVBUMGdKMjUxYldKbGNpY2dmU3hjYmlBZ1QySnFaV04wT2lCbWRXNWpkR2x2YmlBb2RtRnNkV1VwSUhzZ2NtVjBkWEp1SUhSNWNHVnZaaUIyWVd4MVpTQTlQVDBnSjI5aWFtVmpkQ2NnZlN4Y2JpQWdVM1J5YVc1bk9pQm1kVzVqZEdsdmJpQW9kbUZzZFdVcElIc2djbVYwZFhKdUlIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0ozTjBjbWx1WnljZ2ZTeGNiaUFnSnljNklHWjFibU4wYVc5dUlDZ3BJSHNnY21WMGRYSnVJSFJ5ZFdVZ2ZWeHVmVnh1WEc0dkx5QlVUMFJQT2lCa1pYQnlaV05oZEdWY2JuUjVjR1Z6TGs1MWJHd2dQU0IwZVhCbGN5NU9hV3hjYmx4dVptOXlJQ2gyWVhJZ2RIbHdaVTVoYldVZ2FXNGdkSGx3WlhNcElIdGNiaUFnZEhsd1pYTmJkSGx3WlU1aGJXVmRMblJ2U2xOUFRpQTlJR1oxYm1OMGFXOXVJQ2gwS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFJjYmlBZ2ZTNWlhVzVrS0c1MWJHd3NJSFI1Y0dWT1lXMWxLVnh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlIUjVjR1Z6WEc0aUxDSW5kWE5sSUhOMGNtbGpkQ2RjYmx4dUx5b3FYRzRnS2lCU1pYUjFjbTV6SUdFZ2JtVjNJRlZwYm5RNFFYSnlZWGtnWTNKbFlYUmxaQ0JpZVNCamIyNWpZWFJsYm1GMGFXNW5JSFJvWlNCd1lYTnpaV1FnUVhKeVlYbE1hV3RsYzF4dUlDcGNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYazhRWEp5WVhsTWFXdGxQRzUxYldKbGNqNCtmU0JoY25KaGVYTmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiYkdWdVozUm9YVnh1SUNvdlhHNW1kVzVqZEdsdmJpQmpiMjVqWVhRZ0tHRnljbUY1Y3l3Z2JHVnVaM1JvS1NCN1hHNGdJR2xtSUNnaGJHVnVaM1JvS1NCN1hHNGdJQ0FnYkdWdVozUm9JRDBnWVhKeVlYbHpMbkpsWkhWalpTZ29ZV05qTENCamRYSnlLU0E5UGlCaFkyTWdLeUJqZFhKeUxteGxibWQwYUN3Z01DbGNiaUFnZlZ4dVhHNGdJR052Ym5OMElHOTFkSEIxZENBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0d4bGJtZDBhQ2xjYmlBZ2JHVjBJRzltWm5ObGRDQTlJREJjYmx4dUlDQm1iM0lnS0dOdmJuTjBJR0Z5Y2lCdlppQmhjbkpoZVhNcElIdGNiaUFnSUNCdmRYUndkWFF1YzJWMEtHRnljaXdnYjJabWMyVjBLVnh1SUNBZ0lHOW1abk5sZENBclBTQmhjbkl1YkdWdVozUm9YRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdiM1YwY0hWMFhHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWTI5dVkyRjBYRzRpTENJbmRYTmxJSE4wY21samRDZGNibHh1THlvcVhHNGdLaUJTWlhSMWNtNXpJSFJ5ZFdVZ2FXWWdkR2hsSUhSM2J5QndZWE56WldRZ1ZXbHVkRGhCY25KaGVYTWdhR0YyWlNCMGFHVWdjMkZ0WlNCamIyNTBaVzUwWEc0Z0tseHVJQ29nUUhCaGNtRnRJSHRWYVc1ME9FRnljbUY1ZlNCaFhHNGdLaUJBY0dGeVlXMGdlMVZwYm5RNFFYSnlZWGw5SUdKY2JpQXFMMXh1Wm5WdVkzUnBiMjRnWlhGMVlXeHpJQ2hoTENCaUtTQjdYRzRnSUdsbUlDaGhJRDA5UFNCaUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSeWRXVmNiaUFnZlZ4dVhHNGdJR2xtSUNoaExtSjVkR1ZNWlc1bmRHZ2dJVDA5SUdJdVlubDBaVXhsYm1kMGFDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVnh1SUNCOVhHNWNiaUFnWm05eUlDaHNaWFFnYVNBOUlEQTdJR2tnUENCaExtSjVkR1ZNWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUdsbUlDaGhXMmxkSUNFOVBTQmlXMmxkS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnWm1Gc2MyVmNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQnlaWFIxY200Z2RISjFaVnh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHVnhkV0ZzYzF4dUlpd2lKM1Z6WlNCemRISnBZM1FuWEc1Y2JtTnZibk4wSUhzZ1pXNWpiMlJwYm1jNklHZGxkRU52WkdWaklIMGdQU0J5WlhGMWFYSmxLQ2R0ZFd4MGFXSmhjMlVuS1Z4dVkyOXVjM1FnZFhSbU9FVnVZMjlrWlhJZ1BTQnVaWGNnVkdWNGRFVnVZMjlrWlhJb0tWeHVYRzR2S2lwY2JpQXFJRUIwZVhCbFpHVm1JSHRmWDJsdGNHOXlkRjlmS0NkdGRXeDBhV0poYzJVdmMzSmpMM1I1Y0dWekp5a3VRbUZ6WlU1aGJXVWdmQ0FuZFhSbU9DY2dmQ0FuZFhSbUxUZ25JSHdnSjJGelkybHBKeUI4SUhWdVpHVm1hVzVsWkgwZ1UzVndjRzl5ZEdWa1JXNWpiMlJwYm1kelhHNGdLaTljYmx4dUx5b3FYRzRnS2lCSmJuUmxjbkJ5WlhSeklHVmhZMmdnWTJoaGNtRmpkR1Z5SUdsdUlHRWdjM1J5YVc1bklHRnpJR0VnWW5sMFpTQmhibVJjYmlBcUlISmxkSFZ5Ym5NZ1lTQlZhVzUwT0VGeWNtRjVJRzltSUhSb2IzTmxJR0o1ZEdWekxseHVJQ3BjYmlBcUlFQndZWEpoYlNCN2MzUnlhVzVuZlNCemRISnBibWNnTFNCVWFHVWdjM1J5YVc1bklIUnZJSFIxY200Z2FXNTBieUJoYmlCaGNuSmhlVnh1SUNvdlhHNW1kVzVqZEdsdmJpQmhjMk5wYVZOMGNtbHVaMVJ2VldsdWREaEJjbkpoZVNBb2MzUnlhVzVuS1NCN1hHNGdJR052Ym5OMElHRnljbUY1SUQwZ2JtVjNJRlZwYm5RNFFYSnlZWGtvYzNSeWFXNW5MbXhsYm1kMGFDbGNibHh1SUNCbWIzSWdLR3hsZENCcElEMGdNRHNnYVNBOElITjBjbWx1Wnk1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lHRnljbUY1VzJsZElEMGdjM1J5YVc1bkxtTm9ZWEpEYjJSbFFYUW9hU2xjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJoY25KaGVWeHVmVnh1WEc0dktpcGNiaUFxSUVOeVpXRjBaU0JoSUdCVmFXNTBPRUZ5Y21GNVlDQm1jbTl0SUhSb1pTQndZWE56WldRZ2MzUnlhVzVuWEc0Z0tseHVJQ29nVTNWd2NHOXlkSE1nWUhWMFpqaGdMQ0JnZFhSbUxUaGdJR0Z1WkNCaGJua2daVzVqYjJScGJtY2djM1Z3Y0c5eWRHVmtJR0o1SUhSb1pTQnRkV3gwYVdKaGMyVWdiVzlrZFd4bExseHVJQ3BjYmlBcUlFRnNjMjhnWUdGelkybHBZQ0IzYUdsamFDQnBjeUJ6YVcxcGJHRnlJSFJ2SUc1dlpHVW5jeUFuWW1sdVlYSjVKeUJsYm1OdlpHbHVaeTVjYmlBcVhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdjM1J5YVc1blhHNGdLaUJBY0dGeVlXMGdlMU4xY0hCdmNuUmxaRVZ1WTI5a2FXNW5jMzBnVzJWdVkyOWthVzVuUFhWMFpqaGRJQzBnZFhSbU9Dd2dZbUZ6WlRFMkxDQmlZWE5sTmpRc0lHSmhjMlUyTkhWeWJIQmhaQ3dnWlhSalhHNGdLaUJBY21WMGRYSnVjeUI3VldsdWREaEJjbkpoZVgxY2JpQXFMMXh1Wm5WdVkzUnBiMjRnWm5KdmJWTjBjbWx1WnlBb2MzUnlhVzVuTENCbGJtTnZaR2x1WnlBOUlDZDFkR1k0SnlrZ2UxeHVJQ0JwWmlBb1pXNWpiMlJwYm1jZ1BUMDlJQ2QxZEdZNEp5QjhmQ0JsYm1OdlpHbHVaeUE5UFQwZ0ozVjBaaTA0SnlrZ2UxeHVJQ0FnSUhKbGRIVnliaUIxZEdZNFJXNWpiMlJsY2k1bGJtTnZaR1VvYzNSeWFXNW5LVnh1SUNCOVhHNWNiaUFnYVdZZ0tHVnVZMjlrYVc1bklEMDlQU0FuWVhOamFXa25LU0I3WEc0Z0lDQWdjbVYwZFhKdUlHRnpZMmxwVTNSeWFXNW5WRzlWYVc1ME9FRnljbUY1S0hOMGNtbHVaeWxjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJuWlhSRGIyUmxZeWhsYm1OdlpHbHVaeWt1WkdWamIyUmxLSE4wY21sdVp5bGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCbWNtOXRVM1J5YVc1blhHNGlMQ0luZFhObElITjBjbWxqZENkY2JseHVZMjl1YzNRZ2V5QmxibU52WkdsdVp6b2daMlYwUTI5a1pXTWdmU0E5SUhKbGNYVnBjbVVvSjIxMWJIUnBZbUZ6WlNjcFhHNWpiMjV6ZENCMWRHWTRSR1ZqYjJSbGNpQTlJRzVsZHlCVVpYaDBSR1ZqYjJSbGNpZ25kWFJtT0NjcFhHNWNiaThxS2x4dUlDb2dRSFI1Y0dWa1pXWWdlMTlmYVcxd2IzSjBYMThvSjIxMWJIUnBZbUZ6WlM5emNtTXZkSGx3WlhNbktTNUNZWE5sVG1GdFpTQjhJQ2QxZEdZNEp5QjhJQ2QxZEdZdE9DY2dmQ0FuWVhOamFXa25JSHdnZFc1a1pXWnBibVZrZlNCVGRYQndiM0owWldSRmJtTnZaR2x1WjNOY2JpQXFMMXh1WEc0dktpcGNiaUFxSUZSMWNtNXpJR0VnVldsdWREaEJjbkpoZVNCdlppQmllWFJsY3lCcGJuUnZJR0VnYzNSeWFXNW5JSGRwZEdnZ1pXRmphRnh1SUNvZ1kyaGhjbUZqZEdWeUlHSmxhVzVuSUhSb1pTQmphR0Z5SUdOdlpHVWdiMllnZEdobElHTnZjbkpsYzNCdmJtUnBibWNnWW5sMFpWeHVJQ3BjYmlBcUlFQndZWEpoYlNCN1ZXbHVkRGhCY25KaGVYMGdZWEp5WVhrZ0xTQlVhR1VnWVhKeVlYa2dkRzhnZEhWeWJpQnBiblJ2SUdFZ2MzUnlhVzVuWEc0Z0tpOWNibVoxYm1OMGFXOXVJSFZwYm5RNFFYSnlZWGxVYjBGelkybHBVM1J5YVc1bklDaGhjbkpoZVNrZ2UxeHVJQ0JzWlhRZ2MzUnlhVzVuSUQwZ0p5ZGNibHh1SUNCbWIzSWdLR3hsZENCcElEMGdNRHNnYVNBOElHRnljbUY1TG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ2MzUnlhVzVuSUNzOUlGTjBjbWx1Wnk1bWNtOXRRMmhoY2tOdlpHVW9ZWEp5WVhsYmFWMHBYRzRnSUgxY2JpQWdjbVYwZFhKdUlITjBjbWx1WjF4dWZWeHVYRzR2S2lwY2JpQXFJRlIxY201eklHRWdZRlZwYm5RNFFYSnlZWGxnSUdsdWRHOGdZU0J6ZEhKcGJtY3VYRzRnS2x4dUlDb2dVM1Z3Y0c5eWRITWdZSFYwWmpoZ0xDQmdkWFJtTFRoZ0lHRnVaQ0JoYm5rZ1pXNWpiMlJwYm1jZ2MzVndjRzl5ZEdWa0lHSjVJSFJvWlNCdGRXeDBhV0poYzJVZ2JXOWtkV3hsTGx4dUlDcGNiaUFxSUVGc2MyOGdZR0Z6WTJscFlDQjNhR2xqYUNCcGN5QnphVzFwYkdGeUlIUnZJRzV2WkdVbmN5QW5ZbWx1WVhKNUp5QmxibU52WkdsdVp5NWNiaUFxWEc0Z0tpQkFjR0Z5WVcwZ2UxVnBiblE0UVhKeVlYbDlJR0Z5Y21GNUlDMGdWR2hsSUdGeWNtRjVJSFJ2SUhSMWNtNGdhVzUwYnlCaElITjBjbWx1WjF4dUlDb2dRSEJoY21GdElIdFRkWEJ3YjNKMFpXUkZibU52WkdsdVozTjlJRnRsYm1OdlpHbHVaejExZEdZNFhTQXRJRlJvWlNCbGJtTnZaR2x1WnlCMGJ5QjFjMlZjYmlBcUlFQnlaWFIxY201eklIdHpkSEpwYm1kOVhHNGdLaTljYm1aMWJtTjBhVzl1SUhSdlUzUnlhVzVuSUNoaGNuSmhlU3dnWlc1amIyUnBibWNnUFNBbmRYUm1PQ2NwSUh0Y2JpQWdhV1lnS0dWdVkyOWthVzVuSUQwOVBTQW5kWFJtT0NjZ2ZId2daVzVqYjJScGJtY2dQVDA5SUNkMWRHWXRPQ2NwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdkWFJtT0VSbFkyOWtaWEl1WkdWamIyUmxLR0Z5Y21GNUtWeHVJQ0I5WEc1Y2JpQWdhV1lnS0dWdVkyOWthVzVuSUQwOVBTQW5ZWE5qYVdrbktTQjdYRzRnSUNBZ2NtVjBkWEp1SUhWcGJuUTRRWEp5WVhsVWIwRnpZMmxwVTNSeWFXNW5LR0Z5Y21GNUtWeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlHZGxkRU52WkdWaktHVnVZMjlrYVc1bktTNWxibU52WkdVb1lYSnlZWGtwWEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdkRzlUZEhKcGJtZGNiaUlzSWlkMWMyVWdjM1J5YVdOMEoxeHVkbUZ5SUVKMVptWmxjaUE5SUhKbGNYVnBjbVVvSjNOaFptVXRZblZtWm1WeUp5a3VRblZtWm1WeVhHNWNiaTh2SUU1MWJXSmxjaTVOUVZoZlUwRkdSVjlKVGxSRlIwVlNYRzUyWVhJZ1RVRllYMU5CUmtWZlNVNVVSVWRGVWlBOUlEa3dNRGN4T1RreU5UUTNOREE1T1RGY2JseHVablZ1WTNScGIyNGdZMmhsWTJ0VlNXNTBOVE1nS0c0cElIdGNiaUFnYVdZZ0tHNGdQQ0F3SUh4OElHNGdQaUJOUVZoZlUwRkdSVjlKVGxSRlIwVlNJSHg4SUc0Z0pTQXhJQ0U5UFNBd0tTQjBhSEp2ZHlCdVpYY2dVbUZ1WjJWRmNuSnZjaWduZG1Gc2RXVWdiM1YwSUc5bUlISmhibWRsSnlsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWlc1amIyUmxJQ2h1ZFcxaVpYSXNJR0oxWm1abGNpd2diMlptYzJWMEtTQjdYRzRnSUdOb1pXTnJWVWx1ZERVektHNTFiV0psY2lsY2JseHVJQ0JwWmlBb0lXSjFabVpsY2lrZ1luVm1abVZ5SUQwZ1FuVm1abVZ5TG1Gc2JHOWpWVzV6WVdabEtHVnVZMjlrYVc1blRHVnVaM1JvS0c1MWJXSmxjaWtwWEc0Z0lHbG1JQ2doUW5WbVptVnlMbWx6UW5WbVptVnlLR0oxWm1abGNpa3BJSFJvY205M0lHNWxkeUJVZVhCbFJYSnliM0lvSjJKMVptWmxjaUJ0ZFhOMElHSmxJR0VnUW5WbVptVnlJR2x1YzNSaGJtTmxKeWxjYmlBZ2FXWWdLQ0Z2Wm1aelpYUXBJRzltWm5ObGRDQTlJREJjYmx4dUlDQXZMeUE0SUdKcGRGeHVJQ0JwWmlBb2JuVnRZbVZ5SUR3Z01IaG1aQ2tnZTF4dUlDQWdJR0oxWm1abGNpNTNjbWwwWlZWSmJuUTRLRzUxYldKbGNpd2diMlptYzJWMEtWeHVJQ0FnSUdWdVkyOWtaUzVpZVhSbGN5QTlJREZjYmx4dUlDQXZMeUF4TmlCaWFYUmNiaUFnZlNCbGJITmxJR2xtSUNodWRXMWlaWElnUEQwZ01IaG1abVptS1NCN1hHNGdJQ0FnWW5WbVptVnlMbmR5YVhSbFZVbHVkRGdvTUhobVpDd2diMlptYzJWMEtWeHVJQ0FnSUdKMVptWmxjaTUzY21sMFpWVkpiblF4Tmt4RktHNTFiV0psY2l3Z2IyWm1jMlYwSUNzZ01TbGNiaUFnSUNCbGJtTnZaR1V1WW5sMFpYTWdQU0F6WEc1Y2JpQWdMeThnTXpJZ1ltbDBYRzRnSUgwZ1pXeHpaU0JwWmlBb2JuVnRZbVZ5SUR3OUlEQjRabVptWm1abVptWXBJSHRjYmlBZ0lDQmlkV1ptWlhJdWQzSnBkR1ZWU1c1ME9DZ3dlR1psTENCdlptWnpaWFFwWEc0Z0lDQWdZblZtWm1WeUxuZHlhWFJsVlVsdWRETXlURVVvYm5WdFltVnlMQ0J2Wm1aelpYUWdLeUF4S1Z4dUlDQWdJR1Z1WTI5a1pTNWllWFJsY3lBOUlEVmNibHh1SUNBdkx5QTJOQ0JpYVhSY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCaWRXWm1aWEl1ZDNKcGRHVlZTVzUwT0Nnd2VHWm1MQ0J2Wm1aelpYUXBYRzRnSUNBZ1luVm1abVZ5TG5keWFYUmxWVWx1ZERNeVRFVW9iblZ0WW1WeUlENCtQaUF3TENCdlptWnpaWFFnS3lBeEtWeHVJQ0FnSUdKMVptWmxjaTUzY21sMFpWVkpiblF6TWt4RktDaHVkVzFpWlhJZ0x5QXdlREV3TURBd01EQXdNQ2tnZkNBd0xDQnZabVp6WlhRZ0t5QTFLVnh1SUNBZ0lHVnVZMjlrWlM1aWVYUmxjeUE5SURsY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCaWRXWm1aWEpjYm4xY2JseHVablZ1WTNScGIyNGdaR1ZqYjJSbElDaGlkV1ptWlhJc0lHOW1abk5sZENrZ2UxeHVJQ0JwWmlBb0lVSjFabVpsY2k1cGMwSjFabVpsY2loaWRXWm1aWElwS1NCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtDZGlkV1ptWlhJZ2JYVnpkQ0JpWlNCaElFSjFabVpsY2lCcGJuTjBZVzVqWlNjcFhHNGdJR2xtSUNnaGIyWm1jMlYwS1NCdlptWnpaWFFnUFNBd1hHNWNiaUFnZG1GeUlHWnBjbk4wSUQwZ1luVm1abVZ5TG5KbFlXUlZTVzUwT0NodlptWnpaWFFwWEc1Y2JpQWdMeThnT0NCaWFYUmNiaUFnYVdZZ0tHWnBjbk4wSUR3Z01IaG1aQ2tnZTF4dUlDQWdJR1JsWTI5a1pTNWllWFJsY3lBOUlERmNiaUFnSUNCeVpYUjFjbTRnWm1seWMzUmNibHh1SUNBdkx5QXhOaUJpYVhSY2JpQWdmU0JsYkhObElHbG1JQ2htYVhKemRDQTlQVDBnTUhobVpDa2dlMXh1SUNBZ0lHUmxZMjlrWlM1aWVYUmxjeUE5SUROY2JpQWdJQ0J5WlhSMWNtNGdZblZtWm1WeUxuSmxZV1JWU1c1ME1UWk1SU2h2Wm1aelpYUWdLeUF4S1Z4dVhHNGdJQzh2SURNeUlHSnBkRnh1SUNCOUlHVnNjMlVnYVdZZ0tHWnBjbk4wSUQwOVBTQXdlR1psS1NCN1hHNGdJQ0FnWkdWamIyUmxMbUo1ZEdWeklEMGdOVnh1SUNBZ0lISmxkSFZ5YmlCaWRXWm1aWEl1Y21WaFpGVkpiblF6TWt4RktHOW1abk5sZENBcklERXBYRzVjYmlBZ0x5OGdOalFnWW1sMFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ1pHVmpiMlJsTG1KNWRHVnpJRDBnT1Z4dUlDQWdJSFpoY2lCc2J5QTlJR0oxWm1abGNpNXlaV0ZrVlVsdWRETXlURVVvYjJabWMyVjBJQ3NnTVNsY2JpQWdJQ0IyWVhJZ2FHa2dQU0JpZFdabVpYSXVjbVZoWkZWSmJuUXpNa3hGS0c5bVpuTmxkQ0FySURVcFhHNGdJQ0FnZG1GeUlHNTFiV0psY2lBOUlHaHBJQ29nTUhnd01UQXdNREF3TURBd0lDc2diRzljYmlBZ0lDQmphR1ZqYTFWSmJuUTFNeWh1ZFcxaVpYSXBYRzVjYmlBZ0lDQnlaWFIxY200Z2JuVnRZbVZ5WEc0Z0lIMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1pXNWpiMlJwYm1kTVpXNW5kR2dnS0c1MWJXSmxjaWtnZTF4dUlDQmphR1ZqYTFWSmJuUTFNeWh1ZFcxaVpYSXBYRzVjYmlBZ2NtVjBkWEp1SUNoY2JpQWdJQ0J1ZFcxaVpYSWdQQ0F3ZUdaa0lEOGdNVnh1SUNBZ0lDQWdPaUJ1ZFcxaVpYSWdQRDBnTUhobVptWm1JRDhnTTF4dUlDQWdJQ0FnSUNBNklHNTFiV0psY2lBOFBTQXdlR1ptWm1abVptWm1JRDhnTlZ4dUlDQWdJQ0FnSUNBZ0lEb2dPVnh1SUNBcFhHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnZXlCbGJtTnZaR1U2SUdWdVkyOWtaU3dnWkdWamIyUmxPaUJrWldOdlpHVXNJR1Z1WTI5a2FXNW5UR1Z1WjNSb09pQmxibU52WkdsdVoweGxibWQwYUNCOVhHNGlMQ0pjSW5WelpTQnpkSEpwWTNSY0lseHVYRzVsZUhCdmNuUnpMbFJsZUhSRmJtTnZaR1Z5SUQxY2JpQWdkSGx3Wlc5bUlGUmxlSFJGYm1OdlpHVnlJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnVkdWNGRFVnVZMjlrWlhJZ09pQnlaWEYxYVhKbEtGd2lkWFJwYkZ3aUtTNVVaWGgwUlc1amIyUmxjbHh1WEc1bGVIQnZjblJ6TGxSbGVIUkVaV052WkdWeUlEMWNiaUFnZEhsd1pXOW1JRlJsZUhSRVpXTnZaR1Z5SUNFOVBTQmNJblZ1WkdWbWFXNWxaRndpSUQ4Z1ZHVjRkRVJsWTI5a1pYSWdPaUJ5WlhGMWFYSmxLRndpZFhScGJGd2lLUzVVWlhoMFJHVmpiMlJsY2x4dUlpd2lLR1oxYm1OMGFXOXVJQ2huYkc5aVlXd3NJR1poWTNSdmNua3BJSHRjYmlBZ2RIbHdaVzltSUdWNGNHOXlkSE1nUFQwOUlDZHZZbXBsWTNRbklDWW1JSFI1Y0dWdlppQnRiMlIxYkdVZ0lUMDlJQ2QxYm1SbFptbHVaV1FuSUQ4Z1ptRmpkRzl5ZVNobGVIQnZjblJ6S1NBNlhHNGdJSFI1Y0dWdlppQmtaV1pwYm1VZ1BUMDlJQ2RtZFc1amRHbHZiaWNnSmlZZ1pHVm1hVzVsTG1GdFpDQS9JR1JsWm1sdVpTaGJKMlY0Y0c5eWRITW5YU3dnWm1GamRHOXllU2tnT2x4dUlDQW9abUZqZEc5eWVTZ29aMnh2WW1Gc0xsZElRVlJYUjBabGRHTm9JRDBnZTMwcEtTazdYRzU5S0hSb2FYTXNJQ2htZFc1amRHbHZiaUFvWlhod2IzSjBjeWtnZXlBbmRYTmxJSE4wY21samRDYzdYRzVjYmlBZ2RtRnlJR2RzYjJKaGJDQTlYRzRnSUNBZ0tIUjVjR1Z2WmlCbmJHOWlZV3hVYUdseklDRTlQU0FuZFc1a1pXWnBibVZrSnlBbUppQm5iRzlpWVd4VWFHbHpLU0I4ZkZ4dUlDQWdJQ2gwZVhCbGIyWWdjMlZzWmlBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ2MyVnNaaWtnZkh4Y2JpQWdJQ0FvZEhsd1pXOW1JR2RzYjJKaGJDQWhQVDBnSjNWdVpHVm1hVzVsWkNjZ0ppWWdaMnh2WW1Gc0tUdGNibHh1SUNCMllYSWdjM1Z3Y0c5eWRDQTlJSHRjYmlBZ0lDQnpaV0Z5WTJoUVlYSmhiWE02SUNkVlVreFRaV0Z5WTJoUVlYSmhiWE1uSUdsdUlHZHNiMkpoYkN4Y2JpQWdJQ0JwZEdWeVlXSnNaVG9nSjFONWJXSnZiQ2NnYVc0Z1oyeHZZbUZzSUNZbUlDZHBkR1Z5WVhSdmNpY2dhVzRnVTNsdFltOXNMRnh1SUNBZ0lHSnNiMkk2WEc0Z0lDQWdJQ0FuUm1sc1pWSmxZV1JsY2ljZ2FXNGdaMnh2WW1Gc0lDWW1YRzRnSUNBZ0lDQW5RbXh2WWljZ2FXNGdaMnh2WW1Gc0lDWW1YRzRnSUNBZ0lDQW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUhSeWVTQjdYRzRnSUNBZ0lDQWdJQ0FnYm1WM0lFSnNiMklvS1R0Y2JpQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RISjFaVnh1SUNBZ0lDQWdJQ0I5SUdOaGRHTm9JQ2hsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgwcEtDa3NYRzRnSUNBZ1ptOXliVVJoZEdFNklDZEdiM0p0UkdGMFlTY2dhVzRnWjJ4dlltRnNMRnh1SUNBZ0lHRnljbUY1UW5WbVptVnlPaUFuUVhKeVlYbENkV1ptWlhJbklHbHVJR2RzYjJKaGJGeHVJQ0I5TzF4dVhHNGdJR1oxYm1OMGFXOXVJR2x6UkdGMFlWWnBaWGNvYjJKcUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUc5aWFpQW1KaUJFWVhSaFZtbGxkeTV3Y205MGIzUjVjR1V1YVhOUWNtOTBiM1I1Y0dWUFppaHZZbW9wWEc0Z0lIMWNibHh1SUNCcFppQW9jM1Z3Y0c5eWRDNWhjbkpoZVVKMVptWmxjaWtnZTF4dUlDQWdJSFpoY2lCMmFXVjNRMnhoYzNObGN5QTlJRnRjYmlBZ0lDQWdJQ2RiYjJKcVpXTjBJRWx1ZERoQmNuSmhlVjBuTEZ4dUlDQWdJQ0FnSjF0dlltcGxZM1FnVldsdWREaEJjbkpoZVYwbkxGeHVJQ0FnSUNBZ0oxdHZZbXBsWTNRZ1ZXbHVkRGhEYkdGdGNHVmtRWEp5WVhsZEp5eGNiaUFnSUNBZ0lDZGJiMkpxWldOMElFbHVkREUyUVhKeVlYbGRKeXhjYmlBZ0lDQWdJQ2RiYjJKcVpXTjBJRlZwYm5ReE5rRnljbUY1WFNjc1hHNGdJQ0FnSUNBblcyOWlhbVZqZENCSmJuUXpNa0Z5Y21GNVhTY3NYRzRnSUNBZ0lDQW5XMjlpYW1WamRDQlZhVzUwTXpKQmNuSmhlVjBuTEZ4dUlDQWdJQ0FnSjF0dlltcGxZM1FnUm14dllYUXpNa0Z5Y21GNVhTY3NYRzRnSUNBZ0lDQW5XMjlpYW1WamRDQkdiRzloZERZMFFYSnlZWGxkSjF4dUlDQWdJRjA3WEc1Y2JpQWdJQ0IyWVhJZ2FYTkJjbkpoZVVKMVptWmxjbFpwWlhjZ1BWeHVJQ0FnSUNBZ1FYSnlZWGxDZFdabVpYSXVhWE5XYVdWM0lIeDhYRzRnSUNBZ0lDQm1kVzVqZEdsdmJpaHZZbW9wSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUc5aWFpQW1KaUIyYVdWM1EyeGhjM05sY3k1cGJtUmxlRTltS0U5aWFtVmpkQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWN1WTJGc2JDaHZZbW9wS1NBK0lDMHhYRzRnSUNBZ0lDQjlPMXh1SUNCOVhHNWNiaUFnWm5WdVkzUnBiMjRnYm05eWJXRnNhWHBsVG1GdFpTaHVZVzFsS1NCN1hHNGdJQ0FnYVdZZ0tIUjVjR1Z2WmlCdVlXMWxJQ0U5UFNBbmMzUnlhVzVuSnlrZ2UxeHVJQ0FnSUNBZ2JtRnRaU0E5SUZOMGNtbHVaeWh1WVcxbEtUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tDOWJYbUV0ZWpBdE9WeGNMU01rSlNZbktpc3VYbDlnZkg0aFhTOXBMblJsYzNRb2JtRnRaU2tnZkh3Z2JtRnRaU0E5UFQwZ0p5Y3BJSHRjYmlBZ0lDQWdJSFJvY205M0lHNWxkeUJVZVhCbFJYSnliM0lvSjBsdWRtRnNhV1FnWTJoaGNtRmpkR1Z5SUdsdUlHaGxZV1JsY2lCbWFXVnNaQ0J1WVcxbE9pQmNJaWNnS3lCdVlXMWxJQ3NnSjF3aUp5bGNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJRzVoYldVdWRHOU1iM2RsY2tOaGMyVW9LVnh1SUNCOVhHNWNiaUFnWm5WdVkzUnBiMjRnYm05eWJXRnNhWHBsVm1Gc2RXVW9kbUZzZFdVcElIdGNiaUFnSUNCcFppQW9kSGx3Wlc5bUlIWmhiSFZsSUNFOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lDQWdkbUZzZFdVZ1BTQlRkSEpwYm1jb2RtRnNkV1VwTzF4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z2RtRnNkV1ZjYmlBZ2ZWeHVYRzRnSUM4dklFSjFhV3hrSUdFZ1pHVnpkSEoxWTNScGRtVWdhWFJsY21GMGIzSWdabTl5SUhSb1pTQjJZV3gxWlNCc2FYTjBYRzRnSUdaMWJtTjBhVzl1SUdsMFpYSmhkRzl5Um05eUtHbDBaVzF6S1NCN1hHNGdJQ0FnZG1GeUlHbDBaWEpoZEc5eUlEMGdlMXh1SUNBZ0lDQWdibVY0ZERvZ1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCMllXeDFaU0E5SUdsMFpXMXpMbk5vYVdaMEtDazdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQjdaRzl1WlRvZ2RtRnNkV1VnUFQwOUlIVnVaR1ZtYVc1bFpDd2dkbUZzZFdVNklIWmhiSFZsZlZ4dUlDQWdJQ0FnZlZ4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JwWmlBb2MzVndjRzl5ZEM1cGRHVnlZV0pzWlNrZ2UxeHVJQ0FnSUNBZ2FYUmxjbUYwYjNKYlUzbHRZbTlzTG1sMFpYSmhkRzl5WFNBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdhWFJsY21GMGIzSmNiaUFnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2NtVjBkWEp1SUdsMFpYSmhkRzl5WEc0Z0lIMWNibHh1SUNCbWRXNWpkR2x2YmlCSVpXRmtaWEp6S0dobFlXUmxjbk1wSUh0Y2JpQWdJQ0IwYUdsekxtMWhjQ0E5SUh0OU8xeHVYRzRnSUNBZ2FXWWdLR2hsWVdSbGNuTWdhVzV6ZEdGdVkyVnZaaUJJWldGa1pYSnpLU0I3WEc0Z0lDQWdJQ0JvWldGa1pYSnpMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9kbUZzZFdVc0lHNWhiV1VwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVoY0hCbGJtUW9ibUZ0WlN3Z2RtRnNkV1VwTzF4dUlDQWdJQ0FnZlN3Z2RHaHBjeWs3WEc0Z0lDQWdmU0JsYkhObElHbG1JQ2hCY25KaGVTNXBjMEZ5Y21GNUtHaGxZV1JsY25NcEtTQjdYRzRnSUNBZ0lDQm9aV0ZrWlhKekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0b2FHVmhaR1Z5S1NCN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WVhCd1pXNWtLR2hsWVdSbGNsc3dYU3dnYUdWaFpHVnlXekZkS1R0Y2JpQWdJQ0FnSUgwc0lIUm9hWE1wTzF4dUlDQWdJSDBnWld4elpTQnBaaUFvYUdWaFpHVnljeWtnZTF4dUlDQWdJQ0FnVDJKcVpXTjBMbWRsZEU5M2JsQnliM0JsY25SNVRtRnRaWE1vYUdWaFpHVnljeWt1Wm05eVJXRmphQ2htZFc1amRHbHZiaWh1WVcxbEtTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdVlYQndaVzVrS0c1aGJXVXNJR2hsWVdSbGNuTmJibUZ0WlYwcE8xeHVJQ0FnSUNBZ2ZTd2dkR2hwY3lrN1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ1NHVmhaR1Z5Y3k1d2NtOTBiM1I1Y0dVdVlYQndaVzVrSUQwZ1puVnVZM1JwYjI0b2JtRnRaU3dnZG1Gc2RXVXBJSHRjYmlBZ0lDQnVZVzFsSUQwZ2JtOXliV0ZzYVhwbFRtRnRaU2h1WVcxbEtUdGNiaUFnSUNCMllXeDFaU0E5SUc1dmNtMWhiR2w2WlZaaGJIVmxLSFpoYkhWbEtUdGNiaUFnSUNCMllYSWdiMnhrVm1Gc2RXVWdQU0IwYUdsekxtMWhjRnR1WVcxbFhUdGNiaUFnSUNCMGFHbHpMbTFoY0Z0dVlXMWxYU0E5SUc5c1pGWmhiSFZsSUQ4Z2IyeGtWbUZzZFdVZ0t5QW5MQ0FuSUNzZ2RtRnNkV1VnT2lCMllXeDFaVHRjYmlBZ2ZUdGNibHh1SUNCSVpXRmtaWEp6TG5CeWIzUnZkSGx3WlZzblpHVnNaWFJsSjEwZ1BTQm1kVzVqZEdsdmJpaHVZVzFsS1NCN1hHNGdJQ0FnWkdWc1pYUmxJSFJvYVhNdWJXRndXMjV2Y20xaGJHbDZaVTVoYldVb2JtRnRaU2xkTzF4dUlDQjlPMXh1WEc0Z0lFaGxZV1JsY25NdWNISnZkRzkwZVhCbExtZGxkQ0E5SUdaMWJtTjBhVzl1S0c1aGJXVXBJSHRjYmlBZ0lDQnVZVzFsSUQwZ2JtOXliV0ZzYVhwbFRtRnRaU2h1WVcxbEtUdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NW9ZWE1vYm1GdFpTa2dQeUIwYUdsekxtMWhjRnR1WVcxbFhTQTZJRzUxYkd4Y2JpQWdmVHRjYmx4dUlDQklaV0ZrWlhKekxuQnliM1J2ZEhsd1pTNW9ZWE1nUFNCbWRXNWpkR2x2YmlodVlXMWxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE11YldGd0xtaGhjMDkzYmxCeWIzQmxjblI1S0c1dmNtMWhiR2w2WlU1aGJXVW9ibUZ0WlNrcFhHNGdJSDA3WEc1Y2JpQWdTR1ZoWkdWeWN5NXdjbTkwYjNSNWNHVXVjMlYwSUQwZ1puVnVZM1JwYjI0b2JtRnRaU3dnZG1Gc2RXVXBJSHRjYmlBZ0lDQjBhR2x6TG0xaGNGdHViM0p0WVd4cGVtVk9ZVzFsS0c1aGJXVXBYU0E5SUc1dmNtMWhiR2w2WlZaaGJIVmxLSFpoYkhWbEtUdGNiaUFnZlR0Y2JseHVJQ0JJWldGa1pYSnpMbkJ5YjNSdmRIbHdaUzVtYjNKRllXTm9JRDBnWm5WdVkzUnBiMjRvWTJGc2JHSmhZMnNzSUhSb2FYTkJjbWNwSUh0Y2JpQWdJQ0JtYjNJZ0tIWmhjaUJ1WVcxbElHbHVJSFJvYVhNdWJXRndLU0I3WEc0Z0lDQWdJQ0JwWmlBb2RHaHBjeTV0WVhBdWFHRnpUM2R1VUhKdmNHVnlkSGtvYm1GdFpTa3BJSHRjYmlBZ0lDQWdJQ0FnWTJGc2JHSmhZMnN1WTJGc2JDaDBhR2x6UVhKbkxDQjBhR2x6TG0xaGNGdHVZVzFsWFN3Z2JtRnRaU3dnZEdocGN5azdYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0I5TzF4dVhHNGdJRWhsWVdSbGNuTXVjSEp2ZEc5MGVYQmxMbXRsZVhNZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQjJZWElnYVhSbGJYTWdQU0JiWFR0Y2JpQWdJQ0IwYUdsekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0b2RtRnNkV1VzSUc1aGJXVXBJSHRjYmlBZ0lDQWdJR2wwWlcxekxuQjFjMmdvYm1GdFpTazdYRzRnSUNBZ2ZTazdYRzRnSUNBZ2NtVjBkWEp1SUdsMFpYSmhkRzl5Um05eUtHbDBaVzF6S1Z4dUlDQjlPMXh1WEc0Z0lFaGxZV1JsY25NdWNISnZkRzkwZVhCbExuWmhiSFZsY3lBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lIWmhjaUJwZEdWdGN5QTlJRnRkTzF4dUlDQWdJSFJvYVhNdVptOXlSV0ZqYUNobWRXNWpkR2x2YmloMllXeDFaU2tnZTF4dUlDQWdJQ0FnYVhSbGJYTXVjSFZ6YUNoMllXeDFaU2s3WEc0Z0lDQWdmU2s3WEc0Z0lDQWdjbVYwZFhKdUlHbDBaWEpoZEc5eVJtOXlLR2wwWlcxektWeHVJQ0I5TzF4dVhHNGdJRWhsWVdSbGNuTXVjSEp2ZEc5MGVYQmxMbVZ1ZEhKcFpYTWdQU0JtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0IyWVhJZ2FYUmxiWE1nUFNCYlhUdGNiaUFnSUNCMGFHbHpMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9kbUZzZFdVc0lHNWhiV1VwSUh0Y2JpQWdJQ0FnSUdsMFpXMXpMbkIxYzJnb1cyNWhiV1VzSUhaaGJIVmxYU2s3WEc0Z0lDQWdmU2s3WEc0Z0lDQWdjbVYwZFhKdUlHbDBaWEpoZEc5eVJtOXlLR2wwWlcxektWeHVJQ0I5TzF4dVhHNGdJR2xtSUNoemRYQndiM0owTG1sMFpYSmhZbXhsS1NCN1hHNGdJQ0FnU0dWaFpHVnljeTV3Y205MGIzUjVjR1ZiVTNsdFltOXNMbWwwWlhKaGRHOXlYU0E5SUVobFlXUmxjbk11Y0hKdmRHOTBlWEJsTG1WdWRISnBaWE03WEc0Z0lIMWNibHh1SUNCbWRXNWpkR2x2YmlCamIyNXpkVzFsWkNoaWIyUjVLU0I3WEc0Z0lDQWdhV1lnS0dKdlpIa3VZbTlrZVZWelpXUXBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQlFjbTl0YVhObExuSmxhbVZqZENodVpYY2dWSGx3WlVWeWNtOXlLQ2RCYkhKbFlXUjVJSEpsWVdRbktTbGNiaUFnSUNCOVhHNGdJQ0FnWW05a2VTNWliMlI1VlhObFpDQTlJSFJ5ZFdVN1hHNGdJSDFjYmx4dUlDQm1kVzVqZEdsdmJpQm1hV3hsVW1WaFpHVnlVbVZoWkhrb2NtVmhaR1Z5S1NCN1hHNGdJQ0FnY21WMGRYSnVJRzVsZHlCUWNtOXRhWE5sS0daMWJtTjBhVzl1S0hKbGMyOXNkbVVzSUhKbGFtVmpkQ2tnZTF4dUlDQWdJQ0FnY21WaFpHVnlMbTl1Ykc5aFpDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNCeVpYTnZiSFpsS0hKbFlXUmxjaTV5WlhOMWJIUXBPMXh1SUNBZ0lDQWdmVHRjYmlBZ0lDQWdJSEpsWVdSbGNpNXZibVZ5Y205eUlEMGdablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUhKbGFtVmpkQ2h5WldGa1pYSXVaWEp5YjNJcE8xeHVJQ0FnSUNBZ2ZUdGNiaUFnSUNCOUtWeHVJQ0I5WEc1Y2JpQWdablZ1WTNScGIyNGdjbVZoWkVKc2IySkJjMEZ5Y21GNVFuVm1abVZ5S0dKc2IySXBJSHRjYmlBZ0lDQjJZWElnY21WaFpHVnlJRDBnYm1WM0lFWnBiR1ZTWldGa1pYSW9LVHRjYmlBZ0lDQjJZWElnY0hKdmJXbHpaU0E5SUdacGJHVlNaV0ZrWlhKU1pXRmtlU2h5WldGa1pYSXBPMXh1SUNBZ0lISmxZV1JsY2k1eVpXRmtRWE5CY25KaGVVSjFabVpsY2loaWJHOWlLVHRjYmlBZ0lDQnlaWFIxY200Z2NISnZiV2x6WlZ4dUlDQjlYRzVjYmlBZ1puVnVZM1JwYjI0Z2NtVmhaRUpzYjJKQmMxUmxlSFFvWW14dllpa2dlMXh1SUNBZ0lIWmhjaUJ5WldGa1pYSWdQU0J1WlhjZ1JtbHNaVkpsWVdSbGNpZ3BPMXh1SUNBZ0lIWmhjaUJ3Y205dGFYTmxJRDBnWm1sc1pWSmxZV1JsY2xKbFlXUjVLSEpsWVdSbGNpazdYRzRnSUNBZ2NtVmhaR1Z5TG5KbFlXUkJjMVJsZUhRb1lteHZZaWs3WEc0Z0lDQWdjbVYwZFhKdUlIQnliMjFwYzJWY2JpQWdmVnh1WEc0Z0lHWjFibU4wYVc5dUlISmxZV1JCY25KaGVVSjFabVpsY2tGelZHVjRkQ2hpZFdZcElIdGNiaUFnSUNCMllYSWdkbWxsZHlBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0dKMVppazdYRzRnSUNBZ2RtRnlJR05vWVhKeklEMGdibVYzSUVGeWNtRjVLSFpwWlhjdWJHVnVaM1JvS1R0Y2JseHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2RtbGxkeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ1kyaGhjbk5iYVYwZ1BTQlRkSEpwYm1jdVpuSnZiVU5vWVhKRGIyUmxLSFpwWlhkYmFWMHBPMXh1SUNBZ0lIMWNiaUFnSUNCeVpYUjFjbTRnWTJoaGNuTXVhbTlwYmlnbkp5bGNiaUFnZlZ4dVhHNGdJR1oxYm1OMGFXOXVJR0oxWm1abGNrTnNiMjVsS0dKMVppa2dlMXh1SUNBZ0lHbG1JQ2hpZFdZdWMyeHBZMlVwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJpZFdZdWMyeHBZMlVvTUNsY2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdkbUZ5SUhacFpYY2dQU0J1WlhjZ1ZXbHVkRGhCY25KaGVTaGlkV1l1WW5sMFpVeGxibWQwYUNrN1hHNGdJQ0FnSUNCMmFXVjNMbk5sZENodVpYY2dWV2x1ZERoQmNuSmhlU2hpZFdZcEtUdGNiaUFnSUNBZ0lISmxkSFZ5YmlCMmFXVjNMbUoxWm1abGNseHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lHWjFibU4wYVc5dUlFSnZaSGtvS1NCN1hHNGdJQ0FnZEdocGN5NWliMlI1VlhObFpDQTlJR1poYkhObE8xeHVYRzRnSUNBZ2RHaHBjeTVmYVc1cGRFSnZaSGtnUFNCbWRXNWpkR2x2YmloaWIyUjVLU0I3WEc0Z0lDQWdJQ0F2S2x4dUlDQWdJQ0FnSUNCbVpYUmphQzF0YjJOcklIZHlZWEJ6SUhSb1pTQlNaWE53YjI1elpTQnZZbXBsWTNRZ2FXNGdZVzRnUlZNMklGQnliM2g1SUhSdlhHNGdJQ0FnSUNBZ0lIQnliM1pwWkdVZ2RYTmxablZzSUhSbGMzUWdhR0Z5Ym1WemN5Qm1aV0YwZFhKbGN5QnpkV05vSUdGeklHWnNkWE5vTGlCSWIzZGxkbVZ5TENCdmJseHVJQ0FnSUNBZ0lDQkZVelVnWW5KdmQzTmxjbk1nZDJsMGFHOTFkQ0JtWlhSamFDQnZjaUJRY205NGVTQnpkWEJ3YjNKMElIQnZiR3g1Wm1sc2JITWdiWFZ6ZENCaVpTQjFjMlZrTzF4dUlDQWdJQ0FnSUNCMGFHVWdjSEp2ZUhrdGNHOXNiSGxtYVd4c0lHbHpJSFZ1WVdKc1pTQjBieUJ3Y205NGVTQmhiaUJoZEhSeWFXSjFkR1VnZFc1c1pYTnpJR2wwSUdWNGFYTjBjMXh1SUNBZ0lDQWdJQ0J2YmlCMGFHVWdiMkpxWldOMElHSmxabTl5WlNCMGFHVWdVSEp2ZUhrZ2FYTWdZM0psWVhSbFpDNGdWR2hwY3lCamFHRnVaMlVnWlc1emRYSmxjMXh1SUNBZ0lDQWdJQ0JTWlhOd2IyNXpaUzVpYjJSNVZYTmxaQ0JsZUdsemRITWdiMjRnZEdobElHbHVjM1JoYm1ObExDQjNhR2xzWlNCdFlXbHVkR0ZwYm1sdVp5QjBhR1ZjYmlBZ0lDQWdJQ0FnYzJWdFlXNTBhV01nYjJZZ2MyVjBkR2x1WnlCU1pYRjFaWE4wTG1KdlpIbFZjMlZrSUdsdUlIUm9aU0JqYjI1emRISjFZM1J2Y2lCaVpXWnZjbVZjYmlBZ0lDQWdJQ0FnWDJsdWFYUkNiMlI1SUdseklHTmhiR3hsWkM1Y2JpQWdJQ0FnSUNvdlhHNGdJQ0FnSUNCMGFHbHpMbUp2WkhsVmMyVmtJRDBnZEdocGN5NWliMlI1VlhObFpEdGNiaUFnSUNBZ0lIUm9hWE11WDJKdlpIbEpibWwwSUQwZ1ltOWtlVHRjYmlBZ0lDQWdJR2xtSUNnaFltOWtlU2tnZTF4dUlDQWdJQ0FnSUNCMGFHbHpMbDlpYjJSNVZHVjRkQ0E5SUNjbk8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaDBlWEJsYjJZZ1ltOWtlU0E5UFQwZ0ozTjBjbWx1WnljcElIdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlltOWtlVlJsZUhRZ1BTQmliMlI1TzF4dUlDQWdJQ0FnZlNCbGJITmxJR2xtSUNoemRYQndiM0owTG1Kc2IySWdKaVlnUW14dllpNXdjbTkwYjNSNWNHVXVhWE5RY205MGIzUjVjR1ZQWmloaWIyUjVLU2tnZTF4dUlDQWdJQ0FnSUNCMGFHbHpMbDlpYjJSNVFteHZZaUE5SUdKdlpIazdYRzRnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLSE4xY0hCdmNuUXVabTl5YlVSaGRHRWdKaVlnUm05eWJVUmhkR0V1Y0hKdmRHOTBlWEJsTG1selVISnZkRzkwZVhCbFQyWW9ZbTlrZVNrcElIdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlltOWtlVVp2Y20xRVlYUmhJRDBnWW05a2VUdGNiaUFnSUNBZ0lIMGdaV3h6WlNCcFppQW9jM1Z3Y0c5eWRDNXpaV0Z5WTJoUVlYSmhiWE1nSmlZZ1ZWSk1VMlZoY21Ob1VHRnlZVzF6TG5CeWIzUnZkSGx3WlM1cGMxQnliM1J2ZEhsd1pVOW1LR0p2WkhrcEtTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdVgySnZaSGxVWlhoMElEMGdZbTlrZVM1MGIxTjBjbWx1WnlncE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaHpkWEJ3YjNKMExtRnljbUY1UW5WbVptVnlJQ1ltSUhOMWNIQnZjblF1WW14dllpQW1KaUJwYzBSaGRHRldhV1YzS0dKdlpIa3BLU0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMkp2WkhsQmNuSmhlVUoxWm1abGNpQTlJR0oxWm1abGNrTnNiMjVsS0dKdlpIa3VZblZtWm1WeUtUdGNiaUFnSUNBZ0lDQWdMeThnU1VVZ01UQXRNVEVnWTJGdUozUWdhR0Z1Wkd4bElHRWdSR0YwWVZacFpYY2dZbTlrZVM1Y2JpQWdJQ0FnSUNBZ2RHaHBjeTVmWW05a2VVbHVhWFFnUFNCdVpYY2dRbXh2WWloYmRHaHBjeTVmWW05a2VVRnljbUY1UW5WbVptVnlYU2s3WEc0Z0lDQWdJQ0I5SUdWc2MyVWdhV1lnS0hOMWNIQnZjblF1WVhKeVlYbENkV1ptWlhJZ0ppWWdLRUZ5Y21GNVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1cGMxQnliM1J2ZEhsd1pVOW1LR0p2WkhrcElIeDhJR2x6UVhKeVlYbENkV1ptWlhKV2FXVjNLR0p2WkhrcEtTa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxsOWliMlI1UVhKeVlYbENkV1ptWlhJZ1BTQmlkV1ptWlhKRGJHOXVaU2hpYjJSNUtUdGNiaUFnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDJKdlpIbFVaWGgwSUQwZ1ltOWtlU0E5SUU5aWFtVmpkQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWN1WTJGc2JDaGliMlI1S1R0Y2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2FXWWdLQ0YwYUdsekxtaGxZV1JsY25NdVoyVjBLQ2RqYjI1MFpXNTBMWFI1Y0dVbktTa2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUdKdlpIa2dQVDA5SUNkemRISnBibWNuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1b1pXRmtaWEp6TG5ObGRDZ25ZMjl1ZEdWdWRDMTBlWEJsSnl3Z0ozUmxlSFF2Y0d4aGFXNDdZMmhoY25ObGREMVZWRVl0T0NjcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFJvYVhNdVgySnZaSGxDYkc5aUlDWW1JSFJvYVhNdVgySnZaSGxDYkc5aUxuUjVjR1VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQjBhR2x6TG1obFlXUmxjbk11YzJWMEtDZGpiMjUwWlc1MExYUjVjR1VuTENCMGFHbHpMbDlpYjJSNVFteHZZaTUwZVhCbEtUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h6ZFhCd2IzSjBMbk5sWVhKamFGQmhjbUZ0Y3lBbUppQlZVa3hUWldGeVkyaFFZWEpoYlhNdWNISnZkRzkwZVhCbExtbHpVSEp2ZEc5MGVYQmxUMllvWW05a2VTa3BJSHRjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMbWhsWVdSbGNuTXVjMlYwS0NkamIyNTBaVzUwTFhSNWNHVW5MQ0FuWVhCd2JHbGpZWFJwYjI0dmVDMTNkM2N0Wm05eWJTMTFjbXhsYm1OdlpHVmtPMk5vWVhKelpYUTlWVlJHTFRnbktUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMDdYRzVjYmlBZ0lDQnBaaUFvYzNWd2NHOXlkQzVpYkc5aUtTQjdYRzRnSUNBZ0lDQjBhR2x6TG1Kc2IySWdQU0JtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYW1WamRHVmtJRDBnWTI5dWMzVnRaV1FvZEdocGN5azdYRzRnSUNBZ0lDQWdJR2xtSUNoeVpXcGxZM1JsWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnlaV3BsWTNSbFpGeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDJKdlpIbENiRzlpS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlGQnliMjFwYzJVdWNtVnpiMngyWlNoMGFHbHpMbDlpYjJSNVFteHZZaWxjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNoMGFHbHpMbDlpYjJSNVFYSnlZWGxDZFdabVpYSXBJSHRjYmlBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnVUhKdmJXbHpaUzV5WlhOdmJIWmxLRzVsZHlCQ2JHOWlLRnQwYUdsekxsOWliMlI1UVhKeVlYbENkV1ptWlhKZEtTbGNiaUFnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2gwYUdsekxsOWliMlI1Um05eWJVUmhkR0VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0oyTnZkV3hrSUc1dmRDQnlaV0ZrSUVadmNtMUVZWFJoSUdKdlpIa2dZWE1nWW14dllpY3BYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJRkJ5YjIxcGMyVXVjbVZ6YjJ4MlpTaHVaWGNnUW14dllpaGJkR2hwY3k1ZlltOWtlVlJsZUhSZEtTbGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnZEdocGN5NWhjbkpoZVVKMVptWmxjaUE5SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZZbTlrZVVGeWNtRjVRblZtWm1WeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnZG1GeUlHbHpRMjl1YzNWdFpXUWdQU0JqYjI1emRXMWxaQ2gwYUdsektUdGNiaUFnSUNBZ0lDQWdJQ0JwWmlBb2FYTkRiMjV6ZFcxbFpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdselEyOXVjM1Z0WldSY2JpQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tFRnljbUY1UW5WbVptVnlMbWx6Vm1sbGR5aDBhR2x6TGw5aWIyUjVRWEp5WVhsQ2RXWm1aWElwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdVSEp2YldselpTNXlaWE52YkhabEtGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDlpYjJSNVFYSnlZWGxDZFdabVpYSXVZblZtWm1WeUxuTnNhV05sS0Z4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMkp2WkhsQmNuSmhlVUoxWm1abGNpNWllWFJsVDJabWMyVjBMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgySnZaSGxCY25KaGVVSjFabVpsY2k1aWVYUmxUMlptYzJWMElDc2dkR2hwY3k1ZlltOWtlVUZ5Y21GNVFuVm1abVZ5TG1KNWRHVk1aVzVuZEdoY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnS1Z4dUlDQWdJQ0FnSUNBZ0lDQWdLVnh1SUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1VISnZiV2x6WlM1eVpYTnZiSFpsS0hSb2FYTXVYMkp2WkhsQmNuSmhlVUoxWm1abGNpbGNiaUFnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSb2FYTXVZbXh2WWlncExuUm9aVzRvY21WaFpFSnNiMkpCYzBGeWNtRjVRblZtWm1WeUtWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIUm9hWE11ZEdWNGRDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnZG1GeUlISmxhbVZqZEdWa0lEMGdZMjl1YzNWdFpXUW9kR2hwY3lrN1hHNGdJQ0FnSUNCcFppQW9jbVZxWldOMFpXUXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYW1WamRHVmtYRzRnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJR2xtSUNoMGFHbHpMbDlpYjJSNVFteHZZaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnY21WaFpFSnNiMkpCYzFSbGVIUW9kR2hwY3k1ZlltOWtlVUpzYjJJcFhHNGdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tIUm9hWE11WDJKdlpIbEJjbkpoZVVKMVptWmxjaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnVUhKdmJXbHpaUzV5WlhOdmJIWmxLSEpsWVdSQmNuSmhlVUoxWm1abGNrRnpWR1Y0ZENoMGFHbHpMbDlpYjJSNVFYSnlZWGxDZFdabVpYSXBLVnh1SUNBZ0lDQWdmU0JsYkhObElHbG1JQ2gwYUdsekxsOWliMlI1Um05eWJVUmhkR0VwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkamIzVnNaQ0J1YjNRZ2NtVmhaQ0JHYjNKdFJHRjBZU0JpYjJSNUlHRnpJSFJsZUhRbktWeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUZCeWIyMXBjMlV1Y21WemIyeDJaU2gwYUdsekxsOWliMlI1VkdWNGRDbGNiaUFnSUNBZ0lIMWNiaUFnSUNCOU8xeHVYRzRnSUNBZ2FXWWdLSE4xY0hCdmNuUXVabTl5YlVSaGRHRXBJSHRjYmlBZ0lDQWdJSFJvYVhNdVptOXliVVJoZEdFZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdWRHVjRkQ2dwTG5Sb1pXNG9aR1ZqYjJSbEtWeHVJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNCMGFHbHpMbXB6YjI0Z1BTQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQjBhR2x6TG5SbGVIUW9LUzUwYUdWdUtFcFRUMDR1Y0dGeWMyVXBYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpYRzRnSUgxY2JseHVJQ0F2THlCSVZGUlFJRzFsZEdodlpITWdkMmh2YzJVZ1kyRndhWFJoYkdsNllYUnBiMjRnYzJodmRXeGtJR0psSUc1dmNtMWhiR2w2WldSY2JpQWdkbUZ5SUcxbGRHaHZaSE1nUFNCYkowUkZURVZVUlNjc0lDZEhSVlFuTENBblNFVkJSQ2NzSUNkUFVGUkpUMDVUSnl3Z0oxQlBVMVFuTENBblVGVlVKMTA3WEc1Y2JpQWdablZ1WTNScGIyNGdibTl5YldGc2FYcGxUV1YwYUc5a0tHMWxkR2h2WkNrZ2UxeHVJQ0FnSUhaaGNpQjFjR05oYzJWa0lEMGdiV1YwYUc5a0xuUnZWWEJ3WlhKRFlYTmxLQ2s3WEc0Z0lDQWdjbVYwZFhKdUlHMWxkR2h2WkhNdWFXNWtaWGhQWmloMWNHTmhjMlZrS1NBK0lDMHhJRDhnZFhCallYTmxaQ0E2SUcxbGRHaHZaRnh1SUNCOVhHNWNiaUFnWm5WdVkzUnBiMjRnVW1WeGRXVnpkQ2hwYm5CMWRDd2diM0IwYVc5dWN5a2dlMXh1SUNBZ0lHbG1JQ2doS0hSb2FYTWdhVzV6ZEdGdVkyVnZaaUJTWlhGMVpYTjBLU2tnZTF4dUlDQWdJQ0FnZEdoeWIzY2dibVYzSUZSNWNHVkZjbkp2Y2lnblVHeGxZWE5sSUhWelpTQjBhR1VnWENKdVpYZGNJaUJ2Y0dWeVlYUnZjaXdnZEdocGN5QkVUMDBnYjJKcVpXTjBJR052Ym5OMGNuVmpkRzl5SUdOaGJtNXZkQ0JpWlNCallXeHNaV1FnWVhNZ1lTQm1kVzVqZEdsdmJpNG5LVnh1SUNBZ0lIMWNibHh1SUNBZ0lHOXdkR2x2Ym5NZ1BTQnZjSFJwYjI1eklIeDhJSHQ5TzF4dUlDQWdJSFpoY2lCaWIyUjVJRDBnYjNCMGFXOXVjeTVpYjJSNU8xeHVYRzRnSUNBZ2FXWWdLR2x1Y0hWMElHbHVjM1JoYm1ObGIyWWdVbVZ4ZFdWemRDa2dlMXh1SUNBZ0lDQWdhV1lnS0dsdWNIVjBMbUp2WkhsVmMyVmtLU0I3WEc0Z0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCVWVYQmxSWEp5YjNJb0owRnNjbVZoWkhrZ2NtVmhaQ2NwWEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0IwYUdsekxuVnliQ0E5SUdsdWNIVjBMblZ5YkR0Y2JpQWdJQ0FnSUhSb2FYTXVZM0psWkdWdWRHbGhiSE1nUFNCcGJuQjFkQzVqY21Wa1pXNTBhV0ZzY3p0Y2JpQWdJQ0FnSUdsbUlDZ2hiM0IwYVc5dWN5NW9aV0ZrWlhKektTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdWFHVmhaR1Z5Y3lBOUlHNWxkeUJJWldGa1pYSnpLR2x1Y0hWMExtaGxZV1JsY25NcE8xeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2RHaHBjeTV0WlhSb2IyUWdQU0JwYm5CMWRDNXRaWFJvYjJRN1hHNGdJQ0FnSUNCMGFHbHpMbTF2WkdVZ1BTQnBibkIxZEM1dGIyUmxPMXh1SUNBZ0lDQWdkR2hwY3k1emFXZHVZV3dnUFNCcGJuQjFkQzV6YVdkdVlXdzdYRzRnSUNBZ0lDQnBaaUFvSVdKdlpIa2dKaVlnYVc1d2RYUXVYMkp2WkhsSmJtbDBJQ0U5SUc1MWJHd3BJSHRjYmlBZ0lDQWdJQ0FnWW05a2VTQTlJR2x1Y0hWMExsOWliMlI1U1c1cGREdGNiaUFnSUNBZ0lDQWdhVzV3ZFhRdVltOWtlVlZ6WldRZ1BTQjBjblZsTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQjBhR2x6TG5WeWJDQTlJRk4wY21sdVp5aHBibkIxZENrN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnZEdocGN5NWpjbVZrWlc1MGFXRnNjeUE5SUc5d2RHbHZibk11WTNKbFpHVnVkR2xoYkhNZ2ZId2dkR2hwY3k1amNtVmtaVzUwYVdGc2N5QjhmQ0FuYzJGdFpTMXZjbWxuYVc0bk8xeHVJQ0FnSUdsbUlDaHZjSFJwYjI1ekxtaGxZV1JsY25NZ2ZId2dJWFJvYVhNdWFHVmhaR1Z5Y3lrZ2UxeHVJQ0FnSUNBZ2RHaHBjeTVvWldGa1pYSnpJRDBnYm1WM0lFaGxZV1JsY25Nb2IzQjBhVzl1Y3k1b1pXRmtaWEp6S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdkR2hwY3k1dFpYUm9iMlFnUFNCdWIzSnRZV3hwZW1WTlpYUm9iMlFvYjNCMGFXOXVjeTV0WlhSb2IyUWdmSHdnZEdocGN5NXRaWFJvYjJRZ2ZId2dKMGRGVkNjcE8xeHVJQ0FnSUhSb2FYTXViVzlrWlNBOUlHOXdkR2x2Ym5NdWJXOWtaU0I4ZkNCMGFHbHpMbTF2WkdVZ2ZId2diblZzYkR0Y2JpQWdJQ0IwYUdsekxuTnBaMjVoYkNBOUlHOXdkR2x2Ym5NdWMybG5ibUZzSUh4OElIUm9hWE11YzJsbmJtRnNPMXh1SUNBZ0lIUm9hWE11Y21WbVpYSnlaWElnUFNCdWRXeHNPMXh1WEc0Z0lDQWdhV1lnS0NoMGFHbHpMbTFsZEdodlpDQTlQVDBnSjBkRlZDY2dmSHdnZEdocGN5NXRaWFJvYjJRZ1BUMDlJQ2RJUlVGRUp5a2dKaVlnWW05a2VTa2dlMXh1SUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWduUW05a2VTQnViM1FnWVd4c2IzZGxaQ0JtYjNJZ1IwVlVJRzl5SUVoRlFVUWdjbVZ4ZFdWemRITW5LVnh1SUNBZ0lIMWNiaUFnSUNCMGFHbHpMbDlwYm1sMFFtOWtlU2hpYjJSNUtUdGNibHh1SUNBZ0lHbG1JQ2gwYUdsekxtMWxkR2h2WkNBOVBUMGdKMGRGVkNjZ2ZId2dkR2hwY3k1dFpYUm9iMlFnUFQwOUlDZElSVUZFSnlrZ2UxeHVJQ0FnSUNBZ2FXWWdLRzl3ZEdsdmJuTXVZMkZqYUdVZ1BUMDlJQ2R1YnkxemRHOXlaU2NnZkh3Z2IzQjBhVzl1Y3k1allXTm9aU0E5UFQwZ0oyNXZMV05oWTJobEp5a2dlMXh1SUNBZ0lDQWdJQ0F2THlCVFpXRnlZMmdnWm05eUlHRWdKMThuSUhCaGNtRnRaWFJsY2lCcGJpQjBhR1VnY1hWbGNua2djM1J5YVc1blhHNGdJQ0FnSUNBZ0lIWmhjaUJ5WlZCaGNtRnRVMlZoY21Ob0lEMGdMeWhiUHlaZEtWODlXMTRtWFNvdk8xeHVJQ0FnSUNBZ0lDQnBaaUFvY21WUVlYSmhiVk5sWVhKamFDNTBaWE4wS0hSb2FYTXVkWEpzS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQzh2SUVsbUlHbDBJR0ZzY21WaFpIa2daWGhwYzNSeklIUm9aVzRnYzJWMElIUm9aU0IyWVd4MVpTQjNhWFJvSUhSb1pTQmpkWEp5Wlc1MElIUnBiV1ZjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMblZ5YkNBOUlIUm9hWE11ZFhKc0xuSmxjR3hoWTJVb2NtVlFZWEpoYlZObFlYSmphQ3dnSnlReFh6MG5JQ3NnYm1WM0lFUmhkR1VvS1M1blpYUlVhVzFsS0NrcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQzh2SUU5MGFHVnlkMmx6WlNCaFpHUWdZU0J1WlhjZ0oxOG5JSEJoY21GdFpYUmxjaUIwYnlCMGFHVWdaVzVrSUhkcGRHZ2dkR2hsSUdOMWNuSmxiblFnZEdsdFpWeHVJQ0FnSUNBZ0lDQWdJSFpoY2lCeVpWRjFaWEo1VTNSeWFXNW5JRDBnTDF4Y1B5ODdYRzRnSUNBZ0lDQWdJQ0FnZEdocGN5NTFjbXdnS3owZ0tISmxVWFZsY25sVGRISnBibWN1ZEdWemRDaDBhR2x6TG5WeWJDa2dQeUFuSmljZ09pQW5QeWNwSUNzZ0oxODlKeUFySUc1bGR5QkVZWFJsS0NrdVoyVjBWR2x0WlNncE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdVbVZ4ZFdWemRDNXdjbTkwYjNSNWNHVXVZMnh2Ym1VZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQnlaWFIxY200Z2JtVjNJRkpsY1hWbGMzUW9kR2hwY3l3Z2UySnZaSGs2SUhSb2FYTXVYMkp2WkhsSmJtbDBmU2xjYmlBZ2ZUdGNibHh1SUNCbWRXNWpkR2x2YmlCa1pXTnZaR1VvWW05a2VTa2dlMXh1SUNBZ0lIWmhjaUJtYjNKdElEMGdibVYzSUVadmNtMUVZWFJoS0NrN1hHNGdJQ0FnWW05a2VWeHVJQ0FnSUNBZ0xuUnlhVzBvS1Z4dUlDQWdJQ0FnTG5Od2JHbDBLQ2NtSnlsY2JpQWdJQ0FnSUM1bWIzSkZZV05vS0daMWJtTjBhVzl1S0dKNWRHVnpLU0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaGllWFJsY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJSFpoY2lCemNHeHBkQ0E5SUdKNWRHVnpMbk53YkdsMEtDYzlKeWs3WEc0Z0lDQWdJQ0FnSUNBZ2RtRnlJRzVoYldVZ1BTQnpjR3hwZEM1emFHbG1kQ2dwTG5KbGNHeGhZMlVvTDF4Y0t5OW5MQ0FuSUNjcE8xeHVJQ0FnSUNBZ0lDQWdJSFpoY2lCMllXeDFaU0E5SUhOd2JHbDBMbXB2YVc0b0p6MG5LUzV5WlhCc1lXTmxLQzljWENzdlp5d2dKeUFuS1R0Y2JpQWdJQ0FnSUNBZ0lDQm1iM0p0TG1Gd2NHVnVaQ2hrWldOdlpHVlZVa2xEYjIxd2IyNWxiblFvYm1GdFpTa3NJR1JsWTI5a1pWVlNTVU52YlhCdmJtVnVkQ2gyWVd4MVpTa3BPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0I5S1R0Y2JpQWdJQ0J5WlhSMWNtNGdabTl5YlZ4dUlDQjlYRzVjYmlBZ1puVnVZM1JwYjI0Z2NHRnljMlZJWldGa1pYSnpLSEpoZDBobFlXUmxjbk1wSUh0Y2JpQWdJQ0IyWVhJZ2FHVmhaR1Z5Y3lBOUlHNWxkeUJJWldGa1pYSnpLQ2s3WEc0Z0lDQWdMeThnVW1Wd2JHRmpaU0JwYm5OMFlXNWpaWE1nYjJZZ1hGeHlYRnh1SUdGdVpDQmNYRzRnWm05c2JHOTNaV1FnWW5rZ1lYUWdiR1ZoYzNRZ2IyNWxJSE53WVdObElHOXlJR2h2Y21sNmIyNTBZV3dnZEdGaUlIZHBkR2dnWVNCemNHRmpaVnh1SUNBZ0lDOHZJR2gwZEhCek9pOHZkRzl2YkhNdWFXVjBaaTV2Y21jdmFIUnRiQzl5Wm1NM01qTXdJM05sWTNScGIyNHRNeTR5WEc0Z0lDQWdkbUZ5SUhCeVpWQnliMk5sYzNObFpFaGxZV1JsY25NZ1BTQnlZWGRJWldGa1pYSnpMbkpsY0d4aFkyVW9MMXhjY2o5Y1hHNWJYRngwSUYwckwyY3NJQ2NnSnlrN1hHNGdJQ0FnTHk4Z1FYWnZhV1JwYm1jZ2MzQnNhWFFnZG1saElISmxaMlY0SUhSdklIZHZjbXNnWVhKdmRXNWtJR0VnWTI5dGJXOXVJRWxGTVRFZ1luVm5JSGRwZEdnZ2RHaGxJR052Y21VdGFuTWdNeTQyTGpBZ2NtVm5aWGdnY0c5c2VXWnBiR3hjYmlBZ0lDQXZMeUJvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2WjJsMGFIVmlMMlpsZEdOb0wybHpjM1ZsY3k4M05EaGNiaUFnSUNBdkx5Qm9kSFJ3Y3pvdkwyZHBkR2gxWWk1amIyMHZlbXh2YVhKdlkyc3ZZMjl5WlMxcWN5OXBjM04xWlhNdk56VXhYRzRnSUNBZ2NISmxVSEp2WTJWemMyVmtTR1ZoWkdWeWMxeHVJQ0FnSUNBZ0xuTndiR2wwS0NkY1hISW5LVnh1SUNBZ0lDQWdMbTFoY0NobWRXNWpkR2x2Ymlob1pXRmtaWElwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdobFlXUmxjaTVwYm1SbGVFOW1LQ2RjWEc0bktTQTlQVDBnTUNBL0lHaGxZV1JsY2k1emRXSnpkSElvTVN3Z2FHVmhaR1Z5TG14bGJtZDBhQ2tnT2lCb1pXRmtaWEpjYmlBZ0lDQWdJSDBwWEc0Z0lDQWdJQ0F1Wm05eVJXRmphQ2htZFc1amRHbHZiaWhzYVc1bEtTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCd1lYSjBjeUE5SUd4cGJtVXVjM0JzYVhRb0p6b25LVHRjYmlBZ0lDQWdJQ0FnZG1GeUlHdGxlU0E5SUhCaGNuUnpMbk5vYVdaMEtDa3VkSEpwYlNncE8xeHVJQ0FnSUNBZ0lDQnBaaUFvYTJWNUtTQjdYRzRnSUNBZ0lDQWdJQ0FnZG1GeUlIWmhiSFZsSUQwZ2NHRnlkSE11YW05cGJpZ25PaWNwTG5SeWFXMG9LVHRjYmlBZ0lDQWdJQ0FnSUNCb1pXRmtaWEp6TG1Gd2NHVnVaQ2hyWlhrc0lIWmhiSFZsS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2NtVjBkWEp1SUdobFlXUmxjbk5jYmlBZ2ZWeHVYRzRnSUVKdlpIa3VZMkZzYkNoU1pYRjFaWE4wTG5CeWIzUnZkSGx3WlNrN1hHNWNiaUFnWm5WdVkzUnBiMjRnVW1WemNHOXVjMlVvWW05a2VVbHVhWFFzSUc5d2RHbHZibk1wSUh0Y2JpQWdJQ0JwWmlBb0lTaDBhR2x6SUdsdWMzUmhibU5sYjJZZ1VtVnpjRzl1YzJVcEtTQjdYRzRnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLQ2RRYkdWaGMyVWdkWE5sSUhSb1pTQmNJbTVsZDF3aUlHOXdaWEpoZEc5eUxDQjBhR2x6SUVSUFRTQnZZbXBsWTNRZ1kyOXVjM1J5ZFdOMGIzSWdZMkZ1Ym05MElHSmxJR05oYkd4bFpDQmhjeUJoSUdaMWJtTjBhVzl1TGljcFhHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNnaGIzQjBhVzl1Y3lrZ2UxeHVJQ0FnSUNBZ2IzQjBhVzl1Y3lBOUlIdDlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIUm9hWE11ZEhsd1pTQTlJQ2RrWldaaGRXeDBKenRjYmlBZ0lDQjBhR2x6TG5OMFlYUjFjeUE5SUc5d2RHbHZibk11YzNSaGRIVnpJRDA5UFNCMWJtUmxabWx1WldRZ1B5QXlNREFnT2lCdmNIUnBiMjV6TG5OMFlYUjFjenRjYmlBZ0lDQjBhR2x6TG05cklEMGdkR2hwY3k1emRHRjBkWE1nUGowZ01qQXdJQ1ltSUhSb2FYTXVjM1JoZEhWeklEd2dNekF3TzF4dUlDQWdJSFJvYVhNdWMzUmhkSFZ6VkdWNGRDQTlJRzl3ZEdsdmJuTXVjM1JoZEhWelZHVjRkQ0E5UFQwZ2RXNWtaV1pwYm1Wa0lEOGdKeWNnT2lBbkp5QXJJRzl3ZEdsdmJuTXVjM1JoZEhWelZHVjRkRHRjYmlBZ0lDQjBhR2x6TG1obFlXUmxjbk1nUFNCdVpYY2dTR1ZoWkdWeWN5aHZjSFJwYjI1ekxtaGxZV1JsY25NcE8xeHVJQ0FnSUhSb2FYTXVkWEpzSUQwZ2IzQjBhVzl1Y3k1MWNtd2dmSHdnSnljN1hHNGdJQ0FnZEdocGN5NWZhVzVwZEVKdlpIa29ZbTlrZVVsdWFYUXBPMXh1SUNCOVhHNWNiaUFnUW05a2VTNWpZV3hzS0ZKbGMzQnZibk5sTG5CeWIzUnZkSGx3WlNrN1hHNWNiaUFnVW1WemNHOXVjMlV1Y0hKdmRHOTBlWEJsTG1Oc2IyNWxJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnY21WMGRYSnVJRzVsZHlCU1pYTndiMjV6WlNoMGFHbHpMbDlpYjJSNVNXNXBkQ3dnZTF4dUlDQWdJQ0FnYzNSaGRIVnpPaUIwYUdsekxuTjBZWFIxY3l4Y2JpQWdJQ0FnSUhOMFlYUjFjMVJsZUhRNklIUm9hWE11YzNSaGRIVnpWR1Y0ZEN4Y2JpQWdJQ0FnSUdobFlXUmxjbk02SUc1bGR5QklaV0ZrWlhKektIUm9hWE11YUdWaFpHVnljeWtzWEc0Z0lDQWdJQ0IxY213NklIUm9hWE11ZFhKc1hHNGdJQ0FnZlNsY2JpQWdmVHRjYmx4dUlDQlNaWE53YjI1elpTNWxjbkp2Y2lBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lIWmhjaUJ5WlhOd2IyNXpaU0E5SUc1bGR5QlNaWE53YjI1elpTaHVkV3hzTENCN2MzUmhkSFZ6T2lBd0xDQnpkR0YwZFhOVVpYaDBPaUFuSjMwcE8xeHVJQ0FnSUhKbGMzQnZibk5sTG5SNWNHVWdQU0FuWlhKeWIzSW5PMXh1SUNBZ0lISmxkSFZ5YmlCeVpYTndiMjV6WlZ4dUlDQjlPMXh1WEc0Z0lIWmhjaUJ5WldScGNtVmpkRk4wWVhSMWMyVnpJRDBnV3pNd01Td2dNekF5TENBek1ETXNJRE13Tnl3Z016QTRYVHRjYmx4dUlDQlNaWE53YjI1elpTNXlaV1JwY21WamRDQTlJR1oxYm1OMGFXOXVLSFZ5YkN3Z2MzUmhkSFZ6S1NCN1hHNGdJQ0FnYVdZZ0tISmxaR2x5WldOMFUzUmhkSFZ6WlhNdWFXNWtaWGhQWmloemRHRjBkWE1wSUQwOVBTQXRNU2tnZTF4dUlDQWdJQ0FnZEdoeWIzY2dibVYzSUZKaGJtZGxSWEp5YjNJb0owbHVkbUZzYVdRZ2MzUmhkSFZ6SUdOdlpHVW5LVnh1SUNBZ0lIMWNibHh1SUNBZ0lISmxkSFZ5YmlCdVpYY2dVbVZ6Y0c5dWMyVW9iblZzYkN3Z2UzTjBZWFIxY3pvZ2MzUmhkSFZ6TENCb1pXRmtaWEp6T2lCN2JHOWpZWFJwYjI0NklIVnliSDE5S1Z4dUlDQjlPMXh1WEc0Z0lHVjRjRzl5ZEhNdVJFOU5SWGhqWlhCMGFXOXVJRDBnWjJ4dlltRnNMa1JQVFVWNFkyVndkR2x2Ymp0Y2JpQWdkSEo1SUh0Y2JpQWdJQ0J1WlhjZ1pYaHdiM0owY3k1RVQwMUZlR05sY0hScGIyNG9LVHRjYmlBZ2ZTQmpZWFJqYUNBb1pYSnlLU0I3WEc0Z0lDQWdaWGh3YjNKMGN5NUVUMDFGZUdObGNIUnBiMjRnUFNCbWRXNWpkR2x2YmlodFpYTnpZV2RsTENCdVlXMWxLU0I3WEc0Z0lDQWdJQ0IwYUdsekxtMWxjM05oWjJVZ1BTQnRaWE56WVdkbE8xeHVJQ0FnSUNBZ2RHaHBjeTV1WVcxbElEMGdibUZ0WlR0Y2JpQWdJQ0FnSUhaaGNpQmxjbkp2Y2lBOUlFVnljbTl5S0cxbGMzTmhaMlVwTzF4dUlDQWdJQ0FnZEdocGN5NXpkR0ZqYXlBOUlHVnljbTl5TG5OMFlXTnJPMXh1SUNBZ0lIMDdYRzRnSUNBZ1pYaHdiM0owY3k1RVQwMUZlR05sY0hScGIyNHVjSEp2ZEc5MGVYQmxJRDBnVDJKcVpXTjBMbU55WldGMFpTaEZjbkp2Y2k1d2NtOTBiM1I1Y0dVcE8xeHVJQ0FnSUdWNGNHOXlkSE11UkU5TlJYaGpaWEIwYVc5dUxuQnliM1J2ZEhsd1pTNWpiMjV6ZEhKMVkzUnZjaUE5SUdWNGNHOXlkSE11UkU5TlJYaGpaWEIwYVc5dU8xeHVJQ0I5WEc1Y2JpQWdablZ1WTNScGIyNGdabVYwWTJnb2FXNXdkWFFzSUdsdWFYUXBJSHRjYmlBZ0lDQnlaWFIxY200Z2JtVjNJRkJ5YjIxcGMyVW9ablZ1WTNScGIyNG9jbVZ6YjJ4MlpTd2djbVZxWldOMEtTQjdYRzRnSUNBZ0lDQjJZWElnY21WeGRXVnpkQ0E5SUc1bGR5QlNaWEYxWlhOMEtHbHVjSFYwTENCcGJtbDBLVHRjYmx4dUlDQWdJQ0FnYVdZZ0tISmxjWFZsYzNRdWMybG5ibUZzSUNZbUlISmxjWFZsYzNRdWMybG5ibUZzTG1GaWIzSjBaV1FwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhKbGFtVmpkQ2h1WlhjZ1pYaHdiM0owY3k1RVQwMUZlR05sY0hScGIyNG9KMEZpYjNKMFpXUW5MQ0FuUVdKdmNuUkZjbkp2Y2ljcEtWeHVJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQjJZWElnZUdoeUlEMGdibVYzSUZoTlRFaDBkSEJTWlhGMVpYTjBLQ2s3WEc1Y2JpQWdJQ0FnSUdaMWJtTjBhVzl1SUdGaWIzSjBXR2h5S0NrZ2UxeHVJQ0FnSUNBZ0lDQjRhSEl1WVdKdmNuUW9LVHRjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnZUdoeUxtOXViRzloWkNBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2IzQjBhVzl1Y3lBOUlIdGNiaUFnSUNBZ0lDQWdJQ0J6ZEdGMGRYTTZJSGhvY2k1emRHRjBkWE1zWEc0Z0lDQWdJQ0FnSUNBZ2MzUmhkSFZ6VkdWNGREb2dlR2h5TG5OMFlYUjFjMVJsZUhRc1hHNGdJQ0FnSUNBZ0lDQWdhR1ZoWkdWeWN6b2djR0Z5YzJWSVpXRmtaWEp6S0hob2NpNW5aWFJCYkd4U1pYTndiMjV6WlVobFlXUmxjbk1vS1NCOGZDQW5KeWxjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ2IzQjBhVzl1Y3k1MWNtd2dQU0FuY21WemNHOXVjMlZWVWt3bklHbHVJSGhvY2lBL0lIaG9jaTV5WlhOd2IyNXpaVlZTVENBNklHOXdkR2x2Ym5NdWFHVmhaR1Z5Y3k1blpYUW9KMWd0VW1WeGRXVnpkQzFWVWt3bktUdGNiaUFnSUNBZ0lDQWdkbUZ5SUdKdlpIa2dQU0FuY21WemNHOXVjMlVuSUdsdUlIaG9jaUEvSUhob2NpNXlaWE53YjI1elpTQTZJSGhvY2k1eVpYTndiMjV6WlZSbGVIUTdYRzRnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVZ6YjJ4MlpTaHVaWGNnVW1WemNHOXVjMlVvWW05a2VTd2diM0IwYVc5dWN5a3BPMXh1SUNBZ0lDQWdJQ0I5TENBd0tUdGNiaUFnSUNBZ0lIMDdYRzVjYmlBZ0lDQWdJSGhvY2k1dmJtVnljbTl5SUQwZ1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVZxWldOMEtHNWxkeUJVZVhCbFJYSnliM0lvSjA1bGRIZHZjbXNnY21WeGRXVnpkQ0JtWVdsc1pXUW5LU2s3WEc0Z0lDQWdJQ0FnSUgwc0lEQXBPMXh1SUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnZUdoeUxtOXVkR2x0Wlc5MWRDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNCelpYUlVhVzFsYjNWMEtHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUhKbGFtVmpkQ2h1WlhjZ1ZIbHdaVVZ5Y205eUtDZE9aWFIzYjNKcklISmxjWFZsYzNRZ1ptRnBiR1ZrSnlrcE8xeHVJQ0FnSUNBZ0lDQjlMQ0F3S1R0Y2JpQWdJQ0FnSUgwN1hHNWNiaUFnSUNBZ0lIaG9jaTV2Ym1GaWIzSjBJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ2NtVnFaV04wS0c1bGR5QmxlSEJ2Y25SekxrUlBUVVY0WTJWd2RHbHZiaWduUVdKdmNuUmxaQ2NzSUNkQlltOXlkRVZ5Y205eUp5a3BPMXh1SUNBZ0lDQWdJQ0I5TENBd0tUdGNiaUFnSUNBZ0lIMDdYRzVjYmlBZ0lDQWdJR1oxYm1OMGFXOXVJR1pwZUZWeWJDaDFjbXdwSUh0Y2JpQWdJQ0FnSUNBZ2RISjVJSHRjYmlBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZFhKc0lEMDlQU0FuSnlBbUppQm5iRzlpWVd3dWJHOWpZWFJwYjI0dWFISmxaaUEvSUdkc2IySmhiQzVzYjJOaGRHbHZiaTVvY21WbUlEb2dkWEpzWEc0Z0lDQWdJQ0FnSUgwZ1kyRjBZMmdnS0dVcElIdGNiaUFnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdkWEpzWEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2VHaHlMbTl3Wlc0b2NtVnhkV1Z6ZEM1dFpYUm9iMlFzSUdacGVGVnliQ2h5WlhGMVpYTjBMblZ5YkNrc0lIUnlkV1VwTzF4dVhHNGdJQ0FnSUNCcFppQW9jbVZ4ZFdWemRDNWpjbVZrWlc1MGFXRnNjeUE5UFQwZ0oybHVZMngxWkdVbktTQjdYRzRnSUNBZ0lDQWdJSGhvY2k1M2FYUm9RM0psWkdWdWRHbGhiSE1nUFNCMGNuVmxPMXh1SUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h5WlhGMVpYTjBMbU55WldSbGJuUnBZV3h6SUQwOVBTQW5iMjFwZENjcElIdGNiaUFnSUNBZ0lDQWdlR2h5TG5kcGRHaERjbVZrWlc1MGFXRnNjeUE5SUdaaGJITmxPMXh1SUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0JwWmlBb0ozSmxjM0J2Ym5ObFZIbHdaU2NnYVc0Z2VHaHlLU0I3WEc0Z0lDQWdJQ0FnSUdsbUlDaHpkWEJ3YjNKMExtSnNiMklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQjRhSEl1Y21WemNHOXVjMlZVZVhCbElEMGdKMkpzYjJJbk8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLRnh1SUNBZ0lDQWdJQ0FnSUhOMWNIQnZjblF1WVhKeVlYbENkV1ptWlhJZ0ppWmNiaUFnSUNBZ0lDQWdJQ0J5WlhGMVpYTjBMbWhsWVdSbGNuTXVaMlYwS0NkRGIyNTBaVzUwTFZSNWNHVW5LU0FtSmx4dUlDQWdJQ0FnSUNBZ0lISmxjWFZsYzNRdWFHVmhaR1Z5Y3k1blpYUW9KME52Ym5SbGJuUXRWSGx3WlNjcExtbHVaR1Y0VDJZb0oyRndjR3hwWTJGMGFXOXVMMjlqZEdWMExYTjBjbVZoYlNjcElDRTlQU0F0TVZ4dUlDQWdJQ0FnSUNBcElIdGNiaUFnSUNBZ0lDQWdJQ0I0YUhJdWNtVnpjRzl1YzJWVWVYQmxJRDBnSjJGeWNtRjVZblZtWm1WeUp6dGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0JwWmlBb2FXNXBkQ0FtSmlCMGVYQmxiMllnYVc1cGRDNW9aV0ZrWlhKeklEMDlQU0FuYjJKcVpXTjBKeUFtSmlBaEtHbHVhWFF1YUdWaFpHVnljeUJwYm5OMFlXNWpaVzltSUVobFlXUmxjbk1wS1NCN1hHNGdJQ0FnSUNBZ0lFOWlhbVZqZEM1blpYUlBkMjVRY205d1pYSjBlVTVoYldWektHbHVhWFF1YUdWaFpHVnljeWt1Wm05eVJXRmphQ2htZFc1amRHbHZiaWh1WVcxbEtTQjdYRzRnSUNBZ0lDQWdJQ0FnZUdoeUxuTmxkRkpsY1hWbGMzUklaV0ZrWlhJb2JtRnRaU3dnYm05eWJXRnNhWHBsVm1Gc2RXVW9hVzVwZEM1b1pXRmtaWEp6VzI1aGJXVmRLU2s3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2NtVnhkV1Z6ZEM1b1pXRmtaWEp6TG1admNrVmhZMmdvWm5WdVkzUnBiMjRvZG1Gc2RXVXNJRzVoYldVcElIdGNiaUFnSUNBZ0lDQWdJQ0I0YUhJdWMyVjBVbVZ4ZFdWemRFaGxZV1JsY2lodVlXMWxMQ0IyWVd4MVpTazdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNCcFppQW9jbVZ4ZFdWemRDNXphV2R1WVd3cElIdGNiaUFnSUNBZ0lDQWdjbVZ4ZFdWemRDNXphV2R1WVd3dVlXUmtSWFpsYm5STWFYTjBaVzVsY2lnbllXSnZjblFuTENCaFltOXlkRmhvY2lrN1hHNWNiaUFnSUNBZ0lDQWdlR2h5TG05dWNtVmhaSGx6ZEdGMFpXTm9ZVzVuWlNBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUM4dklFUlBUa1VnS0hOMVkyTmxjM01nYjNJZ1ptRnBiSFZ5WlNsY2JpQWdJQ0FnSUNBZ0lDQnBaaUFvZUdoeUxuSmxZV1I1VTNSaGRHVWdQVDA5SURRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGNYVmxjM1F1YzJsbmJtRnNMbkpsYlc5MlpVVjJaVzUwVEdsemRHVnVaWElvSjJGaWIzSjBKeXdnWVdKdmNuUllhSElwTzF4dUlDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnZUdoeUxuTmxibVFvZEhsd1pXOW1JSEpsY1hWbGMzUXVYMkp2WkhsSmJtbDBJRDA5UFNBbmRXNWtaV1pwYm1Wa0p5QS9JRzUxYkd3Z09pQnlaWEYxWlhOMExsOWliMlI1U1c1cGRDazdYRzRnSUNBZ2ZTbGNiaUFnZlZ4dVhHNGdJR1psZEdOb0xuQnZiSGxtYVd4c0lEMGdkSEoxWlR0Y2JseHVJQ0JwWmlBb0lXZHNiMkpoYkM1bVpYUmphQ2tnZTF4dUlDQWdJR2RzYjJKaGJDNW1aWFJqYUNBOUlHWmxkR05vTzF4dUlDQWdJR2RzYjJKaGJDNUlaV0ZrWlhKeklEMGdTR1ZoWkdWeWN6dGNiaUFnSUNCbmJHOWlZV3d1VW1WeGRXVnpkQ0E5SUZKbGNYVmxjM1E3WEc0Z0lDQWdaMnh2WW1Gc0xsSmxjM0J2Ym5ObElEMGdVbVZ6Y0c5dWMyVTdYRzRnSUgxY2JseHVJQ0JsZUhCdmNuUnpMa2hsWVdSbGNuTWdQU0JJWldGa1pYSnpPMXh1SUNCbGVIQnZjblJ6TGxKbGNYVmxjM1FnUFNCU1pYRjFaWE4wTzF4dUlDQmxlSEJ2Y25SekxsSmxjM0J2Ym5ObElEMGdVbVZ6Y0c5dWMyVTdYRzRnSUdWNGNHOXlkSE11Wm1WMFkyZ2dQU0JtWlhSamFEdGNibHh1SUNCUFltcGxZM1F1WkdWbWFXNWxVSEp2Y0dWeWRIa29aWGh3YjNKMGN5d2dKMTlmWlhOTmIyUjFiR1VuTENCN0lIWmhiSFZsT2lCMGNuVmxJSDBwTzF4dVhHNTlLU2twTzF4dUlpd2lkbUZ5SUdKek5UaGphR1ZqYXlBOUlISmxjWFZwY21Vb0oySnpOVGhqYUdWamF5Y3BYRzVjYm1aMWJtTjBhVzl1SUdSbFkyOWtaVkpoZHlBb1luVm1abVZ5TENCMlpYSnphVzl1S1NCN1hHNGdJQzh2SUdOb1pXTnJJSFpsY25OcGIyNGdiMjVzZVNCcFppQmtaV1pwYm1Wa1hHNGdJR2xtSUNoMlpYSnphVzl1SUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnWW5WbVptVnlXekJkSUNFOVBTQjJaWEp6YVc5dUtTQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owbHVkbUZzYVdRZ2JtVjBkMjl5YXlCMlpYSnphVzl1SnlsY2JseHVJQ0F2THlCMWJtTnZiWEJ5WlhOelpXUmNiaUFnYVdZZ0tHSjFabVpsY2k1c1pXNW5kR2dnUFQwOUlETXpLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIdGNiaUFnSUNBZ0lIWmxjbk5wYjI0NklHSjFabVpsY2xzd1hTeGNiaUFnSUNBZ0lIQnlhWFpoZEdWTFpYazZJR0oxWm1abGNpNXpiR2xqWlNneExDQXpNeWtzWEc0Z0lDQWdJQ0JqYjIxd2NtVnpjMlZrT2lCbVlXeHpaVnh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJQzh2SUdsdWRtRnNhV1FnYkdWdVozUm9YRzRnSUdsbUlDaGlkV1ptWlhJdWJHVnVaM1JvSUNFOVBTQXpOQ2tnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RKYm5aaGJHbGtJRmRKUmlCc1pXNW5kR2duS1Z4dVhHNGdJQzh2SUdsdWRtRnNhV1FnWTI5dGNISmxjM05wYjI0Z1pteGhaMXh1SUNCcFppQW9ZblZtWm1WeVd6TXpYU0FoUFQwZ01IZ3dNU2tnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RKYm5aaGJHbGtJR052YlhCeVpYTnphVzl1SUdac1lXY25LVnh1WEc0Z0lISmxkSFZ5YmlCN1hHNGdJQ0FnZG1WeWMybHZiam9nWW5WbVptVnlXekJkTEZ4dUlDQWdJSEJ5YVhaaGRHVkxaWGs2SUdKMVptWmxjaTV6YkdsalpTZ3hMQ0F6TXlrc1hHNGdJQ0FnWTI5dGNISmxjM05sWkRvZ2RISjFaVnh1SUNCOVhHNTlYRzVjYm1aMWJtTjBhVzl1SUdWdVkyOWtaVkpoZHlBb2RtVnljMmx2Yml3Z2NISnBkbUYwWlV0bGVTd2dZMjl0Y0hKbGMzTmxaQ2tnZTF4dUlDQjJZWElnY21WemRXeDBJRDBnYm1WM0lFSjFabVpsY2loamIyMXdjbVZ6YzJWa0lEOGdNelFnT2lBek15bGNibHh1SUNCeVpYTjFiSFF1ZDNKcGRHVlZTVzUwT0NoMlpYSnphVzl1TENBd0tWeHVJQ0J3Y21sMllYUmxTMlY1TG1OdmNIa29jbVZ6ZFd4MExDQXhLVnh1WEc0Z0lHbG1JQ2hqYjIxd2NtVnpjMlZrS1NCN1hHNGdJQ0FnY21WemRXeDBXek16WFNBOUlEQjRNREZjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJ5WlhOMWJIUmNibjFjYmx4dVpuVnVZM1JwYjI0Z1pHVmpiMlJsSUNoemRISnBibWNzSUhabGNuTnBiMjRwSUh0Y2JpQWdjbVYwZFhKdUlHUmxZMjlrWlZKaGR5aGljelU0WTJobFkyc3VaR1ZqYjJSbEtITjBjbWx1Wnlrc0lIWmxjbk5wYjI0cFhHNTlYRzVjYm1aMWJtTjBhVzl1SUdWdVkyOWtaU0FvZG1WeWMybHZiaXdnY0hKcGRtRjBaVXRsZVN3Z1kyOXRjSEpsYzNObFpDa2dlMXh1SUNCcFppQW9kSGx3Wlc5bUlIWmxjbk5wYjI0Z1BUMDlJQ2R1ZFcxaVpYSW5LU0J5WlhSMWNtNGdZbk0xT0dOb1pXTnJMbVZ1WTI5a1pTaGxibU52WkdWU1lYY29kbVZ5YzJsdmJpd2djSEpwZG1GMFpVdGxlU3dnWTI5dGNISmxjM05sWkNrcFhHNWNiaUFnY21WMGRYSnVJR0p6TlRoamFHVmpheTVsYm1OdlpHVW9YRzRnSUNBZ1pXNWpiMlJsVW1GM0tGeHVJQ0FnSUNBZ2RtVnljMmx2Ymk1MlpYSnphVzl1TEZ4dUlDQWdJQ0FnZG1WeWMybHZiaTV3Y21sMllYUmxTMlY1TEZ4dUlDQWdJQ0FnZG1WeWMybHZiaTVqYjIxd2NtVnpjMlZrWEc0Z0lDQWdLVnh1SUNBcFhHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnZTF4dUlDQmtaV052WkdVNklHUmxZMjlrWlN4Y2JpQWdaR1ZqYjJSbFVtRjNPaUJrWldOdlpHVlNZWGNzWEc0Z0lHVnVZMjlrWlRvZ1pXNWpiMlJsTEZ4dUlDQmxibU52WkdWU1lYYzZJR1Z1WTI5a1pWSmhkMXh1ZlZ4dUlpd2laWGh3YjNKMElHTnZibk4wSUVGVlZFOWZURTlEUzE5VVNVMUZUMVZVWDBGTVFWSk5JRDBnSjBGVlZFOWZURTlEUzE5VVNVMUZUMVZVWDBGTVFWSk5KenRjYm1WNGNHOXlkQ0JqYjI1emRDQk5SVlJCVFVWVVVrbERVMTlHU1U1QlRFbGFSVjlGVmtWT1ZGOUdVa0ZIVFVWT1ZGOUJURUZTVFNBOVhHNGdJQ2ROUlZSQlRVVlVVa2xEVTE5R1NVNUJURWxhUlY5RlZrVk9WRjlHVWtGSFRVVk9WRjlCVEVGU1RTYzdYRzRpTENKcGJYQnZjblFnZXlCVFJVTlBUa1FnZlNCbWNtOXRJQ2N1TDNScGJXVW5PMXh1WEc1bGVIQnZjblFnWTI5dWMzUWdSa0ZNVEVKQlEwdGZVMDFCVWxSZlZGSkJUbE5CUTFSSlQwNVRYMUpGUmxKRlUwaGZWRWxOUlNBOUlGTkZRMDlPUkNBcUlERXdPMXh1Wlhod2IzSjBJR052Ym5OMElFWkJURXhDUVVOTFgxTk5RVkpVWDFSU1FVNVRRVU5VU1U5T1UxOUVSVUZFVEVsT1JTQTlJREU0TUR0Y2JtVjRjRzl5ZENCamIyNXpkQ0JHUVV4TVFrRkRTMTlUVFVGU1ZGOVVVa0ZPVTBGRFZFbFBUbE5mVFVGWVgwWkZSVjlOVlV4VVNWQk1TVVZTSUQwZ01qdGNiaUlzSW1WNGNHOXlkQ0JqYjI1emRDQkJRMVJKVDA1ZlVWVkZWVVZmVFVWVVVrbERVMTlGTWtWZlZFVlRWQ0E5SUNkaFkzUnBiMjVmY1hWbGRXVmZiV1YwY21samMxOWxNbVZmZEdWemRDYzdYRzRpTENJdktpcGNiaUFxSUVCbWFXeGxJRlJvWlNCbGJuUnllU0J3YjJsdWRDQm1iM0lnZEdobElIZGxZaUJsZUhSbGJuTnBiMjRnYzJsdVoyeGxkRzl1SUhCeWIyTmxjM011WEc0Z0tpOWNibHh1YVcxd2IzSjBJRVYyWlc1MFJXMXBkSFJsY2lCbWNtOXRJQ2RsZG1WdWRITW5PMXh1YVcxd2IzSjBJR1Z1WkU5bVUzUnlaV0Z0SUdaeWIyMGdKMlZ1WkMxdlppMXpkSEpsWVcwbk8xeHVhVzF3YjNKMElIQjFiWEFnWm5KdmJTQW5jSFZ0Y0NjN1hHNXBiWEJ2Y25RZ1pHVmliM1Z1WTJVZ1puSnZiU0FuWkdWaWIzVnVZMlV0YzNSeVpXRnRKenRjYm1sdGNHOXlkQ0JzYjJjZ1puSnZiU0FuYkc5bmJHVjJaV3duTzF4dWFXMXdiM0owSUdKeWIzZHpaWElnWm5KdmJTQW5kMlZpWlhoMFpXNXphVzl1TFhCdmJIbG1hV3hzSnp0Y2JtbHRjRzl5ZENCN0lITjBiM0psUVhOVGRISmxZVzBnZlNCbWNtOXRJQ2RBYldWMFlXMWhjMnN2YjJKekxYTjBiM0psSnp0Y2JtbHRjRzl5ZENCUWIzSjBVM1J5WldGdElHWnliMjBnSjJWNGRHVnVjMmx2Ymkxd2IzSjBMWE4wY21WaGJTYzdYRzVjYm1sdGNHOXlkQ0I3SUdWMGFFVnljbTl5Y3lCOUlHWnliMjBnSjJWMGFDMXljR010WlhKeWIzSnpKenRjYm1sdGNHOXlkQ0I3WEc0Z0lFVk9Wa2xTVDA1TlJVNVVYMVJaVUVWZlVFOVFWVkFzWEc0Z0lFVk9Wa2xTVDA1TlJVNVVYMVJaVUVWZlRrOVVTVVpKUTBGVVNVOU9MRnh1SUNCRlRsWkpVazlPVFVWT1ZGOVVXVkJGWDBaVlRFeFRRMUpGUlU0c1hHNGdJRVZZVkVWT1UwbFBUbDlOUlZOVFFVZEZVeXhjYmlBZ1VFeEJWRVpQVWsxZlJrbFNSVVpQV0N4Y2JuMGdabkp2YlNBbkxpNHZMaTR2YzJoaGNtVmtMMk52Ym5OMFlXNTBjeTloY0hBbk8xeHVhVzF3YjNKMElIdGNiaUFnVWtWS1JVTlVYMDVQVkVsR1NVTkJWRWxQVGw5RFRFOVRSU3hjYmlBZ1VrVktSVU5VWDA1UFZFbEdTVU5CVkVsUFRsOURURTlUUlY5VFNVY3NYRzRnSUUxbGRHRk5aWFJ5YVdOelJYWmxiblJEWVhSbFoyOXllU3hjYmlBZ1RXVjBZVTFsZEhKcFkzTkZkbVZ1ZEU1aGJXVXNYRzRnSUUxbGRHRk5aWFJ5YVdOelZYTmxjbFJ5WVdsMExGeHVmU0JtY205dElDY3VMaTh1TGk5emFHRnlaV1F2WTI5dWMzUmhiblJ6TDIxbGRHRnRaWFJ5YVdOekp6dGNibWx0Y0c5eWRDQjdJR05vWldOclJtOXlUR0Z6ZEVWeWNtOXlRVzVrVEc5bklIMGdabkp2YlNBbkxpNHZMaTR2YzJoaGNtVmtMMjF2WkhWc1pYTXZZbkp2ZDNObGNpMXlkVzUwYVcxbExuVjBhV3h6Snp0Y2JtbHRjRzl5ZENCN0lHbHpUV0Z1YVdabGMzUldNeUI5SUdaeWIyMGdKeTR1THk0dUwzTm9ZWEpsWkM5dGIyUjFiR1Z6TDIxMk15NTFkR2xzY3ljN1hHNXBiWEJ2Y25RZ2V5QnRZWE5yVDJKcVpXTjBJSDBnWm5KdmJTQW5MaTR2TGk0dmMyaGhjbVZrTDIxdlpIVnNaWE12YjJKcVpXTjBMblYwYVd4ekp6dGNibWx0Y0c5eWRDQjdJR2RsZEVWdWRtbHliMjV0Wlc1MFZIbHdaU3dnWkdWbVpYSnlaV1JRY205dGFYTmxMQ0JuWlhSUWJHRjBabTl5YlNCOUlHWnliMjBnSnk0dmJHbGlMM1YwYVd3bk8xeHVhVzF3YjNKMElHMXBaM0poZEdsdmJuTWdabkp2YlNBbkxpOXRhV2R5WVhScGIyNXpKenRjYm1sdGNHOXlkQ0JOYVdkeVlYUnZjaUJtY205dElDY3VMMnhwWWk5dGFXZHlZWFJ2Y2ljN1hHNXBiWEJ2Y25RZ1JYaDBaVzV6YVc5dVVHeGhkR1p2Y20wZ1puSnZiU0FuTGk5d2JHRjBabTl5YlhNdlpYaDBaVzV6YVc5dUp6dGNibWx0Y0c5eWRDQk1iMk5oYkZOMGIzSmxJR1p5YjIwZ0p5NHZiR2xpTDJ4dlkyRnNMWE4wYjNKbEp6dGNibWx0Y0c5eWRDQlNaV0ZrVDI1c2VVNWxkSGR2Y210VGRHOXlaU0JtY205dElDY3VMMnhwWWk5dVpYUjNiM0pyTFhOMGIzSmxKenRjYm1sdGNHOXlkQ0I3SUZORlRsUlNXVjlUVkVGVVJTQjlJR1p5YjIwZ0p5NHZiR2xpTDNObGRIVndVMlZ1ZEhKNUp6dGNibHh1YVcxd2IzSjBJR055WldGMFpWTjBjbVZoYlZOcGJtc2dabkp2YlNBbkxpOXNhV0l2WTNKbFlYUmxVM1J5WldGdFUybHVheWM3WEc1cGJYQnZjblFnVG05MGFXWnBZMkYwYVc5dVRXRnVZV2RsY2l3Z2UxeHVJQ0JPVDFSSlJrbERRVlJKVDA1ZlRVRk9RVWRGVWw5RlZrVk9WRk1zWEc1OUlHWnliMjBnSnk0dmJHbGlMMjV2ZEdsbWFXTmhkR2x2YmkxdFlXNWhaMlZ5Snp0Y2JtbHRjRzl5ZENCTlpYUmhiV0Z6YTBOdmJuUnliMnhzWlhJc0lIdGNiaUFnVFVWVVFVMUJVMHRmUTA5T1ZGSlBURXhGVWw5RlZrVk9WRk1zWEc1OUlHWnliMjBnSnk0dmJXVjBZVzFoYzJzdFkyOXVkSEp2Ykd4bGNpYzdYRzVwYlhCdmNuUWdjbUYzUm1seWMzUlVhVzFsVTNSaGRHVWdabkp2YlNBbkxpOW1hWEp6ZEMxMGFXMWxMWE4wWVhSbEp6dGNibWx0Y0c5eWRDQm5aWFJHYVhKemRGQnlaV1psY25KbFpFeGhibWREYjJSbElHWnliMjBnSnk0dmJHbGlMMmRsZEMxbWFYSnpkQzF3Y21WbVpYSnlaV1F0YkdGdVp5MWpiMlJsSnp0Y2JtbHRjRzl5ZENCblpYUlBZbXBUZEhKMVkzUjFjbVVnWm5KdmJTQW5MaTlzYVdJdloyVjBUMkpxVTNSeWRXTjBkWEpsSnp0Y2JtbHRjRzl5ZENCelpYUjFjRVZ1YzBsd1puTlNaWE52YkhabGNpQm1jbTl0SUNjdUwyeHBZaTlsYm5NdGFYQm1jeTl6WlhSMWNDYzdYRzVjYmk4cUlHVnpiR2x1ZEMxbGJtRmliR1VnYVcxd2IzSjBMMlpwY25OMElDb3ZYRzVjYmk4cUlHVnpiR2x1ZEMxa2FYTmhZbXhsSUdsdGNHOXlkQzl2Y21SbGNpQXFMMXh1THlvZ1pYTnNhVzUwTFdWdVlXSnNaU0JwYlhCdmNuUXZiM0prWlhJZ0tpOWNibHh1WTI5dWMzUWdleUJ6Wlc1MGNua2dmU0E5SUdkc2IySmhiRHRjYm1OdmJuTjBJR1pwY25OMFZHbHRaVk4wWVhSbElEMGdleUF1TGk1eVlYZEdhWEp6ZEZScGJXVlRkR0YwWlNCOU8xeHVYRzVqYjI1emRDQnRaWFJoYldGemEwbHVkR1Z5Ym1Gc1VISnZZMlZ6YzBoaGMyZ2dQU0I3WEc0Z0lGdEZUbFpKVWs5T1RVVk9WRjlVV1ZCRlgxQlBVRlZRWFRvZ2RISjFaU3hjYmlBZ1cwVk9Wa2xTVDA1TlJVNVVYMVJaVUVWZlRrOVVTVVpKUTBGVVNVOU9YVG9nZEhKMVpTeGNiaUFnVzBWT1ZrbFNUMDVOUlU1VVgxUlpVRVZmUmxWTVRGTkRVa1ZGVGwwNklIUnlkV1VzWEc1OU8xeHVYRzVqYjI1emRDQnRaWFJoYldGemEwSnNiMk5yWldSUWIzSjBjeUE5SUZzbmRISmxlbTl5TFdOdmJtNWxZM1FuWFR0Y2JseHViRzluTG5ObGRFUmxabUYxYkhSTVpYWmxiQ2h3Y205alpYTnpMbVZ1ZGk1TlJWUkJUVUZUUzE5RVJVSlZSeUEvSUNka1pXSjFaeWNnT2lBbmFXNW1ieWNwTzF4dVhHNWpiMjV6ZENCd2JHRjBabTl5YlNBOUlHNWxkeUJGZUhSbGJuTnBiMjVRYkdGMFptOXliU2dwTzF4dVkyOXVjM1FnYm05MGFXWnBZMkYwYVc5dVRXRnVZV2RsY2lBOUlHNWxkeUJPYjNScFptbGpZWFJwYjI1TllXNWhaMlZ5S0NrN1hHNWNibXhsZENCd2IzQjFjRWx6VDNCbGJpQTlJR1poYkhObE8xeHViR1YwSUc1dmRHbG1hV05oZEdsdmJrbHpUM0JsYmlBOUlHWmhiSE5sTzF4dWJHVjBJSFZwU1hOVWNtbG5aMlZ5YVc1bklEMGdabUZzYzJVN1hHNWpiMjV6ZENCdmNHVnVUV1YwWVcxaGMydFVZV0p6U1VSeklEMGdlMzA3WEc1amIyNXpkQ0J2Y0dWdVRXVjBZVzFoYzJ0RGIyNXVaV04wYVc5dWN5QTlJRzVsZHlCTllYQW9LVHRjYm1OdmJuTjBJSEpsY1hWbGMzUkJZMk52ZFc1MFZHRmlTV1J6SUQwZ2UzMDdYRzVzWlhRZ1kyOXVkSEp2Ykd4bGNqdGNibHh1THk4Z2MzUmhkR1VnY0dWeWMybHpkR1Z1WTJWY2JtTnZibk4wSUdsdVZHVnpkQ0E5SUhCeWIyTmxjM011Wlc1MkxrbE9YMVJGVTFRN1hHNWpiMjV6ZENCc2IyTmhiRk4wYjNKbElEMGdhVzVVWlhOMElEOGdibVYzSUZKbFlXUlBibXg1VG1WMGQyOXlhMU4wYjNKbEtDa2dPaUJ1WlhjZ1RHOWpZV3hUZEc5eVpTZ3BPMXh1YkdWMElIWmxjbk5wYjI1bFpFUmhkR0U3WEc1Y2JtbG1JQ2hwYmxSbGMzUWdmSHdnY0hKdlkyVnpjeTVsYm5ZdVRVVlVRVTFCVTB0ZlJFVkNWVWNwSUh0Y2JpQWdaMnh2WW1Gc0xuTjBZWFJsU0c5dmEzTXViV1YwWVcxaGMydEhaWFJUZEdGMFpTQTlJR3h2WTJGc1UzUnZjbVV1WjJWMExtSnBibVFvYkc5allXeFRkRzl5WlNrN1hHNTlYRzVjYm1OdmJuTjBJSEJvYVhOb2FXNW5VR0ZuWlZWeWJDQTlJRzVsZHlCVlVrd29jSEp2WTJWemN5NWxibll1VUVoSlUwaEpUa2RmVjBGU1RrbE9SMTlRUVVkRlgxVlNUQ2s3WEc1Y2JtTnZibk4wSUU5T1JWOVRSVU5QVGtSZlNVNWZUVWxNVEVsVFJVTlBUa1JUSUQwZ01WOHdNREE3WEc0dkx5QlVhVzFsYjNWMElHWnZjaUJwYm1sMGFXRnNhWHBwYm1jZ2NHaHBjMmhwYm1jZ2QyRnlibWx1WnlCd1lXZGxMbHh1WTI5dWMzUWdVRWhKVTBoSlRrZGZWMEZTVGtsT1IxOVFRVWRGWDFSSlRVVlBWVlFnUFNCUFRrVmZVMFZEVDA1RVgwbE9YMDFKVEV4SlUwVkRUMDVFVXp0Y2JseHVZMjl1YzNRZ1FVTkxYMHRGUlZCZlFVeEpWa1ZmVFVWVFUwRkhSU0E5SUNkQlEwdGZTMFZGVUY5QlRFbFdSVjlOUlZOVFFVZEZKenRjYm1OdmJuTjBJRmRQVWt0RlVsOUxSVVZRWDBGTVNWWkZYMDFGVTFOQlIwVWdQU0FuVjA5U1MwVlNYMHRGUlZCZlFVeEpWa1ZmVFVWVFUwRkhSU2M3WEc1Y2JseHVMeThnUlhabGJuUWdaVzFwZEhSbGNpQm1iM0lnYzNSaGRHVWdjR1Z5YzJsemRHVnVZMlZjYm1WNGNHOXlkQ0JqYjI1emRDQnpkR0YwWlZCbGNuTnBjM1JsYm1ObFJYWmxiblJ6SUQwZ2JtVjNJRVYyWlc1MFJXMXBkSFJsY2lncE8xeHVYRzR2S2lwY2JpQXFJRlJvYVhNZ1pHVm1aWEp5WldRZ1VISnZiV2x6WlNCcGN5QjFjMlZrSUhSdklIUnlZV05ySUhkb1pYUm9aWElnYVc1cGRHbGhiR2w2WVhScGIyNGdhR0Z6SUdacGJtbHphR1ZrTGx4dUlDcGNiaUFxSUVsMElHbHpJSFpsY25rZ2FXMXdiM0owWVc1MElIUnZJR1Z1YzNWeVpTQjBhR0YwSUdCeVpYTnZiSFpsU1c1cGRHbGhiR2w2WVhScGIyNWdJR2x6SUNwaGJIZGhlWE1xWEc0Z0tpQmpZV3hzWldRZ2IyNWpaU0JwYm1sMGFXRnNhWHBoZEdsdmJpQm9ZWE1nWTI5dGNHeGxkR1ZrTENCaGJtUWdkR2hoZENCZ2NtVnFaV04wU1c1cGRHbGhiR2w2WVhScGIyNWdJR2x6WEc0Z0tpQmpZV3hzWldRZ2FXWWdhVzVwZEdsaGJHbDZZWFJwYjI0Z1ptRnBiSE1nYVc0Z1lXNGdkVzV5WldOdmRtVnlZV0pzWlNCM1lYa3VYRzRnS2k5Y2JtTnZibk4wSUh0Y2JpQWdjSEp2YldselpUb2dhWE5KYm1sMGFXRnNhWHBsWkN4Y2JpQWdjbVZ6YjJ4MlpUb2djbVZ6YjJ4MlpVbHVhWFJwWVd4cGVtRjBhVzl1TEZ4dUlDQnlaV3BsWTNRNklISmxhbVZqZEVsdWFYUnBZV3hwZW1GMGFXOXVMRnh1ZlNBOUlHUmxabVZ5Y21Wa1VISnZiV2x6WlNncE8xeHVYRzR2S2lwY2JpQXFJRk5sYm1SeklHRWdiV1Z6YzJGblpTQjBieUIwYUdVZ1pHRndjQ2h6S1NCamIyNTBaVzUwSUhOamNtbHdkQ0IwYnlCemFXZHVZV3dnYVhRZ1kyRnVJR052Ym01bFkzUWdkRzhnVFdWMFlVMWhjMnNnWW1GamEyZHliM1Z1WkNCaGMxeHVJQ29nZEdobElHSmhZMnRsYm1RZ2FYTWdibTkwSUdGamRHbDJaUzRnU1hRZ2FYTWdjbVZ4ZFdseVpXUWdkRzhnY21VdFkyOXVibVZqZENCa1lYQndjeUJoWm5SbGNpQnpaWEoyYVdObElIZHZjbXRsY2lCeVpTMWhZM1JwZG1GMFpYTXVYRzRnS2lCR2IzSWdibTl1TFdSaGNIQWdjR0ZuWlhNc0lIUm9aU0J0WlhOellXZGxJSGRwYkd3Z1ltVWdjMlZ1ZENCaGJtUWdhV2R1YjNKbFpDNWNiaUFxTDF4dVkyOXVjM1FnYzJWdVpGSmxZV1I1VFdWemMyRm5aVlJ2VkdGaWN5QTlJR0Z6ZVc1aklDZ3BJRDArSUh0Y2JpQWdZMjl1YzNRZ2RHRmljeUE5SUdGM1lXbDBJR0p5YjNkelpYSXVkR0ZpYzF4dUlDQWdJQzV4ZFdWeWVTaDdYRzRnSUNBZ0lDQXZLaXBjYmlBZ0lDQWdJQ0FxSUU5dWJIa2djWFZsY25rZ2RHRmljeUIwYUdGMElHOTFjaUJsZUhSbGJuTnBiMjRnWTJGdUlISjFiaUJwYmk0Z1ZHOGdaRzhnZEdocGN5d2dkMlVnY1hWbGNua2dabTl5SUdGc2JDQlZVa3h6SUhSb1lYUWdiM1Z5WEc0Z0lDQWdJQ0FnS2lCbGVIUmxibk5wYjI0Z1kyRnVJR2x1YW1WamRDQnpZM0pwY0hSeklHbHVMQ0IzYUdsamFDQnBjeUJpZVNCMWMybHVaeUIwYUdVZ1hDSThZV3hzWDNWeWJITStYQ0lnZG1Gc2RXVWdZVzVrSUY5ZmQybDBhRzkxZEY5ZlhHNGdJQ0FnSUNBZ0tpQjBhR1VnWENKMFlXSnpYQ0lnYldGdWFXWmxjM1FnY0dWeWJXbHpjMmx2Ymk0Z1NXWWdkMlVnYVc1amJIVmtaV1FnZEdobElGd2lkR0ZpYzF3aUlIQmxjbTFwYzNOcGIyNHNJSFJvYVhNZ2QyOTFiR1FnWVd4emJ5Qm1aWFJqYUZ4dUlDQWdJQ0FnSUNvZ1ZWSk1jeUIwYUdGMElIZGxKMlFnYm05MElHSmxJR0ZpYkdVZ2RHOGdhVzVxWldOMElHbHVMQ0JsTG1jdUlHTm9jbTl0WlRvdkwzQmhaMlZ6TENCamFISnZiV1U2THk5bGVIUmxibk5wYjI0c0lIZG9hV05vWEc0Z0lDQWdJQ0FnS2lCcGN5QnViM1FnZDJoaGRDQjNaU2RrSUhkaGJuUXVYRzRnSUNBZ0lDQWdLbHh1SUNBZ0lDQWdJQ29nV1c5MUlHMXBaMmgwSUdKbElIZHZibVJsY21sdVp5d2dhRzkzSUdSdlpYTWdkR2hsSUZ3aWRYSnNYQ0lnY0dGeVlXMGdkMjl5YXlCM2FYUm9iM1YwSUhSb1pTQmNJblJoWW5OY0lpQndaWEp0YVhOemFXOXVQMXh1SUNBZ0lDQWdJQ3BjYmlBZ0lDQWdJQ0FxSUVCelpXVWdlMEJzYVc1cklHaDBkSEJ6T2k4dlluVm5jeTVqYUhKdmJXbDFiUzV2Y21jdmNDOWphSEp2YldsMWJTOXBjM04xWlhNdlpHVjBZV2xzUDJsa1BUWTJNVE14TVNOak1YMWNiaUFnSUNBZ0lDQXFJQ0JjSWtsbUlIUm9aU0JsZUhSbGJuTnBiMjRnYUdGeklHRmpZMlZ6Y3lCMGJ5QnBibXBsWTNRZ2MyTnlhWEIwY3lCcGJuUnZJRlJoWWl3Z2RHaGxiaUIzWlNCallXNGdjbVYwZFhKdUlIUm9aU0IxY214Y2JpQWdJQ0FnSUNBcUlDQWdiMllnVkdGaUlDaGlaV05oZFhObElIUm9aU0JsZUhSbGJuTnBiMjRnWTI5MWJHUWdhblZ6ZENCcGJtcGxZM1FnWVNCelkzSnBjSFFnZEc4Z2JXVnpjMkZuWlNCMGFHVWdiRzlqWVhScGIyNHVhSEpsWmlrdVhDSmNiaUFnSUNBZ0lDQXFMMXh1SUNBZ0lDQWdkWEpzT2lBblBHRnNiRjkxY214elBpY3NYRzRnSUNBZ0lDQjNhVzVrYjNkVWVYQmxPaUFuYm05eWJXRnNKeXhjYmlBZ0lDQjlLVnh1SUNBZ0lDNTBhR1Z1S0NoeVpYTjFiSFFwSUQwK0lIdGNiaUFnSUNBZ0lHTm9aV05yUm05eVRHRnpkRVZ5Y205eVFXNWtURzluS0NrN1hHNGdJQ0FnSUNCeVpYUjFjbTRnY21WemRXeDBPMXh1SUNBZ0lIMHBYRzRnSUNBZ0xtTmhkR05vS0NncElEMCtJSHRjYmlBZ0lDQWdJR05vWldOclJtOXlUR0Z6ZEVWeWNtOXlRVzVrVEc5bktDazdYRzRnSUNBZ2ZTazdYRzVjYmlBZ0x5b3FJRUIwYjJSdklIZGxJSE5vYjNWc1pDQnZibXg1SUhObGJtUk5aWE56WVdkbElIUnZJR1JoY0hBZ2RHRmljeXdnYm05MElHRnNiQ0IwWVdKekxpQXFMMXh1SUNCbWIzSWdLR052Ym5OMElIUmhZaUJ2WmlCMFlXSnpLU0I3WEc0Z0lDQWdZbkp2ZDNObGNpNTBZV0p6WEc0Z0lDQWdJQ0F1YzJWdVpFMWxjM05oWjJVb2RHRmlMbWxrTENCN1hHNGdJQ0FnSUNBZ0lHNWhiV1U2SUVWWVZFVk9VMGxQVGw5TlJWTlRRVWRGVXk1U1JVRkVXU3hjYmlBZ0lDQWdJSDBwWEc0Z0lDQWdJQ0F1ZEdobGJpZ29LU0E5UGlCN1hHNGdJQ0FnSUNBZ0lHTm9aV05yUm05eVRHRnpkRVZ5Y205eVFXNWtURzluS0NrN1hHNGdJQ0FnSUNCOUtWeHVJQ0FnSUNBZ0xtTmhkR05vS0NncElEMCtJSHRjYmlBZ0lDQWdJQ0FnTHk4Z1FXNGdaWEp5YjNJZ2JXRjVJR2hoY0hCbGJpQnBaaUIwYUdVZ1kyOXVkR1Z1ZEhOamNtbHdkQ0JwY3lCaWJHOWphMlZrSUdaeWIyMGdiRzloWkdsdVp5eGNiaUFnSUNBZ0lDQWdMeThnWVc1a0lIUm9kWE1nZEdobGNtVWdhWE1nYm04Z2NuVnVkR2x0WlM1dmJrMWxjM05oWjJVZ2FHRnVaR3hsY2lCMGJ5QnNhWE4wWlc0Z2RHOGdkR2hsSUcxbGMzTmhaMlV1WEc0Z0lDQWdJQ0FnSUdOb1pXTnJSbTl5VEdGemRFVnljbTl5UVc1a1RHOW5LQ2s3WEc0Z0lDQWdJQ0I5S1R0Y2JpQWdmVnh1ZlR0Y2JseHVMeThnVkdobGMyVWdZWEpsSUhObGRDQmhablJsY2lCcGJtbDBhV0ZzYVhwaGRHbHZibHh1YkdWMElHTnZibTVsWTNSU1pXMXZkR1U3WEc1c1pYUWdZMjl1Ym1WamRFVjRkR1Z5Ym1Gc08xeHVYRzVpY205M2MyVnlMbkoxYm5ScGJXVXViMjVEYjI1dVpXTjBMbUZrWkV4cGMzUmxibVZ5S0dGemVXNWpJQ2d1TGk1aGNtZHpLU0E5UGlCN1hHNGdJQzh2SUZGMVpYVmxJSFZ3SUdOdmJtNWxZM1JwYjI0Z1lYUjBaVzF3ZEhNZ2FHVnlaU3dnZDJGcGRHbHVaeUIxYm5ScGJDQmhablJsY2lCcGJtbDBhV0ZzYVhwaGRHbHZibHh1SUNCaGQyRnBkQ0JwYzBsdWFYUnBZV3hwZW1Wa08xeHVJQ0JqYjI1emRDQnlaVzF2ZEdWUWIzSjBJRDBnWVhKbmMxc3dYVHRjYmlBZ1kyOXVjM1FnZXlCelpXNWtaWElnZlNBOUlISmxiVzkwWlZCdmNuUTdYRzVjYmlBZ1kyOXVjM1FnZFhKc0lEMGdjMlZ1WkdWeVB5NTFjbXc3WEc0Z0lHTnZibk4wSUdSbGRHVmpkR1ZrVUhKdlkyVnpjMDVoYldVZ1BTQjFjbXdnUHlCblpYUkZiblpwY205dWJXVnVkRlI1Y0dVb2RYSnNLU0E2SUNjbk8xeHVYRzRnSUdOdmJuTjBJR052Ym01bFkzUnBiMjVKWkNBOUlHZGxibVZ5WVhSbFEyOXVibVZqZEdsdmJrbGtLSEpsYlc5MFpWQnZjblFzSUdSbGRHVmpkR1ZrVUhKdlkyVnpjMDVoYldVcE8xeHVJQ0JqYjI1emRDQnZjR1Z1UTI5dWJtVmpkR2x2Ym5NZ1BTQnZjR1Z1VFdWMFlXMWhjMnREYjI1dVpXTjBhVzl1Y3k1blpYUW9ZMjl1Ym1WamRHbHZia2xrS1NCOGZDQXdPMXh1WEc0Z0lHbG1JQ2hjYmlBZ0lDQnZjR1Z1UTI5dWJtVmpkR2x2Ym5NZ1BUMDlJREFnZkh4Y2JpQWdJQ0FvWkdWMFpXTjBaV1JRY205alpYTnpUbUZ0WlNBOVBUMGdKMkpoWTJ0bmNtOTFibVFuSUNZbUlHOXdaVzVEYjI1dVpXTjBhVzl1Y3lBOElESXBYRzRnSUNBZ0x5OGdNaUJpWVdOclozSnZkVzVrSUdOdmJtNWxZM1JwYjI1eklHRnlaU0JoYkd4dmQyVmtMQ0J2Ym1VZ1ptOXlJSEJvYVhOb2FXNW5JSGRoY201cGJtY2djR0ZuWlNCaGJtUWdiMjVsSUdadmNpQjBhR1VnYkdWa1oyVnlJR0p5YVdSblpTQnJaWGx5YVc1blhHNGdJQ2tnZTF4dUlDQWdJQzh2SUZSb2FYTWdhWE1nYzJWMElHbHVJR0J6WlhSMWNFTnZiblJ5YjJ4c1pYSmdMQ0IzYUdsamFDQnBjeUJqWVd4c1pXUWdZWE1nY0dGeWRDQnZaaUJwYm1sMGFXRnNhWHBoZEdsdmJseHVJQ0FnSUdOdmJtNWxZM1JTWlcxdmRHVW9MaTR1WVhKbmN5azdYRzRnSUNBZ2IzQmxiazFsZEdGdFlYTnJRMjl1Ym1WamRHbHZibk11YzJWMEtHTnZibTVsWTNScGIyNUpaQ3dnYjNCbGJrTnZibTVsWTNScGIyNXpJQ3NnTVNrN1hHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkRFQwNU9SVU5VU1U5T1gwRk1Va1ZCUkZsZlJWaEpVMVJUSnlrN1hHNGdJSDFjYm4wcE8xeHVYRzVpY205M2MyVnlMbkoxYm5ScGJXVXViMjVEYjI1dVpXTjBSWGgwWlhKdVlXd3VZV1JrVEdsemRHVnVaWElvWVhONWJtTWdLQzR1TG1GeVozTXBJRDArSUh0Y2JpQWdMeThnVVhWbGRXVWdkWEFnWTI5dWJtVmpkR2x2YmlCaGRIUmxiWEIwY3lCb1pYSmxMQ0IzWVdsMGFXNW5JSFZ1ZEdsc0lHRm1kR1Z5SUdsdWFYUnBZV3hwZW1GMGFXOXVYRzRnSUdGM1lXbDBJR2x6U1c1cGRHbGhiR2w2WldRN1hHNWNiaUFnTHk4Z1ZHaHBjeUJwY3lCelpYUWdhVzRnWUhObGRIVndRMjl1ZEhKdmJHeGxjbUFzSUhkb2FXTm9JR2x6SUdOaGJHeGxaQ0JoY3lCd1lYSjBJRzltSUdsdWFYUnBZV3hwZW1GMGFXOXVYRzRnSUdOdmJtNWxZM1JGZUhSbGNtNWhiQ2d1TGk1aGNtZHpLVHRjYm4wcE8xeHVYRzR2S2lwY2JpQXFJRUIwZVhCbFpHVm1JSHRwYlhCdmNuUW9KeTR1THk0dUwzTm9ZWEpsWkM5amIyNXpkR0Z1ZEhNdmRISmhibk5oWTNScGIyNG5LUzVVY21GdWMyRmpkR2x2YmsxbGRHRjlJRlJ5WVc1ellXTjBhVzl1VFdWMFlWeHVJQ292WEc1Y2JpOHFLbHh1SUNvZ1ZHaGxJR1JoZEdFZ1pXMXBkSFJsWkNCbWNtOXRJSFJvWlNCTlpYUmhUV0Z6YTBOdmJuUnliMnhzWlhJdWMzUnZjbVVnUlhabGJuUkZiV2wwZEdWeUxDQmhiSE52SUhWelpXUWdkRzhnYVc1cGRHbGhiR2w2WlNCMGFHVWdUV1YwWVUxaGMydERiMjUwY205c2JHVnlMaUJCZG1GcGJHRmliR1VnYVc0Z1ZVa2diMjRnVW1WaFkzUWdjM1JoZEdVZ1lYTWdjM1JoZEdVdWJXVjBZVzFoYzJzdVhHNGdLbHh1SUNvZ1FIUjVjR1ZrWldZZ1RXVjBZVTFoYzJ0VGRHRjBaVnh1SUNvZ1FIQnliM0JsY25SNUlIdGliMjlzWldGdWZTQnBjMGx1YVhScFlXeHBlbVZrSUMwZ1YyaGxkR2hsY2lCMGFHVWdabWx5YzNRZ2RtRjFiSFFnYUdGeklHSmxaVzRnWTNKbFlYUmxaQzVjYmlBcUlFQndjbTl3WlhKMGVTQjdZbTl2YkdWaGJuMGdhWE5WYm14dlkydGxaQ0F0SUZkb1pYUm9aWElnZEdobElIWmhkV3gwSUdseklHTjFjbkpsYm5Sc2VTQmtaV055ZVhCMFpXUWdZVzVrSUdGalkyOTFiblJ6SUdGeVpTQmhkbUZwYkdGaWJHVWdabTl5SUhObGJHVmpkR2x2Ymk1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3WW05dmJHVmhibjBnYVhOQlkyTnZkVzUwVFdWdWRVOXdaVzRnTFNCU1pYQnlaWE5sYm5SeklIZG9aWFJvWlhJZ2RHaGxJRzFoYVc0Z1lXTmpiM1Z1ZENCelpXeGxZM1JwYjI0Z1ZVa2dhWE1nWTNWeWNtVnVkR3g1SUdScGMzQnNZWGxsWkM1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3WW05dmJHVmhibjBnYVhOT1pYUjNiM0pyVFdWdWRVOXdaVzRnTFNCU1pYQnlaWE5sYm5SeklIZG9aWFJvWlhJZ2RHaGxJRzFoYVc0Z2JtVjBkMjl5YXlCelpXeGxZM1JwYjI0Z1ZVa2dhWE1nWTNWeWNtVnVkR3g1SUdScGMzQnNZWGxsWkM1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3YjJKcVpXTjBmU0JwWkdWdWRHbDBhV1Z6SUMwZ1FXNGdiMkpxWldOMElHMWhkR05vYVc1bklHeHZkMlZ5TFdOaGMyVWdhR1Y0SUdGa1pISmxjM05sY3lCMGJ5QkpaR1Z1ZEdsMGVTQnZZbXBsWTNSeklIZHBkR2dnWENKaFpHUnlaWE56WENJZ1lXNWtJRndpYm1GdFpWd2lJQ2h1YVdOcmJtRnRaU2tnYTJWNWN5NWNiaUFxSUVCd2NtOXdaWEowZVNCN2IySnFaV04wZlNCMWJtRndjSEp2ZG1Wa1ZIaHpJQzBnUVc0Z2IySnFaV04wSUcxaGNIQnBibWNnZEhKaGJuTmhZM1JwYjI0Z2FHRnphR1Z6SUhSdklIVnVZWEJ3Y205MlpXUWdkSEpoYm5OaFkzUnBiMjV6TGx4dUlDb2dRSEJ5YjNCbGNuUjVJSHR2WW1wbFkzUjlJRzVsZEhkdmNtdERiMjVtYVdkMWNtRjBhVzl1Y3lBdElFRWdiR2x6ZENCdlppQnVaWFIzYjNKcklHTnZibVpwWjNWeVlYUnBiMjV6TENCamIyNTBZV2x1YVc1bklGSlFReUJ3Y205MmFXUmxjaUJrWlhSaGFXeHpJQ2hsWnlCamFHRnBia2xrTENCeWNHTlZjbXdzSUhKd1kxQnlaV1psY21WdVkyVnpLUzVjYmlBcUlFQndjbTl3WlhKMGVTQjdRWEp5WVhsOUlHRmtaSEpsYzNOQ2IyOXJJQzBnUVNCc2FYTjBJRzltSUhCeVpYWnBiM1Z6YkhrZ2MyVnVkQ0IwYnlCaFpHUnlaWE56WlhNdVhHNGdLaUJBY0hKdmNHVnlkSGtnZTI5aWFtVmpkSDBnWTI5dWRISmhZM1JGZUdOb1lXNW5aVkpoZEdWeklDMGdTVzVtYnlCaFltOTFkQ0JqZFhKeVpXNTBJSFJ2YTJWdUlIQnlhV05sY3k1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3UVhKeVlYbDlJSFJ2YTJWdWN5QXRJRlJ2YTJWdWN5Qm9aV3hrSUdKNUlIUm9aU0JqZFhKeVpXNTBJSFZ6WlhJc0lHbHVZMngxWkdsdVp5QjBhR1ZwY2lCaVlXeGhibU5sY3k1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3YjJKcVpXTjBmU0J6Wlc1a0lDMGdWRTlFVHpvZ1JHOWpkVzFsYm5SY2JpQXFJRUJ3Y205d1pYSjBlU0I3WW05dmJHVmhibjBnZFhObFFteHZZMnRwWlNBdElFbHVaR2xqWVhSbGN5QndjbVZtWlhKeVpXUWdkWE5sY2lCcFpHVnVkR2xqYjI0Z1ptOXliV0YwTGlCVWNuVmxJR1p2Y2lCaWJHOWphMmxsTENCbVlXeHpaU0JtYjNJZ1NtRjZlbWxqYjI0dVhHNGdLaUJBY0hKdmNHVnlkSGtnZTI5aWFtVmpkSDBnWm1WaGRIVnlaVVpzWVdkeklDMGdRVzRnYjJKcVpXTjBJR1p2Y2lCdmNIUnBiMjVoYkNCbVpXRjBkWEpsSUdac1lXZHpMbHh1SUNvZ1FIQnliM0JsY25SNUlIdGliMjlzWldGdWZTQjNaV3hqYjIxbFUyTnlaV1Z1SUMwZ1ZISjFaU0JwWmlCM1pXeGpiMjFsSUhOamNtVmxiaUJ6YUc5MWJHUWdZbVVnYzJodmQyNHVYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UzTjBjbWx1WjMwZ1kzVnljbVZ1ZEV4dlkyRnNaU0F0SUVFZ2JHOWpZV3hsSUhOMGNtbHVaeUJ0WVhSamFHbHVaeUIwYUdVZ2RYTmxjaWR6SUhCeVpXWmxjbkpsWkNCa2FYTndiR0Y1SUd4aGJtZDFZV2RsTGx4dUlDb2dRSEJ5YjNCbGNuUjVJSHR2WW1wbFkzUjlJSEJ5YjNacFpHVnlRMjl1Wm1sbklDMGdWR2hsSUdOMWNuSmxiblFnYzJWc1pXTjBaV1FnYm1WMGQyOXlheUJ3Y205MmFXUmxjaTVjYmlBcUlFQndjbTl3WlhKMGVTQjdjM1J5YVc1bmZTQndjbTkyYVdSbGNrTnZibVpwWnk1eWNHTlZjbXdnTFNCVWFHVWdZV1JrY21WemN5Qm1iM0lnZEdobElGSlFReUJCVUVrc0lHbG1JSFZ6YVc1bklHRnVJRkpRUXlCQlVFa3VYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UzTjBjbWx1WjMwZ2NISnZkbWxrWlhKRGIyNW1hV2N1ZEhsd1pTQXRJRUZ1SUdsa1pXNTBhV1pwWlhJZ1ptOXlJSFJvWlNCMGVYQmxJRzltSUc1bGRIZHZjbXNnYzJWc1pXTjBaV1FzSUdGc2JHOTNjeUJOWlhSaFRXRnpheUIwYnlCMWMyVWdZM1Z6ZEc5dElIQnliM1pwWkdWeUlITjBjbUYwWldkcFpYTWdabTl5SUd0dWIzZHVJRzVsZEhkdmNtdHpMbHh1SUNvZ1FIQnliM0JsY25SNUlIdHpkSEpwYm1kOUlHNWxkSGR2Y210SlpDQXRJRlJvWlNCemRISnBibWRwWm1sbFpDQnVkVzFpWlhJZ2IyWWdkR2hsSUdOMWNuSmxiblFnYm1WMGQyOXlheUJKUkM1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3YzNSeWFXNW5mU0J1WlhSM2IzSnJVM1JoZEhWeklDMGdSV2wwYUdWeUlGd2lkVzVyYm05M2Jsd2lMQ0JjSW1GMllXbHNZV0pzWlZ3aUxDQmNJblZ1WVhaaGFXeGhZbXhsWENJc0lHOXlJRndpWW14dlkydGxaRndpTENCa1pYQmxibVJwYm1jZ2IyNGdkR2hsSUhOMFlYUjFjeUJ2WmlCMGFHVWdZM1Z5Y21WdWRHeDVJSE5sYkdWamRHVmtJRzVsZEhkdmNtc3VYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UyOWlhbVZqZEgwZ1lXTmpiM1Z1ZEhNZ0xTQkJiaUJ2WW1wbFkzUWdiV0Z3Y0dsdVp5QnNiM2RsY2kxallYTmxJR2hsZUNCaFpHUnlaWE56WlhNZ2RHOGdiMkpxWldOMGN5QjNhWFJvSUZ3aVltRnNZVzVqWlZ3aUlHRnVaQ0JjSW1Ga1pISmxjM05jSWlCclpYbHpMQ0JpYjNSb0lITjBiM0pwYm1jZ2FHVjRJSE4wY21sdVp5QjJZV3gxWlhNdVhHNGdLaUJBY0hKdmNHVnlkSGtnZTJobGVIMGdZM1Z5Y21WdWRFSnNiMk5yUjJGelRHbHRhWFFnTFNCVWFHVWdiVzl6ZENCeVpXTmxiblJzZVNCelpXVnVJR0pzYjJOcklHZGhjeUJzYVcxcGRDd2dhVzRnWVNCc2IzZGxjaUJqWVhObElHaGxlQ0J3Y21WbWFYaGxaQ0J6ZEhKcGJtY3VYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UxUnlZVzV6WVdOMGFXOXVUV1YwWVZ0ZGZTQmpkWEp5Wlc1MFRtVjBkMjl5YTFSNFRHbHpkQ0F0SUVGdUlHRnljbUY1SUc5bUlIUnlZVzV6WVdOMGFXOXVjeUJoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdOMWNuSmxiblJzZVNCelpXeGxZM1JsWkNCdVpYUjNiM0pyTGx4dUlDb2dRSEJ5YjNCbGNuUjVJSHR2WW1wbFkzUjlJSFZ1WVhCd2NtOTJaV1JOYzJkeklDMGdRVzRnYjJKcVpXTjBJRzltSUcxbGMzTmhaMlZ6SUhCbGJtUnBibWNnWVhCd2NtOTJZV3dzSUcxaGNIQnBibWNnWVNCMWJtbHhkV1VnU1VRZ2RHOGdkR2hsSUc5d2RHbHZibk11WEc0Z0tpQkFjSEp2Y0dWeWRIa2dlMjUxYldKbGNuMGdkVzVoY0hCeWIzWmxaRTF6WjBOdmRXNTBJQzBnVkdobElHNTFiV0psY2lCdlppQnRaWE56WVdkbGN5QnBiaUIxYm1Gd2NISnZkbVZrVFhObmN5NWNiaUFxSUVCd2NtOXdaWEowZVNCN2IySnFaV04wZlNCMWJtRndjSEp2ZG1Wa1VHVnljMjl1WVd4TmMyZHpJQzBnUVc0Z2IySnFaV04wSUc5bUlHMWxjM05oWjJWeklIQmxibVJwYm1jZ1lYQndjbTkyWVd3c0lHMWhjSEJwYm1jZ1lTQjFibWx4ZFdVZ1NVUWdkRzhnZEdobElHOXdkR2x2Ym5NdVhHNGdLaUJBY0hKdmNHVnlkSGtnZTI1MWJXSmxjbjBnZFc1aGNIQnliM1psWkZCbGNuTnZibUZzVFhOblEyOTFiblFnTFNCVWFHVWdiblZ0WW1WeUlHOW1JRzFsYzNOaFoyVnpJR2x1SUhWdVlYQndjbTkyWldSUVpYSnpiMjVoYkUxelozTXVYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UyOWlhbVZqZEgwZ2RXNWhjSEJ5YjNabFpFVnVZM0o1Y0hScGIyNVFkV0pzYVdOTFpYbE5jMmR6SUMwZ1FXNGdiMkpxWldOMElHOW1JRzFsYzNOaFoyVnpJSEJsYm1ScGJtY2dZWEJ3Y205MllXd3NJRzFoY0hCcGJtY2dZU0IxYm1seGRXVWdTVVFnZEc4Z2RHaGxJRzl3ZEdsdmJuTXVYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UyNTFiV0psY24wZ2RXNWhjSEJ5YjNabFpFVnVZM0o1Y0hScGIyNVFkV0pzYVdOTFpYbE5jMmREYjNWdWRDQXRJRlJvWlNCdWRXMWlaWElnYjJZZ2JXVnpjMkZuWlhNZ2FXNGdSVzVqY25sd2RHbHZibEIxWW14cFkwdGxlVTF6WjNNdVhHNGdLaUJBY0hKdmNHVnlkSGtnZTI5aWFtVmpkSDBnZFc1aGNIQnliM1psWkVSbFkzSjVjSFJOYzJkeklDMGdRVzRnYjJKcVpXTjBJRzltSUcxbGMzTmhaMlZ6SUhCbGJtUnBibWNnWVhCd2NtOTJZV3dzSUcxaGNIQnBibWNnWVNCMWJtbHhkV1VnU1VRZ2RHOGdkR2hsSUc5d2RHbHZibk11WEc0Z0tpQkFjSEp2Y0dWeWRIa2dlMjUxYldKbGNuMGdkVzVoY0hCeWIzWmxaRVJsWTNKNWNIUk5jMmREYjNWdWRDQXRJRlJvWlNCdWRXMWlaWElnYjJZZ2JXVnpjMkZuWlhNZ2FXNGdkVzVoY0hCeWIzWmxaRVJsWTNKNWNIUk5jMmR6TGx4dUlDb2dRSEJ5YjNCbGNuUjVJSHR2WW1wbFkzUjlJSFZ1WVhCd2NtOTJaV1JVZVhCbFpFMXpaM01nTFNCQmJpQnZZbXBsWTNRZ2IyWWdiV1Z6YzJGblpYTWdjR1Z1WkdsdVp5QmhjSEJ5YjNaaGJDd2diV0Z3Y0dsdVp5QmhJSFZ1YVhGMVpTQkpSQ0IwYnlCMGFHVWdiM0IwYVc5dWN5NWNiaUFxSUVCd2NtOXdaWEowZVNCN2JuVnRZbVZ5ZlNCMWJtRndjSEp2ZG1Wa1ZIbHdaV1JOYzJkRGIzVnVkQ0F0SUZSb1pTQnVkVzFpWlhJZ2IyWWdiV1Z6YzJGblpYTWdhVzRnZFc1aGNIQnliM1psWkZSNWNHVmtUWE5uY3k1Y2JpQXFJRUJ3Y205d1pYSjBlU0I3Ym5WdFltVnlmU0J3Wlc1a2FXNW5RWEJ3Y205MllXeERiM1Z1ZENBdElGUm9aU0J1ZFcxaVpYSWdiMllnY0dWdVpHbHVaeUJ5WlhGMVpYTjBJR2x1SUhSb1pTQmhjSEJ5YjNaaGJDQmpiMjUwY205c2JHVnlMbHh1SUNvZ1FIQnliM0JsY25SNUlIdHpkSEpwYm1kYlhYMGdhMlY1Y21sdVoxUjVjR1Z6SUMwZ1FXNGdZWEp5WVhrZ2IyWWdkVzVwY1hWbElHdGxlWEpwYm1jZ2FXUmxiblJwWm5scGJtY2djM1J5YVc1bmN5d2djbVZ3Y21WelpXNTBhVzVuSUdGMllXbHNZV0pzWlNCemRISmhkR1ZuYVdWeklHWnZjaUJqY21WaGRHbHVaeUJoWTJOdmRXNTBjeTVjYmlBcUlFQndjbTl3WlhKMGVTQjdTMlY1Y21sdVoxdGRmU0JyWlhseWFXNW5jeUF0SUVGdUlHRnljbUY1SUc5bUlHdGxlWEpwYm1jZ1pHVnpZM0pwY0hScGIyNXpMQ0J6ZFcxdFlYSnBlbWx1WnlCMGFHVWdZV05qYjNWdWRITWdkR2hoZENCaGNtVWdZWFpoYVd4aFlteGxJR1p2Y2lCMWMyVXNJR0Z1WkNCM2FHRjBJR3RsZVhKcGJtZHpJSFJvWlhrZ1ltVnNiMjVuSUhSdkxseHVJQ29nUUhCeWIzQmxjblI1SUh0emRISnBibWQ5SUhObGJHVmpkR1ZrUVdSa2NtVnpjeUF0SUVFZ2JHOTNaWElnWTJGelpTQm9aWGdnYzNSeWFXNW5JRzltSUhSb1pTQmpkWEp5Wlc1MGJIa2djMlZzWldOMFpXUWdZV1JrY21WemN5NWNiaUFxSUVCd2NtOXdaWEowZVNCN2MzUnlhVzVuZlNCamRYSnlaVzUwUTNWeWNtVnVZM2tnTFNCQklITjBjbWx1WnlCcFpHVnVkR2xtZVdsdVp5QjBhR1VnZFhObGNpZHpJSEJ5WldabGNuSmxaQ0JrYVhOd2JHRjVJR04xY25KbGJtTjVMQ0JtYjNJZ2RYTmxJR2x1SUhOb2IzZHBibWNnWTI5dWRtVnljMmx2YmlCeVlYUmxjeTVjYmlBcUlFQndjbTl3WlhKMGVTQjdiblZ0WW1WeWZTQmpiMjUyWlhKemFXOXVVbUYwWlNBdElFRWdiblZ0WW1WeUlISmxjSEpsYzJWdWRHbHVaeUIwYUdVZ1kzVnljbVZ1ZENCbGVHTm9ZVzVuWlNCeVlYUmxJR1p5YjIwZ2RHaGxJSFZ6WlhJbmN5QndjbVZtWlhKeVpXUWdZM1Z5Y21WdVkza2dkRzhnUlhSb1pYSXVYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UyNTFiV0psY24wZ1kyOXVkbVZ5YzJsdmJrUmhkR1VnTFNCQklIVnVhWGdnWlhCdlkyZ2daR0YwWlNBb2JYTXBJR1p2Y2lCMGFHVWdkR2x0WlNCMGFHVWdZM1Z5Y21WdWRDQmpiMjUyWlhKemFXOXVJSEpoZEdVZ2QyRnpJR3hoYzNRZ2NtVjBjbWxsZG1Wa0xseHVJQ29nUUhCeWIzQmxjblI1SUh0aWIyOXNaV0Z1ZlNCbWIzSm5iM1IwWlc1UVlYTnpkMjl5WkNBdElGSmxkSFZ5Ym5NZ2RISjFaU0JwWmlCMGFHVWdkWE5sY2lCb1lYTWdhVzVwZEdsaGRHVmtJSFJvWlNCd1lYTnpkMjl5WkNCeVpXTnZkbVZ5ZVNCelkzSmxaVzRzSUdseklISmxZMjkyWlhKcGJtY2dabkp2YlNCelpXVmtJSEJvY21GelpTNWNiaUFxTDF4dVhHNHZLaXBjYmlBcUlFQjBlWEJsWkdWbUlGWmxjbk5wYjI1bFpFUmhkR0ZjYmlBcUlFQndjbTl3WlhKMGVTQjdUV1YwWVUxaGMydFRkR0YwWlgwZ1pHRjBZU0F0SUZSb1pTQmtZWFJoSUdWdGFYUjBaV1FnWm5KdmJTQk5aWFJoVFdGemF5QmpiMjUwY205c2JHVnlMQ0J2Y2lCMWMyVmtJSFJ2SUdsdWFYUnBZV3hwZW1VZ2FYUXVYRzRnS2lCQWNISnZjR1Z5ZEhrZ2UyNTFiV0psY24wZ2RtVnljMmx2YmlBdElGUm9aU0JzWVhSbGMzUWdiV2xuY21GMGFXOXVJSFpsY25OcGIyNGdkR2hoZENCb1lYTWdZbVZsYmlCeWRXNHVYRzRnS2k5Y2JseHVMeW9xWEc0Z0tpQkpibWwwYVdGc2FYcGxjeUIwYUdVZ1RXVjBZVTFoYzJzZ1kyOXVkSEp2Ykd4bGNpd2dZVzVrSUhObGRITWdkWEFnWVd4c0lIQnNZWFJtYjNKdElHTnZibVpwWjNWeVlYUnBiMjR1WEc0Z0tseHVJQ29nUUhKbGRIVnlibk1nZTFCeWIyMXBjMlY5SUZObGRIVndJR052YlhCc1pYUmxMbHh1SUNvdlhHNWhjM2x1WXlCbWRXNWpkR2x2YmlCcGJtbDBhV0ZzYVhwbEtDa2dlMXh1SUNCMGNua2dlMXh1SUNBZ0lHTnZibk4wSUdsdWFYUlRkR0YwWlNBOUlHRjNZV2wwSUd4dllXUlRkR0YwWlVaeWIyMVFaWEp6YVhOMFpXNWpaU2dwTzF4dUlDQWdJR052Ym5OMElHbHVhWFJNWVc1blEyOWtaU0E5SUdGM1lXbDBJR2RsZEVacGNuTjBVSEpsWm1WeWNtVmtUR0Z1WjBOdlpHVW9LVHRjYmx4dVhHNGdJQ0FnYkdWMElHbHpSbWx5YzNSTlpYUmhUV0Z6YTBOdmJuUnliMnhzWlhKVFpYUjFjRHRjYmlBZ0lDQnBaaUFvYVhOTllXNXBabVZ6ZEZZektTQjdYRzRnSUNBZ0lDQmpiMjV6ZENCelpYTnphVzl1UkdGMFlTQTlJR0YzWVdsMElHSnliM2R6WlhJdWMzUnZjbUZuWlM1elpYTnphVzl1TG1kbGRDaGJYRzRnSUNBZ0lDQWdJQ2RwYzBacGNuTjBUV1YwWVUxaGMydERiMjUwY205c2JHVnlVMlYwZFhBbkxGeHVJQ0FnSUNBZ1hTazdYRzVjYmlBZ0lDQWdJR2x6Um1seWMzUk5aWFJoVFdGemEwTnZiblJ5YjJ4c1pYSlRaWFIxY0NBOVhHNGdJQ0FnSUNBZ0lITmxjM05wYjI1RVlYUmhQeTVwYzBacGNuTjBUV1YwWVUxaGMydERiMjUwY205c2JHVnlVMlYwZFhBZ1BUMDlJSFZ1WkdWbWFXNWxaRHRjYmlBZ0lDQWdJR0YzWVdsMElHSnliM2R6WlhJdWMzUnZjbUZuWlM1elpYTnphVzl1TG5ObGRDaDdJR2x6Um1seWMzUk5aWFJoVFdGemEwTnZiblJ5YjJ4c1pYSlRaWFIxY0NCOUtUdGNiaUFnSUNCOVhHNWNiaUFnSUNCelpYUjFjRU52Ym5SeWIyeHNaWElvWEc0Z0lDQWdJQ0JwYm1sMFUzUmhkR1VzWEc0Z0lDQWdJQ0JwYm1sMFRHRnVaME52WkdVc1hHNGdJQ0FnSUNCN2ZTeGNiaUFnSUNBZ0lHbHpSbWx5YzNSTlpYUmhUV0Z6YTBOdmJuUnliMnhzWlhKVFpYUjFjQ3hjYmlBZ0lDQXBPMXh1SUNBZ0lHbG1JQ2doYVhOTllXNXBabVZ6ZEZZektTQjdYRzRnSUNBZ0lDQmhkMkZwZENCc2IyRmtVR2hwYzJocGJtZFhZWEp1YVc1blVHRm5aU2dwTzF4dUlDQWdJSDFjYmlBZ0lDQmhkMkZwZENCelpXNWtVbVZoWkhsTlpYTnpZV2RsVkc5VVlXSnpLQ2s3WEc0Z0lDQWdiRzluTG1sdVptOG9KMDFsZEdGTllYTnJJR2x1YVhScFlXeHBlbUYwYVc5dUlHTnZiWEJzWlhSbExpY3BPMXh1SUNBZ0lISmxjMjlzZG1WSmJtbDBhV0ZzYVhwaGRHbHZiaWdwTzF4dUlDQjlJR05oZEdOb0lDaGxjbkp2Y2lrZ2UxeHVJQ0FnSUhKbGFtVmpkRWx1YVhScFlXeHBlbUYwYVc5dUtHVnljbTl5S1R0Y2JpQWdmVnh1ZlZ4dVhHNHZLaXBjYmlBcUlFRnVJR1Z5Y205eUlIUm9jbTkzYmlCcFppQjBhR1VnY0docGMyaHBibWNnZDJGeWJtbHVaeUJ3WVdkbElIUmhhMlZ6SUhSdmJ5QnNiMjVuSUhSdklHeHZZV1F1WEc0Z0tpOWNibU5zWVhOeklGQm9hWE5vYVc1blYyRnlibWx1WjFCaFoyVlVhVzFsYjNWMFJYSnliM0lnWlhoMFpXNWtjeUJGY25KdmNpQjdYRzRnSUdOdmJuTjBjblZqZEc5eUtDa2dlMXh1SUNBZ0lITjFjR1Z5S0NkVWFXMWxiM1YwSUdaaGFXeGxaQ2NwTzF4dUlDQjlYRzU5WEc1Y2JpOHFLbHh1SUNvZ1RHOWhaQ0IwYUdVZ2NHaHBjMmhwYm1jZ2QyRnlibWx1WnlCd1lXZGxJSFJsYlhCdmNtRnlhV3g1SUhSdklHVnVjM1Z5WlNCMGFHVWdjMlZ5ZG1salpWeHVJQ29nZDI5eWEyVnlJR2hoY3lCaVpXVnVJSEpsWjJsemRHVnlaV1FzSUhOdklIUm9ZWFFnZEdobElIZGhjbTVwYm1jZ2NHRm5aU0IzYjNKcmN5QnZabVpzYVc1bExseHVJQ292WEc1aGMzbHVZeUJtZFc1amRHbHZiaUJzYjJGa1VHaHBjMmhwYm1kWFlYSnVhVzVuVUdGblpTZ3BJSHRjYmlBZ2JHVjBJR2xtY21GdFpUdGNiaUFnZEhKNUlIdGNiaUFnSUNCamIyNXpkQ0JsZUhSbGJuTnBiMjVUZEdGeWRIVndVR2hwYzJocGJtZFFZV2RsVlhKc0lEMGdibVYzSUZWU1RDaGNiaUFnSUNBZ0lIQnliMk5sYzNNdVpXNTJMbEJJU1ZOSVNVNUhYMWRCVWs1SlRrZGZVRUZIUlY5VlVrd3NYRzRnSUNBZ0tUdGNiaUFnSUNBdkx5QlVhR1VnWUdWNGRHVnVjMmx2YmxOMFlYSjBkWEJnSUdoaGMyZ2djMmxuYm1Gc2N5QjBieUIwYUdVZ2NHaHBjMmhwYm1jZ2QyRnlibWx1WnlCd1lXZGxJSFJvWVhRZ2FYUWdjMmh2ZFd4a0lHNXZkQ0JpYjNSb1pYSmNiaUFnSUNBdkx5QnpaWFIwYVc1bklIVndJSE4wY21WaGJYTWdabTl5SUhWelpYSWdhVzUwWlhKaFkzUnBiMjR1SUU5MGFHVnlkMmx6WlNCMGFHbHpJSEJoWjJVZ2JHOWhaQ0IzYjNWc1pDQmpZWFZ6WlNCaElHTnZibk52YkdWY2JpQWdJQ0F2THlCbGNuSnZjaTVjYmlBZ0lDQmxlSFJsYm5OcGIyNVRkR0Z5ZEhWd1VHaHBjMmhwYm1kUVlXZGxWWEpzTG1oaGMyZ2dQU0FuSTJWNGRHVnVjMmx2YmxOMFlYSjBkWEFuTzF4dVhHNGdJQ0FnYVdaeVlXMWxJRDBnZDJsdVpHOTNMbVJ2WTNWdFpXNTBMbU55WldGMFpVVnNaVzFsYm5Rb0oybG1jbUZ0WlNjcE8xeHVJQ0FnSUdsbWNtRnRaUzV6WlhSQmRIUnlhV0oxZEdVb0ozTnlZeWNzSUdWNGRHVnVjMmx2YmxOMFlYSjBkWEJRYUdsemFHbHVaMUJoWjJWVmNtd3VhSEpsWmlrN1hHNGdJQ0FnYVdaeVlXMWxMbk5sZEVGMGRISnBZblYwWlNnbmMyRnVaR0p2ZUNjc0lDZGhiR3h2ZHkxelkzSnBjSFJ6SUdGc2JHOTNMWE5oYldVdGIzSnBaMmx1SnlrN1hHNWNiaUFnSUNBdkx5QkRjbVZoZEdVZ1hDSmtaV1psY25KbFpDQlFjbTl0YVhObFhDSWdkRzhnWVd4c2IzY2djR0Z6YzJsdVp5QnlaWE52YkhabEwzSmxhbVZqZENCMGJ5QmxkbVZ1ZENCb1lXNWtiR1Z5YzF4dUlDQWdJR3hsZENCa1pXWmxjbkpsWkZKbGMyOXNkbVU3WEc0Z0lDQWdiR1YwSUdSbFptVnljbVZrVW1WcVpXTjBPMXh1SUNBZ0lHTnZibk4wSUd4dllXUkRiMjF3YkdWMFpTQTlJRzVsZHlCUWNtOXRhWE5sS0NoeVpYTnZiSFpsTENCeVpXcGxZM1FwSUQwK0lIdGNiaUFnSUNBZ0lHUmxabVZ5Y21Wa1VtVnpiMngyWlNBOUlISmxjMjlzZG1VN1hHNGdJQ0FnSUNCa1pXWmxjbkpsWkZKbGFtVmpkQ0E5SUhKbGFtVmpkRHRjYmlBZ0lDQjlLVHRjYmx4dUlDQWdJQzh2SUZSb1pTQnNiMkZrSUdWMlpXNTBJR2x6SUdWdGFYUjBaV1FnYjI1alpTQnNiMkZrYVc1bklHaGhjeUJqYjIxd2JHVjBaV1FzSUdWMlpXNGdhV1lnZEdobElHeHZZV1JwYm1jZ1ptRnBiR1ZrTGx4dUlDQWdJQzh2SUVsbUlHeHZZV1JwYm1jZ1ptRnBiR1ZrSUhkbElHTmhiaWQwSUdSdklHRnVlWFJvYVc1bklHRmliM1YwSUdsMExDQnpieUIzWlNCa2IyNG5kQ0J1WldWa0lIUnZJR05vWldOckxseHVJQ0FnSUdsbWNtRnRaUzVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2RzYjJGa0p5d2daR1ZtWlhKeVpXUlNaWE52YkhabEtUdGNibHh1SUNBZ0lDOHZJRlJvYVhNZ2MzUmxjQ0JwYm1sMGFXRjBaWE1nZEdobElIQmhaMlVnYkc5aFpHbHVaeTVjYmlBZ0lDQjNhVzVrYjNjdVpHOWpkVzFsYm5RdVltOWtlUzVoY0hCbGJtUkRhR2xzWkNocFpuSmhiV1VwTzF4dVhHNGdJQ0FnTHk4Z1ZHaHBjeUIwYVcxbGIzVjBJR1Z1YzNWeVpYTWdkR2hoZENCMGFHbHpJR2xtY21GdFpTQm5aWFJ6SUdOc1pXRnVaV1FnZFhBZ2FXNGdZU0J5WldGemIyNWhZbXhsWEc0Z0lDQWdMeThnZEdsdFpXWnlZVzFsTENCaGJtUWdaVzV6ZFhKbGN5QjBhR0YwSUhSb1pTQmNJbWx1YVhScFlXeHBlbUYwYVc5dUlHTnZiWEJzWlhSbFhDSWdiV1Z6YzJGblpWeHVJQ0FnSUM4dklHUnZaWE51SjNRZ1oyVjBJR1JsYkdGNVpXUWdkRzl2SUd4dmJtY3VYRzRnSUNBZ2MyVjBWR2x0Wlc5MWRDaGNiaUFnSUNBZ0lDZ3BJRDArSUdSbFptVnljbVZrVW1WcVpXTjBLRzVsZHlCUWFHbHphR2x1WjFkaGNtNXBibWRRWVdkbFZHbHRaVzkxZEVWeWNtOXlLQ2twTEZ4dUlDQWdJQ0FnVUVoSlUwaEpUa2RmVjBGU1RrbE9SMTlRUVVkRlgxUkpUVVZQVlZRc1hHNGdJQ0FnS1R0Y2JpQWdJQ0JoZDJGcGRDQnNiMkZrUTI5dGNHeGxkR1U3WEc0Z0lIMGdZMkYwWTJnZ0tHVnljbTl5S1NCN1hHNGdJQ0FnYVdZZ0tHVnljbTl5SUdsdWMzUmhibU5sYjJZZ1VHaHBjMmhwYm1kWFlYSnVhVzVuVUdGblpWUnBiV1Z2ZFhSRmNuSnZjaWtnZTF4dUlDQWdJQ0FnWTI5dWMyOXNaUzUzWVhKdUtGeHVJQ0FnSUNBZ0lDQW5VR2hwYzJocGJtY2dkMkZ5Ym1sdVp5QndZV2RsSUhScGJXVnZkWFE3SUhCaFoyVWdibTkwSUdkMVlYSmhibVYwWldWa0lIUnZJSGR2Y21zZ2IyWm1iR2x1WlM0bkxGeHVJQ0FnSUNBZ0tUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpZ25SbUZwYkdWa0lIUnZJR2x1YVhScFlXeHBlbVVnY0docGMyaHBibWNnZDJGeWJtbHVaeUJ3WVdkbEp5d2daWEp5YjNJcE8xeHVJQ0FnSUgxY2JpQWdmU0JtYVc1aGJHeDVJSHRjYmlBZ0lDQnBaaUFvYVdaeVlXMWxLU0I3WEc0Z0lDQWdJQ0JwWm5KaGJXVXVjbVZ0YjNabEtDazdYRzRnSUNBZ2ZWeHVJQ0I5WEc1OVhHNWNiaTh2WEc0dkx5QlRkR0YwWlNCaGJtUWdVR1Z5YzJsemRHVnVZMlZjYmk4dlhHNWNiaThxS2x4dUlDb2dURzloWkhNZ1lXNTVJSE4wYjNKbFpDQmtZWFJoTENCd2NtbHZjbWwwYVhwcGJtY2dkR2hsSUd4aGRHVnpkQ0J6ZEc5eVlXZGxJSE4wY21GMFpXZDVMbHh1SUNvZ1RXbG5jbUYwWlhNZ2RHaGhkQ0JrWVhSaElITmphR1Z0WVNCcGJpQmpZWE5sSUdsMElIZGhjeUJzWVhOMElHeHZZV1JsWkNCdmJpQmhiaUJ2YkdSbGNpQjJaWEp6YVc5dUxseHVJQ3BjYmlBcUlFQnlaWFIxY201eklIdFFjbTl0YVhObFBFMWxkR0ZOWVhOclUzUmhkR1UrZlNCTVlYTjBJR1JoZEdFZ1pXMXBkSFJsWkNCbWNtOXRJSEJ5WlhacGIzVnpJR2x1YzNSaGJtTmxJRzltSUUxbGRHRk5ZWE5yTGx4dUlDb3ZYRzVsZUhCdmNuUWdZWE41Ym1NZ1puVnVZM1JwYjI0Z2JHOWhaRk4wWVhSbFJuSnZiVkJsY25OcGMzUmxibU5sS0NrZ2UxeHVJQ0F2THlCdGFXZHlZWFJwYjI1elhHNGdJR052Ym5OMElHMXBaM0poZEc5eUlEMGdibVYzSUUxcFozSmhkRzl5S0hzZ2JXbG5jbUYwYVc5dWN5QjlLVHRjYmlBZ2JXbG5jbUYwYjNJdWIyNG9KMlZ5Y205eUp5d2dZMjl1YzI5c1pTNTNZWEp1S1R0Y2JseHVJQ0F2THlCeVpXRmtJR1p5YjIwZ1pHbHphMXh1SUNBdkx5Qm1hWEp6ZENCbWNtOXRJSEJ5WldabGNuSmxaQ3dnWVhONWJtTWdRVkJKT2x4dUlDQjJaWEp6YVc5dVpXUkVZWFJoSUQxY2JpQWdJQ0FvWVhkaGFYUWdiRzlqWVd4VGRHOXlaUzVuWlhRb0tTa2dmSHdnYldsbmNtRjBiM0l1WjJWdVpYSmhkR1ZKYm1sMGFXRnNVM1JoZEdVb1ptbHljM1JVYVcxbFUzUmhkR1VwTzF4dVhHNGdJQzh2SUdOb1pXTnJJR2xtSUhOdmJXVm9iM2NnYzNSaGRHVWdhWE1nWlcxd2RIbGNiaUFnTHk4Z2RHaHBjeUJ6YUc5MWJHUWdibVYyWlhJZ2FHRndjR1Z1SUdKMWRDQnVaWGNnWlhKeWIzSWdjbVZ3YjNKMGFXNW5JSE4xWjJkbGMzUnpJSFJvWVhRZ2FYUWdhR0Z6WEc0Z0lDOHZJR1p2Y2lCaElITnRZV3hzSUc1MWJXSmxjaUJ2WmlCMWMyVnljMXh1SUNBdkx5Qm9kSFJ3Y3pvdkwyZHBkR2gxWWk1amIyMHZiV1YwWVcxaGMyc3ZiV1YwWVcxaGMyc3RaWGgwWlc1emFXOXVMMmx6YzNWbGN5OHpPVEU1WEc0Z0lHbG1JQ2gyWlhKemFXOXVaV1JFWVhSaElDWW1JQ0YyWlhKemFXOXVaV1JFWVhSaExtUmhkR0VwSUh0Y2JpQWdJQ0F2THlCMWJtRmliR1VnZEc4Z2NtVmpiM1psY2l3Z1kyeGxZWElnYzNSaGRHVmNiaUFnSUNCMlpYSnphVzl1WldSRVlYUmhJRDBnYldsbmNtRjBiM0l1WjJWdVpYSmhkR1ZKYm1sMGFXRnNVM1JoZEdVb1ptbHljM1JVYVcxbFUzUmhkR1VwTzF4dUlDQWdJSE5sYm5SeWVTNWpZWEIwZFhKbFRXVnpjMkZuWlNnblRXVjBZVTFoYzJzZ0xTQkZiWEIwZVNCMllYVnNkQ0JtYjNWdVpDQXRJSFZ1WVdKc1pTQjBieUJ5WldOdmRtVnlKeWs3WEc0Z0lIMWNibHh1SUNBdkx5QnlaWEJ2Y25RZ2JXbG5jbUYwYVc5dUlHVnljbTl5Y3lCMGJ5QnpaVzUwY25sY2JpQWdiV2xuY21GMGIzSXViMjRvSjJWeWNtOXlKeXdnS0dWeWNpa2dQVDRnZTF4dUlDQWdJQzh2SUdkbGRDQjJZWFZzZENCemRISjFZM1IxY21VZ2QybDBhRzkxZENCelpXTnlaWFJ6WEc0Z0lDQWdZMjl1YzNRZ2RtRjFiSFJUZEhKMVkzUjFjbVVnUFNCblpYUlBZbXBUZEhKMVkzUjFjbVVvZG1WeWMybHZibVZrUkdGMFlTazdYRzRnSUNBZ2MyVnVkSEo1TG1OaGNIUjFjbVZGZUdObGNIUnBiMjRvWlhKeUxDQjdYRzRnSUNBZ0lDQXZMeUJjSW1WNGRISmhYQ0lnYTJWNUlHbHpJSEpsY1hWcGNtVmtJR0o1SUZObGJuUnllVnh1SUNBZ0lDQWdaWGgwY21FNklIc2dkbUYxYkhSVGRISjFZM1IxY21VZ2ZTeGNiaUFnSUNCOUtUdGNiaUFnZlNrN1hHNWNiaUFnTHk4Z2JXbG5jbUYwWlNCa1lYUmhYRzRnSUhabGNuTnBiMjVsWkVSaGRHRWdQU0JoZDJGcGRDQnRhV2R5WVhSdmNpNXRhV2R5WVhSbFJHRjBZU2gyWlhKemFXOXVaV1JFWVhSaEtUdGNiaUFnYVdZZ0tDRjJaWEp6YVc5dVpXUkVZWFJoS1NCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2ROWlhSaFRXRnpheUF0SUcxcFozSmhkRzl5SUhKbGRIVnlibVZrSUhWdVpHVm1hVzVsWkNjcE8xeHVJQ0I5WEc0Z0lDOHZJSFJvYVhNZ2FXNXBkR2xoYkdsNlpYTWdkR2hsSUcxbGRHRXZkbVZ5YzJsdmJpQmtZWFJoSUdGeklHRWdZMnhoYzNNZ2RtRnlhV0ZpYkdVZ2RHOGdZbVVnZFhObFpDQm1iM0lnWm5WMGRYSmxJSGR5YVhSbGMxeHVJQ0JzYjJOaGJGTjBiM0psTG5ObGRFMWxkR0ZrWVhSaEtIWmxjbk5wYjI1bFpFUmhkR0V1YldWMFlTazdYRzVjYmlBZ0x5OGdkM0pwZEdVZ2RHOGdaR2x6YTF4dUlDQnNiMk5oYkZOMGIzSmxMbk5sZENoMlpYSnphVzl1WldSRVlYUmhMbVJoZEdFcE8xeHVYRzRnSUM4dklISmxkSFZ5YmlCcWRYTjBJSFJvWlNCa1lYUmhYRzRnSUhKbGRIVnliaUIyWlhKemFXOXVaV1JFWVhSaExtUmhkR0U3WEc1OVhHNWNibVoxYm1OMGFXOXVJR2RsYm1WeVlYUmxRMjl1Ym1WamRHbHZia2xrS0hKbGJXOTBaVkJ2Y25Rc0lHUmxkR1ZqZEdWa1VISnZZMlZ6YzA1aGJXVXBJSHRjYmlBZ1kyOXVjM1FnZXlCelpXNWtaWElnZlNBOUlISmxiVzkwWlZCdmNuUTdYRzRnSUdOdmJuTjBJR2xrSUQwZ2MyVnVaR1Z5UHk1MFlXSWdQeUJ6Wlc1a1pYSXVkR0ZpTG1sa0lEb2djMlZ1WkdWeVB5NXBaRHRjYmlBZ2FXWWdLQ0ZwWkNCOGZDQWhaR1YwWldOMFpXUlFjbTlqWlhOelRtRnRaU2tnZTF4dUlDQWdJR052Ym5OdmJHVXVaWEp5YjNJb1hHNGdJQ0FnSUNBblRYVnpkQ0J3Y205MmFXUmxJR2xrSUdGdVpDQmtaWFJsWTNSbFpGQnliMk5sYzNOT1lXMWxJSFJ2SUdkbGJtVnlZWFJsSUdOdmJtNWxZM1JwYjI0Z2FXUXVKeXhjYmlBZ0lDQWdJR2xrTEZ4dUlDQWdJQ0FnWkdWMFpXTjBaV1JRY205alpYTnpUbUZ0WlN4Y2JpQWdJQ0FwT3lBdkx5QmxjMnhwYm5RdFpHbHpZV0pzWlMxc2FXNWxJRzV2TFdOdmJuTnZiR1ZjYmlBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb1hHNGdJQ0FnSUNBblRYVnpkQ0J3Y205MmFXUmxJR2xrSUdGdVpDQmtaWFJsWTNSbFpGQnliMk5sYzNOT1lXMWxJSFJ2SUdkbGJtVnlZWFJsSUdOdmJtNWxZM1JwYjI0Z2FXUXVKeXhjYmlBZ0lDQXBPMXh1SUNCOVhHNGdJSEpsZEhWeWJpQmdKSHRwWkgwdEpIdGtaWFJsWTNSbFpGQnliMk5sYzNOT1lXMWxmV0E3WEc1OVhHNHZLaXBjYmlBcUlFbHVhWFJwWVd4cGVtVnpJSFJvWlNCTlpYUmhUV0Z6YXlCRGIyNTBjbTlzYkdWeUlIZHBkR2dnWVc1NUlHbHVhWFJwWVd3Z2MzUmhkR1VnWVc1a0lHUmxabUYxYkhRZ2JHRnVaM1ZoWjJVdVhHNGdLaUJEYjI1bWFXZDFjbVZ6SUhCc1lYUm1iM0p0TFhOd1pXTnBabWxqSUdWeWNtOXlJSEpsY0c5eWRHbHVaeUJ6ZEhKaGRHVm5lUzVjYmlBcUlGTjBjbVZoYlhNZ1pXMXBkSFJsWkNCemRHRjBaU0IxY0dSaGRHVnpJSFJ2SUhCc1lYUm1iM0p0TFhOd1pXTnBabWxqSUhOMGIzSmhaMlVnYzNSeVlYUmxaM2t1WEc0Z0tpQkRjbVZoZEdWeklIQnNZWFJtYjNKdElHeHBjM1JsYm1WeWN5Qm1iM0lnYm1WM0lFUmhjSEJ6TDBOdmJuUmxlSFJ6TENCaGJtUWdjMlYwY3lCMWNDQjBhR1ZwY2lCa1lYUmhJR052Ym01bFkzUnBiMjV6SUhSdklIUm9aU0JqYjI1MGNtOXNiR1Z5TGx4dUlDcGNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0JwYm1sMFUzUmhkR1VnTFNCVWFHVWdhVzVwZEdsaGJDQnpkR0YwWlNCMGJ5QnpkR0Z5ZENCMGFHVWdZMjl1ZEhKdmJHeGxjaUIzYVhSb0xDQnRZWFJqYUdWeklIUm9aU0J6ZEdGMFpTQjBhR0YwSUdseklHVnRhWFIwWldRZ1puSnZiU0IwYUdVZ1kyOXVkSEp2Ykd4bGNpNWNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JwYm1sMFRHRnVaME52WkdVZ0xTQlVhR1VnY21WbmFXOXVJR052WkdVZ1ptOXlJSFJvWlNCc1lXNW5kV0ZuWlNCd2NtVm1aWEp5WldRZ1lua2dkR2hsSUdOMWNuSmxiblFnZFhObGNpNWNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0J2ZG1WeWNtbGtaWE1nTFNCdlltcGxZM1FnZDJsMGFDQmpZV3hzWW1GamEzTWdkR2hoZENCaGNtVWdZV3hzYjNkbFpDQjBieUJ2ZG1WeWNtbGtaU0IwYUdVZ2MyVjBkWEFnWTI5dWRISnZiR3hsY2lCc2IyZHBZeUFvZFhObFpuVnNiQ0JtYjNJZ1pHVnphM1J2Y0NCaGNIQXBYRzRnS2lCQWNHRnlZVzBnYVhOR2FYSnpkRTFsZEdGTllYTnJRMjl1ZEhKdmJHeGxjbE5sZEhWd1hHNGdLaTljYm1WNGNHOXlkQ0JtZFc1amRHbHZiaUJ6WlhSMWNFTnZiblJ5YjJ4c1pYSW9YRzRnSUdsdWFYUlRkR0YwWlN4Y2JpQWdhVzVwZEV4aGJtZERiMlJsTEZ4dUlDQnZkbVZ5Y21sa1pYTXNYRzRnSUdselJtbHljM1JOWlhSaFRXRnphME52Ym5SeWIyeHNaWEpUWlhSMWNDeGNiaWtnZTF4dUlDQXZMMXh1SUNBdkx5Qk5aWFJoVFdGemF5QkRiMjUwY205c2JHVnlYRzRnSUM4dlhHNWNiaUFnWTI5dWRISnZiR3hsY2lBOUlHNWxkeUJOWlhSaGJXRnphME52Ym5SeWIyeHNaWElvZTF4dUlDQWdJR2x1Wm5WeVlWQnliMnBsWTNSSlpEb2djSEp2WTJWemN5NWxibll1U1U1R1ZWSkJYMUJTVDBwRlExUmZTVVFzWEc0Z0lDQWdMeThnVlhObGNpQmpiMjVtYVhKdFlYUnBiMjRnWTJGc2JHSmhZMnR6T2x4dUlDQWdJSE5vYjNkVmMyVnlRMjl1Wm1seWJXRjBhVzl1T2lCMGNtbG5aMlZ5Vldrc1hHNGdJQ0FnTHk4Z2FXNXBkR2xoYkNCemRHRjBaVnh1SUNBZ0lHbHVhWFJUZEdGMFpTeGNiaUFnSUNBdkx5QnBibWwwYVdGc0lHeHZZMkZzWlNCamIyUmxYRzRnSUNBZ2FXNXBkRXhoYm1kRGIyUmxMRnh1SUNBZ0lDOHZJSEJzWVhSbWIzSnRJSE53WldOcFptbGpJR0Z3YVZ4dUlDQWdJSEJzWVhSbWIzSnRMRnh1SUNBZ0lHNXZkR2xtYVdOaGRHbHZiazFoYm1GblpYSXNYRzRnSUNBZ1luSnZkM05sY2l4Y2JpQWdJQ0JuWlhSU1pYRjFaWE4wUVdOamIzVnVkRlJoWWtsa2N6b2dLQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUhKbGNYVmxjM1JCWTJOdmRXNTBWR0ZpU1dSek8xeHVJQ0FnSUgwc1hHNGdJQ0FnWjJWMFQzQmxiazFsZEdGdFlYTnJWR0ZpYzBsa2N6b2dLQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUc5d1pXNU5aWFJoYldGemExUmhZbk5KUkhNN1hHNGdJQ0FnZlN4Y2JpQWdJQ0JzYjJOaGJGTjBiM0psTEZ4dUlDQWdJRzkyWlhKeWFXUmxjeXhjYmlBZ0lDQnBjMFpwY25OMFRXVjBZVTFoYzJ0RGIyNTBjbTlzYkdWeVUyVjBkWEFzWEc0Z0lIMHBPMXh1WEc0Z0lITmxkSFZ3Ulc1elNYQm1jMUpsYzI5c2RtVnlLSHRjYmlBZ0lDQm5aWFJEZFhKeVpXNTBRMmhoYVc1SlpEb2dLQ2tnUFQ1Y2JpQWdJQ0FnSUdOdmJuUnliMnhzWlhJdWJtVjBkMjl5YTBOdmJuUnliMnhzWlhJdWMzUnZjbVV1WjJWMFUzUmhkR1VvS1M1d2NtOTJhV1JsY2tOdmJtWnBaeTVqYUdGcGJrbGtMRnh1SUNBZ0lHZGxkRWx3Wm5OSFlYUmxkMkY1T2lCamIyNTBjbTlzYkdWeUxuQnlaV1psY21WdVkyVnpRMjl1ZEhKdmJHeGxjaTVuWlhSSmNHWnpSMkYwWlhkaGVTNWlhVzVrS0Z4dUlDQWdJQ0FnWTI5dWRISnZiR3hsY2k1d2NtVm1aWEpsYm1ObGMwTnZiblJ5YjJ4c1pYSXNYRzRnSUNBZ0tTeGNiaUFnSUNCd2NtOTJhV1JsY2pvZ1kyOXVkSEp2Ykd4bGNpNXdjbTkyYVdSbGNpeGNiaUFnZlNrN1hHNWNiaUFnTHk4Z2MyVjBkWEFnYzNSaGRHVWdjR1Z5YzJsemRHVnVZMlZjYmlBZ2NIVnRjQ2hjYmlBZ0lDQnpkRzl5WlVGelUzUnlaV0Z0S0dOdmJuUnliMnhzWlhJdWMzUnZjbVVwTEZ4dUlDQWdJR1JsWW05MWJtTmxLREV3TURBcExGeHVJQ0FnSUdOeVpXRjBaVk4wY21WaGJWTnBibXNvWVhONWJtTWdLSE4wWVhSbEtTQTlQaUI3WEc0Z0lDQWdJQ0JoZDJGcGRDQnNiMk5oYkZOMGIzSmxMbk5sZENoemRHRjBaU2s3WEc0Z0lDQWdJQ0J6ZEdGMFpWQmxjbk5wYzNSbGJtTmxSWFpsYm5SekxtVnRhWFFvSjNOMFlYUmxMWEJsY25OcGMzUmxaQ2NzSUhOMFlYUmxLVHRjYmlBZ0lDQjlLU3hjYmlBZ0lDQW9aWEp5YjNJcElEMCtJSHRjYmlBZ0lDQWdJR3h2Wnk1bGNuSnZjaWduVFdWMFlVMWhjMnNnTFNCUVpYSnphWE4wWlc1alpTQndhWEJsYkdsdVpTQm1ZV2xzWldRbkxDQmxjbkp2Y2lrN1hHNGdJQ0FnZlN4Y2JpQWdLVHRjYmx4dUlDQnpaWFIxY0ZObGJuUnllVWRsZEZOMFlYUmxSMnh2WW1Gc0tHTnZiblJ5YjJ4c1pYSXBPMXh1WEc0Z0lHTnZibk4wSUdselEyeHBaVzUwVDNCbGJsTjBZWFIxY3lBOUlDZ3BJRDArSUh0Y2JpQWdJQ0J5WlhSMWNtNGdLRnh1SUNBZ0lDQWdjRzl3ZFhCSmMwOXdaVzRnZkh4Y2JpQWdJQ0FnSUVKdmIyeGxZVzRvVDJKcVpXTjBMbXRsZVhNb2IzQmxiazFsZEdGdFlYTnJWR0ZpYzBsRWN5a3ViR1Z1WjNSb0tTQjhmRnh1SUNBZ0lDQWdibTkwYVdacFkyRjBhVzl1U1hOUGNHVnVYRzRnSUNBZ0tUdGNiaUFnZlR0Y2JseHVJQ0JqYjI1emRDQnZia05zYjNObFJXNTJhWEp2Ym0xbGJuUkpibk4wWVc1alpYTWdQU0FvYVhORGJHbGxiblJQY0dWdUxDQmxiblpwY205dWJXVnVkRlI1Y0dVcElEMCtJSHRjYmlBZ0lDQXZMeUJwWmlCaGJHd2dhVzV6ZEdGdVkyVnpJRzltSUcxbGRHRnRZWE5ySUdGeVpTQmpiRzl6WldRZ2QyVWdZMkZzYkNCaElHMWxkR2h2WkNCdmJpQjBhR1VnWTI5dWRISnZiR3hsY2lCMGJ5QnpkRzl3SUdkaGMwWmxaVU52Ym5SeWIyeHNaWElnY0c5c2JHbHVaMXh1SUNBZ0lHbG1JQ2hwYzBOc2FXVnVkRTl3Wlc0Z1BUMDlJR1poYkhObEtTQjdYRzRnSUNBZ0lDQmpiMjUwY205c2JHVnlMbTl1UTJ4cFpXNTBRMnh2YzJWa0tDazdYRzRnSUNBZ0lDQXZMeUJ2ZEdobGNuZHBjMlVnZDJVZ2QyRnVkQ0IwYnlCdmJteDVJSEpsYlc5MlpTQjBhR1VnY0c5c2JHbHVaeUIwYjJ0bGJuTWdabTl5SUhSb1pTQmxiblpwY205dWJXVnVkQ0IwZVhCbElIUm9ZWFFnYUdGeklHTnNiM05sWkZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQXZMeUJwYmlCMGFHVWdZMkZ6WlNCdlppQm1kV3hzYzJOeVpXVnVJR1Z1ZG1seWIyNXRaVzUwSUdFZ2RYTmxjaUJ0YVdkb2RDQm9ZWFpsSUcxMWJIUnBjR3hsSUhSaFluTWdiM0JsYmlCemJ5QjNaU0JrYjI0bmRDQjNZVzUwSUhSdklHUnBjMk52Ym01bFkzUWdZV3hzSUc5bVhHNGdJQ0FnSUNBdkx5QnBkSE1nWTI5eWNtVnpjRzl1WkdsdVp5QndiMnhzYVc1bklIUnZhMlZ1Y3lCMWJteGxjM01nWVd4c0lIUmhZbk1nWVhKbElHTnNiM05sWkM1Y2JpQWdJQ0FnSUdsbUlDaGNiaUFnSUNBZ0lDQWdaVzUyYVhKdmJtMWxiblJVZVhCbElEMDlQU0JGVGxaSlVrOU9UVVZPVkY5VVdWQkZYMFpWVEV4VFExSkZSVTRnSmlaY2JpQWdJQ0FnSUNBZ1FtOXZiR1ZoYmloUFltcGxZM1F1YTJWNWN5aHZjR1Z1VFdWMFlXMWhjMnRVWVdKelNVUnpLUzVzWlc1bmRHZ3BYRzRnSUNBZ0lDQXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdZMjl1ZEhKdmJHeGxjaTV2YmtWdWRtbHliMjV0Wlc1MFZIbHdaVU5zYjNObFpDaGxiblpwY205dWJXVnVkRlI1Y0dVcE8xeHVJQ0FnSUgxY2JpQWdmVHRjYmx4dUlDQXZLaXBjYmlBZ0lDb2dRU0J5ZFc1MGFXMWxMbEJ2Y25RZ2IySnFaV04wTENCaGN5QndjbTkyYVdSbFpDQmllU0IwYUdVZ1luSnZkM05sY2pwY2JpQWdJQ3BjYmlBZ0lDb2dRSE5sWlNCb2RIUndjem92TDJSbGRtVnNiM0JsY2k1dGIzcHBiR3hoTG05eVp5OWxiaTFWVXk5QlpHUXRiMjV6TDFkbFlrVjRkR1Z1YzJsdmJuTXZRVkJKTDNKMWJuUnBiV1V2VUc5eWRGeHVJQ0FnS2lCQWRIbHdaV1JsWmlCUWIzSjBYRzRnSUNBcUlFQjBlWEJsSUU5aWFtVmpkRnh1SUNBZ0tpOWNibHh1SUNBdktpcGNiaUFnSUNvZ1EyOXVibVZqZEhNZ1lTQlFiM0owSUhSdklIUm9aU0JOWlhSaFRXRnpheUJqYjI1MGNtOXNiR1Z5SUhacFlTQmhJRzExYkhScGNHeGxlR1ZrSUdSMWNHeGxlQ0J6ZEhKbFlXMHVYRzRnSUNBcUlGUm9hWE1nYldWMGFHOWtJR2xrWlc1MGFXWnBaWE1nZEhKMWMzUmxaQ0FvVFdWMFlVMWhjMnNwSUdsdWRHVnlabUZqWlhNc0lHRnVaQ0JqYjI1dVpXTjBjeUIwYUdWdElHUnBabVpsY21WdWRHeDVJR1p5YjIwZ2RXNTBjblZ6ZEdWa0lDaDNaV0lnY0dGblpYTXBMbHh1SUNBZ0tseHVJQ0FnS2lCQWNHRnlZVzBnZTFCdmNuUjlJSEpsYlc5MFpWQnZjblFnTFNCVWFHVWdjRzl5ZENCd2NtOTJhV1JsWkNCaWVTQmhJRzVsZHlCamIyNTBaWGgwTGx4dUlDQWdLaTljYmlBZ1kyOXVibVZqZEZKbGJXOTBaU0E5SUdGemVXNWpJQ2h5WlcxdmRHVlFiM0owS1NBOVBpQjdYRzVjYmlBZ0lDQmpiMjV6ZENCd2NtOWpaWE56VG1GdFpTQTlJSEpsYlc5MFpWQnZjblF1Ym1GdFpUdGNibHh1SUNBZ0lHbG1JQ2h0WlhSaGJXRnphMEpzYjJOclpXUlFiM0owY3k1cGJtTnNkV1JsY3loeVpXMXZkR1ZRYjNKMExtNWhiV1VwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdiR1YwSUdselRXVjBZVTFoYzJ0SmJuUmxjbTVoYkZCeWIyTmxjM01nUFNCbVlXeHpaVHRjYmlBZ0lDQmpiMjV6ZENCemIzVnlZMlZRYkdGMFptOXliU0E5SUdkbGRGQnNZWFJtYjNKdEtDazdYRzRnSUNBZ1kyOXVjM1FnYzJWdVpHVnlWWEpzSUQwZ2NtVnRiM1JsVUc5eWRDNXpaVzVrWlhJL0xuVnliRnh1SUNBZ0lDQWdQeUJ1WlhjZ1ZWSk1LSEpsYlc5MFpWQnZjblF1YzJWdVpHVnlMblZ5YkNsY2JpQWdJQ0FnSURvZ2JuVnNiRHRjYmx4dUlDQWdJR2xtSUNoemIzVnlZMlZRYkdGMFptOXliU0E5UFQwZ1VFeEJWRVpQVWsxZlJrbFNSVVpQV0NrZ2UxeHVJQ0FnSUNBZ2FYTk5aWFJoVFdGemEwbHVkR1Z5Ym1Gc1VISnZZMlZ6Y3lBOUlHMWxkR0Z0WVhOclNXNTBaWEp1WVd4UWNtOWpaWE56U0dGemFGdHdjbTlqWlhOelRtRnRaVjA3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lHbHpUV1YwWVUxaGMydEpiblJsY201aGJGQnliMk5sYzNNZ1BWeHVJQ0FnSUNBZ0lDQnpaVzVrWlhKVmNtdy9MbTl5YVdkcGJpQTlQVDBnWUdOb2NtOXRaUzFsZUhSbGJuTnBiMjQ2THk4a2UySnliM2R6WlhJdWNuVnVkR2x0WlM1cFpIMWdPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHbG1JQ2hwYzAxbGRHRk5ZWE5yU1c1MFpYSnVZV3hRY205alpYTnpLU0I3WEc0Z0lDQWdJQ0JqYjI1emRDQndiM0owVTNSeVpXRnRJRDFjYmlBZ0lDQWdJQ0FnYjNabGNuSnBaR1Z6UHk1blpYUlFiM0owVTNSeVpXRnRQeTRvY21WdGIzUmxVRzl5ZENrZ2ZId2dibVYzSUZCdmNuUlRkSEpsWVcwb2NtVnRiM1JsVUc5eWRDazdYRzRnSUNBZ0lDQXZMeUJqYjIxdGRXNXBZMkYwYVc5dUlIZHBkR2dnY0c5d2RYQmNiaUFnSUNBZ0lHTnZiblJ5YjJ4c1pYSXVhWE5EYkdsbGJuUlBjR1Z1SUQwZ2RISjFaVHRjYmlBZ0lDQWdJR052Ym5SeWIyeHNaWEl1YzJWMGRYQlVjblZ6ZEdWa1EyOXRiWFZ1YVdOaGRHbHZiaWh3YjNKMFUzUnlaV0Z0TENCeVpXMXZkR1ZRYjNKMExuTmxibVJsY2lrN1hHNGdJQ0FnSUNCcFppQW9hWE5OWVc1cFptVnpkRll6S1NCN1hHNGdJQ0FnSUNBZ0lDOHZJRWxtSUhkbElHZGxkQ0JoSUZkUFVrdEZVbDlMUlVWUVgwRk1TVlpGSUcxbGMzTmhaMlVzSUhkbElISmxjM0J2Ym1RZ2QybDBhQ0JoYmlCQlEwdGNiaUFnSUNBZ0lDQWdjbVZ0YjNSbFVHOXlkQzV2YmsxbGMzTmhaMlV1WVdSa1RHbHpkR1Z1WlhJb0tHMWxjM05oWjJVcElEMCtJSHRjYmlBZ0lDQWdJQ0FnSUNCcFppQW9iV1Z6YzJGblpTNXVZVzFsSUQwOVBTQlhUMUpMUlZKZlMwVkZVRjlCVEVsV1JWOU5SVk5UUVVkRktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QlVieUIwWlhOMElIVnVMV052YlcxbGJuUWdkR2hwY3lCc2FXNWxJR0Z1WkNCM1lXbDBJR1p2Y2lBeElHMXBiblYwWlM0Z1FXNGdaWEp5YjNJZ2MyaHZkV3hrSUdKbElITm9iM2R1SUc5dUlFMWxkR0ZOWVhOcklGVkpMbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnRiM1JsVUc5eWRDNXdiM04wVFdWemMyRm5aU2g3SUc1aGJXVTZJRUZEUzE5TFJVVlFYMEZNU1ZaRlgwMUZVMU5CUjBVZ2ZTazdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZiblJ5YjJ4c1pYSXVZWEJ3VTNSaGRHVkRiMjUwY205c2JHVnlMbk5sZEZObGNuWnBZMlZYYjNKclpYSk1ZWE4wUVdOMGFYWmxWR2x0WlNoY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUkdGMFpTNXViM2NvS1N4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ2s3WEc0Z0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnWTI5dWMzUWdZMjl1Ym1WamRHbHZia2xrSUQwZ1oyVnVaWEpoZEdWRGIyNXVaV04wYVc5dVNXUW9jbVZ0YjNSbFVHOXlkQ3dnY0hKdlkyVnpjMDVoYldVcE8xeHVJQ0FnSUNBZ2FXWWdLSEJ5YjJObGMzTk9ZVzFsSUQwOVBTQkZUbFpKVWs5T1RVVk9WRjlVV1ZCRlgxQlBVRlZRS1NCN1hHNGdJQ0FnSUNBZ0lIQnZjSFZ3U1hOUGNHVnVJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdaVzVrVDJaVGRISmxZVzBvY0c5eWRGTjBjbVZoYlN3Z0tDa2dQVDRnZTF4dUlDQWdJQ0FnSUNBZ0lHOXdaVzVOWlhSaGJXRnphME52Ym01bFkzUnBiMjV6TG5ObGRDaGpiMjV1WldOMGFXOXVTV1FzSURBcE8xeHVJQ0FnSUNBZ0lDQWdJSEJ2Y0hWd1NYTlBjR1Z1SUQwZ1ptRnNjMlU3WEc0Z0lDQWdJQ0FnSUNBZ1kyOXVjM1FnYVhORGJHbGxiblJQY0dWdUlEMGdhWE5EYkdsbGJuUlBjR1Z1VTNSaGRIVnpLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ1kyOXVkSEp2Ykd4bGNpNXBjME5zYVdWdWRFOXdaVzRnUFNCcGMwTnNhV1Z1ZEU5d1pXNDdYRzRnSUNBZ0lDQWdJQ0FnYjI1RGJHOXpaVVZ1ZG1seWIyNXRaVzUwU1c1emRHRnVZMlZ6S0dselEyeHBaVzUwVDNCbGJpd2dSVTVXU1ZKUFRrMUZUbFJmVkZsUVJWOVFUMUJWVUNrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0JwWmlBb2NISnZZMlZ6YzA1aGJXVWdQVDA5SUVWT1ZrbFNUMDVOUlU1VVgxUlpVRVZmVGs5VVNVWkpRMEZVU1U5T0tTQjdYRzRnSUNBZ0lDQWdJRzV2ZEdsbWFXTmhkR2x2YmtselQzQmxiaUE5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJR1Z1WkU5bVUzUnlaV0Z0S0hCdmNuUlRkSEpsWVcwc0lDZ3BJRDArSUh0Y2JpQWdJQ0FnSUNBZ0lDQnZjR1Z1VFdWMFlXMWhjMnREYjI1dVpXTjBhVzl1Y3k1elpYUW9ZMjl1Ym1WamRHbHZia2xrTENBd0tUdGNiaUFnSUNBZ0lDQWdJQ0J1YjNScFptbGpZWFJwYjI1SmMwOXdaVzRnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNCamIyNXpkQ0JwYzBOc2FXVnVkRTl3Wlc0Z1BTQnBjME5zYVdWdWRFOXdaVzVUZEdGMGRYTW9LVHRjYmlBZ0lDQWdJQ0FnSUNCamIyNTBjbTlzYkdWeUxtbHpRMnhwWlc1MFQzQmxiaUE5SUdselEyeHBaVzUwVDNCbGJqdGNiaUFnSUNBZ0lDQWdJQ0J2YmtOc2IzTmxSVzUyYVhKdmJtMWxiblJKYm5OMFlXNWpaWE1vWEc0Z0lDQWdJQ0FnSUNBZ0lDQnBjME5zYVdWdWRFOXdaVzRzWEc0Z0lDQWdJQ0FnSUNBZ0lDQkZUbFpKVWs5T1RVVk9WRjlVV1ZCRlgwNVBWRWxHU1VOQlZFbFBUaXhjYmlBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnYVdZZ0tIQnliMk5sYzNOT1lXMWxJRDA5UFNCRlRsWkpVazlPVFVWT1ZGOVVXVkJGWDBaVlRFeFRRMUpGUlU0cElIdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2RHRmlTV1FnUFNCeVpXMXZkR1ZRYjNKMExuTmxibVJsY2k1MFlXSXVhV1E3WEc0Z0lDQWdJQ0FnSUc5d1pXNU5aWFJoYldGemExUmhZbk5KUkhOYmRHRmlTV1JkSUQwZ2RISjFaVHRjYmx4dUlDQWdJQ0FnSUNCbGJtUlBabE4wY21WaGJTaHdiM0owVTNSeVpXRnRMQ0FvS1NBOVBpQjdYRzRnSUNBZ0lDQWdJQ0FnYjNCbGJrMWxkR0Z0WVhOclEyOXVibVZqZEdsdmJuTXVjMlYwS0dOdmJtNWxZM1JwYjI1SlpDd2dNQ2s3WEc0Z0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUc5d1pXNU5aWFJoYldGemExUmhZbk5KUkhOYmRHRmlTV1JkTzF4dUlDQWdJQ0FnSUNBZ0lHTnZibk4wSUdselEyeHBaVzUwVDNCbGJpQTlJR2x6UTJ4cFpXNTBUM0JsYmxOMFlYUjFjeWdwTzF4dUlDQWdJQ0FnSUNBZ0lHTnZiblJ5YjJ4c1pYSXVhWE5EYkdsbGJuUlBjR1Z1SUQwZ2FYTkRiR2xsYm5SUGNHVnVPMXh1SUNBZ0lDQWdJQ0FnSUc5dVEyeHZjMlZGYm5acGNtOXViV1Z1ZEVsdWMzUmhibU5sY3loY2JpQWdJQ0FnSUNBZ0lDQWdJR2x6UTJ4cFpXNTBUM0JsYml4Y2JpQWdJQ0FnSUNBZ0lDQWdJRVZPVmtsU1QwNU5SVTVVWDFSWlVFVmZSbFZNVEZORFVrVkZUaXhjYmlBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLRnh1SUNBZ0lDQWdjMlZ1WkdWeVZYSnNJQ1ltWEc0Z0lDQWdJQ0J6Wlc1a1pYSlZjbXd1YjNKcFoybHVJRDA5UFNCd2FHbHphR2x1WjFCaFoyVlZjbXd1YjNKcFoybHVJQ1ltWEc0Z0lDQWdJQ0J6Wlc1a1pYSlZjbXd1Y0dGMGFHNWhiV1VnUFQwOUlIQm9hWE5vYVc1blVHRm5aVlZ5YkM1d1lYUm9ibUZ0WlZ4dUlDQWdJQ2tnZTF4dUlDQWdJQ0FnWTI5dWMzUWdjRzl5ZEZOMGNtVmhiU0E5WEc0Z0lDQWdJQ0FnSUc5MlpYSnlhV1JsY3o4dVoyVjBVRzl5ZEZOMGNtVmhiVDh1S0hKbGJXOTBaVkJ2Y25RcElIeDhJRzVsZHlCUWIzSjBVM1J5WldGdEtISmxiVzkwWlZCdmNuUXBPMXh1SUNBZ0lDQWdZMjl1ZEhKdmJHeGxjaTV6WlhSMWNGQm9hWE5vYVc1blEyOXRiWFZ1YVdOaGRHbHZiaWg3WEc0Z0lDQWdJQ0FnSUdOdmJtNWxZM1JwYjI1VGRISmxZVzA2SUhCdmNuUlRkSEpsWVcwc1hHNGdJQ0FnSUNCOUtUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYVdZZ0tISmxiVzkwWlZCdmNuUXVjMlZ1WkdWeUlDWW1JSEpsYlc5MFpWQnZjblF1YzJWdVpHVnlMblJoWWlBbUppQnlaVzF2ZEdWUWIzSjBMbk5sYm1SbGNpNTFjbXdwSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjM1FnZEdGaVNXUWdQU0J5WlcxdmRHVlFiM0owTG5ObGJtUmxjaTUwWVdJdWFXUTdYRzRnSUNBZ0lDQWdJR052Ym5OMElIVnliQ0E5SUc1bGR5QlZVa3dvY21WdGIzUmxVRzl5ZEM1elpXNWtaWEl1ZFhKc0tUdGNiaUFnSUNBZ0lDQWdZMjl1YzNRZ2V5QnZjbWxuYVc0Z2ZTQTlJSFZ5YkR0Y2JseHVJQ0FnSUNBZ0lDQnlaVzF2ZEdWUWIzSjBMbTl1VFdWemMyRm5aUzVoWkdSTWFYTjBaVzVsY2lnb2JYTm5LU0E5UGlCN1hHNGdJQ0FnSUNBZ0lDQWdhV1lnS0cxelp5NWtZWFJoSUNZbUlHMXpaeTVrWVhSaExtMWxkR2h2WkNBOVBUMGdKMlYwYUY5eVpYRjFaWE4wUVdOamIzVnVkSE1uS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhGMVpYTjBRV05qYjNWdWRGUmhZa2xrYzF0dmNtbG5hVzVkSUQwZ2RHRmlTV1E3WEc0Z0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR052Ym01bFkzUkZlSFJsY201aGJDaHlaVzF2ZEdWUWIzSjBLVHRjYmlBZ0lDQjlYRzRnSUgwN1hHNWNiaUFnTHk4Z1kyOXRiWFZ1YVdOaGRHbHZiaUIzYVhSb0lIQmhaMlVnYjNJZ2IzUm9aWElnWlhoMFpXNXphVzl1WEc0Z0lHTnZibTVsWTNSRmVIUmxjbTVoYkNBOUlDaHlaVzF2ZEdWUWIzSjBLU0E5UGlCN1hHNWNiaUFnSUNCamIyNXpkQ0J3YjNKMFUzUnlaV0Z0SUQxY2JpQWdJQ0FnSUc5MlpYSnlhV1JsY3o4dVoyVjBVRzl5ZEZOMGNtVmhiVDh1S0hKbGJXOTBaVkJ2Y25RcElIeDhJRzVsZHlCUWIzSjBVM1J5WldGdEtISmxiVzkwWlZCdmNuUXBPMXh1SUNBZ0lHTnZiblJ5YjJ4c1pYSXVjMlYwZFhCVmJuUnlkWE4wWldSRGIyMXRkVzVwWTJGMGFXOXVLSHRjYmlBZ0lDQWdJR052Ym01bFkzUnBiMjVUZEhKbFlXMDZJSEJ2Y25SVGRISmxZVzBzWEc0Z0lDQWdJQ0J6Wlc1a1pYSTZJSEpsYlc5MFpWQnZjblF1YzJWdVpHVnlMRnh1SUNBZ0lIMHBPMXh1SUNCOU8xeHVYRzRnSUdsbUlDaHZkbVZ5Y21sa1pYTS9MbkpsWjJsemRHVnlRMjl1Ym1WamRFeHBjM1JsYm1WeWN5a2dlMXh1SUNBZ0lHOTJaWEp5YVdSbGN5NXlaV2RwYzNSbGNrTnZibTVsWTNSTWFYTjBaVzVsY25Nb1kyOXVibVZqZEZKbGJXOTBaU3dnWTI5dWJtVmpkRVY0ZEdWeWJtRnNLVHRjYmlBZ2ZWeHVYRzRnSUM4dlhHNGdJQzh2SUZWelpYSWdTVzUwWlhKbVlXTmxJSE5sZEhWd1hHNGdJQzh2WEc1Y2JpQWdZMjl1ZEhKdmJHeGxjaTUwZUVOdmJuUnliMnhzWlhJdWFXNXBkRUZ3Y0hKdmRtRnNjeWdwTG5Sb1pXNG9LQ2tnUFQ0Z2UxeHVJQ0FnSUhWd1pHRjBaVUpoWkdkbEtDazdYRzRnSUgwcE8xeHVJQ0JqYjI1MGNtOXNiR1Z5TG5SNFEyOXVkSEp2Ykd4bGNpNXZiaWhjYmlBZ0lDQk5SVlJCVFVGVFMxOURUMDVVVWs5TVRFVlNYMFZXUlU1VVV5NVZVRVJCVkVWZlFrRkVSMFVzWEc0Z0lDQWdkWEJrWVhSbFFtRmtaMlVzWEc0Z0lDazdYRzRnSUdOdmJuUnliMnhzWlhJdVpHVmpjbmx3ZEUxbGMzTmhaMlZEYjI1MGNtOXNiR1Z5TG1oMVlpNXZiaWhjYmlBZ0lDQk5SVlJCVFVGVFMxOURUMDVVVWs5TVRFVlNYMFZXUlU1VVV5NVZVRVJCVkVWZlFrRkVSMFVzWEc0Z0lDQWdkWEJrWVhSbFFtRmtaMlVzWEc0Z0lDazdYRzRnSUdOdmJuUnliMnhzWlhJdVpXNWpjbmx3ZEdsdmJsQjFZbXhwWTB0bGVVTnZiblJ5YjJ4c1pYSXVhSFZpTG05dUtGeHVJQ0FnSUUxRlZFRk5RVk5MWDBOUFRsUlNUMHhNUlZKZlJWWkZUbFJUTGxWUVJFRlVSVjlDUVVSSFJTeGNiaUFnSUNCMWNHUmhkR1ZDWVdSblpTeGNiaUFnS1R0Y2JpQWdZMjl1ZEhKdmJHeGxjaTV6YVdkdVlYUjFjbVZEYjI1MGNtOXNiR1Z5TG1oMVlpNXZiaWhjYmlBZ0lDQk5SVlJCVFVGVFMxOURUMDVVVWs5TVRFVlNYMFZXUlU1VVV5NVZVRVJCVkVWZlFrRkVSMFVzWEc0Z0lDQWdkWEJrWVhSbFFtRmtaMlVzWEc0Z0lDazdYRzRnSUdOdmJuUnliMnhzWlhJdVlYQndVM1JoZEdWRGIyNTBjbTlzYkdWeUxtOXVLRnh1SUNBZ0lFMUZWRUZOUVZOTFgwTlBUbFJTVDB4TVJWSmZSVlpGVGxSVExsVlFSRUZVUlY5Q1FVUkhSU3hjYmlBZ0lDQjFjR1JoZEdWQ1lXUm5aU3hjYmlBZ0tUdGNibHh1SUNCamIyNTBjbTlzYkdWeUxtTnZiblJ5YjJ4c1pYSk5aWE56Wlc1blpYSXVjM1ZpYzJOeWFXSmxLRnh1SUNBZ0lFMUZWRUZOUVZOTFgwTlBUbFJTVDB4TVJWSmZSVlpGVGxSVExrRlFVRkpQVmtGTVgxTlVRVlJGWDBOSVFVNUhSU3hjYmlBZ0lDQjFjR1JoZEdWQ1lXUm5aU3hjYmlBZ0tUdGNibHh1SUNBdktpcGNiaUFnSUNvZ1ZYQmtZWFJsY3lCMGFHVWdWMlZpSUVWNGRHVnVjMmx2YmlkeklGd2lZbUZrWjJWY0lpQnVkVzFpWlhJc0lHOXVJSFJvWlNCc2FYUjBiR1VnWm05NElHbHVJSFJvWlNCMGIyOXNZbUZ5TGx4dUlDQWdLaUJVYUdVZ2JuVnRZbVZ5SUhKbFpteGxZM1J6SUhSb1pTQmpkWEp5Wlc1MElHNTFiV0psY2lCdlppQndaVzVrYVc1bklIUnlZVzV6WVdOMGFXOXVjeUJ2Y2lCdFpYTnpZV2RsSUhOcFoyNWhkSFZ5WlhNZ2JtVmxaR2x1WnlCMWMyVnlJR0Z3Y0hKdmRtRnNMbHh1SUNBZ0tpOWNiaUFnWm5WdVkzUnBiMjRnZFhCa1lYUmxRbUZrWjJVb0tTQjdYRzRnSUNBZ2JHVjBJR3hoWW1Wc0lEMGdKeWM3WEc0Z0lDQWdZMjl1YzNRZ1kyOTFiblFnUFNCblpYUlZibUZ3Y0hKdmRtVmtWSEpoYm5OaFkzUnBiMjVEYjNWdWRDZ3BPMXh1SUNBZ0lHbG1JQ2hqYjNWdWRDa2dlMXh1SUNBZ0lDQWdiR0ZpWld3Z1BTQlRkSEpwYm1jb1kyOTFiblFwTzF4dUlDQWdJSDFjYmlBZ0lDQXZMeUJpY205M2MyVnlRV04wYVc5dUlHaGhjeUJpWldWdUlISmxjR3hoWTJWa0lHSjVJR0ZqZEdsdmJpQnBiaUJOVmpOY2JpQWdJQ0JwWmlBb2FYTk5ZVzVwWm1WemRGWXpLU0I3WEc0Z0lDQWdJQ0JpY205M2MyVnlMbUZqZEdsdmJpNXpaWFJDWVdSblpWUmxlSFFvZXlCMFpYaDBPaUJzWVdKbGJDQjlLVHRjYmlBZ0lDQWdJR0p5YjNkelpYSXVZV04wYVc5dUxuTmxkRUpoWkdkbFFtRmphMmR5YjNWdVpFTnZiRzl5S0hzZ1kyOXNiM0k2SUNjak1ETTNSRVEySnlCOUtUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnWW5KdmQzTmxjaTVpY205M2MyVnlRV04wYVc5dUxuTmxkRUpoWkdkbFZHVjRkQ2g3SUhSbGVIUTZJR3hoWW1Wc0lIMHBPMXh1SUNBZ0lDQWdZbkp2ZDNObGNpNWljbTkzYzJWeVFXTjBhVzl1TG5ObGRFSmhaR2RsUW1GamEyZHliM1Z1WkVOdmJHOXlLSHNnWTI5c2IzSTZJQ2NqTURNM1JFUTJKeUI5S1R0Y2JpQWdJQ0I5WEc0Z0lIMWNibHh1SUNCbWRXNWpkR2x2YmlCblpYUlZibUZ3Y0hKdmRtVmtWSEpoYm5OaFkzUnBiMjVEYjNWdWRDZ3BJSHRjYmlBZ0lDQmpiMjV6ZENCd1pXNWthVzVuUVhCd2NtOTJZV3hEYjNWdWRDQTlYRzRnSUNBZ0lDQmpiMjUwY205c2JHVnlMbUZ3Y0hKdmRtRnNRMjl1ZEhKdmJHeGxjaTVuWlhSVWIzUmhiRUZ3Y0hKdmRtRnNRMjkxYm5Rb0tUdGNiaUFnSUNCamIyNXpkQ0IzWVdsMGFXNW5SbTl5Vlc1c2IyTnJRMjkxYm5RZ1BWeHVJQ0FnSUNBZ1kyOXVkSEp2Ykd4bGNpNWhjSEJUZEdGMFpVTnZiblJ5YjJ4c1pYSXVkMkZwZEdsdVowWnZjbFZ1Ykc5amF5NXNaVzVuZEdnN1hHNGdJQ0FnY21WMGRYSnVJSEJsYm1ScGJtZEJjSEJ5YjNaaGJFTnZkVzUwSUNzZ2QyRnBkR2x1WjBadmNsVnViRzlqYTBOdmRXNTBPMXh1SUNCOVhHNWNiaUFnYm05MGFXWnBZMkYwYVc5dVRXRnVZV2RsY2k1dmJpaGNiaUFnSUNCT1QxUkpSa2xEUVZSSlQwNWZUVUZPUVVkRlVsOUZWa1ZPVkZNdVVFOVFWVkJmUTB4UFUwVkVMRnh1SUNBZ0lDaDdJR0YxZEc5dFlYUnBZMkZzYkhsRGJHOXpaV1FnZlNrZ1BUNGdlMXh1SUNBZ0lDQWdhV1lnS0NGaGRYUnZiV0YwYVdOaGJHeDVRMnh2YzJWa0tTQjdYRzRnSUNBZ0lDQWdJSEpsYW1WamRGVnVZWEJ3Y205MlpXUk9iM1JwWm1sallYUnBiMjV6S0NrN1hHNGdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tHZGxkRlZ1WVhCd2NtOTJaV1JVY21GdWMyRmpkR2x2YmtOdmRXNTBLQ2tnUGlBd0tTQjdYRzRnSUNBZ0lDQWdJSFJ5YVdkblpYSlZhU2dwTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBzWEc0Z0lDazdYRzVjYmlBZ1puVnVZM1JwYjI0Z2NtVnFaV04wVlc1aGNIQnliM1psWkU1dmRHbG1hV05oZEdsdmJuTW9LU0I3WEc0Z0lDQWdUMkpxWldOMExtdGxlWE1vWEc0Z0lDQWdJQ0JqYjI1MGNtOXNiR1Z5TG5SNFEyOXVkSEp2Ykd4bGNpNTBlRk4wWVhSbFRXRnVZV2RsY2k1blpYUlZibUZ3Y0hKdmRtVmtWSGhNYVhOMEtDa3NYRzRnSUNBZ0tTNW1iM0pGWVdOb0tDaDBlRWxrS1NBOVBseHVJQ0FnSUNBZ1kyOXVkSEp2Ykd4bGNpNTBlRU52Ym5SeWIyeHNaWEl1ZEhoVGRHRjBaVTFoYm1GblpYSXVjMlYwVkhoVGRHRjBkWE5TWldwbFkzUmxaQ2gwZUVsa0tTeGNiaUFnSUNBcE8xeHVJQ0FnSUdOdmJuUnliMnhzWlhJdWMybG5ibUYwZFhKbFEyOXVkSEp2Ykd4bGNpNXlaV3BsWTNSVmJtRndjSEp2ZG1Wa0tGeHVJQ0FnSUNBZ1VrVktSVU5VWDA1UFZFbEdTVU5CVkVsUFRsOURURTlUUlY5VFNVY3NYRzRnSUNBZ0tUdGNiaUFnSUNCamIyNTBjbTlzYkdWeUxtUmxZM0o1Y0hSTlpYTnpZV2RsUTI5dWRISnZiR3hsY2k1eVpXcGxZM1JWYm1Gd2NISnZkbVZrS0Z4dUlDQWdJQ0FnVWtWS1JVTlVYMDVQVkVsR1NVTkJWRWxQVGw5RFRFOVRSU3hjYmlBZ0lDQXBPMXh1SUNBZ0lHTnZiblJ5YjJ4c1pYSXVaVzVqY25sd2RHbHZibEIxWW14cFkwdGxlVU52Ym5SeWIyeHNaWEl1Y21WcVpXTjBWVzVoY0hCeWIzWmxaQ2hjYmlBZ0lDQWdJRkpGU2tWRFZGOU9UMVJKUmtsRFFWUkpUMDVmUTB4UFUwVXNYRzRnSUNBZ0tUdGNibHh1SUNBZ0lDOHZJRVpwYm1Gc2JIa3NJSEpsYzI5c2RtVWdjMjVoY0NCa2FXRnNiMmNnWVhCd2NtOTJZV3h6SUc5dUlFWnNZWE5ySUdGdVpDQnlaV3BsWTNRZ1lXeHNJSFJvWlNCdmRHaGxjbk1nYldGdVlXZGxaQ0JpZVNCMGFHVWdRWEJ3Y205MllXeERiMjUwY205c2JHVnlMbHh1SUNBZ0lFOWlhbVZqZEM1MllXeDFaWE1vWTI5dWRISnZiR3hsY2k1aGNIQnliM1poYkVOdmJuUnliMnhzWlhJdWMzUmhkR1V1Y0dWdVpHbHVaMEZ3Y0hKdmRtRnNjeWt1Wm05eVJXRmphQ2hjYmlBZ0lDQWdJQ2g3SUdsa0xDQjBlWEJsSUgwcElEMCtJSHRjYmlBZ0lDQWdJQ0FnYzNkcGRHTm9JQ2gwZVhCbEtTQjdYRzRnSUNBZ0lDQWdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZiblJ5YjJ4c1pYSXVZWEJ3Y205MllXeERiMjUwY205c2JHVnlMbkpsYW1WamRDaGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2FXUXNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lHVjBhRVZ5Y205eWN5NXdjbTkyYVdSbGNpNTFjMlZ5VW1WcVpXTjBaV1JTWlhGMVpYTjBLQ2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgwc1hHNGdJQ0FnS1R0Y2JseHVJQ0FnSUhWd1pHRjBaVUpoWkdkbEtDazdYRzRnSUgxY2JseHVmVnh1WEc0dkwxeHVMeThnUlhSakxpNHVYRzR2TDF4dVhHNHZLaXBjYmlBcUlFOXdaVzV6SUhSb1pTQmljbTkzYzJWeUlIQnZjSFZ3SUdadmNpQjFjMlZ5SUdOdmJtWnBjbTFoZEdsdmJseHVJQ292WEc1aGMzbHVZeUJtZFc1amRHbHZiaUIwY21sbloyVnlWV2tvS1NCN1hHNGdJR052Ym5OMElIUmhZbk1nUFNCaGQyRnBkQ0J3YkdGMFptOXliUzVuWlhSQlkzUnBkbVZVWVdKektDazdYRzRnSUdOdmJuTjBJR04xY25KbGJuUnNlVUZqZEdsMlpVMWxkR0Z0WVhOclZHRmlJRDBnUW05dmJHVmhiaWhjYmlBZ0lDQjBZV0p6TG1acGJtUW9LSFJoWWlrZ1BUNGdiM0JsYmsxbGRHRnRZWE5yVkdGaWMwbEVjMXQwWVdJdWFXUmRLU3hjYmlBZ0tUdGNiaUFnTHk4Z1ZtbDJZV3hrYVNCcGN5QnViM1FnWTJ4dmMybHVaeUJ3YjNKMElHTnZibTVsWTNScGIyNGdiMjRnY0c5d2RYQWdZMnh2YzJVc0lITnZJSEJ2Y0hWd1NYTlBjR1Z1SUdSdlpYTWdibTkwSUhkdmNtc2dZMjl5Y21WamRHeDVYRzRnSUM4dklGUnZJR0psSUhKbGRtbGxkMlZrSUdsdUlIUm9aU0JtZFhSMWNtVWdhV1lnZEdocGN5QmlaV2hoZG1sdmRYSWdhWE1nWm1sNFpXUWdMU0JoYkhOdklIUm9aU0IzWVhrZ2QyVWdaR1YwWlhKdGFXNWxJR2x6Vm1sMllXeGthU0IyWVhKcFlXSnNaU0J0YVdkb2RDQmphR0Z1WjJVZ1lYUWdjMjl0WlNCd2IybHVkRnh1SUNCamIyNXpkQ0JwYzFacGRtRnNaR2tnUFZ4dUlDQWdJSFJoWW5NdWJHVnVaM1JvSUQ0Z01DQW1KbHh1SUNBZ0lIUmhZbk5iTUYwdVpYaDBSR0YwWVNBbUpseHVJQ0FnSUhSaFluTmJNRjB1WlhoMFJHRjBZUzVwYm1SbGVFOW1LQ2QyYVhaaGJHUnBYM1JoWWljcElENGdMVEU3WEc0Z0lHbG1JQ2hjYmlBZ0lDQWhkV2xKYzFSeWFXZG5aWEpwYm1jZ0ppWmNiaUFnSUNBb2FYTldhWFpoYkdScElIeDhJQ0Z3YjNCMWNFbHpUM0JsYmlrZ0ppWmNiaUFnSUNBaFkzVnljbVZ1ZEd4NVFXTjBhWFpsVFdWMFlXMWhjMnRVWVdKY2JpQWdLU0I3WEc0Z0lDQWdkV2xKYzFSeWFXZG5aWEpwYm1jZ1BTQjBjblZsTzF4dUlDQWdJSFJ5ZVNCN1hHNGdJQ0FnSUNCamIyNXpkQ0JqZFhKeVpXNTBVRzl3ZFhCSlpDQTlJR052Ym5SeWIyeHNaWEl1WVhCd1UzUmhkR1ZEYjI1MGNtOXNiR1Z5TG1kbGRFTjFjbkpsYm5SUWIzQjFjRWxrS0NrN1hHNGdJQ0FnSUNCaGQyRnBkQ0J1YjNScFptbGpZWFJwYjI1TllXNWhaMlZ5TG5Ob2IzZFFiM0IxY0NoY2JpQWdJQ0FnSUNBZ0tHNWxkMUJ2Y0hWd1NXUXBJRDArWEc0Z0lDQWdJQ0FnSUNBZ1kyOXVkSEp2Ykd4bGNpNWhjSEJUZEdGMFpVTnZiblJ5YjJ4c1pYSXVjMlYwUTNWeWNtVnVkRkJ2Y0hWd1NXUW9ibVYzVUc5d2RYQkpaQ2tzWEc0Z0lDQWdJQ0FnSUdOMWNuSmxiblJRYjNCMWNFbGtMRnh1SUNBZ0lDQWdLVHRjYmlBZ0lDQjlJR1pwYm1Gc2JIa2dlMXh1SUNBZ0lDQWdkV2xKYzFSeWFXZG5aWEpwYm1jZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0I5WEc0Z0lIMWNibjFjYmx4dUx5OGdTWFFnWVdSa2N5QjBhR1VnWENKQmNIQWdTVzV6ZEdGc2JHVmtYQ0lnWlhabGJuUWdhVzUwYnlCaElIRjFaWFZsSUc5bUlHVjJaVzUwY3l3Z2QyaHBZMmdnZDJsc2JDQmlaU0IwY21GamEyVmtJRzl1YkhrZ1lXWjBaWElnWVNCMWMyVnlJRzl3ZEhNZ2FXNTBieUJ0WlhSeWFXTnpMbHh1WTI5dWMzUWdZV1JrUVhCd1NXNXpkR0ZzYkdWa1JYWmxiblFnUFNBb0tTQTlQaUI3WEc0Z0lHbG1JQ2hqYjI1MGNtOXNiR1Z5S1NCN1hHNGdJQ0FnWTI5dWRISnZiR3hsY2k1dFpYUmhUV1YwY21samMwTnZiblJ5YjJ4c1pYSXVkWEJrWVhSbFZISmhhWFJ6S0h0Y2JpQWdJQ0FnSUZ0TlpYUmhUV1YwY21samMxVnpaWEpVY21GcGRDNUpibk4wWVd4c1JHRjBaVVY0ZEYwNklHNWxkeUJFWVhSbEtDbGNiaUFnSUNBZ0lDQWdMblJ2U1ZOUFUzUnlhVzVuS0NsY2JpQWdJQ0FnSUNBZ0xuTndiR2wwS0NkVUp5bGJNRjBzSUM4dklIbDVlWGt0YlcwdFpHUmNiaUFnSUNCOUtUdGNiaUFnSUNCamIyNTBjbTlzYkdWeUxtMWxkR0ZOWlhSeWFXTnpRMjl1ZEhKdmJHeGxjaTVoWkdSRmRtVnVkRUpsWm05eVpVMWxkSEpwWTNOUGNIUkpiaWg3WEc0Z0lDQWdJQ0JqWVhSbFoyOXllVG9nVFdWMFlVMWxkSEpwWTNORmRtVnVkRU5oZEdWbmIzSjVMa0Z3Y0N4Y2JpQWdJQ0FnSUdWMlpXNTBPaUJOWlhSaFRXVjBjbWxqYzBWMlpXNTBUbUZ0WlM1QmNIQkpibk4wWVd4c1pXUXNYRzRnSUNBZ0lDQndjbTl3WlhKMGFXVnpPaUI3ZlN4Y2JpQWdJQ0I5S1R0Y2JpQWdJQ0J5WlhSMWNtNDdYRzRnSUgxY2JpQWdjMlYwVkdsdFpXOTFkQ2dvS1NBOVBpQjdYRzRnSUNBZ0x5OGdTV1lnZEdobElHTnZiblJ5YjJ4c1pYSWdhWE1nYm05MElITmxkQ0I1WlhRc0lIZGxJSGRoYVhRZ1lXNWtJSFJ5ZVNCMGJ5QmhaR1FnZEdobElGd2lRWEJ3SUVsdWMzUmhiR3hsWkZ3aUlHVjJaVzUwSUdGbllXbHVMbHh1SUNBZ0lHRmtaRUZ3Y0VsdWMzUmhiR3hsWkVWMlpXNTBLQ2s3WEc0Z0lIMHNJREV3TURBcE8xeHVmVHRjYmx4dUx5OGdUMjRnWm1seWMzUWdhVzV6ZEdGc2JDd2diM0JsYmlCaElHNWxkeUIwWVdJZ2QybDBhQ0JOWlhSaFRXRnphMXh1WW5KdmQzTmxjaTV5ZFc1MGFXMWxMbTl1U1c1emRHRnNiR1ZrTG1Ga1pFeHBjM1JsYm1WeUtDaDdJSEpsWVhOdmJpQjlLU0E5UGlCN1hHNGdJR2xtSUNoY2JpQWdJQ0J5WldGemIyNGdQVDA5SUNkcGJuTjBZV3hzSnlBbUpseHVJQ0FnSUNFb2NISnZZMlZ6Y3k1bGJuWXVUVVZVUVUxQlUwdGZSRVZDVlVjZ2ZId2djSEp2WTJWemN5NWxibll1U1U1ZlZFVlRWQ2xjYmlBZ0tTQjdYRzRnSUNBZ1lXUmtRWEJ3U1c1emRHRnNiR1ZrUlhabGJuUW9LVHRjYmlBZ0lDQndiR0YwWm05eWJTNXZjR1Z1UlhoMFpXNXphVzl1U1c1Q2NtOTNjMlZ5S0NrN1hHNGdJSDFjYm4wcE8xeHVYRzVtZFc1amRHbHZiaUJ6WlhSMWNGTmxiblJ5ZVVkbGRGTjBZWFJsUjJ4dlltRnNLSE4wYjNKbEtTQjdYRzRnSUdkc2IySmhiQzV6ZEdGMFpVaHZiMnR6TG1kbGRGTmxiblJ5ZVZOMFlYUmxJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUdOdmJuTjBJR1oxYkd4VGRHRjBaU0E5SUhOMGIzSmxMbWRsZEZOMFlYUmxLQ2s3WEc0Z0lDQWdZMjl1YzNRZ1pHVmlkV2RUZEdGMFpTQTlJRzFoYzJ0UFltcGxZM1FvZXlCdFpYUmhiV0Z6YXpvZ1puVnNiRk4wWVhSbElIMHNJRk5GVGxSU1dWOVRWRUZVUlNrN1hHNGdJQ0FnY21WMGRYSnVJSHRjYmlBZ0lDQWdJR0p5YjNkelpYSTZJSGRwYm1SdmR5NXVZWFpwWjJGMGIzSXVkWE5sY2tGblpXNTBMRnh1SUNBZ0lDQWdjM1J2Y21VNklHUmxZblZuVTNSaGRHVXNYRzRnSUNBZ0lDQjJaWEp6YVc5dU9pQndiR0YwWm05eWJTNW5aWFJXWlhKemFXOXVLQ2tzWEc0Z0lDQWdmVHRjYmlBZ2ZUdGNibjFjYmx4dVpuVnVZM1JwYjI0Z2FXNXBkRUpoWTJ0bmNtOTFibVFvS1NCN1hHNGdJR2x1YVhScFlXeHBlbVVvS1M1allYUmphQ2hzYjJjdVpYSnliM0lwTzF4dWZWeHVYRzVwWmlBb0lYQnliMk5sYzNNdVpXNTJMbE5MU1ZCZlFrRkRTMGRTVDFWT1JGOUpUa2xVU1VGTVNWcEJWRWxQVGlrZ2UxeHVJQ0JwYm1sMFFtRmphMmR5YjNWdVpDZ3BPMXh1ZlZ4dUlsMTkifQ==
