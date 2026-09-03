import { Router, Response } from 'express';
import * as XLSX from 'xlsx';
import { db } from '../db.js';
import { AuthRequest, requireAuth, isStaffOrAdminRole } from '../auth.js';
import { QueryHistoryItem } from '../types.js';

const router = Router();

// 1. SIMULAÇÃO COMÉRCIO LOCAL & SERVIÇOS COM RETENÇÃO NA FONTE
router.post('/calculate-local', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const isStaff = isStaffOrAdminRole(user.role);
    const {
      countryCode,
      costNet,
      vatRate,
      tpaRate,
      marginPct,
      fixedFinalPrice,
      productName,
      itemType, // 'product' | 'service'
      retentionRate, // % retenção na fonte
      notes,
      // Optional extra logistics & acquisition expenses
      transportCost,
      transportRoundTrip,
      transportTaxMode,
      transportVatRate,
      mealsCost,
      mealsTaxMode,
      mealsVatRate,
      lodgingCost,
      lodgingTaxMode,
      lodgingVatRate,
      otherExtrasCost,
      otherExtrasLabel,
      otherExtrasTaxMode,
      otherExtrasVatRate
    } = req.body;

    const cCostNet = Number(costNet) || 0;
    const cVatRate = Number(vatRate) || 0;
    const cTpaRate = Number(tpaRate) || 0;
    const cMargin = Number(marginPct) || 0;
    const cFixedPrice = Number(fixedFinalPrice) || 0;
    const cRetentionRate = Number(retentionRate) || 0;
    const isService = itemType === 'service' || cRetentionRate > 0;

    // Helper for computing item net and input VAT
    const computeExtraCostTax = (amount: number, mode: string = 'without_vat', rate: number = cVatRate) => {
      if (amount <= 0) return { net: 0, vat: 0, total: 0 };
      if (mode === 'exempt' || rate === 0) {
        return { net: amount, vat: 0, total: amount };
      }
      if (mode === 'with_vat') {
        const net = amount / (1 + rate / 100);
        const vat = amount - net;
        return { net, vat, total: amount };
      }
      // without_vat
      const net = amount;
      const vat = net * (rate / 100);
      return { net, vat, total: net + vat };
    };

    // Calculate individual extra acquisition costs
    const cTransportCost = Number(transportCost) || 0;
    const cTransportRoundTrip = Boolean(transportRoundTrip);
    const transportVal = cTransportCost * (cTransportRoundTrip ? 2 : 1);
    const transportCalc = computeExtraCostTax(transportVal, transportTaxMode, Number(transportVatRate) || cVatRate);

    const cMealsCost = Number(mealsCost) || 0;
    const mealsCalc = computeExtraCostTax(cMealsCost, mealsTaxMode, Number(mealsVatRate) || cVatRate);

    const cLodgingCost = Number(lodgingCost) || 0;
    const lodgingCalc = computeExtraCostTax(cLodgingCost, lodgingTaxMode, Number(lodgingVatRate) || cVatRate);

    const cOtherExtrasCost = Number(otherExtrasCost) || 0;
    const otherExtrasCalc = computeExtraCostTax(cOtherExtrasCost, otherExtrasTaxMode, Number(otherExtrasVatRate) || cVatRate);

    const totalExtraCostsNet = transportCalc.net + mealsCalc.net + lodgingCalc.net + otherExtrasCalc.net;
    const totalExtraCostsVat = transportCalc.vat + mealsCalc.vat + lodgingCalc.vat + otherExtrasCalc.vat;
    const totalExtraCostsPaid = transportCalc.total + mealsCalc.total + lodgingCalc.total + otherExtrasCalc.total;

    // Total Effective Cost of Acquisition
    const effectiveCostNet = cCostNet + totalExtraCostsNet;

    // Field Validation Alerts
    if (isService) {
      if (cFixedPrice <= 0 && cCostNet <= 0) {
        return res.status(400).json({
          error: 'Na prestação de serviços não é obrigatório preço de custo, mas deve indicar o Valor do Serviço / PVP Pretendido (ou Custo Operacional).'
        });
      }
    } else {
      if (cCostNet <= 0 && effectiveCostNet <= 0) {
        return res.status(400).json({
          error: 'Para comércio de produtos, o Preço de Custo Base (SEM IVA) é obrigatório e deve ser superior a zero.'
        });
      }
    }

    // Check query credits (Clients must have remaining credits, staff/admin can simulate freely)
    if (!isStaff && user.queriesRemaining <= 0) {
      return res.status(402).json({
        error: 'A sua conta de cliente não possui créditos disponíveis. É obrigatório ter crédito na conta para utilizar qualquer módulo de simulação. Por favor, adquira um plano ou recarregue créditos.',
        code: 'CREDITS_EXHAUSTED'
      });
    }

    let pvpBase = 0;
    let pvpFinal = 0;
    let vatSale = 0;
    let profit = 0;
    let actualMarginApplied = 0;

    if (cFixedPrice > 0) {
      pvpFinal = cFixedPrice;
      pvpBase = pvpFinal / (1 + cVatRate / 100);
      vatSale = pvpFinal - pvpBase;
      profit = pvpBase - effectiveCostNet;
      actualMarginApplied = effectiveCostNet > 0 ? (profit / effectiveCostNet) * 100 : 0;
    } else {
      profit = effectiveCostNet * (cMargin / 100);
      pvpBase = effectiveCostNet + profit;
      vatSale = pvpBase * (cVatRate / 100);
      pvpFinal = pvpBase + vatSale;
      actualMarginApplied = cMargin;
    }

    const merchandiseVatCost = cCostNet * (cVatRate / 100);
    const totalInputVatSupported = merchandiseVatCost + totalExtraCostsVat;
    const netVatToPay = Math.max(0, vatSale - totalInputVatSupported);
    const tpaCost = pvpFinal * (cTpaRate / 100);
    
    // Retenção na fonte (deduzida no preço final/base de faturação conforme lei de cada país)
    const retentionAmount = pvpBase * (cRetentionRate / 100);
    
    // Montante Líquido Efetivo a Receber (PVP Final - Retenção na Fonte - Taxa TPA)
    const netReceived = pvpFinal - retentionAmount - tpaCost;

    const operatingProfit = profit - tpaCost;

    // Industrial tax approximation (default 25% for AO, 21% for PT, etc.)
    const industrialTaxRate = countryCode === 'PT' ? 21 : (countryCode === 'AO' ? 25 : 20);
    const estimatedTax = operatingProfit > 0 ? operatingProfit * (industrialTaxRate / 100) : 0;
    // Withholding tax can be offset against corporate income tax
    const incomeTax = Math.max(0, estimatedTax - retentionAmount);
    const netProfit = operatingProfit - incomeTax;

    // Decrement credits for clients (Staff accounts do not consume quota)
    const updatedUser = isStaff
      ? user
      : db.updateUser(user.id, {
          queriesRemaining: Math.max(0, user.queriesRemaining - 1),
          totalQueriesUsed: user.totalQueriesUsed + 1
        });

    const historyItem: QueryHistoryItem = {
      id: `qh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      type: 'local',
      itemType: isService ? 'service' : 'product',
      retentionRate: cRetentionRate,
      retentionAmount: retentionAmount,
      netReceived: netReceived,
      title: productName ? productName.trim() : (isService ? `Prestação de Serviços (${countryCode})` : `Comércio Local (${countryCode})`),
      description: notes ? notes.trim() : `${isService ? 'Serviço' : 'Produto'} | Margem ${actualMarginApplied.toFixed(1)}% | Retenção ${cRetentionRate}% | Custo ${cCostNet.toFixed(2)}`,
      countryCode: countryCode || 'AO',
      costBase: cCostNet,
      vatRate: cVatRate,
      marginApplied: actualMarginApplied,
      finalPrice: pvpFinal,
      netProfit: netProfit,
      currency: countryCode === 'PT' ? 'EUR' : (countryCode === 'AO' ? 'Kz' : 'USD'),
      details: {
        costNet: effectiveCostNet,
        merchandiseCostNet: cCostNet,
        effectiveCostNet,
        totalExtraCostsNet,
        totalExtraCostsPaid,
        totalExtraCostsVat,
        totalInputVatSupported,
        vatCost: totalInputVatSupported,
        extraCosts: {
          transport: transportCalc,
          meals: mealsCalc,
          lodging: lodgingCalc,
          otherExtras: otherExtrasCalc,
          isRoundTrip: cTransportRoundTrip
        },
        grossProfit: profit,
        pvpBase,
        vatSale,
        pvpFinal,
        netVatToPay,
        tpaCost,
        retentionRate: cRetentionRate,
        retentionAmount,
        netReceived,
        industrialTaxRate,
        incomeTax,
        netProfit,
        itemType: isService ? 'service' : 'product',
        fixedPriceUsed: cFixedPrice > 0
      },
      createdAt: new Date().toISOString()
    };

    db.addQueryHistory(historyItem);

    return res.json({
      success: true,
      calculation: historyItem.details,
      historyItem,
      queriesRemaining: updatedUser?.queriesRemaining ?? 0
    });
  } catch (err: any) {
    console.error('Error on calculate-local:', err);
    return res.status(500).json({ error: 'Erro ao calcular simulação local.' });
  }
});

// 2. SIMULAÇÃO IMPORTAÇÃO & DESPACHO ADUANEIRO
router.post('/calculate-import', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const isStaff = isStaffOrAdminRole(user.role);

    // Check if import module is unlocked for clients
    if (!isStaff && !user.isImportUnlocked) {
      return res.status(403).json({
        error: 'O Módulo de Importação Aduaneira encontra-se bloqueado para o seu plano. Adquira o Plano Ouro, Platina, Diamante ou Plano Personalizado para desbloquear.',
        code: 'MODULE_LOCKED'
      });
    }

    // Check query credits (Clients must have credits)
    if (!isStaff && user.queriesRemaining <= 0) {
      return res.status(402).json({
        error: 'A sua conta de cliente não possui créditos disponíveis. É obrigatório ter crédito na conta para utilizar qualquer módulo de simulação. Por favor, adquira um plano ou recarregue créditos.',
        code: 'CREDITS_EXHAUSTED'
      });
    }

    const {
      originCountry,
      destCountry,
      fob,
      freight,
      insurance,
      customsRate,
      iecRate,
      otherFees,
      vatRate,
      marginPct,
      productName,
      notes
    } = req.body;

    const cFob = Number(fob) || 0;
    const cFreight = Number(freight) || 0;
    const cInsurance = Number(insurance) || 0;
    const cCustomsRate = Number(customsRate) || 0;
    const cIecRate = Number(iecRate) || 0;
    const cOtherFees = Number(otherFees) || 0;
    const cVatRate = Number(vatRate) || 0;
    const cMargin = Number(marginPct) || 0;

    if (cFob <= 0) {
      return res.status(400).json({ error: 'O valor FOB (Mercadoria) deve ser superior a zero.' });
    }

    // CIF = FOB + Frete + Seguro
    const cif = cFob + cFreight + cInsurance;
    // Direitos Aduaneiros
    const customsDuty = cif * (cCustomsRate / 100);
    // Imposto Especial de Consumo (IEC)
    const iecTax = cif * (cIecRate / 100);
    // Custo Base Nacionalizado (SEM IVA)
    const nationalizedCostNet = cif + customsDuty + iecTax + cOtherFees;

    // Venda Nacionalizada
    const profit = nationalizedCostNet * (cMargin / 100);
    const pvpBase = nationalizedCostNet + profit;
    const vatSale = pvpBase * (cVatRate / 100);
    const pvpFinal = pvpBase + vatSale;

    const vatCost = nationalizedCostNet * (cVatRate / 100);
    const netVatToPay = Math.max(0, vatSale - vatCost);
    const tpaCost = pvpFinal * 0.01; // 1%
    const industrialTaxRate = 25;
    const operatingProfit = profit - tpaCost;
    const incomeTax = operatingProfit > 0 ? operatingProfit * (industrialTaxRate / 100) : 0;
    const netProfit = operatingProfit - incomeTax;

    // Decrement credits for clients
    const updatedUser = isStaff
      ? user
      : db.updateUser(user.id, {
          queriesRemaining: Math.max(0, user.queriesRemaining - 1),
          totalQueriesUsed: user.totalQueriesUsed + 1
        });

    const historyItem: QueryHistoryItem = {
      id: `qh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      type: 'import',
      title: productName ? productName.trim() : `Importação ${originCountry || 'CN'} -> ${destCountry || 'AO'}`,
      description: notes ? notes.trim() : `FOB: ${cFob.toFixed(2)} | CIF: ${cif.toFixed(2)} | Custo Nacionalizado: ${nationalizedCostNet.toFixed(2)}`,
      countryCode: destCountry || 'AO',
      costBase: nationalizedCostNet,
      vatRate: cVatRate,
      marginApplied: cMargin,
      finalPrice: pvpFinal,
      netProfit: netProfit,
      currency: destCountry === 'PT' ? 'EUR' : (destCountry === 'AO' ? 'Kz' : 'USD'),
      details: {
        originCountry,
        destCountry,
        fob: cFob,
        freight: cFreight,
        insurance: cInsurance,
        cif,
        customsRate: cCustomsRate,
        customsDuty,
        iecRate: cIecRate,
        iecTax,
        otherFees: cOtherFees,
        nationalizedCostNet,
        marginPct: cMargin,
        profit,
        pvpBase,
        vatSale,
        pvpFinal,
        netVatToPay,
        tpaCost,
        incomeTax,
        netProfit
      },
      createdAt: new Date().toISOString()
    };

    db.addQueryHistory(historyItem);

    return res.json({
      success: true,
      calculation: historyItem.details,
      historyItem,
      queriesRemaining: updatedUser?.queriesRemaining ?? 0
    });
  } catch (err: any) {
    console.error('Error on calculate-import:', err);
    return res.status(500).json({ error: 'Erro ao calcular custos de importação aduaneira.' });
  }
});

