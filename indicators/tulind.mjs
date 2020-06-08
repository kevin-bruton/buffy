export {
  sma
}

import tulind from 'tulind'

/**
 * Simple Moving Average
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of SMA values calculated
 */
function sma(period, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.sma.indicator([closeValues], [period], function(err, results) {
      if (err) reject(err)
      resolve(results && results[0])
    })
  })
}
