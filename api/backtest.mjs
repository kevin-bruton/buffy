import express from 'express'
import {backTestRunner} from '../backtest/runner.mjs'

const router = express.Router()

router.post('/run', async (req, res) => {
  const {provider, symbol, interval, from, to, strategy, quantity, quantityType, initialBalance} = req.body
  try {
    if (!provider || !symbol || !interval || !from || !to || !strategy || !quantity || !quantityType || !initialBalance) {
      throw new Error('One of the necessary parameters were not provided')
    }
    const backTestResults = await backTestRunner({provider, symbol, interval, from, to, strategy, quantity, quantityType, initialBalance})
    res.json({...{runStatus: 'done'}, ...backTestResults})
  } catch(error) {
    console.error(error)
    res.json({error: 'Error trying to run back test'})
  }
})

export default router
