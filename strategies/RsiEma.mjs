import {rsi, ema} from '../indicators/tulind.mjs'
// import {TrailingLongStop} from '../indicators/custom.mjs'

export class RsiEmaStrategy {
  constructor(initialBalance, trader, plotter) {
    this.closeValues = []
    this.trades = 0
    this.openPosId = 0
    this.initialBalance = initialBalance
    this.balance = initialBalance
    this.trader = trader
    this.rsiSize = 14
    this.emaSize = 300
    this.plotter = plotter
    this.plotter.addLine('EMA', 'blue')
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
    const currentEma = await emaValues[emaValues.length - 1]
    const currentRsi = await rsiValues[rsiValues.length - 1]
    // console.log('rsi:', currentRsi, 'ema:', currentEma, 'price:', candle.close)
    // const emaDiffPercent = (currentEma - emaValues[emaValues.length - 2]) * 100 / candle.close
    this.plotter.addPointToLine('EMA', {timestamp: candle.timestamp, price: currentEma})
    const emaLineTendencyUp = (emaValues[emaValues.length - 5] < currentEma)
    const priceEmaTendencyUp = (candle.close > currentEma)

    // Test if to open/close position
    if (!this.openPosId && currentRsi < 30 && priceEmaTendencyUp && emaLineTendencyUp) {
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
    }
  }
  
  async end(candle) {
    const emaValues = await ema(50, this.closeValues)
    const currentEma = emaValues[emaValues.length - 1]
    this.plotter.addPointToLine('EMA', {timestamp: candle.timestamp, price: currentEma})
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
}
