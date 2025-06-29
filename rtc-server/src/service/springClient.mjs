import axios from 'axios';
const client = axios.create({
  baseURL: process.env.API_URL, 
  // https://thebridgehub.org/api
  headers: { 'Content-Type': 'application/json' }
});

export async function validateUserToken(token) {
  const res = await client.get('/members/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data; 
  // { id, username, ... }
}
