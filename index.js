const express = require('express')
const hbs = require('hbs')
const https = require('https')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const fs = require('fs')
const { Server } = require('socket.io')
const app = express()
const authRoute = require('./routes/auth.js')

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

app.set('view engine', 'hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/', express.static(settings.root))
app.use('/auth', authRoute)

const key = fs.readFileSync(settings.key)
const certificate = fs.readFileSync(settings.cert)
const credentials = {key: key, cert: certificate}
const server = https.createServer(credentials, app)
server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
