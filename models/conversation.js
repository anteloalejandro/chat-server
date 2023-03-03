import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
})

export const Conversation = mongoose.model('conversations', conversationSchema)
