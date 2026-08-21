import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { User, UserRole } from './types.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'nanucloud_super_secure_session_secret_key_2026';
const TOKEN_EXPIRY = '7d';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.nanucloud_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = db.findUserById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Token invalid or expired - continue unauthenticated
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação necessária. Por favor, inicie sessão para aceder.',
      code: 'UNAUTHORIZED'
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'A sua conta foi desativada pela administração.',
      code: 'ACCOUNT_DISABLED'
    });
  }

  next();
}

export function requireAdminLevel2(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação necessária.', code: 'UNAUTHORIZED' });
  }

  if (req.user.role !== 'admin_level2' && req.user.role !== 'admin_level1') {
    return res.status(403).json({
      error: 'Acesso restrito a administradores (Nível 2 ou superior).',
      code: 'FORBIDDEN'
    });
  }

  next();
}

export function requireAdminLevel1(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação necessária.', code: 'UNAUTHORIZED' });
  }

  if (req.user.role !== 'admin_level1') {
    return res.status(403).json({
      error: 'Acesso restrito exclusivamente ao Super Administrador (Nível 1).',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }

  next();
}
