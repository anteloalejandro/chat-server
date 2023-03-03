const router = require('express').Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')
const {encryptUserData, decryptUserData} = require('../encrypt.js')

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
})

router.get('/list-users', (req, res) => {
  User.find().then(users => {res.send(users)})
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
        encryptedUser = encryptUserData(user)
        res.cookie('user', encryptedUser)
        res.redirect('/')
        /* // Hashing won't do, gotta figure out how to encrypt to be able to reverse it
        bcrypt.hash(`${user.username}:${user.password}`, 1, (err, hash) => {
          if (err)
            throw new Error('Internal Server Error while hashing user credentials')


        }) */
      })

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

module.exports = router
