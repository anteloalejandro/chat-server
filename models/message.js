import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: () => new Date(Date.now()),
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversations',
    required: true
  },
  status: {
    type: String,
    default: 'sent',
    trim: true
  }
})

export const Message = mongoose.model('messages', messageSchema)
