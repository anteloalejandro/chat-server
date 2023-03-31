import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.get('/conversation/:id', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const conversation = await Conversation.findById(req.params.id)
    if (!conversation)
      throw new Error('Could not find this conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    Message.updateMany(
      {
        conversation: conversation._id,
        author: {$ne: user._id},
        status: {$not: /^deleted$/}
      },
      { $set: {"status": "recieved"} },
      // false,
      // true
    ).then(async () => {
      const messages = (await conversation.populate('messages')).messages
      res.send(messages)
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const message = await Message.findById(req.params.id)
    if (!message)
      throw new Error('Could not find message')

    if (!user.conversations.includes(message.conversation))
      throw new Error('This user does not have access to this message')

    if (message.status != 'recieved' && message.author != user._id) {
      message.status = 'recieved'
      message.save()
    }

    res.send(message)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.post('/', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const conversation = await Conversation.findById(req.body.conversation)
    if (!conversation)
      throw new Error('Could not find this conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')
    if (!req.body.content)
      throw new Error("The message needs to have content")

    console.log('OK')
    const message = new Message({
      content: req.body.content,
      conversation: conversation._id,
      author: user._id
    })
    message.save().then(() => {
      conversation.messages.push(message._id)
      conversation.save()
    }).then(() => {res.send(message)})
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})
