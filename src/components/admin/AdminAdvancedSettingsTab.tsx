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
  AlertTriangle
} from 'lucide-react';
import {
  UserSafe,
  BankAccount,
  DatabaseEngineConfig,
  AdsenseSlotConfig,
  PermissionGroup,
  SystemPermissionKey
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

interface AdminAdvancedSettingsTabProps {
  currentUser: UserSafe;
}

export const AdminAdvancedSettingsTab: React.FC<AdminAdvancedSettingsTabProps> = ({ currentUser }) => {
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin_level1';

  const [activeSection, setActiveSection] = useState<'banks' | 'databases' | 'adsense' | 'contacts' | 'rbac'>('banks');

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
          phones: ['+244 923 000 111', '+244 944 222 333'],
          whatsapps: ['+244 923 000 111', '+244 931 777 888'],
          supportEmail: 'suporte@nanucloud.com'
        };
  });

  // 5. RBAC Permission Groups
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(() => {
    const saved = localStorage.getItem('nanucloud_rbac_groups');
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSION_GROUPS;
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

  // Bank Account Handlers
  const handleBankChange = (id: string, field: keyof BankAccount, value: any) => {
    const updated = bankAccounts.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setBankAccounts(updated);
  };

  const handleSaveBanks = () => {
    localStorage.setItem('nanucloud_bank_accounts', JSON.stringify(bankAccounts));
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
    showSaveNotice('Motores de banco de dados gravados!');
  };

  // AdSense Handlers
  const handleAdsenseChange = (id: string, field: keyof AdsenseSlotConfig, value: any) => {
    const updated = adsenseSlots.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setAdsenseSlots(updated);
  };

  const handleSaveAdsense = () => {
    localStorage.setItem('nanucloud_adsense_slots', JSON.stringify(adsenseSlots));
    showSaveNotice('Configurações do Google AdSense salvas!');
  };

  // Contacts Handlers
  const handleSaveContacts = () => {
    localStorage.setItem('nanucloud_admin_contacts', JSON.stringify(contacts));
    showSaveNotice('Contactos de telemóvel e WhatsApp salvos!');
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
          { id: 'rbac', label: '5. Grupos de Permissões (RBAC)', icon: Shield }
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

      {/* SECTION 2: MOTORES DE BANCO DE DADOS (MYSQL / MSSQL / POSTGRES) */}
      {activeSection === 'databases' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> MOTORES DE BANCO DE DADOS (MYSQL, MS SQL SERVER & POSTGRESQL)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configuração de instâncias para persistência transacional, auditoria e sincronização com ERPs corporativos.
              </p>
            </div>

            <button
              onClick={handleSaveDbEngines}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start"
            >
              <Save className="w-4 h-4" /> Gravar Configuração de Motores
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

    </div>
  );
};
