'use strict'

const Mustache = require('mustache')

// returns an HtmlDivElement to add to the dom
module.exports = function generateLabels (info, includePocket) {
  // loading the settings w/ each call in the event that the settings change
  let settings = require(__dirname + '/../local/settings.json')
  let spineTemplate = settings['template.spine']
  let pocketTemplate = settings['template.pocket']

  // pre-parsing may not be necessary since we're loading from scratch
  // w/ each call
  Mustache.parse(spineTemplate)
  Mustache.parse(pocketTemplate)

  let spineStyle = {
    height: unitize(settings['spine.height']),
    width: unitize(settings['spine.width'])
  }

  let pocketStyle

  if (!!includePocket) {
    pocketStyle = {
      height: unitize(settings['pocket.height']),
      width: unitize(settings['pocket.width'])
    }
  } else {
    pocketStyle = { display: 'none' }
  }

  let labelStyle = {
    height: unitize(settings['label.height']),
    width: unitize(settings['label.width'])
  }

  // build the elements
  let container = generateLabelContainer(labelStyle)
  let spine = generateSpineLabel(info, spineTemplate, spineStyle)
  let pocket = includePocket
               ? generatePocketLabel(info, pocketTemplate, pocketStyle)
               : generatePocketLabel({}, '', pocketStyle)

  // set contenteditable for spine + pocket (for revisions, etc.)
  spine.contentEditable = true
  pocket.contentEditable = true

  container.appendChild(generateCloseButton())
  container.appendChild(spine)
  container.appendChild(pocket)

  return container
}

function generateCloseButton () {
  let btn = document.createElement('button')
  btn.className = 'close-btn'
  btn.onclick = function () {
    this.parentElement.parentElement.removeChild(this.parentElement)

    if (this.parentElement.dataset.rowId !== void 0) {
      let rowId = this.parentElement.dataset.rowId
      let input = document.querySelector(`tr#${rowId} input[type="text"]`)
      let sprite = document.querySelector(`tr#${rowId} td > span`)
      input.value = ''
      sprite.parentElement.removeChild(sprite)
    }
  }
  btn.innerText = 'x'
  btn.title = 'Remove label'

  return btn
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

function unitize (number) {
  let unit = settings['dimension_unit']
  return number + '' + unit
}
