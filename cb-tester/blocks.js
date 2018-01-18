var assert = require('assert')
var fixtures = require('./fixtures')
var types = require('common-blockchain').types
var typeforce = require('typeforce')

module.exports = function(options) {
  describe('Blocks', function() {
    var blockchain

    beforeEach(function() {
      blockchain = options.blockchain
    })

    describe('Summary', function() {
      function verify(f, result) {
        assert.strictEqual(f.blockId, result.blockId)
        assert.strictEqual(f.blockHeight, result.blockHeight)
        assert.strictEqual(f.prevBlockId, result.prevBlockId)
        assert.strictEqual(f.merkleRootHash, result.merkleRootHash)
        assert.strictEqual(f.nonce, result.nonce)
        assert.strictEqual(f.version, result.version)
        assert.strictEqual(f.blockSize, result.blockSize)
        assert.strictEqual(f.timestamp, result.timestamp)
        assert.strictEqual(f.txCount, result.txCount)
      }

      fixtures.blocks.forEach(function(f) {
        it('returns headers for ' + f.blockId, function(done) {
          blockchain.blocks.summary(f.blockId, function(err, result) {
            assert.ifError(err)

            typeforce(types.blocks.summary, result)
            verify(f, result)

            done()
          })
        })
      })

      fixtures.invalid.blocks.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.blocks.summary(f, function(err) {
            assert.throws(function() {
              if (err) throw err
            }, new RegExp(f + ' is not a valid blockId'))

            done()
          })
        })
      })

      it('works for n of 0', function(done) {
        blockchain.blocks.summary([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('works for n of ' + fixtures.blocks.length, function(done) {
        var blockIds = fixtures.blocks.map(function(block) { return block.blockId })

        blockchain.blocks.summary(blockIds, function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, blockIds.length)

          // TODO: better verification
          typeforce([types.blocks.summary], results)

          return done()
        })
      })
    })

    describe('Get', function() {
      fixtures.blocks.forEach(function(f) {
        it('returns hex for ' + f.blockId, function(done) {
          blockchain.blocks.get(f.blockId, function(err, result) {
            assert.ifError(err)

            typeforce(types.blocks.get, result)
            assert.strictEqual(result.blockId, f.blockId)

            // FIXME: is there a standard for ordering the transactions?
            assert.strictEqual(result.blockHex.slice(0, 160), f.blockHex.slice(0, 160), result.blockHex + ' != ' + f.blockHex)

            done()
          })
        })
      })

      fixtures.invalid.blocks.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.blocks.summary(f, function(err) {
            assert.throws(function() {
              if (err) throw err
            }, new RegExp(f + ' is not a valid blockId'))

            done()
          })
        })
      })

      it('works for n of 0', function(done) {
        blockchain.blocks.get([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })
    })

    describe('Latest', function() {
      it('returns sane results', function(done) {
        blockchain.blocks.latest(function(err, result) {
          assert.ifError(err)

          typeforce(types.blocks.latest, result)

          // TODO: more intricate sanity checking
          assert(result.blockId.match(/^[0-9a-f]+$/i))
          assert(result.prevBlockId.match(/^[0-9a-f]+$/i))
          assert(result.merkleRootHash.match(/^[0-9a-f]+$/i))
          assert.strictEqual(result.blockId.length, 64)
          assert.strictEqual(result.prevBlockId.length, 64)
          assert.strictEqual(result.merkleRootHash.length, 64)
          assert(result.blockHeight > 0)
          assert(result.version > 1)

          done()
        })
      })
    })

    describe('Propagate', function() {
      it.skip('throws on malformed block', function(done) {
        done()
      })

      it.skip('works for n of 0', function(done) {
        blockchain.blocks.propagate([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })
    })
  })
}
