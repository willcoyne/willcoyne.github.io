const mysql = require('mysql2/promise')
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env

let pool

function initPool(){
  if(pool) return pool
  pool = mysql.createPool({
    host: DB_HOST || '127.0.0.1',
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'willcoyne',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  return pool
}

module.exports = { initPool }
