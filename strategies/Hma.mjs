import {hma} from '../indicators/tulind.mjs'
import {LinePlot} from '../plotter/lines.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

export class HmaStrategy {
  constructor(initialBalance, trader) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.balance = initialBalance
    this.trader = trader
    this.hmaSize = 14
    this.hmaLine = new LinePlot({name: 'HMA', color: 'blue', strategy: this})
    this.diffPercentForBuy = 0.01
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.hmaSize + 2) {
      return
    }
    
    // Get HMA
    const hmaValues = await hma(this.hmaSize, this.closeValues)
    const currentHma = hmaValues[hmaValues.length - 1]
    const hmaDiffPercent = (currentHma - hmaValues[hmaValues.length - 2]) * 100 / candle.close
    this.hmaLine.addPoint({timestamp: candle.timestamp, price: currentHma})

    // Test if to open/close position
    if (!this.openPosId && (hmaDiffPercent > this.diffPercentForBuy)) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
    } else if (this.openPosId && ((hmaDiffPercent <= 0) /* || candle.close <= this.closeValues[this.closeValues.length - 2] */)) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
      this.openPosId = 0
      this.trades += 1
    }
  }
  
  async end (candle) {
    const hmaValues = await hma(50, this.closeValues)
    const currentHma = hmaValues[hmaValues.length - 1]
    this.hmaLine.addPoint({timestamp: candle.timestamp, price: currentHma})
    if (this.openPosId) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
      this.trades += 1
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }

  getLinesToPlot() {
    return [
      this.hmaLine.getLine()
    ]
  }
}
