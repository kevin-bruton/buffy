import {importHistoricData} from '../providers/bitfinex/index.mjs'

const importSelection = {
  startDate: '2020-05-02',
  endDate: '2020-05-03',
  candleSize: '15m',
  symbol: 'BTCEUR'
}
importHistoricData(importSelection)
