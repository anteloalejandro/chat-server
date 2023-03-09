import express from 'express'
import https from 'https'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import fs from 'fs'
import { Server } from 'socket.io'
import { router as authRoute } from './routes/auth.js'
import { router as indexRoute } from './routes/index.js'
import { User } from './models/user.js'
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

  socket.on('join', room => {
    console.log('joining room '+room)
    socket.join(room)
  })

  socket.on('message', async msg => {
    console.log('message: ', msg)
    const conversation = await Conversation.findById(msg.conversation)
    Object.keys(conversation.users).forEach(u => {
      const room = conversation.users[u]._id.toString()
      console.log('sending message to room '+room)
      io.in(room).emit('refresh-messages', msg)
    })

  })
})

server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
