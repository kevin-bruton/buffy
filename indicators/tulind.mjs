import tulind from 'tulind'

export {
  sma,
  ema,
  hma,
  rsi,
  macd,
  bbands
}


/**
 * Simple Moving Average
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of SMA values calculated
 */
function sma(period, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.sma.indicator([closeValues], [period], (err, results) => {
      if (err) reject(err)
      resolve(results && results[0])
    })
  })
}
/**
 * Exponential Moving Average
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of SMA values calculated
 */
function ema(period, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.ema.indicator([closeValues], [period], (err, results) => {
      if (err) reject(err)
      resolve(results && results[0])
    })
  })
}

/**
 * Hull Moving Average
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of HMA values calculated
 */
function hma(period, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.hma.indicator([closeValues], [period], (err, results) => {
      if (err) reject(err)
      resolve(results && results[0])
    })
  })
}

/**
 * RSI Moving Average
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of RSI values calculated
 */
function rsi(period, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.rsi.indicator([closeValues], [period], (err, results) => {
      if (err) reject(err)
      resolve(results && results[0])
    })
  })
}

/**
 * MACD
 *
 * @param {number} period - number of values de average is calculated on
 * @param {Array<number>} closeValues - 
 * @returns Array<number> Array of RSI values calculated
 */
function macd({shortPeriod, longPeriod, signalPeriod}, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.rsi.indicator([closeValues], [shortPeriod, longPeriod, signalPeriod], (err, results) => {
      if (err) reject(err)
      resolve(results.length === 3 && {
        macd: results[0],
        macdSignal: results[1],
        macdHistogram: results[3]
      })
    })
  })
}


/**
 * Bollinger Bands
 *
 * @param {number} period - number of values de average is calculated on
 * @param {number} stddev - standard deviation
 * @param {Array<number>} closeValues - 
 * @returns {Promise<Object>}
 */
function bbands({period = 20, stddev = 2}, closeValues) {
  return new Promise((resolve, reject) => {
    tulind.indicators.bbands.indicator([closeValues], [period, stddev], (err, results) => {
      if (err) reject(err)
      resolve(results.length === 3 && {
        lower: results[0],
        middle: results[1],
        upper: results[2]
      })
    })
  })
}
