import express from 'express'
import candles from './candles.mjs'
import importdata from './importdata.mjs'
import backtest from './backtest.mjs'

const router = express.Router()

router.use(function timeLog (req, res, next) {
  // console.log('api router')
  next()
})
router.use('/candles', candles)

router.use('/importdata', importdata)

router.use('/backtest', backtest)

export default router
