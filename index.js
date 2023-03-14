import express, { Router } from 'express'
import http from 'http'
import https from 'https'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
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
const app = express()

hbs.registerPartials('./docs/partials');
hbs.registerHelper('concat', function () {
  const args = [...arguments].slice(0,-1)
  return args.join('')
})

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

app.set('view engine', 'hbs')
app.set('views', 'docs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api', (req, res, next) => {
  req.token = req.query.token
  next()
})
app.use(cors(corsConfig))
app.use('/', express.static(settings.root))
app.use('/public', express.static('public'))
app.use('/auth', authRoute)
app.use('/api', apiRoute)

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
http.createServer(
  express().use((req, res) => {
    res.redirect(300, `https://${req.hostname}:${settings.port}${req.url}`)
  })
).listen(settings.httpPort)
