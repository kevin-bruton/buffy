import {sma} from '../indicators/tulind.mjs'
import trader from '../trader/index.mjs'
import {LinePlot} from '../plotter/lines.mjs'
import {TrailingLongStop} from '../indicators/custom.mjs'

let closeValues
let counter
let trades
let openPosId
let balance
let slowSmaPlots
let fastSmaPlots
let trailingStop
const resetVars = () => {
  closeValues = []
  counter = 0
  trades = 0
  openPosId = 0
  balance = 0
  slowSmaPlots = null
  fastSmaPlots = null
  trailingStop = null
}
export default {
    async init (initialBalance) {
      balance = initialBalance
      console.log('Strategy init')
      resetVars()
      slowSmaPlots = new LinePlot({name: 'SlowSma', color: 'blue', strategy: this})
      fastSmaPlots = new LinePlot({name: 'FastSma', color: 'orange', strategy: this})
      trailingStop = new TrailingLongStop({priceMargin: 80})
    },
    async onTick (candle) {
      let currentFastSma
      closeValues.push(candle.close)
      if (closeValues.length >= 5) {
        const fastSma = await sma(5, closeValues)
        currentFastSma = fastSma[fastSma.length - 1]
        fastSmaPlots.addPoint({timestamp: candle.timestamp, price: currentFastSma})
      }
      if (closeValues.length >= 50) {
        const slowSma = await sma(50, closeValues)
        const currentSlowSma = slowSma[slowSma.length - 1]
        slowSmaPlots.addPoint({timestamp: candle.timestamp, price: currentSlowSma})
        if (!openPosId && currentFastSma > currentSlowSma) {
          openPosId = trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
          console.log('buy:', openPosId)
        }
        if (openPosId && (currentFastSma < currentSlowSma || trailingStop.shouldStop(candle.close))) {
          balance = trader.closePosition({positionId: openPosId, price: candle.close, timestamp: candle.timestamp})
          console.log('sell:', openPosId)
          openPosId = 0
          trades += 1
        }
      }
      // console.log(smaResult[smaResult.length - 1])
      /* if (counter % 10 === 0) {
        if (!openPosId) {
          openPosId = trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
        } else {
          balance = trader.closePosition({positionId: openPosId, price: candle.close, timestamp: candle.timestamp})
          openPosId = 0
          trades += 1
        }
      }
      counter += 1 */
    },
    async end (lastCandle) {
      const slowSma = await sma(50, closeValues)
      const fastSma = await sma(5, closeValues)
      slowSmaPlots.addPoint({timestamp: lastCandle.timestamp, price: slowSma[slowSma.length - 1]})
      fastSmaPlots.addPoint({timestamp: lastCandle.timestamp, price: fastSma[fastSma.length - 1]})
      console.log('end of follow strategy')
      slowSmaPlots.save()
      fastSmaPlots.save()
      if (openPosId) {
        balance = trader.closePosition({positionId: openPosId, price: lastCandle.close, timestamp: lastCandle.timestamp})
        console.log('sell:', openPosId)
      }
      console.log('Strategy finished.\nClosed', trades, 'positions\nFinal Balance:', Math.round(balance * 100) / 100)
      resetVars()
    }
  }
