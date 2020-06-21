import fs from 'fs'
import path from 'path'
import {getCandles} from './getCandles.mjs'
import {getStrategy} from '../strategies/index.mjs'
import trader from '../trader/index.mjs'

export {backTestRunner}

/**
 * @typedef BackTestDef
 * @property {string} provider - Eg. bitfinex
 * @property {string} symbol - Eg. BTCEUR
 * @property {string} interval - Eg. 15m
 * @property {string} from - Eg. 2020-05-02
 * @property {string} to - Eg. 2020-05-03
 * @property {string} strategyName
 * 
 * @param {BackTestDef} backTestDef
 */
async function backTestRunner({provider, symbol, interval, from, to, strategy, quantity, initialBalance}) {
  const candles = getCandles({provider, symbol, interval, from, to})

  const backTestDir = createBackTestDirAndOverview({provider, symbol, interval, from, to, strategy, candles})

  trader.init({
    mode: 'backtest',
    symbol,
    provider,
    quantity,
    initialBalance,
    tradeDir: backTestDir
  })

  const strat = await getStrategy(strategy)
  
  strat.backTestDir = backTestDir
  await strat.init()

  for(let i = 0; i < candles.length; i += 1) {
    const candle = candles[i]
    // eslint-disable-next-line no-await-in-loop
    await strat.onTick(candle)
  }

  await strat.end(candles[candles.length - 1])
  const backTestId = backTestDir.split('/').pop()
  // TODO: add end time to overview.json
  return backTestId
}

function createBackTestDirAndOverview({provider, symbol, interval, from, to, strategy, candles}) {
  const dirName = `${strategy}_${provider}_${symbol}_${interval}_${from}_${to}`
  const dirPath = path.join(path.resolve(), 'data', 'backtests', dirName)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  const overviewFile = path.join(dirPath, 'overview.json')
  const candlesFile = path.join(dirPath, 'candles.json')
  const overview = {started: (new Date).valueOf(), linesToPlot: []}
  fs.writeFileSync(overviewFile, JSON.stringify(overview))
  fs.writeFileSync(candlesFile, JSON.stringify(candles))
  return dirPath
}
