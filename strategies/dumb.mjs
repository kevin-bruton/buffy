import util from 'util'
import {sma} from '../indicators/tulind.mjs'

export default (() => {
  let value = 0
  let closeValues = []
  return {
    init: () => {
      console.log('run init')
      value = 1
    },
    onTick: async candle => {
      closeValues.push(candle.close)
      // console.log('tick with candle', candle.timeDate)
      const smaResult = await sma(3, closeValues)
      console.log(smaResult[smaResult.length - 1])
    },
    end: lastCandle => {
      console.log('finish', value)
    }
  }
})()
