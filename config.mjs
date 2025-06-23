import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  jwtSecret:       process.env.JWT_SECRET,
  jwtExpiresSec:   Number(process.env.JWT_EXPIRES_SEC) || 172800,
  bcryptSaltRounds:Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  server: {
    port: Number(process.env.HOST_PORT) || 7200,
  },
};