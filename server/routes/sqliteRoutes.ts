import { Router, Request, Response } from 'express';
import { sqliteDb } from '../sqliteDb.js';
import { db } from '../db.js';

const router = Router();

// 1. Obter informações de status do SQLite
router.get('/info', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const info = sqliteDb.getDatabaseInfo();
    return res.json({
      success: true,
      data: {
        engine: 'SQLite 3 Relational Database Core (Padrão)',
        isDefault: true,
        sqliteFilePath: info.sqliteFilePath,
        databaseDirPath: info.databaseDirPath,
        fileSizeBytes: info.fileSizeBytes,
        fileSizeFormatted: info.fileSizeFormatted,
        tableCounts: info.tableCounts,
        tables: info.tables,
        lastSync: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Erro ao obter informações do SQLite.' });
  }
});

// 2. Descarregar o ficheiro binário .sqlite real
router.get('/download', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const buffer = sqliteDb.getSqliteBinaryBuffer();
    if (!buffer) {
      return res.status(404).json({ success: false, error: 'Base de dados SQLite não disponível para download.' });
    }

    res.setHeader('Content-Type', 'application/vnd.sqlite3');
    res.setHeader('Content-Disposition', 'attachment; filename="nanucloud.sqlite"');
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Erro ao descarregar ficheiro SQLite.' });
  }
});

// 3. Descarregar dump SQL completo
router.get('/export-sql', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const engine = (req.query.engine as any) || 'sqlite';
    const sqlDump = sqliteDb.exportFullSqlDump(engine);

    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="nanucloud_dump_${engine}_${Date.now()}.sql"`);
    return res.send(sqlDump);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Erro ao exportar dump SQL.' });
  }
});

// 4. Listar todas as tabelas e número de linhas
router.get('/tables', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const info = sqliteDb.getDatabaseInfo();
    return res.json({
      success: true,
      tables: info.tables.map(name => ({
        name,
        rowCount: info.tableCounts[name] || 0
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Inspecionar conteúdo de uma tabela específica
router.get('/table/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    await sqliteDb.init();
    const tableData = sqliteDb.getTableData(name, limit, offset);
    return res.json({
      success: true,
      data: tableData
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Gerar DDL de tabelas para qualquer motor de base de dados
router.post('/generate-ddl', async (req: Request, res: Response) => {
  try {
    const engine = req.body.engine || 'mysql';
    await sqliteDb.init();
    const ddl = sqliteDb.generateDdlSchema(engine);
    return res.json({
      success: true,
      engine,
      ddl
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Executar consultas SQL diretas (para testes e terminal interativo)
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, error: 'O comando SQL é obrigatório.' });
    }

    await sqliteDb.init();
    const result = sqliteDb.executeRaw(sql);
    return res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || 'Erro de sintaxe ou execução SQL.' });
  }
});

// 8. Forçar sincronização imediata
router.post('/sync', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const allUsers = db.getUsers();
    const allPlans = db.getPlans();
    const allSettings = db.getSettings();
    const allProposals = db.getFiscalProposals();
    const allApiKeys = db.getApiKeys();
    const allKnowledge = db.getBotKnowledgeBase();
    const allTransactions = db.getTransactions();
    const allHistory = db.getQueryHistory();
    const allInquiries = db.getSupportInquiries();
    const allCampaigns = db.getTrafficCampaigns();

    sqliteDb.syncFromObject({
      users: allUsers,
      plans: allPlans,
      settings: allSettings,
      fiscalProposals: allProposals,
      apiKeys: allApiKeys,
      botKnowledgeBase: allKnowledge,
      transactions: allTransactions,
      queryHistory: allHistory,
      supportInquiries: allInquiries,
      trafficCampaigns: allCampaigns
    });

    return res.json({
      success: true,
      message: 'Base de dados SQLite sincronizada com 100% de integridade em /data/nanucloud.sqlite e /database/nanucloud.sqlite.',
      info: sqliteDb.getDatabaseInfo()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
