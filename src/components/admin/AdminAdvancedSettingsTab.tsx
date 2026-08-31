import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Database,
  Tv,
  Phone,
  Shield,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Save,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Layers,
  Key,
  Users,
  AlertTriangle,
  CreditCard,
  Coins,
  Sparkles,
  Globe,
  Radio,
  Flag,
  Lock,
  CheckCircle2
} from 'lucide-react';
import {
  UserSafe,
  BankAccount,
  DatabaseEngineConfig,
  AdsenseSlotConfig,
  PermissionGroup,
  SystemPermissionKey,
  EmisReferencePaymentConfig,
  PaypalPaymentConfig,
  FreeTrialCreditsConfig,
  ConfigSnapshot,
  SystemSettings
} from '../../types';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_DB_ENGINES,
  INITIAL_ADSENSE_SLOTS
} from '../../data/mockDatabase';
import {
  SYSTEM_PERMISSIONS,
  DEFAULT_PERMISSION_GROUPS,
  hasUserPermission
} from '../../data/permissions';
import {
  COUNTRIES_DB,
  getHiddenCountryCodes,
  setHiddenCountryCodes,
  getCountryFlag
} from '../../data/countries';
import { ThemeSettingsSection } from './ThemeSettingsSection';
import { MarketingBroadcastSection } from './MarketingBroadcastSection';
import { UserClientManagementSection } from './UserClientManagementSection';
import { ConfigHistoryRevertSection, INITIAL_CONFIG_SNAPSHOTS } from './ConfigHistoryRevertSection';
import { LegalTermsAdminSection } from './LegalTermsAdminSection';
import { DatabaseSettingsSection } from './DatabaseSettingsSection';
import { Palette, Megaphone, History, Scale, Download, BookOpen, FileCode } from 'lucide-react';
import { ManualFiscalMatrixTab } from '../ManualFiscalMatrixTab';
import { FiscalAiNotificationsTab } from '../FiscalAiNotificationsTab';
import { MultiplatformHubTab } from '../MultiplatformHubTab';
import { DocumentationTab } from '../DocumentationTab';
import { DocsAndDeployTab } from '../DocsAndDeployTab';
import { SystemAuditSection } from './SystemAuditSection';
import { Activity } from 'lucide-react';

interface AdminAdvancedSettingsTabProps {
  currentUser?: UserSafe;
  settingsData?: SystemSettings | null;
  onSaveSettings?: (updated: SystemSettings) => Promise<void> | void;
  isSuperAdmin?: boolean;
  initialSection?:
    | 'banks'
    | 'databases'
    | 'adsense'
    | 'contacts'
    | 'rbac'
    | 'payments'
    | 'credits'
    | 'countries'
    | 'themes'
    | 'marketing'
    | 'users_clients'
    | 'history'
    | 'legal_terms'
    | 'fiscal_intelligence'
    | 'multiplatform'
    | 'manuals'
    | 'system_audit';
}

