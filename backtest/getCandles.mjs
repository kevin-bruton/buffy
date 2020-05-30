export {getCandles}

import path from 'path'
import fs from 'fs'

/**
 * @typedef CandleSelection
 * @property {string} provider - Eg. 'bitfinex'
 * @property {string} selector - Eg. 'BTCEUR_15m_2020-05-02_2020-05-03'
 *
 * @param {*} {provider, selector}
 */
function getCandles({provider, selector}) {
  const dataFile = path.join(path.resolve(), 'data', provider, selector + '.json')
  const candles = JSON.parse(fs.readFileSync(dataFile, {encoding: 'utf8'}))
  return candles
}
