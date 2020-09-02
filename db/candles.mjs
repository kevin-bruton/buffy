import {dbOpen, dbGet, dbAll, dbRun, dbClose} from './db.mjs'
import {createIntervalCandles} from './intervalCandles.mjs'

export {
  getAvailableCandles,
  getCandles,
  saveCandles
}

function getAvailableCandles(provider, symbol) {
  const db = dbOpen()
  const result = dbGet(db, `SELECT min(timestamp), max(timestamp) FROM ${provider}_${symbol}_candles;`)
  dbClose(db)
  return {start: result['min(timestamp)'], end: result['max(timestamp)']}
}

function getCandles(provider, symbol, start, end, candleSize) {
  const db = dbOpen()
  const sql = 'SELECT timestamp, timeDate, open, close, high, low, volume '
    + `FROM ${provider}_${symbol}_candles WHERE timestamp BETWEEN ${new Date(start).valueOf()} AND ${(new Date(end).valueOf()) - 1};`
  const candles1m = dbAll(db, sql)
  
  // Make new candles with the specified candleSize
  const candleSizeInMinutes = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '3h': 3 * 60,
    '6h': 6 * 60,
    '12h': 12 * 60,
    '1D': 24 * 60,
    '7D': 7 * 24 * 60,
    '14D': 14 * 24 * 60
  }[candleSize]
  return createIntervalCandles(candles1m, candleSizeInMinutes)
}

function saveCandles(provider, symbol, candles) {
  const tableName = `${provider}_${symbol}_candles`.replace(/\./g, '')
  const db = dbOpen()
  
  dbRun(db, `CREATE TABLE IF NOT EXISTS ${tableName}_candles (`
    + 'timestamp INTEGER PRIMARY KEY,'
    + 'timeDate TEXT NOT NULL,'
    + 'open REAL NOT NULL,'
    + 'close REAL NOT NULL,'
    + 'high REAL NOT NULL,'
    + 'low REAL NOT NULL,'
    + 'volume REAL NOT NULL'
  + ')')

  const values = candles.reduce((acc, cur) => {
    return `${acc},(${cur.timestamp},'${cur.timeDate}','${cur.open}','${cur.close}','${cur.high}','${cur.low}',${cur.volume})`
  }, '').substring(1)
  
  dbRun(db, `INSERT INTO ${tableName}_candles(timestamp, timeDate, open, close, high, low, volume) VALUES ${values}`)
  dbClose(db)
}

/* 
function createIntervalCandlesOld(candles1m, candleSizeInMinutes) {

  // Separate candles1m into arrays with the length of the number of minutes
  const groupedCandles = candles1m
    .reduce((groups, candle1m) => {
      const areGroupsEmpty = !groups.length
      if (areGroupsEmpty) {
        const group = [candle1m]
        return [group]
      }
      const lastGroup = groups[groups.length - 1]
      // console.log('lastCandle of last group:', JSON.stringify(lastGroup[lastGroup.length - 1]))
      const isGroupFull = !(candle1m.timestamp < candles1m[0].timestamp
        + candleSizeInMinutes * 60 * 1000 * groups.length)
      // console.log('test:', new Date(lastGroup[lastGroup.length - 1].timestamp), 'limit:', new Date(candles1m[0].timestamp + candleSizeInMinutes * 60 * 1000 * groups.length), 'full:', isGroupFull)
      if (!isGroupFull) { // add candle to last group
        const updatedLastGroup = lastGroup.concat([candle1m])
        const updatedGroups = groups.slice(0, groups.length - 1).concat([updatedLastGroup])
        return updatedGroups
      }
      // if group is full, create new group and add the candle to it
      const newGroup = [candle1m]
      const updatedGroups = groups.concat([newGroup])
      return updatedGroups
    }, [])
    
  const newCandles = groupedCandles
    .map(group => {
      return group
        .reduce((candle, candle1m, i) => {
          const newCandle = {...candle}
          const isFirst1mCandleInGroup = i === 0
          const isLast1mCandleInGroup = i === group.length - 1
          if (isFirst1mCandleInGroup) {
            newCandle.timeDate = candle1m.timeDate
            newCandle.timestamp = candle1m.timestamp
            newCandle.open = candle1m.open
            newCandle.low = candle1m.low
            newCandle.high = candle1m.high
            newCandle.volume = candle1m.volume
          }
          if (isLast1mCandleInGroup) {
            newCandle.close = candle1m.close
            newCandle.low = candle1m.low < newCandle.low ? candle1m.low : newCandle.low
            newCandle.high = candle1m.high > newCandle.high ? candle1m.high : newCandle.high
            newCandle.volume += candle1m.volume
            newCandle.test = 'endCandle'
          }
          if (!isFirst1mCandleInGroup && !isLast1mCandleInGroup) {
            newCandle.low = candle1m.low < newCandle.low ? candle1m.low : newCandle.low
            newCandle.high = candle1m.high > newCandle.high ? candle1m.high : newCandle.high
            newCandle.volume += candle1m.volume
            newCandle.test = 'middleCandle'
          }
          return newCandle
        }, {})
    })
    return newCandles
} */