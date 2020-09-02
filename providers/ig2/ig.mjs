import { create, setHeaderTokens } from './axios.mjs'
import {
  uniqueId,
  getOption,
  isFunction,
  publicEncrypt,
  transformError,
  transformResponse
} from './utils.mjs'
import {getKey} from '../../db/keys.mjs'


export default class IG {

  static transformResponse = transformResponse
  static transformError = transformError
  static uniqueId = uniqueId

  constructor({isDemo}) {
    const {apiKey, username, password} = JSON.parse(getKey('ig'))
    this.username = username
    this.password = password
    this.api = create(apiKey, isDemo)
    this.defaults = {...{transformResponse, transformError}, ...undefined}
  }

  request(method, path, version, config, options) {
    const transformRes = getOption('transformResponse', options, this.defaults)
    const transformErr = getOption('transformError', options, this.defaults)

    // Account for Delete inconsistensies as per 
    // https://labs.ig.com/node/36 which is still 
    // not resolved.
    const headers = { Version: version || 1 };

    if  (method === 'delete') {
      // eslint-disable-next-line no-param-reassign
      method = 'post';
      headers._method = 'DELETE';
    }

    let request = this.api.request({...config, ...{method, url: path, headers}})

    if (isFunction(transformRes)) request = request.then(transformRes)
    if (isFunction(transformErr)) request = request.catch(transformErr)

    return request
  }

  get(path, version, params, options) {
    return this.request('get', path, version, { params }, options)
  }

  post(path, version, data, options) {
    return this.request('post', path, version, { data }, options)
  }

  put(path, version, data, options) {
    return this.request('put', path, version, { data }, options)
  }

  delete(path, version, data, options) {
    return this.request('delete', path, version, { data }, options)
  }

  async login() {
    const {encryptionKey, timeStamp} = await this.get('session/encryptionKey', 1, null, {transformResponse})
    const encrypted = publicEncrypt(encryptionKey, `${this.password}|${timeStamp}`)
    this.api = setHeaderTokens(this.api, encrypted)
    const transformRes = getOption('transformResponse', undefined, this.defaults)
    console.log('login', isFunction(transformRes) ? transformRes(encrypted) : encrypted)
  }

  logout(options) {
    return this.delete('session', 1, null, options)
  }
}
