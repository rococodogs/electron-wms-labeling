// a helper script to make sure the keys in `settings.default.json`
// and `app/local/settings.json` stay in sync while developing

'use strict'

var locPath = __dirname + '/app/local/settings.json'
var loc = require(locPath)
var def = require(__dirname + '/settings.default.json')
var changed = false

for (var k in def) {
  if (!loc.hasOwnProperty(k)) {
    changed = true
    loc[k] = def[k]
  }
}

if (!changed) return console.log('No changes needed to be made! ^_^')

require('fs').writeFile(locPath, JSON.stringify(loc), function (err) {
  if (err) throw err

  console.log('settings.default.json + app/local/settings.json are sync\'d!')
})