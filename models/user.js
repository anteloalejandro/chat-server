import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    pattern: '/^\S+@\S+\.\S+$/'
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 2,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    trim: true,
    // pattern: '(?=.*\d.*)(?=.*[a-zA-Z].*)(?=.*[!#\$%&\?].*).{8,}'
  },
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversations'
  }]
})

export const User = mongoose.model('users', userSchema)

