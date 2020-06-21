import {sma} from '../indicators/tulind.mjs'
import trader from '../trader/index.mjs'
import {LinePlot} from '../plotter/lines.mjs'

let closeValues
let counter
let trades
let openPosId
let balance
let slowSmaPlots
let fastSmaPlots
const resetVars = () => {
  closeValues = []
  counter = 0
  trades = 0
  openPosId = 0
  balance = 0
  slowSmaPlots = null
  fastSmaPlots = null
}
export default {
    async init () {
      console.log('Strategy init')
      resetVars()
      slowSmaPlots = new LinePlot({name: 'SlowSma', color: 'blue', strategy: this})
      fastSmaPlots = new LinePlot({name: 'FastSma', color: 'orange', strategy: this})
    },
    async onTick (candle) {
      closeValues.push(candle.close)
      // console.log('tick with candle', candle.timeDate)
      if (closeValues.length >= 5) {
        const fastSma = await sma(5, closeValues)
        fastSmaPlots.addPoint({timestamp: candle.timestamp, price: fastSma[fastSma.length - 1]})
      }
      if (closeValues.length >= 50) {
        const slowSma = await sma(50, closeValues)
        slowSmaPlots.addPoint({timestamp: candle.timestamp, price: slowSma[slowSma.length - 1]})
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
      console.log(this)
      slowSmaPlots.save()
      fastSmaPlots.save()
      if (openPosId) {
        balance = trader.closePosition(openPosId, lastCandle.close)
      }
      console.log('Strategy finished.\nClosed', trades, 'positions\nFinal Balance:', Math.round(balance * 100) / 100)
      resetVars()
    }
  }
