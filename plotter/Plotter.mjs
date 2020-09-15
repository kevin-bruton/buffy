export class Plotter {
  constructor() {
    this.lines = {}
    this.linesDef = {}
    this.pointsToAdd = []
  }

  defineLines(linesDef) {
    linesDef.forEach(lineDef => {
      this.linesDef[lineDef.name] = {color: lineDef.color}
    })
  }

  addPointsToLines(toAdd) {
    toAdd.forEach(lineUpdate => {
      this.lines[lineUpdate.line] = {
        ...this.linesDef[lineUpdate.line],
        ...{price: lineUpdate.price, timestamp: this.timestamp}
      }
    })
  }

  setTimestamp(timestamp) {
    this.timestamp = timestamp
  }

  getPointsToAddToLines() {
    const lines = {...this.lines}
    this.lines = {}
    return lines
  }
}
