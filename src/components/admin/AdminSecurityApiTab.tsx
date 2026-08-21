import React, { useState, useEffect } from 'react';
import { ApiKeyItem } from '../../types';
import { ShieldCheck, ShieldAlert, Key, Plus, Trash2, CheckCircle2, AlertCircle, Copy, Cpu, Lock, Check } from 'lucide-react';

interface AdminSecurityApiTabProps {
  isSuperAdmin: boolean;
}

export const AdminSecurityApiTab: React.FC<AdminSecurityApiTabProps> = ({ isSuperAdmin }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal create API key
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeySystem, setNewKeySystem] = useState<string>('primavera');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'simulate:local',
    'simulate:import',
    'tax:read'
  ]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          system: newKeySystem,
          permissions: selectedPermissions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Nova Chave de API gerada com sucesso!', type: 'success' });
        setIsModalOpen(false);
        setNewKeyName('');
        loadApiKeys();
      } else {
        setAlertMsg({ text: data.error || 'Erro ao criar chave.', type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro de comunicação.', type: 'error' });
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja revogar esta Chave de API? Todos os pedidos desse ERP serão recusados.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Chave revogada com sucesso.', type: 'success' });
        loadApiKeys();
      } else {
        setAlertMsg({ text: data.error || 'Erro ao revogar chave.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Security Shield Banner */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Segurança, 2FA, Antivírus & Integração de APIs (ERPs / POS)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Conexão com softwares de faturação (XD, WinRest, Primavera, SAP, PHC, Sage) e proteção contra ataques.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition self-start md:self-auto shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Nova Chave de API</span>
            </button>
          )}
        </div>

        {alertMsg && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            alertMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Security Engine Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#0F172A] p-3.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Antivírus & Firewall</span>
              <p className="text-emerald-400 font-bold text-xs">ATIVO (0 Ameaças)</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="bg-[#0F172A] p-3.5 rounded-lg border border-indigo-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Criptografia em Repouso</span>
              <p className="text-indigo-300 font-bold text-xs">AES-256 GCM</p>
            </div>
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>

          <div className="bg-[#0F172A] p-3.5 rounded-lg border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Rate Limiting de APIs</span>
              <p className="text-amber-300 font-bold text-xs">100 req / min</p>
            </div>
            <Cpu className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Modal to Create New Key */}
      {isModalOpen && (
        <div className="bg-[#1E293B] border border-indigo-500/40 rounded-xl p-5 md:p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Criar Nova Chave de API para Software ERP / POS</span>
          </h4>

          <form onSubmit={handleCreateApiKey} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Nome Identificador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Servidor Primavera Loja 1"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sistema Integrado</label>
                <select
                  value={newKeySystem}
                  onChange={(e) => setNewKeySystem(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="primavera">Primavera ERP (Angola)</option>
                  <option value="xd">XD Software POS</option>
                  <option value="winrest">WinRest / GrupoPIE</option>
                  <option value="sap">SAP ERP / Business One</option>
                  <option value="phc">PHC Software</option>
                  <option value="sage">Sage 50cloud</option>
                  <option value="custom">Outro / Custom Rest API</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow"
              >
                Gerar Chave
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold uppercase text-slate-200">
            Chaves de API Registadas ({apiKeys.length})
          </h4>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">A carregar chaves...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhuma chave de API gerada até ao momento.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Sistema</th>
                  <th className="p-3">Nome / Descrição</th>
                  <th className="p-3">Chave Secreta</th>
                  <th className="p-3">Permissões</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 text-[11px]">
                {apiKeys.map((key) => {
                  const isRevoked = key.status === 'revoked';
                  const isCopied = copiedKeyId === key.id;

                  return (
                    <tr key={key.id} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase font-bold text-[10px]">
                          {key.system}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-100">{key.name}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 max-w-xs">
                          <span className="truncate text-slate-300 font-mono text-[10px]">{key.key}</span>
                          <button
                            onClick={() => copyToClipboard(key.key, key.id)}
                            className="text-slate-400 hover:text-indigo-400 p-0.5"
                            title="Copiar chave"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px]">
                        {key.permissions.join(', ')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          !isRevoked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {!isRevoked ? 'Ativa' : 'Revogada'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!isRevoked && isSuperAdmin && (
                          <button
                            onClick={() => handleRevokeApiKey(key.id)}
                            className="p-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 transition"
                            title="Revogar Chave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
