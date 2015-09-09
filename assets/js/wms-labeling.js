'use strict';

// node modules
const ipc = require('ipc')

const SELECTOR = {
  TBODY: '#barcode-input-table tbody',
  
  // 'form' elements
  BARCODE_INPUT: '.barcode',
  POCKET_LABEL: '.pocket-label',
  SELECT_ALL: '#select-all-toggle',
  ADD_ROW: '#barcode-add-row'
}

// an array of label objects we'll use to generate labels
const LABELS = []

const BARCODE_EL_REG = new RegExp(SELECTOR.BARCODE_INPUT.substring(1))

// elements
let tbody = document.querySelector(SELECTOR.TBODY)
let selectAll = document.querySelector(SELECTOR.SELECT_ALL)
let addRowButton = document.querySelector(SELECTOR.ADD_ROW)

// handle events
addRowButton.addEventListener('click', appendRowToTable)
selectAll.addEventListener('change', handleSelectAllToggle)
document.addEventListener('keydown', handleKeydown)

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
  if (nextGroup) {
    // .firstChild returns text nodes if you've got a line break between elements
    nextGroup     // <tr>
      .children[0] //   <td>
      .children[0] //     <input>
      .focus()
  } else {
    appendRowToTable()
  }

  ipc.send('add-item', {barcode: target.value, pocketLabel: checked})
}

function appendRowToTable () {
  let checked = !!selectAll.checked
  let checkedText = checked ? 'checked' : ''
  let row = document.createElement('tr')

  let inputClassName = SELECTOR.BARCODE_INPUT.substring(1)
  let printLabelClassName = SELECTOR.POCKET_LABEL.substring(1)

  let allInputs

  row.innerHTML = '<td>'
                +   '<input class="' + inputClassName + '" type="text">'
                + '</td>'
                + '<td>'
                +   '<input class="' + printLabelClassName + '" type="checkbox"'
                +   checkedText
                +   '>'
                + '</td>'
  tbody.insertBefore(row, null)

  allInputs = document.querySelectorAll(SELECTOR.BARCODE_INPUT)
  allInputs[allInputs.length - 1].focus()
}

function getAllBarcodes () {
  let barcodes = document.querySelectorAll(SELECTOR.BARCODE_INPUT)
  return Array.prototype.map
         .call(barcodes, function (el) {
          if (!el.value) return null

          return {
            barcode: el.value,
            pocketLabel: !!el.parentElement
                             .nextElementSibling
                             .children[0]
                             .checked
          }
         })
         .filter(function (o) {return o !== null})
}

// $('#barcodes-submit').on('click', function () {
//   var barcodes = getBarcodes()
//   if (barcodes.length === 0) return
// })