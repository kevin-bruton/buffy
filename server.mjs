import express from 'express'
import cors from 'cors'
import apiRouter from './api/index.mjs'

const app = express()
app.use(cors())
const port = process.env.PORT || 3000

app.use('/api', apiRouter)

app.use(express.static('dist'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))