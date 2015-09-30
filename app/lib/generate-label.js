'use strict'

const Mustache = require('mustache')

// returns an HtmlDivElement to add to the dom
module.exports = function generateLabels (info, includePocket) {
  // loading the settings w/ each call in the event that the settings change
  let settings = require(__dirname + '/../local/settings.json').app
  let spineTemplate = settings.templates.spine
  let pocketTemplate = settings.templates.pocket

  // pre-parsing may not be necessary since we're loading from scratch 
  // w/ each call
  Mustache.parse(spineTemplate)
  Mustache.parse(pocketTemplate)

  // our dimensions are stored in the config JSON as `HtmlElement.style` properties
  let spineStyle = settings.dimensions.spine
  let pocketStyle = !!includePocket ? settings.dimensions.pocket : { display: 'none' }
  let labelStyle = settings.dimensions.label

  // build the elements
  let container = generateLabelContainer(labelStyle)
  let spine = generateSpineLabel(info, spineTemplate, spineStyle)
  let pocket = includePocket 
               ? generatePocketLabel(info, pocketTemplate, pocketStyle)
               : generatePocketLabel({}, '', pocketStyle)

  // set contenteditable for spine + pocket (for revisions, etc.)
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

