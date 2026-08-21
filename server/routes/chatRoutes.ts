import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../auth.js';
import { ChatMessage } from '../types.js';

const router = Router();

// 1. OBTER ESTADO DO SUPORTE (ADMINS ONLINE VS ROBÔ)
router.get('/status', (req: AuthRequest, res: Response) => {
  const isOnline = db.isAnyAdminOnline();
  return res.json({
    adminOnline: isOnline,
    mode: isOnline ? 'live_human_support' : 'ai_virtual_robot',
    message: isOnline 
      ? 'Operador NANUCLOUD Online. Um administrador responderá em direto.'
      : 'Robô de Atendimento NANUCLOUD Ativo 24/7. Suporte automático imediato.'
  });
});

// 2. OBTER HISTÓRICO DE MENSAGENS DE UMA SESSÃO
router.get('/messages', (req: AuthRequest, res: Response) => {
  const sessionId = (req.query.sessionId as string) || (req.user ? `usr_${req.user.id}` : 'anonymous');
  const messages = db.getChatMessages(sessionId);
  return res.json({ messages });
});

// 3. ENVIAR MENSAGEM DO UTILIZADOR (COM RESPOSTA AUTOMÁTICA SE ADMIN OFFLINE)
router.post('/send', (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, senderName, senderEmail, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'A mensagem não pode estar vazia.' });
    }

    const cleanSessionId = sessionId || (req.user ? `usr_${req.user.id}` : `sess_${Date.now()}`);
    const name = senderName || (req.user ? req.user.name : 'Visitante');

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: cleanSessionId,
      senderType: 'user',
      senderName: name,
      userEmail: senderEmail || (req.user ? req.user.email : undefined),
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    db.addChatMessage(userMessage);

    const isAdminOnline = db.isAnyAdminOnline();
    let botMessage: ChatMessage | null = null;

    if (!isAdminOnline) {
      const botReplyText = db.generateBotResponse(
        text, 
        name, 
        cleanSessionId, 
        senderEmail || (req.user ? req.user.email : undefined),
        req.body.language
      );
      botMessage = {
        id: `msg_bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId: cleanSessionId,
        senderType: 'bot',
        senderName: 'Robô Assistente NANUCLOUD (24/7)',
        text: botReplyText,
        timestamp: new Date(Date.now() + 500).toISOString()
      };
      db.addChatMessage(botMessage);
    }

    return res.status(201).json({
      userMessage,
      botMessage,
      adminOnline: isAdminOnline
    });
  } catch (err: any) {
    console.error('Error on chat send:', err);
    return res.status(500).json({ error: 'Erro ao enviar mensagem no chat.' });
  }
});

// 4. ADMIN RESPONDE AO CHAT (DIRETO)
router.post('/admin-reply', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
      return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
    }

    const { sessionId, text } = req.body;
    if (!sessionId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Sessão e mensagem são obrigatórias.' });
    }

    const adminMsg: ChatMessage = {
      id: `msg_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      senderType: 'admin',
      senderName: `${req.user.name} (Administrador NANUCLOUD)`,
      userEmail: req.user.email,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    db.addChatMessage(adminMsg);

    return res.status(201).json({ message: adminMsg });
  } catch (err: any) {
    console.error('Error on admin reply:', err);
    return res.status(500).json({ error: 'Erro ao enviar resposta de suporte.' });
  }
});

// 5. LISTAR TODAS AS SESSÕES DE CHAT (PARA PAINEL ADMINISTRATIVO)
router.get('/admin/sessions', (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
    return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
  }

  const allMsgs = db.getChatMessages();
  const sessionMap: { [key: string]: { sessionId: string; userName: string; lastMessage: string; lastTime: string; count: number } } = {};

  for (const m of allMsgs) {
    if (!sessionMap[m.sessionId]) {
      sessionMap[m.sessionId] = {
        sessionId: m.sessionId,
        userName: m.senderType === 'user' ? m.senderName : 'Utilizador',
        lastMessage: m.text,
        lastTime: m.timestamp,
        count: 1
      };
    } else {
      sessionMap[m.sessionId].lastMessage = m.text;
      sessionMap[m.sessionId].lastTime = m.timestamp;
      sessionMap[m.sessionId].count += 1;
      if (m.senderType === 'user') {
        sessionMap[m.sessionId].userName = m.senderName;
      }
    }
  }

  const sessions = Object.values(sessionMap).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
  return res.json({ sessions });
});

