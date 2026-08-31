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
        engine: 'SQLite 3 (via WebAssembly & Native Binary)',
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

// 3. Executar consultas SQL diretas (para testes e inspeção)
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { sql, params } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, error: 'O comando SQL é obrigatório.' });
    }

    await sqliteDb.init();

    const trimmed = sql.trim();
    if (/^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed)) {
      const rows = sqliteDb.query(trimmed, Array.isArray(params) ? params : []);
      return res.json({
        success: true,
        type: 'select',
        rowCount: rows.length,
        rows
      });
    } else {
      const result = sqliteDb.run(trimmed, Array.isArray(params) ? params : []);
      return res.json({
        success: true,
        type: 'mutate',
        rowsAffected: result.changes,
        message: 'Comando SQL executado com sucesso e persistido no ficheiro SQLite.'
      });
    }
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || 'Erro de sintaxe ou execução SQL.' });
  }
});

// 4. Forçar sincronização imediata
router.post('/sync', async (req: Request, res: Response) => {
  try {
    await sqliteDb.init();
    const allUsers = db.getUsers();
    const allPlans = db.getPlans();
    const allSettings = db.getSettings();
    const allProposals = db.getFiscalProposals();
    const allApiKeys = db.getApiKeys();
    const allKnowledge = db.getBotKnowledgeBase();

    sqliteDb.syncFromObject({
      users: allUsers,
      plans: allPlans,
      settings: allSettings,
      fiscalProposals: allProposals,
      apiKeys: allApiKeys,
      botKnowledgeBase: allKnowledge
    });

    return res.json({
      success: true,
      message: 'Base de dados SQLite sincronizada com sucesso no disco em /data/nanucloud.sqlite e /database/nanucloud.sqlite.',
      info: sqliteDb.getDatabaseInfo()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
