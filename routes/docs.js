import { Router } from 'express'
export const router = Router()
const pages = ['auth', 'users', 'conversations', 'messages']

router.get('/', (req, res) => {
  res.render('index', {pages: pages})
})

/* for (let i = 0; i < pages.length; i++) {
  router.get('/'+pages[i], (req, res) => {
    res.render(pages[i])
  })
} */
