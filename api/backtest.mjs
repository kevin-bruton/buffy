import express from 'express'
import {backTestRunner} from '../backtest/runner.mjs'
import {socketSend} from '../socket/index.mjs'

const router = express.Router()

router.post('/run', async (req, res) => {
  const {provider, symbol, interval, from, to, strategy, quantity, quantityType, initialBalance} = req.body
  try {
    if (!provider || !symbol || !interval || !from || !to || !strategy || !quantity || !quantityType || !initialBalance) {
      throw new Error('One of the necessary parameters were not provided')
    }
    const fromTimestamp = new Date((Number.isNaN(Number(from)) ? from : Number(from))).valueOf()
    const toTimestamp = new Date((Number.isNaN(Number(to)) ? to : Number(to))).valueOf()
    const progressListener = async  ({candle, pointsToAddToLines, trades, balance, end}) => {
      await socketSend('BACKTEST_PROGRESS', {candle, lines: pointsToAddToLines, trades, balance, end})
    }
    backTestRunner(
        {provider, symbol, interval, fromTimestamp, toTimestamp, strategy, quantity: Number(quantity), quantityType, initialBalance: Number(initialBalance)},
        progressListener
      )
    res.json({runStatus: 'started'})
  } catch(error) {
    console.error(error)
    res.json({error: 'Error trying to run back test'})
  }
})

export default router
