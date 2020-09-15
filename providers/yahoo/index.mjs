import path from 'path'
import {csvToJs} from '../../utils/index.mjs'
import {saveCandles} from '../../db/candles.mjs'

export {
  importFromCsv
}

const PROVIDER = 'yahoo'

function importFromCsv(filepath, symbol) {
  const data = csvToJs(filepath, ',')
  const candles = data
    .filter(raw => !Number.isNaN(raw.Open))
    .map(raw => ({
      timestamp: new Date(raw.Date).valueOf(),
      timeDate: new Date(raw.Date).toLocaleString('es'),
      open: Number(raw.Low),
      close: Number(raw.Close),
      high: Number(raw.High),
      low: Number(raw.Low),
      volume: Number(raw.Volume)
    }))
  saveCandles(PROVIDER, symbol, candles)
}

const filepath = path.join(path.resolve(), 'data', 'yahoo-EURUSD.csv')
importFromCsv(filepath, 'EURUSD')