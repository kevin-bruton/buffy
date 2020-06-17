import path from 'path'
import fs from 'fs'

export default (() => {
  // At the moment there is only one mode:
  // eslint-disable-next-line no-unused-vars
  let mode
  let symbol
  let provider
  let defaultQuantity
  let tradesFile
  let openPositionsFile
  let initialBalance
  let currentBalance
  const saveTrade = ({action, quantity, price, type, limit, timestamp}) => {
    fs.writeFileSync(tradesFile, `${action};${quantity};${price};${type};${limit};${timestamp};${currentBalance};
`, {flag: 'a'})
  }
  const saveOpenPosition = newPos => {
    const openPositions = JSON.parse(fs.readFileSync(openPositionsFile, {encoding: 'utf8'}))
    saveTrade(newPos)
    fs.writeFileSync(openPositionsFile, JSON.stringify(openPositions.concat([newPos]), null, 2))
  }
  return {
    init: (initData) => {
      mode = initData.mode || 'backtest'
      symbol = initData.symbol
      provider = initData.provider
      defaultQuantity = initData.quantity
      tradesFile = path.join(initData.tradeDir, 'trades.csv')
      openPositionsFile = path.join(initData.tradeDir, 'openPositions.json')
      fs.writeFileSync(tradesFile, 'action;quantity;price;type;limit;timestamp;balance;\n')
      fs.writeFileSync(openPositionsFile, '[]')
      initialBalance = Number(initData.initialBalance)
      currentBalance = initialBalance
    },
    openPosition: ({action, price, type, limit, quantity}) => {
      defaultQuantity = quantity || defaultQuantity
      const timestamp = (new Date()).valueOf()
      const positionId = `${provider}_${symbol}_${action}_${timestamp}`
      const newPos = {positionId, timestamp, action, quantity: quantity || defaultQuantity, price, type: type || 'market', limit: limit || ''}
      saveOpenPosition(newPos)
      return positionId
    },
    closePosition: (positionId, closePrice) => {
      const openPositions = JSON.parse(fs.readFileSync(openPositionsFile, {encoding: 'utf8'}))
      const posIndex = openPositions.findIndex(pos => pos.positionId === positionId)
      const position = openPositions[posIndex]
      currentBalance += ((closePrice * position.quantity) - (position.price * position.quantity))
      saveTrade({...position, ...{action: 'sell', price: closePrice}})
      fs.writeFileSync(openPositionsFile, JSON.stringify(openPositions.slice(0, posIndex - 1).concat(openPositions.slice(posIndex + 1))))
      return currentBalance
    }
  }
})()
