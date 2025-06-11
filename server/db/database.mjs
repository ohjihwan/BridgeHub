import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { config } from "../config.mjs";

dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || config.db.host,
  user:     process.env.DB_USER     || config.db.user,
  password: process.env.DB_PASS     || config.db.password,
  database: process.env.DB_NAME     || config.db.database,
   waitForConnections: true,
   connectionLimit:    10,
   queueLimit:         0,
 });

export default pool;