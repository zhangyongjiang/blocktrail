var bitcoinjs = require('bitcoinjs-lib')
var httpify = require('httpify')

function createNewAddress () {
  var privKey = bitcoinjs.ECKey.makeRandom()
  var testnet = bitcoinjs.networks.testnet

  return privKey.pub.getAddress(testnet).toString()
}

function requestUnconfirmedTransaction(callback) {
  var address = 'mkU71dQZ5QAj2GspHfXW8ajgmx2hzYshUM'
  httpify({
    method: 'POST',
    url: 'https://testnet.helloblock.io/v1/faucet/withdrawal',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toAddress: address,
      value: 1e4
    })
  }, function(err, res) {
    if (err) return callback(err)
    if (!res.body.data) return callback(new Error('Invalid JSend Response'))

    callback(null, res.body.data.txHash, address)
  })
}

function requestNewUnspent(callback) {
  httpify({
    method: 'GET',
    url: 'https://testnet.helloblock.io/v1/faucet?type=1'
  }, function(err, res) {
    if (err) return callback(err)

    var key = bitcoinjs.ECKey.fromWIF(res.body.data.privateKeyWIF)
    var tx = new bitcoinjs.TransactionBuilder()
    var unspent = res.body.data.unspents[0]

    tx.addInput(unspent.txHash, unspent.index)
    tx.addOutput('mkgqK39KnEkb1ockFBuGJy1pHQVN74oQDP', Math.min(6000, unspent.value))
    tx.sign(0, key)

    callback(undefined, tx.build())
  })
}

module.exports = {
  createNewAddress: createNewAddress,
  requestUnconfirmedTransaction: requestUnconfirmedTransaction,
  requestNewUnspent: requestNewUnspent
}
