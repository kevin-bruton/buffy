export default (() => {
  const baseUrl = 'http://localhost:3000/api/'
  return {
    getCandles: async ({provider, symbol, interval, from, to}) => {
      const candleUrl = `${baseUrl}candles/${provider}/${symbol}/${interval}/${from}/${to}`
      const resp = await fetch(candleUrl)
      return resp.json()
    },
    getTrades: async backTestId => {
      const tradesUrl = `${baseUrl}trades/${backTestId}`
      const resp = await fetch(tradesUrl)
      return resp.json()
    },
    getPlotterLines: async backTestId => {
      const linesUrl = `${baseUrl}plotter/lines/${backTestId}`
      const resp = await fetch(linesUrl)
      return resp.json()
    },
    runBackTest: async testDef => {
      console.log('testDef', testDef)
      const runBackTestUrl = `${baseUrl}backtest/run`
      const options = {
        method: 'POST',
        body: JSON.stringify(testDef),
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const resp = await fetch(runBackTestUrl, options)
      return resp.json()
    }
  }
})()
