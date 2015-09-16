'use strict';

let els = require('./elements')

module.exports = function addRowToTable () {
  let tableRowCount = getLastRowCount()
  let table = els.input.tableBody
  let selectAll = !!els.input.selectAll.checked
  let tr = document.createElement('tr')
  let rowId = 'row-' + ++tableRowCount
  tr.id = rowId

  let td1 = document.createElement('td')
  let barcode = document.createElement('input')

  let td2 = document.createElement('td')
  let pocketLabel = document.createElement('input')

  barcode.type = 'text'
  barcode.id = rowId + '-barcode'
  barcode.className = 'input-barcode'
  barcode.addEventListener('keydown', handleBarcodeKeydown)
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

module.exports.getLastRowCount = getLastRowCount,
module.exports.handleBarcodeKeydown = handleBarcodeKeydown

function getLastRowCount () {
  let trs = document.querySelectorAll('tr[id^="row-"]')
  if (!trs.length) return 0
  else return Number(trs[trs.length - 1].id.replace('row-', ''))
}

function handleBarcodeKeydown (ev) {
  if (ev.keyCode === 13) {
    let targetId = Number(ev.target.parentElement.parentElement.id.replace('row-', ''))
    let lastRowId = getLastRowCount()

    if (targetId === lastRowId) addRowToTable()
    else {
      ev.target             //     <input>
        .parentElement      //    </td>
        .parentElement      //   </tr>
        .nextElementSibling //   <tr>
        .firstElementChild  //    <td>
        .firstElementChild  //      <input>
        .focus()
    }
  }
}