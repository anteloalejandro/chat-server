import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.post('/', async (req, res) => {
  let isValid = true
  let out
  try {
    const user = await decryptUserData(req.token)
    console.log(req.body)
    req.body.message.author = user.id
    const message = new Message(req.body.message)
    const conversation = await Conversation.findById(message.conversation)
    console.log(message, user, conversation)

    const conversationsIDs = Object.keys(conversation.users).map(
      u => conversation.users[u].toString()
    )
    isValid = conversationsIDs.includes(user.id)

    if (isValid) {
      message.save()
      conversation.messages.push(message.id)
      conversation.save()
    }

    out = {
      error: false,
      message: message,
      valid: isValid
    }

  } catch (error) {
    out = { error: error.toString() }
  } finally {
    res.send(out)
  }

})

router.post('/start-conversation/', async (req, res) => {
  let out = {}

  try {
    const user1 = await decryptUserData(req.token)
    const user2 = await User.findById(req.body.recipient)
    const users = {
      users: {
        user1: user1.id,
        user2: user2.id
      }
    }
    let conversation = await Conversation.findOne({
      "users.user1": user1.id,
      "users.user2": user2.id
    })
    console.log(conversation, users)
    if (conversation)
      throw new Error('These users already have a conversation')

    conversation = new Conversation(users)
    conversation.save()
    user1.conversations.push(conversation)
    user2.conversations.push(conversation)
    user1.save()
    user2.save()
    out = {conversation: conversation}
  } catch (error) {
    console.log(error)
    out = {error: error.toString()}
  } finally {
    res.send(out)
  }
})

router.get('/get-messages/:conversation', async (req, res) => {
  let out = {}

  try {
    const user = await decryptUserData(req.token)
    const conversation = await Conversation.findById(req.params.conversation)
    const conversationsIDs = user.conversations.map(c => c.toString())
    console.log(conversationsIDs, conversation.id)
    if (!conversationsIDs.includes(conversation.id))
      throw new Error('Not a member in this conversation')

    const popConversation = await conversation.populate({
      path: 'messages',
      /* populate: {
        path: 'author'
      } */
    })
    const messages = popConversation.messages
    out = {messages: messages}
  } catch (error) {
    console.log(error)
    out = {error: error.toString()}
  } finally {
    res.send(out)
  }
})


router.delete('/delete-account', (req, res) => {
  User.findByIdAndRemove(req.body.id)
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})

router.get('/user-data', (req, res) => {
  if (!req.token) {
    res.send({error: 'you must sign-in first'})
    return
  }

  decryptUserData(req.token)
    .then(user => {
      user.password = ''
      res.send(user)
    })
})

router.get('/user-data/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.password = null
      res.send(user)
    })
    .catch(error => {
      res.send({error: error})
    })
})
