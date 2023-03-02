const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fs = require('fs')
const { Server } = require('socket.io')
const app = express()
const apiRoute = require('./routes/api.js')

const settings = JSON.parse(fs.readFileSync('./settings.json'))
const defaults = {
  key: './https.key',
  cert: './https.crt',
  port: 3000,
  root: './app'
}
Object.keys(defaults).forEach(k => {
  if (settings[k] === undefined)
    settings[k] = defaults[k]
})

mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1:27017/chat')

app.use(bodyParser.json())
app.use('/', express.static(settings.root))
app.use('/api', apiRoute)

const key = fs.readFileSync(settings.key)
const certificate = fs.readFileSync(settings.cert)
const credentials = {key: key, cert: certificate}
const server = https.createServer(credentials, app)
server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
