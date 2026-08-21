import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { AuthRequest, requireAdminLevel2, requireAdminLevel1 } from '../auth.js';
import { User, UserRole, Plan } from '../types.js';

const router = Router();

// =========================================================================
// 1. DASHBOARD OVERVIEW & ANALYTICS (Nível 1 & Nível 2)
// =========================================================================
router.get('/dashboard-stats', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  const transactions = db.getTransactions();
  const history = db.getQueryHistory();
  const logs = db.getAuditLogs();
  const support = db.getSupportInquiries();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const approvedTransactions = transactions.filter(t => t.status === 'approved');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const rejectedTransactions = transactions.filter(t => t.status === 'rejected');

  const totalRevenueKz = approvedTransactions.reduce((acc, t) => acc + t.amountKz, 0);
  const totalQueriesPerformed = history.length;

  const localQueries = history.filter(h => h.type === 'local').length;
  const importQueries = history.filter(h => h.type === 'import').length;
  const batchQueries = history.filter(h => h.type === 'batch').length;

  // Recent 7 days revenue calculation
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentRevenueKz = approvedTransactions
    .filter(t => new Date(t.createdAt).getTime() >= sevenDaysAgo)
    .reduce((acc, t) => acc + t.amountKz, 0);

  return res.json({
    kpis: {
      totalUsers,
      activeUsers,
      totalRevenueKz,
      recentRevenueKz,
      totalQueriesPerformed,
      pendingValidationsCount: pendingTransactions.length,
      openSupportTickets: support.filter(s => s.status === 'open').length
    },
    queryBreakdown: {
      local: localQueries,
      import: importQueries,
      batch: batchQueries
    },
    recentTransactions: transactions.slice(0, 10),
    recentLogs: logs.slice(0, 15)
  });
});

// =========================================================================
// 2. GESTÃO DE TRANSAÇÕES E VALIDAÇÃO DE PAGAMENTOS (Nível 1 & Nível 2)
// =========================================================================
router.get('/transactions', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const transactions = db.getTransactions();
  return res.json({ transactions });
});

router.post('/transactions/:id/validate', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Utilize "approve" ou "reject".' });
    }

    const tx = db.findTransactionById(id);
    if (!tx) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    const user = db.findUserById(tx.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador associado à transação não foi encontrado.' });
    }

    if (action === 'approve') {
      const selectedPlan = db.getPlans().find(p => p.id === tx.planId);
      const validityDays = tx.validityDays || selectedPlan?.validityDays || 30;
      const expiryDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      const unlocksImport = selectedPlan ? selectedPlan.unlocksImport : true;
      const unlocksBatch = selectedPlan ? selectedPlan.unlocksBatch : true;

      // Update user balances and unlocked modules
      db.updateUser(user.id, {
        queriesRemaining: user.queriesRemaining + tx.queriesGranted,
        activePlanId: tx.planId,
        activePlanName: tx.planName,
        planExpiresAt: expiryDate,
        isImportUnlocked: user.isImportUnlocked || unlocksImport,
        isBatchUnlocked: user.isBatchUnlocked || unlocksBatch
      });

      db.updateTransaction(id, {
        status: 'approved',
        reviewedByAdminId: admin.id,
        reviewedByAdminName: admin.name,
        reviewedAt: new Date().toISOString(),
        notes: notes || tx.notes
      });

      db.addAuditLog({
        userId: admin.id,
        userName: admin.name,
        userRole: admin.role,
        action: 'PAYMENT_APPROVED',
        entityType: 'payment',
        entityId: id,
        ipAddress: req.ip || req.socket.remoteAddress,
        details: `Pagamento de ${tx.amountKz.toLocaleString('pt-PT')} Kz aprovado para ${user.name} (${user.email}). Atribuídas ${tx.queriesGranted} pesquisas. Módulos atualizados.`
      });

      return res.json({
        message: `Pagamento aprovado com sucesso! ${tx.queriesGranted} pesquisas creditadas e plano ativado para ${user.name}.`,
        transactionId: id,
        status: 'approved'
      });
    } else {
      db.updateTransaction(id, {
        status: 'rejected',
        reviewedByAdminId: admin.id,
        reviewedByAdminName: admin.name,
        reviewedAt: new Date().toISOString(),
        notes: notes || 'Pagamento recusado pela administração.'
      });

      db.addAuditLog({
        userId: admin.id,
        userName: admin.name,
        userRole: admin.role,
        action: 'PAYMENT_REJECTED',
        entityType: 'payment',
        entityId: id,
        ipAddress: req.ip || req.socket.remoteAddress,
        details: `Pagamento ${id} de ${tx.amountKz.toLocaleString('pt-PT')} Kz de ${user.name} foi rejeitado pelo administrador.`
      });

      return res.json({
        message: 'Pagamento marcado como rejeitado.',
        transactionId: id,
        status: 'rejected'
      });
    }
  } catch (err: any) {
    console.error('Error validating transaction:', err);
    return res.status(500).json({ error: 'Erro ao validar transação.' });
  }
});

