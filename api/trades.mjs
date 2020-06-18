import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

router.get('/:backtestid', (req, res) => {
  const {backtestid} = req.params
  try {
    if (!backtestid) {
      throw new Error()
    }
    const dataFile = path.join(path.resolve(), 'data', 'backtests', backtestid, 'trades.csv')
    const dataStr = fs.readFileSync(dataFile, {encoding: 'utf8'})
    const dataArr = dataStr.split('\n')
    const properties = dataArr.shift().split(';')
    if (!dataArr[dataArr.length - 1].action) {
      dataArr.pop()
    }
    const trades = dataArr
      .map(trade => trade.split(';')
      .reduce((acc, cur, i) => ({...acc, ...{[properties[i]]: Number.isNaN(Number(cur)) ? cur : Number(cur)}}), {}))
    res.json(trades)
  } catch(error) {  
    res.json({error})
  }
})

export default router
