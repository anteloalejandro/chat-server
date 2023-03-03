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
  /* const decipher = crypto.createDecipher(algorithm, secret)
  const decrypted = decipher.update(text, 'utf-8', 'hex') + decipher.final('utf-8') */

  const decipher = crypto.createDecipher(algorithm, secret)
  const decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8')

  return decrypted
}

export function encryptUserData (user) {
  try {
    return encrypt(user.email + ':' + user.password)
  } catch (error) {
    console.error(error);
  }
}

export function decryptUserData (encryptedUser) {
  let email, password
  try {
    [email, password] = decrypt(encryptedUser).split(':')
  } catch (error) {
    console.error(error);
  }

  const userPromise = User.findOne({email: email})
  return userPromise
}
