import { UserSafe, UserRole } from '../types';

export const BACKOFFICE_ROLES: UserRole[] = [
  'super_admin',
  'superadmin',
  'admin_level1',
  'admin_level2',
  'admin',
  'manager',
  'staff'
];

/**
 * Checks if a user has staff, admin or super-admin privileges (Backoffice access)
 */
export function isStaffOrAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return BACKOFFICE_ROLES.some((r) => r.toLowerCase() === normalized);
}

/**
 * Checks if a user is a super administrator (admin_level1, super_admin, superadmin)
 */
export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return ['super_admin', 'superadmin', 'admin_level1'].includes(normalized);
}

/**
 * Checks if a user is a client (frontend access only)
 */
export function isClientUser(role?: string | null): boolean {
  return !isStaffOrAdmin(role);
}

/**
 * Formats a friendly label for the role
 */
export function getRoleDisplayLabel(role?: string | null): string {
  if (!role) return 'Visitante';
  switch (role.toLowerCase()) {
    case 'super_admin':
    case 'superadmin':
    case 'admin_level1':
      return 'Super Administrador';
    case 'admin':
    case 'admin_level2':
      return 'Administrador';
    case 'manager':
      return 'Gestor Comercial';
    case 'staff':
      return 'Staff Utilizador';
    case 'client':
    case 'user':
    default:
      return 'Cliente';
  }
}

/**
 * Validates whether a user can perform a simulation in any module:
 * - Unauthenticated: requires login with client or staff account
 * - Client: MUST have queriesRemaining > 0
 * - Staff / Admin / Super Admin: permitted to test & simulate
 */
export function canUserSimulate(user: UserSafe | null): {
  allowed: boolean;
  reason: 'not_authenticated' | 'no_credits' | 'ok';
  message: string;
} {
  if (!user) {
    return {
      allowed: false,
      reason: 'not_authenticated',
      message: 'Para utilizar qualquer simulação nos módulos, é necessário iniciar sessão na sua conta de cliente (ou registar-se) e ter créditos ativos na conta.'
    };
  }

  // Staff and Admins have access for operational testing
  if (isStaffOrAdmin(user.role)) {
    return {
      allowed: true,
      reason: 'ok',
      message: 'Acesso autorizado (Staff / Admin).'
    };
  }

  // Client role: must have credits remaining
  if ((user.queriesRemaining ?? 0) <= 0) {
    return {
      allowed: false,
      reason: 'no_credits',
      message: 'A sua conta de cliente não possui créditos disponíveis (Saldo: 0). É obrigatório ter créditos na conta para utilizar qualquer módulo de simulação. Por favor, adira a um plano ou carregue o seu saldo.'
    };
  }

  return {
    allowed: true,
    reason: 'ok',
    message: `Acesso concedido. Saldo disponível: ${user.queriesRemaining} consultas.`
  };
}
