import dotenv from 'dotenv';
dotenv.config();

export const iceServers = [
  { urls: process.env.STUN_URL },
  {
    urls: process.env.TURN_URL,
    username: process.env.TURN_USERNAME,
    credential: process.env.TURN_CREDENTIAL
  }
];