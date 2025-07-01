import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'liberty',
  database: 'thebridgehub',
  waitForConnections: true,
  connectionLimit: 10,
})
