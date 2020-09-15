import {getStrategy} from '../strategies/index.mjs'
import {Trader} from '../trader/Trader.mjs'
import {get1mCandle} from '../db/candles.mjs'
import { Plotter } from '../plotter/Plotter.mjs'
import {printProgress} from '../utils/index.mjs'

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
async function backTestRunner({provider, symbol, interval, fromTimestamp, toTimestamp, strategy, quantity, quantityType, initialBalance}, progressListener) {

  console.log('Getting strategy...')
  const backTestId = getBackTestId({provider, symbol, interval, fromTimestamp, toTimestamp, strategy})

  const trader = new Trader({
    mode: 'backtest',
    symbol,
    provider,
    quantity,
    quantityType,
    initialBalance: Number(initialBalance)
  })

  const plotter =  new Plotter()

  // Initialize strategy
  const strat = new (await getStrategy(strategy))(trader, plotter)

  let progressTime = fromTimestamp
  const candles = []
  while (progressTime < toTimestamp) {
    const candle =  get1mCandle(provider, symbol, progressTime)
    progressTime += 1000 * 60 // add one minute
    if (candle) {
      candles.push(candle)
      plotter.setTimestamp(candle.timestamp)
      // eslint-disable-next-line no-await-in-loop
      await strat.onTick(candle, candles)
      // eslint-disable-next-line no-await-in-loop
      await progressListener({
        candle,
        pointsToAddToLines: plotter.getPointsToAddToLines(),
        trades: trader.getTrades(),
        balance: trader.balance
      })
      printProgress(fromTimestamp + progressTime, toTimestamp)
    }
  }

  strat.onEnd(candles[candles.length - 1], candles)
  await progressListener({end: true, candle: candles[candles.length - 1], trades: trader.getTrades()})
  console.log('')

  // TODO: add end time 
  return {
    backTestId,
    linesToPlot: plotter.getLinesToPlot(),
    trades: trader.getTrades(),
    candles
  }
}

function getBackTestId({provider, symbol, interval, from, to, strategy}) {
  const backTestId = `${strategy}_${provider}_${symbol}_${interval}_${from}_${to}`
  return backTestId
}
