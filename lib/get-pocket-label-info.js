'use strict'

const http = require('http')
const xml = require('node-xml')
const wskey = require(__dirname + '/../config.json').oclc.wskey.public
const baseUrl = 'http://www.worldcat.org/webservices/catalog/content/'

module.exports = function getPocketLabelInfo (oclcNumber, callback) {
  const url = baseUrl + oclcNumber + '?wskey=' + wskey + '&recordSchema=marcxml'
  const parser = new xml.SaxParser(function (p) {
    let atTag = false
    let atTitle = false
    let atAuthor = false

    let out = {}
    
    p.onStartElementNS(function (el, attrs) {
      if (atTag && el === 'subfield') {
        if (attrs[0][0] === 'code') {
          switch(attrs[0][1]) {
            case 'a': return atTitle = true
            case 'c': return atAuthor = true
          }
        }
      }

      if (el === 'datafield') {
        for (let a = 0; a < attrs.length; a++) {
          let attr = attrs[a]
          if (attr[0] === 'tag' && attr[1] === '245') {
            return atTag = true
          }
        }
      }
    })

    p.onEndElementNS(function (el) {
      if (atTag && el === 'subfield') {
        if (atTitle) return atTitle = false
        if (atAuthor) return atAuthor = false
      }

      if (atTag && el === 'datafield') {
        return atTag = false
      }
    })

    p.onCharacters(function (val) {
      if (atTitle) return out['title'] = val.replace(/\/\s*$/, '').trim()
      if (atAuthor) return out['author'] = val.trim()
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