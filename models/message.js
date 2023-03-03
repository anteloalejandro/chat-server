import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: new Date(Date.now())
})

export const Message = mongoose.model('messages', messageSchema)
