import express, { Router } from 'express'
import http from 'http'
import https from 'https'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import fs from 'fs'
import hbs from 'hbs'
import { Server } from 'socket.io'
import { router as authRoute } from './routes/auth.js'
import { router as apiRoute } from './routes/api.js'
import { User } from './models/user.js'
import { Message } from './models/message.js'
import { Conversation } from './models/conversation.js'
import { encryptUserData } from './encrypt.js'

// Prevent crashes on uncaught errors
process.on('uncaughtException', err => {
  console.error({uncaughtException: err})
})
const app = express()

// HBS function to concatenate arguments
hbs.registerPartials('./docs/partials');
hbs.registerHelper('concat', function () {
  const args = [...arguments].slice(0,-1)
  return args.join('')
})

// Settings file & default settings
const settings = fs.existsSync('./settings.json') ?
  JSON.parse(fs.readFileSync('./settings.json')) : {}
const defaults = {
  key: './snake-oil.key',
  cert: './snake-oil.crt',
  port: 3000,
  httpPort: 8080,
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

// Express configuration
app.set('view engine', 'hbs')
app.set('views', 'docs')
// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/api', (req, res, next) => {
  req.token = req.query.token
  next()
})
app.use(cors(corsConfig))
// Routes
app.use('/', express.static(settings.root))
app.use('/public', express.static('public'))
app.use('/auth', authRoute)
app.use('/api', apiRoute)
// Default route
app.use((req, res, next) => {
  res.redirect('/')
  next()
})

// HTTPS
const key = fs.readFileSync(settings.key)
const certificate = fs.readFileSync(settings.cert)
const credentials = {key: key, cert: certificate}
const server = https.createServer(credentials, app)

const io = new Server(server, corsConfig)

// SocketIO events
io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('join', room => {
    if (!room) return
    socket.join(room)
  })

  socket.on('message', async msg => {
    try {
      const conversation = await Conversation.findById(msg.conversation)
      if (!conversation)
        throw new Error('Could not find this conversation')
      Object.keys(conversation.users).forEach(async u => {
        const userId = conversation.users[u]._id.toString()
        const user = await User.findById(userId);
        const room = encryptUserData(user)
        io.in(room).emit('refresh-messages', msg)
      })
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('read', async msg => {
    try {
      const conversation = await Conversation.findById(msg.conversation)
      if (!conversation)
        throw new Error('Could not find this conversation')
      const message = await Message.findById(msg._id)
      const user = await User.findById(msg.author)
      if (!user)
        throw new Error('Could not find user')
      const room = encryptUserData(user)
      io.in(room).emit('refresh-read', msg)
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('conversation', async (recipientId) => {
    try {
      const user = await User.findById(recipientId)
      if (!user)
        throw new Error('could not find this user')

      const room = encryptUserData(user)
      console.log(user)
      io.in(room).emit('refresh-conversations', user)
    } catch (error) {
      console.error(error)
    }
  })
})

// Start HTTP & HTTPS servers
server.listen(settings.port, () => {
  console.log('Listening on *:'+settings.port)
})
http.createServer(
  express().use((req, res) => {
    res.redirect(300, `https://${req.hostname}:${settings.port}${req.url}`)
  })
).listen(settings.httpPort)
