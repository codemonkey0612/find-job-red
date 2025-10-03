import * as express from 'express';
import jwt from 'jsonwebtoken';
import type { User } from '../database/schema.js';

export interface AuthRequest extends Omit<express.Request, 'user'> {
  user?: User;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    (req as AuthRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      password_hash: null, // We don't include this in JWT
      name: '', // We don't include this in JWT
      email_verified: false, // We don't include this in JWT
      auth_provider: 'local', // We don't include this in JWT
      provider_id: null, // We don't include this in JWT
      avatar_url: null, // We don't include this in JWT
      created_at: '',
      updated_at: ''
    } as User;
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
  
};

export const requireRole = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

export const optionalAuth = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    (req as AuthRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      password_hash: null,
      name: '',
      email_verified: false,
      auth_provider: 'local',
      provider_id: null,
      avatar_url: null,
      created_at: '',
      updated_at: ''
    } as User;
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next();
};
