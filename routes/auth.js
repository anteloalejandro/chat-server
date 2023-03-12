import { Router } from 'express'
import { User } from '../models/user.js'
import bcrypt from 'bcrypt'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.post('/sign-up', (req, res) => {
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err)
      throw new Error('Internal Server Error while hashing password')

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    })

    user.save()
      .then(() => {
        res.send({msg: 'User created successfully', id: user._id})
      })
      .catch(error => { res.send({error: error.message}) })

  })
})

router.post('/sign-in', (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => {
      console.log(user)
      bcrypt.compare(req.body.password, user.password, (err, match) => {
        if (!match) {
          res.clearCookie('user')
          res.redirect('sign-in')
          return
        }
        req.token = encryptUserData(user)
        res.cookie('user', req.token)
        res.send({user: req.token})
      })

    })
    .catch(error => {
      res.send({error: error.message})
    })
})

router.get('/sign-out', (req, res) => {
  res.clearCookie('user')
  res.redirect('/')
})
