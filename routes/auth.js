import { Router } from 'express'
import { User } from '../models/user.js'
import bcrypt from 'bcrypt'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.post('/sign-up', (req, res) => {
  const saltRounds = 10;
  try {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      if (err)
        throw new Error('Internal Server Error while hashing password')

      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      })

      user.save().then(() => {
        res.send({
          msg: 'User created successfully',
          id: user._id
        })
      })
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.post('/sign-in', async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email})
    if (!user)
      throw new Error('Could not find user')
    bcrypt.compare(req.body.password, user.password, (err, match) => {
      // This is an async callback fn, so if I throw an error here it won't be caught by the try-catch
      try {
        if (err)
          throw err
        if (!match)
          throw new Error('Wrong credentials')
        req.token = encryptUserData(user)
        res.cookie('user', req.token)
        res.send({user: req.token})
      } catch (error) {
        res.clearCookie('user')
        console.error(error)
        res.send({error: error.message})
      }
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.get('/sign-out', (req, res) => {
  res.clearCookie('user')
  res.redirect('/')
})
