export class Trader {
  constructor(initData) {
    this.mode = initData.mode || 'backtest'
    this.symbol = initData.symbol
    this.provider = initData.provider
    this.defaultQuantity = initData.quantity
    this.quantityType = initData.quantityType
    this.initialBalance = Number(initData.initialBalance)
    this.currentBalance = this.initialBalance
    this.openPositions = []
    this.trades = []
  }

  openPosition({action, price, type, limit, quantity, timestamp}) {
    this.defaultQuantity = quantity || this.defaultQuantity
    const positionId = `${this.provider}_${this.symbol}_${action}_${timestamp}`
    const newPos = {positionId, timestamp, action, quantity: quantity || this.defaultQuantity, price, type: type || 'market', limit: limit || ''}
    this.openPositions.push(newPos)
    this.trades.push({...newPos, ...{balance: this.currentBalance}})
    return positionId
  }

  closePosition({positionId, price, timestamp}) {
    const posIndex = this.openPositions.findIndex(pos => pos.positionId === positionId)
    const position = this.openPositions[posIndex]
    this.openPositions = this.openPositions.slice(0, posIndex).concat(this.openPositions.slice(posIndex + 1))
    this.currentBalance = this.quantityType === 'Shares'
      ? this.currentBalance + ((price * position.quantity) - (position.price * position.quantity))
      : this.currentBalance + (position.quantity/position.price * price) - position.quantity
    this.trades.push({...position, ...{action: 'sell', price, timestamp, balance: this.currentBalance}})
    return this.currentBalance
  }

  getTrades() {
    return this.trades
  }
}
