import React, { useState } from 'react';
import { UserSafe } from '../types';
import { COUNTRIES_DB } from '../data/countries';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { Ship, Lock, Sparkles, Anchor, DollarSign, CheckCircle, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';

interface ImportSimulatorProps {
  user: UserSafe | null;
  currentLang: SupportedLang;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
  onCalculationDone: (newCredits: number) => void;
}

export const ImportSimulator: React.FC<ImportSimulatorProps> = ({
  user,
  currentLang,
  onOpenPlans,
  onOpenAuth,
  onCalculationDone
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  const isUnlocked = user ? (user.isImportUnlocked || user.role !== 'user') : false;

  const [originCountry, setOriginCountry] = useState<string>('CN');
  const [destCountry, setDestCountry] = useState<string>('AO');
  const [vatRate, setVatRate] = useState<number>(14);

  const [fob, setFob] = useState<string>('');
  const [freight, setFreight] = useState<string>('');
  const [insurance, setInsurance] = useState<string>('');
  const [customsRate, setCustomsRate] = useState<string>('');
  const [iecRate, setIecRate] = useState<string>('');
  const [otherFees, setOtherFees] = useState<string>('');
  const [marginPct, setMarginPct] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const destFiscal = COUNTRIES_DB[destCountry] || COUNTRIES_DB['AO'];

  const formatMoney = (val: number) => {
    return (
      new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val) + ` ${destFiscal.curr}`
    );
  };

  const handleCalculate = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cFob = parseFloat(fob) || 0;
    if (cFob <= 0) {
      setErrorMessage('O valor FOB (Mercadoria) deve ser superior a zero.');
      return;
    }

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!isUnlocked) {
      onOpenPlans();
      return;
    }

    if (user.queriesRemaining <= 0) {
      setErrorMessage('As suas consultas esgotaram. Por favor recarregue os seus créditos.');
      onOpenPlans();
      return;
    }

    setIsCalculating(true);

    try {
      let remaining = user.queriesRemaining;
      let calcData = null;

      try {
        const res = await fetch('/api/simulator/calculate-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originCountry,
            destCountry,
            fob: cFob,
            freight: parseFloat(freight) || 0,
            insurance: parseFloat(insurance) || 0,
            customsRate: parseFloat(customsRate) || 0,
            iecRate: parseFloat(iecRate) || 0,
            otherFees: parseFloat(otherFees) || 0,
            vatRate,
            marginPct: parseFloat(marginPct) || 0,
            productName,
            notes
          })
        });

        if (res.ok) {
          const data = await res.json();
          calcData = data.calculation;
          remaining = data.queriesRemaining;
        } else if (res.status === 403 || res.status === 402) {
          const data = await res.json();
          setErrorMessage(data.error);
          onOpenPlans();
          setIsCalculating(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Modo offline/estático ativado para cálculo de importação...');
      }

      if (!calcData) {
        const cFreight = parseFloat(freight) || 0;
        const cIns = parseFloat(insurance) || 0;
        const cCustRate = parseFloat(customsRate) || 0;
        const cIecRate = parseFloat(iecRate) || 0;
        const cOther = parseFloat(otherFees) || 0;
        const cMargin = parseFloat(marginPct) || 0;

        const cif = cFob + cFreight + cIns;
        const customsDuty = cif * (cCustRate / 100);
        const iec = (cif + customsDuty) * (cIecRate / 100);
        const statFee = cif * 0.005;
        const vatBase = cif + customsDuty + iec + statFee;
        const vat = vatBase * (vatRate / 100);
        const totalCustoms = customsDuty + iec + statFee + vat + cOther;
        const landedCost = cif + totalCustoms;
        const recommendedPVP = landedCost * (1 + cMargin / 100);
        const estimatedProfit = recommendedPVP - landedCost;

        calcData = {
          fob: cFob,
          freight: cFreight,
          insurance: cIns,
          cif,
          customsDuty,
          iec,
          statFee,
          vat,
          otherFees: cOther,
          totalCustomsDuties: totalCustoms,
          landedCost,
          marginPct: cMargin,
          recommendedPVP,
          estimatedProfit,
          currency: destFiscal.curr
        };
        remaining = Math.max(0, user.queriesRemaining - 1);
      }

      setResults(calcData);
      setSuccessMessage('Cálculo de importação e despacho aduaneiro concluído com sucesso!');
      onCalculationDone(remaining);
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao calcular importação.');
    } finally {
      setIsCalculating(false);
    }
  };

  // If locked, render lock banner
  if (!isUnlocked) {
    return (
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl md:text-2xl font-black text-slate-100 mb-2">
          {t.lockedModule}: {t.importTitle}
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {t.lockedModuleDesc} O cálculo de CIF, Direitos Aduaneiros, IEC e Custo Nacionalizado está disponível a partir do <strong>Plano Ouro (3.000 Kz)</strong>, <strong>Platina</strong>, <strong>Diamante</strong> ou <strong>Plano Personalizado</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cálculo CIF (FOB + Frete + Seguro)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tarifas Aduaneiras & Taxas Portuárias</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Imposto Especial de Consumo (IEC)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Formação do Preço Nacionalizado & Lucro</span>
          </div>
        </div>

        <button
          onClick={onOpenPlans}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.btnUpgrade}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Import Form Card */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-100">{t.importTitle}</h2>
              <p className="text-xs text-slate-400">Desembaraço aduaneiro, CIF, Direitos e Custo Nacionalizado</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Módulo Ativo
          </span>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Origin / Dest / VAT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblOrigin}</label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none"
            >
              {Object.keys(COUNTRIES_DB).map((code) => (
                <option key={code} value={code}>
                  {COUNTRIES_DB[code].name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblDest}</label>
            <select
              value={destCountry}
              onChange={(e) => {
                setDestCountry(e.target.value);
                const c = COUNTRIES_DB[e.target.value];
                if (c) setVatRate(c.vatOptions[0]?.r ?? 14);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none"
            >
              {Object.keys(COUNTRIES_DB).map((code) => (
                <option key={code} value={code}>
                  {COUNTRIES_DB[code].name} ({COUNTRIES_DB[code].curr})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblImpVat}</label>
            <select
              value={vatRate}
              onChange={(e) => setVatRate(parseFloat(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none"
            >
              {destFiscal.vatOptions.map((v, idx) => (
                <option key={idx} value={v.r}>
                  {v.n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CIF Group: FOB, Freight, Insurance */}
        <div className="bg-sky-950/20 border border-sky-500/20 rounded-2xl p-4 md:p-5 mb-6">
          <p className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5" /> 1. Valores Internacionais de Transporte (CIF)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblFob}</label>
              <input
                type="number"
                value={fob}
                onChange={(e) => setFob(e.target.value)}
                placeholder="50000"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:border-sky-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblFreight}</label>
              <input
                type="number"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
                placeholder="4500"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:border-sky-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblInsurance}</label>
              <input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="800"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Customs Taxes Group */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 md:p-5 mb-6">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
            2. Direitos e Taxas Aduaneiras na Entrada ({destFiscal.agency})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblCustoms}</label>
              <input
                type="number"
                value={customsRate}
                onChange={(e) => setCustomsRate(e.target.value)}
                placeholder="10"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblIec}</label>
              <input
                type="number"
                value={iecRate}
                onChange={(e) => setIecRate(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">{t.lblFees}</label>
              <input
                type="number"
                value={otherFees}
                onChange={(e) => setOtherFees(e.target.value)}
                placeholder="1200"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Margin & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblImpMargin}</label>
            <input
              type="number"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              placeholder="30"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.lblProductName}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Contentor Equipamento Médico"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.lblNotes}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Despacho marítimo via Porto de Luanda"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-sky-950/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Ship className="w-4 h-4" />
          <span>{isCalculating ? 'A Calcular Despacho...' : t.btnCalcImp}</span>
        </button>
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Summary Card */}
          <div className="bg-slate-850 border border-sky-500/40 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-100 mb-4 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-sky-400" />
              Resumo do Custo Base Nacionalizado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">Valor CIF (Total Internacional)</p>
                <p className="text-base font-extrabold text-slate-100 mt-1">{formatMoney(results.cif)}</p>
                <p className="text-[10px] text-slate-500">FOB: {formatMoney(results.fob)}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">Total Direitos & Taxas</p>
                <p className="text-base font-extrabold text-rose-400 mt-1">
                  + {formatMoney(results.customsDuty + results.iecTax + results.otherFees)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Tarifa: {results.customsRate}% | IEC: {results.iecRate}%
                </p>
              </div>

              <div className="bg-sky-950/40 p-3.5 rounded-2xl border border-sky-500/30">
                <p className="text-xs text-sky-300 font-bold">Custo Base Nacionalizado (S/ IVA)</p>
                <p className="text-lg font-black text-sky-400 mt-1">
                  {formatMoney(results.nationalizedCostNet)}
                </p>
                <p className="text-[10px] text-sky-400/80">Base para aplicação de margem</p>
              </div>
            </div>
          </div>

          {/* Sales Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
                <h4 className="font-extrabold text-slate-100 text-base">Venda Nacionalizada ({results.marginPct}%)</h4>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-1 rounded-full">
                  Margem: {results.marginPct}%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Custo Nacionalizado (SEM IVA)</span>
                    <strong className="text-slate-100">{formatMoney(results.nationalizedCostNet)}</strong>
                  </div>
                  <div className="flex justify-between text-sky-400 font-semibold">
                    <span>(+) Lucro Bruto ({results.marginPct}%)</span>
                    <strong>+ {formatMoney(results.profit)}</strong>
                  </div>
                  <div className="flex justify-between text-sky-400 font-semibold">
                    <span>(+) IVA Cobrado Venda ({vatRate}%)</span>
                    <strong>+ {formatMoney(results.vatSale)}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700 font-extrabold text-slate-100 text-sm">
                    <span>(=) PREÇO FINAL (PVP)</span>
                    <span className="text-emerald-400 font-black">{formatMoney(results.pvpFinal)}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-rose-400">
                    <span>(-) IVA a Pagar ao Fisco ({destFiscal.agency})</span>
                    <strong>- {formatMoney(results.netVatToPay)}</strong>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>(-) Imposto Industrial ({destFiscal.ii}%)</span>
                    <strong>- {formatMoney(results.incomeTax)}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block">
                    LUCRO LÍQUIDO FINAL
                  </span>
                  <span className="text-[11px] text-slate-400">Após desembaraço e impostos</span>
                </div>
                <strong className="text-xl font-black text-emerald-400">
                  {formatMoney(results.netProfit)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
