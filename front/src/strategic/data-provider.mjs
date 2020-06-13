export default (() => {
  const baseUrl = 'http://localhost:3000/api/'
  return {
    getCandles: async ({provider, symbol, interval, from, to}) => {
      const candleUrl = `${baseUrl}candles/${provider}/${symbol}/${interval}/${from}/${to}`
      const resp = await fetch(candleUrl)
      return resp.json()
    }
  }
})()
