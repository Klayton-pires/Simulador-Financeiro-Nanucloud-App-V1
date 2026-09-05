import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Plan, 
  Transaction, 
  TransactionStatus,
  QueryHistoryItem, 
  AuditLog, 
  SystemSettings, 
  SupportInquiry, 
  BankAccount, 
  ChatMessage,
  FiscalProposal,
  ApiKeyItem,
  BotKnowledgeItem,
  UnresolvedBotQuestion,
  SmsLogItem,
  TrafficCampaign,
  OtpVerificationCode
} from './types.js';
import { sqliteDb } from './sqliteDb.js';

interface DatabaseSchema {
  users: User[];
  plans: Plan[];
  transactions: Transaction[];
  queryHistory: QueryHistoryItem[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  supportInquiries: SupportInquiry[];
  chatMessages: ChatMessage[];
  fiscalProposals?: FiscalProposal[];
  apiKeys?: ApiKeyItem[];
  botKnowledgeBase?: BotKnowledgeItem[];
  unresolvedBotQuestions?: UnresolvedBotQuestion[];
  smsLogs?: SmsLogItem[];
  trafficCampaigns?: TrafficCampaign[];
  otpCodes?: OtpVerificationCode[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nanucloud_db.json');

const DEFAULT_BOT_KNOWLEDGE: BotKnowledgeItem[] = [
  {
    id: 'kb_servicos_01',
    question: 'Como simular prestação de serviços e retenção na fonte?',
    keywords: ['servico', 'serviço', 'servicos', 'serviços', 'retencao', 'retenção', 'fonte', 'prestacao', 'prestação'],
    answer: 'O simulador NANUCLOUD permite simular tanto PRODUTOS como PRESTAÇÃO DE SERVIÇOS. Para serviços, preencha a taxa de Retenção na Fonte (%) regulamentar do país (ex: 6.5% em Angola conforme a prática fiscal de referência). O sistema calcula o valor bruto com IVA, deduz a retenção na fonte e taxas de TPA, e apresenta o montante líquido real a receber.',
    language: 'pt',
    category: 'fiscal',
    isApproved: true,
    learnedAt: new Date().toISOString()
  },
  {
    id: 'kb_aduaneira_02',
    question: 'Como funciona o cálculo de importação e despacho aduaneiro?',
    keywords: ['importacao', 'importação', 'aduana', 'aduaneiro', 'alfandega', 'alfândega', 'fob', 'cif', 'iec', 'pauta'],
    answer: 'No Módulo de Importação Aduaneira, introduza o valor FOB da mercadoria, Frete, Seguro, Direitos Aduaneiros (5% a 70%), Imposto Especial de Consumo (IEC), Taxa Estatística (10.000 Kz), TPS e IVA Aduaneiro (14%). O simulador calcula o custo de desembarque CIF e apura o preço de venda recomendado.',
    language: 'pt',
    category: 'customs',
    isApproved: true,
    learnedAt: new Date().toISOString()
  },
  {
    id: 'kb_en_03',
    question: 'How to calculate prices for products and services with tax retention?',
    keywords: ['service', 'services', 'retention', 'withholding', 'tax', 'product', 'vat', 'price'],
    answer: 'NANUCLOUD supports simulations for both PRODUCTS and SERVICES. For service contracts, enter the applicable Withholding/Retention Rate (%) based on local tax law (e.g. 6.5% in Angola). The engine calculates gross price with VAT, deducts withholding tax and POS transaction fees, and shows your real net revenue.',
    language: 'en',
    category: 'fiscal',
    isApproved: true,
    learnedAt: new Date().toISOString()
  },
  {
    id: 'kb_fr_04',
    question: 'Comment calculer les taxes pour produits et services avec retenue à la source?',
    keywords: ['service', 'services', 'retenue', 'source', 'tva', 'produit', 'impot', 'facture'],
    answer: 'Le simulateur NANUCLOUD s\'applique aux PRODUITS et aux SERVICES. Pour les prestations de services, indiquez le taux de retenue à la source (%) selon la législation fiscale du pays (ex. 6,5% en Angola). Le système calcule le prix TTC, déduit la retenue à la source et les frais TPA, et affiche le revenu net réel.',
    language: 'fr',
    category: 'fiscal',
    isApproved: true,
    learnedAt: new Date().toISOString()
  },
  {
    id: 'kb_es_05',
    question: '¿Cómo simular precios de productos y servicios con retención en la fuente?',
    keywords: ['servicio', 'servicios', 'retencion', 'retención', 'fuente', 'iva', 'producto', 'impuesto'],
    answer: 'El simulador NANUCLOUD permite calcular tanto PRODUCTOS como SERVICIOS. Para servicios, ingrese el porcentaje de Retención en la Fuente (%) según la ley tributaria de cada país (ej. 6.5% en Angola). El sistema calcula el PVP con IVA, deduce la retención y comisiones de TPA, mostrando la ganancia neta líquida real.',
    language: 'es',
    category: 'fiscal',
    isApproved: true,
    learnedAt: new Date().toISOString()
  }
];

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank_bai_01',
    bankName: 'Banco Angolano de Investimentos (BAI)',
    iban: 'AO06 0040 0000 0692 4329 1010 6',
    swift: 'BAIAOLLU',
    holder: 'KLAYTON PIRES',
    currency: 'AOA (Kz)',
    isActive: true
  },
  {
    id: 'bank_bfa_02',
    bankName: 'Banco de Fomento Angola (BFA)',
    iban: 'AO06 0006 0000 9745 7140 3018 1',
    swift: 'BFAAOLLU',
    holder: 'KLAYTON PIRES',
    currency: 'AOA (Kz)',
    isActive: true
  },
  {
    id: 'bank_bma_03',
    bankName: 'Banco Millennium Atlântico (BMA)',
    iban: 'AO06 0055 0000 2469 9241 1017 7',
    swift: 'BMAAOLLU',
    holder: 'KLAYTON PIRES',
    currency: 'AOA (Kz)',
    isActive: true
  },
  {
    id: 'bank_bic_04',
    bankName: 'Banco BIC Angola',
    iban: 'AO06 0051 0000 7027 5788 1519 5',
    swift: 'BICAOLLU',
    holder: 'KLAYTON PIRES',
    currency: 'AOA (Kz)',
    isActive: true
  }
];

const DEFAULT_FISCAL_PROPOSALS: FiscalProposal[] = [
  {
    id: 'prop_ao_iva_cesta',
    countryCode: 'AO',
    countryName: 'Angola',
    taxType: 'IVA',
    currentValue: '7% (Bens de Grande Consumo)',
    proposedValue: '5% (Proposta de Revisão das Taxas)',
    sourceLaw: 'Pauta e Normas Tributárias de Referência',
    reason: 'Harmonização da taxa reduzida sobre bens essenciais da cesta básica nacional.',
    detectedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending'
  },
  {
    id: 'prop_ao_pauta_agro',
    countryCode: 'AO',
    countryName: 'Angola',
    taxType: 'PautaAduaneira',
    currentValue: '10% Direitos Aduaneiros Fertilizantes',
    proposedValue: '2% Direitos Aduaneiros Insumos Agrícolas',
    sourceLaw: 'Pauta Aduaneira em Vigor',
    reason: 'Incentivo à produção agrícola nacional e redução do custo de insumos.',
    detectedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'pending'
  },
  {
    id: 'prop_mz_iva',
    countryCode: 'MZ',
    countryName: 'Moçambique',
    taxType: 'IVA',
    currentValue: '16%',
    proposedValue: '16% (Confirmado Decreto Tributário Autoridade Tributária Moçambique)',
    sourceLaw: 'Código do IVA Moçambicano atualizado',
    reason: 'Verificação periódica de conformidade com a AT Moçambique.',
    detectedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'approved',
    reviewedBy: 'Joaquim Monteiro (Super Admin)',
    reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const DEFAULT_API_KEYS: ApiKeyItem[] = [
  {
    id: 'api_key_xd_01',
    name: 'Integração XD Software POS',
    key: 'nc_live_xd_98234710298371928371',
    system: 'xd',
    permissions: ['simulate:local', 'tax:read'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastUsedAt: new Date().toISOString()
  },
  {
    id: 'api_key_primavera_02',
    name: 'Integração Primavera BSS ERP',
    key: 'nc_live_prm_48102983471092834710',
    system: 'primavera',
    permissions: ['simulate:local', 'simulate:import', 'tax:read'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastUsedAt: new Date().toISOString()
  }
];

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
    this.ensureDefaultUsersAndSettings();
    this.initSqliteSync();
  }

  private async initSqliteSync() {
    try {
      await sqliteDb.init();
      sqliteDb.syncFromObject(this.data);
      console.log('✅ Base de dados SQLite sincronizada com sucesso.');
    } catch (err) {
      console.error('Falha ao sincronizar SQLite inicial:', err);
    }
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.chatMessages) parsed.chatMessages = [];
        if (!parsed.fiscalProposals) parsed.fiscalProposals = DEFAULT_FISCAL_PROPOSALS;
        if (!parsed.apiKeys) parsed.apiKeys = DEFAULT_API_KEYS;
        if (!parsed.botKnowledgeBase || parsed.botKnowledgeBase.length === 0) {
          parsed.botKnowledgeBase = DEFAULT_BOT_KNOWLEDGE;
        }
        if (!parsed.unresolvedBotQuestions) parsed.unresolvedBotQuestions = [];
        if (!parsed.settings.bankAccounts || parsed.settings.bankAccounts.length === 0) {
          parsed.settings.bankAccounts = DEFAULT_BANK_ACCOUNTS;
        }
        return parsed;
      } catch (err) {
        console.error('Error reading database file, re-initializing default schema:', err);
      }
    }
    return this.initializeDefaultData();
  }

