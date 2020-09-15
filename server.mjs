import express from 'express'
import cors from 'cors'
import http from 'http'
import apiRouter from './api/index.mjs'
import {socketServer} from './socket/index.mjs'

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 3000

const server = http.createServer(app)
socketServer(server)

app.use('/api', apiRouter)

app.use(express.static('dist'))

server.listen(port, () => console.log(`Buffy server listening on port ${port}`))