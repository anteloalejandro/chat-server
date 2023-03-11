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

    const conversation = await Conversation.findById(req.params.id).populate('messages')
    if (!conversation)
      throw new Error('Could not find this conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    res.send(conversation.messages)
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
