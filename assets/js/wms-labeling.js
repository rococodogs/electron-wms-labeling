'use strict';

// node modules
const ipc = require('ipc')

const SELECTOR = {
  TBODY: '#barcode-input-table tbody',
  
  // 'form' elements
  BARCODE_INPUT: '.barcode',
  POCKET_LABEL: '.pocket-label',
  SELECT_ALL: '#select-all-toggle',
  ADD_ROW: '#barcode-add-row',

}

// an array of label objects we'll use to generate labels
const LABELS = []

const BARCODE_EL_REG = new RegExp(SELECTOR.BARCODE_INPUT.substring(1))

const ROW_PREFIX = 'row-'

// elements
let tbody = document.querySelector(SELECTOR.TBODY)
let selectAll = document.querySelector(SELECTOR.SELECT_ALL)
let addRowButton = document.querySelector(SELECTOR.ADD_ROW)

// handle events
addRowButton.addEventListener('click', appendRowToTable)
selectAll.addEventListener('change', handleSelectAllToggle)
document.addEventListener('keydown', handleKeydown)
ipc.on('item-data', onItemData)

let rowCount = tbody.querySelectorAll('tr').length

function handleSelectAllToggle () {
  let checked = !!selectAll.checked
  let toggleClassName = SELECTOR.POCKET_LABEL.substring(1)
  let toggles = document.getElementsByClassName(toggleClassName)
  Array.prototype.forEach.call(toggles, function (t) {
    t.checked = checked
  })
}

function handleKeydown (ev) {
  let target = ev.target
  if (ev.keyCode === 13 && BARCODE_EL_REG.test(target.className)) {
    return handleBarcodeEnter(target)
  }
}

function handleBarcodeEnter (target) {
  let associatedToggle = target              //   <input/>
                         .parentElement      // </td>
                         .nextElementSibling // <td>
                         .children[0]        //   <input/>
  let checked = !!associatedToggle.checked
  let nextGroup = target              //    <input/>
                  .parentElement      //  </td>
                  .parentElement      // </tr>
                  .nextElementSibling // <tr>

  let rowId = target.parentElement.parentElement.id
  if (nextGroup) {
    // .firstChild returns text nodes if you've got a line break between elements
    nextGroup     // <tr>
      .children[0] //   <td>
      .children[0] //     <input>
      .focus()
  } else {
    appendRowToTable()
  }
  
  if (target.value === '') return

  ipc.send('add-item', {barcode: target.value, pocketLabel: checked, rowId: rowId })
}

function appendRowToTable () {
  let checked = !!selectAll.checked
  let checkedText = checked ? 'checked' : ''
  let row = document.createElement('tr')
  row.id = ROW_PREFIX + ++rowCount

  let inputClassName = SELECTOR.BARCODE_INPUT.substring(1)
  let printLabelClassName = SELECTOR.POCKET_LABEL.substring(1)

  let allInputs

  row.innerHTML = '<td><button onclick="removeRow(this)">X</button></td>'
                + '<td>'
                +   '<input class="' + inputClassName + '" type="text">'
                + '</td>'
                + '<td>'
                +   '<input class="' + printLabelClassName + '" type="checkbox"'
                +   checkedText
                +   '>'
                + '</td>'
                + '<td class="status"></td>'
  tbody.insertBefore(row, null)

  allInputs = document.querySelectorAll(SELECTOR.BARCODE_INPUT)
  allInputs[allInputs.length - 1].focus()
}

function onItemData (data) {
  var statusSelector = '#' + data.inputTableRowId + ' .status'
  var statusEl = document.querySelector(statusSelector)
  LABELS.push(data)

  statusEl.innerHTML = data.title || data.callNumber
}

function removeRow (el) {
  var rowId = el.parentElement.parentElement.id
  var row = document.getElementById(rowId)

  row.parentElement.removeChild(row)
}