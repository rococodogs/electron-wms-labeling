const config = require('./get-config')().oclc
const WSKey = require('oclc-wskey')
const wskey = new WSKey(config.wskey.public, config.wskey.secret, config.user)
const CopyResource = require('oclc-copy-resource')

module.exports = function generateCopyResourceClient () {
  return new CopyResource(config.institution_id, wskey)
}
