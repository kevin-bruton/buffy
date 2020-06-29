import fetch from 'node-fetch'

export {pubRequest}

const baseUrl = 'https://api-pub.bitfinex.com/v2/'

async function pubRequest({pathParams = '', queryParams = ''}) {
  const url = `${baseUrl}${pathParams}${queryParams}`
    try {
        const req = await fetch(url)
        const response = await req.json()
        return response
        // console.log(`STATUS ${req.status} - ${JSON.stringify(response)}`) // Logs status and stringified response
    }
    catch (err) { 
        console.log(err) // Catches and logs any error
    }
}
