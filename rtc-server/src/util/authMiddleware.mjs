import { getSpringClient } from '../service/springClient.mjs';
import * as logger from './logger.mjs';

const springClient = getSpringClient();

export default async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    const username = socket.handshake.auth.username;
    
    logger.debug(`Authentication attempt for socket ${socket.id}`, {
      hasToken: !!token,
      username: username
    });

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        socket.user = {
          id: socket.id,
          username: username || 'Anonymous',
          role: 'user',
          authenticated: false
        };
        logger.warn(`Development mode: allowing connection without token for ${socket.id}`);
        return next();
      }
      
      logger.warn(`Authentication failed: No token provided for ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    const validationResult = await springClient.validateToken(token);
    
    if (validationResult.valid) {
      socket.user = {
        ...validationResult.user,
        authenticated: true,
        token: token
      };
      
      logger.log(`User authenticated successfully: ${socket.user.username || socket.user.id} (${socket.id})`);
      next();
    } else {
      logger.warn(`Authentication failed for ${socket.id}: ${validationResult.error}`);
      
      if (process.env.NODE_ENV === 'development') {
        socket.user = {
          id: socket.id,
          username: username || 'Anonymous',
          role: 'user',
          authenticated: false,
          authError: validationResult.error
        };
        logger.warn(`Development mode: allowing connection despite token error for ${socket.id}`);
        return next();
      }
      
      next(new Error(`Authentication error: ${validationResult.error}`));
    }
    
  } catch (error) {
    logger.error(`Authentication error for ${socket.id}:`, error);
    
    if (process.env.NODE_ENV === 'development') {
      socket.user = {
        id: socket.id,
        username: socket.handshake.auth.username || 'Anonymous',
        role: 'user',
        authenticated: false,
        authError: error.message
      };
      logger.warn(`Development mode: allowing connection despite auth exception for ${socket.id}`);
      return next();
    }
    
    next(new Error('Authentication error: Internal server error'));
  }
}
