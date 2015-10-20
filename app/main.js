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

// select all toggle button
els.input.selectAll.addEventListener('change', toggleSelectAll)

// add row to the table after clicking the 'Add Row' button
els.input.addRow.addEventListener('click', addRowToTable)

// handle an item being returned from the main process
ipc.on('app:item', function (info, rowId, includePocket) {
  let label = generateLabel(info, includePocket)
  label.dataset.rowId = rowId
  els.label.container.appendChild(label)

  insertOkSprite(rowId)
})

// if an error's returned, we'll need to handle that
ipc.on('app:item-error', function (message, rowId) {
  insertNotOkSprite(rowId, message)
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

//
// handlers
//

function init () {
  setUpTable()
  if (settings.default_select_all === true) {
    els.input.selectAll.checked = true
    toggleSelectAll()
  }
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

function updateStatusSprite (status, rowId, title) {
  let el = document.querySelector(`#${rowId} .barcode-status`)
  el.className = `barcode-status ${status}`.trim()
  if (title) el.title = title
  return el
}

function clearStatusSprite (rowId) {
  return updateStatusSprite('', rowId)
}

function insertOkSprite (rowId) {
  return updateStatusSprite('ok', rowId)
}

function insertNotOkSprite (rowId, message) {
  return updateStatusSprite('not-ok', rowId, message)
}

function insertLoadingSprite (rowId) {
  return updateStatusSprite('loading', rowId)
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
      insertLoadingSprite(rowId)
      ipc.send('window:add-barcode', barcode, !!pocketLabel.checked, rowId)
    }

    if (id === lastRowCount()) {
      addRowToTable(handleBarcodeKeydown)
    } else {
      let nextEl = ev.target            //     <input>
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
