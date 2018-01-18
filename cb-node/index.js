var httpify = require('httpify')
var jsend = require('jsend')
var qs = require('querystring')

function Node (base, queryParams) {
  var queryString = queryParams ? ('?' + qs.stringify(queryParams)) : ''
  var self = this

  function req (url, body, callback, deconstruct) {
    var options = {
      method: 'POST',
      url: base + url + queryString,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }

    // extend the options object if necessary
    for (var option in self.xhrOptions) {
      options[option] = self.xhrOptions[option]
    }

    httpify(options, function (err, res) {
      if (err) return callback(err)
      if (res.statusCode !== 200) return callback(new Error('Error ' + res.statusCode))

      var body = res.body
      if (!jsend.isValid(body)) return callback(new Error('Invalid JSend response'))
      if (body.status === 'fail' || body.status === 'error') {
        return callback(new Error(body.message || body.data))
      }

      return callback(undefined, deconstruct ? body.data[0] : body.data)
    })
  }

  this.addresses = {
    summary: function (addresses, callback) {
      req('/addresses/summary', { addresses: [].concat(addresses) }, callback, !Array.isArray(addresses))
    },

    transactions: function (addresses, blockHeight, callback) {
      // optional blockHeight
      if (typeof blockHeight === 'function') {
        callback = blockHeight
        blockHeight = 0
      }

      req('/addresses/transactions', { addresses: [].concat(addresses), blockHeight: blockHeight }, callback)
    },

    unspents: function (addresses, callback) {
      req('/addresses/unspents', { addresses: [].concat(addresses) }, callback)
    }
  }

  this.blocks = {
    get: function (blockIds, callback) {
      req('/blocks/get', { blockIds: [].concat(blockIds) }, callback, !Array.isArray(blockIds))
    },

    latest: function (callback) {
      req('/blocks/latest', {}, callback)
    },

    propagate: function (blockHex, callback) {
      req('/blocks/propagate', { blockHex: blockHex }, callback)
    },

    summary: function (blockIds, callback) {
      req('/blocks/summary', { blockIds: [].concat(blockIds) }, callback, !Array.isArray(blockIds))
    }
  }

  this.transactions = {
    get: function (txIds, callback) {
      req('/transactions/get', { txIds: [].concat(txIds) }, callback, !Array.isArray(txIds))
    },

    latest: function (callback) {
      req('/transactions/latest', {}, callback)
    },

    propagate: function (txHex, callback) {
      req('/transactions/propagate', { txHexs: [].concat(txHex) }, callback)
    },

    summary: function (txIds, callback) {
      req('/transactions/summary', { txIds: [].concat(txIds) }, callback, !Array.isArray(txIds))
    }
  }

  this.xhrOptions = {}
}

module.exports = Node
