'use strict'
const WSKey = require('oclc-wskey')
const CopyResource = require('oclc-copy-resource')

module.exports = function generateCopyResourceClient (settings) {
  if (!settings) settings = require(__dirname + '/../local/settings.json').oclc

  let wskey = new WSKey(settings.wskey.public, settings.wskey.secret, settings.user)
  return new CopyResource(settings.institution_id, wskey)
}
