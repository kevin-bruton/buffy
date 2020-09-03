import {ema} from '../indicators/tulind.mjs'
import {LinePlot} from '../plotter/lines.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

const tendencyMeasure = 0.3
const upTendency = (tPct1, tPct2, tPct3) => /* tPct1 > tendencyMeasure &&  */tPct2 > tendencyMeasure && tPct3 > tendencyMeasure

export class ThreeEmaStrategy {
  constructor(initialBalance, trader) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.initialBalance = initialBalance
    this.balance = initialBalance
    this.trader = trader
    this.sEmaSize = 50
    this.mEmaSize = 100
    this.lEmaSize = 150
    this.sEmaLine = new LinePlot({name: 'S EMA', color: 'orange', strategy: this})
    this.mEmaLine = new LinePlot({name: 'M EMA', color: 'blue', strategy: this})
    this.lEmaLine = new LinePlot({name: 'L EMA', color: 'red', strategy: this})
    this.emasUpTendency = false
    this.readyToBuy = false
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.lEmaSize) {
      return
    }
    
    const sEmaValues = await ema(this.sEmaSize, this.closeValues)
    const mEmaValues = await ema(this.mEmaSize, this.closeValues)
    const lEmaValues = await ema(this.lEmaSize, this.closeValues)
    const sCurrentEma = await sEmaValues[sEmaValues.length - 1]
    const mCurrentEma = await mEmaValues[mEmaValues.length - 1]
    const lCurrentEma = await lEmaValues[lEmaValues.length - 1]
    this.sEmaLine.addPoint({timestamp: candle.timestamp, price: sCurrentEma})
    this.mEmaLine.addPoint({timestamp: candle.timestamp, price: mCurrentEma})
    this.lEmaLine.addPoint({timestamp: candle.timestamp, price: lCurrentEma})

    const sEmaTendencyPercent = Math.round((sEmaValues[sEmaValues.length - 5] - sCurrentEma) / sEmaValues[sEmaValues.length - 5] * 10000) / 100
    const mEmaTendencyPercent = Math.round((sEmaValues[mEmaValues.length - 5] - mCurrentEma) / sEmaValues[mEmaValues.length - 5] * 10000) / 100
    const lEmaTendencyPercent = Math.round((sEmaValues[lEmaValues.length - 5] - lCurrentEma) / sEmaValues[lEmaValues.length - 5] * 10000) / 100

    // Test if to open/close position
    if (this.readyToBuy && this.emasUpTendency && candle.close > sCurrentEma) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      this.readyToBuy = false
    } else if (!this.openPosId && this.emasUpTendency && candle.close < sCurrentEma) {
      this.readyToBuy = true
      console.log('Ready to buy. mEma%:', mEmaTendencyPercent, 'lEma%:', lEmaTendencyPercent)
    } else if (this.openPosId && candle.close < sCurrentEma) {
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
      console.log('Close position. Balance:', this.balance, new Date(candle.timestamp))
      this.openPosId = 0
      this.trades += 1
    }
    /* if (!this.openPosId && currentRsi < 30 && priceEmaTendencyUp && emaLineTendencyUp) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
    } else if (this.openPosId) {
      const openPosPrice = this.trader.getPositionById(this.openPosId).price
      const priceDiffPercent = (candle.close - openPosPrice) / openPosPrice * 100
      if (priceDiffPercent > 2 && !emaLineTendencyUp) { // Take profit
        console.log('tp:', (candle.close - openPosPrice))
        this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
        this.openPosId = 0
        this.trades += 1
      }
      if (priceDiffPercent < -2 && currentRsi > 40 && !emaLineTendencyUp && !priceEmaTendencyUp) { // Stop loss
        console.log('sl:', (candle.close - openPosPrice))
        this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
        this.openPosId = 0
        this.trades += 1
      }
    } */
    this.emasUpTendency = upTendency(sEmaTendencyPercent, mEmaTendencyPercent, lEmaTendencyPercent)
  }
  
  async end(candle) {
    /* const emaValues = await ema(50, this.closeValues)
    const currentEma = emaValues[emaValues.length - 1]
    this.emaLine.addPoint({timestamp: candle.timestamp, price: currentEma})*/
    if (this.openPosId) {
      const openPosPrice = this.trader.getPositionById(this.openPosId).price
      this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
      console.log('final close:', (candle.close - openPosPrice))
      this.trades += 1
    }
    const finalBalance = Math.round(this.balance * 100) / 100
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', finalBalance,
    `Profit: ${Math.round((finalBalance - this.initialBalance) * 10000 / this.initialBalance) / 100}%`)
  }

  getLinesToPlot() {
    return [
      this.sEmaLine.getLine(),
      this.mEmaLine.getLine(),
      this.lEmaLine.getLine()
    ]
  }
}
