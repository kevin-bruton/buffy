import fs from 'fs'
import path from 'path'

export class LinePlot {
  constructor({name, color, strategy}) {
    this.name = name
    this.color = color
    this.points = []
    this.strategy = strategy
  }

  /**
   * Adds a point to the line
   *
   * @param {Array<number>} point - Array with two elements for x and y values
   * @memberof LinePlot
   */
  addPoint(point) {
    this.points.push(point)
  }

  save() {
    const filepath = path.join(this.strategy.backTestDir, `lines-${this.name}.json`)
    fs.writeFileSync(filepath, JSON.stringify({
      name: this.name,
      color: this.color,
      points: this.points
    }))
    const overviewJson = fs.readFileSync(path.join(this.strategy.backTestDir, 'overview.json'), {encoding: 'utf8'})
    const overview = JSON.parse(overviewJson)
    overview.linesToPlot.push(this.name)
    fs.writeFileSync(path.join(this.strategy.backTestDir, 'overview.json'), JSON.stringify(overview))
  }
}
