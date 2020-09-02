import {dbOpen, dbGet, dbRun, dbClose} from './db.mjs'
import {encrypt, decrypt} from './encryption.mjs'

export {
  getKeyValue,
  saveKeyValue
}

const tableName = 'keys'

function getKeyValue(key) {
  const db = dbOpen()
  const result = dbGet(db, `SELECT value FROM ${tableName} WHERE key='${key}';`)
  dbClose(db)
  return result && decrypt(result.value)
}

function saveKeyValue(key, value) {
  const encryptedKeyValue = encrypt(value)
  const db = dbOpen()
  dbRun(db, `CREATE TABLE IF NOT EXISTS ${tableName} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`)
  dbRun(db, `INSERT INTO ${tableName}(key, value) VALUES ('${key}', '${encryptedKeyValue}')`)
  dbClose(db)
}

// saveKeyValue('keyName', 'value')
// console.log(getKeyValue('keyName'))
