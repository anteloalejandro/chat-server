import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import bcrypt from 'bcrypt'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.post('/', async (req, res) => {
  let isValid = true
  let out = {}
  try {

    const message = new Message(req.body.message)
    const user = await User.findById(message.author)
    const conversation = await Conversation.findById(message.conversation)
    console.log(message, user, conversation)

    const conversationsIDs = Object.keys(conversation.users).map(
      u => conversation.users[u].toString()
    )
    isValid = conversationsIDs.includes(user.id)

    if (isValid)
      message.save()

    out = {
      error: false,
      message: message,
      valid: isValid
    }

  } catch (error) {
    out = {
      error: error,
    }
  }

  res.send(out)
})
