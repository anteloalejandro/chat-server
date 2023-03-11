import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.get('/', async (req, res) => {
  try {
    const user = await decryptUserData(req.token).populate('conversations')
    if (!user)
      throw new Error('Could not authenticate user')

    res.send(user.conversations)
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

    const conversation = await Conversation.findById(req.params.id)

    if (!conversation)
      throw new Error('Could not find conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    res.send(conversation)
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

    const recipient = await User.findById(req.body.recipient)
    if(!recipient)
      throw new Error('The recipient does not exist')

    const users = {
      user1: user._id,
      user2: recipient._id
    }

    if (await Conversation.findOne({
      "users.user1": users.user1,
      "users.user2": users.user2
    }))
      throw new Error('These users already have a conversation')

    const conversation = new Conversation(users)
    conversation.save().then(() => {
      user.conversations.push(conversation._id)
      user.save()

      recipient.conversations.push(conversation._id)
      recipient.save()
    }).then(() => {res.send(conversation)})
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})
