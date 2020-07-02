export {
  createIntervalCandles
}

// create new candles with specified candle size, using 1m candles
function createIntervalCandles(oneMinCandles, candleSizeInMinutes) {
	return oneMinCandles.reduce((intervalCandles, oneMinCandle) => {
    const noIntervalCandles = !intervalCandles.length
    if (noIntervalCandles) {
      return [oneMinCandle]
    }
    const lastIntervalCandle = intervalCandles[intervalCandles.length - 1]
    const intervalCandleTimeLimit = oneMinCandles[0].timestamp
      + candleSizeInMinutes * 60 * 1000 * intervalCandles.length
    const isIntervalCandleComplete = oneMinCandle.timestamp >= intervalCandleTimeLimit
    if (!isIntervalCandleComplete) {
      lastIntervalCandle.low = oneMinCandle.low < lastIntervalCandle.low ? oneMinCandle.low : lastIntervalCandle.low
      lastIntervalCandle.high = oneMinCandle.high > lastIntervalCandle.high ? oneMinCandle.high : lastIntervalCandle.high
      lastIntervalCandle.volume += oneMinCandle.volume
      lastIntervalCandle.close = oneMinCandle.close
      const updatedIntervalCandles = intervalCandles.slice(0, intervalCandles.length - 1).concat([lastIntervalCandle])
      return updatedIntervalCandles
    }
    // if intervalCandle is complete, create a new intervalCandle and add the 1m candle to it
    const updatedIntervalCandles = intervalCandles.concat([oneMinCandle])
    return updatedIntervalCandles
	}, [])
}
