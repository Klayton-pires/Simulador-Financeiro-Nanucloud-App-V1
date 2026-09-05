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

      this.createAllTables();
      this.saveToFile();
      this.isInitialized = true;
    } catch (err) {
      console.error('❌ Falha ao inicializar motor SQLite:', err);
    }
  }

  /**
   * Complete DDL for all application tables and fields
   */
  public createAllTables(): void {
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
        paymentReference TEXT,
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
        type TEXT NOT NULL DEFAULT 'local', -- 'local', 'import', 'batch'
        itemType TEXT DEFAULT 'product', -- 'product' ou 'service'
        countryCode TEXT DEFAULT 'AO',
        title TEXT,
        description TEXT,
        costBase REAL DEFAULT 0,
        vatRate REAL DEFAULT 0,
        marginApplied REAL DEFAULT 0,
        finalPrice REAL DEFAULT 0,
        netProfit REAL DEFAULT 0,
        retentionRate REAL DEFAULT 0,
        retentionAmount REAL DEFAULT 0,
        netReceived REAL DEFAULT 0,
        currency TEXT DEFAULT 'Kz',
        details TEXT NOT NULL, -- JSON com o cálculo completo
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
        emisEntityId TEXT,
        emisTerminalId TEXT,
        emisApiKey TEXT,
        emisWebhookUrl TEXT,
        emisAutoActivate INTEGER DEFAULT 1,
        visaMastercardEnabled INTEGER DEFAULT 1,
        paypalEnabled INTEGER DEFAULT 1,
        paypalClientId TEXT,
        wiseEnabled INTEGER DEFAULT 1,
        stripeEnabled INTEGER DEFAULT 1,
        stripePublicKey TEXT,
        stripeSecretKey TEXT,
        chatBotEnabled INTEGER DEFAULT 1,
        chatAdminHoursStart TEXT DEFAULT '08:00',
        chatAdminHoursEnd TEXT DEFAULT '18:00',
        chatWelcomeMessage TEXT,
        chatOfflineMessage TEXT,
        chatMaxInactivityMinutes INTEGER DEFAULT 15,
        twoFactorAuthEnabled INTEGER DEFAULT 0,
        cyberSecurityAiEnabled INTEGER DEFAULT 1,
        activeThemeId TEXT DEFAULT 'theme_nanucloud_dark',
        autoHolidayThemeEnabled INTEGER DEFAULT 1,
        fiscalAiAutoCheckEnabled INTEGER DEFAULT 1,
        bankName TEXT,
        bankIban TEXT,
        bankHolder TEXT,
        expressPhone TEXT,
        allowRegistration INTEGER DEFAULT 1,
        maintenanceMode INTEGER DEFAULT 0,
        activeDatabaseEngine TEXT DEFAULT 'sqlite',
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
        address TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      -- 14. Tickets de Suporte e Contacto
      CREATE TABLE IF NOT EXISTS support_inquiries (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        attachmentUrl TEXT,
        status TEXT DEFAULT 'open',
        adminReply TEXT,
        repliedAt TEXT,
        createdAt TEXT NOT NULL
      );

      -- 15. Campanhas de Marketing e Tráfego Pago
      CREATE TABLE IF NOT EXISTS traffic_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT NOT NULL,
        medium TEXT,
        utmCampaign TEXT,
        budgetKz REAL DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        leads INTEGER DEFAULT 0,
        registrations INTEGER DEFAULT 0,
        paidConversions INTEGER DEFAULT 0,
        revenueKz REAL DEFAULT 0,
        startDate TEXT NOT NULL,
        endDate TEXT,
        status TEXT DEFAULT 'active'
      );

      -- 16. Logs de SMS e Notificações
      CREATE TABLE IF NOT EXISTS sms_logs (
        id TEXT PRIMARY KEY,
        phoneNumber TEXT NOT NULL,
        countryCode TEXT DEFAULT '+244',
        messageType TEXT NOT NULL,
        messageContent TEXT NOT NULL,
        recipientName TEXT,
        sentByUserId TEXT,
        sentByUserName TEXT,
        status TEXT DEFAULT 'delivered',
        gatewayResponse TEXT,
        sentAt TEXT NOT NULL
      );

      -- 17. Conexões de Banco de Dados Externo
      CREATE TABLE IF NOT EXISTS database_connections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        engineType TEXT NOT NULL, -- 'sqlite', 'mysql', 'postgres', 'mssql'
        host TEXT,
        port INTEGER,
        databaseName TEXT,
        username TEXT,
        password TEXT,
        sslEnabled INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 0,
        status TEXT DEFAULT 'disconnected',
        lastTestedAt TEXT,
        lastBackupAt TEXT,
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
   * Execute an SQL statement (INSERT, UPDATE, DELETE, DDL) and auto-persist
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
   * Execute raw query with metadata for SQL console
   */
  public executeRaw(sql: string): { columns: string[]; rows: any[]; rowCount: number; executionTimeMs: number } {
    if (!this.db) throw new Error('Motor SQLite não inicializado.');
    const startTime = Date.now();
    const trimmed = sql.trim();
    
    if (/^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed)) {
      const stmt = this.db.prepare(trimmed);
      const rows: any[] = [];
      let columns: string[] = [];
      
      if (stmt.step()) {
        columns = stmt.getColumnNames();
        rows.push(stmt.getAsObject());
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
      } else {
        columns = stmt.getColumnNames();
      }
      stmt.free();

      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs: Date.now() - startTime
      };
    } else {
      this.db.run(trimmed);
      this.saveToFile();
      const changes = this.db.getRowsModified();
      return {
        columns: ['Linhas Afetadas'],
        rows: [{ 'Linhas Afetadas': changes }],
        rowCount: changes,
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Sync memory/JSON state with all SQLite tables
   */
  public syncFromObject(data: any): void {
    if (!this.db) return;
    try {
      // 1. Sync Users
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

      // 2. Sync Plans
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

      // 3. Sync Bank Accounts
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

      // 4. Sync Bot Knowledge
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

      // 5. Sync API Keys
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

      // 6. Sync Fiscal Proposals
      if (Array.isArray(data.fiscalProposals)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO fiscal_proposals (id, countryCode, countryName, taxType, currentValue, proposedValue, sourceLaw, reason, detectedAt, status, reviewedBy, reviewedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const f of data.fiscalProposals) {
          stmt.run([
            f.id, f.countryCode, f.countryName, f.taxType, String(f.currentValue), String(f.proposedValue),
            f.sourceLaw, f.reason || '', f.detectedAt || new Date().toISOString(),
            f.status || 'pending', f.reviewedBy || null, f.reviewedAt || null
          ]);
        }
        stmt.free();
      }

      // 7. Sync Transactions
      if (Array.isArray(data.transactions)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO transactions (
            id, userId, userName, userEmail, planId, planName, queriesCount,
            amountKz, paymentMethod, status, proofFileName, proofFileUrl,
            paymentReference, notes, validatedByAdminId, validatedByAdminName, validatedAt, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const t of data.transactions) {
          stmt.run([
            t.id, t.userId, t.userName || '', t.userEmail || '', t.planId, t.planName,
            t.queriesGranted || t.queriesCount || 0, t.amountKz, t.paymentMethod,
            t.status || 'pending', t.paymentProofUrl || '', t.paymentProofUrl || '',
            t.paymentReference || '', t.notes || '', t.reviewedByAdminId || null, t.reviewedByAdminName || null,
            t.reviewedAt || null, t.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // 8. Sync Query History
      if (Array.isArray(data.queryHistory)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO query_history (
            id, userId, type, itemType, countryCode, title, description,
            costBase, vatRate, marginApplied, finalPrice, netProfit,
            retentionRate, retentionAmount, netReceived, currency, details, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const q of data.queryHistory) {
          stmt.run([
            q.id, q.userId, q.type || 'local', q.itemType || 'product', q.countryCode || 'AO',
            q.title || '', q.description || '', q.costBase || 0, q.vatRate || 0,
            q.marginApplied || 0, q.finalPrice || 0, q.netProfit || 0,
            q.retentionRate || 0, q.retentionAmount || 0, q.netReceived || 0,
            q.currency || 'Kz', JSON.stringify(q.details || {}), q.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // 9. Sync Settings
      if (data.settings) {
        const s = data.settings;
        this.db.run(`
          INSERT OR REPLACE INTO system_settings (
            id, companyName, companyAddress, companyNif, companyPhone1, companyPhone2,
            companyEmail1, companyEmail2, companyLogoUrl, unitQueryPriceKz,
            minCustomPlanPriceKz, freeQueriesOnRegister, freeQueriesDaily,
            whatsappSupport1, whatsappSupport2, supportEmail, footerCopyrightText,
            emisEnabled, emisEntityId, emisTerminalId, emisApiKey, emisWebhookUrl, emisAutoActivate,
            visaMastercardEnabled, paypalEnabled, paypalClientId, wiseEnabled, stripeEnabled,
            stripePublicKey, stripeSecretKey, chatBotEnabled, chatAdminHoursStart, chatAdminHoursEnd,
            chatWelcomeMessage, chatOfflineMessage, chatMaxInactivityMinutes, twoFactorAuthEnabled,
            cyberSecurityAiEnabled, activeThemeId, autoHolidayThemeEnabled, fiscalAiAutoCheckEnabled,
            bankName, bankIban, bankHolder, expressPhone, allowRegistration, maintenanceMode,
            activeDatabaseEngine, updatedAt
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `, [
          'settings_default', s.companyName || 'NANUCLOUD', s.companyAddress || '', s.companyNif || '',
          s.companyPhone1 || '', s.companyPhone2 || '', s.companyEmail1 || '', s.companyEmail2 || '',
          s.companyLogoUrl || '', s.unitQueryPriceKz || 50, s.minCustomPlanPriceKz || 500,
          s.freeQueriesOnRegister || 3, s.freeQueriesDaily || 3, s.whatsappSupport1 || '',
          s.whatsappSupport2 || '', s.supportEmail || '', s.footerCopyrightText || '',
          s.emisEnabled ? 1 : 0, s.emisEntityId || '', s.emisTerminalId || '', s.emisApiKey || '', s.emisWebhookUrl || '', s.emisAutoActivate ? 1 : 0,
          s.visaMastercardEnabled ? 1 : 0, s.paypalEnabled ? 1 : 0, s.paypalClientId || '',
          s.wiseEnabled ? 1 : 0, s.stripeEnabled ? 1 : 0, s.stripePublicKey || '', s.stripeSecretKey || '',
          s.chatBotEnabled ? 1 : 0, s.chatAdminHoursStart || '08:00', s.chatAdminHoursEnd || '18:00',
          s.chatWelcomeMessage || '', s.chatOfflineMessage || '', s.chatMaxInactivityMinutes || 15,
          s.twoFactorAuthEnabled ? 1 : 0, s.cyberSecurityAiEnabled ? 1 : 0,
          s.activeThemeId || 'theme_nanucloud_dark', s.autoHolidayThemeEnabled ? 1 : 0,
          s.fiscalAiAutoCheckEnabled ? 1 : 0, s.bankName || '', s.bankIban || '', s.bankHolder || '',
          s.expressPhone || '', s.allowRegistration ? 1 : 0, s.maintenanceMode ? 1 : 0,
          'sqlite', new Date().toISOString()
        ]);
      }

      // 10. Sync Audit Logs
      if (Array.isArray(data.auditLogs)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO audit_logs (id, userId, userName, userRole, action, entityType, entityId, details, ipAddress, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const l of data.auditLogs.slice(0, 1000)) {
          stmt.run([
            l.id, l.userId || null, l.userName || null, l.userRole || null, l.action,
            l.entityType || 'system', l.entityId || null, l.details || '', l.ipAddress || '',
            l.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // 11. Sync Support Inquiries
      if (Array.isArray(data.supportInquiries)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO support_inquiries (id, userId, name, email, phone, subject, message, attachmentUrl, status, adminReply, repliedAt, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of data.supportInquiries) {
          stmt.run([
            s.id, s.userId || null, s.name, s.email, s.phone || '', s.subject, s.message,
            s.attachmentUrl || '', s.status || 'open', s.adminReply || '', s.repliedAt || null,
            s.createdAt || new Date().toISOString()
          ]);
        }
        stmt.free();
      }

      // 12. Sync Traffic Campaigns
      if (Array.isArray(data.trafficCampaigns)) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO traffic_campaigns (id, name, source, medium, utmCampaign, budgetKz, clicks, impressions, leads, registrations, paidConversions, revenueKz, startDate, endDate, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of data.trafficCampaigns) {
          stmt.run([
            c.id, c.name, c.source, c.medium || '', c.utmCampaign || '', c.budgetKz || 0,
            c.clicks || 0, c.impressions || 0, c.leads || 0, c.registrations || 0,
            c.paidConversions || 0, c.revenueKz || 0, c.startDate || new Date().toISOString(),
            c.endDate || null, c.status || 'active'
          ]);
        }
        stmt.free();
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
        WHERE email NOT IN ('nanuhost', 'suporte@nanucloud.com')
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
        WHERE LOWER(title) LIKE '%demo%' OR LOWER(title) LIKE '%teste%' OR LOWER(title) LIKE '%sample%'
        OR LOWER(description) LIKE '%demo%' OR LOWER(description) LIKE '%teste%'
      `);

      // 4. Delete demo traffic campaigns
      this.db.run(`
        DELETE FROM traffic_campaigns
        WHERE LOWER(name) LIKE '%demo%' OR LOWER(name) LIKE '%teste%'
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
      'chat_messages', 'clients', 'support_inquiries', 'traffic_campaigns',
      'sms_logs', 'database_connections'
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

  /**
   * Get single table schema and rows
   */
  public getTableData(tableName: string, limit: number = 50, offset: number = 0): {
    tableName: string;
    totalRows: number;
    columns: string[];
    rows: any[];
  } {
    if (!this.db) throw new Error('Base de dados SQLite não inicializada.');

    // Safe table name validation
    const safeNames = [
      'users', 'plans', 'transactions', 'query_history', 'audit_logs',
      'system_settings', 'bank_accounts', 'bot_knowledge',
      'unresolved_bot_questions', 'fiscal_proposals', 'api_keys',
      'chat_messages', 'clients', 'support_inquiries', 'traffic_campaigns',
      'sms_logs', 'database_connections'
    ];

    if (!safeNames.includes(tableName)) {
      throw new Error(`Tabela "${tableName}" inválida ou inacessível.`);
    }

    let totalRows = 0;
    try {
      const countRes = this.db.exec(`SELECT COUNT(*) FROM ${tableName}`);
      if (countRes.length > 0 && countRes[0].values.length > 0) {
        totalRows = Number(countRes[0].values[0][0]);
      }
    } catch {}

    const rows = this.query(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [limit, offset]);
    let columns: string[] = [];
    if (rows.length > 0) {
      columns = Object.keys(rows[0]);
    } else {
      try {
        const pragma = this.query(`PRAGMA table_info(${tableName})`);
        columns = pragma.map(p => p.name);
      } catch {}
    }

    return {
      tableName,
      totalRows,
      columns,
      rows
    };
  }

  /**
   * Generate Full DDL Script for other database engines (MySQL, PostgreSQL, MSSQL, SQLite)
   */
  public generateDdlSchema(engine: 'mysql' | 'postgres' | 'mssql' | 'sqlite' = 'mysql'): string {
    const timestamp = new Date().toISOString();
    
    if (engine === 'mysql') {
      return `-- ============================================================================
-- ESQUEMA DDL COMPLETO NANUCLOUD PARA MYSQL 8.0+
-- Gerado em: ${timestamp}
-- Compatível com: MySQL Workbench, phpMyAdmin, DBeaver, RDS Aurora MySQL
-- ============================================================================

CREATE DATABASE IF NOT EXISTS nanucloud_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nanucloud_db;

-- 1. Utilizadores e Administradores
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(64),
  company VARCHAR(255),
  address TEXT,
  nif VARCHAR(64),
  country VARCHAR(8) DEFAULT 'AO',
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(32) DEFAULT 'user',
  isActive TINYINT(1) DEFAULT 1,
  queriesRemaining INT DEFAULT 3,
  totalQueriesUsed INT DEFAULT 0,
  activePlanId VARCHAR(64),
  activePlanName VARCHAR(255),
  planExpiresAt DATETIME,
  isImportUnlocked TINYINT(1) DEFAULT 0,
  isBatchUnlocked TINYINT(1) DEFAULT 0,
  twoFactorEnabled TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  lastLoginAt DATETIME,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Planos Comerciais e Preçário
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  priceKz DECIMAL(15, 2) NOT NULL,
  queriesCount INT NOT NULL,
  validityDays INT DEFAULT 30,
  unitPriceKz DECIMAL(15, 2) DEFAULT 50.00,
  features JSON,
  unlocksImport TINYINT(1) DEFAULT 0,
  unlocksBatch TINYINT(1) DEFAULT 0,
  isCustom TINYINT(1) DEFAULT 0,
  minPriceKz DECIMAL(15, 2),
  badge VARCHAR(64),
  sortOrder INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Transações e Pagamentos
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  userName VARCHAR(255),
  userEmail VARCHAR(255),
  planId VARCHAR(64) NOT NULL,
  planName VARCHAR(255) NOT NULL,
  queriesCount INT NOT NULL,
  amountKz DECIMAL(15, 2) NOT NULL,
  paymentMethod VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  proofFileName VARCHAR(255),
  proofFileUrl TEXT,
  paymentReference VARCHAR(128),
  notes TEXT,
  validatedByAdminId VARCHAR(64),
  validatedByAdminName VARCHAR(255),
  validatedAt DATETIME,
  createdAt DATETIME NOT NULL,
  INDEX idx_tx_user (userId),
  INDEX idx_tx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Histórico de Simulações e Consultas
CREATE TABLE IF NOT EXISTS query_history (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  type VARCHAR(32) DEFAULT 'local',
  itemType VARCHAR(32) DEFAULT 'product',
  countryCode VARCHAR(8) DEFAULT 'AO',
  title VARCHAR(255),
  description TEXT,
  costBase DECIMAL(15, 2) DEFAULT 0,
  vatRate DECIMAL(5, 2) DEFAULT 0,
  marginApplied DECIMAL(6, 2) DEFAULT 0,
  finalPrice DECIMAL(15, 2) DEFAULT 0,
  netProfit DECIMAL(15, 2) DEFAULT 0,
  retentionRate DECIMAL(5, 2) DEFAULT 0,
  retentionAmount DECIMAL(15, 2) DEFAULT 0,
  netReceived DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(16) DEFAULT 'Kz',
  details JSON NOT NULL,
  createdAt DATETIME NOT NULL,
  INDEX idx_qh_user (userId),
  INDEX idx_qh_date (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Logs de Auditoria e Segurança
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64),
  userName VARCHAR(255),
  userRole VARCHAR(32),
  action VARCHAR(128) NOT NULL,
  entityType VARCHAR(64) NOT NULL,
  entityId VARCHAR(64),
  details TEXT,
  ipAddress VARCHAR(64),
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Configurações Globais do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(64) PRIMARY KEY,
  companyName VARCHAR(255) NOT NULL,
  companyAddress TEXT,
  companyNif VARCHAR(64),
  companyPhone1 VARCHAR(64),
  companyPhone2 VARCHAR(64),
  companyEmail1 VARCHAR(128),
  companyEmail2 VARCHAR(128),
  companyLogoUrl TEXT,
  unitQueryPriceKz DECIMAL(15, 2) DEFAULT 50.00,
  minCustomPlanPriceKz DECIMAL(15, 2) DEFAULT 500.00,
  freeQueriesOnRegister INT DEFAULT 3,
  freeQueriesDaily INT DEFAULT 3,
  whatsappSupport1 VARCHAR(64),
  whatsappSupport2 VARCHAR(64),
  supportEmail VARCHAR(128),
  footerCopyrightText TEXT,
  emisEnabled TINYINT(1) DEFAULT 1,
  emisEntityId VARCHAR(64),
  emisTerminalId VARCHAR(64),
  emisApiKey VARCHAR(255),
  emisWebhookUrl VARCHAR(255),
  emisAutoActivate TINYINT(1) DEFAULT 1,
  visaMastercardEnabled TINYINT(1) DEFAULT 1,
  paypalEnabled TINYINT(1) DEFAULT 1,
  paypalClientId VARCHAR(255),
  wiseEnabled TINYINT(1) DEFAULT 1,
  stripeEnabled TINYINT(1) DEFAULT 1,
  stripePublicKey VARCHAR(255),
  stripeSecretKey VARCHAR(255),
  chatBotEnabled TINYINT(1) DEFAULT 1,
  chatAdminHoursStart VARCHAR(16) DEFAULT '08:00',
  chatAdminHoursEnd VARCHAR(16) DEFAULT '18:00',
  chatWelcomeMessage TEXT,
  chatOfflineMessage TEXT,
  chatMaxInactivityMinutes INT DEFAULT 15,
  twoFactorAuthEnabled TINYINT(1) DEFAULT 0,
  cyberSecurityAiEnabled TINYINT(1) DEFAULT 1,
  activeThemeId VARCHAR(64) DEFAULT 'theme_nanucloud_dark',
  autoHolidayThemeEnabled TINYINT(1) DEFAULT 1,
  fiscalAiAutoCheckEnabled TINYINT(1) DEFAULT 1,
  bankName VARCHAR(255),
  bankIban VARCHAR(128),
  bankHolder VARCHAR(255),
  expressPhone VARCHAR(64),
  allowRegistration TINYINT(1) DEFAULT 1,
  maintenanceMode TINYINT(1) DEFAULT 0,
  activeDatabaseEngine VARCHAR(32) DEFAULT 'mysql',
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Contas Bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id VARCHAR(64) PRIMARY KEY,
  bankName VARCHAR(255) NOT NULL,
  iban VARCHAR(128) NOT NULL,
  swift VARCHAR(64),
  holder VARCHAR(255) NOT NULL,
  currency VARCHAR(32) DEFAULT 'AOA (Kz)',
  isActive TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Base de Conhecimento do Robô
CREATE TABLE IF NOT EXISTS bot_knowledge (
  id VARCHAR(64) PRIMARY KEY,
  question TEXT NOT NULL,
  keywords JSON NOT NULL,
  answer TEXT NOT NULL,
  language VARCHAR(8) DEFAULT 'pt',
  category VARCHAR(64) DEFAULT 'general',
  isApproved TINYINT(1) DEFAULT 1,
  learnedFromAdminId VARCHAR(64),
  learnedFromAdminName VARCHAR(255),
  learnedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Dúvidas Pendentes
CREATE TABLE IF NOT EXISTS unresolved_bot_questions (
  id VARCHAR(64) PRIMARY KEY,
  sessionId VARCHAR(128),
  userName VARCHAR(255),
  userEmail VARCHAR(255),
  question TEXT NOT NULL,
  detectedLanguage VARCHAR(8) DEFAULT 'pt',
  importance VARCHAR(32) DEFAULT 'normal',
  status VARCHAR(32) DEFAULT 'pending',
  adminAnswer TEXT,
  answeredByAdminId VARCHAR(64),
  answeredByAdminName VARCHAR(255),
  answeredAt DATETIME,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Propostas Fiscais AGT
CREATE TABLE IF NOT EXISTS fiscal_proposals (
  id VARCHAR(64) PRIMARY KEY,
  countryCode VARCHAR(8) NOT NULL,
  countryName VARCHAR(128) NOT NULL,
  taxType VARCHAR(64) NOT NULL,
  currentValue VARCHAR(255) NOT NULL,
  proposedValue VARCHAR(255) NOT NULL,
  sourceLaw TEXT NOT NULL,
  reason TEXT,
  detectedAt DATETIME NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  reviewedBy VARCHAR(255),
  reviewedAt DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Chaves de API e Integrações
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  \`key\` VARCHAR(255) UNIQUE NOT NULL,
  system VARCHAR(64) NOT NULL,
  permissions JSON,
  status VARCHAR(32) DEFAULT 'active',
  createdAt DATETIME NOT NULL,
  lastUsedAt DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Mensagens de Chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  sessionId VARCHAR(128) NOT NULL,
  senderType VARCHAR(32) NOT NULL,
  senderName VARCHAR(255) NOT NULL,
  senderEmail VARCHAR(255),
  message TEXT NOT NULL,
  language VARCHAR(8) DEFAULT 'pt',
  isAutoResponse TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL,
  INDEX idx_chat_session (sessionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Clientes Registados
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  nif VARCHAR(64),
  phone VARCHAR(64),
  email VARCHAR(255),
  balance DECIMAL(15, 2) DEFAULT 0,
  country VARCHAR(8) DEFAULT 'AO',
  address TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Suporte e Inquéritos
CREATE TABLE IF NOT EXISTS support_inquiries (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachmentUrl TEXT,
  status VARCHAR(32) DEFAULT 'open',
  adminReply TEXT,
  repliedAt DATETIME,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Campanhas de Marketing
CREATE TABLE IF NOT EXISTS traffic_campaigns (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL,
  medium VARCHAR(64),
  utmCampaign VARCHAR(255),
  budgetKz DECIMAL(15, 2) DEFAULT 0,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  leads INT DEFAULT 0,
  registrations INT DEFAULT 0,
  paidConversions INT DEFAULT 0,
  revenueKz DECIMAL(15, 2) DEFAULT 0,
  startDate DATETIME NOT NULL,
  endDate DATETIME,
  status VARCHAR(32) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. SMS Logs
CREATE TABLE IF NOT EXISTS sms_logs (
  id VARCHAR(64) PRIMARY KEY,
  phoneNumber VARCHAR(64) NOT NULL,
  countryCode VARCHAR(16) DEFAULT '+244',
  messageType VARCHAR(64) NOT NULL,
  messageContent TEXT NOT NULL,
  recipientName VARCHAR(255),
  sentByUserId VARCHAR(64),
  sentByUserName VARCHAR(255),
  status VARCHAR(32) DEFAULT 'delivered',
  gatewayResponse TEXT,
  sentAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Conexões de Banco de Dados
CREATE TABLE IF NOT EXISTS database_connections (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  engineType VARCHAR(32) NOT NULL,
  host VARCHAR(255),
  port INT,
  databaseName VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  sslEnabled TINYINT(1) DEFAULT 0,
  isActive TINYINT(1) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'disconnected',
  lastTestedAt DATETIME,
  lastBackupAt DATETIME,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
    }

    if (engine === 'postgres') {
      return `-- ============================================================================
-- ESQUEMA DDL COMPLETO NANUCLOUD PARA POSTGRESQL 14+ / 16+
-- Gerado em: ${timestamp}
-- Compatível com: pgAdmin, Supabase, Neon, Cloud SQL PostgreSQL, DBeaver
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(64),
  company VARCHAR(255),
  address TEXT,
  nif VARCHAR(64),
  country VARCHAR(8) DEFAULT 'AO',
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(32) DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  queriesRemaining INTEGER DEFAULT 3,
  totalQueriesUsed INTEGER DEFAULT 0,
  activePlanId VARCHAR(64),
  activePlanName VARCHAR(255),
  planExpiresAt TIMESTAMPTZ,
  isImportUnlocked BOOLEAN DEFAULT FALSE,
  isBatchUnlocked BOOLEAN DEFAULT FALSE,
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL,
  updatedAt TIMESTAMPTZ NOT NULL,
  lastLoginAt TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  priceKz NUMERIC(15, 2) NOT NULL,
  queriesCount INTEGER NOT NULL,
  validityDays INTEGER DEFAULT 30,
  unitPriceKz NUMERIC(15, 2) DEFAULT 50.00,
  features JSONB,
  unlocksImport BOOLEAN DEFAULT FALSE,
  unlocksBatch BOOLEAN DEFAULT FALSE,
  isCustom BOOLEAN DEFAULT FALSE,
  minPriceKz NUMERIC(15, 2),
  badge VARCHAR(64),
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) REFERENCES users(id),
  userName VARCHAR(255),
  userEmail VARCHAR(255),
  planId VARCHAR(64) NOT NULL,
  planName VARCHAR(255) NOT NULL,
  queriesCount INTEGER NOT NULL,
  amountKz NUMERIC(15, 2) NOT NULL,
  paymentMethod VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  proofFileName VARCHAR(255),
  proofFileUrl TEXT,
  paymentReference VARCHAR(128),
  notes TEXT,
  validatedByAdminId VARCHAR(64),
  validatedByAdminName VARCHAR(255),
  validatedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS query_history (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) REFERENCES users(id),
  type VARCHAR(32) DEFAULT 'local',
  itemType VARCHAR(32) DEFAULT 'product',
  countryCode VARCHAR(8) DEFAULT 'AO',
  title VARCHAR(255),
  description TEXT,
  costBase NUMERIC(15, 2) DEFAULT 0,
  vatRate NUMERIC(5, 2) DEFAULT 0,
  marginApplied NUMERIC(6, 2) DEFAULT 0,
  finalPrice NUMERIC(15, 2) DEFAULT 0,
  netProfit NUMERIC(15, 2) DEFAULT 0,
  retentionRate NUMERIC(5, 2) DEFAULT 0,
  retentionAmount NUMERIC(15, 2) DEFAULT 0,
  netReceived NUMERIC(15, 2) DEFAULT 0,
  currency VARCHAR(16) DEFAULT 'Kz',
  details JSONB NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64),
  userName VARCHAR(255),
  userRole VARCHAR(32),
  action VARCHAR(128) NOT NULL,
  entityType VARCHAR(64) NOT NULL,
  entityId VARCHAR(64),
  details TEXT,
  ipAddress VARCHAR(64),
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(64) PRIMARY KEY,
  companyName VARCHAR(255) NOT NULL,
  companyAddress TEXT,
  companyNif VARCHAR(64),
  companyPhone1 VARCHAR(64),
  companyPhone2 VARCHAR(64),
  companyEmail1 VARCHAR(128),
  companyEmail2 VARCHAR(128),
  companyLogoUrl TEXT,
  unitQueryPriceKz NUMERIC(15, 2) DEFAULT 50.00,
  minCustomPlanPriceKz NUMERIC(15, 2) DEFAULT 500.00,
  freeQueriesOnRegister INTEGER DEFAULT 3,
  freeQueriesDaily INTEGER DEFAULT 3,
  whatsappSupport1 VARCHAR(64),
  whatsappSupport2 VARCHAR(64),
  supportEmail VARCHAR(128),
  footerCopyrightText TEXT,
  emisEnabled BOOLEAN DEFAULT TRUE,
  emisEntityId VARCHAR(64),
  emisTerminalId VARCHAR(64),
  emisApiKey VARCHAR(255),
  emisWebhookUrl VARCHAR(255),
  emisAutoActivate BOOLEAN DEFAULT TRUE,
  visaMastercardEnabled BOOLEAN DEFAULT TRUE,
  paypalEnabled BOOLEAN DEFAULT TRUE,
  paypalClientId VARCHAR(255),
  wiseEnabled BOOLEAN DEFAULT TRUE,
  stripeEnabled BOOLEAN DEFAULT TRUE,
  stripePublicKey VARCHAR(255),
  stripeSecretKey VARCHAR(255),
  chatBotEnabled BOOLEAN DEFAULT TRUE,
  chatAdminHoursStart VARCHAR(16) DEFAULT '08:00',
  chatAdminHoursEnd VARCHAR(16) DEFAULT '18:00',
  chatWelcomeMessage TEXT,
  chatOfflineMessage TEXT,
  chatMaxInactivityMinutes INTEGER DEFAULT 15,
  twoFactorAuthEnabled BOOLEAN DEFAULT FALSE,
  cyberSecurityAiEnabled BOOLEAN DEFAULT TRUE,
  activeThemeId VARCHAR(64) DEFAULT 'theme_nanucloud_dark',
  autoHolidayThemeEnabled BOOLEAN DEFAULT TRUE,
  fiscalAiAutoCheckEnabled BOOLEAN DEFAULT TRUE,
  bankName VARCHAR(255),
  bankIban VARCHAR(128),
  bankHolder VARCHAR(255),
  expressPhone VARCHAR(64),
  allowRegistration BOOLEAN DEFAULT TRUE,
  maintenanceMode BOOLEAN DEFAULT FALSE,
  activeDatabaseEngine VARCHAR(32) DEFAULT 'postgres',
  updatedAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id VARCHAR(64) PRIMARY KEY,
  bankName VARCHAR(255) NOT NULL,
  iban VARCHAR(128) NOT NULL,
  swift VARCHAR(64),
  holder VARCHAR(255) NOT NULL,
  currency VARCHAR(32) DEFAULT 'AOA (Kz)',
  isActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bot_knowledge (
  id VARCHAR(64) PRIMARY KEY,
  question TEXT NOT NULL,
  keywords JSONB NOT NULL,
  answer TEXT NOT NULL,
  language VARCHAR(8) DEFAULT 'pt',
  category VARCHAR(64) DEFAULT 'general',
  isApproved BOOLEAN DEFAULT TRUE,
  learnedFromAdminId VARCHAR(64),
  learnedFromAdminName VARCHAR(255),
  learnedAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS unresolved_bot_questions (
  id VARCHAR(64) PRIMARY KEY,
  sessionId VARCHAR(128),
  userName VARCHAR(255),
  userEmail VARCHAR(255),
  question TEXT NOT NULL,
  detectedLanguage VARCHAR(8) DEFAULT 'pt',
  importance VARCHAR(32) DEFAULT 'normal',
  status VARCHAR(32) DEFAULT 'pending',
  adminAnswer TEXT,
  answeredByAdminId VARCHAR(64),
  answeredByAdminName VARCHAR(255),
  answeredAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS fiscal_proposals (
  id VARCHAR(64) PRIMARY KEY,
  countryCode VARCHAR(8) NOT NULL,
  countryName VARCHAR(128) NOT NULL,
  taxType VARCHAR(64) NOT NULL,
  currentValue VARCHAR(255) NOT NULL,
  proposedValue VARCHAR(255) NOT NULL,
  sourceLaw TEXT NOT NULL,
  reason TEXT,
  detectedAt TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  reviewedBy VARCHAR(255),
  reviewedAt TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) UNIQUE NOT NULL,
  system VARCHAR(64) NOT NULL,
  permissions JSONB,
  status VARCHAR(32) DEFAULT 'active',
  createdAt TIMESTAMPTZ NOT NULL,
  lastUsedAt TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  sessionId VARCHAR(128) NOT NULL,
  senderType VARCHAR(32) NOT NULL,
  senderName VARCHAR(255) NOT NULL,
  senderEmail VARCHAR(255),
  message TEXT NOT NULL,
  language VARCHAR(8) DEFAULT 'pt',
  isAutoResponse BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  nif VARCHAR(64),
  phone VARCHAR(64),
  email VARCHAR(255),
  balance NUMERIC(15, 2) DEFAULT 0,
  country VARCHAR(8) DEFAULT 'AO',
  address TEXT,
  createdAt TIMESTAMPTZ NOT NULL,
  updatedAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS support_inquiries (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachmentUrl TEXT,
  status VARCHAR(32) DEFAULT 'open',
  adminReply TEXT,
  repliedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS traffic_campaigns (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL,
  medium VARCHAR(64),
  utmCampaign VARCHAR(255),
  budgetKz NUMERIC(15, 2) DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  paidConversions INTEGER DEFAULT 0,
  revenueKz NUMERIC(15, 2) DEFAULT 0,
  startDate TIMESTAMPTZ NOT NULL,
  endDate TIMESTAMPTZ,
  status VARCHAR(32) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id VARCHAR(64) PRIMARY KEY,
  phoneNumber VARCHAR(64) NOT NULL,
  countryCode VARCHAR(16) DEFAULT '+244',
  messageType VARCHAR(64) NOT NULL,
  messageContent TEXT NOT NULL,
  recipientName VARCHAR(255),
  sentByUserId VARCHAR(64),
  sentByUserName VARCHAR(255),
  status VARCHAR(32) DEFAULT 'delivered',
  gatewayResponse TEXT,
  sentAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS database_connections (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  engineType VARCHAR(32) NOT NULL,
  host VARCHAR(255),
  port INTEGER,
  databaseName VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  sslEnabled BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT FALSE,
  status VARCHAR(32) DEFAULT 'disconnected',
  lastTestedAt TIMESTAMPTZ,
  lastBackupAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL
);
`;
    }

    if (engine === 'mssql') {
      return `-- ============================================================================
-- ESQUEMA DDL COMPLETO NANUCLOUD PARA MICROSOFT SQL SERVER (2019 / 2022 / AZURE SQL)
-- Gerado em: ${timestamp}
-- Compatível com: SQL Server Management Studio (SSMS), Azure Data Studio, DBeaver
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'nanucloud_db')
BEGIN
    CREATE DATABASE nanucloud_db;
END
GO
USE nanucloud_db;
GO

IF OBJECT_ID('dbo.users', 'U') IS NULL
CREATE TABLE dbo.users (
  id NVARCHAR(64) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  phone NVARCHAR(64),
  company NVARCHAR(255),
  address NVARCHAR(MAX),
  nif NVARCHAR(64),
  country NVARCHAR(8) DEFAULT 'AO',
  passwordHash NVARCHAR(255) NOT NULL,
  role NVARCHAR(32) DEFAULT 'user',
  isActive BIT DEFAULT 1,
  queriesRemaining INT DEFAULT 3,
  totalQueriesUsed INT DEFAULT 0,
  activePlanId NVARCHAR(64),
  activePlanName NVARCHAR(255),
  planExpiresAt DATETIME2,
  isImportUnlocked BIT DEFAULT 0,
  isBatchUnlocked BIT DEFAULT 0,
  twoFactorEnabled BIT DEFAULT 0,
  createdAt DATETIME2 NOT NULL,
  updatedAt DATETIME2 NOT NULL,
  lastLoginAt DATETIME2
);
GO

IF OBJECT_ID('dbo.plans', 'U') IS NULL
CREATE TABLE dbo.plans (
  id NVARCHAR(64) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  priceKz DECIMAL(18, 2) NOT NULL,
  queriesCount INT NOT NULL,
  validityDays INT DEFAULT 30,
  unitPriceKz DECIMAL(18, 2) DEFAULT 50.00,
  features NVARCHAR(MAX), -- JSON format
  unlocksImport BIT DEFAULT 0,
  unlocksBatch BIT DEFAULT 0,
  isCustom BIT DEFAULT 0,
  minPriceKz DECIMAL(18, 2),
  badge NVARCHAR(64),
  sortOrder INT DEFAULT 0
);
GO

IF OBJECT_ID('dbo.transactions', 'U') IS NULL
CREATE TABLE dbo.transactions (
  id NVARCHAR(64) PRIMARY KEY,
  userId NVARCHAR(64) NOT NULL,
  userName NVARCHAR(255),
  userEmail NVARCHAR(255),
  planId NVARCHAR(64) NOT NULL,
  planName NVARCHAR(255) NOT NULL,
  queriesCount INT NOT NULL,
  amountKz DECIMAL(18, 2) NOT NULL,
  paymentMethod NVARCHAR(64) NOT NULL,
  status NVARCHAR(32) DEFAULT 'pending',
  proofFileName NVARCHAR(255),
  proofFileUrl NVARCHAR(MAX),
  paymentReference NVARCHAR(128),
  notes NVARCHAR(MAX),
  validatedByAdminId NVARCHAR(64),
  validatedByAdminName NVARCHAR(255),
  validatedAt DATETIME2,
  createdAt DATETIME2 NOT NULL
);
GO

IF OBJECT_ID('dbo.query_history', 'U') IS NULL
CREATE TABLE dbo.query_history (
  id NVARCHAR(64) PRIMARY KEY,
  userId NVARCHAR(64) NOT NULL,
  type NVARCHAR(32) DEFAULT 'local',
  itemType NVARCHAR(32) DEFAULT 'product',
  countryCode NVARCHAR(8) DEFAULT 'AO',
  title NVARCHAR(255),
  description NVARCHAR(MAX),
  costBase DECIMAL(18, 2) DEFAULT 0,
  vatRate DECIMAL(6, 2) DEFAULT 0,
  marginApplied DECIMAL(6, 2) DEFAULT 0,
  finalPrice DECIMAL(18, 2) DEFAULT 0,
  netProfit DECIMAL(18, 2) DEFAULT 0,
  retentionRate DECIMAL(6, 2) DEFAULT 0,
  retentionAmount DECIMAL(18, 2) DEFAULT 0,
  netReceived DECIMAL(18, 2) DEFAULT 0,
  currency NVARCHAR(16) DEFAULT 'Kz',
  details NVARCHAR(MAX) NOT NULL,
  createdAt DATETIME2 NOT NULL
);
GO

IF OBJECT_ID('dbo.system_settings', 'U') IS NULL
CREATE TABLE dbo.system_settings (
  id NVARCHAR(64) PRIMARY KEY,
  companyName NVARCHAR(255) NOT NULL,
  companyAddress NVARCHAR(MAX),
  companyNif NVARCHAR(64),
  companyPhone1 NVARCHAR(64),
  companyPhone2 NVARCHAR(64),
  companyEmail1 NVARCHAR(128),
  companyEmail2 NVARCHAR(128),
  companyLogoUrl NVARCHAR(MAX),
  unitQueryPriceKz DECIMAL(18, 2) DEFAULT 50.00,
  minCustomPlanPriceKz DECIMAL(18, 2) DEFAULT 500.00,
  freeQueriesOnRegister INT DEFAULT 3,
  freeQueriesDaily INT DEFAULT 3,
  whatsappSupport1 NVARCHAR(64),
  whatsappSupport2 NVARCHAR(64),
  supportEmail NVARCHAR(128),
  footerCopyrightText NVARCHAR(MAX),
  emisEnabled BIT DEFAULT 1,
  emisEntityId NVARCHAR(64),
  emisTerminalId NVARCHAR(64),
  emisApiKey NVARCHAR(255),
  emisWebhookUrl NVARCHAR(255),
  emisAutoActivate BIT DEFAULT 1,
  visaMastercardEnabled BIT DEFAULT 1,
  paypalEnabled BIT DEFAULT 1,
  paypalClientId NVARCHAR(255),
  wiseEnabled BIT DEFAULT 1,
  stripeEnabled BIT DEFAULT 1,
  stripePublicKey NVARCHAR(255),
  stripeSecretKey NVARCHAR(255),
  chatBotEnabled BIT DEFAULT 1,
  chatAdminHoursStart NVARCHAR(16) DEFAULT '08:00',
  chatAdminHoursEnd NVARCHAR(16) DEFAULT '18:00',
  chatWelcomeMessage NVARCHAR(MAX),
  chatOfflineMessage NVARCHAR(MAX),
  chatMaxInactivityMinutes INT DEFAULT 15,
  twoFactorAuthEnabled BIT DEFAULT 0,
  cyberSecurityAiEnabled BIT DEFAULT 1,
  activeThemeId NVARCHAR(64) DEFAULT 'theme_nanucloud_dark',
  autoHolidayThemeEnabled BIT DEFAULT 1,
  fiscalAiAutoCheckEnabled BIT DEFAULT 1,
  bankName NVARCHAR(255),
  bankIban NVARCHAR(128),
  bankHolder NVARCHAR(255),
  expressPhone NVARCHAR(64),
  allowRegistration BIT DEFAULT 1,
  maintenanceMode BIT DEFAULT 0,
  activeDatabaseEngine NVARCHAR(32) DEFAULT 'mssql',
  updatedAt DATETIME2 NOT NULL
);
GO
`;
    }

    // Default SQLite
    return `-- ============================================================================
-- ESQUEMA DDL COMPLETO NANUCLOUD PARA SQLITE 3
-- Gerado em: ${timestamp}
-- ============================================================================
` + this.generateSqliteDdl();
  }

  private generateSqliteDdl(): string {
    return `
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

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  priceKz REAL NOT NULL,
  queriesCount INTEGER NOT NULL,
  validityDays INTEGER DEFAULT 30,
  unitPriceKz REAL DEFAULT 50,
  features TEXT,
  unlocksImport INTEGER DEFAULT 0,
  unlocksBatch INTEGER DEFAULT 0,
  isCustom INTEGER DEFAULT 0,
  minPriceKz REAL,
  badge TEXT,
  sortOrder INTEGER DEFAULT 0
);

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
  paymentReference TEXT,
  notes TEXT,
  validatedByAdminId TEXT,
  validatedByAdminName TEXT,
  validatedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS query_history (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'local',
  itemType TEXT DEFAULT 'product',
  countryCode TEXT DEFAULT 'AO',
  title TEXT,
  description TEXT,
  costBase REAL DEFAULT 0,
  vatRate REAL DEFAULT 0,
  marginApplied REAL DEFAULT 0,
  finalPrice REAL DEFAULT 0,
  netProfit REAL DEFAULT 0,
  retentionRate REAL DEFAULT 0,
  retentionAmount REAL DEFAULT 0,
  netReceived REAL DEFAULT 0,
  currency TEXT DEFAULT 'Kz',
  details TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

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
  emisEntityId TEXT,
  emisTerminalId TEXT,
  emisApiKey TEXT,
  emisWebhookUrl TEXT,
  emisAutoActivate INTEGER DEFAULT 1,
  visaMastercardEnabled INTEGER DEFAULT 1,
  paypalEnabled INTEGER DEFAULT 1,
  paypalClientId TEXT,
  wiseEnabled INTEGER DEFAULT 1,
  stripeEnabled INTEGER DEFAULT 1,
  stripePublicKey TEXT,
  stripeSecretKey TEXT,
  chatBotEnabled INTEGER DEFAULT 1,
  chatAdminHoursStart TEXT DEFAULT '08:00',
  chatAdminHoursEnd TEXT DEFAULT '18:00',
  chatWelcomeMessage TEXT,
  chatOfflineMessage TEXT,
  chatMaxInactivityMinutes INTEGER DEFAULT 15,
  twoFactorAuthEnabled INTEGER DEFAULT 0,
  cyberSecurityAiEnabled INTEGER DEFAULT 1,
  activeThemeId TEXT DEFAULT 'theme_nanucloud_dark',
  autoHolidayThemeEnabled INTEGER DEFAULT 1,
  fiscalAiAutoCheckEnabled INTEGER DEFAULT 1,
  bankName TEXT,
  bankIban TEXT,
  bankHolder TEXT,
  expressPhone TEXT,
  allowRegistration INTEGER DEFAULT 1,
  maintenanceMode INTEGER DEFAULT 0,
  activeDatabaseEngine TEXT DEFAULT 'sqlite',
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  bankName TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift TEXT,
  holder TEXT NOT NULL,
  currency TEXT DEFAULT 'AOA (Kz)',
  isActive INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bot_knowledge (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  keywords TEXT NOT NULL,
  answer TEXT NOT NULL,
  language TEXT DEFAULT 'pt',
  category TEXT DEFAULT 'general',
  isApproved INTEGER DEFAULT 1,
  learnedFromAdminId TEXT,
  learnedFromAdminName TEXT,
  learnedAt TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  system TEXT NOT NULL,
  permissions TEXT,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  lastUsedAt TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  senderType TEXT NOT NULL,
  senderName TEXT NOT NULL,
  senderEmail TEXT,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'pt',
  isAutoResponse INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  nif TEXT,
  phone TEXT,
  email TEXT,
  balance REAL DEFAULT 0,
  country TEXT DEFAULT 'AO',
  address TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_inquiries (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachmentUrl TEXT,
  status TEXT DEFAULT 'open',
  adminReply TEXT,
  repliedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS traffic_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  medium TEXT,
  utmCampaign TEXT,
  budgetKz REAL DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  paidConversions INTEGER DEFAULT 0,
  revenueKz REAL DEFAULT 0,
  startDate TEXT NOT NULL,
  endDate TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  phoneNumber TEXT NOT NULL,
  countryCode TEXT DEFAULT '+244',
  messageType TEXT NOT NULL,
  messageContent TEXT NOT NULL,
  recipientName TEXT,
  sentByUserId TEXT,
  sentByUserName TEXT,
  status TEXT DEFAULT 'delivered',
  gatewayResponse TEXT,
  sentAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS database_connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  engineType TEXT NOT NULL,
  host TEXT,
  port INTEGER,
  databaseName TEXT,
  username TEXT,
  password TEXT,
  sslEnabled INTEGER DEFAULT 0,
  isActive INTEGER DEFAULT 0,
  status TEXT DEFAULT 'disconnected',
  lastTestedAt TEXT,
  lastBackupAt TEXT,
  createdAt TEXT NOT NULL
);
`;
  }

  /**
   * Export Full Database as SQL Dump with Schema and Data
   */
  public exportFullSqlDump(engine: 'mysql' | 'postgres' | 'mssql' | 'sqlite' = 'sqlite'): string {
    const ddl = this.generateDdlSchema(engine);
    let dump = ddl + `\n\n-- ============================================================================\n-- DADOS E REGISTOS DO SISTEMA NANUCLOUD\n-- ============================================================================\n`;

    const tableNames = [
      'system_settings', 'users', 'plans', 'bank_accounts', 'bot_knowledge',
      'fiscal_proposals', 'api_keys', 'transactions', 'query_history', 'audit_logs'
    ];

    if (!this.db) return dump;

    for (const t of tableNames) {
      try {
        const rows = this.query(`SELECT * FROM ${t}`);
        if (rows.length === 0) continue;

        dump += `\n-- Tabela: ${t} (${rows.length} registos)\n`;
        for (const r of rows) {
          const keys = Object.keys(r);
          const escapedValues = keys.map(k => {
            const val = r[k];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return String(val);
            const str = String(val).replace(/'/g, "''");
            return `'${str}'`;
          });

          if (engine === 'mysql') {
            dump += `INSERT INTO \`${t}\` (\`${keys.join('`, `')}\`) VALUES (${escapedValues.join(', ')});\n`;
          } else {
            dump += `INSERT INTO ${t} (${keys.join(', ')}) VALUES (${escapedValues.join(', ')});\n`;
          }
        }
      } catch {}
    }

    return dump;
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
