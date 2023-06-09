import { Router } from 'express'
import { router as docsRouter } from './docs.js'
import { router as messagesRouter } from './messages.js'
import { router as conversationsRouter } from './conversations.js'
import { router as usersRouter } from './users.js'
import { router as uploadRouter } from './upload.js'
export const router = Router()

// Redirect to appropiate route
router.get('/', (req, res) => {
  res.redirect('docs')
})
router.use('/docs', docsRouter)
router.use('/messages', messagesRouter)
router.use('/conversations', conversationsRouter)
router.use('/users', usersRouter)
router.use('/upload', uploadRouter)

