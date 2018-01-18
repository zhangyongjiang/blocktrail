var assert = require('assert')
var fixtures = require('./fixtures')
var types = require('common-blockchain').types
var typeforce = require('typeforce')
var utils = require('./utils')

module.exports = function(options) {
  describe('Addresses', function() {
    var blockchain

    beforeEach(function() {
      blockchain = options.blockchain
    })

    describe('Summary', function() {
      fixtures.addresses.forEach(function(f) {
        it('returns summary for ' + f, function(done) {
          blockchain.addresses.summary(f, function(err, result) {
            assert.ifError(err)

            typeforce(types.addresses.summary, result)

            assert.strictEqual(result.address, f)
            assert(result.balance > 0, 'Invalid balance')
            assert(result.totalReceived > 0, 'Invalid totalReceived')
            assert(result.txCount > 0, 'Invalid txCount')

            return done()
          })
        })
      })

      fixtures.invalid.addresses.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.addresses.summary(f, function(err) {
            assert.throws(function() {
              if (err) throw err
            }, new RegExp(f + ' is not a valid testnet address'))

            return done()
          })
        })
      })

      it('works for n of 0', function(done) {
        blockchain.addresses.summary([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('works for an unused address', function (done) {
        var address = utils.createNewAddress()

        blockchain.addresses.summary(address, function(err, result) {
          assert.ifError(err)

          typeforce(types.addresses.summary, result)
          assert.strictEqual(result.address, address)
          assert.strictEqual(result.balance, 0)
          assert.strictEqual(result.totalReceived, 0)
          assert.strictEqual(result.txCount, 0)

          return done()
        })
      })

      it('works for scriptHash addresses', function(done) {
        blockchain.addresses.summary(fixtures.scriptAddresses, function(err, results) {
          assert.ifError(err)

          typeforce([types.addresses.summary], results)
          assert.strictEqual(results.length, fixtures.scriptAddresses.length)

          return done()
        })
      })

      it('works for n of ' + fixtures.tooManyAddresses.length + ' addresses', function(done) {
        var addresses = fixtures.tooManyAddresses

        blockchain.addresses.summary(addresses, function(err, results) {
          assert.ifError(err)

          typeforce([types.addresses.summary], results)
          assert.strictEqual(results.length, addresses.length)

          return done()
        })
      })
    })

    describe('Transactions', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.transactions(fixtures.addresses, 0, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.transactions, results)
          results.forEach(function(result) {
            assert(result.txId.match(/^[0-9a-f]+$/i))
            assert(result.txHex.match(/^[0-9a-f]+$/i))
            assert(result.blockId.match(/^[0-9a-f]+$/i))
            assert.strictEqual(result.txId.length, 64)
            assert.strictEqual(result.blockId.length, 64)
            assert(result.blockHeight > 0)
          })

          return done()
        })
      })

      it('returns results limited by blockHeight', function(done) {
        blockchain.addresses.transactions(fixtures.addresses, 0, function (err, fullResults) {
          assert.ifError(err)

          typeforce(types.addresses.transactions, fullResults)

          blockchain.addresses.transactions(fixtures.addresses, 274302, function (err, limitedResults) {
            assert.ifError(err)

            typeforce(types.addresses.transactions, limitedResults)
            assert(fullResults.length > limitedResults.length)

            return done()
          })
        })
      })

      fixtures.invalid.addresses.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.addresses.transactions(f, function(err) {
            assert.throws(function() {
              if (err) throw err
            }, new RegExp(f + ' is not a valid testnet address'))

            return done()
          })
        })
      })

      it('works for n of 0', function(done) {
        blockchain.addresses.transactions([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('works for an unused address', function (done) {
        blockchain.addresses.transactions(utils.createNewAddress(), function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('returns unique results', function(done) {
        blockchain.addresses.transactions(fixtures.addressesUniqueTransactions, 0, function(err, results) {
          assert.ifError(err)

          typeForce(types.addresses.transactions, results)
          var txIds = []
          results.forEach(function(f) {
            assert(txIds.indexOf(f.txId) === -1)
            txIds.push(f.txId)
          })

          return done()
        })
      })

      it('returns expected transactions', function(done) {
        blockchain.addresses.transactions(fixtures.addresses, 0, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.transactions, results)
          fixtures.addressTransactions.forEach(function(f) {
            assert(results.some(function(result) {
              return (result.txId === f.txId)
            }))
          })

          return done()
        })
      })

      it('returns expected transactions when filtered by minimum blockHeight', function(done) {
        var expectedTransactions = fixtures.addressTransactions.filter(function(f) {
          return f.blockHeight >= 274302
        })

        blockchain.addresses.transactions(fixtures.addresses, 274302, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.transactions, results)

          // enforce all results have the minimum blockHeight
          assert(results.every(function(result) {
            return result.blockHeight >= 274302
          }))

          // enforce
          expectedTransactions.forEach(function(f) {
            assert(results.some(function(result) {
              return (result.txId === f.txId)
            }))
          })

          return done()
        })
      })

      it('works for n of ' + fixtures.tooManyAddresses.length + ' addresses', function(done) {
        blockchain.addresses.transactions(fixtures.tooManyAddresses, 0, function(err, results) {
          assert.ifError(err)

          // TODO: verify...
          assert(results.length > 70)

          return done()
        })
      })

      it('includes 0-confirmation transactions', function(done) {
        this.timeout(15000); // 3 * (3s interval + 2s test)

        utils.requestUnconfirmedTransaction(function(err, txId, address) {
          assert.ifError(err)

          var attempts = 0

          function attempt(callback) {
            // check incase we already had a success/failure
            if (!interval) return

            // stop trying after 3 attempts
            attempts++
            if (attempts > 3) return callback(throw new Error('Transaction never seen'))

            blockchain.addresses.transactions(address, function(err, results) {
              if (err) return callback(err)

              typeforce(types.addresses.transactions, results)
              callback(null, results.some(function(result) { return result.txId === txId }))
            })
          }

          var interval
          function check(err, success) {
            if (err || success) {
              clearInterval(interval)
              done(err)
            }
          }

          interval = setInterval(attempt.bind(null, check), 3000)
          attempt(check)
        })
      })
    })

    describe('Unspents', function() {
      it('returns sane results', function(done) {
        var address = fixtures.addresses[0]

        blockchain.addresses.unspents(address, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.unspents, results)
          results.forEach(function(result) {
            assert(result.txId.match(/^[0-9a-f]+$/i))
            assert.strictEqual(result.txId.length, 64)

            assert.strictEqual(result.address, address)
            assert(isFinite(result.confirmations))
            assert(isFinite(result.value))
            assert(isFinite(result.vout))
          })

          return done()
        })
      })

      fixtures.invalid.addresses.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.addresses.unspents(f, function(err) {
            assert.throws(function() {
              if (err) throw err
            }, new RegExp(f + ' is not a valid testnet address'))

            return done()
          })
        })
      })

      it('works for n of 0', function(done) {
        blockchain.addresses.unspents([], function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('works for an unused address', function (done) {
        blockchain.addresses.unspents(utils.createNewAddress(), function(err, results) {
          assert.ifError(err)
          assert.strictEqual(results.length, 0)

          return done()
        })
      })

      it('returns expected transactions', function(done) {
        blockchain.addresses.unspents(fixtures.addresses, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.unspents, results)
          fixtures.addressTransactions.forEach(function(f) {
            assert(results.some(function(result) {
              return (result.txId === f.txId)
            }))
          })

          return done()
        })
      })

      it('works for n of ' + fixtures.tooManyAddresses.length + ' addresses', function(done) {
        var addresses = fixtures.tooManyAddresses

        blockchain.addresses.unspents(addresses, function(err, results) {
          assert.ifError(err)

          typeforce(types.addresses.unspents, results)

          return done()
        })
      })
    })
  })
}
