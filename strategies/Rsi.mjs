import {rsi} from '../indicators/tulind.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

/**
 * For every candle < 30 rsi, buy a lot
 * Sell all open positions when rsi reaches > 70
 */
export class RsiStrategy {
  constructor(initialBalance, trader, plotter) {
    this.closeValues = []
    this.trades = 0
    this.openPosIds = []
    this.balance = initialBalance
    this.trader = trader
    this.plotter = plotter
    this.rsiSize = 14
    this.plotter.addLine('RSI', 'blue')
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.rsiSize) {
      return
    }
    
    // Get RSI
    const rsiValues = await rsi(this.rsiSize, this.closeValues)
    const currentRsi = rsiValues[rsiValues.length - 1]
    this.plotter.addPointToLine('RSI', {timestamp: candle.timestamp, price: currentRsi})

    // Test if to open/close position
    if (currentRsi <= 30) {
      this.openPosIds.push(this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp}))
    } else if (currentRsi >= 70) {
      this.openPosIds.forEach(posId => {
        console.log('posId to close:', posId)
        this.balance = this.trader.closePosition({positionId: posId, price: candle.close, timestamp: candle.timestamp})
        this.trades += 1
      })
    }
  }
  
  async end (candle) {
    const rsiValues = await rsi(this.rsiSize, this.closeValues)
    const currentRsi = rsiValues[rsiValues.length - 1]
    this.plotter.addPointToLine('RSI', {timestamp: candle.timestamp, price: currentRsi})
    this.openPosIds.forEach(posId => {
      this.balance = this.trader.closePosition({positionId: posId, price: candle.close, timestamp: candle.timestamp})
      this.trades += 1
    })
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }
}
