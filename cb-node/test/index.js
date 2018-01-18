/* global describe beforeEach */

var Blockchain = require('../')
var url = 'https://common-blockchain-test.herokuapp.com/v1'

describe('cb-tests', function () {
  var options = {}

  beforeEach(function () {
    options.blockchain = new Blockchain(url)
    options.blockchain.xhrOptions = {
      timeout: 1000000
    }
  })

  require('cb-tester')(options)
})
