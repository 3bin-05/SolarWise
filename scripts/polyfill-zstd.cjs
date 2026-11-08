// Polyfill for Node.js < 22.15 where node:zlib lacks createZstdDecompress
// Required because undici 8.12.3 (via jsdom) unconditionally binds zlib.createZstdDecompress
const zlib = require('node:zlib');

if (typeof zlib.createZstdDecompress !== 'function') {
  zlib.createZstdDecompress = function() {
    const { PassThrough } = require('node:stream');
    return new PassThrough();
  };
}

if (!zlib.constants) {
  zlib.constants = {};
}

if (zlib.constants.ZSTD_d_windowLogMax === undefined) {
  zlib.constants.ZSTD_d_windowLogMax = 23;
}

