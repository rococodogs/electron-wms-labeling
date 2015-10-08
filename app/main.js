/* global HTMLSpanElement */
'use strict'

const ipc = require('ipc')
const join = require('path').join

// lib functions
const addRowToTable = require(join(__dirname, 'lib', 'add-row-to-table'))
const lastRowCount = addRowToTable.getLastRowCount

const els = require(join(__dirname, 'lib', 'elements'))
const generateLabel = require(join(__dirname, 'lib', 'generate-label'))

// first-things-first, we'll have to get the settings that are
// loaded on the main process
let settings = ipc.sendSync('get-settings-sync')

// set-up (preload the table)
document.addEventListener('DOMContentLoaded', init)

// header collapse/expand (currently just hiding the body)
els.input.header.addEventListener('click', toggleInputBody)

// select all toggle button
els.input.selectAll.addEventListener('change', toggleSelectAll)

// add row to the table after clicking the 'Add Row' button
els.input.addRow.addEventListener('click', addRowToTable)

// handle an item being returned from the main process
ipc.on('app:item', function (info, rowId, includePocket) {
  var label = generateLabel(info, includePocket)
  els.label.container.appendChild(label)

  insertOk(rowId)
})

// if an error's returned, we'll need to handle that
ipc.on('app:item-error', function (err, rowId) {
  if (err) return // TODO: alert the err
  insertNotOk(rowId)
})

// update settings when changed in config
ipc.on('config:update-settings', function (updated) {
  settings = updated
})

// we need to use the main window as a relay for the menu
// to trigger the `window:open-config` message
ipc.on('menu:open-config', function () {
  ipc.send('window:open-config')
})

function init () {
  setUpTable()
  if (settings.default_select_all === true) {
    els.input.selectAll.checked = true
    toggleSelectAll()
  }
}

function toggleInputBody (ev) {
  let list = els.input.body.classList
  let action = list.contains('closed') ? 'remove' : 'add'

  list[action]('closed')
}

function toggleSelectAll () {
  let selectAll = !!els.input.selectAll.checked
  let boxes = document.querySelectorAll('.input-pocket-label')
  let len = boxes.length
  let i = 0

  for (; i < len; i++) boxes[i].checked = selectAll
}

function setUpTable () {
  let table = els.input.tableBody
  let numberOfRows = settings['default_number_of_inputs'] || 10

  let i = 0

  for (; i < numberOfRows; i++) addRowToTable(handleBarcodeKeydown)

  // add focus to first element on set-up

  table.firstElementChild // <tr>
       .firstElementChild //   <td>
       .firstElementChild //     <input>
       .focus()
}

// adds a span::before pseudo-element before the first element
// of a row. currently only uses 'ok' and 'not-ok'
function insertBarcodeSprite (which, rowId) {
  var tr = document.getElementById(rowId)
  var td = tr.firstElementChild
  var sprite = document.createElement('span')
  sprite.className = 'barcode-' + which

  td.insertBefore(sprite, td.firstElementChild)
}

// add a checkmark to a row
function insertOk (rowId) {
  return insertBarcodeSprite('ok', rowId)
}

// add an X to a row
function insertNotOk (rowId) {
  return insertBarcodeSprite('not-ok', rowId)
}

// currently only handling an `Enter` keystroke (either by the user
// or a barcode scanner), which kicks sends the barcode to the main
// process (for gathering label info) and moving the cursor to the
// next line, adding a row if none present
function handleBarcodeKeydown (ev) {
  if (ev.keyCode === 13) {
    let id = Number(ev.target.id.replace(/row-|-barcode/g, ''))
    let rowId = `row-${id}`
    let barcode = ev.target.value
    let pocketLabel = document.getElementById(`${rowId}-pocket-label`)

    if (ev.target.value !== '') {
      ipc.send('window:add-barcode', barcode, !!pocketLabel.checked, rowId)
    }

    if (id === lastRowCount()) {
      addRowToTable(handleBarcodeKeydown)
    } else {
      var nextEl = ev.target            //     <input>
                   .parentElement      //    </td>
                   .parentElement      //   </tr>
                   .nextElementSibling //   <tr>
                   .firstElementChild  //    <td>
                   .firstElementChild  //      <input>

      if (nextEl instanceof HTMLSpanElement) {
        nextEl = nextEl.nextElementSibling
      }

      nextEl.focus()
    }
  }
}
