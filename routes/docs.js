import { Router } from 'express'
export const router = Router()

// Pages of the API documentation to render
const pages = ['users', 'conversations', 'messages', 'auth', 'upload']

router.get('/', (req, res) => {
  res.render('index', {pages: pages})
})
