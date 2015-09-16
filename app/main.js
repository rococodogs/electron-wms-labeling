'use strict'

// lib functions
const addRowToTable = require('./lib/add-row-to-table')

const config = require('./lib/get-config')()
const els = require('./lib/elements')

const settings = config.settings

// events
document.addEventListener('DOMContentLoaded', init)
els.input.header.addEventListener('click', toggleInputBody)
els.input.selectAll.addEventListener('change', toggleSelectAll)
els.input.addRow.addEventListener('click', addRowToTable)

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

  for (; i < numberOfRows; i++) addRowToTable()

  // add focus to first element on set-up

  table.firstElementChild // <tr>
       .firstElementChild //   <td>
       .firstElementChild //     <input>
       .focus()
}