// =========================================================================
// 3. GESTÃO DE PLANOS, PREÇOS E PRAZOS (Nível 2 & Nível 1)
// =========================================================================
router.get('/plans', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const plans = db.getPlans().sort((a, b) => a.sortOrder - b.sortOrder);
  const settings = db.getSettings();
  return res.json({ plans, settings });
});

router.put('/plans/:id', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { name, priceKz, queriesCount, validityDays, unlocksImport, unlocksBatch, minPriceKz, badge } = req.body;

    const plan = db.getPlans().find(p => p.id === id);
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado.' });
    }

    const updates: Partial<Plan> = {};
    if (name) updates.name = name.trim();
    if (priceKz !== undefined) updates.priceKz = Number(priceKz);
    if (queriesCount !== undefined) updates.queriesCount = Number(queriesCount);
    if (validityDays !== undefined) updates.validityDays = Number(validityDays);
    if (unlocksImport !== undefined) updates.unlocksImport = Boolean(unlocksImport);
    if (unlocksBatch !== undefined) updates.unlocksBatch = Boolean(unlocksBatch);
    if (minPriceKz !== undefined) updates.minPriceKz = Number(minPriceKz);
    if (badge !== undefined) updates.badge = badge.trim();

    const updated = db.updatePlan(id, updates);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'PLAN_UPDATED',
      entityType: 'plan',
      entityId: id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Plano "${plan.name}" atualizado por ${admin.name}. Preço: ${updates.priceKz ?? plan.priceKz} Kz, Pesquisas: ${updates.queriesCount ?? plan.queriesCount}, Validade: ${updates.validityDays ?? plan.validityDays} dias.`
    });

    return res.json({ message: 'Plano atualizado com sucesso!', plan: updated });
  } catch (err: any) {
    console.error('Error updating plan:', err);
    return res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
});

// =========================================================================
// 4. SUPORTE, ATENDIMENTO & MODERAÇÃO (Nível 2 & Nível 1)
// =========================================================================
router.get('/support', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const inquiries = db.getSupportInquiries();
  return res.json({ inquiries });
});

router.post('/support/:id/reply', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const { reply, status } = req.body;

  const inquiry = db.getSupportInquiries().find(s => s.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Ticket de suporte não encontrado.' });
  }

  const updated = db.updateSupportInquiry(id, {
    adminReply: reply ? reply.trim() : inquiry.adminReply,
    status: status || 'resolved',
    repliedAt: new Date().toISOString()
  });

  db.addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'SUPPORT_REPLIED',
    entityType: 'support',
    entityId: id,
    ipAddress: req.ip || req.socket.remoteAddress,
    details: `Resposta enviada ao ticket de suporte de ${inquiry.name} (${inquiry.email}) pelo administrador ${admin.name}.`
  });

  return res.json({ message: 'Resposta registada com sucesso!', inquiry: updated });
});

// =========================================================================
// 5. GESTÃO DE UTILIZADORES E ADMINISTRADORES (Nível 1 - Super Admin)
// =========================================================================
router.get('/users', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const users = db.getUsers().map(u => {
    const { passwordHash: _, ...safe } = u;
    return safe;
  });
  return res.json({ users });
});

router.post('/users', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { name, email, password, phone, company, role, queriesRemaining, isImportUnlocked, isBatchUnlocked } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e palavra-passe são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (db.findUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Já existe um utilizador com este endereço de e-mail.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      company: company ? company.trim() : undefined,
      country: 'AO',
      passwordHash,
      role: (role as UserRole) || 'user',
      isActive: true,
      queriesRemaining: Number(queriesRemaining) || 10,
      totalQueriesUsed: 0,
      activePlanId: null,
      activePlanName: 'Criado pela Administração',
      planExpiresAt: null,
      isImportUnlocked: Boolean(isImportUnlocked),
      isBatchUnlocked: Boolean(isBatchUnlocked),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null
    };

    db.addUser(newUser);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'ADMIN_CREATED_USER',
      entityType: 'user',
      entityId: newUser.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Novo utilizador/administrador criado manualmente (${newUser.email}, função: ${newUser.role}) por ${admin.name}.`
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ message: 'Utilizador criado com sucesso!', user: safeUser });
  } catch (err: any) {
    console.error('Error creating user by admin:', err);
    return res.status(500).json({ error: 'Erro ao criar utilizador.' });
  }
});

