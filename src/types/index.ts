export type UserRole = 'user' | 'admin_level2' | 'admin_level1';

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  nif?: string;
  country: string;
  role: UserRole;
  isActive: boolean;
  queriesRemaining: number;
  totalQueriesUsed: number;
  activePlanId: string | null;
  activePlanName: string | null;
  planExpiresAt: string | null;
  isImportUnlocked: boolean;
  isBatchUnlocked: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface BankAccount {
  id: string;
  bankName: string;
  iban: string;
  swift?: string;
  holder: string;
  currency?: string;
  isActive: boolean;
}

export interface VatOption {
  n: string;
  r: number;
}

export interface CountryFiscal {
  code: string;
  name: string;
  curr: string;
  agency: string;
  vatOptions: VatOption[];
  ii: number; // Industrial / corporate tax %
  tpa: number; // Default card fee %
  margins: number[];
  defaultCustomsRate?: number;
}

export interface Plan {
  id: string;
  name: string;
  priceKz: number;
  queriesCount: number;
  validityDays: number;
  unitPriceKz?: number;
  features: string[];
  unlocksImport: boolean;
  unlocksBatch: boolean;
  isCustom?: boolean;
  minPriceKz?: number;
  badge?: string;
  sortOrder: number;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amountKz: number;
  queriesGranted: number;
  validityDays: number;
  paymentMethod: string;
  paymentProofUrl?: string;
  paymentReference?: string;
  notes?: string;
  status: TransactionStatus;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface QueryHistoryItem {
  id: string;
  userId: string;
  type: 'local' | 'import' | 'batch';
  itemType?: 'product' | 'service';
  title: string;
  description: string;
  countryCode: string;
  costBase: number;
  vatRate: number;
  marginApplied: number;
  finalPrice: number;
  netProfit: number;
  retentionRate?: number;
  retentionAmount?: number;
  netReceived?: number;
  currency: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface BotKnowledgeItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  language: string;
  category?: string;
  isApproved: boolean;
  learnedFromAdminId?: string;
  learnedFromAdminName?: string;
  learnedAt: string;
}

export interface UnresolvedBotQuestion {
  id: string;
  sessionId: string;
  userName: string;
  userEmail?: string;
  question: string;
  detectedLanguage: string;
  importance: 'low' | 'normal' | 'high';
  status: 'pending' | 'ignored' | 'answered';
  adminAnswer?: string;
  answeredByAdminId?: string;
  answeredByAdminName?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  details: string;
  createdAt: string;
}

export interface FiscalProposal {
  id: string;
  countryCode: string;
  countryName: string;
  taxType: 'IVA' | 'II' | 'DU' | 'PautaAduaneira';
  currentValue: number | string;
  proposedValue: number | string;
  sourceLaw: string;
  reason: string;
  detectedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  system: 'xd' | 'winrest' | 'primavera' | 'sap' | 'phc' | 'sage' | 'custom';
  permissions: string[];
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string;
}

export interface SystemSettings {
  unitQueryPriceKz: number;
  minCustomPlanPriceKz: number;
  freeQueriesOnRegister: number;
  freeQueriesDaily: number;
  whatsappSupport1: string;
  whatsappSupport2: string;
  supportEmail: string;
  companyName: string;
  companyAddress: string;
  companyNif?: string;
  companyPhone1?: string;
  companyPhone2?: string;
  companyEmail1?: string;
  companyEmail2?: string;
  companyLogoUrl?: string;
  footerCopyrightText?: string;
  
  // Central MySQL connection
  mysqlHost?: string;
  mysqlPort?: number;
  mysqlDatabase?: string;
  mysqlUser?: string;
  mysqlPassword?: string;
  mysqlSsl?: boolean;
  mysqlStatus?: 'connected' | 'configured' | 'offline';

  // Electronic payments & EMIS
  emisEnabled?: boolean;
  emisEntityId?: string;
  emisTerminalId?: string;
  emisApiKey?: string;
  emisWebhookUrl?: string;
  emisAutoActivate?: boolean;
  visaMastercardEnabled?: boolean;
  paypalEnabled?: boolean;
  paypalClientId?: string;
  wiseEnabled?: boolean;
  stripeEnabled?: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;

  // Support & Chat
  chatBotEnabled?: boolean;
  chatAdminHoursStart?: string;
  chatAdminHoursEnd?: string;
  chatWelcomeMessage?: string;
  chatOfflineMessage?: string;
  chatMaxInactivityMinutes?: number;

  // Security & 2FA
  twoFactorAuthEnabled?: boolean;
  cyberSecurityAiEnabled?: boolean;
  blockedIps?: string[];

  // Social & Marketing
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitterX?: string;
  socialLinkedIn?: string;
  socialMessenger?: string;
  socialTikTok?: string;
  socialSnapchat?: string;
  socialWhatsApp?: string;
  socialYouTube?: string;

  // Themes
  activeThemeId?: string;
  autoHolidayThemeEnabled?: boolean;

  // Fiscal AI
  fiscalAiAutoCheckEnabled?: boolean;

  // Marketing & Google AdSense
  googleAdsenseEnabled?: boolean;
  googleAdsensePublisherId?: string;
  googleAdsenseSlotId?: string;

  bankName: string;
  bankIban: string;
  bankHolder: string;
  expressPhone: string;
  bankAccounts?: BankAccount[];
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

export interface SupportInquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  userEmail?: string;
  senderType: 'user' | 'admin' | 'bot';
  senderName: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  timestamp: string;
  isRead?: boolean;
}

export interface AppTheme {
  id: string;
  name: string;
  category: 'angola_holiday' | 'corporate' | 'modern_dark' | 'professional_light' | 'special';
  holidayDate?: string; // DD/MM for automatic activation
  holidayName?: string;
  primaryColor: string;
  accentColor: string;
  bgDark: string;
  cardBg: string;
  badgeBg: string;
  description: string;
}
