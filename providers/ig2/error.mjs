import rambda from 'rambda'

const statusCode = rambda.path('status')
const statusText = rambda.path('statusText')
const errorCode = rambda.path('data.errorCode')
const headers = rambda.path('headers')
const method = rambda.path('method')
const params = rambda.path('params')
const data = rambda.path('data')
const url = rambda.path('url')

export default function createError({ message, request, response, config }) {
  const error = new Error(message)
  error.type = response ? 'response' : request ? 'request' : 'internal'
  if (config) {
    error.url = url(config)
    error.data = data(config)
    error.params = params(config)
    error.method = method(config)
    error.headers = headers(config)
  }
  if (response) {
    error.errorCode = errorCode(response)
    error.statusCode = statusCode(response)
    error.statusText = statusText(response)
  }
  return error
}
