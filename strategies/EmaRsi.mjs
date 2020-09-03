import {rsi, ema} from '../indicators/tulind.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

export class EmaRsiStrategy {
  constructor(initialBalance, trader, plotter) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.balance = initialBalance
    this.trader = trader
    this.emaSize = 300
    this.rsiSize = 14
    this.plotter = plotter
    this.plotter.addLine('EMA', 'blue')
    this.priceBought = undefined
    // this.diffPercentForBuy = 0.01
    // this.trailingStop = new TrailingLongStop({priceMargin: 50})
    console.log('Strategy init')
  }

  async onTick (candle) {
    this.closeValues.push(candle.close)
    if (this.closeValues.length < this.emaSize) {
      return
    }
    
    const emaValues = await ema(this.emaSize, this.closeValues)
    const rsiValues = await rsi(this.rsiSize, this.closeValues)
    const currentEma = emaValues[emaValues.length - 1]
    const currentRsi = rsiValues[rsiValues.length - 1]
    // const hmaDiffPercent = (currentHma - hmaValues[hmaValues.length - 2]) * 100 / candle.close
    this.plotter.addPointToLine('EMA', {timestamp: candle.timestamp, price: currentEma})

    // Test if to open/close position
    // !this.openPosId && candle.close > currentEma && console.log('ready to buy. Rsi:', currentRsi, 'ema:', currentEma, 'price:', candle.close)
    // console.log(currentEma)
    if (!this.openPosId && candle.close < currentEma && currentEma > emaValues[emaValues.length - 6] && currentRsi < 30) {
      this.openPosId = this.trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
      this.priceBought = candle.close
    } else if (this.openPosId) {
      const priceDiff = candle.close - this.priceBought
      const sl = -200
      const tp = 200
      if (priceDiff > tp) {
        this.closePosition(candle)
        console.log('sold tp with price diff:', priceDiff, 'Balance:', this.balance, new Date(candle.timestamp))
      } else if (priceDiff < sl) {
        this.closePosition(candle)
        console.log('sold sl with price diff:', priceDiff, 'Balance:', this.balance, new Date(candle.timestamp))
      }
    }
  }
  
  async end (candle) {
    if (this.openPosId) {
      this.closePosition(candle)
    }
    console.log('Strategy finished.\nClosed', this.trades, 'positions\nFinal Balance:', Math.round(this.balance * 100) / 100)
  }

  closePosition(candle) {
    this.balance = this.trader.closePosition({positionId: this.openPosId, price: candle.close, timestamp: candle.timestamp})
    this.openPosId = 0
    this.trades += 1
  }
}
