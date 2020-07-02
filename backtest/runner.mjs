import {getStrategy} from '../strategies/index.mjs'
import {Trader} from '../trader/Trader.mjs'
import {getCandles} from '../db/candles.mjs'

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
async function backTestRunner({provider, symbol, interval, from, to, strategy, quantity, quantityType, initialBalance}) {
  const candles = getCandles(provider, symbol, from, to, interval)

  const backTestDir = getBackTestId({provider, symbol, interval, from, to, strategy})

  const trader = new Trader({
    mode: 'backtest',
    symbol,
    provider,
    quantity,
    quantityType,
    initialBalance,
    tradeDir: backTestDir
  })

  const strat = new (await getStrategy(strategy))(initialBalance, trader)

  for(let i = 0; i < candles.length; i += 1) {
    const candle = candles[i]
    // eslint-disable-next-line no-await-in-loop
    await strat.onTick(candle)
  }

  await strat.end(candles[candles.length - 1])
  const backTestId = backTestDir.split('/').pop()
  // TODO: add end time 
  return {
    backTestId,
    linesToPlot: strat.getLinesToPlot(),
    trades: trader.trades,
    candles
  }
}

function getBackTestId({provider, symbol, interval, from, to, strategy}) {
  const backTestId = `${strategy}_${provider}_${symbol}_${interval}_${from}_${to}`
  return backTestId
}

/* 
CREATE TABLE backtests (
    backTestId        CHAR (50)    PRIMARY KEY
                                   UNIQUE
                                   NOT NULL,
    provider          CHAR (50)    NOT NULL,
    symbol            CHAR (10)    NOT NULL,
    startRunTimeStamp INTEGER (15) NOT NULL,
    endRunTimeStamp   INTEGER (15),
    linesToPlot       CHAR         NOT NULL
                                   DEFAULT "[]",
    openPositions     CHAR         NOT NULL
                                   DEFAULT "[]"
);

 */