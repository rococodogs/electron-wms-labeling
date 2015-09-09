var config = require(__dirname + '/../config.json').oclc
var WSKey = require('oclc-wskey')
var wskey = new WSKey(config.wskey.public, config.wskey.secret, config.user)
var CopyResource = require('oclc-copy-resource')

module.exports = function generateCopyResourceClient () {
  return new CopyResource(config.institution_id, wskey)
}
