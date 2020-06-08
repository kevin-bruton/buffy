import express from 'express'
import candles from './candles.mjs'

const router = express.Router()

router.use(function timeLog (req, res, next) {
  // console.log('api router')
  next()
})
router.use('/candles', candles)

export default router
