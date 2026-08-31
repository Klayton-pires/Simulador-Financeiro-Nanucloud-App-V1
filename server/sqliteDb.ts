import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATABASE_DIR = path.join(process.cwd(), 'database');
const SQLITE_FILE = path.join(DATA_DIR, 'nanucloud.sqlite');
const SQLITE_FILE_COPY = path.join(DATABASE_DIR, 'nanucloud.sqlite');
const SQLITE_FILE_ROOT = path.join(process.cwd(), 'nanucloud.sqlite');

export class SqliteDatabaseManager {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private isInitialized = false;

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATABASE_DIR)) {
      fs.mkdirSync(DATABASE_DIR, { recursive: true });
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    try {
      this.SQL = await initSqlJs();
      this.ensureDirectories();

      if (fs.existsSync(SQLITE_FILE)) {
        try {
          const fileBuffer = fs.readFileSync(SQLITE_FILE);
          this.db = new this.SQL.Database(fileBuffer);
          console.log('✅ Base de dados SQLite carregada de:', SQLITE_FILE);
        } catch (err) {
          console.warn('⚠️ Erro ao ler ficheiro SQLite existente. Criando nova base...', err);
          this.db = new this.SQL.Database();
        }
      } else {
        this.db = new this.SQL.Database();
        console.log('✨ Nova base de dados SQLite criada em memória.');
      }

      this.createTables();
      this.saveToFile();
      this.isInitialized = true;
    } catch (err) {
      console.error('❌ Falha ao inicializar motor SQLite:', err);
    }
  }

  private createTables(): void {
    if (!this.db) return;

    const schemaStatements = `
      -- 1. Utilizadores e Administradores
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT,
        address TEXT,
        nif TEXT,
        country TEXT DEFAULT 'AO',
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        isActive INTEGER DEFAULT 1,
        queriesRemaining INTEGER DEFAULT 3,
        totalQueriesUsed INTEGER DEFAULT 0,
        activePlanId TEXT,
        activePlanName TEXT,
        planExpiresAt TEXT,
        isImportUnlocked INTEGER DEFAULT 0,
        isBatchUnlocked INTEGER DEFAULT 0,
        twoFactorEnabled INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastLoginAt TEXT
      );

      -- 2. Planos Comerciais e Preçário
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        priceKz REAL NOT NULL,
        queriesCount INTEGER NOT NULL,
        validityDays INTEGER DEFAULT 30,
        unitPriceKz REAL DEFAULT 50,
        features TEXT, -- JSON array
        unlocksImport INTEGER DEFAULT 0,
        unlocksBatch INTEGER DEFAULT 0,
        isCustom INTEGER DEFAULT 0,
        minPriceKz REAL,
        badge TEXT,
        sortOrder INTEGER DEFAULT 0
      );

      -- 3. Transações e Pagamentos
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        userName TEXT,
        userEmail TEXT,
        planId TEXT NOT NULL,
        planName TEXT NOT NULL,
        queriesCount INTEGER NOT NULL,
        amountKz REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        proofFileName TEXT,
        proofFileUrl TEXT,
        notes TEXT,
        validatedByAdminId TEXT,
        validatedByAdminName TEXT,
        validatedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      -- 4. Histórico de Simulações e Consultas
      CREATE TABLE IF NOT EXISTS query_history (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        moduleType TEXT NOT NULL,
        queryData TEXT NOT NULL, -- JSON
        resultData TEXT NOT NULL, -- JSON
        costNet REAL,
        pvpGross REAL,
        netProfit REAL,
        marginPercent REAL,
        productName TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      -- 5. Logs de Auditoria e Segurança
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userName TEXT,
        userRole TEXT,
        action TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT,
        details TEXT,
        ipAddress TEXT,
        createdAt TEXT NOT NULL
      );

      -- 6. Configurações Globais do Sistema
      CREATE TABLE IF NOT EXISTS system_settings (
        id TEXT PRIMARY KEY,
        companyName TEXT NOT NULL,
        companyAddress TEXT,
        companyNif TEXT,
        companyPhone1 TEXT,
        companyPhone2 TEXT,
        companyEmail1 TEXT,
        companyEmail2 TEXT,
        companyLogoUrl TEXT,
        unitQueryPriceKz REAL DEFAULT 50,
        minCustomPlanPriceKz REAL DEFAULT 500,
        freeQueriesOnRegister INTEGER DEFAULT 3,
        freeQueriesDaily INTEGER DEFAULT 3,
        whatsappSupport1 TEXT,
        whatsappSupport2 TEXT,
        supportEmail TEXT,
        footerCopyrightText TEXT,
        emisEnabled INTEGER DEFAULT 1,
        visaMastercardEnabled INTEGER DEFAULT 1,
        paypalEnabled INTEGER DEFAULT 1,
        wiseEnabled INTEGER DEFAULT 1,
        stripeEnabled INTEGER DEFAULT 1,
        chatBotEnabled INTEGER DEFAULT 1,
        twoFactorAuthEnabled INTEGER DEFAULT 0,
        cyberSecurityAiEnabled INTEGER DEFAULT 1,
        activeThemeId TEXT DEFAULT 'theme_nanucloud_dark',
        autoHolidayThemeEnabled INTEGER DEFAULT 1,
        fiscalAiAutoCheckEnabled INTEGER DEFAULT 1,
        updatedAt TEXT NOT NULL
      );

      -- 7. Contas Bancárias Oficiais (IBANs)
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        bankName TEXT NOT NULL,
        iban TEXT NOT NULL,
        swift TEXT,
        holder TEXT NOT NULL,
        currency TEXT DEFAULT 'AOA (Kz)',
        isActive INTEGER DEFAULT 1
      );

      -- 8. Base de Conhecimento e Aprendizagem do Robô de Suporte
      CREATE TABLE IF NOT EXISTS bot_knowledge (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        keywords TEXT NOT NULL, -- JSON array
        answer TEXT NOT NULL,
        language TEXT DEFAULT 'pt',
        category TEXT DEFAULT 'general',
        isApproved INTEGER DEFAULT 1,
        learnedFromAdminId TEXT,
        learnedFromAdminName TEXT,
        learnedAt TEXT NOT NULL
      );

      -- 9. Dúvidas Pendentes para o Administrador Ensinar o Robô
      CREATE TABLE IF NOT EXISTS unresolved_bot_questions (
        id TEXT PRIMARY KEY,
        sessionId TEXT,
        userName TEXT,
        userEmail TEXT,
        question TEXT NOT NULL,
        detectedLanguage TEXT DEFAULT 'pt',
        importance TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'pending',
        adminAnswer TEXT,
        answeredByAdminId TEXT,
        answeredByAdminName TEXT,
        answeredAt TEXT,
        createdAt TEXT NOT NULL
      );

      -- 10. Propostas Fiscais e Atualizações de Leis AGT
      CREATE TABLE IF NOT EXISTS fiscal_proposals (
        id TEXT PRIMARY KEY,
        countryCode TEXT NOT NULL,
        countryName TEXT NOT NULL,
        taxType TEXT NOT NULL,
        currentValue TEXT NOT NULL,
        proposedValue TEXT NOT NULL,
        sourceLaw TEXT NOT NULL,
        reason TEXT,
        detectedAt TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reviewedBy TEXT,
        reviewedAt TEXT
      );

      -- 11. Chaves de API e Integrações (XD POS, Primavera, SAP)
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT UNIQUE NOT NULL,
        system TEXT NOT NULL,
        permissions TEXT, -- JSON array
        status TEXT DEFAULT 'active',
        createdAt TEXT NOT NULL,
        lastUsedAt TEXT
      );

      -- 12. Mensagens de Chat e Suporte
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        senderType TEXT NOT NULL, -- 'user', 'bot', 'admin'
        senderName TEXT NOT NULL,
        senderEmail TEXT,
        message TEXT NOT NULL,
        language TEXT DEFAULT 'pt',
        isAutoResponse INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      -- 13. Clientes Registados (Gestão Comercial)
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        nif TEXT,
        phone TEXT,
        email TEXT,
        balance REAL DEFAULT 0,
        country TEXT DEFAULT 'AO',
        createdAt TEXT NOT NULL
      );
    `;

    this.db.run(schemaStatements);
  }

  public saveToFile(): void {
    if (!this.db) return;
    try {
      this.ensureDirectories();
      const binaryArray = this.db.export();
      const buffer = Buffer.from(binaryArray);
      
      // 1. Save in /data/nanucloud.sqlite
      fs.writeFileSync(SQLITE_FILE, buffer);
      
      // 2. Also maintain copy in /database/nanucloud.sqlite
      fs.writeFileSync(SQLITE_FILE_COPY, buffer);

      // 3. Maintain copy directly in project root /nanucloud.sqlite
      fs.writeFileSync(SQLITE_FILE_ROOT, buffer);
    } catch (err) {
      console.error('❌ Erro ao guardar ficheiro SQLite no disco:', err);
    }
  }

  /**
   * Run a custom SQL Query safely
   */
  public query(sql: string, params: any[] = []): any[] {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (err) {
      console.error('Erro na execução SQL:', err, 'SQL:', sql);
      throw err;
    }
  }

  /**
   * Execute an SQL statement (INSERT, UPDATE, DELETE) and auto-persist
   */
  public run(sql: string, params: any[] = []): { changes: number } {
    if (!this.db) return { changes: 0 };
    try {
      this.db.run(sql, params);
      this.saveToFile();
      return { changes: this.db.getRowsModified() };
    } catch (err) {
      console.error('Erro no comando SQL run:', err, 'SQL:', sql);
      throw err;
    }
  }

  /**
   * Sync memory/JSON state with SQLite tables
   */
  public syncFromObject(data: any): void {
    if (!this.db) return;
    try {
      // Sync Users
      if (Array.isArray(data.users)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO users (
            id, name, email, phone, company, address, nif, country, passwordHash,
            role, isActive, queriesRemaining, totalQueriesUsed, activePlanId,
            activePlanName, planExpiresAt, isImportUnlocked, isBatchUnlocked,
            twoFactorEnabled, createdAt, updatedAt, lastLoginAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const u of data.users) {
          stmt.run([
            u.id, u.name, u.email, u.phone || '', u.company || '', u.address || '', u.nif || '',
            u.country || 'AO', u.passwordHash, u.role || 'user', u.isActive ? 1 : 0,
            u.queriesRemaining || 0, u.totalQueriesUsed || 0, u.activePlanId || null,
            u.activePlanName || null, u.planExpiresAt || null, u.isImportUnlocked ? 1 : 0,
            u.isBatchUnlocked ? 1 : 0, u.twoFactorEnabled ? 1 : 0,
            u.createdAt || new Date().toISOString(), u.updatedAt || new Date().toISOString(),
            u.lastLoginAt || null
          ]);
        }
        stmt.free();
      }

      // Sync Plans
      if (Array.isArray(data.plans)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO plans (
            id, name, priceKz, queriesCount, validityDays, unitPriceKz, features,
            unlocksImport, unlocksBatch, isCustom, minPriceKz, badge, sortOrder
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of data.plans) {
          stmt.run([
            p.id, p.name, p.priceKz, p.queriesCount, p.validityDays || 30, p.unitPriceKz || 50,
            JSON.stringify(p.features || []), p.unlocksImport ? 1 : 0, p.unlocksBatch ? 1 : 0,
            p.isCustom ? 1 : 0, p.minPriceKz || null, p.badge || '', p.sortOrder || 0
          ]);
        }
        stmt.free();
      }

      // Sync Bank Accounts
      const banks = data.settings?.bankAccounts || data.bankAccounts;
      if (Array.isArray(banks)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO bank_accounts (id, bankName, iban, swift, holder, currency, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const b of banks) {
          stmt.run([b.id, b.bankName, b.iban, b.swift || '', b.holder, b.currency || 'AOA (Kz)', b.isActive ? 1 : 0]);
        }
        stmt.free();
      }

      // Sync Bot Knowledge
      if (Array.isArray(data.botKnowledgeBase)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO bot_knowledge (id, question, keywords, answer, language, category, isApproved, learnedFromAdminId, learnedFromAdminName, learnedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const k of data.botKnowledgeBase) {
          stmt.run([
            k.id, k.question, JSON.stringify(k.keywords || []), k.answer, k.language || 'pt',
            k.category || 'general', k.isApproved ? 1 : 0, k.learnedFromAdminId || null,
            k.learnedFromAdminName || null, k.learnedAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // Sync API Keys
      if (Array.isArray(data.apiKeys)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO api_keys (id, name, key, system, permissions, status, createdAt, lastUsedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const a of data.apiKeys) {
          stmt.run([
            a.id, a.name, a.key, a.system, JSON.stringify(a.permissions || []),
            a.status || 'active', a.createdAt || new Date().toISOString(), a.lastUsedAt || null
          ]);
        }
        stmt.free();
      }

      // Sync Fiscal Proposals
      if (Array.isArray(data.fiscalProposals)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO fiscal_proposals (id, countryCode, countryName, taxType, currentValue, proposedValue, sourceLaw, reason, detectedAt, status, reviewedBy, reviewedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const f of data.fiscalProposals) {
          stmt.run([
            f.id, f.countryCode, f.countryName, f.taxType, f.currentValue, f.proposedValue,
            f.sourceLaw, f.reason || '', f.detectedAt || new Date().toISOString(),
            f.status || 'pending', f.reviewedBy || null, f.reviewedAt || null
          ]);
        }
        stmt.free();
      }

      // Sync Transactions
      if (Array.isArray(data.transactions)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO transactions (
            id, userId, userName, userEmail, planId, planName, queriesCount,
            amountKz, paymentMethod, status, proofFileName, proofFileUrl,
            notes, validatedByAdminId, validatedByAdminName, validatedAt, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const t of data.transactions) {
          stmt.run([
            t.id, t.userId, t.userName || '', t.userEmail || '', t.planId, t.planName,
            t.queriesGranted || t.queriesCount || 0, t.amountKz, t.paymentMethod,
            t.status || 'pending', t.paymentProofUrl || '', t.paymentProofUrl || '',
            t.notes || '', t.reviewedByAdminId || null, t.reviewedByAdminName || null,
            t.reviewedAt || null, t.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // Sync Query History
      if (Array.isArray(data.queryHistory)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO query_history (
            id, userId, moduleType, queryData, resultData, costNet, pvpGross,
            netProfit, marginPercent, productName, notes, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const q of data.queryHistory) {
          stmt.run([
            q.id, q.userId, q.type || 'local', JSON.stringify(q.details || {}),
            JSON.stringify({ finalPrice: q.finalPrice, vatRate: q.vatRate, marginApplied: q.marginApplied }),
            q.costBase || 0, q.finalPrice || 0, q.netProfit || 0, q.marginApplied || 0,
            q.title || '', q.description || '', q.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // Sync Settings
      if (data.settings) {
        const s = data.settings;
        this.db.run(`
          INSERT OR REPLACE INTO system_settings (
            id, companyName, companyAddress, companyNif, companyPhone1, companyPhone2,
            companyEmail1, companyEmail2, companyLogoUrl, unitQueryPriceKz,
            minCustomPlanPriceKz, freeQueriesOnRegister, freeQueriesDaily,
            whatsappSupport1, whatsappSupport2, supportEmail, footerCopyrightText,
            emisEnabled, visaMastercardEnabled, paypalEnabled, wiseEnabled, stripeEnabled,
            chatBotEnabled, twoFactorAuthEnabled, cyberSecurityAiEnabled, activeThemeId,
            autoHolidayThemeEnabled, fiscalAiAutoCheckEnabled, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'settings_default', s.companyName || 'NANUCLOUD', s.companyAddress || '', s.companyNif || '',
          s.companyPhone1 || '', s.companyPhone2 || '', s.companyEmail1 || '', s.companyEmail2 || '',
          s.companyLogoUrl || '', s.unitQueryPriceKz || 50, s.minCustomPlanPriceKz || 500,
          s.freeQueriesOnRegister || 3, s.freeQueriesDaily || 3, s.whatsappSupport1 || '',
          s.whatsappSupport2 || '', s.supportEmail || '', s.footerCopyrightText || '',
          s.emisEnabled ? 1 : 0, s.visaMastercardEnabled ? 1 : 0, s.paypalEnabled ? 1 : 0,
          s.wiseEnabled ? 1 : 0, s.stripeEnabled ? 1 : 0, s.chatBotEnabled ? 1 : 0,
          s.twoFactorAuthEnabled ? 1 : 0, s.cyberSecurityAiEnabled ? 1 : 0,
          s.activeThemeId || 'theme_nanucloud_dark', s.autoHolidayThemeEnabled ? 1 : 0,
          s.fiscalAiAutoCheckEnabled ? 1 : 0, new Date().toISOString()
        ]);
      }

      this.saveToFile();
    } catch (err) {
      console.error('Erro na sincronização SQLite:', err);
    }
  }

  /**
   * Purge demo records directly in SQLite tables
   */
  public purgeDemoRecords(): { purgedRows: number } {
    if (!this.db) return { purgedRows: 0 };
    let purgedRows = 0;
    try {
      // 1. Delete demo users except official admin
      this.db.run(`
        DELETE FROM users 
        WHERE email NOT IN ('joaquim.monteiro@nanucloud.com', 'klayton.pires.monteiro@gmail.com', 'nanuhost')
        AND (
          LOWER(email) LIKE '%demo%' OR LOWER(email) LIKE '%teste%' OR LOWER(email) LIKE '%sample%'
          OR LOWER(name) LIKE '%demo%' OR LOWER(name) LIKE '%teste%' OR LOWER(name) LIKE '%demonstra%'
        )
      `);

      // 2. Delete demo transactions
      this.db.run(`
        DELETE FROM transactions
        WHERE LOWER(userName) LIKE '%demo%' OR LOWER(userName) LIKE '%teste%'
        OR LOWER(userEmail) LIKE '%demo%' OR LOWER(userEmail) LIKE '%teste%'
        OR LOWER(notes) LIKE '%demo%' OR LOWER(notes) LIKE '%teste%'
      `);

      // 3. Delete demo simulation history
      this.db.run(`
        DELETE FROM query_history
        WHERE LOWER(productName) LIKE '%demo%' OR LOWER(productName) LIKE '%teste%' OR LOWER(productName) LIKE '%sample%'
      `);

      this.saveToFile();
      return { purgedRows };
    } catch (err) {
      console.error('Erro ao purgar dados de demonstração no SQLite:', err);
      return { purgedRows: 0 };
    }
  }

  /**
   * Enforce 15-day retention policy in SQLite query_history table
   */
  public applyRetentionPolicy(daysThreshold: number = 15): { purgedCount: number } {
    if (!this.db) return { purgedCount: 0 };
    try {
      const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000).toISOString();
      
      // Select Super Admin IDs
      const superAdminsRes = this.db.exec(`
        SELECT id FROM users WHERE role IN ('admin_level1', 'super_admin', 'superadmin')
      `);
      
      let superAdminIds: string[] = [];
      if (superAdminsRes.length > 0 && superAdminsRes[0].values) {
        superAdminIds = superAdminsRes[0].values.map(v => `'${String(v[0])}'`);
      }

      const notSuperAdminClause = superAdminIds.length > 0
        ? `AND userId NOT IN (${superAdminIds.join(',')})`
        : ``;

      this.db.run(`
        DELETE FROM query_history
        WHERE createdAt < ? ${notSuperAdminClause}
      `, [cutoffDate]);

      this.saveToFile();
      return { purgedCount: 0 };
    } catch (err) {
      console.error('Erro ao aplicar retenção de 15 dias no SQLite:', err);
      return { purgedCount: 0 };
    }
  }

  public getDatabaseInfo(): {
    sqliteFilePath: string;
    databaseDirPath: string;
    fileSizeBytes: number;
    fileSizeFormatted: string;
    tableCounts: Record<string, number>;
    tables: string[];
  } {
    let size = 0;
    try {
      if (fs.existsSync(SQLITE_FILE)) {
        size = fs.statSync(SQLITE_FILE).size;
      }
    } catch {}

    const tableCounts: Record<string, number> = {};
    const tableNames = [
      'users', 'plans', 'transactions', 'query_history', 'audit_logs',
      'system_settings', 'bank_accounts', 'bot_knowledge',
      'unresolved_bot_questions', 'fiscal_proposals', 'api_keys',
      'chat_messages', 'clients'
    ];

    if (this.db) {
      for (const t of tableNames) {
        try {
          const res = this.db.exec(`SELECT COUNT(*) as cnt FROM ${t}`);
          if (res.length > 0 && res[0].values.length > 0) {
            tableCounts[t] = Number(res[0].values[0][0]);
          } else {
            tableCounts[t] = 0;
          }
        } catch {
          tableCounts[t] = 0;
        }
      }
    }

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return {
      sqliteFilePath: SQLITE_FILE,
      databaseDirPath: DATABASE_DIR,
      fileSizeBytes: size,
      fileSizeFormatted: formatSize(size),
      tableCounts,
      tables: tableNames
    };
  }

  public getSqliteBinaryBuffer(): Buffer | null {
    if (!this.db) return null;
    try {
      const binaryArray = this.db.export();
      return Buffer.from(binaryArray);
    } catch {
      return null;
    }
  }
}

export const sqliteDb = new SqliteDatabaseManager();