// 3. SIMULAÇÃO EM LOTE EXCEL
router.post('/calculate-batch', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const isStaff = isStaffOrAdminRole(user.role);

    // Check if batch module is unlocked for clients
    if (!isStaff && !user.isBatchUnlocked) {
      return res.status(403).json({
        error: 'O Módulo de Operações e Cálculos em Lote (Excel) encontra-se bloqueado para o seu plano. Adquira o Plano Platina, Diamante ou Personalizado para desbloquear.',
        code: 'MODULE_LOCKED'
      });
    }

    if (!isStaff && user.queriesRemaining <= 0) {
      return res.status(402).json({
        error: 'A sua conta de cliente não possui créditos disponíveis. É obrigatório ter crédito na conta para utilizar qualquer módulo de simulação. Por favor, adquira um plano ou recarregue créditos.',
        code: 'CREDITS_EXHAUSTED'
      });
    }

    const { items, countryCode, vatRate, marginPct, listName, costColumnKey, nameColumnKey } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Nenhum item fornecido para processamento em lote.' });
    }

    // Safety row limit analysis
    const MAX_BATCH_ROWS = 2000;
    if (items.length > MAX_BATCH_ROWS) {
      return res.status(400).json({
        error: `O ficheiro contém ${items.length} linhas, o que ultrapassa o limite máximo seguro de ${MAX_BATCH_ROWS} linhas por lote. Para garantir a estabilidade do sistema, divida a planilha em lotes de até 1.000 linhas ou utilize o modelo oficial.`,
        code: 'ROW_LIMIT_EXCEEDED',
        totalRows: items.length,
        maxAllowed: MAX_BATCH_ROWS
      });
    }

    const cVatRate = Number(vatRate) || 0;
    const cMargin = Number(marginPct) || 0;
    const industrialTaxRate = countryCode === 'PT' ? 21 : 25;
    const currency = countryCode === 'PT' ? 'EUR' : (countryCode === 'AO' ? 'Kz' : 'USD');

    const cleanCostValue = (rawVal: any): number => {
      if (typeof rawVal === 'number') return isNaN(rawVal) ? 0 : rawVal;
      if (!rawVal) return 0;
      let str = String(rawVal).trim();
      // Remove currency symbols and non-numeric chars except dot/comma/minus
      str = str.replace(/[^\d.,-]/g, '');
      // Handle PT/AO comma notation (e.g. "1.500,50" or "1500,50")
      if (str.includes(',') && str.includes('.')) {
        if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
          str = str.replace(/\./g, '').replace(',', '.');
        } else {
          str = str.replace(/,/g, '');
        }
      } else if (str.includes(',')) {
        str = str.replace(',', '.');
      }
      const num = parseFloat(str);
      return isNaN(num) ? 0 : Math.max(0, num);
    };

    const processed = items.map((row: any, idx: number) => {
      const keys = Object.keys(row);
      
      // Smart cost key selection if not provided
      let effectiveCostKey = costColumnKey;
      if (!effectiveCostKey || !keys.includes(effectiveCostKey)) {
        const potentialKeys = ['custo', 'preço', 'preco', 'compra', 'p. custo', 'p.custo', 'price', 'cost', 'valor', 'unit cost', 'vlr custo'];
        effectiveCostKey = keys.find(k => potentialKeys.includes(k.toLowerCase().trim())) || keys[1] || keys[0];
      }

      const costNet = cleanCostValue(row[effectiveCostKey]);

      const profit = costNet * (cMargin / 100);
      const pvpBase = costNet + profit;
      const vatSale = pvpBase * (cVatRate / 100);
      const pvpFinal = pvpBase + vatSale;
      const vatCost = costNet * (cVatRate / 100);
      const netVatToPay = Math.max(0, vatSale - vatCost);
      const tpaCost = pvpFinal * 0.01;
      const operatingProfit = profit - tpaCost;
      const incomeTax = operatingProfit > 0 ? operatingProfit * (industrialTaxRate / 100) : 0;
      const netProfit = operatingProfit - incomeTax;

      return {
        ...row,
        '[NANUCLOUD] Custo Base (S/ IVA)': costNet.toFixed(2),
        '[NANUCLOUD] Margem Lucro (%)': `${cMargin}%`,
        '[NANUCLOUD] Lucro Bruto': profit.toFixed(2),
        '[NANUCLOUD] PVP Base (S/ IVA)': pvpBase.toFixed(2),
        '[NANUCLOUD] IVA Venda': vatSale.toFixed(2),
        '[NANUCLOUD] PVP Final Recomendado (C/ IVA)': pvpFinal.toFixed(2),
        '[NANUCLOUD] Taxa TPA': tpaCost.toFixed(2),
        '[NANUCLOUD] IVA a Entregar': netVatToPay.toFixed(2),
        '[NANUCLOUD] Lucro Líquido Real': netProfit.toFixed(2)
      };
    });

    const updatedUser = isStaff
      ? user
      : db.updateUser(user.id, {
          queriesRemaining: Math.max(0, user.queriesRemaining - 1),
          totalQueriesUsed: user.totalQueriesUsed + 1
        });

    const totalCostBase = processed.reduce((acc: number, r: any) => acc + (parseFloat(r['[NANUCLOUD] Custo Base (S/ IVA)']) || 0), 0);
    const totalPvpFinal = processed.reduce((acc: number, r: any) => acc + (parseFloat(r['[NANUCLOUD] PVP Final Recomendado (C/ IVA)']) || 0), 0);
    const totalNetProfit = processed.reduce((acc: number, r: any) => acc + (parseFloat(r['[NANUCLOUD] Lucro Líquido Real']) || 0), 0);

    const historyItem: QueryHistoryItem = {
      id: `qh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      type: 'batch',
      title: listName ? listName.trim() : `Lote Excel (${items.length} produtos)`,
      description: `${items.length} itens calculados com ${cMargin}% margem e ${cVatRate}% IVA`,
      countryCode: countryCode || 'AO',
      costBase: totalCostBase,
      vatRate: cVatRate,
      marginApplied: cMargin,
      finalPrice: totalPvpFinal,
      netProfit: totalNetProfit,
      currency: currency,
      details: {
        totalItems: items.length,
        processedSample: processed.slice(0, 10),
        marginPct: cMargin,
        vatRate: cVatRate
      },
      createdAt: new Date().toISOString()
    };

    db.addQueryHistory(historyItem);

    return res.json({
      success: true,
      processedItems: processed,
      historyItem,
      queriesRemaining: updatedUser?.queriesRemaining ?? 0
    });
  } catch (err: any) {
    console.error('Error on calculate-batch:', err);
    return res.status(500).json({ error: 'Erro ao processar ficheiro em lote.' });
  }
});

// 4. HISTÓRICO DE CONSULTAS DO UTILIZADOR
router.get('/history', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const history = db.getQueryHistory().filter(q => q.userId === user.id);
  return res.json({ history });
});

// 5. ATUALIZAR DESCRIÇÃO / NOTAS NA TABELA DO HISTÓRICO
router.put('/history/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { title, description } = req.body;

  const item = db.findQueryHistoryById(id);
  if (!item || item.userId !== user.id) {
    return res.status(404).json({ error: 'Registo de histórico não encontrado ou sem permissão.' });
  }

  const updated = db.updateQueryHistory(id, {
    title: title !== undefined ? title.trim() : item.title,
    description: description !== undefined ? description.trim() : item.description
  });

  return res.json({ message: 'Registo atualizado com sucesso!', item: updated });
});

// 6. ELIMINAR REGISTO DO HISTÓRICO
router.delete('/history/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const deleted = db.deleteQueryHistory(id, user.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Registo não encontrado.' });
  }

  return res.json({ message: 'Registo removido do histórico com sucesso.' });
});

// 7. EXPORTAR HISTÓRICO PARA EXCEL (.xlsx)
router.get('/history-export', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const history = db.getQueryHistory().filter(q => q.userId === user.id);

  const exportData = history.map(item => ({
    'ID Simulação': item.id,
    'Data / Hora': new Date(item.createdAt).toLocaleString('pt-PT'),
    'Tipo': item.type === 'local' ? 'Comércio Local' : (item.type === 'import' ? 'Importação' : 'Lote Excel'),
    'Título / Produto': item.title,
    'Descrição / Notas': item.description,
    'País Fiscal': item.countryCode,
    'Custo Base': item.costBase,
    'Taxa IVA (%)': item.vatRate,
    'Margem Aplicada (%)': item.marginApplied,
    'Preço Final (PVP)': item.finalPrice,
    'Lucro Líquido': item.netProfit,
    'Moeda': item.currency
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [{ 'Aviso': 'Sem registos no histórico' }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Simulações');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename=Historico_Simulacoes_${user.name.replace(/\s+/g, '_')}.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buffer);
});

export default router;
