import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
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
  AlertCircle
} from 'lucide-react';
import { UserSafe, UserRole, PermissionGroup } from '../types';
import { INITIAL_CLIENTS } from '../data/mockDatabase';
import { DEFAULT_PERMISSION_GROUPS } from '../data/permissions';
import { COUNTRIES_DB } from '../data/countries';

interface ClientsManagementTabProps {
  currentUser: UserSafe;
  onRefresh?: () => void;
}

export const ClientsManagementTab: React.FC<ClientsManagementTabProps> = ({ currentUser }) => {
  const [clients, setClients] = useState<UserSafe[]>(() => {
    const saved = localStorage.getItem('nanucloud_clients_db');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<UserSafe | null>(null);

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

  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin_level1';

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
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      company: newClient.company,
      country: newClient.country,
      nif: newClient.nif,
      role: newClient.role,
      permissionGroupId: newClient.permissionGroupId,
      isActive: true,
      queriesRemaining: newClient.queries,
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
    // Reset form
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

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'all' || c.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'admin_level1':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">Super Admin</span>;
      case 'admin':
      case 'admin_level2':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">Administrador</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">Gestor</span>;
      case 'user':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">Utilizador</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">Cliente</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">GESTÃO DE CLIENTES & UTILIZADORES</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {clients.length} Registados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulta de contas, histórico de consultas, alteração de planos e cadastro seguro sem exposição de palavras-passe
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
        >
          <UserPlus className="w-4 h-4" /> Cadastrar Novo Cliente
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email, telefone ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Níveis de Acesso</option>
            <option value="super_admin">Super Administrador</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gestor</option>
            <option value="user">Utilizador</option>
            <option value="client">Cliente</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Cliente / Entidade</th>
                <th className="p-4">Contactos</th>
                <th className="p-4">Nível / Cargo</th>
                <th className="p-4">Plano Atual</th>
                <th className="p-4 text-center">Saldo Consultas</th>
                <th className="p-4 text-center">Módulos Desbloqueados</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {client.name}
                      {client.country && (
                        <span className="text-[10px] text-slate-400">({client.country})</span>
                      )}
                    </div>
                    {client.company && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" /> {client.company}
                      </div>
                    )}
                  </td>
                  <td className="p-4 space-y-0.5">
                    <div className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-400" /> {client.email}
                    </div>
                    {client.phone && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {getRoleBadge(client.role)}
                  </td>
                  <td className="p-4">
                    <span className="text-slate-200 font-bold block">{client.activePlanName || 'Plano Básico'}</span>
                    {client.planExpiresAt && (
                      <span className="text-[10px] text-slate-400 block">
                        Expira: {new Date(client.planExpiresAt).toLocaleDateString('pt-PT')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                      {client.queriesRemaining > 99999 ? '∞ Ilimitado' : client.queriesRemaining.toLocaleString('pt-PT')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1.5">
                      <span title="Importação Aduaneira" className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${client.isImportUnlocked ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-600'}`}>
                        Import
                      </span>
                      <span title="Lotes Excel" className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${client.isBatchUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-600'}`}>
                        Excel
                      </span>
                      <span title="API REST" className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${client.isApiUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-600'}`}>
                        API
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      title="Editar Plano e Configurações"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar Novo Cliente */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">CADASTRAR NOVO CLIENTE / UTILIZADOR</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">NOME COMPLETO *</label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Carlos Silva"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">EMAIL INSTITUCIONAL *</label>
                  <input
                    type="email"
                    required
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="carlos@empresa.ao"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">TELEFONE / WHATSAPP</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="+244 923 000 000"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">EMPRESA / NIF</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Empresa Lda / 5410000000"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">NÍVEL DE CONTA (HIERARQUIA)</label>
                  <select
                    value={newClient.role}
                    onChange={(e) => setNewClient({ ...newClient, role: e.target.value as UserRole })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  >
                    {isSuperAdmin && <option value="super_admin">Super Administrador</option>}
                    {isSuperAdmin && <option value="admin">Administrador</option>}
                    <option value="manager">Gestor</option>
                    <option value="user">Utilizador Operador</option>
                    <option value="client">Cliente Assinante</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">PLANO ATRIBUÍDO</label>
                  <select
                    value={newClient.planId}
                    onChange={(e) => {
                      const id = e.target.value;
                      let name = 'Plano Prata';
                      let q = 500;
                      let imp = false;
                      let bat = false;
                      let api = false;
                      if (id === 'plan_ouro') { name = 'Plano Ouro'; q = 1000; bat = true; }
                      if (id === 'plan_diamante') { name = 'Plano Diamante'; q = 5000; imp = true; bat = true; api = true; }
                      if (id === 'plan_custom') { name = 'Plano Personalizado'; q = 10000; imp = true; bat = true; api = true; }
                      setNewClient({
                        ...newClient,
                        planId: id,
                        planName: name,
                        queries: q,
                        isImportUnlocked: imp,
                        isBatchUnlocked: bat,
                        isApiUnlocked: api
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="plan_prata">Plano Prata (500 Consultas)</option>
                    <option value="plan_ouro">Plano Ouro (1.000 Consultas + Lotes)</option>
                    <option value="plan_diamante">Plano Diamante (5.000 Consultas + Importação + API)</option>
                    <option value="plan_custom">Plano Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Módulos Desbloqueados Checkboxes */}
              <div className="pt-3 border-t border-slate-800">
                <label className="font-mono font-bold text-slate-300 block mb-2">MÓDULOS DESBLOQUEADOS PARA O CLIENTE:</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isImportUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isImportUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">Importação Aduaneira</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isBatchUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isBatchUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">Lotes Excel (.xlsx)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newClient.isApiUnlocked}
                      onChange={(e) => setNewClient({ ...newClient, isApiUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">API REST ERP</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Gravar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cliente / Alterar Plano (Super Admin Pode Mudar ao Seu Gosto) */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">EDITAR CLIENTE & ALTERAR PLANO</h3>
                  <p className="text-[11px] text-slate-400">{editingClient.name} ({editingClient.email})</p>
                </div>
              </div>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Regra de Proteção: Não permitir eliminar/despromover Super Admin principal se não for Super Admin */}
              {editingClient.role === 'super_admin' && !isSuperAdmin && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  Utilizadores sem nível de Super Administrador não podem modificar o Super Administrador.
                </div>
              )}

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">NOME DO CLIENTE</label>
                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">SALDO DE CONSULTAS</label>
                  <input
                    type="number"
                    value={editingClient.queriesRemaining}
                    onChange={(e) => setEditingClient({ ...editingClient, queriesRemaining: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">ALTERAR PLANO</label>
                  <select
                    value={editingClient.activePlanId || ''}
                    onChange={(e) => {
                      const pid = e.target.value;
                      let pname = 'Plano Personalizado';
                      if (pid === 'plan_prata') pname = 'Plano Prata';
                      if (pid === 'plan_ouro') pname = 'Plano Ouro';
                      if (pid === 'plan_diamante') pname = 'Plano Diamante';
                      setEditingClient({
                        ...editingClient,
                        activePlanId: pid,
                        activePlanName: pname
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="plan_prata">Plano Prata</option>
                    <option value="plan_ouro">Plano Ouro</option>
                    <option value="plan_diamante">Plano Diamante</option>
                    <option value="plan_custom">Plano Personalizado (Super Admin)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="font-mono font-bold text-slate-300 block mb-2">DESBLOQUEIO DE MÓDULOS AVANÇADOS:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isImportUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isImportUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">Módulo de Importação Aduaneira (Mar, Terra, Ar)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isBatchUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isBatchUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">Módulo de Operações em Lote via Excel (.xlsx)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingClient.isApiUnlocked}
                      onChange={(e) => setEditingClient({ ...editingClient, isApiUnlocked: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-0"
                    />
                    <span className="font-mono text-slate-200">Módulo de API REST para ERP e Lojas Online</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
