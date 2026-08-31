import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authenticateUser } from './server/auth.js';
import authRoutes from './server/routes/authRoutes.js';
import simulatorRoutes from './server/routes/simulatorRoutes.js';
import plansRoutes from './server/routes/plansRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import chatRoutes from './server/routes/chatRoutes.js';
import aiTranslateRoutes from './server/routes/aiTranslateRoutes.js';
import sqliteRoutes from './server/routes/sqliteRoutes.js';
import { db } from './server/db.js';
import { sqliteDb } from './server/sqliteDb.js';

async function startServer() {
  // Initialize SQLite database and sync initial state
  try {
    await sqliteDb.init();
    sqliteDb.syncFromObject({
      users: db.getUsers(),
      plans: db.getPlans(),
      settings: db.getSettings(),
      fiscalProposals: db.getFiscalProposals(),
      apiKeys: db.getApiKeys(),
      botKnowledgeBase: db.getBotKnowledgeBase()
    });
    console.log('✅ SQLite Database conectado e sincronizado com sucesso no arranque do servidor.');
  } catch (err) {
    console.error('⚠️ Aviso ao sincronizar base SQLite no arranque:', err);
  }

  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(authenticateUser);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Public Support Ticket Submission
  app.post('/api/support/submit', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
    }

    const newInquiry = {
      id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: (req as any).user?.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      subject: subject ? subject.trim() : 'Contacto Geral',
      message: message.trim(),
      status: 'open' as const,
      createdAt: new Date().toISOString()
    };

    db.addSupportInquiry(newInquiry);

    db.addAuditLog({
      userId: (req as any).user?.id,
      userName: name,
      action: 'SUPPORT_TICKET_CREATED',
      entityType: 'support',
      entityId: newInquiry.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Novo ticket de suporte submetido por ${name} (${email}): "${subject}"`
    });

    return res.status(201).json({
      message: 'Mensagem enviada com sucesso! A nossa equipa entrará em contacto brevemente.',
      inquiry: newInquiry
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/simulator', simulatorRoutes);
  app.use('/api/plans', plansRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/ai', aiTranslateRoutes);
  app.use('/api/sqlite', sqliteRoutes);

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nanucloud Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
