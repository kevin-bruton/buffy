export class Plotter {
  constructor() {
    this.lines = {}
  }

  addLine(name, color) {
    const line = {color, points: []}
    this.lines[name] = line
  }

  /**
  * @param {Array} point - Array of objects with two properties: timestamp and price
  */
  addPointToLine(lineName, point) {
    if (point.price) {
      this.lines[lineName] = {
        color: this.lines[lineName].color,
        points: this.lines[lineName].points.concat([point])
      }
    }
  }

  /**
   * To be used by the Trader only
   */
  getLinesToPlot() {
    return Object.keys(this.lines).map(name  => ({
      name,
      color: this.lines[name].color,
      points: this.lines[name].points
    }))
  }
}

/* const plotter = new Plotter()
plotter.addLine('EMA', 'black')
plotter.addPointToLine('EMA', {timestamp: 234, price: 45})
plotter.addPointToLine('EMA', {timestamp: 222, price: 44})
const lines = plotter.getLinesToPlot()
console.log('getlines:', JSON.stringify(lines))
console.log('lines:', JSON.stringify(plotter.lines))

Output:
getlines: [{"name":"EMA","color":"black","points":[{"timestamp":234,"price":45},{"timestamp":222,"price":44}]}]
lines: {"EMA":{"color":"black","points":[{"timestamp":234,"price":45},{"timestamp":222,"price":44}]}} */
