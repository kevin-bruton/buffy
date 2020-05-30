const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const request = require('request') // "Request" HTTP req library
   
module.exports = {req}

function req({apiPath, body}) {
  return new Promise((resolve, reject) => {
    const [apiKey, apiSecret] = process.env.BFX_READ.split('/')
    
    const nonce = (Date.now() * 1000).toString() // Standard nonce generator. Timestamp * 1000
    
    let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}` 
    // Consists of the complete url, nonce, and request body
    
    const sig = CryptoJS.HmacSHA384(signature, apiSecret).toString() 
    // The authentication signature is hashed using the private key
    
    const options = {
      url: `https://api.bitfinex.com/${apiPath}`,
      headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': apiKey,
        'bfx-signature': sig
      },
      body: body,
      json: true
    }
    
    request.post(options, (error, response, body) => {
      resolve(body);
    })
  })
}
