// import {importCandles} from '../providers/bitfinex/index.mjs'
// 
// importCandles({startDate: '2020-01-01', endDate: '2020-06-27  ', symbol: 'BTCUSD'})

import {importCandles} from '../providers/ig/import.mjs'

importCandles({startDate: '2020-08-01', endDate: (new Date('2020-09-01').valueOf()) - 1, symbol: 'CS.D.EURUSD.MINI.IP'})

