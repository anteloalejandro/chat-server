import express from 'express'
import https from 'https'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import fs from 'fs'
import { Server } from 'socket.io'
import { router as authRoute } from './routes/auth.js'
import { router as indexRoute } from './routes/index.js'
import { Message } from './models/message.js'
import { Conversation } from './models/conversation.js'
const app = express()

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
app.use('/', indexRoute)
app.use('/auth', authRoute)

const key = fs.readFileSync(settings.key)
const certificate = fs.readFileSync(settings.cert)
const credentials = {key: key, cert: certificate}
const server = https.createServer(credentials, app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', (msg) => {
    console.log('message: ', msg)
    const message = new Message(msg)
    // message.save()
    io.emit('message', msg)
  })
  socket.on('conversation', (con) => {
    console.log('conversation: ', con)
    const conversation = new Conversation(con)
    // conversation.save()
  })
})

server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
