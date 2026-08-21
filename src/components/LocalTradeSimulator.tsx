import React, { useState, useEffect } from 'react';
import { UserSafe } from '../types';
import { COUNTRIES_DB } from '../data/countries';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { Calculator, HelpCircle, CheckCircle, TrendingUp, DollarSign, Building2, AlertCircle, BookmarkPlus } from 'lucide-react';

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
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  const [countryCode, setCountryCode] = useState<string>('AO');
  const [vatRate, setVatRate] = useState<number>(14);
  const [tpaRate, setTpaRate] = useState<number>(1.0);
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [retentionRate, setRetentionRate] = useState<string>('0');
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

  const country = COUNTRIES_DB[countryCode] || COUNTRIES_DB['AO'];

  useEffect(() => {
    if (country) {
      setVatRate(country.vatOptions[0]?.r ?? 14);
      setTpaRate(country.tpa);
      if (itemType === 'service') {
        // Set default retention rate for service according to country (6.5% for Angola, 11.5% for Portugal, etc.)
        setRetentionRate(countryCode === 'AO' ? '6.5' : (countryCode === 'PT' ? '11.5' : '5.0'));
      } else {
        setRetentionRate('0');
      }
      if (costNet) {
        recalcGrossFromNet(parseFloat(costNet) || 0, country.vatOptions[0]?.r ?? 14);
      }
    }
  }, [countryCode, itemType]);

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
    if (!val || parseFloat(val) <= 0) {
      setCostGross('');
      return;
    }
    const num = parseFloat(val) || 0;
    recalcGrossFromNet(num, vatRate);
  };

  const handleGrossInput = (val: string) => {
    setCostGross(val);
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
    iiRate: number,
    rRate: number = 0,
    type: 'product' | 'service' = 'product'
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
    
    // Retenção na fonte calculada sobre a base tributável (serviços)
    const retentionAmount = pvpBase * (rRate / 100);
    
    // Montante Líquido que entra na conta bancária (PVP Final - Retenção na Fonte - Taxa TPA)
    const netReceived = pvpFinal - retentionAmount - tpaCost;

    const operatingProfit = profit - tpaCost;
    const estimatedTax = operatingProfit > 0 ? operatingProfit * (iiRate / 100) : 0;
    const incomeTax = Math.max(0, estimatedTax - retentionAmount);
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
      retentionRate: rRate,
      retentionAmount,
      netReceived,
      incomeTax,
      netProfit,
      itemType: type
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

    const net = parseFloat(costNet) || 0;
    if (net <= 0) {
      setErrorMessage('O Custo Base de Operação (SEM IVA) deve ser superior a zero.');
      return;
    }

    const curRetention = parseFloat(retentionRate) || 0;

    // GUEST FLOW (Without creating account, 3 free queries)
    if (!user) {
      if (guestQueriesLeft <= 0) {
        setShowExhaustedModal(true);
        return;
      }

      setIsCalculating(true);

      // Execute client calculation for guest
      setTimeout(() => {
        const scenarios = [];

        if (marginPct !== '' || (parseFloat(fixedPrice) || 0) > 0) {
          const customCalc = processMathScenario(
            net,
            parseFloat(marginPct) || 0,
            parseFloat(fixedPrice) || 0,
            vatRate,
            tpaRate,
            country.ii,
            curRetention,
            itemType
          );
          scenarios.push({
            title: `Cenário Personalizado (${itemType === 'service' ? 'Serviço' : 'Produto'})`,
            calc: customCalc,
            isCustom: true
          });
        }

        country.margins.forEach((m) => {
          const stdCalc = processMathScenario(net, m, 0, vatRate, tpaRate, country.ii, curRetention, itemType);
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
            ? `Simulação concluída com sucesso! Restam ${newRemaining} de 3 consultas gratuitas sem registo.`
            : `Esta foi a sua última consulta gratuita (0 restantes). Para continuar, adira a um plano!`
        );
        setIsCalculating(false);
      }, 250);

      return;
    }

    // LOGGED IN USER FLOW
    if (user.queriesRemaining <= 0) {
      setErrorMessage('As suas consultas esgotaram. Adquira um dos nossos 5 planos para continuar.');
      onOpenPlans();
      return;
    }

    setIsCalculating(true);

    try {
      const res = await fetch('/api/simulator/calculate-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          costNet: net,
          vatRate,
          tpaRate,
          marginPct: parseFloat(marginPct) || 0,
          fixedFinalPrice: parseFloat(fixedPrice) || 0,
          productName,
          itemType,
          retentionRate: curRetention,
          notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setErrorMessage(data.error);
          onOpenPlans();
        } else {
          setErrorMessage(data.error || 'Erro ao calcular simulação.');
        }
        setIsCalculating(false);
        return;
      }

      // Generate visual scenarios
      const scenarios = [];

      // Custom scenario first if filled
      if (marginPct !== '' || (parseFloat(fixedPrice) || 0) > 0) {
        const customCalc = processMathScenario(
          net,
          parseFloat(marginPct) || 0,
          parseFloat(fixedPrice) || 0,
          vatRate,
          tpaRate,
          country.ii,
          curRetention,
          itemType
        );
        scenarios.push({
          title: `Cenário Personalizado (${itemType === 'service' ? 'Serviço' : 'Produto'})`,
          calc: customCalc,
          isCustom: true
        });
      }

      // Standard scenarios
      country.margins.forEach((m) => {
        const stdCalc = processMathScenario(net, m, 0, vatRate, tpaRate, country.ii, curRetention, itemType);
        scenarios.push({
          title: `Margem Padrão (${m}%)`,
          calc: stdCalc,
          isCustom: false
        });
      });

      setCalculationResults(scenarios);
      setSuccessMessage('Simulação calculada com sucesso e guardada no seu histórico!');
      onCalculationDone(data.queriesRemaining);
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha na comunicação com o servidor.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exhausted Free Queries / Subscribe Modal */}
      {showExhaustedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">Consultas Gratuitas Esgotadas</h3>
                <p className="text-xs text-slate-400">Atingiu o limite de 3 consultas sem registo</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Para continuar a realizar simulações fiscais, ter acesso aos cálculos de importação, histórico detalhado e exportação em Excel, adira a um dos planos <strong>NANUCLOUD</strong>.
            </p>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>✓ Como proceder:</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                1. Crie uma conta ou inicie sessão com o seu NIF.<br />
                2. Selecione o plano ou valor personalizado.<br />
                3. Efetue o pagamento por Transferência Bancária (com IBANs oficiais) ou Multicaixa Express.
              </p>
            </div>

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
              Modo Demonstração Sem Registo: <strong className="text-indigo-300">{guestQueriesLeft} de 3 consultas</strong> gratuitas restantes.
            </span>
          </div>
          <button
            onClick={onOpenAuth}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-bold"
          >
            Criar Conta com NIF
          </button>
        </div>
      )}

      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">{t.localTitle}</h2>
              <p className="text-xs text-slate-400">Preços de venda, IVA dedutível, taxas bancárias e margem de lucro</p>
            </div>
          </div>

          <span className="text-[11px] bg-slate-900 text-slate-300 font-mono px-3 py-1 rounded-lg border border-slate-800">
            Fisco: <strong className="text-indigo-400">{country.name} ({country.agency})</strong>
          </span>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Informative Note: Products & Services with Withholding Tax */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>NOTA IMPORTANTE: SIMULAÇÃO PARA PRODUTOS E PRESTAÇÃO DE SERVIÇOS</span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
            Este simulador <strong>não serve só para produtos, também pode ser usado em prestação de serviços</strong>. No caso de serviços, utilize o campo de <strong>Retenção na Fonte (%)</strong> para deduzir a percentagem regulamentar do seu país (ex: <strong>6.5%</strong> em Angola segundo o Código do Imposto Industrial/IRT, ou <strong>11.5% / 25%</strong> em Portugal). A retenção é deduzida diretamente no montante líquido a receber, semelhante à taxa de TPA/POS.
          </p>
        </div>

        {/* Item Type Selector (Produto vs Prestação de Serviços) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0F172A] border border-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setItemType('product')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              itemType === 'product'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📦 Comércio / Venda de Produtos</span>
          </button>
          <button
            type="button"
            onClick={() => setItemType('service')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              itemType === 'service'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💼 Prestação de Serviços & Consultoria</span>
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
          {/* Country Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
              {t.lblCountry}
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            >
              {Object.keys(COUNTRIES_DB).map((code) => (
                <option key={code} value={code}>
                  {COUNTRIES_DB[code].name} ({COUNTRIES_DB[code].curr})
                </option>
              ))}
            </select>
          </div>

          {/* VAT Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
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
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
              {t.lblTpa}
            </label>
            <input
              type="number"
              value={tpaRate}
              onChange={(e) => setTpaRate(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Retenção na Fonte (%) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Retenção Fonte (%)</span>
              {itemType === 'service' && <span className="text-[10px] text-amber-400 font-mono">Serviços</span>}
            </label>
            <div className="relative">
              <input
                type="number"
                value={retentionRate}
                onChange={(e) => setRetentionRate(e.target.value)}
                step="0.1"
                min="0"
                placeholder={itemType === 'service' ? 'Ex: 6.5' : '0'}
                className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-mono">%</span>
            </div>
          </div>
        </div>

        {/* Quick Retention Presets for Services */}
        {itemType === 'service' && (
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400 text-[10px] uppercase">Taxas Rápidas de Retenção:</span>
            <button
              type="button"
              onClick={() => setRetentionRate('6.5')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition cursor-pointer"
            >
              Angola Serviços (6.5%)
            </button>
            <button
              type="button"
              onClick={() => setRetentionRate('11.5')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition cursor-pointer"
            >
              Portugal Prof. Liberais (11.5%)
            </button>
            <button
              type="button"
              onClick={() => setRetentionRate('25.0')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition cursor-pointer"
            >
              Retenção Geral (25%)
            </button>
            <button
              type="button"
              onClick={() => setRetentionRate('0')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition cursor-pointer"
            >
              Isento (0%)
            </button>
          </div>
        )}

        {/* Cost Synchronization Box */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
                <span>{itemType === 'service' ? 'Custo / Honorário Base (SEM IVA)' : t.lblCostNet}</span>
                <span className="text-[10px] text-indigo-400 font-mono">{country.curr}</span>
              </label>
              <input
                type="number"
                value={costNet}
                onChange={(e) => handleNetInput(e.target.value)}
                placeholder={itemType === 'service' ? 'Ex: 50000 (Custo Base Serviço)' : 'Ex: 10000'}
                min="0"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
                <span>{itemType === 'service' ? 'Custo Base Bruto (COM IVA)' : t.lblCostGross}</span>
                <span className="text-[10px] text-indigo-400 font-mono">{country.curr}</span>
              </label>
              <input
                type="number"
                value={costGross}
                onChange={(e) => handleGrossInput(e.target.value)}
                placeholder="Ex: 57000"
                min="0"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Sincronização automática de valor Sem IVA e Com IVA ({vatRate}%).
          </p>
        </div>

        {/* Margin vs Fixed Final Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">{t.lblMargin}</label>
            <input
              type="number"
              value={marginPct}
              onChange={(e) => {
                setMarginPct(e.target.value);
                setFixedPrice('');
              }}
              placeholder="Ex: 25"
              step="any"
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">{t.lblFixed}</label>
            <input
              type="number"
              value={fixedPrice}
              onChange={(e) => {
                setFixedPrice(e.target.value);
                setMarginPct('');
              }}
              placeholder="Ex: 15000"
              step="any"
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Optional Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-mono">{itemType === 'service' ? 'Nome do Serviço / Consultoria' : t.lblProductName}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={itemType === 'service' ? 'Ex: Consultoria de Auditoria Fiscal / Desenvolvimento Web' : 'Ex: Smartphone Galaxy / Arroz 25kg'}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-mono">{t.lblNotes}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={itemType === 'service' ? 'Ex: Contrato mensal com retenção na fonte 6.5%' : 'Ex: Margem calculada para campanha de Natal'}
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Cenários de Formação de Preço e Lucratividade ({itemType === 'service' ? 'Serviços' : 'Produtos'})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              IVA: {vatRate}% | TPA: {tpaRate}% | Retenção: {retentionRate}% | II: {country.ii}%
            </span>
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

                  {/* Mathematical Breakdown Table */}
                  <div className="space-y-2 text-xs font-mono">
                    {/* Section 1: Price Formation */}
                    <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        1. Formação do Preço / Faturação Bruta
                      </p>
                      <div className="flex justify-between text-slate-300">
                        <span>Custo / Base de Cálculo (SEM IVA)</span>
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
                        2. Deduções Diretas no Pagamento ({country.agency})
                      </p>
                      {calc.retentionRate > 0 && (
                        <div className="flex justify-between text-amber-400 font-bold">
                          <span>(-) Retenção na Fonte ({calc.retentionRate}%)</span>
                          <strong className="font-mono">- {formatMoney(calc.retentionAmount)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-rose-400">
                        <span>(-) Taxa Multicaixa / TPA ({tpaRate}%)</span>
                        <strong className="font-mono">- {formatMoney(calc.tpaCost)}</strong>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>(-) IVA a Pagar ao Fisco</span>
                        <strong className="font-mono">- {formatMoney(calc.netVatToPay)}</strong>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>(-) Imposto Industrial ({country.ii}%)</span>
                        <strong className="font-mono">- {formatMoney(calc.incomeTax)}</strong>
                      </div>
                    </div>

                    {/* Net Liquid Received Box */}
                    {calc.retentionRate > 0 && (
                      <div className="bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/30 flex items-center justify-between text-xs">
                        <span className="text-indigo-300 font-bold text-[11px]">
                          💰 Montante Líquido a Receber (PVP - Retenção - TPA):
                        </span>
                        <span className="text-indigo-200 font-bold font-mono">
                          {formatMoney(calc.netReceived)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Net Profit Banner */}
                  <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-emerald-400 block">
                        LUCRO LÍQUIDO REAL
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Livre de impostos, retenções e encargos
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

      {/* Google AdSense Monetization Banner (Only displayed in Free/Guest Mode, Non-Intrusive) */}
      {(!user || user.queriesRemaining <= 3) && (
        <div className="bg-[#0F172A] border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            <span>PUBLICIDADE PATROCINADA</span>
            <span>GOOGLE ADSENSE PLACEHOLDER (MODO GRATUITO)</span>
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
