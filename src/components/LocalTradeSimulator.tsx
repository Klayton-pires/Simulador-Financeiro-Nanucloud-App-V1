import React, { useState, useEffect } from 'react';
import { UserSafe } from '../types';
import { COUNTRIES_DB, getAvailableCountryList } from '../data/countries';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  Package,
  Download,
  FileText,
  FileSpreadsheet,
  Zap,
  SlidersHorizontal,
  Sparkles,
  Layers,
  HelpCircle,
  Percent
} from 'lucide-react';
import {
  exportSimulationDossierPDF,
  exportSimulationDossierExcel
} from '../utils/exportDocumentUtils';
import { useLayoutMode } from '../data/layoutMode';

interface LocalTradeSimulatorProps {
  user: UserSafe | null;
  currentLang: SupportedLang;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
  onCalculationDone: (newCredits: number) => void;
}

export const LocalTradeSimulator: React.FC<LocalTradeSimulatorProps> = ({
  user,
  currentLang,
  onOpenPlans,
  onOpenAuth,
  onCalculationDone
}) => {
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const availableCountries = getAvailableCountryList(isSuperAdmin);

  const [countryCode, setCountryCode] = useState<string>('AO');
  const [vatRate, setVatRate] = useState<number>(14);
  const [tpaRate, setTpaRate] = useState<number>(0);
  const [costNet, setCostNet] = useState<string>('');
  const [costGross, setCostGross] = useState<string>('');
  const [marginPct, setMarginPct] = useState<string>('');
  const [fixedPrice, setFixedPrice] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationResults, setCalculationResults] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const country = COUNTRIES_DB[countryCode] || COUNTRIES_DB['AO'];

  useEffect(() => {
    if (country) {
      setVatRate(country.vatOptions[0]?.r ?? 14);
      setTpaRate(country.tpa || 0);
      if (costNet) {
        recalcGrossFromNet(parseFloat(costNet) || 0, country.vatOptions[0]?.r ?? 14);
      }
    }
  }, [countryCode]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const recalcGrossFromNet = (net: number, vRate: number) => {
    if (!net || net <= 0) {
      setCostGross('');
      return;
    }
    const gross = net * (1 + vRate / 100);
    setCostGross(gross.toFixed(2));
  };

  const handleNetInput = (val: string) => {
    setCostNet(val);
    clearFieldError('costNet');
    clearFieldError('pricing');
    if (!val || parseFloat(val) <= 0) {
      setCostGross('');
      return;
    }
    const num = parseFloat(val) || 0;
    recalcGrossFromNet(num, vatRate);
  };

  const handleGrossInput = (val: string) => {
    setCostGross(val);
    clearFieldError('costGross');
    clearFieldError('pricing');
    if (!val || parseFloat(val) <= 0) {
      setCostNet('');
      return;
    }
    const num = parseFloat(val) || 0;
    const net = num / (1 + vatRate / 100);
    setCostNet(net.toFixed(2));
  };

  const handleVatChange = (newVat: number) => {
    setVatRate(newVat);
    clearFieldError('vatRate');
    if (costNet) {
      const net = parseFloat(costNet) || 0;
      recalcGrossFromNet(net, newVat);
    }
  };

  const formatMoney = (val: number) => {
    return (
      new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val) + ` ${country.curr}`
    );
  };

  const processMathScenario = (
    cNet: number,
    mPct: number,
    fixPrice: number,
    vRate: number,
    tRate: number,
    iiRate: number
  ) => {
    let pvpBase = 0;
    let pvpFinal = 0;
    let vatSale = 0;
    let profit = 0;
    let actualMargin = 0;

    if (fixPrice > 0) {
      pvpFinal = fixPrice;
      pvpBase = pvpFinal / (1 + vRate / 100);
      vatSale = pvpFinal - pvpBase;
      profit = pvpBase - cNet;
      actualMargin = cNet > 0 ? (profit / cNet) * 100 : 0;
    } else {
      profit = cNet * (mPct / 100);
      pvpBase = cNet + profit;
      vatSale = pvpBase * (vRate / 100);
      pvpFinal = pvpBase + vatSale;
      actualMargin = mPct;
    }

    const vatCost = cNet * (vRate / 100);
    const netVatToPay = Math.max(0, vatSale - vatCost);
    const tpaCost = pvpFinal * (tRate / 100);
    const operatingProfit = profit - tpaCost;
    const incomeTax = operatingProfit > 0 ? operatingProfit * (iiRate / 100) : 0;
    const netProfit = operatingProfit - incomeTax;

    return {
      costNet: cNet,
      vatCost,
      profit,
      marginApplied: actualMargin,
      pvpBase,
      pvpFinal,
      vatSale,
      netVatToPay,
      tpaCost,
      incomeTax,
      netProfit
    };
  };

  const [showExhaustedModal, setShowExhaustedModal] = useState<boolean>(false);
  const [guestQueriesLeft, setGuestQueriesLeft] = useState<number>(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('nanucloud_daily_reset_date');
    if (savedDate !== today) {
      localStorage.setItem('nanucloud_daily_reset_date', today);
      localStorage.setItem('nanucloud_guest_queries_left', '3');
      return 3;
    }
    const saved = localStorage.getItem('nanucloud_guest_queries_left');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const handleCalculate = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const errors: Record<string, string> = {};
    const net = parseFloat(costNet) || 0;
    const fPrice = parseFloat(fixedPrice) || 0;
    const mPct = parseFloat(marginPct) || 0;

    if (!costNet || costNet.trim() === '') {
      errors.costNet = 'Campo obrigatório: introduza o Preço de Custo Base (SEM IVA).';
    } else if (isNaN(net) || net <= 0) {
      errors.costNet = 'O Preço de Custo deve ser um número positivo superior a 0.';
    }

    if (marginPct === '' && fixedPrice === '') {
      errors.pricing = 'Defina a Margem Desejada (%) ou o Preço de Venda Fixo (PVP).';
    }

    if (isNaN(tpaRate) || tpaRate < 0 || tpaRate > 100) {
      errors.tpaRate = 'A taxa TPA deve situar-se entre 0% e 100%.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Existem campos sem preenchimento ou com valores incorretos.');
      return;
    }

    setFieldErrors({});

    // GUEST FLOW
    if (!user) {
      if (guestQueriesLeft <= 0) {
        setShowExhaustedModal(true);
        return;
      }

      setIsCalculating(true);

      setTimeout(() => {
        const scenarios = [];

        if (marginPct !== '' || fPrice > 0) {
          const customCalc = processMathScenario(
            net,
            mPct,
            fPrice,
            vatRate,
            tpaRate,
            country.ii
          );
          scenarios.push({
            title: `Cenário Personalizado (Produto)`,
            calc: customCalc,
            isCustom: true
          });
        }

        country.margins.forEach((m) => {
          const stdCalc = processMathScenario(net, m, 0, vatRate, tpaRate, country.ii);
          scenarios.push({
            title: `Margem Padrão (${m}%)`,
            calc: stdCalc,
            isCustom: false
          });
        });

        const newRemaining = guestQueriesLeft - 1;
        setGuestQueriesLeft(newRemaining);
        localStorage.setItem('nanucloud_guest_queries_left', newRemaining.toString());

        setCalculationResults(scenarios);
        setSuccessMessage(
          newRemaining > 0
            ? `Simulação concluída com sucesso! Restam ${newRemaining} consultas gratuitas.`
            : `Esta foi a sua última consulta gratuita (0 restantes). Para continuar, adira a um plano!`
        );
        setIsCalculating(false);
      }, 250);

      return;
    }

    // LOGGED IN USER FLOW
    if (user.queriesRemaining <= 0) {
      setErrorMessage('As suas consultas esgotaram. Adquira um dos nossos planos para continuar.');
      onOpenPlans();
      return;
    }

    setIsCalculating(true);

    try {
      let remaining = user.queriesRemaining;
      try {
        const res = await fetch('/api/simulator/calculate-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryCode,
            costNet: net,
            vatRate,
            tpaRate,
            marginPct: mPct,
            fixedFinalPrice: fPrice,
            productName,
            notes
          })
        });

        if (res.ok) {
          const data = await res.json();
          remaining = data.queriesRemaining;
        } else if (res.status === 402) {
          const data = await res.json();
          setErrorMessage(data.error);
          onOpenPlans();
          setIsCalculating(false);
          return;
        } else {
          remaining = Math.max(0, user.queriesRemaining - 1);
        }
      } catch (err) {
        remaining = Math.max(0, user.queriesRemaining - 1);
      }

      const scenarios = [];
      if (marginPct !== '' || fPrice > 0) {
        const customCalc = processMathScenario(
          net,
          mPct,
          fPrice,
          vatRate,
          tpaRate,
          country.ii
        );
        scenarios.push({
          title: `Cenário Personalizado (Produto)`,
          calc: customCalc,
          isCustom: true
        });
      }

      country.margins.forEach((m) => {
        const stdCalc = processMathScenario(net, m, 0, vatRate, tpaRate, country.ii);
        scenarios.push({
          title: `Margem Padrão (${m}%)`,
          calc: stdCalc,
          isCustom: false
        });
      });

      setCalculationResults(scenarios);
      setSuccessMessage('Simulação calculada com sucesso e guardada no seu histórico!');
      onCalculationDone(remaining);
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao processar simulação.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExportPDF = () => {
    if (!calculationResults || calculationResults.length === 0) return;
    const mainScenario = calculationResults[0];
    const calc = mainScenario.calc;

    exportSimulationDossierPDF({
      title: `Dossiê de Formação de Preço - ${productName || 'Mercadoria Geral'}`,
      moduleName: 'Vendas & Comércio Local (PVP)',
      user: user,
      country: country,
      inputFields: [
        { label: 'Produto / Mercadoria', value: productName || 'Artigo Comercial', description: 'Designação do item' },
        { label: 'Custo Base (Sem IVA)', value: calc.costNet, description: 'Custo líquido de aquisição' },
        { label: 'Margem de Lucro Desejada', value: `${calc.marginApplied.toFixed(2)}%`, description: 'Margem comercial pretendida' },
        { label: 'Taxa de IVA Aplicada', value: `${vatRate}%`, description: `Taxa geral ${country.agency}` },
        { label: 'Taxa Multicaixa / TPA', value: `${tpaRate}%`, description: 'Encargo de processamento bancário' }
      ],
      calculatedFields: [
        { label: 'Custo Base da Mercadoria', amount: calc.costNet, rateOrMargin: '100% Custo', fiscalDestiny: 'Fornecedor' },
        { label: 'Margem / Lucro Bruto Comercial', amount: calc.profit, rateOrMargin: `${calc.marginApplied.toFixed(1)}%`, fiscalDestiny: 'Margem Comercial' },
        { label: 'IVA Cobrado na Venda', amount: calc.vatSale, rateOrMargin: `${vatRate}% IVA`, fiscalDestiny: `Repercussão (${country.agency})` },
        { label: 'PREÇO FINAL RECOMENDADO (PVP com IVA)', amount: calc.pvpFinal, rateOrMargin: 'PVP Total', isFinalHighlight: true, fiscalDestiny: 'Preço de Prateleira' },
        { label: 'Dedução Taxa TPA / Multicaixa', amount: calc.tpaCost, rateOrMargin: `${tpaRate}%`, isDeduction: true, fiscalDestiny: 'Bancos / Operador POS' },
        { label: 'IVA Líquido a Entregar ao Estado', amount: calc.netVatToPay, rateOrMargin: 'IVA Líquido', isDeduction: true, fiscalDestiny: country.agency },
        { label: 'Provisão Imposto Industrial', amount: calc.incomeTax, rateOrMargin: `${country.ii}%`, isDeduction: true, fiscalDestiny: 'Tributação de Lucros' },
        { label: 'LUCRO LÍQUIDO REAL EFETIVO', amount: calc.netProfit, rateOrMargin: 'Líquido', isFinalHighlight: true, fiscalDestiny: 'Empresa / Caixa Livre' }
      ],
      summaryCards: [
        { label: 'PVP Final com IVA', value: formatMoney(calc.pvpFinal), subtext: 'Preço Recomendado ao Consumidor' },
        { label: 'Lucro Líquido Real', value: formatMoney(calc.netProfit), subtext: 'Livre de impostos e taxas' },
        { label: 'Margem Aplicada', value: `${calc.marginApplied.toFixed(1)}%`, subtext: 'Sobre o Custo Base' }
      ],
      legalNotes: [
        `Cálculo em conformidade com o Código Geral Tributário e Código do IVA (${country.name} - ${country.agency}).`,
        `Este documento reflete valores finais computados e calculados. Todas as regras de arredondamento e retenção seguem a regulamentação do Fisco.`
      ],
      notes: notes
    });
  };

  const handleExportExcel = () => {
    if (!calculationResults || calculationResults.length === 0) return;
    const mainScenario = calculationResults[0];
    const calc = mainScenario.calc;

    exportSimulationDossierExcel({
      title: `Simulacao_PVP_${(productName || 'Artigo').replace(/\s+/g, '_')}`,
      moduleName: 'Vendas & Comércio Local',
      user: user,
      country: country,
      inputFields: [
        { label: 'Designação do Produto', value: productName || 'Artigo Comercial', description: 'Item comercializado' },
        { label: 'Preço de Custo Base (Sem IVA)', value: calc.costNet, description: 'Custo inicial' },
        { label: 'Margem Comercial Aplicada', value: `${calc.marginApplied.toFixed(2)}%`, description: 'Margem de lucro' },
        { label: 'Taxa de IVA', value: `${vatRate}%`, description: 'Imposto sobre o Valor Acrescentado' },
        { label: 'Taxa TPA / Cartão', value: `${tpaRate}%`, description: 'Encargo bancário' }
      ],
      calculatedFields: [
        { label: 'Custo Base de Compra', amount: calc.costNet, rateOrMargin: '100%', fiscalDestiny: 'Fornecedor' },
        { label: 'Lucro Bruto', amount: calc.profit, rateOrMargin: `${calc.marginApplied.toFixed(1)}%`, fiscalDestiny: 'Margem Comercial' },
        { label: 'IVA Cobrado ao Cliente', amount: calc.vatSale, rateOrMargin: `${vatRate}%`, fiscalDestiny: country.agency },
        { label: 'PREÇO FINAL DE VENDA (PVP)', amount: calc.pvpFinal, rateOrMargin: 'PVP', fiscalDestiny: 'Venda ao Público' },
        { label: 'Taxa Bancária TPA', amount: calc.tpaCost, rateOrMargin: `${tpaRate}%`, fiscalDestiny: 'Dedução Bancária' },
        { label: 'IVA a Entregar ao Fisco', amount: calc.netVatToPay, rateOrMargin: 'Líquido', fiscalDestiny: country.agency },
        { label: 'Imposto Industrial / Lucros', amount: calc.incomeTax, rateOrMargin: `${country.ii}%`, fiscalDestiny: 'Provisão Fiscal' },
        { label: 'LUCRO LÍQUIDO REAL', amount: calc.netProfit, rateOrMargin: 'Líquido', fiscalDestiny: 'Resultado Líquido' }
      ],
      notes: notes
    });
  };

  return (
    <div className="space-y-6">
      {/* Exhausted Free Queries Modal */}
      {showExhaustedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">Consultas Gratuitas Esgotadas</h3>
                <p className="text-xs text-slate-400">Atingiu o limite de consultas de demonstração</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Para continuar a realizar simulações fiscais, histórico detalhado e exportações, adira a um dos planos <strong>NANUCLOUD</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExhaustedModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExhaustedModal(false);
                  onOpenAuth();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow cursor-pointer uppercase"
              >
                Aderir a um Plano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Mode Free Quota Indicator */}
      {!user && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-slate-300">
              Modo Demonstração Sem Registo: <strong className="text-indigo-300">{guestQueriesLeft} de 3 consultas</strong> restantes.
            </span>
          </div>
          <button
            onClick={onOpenAuth}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            Registar-se
          </button>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-tight">
                  Simulador de Comércio Local & Venda de Produtos
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  layoutMode === 'friendly'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {layoutMode === 'friendly' ? 'Modo Básico / Friendly' : 'Modo Avançado Pro'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {layoutMode === 'friendly'
                  ? 'Interface amigável e simplificada: ajuste margens com um clique e visualize o preço final instantaneamente.'
                  : 'Formação matemática completa: múltiplos cenários comparativos, pauta fiscal, TPA e apuramento do lucro líquido.'}
              </p>
            </div>
          </div>

          {/* Layout Mode Local Switcher */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setLayoutMode('friendly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition ${
                layoutMode === 'friendly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Básico / Amigável</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('advanced')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition ${
                layoutMode === 'advanced'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Avançado Pro</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Country Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              {t.lblCountry}
            </label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                clearFieldError('countryCode');
              }}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            >
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.curr})
                </option>
              ))}
            </select>
          </div>

          {/* VAT Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              {t.lblVat}
            </label>
            <select
              value={vatRate}
              onChange={(e) => handleVatChange(parseFloat(e.target.value))}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            >
              {country.vatOptions.map((v, idx) => (
                <option key={idx} value={v.r}>
                  {v.n}
                </option>
              ))}
            </select>
          </div>

          {/* TPA Card Fee */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              {t.lblTpa} {layoutMode === 'friendly' ? '(Opcional)' : '(Padrão 0%)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={tpaRate}
                onChange={(e) => {
                  setTpaRate(parseFloat(e.target.value) || 0);
                  clearFieldError('tpaRate');
                }}
                step="0.1"
                min="0"
                className={`w-full bg-[#0F172A] border rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition ${
                  fieldErrors.tpaRate ? 'border-rose-500 bg-rose-950/20 text-rose-100 ring-2 ring-rose-500/20' : 'border-slate-800 text-slate-100'
                }`}
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-mono">%</span>
            </div>
          </div>
        </div>

        {/* Cost & Margins Box */}
        <div className="space-y-4 mb-5">
          {/* Purchase Cost */}
          <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                1. Preço de Custo de Compra da Mercadoria
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400">{country.curr}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>{t.lblCostNet} (SEM IVA) *</span>
                </label>
                <input
                  type="number"
                  value={costNet}
                  onChange={(e) => handleNetInput(e.target.value)}
                  placeholder={`Ex: 10000 (${country.curr})`}
                  step="any"
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-xs font-mono focus:border-indigo-500 outline-none transition ${
                    fieldErrors.costNet ? 'border-rose-500 bg-rose-950/20 text-rose-100 ring-2 ring-rose-500/20' : 'border-slate-700 text-slate-100'
                  }`}
                />
                {fieldErrors.costNet && (
                  <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.costNet}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-mono">{t.lblCostGross} (COM IVA)</label>
                <input
                  type="number"
                  value={costGross}
                  onChange={(e) => handleGrossInput(e.target.value)}
                  placeholder={`Ex: 11400 (${country.curr})`}
                  step="any"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-xs font-mono focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Margins Selection & Presets */}
          <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-400" />
                2. Estratégia de Preço: Margem Desejada (%) {layoutMode === 'advanced' && 'OU Preço Fixo (PVP)'}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {layoutMode === 'friendly' ? 'Escolha rápida ou digite a sua margem' : 'Preencha uma das opções'}
              </span>
            </div>

            {/* Quick Preset Buttons (Friendly & Dynamic) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Margens Rápidas:
              </span>
              {[10, 15, 20, 25, 30, 35, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setMarginPct(preset.toString());
                    setFixedPrice('');
                    clearFieldError('pricing');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    marginPct === preset.toString() && !fixedPrice
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  +{preset}%
                </button>
              ))}
            </div>

            <div className={`grid gap-4 ${layoutMode === 'friendly' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  {t.lblMargin} (Personalizada)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={marginPct}
                    onChange={(e) => {
                      setMarginPct(e.target.value);
                      setFixedPrice('');
                      clearFieldError('pricing');
                    }}
                    placeholder="Ex: 25 (%)"
                    step="any"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-xs font-mono focus:border-indigo-500 outline-none transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>

              {layoutMode === 'advanced' && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">{t.lblFixed}</label>
                  <input
                    type="number"
                    value={fixedPrice}
                    onChange={(e) => {
                      setFixedPrice(e.target.value);
                      setMarginPct('');
                      clearFieldError('pricing');
                    }}
                    placeholder={`Ex: 15000 (${country.curr})`}
                    step="any"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2.5 text-xs font-mono focus:border-indigo-500 outline-none transition"
                  />
                </div>
              )}
            </div>
            {fieldErrors.pricing && (
              <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.pricing}</span>
              </p>
            )}
          </div>
        </div>

        {/* Optional Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-mono">{t.lblProductName}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Smartphone Galaxy / Arroz 25kg / Óleo de Palma"
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-mono">{t.lblNotes}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Preço de campanha promocional ou lote especial"
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Calculate Action */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>{isCalculating ? 'A CALCULAR & GUARDAR...' : t.btnCalcLocal}</span>
        </button>
      </div>

      {/* Results Scenarios */}
      {calculationResults && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E293B] border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Cenários de Formação de Preço e Lucratividade (Produtos)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                IVA: {vatRate}% | TPA: {tpaRate}% | Imposto Industrial: {country.ii}%
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Exportar Dossiê Oficial em PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Dossiê PDF</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Exportar Dossiê em Excel (Sem Fórmulas)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculationResults.map((scenario, index) => {
              const calc = scenario.calc;
              return (
                <div
                  key={index}
                  className={`bg-[#1E293B] border rounded-xl p-5 shadow-sm transition-all ${
                    scenario.isCustom
                      ? 'border-indigo-500/50'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Scenario Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <h4 className="font-bold text-slate-100 text-xs uppercase font-mono">
                      {scenario.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                      Margem: {calc.marginApplied.toFixed(1)}%
                    </span>
                  </div>

                  {/* Visual Distribution Progress Bar (Auto-adjusting & dynamic) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Distribuição do PVP:</span>
                      <span className="text-emerald-400 font-bold">
                        {((calc.netProfit / (calc.pvpFinal || 1)) * 100).toFixed(0)}% Lucro Líquido
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${Math.min(100, Math.max(5, (calc.costNet / (calc.pvpFinal || 1)) * 100))}%` }}
                        className="bg-slate-500 h-full transition-all"
                        title={`Custo: ${formatMoney(calc.costNet)}`}
                      />
                      <div
                        style={{ width: `${Math.min(100, Math.max(3, (calc.vatSale / (calc.pvpFinal || 1)) * 100))}%` }}
                        className="bg-indigo-500 h-full transition-all"
                        title={`IVA: ${formatMoney(calc.vatSale)}`}
                      />
                      {calc.tpaCost > 0 && (
                        <div
                          style={{ width: `${Math.min(100, Math.max(2, (calc.tpaCost / (calc.pvpFinal || 1)) * 100))}%` }}
                          className="bg-rose-500 h-full transition-all"
                          title={`TPA: ${formatMoney(calc.tpaCost)}`}
                        />
                      )}
                      <div
                        style={{ width: `${Math.min(100, Math.max(5, (calc.netProfit / (calc.pvpFinal || 1)) * 100))}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Lucro Líquido: ${formatMoney(calc.netProfit)}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500" /> Custo
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" /> IVA
                      </span>
                      {calc.tpaCost > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> TPA
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Lucro Líquido
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Breakdown Table */}
                  <div className="space-y-2 text-xs font-mono">
                    {/* Section 1: Price Formation */}
                    <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        1. Formação do Preço / Faturação Bruta
                      </p>
                      <div className="flex justify-between text-slate-300">
                        <span>Custo Base (SEM IVA)</span>
                        <strong className="text-slate-100 font-mono">{formatMoney(calc.costNet)}</strong>
                      </div>
                      <div className="flex justify-between text-indigo-300">
                        <span>(+) Lucro Bruto / Margem ({calc.marginApplied.toFixed(1)}%)</span>
                        <strong className="font-mono">+ {formatMoney(calc.profit)}</strong>
                      </div>
                      <div className="flex justify-between text-indigo-300">
                        <span>(+) IVA Cobrado ({vatRate}%)</span>
                        <strong className="font-mono">+ {formatMoney(calc.vatSale)}</strong>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold text-slate-100 text-xs">
                        <span>(=) PREÇO TOTAL FATURA (PVP)</span>
                        <span className="text-emerald-400 font-bold font-mono text-sm">{formatMoney(calc.pvpFinal)}</span>
                      </div>
                    </div>

                    {/* Section 2: Deductions and Net Received */}
                    <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        2. Deduções Diretas & Impostos ({country.agency})
                      </p>
                      {calc.tpaCost > 0 && (
                        <div className="flex justify-between text-rose-400">
                          <span>(-) Taxa Multicaixa / TPA ({tpaRate}%)</span>
                          <strong className="font-mono">- {formatMoney(calc.tpaCost)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-rose-400">
                        <span>(-) IVA a Pagar ao Fisco</span>
                        <strong className="font-mono">- {formatMoney(calc.netVatToPay)}</strong>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>(-) Imposto Industrial ({country.ii}%)</span>
                        <strong className="font-mono">- {formatMoney(calc.incomeTax)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit Banner */}
                  <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-emerald-400 block">
                        LUCRO LÍQUIDO REAL
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Livre de mercadoria, taxas e impostos
                      </span>
                    </div>
                    <strong className="text-base font-bold font-mono text-emerald-400">
                      {formatMoney(calc.netProfit)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Google AdSense Monetization Banner (Only displayed in Free/Guest Mode) */}
      {(!user || user.queriesRemaining <= 3) && (
        <div className="bg-[#0F172A] border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            <span>PUBLICIDADE PATROCINADA</span>
            <span>GOOGLE ADSENSE (MODO GRATUITO)</span>
          </div>
          <div className="h-20 bg-slate-900/50 rounded-lg flex flex-col items-center justify-center border border-slate-800/40 text-slate-500 text-xs font-mono">
            <span className="text-slate-400 font-bold">NANUCLOUD</span>
            <span className="text-[11px] text-slate-600">Espaço publicitário reservado • Desativação automática para contas com planos ativos</span>
          </div>
        </div>
      )}
    </div>
  );
};
