'use strict'
const WSKey = require('oclc-wskey')
const CopyResource = require('oclc-copy-resource')
const join = require('path').join

module.exports = function generateCopyResourceClient (settings) {
  if (!settings) settings = require(join(__dirname, '..', 'local', 'settings.json'))

  let wskeyPublic = settings['wskey.public']
  let wskeySecret = settings['wskey.secret']
  let user = {
    principalID: settings['user.principalID'],
    principalIDNS: settings['user.principalIDNS']
  }

  let wskey = new WSKey(wskeyPublic, wskeySecret, user)
  return new CopyResource(settings['oclc.institution_id'], wskey)
}
