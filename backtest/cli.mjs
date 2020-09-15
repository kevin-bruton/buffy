import {backTestRunner} from './runner.mjs'

const backtestSelector = {
  provider: 'bitfinex',
  symbol: 'BTCUSD',
  interval: '15m',
  from: '2020-01-02',
  to: '2020-01-03',
  strategy: 'Test',
  quantity: 1000,
  quantityType: 'price',
  initialBalance: 10000
}

backTestRunner(backtestSelector, progressListener)

function progressListener({candle, pointsToAddToLines, trades, balance}) {
  if (trades.length) {
    console.log(new Date(candle.timestamp), 'Balance:', balance, pointsToAddToLines)
  }
}
