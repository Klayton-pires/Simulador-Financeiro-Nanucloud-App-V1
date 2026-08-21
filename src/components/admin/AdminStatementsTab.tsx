import React, { useState, useEffect } from 'react';
import { UserSafe, Transaction, QueryHistoryItem } from '../../types';
import { Search, UserCheck, Gift, Calendar, DollarSign, ArrowUpRight, CheckCircle2, AlertCircle, FileText, Download, ShieldCheck } from 'lucide-react';

interface AdminStatementsTabProps {
  usersList: UserSafe[];
  isSuperAdmin: boolean;
  onRefreshData: () => void;
}

export const AdminStatementsTab: React.FC<AdminStatementsTabProps> = ({
  usersList,
  isSuperAdmin,
  onRefreshData
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(usersList[0]?.id || '');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [statementData, setStatementData] = useState<{
    user: UserSafe;
    transactions: Transaction[];
    queryHistory: QueryHistoryItem[];
    stats: {
      totalSpentKz: number;
      totalQueriesUsed: number;
      queriesRemaining: number;
      totalApprovedTransactions: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bonus modal / inputs
  const [bonusQueries, setBonusQueries] = useState<number>(5);
  const [bonusReason, setBonusReason] = useState<string>('Bónus autorizado pela Direção Nanucloud');
  const [isSubmittingBonus, setIsSubmittingBonus] = useState<boolean>(false);

  // Extend validity modal / inputs
  const [extendDays, setExtendDays] = useState<number>(30);
  const [extendReason, setExtendReason] = useState<string>('Extensão de cortesia de 30 dias');
  const [isSubmittingExtend, setIsSubmittingExtend] = useState<boolean>(false);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStatement(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUserStatement = async (userId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/statement`);
      if (res.ok) {
        const data = await res.json();
        setStatementData(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Erro ao carregar extrato do utilizador.');
      }
    } catch (err) {
      setErrorMsg('Falha ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || bonusQueries <= 0) return;
    setIsSubmittingBonus(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bonusQueries,
          reason: bonusReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Bónus de +${bonusQueries} consultas atribuído com sucesso!`);
        fetchUserStatement(selectedUserId);
        onRefreshData();
      } else {
        setErrorMsg(data.error || 'Erro ao atribuir bónus.');
      }
    } catch (err) {
      setErrorMsg('Erro de comunicação.');
    } finally {
      setIsSubmittingBonus(false);
    }
  };

  const handleExtendValidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || extendDays <= 0) return;
    setIsSubmittingExtend(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/extend-validity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalDays: extendDays,
          reason: extendReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Prazo estendido por +${extendDays} dias com sucesso!`);
        fetchUserStatement(selectedUserId);
        onRefreshData();
      } else {
        setErrorMsg(data.error || 'Erro ao estender prazo.');
      }
    } catch (err) {
      setErrorMsg('Erro de comunicação.');
    } finally {
      setIsSubmittingExtend(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Extrato Detalhado, Consumos & Bónus de Utilizadores</span>
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento de pagamentos efetuados, número de exportações, tipo de consultas e concessão de bónus
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* User Selection Pills */}
        <div className="mt-4 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
          {filteredUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-2 border ${
                selectedUserId === u.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span className="font-semibold">{u.name}</span>
              <span className="text-[10px] opacity-75">({u.queriesRemaining} cons.)</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-12 text-center text-slate-400 font-mono text-xs">
          A carregar extrato financeiro e histórico de consumo...
        </div>
      ) : statementData ? (
        <div className="space-y-6">
          {/* User Quick Overview & Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Investido</span>
              <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {(statementData.stats.totalSpentKz || 0).toLocaleString('pt-PT')} Kz
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {statementData.stats.totalApprovedTransactions} pagamentos validados
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Saldo Atual</span>
              <h4 className="text-xl font-bold font-mono text-amber-400 mt-1">
                {statementData.stats.queriesRemaining} Consultas
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                Plano: {statementData.user.activePlanName || 'Gratuito'}
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Utilizado</span>
              <h4 className="text-xl font-bold font-mono text-sky-400 mt-1">
                {statementData.stats.totalQueriesUsed} Simulações
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {statementData.queryHistory.length} registos no histórico
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Validade do Plano</span>
              <h4 className="text-sm font-bold font-mono text-slate-200 mt-1">
                {statementData.user.planExpiresAt
                  ? new Date(statementData.user.planExpiresAt).toLocaleDateString('pt-PT')
                  : 'Sem expiração ativa'}
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {statementData.user.nif ? `NIF: ${statementData.user.nif}` : 'Sem NIF registado'}
              </span>
            </div>
          </div>

          {/* Super Admin Control Actions: Grant Bonus & Extend Validity */}
          {isSuperAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grant Bonus Box */}
              <form onSubmit={handleGrantBonus} className="bg-[#1E293B] border border-amber-500/30 rounded-xl p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                  <Gift className="w-4 h-4" />
                  <span>Concessão de Bónus de Consultas (Super Admin)</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Adiciona créditos de consultas diretamente à conta de <strong>{statementData.user.name}</strong> com registo de auditoria.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Quantidade de Bónus (+)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={bonusQueries}
                      onChange={(e) => setBonusQueries(Number(e.target.value))}
                      className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Motivo / Justificação</label>
                    <input
                      type="text"
                      required
                      value={bonusReason}
                      onChange={(e) => setBonusReason(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBonus}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
                >
                  {isSubmittingBonus ? 'A Processar...' : `Creditar +${bonusQueries} Consultas Bónus`}
                </button>
              </form>

              {/* Extend Validity Box */}
              <form onSubmit={handleExtendValidity} className="bg-[#1E293B] border border-indigo-500/30 rounded-xl p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>Extensão de Validade do Plano (Super Admin)</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Adiciona dias adicionais ao prazo de expiração de 30 dias do utilizador <strong>{statementData.user.name}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Dias Adicionais (+)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={extendDays}
                      onChange={(e) => setExtendDays(Number(e.target.value))}
                      className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Motivo da Extensão</label>
                    <input
                      type="text"
                      required
                      value={extendReason}
                      onChange={(e) => setExtendReason(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingExtend}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
                >
                  {isSubmittingExtend ? 'A Processar...' : `Estender Prazo por +${extendDays} Dias`}
                </button>
              </form>
            </div>
          )}

          {/* Transactions Statement Table */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-200">
                1. Histórico de Pagamentos & Transações ({statementData.transactions.length})
              </h4>
            </div>

            {statementData.transactions.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">Nenhum pagamento registado para este utilizador.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Plano</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Consultas</th>
                      <th className="p-3">Método / Ref</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 text-[11px]">
                    {statementData.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400">{new Date(tx.createdAt).toLocaleDateString('pt-PT')}</td>
                        <td className="p-3 font-semibold">{tx.planName}</td>
                        <td className="p-3 font-bold text-emerald-400">{tx.amountKz.toLocaleString('pt-PT')} Kz</td>
                        <td className="p-3 text-amber-400 font-bold">+{tx.queriesGranted}</td>
                        <td className="p-3 text-slate-300">
                          {tx.paymentMethod} {tx.paymentReference ? `(${tx.paymentReference})` : ''}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Queries / Calculations Consumption History */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-200">
                2. Histórico de Simulações & Exportações ({statementData.queryHistory.length})
              </h4>
            </div>

            {statementData.queryHistory.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">Nenhuma simulação registada no histórico deste utilizador.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Produto / Título</th>
                      <th className="p-3">País</th>
                      <th className="p-3">Preço Final</th>
                      <th className="p-3">Lucro Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 text-[11px]">
                    {statementData.queryHistory.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400">{new Date(q.createdAt).toLocaleString('pt-PT')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            q.type === 'import' ? 'bg-indigo-500/20 text-indigo-300' : q.type === 'batch' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {q.type === 'import' ? 'Importação' : q.type === 'batch' ? 'Lote Excel' : 'Comércio Local'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-100">{q.title}</td>
                        <td className="p-3 text-slate-400">{q.countryCode}</td>
                        <td className="p-3 font-bold text-slate-100">{q.finalPrice?.toLocaleString('pt-PT')} {q.currency}</td>
                        <td className="p-3 font-bold text-emerald-400">{q.netProfit?.toLocaleString('pt-PT')} {q.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
