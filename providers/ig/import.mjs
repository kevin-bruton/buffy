import IG from './ig.mjs'
import {saveCandles} from '../../db/candles.mjs'

export default async function importCandles({startDate, endDate, symbol}) {
  // const rateLimiter = () => new Promise(resolve => setTimeout(() => resolve(), 2001))
  const dayInMillis = 1000 * 60 * 60 * 24
  const startTimestamp = (new Date(startDate)).valueOf()
  const endTimestamp = (new Date(endDate)).valueOf()
  let candles = []
  for (let start = startTimestamp; start < endTimestamp; start += dayInMillis) {
    // eslint-disable-next-line no-await-in-loop
    const newCandles = await getCandlesForDay({startDate: start, symbol})
    candles = candles.concat(newCandles)
    // eslint-disable-next-line no-await-in-loop
    // await rateLimiter()
  }

  saveCandles('ig', symbol, candles)
}
/* 
async function importCandles({startDate, endDate, symbol}) {
  const candleSize = '1m'
  const rateLimiter = () => new Promise(resolve => setTimeout(() => resolve(), 2001))
  const dayInMillis = 1000 * 60 * 60 * 24
  const startTimestamp = (new Date(startDate)).valueOf()
  const endTimestamp = (new Date(endDate)).valueOf()
  let candles = []
  for (let start = startTimestamp; start < endTimestamp; start += dayInMillis) {
    // eslint-disable-next-line no-await-in-loop
    const newCandles = await getCandlesForDay({startDate: start, endDate: (start + dayInMillis - 1), candleSize, symbol})
    candles = candles.concat(newCandles)
    // eslint-disable-next-line no-await-in-loop
    await rateLimiter()
  }

  saveCandles('bitfinex', symbol, candles)
} */

async function getCandlesForDay({startDate, symbol}) {
  const ig = new IG({isDemo: true})
  await ig.login()
  const data = await ig.dayOf1mCandles(symbol, startDate);
  return data
}


/* async function importHistoricData({startDate, endDate, candleSize, symbol}) {
  const startTimestamp = (new Date(startDate)).valueOf()
  const endTimestamp = (new Date(endDate)).valueOf()
  
  const pathParams = `candles/trade:${candleSize}:t${symbol}/hist` // Change these based on relevant path params listed in the docs
  // const queryParams = `?${new URLSearchParams(`limit=120&start=${startTimestamp}&end=${endTimestamp}&sort=1`)}` // Change these based on relevant query params listed in the docs
  // @ts-ignore
  const queryParams = `?${new URLSearchParams({
    limit: 10000,
    start: startTimestamp,
    end: endTimestamp,
    sort:1
  })}`
  
  const resp = await pubRequest({pathParams, queryParams})

  const data = resp.map(candle => ({
    timestamp: candle[0],
    timeDate: (new Date(candle[0])).toLocaleString('es'),
    open: candle[1],
    close: candle[2],
    high: candle[3],
    low: candle[4],
    volume: candle[5]
  }))
  return data
} */

/* importCandles({
  startDate: new Date('2020-07-01').valueOf(), 
  endDate: new Date('2020-08-01').valueOf(),
  symbol: 'CS.D.EURUSD.MINI.IP'
}) */
(async () => {
  /* const candles = await getCandlesForDay({
    startDate: new Date('2020-07-01').valueOf(),
    symbol: 'CS.D.EURUSD.MINI.IP'
  }) */
  await importCandles({
    startDate: (new Date('2020-07-31')).valueOf(),
    endDate: (new Date('2020-08-01')).valueOf(),
    symbol: 'CS.D.EURUSD.MINI.IP'
  })
  console.log('DONE!')
})()