import express from 'express'
import fs from 'fs'
import path from 'path'

const router = express.Router()

router.get('/:provider', (req, res) => {
  const {provider} = req.params
  const data = fs.readdirSync(path.join(path.resolve(), 'data', provider))
    .map(filename => {
      const details = filename.replace('.json', '').split('_')
      return {symbol: details[0], interval: details[1], from: details[2], to: details[3]}
    })
  res.json({availableData: data})
})

export default router
