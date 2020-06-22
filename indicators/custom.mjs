export class TrailingLongStop {
  constructor({priceMargin}) {
    this.maxPrice = 0
    this.priceMargin = priceMargin
  }

  shouldStop(currentPrice) {
    this.maxPrice = this.maxPrice > currentPrice ? this.maxPrice : currentPrice
    const stop = (this.maxPrice - currentPrice) > this.priceMargin
    if (stop) {
      this.maxPrice = 0
    }
    console.log('currentPrice:', currentPrice, 'maxPrice:', this.maxPrice, 'diff:', (this.maxPrice - currentPrice), 'margin:', this.priceMargin, 'stop:', stop)
    return stop
  }
}