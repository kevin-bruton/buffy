import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

router.get('/lines/:backtestid', (req, res) => {
  const {backtestid} = req.params
  try {
    if (!backtestid) {
      throw new Error('backtestid not provided in request for plotter lines')
    }
    const backTestDir = path.join(path.resolve(), 'data', 'backtests', backtestid)
    const overview = JSON.parse(fs.readFileSync(path.join(backTestDir, 'overview.json')))
    const lineNames = overview.linesToPlot
    const lines = lineNames.map(lineName => JSON.parse(fs.readFileSync(path.join(backTestDir, `lines-${lineName}.json`), {encoding: 'utf8'})))
    res.json(lines)
  } catch(error) {
    console.error(error)
    res.json({error: 'Error getting plotter lines'})
  }
})

export default router
