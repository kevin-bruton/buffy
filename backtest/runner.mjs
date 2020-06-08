export {backtestRunner}

import {getCandles} from './getCandles.mjs'
import {getStrategy} from '../strategies/index.mjs'

/**
 * @typedef BackTestDef
 * @property {string} provider - Eg. 'bitfinex'
 * @property {string} selector - Eg. 'BTCEUR_15m_2020-05-02_2020-05-03'
 * @property {string} strategyName
 * 
 * @param {BackTestDef} backTestDef
 */
async function backtestRunner({provider, selector, strategyName}) {
  const candles = getCandles({provider, selector})

  const strategy = await getStrategy(strategyName)
  
  strategy.init()

  for(let i = 0; i < candles.length; i += 1) {
    const candle = candles[i]
    strategy.onTick(candle)
  }

  strategy.end()
}
