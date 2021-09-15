import {getStrategy} from '../strategies/index.mjs'
import {Trader} from '../trader/Trader.mjs'
import {getIntervalCandle} from '../db/candles.mjs'
import { Plotter } from '../plotter/Plotter.mjs'
import {printProgress} from '../utils/index.mjs'

export {backTestRunner}

const getIntervalInMinutes = interval => ({
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '2h': 60,
  '3h': 3 * 60,
  '4h': 4 * 60,
  '6h': 6 * 60,
  '12h': 12 * 60,
  '1D': 24 * 60,
  '7D': 7 * 24 * 60,
  '14D': 14 * 24 * 60
}[interval])

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
  while (progressTime <= toTimestamp) {
    const candle =  getIntervalCandle(provider, symbol, progressTime, interval)
    progressTime += getIntervalInMinutes(interval) * 1000 * 60
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
  /* return {
    backTestId,
    linesToPlot: plotter.getLinesToPlot(),
    trades: trader.getTrades(),
    candles
  } */
}

function getBackTestId({provider, symbol, interval, from, to, strategy}) {
  const backTestId = `${strategy}_${provider}_${symbol}_${interval}_${from}_${to}`
  return backTestId
}
