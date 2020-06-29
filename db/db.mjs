import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import os from 'os'

export {
  dbOpen,
  dbGet,
  dbAll,
  dbRun,
  dbClose
}

function dbOpen() {
  const dbName = 'buffy'
  const baseDir = path.join(os.homedir(), '.buffy')
  if (!fs.existsSync(baseDir)){
    fs.mkdirSync(baseDir);
  }
  const dbLocation = path.join(baseDir, `${dbName}.db`)
  const db = new Database(dbLocation, /* { verbose: console.log } */);
  return db
}

function dbGet(db, sql) {
  const stmt = db.prepare(sql)
  return stmt.get()
}

function dbAll(db, sql) {
  const stmt = db.prepare(sql)
  return stmt.all()
}

function dbRun(db, sql) {
  const stmt = db.prepare(sql)
  return stmt.run()
}

function dbClose(db) {
  db.close()
}


/* ;(async () => {
  let db 
  try {
    db = await openDb(dbName, dbLocation)
  } catch(err) {
    return
  }
  closeDb(db)
})() */


