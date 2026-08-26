import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth } from '../auth.js';
import { Transaction } from '../types.js';

const router = Router();

// 1. LISTAR TODOS OS PLANOS
router.get('/', (req: AuthRequest, res: Response) => {
  const plans = db.getPlans().sort((a, b) => a.sortOrder - b.sortOrder);
  const settings = db.getSettings();
  const bankAccounts = db.getBankAccounts().filter(b => b.isActive);

  return res.json({
    plans,
    unitQueryPriceKz: settings.unitQueryPriceKz,
    minCustomPlanPriceKz: settings.minCustomPlanPriceKz,
    bankAccounts,
    bankInfo: {
      bankName: settings.bankName,
      iban: settings.bankIban,
      holder: settings.bankHolder,
      expressPhone: settings.expressPhone
    }
  });
});

// 2. CALCULAR PLANO PERSONALIZADO
router.post('/calculate-custom', (req: AuthRequest, res: Response) => {
  const { amountKz } = req.body;
  const settings = db.getSettings();

  const amount = Number(amountKz) || 0;
  if (amount < settings.minCustomPlanPriceKz) {
    return res.status(400).json({
      error: `O valor mínimo para o plano personalizado é de ${settings.minCustomPlanPriceKz.toLocaleString('pt-PT')} Kz.`
    });
  }

  const unitPrice = settings.unitQueryPriceKz || 50;
  const calculatedQueries = Math.floor(amount / unitPrice);
  const validityDays = amount >= 10000 ? 365 : (amount >= 5000 ? 180 : 90);

  return res.json({
    amountKz: amount,
    unitQueryPriceKz: unitPrice,
    queriesCount: calculatedQueries,
    validityDays,
    unlocksImport: true,
    unlocksBatch: true
  });
});

// 3. INICIAR PEDIDO DE COMPRA / RECARGA DE PLANO
router.post('/purchase', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { planId, customAmountKz, paymentMethod, paymentReference, notes } = req.body;

    const settings = db.getSettings();
    let selectedPlan = db.getPlans().find(p => p.id === planId);
    let amountKz = 0;
    let queriesCount = 0;
    let validityDays = 30;
    let planName = '';

    if (planId === 'plan_custom' || !selectedPlan) {
      const customAmount = Number(customAmountKz) || 0;
      if (customAmount < settings.minCustomPlanPriceKz) {
        return res.status(400).json({
          error: `O valor mínimo para o plano personalizado é de ${settings.minCustomPlanPriceKz.toLocaleString('pt-PT')} Kz.`
        });
      }
      amountKz = customAmount;
      queriesCount = Math.floor(customAmount / (settings.unitQueryPriceKz || 50));
      validityDays = customAmount >= 10000 ? 365 : (customAmount >= 5000 ? 180 : 90);
      planName = `Plano Personalizado (${customAmount.toLocaleString('pt-PT')} Kz)`;
    } else {
      amountKz = selectedPlan.priceKz;
      queriesCount = selectedPlan.queriesCount;
      validityDays = selectedPlan.validityDays;
      planName = selectedPlan.name;
    }

    const isDirectInstantPayment = paymentMethod === 'paypal_visa' || paymentMethod === 'stripe_card';
    const txStatus = isDirectInstantPayment ? 'approved' : 'pending';

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTransaction: Transaction = {
      id: txId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      planId: planId || 'plan_custom',
      planName,
      amountKz,
      queriesGranted: queriesCount,
      validityDays,
      paymentMethod: paymentMethod || 'multicaixa_express',
      paymentReference: paymentReference ? paymentReference.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      status: txStatus,
      reviewedByAdminName: isDirectInstantPayment ? 'GATEWAY_AUTOMATED_VALIDATION' : undefined,
      reviewedAt: isDirectInstantPayment ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    db.addTransaction(newTransaction);

    // If direct automated payment, automatically credit queries & unlock modules for the user immediately!
    if (isDirectInstantPayment) {
      const targetUser = db.findUserById(user.id);
      if (targetUser) {
        const currentQueries = targetUser.queriesRemaining || 0;
        const newQueries = currentQueries + queriesCount;
        
        // Calculate new expiration date
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + validityDays);

        db.updateUser(user.id, {
          queriesRemaining: newQueries,
          planExpiresAt: expDate.toISOString(),
          isActive: true
        });
      }
    }

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: isDirectInstantPayment ? 'PLAN_PURCHASE_AUTO_ACTIVATED' : 'PLAN_PURCHASE_REQUEST',
      entityType: 'payment',
      entityId: txId,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: isDirectInstantPayment
        ? `Pagamento direto aprovado via ${paymentMethod} para ${planName} (${amountKz.toLocaleString('pt-PT')} Kz). ${queriesCount} consultas creditadas automaticamente a ${user.name}.`
        : `Pedido de adesão ao ${planName} no valor de ${amountKz.toLocaleString('pt-PT')} Kz criado por ${user.name}. Aguarda validação administrativa.`
    });

    return res.status(201).json({
      message: isDirectInstantPayment
        ? 'Pagamento validado com sucesso! O plano e as suas consultas foram ativados imediatamente.'
        : 'Pedido de adesão registado com sucesso! Efetue o pagamento e submeta o comprovativo para ativação imediata.',
      transaction: newTransaction,
      queriesCount,
      bankDetails: {
        bankName: settings.bankName,
        iban: settings.bankIban,
        holder: settings.bankHolder,
        expressPhone: settings.expressPhone
      }
    });
  } catch (err: any) {
    console.error('Error on purchase:', err);
    return res.status(500).json({ error: 'Erro ao registar pedido de adesão ao plano.' });
  }
});

// 4. SUBMETER COMPROVATIVO / REFERÊNCIA DE PAGAMENTO
router.post('/upload-proof', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { transactionId, paymentProofUrl, paymentReference, notes } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'ID de transação obrigatório.' });
    }

    const tx = db.findTransactionById(transactionId);
    if (!tx || tx.userId !== user.id) {
      return res.status(404).json({ error: 'Transação não encontrada ou sem permissão.' });
    }

    const updated = db.updateTransaction(transactionId, {
      paymentProofUrl: paymentProofUrl || tx.paymentProofUrl,
      paymentReference: paymentReference ? paymentReference.trim() : tx.paymentReference,
      notes: notes ? notes.trim() : tx.notes
    });

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PAYMENT_PROOF_SUBMITTED',
      entityType: 'payment',
      entityId: transactionId,
      ipAddress: req.ip || req.socket.remoteAddress,
      details: `Comprovativo/referência submetido para a transação ${transactionId} por ${user.name}.`
    });

    return res.json({
      message: 'Comprovativo enviado com sucesso! A equipa de administração irá validar o seu pagamento.',
      transaction: updated
    });
  } catch (err: any) {
    console.error('Error on upload-proof:', err);
    return res.status(500).json({ error: 'Erro ao enviar comprovativo de pagamento.' });
  }
});

// 5. HISTÓRICO DE TRANSAÇÕES DO UTILIZADOR
router.get('/my-transactions', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const transactions = db.getTransactions().filter(t => t.userId === user.id);
  return res.json({ transactions });
});

export default router;
