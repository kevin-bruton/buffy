import {bbands, sma} from '../indicators/tulind.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

const twoDec = num => Math.round(num * 100) / 100
const formatDate = timestamp => String(new Date(timestamp)).substring(3, 21)

export class BbSmaStrategy {
  constructor(trader, defineLines) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.trader = trader
    // this.plotter = plotter
    this.smaSize = 120
    defineLines([
      {name: 'lowerBB', color: 'orange'},
      {name: 'middleBB', color: 'orange'},
      {name: 'upperBB', color: 'orange'},
      {name: 'SMA', color: 'blue'}
    ])

    this.priceBought = undefined
    // this.diffPercentForBuy = 0.01
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle, candles) {
    if (candles.length < this.smaSize) {
      return []
    }
    
    const smaValues = await sma(this.smaSize, candles)
    const bbValues = await bbands({period: 20, stddev: 2}, candles)
    const smaVal = smaValues[smaValues.length - 1]
    const lower = bbValues.lower[bbValues.lower.length - 1]
    const middle = bbValues.middle[bbValues.middle.length - 1]
    const upper = bbValues.upper[bbValues.upper.length - 1]
    
    const pointsToAddToLines = [
      {line: 'lowerBB', price: lower},
      {line: 'middleBB', price: middle},
      {line: 'upperBB', price: upper},
      {line: 'SMA', price: smaVal}
    ]

    // Test if to open/close position
    if (!this.openPosId && candle.close > smaVal && candle.close < (lower + (candle.close * 0.1 / 100))) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      this.priceBought = candle.close
    } else if (this.openPosId) {
      const priceDiff = candle.close - this.priceBought
      const priceDiffPerc = priceDiff / this.priceBought * 100
      if (candle.close > middle) {
        this.closePosition(candle)
        console.log('sold with price diff:', twoDec(priceDiff), 'Balance:', twoDec(this.trader.balance), formatDate(candle.timestamp))
      } else if (priceDiffPerc < -0.25) {
        this.closePosition(candle)
        console.log('STOP LOSS. %LOSS:', twoDec(priceDiffPerc), 'sold with price diff:', twoDec(priceDiff), 'Balance:', twoDec(this.trader.balance), formatDate(candle.timestamp))
      }
    }
    return pointsToAddToLines
  }
  
  async onEnd (candle) {
    if (this.openPosId) {
      this.closePosition(candle)
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.trader.balance * 100) / 100)
  }

  closePosition(candle) {
    this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
    this.openPosId = 0
    this.trades += 1
  }
}
