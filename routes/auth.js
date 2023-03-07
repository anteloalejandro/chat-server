import { Router } from 'express'
import { User } from '../models/user.js'
import bcrypt from 'bcrypt'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

router.get('/', (req, res) => {
  const encryptedUser = req.cookies.user
  if (encryptedUser === undefined) {
    res.render('index', {user: null})
    return
  }

  decryptUserData(encryptedUser)
    .then(user => {
      res.render('index', {user: user})
    })
    .catch(error => {
      console.error(error)
      res.render('index', {user: null})
    })
})

router.get('/list-users', (req, res) => {
  User.find().populate("conversations").then(users => {res.send(users)})
})

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
      .then(response => { res.send({error: false, msg: response}) })
      .catch(error => { res.send({error: true, msg: error}) })

  })
})

router.get('/sign-in', (req, res) => {
  res.render('sign-in')
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
        const encryptedUser = encryptUserData(user)
        res.cookie('user', encryptedUser)
        res.redirect('/')
      })

    })
    .catch(error => {
      res.send({error: error})
    })
})

router.get('/sign-off', (req, res) => {
  res.clearCookie('user')
  res.redirect('/')
})

router.post('/delete-account', (req, res) => {
  User.findByIdAndRemove(req.body.id)
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})
