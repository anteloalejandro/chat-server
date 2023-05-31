import { Router } from 'express'
import { User } from '../models/user.js'
import { Message } from '../models/message.js'
import { Conversation } from '../models/conversation.js'
import {encryptUserData, decryptUserData} from '../encrypt.js'
export const router = Router()

// Returns an array of Conversations
router.get('/', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    user.populate('conversations')
      .then(u => {
        res.send(u.conversations)
      })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

// Returns an array of Conversations with unread messages
router.get('/unread', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    /**@type Conversation[]*/
    const conversations = (await user.populate('conversations')).conversations

    /**@type Conversation[]*/
    const unreadConvs = []

    for (const conversation of conversations) {
      /**@type Message[]*/
      const messages = (await conversation.populate('messages')).messages
      if (messages.filter(m => m.status == 'sent' && m.author.toString() != user._id.toString()).length > 0)
        unreadConvs.push(conversation)
    }

    res.send(unreadConvs)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

// Returns a specific Conversation if the user has access to it
router.get('/:id', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const conversation = await Conversation.findById(req.params.id)

    if (!conversation)
      throw new Error('Could not find conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    res.send(conversation)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

// Creates and returns a new Conversation,
// if none of the participants have a Conversation with each other already
router.post('/', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const recipient = await User.findById(req.body.recipient)
    if(!recipient)
      throw new Error('The recipient does not exist')

    const users = {
      user1: user._id,
      user2: recipient._id
    }
    console.log(users)

    if (await Conversation.findOne({
      "users.user1": users.user1,
      "users.user2": users.user2
    }))
      throw new Error('These users already have a conversation')

    const conversation = new Conversation({users: users})
    conversation.save().then(() => {
      user.conversations.push(conversation._id)
      user.save()

      recipient.conversations.push(conversation._id)
      recipient.save()
    }).then(() => {res.send(conversation)})
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

// Update a Conversation's information
router.put('/:id', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const conversation = await Conversation.findById(req.params.id)
    if (!conversation)
      throw new Error('Could not find conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    Object.keys(Conversation.schema.obj).forEach(k => {
      if (!['backgroundImg', 'backgroundColor'].includes(k))
        return

      if (req.body[k] !== undefined)
        conversation[k] = req.body[k]
    })

    conversation.save()
    res.send(conversation)
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})

// Remove a Conversation from the database and related models
router.delete('/:id', async (req, res) => {
  try {
    const user = await decryptUserData(req.token)
    if (!user)
      throw new Error('Could not authenticate user')

    const conversation = await Conversation.findById(req.params.id)
    if (!conversation)
      throw new Error('Could not find conversation')
    if (!user.conversations.includes(conversation._id))
      throw new Error('This user is not a member of this conversation')

    Message.deleteMany({_id: {$in: conversation.messages}})
      .then(console.log)

    const user2Id = conversation.users.user1 == user._id ?
      conversation.users.user1 :
      conversation.users.user2

    const user2 = await User.findById(user2Id)

    user.conversations = user.conversations.filter(c => !c._id.equals(conversation._id))
    user2.conversations = user2.conversations.filter(c => !c._id.equals(conversation._id))

    conversation.deleteOne()
      .then(() => {
        user.save()
        user2.save()
        res.send(conversation)
      })
  } catch (error) {
    console.error(error)
    res.send({error: error.message})
  }
})
