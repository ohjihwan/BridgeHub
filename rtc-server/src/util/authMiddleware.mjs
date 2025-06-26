import { validateUserToken } from '../services/springClient.mjs';

export async function jwtAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace(/^Bearer\s+/, '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const userInfo = await validateUserToken(token);
    req.user = userInfo;   // { userId, roles, … }
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
