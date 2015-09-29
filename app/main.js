'use strict'

const ipc = require('ipc')

// lib functions
const addRowToTable = require(__dirname + '/lib/add-row-to-table')
const lastRowCount = addRowToTable.getLastRowCount

const config = require(__dirname + '/lib/get-config')()
const els = require(__dirname + '/lib/elements')
const generateLabel = require(__dirname + '/lib/generate-label')

const settings = config.settings

// placeholder for now
const style = {
  "label": { "width": "4in" },
  "spine": {
    "height": "1.5in",
    "width": "1.5in"
  },
  "pocket": {
    "height": "1.5in",
    "width": "2.5in"
  }
}

// events
document.addEventListener('DOMContentLoaded', init)
els.input.header.addEventListener('click', toggleInputBody)
els.input.selectAll.addEventListener('change', toggleSelectAll)
els.input.addRow.addEventListener('click', addRowToTable)

// ipc events
ipc.on('app:item', function (info, rowId, includePocket) {
  var label = generateLabel(info, includePocket, style)
  els.label.container.appendChild(label)
  
  insertOk(rowId)
})

function init () {
  setUpTable()
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
  let numberOfRows = settings.input_table.default_number_of_rows
  
  let i = 0

  for (; i < numberOfRows; i++) addRowToTable(handleBarcodeKeydown)

  // add focus to first element on set-up

  table.firstElementChild // <tr>
       .firstElementChild //   <td>
       .firstElementChild //     <input>
       .focus()
}


function insertOk (rowId) {
  return insertBarcodeSprite('ok', rowId)
}

function insertNotOk (rowId) {
  return insertBarcodeSprite('not-ok', rowId)
}

function insertBarcodeSprite(which, rowId) {
  var tr = document.getElementById(rowId)
  var td = tr.firstElementChild
  var sprite = document.createElement('span')
  sprite.className = 'barcode-' + which

  td.insertBefore(sprite, td.firstElementChild)
}

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
