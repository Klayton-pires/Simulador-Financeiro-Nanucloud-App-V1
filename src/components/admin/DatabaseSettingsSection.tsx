import React, { useState, useEffect } from 'react';
import {
  Database,
  Key,
  Trash2,
  Clock,
  HardDrive,
  Shield,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Folder,
  Layers,
  FileCode,
  Lock,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { UserSafe } from '../../types';

interface DatabaseSettingsSectionProps {
  currentUser?: UserSafe;
  isSuperAdmin?: boolean;
}

export const DatabaseSettingsSection: React.FC<DatabaseSettingsSectionProps> = ({
  currentUser,
  isSuperAdmin = true
}) => {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [credentialsInfo, setCredentialsInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [retentionDays, setRetentionDays] = useState<number>(15);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fetchDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [resInfo, resCreds] = await Promise.all([
        fetch('/api/sqlite/info'),
        fetch('/api/admin/database-credentials')
      ]);

      if (resInfo.ok) {
        const json = await resInfo.json();
        setDbInfo(json.data);
      }

      if (resCreds.ok) {
        const jsonCreds = await resCreds.json();
        setCredentialsInfo(jsonCreds.credentials);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do banco de dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // 1. Limpar todos os dados e contas de demonstração
  const handlePurgeDemoData = async () => {
    if (!window.confirm('Tem a certeza que deseja LIMPAR TODOS OS DADOS DE DEMONSTRAÇÃO? Isto removerá utilizadores, transações e simulações de teste sem afetar as contas reais de administração.')) {
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/purge-demo-data', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Limpeza concluída! ${data.stats?.usersRemoved || 0} utilizadores de teste, ${data.stats?.transactionsRemoved || 0} transações demo e ${data.stats?.historyRemoved || 0} simulações de teste eliminados.`
        });
        fetchDatabaseData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao executar limpeza de dados de teste.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Falha de comunicação com o servidor.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Aplicar política de retenção de 15 dias
  const handleApplyRetention = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/apply-retention-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysThreshold: retentionDays })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Regra de retenção de ${retentionDays} dias aplicada com sucesso! ${data.stats?.purgedCount || 0} simulações antigas eliminadas. O histórico do Super Administrador e os créditos dos utilizadores permaneceram 100% protegidos.`
        });
        fetchDatabaseData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao aplicar retenção.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Falha de comunicação com o servidor.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Eliminar histórico manual de simulações (Super Admin)
  const handleClearHistory = async (forNonAdminsOnly: boolean) => {
    const promptMsg = forNonAdminsOnly
      ? 'Deseja eliminar o histórico de simulações de TODOS os utilizadores normais, MANTENDO o histórico do Super Administrador?'
      : 'ATENÇÃO: Deseja eliminar TODO o histórico de simulações do sistema (incluindo do Super Administrador)?';

    if (!window.confirm(promptMsg)) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/simulation-history?forNonAdminsOnly=${forNonAdminsOnly}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        fetchDatabaseData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao eliminar histórico.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Falha de comunicação com o servidor.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                GOVERNANÇA DO BANCO DE DADOS & POLÍTICA DE RETENÇÃO
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                SQLite 3 Ativo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesso à base de dados relacional SQLite, limpeza de ficheiros de teste e purga de dados desnecessários após 15 dias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/api/sqlite/download"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Descarregar .sqlite</span>
          </a>

          <button
            type="button"
            onClick={fetchDatabaseData}
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border transition-all animate-in fade-in ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          feedback.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
          'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-xs leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Credenciais & Localização */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Credenciais & Acesso à Base de Dados
            </h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Motor de Base de Dados</span>
              <p className="text-xs font-bold text-indigo-400">SQLite 3 (Embebido na pasta do projeto)</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Ficheiros Disponíveis no Servidor</span>
              <p className="text-[11px] text-slate-300 font-mono break-all">/data/nanucloud.sqlite</p>
              <p className="text-[11px] text-slate-300 font-mono break-all">/database/nanucloud.sqlite</p>
              <p className="text-[11px] text-slate-300 font-mono break-all">nanucloud.sqlite (raiz)</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Software de Acesso Recomendado</span>
              <p className="text-xs text-slate-300 font-sans">
                DB Browser for SQLite, DBeaver, VSCode SQLite Viewer ou SQLiteStudio.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Autenticação & Nível</span>
              <p className="text-xs text-emerald-400 font-bold">Super Administrador (Acesso Irrestrito)</p>
            </div>
          </div>
        </div>

        {/* Card 2: Política de Retenção de 15 Dias */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Política de Retenção (15 Dias)
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Remove automaticamente simulações antigas para evitar sobrecarga no banco de dados. <strong>As contas dos utilizadores e os saldos de créditos permanecem 100% protegidos.</strong>
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Prazo de Expiração:</span>
                <span className="font-bold text-indigo-400">{retentionDays} Dias</span>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>7 dias</span>
                <span className="font-bold text-indigo-300">15 dias (Padrão)</span>
                <span>90 dias</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 flex items-start gap-2 font-sans">
              <Shield className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
              <span>
                <strong>Regra Super Admin:</strong> O histórico de consultas do Super Administrador fica guardado para sempre no banco de dados e nunca é apagado pela limpeza automática.
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyRetention}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isProcessing ? 'A Aplicar...' : 'Aplicar Limpeza de 15 Dias Agora'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Limpeza de Ficheiros Demo & Gestão Manual */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Limpeza de Demonstração & Manutenção
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Elimine dados de teste acumulados durante a fase de desenvolvimento para deixar o banco de dados leve e pronto para produção real.
            </p>

            <button
              type="button"
              onClick={handlePurgeDemoData}
              disabled={isProcessing}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isProcessing ? 'A Limpar...' : 'Limpar Dados e Ficheiros de Teste'}</span>
            </button>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] text-slate-400 block font-bold">OPÇÕES DO SUPER ADMINISTRADOR:</span>
              
              <button
                type="button"
                onClick={() => handleClearHistory(true)}
                disabled={isProcessing}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Limpar Histórico dos Clientes (Preservar Meu)</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearHistory(false)}
                disabled={isProcessing}
                className="w-full bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/50 text-rose-300 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Eliminar Todo o Histórico de Simulações</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Database Schema & Tables Overview */}
      {dbInfo && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-400" /> Estatísticas em Tempo Real das Tabelas SQLite
            </h3>
            <span className="text-xs text-emerald-400 font-bold font-mono">
              Tamanho: {dbInfo.fileSizeFormatted || '0 KB'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(dbInfo.tableCounts || {}).map(([table, count]) => (
              <div key={table} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold truncate block">{table}</span>
                <p className="text-base font-bold text-white font-mono">{String(count)}</p>
                <span className="text-[9px] text-slate-400">registos</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
