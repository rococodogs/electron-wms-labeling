'use strict'

// does the heavy lifting to extract a call number from a copy resource record
module.exports = function processCopyResource (barcode, copyResource) {
  if (typeof barcode === 'number') barcode = String(barcode)

  let entry = copyResource.entry

  // TODO: handle exceptions in a better way
  if (entry.length > 1) {
    throw Error('Multiple copy-resource entries returned for barcode `' + barcode + '`')
  } else if (entry.length === 0) {
    throw Error('No copy-resource entry found for barcode `' + barcode + '`')
  }

  entry = entry[0]

  let shelvingDesignation = entry.shelvingDesignation
  let holdings = entry.holding
  let holding

  if (holdings.length > 1) {
    for (let h = 0; h < holdings.length; h++) {
      let pd = holdings[h].pieceDesignation
      if (pd.indexOf(barcode) > -1) {
        holding = holdings[h]
      }
    }

    // otherwise, skip the holding?
  } else {
    holding = holdings[0]
  }

  return {
    prefix: shelvingDesignation.prefix,
    callNumber: shelvingDesignation.information,
    cutter: shelvingDesignation.itemPart,
    suffix: shelvingDesignation.suffix,
    description: (holding.caption ? holding.caption.description : null),
    enumeration: (holding.caption ? holding.caption.enumeration : null),
    chronology: (holding.caption ? holding.caption.chronology : null),
    oclcNumber: entry.bib.replace('/bibs/', '')
  }
}