router.put('/users/:id', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { name, phone, company, role, isActive, queriesRemaining, isImportUnlocked, isBatchUnlocked, password } = req.body;

    const user = db.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const updates: Partial<User> = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (company !== undefined) updates.company = company.trim();
    if (role && ['user', 'admin_level2', 'admin_level1'].includes(role)) updates.role = role as UserRole;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (queriesRemaining !== undefined) updates.queriesRemaining = Number(queriesRemaining);
    if (isImportUnlocked !== undefined) updates.isImportUnlocked = Boolean(isImportUnlocked);
    if (isBatchUnlocked !== undefined) updates.isBatchUnlocked = Boolean(isBatchUnlocked);

    if (password && password.length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(password, salt);
    }

    const updated = db.updateUser(id, updates);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'ADMIN_UPDATED_USER',
      entityType: 'user',
      entityId: id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Utilizador ${user.email} atualizado por ${admin.name} (Ativo: ${updates.isActive ?? user.isActive}, Função: ${updates.role ?? user.role}, Consultas: ${updates.queriesRemaining ?? user.queriesRemaining}).`
    });

    const { passwordHash: _, ...safeUser } = updated!;
    return res.json({ message: 'Utilizador atualizado com sucesso!', user: safeUser });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Erro ao atualizar dados do utilizador.' });
  }
});

// =========================================================================
// 6. AUDITORIA & LOGS DO SISTEMA (Nível 1 - Super Admin)
// =========================================================================
router.get('/logs', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({ logs });
});

// =========================================================================
// 7. PARÂMETROS GLOBAIS, TAXAS E CONFIGURAÇÕES (Nível 1 - Super Admin)
// =========================================================================
router.get('/settings', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const settings = db.getSettings();
  return res.json({ settings });
});

router.put('/settings', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const updates = req.body;

    const updated = db.updateSettings(updates);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'SETTINGS_UPDATED',
      entityType: 'system',
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Configurações globais e taxas do sistema atualizadas pelo Super Administrador ${admin.name}. Preço base da pesquisa: ${updated.unitQueryPriceKz} Kz.`
    });

    return res.json({ message: 'Configurações atualizadas com sucesso!', settings: updated });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

// =========================================================================
// 8. GESTÃO DE CONTAS BANCÁRIAS E IBANS (Nível 1 & Nível 2)
// =========================================================================
router.get('/bank-accounts', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const accounts = db.getBankAccounts();
  return res.json({ accounts });
});

router.post('/bank-accounts', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { bankName, iban, swift, holder, currency } = req.body;

    if (!bankName || !iban || !holder) {
      return res.status(400).json({ error: 'Nome do banco, IBAN e titular são obrigatórios.' });
    }

    const current = db.getBankAccounts();
    const newAcc = {
      id: `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bankName: bankName.trim(),
      iban: iban.trim(),
      swift: swift ? swift.trim() : undefined,
      holder: holder.trim(),
      currency: currency || 'AOA (Kz)',
      isActive: true
    };

    const updated = [...current, newAcc];
    db.setBankAccounts(updated);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'BANK_ACCOUNT_CREATED',
      entityType: 'system',
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Nova conta bancária/IBAN adicionada (${newAcc.bankName} - ${newAcc.iban}) por ${admin.name}.`
    });

    return res.status(201).json({ message: 'Conta bancária adicionada com sucesso!', accounts: updated });
  } catch (err: any) {
    console.error('Error adding bank account:', err);
    return res.status(500).json({ error: 'Erro ao adicionar conta bancária.' });
  }
});

router.put('/bank-accounts/:id', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const updates = req.body;

    const current = db.getBankAccounts();
    const idx = current.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    current[idx] = { ...current[idx], ...updates };
    db.setBankAccounts(current);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'BANK_ACCOUNT_UPDATED',
      entityType: 'system',
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Conta bancária/IBAN ${current[idx].bankName} atualizada por ${admin.name}.`
    });

    return res.json({ message: 'Conta bancária atualizada com sucesso!', accounts: current });
  } catch (err: any) {
    console.error('Error updating bank account:', err);
    return res.status(500).json({ error: 'Erro ao atualizar conta bancária.' });
  }
});

router.delete('/bank-accounts/:id', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;

    const current = db.getBankAccounts();
    const filtered = current.filter(b => b.id !== id);
    db.setBankAccounts(filtered);

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: 'BANK_ACCOUNT_DELETED',
      entityType: 'system',
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Conta bancária/IBAN (${id}) removida por ${admin.name}.`
    });

    return res.json({ message: 'Conta bancária removida com sucesso!', accounts: filtered });
  } catch (err: any) {
    console.error('Error deleting bank account:', err);
    return res.status(500).json({ error: 'Erro ao remover conta bancária.' });
  }
});

