import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
import bcrypt from 'bcrypt'
export const router = Router()

router.get('/', async (req, res) => {
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

router.get('/byEmail/:email', async (req, res) => {
  try {
    const user = await User.findOne({email: req.params.email})
    if (!user)
      throw new Error('This user does not exist')

    user.password = null

    res.send(user)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.get('/search', async (req, res) => {
  try {

    if (!req.query.email)
      throw new Error('Email not provided')

    const users = await User.find({email: {
      $regex: req.query.email.toLowerCase()
    }})
    if (!users || users.length == 0)
      throw new Error('Could not find any users matching that email')

    users.forEach(u => {u.password = null})
    res.send(users)
  } catch (error) {
    console.error(error)
    res.send([])
  }
})

router.get('/contacts', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not find user')

    const conversations = await Conversation.find({_id: {$in: user.conversations}})

    const contactIds = conversations.map(c => {
      return c.users.user1 == user.id ?
        c.users.user2 :
        c.users.user1
    })

    const contacts = await User.find({_id: {$in: contactIds}})

    res.send(contacts)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.get('/:id', async (req, res) => {
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

router.put('/', async (req, res) => {
  try {
    if (!req.token)
      throw new Error('You must sign-in first')

    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    Object.keys(User.schema.obj).forEach(k => {
      if (!['username', 'email', 'profilePicture'].includes(k))
        return

      if (req.body[k] !== undefined) {
        user[k] = req.body[k]
      }
    })

    user.save().then(u => {
      u.password = null
      res.send(u)
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.delete('/', async (req, res) => {
  try {
    if (!req.token)
      throw new Error('You must sign-in first')

    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    user.deleteOne().then(u => {
      res.send(u)
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

