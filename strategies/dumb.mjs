import {sma} from '../indicators/tulind.mjs'
import trader from '../trader/index.mjs'

let closeValues
let counter
let trades
let openPosId
let balance
const resetVars = () => {
  closeValues = []
  counter = 0
  trades = 0
  openPosId = 0
  balance = 0
}
export default {
    init: async () => {
      console.log('run init')
      resetVars()
    },
    onTick: async candle => {
      closeValues.push(candle.close)
      // console.log('tick with candle', candle.timeDate)
      const smaResult = await sma(3, closeValues)
      // console.log(smaResult[smaResult.length - 1])
      if (counter % 10 === 0) {
        if (!openPosId) {
          openPosId = trader.openPosition({action: 'buy', price: candle.close, timestamp: candle.timestamp})
        } else {
          balance = trader.closePosition({positionId: openPosId, price: candle.close, timestamp: candle.timestamp})
          openPosId = 0
          trades += 1
        }
      }
      counter += 1
    },
    end: async lastCandle => {
      if (openPosId) {
        balance = trader.closePosition(openPosId, lastCandle.close)
      }
      console.log('Strategy finished.\nClosed', trades, 'positions\nFinal Balance:', Math.round(balance * 100) / 100)
      resetVars()
    }
  }
