import {
  BankAccount,
  DatabaseEngineConfig,
  AdsenseSlotConfig,
  SupportTicket,
  FiscalNotification,
  ApiIntegrationConfig,
  MarketingCampaign,
  ManualPaymentValidation,
  ConsultingAuditEntry,
  UserSafe
} from '../types';

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];
export const INITIAL_DB_ENGINES: DatabaseEngineConfig[] = [];
export const INITIAL_ADSENSE_SLOTS: AdsenseSlotConfig[] = [];
export const INITIAL_TICKETS: SupportTicket[] = [];
export const INITIAL_FISCAL_NOTIFICATIONS: FiscalNotification[] = [];
export const INITIAL_API_CONFIGS: ApiIntegrationConfig[] = [];
export const INITIAL_CLIENTS: UserSafe[] = [];

// Apenas o Super Administrador permanece
export const INITIAL_STAFF_USERS: UserSafe[] = [
  {
    id: 'usr_super_01',
    name: 'Joaquim Monteiro',
    email: 'joaquim.monteiro@nanucloud.com',
    role: 'super_admin',
    department: 'Direção Geral',
    country: 'Angola',
    phone: '+244 954 269 353',
    company: 'NANUCLOUD Direção Geral',
    permissionGroupId: 'grp_super_admin',
    isActive: true,
    queriesRemaining: 999999,
    totalQueriesUsed: 0,
    activePlanId: 'plan_superadmin',
    activePlanName: 'Licença Master Super Admin',
    planExpiresAt: null,
    isImportUnlocked: true,
    isBatchUnlocked: true,
    isApiUnlocked: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
];

export const INITIAL_MANUAL_PAYMENTS: ManualPaymentValidation[] = [];
export const INITIAL_AUDIT_LOGS: ConsultingAuditEntry[] = [];