export const AdminAdvancedSettingsTab: React.FC<AdminAdvancedSettingsTabProps> = ({
  currentUser,
  settingsData,
  onSaveSettings,
  isSuperAdmin: isSuperAdminProp,
  initialSection
}) => {
  const safeUser = currentUser || {
    id: 'admin',
    name: 'Administrador do Sistema',
    email: 'admin@nanucloud.com',
    role: 'super_admin',
    credits: 999999,
    plan: 'enterprise'
  };

  const isSuperAdmin =
    isSuperAdminProp ??
    (safeUser.role === 'superadmin' ||
      safeUser.role === 'admin' ||
      safeUser.role === 'super_admin' ||
      safeUser.role === 'admin_level1');

  const [activeSection, setActiveSection] = useState<
    | 'banks'
    | 'databases'
    | 'adsense'
    | 'contacts'
    | 'rbac'
    | 'payments'
    | 'credits'
    | 'countries'
    | 'themes'
    | 'marketing'
    | 'users_clients'
    | 'history'
    | 'legal_terms'
    | 'fiscal_intelligence'
    | 'multiplatform'
    | 'manuals'
    | 'system_audit'
  >(initialSection || 'banks');

  const [fiscalSubTab, setFiscalSubTab] = useState<'ai' | 'matrix'>('ai');
  const [manualsSubTab, setManualsSubTab] = useState<'system' | 'deploy'>('system');

  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Hidden Countries State
  const [hiddenCountries, setHiddenCountriesList] = useState<string[]>(() => getHiddenCountryCodes());

  // 1. Bank Accounts State (Até 6 contas com visibilidade condicional)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('nanucloud_bank_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  // 2. Database Engines State (MySQL, MS SQL Server, PostgreSQL)
  const [dbEngines, setDbEngines] = useState<DatabaseEngineConfig[]>(() => {
    const saved = localStorage.getItem('nanucloud_db_engines');
    return saved ? JSON.parse(saved) : INITIAL_DB_ENGINES;
  });

  // 3. AdSense Slots State (3 slots no modo gratuito)
  const [adsenseSlots, setAdsenseSlots] = useState<AdsenseSlotConfig[]>(() => {
    const saved = localStorage.getItem('nanucloud_adsense_slots');
    return saved ? JSON.parse(saved) : INITIAL_ADSENSE_SLOTS;
  });

  // 4. Contact Phone Numbers & WhatsApps
  const [contacts, setContacts] = useState<{
    phones: string[];
    whatsapps: string[];
    supportEmail: string;
  }>(() => {
    const saved = localStorage.getItem('nanucloud_admin_contacts');
    return saved
      ? JSON.parse(saved)
      : {
          phones: ['+244 955 581 862', '+244 955 580 653'],
          whatsapps: ['+244 944 935 617', '+244 944 935 618'],
          supportEmail: 'suporte@nanucloud.com'
        };
  });

  // 5. RBAC Permission Groups
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(() => {
    const saved = localStorage.getItem('nanucloud_rbac_groups');
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSION_GROUPS;
  });

  // 6. Electronic Payments: EMIS Reference & PayPal State
  const [emisConfig, setEmisConfig] = useState<EmisReferencePaymentConfig>(() => {
    const saved = localStorage.getItem('nanucloud_emis_config');
    return saved
      ? JSON.parse(saved)
      : {
          entityCode: '00542',
          subEntityCode: '001',
          terminalId: 'TRM-98421',
          apiKey: 'emis_live_sec_994827103847',
          webhookSecret: 'whsec_nanu_emis_8832',
          autoActivate: true,
          minAmountKz: 5000
        };
  });

  const [paypalConfig, setPaypalConfig] = useState<PaypalPaymentConfig>(() => {
    const saved = localStorage.getItem('nanucloud_paypal_config');
    return saved
      ? JSON.parse(saved)
      : {
          clientId: 'AZ_paypal_client_id_live_992817482',
          clientSecret: 'EL_paypal_secret_live_001928472',
          receiverEmail: 'financeiro@nanucloud.com',
          mode: 'live',
          currency: 'USD',
          autoActivate: true
        };
  });

  const [gatewayToggles, setGatewayToggles] = useState({
    bankTransferEnabled: settingsData?.bankTransferEnabled ?? true,
    emisEnabled: settingsData?.emisEnabled ?? true,
    proxyPayEnabled: settingsData?.proxyPayEnabled ?? true,
    payPayEnabled: settingsData?.payPayEnabled ?? true,
    alipayEnabled: settingsData?.alipayEnabled ?? true,
    paypalEnabled: settingsData?.paypalEnabled ?? true,
    stripeEnabled: settingsData?.stripeEnabled ?? true
  });

  // 7. Free Trial Credits & On-Page Visitors Config
  const [creditsConfig, setCreditsConfig] = useState<FreeTrialCreditsConfig>(() => {
    const saved = localStorage.getItem('nanucloud_credits_config');
    return saved
      ? JSON.parse(saved)
      : {
          freeQueriesOnRegister: 10,
          freeQueriesForVisitors: 3,
          allowUnlimitedSimulationInTestMode: false
        };
  });

  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(
    permissionGroups[0] || null
  );

  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const showSaveNotice = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const syncToBackend = async (partial: Partial<SystemSettings>) => {
    try {
      if (onSaveSettings && settingsData) {
        await onSaveSettings({
          ...settingsData,
          ...partial
        });
      }
      window.dispatchEvent(new Event('nanucloud_settings_updated'));
    } catch (err) {
      console.error('Error syncing settings to backend:', err);
    }
  };

  // Snapshot recording for Super Admin audit & 1-click rollback
  const recordConfigSnapshot = (section: string, payload: any) => {
    try {
      const existingStr = localStorage.getItem('nanucloud_config_history');
      const existing: ConfigSnapshot[] = existingStr ? JSON.parse(existingStr) : INITIAL_CONFIG_SNAPSHOTS;
      const newSnap: ConfigSnapshot = {
        id: `snap_${Date.now()}`,
        section,
        sectionName: section,
        authorEmail: safeUser.email,
        authorName: safeUser.name,
        authorRole: safeUser.role,
        timestamp: new Date().toISOString(),
        summary: `Atualização e salvamento da área "${section}" por ${safeUser.name}.`,
        payload
      };
      const updated = [newSnap, ...existing.slice(0, 49)];
      localStorage.setItem('nanucloud_config_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving snapshot:', e);
    }
  };

  const handleRevertSnapshot = (snapshot: ConfigSnapshot) => {
    if (!snapshot || !snapshot.payload) return;
    const p = snapshot.payload;
    if (snapshot.section.includes('Bancárias') || snapshot.section === 'banks') {
      if (Array.isArray(p)) {
        setBankAccounts(p);
        localStorage.setItem('nanucloud_bank_accounts', JSON.stringify(p));
        syncToBackend({ bankAccounts: p });
      }
    } else if (snapshot.section.includes('Banco') || snapshot.section === 'databases') {
      if (Array.isArray(p)) {
        setDbEngines(p);
        localStorage.setItem('nanucloud_db_engines', JSON.stringify(p));
        syncToBackend({ dbEngines: p });
      }
    } else if (snapshot.section.includes('AdSense') || snapshot.section === 'adsense') {
      if (Array.isArray(p)) {
        setAdsenseSlots(p);
        localStorage.setItem('nanucloud_adsense_slots', JSON.stringify(p));
        syncToBackend({ googleAdsenseSlots: p });
      }
    } else if (snapshot.section.includes('Contactos') || snapshot.section === 'contacts') {
      setContacts(p);
      localStorage.setItem('nanucloud_admin_contacts', JSON.stringify(p));
      syncToBackend({
        companyPhone1: p.phones?.[0],
        companyPhone2: p.phones?.[1],
        whatsappSupport1: p.whatsapps?.[0],
        whatsappSupport2: p.whatsapps?.[1],
        supportEmail: p.supportEmail
      });
    } else if (snapshot.section.includes('RBAC') || snapshot.section === 'rbac') {
      if (Array.isArray(p)) {
        setPermissionGroups(p);
        localStorage.setItem('nanucloud_rbac_groups', JSON.stringify(p));
      }
    } else if (snapshot.section.includes('Créditos') || snapshot.section === 'credits') {
      setCreditsConfig(p);
      localStorage.setItem('nanucloud_credits_config', JSON.stringify(p));
      syncToBackend({
        freeQueriesOnRegister: p.freeQueriesOnRegister,
        freeQueriesDaily: p.freeQueriesForVisitors
      });
    } else if (snapshot.section.includes('Países') || snapshot.section === 'countries') {
      if (Array.isArray(p)) {
        setHiddenCountriesList(p);
        setHiddenCountryCodes(p);
      }
    }
    showSaveNotice(`Configurações de "${snapshot.sectionName}" restauradas com sucesso!`);
  };

  // Bank Account Handlers
  const handleBankChange = (id: string, field: keyof BankAccount, value: any) => {
    const updated = bankAccounts.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setBankAccounts(updated);
  };

  const handleSaveBanks = () => {
    localStorage.setItem('nanucloud_bank_accounts', JSON.stringify(bankAccounts));
    syncToBackend({ bankAccounts });
    recordConfigSnapshot('Coordenadas Bancárias (6)', bankAccounts);
    showSaveNotice('Coordenadas bancárias salvas com sucesso!');
  };

  // Database Engine Handlers
  const handleDbChange = (id: string, field: keyof DatabaseEngineConfig, value: any) => {
    const updated = dbEngines.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    setDbEngines(updated);
  };

  const handleTestDbConnection = (id: string) => {
    const updated = dbEngines.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          connectionStatus: 'connected' as const,
          lastTestedAt: new Date().toISOString()
        };
      }
      return d;
    });
    setDbEngines(updated);
    localStorage.setItem('nanucloud_db_engines', JSON.stringify(updated));
    showSaveNotice('Conexão ao banco de dados testada com sucesso!');
  };

  const handleSaveDbEngines = () => {
    localStorage.setItem('nanucloud_db_engines', JSON.stringify(dbEngines));
    syncToBackend({ dbEngines });
    recordConfigSnapshot('Motores de Banco (MySQL/MSSQL)', dbEngines);
    showSaveNotice('Motores de banco de dados gravados!');
  };

  // AdSense Handlers
  const handleAdsenseChange = (id: string, field: keyof AdsenseSlotConfig, value: any) => {
    const updated = adsenseSlots.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setAdsenseSlots(updated);
  };

  const handleSaveAdsense = () => {
    localStorage.setItem('nanucloud_adsense_slots', JSON.stringify(adsenseSlots));
    syncToBackend({ googleAdsenseSlots: adsenseSlots });
    recordConfigSnapshot('Google AdSense (3 Posições)', adsenseSlots);
    showSaveNotice('Configurações do Google AdSense salvas!');
  };

  // Contacts Handlers
  const handleSaveContacts = () => {
    localStorage.setItem('nanucloud_admin_contacts', JSON.stringify(contacts));
    syncToBackend({
      companyPhone1: contacts.phones?.[0],
      companyPhone2: contacts.phones?.[1],
      whatsappSupport1: contacts.whatsapps?.[0],
      whatsappSupport2: contacts.whatsapps?.[1],
      supportEmail: contacts.supportEmail
    });
    recordConfigSnapshot('Contactos & WhatsApp', contacts);
    showSaveNotice('Contactos de telemóvel e WhatsApp salvos!');
  };

  // Electronic Payments Handlers (EMIS, PayPal & Gateways)
  const handleSavePayments = () => {
    localStorage.setItem('nanucloud_emis_config', JSON.stringify(emisConfig));
    localStorage.setItem('nanucloud_paypal_config', JSON.stringify(paypalConfig));
    localStorage.setItem('nanucloud_gateway_toggles', JSON.stringify(gatewayToggles));
    syncToBackend({
      ...gatewayToggles,
      emisEntityId: emisConfig.entityCode,
      emisTerminalId: emisConfig.terminalId,
      emisApiKey: emisConfig.apiKey,
      emisWebhookUrl: emisConfig.webhookSecret,
      paypalClientId: paypalConfig.clientId,
      paypalSecret: paypalConfig.clientSecret,
      paypalReceiverEmail: paypalConfig.receiverEmail
    });
    recordConfigSnapshot('Modalidades de Pagamento & Gateways', { gatewayToggles, emisConfig, paypalConfig });
    showSaveNotice('Configurações de Canais de Pagamento salvas com sucesso!');
  };

  // Free Credits Handlers
  const handleSaveCredits = () => {
    localStorage.setItem('nanucloud_credits_config', JSON.stringify(creditsConfig));
    syncToBackend({
      freeQueriesOnRegister: creditsConfig.freeQueriesOnRegister,
      freeQueriesDaily: creditsConfig.freeQueriesForVisitors
    });
    window.dispatchEvent(new Event('nanucloud_credits_updated'));
    recordConfigSnapshot('Créditos Gratuitos & Pesquisas', creditsConfig);
    showSaveNotice('Configurações de créditos gratuitos atualizadas!');
  };

  // Country Visibility Handlers (Super Admin Only)
  const handleToggleCountryVisibility = (code: string) => {
    if (!isSuperAdmin) return;
    const isHidden = hiddenCountries.includes(code);
    const updated = isHidden
      ? hiddenCountries.filter((c) => c !== code)
      : [...hiddenCountries, code];

    setHiddenCountriesList(updated);
    setHiddenCountryCodes(updated);
    recordConfigSnapshot('Visibilidade de Países', updated);
    showSaveNotice(
      isHidden
        ? `País (${code}) agora está VISÍVEL para todos os utilizadores.`
        : `País (${code}) foi OCULTADO dos utilizadores para testes técnicos.`
    );
  };

  const handleUnhideAllCountries = () => {
    if (!isSuperAdmin) return;
    setHiddenCountriesList([]);
    setHiddenCountryCodes([]);
    recordConfigSnapshot('Visibilidade de Países', []);
    showSaveNotice('Todos os países estão agora visíveis no sistema!');
  };

  // RBAC Permission Handlers
  const handleTogglePermission = (permKey: SystemPermissionKey) => {
    if (!selectedGroup || !isSuperAdmin) return;

    const currentPerms = selectedGroup.permissions;
    const hasPerm = currentPerms.includes(permKey);
    const updatedPerms = hasPerm
      ? currentPerms.filter((p) => p !== permKey)
      : [...currentPerms, permKey];

    const updatedGroup = { ...selectedGroup, permissions: updatedPerms };
    setSelectedGroup(updatedGroup);

    const updatedList = permissionGroups.map((g) => (g.id === selectedGroup.id ? updatedGroup : g));
    setPermissionGroups(updatedList);
    localStorage.setItem('nanucloud_rbac_groups', JSON.stringify(updatedList));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !isSuperAdmin) return;

    const created: PermissionGroup = {
      id: `grp_${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Grupo personalizado de permissões',
      isSystemDefault: false,
      permissions: ['can_simulate_sales', 'can_simulate_services'],
      assignedUserIds: []
    };

    const updated = [...permissionGroups, created];
    setPermissionGroups(updated);
    setSelectedGroup(created);
    localStorage.setItem('nanucloud_rbac_groups', JSON.stringify(updated));
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupDesc('');
    showSaveNotice(`Grupo "${created.name}" criado com sucesso!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">DEFINIÇÕES AVANÇADAS & GOVERNANÇA</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Painel Central
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão de coordenadas bancárias, bancos de dados (MySQL/MSSQL), AdSense, múltiplos contactos e grupos RBAC
            </p>
          </div>
        </div>

        {savedBanner && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" /> {savedBanner}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'banks', label: '1. Coordenadas Bancárias (6)', icon: Building2 },
          { id: 'databases', label: '2. Motores de Banco (MySQL/MSSQL)', icon: Database },
          { id: 'adsense', label: '3. Google AdSense (3 Posições)', icon: Tv },
          { id: 'contacts', label: '4. Contactos & WhatsApp', icon: Phone },
          { id: 'rbac', label: '5. Grupos de Permissões (RBAC)', icon: Shield },
          { id: 'payments', label: '6. Pagamentos EMIS & PayPal', icon: CreditCard },
          { id: 'credits', label: '7. Créditos Gratuitos & Pesquisas', icon: Coins },
          { id: 'countries', label: '8. Visibilidade de Países', icon: Globe },
          { id: 'themes', label: '9. Temas da Aplicação', icon: Palette },
          { id: 'marketing', label: '10. Notificações & Marketing', icon: Megaphone },
          { id: 'users_clients', label: '11. Utilizadores do Sistema (Staff)', icon: Shield },
          { id: 'history', label: '12. Histórico & Reversão', icon: History },
          { id: 'legal_terms', label: '13. Termos de Uso & Políticas', icon: Scale },
          { id: 'fiscal_intelligence', label: '14. Inteligência Fiscal & Taxas', icon: Sparkles },
          { id: 'multiplatform', label: '15. Ecossistema & Apps (Multi-Plataformas)', icon: Download },
          { id: 'manuals', label: '16. Manuais Oficiais & Documentação', icon: BookOpen },
          { id: 'system_audit', label: '17. Auditoria Global do Sistema & Ficheiros', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeSection === tab.id
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

      {/* SECTION 1: COORDENADAS BANCÁRIAS */}
      {activeSection === 'banks' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" /> COORDENADAS BANCÁRIAS & CÓDIGOS SWIFT (ATÉ 6 CONTAS)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regra: Cada conta só fica visível para os clientes se a caixa de seleção correspondente estiver marcada e os dados preenchidos.
              </p>
            </div>

            <button
              onClick={handleSaveBanks}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Guardar Contas Bancárias
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((acc, index) => (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border transition-all text-xs font-mono space-y-3 ${
                  acc.isVisible
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={acc.isVisible}
                      onChange={(e) => handleBankChange(acc.id, 'isVisible', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-0 w-4 h-4"
                    />
                    <span>CONTA #{index + 1} — {acc.currency}</span>
                  </label>

                  <span className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                    acc.isVisible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {acc.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {acc.isVisible ? 'Visível na Faturação' : 'Oculta'}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NOME DA INSTITUIÇÃO BANCÁRIA</label>
                  <input
                    type="text"
                    value={acc.bankName}
                    onChange={(e) => handleBankChange(acc.id, 'bankName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nº DE CONTA</label>
                    <input
                      type="text"
                      value={acc.accountNumber}
                      onChange={(e) => handleBankChange(acc.id, 'accountNumber', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">CÓDIGO SWIFT / BIC</label>
                    <input
                      type="text"
                      value={acc.swift}
                      onChange={(e) => handleBankChange(acc.id, 'swift', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">IBAN INTERNACIONAL</label>
                  <input
                    type="text"
                    value={acc.iban}
                    onChange={(e) => handleBankChange(acc.id, 'iban', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TITULAR DA CONTA</label>
                  <input
                    type="text"
                    value={acc.holder}
                    onChange={(e) => handleBankChange(acc.id, 'holder', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: MOTORES DE BANCO DE DADOS (SQLITE 3 / MYSQL / MSSQL / POSTGRES) */}
      {activeSection === 'databases' && (
        <div className="space-y-6">
          <DatabaseSettingsSection currentUser={safeUser} isSuperAdmin={isSuperAdmin} />

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> CONEXÕES ADICIONAIS DE BANCO EXTERNO (MYSQL, MS SQL SERVER & POSTGRESQL)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configuração de instâncias remotas para sincronização com ERPs corporativos (Primavera, SAP, PHC).
                </p>
              </div>

              <button
                onClick={handleSaveDbEngines}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
              >
                <Save className="w-4 h-4" /> Gravar Configuração Externa
              </button>
            </div>

            <div className="space-y-4">
              {dbEngines.map((db) => (
                <div key={db.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {db.type.toUpperCase().slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">{db.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase">Engine: {db.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        db.connectionStatus === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {db.connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                      </span>

                      <button
                        onClick={() => handleTestDbConnection(db.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Testar Conexão
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">HOST / SERVIDOR</label>
                      <input
                        type="text"
                        value={db.host}
                        onChange={(e) => handleDbChange(db.id, 'host', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">PORTA TCP</label>
                      <input
                        type="number"
                        value={db.port}
                        onChange={(e) => handleDbChange(db.id, 'port', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">NOME DO BANCO DE DADOS</label>
                      <input
                        type="text"
                        value={db.database}
                        onChange={(e) => handleDbChange(db.id, 'database', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">UTILIZADOR</label>
                      <input
                        type="text"
                        value={db.username}
                        onChange={(e) => handleDbChange(db.id, 'username', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: GOOGLE ADSENSE (3 POSIÇÕES) */}
      {activeSection === 'adsense' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-400" /> GOOGLE ADSENSE (3 POSIÇÕES NO MODO GRATUITO)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle as 3 posições de anúncios exibidas exclusivamente aos utilizadores do plano gratuito / teste.
              </p>
            </div>

            <button
              onClick={handleSaveAdsense}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Guardar Slots AdSense
            </button>
          </div>

          <div className="space-y-4">
            {adsenseSlots.map((slot) => (
              <div key={slot.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">
                    SLOT #{slot.slotNumber} — {slot.title}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={slot.isActive}
                      onChange={(e) => handleAdsenseChange(slot.id, 'isActive', e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span>Ativo no Modo Gratuito</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">CÓDIGO DE CLIENTE / BLOCO ADSENSE</label>
                    <input
                      type="text"
                      value={slot.slotId}
                      onChange={(e) => handleAdsenseChange(slot.id, 'slotId', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">POSIÇÃO NO LAYOUT</label>
                    <select
                      value={slot.position}
                      onChange={(e) => handleAdsenseChange(slot.id, 'position', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="topo_banner">Topo da Simulação Gratuita</option>
                      <option value="lateral_banner">Barra Lateral de Notícias</option>
                      <option value="rodape_banner">Rodapé dos Resultados de Teste</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: MÚLTIPLOS CONTACTOS & WHATSAPP */}
      {activeSection === 'contacts' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> CONTACTOS DE TELEMÓVEL & WHATSAPP MÚLTIPLOS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regra: Os números de telemóvel e WhatsApp só ficam visíveis para os clientes se estiverem devidamente preenchidos.
              </p>
            </div>

            <button
              onClick={handleSaveContacts}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Salvar Contactos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Telemóveis */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" /> LINHAS DE TELEMÓVEL DE ATENDIMENTO
              </h4>
              {contacts.phones.map((phone, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      const updated = [...contacts.phones];
                      updated[idx] = e.target.value;
                      setContacts({ ...contacts, phones: updated });
                    }}
                    placeholder="+244 923 000 000"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {contacts.phones.length > 1 && (
                    <button
                      onClick={() => {
                        const updated = contacts.phones.filter((_, i) => i !== idx);
                        setContacts({ ...contacts, phones: updated });
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setContacts({ ...contacts, phones: [...contacts.phones, ''] })}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Outro Telemóvel
              </button>
            </div>

            {/* Whatsapps */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> NÚMEROS DE WHATSAPP EMPRESARIAL
              </h4>
              {contacts.whatsapps.map((wa, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={wa}
                    onChange={(e) => {
                      const updated = [...contacts.whatsapps];
                      updated[idx] = e.target.value;
                      setContacts({ ...contacts, whatsapps: updated });
                    }}
                    placeholder="+244 923 000 000"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {contacts.whatsapps.length > 1 && (
                    <button
                      onClick={() => {
                        const updated = contacts.whatsapps.filter((_, i) => i !== idx);
                        setContacts({ ...contacts, whatsapps: updated });
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setContacts({ ...contacts, whatsapps: [...contacts.whatsapps, ''] })}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Outro WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: GRUPOS DE PERMISSÃO RBAC (SUPER ADMIN) */}
      {activeSection === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" /> MATRIZ DE PERMISSÕES & GRUPOS DE ACESSO (RBAC)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lista completa com caixas de seleção de todas as funções, opções, atividades e módulos do programa.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all self-start shadow-md"
                >
                  <Plus className="w-4 h-4" /> Criar Novo Grupo de Acesso
                </button>
              )}
            </div>

            {/* Grid: Groups List + Granular Permissions Checkbox List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Groups Selector */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  GRUPOS REGISTADOS:
                </span>

                {permissionGroups.map((group) => {
                  const isSelected = selectedGroup?.id === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{group.name}</span>
                        {group.isSystemDefault && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{group.description}</p>
                      <span className="text-[10px] text-indigo-400 mt-1 block">
                        {group.permissions.length} Permissões Ativas
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Checkbox List of All Permissions */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                {selectedGroup ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-mono">
                          {selectedGroup.name} — Permissões em Lista
                        </h4>
                        <p className="text-xs text-slate-400">{selectedGroup.description}</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {selectedGroup.permissions.length} de {Object.keys(SYSTEM_PERMISSIONS).length} ativas
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {['simulacao', 'administracao', 'avancado', 'fiscal', 'marketing', 'suporte'].map((cat) => {
                        const permsInCat = Object.entries(SYSTEM_PERMISSIONS).filter(
                          ([_, def]) => def.category === cat
                        );

                        if (permsInCat.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-2">
                            <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
                              CATEGORIA: {cat.toUpperCase()}
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {permsInCat.map(([key, def]) => {
                                const isChecked = selectedGroup.permissions.includes(key as SystemPermissionKey);

                                return (
                                  <label
                                    key={key}
                                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all text-xs font-mono ${
                                      isChecked
                                        ? 'bg-indigo-500/10 border-indigo-500/40 text-slate-200'
                                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-950/80'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={!isSuperAdmin}
                                      onChange={() => handleTogglePermission(key as SystemPermissionKey)}
                                      className="rounded text-indigo-500 focus:ring-0 mt-0.5"
                                    />
                                    <div>
                                      <span className="font-bold block text-slate-100">{def.label}</span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">{def.description}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    Selecione um grupo de permissões à esquerda.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PAGAMENTOS ELETRÓNICOS (EMIS REFERÊNCIA & PAYPAL) */}
      {activeSection === 'payments' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> ATIVAÇÃO & GESTÃO DE CANAIS DE PAGAMENTO
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ative ou desative modalidades de pagamento em tempo real e configure as chaves de integração.
              </p>
            </div>

            <button
              onClick={handleSavePayments}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Guardar Todos os Gateways
            </button>
          </div>

          {/* Master Toggles: Front-end Immediate Visibility */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Controlo de Modalidades Ativas (Efeito Imediato no Checkout)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Marque ou desmarque para habilitar ou ocultar os métodos de pagamento para os clientes:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Transferência Bancária</div>
                    <div className="text-[10px] text-slate-400">IBANs BAI, BFA, BIC...</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.bankTransferEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, bankTransferEnabled: e.target.checked })}
                  className="rounded text-indigo-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">EMIS Multicaixa Express</div>
                    <div className="text-[10px] text-slate-400">Referência MCX / ATM</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.emisEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, emisEnabled: e.target.checked })}
                  className="rounded text-amber-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">ProxyPay Angola</div>
                    <div className="text-[10px] text-slate-400">Ref. Automática</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.proxyPayEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, proxyPayEnabled: e.target.checked })}
                  className="rounded text-purple-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-xs font-bold text-white">PayPay África</div>
                    <div className="text-[10px] text-slate-400">Carteira Digital</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.payPayEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, payPayEnabled: e.target.checked })}
                  className="rounded text-orange-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Alipay Global</div>
                    <div className="text-[10px] text-slate-400">China / Yuan (RMB)</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.alipayEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, alipayEnabled: e.target.checked })}
                  className="rounded text-blue-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-white">PayPal & Visa</div>
                    <div className="text-[10px] text-slate-400">Mastercard Internacional</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.paypalEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, paypalEnabled: e.target.checked })}
                  className="rounded text-sky-500 w-4 h-4 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Stripe Direct</div>
                    <div className="text-[10px] text-slate-400">Apple / Google Pay</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gatewayToggles.stripeEnabled}
                  onChange={(e) => setGatewayToggles({ ...gatewayToggles, stripeEnabled: e.target.checked })}
                  className="rounded text-emerald-500 w-4 h-4 focus:ring-0"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: EMIS Referência Multicaixa */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-xs">
                    EMIS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">PAGAMENTO POR REFERÊNCIA EMIS (ANGOLA)</h4>
                    <span className="text-[10px] text-slate-400">Multicaixa Express / ATM / Homebanking</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={emisConfig.autoActivate}
                    onChange={(e) => setEmisConfig({ ...emisConfig, autoActivate: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-bold">Auto-Ativação</span>
                </label>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">CÓDIGO DE ENTIDADE EMIS (EX: 00542):</label>
                  <input
                    type="text"
                    value={emisConfig.entityCode}
                    onChange={(e) => setEmisConfig({ ...emisConfig, entityCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SUB-ENTIDADE (OPCIONAL):</label>
                    <input
                      type="text"
                      value={emisConfig.subEntityCode || ''}
                      onChange={(e) => setEmisConfig({ ...emisConfig, subEntityCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">TERMINAL ID / CANAL:</label>
                    <input
                      type="text"
                      value={emisConfig.terminalId || ''}
                      onChange={(e) => setEmisConfig({ ...emisConfig, terminalId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">API KEY DE INTEGRAÇÃO EMIS (SECRETO):</label>
                  <input
                    type="password"
                    value={emisConfig.apiKey || ''}
                    onChange={(e) => setEmisConfig({ ...emisConfig, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">WEBHOOK SECRET / NOTIFICAÇÃO DE LIQUIDAÇÃO:</label>
                  <input
                    type="password"
                    value={emisConfig.webhookSecret || ''}
                    onChange={(e) => setEmisConfig({ ...emisConfig, webhookSecret: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                  Ao selecionar "Auto-Ativação", qualquer fatura ou recarga paga via Multicaixa libertará as consultas fiscais na conta do utilizador em tempo real sem intervenção manual.
                </div>
              </div>
            </div>

            {/* Box 2: PayPal Gateway */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs">
                    PP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">PAYPAL INTERNACIONAL (CARTÕES & SALDO)</h4>
                    <span className="text-[10px] text-slate-400">Checkout Global em USD / EUR</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={paypalConfig.autoActivate}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, autoActivate: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-bold">Auto-Ativação</span>
                </label>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PAYPAL CLIENT ID:</label>
                  <input
                    type="text"
                    value={paypalConfig.clientId}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, clientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PAYPAL SECRET KEY:</label>
                  <input
                    type="password"
                    value={paypalConfig.clientSecret || ''}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, clientSecret: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">E-MAIL DA CONTA RECEPTORA PAYPAL:</label>
                  <input
                    type="email"
                    value={paypalConfig.receiverEmail}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, receiverEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">MODO DE OPERAÇÃO:</label>
                    <select
                      value={paypalConfig.mode}
                      onChange={(e) => setPaypalConfig({ ...paypalConfig, mode: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="sandbox">Sandbox (Ambiente de Testes)</option>
                      <option value="live">Live (Produção Real)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">MOEDA DE RECEBIMENTO:</label>
                    <select
                      value={paypalConfig.currency}
                      onChange={(e) => setPaypalConfig({ ...paypalConfig, currency: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="USD">USD ($ - Dólar Americano)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
                  Clientes em Portugal, Brasil, China e resto do mundo podem pagar planos e consultas instantaneamente via PayPal ou cartões Visa/Mastercard internacionais.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 7: GESTÃO DE CRÉDITOS GRATUITOS NA PÁGINA & MODO TESTE */}
      {activeSection === 'credits' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" /> GESTÃO DE CRÉDITOS GRATUITOS & SIMULAÇÕES DE DEMONSTRAÇÃO
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina quantas consultas gratuitas cada utilizador ou visitante da página recebe sem pagar
              </p>
            </div>

            <button
              onClick={handleSaveCredits}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Guardar Créditos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: New Registers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-mono">BÓNUS DE NOVO REGISTO</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quantidade de consultas fiscais gratuitas creditadas automaticamente para todo novo utilizador ao criar conta:
              </p>
              <div className="pt-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={creditsConfig.freeQueriesOnRegister}
                  onChange={(e) => setCreditsConfig({ ...creditsConfig, freeQueriesOnRegister: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-indigo-300 focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Consultas gratuitas por conta nova</span>
              </div>
            </div>

            {/* Card 2: Anonymous Page Visitors */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-mono">VISITANTES NA PÁGINA (SEM LOGIN)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Consultas demonstrativas permitidas diretamente na página antes de solicitar registo:
              </p>
              <div className="pt-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={creditsConfig.freeQueriesForVisitors}
                  onChange={(e) => setCreditsConfig({ ...creditsConfig, freeQueriesForVisitors: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-300 focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Consultas livres de degustação</span>
              </div>
            </div>

            {/* Card 3: Test Mode Unlimited */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-mono">MODO TESTE / DEMO ILIMITADO</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permite simulações livres e ilimitadas para fins de demonstração ou testes de homologação:
              </p>
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creditsConfig.allowUnlimitedSimulationInTestMode}
                    onChange={(e) => setCreditsConfig({ ...creditsConfig, allowUnlimitedSimulationInTestMode: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-0"
                  />
                  <span className="text-xs font-mono font-bold text-slate-200">Ativar Simulações Ilimitadas</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 8: GESTÃO DE VISIBILIDADE DE PAÍSES (SUPER ADMINISTRADORES) */}
      {activeSection === 'countries' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" /> VISIBILIDADE DE PAÍSES & HOMOLOGAÇÃO FISCAL
                </h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Super Administrador
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Oculte países nos simuladores de comércio, serviços, importação e intermediários para impedir o uso por clientes antes de testados e prontos.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              {hiddenCountries.length > 0 && (
                <button
                  onClick={handleUnhideAllCountries}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Tornar Todos Visíveis
                </button>
              )}
            </div>
          </div>

          {/* Super Admin Notice Banner */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Controlo de Acesso e Homologação de Pautas Aduaneiras & Tributárias</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
              Países marcados como <strong>"Ocultado"</strong> desaparecem instantaneamente dos menus de seleção para utilizadores comuns e visitantes da plataforma. Como <strong>Super Administrador</strong>, continuará com acesso total a todos os países para realizar testes de pautas, taxas aduaneiras e cenários de homologação.
            </p>
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(COUNTRIES_DB).map((code) => {
              const country = COUNTRIES_DB[code];
              const isHidden = hiddenCountries.includes(code);

              return (
                <div
                  key={code}
                  className={`p-4 rounded-2xl border transition-all ${
                    isHidden
                      ? 'bg-slate-950/80 border-rose-500/40 opacity-75'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{getCountryFlag(code)}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                          <span>{country.name}</span>
                          <span className="text-[10px] text-slate-400">({country.curr})</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Fisco: {country.agency} | IVA: {country.vatOptions[0]?.r ?? 14}% | II: {country.ii}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isHidden
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Ocultado (Em Testes)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Visível para Todos</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleCountryVisibility(code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isHidden
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tornar Visível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ocultar País</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 9: TEMAS DA APLICAÇÃO */}
      {activeSection === 'themes' && (
        <ThemeSettingsSection
          onSaveSnapshot={recordConfigSnapshot}
          showSaveNotice={showSaveNotice}
        />
      )}

      {/* SECTION 10: NOTIFICAÇÕES & MARKETING */}
      {activeSection === 'marketing' && (
        <MarketingBroadcastSection
          onSaveSnapshot={recordConfigSnapshot}
          showSaveNotice={showSaveNotice}
        />
      )}

      {/* SECTION 11: GESTÃO DE UTILIZADORES & CLIENTES */}
      {activeSection === 'users_clients' && (
        <UserClientManagementSection
          currentUser={currentUser}
          onSaveSnapshot={recordConfigSnapshot}
          showSaveNotice={showSaveNotice}
        />
      )}

      {/* SECTION 12: HISTÓRICO & REVERSÃO */}
      {activeSection === 'history' && (
        <ConfigHistoryRevertSection
          currentUser={currentUser}
          onRevertSnapshot={handleRevertSnapshot}
          showSaveNotice={showSaveNotice}
        />
      )}

      {/* SECTION 13: GESTÃO DE TERMOS DE USO & POLÍTICAS LEGAIS */}
      {activeSection === 'legal_terms' && (
        <LegalTermsAdminSection
          onSaveSnapshot={recordConfigSnapshot}
          showSaveNotice={showSaveNotice}
        />
      )}

      {/* SECTION 14: INTELIGÊNCIA FISCAL & MATRIZ DE TAXAS (EXCLUSIVO ADMINS) */}
      {activeSection === 'fiscal_intelligence' && (
        <div className="space-y-4">
          <div className="bg-[#1E293B] border border-indigo-500/30 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Módulo de Definições Fiscais Administrativas</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono">
                Inteligência Fiscal & Governança de Taxas
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Controlo reservado à administração para regulação tributária, IA de notícias fiscais e matriz aduaneira.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0F172A] p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setFiscalSubTab('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  fiscalSubTab === 'ai'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>IA Fiscal & Alertas</span>
              </button>
              <button
                type="button"
                onClick={() => setFiscalSubTab('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  fiscalSubTab === 'matrix'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Matriz Global de Taxas</span>
              </button>
            </div>
          </div>

          {fiscalSubTab === 'ai' ? (
            <FiscalAiNotificationsTab currentUser={currentUser} />
          ) : (
            <ManualFiscalMatrixTab currentUser={currentUser} />
          )}
        </div>
      )}

      {/* SECTION 15: ECOSSISTEMA & APPS (MULTI-PLATAFORMAS) (EXCLUSIVO ADMINS) */}
      {activeSection === 'multiplatform' && (
        <div className="space-y-4">
          <div className="bg-[#1E293B] border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Download className="w-4 h-4" />
              <span>Gestão de Ecossistema & Apps Administrativo</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono">
              Downloads Multi-Plataformas & SDKs Oficiais
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Acesso administrativo aos binários portáteis Windows .exe, instaladores locais, gerador de esquemas SQL e integrações em 8 linguagens de programação.
            </p>
          </div>
          <MultiplatformHubTab currentUser={currentUser} />
        </div>
      )}

      {/* SECTION 16: MANUAIS OFICIAIS & DOCUMENTAÇÃO (EXCLUSIVO ADMINS) */}
      {activeSection === 'manuals' && (
        <div className="space-y-4">
          <div className="bg-[#1E293B] border border-indigo-500/30 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Documentação e Manuais Administrativos</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono">
                Manuais Oficiais, Guias de Servidor & PDF
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Manuais operacionais de clientes, equipa comercial, administradores e guias de implantação de servidor.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0F172A] p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setManualsSubTab('system')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  manualsSubTab === 'system'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manuais do Sistema & PDF</span>
              </button>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setManualsSubTab('deploy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                    manualsSubTab === 'deploy'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-rose-400 hover:text-rose-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Docs & Deploy Servidor</span>
                </button>
              )}
            </div>
          </div>

          {manualsSubTab === 'deploy' && isSuperAdmin ? (
            <DocsAndDeployTab currentUser={currentUser} />
          ) : (
            <DocumentationTab />
          )}
        </div>
      )}

      {/* SECTION 17: AUDITORIA COMPLETA DO SISTEMA, BASE DE DADOS & FICHEIROS */}
      {activeSection === 'system_audit' && (
        <SystemAuditSection currentUser={currentUser} />
      )}

    </div>
  );
};
