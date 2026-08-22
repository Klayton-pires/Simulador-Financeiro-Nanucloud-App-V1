import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, Calculator, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import { UserSafe } from '../types';
import { COUNTRIES_DB } from '../data/countries';

interface BasicPhoneMobileModeProps {
  user: UserSafe | null;
  onCalculationDone?: (newCredits: number) => void;
}

export const BasicPhoneMobileMode: React.FC<BasicPhoneMobileModeProps> = ({ user, onCalculationDone }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('AO');
  const [costInput, setCostInput] = useState<string>('1000');
  const [marginInput, setMarginInput] = useState<string>('20');
  const [vatRate, setVatRate] = useState<number>(14);
  const [useTpa, setUseTpa] = useState<boolean>(true);
  const [customFieldLabel, setCustomFieldLabel] = useState<string>('PVP Final Recomendado');

  const country = COUNTRIES_DB[selectedCountry] || COUNTRIES_DB.AO;

  // Real-time quick calculation
  const cost = parseFloat(costInput) || 0;
  const margin = parseFloat(marginInput) || 0;
  const vat = vatRate || 0;
  const tpaPercent = useTpa ? (country.tpa || 1.0) : 0;

  // Formula:
  // Gross Sale Price before VAT = cost / (1 - (margin/100))
  // VAT amount = Gross Sale Price * (vat / 100)
  // Final PVP = Gross Sale Price + VAT amount
  // TPA fee = Final PVP * (tpaPercent / 100)
  // Net Profit = (Final PVP - VAT amount - TPA fee) - cost

  const grossSale = margin < 100 ? (cost / (1 - (margin / 100))) : cost;
  const vatAmount = grossSale * (vat / 100);
  const pvpFinal = grossSale + vatAmount;
  const tpaAmount = pvpFinal * (tpaPercent / 100);
  const netProfit = (pvpFinal - vatAmount - tpaAmount) - cost;

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val) + ' ' + country.curr;
  };

  const handleKeyPadNumber = (num: string) => {
    setCostInput((prev) => (prev === '0' ? num : prev + num));
  };

  const handleKeyPadClear = () => {
    setCostInput('');
  };

  return (
    <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      
      {/* Header Compacto */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              MODO CELULAR BÁSICO & POS
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-sans">
                Ultra-Rápido
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Ideal para teclados físicos, touch rápido e ecrãs pequenos</p>
          </div>
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => {
            const code = e.target.value;
            setSelectedCountry(code);
            const c = COUNTRIES_DB[code] || COUNTRIES_DB.AO;
            setVatRate(c.vatOptions[0]?.r || 14);
          }}
          className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 py-1 px-2 focus:outline-none focus:border-indigo-500"
        >
          {Object.keys(COUNTRIES_DB).map((code) => (
            <option key={code} value={code}>
              {code} - {COUNTRIES_DB[code].name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Single Answer Display (O Campo Único de Resposta Personalizado Solicitado) */}
      <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/50 rounded-2xl p-5 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Resposta Direta
        </div>

        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
          {customFieldLabel}
        </span>

        <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight my-2">
          {formatMoney(pvpFinal)}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
          <div className="text-left">
            <span className="text-slate-500 block">IVA ({vat}%):</span>
            <span className="text-slate-300 font-bold">{formatMoney(vatAmount)}</span>
          </div>
          <div className="text-center">
            <span className="text-slate-500 block">Multicaixa TPA:</span>
            <span className="text-slate-300 font-bold">{formatMoney(tpaAmount)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Lucro Líquido:</span>
            <span className="text-emerald-400 font-bold">+{formatMoney(netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Quick Input Controls */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 space-y-4">
        
        {/* Preço de Custo */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex justify-between">
            <span>PREÇO DE CUSTO ({country.curr})</span>
            <span className="text-[10px] text-indigo-400">Insira ou use o teclado abaixo</span>
          </label>
          <input
            type="number"
            value={costInput}
            onChange={(e) => setCostInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        {/* Quick Margin Selector Buttons */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
            MARGEM DE LUCRO DESEJADA
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 30, 40].map((m) => (
              <button
                key={m}
                onClick={() => setMarginInput(String(m))}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  marginInput === String(m)
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {m}%
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tax & TPA Toggle */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">REGIME DE IVA</label>
            <select
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-2 focus:outline-none focus:border-indigo-500"
            >
              {country.vatOptions.map((opt, i) => (
                <option key={i} value={opt.r}>
                  {opt.n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">TAXA TPA ({country.tpa}%)</label>
            <button
              onClick={() => setUseTpa(!useTpa)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                useTpa
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {useTpa ? <Check className="w-3.5 h-3.5" /> : null}
              {useTpa ? 'Ativo (1%)' : 'Sem TPA'}
            </button>
          </div>
        </div>

        {/* Virtual On-Screen Numpad for Touch / Analog simulation */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">TECLADO NUMÉRICO RÁPIDO</span>
            <button
              onClick={handleKeyPadClear}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 font-mono">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '000'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPadNumber(digit)}
                className="h-11 bg-slate-900 hover:bg-slate-800 active:bg-indigo-600 text-slate-100 text-base font-bold rounded-xl border border-slate-700/80 active:scale-95 transition-all flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Lembrete de Apoio */}
      <div className="text-center text-[10px] text-slate-500 font-mono py-1">
        NANUCLOUD Mobile Fast Engine • Compatível com qualquer tela e teclado
      </div>

    </div>
  );
};
