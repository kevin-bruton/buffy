import {sma} from '../indicators/tulind.mjs'
import {LinePlot} from '../plotter/lines.mjs'
import {TrailingLongStop} from '../indicators/custom.mjs'

export class FollowMeStrategy {
  constructor(initialBalance, trader) {
    this.closeValues = []
    this.counter = 0
    this.trades = 0
    this.openPosId = 0
    this.balance = initialBalance
    this.trader = trader
    this.slowSmaLine = new LinePlot({name: 'SlowSma', color: 'blue', strategy: this})
    this.fastSmaLine = new LinePlot({name: 'FastSma', color: 'orange', strategy: this})
    this.trailingStop = new TrailingLongStop({priceMargin: 80})
    console.log('Strategy init')
  }

  async onTick (candle) {
    let currentFastSma
    this.closeValues.push(candle.close)
    if (this.closeValues.length >= 5) {
      const fastSma = await sma(5, this.closeValues)
      currentFastSma = fastSma[fastSma.length - 1]
      this.fastSmaLine.addPoint({timestamp: candle.timestamp, price: currentFastSma})
    }
    if (this.closeValues.length >= 50) {
      const slowSma = await sma(50, this.closeValues)
      const currentSlowSma = slowSma[slowSma.length - 1]
      this.slowSmaLine.addPoint({timestamp: candle.timestamp, price: currentSlowSma})
      if (!this.openPosId && currentFastSma > currentSlowSma) {
        this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      }
      if (this.openPosId && (currentFastSma < currentSlowSma || this.trailingStop.shouldStop(candle.close))) {
        this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
        this.openPosId = 0
        this.trades += 1
      }
    }
  }
  
  async end (lastCandle) {
    const slowSma = await sma(50, this.closeValues)
    const fastSma = await sma(5, this.closeValues)
    this.slowSmaLine.addPoint({timestamp: lastCandle.timestamp, price: slowSma[slowSma.length - 1]})
    this.fastSmaLine.addPoint({timestamp: lastCandle.timestamp, price: fastSma[fastSma.length - 1]})
    if (this.openPosId) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: lastCandle.close, timestamp: lastCandle.timestamp})
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }

  getLinesToPlot() {
    return [
      this.slowSmaLine.getLine(),
      this.fastSmaLine.getLine()
    ]
  }
}
