import path from 'path'
import fs from 'fs'

export {
  openPosition,
  closePosition
}

const openPositionsFile = path.join(path.resolve(), 'data', 'openPositions.json')

/**
 * Open Position
 *
 * @param {'backtest'|'paper'|'live'} mode
 * @param {string} symbol
 * @param {string} provider
 * @param {number} quantity
 * @param {'buy'|'sell'} action
 * @param {'market'|'limit'} [type='market']
 * @param {number} [limit] - If type is 'limit' where to set the limit price
 * @returns {string} positionId
 */
function openPosition(mode, symbol, provider, quantity, action, type = 'market', limit) {
  const timestamp = (new Date()).valueOf()
  const positionId = `${provider}_${symbol}_${action}_${timestamp}`
  const newPos = {positionId, timestamp, mode, symbol, provider, quantity, action, type, limit}
  addToOpenPositions(newPos)
  return positionId
}

/**
 * Close a previously opened position by positionId
 *
 * @param {string} positionId - Eg. "bitfinex_BTCEUR_buy_1591657517651"
 * @returns
 */
function closePosition(positionId) {
  return removeFromOpenPositions(positionId)
}

function addToOpenPositions(newPos) {
  const openPositions = JSON.parse(fs.readFileSync(openPositionsFile, {encoding: 'utf8'}))
  fs.writeFileSync(openPositionsFile, JSON.stringify(openPositions.concat([newPos])))
}

function removeFromOpenPositions(positionId) {
  const openPositions = JSON.parse(fs.readFileSync(openPositionsFile, {encoding: 'utf8'}))
  const posIndex = openPositions.findIndex(pos => pos.positionId === positionId)
  fs.writeFileSync(openPositionsFile, JSON.stringify(openPositions.slice(0, posIndex - 1).concat(openPositions.slice(posIndex + 1))))
}