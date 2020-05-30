export default (function() {
  return {
    init: () => {
      console.log('run init')
      // this.data = 'hi'
    },
    onTick: (candle) => {
      // console.log('tick with candle', candle.timeDate)
    },
    end: () => {
      console.log('finish')
      // console.log(this)
    }
  }
})()
