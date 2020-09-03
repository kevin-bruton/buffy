import {bbands, sma} from '../indicators/tulind.mjs'
import {LinePlot} from '../plotter/lines.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

const twoDec = num => Math.round(num * 100) / 100
const formatDate = timestamp => String(new Date(timestamp)).substring(3, 21)

export class BbSmaStrategy {
  constructor(initialBalance, trader) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.balance = initialBalance
    this.trader = trader
    this.smaSize = 120
    this.lowerBand = new LinePlot({name: 'lower', color: 'orange', strategy: this})
    this.middleBand = new LinePlot({name: 'middle', color: 'orange', strategy: this})
    this.upperBand = new LinePlot({name: 'upper', color: 'orange', strategy: this})
    this.smaLine = new LinePlot({name: 'SMA', color: 'blue', strategy: this})
    this.priceBought = undefined
    // this.diffPercentForBuy = 0.01
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.smaSize) {
      return
    }
    
    const smaValues = await sma(this.smaSize, this.closeValues)
    const bbValues = await bbands({period: 20, stddev: 2}, this.closeValues)
    const smaVal = smaValues[smaValues.length - 1]
    const lower = bbValues.lower[bbValues.lower.length - 1]
    const middle = bbValues.middle[bbValues.middle.length - 1]
    const upper = bbValues.upper[bbValues.upper.length - 1]
    
    this.smaLine.addPoint({timestamp: candle.timestamp, price: smaVal})
    this.lowerBand.addPoint({timestamp: candle.timestamp, price: lower})
    this.middleBand.addPoint({timestamp: candle.timestamp, price: middle})
    this.upperBand.addPoint({timestamp: candle.timestamp, price: upper})

    // Test if to open/close position
    if (!this.openPosId && candle.close > smaVal && candle.close < (lower + (candle.close * 0.1 / 100))) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      this.priceBought = candle.close
    } else if (this.openPosId) {
      const priceDiff = candle.close - this.priceBought
      const priceDiffPerc = priceDiff / this.priceBought * 100
      if (candle.close > middle) {
        this.closePosition(candle)
        console.log('sold with price diff:', twoDec(priceDiff), 'Balance:', twoDec(this.balance), formatDate(candle.timestamp))
      } else if (priceDiffPerc < -0.25) {
        this.closePosition(candle)
        console.log('STOP LOSS. %LOSS:', twoDec(priceDiffPerc), 'sold with price diff:', twoDec(priceDiff), 'Balance:', twoDec(this.balance), formatDate(candle.timestamp))
      }
    }
  }
  
  async end (candle) {
    if (this.openPosId) {
      this.closePosition(candle)
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }

  getLinesToPlot() {
    return [
      this.smaLine.getLine(),
      this.lowerBand.getLine(),
      this.middleBand.getLine(),
      this.upperBand.getLine()
    ]
  }

  closePosition(candle) {
    this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
    this.openPosId = 0
    this.trades += 1
  }
}
