// a helper script to make sure the keys in `settings.default.json`
// and `app/local/settings.json` stay in sync while developing

var locPath = __dirname + '/app/local/settings.json'
var loc = require(locPath)
var def = require(__dirname + '/settings.default.json')
var changed = false
var added = []
var removed = []

// scan default for additions
for (var k in def) {
  if (!loc.hasOwnProperty(k)) {
    loc[k] = def[k]
    changed = true
    added.push(k)
  }
}

// scan local for removals
for (var k in loc) {
  if (!def.hasOwnProperty(k)) {
    delete loc[k]
    changed = true
    removed.push(k)
  }
}

if (!changed) return console.log('No changes to `app/local/settings.json` needed to be made! ^_^')

require('fs').writeFile(locPath, JSON.stringify(loc), function (err) {
  if (err) throw err

  var addLength = added.length
  var remLength = removed.length

  console.log('`settings.default.json` + `app/local/settings.json` are sync\'d!')

  if (addLength) {
    console.log('added %d %s:   %s',addLength,(addLength>1?'properties':'property'),added.join(', '))
  }

  if (remLength) {
    console.log('removed %d %s: `%s`',remLength,(remLength>1?'properties':'property'),removed.join('`,`'))
  }
})