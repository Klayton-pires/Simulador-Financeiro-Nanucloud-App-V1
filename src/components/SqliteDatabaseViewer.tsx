import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Play,
  RefreshCw,
  FileCode,
  HardDrive,
  Table,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Code
} from 'lucide-react';

export const SqliteDatabaseViewer: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, email, role, queriesRemaining, activePlanName FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [copied, setCopied] = useState(false);

  const fetchDbInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sqlite/info');
      const data = await res.json();
      if (data.success) {
        setDbInfo(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar info SQLite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim()) return;

    try {
      setQueryLoading(true);
      setQueryError(null);
      const res = await fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q })
      });
      const data = await res.json();
      if (data.success) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'Erro na execução SQL');
        setQueryResult(null);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Erro de comunicação');
      setQueryResult(null);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSelectTablePreset = (tableName: string) => {
    setSelectedTable(tableName);
    const newQuery = `SELECT * FROM ${tableName} LIMIT 20;`;
    setSqlQuery(newQuery);
    handleExecuteQuery(newQuery);
  };

  const handleSyncDb = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sqlite/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchDbInfo();
        handleExecuteQuery();
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Motor SQLite 3 Padrão (Local & Standalone)
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              Base Ativa por Padrão
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Ficheiro SQLite armazenado diretamente junto ao código em <code className="text-amber-300">/data/nanucloud.sqlite</code> e <code className="text-amber-300">/database/nanucloud.sqlite</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncDb}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 transition text-[11px] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>

          <a
            href="/api/sqlite/download"
            download="nanucloud.sqlite"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-[11px] shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descarregar nanucloud.sqlite
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Ficheiro SQLite
          </div>
          <div className="font-bold text-slate-200 text-xs truncate">nanucloud.sqlite</div>
          <div className="text-[10px] text-slate-500">Tamanho: {dbInfo?.fileSizeFormatted || '48 KB'}</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Table className="w-3.5 h-3.5 text-indigo-400" /> Tabelas Criadas
          </div>
          <div className="font-bold text-indigo-300 text-xs">
            {dbInfo?.tables?.length || 12} Tabelas
          </div>
          <div className="text-[10px] text-slate-500">Users, Plans, History, Bot...</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compatibilidade
          </div>
          <div className="font-bold text-emerald-400 text-xs">Windows & Web Ready</div>
          <div className="text-[10px] text-slate-500">Zero C++ / Pure WASM & Node</div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Localização no Disco
          </div>
          <div className="font-bold text-cyan-300 text-[10px] truncate" title="/data/nanucloud.sqlite">
            ./data/nanucloud.sqlite
          </div>
          <div className="text-[10px] text-slate-500">Cópia em ./database/</div>
        </div>
      </div>

      {/* Table Selection Pills */}
      <div className="space-y-2">
        <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-amber-400" /> Tabelas na Base de Dados SQLite:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            'users',
            'plans',
            'transactions',
            'query_history',
            'audit_logs',
            'system_settings',
            'bank_accounts',
            'bot_knowledge',
            'unresolved_bot_questions',
            'fiscal_proposals',
            'api_keys',
            'chat_messages'
          ].map((tbl) => {
            const count = dbInfo?.tableCounts?.[tbl] ?? 0;
            const isSel = selectedTable === tbl;
            return (
              <button
                key={tbl}
                type="button"
                onClick={() => handleSelectTablePreset(tbl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition cursor-pointer ${
                  isSel
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tbl}</span>
                <span className={`px-1 rounded text-[9px] ${isSel ? 'bg-amber-700/40 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SQL Query Editor */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 text-xs">Executor de Consultas SQL (Teste Direto)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopySql(sqlQuery)}
              className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              Copiar SQL
            </button>
            <button
              type="button"
              onClick={() => handleExecuteQuery()}
              disabled={queryLoading}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 text-[11px] font-bold transition shadow cursor-pointer"
            >
              <Play className="w-3 h-3" />
              {queryLoading ? 'A executar...' : 'Executar SQL'}
            </button>
          </div>
        </div>

        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          rows={3}
          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
          placeholder="Escreva qualquer comando SQL (SELECT, INSERT, UPDATE, PRAGMA)..."
        />

        {queryError && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[10px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{queryError}</span>
          </div>
        )}

        {/* Results Table */}
        {queryResult && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {queryResult.type === 'select'
                  ? `${queryResult.rowCount} registos retornados`
                  : `Comando executado (${queryResult.rowsAffected} linhas afetadas)`}
              </span>
            </div>

            {queryResult.type === 'select' && queryResult.rows && queryResult.rows.length > 0 && (
              <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-lg">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-900 text-slate-300 uppercase sticky top-0">
                    <tr>
                      {Object.keys(queryResult.rows[0]).map((col) => (
                        <th key={col} className="px-3 py-2 border-b border-slate-800 font-bold text-amber-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                    {queryResult.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        {Object.values(row).map((val: any, vIdx: number) => (
                          <td key={vIdx} className="px-3 py-1.5 text-slate-300 whitespace-nowrap font-mono">
                            {val === null ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
