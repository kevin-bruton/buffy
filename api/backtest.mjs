import express from 'express'
import {backTestRunner} from '../backtest/runner.mjs'

const router = express.Router()

router.post('/run', async (req, res) => {
  const {provider, symbol, interval, from, to, strategy, quantity, initialBalance} = req.body
  try {
    if (!provider || !symbol || !interval || !from || !to || !strategy || !quantity|| !initialBalance) {
      throw new Error('One of the necessary parameters were not provided')
    }
    const backTestId = await backTestRunner({provider, symbol, interval, from, to, strategy, quantity, initialBalance})
    res.json({runStatus: 'done', backTestId})
  } catch(error) {  
    res.json({error})
  }
})

export default router
