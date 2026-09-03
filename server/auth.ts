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

export function isStaffOrAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return [
    'super_admin',
    'superadmin',
    'admin_level1',
    'admin_level2',
    'admin',
    'manager',
    'staff'
  ].includes(normalized);
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
    // Token invalid or expired
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
    return res.status(401).json({
      error: 'Autenticação necessária para aceder ao Backoffice.',
      code: 'UNAUTHORIZED'
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'A sua conta foi desativada pela administração.',
      code: 'ACCOUNT_DISABLED'
    });
  }

  const isAuthorized = isStaffOrAdminRole(req.user.role);

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Acesso negado ao Backoffice. A sua conta de cliente tem acesso exclusivo ao Front-End. O Backoffice é restrito a Staff Utilizadores e Administradores.',
      code: 'FORBIDDEN_CLIENT_ONLY'
    });
  }

  next();
}

export function requireAdminLevel1(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação de Super Administrador necessária.',
      code: 'UNAUTHORIZED'
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'A sua conta foi desativada pela administração.',
      code: 'ACCOUNT_DISABLED'
    });
  }

  const role = (req.user.role as string || '').toLowerCase().trim();
  const isAuthorized = ['admin_level1', 'super_admin', 'superadmin'].includes(role);

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Acesso negado. Ação restrita a Super Administradores do sistema.',
      code: 'FORBIDDEN_SUPER_ADMIN_ONLY'
    });
  }

  next();
}
