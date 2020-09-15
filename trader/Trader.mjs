export class Trader {
  constructor(initData) {
    this.mode = initData.mode || 'backtest'
    this.symbol = initData.symbol
    this.provider = initData.provider
    this.defaultQuantity = initData.quantity
    this.quantityType = initData.quantityType
    this.initialBalance = initData.initialBalance
    this.balance = this.initialBalance
    this.openPositions = [] // all open positions
    this.openedPositions = [] // positions opened on last tick
    this.closedPositions = [] // positions closed on last tick
    this.trades = []
  }

  openPosition({action, price, type, limit, quantity, timestamp}) {
    this.defaultQuantity = quantity || this.defaultQuantity
    const positionId = `${this.provider}_${this.symbol}_${action}_${timestamp}`
    const newPos = {
      positionId,
      timestamp,
      action,
      quantity: quantity || this.defaultQuantity,
      price,
      type: type || 'market',
      limit: limit || '',
      balance: this.balance
    }
    this.openPositions.push(newPos)
    this.openedPositions.push(newPos)
    this.trades.push({...newPos, ...{balance: this.balance}})
    return positionId
  }

  closePosition({positionId, price, timestamp}) {
    const posIndex = this.openPositions.findIndex(pos => pos.positionId === positionId)
    if (posIndex === -1) {
      console.log('Could not find the postitionId', positionId, 'to close it')
    }
    const position = this.openPositions[posIndex]
    this.closedPositions.push({...position, ...{action: 'sell', price, timestamp, balance: this.balance}})
    this.openedPositions = this.openedPositions.slice(0, posIndex).concat(this.openedPositions.slice(posIndex + 1))
    this.openPositions = this.openPositions.slice(0, posIndex).concat(this.openPositions.slice(posIndex + 1))
    this.balance = this.quantityType === 'Shares'
      ? this.balance + ((price * position.quantity) - (position.price * position.quantity))
      : this.balance + (position.quantity/position.price * price) - position.quantity
    // this.trades.push({...position, ...{action: 'sell', price, timestamp, balance: this.balance}})
  }

  getTrades() {
    const positions = {
      opened: this.openedPositions,
      closed: this.closedPositions
    }
    this.openedPositions = []
    this.closedPositions = []
    return positions
  }

  getPositionById(positionId) {
    return this.openPositions.find(pos => pos.positionId === positionId)
  }
}
