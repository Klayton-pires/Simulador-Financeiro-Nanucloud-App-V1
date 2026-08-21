import React, { useState, useEffect } from 'react';
import { UserSafe, Plan, Transaction, AuditLog, SystemSettings, SupportInquiry, BankAccount, ChatMessage } from '../types';
import { Shield, ShieldAlert, CheckCircle2, XCircle, Users, Gem, Activity, Settings, Database, MessageSquare, Download, Edit3, Plus, Search, Check, Trash2, Key, RefreshCw, Building, Bot, Send, FileText, Sparkles, HardDrive } from 'lucide-react';
import { AdminStatementsTab } from './admin/AdminStatementsTab';
import { AdminFiscalAiTab } from './admin/AdminFiscalAiTab';
import { AdminSecurityApiTab } from './admin/AdminSecurityApiTab';
import { AdminBackupTab } from './admin/AdminBackupTab';
import { AdminAdvancedSettingsTab } from './admin/AdminAdvancedSettingsTab';
import { AdminBotLearningTab } from './admin/AdminBotLearningTab';
import { AdminDeployPackageTab } from './admin/AdminDeployPackageTab';

interface AdminPanelProps {
  user: UserSafe;
  onRefreshUser: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onRefreshUser }) => {
  const isSuperAdmin = user.role === 'admin_level1';

  const [activeTab, setActiveTab] = useState<
    'kpis' | 'payments' | 'statements' | 'users' | 'plans' | 'bank_accounts' | 'fiscal_ai' | 'security_apis' | 'bot_learning' | 'deploy_packages' | 'chat' | 'logs' | 'settings' | 'backup' | 'support'
  >('kpis');

  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usersList, setUsersList] = useState<UserSafe[]>([]);
  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [logsList, setLogsList] = useState<AuditLog[]>([]);
  const [settingsData, setSettingsData] = useState<SystemSettings | null>(null);
  const [supportList, setSupportList] = useState<SupportInquiry[]>([]);
  const [bankAccountsList, setBankAccountsList] = useState<BankAccount[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<ChatMessage[]>([]);
  const [adminChatReply, setAdminChatReply] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Bank Account Modal
  const [bankModalOpen, setBankModalOpen] = useState<boolean>(false);
  const [editingBankAcc, setEditingBankAcc] = useState<BankAccount | null>(null);
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    iban: '',
    swift: '',
    holder: 'NANUCLOUD - Tecnologia e Soluções Lda',
    currency: 'AOA (Kz)'
  });

  // User modal / edit state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserSafe | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    role: 'user',
    queriesRemaining: 10,
    isImportUnlocked: false,
    isBatchUnlocked: false,
    isActive: true
  });
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  // Plan edit modal
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<Plan | null>(null);

  // Support reply
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Search & Filter
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [logFilterTerm, setLogFilterTerm] = useState<string>('');

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const resStats = await fetch('/api/admin/dashboard-stats');
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Transactions
      const resTx = await fetch('/api/admin/transactions');
      if (resTx.ok) {
        const data = await resTx.json();
        setTransactions(data.transactions || []);
      }

      // 3. Plans
      const resPlans = await fetch('/api/admin/plans');
      if (resPlans.ok) {
        const data = await resPlans.json();
        setPlansList(data.plans || []);
        setSettingsData(data.settings);
      }

      // 4. Users (Super Admin only)
      if (isSuperAdmin) {
        const resUsers = await fetch('/api/admin/users');
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUsersList(data.users || []);
        }

        const resLogs = await fetch('/api/admin/logs');
        if (resLogs.ok) {
          const data = await resLogs.json();
          setLogsList(data.logs || []);
        }

        const resSettings = await fetch('/api/admin/settings');
        if (resSettings.ok) {
          const data = await resSettings.json();
          setSettingsData(data.settings);
        }
      }

      // 5. Support
      const resSupport = await fetch('/api/admin/support');
      if (resSupport.ok) {
        const data = await resSupport.json();
        setSupportList(data.inquiries || []);
      }

      // 6. Bank Accounts
      const resBank = await fetch('/api/admin/bank-accounts');
      if (resBank.ok) {
        const data = await resBank.json();
        setBankAccountsList(data.accounts || []);
      }

      // 7. Chat Sessions
      const resChat = await fetch('/api/chat/admin/sessions');
      if (resChat.ok) {
        const data = await resChat.json();
        setChatSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChatSession = async (sessionId: string) => {
    setSelectedChatSessionId(sessionId);
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSessionMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAdminChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatSessionId || !adminChatReply.trim()) return;

    try {
      const res = await fetch('/api/chat/admin-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedChatSessionId,
          text: adminChatReply.trim()
        })
      });

      if (res.ok) {
        setAdminChatReply('');
        handleSelectChatSession(selectedChatSessionId);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBankAcc ? `/api/admin/bank-accounts/${editingBankAcc.id}` : '/api/admin/bank-accounts';
      const method = editingBankAcc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankFormData)
      });

      const data = await res.json();
      if (!res.ok) {
        setAlertMsg({ text: data.error || 'Erro ao guardar conta bancária.', type: 'error' });
      } else {
        setAlertMsg({ text: data.message, type: 'success' });
        setBankModalOpen(false);
        setEditingBankAcc(null);
        loadAllData();
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro de comunicação ao guardar conta bancária.', type: 'error' });
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja remover esta conta bancária?')) return;
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Conta bancária removida com sucesso!', type: 'success' });
        loadAllData();
      } else {
        setAlertMsg({ text: data.error || 'Erro ao remover.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBankAccountStatus = async (acc: BankAccount) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${acc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !acc.isActive })
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleValidateTransaction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertMsg({ text: data.error || 'Erro ao validar transação.', type: 'error' });
      } else {
        setAlertMsg({ text: data.message, type: 'success' });
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro ao comunicar com o servidor.', type: 'error' });
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedUserForEdit ? `/api/admin/users/${selectedUserForEdit.id}` : '/api/admin/users';
      const method = selectedUserForEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertMsg({ text: data.error || 'Erro ao guardar utilizador.', type: 'error' });
      } else {
        setAlertMsg({ text: data.message, type: 'success' });
        setSelectedUserForEdit(null);
        setIsCreatingUser(false);
        loadAllData();
      }
    } catch (err) {
      setAlertMsg({ text: 'Falha na gravação do utilizador.', type: 'error' });
    }
  };

  const handleToggleUserActive = async (targetUser: UserSafe) => {
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !targetUser.isActive })
      });
      if (res.ok) {
        setAlertMsg({ text: `Estado do utilizador ${targetUser.name} alterado com sucesso!`, type: 'success' });
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForEdit) return;

    try {
      const res = await fetch(`/api/admin/plans/${selectedPlanForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPlanForEdit)
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Plano atualizado com sucesso!', type: 'success' });
        setSelectedPlanForEdit(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAdvancedSettings = async (updated: SystemSettings) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsData(data.settings);
        setAlertMsg({ text: 'Configurações e parâmetros globais atualizados com sucesso!', type: 'success' });
      } else {
        setAlertMsg({ text: data.error || 'Erro ao guardar configurações.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ text: 'Falha na comunicação com o servidor.', type: 'error' });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsData) return;
    await handleSaveAdvancedSettings(settingsData);
  };

  const handleReplySupport = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/support/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText, status: 'resolved' })
      });
      if (res.ok) {
        setAlertMsg({ text: 'Resposta enviada com sucesso!', type: 'success' });
        setReplyTicketId(null);
        setReplyText('');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Admin Level Indicator */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">Painel de Controlo Administrativo</h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isSuperAdmin ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30' : 'bg-sky-400/20 text-sky-300 border border-sky-500/30'
              }`}>
                {isSuperAdmin ? 'SUPER ADMIN (LVL 1)' : 'GERENTE COMERCIAL (LVL 2)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSuperAdmin
                ? 'Auditoria, Banco de Dados, Permissões, Planos, Taxas e Validação de Vendas.'
                : 'Gestão Comercial: Ajuste de Preços de Planos, Relatórios de Vendas e Suporte ao Cliente.'}
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ATUALIZAR DADOS</span>
        </button>
      </div>

      {alertMsg && (
        <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
          alertMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#0F172A] border border-slate-800 p-1 rounded-xl flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'kpis' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Métricas & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'payments' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Validação Pagamentos</span>
          {stats?.kpis?.pendingValidationsCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded">
              {stats.kpis.pendingValidationsCount}
            </span>
          )}
        </button>

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab('bot_learning')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'bot_learning' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Robô Dúvidas & Aprendizagem</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy_packages')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'deploy_packages' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instalador Multiplataforma</span>
            </button>

            <button
              onClick={() => setActiveTab('statements')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'statements' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Extratos & Bónus</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'users' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Utilizadores</span>
            </button>

            <button
              onClick={() => setActiveTab('fiscal_ai')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'fiscal_ai' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>IA Fiscal & AGT</span>
            </button>

            <button
              onClick={() => setActiveTab('security_apis')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'security_apis' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Segurança & APIs</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'plans' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <Gem className="w-3.5 h-3.5 text-amber-400" />
          <span>Preços dos Planos</span>
        </button>

        <button
          onClick={() => setActiveTab('bank_accounts')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'bank_accounts' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-emerald-400" />
          <span>IBANs & Bancos</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-bold">
            {bankAccountsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'chat' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-400" />
          <span>Chat & Robô Suporte</span>
          {chatSessions.length > 0 && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-bold">
              {chatSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
            activeTab === 'support' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tickets</span>
        </button>

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'logs' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Logs & Auditoria</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Definições Empresa</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                activeTab === 'backup' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backups</span>
            </button>
          </>
        )}
      </div>

      {/* 1. TAB: KPIS & STATS */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Volume Total Vendas</p>
              <h2 className="text-2xl font-bold text-white font-mono">
                {(stats?.kpis?.totalRevenueKz || 0).toLocaleString('pt-PT')} Kz
              </h2>
              <span className="text-emerald-400 text-[10px] font-bold font-mono">
                Últimos 7 dias: {(stats?.kpis?.recentRevenueKz || 0).toLocaleString('pt-PT')} Kz
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Utilizadores Registados</p>
              <h2 className="text-2xl font-bold text-white font-mono">
                {stats?.kpis?.totalUsers || 0}
              </h2>
              <span className="text-emerald-400 text-[10px] font-bold font-mono">
                Ativos: {stats?.kpis?.activeUsers || 0} contas
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Simulações Realizadas</p>
              <h2 className="text-2xl font-bold text-sky-400 font-mono">
                {stats?.kpis?.totalQueriesPerformed || 0}
              </h2>
              <span className="text-slate-500 text-[10px] font-mono">
                Local: {stats?.queryBreakdown?.local || 0} | Imp: {stats?.queryBreakdown?.import || 0} | Lote: {stats?.queryBreakdown?.batch || 0}
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Pagamentos Pendentes</p>
              <h2 className="text-2xl font-bold text-amber-400 font-mono">
                {stats?.kpis?.pendingValidationsCount || 0}
              </h2>
              <span className="text-amber-400 text-[10px] font-bold font-mono">
                Requer validação no painel
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: VALIDAÇÃO DE PAGAMENTOS */}
      {activeTab === 'payments' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">Validação e Ativação de Pagamentos</h3>
              <p className="text-xs text-slate-400">Aprovar adiciona automaticamente os créditos e desbloqueia os módulos do cliente</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-mono">Nenhum pagamento registado.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Plano</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Pesquisas</th>
                    <th className="p-3">Ref / Comprovativo</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-100">{tx.userName}</p>
                        <p className="text-[10px] text-indigo-400 font-mono">{tx.userEmail}</p>
                      </td>
                      <td className="p-3 font-semibold">{tx.planName}</td>
                      <td className="p-3 font-bold font-mono text-slate-100 whitespace-nowrap">
                        {tx.amountKz.toLocaleString('pt-PT')} Kz
                      </td>
                      <td className="p-3 font-bold font-mono text-amber-400">+{tx.queriesGranted}</td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">
                        {tx.paymentReference || 'Sem referência'}
                        {tx.notes && <p className="text-[10px] text-slate-400 font-sans">{tx.notes}</p>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {tx.status === 'approved' ? 'Aprovado' : (tx.status === 'pending' ? 'Pendente' : 'Rejeitado')}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-right space-x-1 font-mono">
                        {tx.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleValidateTransaction(tx.id, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-xs transition"
                              title="Aprovar e Ativar"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleValidateTransaction(tx.id, 'reject')}
                              className="bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold px-2.5 py-1 rounded text-xs transition border border-rose-800"
                              title="Rejeitar"
                            >
                              Rejeitar
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500">Processado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: EXTRATOS, HISTÓRICO & BÓNUS DE UTILIZADORES */}
      {activeTab === 'statements' && isSuperAdmin && (
        <AdminStatementsTab
          usersList={usersList}
          isSuperAdmin={isSuperAdmin}
          onRefreshData={loadAllData}
        />
      )}

      {/* TAB: INTELIGÊNCIA ARTIFICIAL FISCAL & AGT */}
      {activeTab === 'fiscal_ai' && isSuperAdmin && (
        <AdminFiscalAiTab isSuperAdmin={isSuperAdmin} />
      )}

      {/* TAB: SEGURANÇA & INTEGRAÇÃO DE APIS */}
      {activeTab === 'security_apis' && isSuperAdmin && (
        <AdminSecurityApiTab isSuperAdmin={isSuperAdmin} />
      )}

      {/* 3. TAB: GESTÃO DE UTILIZADORES (Super Admin) */}
      {activeTab === 'users' && isSuperAdmin && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">Controlo de Utilizadores & Administradores</h3>
              <p className="text-xs text-slate-400">Adicionar administradores, ativar/desativar contas e gerir permissões</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por nome/email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedUserForEdit(null);
                  setUserFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    company: '',
                    role: 'user',
                    queriesRemaining: 10,
                    isImportUnlocked: false,
                    isBatchUnlocked: false,
                    isActive: true
                  });
                  setIsCreatingUser(true);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm uppercase tracking-tight"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Utilizador</span>
              </button>
            </div>
          </div>

          {/* User Form Modal if creating or editing */}
          {(isCreatingUser || selectedUserForEdit) && (
            <form onSubmit={handleSaveUser} className="bg-[#0F172A] border border-indigo-500/40 p-5 rounded-xl space-y-4 text-xs font-mono">
              <h4 className="font-bold text-slate-100 text-sm uppercase">
                {selectedUserForEdit ? `Editar ${selectedUserForEdit.name}` : 'Criar Novo Utilizador ou Administrador'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">
                    {selectedUserForEdit ? 'Nova Palavra-passe (Opcional)' : 'Palavra-passe Inicial *'}
                  </label>
                  <input
                    type="password"
                    required={!selectedUserForEdit}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder={selectedUserForEdit ? 'Manter inalterada' : '••••••••'}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Função / Nível de Acesso</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="user">Cliente / Utilizador Comum</option>
                    <option value="admin_level2">Administrador Nível 2 (Gerente Comercial)</option>
                    <option value="admin_level1">Super Administrador Nível 1 (Controlo Total)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Saldo de Consultas</label>
                  <input
                    type="number"
                    value={userFormData.queriesRemaining}
                    onChange={(e) => setUserFormData({ ...userFormData, queriesRemaining: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={userFormData.company}
                    onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={userFormData.isImportUnlocked}
                    onChange={(e) => setUserFormData({ ...userFormData, isImportUnlocked: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Desbloquear Módulo Importação</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={userFormData.isBatchUnlocked}
                    onChange={(e) => setUserFormData({ ...userFormData, isBatchUnlocked: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Desbloquear Módulo Lote Excel</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={userFormData.isActive}
                    onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Conta Ativa</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForEdit(null);
                    setIsCreatingUser(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs"
                >
                  Guardar Dados
                </button>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Nome & E-mail</th>
                  <th className="p-3">Função</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Consultas</th>
                  <th className="p-3">Importação</th>
                  <th className="p-3">Lote Excel</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {usersList
                  .filter((u) => {
                    const term = userSearchTerm.toLowerCase();
                    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
                  })
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-100">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin_level1'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                            : u.role === 'admin_level2'
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {u.role === 'admin_level1' ? 'Super Admin (N1)' : (u.role === 'admin_level2' ? 'Admin (N2)' : 'Cliente')}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer ${
                            u.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.isActive ? 'Ativo ✓' : 'Desativado ✕'}
                        </button>
                      </td>
                      <td className="p-3 font-bold font-mono text-amber-400">{u.queriesRemaining}</td>
                      <td className="p-3 font-mono">{u.isImportUnlocked ? '✓ Sim' : '✕ Não'}</td>
                      <td className="p-3 font-mono">{u.isBatchUnlocked ? '✓ Sim' : '✕ Não'}</td>
                      <td className="p-3 text-right font-mono">
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setUserFormData({
                              name: u.name,
                              email: u.email,
                              password: '',
                              phone: u.phone || '',
                              company: u.company || '',
                              role: u.role,
                              queriesRemaining: u.queriesRemaining,
                              isImportUnlocked: u.isImportUnlocked,
                              isBatchUnlocked: u.isBatchUnlocked,
                              isActive: u.isActive
                            });
                            setIsCreatingUser(false);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: PREÇOS & PRAZOS DOS PLANOS */}
      {activeTab === 'plans' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">Configuração de Planos, Preços e Prazos</h3>
              <p className="text-xs text-slate-400">Ajuste os valores em Kwanzas, número de pesquisas concedidas e validade</p>
            </div>
          </div>

          {selectedPlanForEdit && (
            <form onSubmit={handleSavePlan} className="bg-[#0F172A] border border-amber-500/40 p-5 rounded-xl space-y-4 text-xs font-mono">
              <h4 className="font-bold text-slate-100 text-sm uppercase">Editar {selectedPlanForEdit.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={selectedPlanForEdit.name}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Preço em Kwanzas (Kz)</label>
                  <input
                    type="number"
                    value={selectedPlanForEdit.priceKz}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, priceKz: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Quantidade de Pesquisas</label>
                  <input
                    type="number"
                    value={selectedPlanForEdit.queriesCount}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, queriesCount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Prazo de Validade (Dias)</label>
                  <input
                    type="number"
                    value={selectedPlanForEdit.validityDays}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, validityDays: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedPlanForEdit.unlocksImport}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, unlocksImport: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Desbloqueia Módulo de Importação</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedPlanForEdit.unlocksBatch}
                    onChange={(e) => setSelectedPlanForEdit({ ...selectedPlanForEdit, unlocksBatch: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Desbloqueia Módulo Lote Excel</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForEdit(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plansList.map((plan) => (
              <div key={plan.id} className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm font-mono">{plan.name}</h4>
                    <p className="text-xs text-emerald-400 font-bold font-mono mt-0.5">
                      {plan.priceKz.toLocaleString('pt-PT')} Kz
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlanForEdit(plan)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-mono"
                  >
                    Editar
                  </button>
                </div>

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p>Pesquisas: <strong className="text-amber-300">{plan.queriesCount}</strong></p>
                  <p>Validade: <strong className="text-slate-200">{plan.validityDays} dias</strong></p>
                  <p>Importação: <strong>{plan.unlocksImport ? '✓ Desbloqueia' : '✕ Bloqueado'}</strong></p>
                  <p>Lote Excel: <strong>{plan.unlocksBatch ? '✓ Desbloqueia' : '✕ Bloqueado'}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GESTÃO DE CONTAS BANCÁRIAS E IBANS */}
      {activeTab === 'bank_accounts' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Gestão de Contas Bancárias & IBANs Oficiais</span>
              </h3>
              <p className="text-xs text-slate-400">Estes IBANs são apresentados diretamente aos utilizadores no momento do pagamento por transferência.</p>
            </div>

            <button
              onClick={() => {
                setEditingBankAcc(null);
                setBankFormData({
                  bankName: '',
                  iban: '',
                  swift: '',
                  holder: 'NANUCLOUD - Tecnologia e Soluções Lda',
                  currency: 'AOA (Kz)'
                });
                setBankModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition w-fit shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Banco / IBAN</span>
            </button>
          </div>

          {/* Modal / Form */}
          {bankModalOpen && (
            <div className="bg-[#0F172A] border border-slate-700 p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-200 text-xs font-mono uppercase">
                {editingBankAcc ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta Bancária'}
              </h4>
              <form onSubmit={handleSaveBankAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nome do Banco *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Banco BAI, BFA, Millennium Atlântico, BIC"
                    value={bankFormData.bankName}
                    onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">IBAN *</label>
                  <input
                    type="text"
                    required
                    placeholder="AO06.0040.0000..."
                    value={bankFormData.iban}
                    onChange={(e) => setBankFormData({ ...bankFormData, iban: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Código SWIFT / BIC</label>
                  <input
                    type="text"
                    placeholder="Ex: BAIAOAAL"
                    value={bankFormData.swift}
                    onChange={(e) => setBankFormData({ ...bankFormData, swift: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Titular da Conta *</label>
                  <input
                    type="text"
                    required
                    value={bankFormData.holder}
                    onChange={(e) => setBankFormData({ ...bankFormData, holder: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBankModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs"
                  >
                    Guardar Conta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bank Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccountsList.map((acc) => (
              <div
                key={acc.id}
                className={`bg-[#0F172A] border ${acc.isActive ? 'border-slate-800' : 'border-rose-900/50 opacity-70'} p-4 rounded-xl space-y-3 font-mono text-xs`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-slate-100 text-sm">{acc.bankName}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      acc.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                    onClick={() => handleToggleBankAccountStatus(acc)}
                    title="Clique para alternar estado"
                  >
                    {acc.isActive ? 'ATIVO' : 'DESATIVADO'}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">IBAN</span>
                    <span className="text-indigo-300 font-bold select-all bg-slate-900 px-2 py-1 rounded block border border-slate-800 text-[11px]">
                      {acc.iban}
                    </span>
                  </div>

                  {acc.swift && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">SWIFT:</span>
                      <span className="text-slate-300 font-bold">{acc.swift}</span>
                    </div>
                  )}

                  <div className="text-[11px]">
                    <span className="text-slate-500">Titular:</span>{' '}
                    <span className="text-slate-200">{acc.holder}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setEditingBankAcc(acc);
                      setBankFormData({
                        bankName: acc.bankName,
                        iban: acc.iban,
                        swift: acc.swift || '',
                        holder: acc.holder,
                        currency: acc.currency || 'AOA (Kz)'
                      });
                      setBankModalOpen(true);
                    }}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBankAccount(acc.id)}
                    className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CHAT DE SUPORTE AO VIVO E BOT */}
      {activeTab === 'chat' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Atendimento de Suporte em Tempo Real (Admin / Robô)</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Quando o administrador responde, o usuário recebe a mensagem autenticada como Administrador Oficial. Caso offline, o Robô responde automaticamente.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Você está ONLINE como Administrador</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[520px]">
            {/* Sessions List */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                Sessões de Utilizadores ({chatSessions.length})
              </div>

              {chatSessions.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">
                  Nenhuma sessão de chat iniciada ainda.
                </div>
              ) : (
                chatSessions.map((sess) => (
                  <button
                    key={sess.sessionId}
                    onClick={() => handleSelectChatSession(sess.sessionId)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedChatSessionId === sess.sessionId
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-slate-100'
                        : 'bg-[#1E293B] border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-xs text-indigo-300 font-bold truncate block max-w-[150px]">
                        {sess.userName || 'Visitante'}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {new Date(sess.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {sess.userEmail && (
                      <p className="text-[10px] text-slate-400 truncate mb-1">{sess.userEmail}</p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate font-sans">
                      {sess.lastMessage || 'Nova mensagem...'}
                    </p>
                    <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500">
                      <span>{sess.totalMessages} mensagens</span>
                      <span className="text-amber-400">{sess.botHandled ? 'Atendido por Robô' : 'Interação Direta'}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Chat Conversation View */}
            <div className="md:col-span-2 bg-[#0F172A] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              {selectedChatSessionId ? (
                <>
                  <div className="bg-slate-900 p-3 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Conversa com a Sessão: <span className="text-indigo-400">{selectedChatSessionId}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectChatSession(selectedChatSessionId)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Atualizar"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#0A0F1D]">
                    {selectedSessionMessages.map((msg) => {
                      const isUser = msg.senderType === 'user';
                      const isAdmin = msg.senderType === 'admin';
                      const isBot = msg.senderType === 'bot';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isUser ? 'items-start' : isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                            {isAdmin && <Shield className="w-3 h-3 text-emerald-400" />}
                            {isBot && <Bot className="w-3 h-3 text-amber-400" />}
                            {isUser && <Users className="w-3 h-3 text-indigo-400" />}
                            <span className="font-semibold">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                              isUser
                                ? 'bg-[#1E293B] text-slate-200 border border-slate-700'
                                : isAdmin
                                ? 'bg-indigo-600 text-white shadow font-sans'
                                : 'bg-[#182234] text-slate-300 border border-amber-500/20 font-sans'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Reply Form */}
                  <form onSubmit={handleSendAdminChatReply} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder={`Responder como ${user.name} (Administrador)...`}
                      value={adminChatReply}
                      onChange={(e) => setAdminChatReply(e.target.value)}
                      className="flex-1 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!adminChatReply.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Responder</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Bot className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-xs">Selecione uma sessão à esquerda para visualizar e responder ao vivo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: SUPORTE & MODERAÇÃO */}
      {activeTab === 'support' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">Central de Atendimento ao Cliente & Suporte</h3>
            <p className="text-xs text-slate-400">Responder a dúvidas de utilizadores e pedidos de apoio</p>
          </div>

          {supportList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-mono">Nenhuma mensagem de suporte recebida.</p>
          ) : (
            <div className="space-y-3">
              {supportList.map((inquiry) => (
                <div key={inquiry.id} className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-100">{inquiry.name}</span>
                      <span className="text-slate-400 ml-2">({inquiry.email})</span>
                      <p className="text-indigo-400 font-semibold mt-0.5">{inquiry.subject}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      inquiry.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inquiry.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                    </span>
                  </div>

                  <p className="text-slate-300 bg-[#1E293B] p-2.5 rounded-lg">{inquiry.message}</p>

                  {inquiry.adminReply && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg">
                      <p className="text-[10px] text-emerald-400 font-bold">Resposta da Administração:</p>
                      <p className="text-slate-200">{inquiry.adminReply}</p>
                    </div>
                  )}

                  {replyTicketId === inquiry.id ? (
                    <div className="pt-2 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreva a resposta para o utilizador..."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyTicketId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleReplySupport(inquiry.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Enviar Resposta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyTicketId(inquiry.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1"
                    >
                      + Responder ao Ticket
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: AUDITORIA & LOGS (Super Admin) */}
      {activeTab === 'logs' && isSuperAdmin && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight">Logs de Atividade & Auditoria de Segurança</h3>
              <p className="text-xs text-slate-400">Rastreamento de acessos, logins, alterações administrativas e validações</p>
            </div>

            <input
              type="text"
              placeholder="Filtrar logs..."
              value={logFilterTerm}
              onChange={(e) => setLogFilterTerm(e.target.value)}
              className="bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Utilizador</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Detalhes</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                {logsList
                  .filter((l) => {
                    const term = logFilterTerm.toLowerCase();
                    return l.action.toLowerCase().includes(term) || l.details.toLowerCase().includes(term) || (l.userName && l.userName.toLowerCase().includes(term));
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('pt-PT')}
                      </td>
                      <td className="p-3 font-sans font-semibold text-slate-200">
                        {log.userName || 'Sistema'}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-300">{log.details}</td>
                      <td className="p-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB: CONFIGURAÇÕES GLOBAIS DA EMPRESA & SISTEMA (Super Admin) */}
      {activeTab === 'settings' && isSuperAdmin && settingsData && (
        <AdminAdvancedSettingsTab
          settingsData={settingsData}
          onSaveSettings={handleSaveAdvancedSettings}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* 8. TAB: BACKUPS DO SISTEMA & RESTAURO */}
      {activeTab === 'backup' && isSuperAdmin && (
        <AdminBackupTab isSuperAdmin={isSuperAdmin} />
      )}

      {/* 9. TAB: ROBÔ APRENDIZAGEM & DÚVIDAS (Super Admin) */}
      {activeTab === 'bot_learning' && isSuperAdmin && <AdminBotLearningTab />}

      {/* 10. TAB: INSTALADOR MULTIPLATAFORMA (Super Admin) */}
      {activeTab === 'deploy_packages' && isSuperAdmin && <AdminDeployPackageTab />}
    </div>
  );
};
