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
      .catch(error => {
        console.error('Error inside hash function:\n'+error)
        res.send({error: error.message})
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
        res.send({token: req.token})
      } catch (error) {
        console.error(error)
        res.send({error: error.message})
      }
    })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

router.put('/change-password', async (req, res) => {
  try {
    const saltRounds = 10
    if (!req.query.token)
      throw new Error('You must sign-in first')

    const user = await decryptUserData(req.query.token)
    if (!user)
      throw new Error('Could not authenticate user')

    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    //   if (err)
    //     throw err
    //
    //   console.log('Changing password: ', {before: user.password, after: hash})
    //   User.updateOne({_id: user._id}, {$set: {password: hash}})
    //     .then(() => res.send({
    //       msg: 'Password successfully changed. You\'ll need to sign-in again',
    //       id: user._id
    //     }))
    // })
    const hash = bcrypt.hashSync(req.body.password, saltRounds)
    User.updateOne({_id: user._id}, {$set: {password: hash}})
      .then(() => res.send({
        msg: 'Password successfully changed. You\'ll need to sign-in again',
        id: user._id
      }))
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }

})
