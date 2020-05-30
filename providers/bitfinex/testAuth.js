const {req} = require('./authRequest')

// const apiPath = 'v2/auth/r/orders/tBTCUSD/hist'// Example path
const apiPath = 'v2/auth/r/info/user'

const body = {
  start: 1554002000000,
  end: 1554002216000,
  limit:10
} // Field you may change depending on endpoint

;(async () => {
  const resp = await req({apiPath, body})
  console.log(resp)
})()
