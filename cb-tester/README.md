# cb-tester

[![Version](http://img.shields.io/npm/v/cb-tester.svg)](https://www.npmjs.org/package/cb-tester)

A [common-blockchain](https://github.com/common-blockchain/common-blockchain) javascript mocha testing kit for easy drop-in testing for common blockchain modules.


## Examples

``` javascript
var Blockchain = require('my-cb-blockchain')

describe('cb-tester', function() {
  var options = {}

  beforeEach(function() {
    options.blockchain = new Blockchain(...)
  })

  require('cb-tester')(options)
})
```

## Further reading

See [common-blockchain](https://github.com/common-blockchain/common-blockchain) for more information as to what version of the specification this module is testing.
The major version of this package should always match that of the specification repository.


## Versions
| cb-tester | common-blockchain | 
| --------- | ----------------- |
| master    | 0.3.0             | 
| 0.2.22    | 0.2.1             | 
| 0.2.21    | 0.2.1             |
