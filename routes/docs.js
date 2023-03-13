import { Router } from 'express'
export const router = Router()
const pages = ['auth', 'users', 'conversations', 'messages']

router.get('/', (req, res) => {
  res.render('index', {pages: pages})
})
