import { Router } from 'express'
export const router = Router()
const pages = ['users', 'conversations', 'messages', 'auth', 'upload']

router.get('/', (req, res) => {
  res.render('index', {pages: pages})
})