// =========================================================================
// 9. BANCO DE DADOS & EXPORTAÇÃO MYSQL & BACKUP COMPLETO (Nível 1 - Super Admin)
// =========================================================================
router.get('/database/export-sql', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const sqlDump = db.generateMySQLDump();

  db.addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'MYSQL_DUMP_EXPORTED',
    entityType: 'system',
    ipAddress: req.ip || req.socket.remoteAddress,
    details: `Script DDL/DML MySQL exportado pelo Super Administrador ${admin.name}.`
  });

  res.setHeader('Content-Disposition', 'attachment; filename=nanucloud_database_mysql_schema.sql');
  res.setHeader('Content-Type', 'application/sql; charset=utf-8');
  return res.send(sqlDump);
});

router.get('/backup/full', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const backup = db.generateFullBackup();

  db.addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'FULL_SYSTEM_BACKUP_DOWNLOADED',
    entityType: 'system',
    ipAddress: req.ip || req.socket.remoteAddress,
    details: `Backup completo do sistema (MySQL + JSON + Instruções de Restauro) gerado por ${admin.name}.`
  });

  return res.json(backup);
});

// =========================================================================
// 10. EXTRATO DE UTILIZADOR, BÓNUS E EXTENSÃO DE PRAZO (Nível 1 & Nível 2)
// =========================================================================
router.get('/users/:id/statement', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const statement = db.getUserStatement(id);
  if (!statement) {
    return res.status(404).json({ error: 'Utilizador não encontrado.' });
  }
  return res.json(statement);
});

router.post('/users/:id/bonus', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { bonusCount, reason } = req.body;

    if (!bonusCount || Number(bonusCount) <= 0) {
      return res.status(400).json({ error: 'Informe uma quantidade de bónus válida.' });
    }

    const user = db.grantBonusQueries(id, Number(bonusCount), reason || 'Autorizado pelo Super Administrador', admin);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const { passwordHash: _, ...safe } = user;
    return res.json({ message: `Bónus de ${bonusCount} consultas atribuído com sucesso!`, user: safe });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atribuir bónus.' });
  }
});

router.post('/users/:id/extend-validity', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!;
    const { id } = req.params;
    const { additionalDays } = req.body;

    if (!additionalDays || Number(additionalDays) <= 0) {
      return res.status(400).json({ error: 'Informe um número de dias válido.' });
    }

    const user = db.extendPlanValidity(id, Number(additionalDays), admin);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const { passwordHash: _, ...safe } = user;
    return res.json({ message: `Validade estendida por ${additionalDays} dias com sucesso!`, user: safe });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao estender prazo.' });
  }
});

// =========================================================================
// 11. IA FISCAL & PROPOSTAS DE ATUALIZAÇÃO TRIBUTÁRIA (Nível 1 & Nível 2)
// =========================================================================
router.get('/fiscal-proposals', requireAdminLevel2, (req: AuthRequest, res: Response) => {
  const proposals = db.getFiscalProposals();
  return res.json({ proposals });
});

router.post('/fiscal-proposals/:id/approve', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const prop = db.approveFiscalProposal(id, admin.name);
  if (!prop) {
    return res.status(404).json({ error: 'Proposta não encontrada.' });
  }
  return res.json({ message: 'Proposta fiscal aprovada e incorporada nas regras ativas!', proposal: prop });
});

router.post('/fiscal-proposals/:id/reject', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const prop = db.rejectFiscalProposal(id, admin.name);
  if (!prop) {
    return res.status(404).json({ error: 'Proposta não encontrada.' });
  }
  return res.json({ message: 'Proposta fiscal rejeitada.', proposal: prop });
});

// =========================================================================
// 12. GESTÃO DE CHAVES API (XD, WinRest, Primavera, SAP) (Nível 1)
// =========================================================================
router.get('/api-keys', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const apiKeys = db.getApiKeys();
  return res.json({ apiKeys });
});

router.post('/api-keys', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { name, system, permissions } = req.body;
  if (!name || !system) {
    return res.status(400).json({ error: 'Nome e sistema são obrigatórios.' });
  }
  const key = db.createApiKey(name, system, permissions || ['simulate:local', 'tax:read']);
  db.addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'API_KEY_GENERATED',
    entityType: 'system',
    details: `Chave de API gerada para integração com software ${system} (${name}) por ${admin.name}.`
  });
  return res.status(201).json({ message: 'Chave de API criada com sucesso!', apiKey: key });
});

router.delete('/api-keys/:id', requireAdminLevel1, (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { id } = req.params;
  const revoked = db.revokeApiKey(id);
  if (!revoked) {
    return res.status(404).json({ error: 'Chave API não encontrada.' });
  }
  db.addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'API_KEY_REVOKED',
    entityType: 'system',
    details: `Chave de API ${id} revogada pelo Super Admin ${admin.name}.`
  });
  return res.json({ message: 'Chave de API revogada com sucesso.' });
});

export default router;
