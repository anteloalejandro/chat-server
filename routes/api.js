import { Router } from 'express'
import { router as docsRouter } from './docs.js'
import { router as messagesRouter } from './messages.js'
import { router as conversationsRouter } from './conversations.js'
import { router as usersRouter } from './users.js'
export const router = Router()

router.use('/docs', docsRouter)
router.use('/messages', messagesRouter)
router.use('/conversations', conversationsRouter)
router.use('/users', usersRouter)

