import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  _id: {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    }
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'messages'
  }]
})

export const Conversation = mongoose.model('conversations', conversationSchema)
