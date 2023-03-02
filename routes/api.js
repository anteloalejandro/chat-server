const router = require('express').Router()
const User = require('../models/user.js')

const fileConfig = { root: 'views' }

router.get('/', (req, res) => {
  res.sendFile('index.html', fileConfig)
})

router.get('/list-users', (req, res) => {
  User.find().then(users => {res.send(users)})
})

router.post('/sign-up', (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  })

  user.save()
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})

router.post('/delete-account', (req, res) => {
  User.findByIdAndRemove(req.body.id)
    .then(response => { res.send({error: false, msg: response}) })
    .catch(error => { res.send({error: true, msg: error}) })
})

module.exports = router
