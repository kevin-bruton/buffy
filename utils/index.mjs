import fs from 'fs'

export {
  printProgress,
  csvToJs
}

/**
 * Prints to the console the progress of something
 * @param {number} current - The current number that represents the progress
 * @param {number} total - Total number to show
 */
function printProgress(current, total) {
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  process.stdout.write(`${current}/${total}`)
  if (current === total) {
    console.log('')
  }
}

function csvToJs(filepath, separator = ';') {
  const content = fs.readFileSync(filepath, {encoding: 'utf8'})
  const linesWithHeading = content.split('\n')
  const csvHeadingStr = linesWithHeading[0]
  const csvLines = linesWithHeading.slice(1)
  const propertyNames = csvHeadingStr.split(separator)
  return csvLines.map(line => {
    const values = line.split(separator)
    return propertyNames.reduce((acc, cur, i) => ({...acc, ...{[cur]: values[i]}}), {})
  })
}