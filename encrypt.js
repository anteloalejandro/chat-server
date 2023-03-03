const crypto = require('crypto')
const User = require('./models/user.js')

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

function encryptUserData (user) {
  return encrypt(user.email + ':' + user.password)
}

function decryptUserData (encryptedUser) {
  const [email, password] = decrypt(encryptedUser).split(':')

  const userPromise = User.findOne({email: email})

  return userPromise
}

module.exports = {encryptUserData, decryptUserData}
