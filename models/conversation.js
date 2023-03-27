import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  users: {
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
  }],
  backgroundImg: [{
    type: String,
    trim: true,
    pattern: '*\.(png|jpg|jpeg|webp)$'
  }]
})

export const Conversation = mongoose.model('conversations', conversationSchema)
