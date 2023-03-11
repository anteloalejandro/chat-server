import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.delete('/delete-account', (req, res) => {
  User.findByIdAndRemove(req.body.id)
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})

router.get('/user-data', async (req, res) => {
  try {
    if (!req.token)
      throw new Error('You must sign-in first')

    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    user.password = null

    res.send(user)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.get('/user-data/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user)
      throw new Error('Could not find user')
    user.password = null
    res.send(user)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})
