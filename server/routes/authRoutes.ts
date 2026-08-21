import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, AuthRequest, requireAuth } from '../auth.js';
import { User } from '../types.js';

const router = Router();

// 1. REGISTO DE UTILIZADOR
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, company, address, nif, country, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e palavra-passe são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'Já existe uma conta associada a este endereço de e-mail.' });
    }

    const settings = db.getSettings();
    if (!settings.allowRegistration) {
      return res.status(403).json({ error: 'Novos registos encontram-se temporariamente suspensos pela administração.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const freeQueries = settings.freeQueriesOnRegister || 3;

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      company: company ? company.trim() : undefined,
      address: address ? address.trim() : undefined,
      nif: nif ? nif.trim() : undefined,
      country: country || 'AO',
      passwordHash,
      role: 'user',
      isActive: true,
      queriesRemaining: freeQueries,
      totalQueriesUsed: 0,
      activePlanId: null,
      activePlanName: `Plano Gratuito Inicial (${freeQueries} Consultas)`,
      planExpiresAt: null,
      isImportUnlocked: false, // Bloqueado por defeito até validação
      isBatchUnlocked: false,  // Bloqueado por defeito até validação
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = generateToken(newUser);
    res.cookie('nanucloud_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    db.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'auth',
      entityId: newUser.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Novo utilizador registado com sucesso (${newUser.email}). Bónus de ${freeQueries} consultas grátis atribuído.`
    });

    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({
      message: 'Registo efetuado com sucesso!',
      user: userSafe,
      token
    });
  } catch (err: any) {
    console.error('Error on register:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

// 2. INÍCIO DE SESSÃO (LOGIN)
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e palavra-passe são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o seu e-mail e palavra-passe.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'A sua conta está desativada. Contacte o suporte para mais informações.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      db.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'FAILED_LOGIN_ATTEMPT',
        entityType: 'auth',
        entityId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        details: `Tentativa de acesso falhada com palavra-passe incorreta para ${cleanEmail}.`
      });
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o seu e-mail e palavra-passe.' });
    }

    // Update last login
    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const token = generateToken(user);
    res.cookie('nanucloud_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'auth',
      entityId: user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Sessão iniciada com sucesso por ${user.name} (${user.role}).`
    });

    const { passwordHash: _, ...userSafe } = user;
    return res.json({
      message: 'Sessão iniciada com sucesso.',
      user: userSafe,
      token
    });
  } catch (err: any) {
    console.error('Error on login:', err);
    return res.status(500).json({ error: 'Erro interno durante a autenticação.' });
  }
});

// 3. TÉRMINO DE SESSÃO (LOGOUT)
router.post('/logout', (req: AuthRequest, res: Response) => {
  if (req.user) {
    db.addAuditLog({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_LOGOUT',
      entityType: 'auth',
      entityId: req.user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Sessão terminada pelo utilizador ${req.user.name}.`
    });
  }
  res.clearCookie('nanucloud_token');
  return res.json({ message: 'Sessão terminada com sucesso.' });
});

// 4. PERFIL DO UTILIZADOR ATUAL
router.get('/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  const { passwordHash: _, ...userSafe } = req.user;
  return res.json({ user: userSafe });
});

// 5. ATUALIZAR PERFIL
router.put('/update-profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, phone, company, address, nif, country, currentPassword, newPassword } = req.body;

    const updates: Partial<User> = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (company !== undefined) updates.company = company.trim();
    if (address !== undefined) updates.address = address.trim();
    if (nif !== undefined) updates.nif = nif.trim();
    if (country) updates.country = country.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Para alterar a palavra-passe, deve introduzir a palavra-passe atual.' });
      }
      const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'A palavra-passe atual está incorreta.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova palavra-passe deve ter no mínimo 6 caracteres.' });
      }
      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(newPassword, salt);
    }

    const updated = db.updateUser(user.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PROFILE_UPDATED',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Perfil atualizado por ${user.name}.${newPassword ? ' Palavra-passe alterada.' : ''}`
    });

    const { passwordHash: _, ...userSafe } = updated;
    return res.json({ message: 'Perfil atualizado com sucesso.', user: userSafe });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Erro ao atualizar dados do perfil.' });
  }
});

// 6. RECUPERAÇÃO DE PALAVRA-PASSE POR E-MAIL
router.post('/forgot-password', (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Por favor, indique o endereço de e-mail.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.findUserByEmail(cleanEmail);

  if (!user) {
    // Return friendly message without leaking user existence
    return res.json({
      message: 'Se o e-mail estiver registado no sistema, receberá as instruções de redefinição de palavra-passe.',
      simulatedToken: 'TOKEN_DEMO_' + Date.now().toString(36).toUpperCase()
    });
  }

  const resetToken = 'RESET_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_RESET_REQUESTED',
    entityType: 'auth',
    entityId: user.id,
    ipAddress: req.ip || req.socket.remoteAddress,
    details: `Pedido de recuperação de palavra-passe gerado para o e-mail ${cleanEmail}. Código de segurança emitido.`
  });

  return res.json({
    message: `Instruções de recuperação enviadas para o e-mail ${cleanEmail}.`,
    simulatedToken: resetToken,
    userEmail: cleanEmail
  });
});

// 7. REDEFINIR PALAVRA-PASSE COM TOKEN
router.post('/reset-password', (req: AuthRequest, res: Response) => {
  const { email, newPassword, token } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'E-mail e nova palavra-passe são obrigatórios.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.findUserByEmail(cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(user.id, { passwordHash });

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_RESET_COMPLETED',
    entityType: 'auth',
    entityId: user.id,
    ipAddress: req.ip || req.socket.remoteAddress,
    details: `Palavra-passe redefinida com sucesso para o utilizador ${cleanEmail}.`
  });

  return res.json({ message: 'Palavra-passe alterada com sucesso! Já pode iniciar sessão com a nova credencial.' });
});

// 8. EXTRATO E SALDO DO UTILIZADOR AUTENTICADO
router.get('/my-statement', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const statement = db.getUserStatement(user.id);
  if (!statement) {
    return res.status(404).json({ error: 'Extrato não disponível.' });
  }
  return res.json(statement);
});

export default router;
