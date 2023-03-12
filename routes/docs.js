import { Router } from 'express'
export const router = Router()

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/users', (req, res) => {
  res.render('users')
})
router.get('/messages', (req, res) => {
  res.render('messages')
})
router.get('/conversations', (req, res) => {
  res.render('conversations')
})
