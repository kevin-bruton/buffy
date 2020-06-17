import path from 'path'
import fs from 'fs'

export {getCandles}

/**
 * @typedef CandleSelection
 * @property {string} provider - Eg. 'bitfinex'
 * @property {string} selector - Eg. 'BTCEUR_15m_2020-05-02_2020-05-03'
 *
 * @param {*} {provider, selector}
 */
function getCandles({provider, symbol, interval, from, to}) {
  const filename = `${symbol}_${interval}_${from}_${to}.json`
  const filepath = path.join(path.resolve(), 'data', provider, filename)
  const candles = JSON.parse(fs.readFileSync(filepath, {encoding: 'utf8'}))
  return candles
}
