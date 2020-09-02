import pidcrypt from 'pidcrypt'
import 'pidcrypt/seedrandom.js'
import 'pidcrypt/aes_cbc.js'
    
/**
 * The BUFFY_TOKEN environment variable must be set to be used as a secret for the encryption
 */
export {
  encrypt,
  decrypt
}

function encrypt(toEncrypt) {
  const aes = new pidcrypt.AES.CBC()
  const pw = process.env.BUFFY_TOKEN
  return aes.encryptText(toEncrypt, pw)
}

function decrypt(encrypted) {
  const aes = new pidcrypt.AES.CBC()
  const pw = process.env.BUFFY_TOKEN
  return aes.decryptText(encrypted, pw);
}