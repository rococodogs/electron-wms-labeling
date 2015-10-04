'use strict'
const Mustache = require('mustache')

let settings = require('./local/settings.json')
let templateTargets = {
  'template-pocket': document.querySelector('#template-pocket-example > .content'),
  'template-spine': document.querySelector('#template-spine-example > .content')
}

// watchify
for (let k in templateTargets) {
  var el = document.getElementById(k)
  if (!el) continue
    
  el.addEventListener('change', function (ev) {
    renderExample(ev.target)
  })
}

document.addEventListener('DOMContentLoaded', init)

function init () {
  // set up tabs
  initTabs()

  preloadInputs()
}

function initTabs () {
  let menuTabLinks = document.querySelectorAll('.tab a')

  const tabOpenClass = 'tab-open'
  const tabOpenSelector = '.' + tabOpenClass

  const pageOpenClass = 'page-open'
  const pageOpenSelector = '.' + pageOpenClass

  Array.prototype.forEach.call(menuTabLinks, function (mt) {
    mt.addEventListener('click', function toggleMenu (ev) {
      ev.preventDefault()

      // id of the element to open
      let targetId = ev.target.dataset.target

      // tab of clicked element
      let clickedTab = ev.target.parentElement

      // tab currently open
      let openTab = document.querySelector(tabOpenSelector)

      // if the clicked tab is already open, forget it
      if (clickedTab === openTab) return

      // page currently open
      let openPage = document.querySelector(pageOpenSelector)

      // page requested
      let targetPage = document.getElementById(targetId)

      if (openPage === targetPage) return

      // close the open tab + page
      openTab.classList.remove(tabOpenClass)
      openPage.classList.remove(pageOpenClass)

      clickedTab.classList.add(tabOpenClass)
      targetPage.classList.add(pageOpenClass)
    })
  })
}

function preloadInputs () {
  for (let k in settings) {
    let el = document.getElementById(k.replace(/\./g, '-'))
    if (el) el.value = settings[k]
  }

  Array.prototype.forEach.call(document.querySelectorAll('.template'), function (t) {
    renderExample(t)
  })
}



function renderExample (ex) {
  let elId = ex.id
  let target = templateTargets[ex.id]

  if (!target) return

  let template = ex.value

  Mustache.parse(template)

    // prefix
    // callNumber
    // cutter
    // suffix
    // description
    // enumeration
    // chronology
    // oclcNumber
    // title
    // author

  let data = {
    prefix: 'DVD',
    callNumber: '791.4372',
    cutter: 'F5855a',
    suffix: 'Suf.',
    description: 'v. 1',
    enumeration: '12',
    chronology: 'no. 2',
    oclcNumber: '12345678',
    title: 'Example Item',
    author: 'Example Author'
  }

  target.innerHTML = Mustache.render(template, data)
}
