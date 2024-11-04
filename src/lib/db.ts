import mysql from 'mysql2/promise'

if (!process.env.DB_HOST) throw new Error('DB_HOST is not defined')
if (!process.env.DB_USER) throw new Error('DB_USER is not defined')
if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is not defined')
if (!process.env.DB_NAME) throw new Error('DB_NAME is not defined')

console.log('Connecting to database with host:', process.env.DB_HOST)

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// Test the connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully')
    connection.release()
  })
  .catch(err => {
    console.error('Failed to connect to database:', err)
    throw err
  }) 