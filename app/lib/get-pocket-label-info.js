'use strict'

const http = require('http')
const xml = require('node-xml')
const baseUrl = 'http://www.worldcat.org/webservices/catalog/content/'

module.exports = function getPocketLabelInfo (oclcNumber, wskey, callback) {
  if (typeof wskey === 'function') {
    callback = wskey
    wskey = require(__dirname + '/../local/settings.json').oclc.wskey.public
  }

  const url = `${baseUrl}${oclcNumber}?wskey=${wskey}&recordSchema=marcxml`
  const parser = new xml.SaxParser(function (p) {
    let atTag = false
    let atTitle = false
    let atAuthor = false

    let out = {}

    p.onStartElementNS(function (el, attrs) {
      if (atTag && el === 'subfield') {
        if (attrs[0][0] === 'code') {
          switch (attrs[0][1]) {
            case 'a': atTitle = true; break
            case 'c': atAuthor = true; break
          }

          return
        }
      }

      if (el === 'datafield') {
        for (let a = 0; a < attrs.length; a++) {
          let attr = attrs[a]
          if (attr[0] === 'tag' && attr[1] === '245') {
            atTag = true
            return
          }
        }
      }
    })

    p.onEndElementNS(function (el) {
      if (atTag && el === 'subfield') {
        if (atTitle) atTitle = false
        if (atAuthor) atAuthor = false
        return
      }

      if (atTag && el === 'datafield') {
        atTag = false
        return
      }
    })

    p.onCharacters(function (val) {
      if (atTitle) out['title'] = val.replace(/\/\s*$/, '').trim()
      if (atAuthor)out['author'] = val.trim()
      return
    })

    p.onEndDocument(function () {
      return callback(out)
    })

  })

  http.get(url, function (res) {
    let body = ''

    res.setEncoding('UTF-8')
    res.on('data', function (d) {
      body += d
    })

    res.on('end', function () {
      parser.parseString(body)
    })
  })
}
