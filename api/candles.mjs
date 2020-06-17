import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

router.get('/:provider/:symbol/:candlesize/:start/:end', (req, res) => {
  const {provider, symbol, candlesize, start, end} = req.params
  try {
    if (!provider || !symbol || !candlesize || !start || !end) {
      throw new Error()
    }
    const dataFile = path.join(path.resolve(), 'data', provider, `${symbol}_${candlesize}_${start}_${end}.json`)
    const dataStr = fs.readFileSync(dataFile, {encoding: 'utf8'})
    const data = JSON.parse(dataStr).slice(0, 50)
    res.json(data)
  } catch(error) {  
    res.json({error})
  }
})

export default router
