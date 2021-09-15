import express from 'express'
import {getAvailableCandles, getIntervalCandles} from '../db/candles.mjs'

const router = express.Router()

router.get('/:provider/:symbol/:candlesize/:start/:end', (req, res) => {
  const {provider, symbol, candlesize, start, end} = req.params

  // Check if date range exists for that provider/symbol
  // if not, return a message indicating that the data must be imported first
  const availableCandleRange = getAvailableCandles(provider, symbol)
  if (start < availableCandleRange.start || end > availableCandleRange.end) {
    res.json({
      error: {
        message: 'Data not available for that date range. Must first be imported',
        code: 'dataNotAvailable'
    }})
    return
  }

  // if date range exists, retrieve it from db and return it
  try {
    if (!provider || !symbol || !candlesize || !start || !end) {
      throw new Error()
    }
    const candles = getIntervalCandles(provider, symbol, start, end, candlesize)
    res.json(candles)
  } catch(error) {  
    res.json({error})
  }
})

export default router
