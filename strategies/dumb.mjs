export default (() => {
  let value = 0
  return {
    init: () => {
      console.log('run init')
      value = 1
    },
    onTick: candle => {
      console.log('tick with candle', candle.timeDate)
    },
    end: () => {
      console.log('finish', value)
    }
  }
})()
