import pidcrypt from 'pidcrypt'
import * as rambda from 'rambda'
import * as pidCryptUtil from 'pidcrypt/pidcrypt_util.js'
import 'pidcrypt/asn1.js'
import 'pidcrypt/rsa.js'
import createError from './error.mjs'

const { RSA, ASN1 } = pidcrypt

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export const isFunction = rambda.pipe(rambda.type, rambda.equals('Function'))
export const isUndefined = rambda.pipe(rambda.type, rambda.equals('Undefined'))

export function publicEncrypt(key, value) {
  const asn = ASN1.decode(pidCryptUtil.toByteArray(pidCryptUtil.decodeBase64(key)))
  const rsa = new RSA()
  rsa.setPublicKeyFromASN(asn.toHexTree())
  return pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(rsa.encrypt(value)))
}

export function get(inputObject, inputPath, defaultValue) {
  const inputValue = rambda.path(inputPath, inputObject)
  return isUndefined(inputValue) ? defaultValue : inputValue
}

export function getOption(key, options, defaults) {
  return get(options, key, rambda.path(key, defaults))
}

export function transformResponse(response) {
  return rambda.path('data', response)
}

export function transformError(error) {
  throw createError(error)
}

export function uniqueId(length = 15, chars = CHARS) {
  let result = ''
  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
