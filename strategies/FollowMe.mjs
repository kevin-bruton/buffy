import {sma} from '../indicators/tulind.mjs'
import {TrailingLongStop} from '../indicators/custom.mjs'

/**
 * This is a cross SMA strategy with trailing stop
 */
export class FollowMeStrategy {
  constructor(initialBalance, trader, plotter) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.balance = initialBalance
    this.trader = trader
    this.slowSmaSize = 50
    this.fastSmaSize = 5
    this.plotter = plotter
    this.plotter.addLine('SlowSma', 'blue')
    this.plotter.addLine('FastSma', 'orange')
    this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.slowSmaSize) {
      return
    }
    
    // Get SMAs
    const fastSma = await sma(this.fastSmaSize, this.closeValues)
    const currentFastSma = fastSma[fastSma.length - 1]
    this.plotter.addPointToLine('SlowSma', {timestamp: candle.timestamp, price: currentFastSma})
    const slowSma = await sma(this.slowSmaSize, this.closeValues)
    const currentSlowSma = slowSma[slowSma.length - 1]
    this.plotter.addPointToLine('FastSma', {timestamp: candle.timestamp, price: currentSlowSma})

    // Test if to open/close position
    if (!this.openPosId && currentFastSma > currentSlowSma) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
    } else if (this.openPosId && (currentFastSma < currentSlowSma || this.trailingStop.shouldStop(candle.close))) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
      this.openPosId = 0
      this.trades += 1
    }
    /* 
    let fastSma
    let currentFastSma
    let previousFastSma
    this.closeValues.push(candle.close)
    if (this.closeValues.length >= this.fastSmaSize) {
      fastSma = await sma(this.fastSmaSize, this.closeValues)
      currentFastSma = fastSma[fastSma.length - 1]
      previousFastSma = fastSma[fastSma.length - 2]
      this.fastSmaLine.addPoint({timestamp: candle.timestamp, price: currentFastSma})
    }
    if (this.closeValues.length >= this.fastSmaSize) {
      const slowSma = await sma(this.fastSmaSize, this.closeValues)
      const currentSlowSma = slowSma[slowSma.length - 1]
      const previousSlowSma = slowSma[slowSma.length - 2]
      this.slowSmaLine.addPoint({timestamp: candle.timestamp, price: currentSlowSma})
      if (!this.openPosId &&  (previousSlowSma < currentSlowSma) && (previousFastSma < currentFastSma)) {
        this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      } else if (this.openPosId && ( currentFastSma <= previousFastSma || currentSlowSma <= previousSlowSma)) {
        // eslint-disable-next-line babel/no-unused-expressions
        // this.trailingStop.shouldStop(candle.close) && console.log('STOP LOSS at ', candle.close, new Date(candle.timestamp))
        this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
        this.openPosId = 0
        this.trades += 1
      }
    } */
  }
  
  async end (lastCandle) {
    const slowSma = await sma(50, this.closeValues)
    const fastSma = await sma(5, this.closeValues)
    // this.slowSmaLine.addPoint({timestamp: lastCandle.timestamp, price: slowSma[slowSma.length - 1]})
    // this.fastSmaLine.addPoint({timestamp: lastCandle.timestamp, price: fastSma[fastSma.length - 1]})
    if (this.openPosId) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: lastCandle.close, timestamp: lastCandle.timestamp})
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }
}
