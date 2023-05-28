import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v)
      },
      message: m => m.value + 'is not a valid email'
    },
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
  }],
  profilePicture: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if ([undefined, null, ''].includes(v))
          return true

        return /\.(jpe?g|png|gif|bmp)$/.test(v)
      },
      message: m => m.value + 'not a valid image format'
    }
  }
})

export const User = mongoose.model('users', userSchema)

