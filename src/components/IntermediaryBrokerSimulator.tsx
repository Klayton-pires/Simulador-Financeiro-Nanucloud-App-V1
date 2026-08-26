import React, { useState, useEffect } from 'react';
import { UserSafe } from '../types';
import { COUNTRIES_DB, getAvailableCountryList } from '../data/countries';
import { SupportedLang } from '../i18n/translations';
import {
  Users,
  Building2,
  UserCheck,
  Calculator,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Info,
  Scale,
  ShieldAlert,
  Percent,
  CheckCircle2,
  DollarSign,
  Receipt,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IntermediaryBrokerSimulatorProps {
  user: UserSafe | null;
  currentLang: SupportedLang;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
  onCalculationDone: (newCredits: number) => void;
}

export const IntermediaryBrokerSimulator: React.FC<IntermediaryBrokerSimulatorProps> = ({
  user,
  currentLang,
  onOpenPlans,
  onOpenAuth,
  onCalculationDone
}) => {
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const availableCountries = getAvailableCountryList(isSuperAdmin);

  const [countryCode, setCountryCode] = useState<string>('AO');
  const [intermediaryType, setIntermediaryType] = useState<'company' | 'individual'>('company');
  
  // Deal values
  const [dealTitle, setDealTitle] = useState<string>('');
  const [productsTotal, setProductsTotal] = useState<string>('50000000');
  const [servicesTotal, setServicesTotal] = useState<string>('15000000');
  
  // Intermediary details
  const [intermediaryName, setIntermediaryName] = useState<string>('');
  const [intermediaryNif, setIntermediaryNif] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerNif, setOwnerNif] = useState<string>('');

  // Commission Scope & Mode
  const [commissionScope, setCommissionScope] = useState<'products_only' | 'services_only' | 'total_deal' | 'fixed_amount'>('total_deal');
  const [commissionPct, setCommissionPct] = useState<string>('7.5');
  const [fixedCommissionAmount, setFixedCommissionAmount] = useState<string>('');
  
  // Fiscal parameters
  const [includeVatOnCommission, setIncludeVatOnCommission] = useState<boolean>(false);
  const [commissionVatRate, setCommissionVatRate] = useState<number>(14);
  const [retentionRate, setRetentionRate] = useState<string>('6.5');
  const [tpaRate, setTpaRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const country = COUNTRIES_DB[countryCode] || COUNTRIES_DB['AO'];

  // Update default legal recommendations when country or intermediary type changes
  useEffect(() => {
    if (countryCode === 'AO') {
      setCommissionVatRate(14);
      if (intermediaryType === 'company') {
        setRetentionRate('6.5'); // Lei 19/14 e Decreto Legislativo Presidencial 2/14
      } else {
        setRetentionRate('6.5'); // Particular / Categoria B
      }
    } else if (countryCode === 'PT') {
      setCommissionVatRate(23);
      if (intermediaryType === 'company') {
        setRetentionRate('0'); // IRC dispensa geral entre empresas
      } else {
        setRetentionRate('11.5'); // CIRS Artigo 101
      }
    } else if (countryCode === 'BR') {
      setCommissionVatRate(0);
      setRetentionRate(intermediaryType === 'company' ? '1.5' : '15.0');
    } else {
      setCommissionVatRate(country?.vatOptions[0]?.r || 0);
      setRetentionRate('5.0');
    }
  }, [countryCode, intermediaryType]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const formatMoney = (val: number) => {
    return (
      new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val) + ` ${country.curr}`
    );
  };

  const calculateIntermediation = () => {
    const prodVal = parseFloat(productsTotal) || 0;
    const servVal = parseFloat(servicesTotal) || 0;
    const totalDealVal = prodVal + servVal;
    const commPct = parseFloat(commissionPct) || 0;
    const fixCommVal = parseFloat(fixedCommissionAmount) || 0;
    const retPct = parseFloat(retentionRate) || 0;
    const vatRate = includeVatOnCommission ? commissionVatRate : 0;
    const tpa = tpaRate || 0;

    // 1. Determine the commission calculation base
    let commissionBaseTarget = 0;
    let grossCommission = 0;

    if (commissionScope === 'fixed_amount') {
      grossCommission = fixCommVal;
      commissionBaseTarget = totalDealVal;
    } else if (commissionScope === 'products_only') {
      commissionBaseTarget = prodVal;
      grossCommission = prodVal * (commPct / 100);
    } else if (commissionScope === 'services_only') {
      commissionBaseTarget = servVal;
      grossCommission = servVal * (commPct / 100);
    } else {
      // total_deal
      commissionBaseTarget = totalDealVal;
      grossCommission = totalDealVal * (commPct / 100);
    }

    // 2. VAT on commission (if invoice contains VAT)
    const commissionVatAmount = grossCommission * (vatRate / 100);
    const invoiceTotalFromIntermediary = grossCommission + commissionVatAmount;

    // 3. Withholding Tax (Retenção na Fonte por Lei)
    // The withholding tax is calculated on the gross taxable base (grossCommission)
    const withholdingTaxAmount = grossCommission * (retPct / 100);

    // 4. Banking / Transfer / POS fee (TPA) if applicable
    const tpaCost = (grossCommission + commissionVatAmount) * (tpa / 100);

    // 5. Net amount that the owner must transfer to the intermediary
    // Owner pays: Invoice - Withholding Tax - TPA
    const netPayableToIntermediary = grossCommission + commissionVatAmount - withholdingTaxAmount - tpaCost;

    // 6. Tax that the owner MUST deliver to the State / AGT (DAR)
    const taxToDeliverToState = withholdingTaxAmount;

    // 7. Total cash outlay by the owner for intermediation
    const totalOwnerIntermediationCost = netPayableToIntermediary + taxToDeliverToState + tpaCost;

    // 8. Remaining balance for the business owner
    const ownerRemainingDealBalance = totalDealVal - totalOwnerIntermediationCost;

    return {
      dealTitle: dealTitle || 'Intermediação Comercial',
      productsTotal: prodVal,
      servicesTotal: servVal,
      totalDealVal,
      commissionScope,
      commissionScopeLabel:
        commissionScope === 'products_only'
          ? 'Exclusivamente sobre os Produtos'
          : commissionScope === 'services_only'
          ? 'Exclusivamente sobre os Serviços'
          : commissionScope === 'total_deal'
          ? 'Sobre o Negócio Global (Produtos + Serviços)'
          : 'Honorário / Comissão Fixa Acordada',
      commissionPct: commPct,
      commissionBaseTarget,
      grossCommission,
      includeVatOnCommission,
      commissionVatRate: vatRate,
      commissionVatAmount,
      invoiceTotalFromIntermediary,
      retentionRate: retPct,
      withholdingTaxAmount,
      tpaRate: tpa,
      tpaCost,
      netPayableToIntermediary,
      taxToDeliverToState,
      totalOwnerIntermediationCost,
      ownerRemainingDealBalance,
      intermediaryType,
      intermediaryName: intermediaryName || (intermediaryType === 'company' ? 'Empresa Intermediária Lda' : 'Consultor Intermediário'),
      intermediaryNif: intermediaryNif || '999999999',
      ownerName: ownerName || 'Proprietário / Vendedor Principal',
      ownerNif: ownerNif || '555555555',
      date: new Date().toLocaleDateString('pt-PT')
    };
  };

  const handleSimulate = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const errors: Record<string, string> = {};
    const prodVal = parseFloat(productsTotal) || 0;
    const servVal = parseFloat(servicesTotal) || 0;
    const totalDeal = prodVal + servVal;
    const commPct = parseFloat(commissionPct) || 0;
    const fixVal = parseFloat(fixedCommissionAmount) || 0;

    if (totalDeal <= 0) {
      errors.deal = 'Indique o valor de Produtos e/ou Serviços do negócio a intermediar.';
    }

    if (commissionScope === 'fixed_amount') {
      if (fixVal <= 0) {
        errors.fixedCommissionAmount = 'Introduza o valor fixo da comissão do intermediário.';
      }
    } else {
      if (commPct <= 0 || commPct > 100) {
        errors.commissionPct = 'Indique uma percentagem de comissão válida entre 0.1% e 100%.';
      }
    }

    if (commissionScope === 'products_only' && prodVal <= 0) {
      errors.productsTotal = 'Para calcular comissão sobre produtos, o valor dos produtos deve ser superior a zero.';
    }

    if (commissionScope === 'services_only' && servVal <= 0) {
      errors.servicesTotal = 'Para calcular comissão sobre serviços, o valor dos serviços deve ser superior a zero.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Por favor, verifique os campos assinalados com erro.');
      return;
    }

    setFieldErrors({});
    setIsCalculating(true);

    setTimeout(() => {
      const calc = calculateIntermediation();
      setResults(calc);
      setIsCalculating(false);
      setSuccessMessage('Simulação de intermediação calculada com sucesso com base nas normas fiscais vigentes!');

      if (user && user.queriesRemaining > 0) {
        onCalculationDone(Math.max(0, user.queriesRemaining - 1));
      }
    }, 200);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!results) return;

    const wb = XLSX.utils.book_new();

    const data = [
      ['SIMULAÇÃO DE INTERMEDIAÇÃO COMERCIAL & FISCALIDADE DE COMISSÕES'],
      ['Plataforma NANUCLOUD • Módulo Oficial de Intermediários'],
      ['Data:', results.date],
      ['País / Jurisdição:', country.name],
      [''],
      ['1. DADOS DO NEGÓCIO & INTERVENIENTES'],
      ['Descrição do Negócio:', results.dealTitle],
      ['Proprietário / Vendedor Principal:', `${results.ownerName} (NIF: ${results.ownerNif})`],
      ['Intermediário / Corretor:', `${results.intermediaryName} (NIF: ${results.intermediaryNif})`],
      ['Tipo de Intermediário:', results.intermediaryType === 'company' ? 'Empresa (Pessoa Coletiva)' : 'Particular / Consultor Independente'],
      [''],
      ['2. VALOR GLOBAL DO NEGÓCIO INTERMEDIADO'],
      ['Valor de Produtos / Mercadorias:', results.productsTotal, country.curr],
      ['Valor de Prestação de Serviços:', results.servicesTotal, country.curr],
      ['Valor Total Global da Transação:', results.totalDealVal, country.curr],
      [''],
      ['3. ESTRATÉGIA DE COMISSÃO'],
      ['Incidência da Comissão:', results.commissionScopeLabel],
      ['Base de Incidência de Cálculo:', results.commissionBaseTarget, country.curr],
      ['Percentagem / Taxa de Comissão:', `${results.commissionPct}%`],
      ['Comissão Bruta Acordada:', results.grossCommission, country.curr],
      ['IVA sobre a Comissão:', results.commissionVatAmount, country.curr],
      ['Total da Fatura do Intermediário:', results.invoiceTotalFromIntermediary, country.curr],
      [''],
      ['4. OBRIGAÇÕES LEGAIS & RETENÇÃO NA FONTE (AGT / FISCO)'],
      ['Taxa de Retenção na Fonte:', `${results.retentionRate}%`],
      ['Valor de Retenção Retido pelo Proprietário:', results.withholdingTaxAmount, country.curr],
      ['Entidade Responsável pela Retenção:', 'Proprietário (desconta e entrega à AGT via DAR)'],
      ['Taxa Bancária / TPA:', results.tpaCost, country.curr],
      [''],
      ['5. APURAMENTO FINAL DE DESEMBOLSOS'],
      ['VALOR LÍQUIDO A PAGAR AO INTERMEDIÁRIO (BANCÁRIO):', results.netPayableToIntermediary, country.curr],
      ['IMPOSTO A ENTREGAR AO ESTADO PELO PROPRIETÁRIO:', results.taxToDeliverToState, country.curr],
      ['CUSTO TOTAL DE INTERMEDIAÇÃO PARA O PROPRIETÁRIO:', results.totalOwnerIntermediationCost, country.curr],
      ['VALOR LÍQUIDO REMANESCENTE PARA O PROPRIETÁRIO:', results.ownerRemainingDealBalance, country.curr],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Intermediacao_Fiscal');
    XLSX.writeFile(wb, `NANUCLOUD_Intermediacao_${results.dealTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!results) return;

    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('NANUCLOUD • SIMULADOR DE INTERMEDIAÇÃO & COMISSÕES', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório Fiscal & Financeiro de Corretagem • ${results.date}`, 14, 21);

    // Business Summary Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Informação do Negócio e Intervenientes', 14, 34);

    autoTable(doc, {
      startY: 37,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      head: [['Campo', 'Discriminação']],
      body: [
        ['Negócio Intermediado', results.dealTitle],
        ['Proprietário / Vendedor Principal', `${results.ownerName} (NIF: ${results.ownerNif})`],
        ['Intermediário / Corretor', `${results.intermediaryName} (NIF: ${results.intermediaryNif}) - ${results.intermediaryType === 'company' ? 'Empresa' : 'Particular'}`],
        ['Valor de Produtos / Mercadorias', formatMoney(results.productsTotal)],
        ['Valor de Serviços', formatMoney(results.servicesTotal)],
        ['Valor Global da Operação', formatMoney(results.totalDealVal)],
        ['Incidência da Comissão', results.commissionScopeLabel],
      ]
    });

    const finalY1 = (doc as any).lastAutoTable.finalY || 100;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. Liquidação de Comissão, Impostos e Retenções na Fonte', 14, finalY1 + 10);

    autoTable(doc, {
      startY: finalY1 + 13,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      head: [['Rubrica de Cálculo', 'Percentual', 'Montante', 'Enquadramento / Destinatário']],
      body: [
        ['Comissão Bruta Acordada', `${results.commissionPct}%`, formatMoney(results.grossCommission), 'Base de incidência do intermediário'],
        ['IVA s/ Comissão (se aplicável)', `${results.commissionVatRate}%`, formatMoney(results.commissionVatAmount), 'Liquidado na fatura do intermediário'],
        ['Retenção na Fonte por Lei', `${results.retentionRate}%`, `- ${formatMoney(results.withholdingTaxAmount)}`, 'Descontado pelo Proprietário e entregue à AGT'],
        ['Taxas Bancárias / TPA', `${results.tpaRate}%`, `- ${formatMoney(results.tpaCost)}`, 'Encargo de processamento'],
        ['LÍQUIDO A PAGAR AO INTERMEDIÁRIO', '---', formatMoney(results.netPayableToIntermediary), 'Transferência Bancária / Pagamento Líquido'],
        ['IMPOSTO A ENTREGAR AO ESTADO (AGT/DAR)', '---', formatMoney(results.taxToDeliverToState), 'Obrigação tributária do Proprietário'],
        ['VALOR REMANESCENTE PROPRIETÁRIO', '---', formatMoney(results.ownerRemainingDealBalance), 'Saldo Líquido final da venda'],
      ]
    });

    const finalY2 = (doc as any).lastAutoTable.finalY || 180;

    // Legal Warning / Decree Citation Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, finalY2 + 8, 182, 38, 3, 3, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AVISO LEGAL & ENQUADRAMENTO TRIBUTÁRIO:', 18, finalY2 + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const legalText =
      countryCode === 'AO'
        ? 'Em Angola, nos termos do Código do Imposto Industrial (Lei n.º 19/14 e Lei n.º 26/20) e Decreto Legislativo Presidencial n.º 2/14, os pagamentos de comissões e intermediação estão sujeitos a retenção na fonte (taxa de referência 6.5%). O proprietário/pagador é o substituto tributário responsável por reter o montante e entregá-lo à AGT através do Documento de Arrecadação de Receitas (DAR) até ao final do mês subsequente.'
        : 'Nos termos da legislação fiscal aplicável, a retenção na fonte sobre comissões e intermediação de negócios deve ser retida pela entidade pagadora e entregue à Autoridade Tributária nos prazos regulamentares.';
    
    doc.text(doc.splitTextToSize(legalText, 174), 18, finalY2 + 21);

    doc.save(`NANUCLOUD_Intermediacao_${results.dealTitle.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-tight">
                  Módulo de Intermediários & Corretagem de Negócios
                </h2>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  B2B & B2C
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulação financeira e fiscal de comissões, incidência sobre produtos/serviços, apuramento da retenção na fonte legal e obrigações do proprietário perante a AGT/Fisco.
              </p>
            </div>
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
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section 1: Intermediary Profile (Empresa vs Particular) */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              1. Perfil & Função do Intermediário
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Selecione o enquadramento jurídico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIntermediaryType('company');
                clearFieldError('intermediaryType');
              }}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                intermediaryType === 'company'
                  ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/30'
                  : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${intermediaryType === 'company' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-mono uppercase text-slate-100">Empresa / Pessoa Coletiva</strong>
                  {intermediaryType === 'company' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Sociedade comercial, agência de mediação ou consultoria constituída com NIF empresarial e emissão de fatura/recibo formal.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIntermediaryType('individual');
                clearFieldError('intermediaryType');
              }}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                intermediaryType === 'individual'
                  ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/30'
                  : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${intermediaryType === 'individual' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-mono uppercase text-slate-100">Particular / Pessoa Singular</strong>
                  {intermediaryType === 'individual' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Consultor independente, corretor pessoa singular ou intermediário ocasional atuando a título individual.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Country & Business Deal Values */}
        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/80 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              2. Valores do Negócio Intermediado
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400">{country.curr}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Country Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                País / Jurisdição Fiscal
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
              >
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.curr})
                  </option>
                ))}
              </select>
            </div>

            {/* Products Total */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Valor de Produtos (Bens)</span>
                <span className="text-[10px] text-slate-500">Mercadoria</span>
              </label>
              <input
                type="number"
                value={productsTotal}
                onChange={(e) => {
                  setProductsTotal(e.target.value);
                  clearFieldError('deal');
                  clearFieldError('productsTotal');
                }}
                placeholder="Ex: 50000000"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition font-bold"
              />
            </div>

            {/* Services Total */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Valor de Serviços</span>
                <span className="text-[10px] text-slate-500">Mão de Obra</span>
              </label>
              <input
                type="number"
                value={servicesTotal}
                onChange={(e) => {
                  setServicesTotal(e.target.value);
                  clearFieldError('deal');
                  clearFieldError('servicesTotal');
                }}
                placeholder="Ex: 15000000"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition font-bold"
              />
            </div>
          </div>

          {/* Total Deal Preview Pill */}
          <div className="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">
              Valor Total do Negócio a Intermediar (Produtos + Serviços):
            </span>
            <strong className="text-emerald-400 text-sm">
              {formatMoney((parseFloat(productsTotal) || 0) + (parseFloat(servicesTotal) || 0))}
            </strong>
          </div>
          {fieldErrors.deal && (
            <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.deal}</span>
            </p>
          )}
        </div>

        {/* Section 3: Commission Scope & Percentage */}
        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/80 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              3. Opção de Incidência da Comissão do Intermediário
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Defina a regra contratual</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setCommissionScope('total_deal');
                clearFieldError('productsTotal');
                clearFieldError('servicesTotal');
              }}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                commissionScope === 'total_deal'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono uppercase">Negócio Global</div>
              <div className="text-[10px] opacity-80 font-sans">Produtos + Serviços</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCommissionScope('products_only');
                clearFieldError('productsTotal');
              }}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                commissionScope === 'products_only'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono uppercase">Somente Produtos</div>
              <div className="text-[10px] opacity-80 font-sans">Apenas s/ venda de bens</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCommissionScope('services_only');
                clearFieldError('servicesTotal');
              }}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                commissionScope === 'services_only'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono uppercase">Somente Serviços</div>
              <div className="text-[10px] opacity-80 font-sans">Apenas s/ prestação serv.</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCommissionScope('fixed_amount');
                clearFieldError('fixedCommissionAmount');
              }}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                commissionScope === 'fixed_amount'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono uppercase">Valor Fixo</div>
              <div className="text-[10px] opacity-80 font-sans">Honorário em dinheiro</div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {commissionScope === 'fixed_amount' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Valor Fixo da Comissão / Corretagem ({country.curr}) *
                </label>
                <input
                  type="number"
                  value={fixedCommissionAmount}
                  onChange={(e) => {
                    setFixedCommissionAmount(e.target.value);
                    clearFieldError('fixedCommissionAmount');
                  }}
                  placeholder={`Ex: 2500000 (${country.curr})`}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition font-bold"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                  <span>Percentagem da Comissão (%) *</span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    Incidência: {commissionScope === 'products_only' ? 'Produtos' : commissionScope === 'services_only' ? 'Serviços' : 'Total'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={commissionPct}
                    onChange={(e) => {
                      setCommissionPct(e.target.value);
                      clearFieldError('commissionPct');
                    }}
                    step="0.1"
                    placeholder="Ex: 7.5"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>
            )}

            {/* Quick Commission Percentage Presets */}
            {commissionScope !== 'fixed_amount' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Atalhos de Comissão Habitual no Mercado
                </label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['3.0', '5.0', '7.5', '10.0', '15.0'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setCommissionPct(p);
                        clearFieldError('commissionPct');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                        commissionPct === p
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Legal Framework, Decree Notice & Withholding Tax Settings */}
        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/80 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                4. Enquadramento Legal & Taxas de Retenção na Fonte (AGT / Fisco)
              </label>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-mono font-bold">
              Recomendação Legal Flexível
            </span>
          </div>

          {/* Legal Notice & Decree Recommendation Callout */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-mono">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {countryCode === 'AO'
                  ? 'Aviso Legal Fiscal • República de Angola (Decreto Legislativo Presidencial n.º 2/14 & Código II Lei 19/14 / Lei 26/20)'
                  : countryCode === 'PT'
                  ? 'Aviso Legal Fiscal • Portugal (Código do IRS Artigo 101.º & CIRC)'
                  : 'Aviso de Enquadramento Legal & Fiscal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {countryCode === 'AO' ? (
                <>
                  Pela lei fiscal angolana, a intermediação de negócios e comissões sujeita-se à <strong>Retenção na Fonte de 6.5%</strong>. A obrigação legal de entrega do imposto ao Estado é do <strong>Proprietário do Negócio / Entidade Adquirente</strong>, que desconta este valor no ato do pagamento ao intermediário e entrega à AGT via <strong>DAR (Documento de Arrecadação de Receitas)</strong>.
                  <br />
                  <span className="text-amber-200 text-[10px]">
                    * As taxas abaixo são recomendações baseadas no decreto. O utilizador pode alterar livremente conforme o contrato ou acordos de isenção.
                  </span>
                </>
              ) : (
                <>
                  A entidade contratante/proprietária deve efetuar a retenção na fonte sobre as comissões pagas aos intermediários nos termos dos decretos e normas fiscais em vigor, transferindo o valor líquido ao intermediário e o imposto ao fisco.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Retenção na Fonte Editable */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Taxa de Retenção na Fonte (%)</span>
                <span className="text-[10px] text-amber-400 font-mono">Recomendado: 6.5%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={retentionRate}
                  onChange={(e) => setRetentionRate(e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition font-bold"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">%</span>
              </div>
            </div>

            {/* IVA on Commission Toggle & Rate */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>IVA s/ Fatura da Comissão</span>
                <span className="text-[10px] text-indigo-400 font-mono">{country.curr}</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeVatOnCommission(!includeVatOnCommission)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    includeVatOnCommission
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span>{includeVatOnCommission ? `Com IVA (${commissionVatRate}%)` : 'Isento / Sem IVA'}</span>
                </button>
              </div>
            </div>

            {/* TPA / Banking Transfer Fee */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                Taxa TPA / Multicaixa (Padrão 0%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tpaRate}
                  onChange={(e) => setTpaRate(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none transition"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Stakeholders Identifiers (Optional for Official Reports) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3.5 bg-[#0F172A] rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 block">
              Dados do Proprietário / Empresa Vendedora (Opcional)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nome da Empresa / Vendedor"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
              />
              <input
                type="text"
                value={ownerNif}
                onChange={(e) => setOwnerNif(e.target.value)}
                placeholder="NIF do Proprietário"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#0F172A] rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 block">
              Dados do Intermediário / Corretor (Opcional)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={intermediaryName}
                onChange={(e) => setIntermediaryName(e.target.value)}
                placeholder="Nome do Intermediário"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
              />
              <input
                type="text"
                value={intermediaryNif}
                onChange={(e) => setIntermediaryNif(e.target.value)}
                placeholder="NIF do Intermediário"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Calculate Action */}
        <button
          onClick={handleSimulate}
          disabled={isCalculating}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>{isCalculating ? 'A CALCULAR & ENQUADRAR...' : 'SIMULAR INTERMEDIAÇÃO & APURAR DESEMBOLSOS'}</span>
        </button>
      </div>

      {/* Results Breakdown */}
      {results && (
        <div className="space-y-6">
          {/* Action Bar with Export Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1E293B] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-100 font-mono uppercase">
                  Demonstração da Intermediação & Liquidação Fiscal
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Base de Cálculo: {results.commissionScopeLabel} ({formatMoney(results.commissionBaseTarget)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Emitir Relatório PDF</span>
              </button>
            </div>
          </div>

          {/* Two-Column Dual Perspective Comparison (Lado do Intermediário vs Lado do Proprietário) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: LADO DO INTERMEDIÁRIO (O QUE TEM A RECEBER) */}
            <div className="bg-[#1E293B] border border-indigo-500/40 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-indigo-300 uppercase">
                      1. Visão do Intermediário ({results.intermediaryType === 'company' ? 'Empresa' : 'Particular'})
                    </h4>
                    <p className="text-[10px] text-slate-400">Montante líquido creditado na conta bancária</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  Comissão: {results.commissionPct}%
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                  <span>Base de Incidência ({results.commissionScopeLabel})</span>
                  <strong className="text-slate-100">{formatMoney(results.commissionBaseTarget)}</strong>
                </div>

                <div className="flex justify-between text-indigo-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                  <span>Comissão Bruta Acordada</span>
                  <strong className="text-indigo-400 font-bold">{formatMoney(results.grossCommission)}</strong>
                </div>

                {results.includeVatOnCommission && (
                  <div className="flex justify-between text-indigo-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                    <span>(+) IVA s/ Comissão ({results.commissionVatRate}%)</span>
                    <strong>+ {formatMoney(results.commissionVatAmount)}</strong>
                  </div>
                )}

                {/* Deductions from Intermediary */}
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Deduções Obrigatórias Descontadas no Pagamento:
                  </p>

                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>(-) Retenção na Fonte por Lei ({results.retentionRate}%)</span>
                    <span>- {formatMoney(results.withholdingTaxAmount)}</span>
                  </div>

                  {results.tpaCost > 0 && (
                    <div className="flex justify-between text-rose-300">
                      <span>(-) Encargo Bancário / TPA ({results.tpaRate}%)</span>
                      <span>- {formatMoney(results.tpaCost)}</span>
                    </div>
                  )}
                </div>

                {/* Net Payment Highlight */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-indigo-900/30 border border-indigo-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 block font-bold">
                      VALOR LÍQUIDO A RECEBER
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Transferência direta para a conta do intermediário
                    </span>
                  </div>
                  <strong className="text-lg font-bold font-mono text-emerald-400">
                    {formatMoney(results.netPayableToIntermediary)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right Card: LADO DO PROPRIETÁRIO DO NEGÓCIO (O QUE DEVE PAGAR E RECOLHER) */}
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase">
                      2. Visão do Proprietário / Vendedor Principal
                    </h4>
                    <p className="text-[10px] text-slate-400">Desembolsos financeiros e obrigações com o Estado</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Substituto Tributário
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                  <span>Faturação Total Bruta do Negócio</span>
                  <strong className="text-slate-100">{formatMoney(results.totalDealVal)}</strong>
                </div>

                <div className="flex justify-between text-amber-300 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                  <span>(-) Pagamento Líquido ao Intermediário</span>
                  <strong>- {formatMoney(results.netPayableToIntermediary)}</strong>
                </div>

                {/* Tax Duty to the State */}
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>(-) Imposto Retido a Entregar à AGT / DAR</span>
                    <span>- {formatMoney(results.taxToDeliverToState)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    O proprietário deve recolher este imposto ao Estado até ao final do mês subsequente.
                  </p>
                </div>

                <div className="flex justify-between text-slate-400 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                  <span>Custo Total de Intermediação (Intermediário + AGT)</span>
                  <strong className="text-rose-400 font-bold">{formatMoney(results.totalOwnerIntermediationCost)}</strong>
                </div>

                {/* Net Remaining Balance for Owner */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 block font-bold">
                      SALDO LÍQUIDO DO PROPRIETÁRIO
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Montante remanescente da venda após corretagem e retenção
                    </span>
                  </div>
                  <strong className="text-lg font-bold font-mono text-emerald-400">
                    {formatMoney(results.ownerRemainingDealBalance)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Banner */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Scale className="w-4 h-4" />
              <span>Resumo Fiscal da Operação de Intermediação</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Esta simulação discrimina com precisão a separação de obrigações: o <strong>Intermediário</strong> recebe o seu rendimento líquido na conta ({formatMoney(results.netPayableToIntermediary)}), enquanto o <strong>Proprietário</strong> retém a taxa por lei ({formatMoney(results.taxToDeliverToState)}) e assume a responsabilidade formal de liquidar a guia de retenção junto da Autoridade Geral Tributária (AGT).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
