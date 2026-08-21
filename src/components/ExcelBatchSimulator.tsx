import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { UserSafe } from '../types';
import { COUNTRIES_DB } from '../data/countries';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { FileSpreadsheet, Upload, Download, CheckCircle, Lock, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface ExcelBatchSimulatorProps {
  user: UserSafe | null;
  currentLang: SupportedLang;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
  onCalculationDone: (newCredits: number) => void;
}

export const ExcelBatchSimulator: React.FC<ExcelBatchSimulatorProps> = ({
  user,
  currentLang,
  onOpenPlans,
  onOpenAuth,
  onCalculationDone
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  const isUnlocked = user ? (user.isBatchUnlocked || user.role !== 'user') : false;

  const [countryCode, setCountryCode] = useState<string>('AO');
  const [vatRate, setVatRate] = useState<number>(14);
  const [marginPct, setMarginPct] = useState<string>('');
  const [listName, setListName] = useState<string>('');

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const country = COUNTRIES_DB[countryCode] || COUNTRIES_DB['AO'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!isUnlocked) {
      onOpenPlans();
      return;
    }

    const margin = parseFloat(marginPct);
    if (isNaN(margin) || margin < 0) {
      setErrorMessage('Por favor, defina a Margem Global (%) antes de carregar o ficheiro.');
      e.target.value = '';
      return;
    }

    setUploadedFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        if (!rawJson || rawJson.length === 0) {
          setErrorMessage('O ficheiro Excel carregado está vazio.');
          setIsProcessing(false);
          return;
        }

        // Send to backend batch endpoint
        const res = await fetch('/api/simulator/calculate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: rawJson,
            countryCode,
            vatRate,
            marginPct: margin,
            listName: listName || file.name.replace(/\.[^/.]+$/, '')
          })
        });

        const resData = await res.json();

        if (!res.ok) {
          if (res.status === 403 || res.status === 402) {
            setErrorMessage(resData.error);
            onOpenPlans();
          } else {
            setErrorMessage(resData.error || 'Erro ao processar ficheiro em lote.');
          }
          setIsProcessing(false);
          return;
        }

        setProcessedData(resData.processedItems);
        setSuccessMessage(`${resData.processedItems.length} produtos processados com sucesso!`);
        onCalculationDone(resData.queriesRemaining);
      } catch (err) {
        console.error(err);
        setErrorMessage('Erro ao ler e processar o ficheiro Excel.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    if (!processedData || processedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Preços e Margens Calculados');
    XLSX.writeFile(workbook, `Simulacao_Lote_${countryCode}_${Date.now()}.xlsx`);
  };

  if (!isUnlocked) {
    return (
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl md:text-2xl font-black text-slate-100 mb-2">
          {t.lockedModule}: {t.excelTitle}
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {t.lockedModuleDesc} O processamento automático de planilhas e exportação em massa está incluído no <strong>Plano Platina (5.000 Kz)</strong>, <strong>Diamante (10.000 Kz)</strong> ou <strong>Plano Personalizado</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Processamento de centenas de produtos em segundos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Aplicação global de IVA e Margem de Lucro</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cálculo de Lucro Líquido e IVA a Pagar ao Fisco</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Download direto em formato Excel (.xlsx) pronto</span>
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
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-100">{t.excelTitle}</h2>
              <p className="text-xs text-slate-400">Processamento em lote de planilhas e exportação automatizada</p>
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

        {/* Global Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblExCountry}</label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                const c = COUNTRIES_DB[e.target.value];
                if (c) setVatRate(c.vatOptions[0]?.r ?? 14);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-emerald-500 outline-none"
            >
              {Object.keys(COUNTRIES_DB).map((code) => (
                <option key={code} value={code}>
                  {COUNTRIES_DB[code].name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblExVat}</label>
            <select
              value={vatRate}
              onChange={(e) => setVatRate(parseFloat(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-emerald-500 outline-none"
            >
              {country.vatOptions.map((v, idx) => (
                <option key={idx} value={v.r}>
                  {v.n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t.lblExMargin}</label>
            <input
              type="number"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              placeholder="25"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Identificador / Título da Lista:</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Tabela Fornecedor Março"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Dropzone Upload */}
        <label
          htmlFor="excel-file-input"
          className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/60 hover:bg-emerald-950/10 rounded-3xl p-8 text-center cursor-pointer block transition-all group shadow-inner"
        >
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-slate-100 font-extrabold text-base mb-1">
            {uploadedFileName ? uploadedFileName : t.btnBrowse}
          </h3>
          <p className="text-xs text-slate-400">
            {isProcessing
              ? 'A processar planilha e calcular fórmulas...'
              : 'Clique ou arraste um ficheiro .xlsx com os custos dos seus produtos'}
          </p>
        </label>
      </div>

      {/* Preview Table & Export Button */}
      {processedData && processedData.length > 0 && (
        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">
                Pré-visualização do Lote ({processedData.length} Produtos)
              </h3>
              <p className="text-xs text-slate-400">
                Margem aplicada: {marginPct}% | IVA: {vatRate}% ({country.agency})
              </p>
            </div>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.btnExport}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  {Object.keys(processedData[0]).slice(0, 8).map((k, i) => (
                    <th key={i} className="p-3 whitespace-nowrap">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {processedData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    {Object.keys(row).slice(0, 8).map((k, j) => (
                      <td key={j} className="p-3 whitespace-nowrap">
                        {row[k]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {processedData.length > 15 && (
            <p className="text-center text-xs text-slate-400 pt-2">
              A mostrar os primeiros 15 de {processedData.length} itens. Descarregue o ficheiro Excel (.xlsx) completo para ver todos.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
