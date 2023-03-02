const router = require('express').Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

const fileConfig = { root: 'views' }

router.get('/', (req, res) => {
  res.sendFile('index.html', fileConfig)
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

router.post('/sign-in', (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => {
      console.log(user)
      bcrypt.compare(req.body.password, user.password, (err, match) => {
        if (match)
          res.send({error: false, msg: 'Successful log in'})
        else
          res.send({error: true, msg: 'email, username or password are wrong'})
      })
    })
})

router.post('/delete-account', (req, res) => {
  User.findByIdAndRemove(req.body.id)
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})

module.exports = router
