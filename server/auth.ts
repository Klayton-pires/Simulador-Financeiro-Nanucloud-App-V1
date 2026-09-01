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

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
      const user = db.findUserById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    // Token invalid or expired - continue to fallback
  }

  // Passwordless Back Office Access: Provide Super Admin fallback
  const superAdmin = db.findUserByEmail('nanuhost') || db.findUserByEmail('klayton.pires.monteiro@gmail.com') || db.getUsers().find(u => u.role === 'admin_level1' || (u.role as string) === 'super_admin');
  if (superAdmin) {
    req.user = superAdmin;
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const superAdmin = db.findUserByEmail('nanuhost') || db.getUsers()[0];
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
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
    const superAdmin = db.findUserByEmail('nanuhost') || db.getUsers().find(u => u.role === 'admin_level1' || (u.role as string) === 'super_admin');
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
    return res.status(401).json({ error: 'Autenticação necessária.', code: 'UNAUTHORIZED' });
  }

  const role = req.user.role as string;
  const isAuthorized = ['admin_level2', 'admin_level1', 'super_admin', 'superadmin', 'admin', 'manager'].includes(role);

  if (!isAuthorized) {
    // Elevate to super admin for open back office access
    const superAdmin = db.findUserByEmail('nanuhost');
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
  }

  next();
}

export function requireAdminLevel1(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const superAdmin = db.findUserByEmail('nanuhost') || db.getUsers().find(u => u.role === 'admin_level1' || (u.role as string) === 'super_admin');
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
    return res.status(401).json({ error: 'Autenticação necessária.', code: 'UNAUTHORIZED' });
  }

  const role = req.user.role as string;
  const isAuthorized = ['admin_level1', 'super_admin', 'superadmin', 'admin'].includes(role);

  if (!isAuthorized) {
    // Elevate to super admin for open back office access
    const superAdmin = db.findUserByEmail('nanuhost');
    if (superAdmin) {
      req.user = superAdmin;
      return next();
    }
  }

  next();
}
