const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbName = 'bfx'
const dbLocation = path.join(path.resolve(), `db/data/${dbName}.db`)

;(async () => {
  let db 
  try {
    db = await openDb(dbName, dbLocation)
  } catch(err) {
    return
  }
  closeDb(db)
})()

function openDb(dbLocation) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbLocation, (err) => {
      if (err) {
        reject(err.message);
      }
      console.log(`Connected to the ${dbName} SQlite database.`);
      resolve(db)
    })
  })
}

function closeDb(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err.message);
      }
      console.log(`Closed the ${dbName} database connection.`);
      resolve()
    })
  })
}


