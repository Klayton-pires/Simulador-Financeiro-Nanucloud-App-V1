import React, { useState, useEffect } from 'react';
import { UserSafe, QueryHistoryItem, Transaction } from '../types';
import { User, Key, Sparkles, Gem, History, CreditCard, Download, Edit2, Check, Trash2, Shield, Calendar, Building, Mail, Phone, Globe, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface UserProfileProps {
  user: UserSafe;
  onOpenPlans: () => void;
  onUserUpdated: (updatedUser: UserSafe) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onOpenPlans,
  onUserUpdated
}) => {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Password update state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
    fetchTransactions();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/simulator/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/plans/my-transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleStartEdit = (item: QueryHistoryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/simulator/history/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription })
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(history.map(h => (h.id === id ? data.item : h)));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating history item:', err);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Deseja eliminar esta simulação do seu histórico?')) return;
    try {
      const res = await fetch(`/api/simulator/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleExportExcel = () => {
    window.location.href = '/api/simulator/history-export';
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!currentPassword || !newPassword) {
      setProfileMsg({ text: 'Preencha a palavra-passe atual e a nova palavra-passe.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setProfileMsg({ text: 'A nova palavra-passe deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ text: data.error || 'Erro ao alterar palavra-passe.', type: 'error' });
      } else {
        setProfileMsg({ text: 'Palavra-passe alterada com sucesso!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        if (data.user) onUserUpdated(data.user);
      }
    } catch (err) {
      setProfileMsg({ text: 'Falha na comunicação com o servidor.', type: 'error' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const filteredHistory = history.filter(h => {
    const term = searchFilter.toLowerCase();
    return (
      h.title.toLowerCase().includes(term) ||
      h.description.toLowerCase().includes(term) ||
      h.countryCode.toLowerCase().includes(term) ||
      h.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner: Profile Overview & Plan Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl uppercase shadow-lg shadow-indigo-950/40">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">{user.name}</h3>
              <p className="text-xs text-indigo-400 font-medium">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                  user.role === 'admin_level1'
                    ? 'bg-amber-400 text-slate-950'
                    : user.role === 'admin_level2'
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {user.role === 'admin_level1' ? 'Super Administrador (N1)' : (user.role === 'admin_level2' ? 'Gerente / Admin (N2)' : 'Cliente Registado')}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-4 space-y-2 text-xs text-slate-300">
            {user.nif && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NIF: <strong>{user.nif}</strong></span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Empresa: <strong>{user.company}</strong></span>
              </div>
            )}
            {user.address && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Endereço: <strong>{user.address}</strong></span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Contacto: <strong>{user.phone}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span>País Fiscal Base: <strong>{user.country}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Membro desde: <strong>{new Date(user.createdAt).toLocaleDateString('pt-PT')}</strong></span>
            </div>
          </div>
        </div>

        {/* Plan & Credits Card */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo de Consultas</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-400">{user.queriesRemaining}</span>
            <span className="text-xs text-slate-400 font-semibold">pesquisas disponíveis</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Plano Atual:</span>
              <strong className="text-slate-100">{user.activePlanName || 'Gratuito (3 Consultas)'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Validade:</span>
              <strong className="text-slate-100">
                {user.planExpiresAt
                  ? new Date(user.planExpiresAt).toLocaleDateString('pt-PT')
                  : 'Vitalício / Inicial'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Módulo Importação:</span>
              <strong className={user.isImportUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                {user.isImportUnlocked ? 'Desbloqueado ✓' : 'Bloqueado 🔒'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Módulo Lote Excel:</span>
              <strong className={user.isBatchUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                {user.isBatchUnlocked ? 'Desbloqueado ✓' : 'Bloqueado 🔒'}
              </strong>
            </div>
          </div>

          <button
            onClick={onOpenPlans}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Gem className="w-4 h-4" />
            <span>Recarregar Consultas / Mudar de Plano</span>
          </button>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-3">
          <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Alterar Palavra-passe
          </h4>

          {profileMsg && (
            <p className={`text-xs p-2.5 rounded-xl ${profileMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              {profileMsg.text}
            </p>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Palavra-passe Atual:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Nova Palavra-passe:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2 rounded-xl text-xs border border-slate-700 transition"
            >
              {isUpdatingPassword ? 'A atualizar...' : 'Atualizar Segurança'}
            </button>
          </form>
        </div>
      </div>

      {/* Histórico de Consultas com Edição e Exportação Excel */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">Histórico de Simulações & Consultas</h3>
              <p className="text-xs text-slate-400">Edite as descrições na tabela e exporte relatórios em Excel (.xlsx)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Pesquisar histórico..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 outline-none"
            />

            <button
              onClick={handleExportExcel}
              disabled={history.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <p className="text-center text-xs text-slate-400 py-8">A carregar histórico...</p>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Nenhuma simulação encontrada no histórico. Realize a sua primeira consulta!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Título / Produto</th>
                  <th className="p-3">Descrição / Notas (Editável)</th>
                  <th className="p-3">Custo Base</th>
                  <th className="p-3">PVP Final</th>
                  <th className="p-3">Lucro Líquido</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredHistory.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 whitespace-nowrap text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.type === 'local'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : item.type === 'import'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.type === 'local' ? 'Local' : item.type === 'import' ? 'Importação' : 'Lote Excel'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-full"
                          />
                        ) : (
                          item.title
                        )}
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-full"
                          />
                        ) : (
                          item.description || '-'
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono">
                        {item.costBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {item.currency}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-100">
                        {item.finalPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {item.currency}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono font-bold text-emerald-400">
                        {item.netProfit.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {item.currency}
                      </td>
                      <td className="p-3 whitespace-nowrap text-right space-x-1">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition"
                            title="Guardar Alterações"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition"
                            title="Editar Descrição"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="bg-rose-950 hover:bg-rose-900 text-rose-300 p-1.5 rounded-lg transition"
                          title="Eliminar Registo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          Histórico de Faturas & Transações
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400">Ainda não possui transações ou recargas registadas.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Plano / Descrição</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Pesquisas</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{tx.id}</td>
                    <td className="p-3 whitespace-nowrap text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="p-3 font-semibold">{tx.planName}</td>
                    <td className="p-3 font-bold text-slate-100">
                      {tx.amountKz.toLocaleString('pt-PT')} Kz
                    </td>
                    <td className="p-3 font-bold text-amber-400">+{tx.queriesGranted}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 w-fit ${
                        tx.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tx.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {tx.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {tx.status === 'approved' ? 'Aprovado & Ativo' : (tx.status === 'pending' ? 'Pendente de Validação' : 'Rejeitado')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
