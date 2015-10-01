module.exports = {
  input: {
    addRow: document.querySelector('.input-add-row'),
    container: document.querySelector('.input-container'),
    header: document.querySelector('.input-container--header'),
    body: document.querySelector('.input-container--body'),
    selectAll: document.querySelector('.input-pocket-label--select-all'),
    table: document.querySelector('.input-table'),
    tableBody: document.querySelector('.input-table tbody')
  },

  label: {
    container: document.querySelector('.label-container')
  },

  groups: {
    input: {
      pocketLabels: document.querySelectorAll('.input-pocket-label')
    }
  }
}
