import mongoose from "mongoose";

const backupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversations',
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'messages',
    required: true
  }],
  hash: {
    type: String,
    required: true
  }
})

export const Backup = mongoose.model(backupSchema, 'backups')
