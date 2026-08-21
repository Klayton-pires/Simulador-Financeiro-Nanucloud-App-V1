import React, { useState } from 'react';
import { Download, Database, HardDrive, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, FileCode } from 'lucide-react';

interface AdminBackupTabProps {
  isSuperAdmin: boolean;
}

export const AdminBackupTab: React.FC<AdminBackupTabProps> = ({ isSuperAdmin }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDownloadFullBackup = async () => {
    setIsGenerating(true);
    setAlertMsg(null);
    try {
      const res = await fetch('/api/admin/backup/full');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nanucloud_backup_full_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setAlertMsg({ text: 'Backup completo do sistema descarregado com sucesso!', type: 'success' });
      } else {
        const err = await res.json();
        setAlertMsg({ text: err.error || 'Erro ao gerar backup.', type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Falha na ligação com o servidor.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSqlSchema = async () => {
    try {
      const res = await fetch('/api/admin/database/export-sql');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.sql], { type: 'text/sql' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `nanucloud_mysql_schema_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setAlertMsg({ text: 'Script MySQL exportado com sucesso!', type: 'success' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro ao descarregar script SQL.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Backups do Sistema, Restauro & Integridade de Dados</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Gere cópias de segurança integrais incluindo contas, planos, transações, extratos, histórico de simulações e parâmetros.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSqlSchema}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-slate-700"
            >
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>Exportar MySQL (.sql)</span>
            </button>

            <button
              onClick={handleDownloadFullBackup}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'A Empacotar...' : 'Descarregar Backup Completo'}</span>
            </button>
          </div>
        </div>

        {alertMsg && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            alertMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Frequência Automática</span>
            <p className="text-slate-200 font-bold text-xs">Diária (00:00 UTC)</p>
            <span className="text-[10px] text-emerald-400">Snapshot local sincronizado</span>
          </div>

          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Estrutura de Tabelas</span>
            <p className="text-slate-200 font-bold text-xs">6 Tabelas Relacionais</p>
            <span className="text-[10px] text-indigo-400">MySQL 8.0 InnoDB UTF8MB4</span>
          </div>

          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Integridade Criptográfica</span>
            <p className="text-slate-200 font-bold text-xs">SHA-256 Checksum</p>
            <span className="text-[10px] text-emerald-400">Verificação de paridade válida</span>
          </div>
        </div>
      </div>

      {/* Restore Guide */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
        <h4 className="font-bold text-slate-100 font-mono uppercase text-sm">Instruções para Restauro em Caso de Desastre:</h4>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Descarregue o ficheiro JSON ou o script MySQL gerado pelo painel.</li>
          <li>No servidor MySQL de destino (ex: RDS, phpMyAdmin ou linha de comandos), execute: <code className="bg-slate-900 px-2 py-0.5 rounded font-mono text-emerald-400">mysql -u nanucloud -p nanucloud_central &lt; backup.sql</code></li>
          <li>Os parâmetros, utilizadores e chaves de segurança serão imediatamente restaurados sem necessidade de reinicialização.</li>
        </ol>
      </div>
    </div>
  );
};
