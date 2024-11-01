import mysql from 'mysql2/promise'

export const db = mysql.createPool({
  host: 'ltuwiz.cn6kgi0si6vw.eu-north-1.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'ltuwizard123',
  database: 'system'
}) 