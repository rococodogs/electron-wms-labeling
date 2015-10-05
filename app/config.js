'use strict'
const ipc = require('ipc')
const Mustache = require('mustache')
const forEach = Array.prototype.forEach

// cache the template elements so that ever click of the `.template-update` button
// doesn't require a `document.getElementById` call
const templateInputs = {
  'template-pocket': document.getElementById('template-pocket'),
  'template-spine': document.getElementById('template-spine')
}

const templateTargets = {
  'template-pocket': document.querySelector('#template-pocket-example > .content'),
  'template-spine': document.querySelector('#template-spine-example > .content')
}

const inputElements = {
  // oclc config
  'oclc-institution-id': document.getElementById('oclc-institution_id'),
  'wskey-public':        document.getElementById('wskey-public'),
  'wskey-secret':        document.getElementById('wskey-secret'),
  'user-principalID':    document.getElementById('user-principalID'),
  'user-principalIDNS':  document.getElementById('user-principalIDNS'),

  // app config
  'default_number_of_inputs': document.getElementById('default_number_of_inputs'),

  // label config
  'label-height':  document.getElementById('label-height'),
  'label-width':   document.getElementById('label-width'),
  'spine-height':  document.getElementById('spine-height'),
  'spine-width':   document.getElementById('spine-width'),
  'pocket-height': document.getElementById('pocket-height'),
  'pocket-width':  document.getElementById('pocket-width'),

  // label templates
  'template-pocket': templateInputs['template-pocket'],
  'template-spine':  templateInputs['template-spine']
}

// use `let` to allow updates
let settings = ipc.sendSync('get-settings-sync')

// init on load
document.addEventListener('DOMContentLoaded', init)

function init () {
  // set up tabs
  initTabs()

  // if in electron, open all external links
  // using the `shell` module
  setupElectronLinks()

  // stuff setting vals into our inputs
  preloadInputs()

  // listen for updates on all of the inputs
  setupInputListeners(inputElements)

  // adds listeners for the spine/pocket label templates
  setupTemplateUpdates()
}

function initTabs () {
  let menuTabLinks = document.querySelectorAll('.tab a')

  const tabOpenClass = 'tab-open'
  const tabOpenSelector = '.' + tabOpenClass

  const pageOpenClass = 'page-open'
  const pageOpenSelector = '.' + pageOpenClass

  forEach.call(menuTabLinks, function (mt) {
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
    let el = inputElements[k] || document.getElementById(keyToId(k))
    if (el) el.value = settings[k]
      if (!el) console.log(k)
  }

  forEach.call(document.querySelectorAll('.template'), function (t) {
    renderExample(t)
  })
}

// set up all links to open externally
function setupElectronLinks () {
  let shell = require('shell')

  forEach.call(document.querySelectorAll('p a'), function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      shell.openExternal(ev.target.href)
    })
  })
}

function renderExample (ex) {
  // ex must be an HtmlElement
  let elId = ex.id
  let target = templateTargets[elId]
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
    title: 'Title of Work',
    author: 'Example Author'
  }

  target.innerHTML = Mustache.render(template, data)
}

function setupInputListeners (els) {
  for (let k in els) {
    let el = els[k]
    if (!el) continue

    el.addEventListener('focus', onfocus)
    el.addEventListener('change', onchange)
  }

  function onfocus (ev) {
    let el = ev.target
    el.classList.remove('saved')
    el.classList.remove('error')
  }

  function onchange (ev) {
    let el = ev.target
    let key = idToKey(el.id)
    let val = el.value

    settings[key] = val

    ipc.send('config:update-settings', settings, key)
  }
}

// helpers for saving settings
function idToKey (id) { return id.replace(/-/g, '.') }
function keyToId (id) { return id.replace(/\./g, '-') }

ipc.on('app:updated-setting-key', function (key) {
  let id = keyToId(key)
  let el = document.getElementById(id)
  el.classList.add('saved')
})

// renders the template example on change
function setupTemplateUpdates () {
  for (let k in templateInputs) {
    let el = templateInputs[k]
    el.addEventListener('change', function (ev) {
      renderExample(el)
    })
  }
}
