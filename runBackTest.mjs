import {backtestRunner} from './backtest/runner.mjs'

const backtestSelector = {
  provider: 'bitfinex',
  selector: 'BTCEUR_15m_2020-05-02_2020-05-03',
  strategyName: 'dumb'
}

backtestRunner(backtestSelector)
