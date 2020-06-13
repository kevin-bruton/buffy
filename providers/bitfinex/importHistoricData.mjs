import fs from 'fs'
import path from 'path'
import {pubRequest} from './pubRequest.mjs'

export { importHistoricData }

/**
 * Import Historic Data
 * @typedef ImportSelection
 * @propery {string} startDate - String accepted by JS's Date contsrutor
 * @propery {string} endDate - String accepted by JS's Date contsrutor
 * @propery {string} candleSize - Eg. '15m'
 * @propery {string} symbol - Eg. BTCEUR
 * 
 * @params {ImportSelection} importSelection
 */
async function importHistoricData({startDate, endDate, candleSize, symbol}) {
  const timeRangeDesc = `${symbol}_${candleSize}_${startDate}_${endDate}`
  const startTimestamp = (new Date(startDate)).valueOf()
  const endTimestamp = (new Date(endDate)).valueOf()
  
  const pathParams = `candles/trade:${candleSize}:t${symbol}/hist` // Change these based on relevant path params listed in the docs
  // const queryParams = `?${new URLSearchParams(`limit=120&start=${startTimestamp}&end=${endTimestamp}&sort=1`)}` // Change these based on relevant query params listed in the docs
  // @ts-ignore
  const queryParams = `?${new URLSearchParams({
    limit: 120,
    start: startTimestamp,
    end: endTimestamp,
    sort:1
  })}`
  
  const resp = await pubRequest({pathParams, queryParams})
  const filepath = path.join(path.resolve(), 'data', 'bfx', `${timeRangeDesc}.json`)
  const data = resp.map(candle => ({
    timestamp: candle[0],
    timeDate: (new Date(candle[0])).toLocaleString('es'),
    open: candle[1],
    close: candle[2],
    high: candle[3],
    low: candle[4],
    volume: candle[5]
  }))
  console.log('Data length retrieved:', data.length)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
  // console.log(resp)
}