import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  FileText,
  Clock,
  Filter,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Building,
  ArrowUpRight
} from 'lucide-react';
import { UserSafe, ManualPaymentValidation, ConsultingAuditEntry } from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_MANUAL_PAYMENTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockDatabase';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsAndMetricsTabProps {
  currentUser: UserSafe;
}

export const ReportsAndMetricsTab: React.FC<ReportsAndMetricsTabProps> = ({ currentUser }) => {
  const [activeView, setActiveView] = useState<'sales' | 'visitors' | 'payments' | 'audit'>('sales');
  const [startDate, setStartDate] = useState<string>('2026-08-01T00:00');
  const [endDate, setEndDate] = useState<string>('2026-08-31T23:59');

  const [payments, setPayments] = useState<ManualPaymentValidation[]>(INITIAL_MANUAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<ConsultingAuditEntry[]>(INITIAL_AUDIT_LOGS);

  // Sales aggregates
  const planSalesData = [
    { planName: 'Plano Ouro (Comércio & Lotes)', salesCount: 142, revenueKz: 4970000, color: 'bg-amber-500' },
    { planName: 'Plano Diamante (Importação + API)', salesCount: 98, revenueKz: 7350000, color: 'bg-indigo-500' },
    { planName: 'Plano Prata (Serviços & Pequenos Negócios)', salesCount: 86, revenueKz: 1290000, color: 'bg-slate-400' },
    { planName: 'Plano Personalizado Enterprise', salesCount: 15, revenueKz: 3750000, color: 'bg-emerald-500' }
  ];

  const totalRevenue = planSalesData.reduce((acc, curr) => acc + curr.revenueKz, 0);
  const totalSalesCount = planSalesData.reduce((acc, curr) => acc + curr.salesCount, 0);

  // Top clients ranking
  const topClients = [...INITIAL_CLIENTS].sort((a, b) => b.totalQueriesUsed - a.totalQueriesUsed);

  // Visitors trial stats
  const visitorStats = {
    totalFreeSimulations: 8420,
    totalTrialVisitors: 3150,
    conversionToPaidPercent: 12.4,
    topCountriesSimulated: [
      { code: 'AO', name: 'Angola', percent: 68 },
      { code: 'PT', name: 'Portugal', percent: 18 },
      { code: 'BR', name: 'Brasil', percent: 8 },
      { code: 'MZ', name: 'Moçambique', percent: 6 }
    ]
  };

  const handleApprovePayment = (payId: string) => {
    const updated = payments.map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'approved' as const,
          validatedByUserId: currentUser.id,
          validatedByUserName: currentUser.name,
          validatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    setPayments(updated);
  };

  const exportSalesToExcel = () => {
    const data = planSalesData.map((p) => ({
      'Plano': p.planName,
      'Total de Vendas': p.salesCount,
      'Faturamento Total (Kz)': p.revenueKz
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas de Planos');
    XLSX.writeFile(wb, `NANUCLOUD_Vendas_Planos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportAuditPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('NANUCLOUD — RELATÓRIO OFICIAL DE AUDITORIA & CONSULTORIA', 14, 15);
    doc.setFontSize(9);
    doc.text(`Filtro: ${startDate} até ${endDate} • Gerado por: ${currentUser.name}`, 14, 22);

    const rows = auditLogs.map((log) => [
      new Date(log.timestamp).toLocaleString('pt-PT'),
      log.operationType,
      log.operatorName,
      log.clientAffectedName || 'Geral do Sistema',
      log.ipAddress,
      log.details
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Data / Hora', 'Tipo de Operação', 'Operador Responsável', 'Cliente Afetado', 'Endereço IP', 'Detalhes da Ação']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    });

    doc.save(`NANUCLOUD_Relatorio_Auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">MÉTRICAS, VENDAS & AUDITORIA</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Tempo Real
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Faturamento de planos, visitantes em teste, validação de transferências e auditoria de consultoria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSalesToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 px-3.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={exportAuditPDF}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> PDF de Consultoria
          </button>
        </div>
      </div>

      {/* Date & Time Range Filter */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>FILTRO POR DATA E HORA EXATA:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-0.5">INÍCIO (DATA & HORA)</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-0.5">FIM (DATA & HORA)</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* View Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'sales', label: '1. Faturamento & Planos Mais Vendidos', icon: DollarSign },
          { id: 'visitors', label: '2. Relatório de Visitantes em Teste', icon: Users },
          { id: 'payments', label: '3. Validação Manual de Pagamentos', icon: CreditCard },
          { id: 'audit', label: '4. Auditoria de Consultoria & Operadores', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeView === tab.id
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Sales & Best Selling Plans */}
      {activeView === 'sales' && (
        <div className="space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-slate-400 text-xs font-mono block mb-1">FATURAMENTO TOTAL</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {totalRevenue.toLocaleString('pt-PT')} Kz
              </div>
              <span className="text-[10px] text-emerald-300 font-mono mt-1 block flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +18.4% vs mês anterior
              </span>
            </div>

            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-slate-400 text-xs font-mono block mb-1">TOTAL DE SUBSCRIÇÕES</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono">
                {totalSalesCount} Planos Ativos
              </div>
              <span className="text-[10px] text-indigo-300 font-mono mt-1 block">
                Média de 11 novos planos/semana
              </span>
            </div>

            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-slate-400 text-xs font-mono block mb-1">PLANO MAIS VENDIDO (RANKING 1)</span>
              <div className="text-lg font-bold text-amber-400 font-mono truncate">
                Plano Ouro (Comércio)
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                142 adesões registradas
              </span>
            </div>
          </div>

          {/* Ranking Table of Plans */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> RANKING DE DESEMPENHO DOS PLANOS
            </h3>

            <div className="space-y-3">
              {planSalesData.map((plan, i) => {
                const percentOfTotal = ((plan.revenueKz / totalRevenue) * 100).toFixed(1);
                return (
                  <div key={plan.planName} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-slate-100">{plan.planName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{plan.revenueKz.toLocaleString('pt-PT')} Kz</span>
                        <span className="text-slate-400 text-[10px] block">({plan.salesCount} vendas • {percentOfTotal}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${plan.color}`} style={{ width: `${percentOfTotal}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Clients Ranking */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> RANKING DOS MELHORES CLIENTES (VOLUME DE CONSULTAS)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Posição</th>
                    <th className="p-3">Cliente / Empresa</th>
                    <th className="p-3">Plano Atual</th>
                    <th className="p-3 text-right">Consultas Utilizadas</th>
                    <th className="p-3 text-right">Saldo Restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {topClients.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-indigo-400">#{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.company || c.email}</div>
                      </td>
                      <td className="p-3 text-slate-200">{c.activePlanName}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{c.totalQueriesUsed.toLocaleString('pt-PT')}</td>
                      <td className="p-3 text-right text-slate-300">{c.queriesRemaining > 99999 ? '∞' : c.queriesRemaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: Trial Visitors Report */}
      {activeView === 'visitors' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> RELATÓRIO DE VISITANTES EM MODO DE TESTE GRATUITO
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Análise de tráfego, conversão de novos usuários e países mais simulados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs font-mono block">SIMULAÇÕES GRATUITAS REALIZADAS</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {visitorStats.totalFreeSimulations.toLocaleString('pt-PT')}
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs font-mono block">VISITANTES ÚNICOS EM TESTE</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
                {visitorStats.totalTrialVisitors.toLocaleString('pt-PT')}
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs font-mono block">TAXA DE CONVERSÃO PARA PLANO PAGO</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {visitorStats.conversionToPaidPercent}%
              </div>
            </div>
          </div>

          {/* Top Simulated Countries */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              PAÍSES MAIS SIMULADOS PELOS VISITANTES:
            </h4>
            {visitorStats.topCountriesSimulated.map((item) => (
              <div key={item.code} className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>{item.name} ({item.code})</span>
                  <span className="font-bold">{item.percent}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Manual Payments Validation */}
      {activeView === 'payments' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> VALIDAÇÃO MANUAL DE PAGAMENTOS BANCÁRIOS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conferência de transferências BAI, BFA, BIC e BCP com aprovação e crédito imediato de consultas
            </p>
          </div>

          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{p.clientName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1">{p.planName} • {p.paymentMethod}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Comprovativo: {p.proofDocumentName}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-sm">{p.amountKz.toLocaleString('pt-PT')} Kz</div>
                    <div className="text-[10px] text-slate-500">{new Date(p.validatedAt).toLocaleDateString('pt-PT')}</div>
                  </div>

                  {p.status === 'pending' ? (
                    <button
                      onClick={() => handleApprovePayment(p.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Aprovar & Creditar
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Validado por {p.validatedByUserName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Consulting Audit Logs */}
      {activeView === 'audit' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> REGISTOS DE AUDITORIA & OPERAÇÕES MANUAIS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rastreabilidade rigorosa com endereço IP, operador e carimbo de data/hora
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Operação</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Endereço IP</th>
                  <th className="p-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString('pt-PT')}</td>
                    <td className="p-3 font-bold text-indigo-300">{log.operationType}</td>
                    <td className="p-3 text-slate-200">{log.operatorName}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress}</td>
                    <td className="p-3 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
