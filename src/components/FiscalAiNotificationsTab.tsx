import React, { useState } from 'react';
import {
  BellRing,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Calendar,
  FileText,
  Filter,
  Download,
  AlertTriangle,
  Eye,
  Building2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { UserSafe, FiscalNotification } from '../types';
import { INITIAL_FISCAL_NOTIFICATIONS } from '../data/mockDatabase';
import { COUNTRIES_DB } from '../data/countries';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FiscalAiNotificationsTabProps {
  currentUser: UserSafe;
}

export const FiscalAiNotificationsTab: React.FC<FiscalAiNotificationsTabProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<FiscalNotification[]>(() => {
    const saved = localStorage.getItem('nanucloud_fiscal_notifications');
    return saved ? JSON.parse(saved) : INITIAL_FISCAL_NOTIFICATIONS;
  });

  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  const handleSaveNotifications = (updated: FiscalNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('nanucloud_fiscal_notifications', JSON.stringify(updated));
  };

  const handleMarkAsRead = (notifId: string) => {
    const updated = notifications.map((n) => {
      if (n.id === notifId) {
        const alreadyRead = n.readByManagers.some((m) => m.managerId === currentUser.id);
        if (!alreadyRead) {
          return {
            ...n,
            readByManagers: [
              ...n.readByManagers,
              {
                managerId: currentUser.id,
                managerName: currentUser.name,
                readAt: new Date().toISOString()
              }
            ]
          };
        }
      }
      return n;
    });
    handleSaveNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesCountry = selectedCountry === 'all' || n.countryCode === selectedCountry;
    const notifDate = n.createdAt.slice(0, 10);
    const matchesDate = notifDate >= startDate && notifDate <= endDate;
    return matchesCountry && matchesDate;
  });

  const exportToExcel = () => {
    const data = filteredNotifications.map((n) => ({
      'País': n.countryName,
      'Agência Oficial': n.agencyName,
      'Tipo de Imposto': n.taxType,
      'Título da Notícia': n.title,
      'Taxa Anterior': n.oldRate || 'N/A',
      'Nova Taxa Vigente': n.newRate || 'N/A',
      'Data de Entrada em Vigor': n.effectiveDate,
      'Base Legal / Diário': n.lawReference,
      'Portal Oficial Verificado': n.sourceUrl,
      'Visualizado por Gestores': n.readByManagers.map((m) => `${m.managerName} (${new Date(m.readAt).toLocaleString('pt-PT')})`).join('; ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alterações Fiscais');
    XLSX.writeFile(wb, `NANUCLOUD_Relatorio_Alteracoes_Fiscais_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('NANUCLOUD — RELATÓRIO DE ALTERAÇÕES FISCAIS & NOTÍCIAS OFICIAIS', 14, 15);
    doc.setFontSize(9);
    doc.text(`Período de Análise: ${startDate} a ${endDate} • Diários Oficiais e Legislações Fiscais`, 14, 22);

    const rows = filteredNotifications.map((n) => [
      n.countryName,
      n.agencyName,
      n.taxType,
      n.title,
      n.newRate || 'Atualizada',
      n.effectiveDate,
      n.lawReference,
      n.readByManagers.length > 0 ? `${n.readByManagers.length} Gestor(es)` : 'Pendente'
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['País', 'Agência', 'Imposto', 'Notícia / Resumo', 'Nova Alíquota', 'Vigência', 'Base Legal', 'Auditoria Leitura']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    });

    doc.save(`NANUCLOUD_Relatorio_Fiscal_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">IA FISCAL & NOTÍCIAS OFICIAIS</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                100% Fontes Governamentais Fidedignas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitorização de diplomas legais, diários da república e códigos tributários com registo de leitura por gestor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> PDF Oficial
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">FILTRAR POR PAÍS</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Países Cadastrados</option>
            {Object.keys(COUNTRIES_DB).map((code) => (
              <option key={code} value={code}>
                {COUNTRIES_DB[code].name} ({COUNTRIES_DB[code].agency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">DATA DE INÍCIO</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-1.5 px-3 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">DATA DE FIM</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-1.5 px-3 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Notifications Cards */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => {
          const hasRead = notif.readByManagers.some((m) => m.managerId === currentUser.id);

          return (
            <div
              key={notif.id}
              className={`bg-[#1E293B] border rounded-2xl p-5 space-y-4 transition-all shadow-md ${
                notif.isCritical ? 'border-amber-500/50' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                    {notif.countryName} • {notif.agencyName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {notif.taxType}
                  </span>
                  {notif.isCritical && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3" /> Alteração de Alíquota
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    Vigência: {new Date(notif.effectiveDate).toLocaleDateString('pt-PT')}
                  </span>
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                      hasRead
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {hasRead ? 'Visualizado' : 'Marcar como Lido'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono mb-1">{notif.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.summary}</p>
              </div>

              {/* Tax Delta & Law Reference */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">ALTERAÇÃO DE TAXA:</span>
                  <span className="text-slate-300">
                    De <span className="line-through text-rose-400">{notif.oldRate}</span> para{' '}
                    <strong className="text-emerald-400">{notif.newRate}</strong>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">BASE LEGAL OFICIAL:</span>
                  <span className="text-indigo-300 truncate block">{notif.lawReference}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FONTE OFICIAL 100%:</span>
                  <a
                    href={notif.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 truncate"
                  >
                    {notif.sourceUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Managers who read this notification */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Visualizado por {notif.readByManagers.length} gestor(es):{' '}
                    {notif.readByManagers.map((m) => m.managerName).join(', ') || 'Nenhum gestor ainda'}
                  </span>
                </div>
                <span>Registado em: {new Date(notif.createdAt).toLocaleDateString('pt-PT')}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