  private ensureDefaultUsersAndSettings() {
    const salt = bcrypt.genSaltSync(10);
    
    // Filter out old demo/test accounts, keeping only nanuhost, Klayton Pires and any real registered users
    this.data.users = this.data.users.filter(
      (u) =>
        u.email !== 'teste@nanucloud.com' &&
        u.email !== 'demo@nanucloud.com' &&
        u.email !== 'joaquim.monteiro@nanucloud.com' &&
        u.email !== 'gerente@nanucloud.com'
    );

    // 1. Ensure default Admin account (admin and nanuhost) have password *Angola@2030*
    const angolaHash = bcrypt.hashSync('*Angola@2030*', salt);

    // 1a. Ensure user 'admin' exists explicitly with password *Angola@2030*
    let adminAccount = this.data.users.find(
      (u) => u.email.toLowerCase() === 'admin' || u.id === 'usr_admin_default'
    );
    if (!adminAccount) {
      adminAccount = {
        id: 'usr_admin_default',
        name: 'Administrador (admin)',
        email: 'admin',
        phone: '+244954269353',
        company: 'NANUCLOUD Lda',
        address: 'Angola, Luanda',
        nif: '5001294819',
        country: 'AO',
        passwordHash: angolaHash,
        role: 'admin_level1',
        isActive: true,
        queriesRemaining: 999999,
        totalQueriesUsed: 0,
        activePlanId: 'plan_diamante',
        activePlanName: 'Diamante Ilimitado (Super Admin)',
        planExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        isImportUnlocked: true,
        isBatchUnlocked: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.data.users.unshift(adminAccount);
    } else {
      adminAccount.passwordHash = angolaHash;
      adminAccount.role = 'admin_level1';
      adminAccount.isActive = true;
      adminAccount.queriesRemaining = 999999;
      adminAccount.isImportUnlocked = true;
      adminAccount.isBatchUnlocked = true;
    }

    // 1b. Ensure user 'nanuhost' exists with password *Angola@2030*
    let nanuhostAccount = this.data.users.find(
      (u) => u.email.toLowerCase() === 'nanuhost' || u.id === 'usr_admin_nanuhost'
    );
    if (!nanuhostAccount) {
      const superAdminDefault: User = {
        id: 'usr_admin_nanuhost',
        name: 'nanuhost',
        email: 'nanuhost',
        phone: '+244954269353',
        company: 'NANUCLOUD Lda',
        address: 'Angola, Luanda',
        nif: '5001294819',
        country: 'AO',
        passwordHash: angolaHash,
        role: 'admin_level1',
        isActive: true,
        queriesRemaining: 999999,
        totalQueriesUsed: 0,
        activePlanId: 'plan_diamante',
        activePlanName: 'Diamante Ilimitado (Super Admin)',
        planExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        isImportUnlocked: true,
        isBatchUnlocked: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.data.users.unshift(superAdminDefault);
    } else {
      nanuhostAccount.id = 'usr_admin_nanuhost';
      nanuhostAccount.name = 'nanuhost';
      nanuhostAccount.email = 'nanuhost';
      nanuhostAccount.role = 'admin_level1';
      nanuhostAccount.isActive = true;
      nanuhostAccount.passwordHash = angolaHash;
      nanuhostAccount.isImportUnlocked = true;
      nanuhostAccount.isBatchUnlocked = true;
      nanuhostAccount.queriesRemaining = 999999;
    }

    // 2. Ensure Klayton Pires account is maintained (suporte@nanucloud.com / Super Admin)
    let klayton = this.findUserByEmail('suporte@nanucloud.com');
    if (!klayton) {
      const superAdminKlayton: User = {
        id: 'usr_klayton_pires',
        name: 'Klayton Pires',
        email: 'suporte@nanucloud.com',
        phone: '+244944935617',
        company: 'NANUCLOUD Lda',
        address: 'Angola, Luanda, Maianga',
        nif: '5417653438',
        country: 'AO',
        passwordHash: bcrypt.hashSync('admin123', salt),
        role: 'admin_level1',
        isActive: true,
        queriesRemaining: 999999,
        totalQueriesUsed: 20,
        activePlanId: 'plan_diamante',
        activePlanName: 'Diamante Ilimitado (Super Admin)',
        planExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        isImportUnlocked: true,
        isBatchUnlocked: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.data.users.push(superAdminKlayton);
    } else {
      klayton.id = 'usr_klayton_pires';
      klayton.name = 'Klayton Pires';
      klayton.role = 'admin_level1';
      klayton.isActive = true;
      klayton.isImportUnlocked = true;
      klayton.isBatchUnlocked = true;
      klayton.queriesRemaining = 999999;
      klayton.passwordHash = bcrypt.hashSync('admin123', salt);
    }

    // 3. Ensure a designated Staff member exists (Staff Utilizador - Backoffice access, no credit limits)
    let staffAccount = this.data.users.find(
      (u) => u.email.toLowerCase() === 'staff' || u.email.toLowerCase() === 'staff@nanucloud.com'
    );
    if (!staffAccount) {
      const staffDefault: User = {
        id: 'usr_staff_default',
        name: 'Técnico de Suporte (Staff)',
        email: 'staff@nanucloud.com',
        phone: '+244923000999',
        company: 'NANUCLOUD Lda',
        address: 'Angola, Luanda',
        nif: '5001294819',
        country: 'AO',
        passwordHash: angolaHash,
        role: 'staff',
        isActive: true,
        queriesRemaining: 999999,
        totalQueriesUsed: 0,
        activePlanId: 'plan_diamante',
        activePlanName: 'Plano Staff Operacional',
        planExpiresAt: null,
        isImportUnlocked: true,
        isBatchUnlocked: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.data.users.push(staffDefault);
    } else {
      staffAccount.role = 'staff';
      staffAccount.isActive = true;
    }

    // 4. Ensure a demonstration Client account exists (Cliente - Front-End only, must have credits)
    let clientAccount = this.data.users.find(
      (u) => u.email.toLowerCase() === 'cliente@nanucloud.com' || u.email.toLowerCase() === 'cliente'
    );
    if (!clientAccount) {
      const clientDefault: User = {
        id: 'usr_client_default',
        name: 'Cliente Comercial Nanucloud',
        email: 'cliente@nanucloud.com',
        phone: '+244923111222',
        company: 'Empresa Cliente Lda',
        address: 'Angola, Luanda, Talatona',
        nif: '5401928374',
        country: 'AO',
        passwordHash: bcrypt.hashSync('cliente123', salt),
        role: 'client',
        isActive: true,
        queriesRemaining: 10,
        totalQueriesUsed: 2,
        activePlanId: 'plan_bronze',
        activePlanName: 'Bronze Inicial (10 Consultas)',
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isImportUnlocked: false,
        isBatchUnlocked: false,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.data.users.push(clientDefault);
    }

    if (!this.data.botKnowledgeBase || this.data.botKnowledgeBase.length === 0) {
      this.data.botKnowledgeBase = DEFAULT_BOT_KNOWLEDGE;
    }
    if (!this.data.unresolvedBotQuestions) {
      this.data.unresolvedBotQuestions = [];
    }
    if (!this.data.settings.bankAccounts || this.data.settings.bankAccounts.length === 0) {
      this.data.settings.bankAccounts = DEFAULT_BANK_ACCOUNTS;
    }
    if (!this.data.chatMessages) {
      this.data.chatMessages = [];
    }
    if (!this.data.fiscalProposals) {
      this.data.fiscalProposals = DEFAULT_FISCAL_PROPOSALS;
    }
    if (!this.data.apiKeys) {
      this.data.apiKeys = DEFAULT_API_KEYS;
    }
    if (!this.data.settings.freeQueriesOnRegister) {
      this.data.settings.freeQueriesOnRegister = 3;
    }
    if (!this.data.settings.freeQueriesDaily) {
      this.data.settings.freeQueriesDaily = 3;
    }
    
    // Set company brand strictly to NANUCLOUD
    this.data.settings.companyName = 'NANUCLOUD';
    if (!this.data.settings.companyPhone1) {
      this.data.settings.companyPhone1 = '+244944935618';
      this.data.settings.companyPhone2 = '+244955581862';
      this.data.settings.companyEmail1 = 'geral@nanucloud.com';
      this.data.settings.companyEmail2 = 'suporte@nanucloud.com';
      //this.data.settings.companyNif = '5417653438';
      this.data.settings.footerCopyrightText = `© ${new Date().getFullYear()} Nanucloud. Todos os direitos reservados.`;
      this.data.settings.activeThemeId = 'theme_nanucloud_dark';
      this.data.settings.autoHolidayThemeEnabled = true;
      this.data.settings.fiscalAiAutoCheckEnabled = true;
      this.data.settings.twoFactorAuthEnabled = false;
      this.data.settings.cyberSecurityAiEnabled = true;
      this.data.settings.chatBotEnabled = true;
      this.data.settings.chatAdminHoursStart = '08:00';
      this.data.settings.chatAdminHoursEnd = '18:00';
      this.data.settings.emisEnabled = true;
      this.data.settings.visaMastercardEnabled = true;
      this.data.settings.paypalEnabled = true;
      this.data.settings.wiseEnabled = true;
    }

    // Ensure all standard plans have 30 days validity as mandated
    this.data.plans.forEach(p => {
      p.validityDays = 30;
      if (!p.unitPriceKz) p.unitPriceKz = 50;
    });

    this.save();
  }

  private initializeDefaultData(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);

    const superAdmin: User = {
      id: 'usr_super_admin_joaquim',
      name: 'Joaquim Monteiro',
      email: 'joaquim.monteiro@nanucloud.com',
      phone: '+244929462681',
      company: 'NANUCLOUD Lda',
      address: 'Angola, Luanda, Viana, Capalanca',
      nif: '5417653438',
      country: 'AO',
      passwordHash: bcrypt.hashSync('admin123', salt),
      role: 'admin_level1',
      isActive: true,
      queriesRemaining: 999999,
      totalQueriesUsed: 50,
      activePlanId: 'plan_diamante',
      activePlanName: 'Diamante Ilimitado (Super Admin)',
      planExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      isImportUnlocked: true,
      isBatchUnlocked: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const level2Admin: User = {
      id: 'usr_manager_admin_002',
      name: 'Gerente Comercial (Nível 2)',
      email: 'gerente@nanucloud.com',
      phone: '+244954269353',
      company: 'NANUCLOUD Comercial',
      address: 'Luanda, Maianga',
      nif: '5009876543',
      country: 'AO',
      passwordHash: bcrypt.hashSync('gerente123', salt),
      role: 'admin_level2',
      isActive: true,
      queriesRemaining: 5000,
      totalQueriesUsed: 15,
      activePlanId: 'plan_platina',
      activePlanName: 'Platina Executivo',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isImportUnlocked: true,
      isBatchUnlocked: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const demoUser: User = {
      id: 'usr_demo_client_003',
      name: 'teste1',
      email: 'teste1@teste.com',
      phone: '+244923000111',
      company: 'Monteiro Import & Export',
      address: 'Luanda, Viana',
      nif: '5412345678',
      country: 'AO',
      passwordHash: bcrypt.hashSync('cliente123', salt),
      role: 'user',
      isActive: true,
      queriesRemaining: 3,
      totalQueriesUsed: 0,
      activePlanId: null,
      activePlanName: 'Período Gratuito (3 Consultas)',
      planExpiresAt: null,
      isImportUnlocked: false,
      isBatchUnlocked: false,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null
    };

    // 5 Plans all standardized with 30-day validity
    const defaultPlans: Plan[] = [
      {
        id: 'plan_bronze',
        name: 'Plano Bronze',
        priceKz: 500,
        queriesCount: 10,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['10 Pesquisas / Simulações (50 Kz/cada)', 'Módulo Comércio Local Completo', 'Histórico e Exportação Excel', 'Validade 30 dias'],
        unlocksImport: false,
        unlocksBatch: false,
        badge: 'Iniciante',
        sortOrder: 1
      },
      {
        id: 'plan_prata',
        name: 'Plano Prata',
        priceKz: 1500,
        queriesCount: 30,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['30 Pesquisas / Simulações (50 Kz/cada)', 'Comércio Local + Análise de Margens', 'Relatórios & Exportação XLSX', 'Validade 30 dias'],
        unlocksImport: false,
        unlocksBatch: false,
        badge: 'Popular',
        sortOrder: 2
      },
      {
        id: 'plan_ouro',
        name: 'Plano Ouro Pro',
        priceKz: 3000,
        queriesCount: 60,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['60 Pesquisas / Simulações (50 Kz/cada)', '🚢 Desbloqueia Módulo de Importação Aduaneira (CIF/FOB/IEC)', 'Suporte Prioritário WhatsApp', 'Validade 30 dias'],
        unlocksImport: true,
        unlocksBatch: false,
        badge: 'Mais Recomendado',
        sortOrder: 3
      },
      {
        id: 'plan_platina',
        name: 'Plano Platina Business',
        priceKz: 5000,
        queriesCount: 100,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['100 Pesquisas / Simulações (50 Kz/cada)', '🚢 Módulo de Importação Desbloqueado', '📊 Módulo de Lote Excel (.xlsx) Desbloqueado', 'Validade 30 dias'],
        unlocksImport: true,
        unlocksBatch: true,
        badge: 'Empresarial',
        sortOrder: 4
      },
      {
        id: 'plan_diamante',
        name: 'Plano Diamante Enterprise',
        priceKz: 10000,
        queriesCount: 200,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['200 Pesquisas / Simulações (50 Kz/cada)', '🚢 Acesso Total Módulo Importação Ilimitado', '📊 Acesso Total Módulo Lote Excel', 'Atendimento VIP Dedicado', 'Validade 30 dias'],
        unlocksImport: true,
        unlocksBatch: true,
        badge: 'Ilimitado VIP',
        sortOrder: 5
      },
      {
        id: 'plan_custom',
        name: 'Plano Personalizado sob Medida',
        priceKz: 500,
        queriesCount: 10,
        validityDays: 30,
        unitPriceKz: 50,
        features: ['Defina o valor e número de consultas', 'Cálculo automático: 50 Kz por pesquisa', 'Desbloqueia Módulos de Importação e Lote', 'Validade 30 dias'],
        unlocksImport: true,
        unlocksBatch: true,
        isCustom: true,
        minPriceKz: 500,
        badge: 'Flexível',
        sortOrder: 6
      }
    ];

    const initialSettings: SystemSettings = {
      unitQueryPriceKz: 50,
      minCustomPlanPriceKz: 500,
      freeQueriesOnRegister: 3,
      freeQueriesDaily: 3,
      enableMultiplatformDownloads: false,
      moduleMinCredits: {
        local_trade: 1,
        services_consulting: 1,
        intermediary_broker: 1,
        basic_mobile: 1,
        import: 5,
        excel: 10,
        api_integration: 20
      },
      moduleQueryPrices: {
        local_trade: 50,
        services_consulting: 50,
        intermediary_broker: 50,
        basic_mobile: 50,
        import: 50,
        excel: 50,
        api_integration: 50
      },
      whatsappSupport1: '+244944935618',
      whatsappSupport2: '+244955581862',
      supportEmail: 'suporte@nanucloud.com',
      companyName: 'Nanucloud',
      companyAddress: 'Luanda, Angola',
      //companyNif: '5417653438',
      companyPhone1: '+244955581862',
      companyPhone2: '+244944935618',
      companyEmail1: 'simulador@nanucloud.com',
      companyEmail2: 'geral@nanucloud.com',
      companyLogoUrl: '',
      footerCopyrightText: '© 2026 Nanucloud. Todos os direitos reservados.',
      
      emisEnabled: true,
      emisEntityId: '00123',
      emisTerminalId: 'TER99',
      emisApiKey: 'emis_live_sec_89237489237498',
      emisWebhookUrl: '/api/payments/emis/callback',
      emisAutoActivate: true,
      visaMastercardEnabled: true,
      paypalEnabled: true,
      wiseEnabled: true,
      stripeEnabled: true,

      chatBotEnabled: true,
      chatAdminHoursStart: '08:00',
      chatAdminHoursEnd: '18:00',
      chatWelcomeMessage: 'Olá! Seja bem-vindo ao Suporte NANUCLOUD. Em que podemos ajudar hoje?',
      chatOfflineMessage: 'A equipa de administradores atende nos dias úteis, das 08h às 18h. O Robô Assistente Inteligente está disponível para ajudar imediatamente com dúvidas sobre a plataforma.',
      chatMaxInactivityMinutes: 15,

      twoFactorAuthEnabled: false,
      cyberSecurityAiEnabled: true,
      blockedIps: [],

      socialFacebook: 'https://facebook.com/nanucloud',
      socialInstagram: 'https://instagram.com/nanucloud',
      socialLinkedIn: 'https://linkedin.com/company/nanucloud',
      socialWhatsApp: 'https://wa.me/244944935618',
      socialYouTube: 'https://youtube.com/@nanucloud',

      activeThemeId: 'theme_nanucloud_dark',
      autoHolidayThemeEnabled: true,
      fiscalAiAutoCheckEnabled: true,

      bankName: 'Banco BAI / BFA / Millennium Atlântico',
      bankIban: 'AO06 0051 0000 7027 5788 1519 5',
      bankHolder: 'NANUCLOUD Lda',
      expressPhone: '929462681',
      bankAccounts: DEFAULT_BANK_ACCOUNTS,
      allowRegistration: true,
      maintenanceMode: false
    };

    const initialLogs: AuditLog[] = [
      {
        id: 'log_init_001',
        userId: superAdmin.id,
        userName: superAdmin.name,
        userRole: 'admin_level1',
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'system',
        details: 'Sistema de Simulação Financeira NANUCLOUD inicializado com sucesso.',
        createdAt: new Date().toISOString()
      }
    ];

    const schema: DatabaseSchema = {
      users: [superAdmin, level2Admin, demoUser],
      plans: defaultPlans,
      transactions: [],
      queryHistory: [],
      auditLogs: initialLogs,
      settings: initialSettings,
      supportInquiries: [],
      chatMessages: [],
      fiscalProposals: DEFAULT_FISCAL_PROPOSALS,
      apiKeys: DEFAULT_API_KEYS,
      smsLogs: [],
      trafficCampaigns: [
        {
          id: 'camp_01',
          name: 'Campanha Tráfego PAGO Facebook/Instagram 2025',
          source: 'facebook_ads',
          medium: 'social',
          utmCampaign: 'simulador_angola_2025',
          budgetKz: 150000,
          impressions: 48500,
          clicks: 3420,
          leads: 480,
          registrations: 215,
          paidConversions: 42,
          revenueKz: 630000,
          startDate: '2025-01-10',
          status: 'active'
        },
        {
          id: 'camp_02',
          name: 'Google Ads Search - Termos Fiscais & IVA Angola',
          source: 'google_ads',
          medium: 'cpc',
          utmCampaign: 'busca_iva_retencao_2025',
          budgetKz: 200000,
          impressions: 62000,
          clicks: 5120,
          leads: 620,
          registrations: 380,
          paidConversions: 85,
          revenueKz: 1275000,
          startDate: '2025-01-15',
          status: 'active'
        }
      ],
      otpCodes: []
    };

    this.saveDataDirect(schema);
    return schema;
  }

  private saveDataDirect(schema: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
      sqliteDb.syncFromObject(schema);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // Getters
  public getUsers(): User[] { return this.data.users; }
  public getPlans(): Plan[] { return this.data.plans; }
  public getTransactions(): Transaction[] { return this.data.transactions; }
  public getQueryHistory(): QueryHistoryItem[] { return this.data.queryHistory; }
  public getAuditLogs(): AuditLog[] { return this.data.auditLogs; }
  public getSettings(): SystemSettings { return this.data.settings; }
  public getSupportInquiries(): SupportInquiry[] { return this.data.supportInquiries; }
  public getFiscalProposals(): FiscalProposal[] { return this.data.fiscalProposals || []; }
  public getApiKeys(): ApiKeyItem[] { return this.data.apiKeys || []; }
  
  public getChatMessages(sessionId?: string): ChatMessage[] {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    if (sessionId) {
      return this.data.chatMessages.filter(m => m.sessionId === sessionId);
    }
    return this.data.chatMessages;
  }

  // Fiscal AI Proposals Management
  public approveFiscalProposal(proposalId: string, adminName: string): FiscalProposal | undefined {
    if (!this.data.fiscalProposals) this.data.fiscalProposals = [];
    const prop = this.data.fiscalProposals.find(p => p.id === proposalId);
    if (prop) {
      prop.status = 'approved';
      prop.reviewedBy = adminName;
      prop.reviewedAt = new Date().toISOString();
      this.addAuditLog({
        action: 'FISCAL_RATE_UPDATE_APPROVED',
        entityType: 'system',
        entityId: prop.id,
        userName: adminName,
        details: `Atualização de taxa fiscal [${prop.taxType} - ${prop.countryName}] aprovada: ${prop.proposedValue}`
      });
      this.save();
    }
    return prop;
  }

  public rejectFiscalProposal(proposalId: string, adminName: string): FiscalProposal | undefined {
    if (!this.data.fiscalProposals) this.data.fiscalProposals = [];
    const prop = this.data.fiscalProposals.find(p => p.id === proposalId);
    if (prop) {
      prop.status = 'rejected';
      prop.reviewedBy = adminName;
      prop.reviewedAt = new Date().toISOString();
      this.addAuditLog({
        action: 'FISCAL_RATE_UPDATE_REJECTED',
        entityType: 'system',
        entityId: prop.id,
        userName: adminName,
        details: `Atualização de taxa fiscal [${prop.taxType} - ${prop.countryName}] rejeitada.`
      });
      this.save();
    }
    return prop;
  }

  // API Keys Management
  public createApiKey(name: string, system: ApiKeyItem['system'], permissions: string[]): ApiKeyItem {
    if (!this.data.apiKeys) this.data.apiKeys = [];
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newKey: ApiKeyItem = {
      id: `api_${Date.now()}`,
      name,
      key: `nc_live_${system}_${randomHex}`,
      system,
      permissions,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.data.apiKeys.push(newKey);
    this.save();
    return newKey;
  }

  public revokeApiKey(id: string): boolean {
    if (!this.data.apiKeys) return false;
    const item = this.data.apiKeys.find(k => k.id === id);
    if (item) {
      item.status = 'revoked';
      this.save();
      return true;
    }
    return false;
  }

  // Bank Accounts Operations
  public getBankAccounts(): BankAccount[] {
    if (!this.data.settings.bankAccounts || this.data.settings.bankAccounts.length === 0) {
      this.data.settings.bankAccounts = DEFAULT_BANK_ACCOUNTS;
      this.save();
    }
    return this.data.settings.bankAccounts;
  }

  public setBankAccounts(accounts: BankAccount[]): BankAccount[] {
    this.data.settings.bankAccounts = accounts;
    this.save();
    return accounts;
  }

  // Chat Operations
  public addChatMessage(msg: ChatMessage): ChatMessage {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);
    if (this.data.chatMessages.length > 5000) {
      this.data.chatMessages.shift();
    }
    this.save();
    return msg;
  }

  public isAnyAdminOnline(): boolean {
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    return this.data.users.some(u => 
      (u.role === 'admin_level1' || u.role === 'admin_level2') && 
      u.lastLoginAt && 
      new Date(u.lastLoginAt).getTime() > fifteenMinsAgo
    );
  }

  public getBotKnowledgeBase(): BotKnowledgeItem[] {
    if (!this.data.botKnowledgeBase) {
      this.data.botKnowledgeBase = DEFAULT_BOT_KNOWLEDGE;
      this.save();
    }
    return this.data.botKnowledgeBase;
  }

  public addBotKnowledge(item: Omit<BotKnowledgeItem, 'id' | 'learnedAt'>): BotKnowledgeItem {
    if (!this.data.botKnowledgeBase) this.data.botKnowledgeBase = [];
    const fullItem: BotKnowledgeItem = {
      ...item,
      id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      learnedAt: new Date().toISOString()
    };
    this.data.botKnowledgeBase.unshift(fullItem);
    this.save();
    return fullItem;
  }

  public deleteBotKnowledge(id: string): boolean {
    if (!this.data.botKnowledgeBase) return false;
    const initialLen = this.data.botKnowledgeBase.length;
    this.data.botKnowledgeBase = this.data.botKnowledgeBase.filter(k => k.id !== id);
    if (this.data.botKnowledgeBase.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getUnresolvedBotQuestions(): UnresolvedBotQuestion[] {
    if (!this.data.unresolvedBotQuestions) {
      this.data.unresolvedBotQuestions = [];
    }
    return this.data.unresolvedBotQuestions;
  }

  public answerBotQuestion(id: string, adminAnswer: string, adminUser: User): UnresolvedBotQuestion | undefined {
    if (!this.data.unresolvedBotQuestions) this.data.unresolvedBotQuestions = [];
    const q = this.data.unresolvedBotQuestions.find(item => item.id === id);
    if (!q) return undefined;
    
    q.status = 'answered';
    q.adminAnswer = adminAnswer;
    q.answeredByAdminId = adminUser.id;
    q.answeredByAdminName = adminUser.name;
    q.answeredAt = new Date().toISOString();

    // Robot learns answer permanently into knowledge base
    if (!this.data.botKnowledgeBase) this.data.botKnowledgeBase = [];
    const rawWords = q.question
      .toLowerCase()
      .replace(/[^a-zA-Z0-9áéíóúãõç]/g, ' ')
      .split(' ')
      .filter(w => w.length > 2);

    const newKnowledge: BotKnowledgeItem = {
      id: `kb_learned_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: q.question,
      keywords: Array.from(new Set(rawWords)),
      answer: adminAnswer,
      language: q.detectedLanguage || 'pt',
      isApproved: true,
      learnedFromAdminId: adminUser.id,
      learnedFromAdminName: adminUser.name,
      learnedAt: new Date().toISOString()
    };
    this.data.botKnowledgeBase.unshift(newKnowledge);

    this.addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'BOT_LEARNED_RESPONSE',
      entityType: 'chat',
      entityId: q.id,
      details: `O Robô NANUCLOUD aprendeu uma nova resposta para a dúvida: "${q.question}"`
    });

    this.save();
    return q;
  }

  public ignoreBotQuestion(id: string, adminUser: User): UnresolvedBotQuestion | undefined {
    if (!this.data.unresolvedBotQuestions) this.data.unresolvedBotQuestions = [];
    const q = this.data.unresolvedBotQuestions.find(item => item.id === id);
    if (!q) return undefined;
    
    q.status = 'ignored';
    this.addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'BOT_QUESTION_IGNORED',
      entityType: 'chat',
      entityId: q.id,
      details: `Administrador ignorou a dúvida de baixa relevância: "${q.question}"`
    });

    this.save();
    return q;
  }

  public generateBotResponse(
    userMsg: string, 
    userName: string = 'Estimado utilizador',
    sessionId?: string,
    userEmail?: string,
    requestedLang?: string
  ): string {
    const raw = userMsg.trim();
    const q = raw.toLowerCase();

    // 1. Language detection
    let detectedLang = requestedLang || 'pt';
    if (/(\b(hello|hi|how|much|cost|price|tax|duty|withholding|where|can|please|thanks|service)\b)/i.test(q)) {
      detectedLang = 'en';
    } else if (/(\b(bonjour|salut|combien|prix|cout|impot|tva|retenue|source|merci|svp|service)\b)/i.test(q)) {
      detectedLang = 'fr';
    } else if (/(\b(hola|precio|cuanto|cuánto|retencion|retención|impuesto|cuenta|gracias|servicio)\b)/i.test(q)) {
      detectedLang = 'es';
    } else if (/(\b(olá|ola|quanto|preço|preco|imposto|retenção|retencao|serviço|servico|obrigado)\b)/i.test(q)) {
      detectedLang = 'pt';
    }

    // 2. Check Learned Knowledge Base (Exact/Semantic Match)
    const kb = this.getBotKnowledgeBase().filter(k => k.isApproved);
    for (const item of kb) {
      const matchCount = item.keywords.filter(k => q.includes(k.toLowerCase())).length;
      if (matchCount >= 2 || (item.keywords.length === 1 && matchCount === 1) || q.includes(item.question.toLowerCase())) {
        return item.answer;
      }
    }

    // 3. Multilingual built-in responses
    // A) Retenção na fonte & Serviços
    if (q.includes('serviç') || q.includes('servic') || q.includes('retenç') || q.includes('retenc') || q.includes('withholding') || q.includes('retenue')) {
      if (detectedLang === 'en') {
        return `Hello ${userName}! The NANUCLOUD simulator supports both PRODUCTS and SERVICES. For services, enter the Withholding/Retention Rate (%) applicable by law (e.g. 6.5% in Angola). The engine calculates the gross VAT amount and automatically deducts withholding taxes and POS (TPA) fees to show your true net revenue.`;
      }
      if (detectedLang === 'fr') {
        return `Bonjour ${userName}! Le simulateur NANUCLOUD gère les PRODUITS et les SERVICES. Pour les prestations de services, saisissez le taux de Retenue à la Source (%) réglementaire (ex. 6,5% en Angola). Le système calcule la TVA, déduit la retenue à la source et les frais TPA, et affiche le revenu net réel.`;
      }
      if (detectedLang === 'es') {
        return `¡Hola ${userName}! El simulador NANUCLOUD está optimizado tanto para PRODUCTOS como para SERVICIOS. Para servicios, ingrese el porcentaje de Retención en la Fuente (%) regulado por ley (ej. 6.5% en Angola). El sistema calcula el PVP con IVA y deduce la retención y comisión TPA para calcular la ganancia líquida real.`;
      }
      return `Olá ${userName}! O simulador NANUCLOUD serve tanto para PRODUTOS como para PRESTAÇÃO DE SERVIÇOS. Para serviços, basta preencher a taxa de Retenção na Fonte (%) regulamentar do país (ex: 6.5% em Angola segundo o Código do Imposto Industrial/IRT). O sistema calcula o valor bruto com IVA, deduz automaticamente a retenção na fonte e taxas de TPA, e apresenta o montante líquido real a receber.`;
    }

    // B) Preços e Planos (30 dias)
    if (q.includes('preço') || q.includes('preco') || q.includes('custa') || q.includes('valor') || q.includes('plan') || q.includes('price') || q.includes('tarif') || q.includes('combien')) {
      if (detectedLang === 'en') {
        return `Hello ${userName}! Each extra query costs 50 Kz. All our 5 standard plans have a 30-day validity:
• Bronze Plan: 500 Kz (10 queries)
• Silver Plan: 1,500 Kz (30 queries)
• Gold Pro Plan: 3,000 Kz (60 queries + Customs Import Module)
• Platinum Business: 5,000 Kz (100 queries + Excel Batch Processing)
• Diamond Enterprise: 10,000 Kz (200 VIP queries)`;
      }
      if (detectedLang === 'fr') {
        return `Bonjour ${userName}! Chaque recherche supplémentaire coûte 50 Kz. Tous nos forfaits ont une validité de 30 jours:
• Forfait Bronze: 500 Kz (10 requêtes)
• Forfait Argent: 1.500 Kz (30 requêtes)
• Forfait Or Pro: 3.000 Kz (60 requêtes + Module Douane & Import)
• Forfait Platine Business: 5.000 Kz (100 requêtes + Traitement Excel)
• Forfait Diamant: 10.000 Kz (200 requêtes VIP)`;
      }
      if (detectedLang === 'es') {
        return `¡Hola ${userName}! Cada consulta adicional cuesta 50 Kz. Todos los planes tienen 30 días de validez:
• Plan Bronce: 500 Kz (10 consultas)
• Plan Plata: 1.500 Kz (30 consultas)
• Plan Oro Pro: 3.000 Kz (60 consultas + Módulo de Importación Aduanera)
• Plan Platino Business: 5.000 Kz (100 consultas + Lote Excel)
• Plan Diamante: 10.000 Kz (200 consultas VIP)`;
      }
      return `Olá ${userName}! Cada pesquisa ou simulação extra custa 50 Kz. Todos os nossos planos têm validade de 30 dias:
• Plano Bronze: 500 Kz (10 pesquisas)
• Plano Prata: 1.500 Kz (30 pesquisas)
• Plano Ouro Pro: 3.000 Kz (60 pesquisas + Importação Aduaneira)
• Plano Platina Business: 5.000 Kz (100 pesquisas + Lote Excel)
• Plano Diamante Enterprise: 10.000 Kz (200 pesquisas VIP)`;
    }

    // C) IBAN e Pagamentos
    if (q.includes('iban') || q.includes('banco') || q.includes('transfer') || q.includes('pagar') || q.includes('pagamento') || q.includes('bank') || q.includes('paiement') || q.includes('virement')) {
      const activeBanks = this.getBankAccounts().filter(b => b.isActive);
      const bankList = activeBanks.map(b => `• ${b.bankName}: ${b.iban} (SWIFT: ${b.swift || 'N/A'} - Titular: ${b.holder})`).join('\n');
      return `Pode efetuar o pagamento por Transferência Bancária direta através dos seguintes IBANs oficiais da NANUCLOUD:\n\n${bankList}\n\n📌 Após a transferência, envie o comprovativo pelo sistema para crédito imediato de consultas pelo administrador.`;
    }

    // D) Importação e Alfândega
    if (q.includes('importa') || q.includes('alfandega') || q.includes('alfândega') || q.includes('cif') || q.includes('fob') || q.includes('customs') || q.includes('douane') || q.includes('aduana')) {
      return `O Módulo de Importação Aduaneira NANUCLOUD calcula FOB, Frete, Seguro, CIF, Direitos Aduaneiros (5% a 70%), IEC, Taxa Estatística, TPS e IVA Aduaneiro (14%). Este módulo fica desbloqueado nos planos Ouro Pro, Platina e Diamante (todos válidos por 30 dias).`;
    }

    // E) IVA e Fiscalidade
    if (q.includes('iva') || q.includes('imposto') || q.includes('tax') || q.includes('vat') || q.includes('tva')) {
      return `O simulador suporta o enquadramento fiscal completo: IVA Geral de 14%, Taxa Reduzida de 7% e 5%, Isenção (0%), Imposto Industrial (25% Geral / 10% Agro), Retenção na Fonte e TPA (1%). O cálculo apura o IVA a Deduzir e a Margem Líquida Real.`;
    }

    // F) Contactos e Suporte
    if (q.includes('contacto') || q.includes('contato') || q.includes('whatsapp') || q.includes('telefone') || q.includes('email') || q.includes('contact') || q.includes('support')) {
      const s = this.data.settings;
      return `Contactos oficiais da NANUCLOUD:\n📞 Telefones: ${s.companyPhone1 || s.whatsappSupport1} / ${s.companyPhone2 || s.whatsappSupport2}\n✉️ E-mails: ${s.companyEmail1 || s.supportEmail} / ${s.companyEmail2 || 'klayton_pires@hotmail.com'}\n🏢 Sede: ${s.companyAddress}\nSuper Administradores: Joaquim Monteiro & Klayton Monteiro.`;
    }

    // G) Modo Gratuito
    if (q.includes('gratis') || q.includes('grátis') || q.includes('gratuito') || q.includes('free') || q.includes('gratuit')) {
      return `Pode utilizar o simulador gratuitamente sem registo (3 consultas de demonstração). O contador gratuito reinicia diariamente a cada 24 horas por dispositivo.`;
    }

    // 4. UNRESOLVED / UNKNOWN QUESTION -> Notify Admins & Multilingual Assistance
    // Save to unresolved bot questions table
    if (!this.data.unresolvedBotQuestions) this.data.unresolvedBotQuestions = [];
    
    // Avoid spamming duplicates within 10 minutes from same session
    const isDuplicate = this.data.unresolvedBotQuestions.some(
      u => u.sessionId === sessionId && u.question.toLowerCase() === raw.toLowerCase() && (Date.now() - new Date(u.createdAt).getTime()) < 600000
    );

    if (!isDuplicate && raw.length > 5) {
      const unresolvedItem: UnresolvedBotQuestion = {
        id: `unresolved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId: sessionId || 'guest_session',
        userName: userName,
        userEmail: userEmail,
        question: raw,
        detectedLanguage: detectedLang,
        importance: (q.includes('empresa') || q.includes('pagamento') || q.includes('erro') || q.includes('factura') || q.includes('fatura') || q.includes('contrato')) ? 'high' : 'normal',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      this.data.unresolvedBotQuestions.unshift(unresolvedItem);
      this.save();
    }

    // Multilingual response acknowledging question, forwarding to admin, and offering language selection
    if (detectedLang === 'en') {
      return `Hello ${userName}! I don't have an exact answer for this specific question right now. I have created a notification for the NANUCLOUD administrators to review and reply. 

💡 I am prepared to assist in multiple languages (English, Portuguese, French, Spanish). Would you like to rephrase your question or let me know your preferred language?`;
    }

    if (detectedLang === 'fr') {
      return `Bonjour ${userName}! Je n'ai pas encore la réponse exacte à cette question précise. J'ai automatiquement laissé une notification aux administrateurs de NANUCLOUD pour qu'ils puissent y répondre.

💡 Je suis préparé pour communiquer en plusieurs langues (Français, Portugais, Anglais, Espagnol). Souhaitez-vous reformuler votre question ou m'indiquer la langue dans laquelle vous communiquez le mieux?`;
    }

    if (detectedLang === 'es') {
      return `¡Hola ${userName}! No dispongo de una respuesta exacta para esta consulta en este momento. He registrado una notificación para que los administradores de NANUCLOUD la revisen.

💡 Estoy preparado para responder en varios idiomas (Español, Portugués, Inglés, Francés). ¿Desea reformular su consulta o indicarme en qué idioma prefiere comunicarse?`;
    }

    return `Olá ${userName}! Não tenho a resposta exata para esta questão no momento. Já deixei uma notificação aos administradores da NANUCLOUD para análise. Se for importante, a equipa responderá e irei aprender a resposta.

💡 Estou preparado para responder em vários idiomas (Português, English, Français, Español). Se necessário, pode repetir ou indicar o idioma em que melhor se comunica!`;
  }

  // User Operations
  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    const clean = email.trim().toLowerCase();
    return this.data.users.find(u => {
      const uEmail = u.email.toLowerCase();
      return uEmail === clean || 
        ((clean === 'nanuhost' || clean === 'admin') && (uEmail === 'nanuhost' || uEmail === 'admin' || uEmail === 'admin@nanucloud.com'));
    });
  }

  public findUserByIdentifier(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return this.data.users.find(u => {
      const uEmail = u.email.toLowerCase();
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uName = u.name.toLowerCase();

      // Check phone match
      if (cleanDigits && uPhone && (uPhone === cleanDigits || uPhone.endsWith(cleanDigits) || cleanDigits.endsWith(uPhone))) {
        return true;
      }
      // Check email match or username match
      if (uEmail === clean || uName === clean) {
        return true;
      }
      if ((clean === 'nanuhost' || clean === 'admin') && (uEmail === 'nanuhost' || uEmail === 'admin' || uEmail === 'admin@nanucloud.com')) {
        return true;
      }
      return false;
    });
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.users[idx];
  }

  public updateUserPassword(userIdOrEmail: string, newPlainTextPassword: string): User | undefined {
    const user = this.data.users.find(u => 
      u.id === userIdOrEmail || 
      u.email.toLowerCase() === userIdOrEmail.trim().toLowerCase()
    );
    if (!user) return undefined;

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPlainTextPassword.trim(), salt);
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  public grantBonusQueries(userId: string, bonusCount: number, reason: string, adminUser: User): User | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;

    user.queriesRemaining += bonusCount;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'BONUS_QUERIES_GRANTED',
      entityType: 'user',
      entityId: user.id,
      details: `Atribuído bónus de ${bonusCount} consultas ao utilizador ${user.name} (${user.email}). Motivo: ${reason}`
    });

    this.save();
    return user;
  }

  public extendPlanValidity(userId: string, additionalDays: number, adminUser: User): User | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;

    const currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt).getTime() : Date.now();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();

    user.planExpiresAt = newExpiry;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'PLAN_VALIDITY_EXTENDED',
      entityType: 'user',
      entityId: user.id,
      details: `Validade do plano do utilizador ${user.name} estendida por ${additionalDays} dias até ${newExpiry}.`
    });

    this.save();
    return user;
  }

  public getUserStatement(userId: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    const userTransactions = this.data.transactions.filter(t => t.userId === userId);
    const userHistory = this.data.queryHistory.filter(q => q.userId === userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nif: user.nif,
        company: user.company,
        queriesRemaining: user.queriesRemaining,
        totalQueriesUsed: user.totalQueriesUsed,
        activePlanName: user.activePlanName,
        planExpiresAt: user.planExpiresAt,
        createdAt: user.createdAt
      },
      summary: {
        totalSpentKz: userTransactions.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amountKz, 0),
        approvedTransactionsCount: userTransactions.filter(t => t.status === 'approved').length,
        pendingTransactionsCount: userTransactions.filter(t => t.status === 'pending').length,
        totalQueriesRun: userHistory.length,
        localQueriesCount: userHistory.filter(h => h.type === 'local').length,
        importQueriesCount: userHistory.filter(h => h.type === 'import').length,
        batchQueriesCount: userHistory.filter(h => h.type === 'batch').length
      },
      transactions: userTransactions,
      queryHistory: userHistory
    };
  }

  // Plan Operations
  public findPlanById(id: string): Plan | undefined {
    return this.data.plans.find(p => p.id === id);
  }

  public addPlan(plan: Plan): Plan {
    this.data.plans.push(plan);
    this.save();
    return plan;
  }

  public updatePlan(id: string, updates: Partial<Plan>): Plan | undefined {
    const idx = this.data.plans.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.plans[idx] = { ...this.data.plans[idx], ...updates };
    this.save();
    return this.data.plans[idx];
  }

  public deletePlan(id: string): boolean {
    const len = this.data.plans.length;
    this.data.plans = this.data.plans.filter(p => p.id !== id);
    if (this.data.plans.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // Transaction Operations
  public findTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find(t => t.id === id);
  }

  public addTransaction(tx: Transaction): Transaction {
    this.data.transactions.unshift(tx);
    this.save();
    return tx;
  }

  public createTransaction(txData: Partial<Transaction> & { userId: string; userName: string; userEmail: string; planId: string; planName: string; amountKz: number; status: TransactionStatus }): Transaction {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: txData.userId,
      userName: txData.userName,
      userEmail: txData.userEmail,
      planId: txData.planId,
      planName: txData.planName,
      amountKz: txData.amountKz,
      queriesGranted: txData.queriesGranted || 0,
      validityDays: txData.validityDays || 30,
      paymentMethod: txData.paymentMethod || 'bank_transfer',
      paymentProofUrl: txData.paymentProofUrl,
      paymentProofName: txData.paymentProofName,
      paymentProofSize: txData.paymentProofSize,
      paymentReference: txData.paymentReference,
      notes: txData.notes,
      status: txData.status,
      createdAt: new Date().toISOString()
    };
    this.data.transactions.unshift(newTx);
    this.save();
    return newTx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.data.transactions[idx] = { ...this.data.transactions[idx], ...updates };
    this.save();
    return this.data.transactions[idx];
  }

  public updateTransactionStatus(id: string, status: TransactionStatus, adminId?: string, adminName?: string): Transaction | undefined {
    const tx = this.findTransactionById(id);
    if (!tx) return undefined;
    tx.status = status;
    if (adminId) tx.reviewedByAdminId = adminId;
    if (adminName) tx.reviewedByAdminName = adminName;
    tx.reviewedAt = new Date().toISOString();
    this.save();
    return tx;
  }

  // Support Inquiry Operations
  public addSupportInquiry(inquiry: SupportInquiry): SupportInquiry {
    if (!this.data.supportInquiries) this.data.supportInquiries = [];
    this.data.supportInquiries.unshift(inquiry);
    this.save();
    return inquiry;
  }

  public updateSupportInquiry(id: string, updates: Partial<SupportInquiry>): SupportInquiry | undefined {
    if (!this.data.supportInquiries) return undefined;
    const idx = this.data.supportInquiries.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.supportInquiries[idx] = { ...this.data.supportInquiries[idx], ...updates };
    this.save();
    return this.data.supportInquiries[idx];
  }

  // Query History Operations
  public findQueryHistoryById(id: string): QueryHistoryItem | undefined {
    return this.data.queryHistory.find(q => q.id === id);
  }

  public addQueryHistory(item: QueryHistoryItem): QueryHistoryItem {
    this.data.queryHistory.unshift(item);
    if (this.data.queryHistory.length > 5000) {
      this.data.queryHistory.pop();
    }
    this.save();
    return item;
  }

  public updateQueryHistory(id: string, updates: Partial<QueryHistoryItem>): QueryHistoryItem | undefined {
    const idx = this.data.queryHistory.findIndex(q => q.id === id);
    if (idx === -1) return undefined;
    this.data.queryHistory[idx] = { ...this.data.queryHistory[idx], ...updates };
    this.save();
    return this.data.queryHistory[idx];
  }

  public deleteQueryHistory(id: string, userId?: string): boolean {
    const initialLen = this.data.queryHistory.length;
    this.data.queryHistory = this.data.queryHistory.filter(q => {
      if (q.id !== id) return true;
      if (userId && q.userId !== userId) return true;
      return false;
    });
    if (this.data.queryHistory.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Audit Log Operations
  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const fullLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(fullLog);
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs.pop();
    }
    this.save();
    return fullLog;
  }

  // Settings
  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // OTP Verification Codes
  public createOtpCode(identifier: string, type: 'phone_verification' | 'password_reset' | 'login_otp'): string {
    if (!this.data.otpCodes) this.data.otpCodes = [];
    
    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Invalidate prior codes for this identifier and type
    this.data.otpCodes = this.data.otpCodes.filter(
      item => !(item.identifier.toLowerCase() === identifier.toLowerCase() && item.type === type && !item.used)
    );

    const record: OtpVerificationCode = {
      id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      identifier: identifier.trim(),
      type,
      code,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    };

    this.data.otpCodes.push(record);
    this.save();
    return code;
  }

  public verifyOtpCode(identifier: string, code: string, type: 'phone_verification' | 'password_reset' | 'login_otp'): boolean {
    if (!this.data.otpCodes) return false;
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    const now = new Date().getTime();
    const found = this.data.otpCodes.find(
      item =>
        item.identifier.toLowerCase() === cleanId &&
        item.type === type &&
        item.code === cleanCode &&
        !item.used &&
        new Date(item.expiresAt).getTime() > now
    );

    if (!found) return false;
    found.used = true;
    this.save();
    return true;
  }

  // SMS Logging & Marketing Broadcasts
  public getSmsLogs(): SmsLogItem[] {
    if (!this.data.smsLogs) this.data.smsLogs = [];
    return [...this.data.smsLogs].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public addSmsLog(log: Omit<SmsLogItem, 'id' | 'sentAt'>): SmsLogItem {
    if (!this.data.smsLogs) this.data.smsLogs = [];
    const item: SmsLogItem = {
      ...log,
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: new Date().toISOString()
    };
    this.data.smsLogs.unshift(item);
    if (this.data.smsLogs.length > 5000) {
      this.data.smsLogs.pop();
    }
    this.save();
    return item;
  }

  public clearSmsLogs(adminUser: User): { success: boolean; clearedCount: number; error?: string } {
    if (adminUser.role !== 'admin_level1' && (adminUser.role as string) !== 'super_admin') {
      return { success: false, clearedCount: 0, error: 'Apenas Super Administradores podem limpar o histórico de envios SMS.' };
    }
    const count = (this.data.smsLogs || []).length;
    this.data.smsLogs = [];
    this.addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SMS_LOGS_CLEARED',
      entityType: 'marketing',
      details: `Histórico de envios SMS (${count} registos) limpo pelo Super Administrador ${adminUser.name}.`
    });
    this.save();
    return { success: true, clearedCount: count };
  }

  // Traffic Campaigns (CEO & Traffic Manager)
  public getTrafficCampaigns(): TrafficCampaign[] {
    if (!this.data.trafficCampaigns) {
      this.data.trafficCampaigns = [];
    }
    return this.data.trafficCampaigns;
  }

  public saveTrafficCampaign(campaign: Partial<TrafficCampaign> & { name: string }): TrafficCampaign {
    if (!this.data.trafficCampaigns) this.data.trafficCampaigns = [];
    
    if (campaign.id) {
      const idx = this.data.trafficCampaigns.findIndex(c => c.id === campaign.id);
      if (idx !== -1) {
        this.data.trafficCampaigns[idx] = {
          ...this.data.trafficCampaigns[idx],
          ...campaign
        } as TrafficCampaign;
        this.save();
        return this.data.trafficCampaigns[idx];
      }
    }

    const newCamp: TrafficCampaign = {
      id: `camp_${Date.now()}`,
      name: campaign.name,
      source: campaign.source || 'facebook_ads',
      medium: campaign.medium || 'social',
      utmCampaign: campaign.utmCampaign || 'campanha_angola',
      budgetKz: campaign.budgetKz || 0,
      clicks: campaign.clicks || 0,
      impressions: campaign.impressions || 0,
      leads: campaign.leads || 0,
      registrations: campaign.registrations || 0,
      paidConversions: campaign.paidConversions || 0,
      revenueKz: campaign.revenueKz || 0,
      startDate: campaign.startDate || new Date().toISOString().split('T')[0],
      status: campaign.status || 'active'
    };

    this.data.trafficCampaigns.unshift(newCamp);
    this.save();
    return newCamp;
  }

  public deleteTrafficCampaign(id: string): boolean {
    if (!this.data.trafficCampaigns) return false;
    const initialLen = this.data.trafficCampaigns.length;
    this.data.trafficCampaigns = this.data.trafficCampaigns.filter(c => c.id !== id);
    const changed = this.data.trafficCampaigns.length !== initialLen;
    if (changed) this.save();
    return changed;
  }

  // Purge Demo Data and Temporary Testing Files/Records
  public purgeDemoData(): {
    usersRemoved: number;
    transactionsRemoved: number;
    historyRemoved: number;
    chatMessagesRemoved: number;
    unresolvedQuestionsRemoved: number;
  } {
    const isDemoAccount = (email?: string, name?: string) => {
      if (!email && !name) return true;
      const e = (email || '').toLowerCase();
      const n = (name || '').toLowerCase();
      return (
        e.includes('demo') ||
        e.includes('teste') ||
        e.includes('test') ||
        e.includes('sample') ||
        e.includes('exemplo') ||
        n.includes('demo') ||
        n.includes('teste') ||
        n.includes('demonstração') ||
        n.includes('demonstrativo') ||
        n.includes('sample')
      );
    };

    // 1. Filter out demo users (preserving real admins and real users)
    const initialUsersCount = this.data.users.length;
    this.data.users = this.data.users.filter(u => {
      // Keep real super admin Joaquim and real admin Suporte nanucloud
      if (u.email === 'joaquim.monteiro@nanucloud.com' || u.email === 'suporte@nanucloud.com' || u.name === 'nanuhost') {
        return true;
      }
      return !isDemoAccount(u.email, u.name);
    });
    const usersRemoved = initialUsersCount - this.data.users.length;

    // 2. Filter out demo transactions
    const initialTxCount = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter(t => {
      if (isDemoAccount(t.userEmail, t.userName)) return false;
      if ((t.notes || '').toLowerCase().includes('demo') || (t.notes || '').toLowerCase().includes('teste')) return false;
      return true;
    });
    const transactionsRemoved = initialTxCount - this.data.transactions.length;

    // 3. Filter out demo simulation history
    const initialHistCount = this.data.queryHistory.length;
    this.data.queryHistory = this.data.queryHistory.filter(q => {
      const user = this.data.users.find(u => u.id === q.userId);
      if (!user) return false; // orphan or deleted demo user
      if (isDemoAccount(user.email, user.name)) return false;
      if (q.title?.toLowerCase().includes('demo') || q.title?.toLowerCase().includes('teste') || q.title?.toLowerCase().includes('sample')) return false;
      return true;
    });
    const historyRemoved = initialHistCount - this.data.queryHistory.length;

    // 4. Filter out demo chat messages
    const initialChatCount = (this.data.chatMessages || []).length;
    this.data.chatMessages = (this.data.chatMessages || []).filter(c => {
      return !isDemoAccount(c.senderEmail, c.senderName);
    });
    const chatMessagesRemoved = initialChatCount - (this.data.chatMessages || []).length;

    // 5. Filter out demo unresolved bot questions
    const initialBotCount = (this.data.unresolvedBotQuestions || []).length;
    this.data.unresolvedBotQuestions = (this.data.unresolvedBotQuestions || []).filter(q => {
      return !isDemoAccount(q.userEmail, q.userName);
    });
    const unresolvedQuestionsRemoved = initialBotCount - (this.data.unresolvedBotQuestions || []).length;

    this.save();
    return {
      usersRemoved,
      transactionsRemoved,
      historyRemoved,
      chatMessagesRemoved,
      unresolvedQuestionsRemoved
    };
  }

  // 15-Day Data Retention Policy Engine
  // Removes old non-essential query history (> 15 days) for normal users
  // Accounts, credits, transactions, and super admin history are 100% PRESERVED
  public applyDataRetentionPolicy(daysThreshold: number = 15): {
    purgedCount: number;
    retainedCount: number;
    superAdminRetainedCount: number;
  } {
    const cutoffTimestamp = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
    const superAdminIds = new Set(
      this.data.users
        .filter(u => u.role === 'admin_level1' || (u.role as any) === 'super_admin' || (u.role as any) === 'superadmin')
        .map(u => u.id)
    );

    let purgedCount = 0;
    let retainedCount = 0;
    let superAdminRetainedCount = 0;

    const remainingHistory = this.data.queryHistory.filter(item => {
      const isSuperAdmin = superAdminIds.has(item.userId);
      const itemTimestamp = new Date(item.createdAt).getTime();

      // Super Admins retain history indefinitely (never auto-purged)
      if (isSuperAdmin) {
        superAdminRetainedCount++;
        return true;
      }

      // If item is older than 15 days, purge it
      if (itemTimestamp < cutoffTimestamp) {
        purgedCount++;
        return false;
      }

      // Item is within 15 days
      retainedCount++;
      return true;
    });

    this.data.queryHistory = remainingHistory;
    if (purgedCount > 0) {
      this.save();
    }

    return {
      purgedCount,
      retainedCount,
      superAdminRetainedCount
    };
  }

  // Super Admin: Clear all simulation query history manually if desired
  public clearAllQueryHistory(forNonAdminsOnly: boolean = false): number {
    const superAdminIds = new Set(
      this.data.users
        .filter(u => u.role === 'admin_level1' || (u.role as any) === 'super_admin' || (u.role as any) === 'superadmin')
        .map(u => u.id)
    );

    const initialLen = this.data.queryHistory.length;
    if (forNonAdminsOnly) {
      this.data.queryHistory = this.data.queryHistory.filter(q => superAdminIds.has(q.userId));
    } else {
      this.data.queryHistory = [];
    }

    const removed = initialLen - this.data.queryHistory.length;
    if (removed > 0) {
      this.save();
    }
    return removed;
  }

  // Full System Database Backup Generator
  public generateFullBackup(): { json: string; filename: string; instructions: string } {
    const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nanucloud_backup_${nowStr}`;
    const json = JSON.stringify(this.data, null, 2);

    const instructions = `================================================================================
GUIA DE RESTAURO, INSTALAÇÃO E MANUTENÇÃO - NANUCLOUD
================================================================================
1. ARQUITETURA DE DADOS:
   - Base de Dados: JSON / SQLite local e cloud-ready.
   - Servidor Node.js / Express com TypeScript e Vite.
   - Aplicação Multiplataforma (Web Desktop, Tablet, Mobile, PWA).

2. COMO RESTAURAR O BACKUP DO SISTEMA:
   a) No painel de administração, importe o arquivo JSON de backup ou
      substitua o arquivo /data/nanucloud_db.json na pasta do servidor.
   b) Reinicie o servidor para carregar todas as contas e transações.

3. CREDENCIAIS PADRÃO DE TESTE E ADMINISTRAÇÃO:
   - Utilizador Padrão de Teste: admin
   - Senha Padrão de Teste: admin
   - Super Administrador: joaquim.monteiro@nanucloud.com (admin123)

4. POLÍTICA DE BACKUP:
   - Os ficheiros JSON em /data/nanucloud_db.json contêm o estado completo do sistema.

© NANUCLOUD Lda - Todos os direitos reservados.
================================================================================`;

    return { json, filename, instructions };
  }
}

export const db = new DatabaseEngine();

