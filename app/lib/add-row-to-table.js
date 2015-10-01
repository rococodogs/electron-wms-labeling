'use strict'

let els = require('./elements')
let rowCount = 0

module.exports = function addRowToTable (keydownCallback) {
  let table = els.input.tableBody
  let selectAll = !!els.input.selectAll.checked
  let tr = document.createElement('tr')
  let rowId = 'row-' + ++rowCount
  tr.id = rowId

  let td1 = document.createElement('td')
  let barcode = document.createElement('input')

  let td2 = document.createElement('td')
  let pocketLabel = document.createElement('input')

  barcode.type = 'text'
  barcode.id = rowId + '-barcode'
  barcode.className = 'input-barcode'

  if (typeof keydownCallback === 'function') {
    barcode.addEventListener('keydown', keydownCallback)
  }

  td1.appendChild(barcode)
  tr.appendChild(td1)

  pocketLabel.type = 'checkbox'
  pocketLabel.id = rowId + '-pocket-label'
  pocketLabel.className = 'input-pocket-label'
  pocketLabel.checked = !!selectAll
  td2.appendChild(pocketLabel)
  tr.appendChild(td2)

  table.appendChild(tr)

  barcode.focus()
}

module.exports.getLastRowCount = getLastRowCount

function getLastRowCount () {
  return rowCount
}
