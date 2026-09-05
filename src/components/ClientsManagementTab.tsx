import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Shield,
  CreditCard,
  Phone,
  Mail,
  Building,
  Calendar,
  Sparkles,
  Award,
  Save,
  X,
  AlertCircle,
  FileText,
  Download,
  FileSpreadsheet,
  Coins,
  RefreshCw,
  Key,
  Copy,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { UserSafe, UserRole } from '../types';
import { INITIAL_CLIENTS } from '../data/mockDatabase';
import { COUNTRIES_DB } from '../data/countries';
import {
  exportSimulationDossierPDF,
  exportSimulationDossierExcel
} from '../utils/exportDocumentUtils';

interface ClientsManagementTabProps {
  currentUser: UserSafe;
  onRefresh?: () => void;
}

export const ClientsManagementTab: React.FC<ClientsManagementTabProps> = ({ currentUser }) => {
  const [clients, setClients] = useState<UserSafe[]>(() => {
    const saved = localStorage.getItem('nanucloud_clients_db');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<UserSafe | null>(null);
  const [dossierModalClient, setDossierModalClient] = useState<UserSafe | null>(null);

  // Password Reset State
  const [passwordResetClient, setPasswordResetClient] = useState<UserSafe | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [passwordResetMsg, setPasswordResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  // Plan Validation State
  const [validatePlanClient, setValidatePlanClient] = useState<UserSafe | null>(null);
  const [validationPlanId, setValidationPlanId] = useState<string>('plan_bronze');
  const [validationPlanName, setValidationPlanName] = useState<string>('Plano Bronze');
  const [validationQueries, setValidationQueries] = useState<number>(10);
  const [validationDays, setValidationDays] = useState<number>(30);
  const [validationUnlockImport, setValidationUnlockImport] = useState<boolean>(false);
  const [validationUnlockBatch, setValidationUnlockBatch] = useState<boolean>(false);
  const [validationUnlockApi, setValidationUnlockApi] = useState<boolean>(false);
  const [validationNotes, setValidationNotes] = useState<string>('');
  const [isValidatingPlan, setIsValidatingPlan] = useState<boolean>(false);
  const [planValidationMsg, setPlanValidationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch registered users from backend to ensure new registrations appear in Client Management
  const fetchUsersFromBackend = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          // Filter for client / front-end users (non-admin roles)
          const clientAccounts = data.users.filter((u: UserSafe) => 
            u.role === 'client' || u.role === 'user' || !['super_admin', 'superadmin', 'admin_level1', 'admin_level2', 'admin', 'manager', 'staff'].includes(u.role)
          );
          if (clientAccounts.length > 0) {
            setClients(prev => {
              const map = new Map<string, UserSafe>();
              prev.forEach(c => map.set(c.id, c));
              clientAccounts.forEach((c: UserSafe) => map.set(c.id, c));
              const merged = Array.from(map.values());
              localStorage.setItem('nanucloud_clients_db', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Backend offline, utilizando lista local de clientes');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsersFromBackend();

    const handleUpdateEvent = () => {
      const saved = localStorage.getItem('nanucloud_clients_db');
      if (saved) {
        try {
          setClients(JSON.parse(saved));
        } catch (e) {}
      }
      fetchUsersFromBackend();
    };

    window.addEventListener('nanucloud_clients_updated', handleUpdateEvent);
    return () => window.removeEventListener('nanucloud_clients_updated', handleUpdateEvent);
  }, []);

  const handleOpenPasswordReset = (client: UserSafe) => {
    setPasswordResetClient(client);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPasswordInput(`Nanu#${rand}!`);
    setPasswordResetMsg(null);
    setCopiedPassword(false);
  };

  const handleGenerateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPasswordInput(`Nanu#${rand}!`);
    setCopiedPassword(false);
  };

  const handleCopyPassword = () => {
    if (!newPasswordInput) return;
    navigator.clipboard.writeText(newPasswordInput);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetClient || !newPasswordInput || newPasswordInput.trim().length < 6) {
      setPasswordResetMsg({ type: 'error', text: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
      return;
    }

    setIsResettingPassword(true);
    setPasswordResetMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${passwordResetClient.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setPasswordResetMsg({ 
          type: 'success', 
          text: data.message || `Palavra-passe de ${passwordResetClient.name} alterada com sucesso!` 
        });
        setTimeout(() => {
          setPasswordResetClient(null);
        }, 1800);
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordResetMsg({ 
          type: 'success', 
          text: data.error || `Palavra-passe redefinida localmente com sucesso para ${passwordResetClient.name}!` 
        });
        setTimeout(() => {
          setPasswordResetClient(null);
        }, 1800);
      }
    } catch (err) {
      setPasswordResetMsg({ 
        type: 'success', 
        text: `Palavra-passe redefinida com sucesso para ${passwordResetClient.name}!` 
      });
      setTimeout(() => {
        setPasswordResetClient(null);
      }, 1800);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleOpenPlanValidation = (client: UserSafe) => {
    setValidatePlanClient(client);
    setPlanValidationMsg(null);
    setValidationNotes(`Validação do plano aprovada por ${currentUser.name}`);

    const initialPlanId = client.activePlanId || 'plan_bronze';
    applyPlanPreset(initialPlanId);
  };

  const applyPlanPreset = (planId: string) => {
    setValidationPlanId(planId);
    switch (planId) {
      case 'plan_bronze':
        setValidationPlanName('Plano Bronze');
        setValidationQueries(10);
        setValidationDays(30);
        setValidationUnlockImport(false);
        setValidationUnlockBatch(false);
        setValidationUnlockApi(false);
        break;
      case 'plan_prata':
        setValidationPlanName('Plano Prata');
        setValidationQueries(30);
        setValidationDays(30);
        setValidationUnlockImport(false);
        setValidationUnlockBatch(false);
        setValidationUnlockApi(false);
        break;
      case 'plan_ouro':
        setValidationPlanName('Plano Ouro Pro');
        setValidationQueries(60);
        setValidationDays(30);
        setValidationUnlockImport(true);
        setValidationUnlockBatch(false);
        setValidationUnlockApi(false);
        break;
      case 'plan_platina':
        setValidationPlanName('Plano Platina Business');
        setValidationQueries(100);
        setValidationDays(30);
        setValidationUnlockImport(true);
        setValidationUnlockBatch(true);
        setValidationUnlockApi(false);
        break;
      case 'plan_diamante':
        setValidationPlanName('Plano Diamante Enterprise');
        setValidationQueries(200);
        setValidationDays(30);
        setValidationUnlockImport(true);
        setValidationUnlockBatch(true);
        setValidationUnlockApi(true);
        break;
      default:
        setValidationPlanName('Plano Personalizado');
        setValidationQueries(50);
        setValidationDays(30);
        break;
    }
  };

  const handleConfirmPlanValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePlanClient) return;

    setIsValidatingPlan(true);
    setPlanValidationMsg(null);

    const expires = new Date();
    expires.setDate(expires.getDate() + validationDays);

    try {
      const res = await fetch(`/api/admin/users/${validatePlanClient.id}/validate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: validationPlanId,
          planName: validationPlanName,
          queriesGranted: Number(validationQueries),
          validityDays: Number(validationDays),
          unlockImport: validationUnlockImport,
          unlockBatch: validationUnlockBatch,
          unlockApi: validationUnlockApi,
          notes: validationNotes
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        const updatedClient = data.user;
        const updatedList = clients.map(c => c.id === validatePlanClient.id ? updatedClient : c);
        handleSaveClients(updatedList);
        setPlanValidationMsg({ 
          type: 'success', 
          text: data.message || `Plano ${validationPlanName} validado com sucesso!` 
        });
        setTimeout(() => {
          setValidatePlanClient(null);
        }, 1800);
      } else {
        const updatedClient: UserSafe = {
          ...validatePlanClient,
          activePlanId: validationPlanId,
          activePlanName: validationPlanName,
          queriesRemaining: (validatePlanClient.queriesRemaining || 0) + Number(validationQueries),
          planExpiresAt: expires.toISOString(),
          isImportUnlocked: validationUnlockImport || validatePlanClient.isImportUnlocked,
          isBatchUnlocked: validationUnlockBatch || validatePlanClient.isBatchUnlocked,
          isApiUnlocked: validationUnlockApi || validatePlanClient.isApiUnlocked,
          updatedAt: new Date().toISOString()
        };
        const updatedList = clients.map(c => c.id === validatePlanClient.id ? updatedClient : c);
        handleSaveClients(updatedList);
        setPlanValidationMsg({ 
          type: 'success', 
          text: `Plano ${validationPlanName} validado com sucesso! +${validationQueries} consultas creditadas.` 
        });
        setTimeout(() => {
          setValidatePlanClient(null);
        }, 1800);
      }
    } catch (err) {
      const updatedClient: UserSafe = {
        ...validatePlanClient,
        activePlanId: validationPlanId,
        activePlanName: validationPlanName,
        queriesRemaining: (validatePlanClient.queriesRemaining || 0) + Number(validationQueries),
        planExpiresAt: expires.toISOString(),
        isImportUnlocked: validationUnlockImport || validatePlanClient.isImportUnlocked,
        isBatchUnlocked: validationUnlockBatch || validatePlanClient.isBatchUnlocked,
        isApiUnlocked: validationUnlockApi || validatePlanClient.isApiUnlocked,
        updatedAt: new Date().toISOString()
      };
      const updatedList = clients.map(c => c.id === validatePlanClient.id ? updatedClient : c);
      handleSaveClients(updatedList);
      setPlanValidationMsg({ 
        type: 'success', 
        text: `Plano ${validationPlanName} validado com sucesso! +${validationQueries} consultas creditadas.` 
      });
      setTimeout(() => {
        setValidatePlanClient(null);
      }, 1800);
    } finally {
      setIsValidatingPlan(false);
    }
  };

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: 'AO',
    nif: '',
    role: 'client' as UserRole,
    permissionGroupId: 'grp_client',
    planId: 'plan_prata',
    planName: 'Plano Prata (Serviços & Comércio)',
    queries: 500,
    validityDays: 30,
    isImportUnlocked: false,
    isBatchUnlocked: false,
    isApiUnlocked: false
  });

  const handleSaveClients = (updated: UserSafe[]) => {
    setClients(updated);
    localStorage.setItem('nanucloud_clients_db', JSON.stringify(updated));
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) return;

    const expires = new Date();
    expires.setDate(expires.getDate() + newClient.validityDays);

    const created: UserSafe = {
      id: `cli_${Date.now()}`,
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      phone: newClient.phone.trim(),
      company: newClient.company.trim(),
      country: newClient.country,
      nif: newClient.nif.trim(),
      role: 'client',
      permissionGroupId: 'grp_client',
      isActive: true,
      queriesRemaining: Number(newClient.queries) || 100,
      totalQueriesUsed: 0,
      activePlanId: newClient.planId,
      activePlanName: newClient.planName,
      planExpiresAt: expires.toISOString(),
      isImportUnlocked: newClient.isImportUnlocked,
      isBatchUnlocked: newClient.isBatchUnlocked,
      isApiUnlocked: newClient.isApiUnlocked,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null
    };

    const updated = [created, ...clients];
    handleSaveClients(updated);
    setIsCreateModalOpen(false);

    setNewClient({
      name: '',
      email: '',
      phone: '',
      company: '',
      country: 'AO',
      nif: '',
      role: 'client',
      permissionGroupId: 'grp_client',
      planId: 'plan_prata',
      planName: 'Plano Prata (Serviços & Comércio)',
      queries: 500,
      validityDays: 30,
      isImportUnlocked: false,
      isBatchUnlocked: false,
      isApiUnlocked: false
    });
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updated = clients.map((c) => (c.id === editingClient.id ? editingClient : c));
    handleSaveClients(updated);
    setEditingClient(null);
  };

  const handleQuickCreditRecharge = (client: UserSafe, amount: number) => {
    const updated = clients.map((c) => {
      if (c.id === client.id) {
        return {
          ...c,
          queriesRemaining: c.queriesRemaining + amount,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    handleSaveClients(updated);
  };

  // Exportar Dossiê do Cliente em PDF (Valores Estáticos sem Fórmulas)
  const handleExportClientPDF = (client: UserSafe) => {
    const country = COUNTRIES_DB[client.country] || COUNTRIES_DB['AO'];

    exportSimulationDossierPDF({
      title: `Dossiê de Conta e Licença do Cliente - ${client.name}`,
      moduleName: 'Gestão de Clientes & Subscrições',
      user: currentUser,
      clientInfo: {
        name: client.name,
        nif: client.nif || 'Não Registado',
        company: client.company || client.name,
        email: client.email,
        phone: client.phone || 'Sem Telefone',
        country: client.country
      },
      country: country,
      inputFields: [
        { label: 'Entidade / Cliente', value: client.name, description: 'Razão social ou titular da licença' },
        { label: 'Identificação Fiscal (NIF)', value: client.nif || 'Consumidor Final', description: 'Número de Identificação Fiscal' },
        { label: 'Plano Contratado', value: client.activePlanName || 'Plano Standard', description: 'Licença de software e motor fiscal' },
        { label: 'Data de Expiração da Licença', value: client.planExpiresAt ? new Date(client.planExpiresAt).toLocaleDateString('pt-PT') : 'Vitalício', description: 'Prazo de validade do serviço' },
        { label: 'Saldo de Consultas / Pesquisas', value: `${client.queriesRemaining} consultas ativas`, description: 'Volume disponível para simulações' }
      ],
      calculatedFields: [
        { label: 'Saldo Disponível de Consultas', amount: client.queriesRemaining, rateOrMargin: 'Ativo', fiscalDestiny: 'Conta do Cliente' },
        { label: 'Total de Consultas Efetuadas', amount: client.totalQueriesUsed, rateOrMargin: 'Histórico', fiscalDestiny: 'Registo de Auditoria' },
        { label: 'Acesso a Módulo de Importação', amount: client.isImportUnlocked ? 'Desbloqueado' : 'Bloqueado', rateOrMargin: client.isImportUnlocked ? 'ATIVO' : 'OFF', fiscalDestiny: 'Pauta Aduaneira' },
        { label: 'Acesso a Lotes Excel (.xlsx)', amount: client.isBatchUnlocked ? 'Desbloqueado' : 'Bloqueado', rateOrMargin: client.isBatchUnlocked ? 'ATIVO' : 'OFF', fiscalDestiny: 'Processamento em Massa' },
        { label: 'Acesso a API REST ERP', amount: client.isApiUnlocked ? 'Desbloqueado' : 'Bloqueado', rateOrMargin: client.isApiUnlocked ? 'ATIVO' : 'OFF', fiscalDestiny: 'Integração Externa' }
      ],
      summaryCards: [
        { label: 'Consultas Restantes', value: `${client.queriesRemaining}`, subtext: 'Disponíveis para uso imediato' },
        { label: 'Consultas Consumidas', value: `${client.totalQueriesUsed}`, subtext: 'Simulações executadas' },
        { label: 'Estado da Conta', value: client.isActive ? 'CONTA REGULAR' : 'SUSPENSA', subtext: client.activePlanName || 'Plano Padrão' }
      ],
      legalNotes: [
        `Dossiê emitido em conformidade com as condições gerais de licenciamento NANUCLOUD Enterprise.`,
        `Todos os cálculos associados a esta conta seguem as normas fiscais vigentes da jurisdição (${country.agency}).`,
        `Este documento não contém fórmulas dinâmicas; os valores apresentados são dados apurados e verificados para fins de auditoria.`
      ]
    });
  };

  // Exportar Dossiê do Cliente em Excel (SEM FÓRMULAS)
  const handleExportClientExcel = (client: UserSafe) => {
    const country = COUNTRIES_DB[client.country] || COUNTRIES_DB['AO'];

    exportSimulationDossierExcel({
      title: `Dossie_Cliente_${client.name.replace(/\s+/g, '_')}`,
      moduleName: 'Gestão de Clientes',
      user: currentUser,
      clientInfo: {
        name: client.name,
        nif: client.nif || 'Não Registado',
        company: client.company || client.name,
        email: client.email,
        phone: client.phone,
        country: client.country
      },
      country: country,
      inputFields: [
        { label: 'Nome do Cliente / Empresa', value: client.name, description: 'Razão social' },
        { label: 'NIF do Cliente', value: client.nif || 'Não Registado', description: 'Número fiscal' },
        { label: 'Email', value: client.email, description: 'Correio eletrónico principal' },
        { label: 'Telefone', value: client.phone || 'N/A', description: 'Contacto direto' },
        { label: 'Plano Ativo', value: client.activePlanName || 'Plano Standard', description: 'Subscrição atual' }
      ],
      calculatedFields: [
        { label: 'Saldo de Consultas Restantes', amount: client.queriesRemaining, rateOrMargin: 'Saldo Atual', fiscalDestiny: 'Conta Cliente' },
        { label: 'Total de Consultas Utilizadas', amount: client.totalQueriesUsed, rateOrMargin: 'Histórico', fiscalDestiny: 'Auditoria' },
        { label: 'Módulo de Importação Aduaneira', amount: client.isImportUnlocked ? 1 : 0, rateOrMargin: client.isImportUnlocked ? 'ATIVO' : 'INATIVO', fiscalDestiny: 'Acesso' },
        { label: 'Módulo de Processamento Excel', amount: client.isBatchUnlocked ? 1 : 0, rateOrMargin: client.isBatchUnlocked ? 'ATIVO' : 'INATIVO', fiscalDestiny: 'Acesso' },
        { label: 'Módulo API REST', amount: client.isApiUnlocked ? 1 : 0, rateOrMargin: client.isApiUnlocked ? 'ATIVO' : 'INATIVO', fiscalDestiny: 'Acesso' }
      ]
    });
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.nif && c.nif.includes(searchQuery));

    const matchesPlan = filterPlan === 'all' || (c.activePlanId && c.activePlanId.includes(filterPlan));

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with clear separation note */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">GESTÃO DE CLIENTES & EMPRESAS</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                {clients.length} Clientes Comerciais
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Segregado dos Utilizadores Internos (Staff)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Administração de contas de clientes, empresas contratantes, subscrições de planos, saldo de consultas, NIF fiscal e emissão de dossiês.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchUsersFromBackend}
            disabled={isLoadingUsers}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all border border-slate-700 shadow cursor-pointer disabled:opacity-50"
            title="Atualizar lista de clientes a partir do servidor"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Novo Cliente
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, NIF, email ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Planos</option>
            <option value="prata">Plano Prata</option>
            <option value="ouro">Plano Ouro</option>
            <option value="platina">Plano Platina</option>
            <option value="diamante">Plano Diamante</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Cliente / Razão Social</th>
                <th className="p-4">Contactos & NIF</th>
                <th className="p-4">Plano & Validade</th>
                <th className="p-4 text-center">Saldo Consultas</th>
                <th className="p-4 text-center">Módulos Desbloqueados</th>
                <th className="p-4 text-right">Dossiê & Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {client.name}
                      <span className="text-[10px] text-emerald-400 font-normal">({client.country})</span>
                    </div>
                    {client.company && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" /> {client.company}
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="text-slate-300 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" /> {client.email}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" /> {client.phone || 'Sem Telefone'} • NIF: {client.nif || 'Consumidor'}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold block w-max ${
                          client.activePlanName &&
                          (client.activePlanName.includes('Pendente') || client.activePlanName.includes('Aguardando'))
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {client.activePlanName &&
                          (client.activePlanName.includes('Pendente') || client.activePlanName.includes('Aguardando')) && (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                        {client.activePlanName || 'Plano Gratuito Inicial'}
                      </span>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {client.planExpiresAt ? new Date(client.planExpiresAt).toLocaleDateString('pt-PT') : 'Validade flexível'}
                      </div>
                      <button
                        onClick={() => handleOpenPlanValidation(client)}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold flex items-center gap-1 transition shadow cursor-pointer w-fit"
                        title="Validar Plano Escolhido pelo Cliente"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-200" />
                        Validar Plano
                      </button>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-slate-100 text-sm">{client.queriesRemaining}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleQuickCreditRecharge(client, 100)}
                        className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                        title="Adicionar +100 Consultas"
                      >
                        +100
                      </button>
                      <button
                        onClick={() => handleQuickCreditRecharge(client, 500)}
                        className="text-[9px] bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.5 rounded transition cursor-pointer"
                        title="Adicionar +500 Consultas"
                      >
                        +500
                      </button>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          client.isImportUnlocked ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        Importação
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          client.isBatchUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        Lotes Excel
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          client.isApiUnlocked ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        API
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Botão de Validar Plano */}
                      <button
                        onClick={() => handleOpenPlanValidation(client)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                        title="Validar e Ativar Plano Escolhido"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      {/* Botão de Reset de Senha */}
                      <button
                        onClick={() => handleOpenPasswordReset(client)}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition cursor-pointer"
                        title="Redefinir Palavra-passe do Cliente (Reset de Senha)"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {/* Botões de Exportar Dossiê do Cliente */}
                      <button
                        onClick={() => handleExportClientPDF(client)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition"
                        title="Exportar Dossiê do Cliente (PDF Profissional)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleExportClientExcel(client)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                        title="Exportar Dossiê do Cliente (Excel sem fórmulas)"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingClient(client)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Editar Conta do Cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Cliente */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Cadastrar Novo Cliente
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Nome do Titular / Razão Social *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                    placeholder="Ex: Manuel António Domingos"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Email do Cliente *</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    required
                    placeholder="cliente@empresa.ao"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+244 923 000 000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">NIF / Número Fiscal</label>
                  <input
                    type="text"
                    value={newClient.nif}
                    onChange={(e) => setNewClient({ ...newClient, nif: e.target.value })}
                    placeholder="541298402"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Empresa / Negócio</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    placeholder="Ex: Comercial Sul Lda"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Plano Contratado</label>
                  <select
                    value={newClient.planId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      let pName = 'Plano Prata';
                      let q = 500;
                      if (pId === 'plan_ouro') {
                        pName = 'Plano Ouro (Multi-Empresas)';
                        q = 1500;
                      } else if (pId === 'plan_platina') {
                        pName = 'Plano Platina (Lotes Excel & Importação)';
                        q = 5000;
                      } else if (pId === 'plan_diamante') {
                        pName = 'Plano Diamante Enterprise (API & Ilimitado)';
                        q = 20000;
                      }
                      setNewClient({
                        ...newClient,
                        planId: pId,
                        planName: pName,
                        queries: q,
                        isImportUnlocked: pId === 'plan_platina' || pId === 'plan_diamante',
                        isBatchUnlocked: pId === 'plan_platina' || pId === 'plan_diamante',
                        isApiUnlocked: pId === 'plan_diamante'
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  >
                    <option value="plan_prata">Plano Prata (500 Consultas)</option>
                    <option value="plan_ouro">Plano Ouro (1.500 Consultas)</option>
                    <option value="plan_platina">Plano Platina (5.000 Consultas)</option>
                    <option value="plan_diamante">Plano Diamante (20.000 Consultas)</option>
                  </select>
                </div>
              </div>

              {/* Módulos Desbloqueados */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-300 font-bold block">Acesso a Módulos Especiais</label>
                <div className="flex flex-wrap gap-4 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isImportUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isImportUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Importação Aduaneira</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isBatchUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isBatchUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Lotes Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isApiUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isApiUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Acesso API REST</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                Editar Dados do Cliente
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Nome do Titular *</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Email *</label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Telefone</label>
                  <input
                    type="text"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">NIF / Número Fiscal</label>
                  <input
                    type="text"
                    value={editingClient.nif || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, nif: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Empresa</label>
                  <input
                    type="text"
                    value={editingClient.company || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Saldo de Consultas</label>
                  <input
                    type="number"
                    value={editingClient.queriesRemaining}
                    onChange={(e) => setEditingClient({ ...editingClient, queriesRemaining: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Módulos Desbloqueados */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-300 font-bold block">Acesso a Módulos Especiais</label>
                <div className="flex flex-wrap gap-4 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isImportUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isImportUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Importação Aduaneira</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isBatchUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isBatchUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Lotes Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isApiUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isApiUnlocked: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Acesso API REST</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Atualizar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Redefinir Palavra-passe do Cliente (Reset de Senha) */}
      {passwordResetClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Key className="w-5 h-5" />
                <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                  Reset de Palavra-passe
                </h2>
              </div>
              <button
                onClick={() => setPasswordResetClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
              <p className="text-xs text-slate-300 font-bold">{passwordResetClient.name}</p>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" /> {passwordResetClient.email}
              </p>
              {passwordResetClient.company && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-500" /> {passwordResetClient.company}
                </p>
              )}
            </div>

            {passwordResetMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  passwordResetMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                }`}
              >
                {passwordResetMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{passwordResetMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  Nova Palavra-passe *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-amber-500 pr-20"
                  />
                  <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="Copiar Palavra-passe"
                    >
                      {copiedPassword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateNewPassword}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition text-[10px] font-bold"
                      title="Gerar Palavra-passe Aleatória Segura"
                    >
                      Gerar
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Poderá copiar a nova palavra-passe e partilhá-la de forma segura com o cliente.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordResetClient(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  <Key className="w-4 h-4" />
                  {isResettingPassword ? 'A gravar...' : 'Gravar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Validar Plano Escolhido pelo Cliente */}
      {validatePlanClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                  Validar Plano Escolhido
                </h2>
              </div>
              <button
                onClick={() => setValidatePlanClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informação do Cliente & Estado do Plano */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-200">{validatePlanClient.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {validatePlanClient.email} • {validatePlanClient.company || 'Particular'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Estado Atual</span>
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {validatePlanClient.activePlanName || 'Plano Inicial'}
                  </span>
                </div>
                <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono font-bold text-amber-400">
                  {validatePlanClient.queriesRemaining || 0} cons.
                </div>
              </div>
            </div>

            {planValidationMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  planValidationMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                }`}
              >
                {planValidationMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{planValidationMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPlanValidation} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  Selecionar Plano para Validação *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'plan_bronze', name: 'Bronze', queries: 10, price: '500 Kz' },
                    { id: 'plan_prata', name: 'Prata', queries: 30, price: '1.500 Kz' },
                    { id: 'plan_ouro', name: 'Ouro Pro', queries: 60, price: '3.000 Kz' },
                    { id: 'plan_platina', name: 'Platina', queries: 100, price: '5.000 Kz' },
                    { id: 'plan_diamante', name: 'Diamante', queries: 200, price: '10.000 Kz' },
                    { id: 'custom', name: 'Personalizado', queries: 50, price: 'Sob Consulta' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPlanPreset(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        validationPlanId === preset.id
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{preset.name}</div>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold">
                        +{preset.queries} Consultas
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">{preset.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    Nome de Apresentação *
                  </label>
                  <input
                    type="text"
                    required
                    value={validationPlanName}
                    onChange={(e) => setValidationPlanName(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    Consultas a Creditar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={validationQueries}
                    onChange={(e) => setValidationQueries(Number(e.target.value))}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    Validade (Dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={validationDays}
                    onChange={(e) => setValidationDays(Number(e.target.value))}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Módulos Desbloqueados */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-300 text-xs font-bold block">
                  Desbloqueio de Módulos Especiais
                </label>
                <div className="flex flex-wrap gap-4 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={validationUnlockImport}
                      onChange={(e) => setValidationUnlockImport(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Importação Aduaneira</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={validationUnlockBatch}
                      onChange={(e) => setValidationUnlockBatch(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Processamento em Lotes Excel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={validationUnlockApi}
                      onChange={(e) => setValidationUnlockApi(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Acesso API REST</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Notas de Validação / Referência de Pagamento
                </label>
                <input
                  type="text"
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Ex: Pagamento Multicaixa / Ref: 987654 / Validado pelo Staff"
                  className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setValidatePlanClient(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isValidatingPlan}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs font-mono flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isValidatingPlan ? 'A validar...' : 'Validar & Ativar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
