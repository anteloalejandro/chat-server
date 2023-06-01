import crypto from 'crypto'
import { User } from './models/user.js'

const algorithm = 'aes256'
const secret = 'O4eZyDmkAy'

function encrypt (text) {
  const cipher = crypto.createCipher(algorithm, secret)

  const encrypted = cipher.update(text, 'utf-8', 'hex') + cipher.final('hex')
  return encrypted
}

function decrypt (text) {
  const decipher = crypto.createDecipher(algorithm, secret)
  const decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8')

  return decrypted
}

export function encryptUserData (user) {
  try {
    return encrypt(user._id.toString() + ':' + user.password)
  } catch (error) {
    console.error(error);
  }
}

export function decryptUserData (encryptedUser) {
  let id, password
  try {
    [id, password] = decrypt(encryptedUser).split(':')
  } catch (error) {
    console.error(error);
  }

  const userPromise = User.findById(id)
    .then(user => {
      if (password === user.password)
        return user
    })
  return userPromise
}
