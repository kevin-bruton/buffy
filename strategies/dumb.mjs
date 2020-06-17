import {sma} from '../indicators/tulind.mjs'
import trader from '../trader/index.mjs'

export default (() => {
  const closeValues = []
  let counter = 0
  let trades = 0
  let openPosId = 0
  let balance = 0
  return {
    init: async () => {
      console.log('run init')
    },
    onTick: async candle => {
      closeValues.push(candle.close)
      // console.log('tick with candle', candle.timeDate)
      const smaResult = await sma(3, closeValues)
      // console.log(smaResult[smaResult.length - 1])
      if (counter % 10 === 0) {
        if (!openPosId) {
          openPosId = trader.openPosition({action: 'buy', price: candle.close})
        } else {
          balance = trader.closePosition(openPosId, candle.close)
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
    }
  }
})()