// 6. PERGUNTAS NÃO RESPONDIDAS & NOTIFICAÇÕES PARA ADMINS
router.get('/admin/unresolved', (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
    return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
  }

  const list = db.getUnresolvedBotQuestions();
  const pendingCount = list.filter(q => q.status === 'pending').length;
  return res.json({ unresolved: list, pendingCount });
});

// 7. ADMIN RESPONDE E ENSINA AO ROBÔ (APRENDIZAGEM AUTOMÁTICA)
router.post('/admin/answer-learn', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
      return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
    }

    const { id, answer } = req.body;
    if (!id || !answer || !answer.trim()) {
      return res.status(400).json({ error: 'ID da pergunta e resposta são obrigatórios.' });
    }

    const updated = db.answerBotQuestion(id, answer.trim(), req.user);
    if (!updated) {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }

    // Also send an admin message into user's chat if session exists
    if (updated.sessionId && updated.sessionId !== 'guest_session') {
      const learningReply: ChatMessage = {
        id: `msg_bot_learned_${Date.now()}`,
        sessionId: updated.sessionId,
        senderType: 'bot',
        senderName: 'Robô NANUCLOUD (Resposta Aprendida da Administração)',
        text: `💡 Resposta oficial da Administração NANUCLOUD (${req.user.name}):\n\n${answer.trim()}`,
        timestamp: new Date().toISOString()
      };
      db.addChatMessage(learningReply);
    }

    return res.json({ success: true, question: updated });
  } catch (err: any) {
    console.error('Error on answer-learn:', err);
    return res.status(500).json({ error: 'Erro ao ensinar resposta ao robô.' });
  }
});

// 8. ADMIN IGNORA DÚVIDA NÃO RELEVANTE
router.post('/admin/ignore-question', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
      return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da pergunta é obrigatório.' });
    }

    const updated = db.ignoreBotQuestion(id, req.user);
    if (!updated) {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }

    return res.json({ success: true, question: updated });
  } catch (err: any) {
    console.error('Error on ignore-question:', err);
    return res.status(500).json({ error: 'Erro ao ignorar dúvida.' });
  }
});

// 9. BASE DE CONHECIMENTO DO ROBÔ (LISTAR, ADICIONAR, REMOVER)
router.get('/admin/knowledge', (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
    return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
  }

  const knowledge = db.getBotKnowledgeBase();
  return res.json({ knowledge });
});

router.post('/admin/knowledge', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
      return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
    }

    const { question, answer, keywords, language, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Pergunta e resposta são obrigatórias.' });
    }

    const kwArray = Array.isArray(keywords) 
      ? keywords 
      : (typeof keywords === 'string' ? keywords.split(',').map((s: string) => s.trim().toLowerCase()) : []);

    const newItem = db.addBotKnowledge({
      question: question.trim(),
      answer: answer.trim(),
      keywords: kwArray.length > 0 ? kwArray : question.toLowerCase().split(' ').filter((w: string) => w.length > 2),
      language: language || 'pt',
      category: category || 'general',
      isApproved: true,
      learnedFromAdminId: req.user.id,
      learnedFromAdminName: req.user.name
    });

    return res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    console.error('Error on add knowledge:', err);
    return res.status(500).json({ error: 'Erro ao adicionar item de conhecimento.' });
  }
});

router.delete('/admin/knowledge/:id', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin_level1' && req.user.role !== 'admin_level2')) {
      return res.status(403).json({ error: 'Acesso restrito aos administradores.' });
    }

    const deleted = db.deleteBotKnowledge(req.params.id);
    return res.json({ success: deleted });
  } catch (err: any) {
    console.error('Error on delete knowledge:', err);
    return res.status(500).json({ error: 'Erro ao eliminar conhecimento.' });
  }
});

export default router;
