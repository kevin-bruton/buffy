import * as axios from 'axios'
import rambda from 'rambda'

const appToken = rambda.path('headers.x-security-token')
const clientToken = rambda.path('headers.cst')

export function create(apiKey, isDemo) {
  return axios.create({
    baseURL: `https://${isDemo ? 'demo-' : ''}api.ig.com/gateway/deal/`,
    headers: {
      'Accept': 'application/json; charset=UTF-8',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-IG-API-KEY': apiKey
    }
  })
}

export function setHeaderTokens(instance, response) {
  return {...instance, ...{defaults: {headers: {
      'X-SECURITY-TOKEN': appToken(response),
      'CST': clientToken(response)
    }}}
  }
}

export default create
