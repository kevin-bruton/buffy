import {backtestRunner} from './backtest/runner.mjs'

const backtestSelector = {
  provider: 'bitfinex',
  symbol: 'BTCEUR',
  interval: '15m',
  from: '2020-05-02',
  to: '2020-05-03',
  strategyName: 'dumb'
}

backtestRunner(backtestSelector)
