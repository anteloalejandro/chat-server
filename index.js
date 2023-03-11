import express from 'express'
import https from 'https'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import fs from 'fs'
import { Server } from 'socket.io'
import { router as authRoute } from './routes/auth.js'
import { router as apiRoute } from './routes/api.js'
import { router as conversationsRoute } from './routes/conversation.js'
import { router as messagesRoute } from './routes/messages.js'
import { User } from './models/user.js'
import { Message } from './models/message.js'
import { Conversation } from './models/conversation.js'
const app = express()

const settings = JSON.parse(fs.readFileSync('./settings.json'))
const defaults = {
  key: './https.key',
  cert: './https.crt',
  port: 3000,
  root: './demo'
}
Object.keys(defaults).forEach(k => {
  if (settings[k] === undefined)
    settings[k] = defaults[k]
})
const corsConfig = {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
}
mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1:27017/chat')

app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use((req, res, next) => {
  req.token = req.cookies.user

  next()
})
app.use(cors(corsConfig))
app.use('/', express.static(settings.root))
app.use('/auth', authRoute)
app.use('/api', apiRoute)
app.use('/api/conversations', conversationsRoute)
app.use('/api/messages', messagesRoute)

const key = fs.readFileSync(settings.key)
const certificate = fs.readFileSync(settings.cert)
const credentials = {key: key, cert: certificate}
const server = https.createServer(credentials, app)

const io = new Server(server, corsConfig)

io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('join', room => {
    if (!room) return
    console.log('joining room '+room)
    socket.join(room)
  })

  socket.on('message', async msg => {
    console.log('message: ', msg)
    try {
      const conversation = await Conversation.findById(msg.conversation)
      if (!conversation)
        throw new Error('Could not find this conversation')
      Object.keys(conversation.users).forEach(u => {
        const room = conversation.users[u]._id.toString()
        console.log('sending message to room '+room)
        io.in(room).emit('refresh-messages', msg)
      })
    } catch (error) {
      console.error(error)
    }
  })
})

server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
