'use strict'

const Mustache = require('mustache')

// we'll generate the innerHTML for the labels by compiling mustache
// templates (eventually provided by user) w/ the info

// available keys:
//
// prefix: shelvingDesignation.prefix
// callNumber: shelvingDesignation.information
// cutter: shelvingDesignation.itemPart
// suffix: shelvingDesignation.suffix
// description: (holding.caption ? holding.caption.description : null)
// enumeration: (holding.caption ? holding.caption.enumeration : null)
// chronology: (holding.caption ? holding.caption.chronology : null)
// oclcNumber: entry.bib.replace('/bibs/', '')
// title
// author

// DVD
// 791.4372
// A123b
// v2 copy 2
let spineTemplate = '{{# prefix}}{{ prefix}}<br>{{/ prefix}}'
                   + '{{ callNumber }}<br>'
                   + '{{ cutter }}<br>'
                   + '{{# description }}{{ description }} {{/ description }}'
                   + '{{# enumeration }}{{ enumeration }}{{/ enumeration }}'

Mustache.parse(spineTemplate)

// DVD 791.4372 A123b v2 copy 2
let pocketTemplate = '{{ prefix }} {{ callNumber }} {{ cutter }} '
                   + '{{# description }}{{ description }}{{/ description }} '
                   + '{{# enumeration }}{{ enumeration }}{{/ enumeration }}<br>'
                   + '{{ title }} / {{ author }}'

Mustache.parse(pocketTemplate)

// returns an HtmlDivElement to add to the dom


// config is an object:
// {
//   "label": { "width": "4in" }
//   "spine": {
//     "height": "1.5in"
//     "width": "1.5in"
//   },
//   "pocket": {
//     "height": "1.5in"
//     "width": "2.5in"
//   }
// }

module.exports = function generateLabels (info, includePocket, config) {
  var spineStyle = config.spine
  var pocketStyle = !!includePocket ? config.pocket : { display: 'none' }
  var labelStyle = config.label

  // labelStyle['margin'] = 'auto'

  var container = generateLabelContainer(labelStyle)
  var spine = generateSpineLabel(info, spineTemplate, spineStyle)
  var pocket = includePocket 
               ? generatePocketLabel(info, pocketTemplate, pocketStyle)
               : generatePocketLabel({}, '', pocketStyle)

  // set contenteditable for each
  spine.contentEditable = true 
  pocket.contentEditable = true

  container.appendChild(spine)
  container.appendChild(pocket)

  return container
}

function generateLabelContainer (style) {
  return generateDiv('label', '', style)
}

function generatePocketLabel (info, template, style) {
  let html = Mustache.render(template, info)

  return generateDiv('label-pocket', html, style)
}

function generateSpineLabel (info, template, style) {
  let html = Mustache.render(template, info)

  return generateDiv('label-spine', html, style)
}

function generateDiv (className, innerHTML, style) {
  let div = document.createElement('div')
  
  innerHTML = innerHTML || ''
  style = style || {}

  div.className = className
  div.innerHTML = innerHTML

  for (let k in style) div.style[k] = style[k]

  return div
}

