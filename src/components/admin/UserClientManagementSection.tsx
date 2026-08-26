import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Search,
  Key,
  Coins,
  Mail,
  Phone,
  Building,
  Save,
  Check,
  AlertTriangle
} from 'lucide-react';
import { UserSafe, UserRole } from '../../types';

interface UserClientManagementSectionProps {
  currentUser: UserSafe;
  onSaveSnapshot: (section: string, payload: any) => void;
  showSaveNotice: (msg: string) => void;
}

export const UserClientManagementSection: React.FC<UserClientManagementSectionProps> = ({
  currentUser,
  onSaveSnapshot,
  showSaveNotice
}) => {
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.role === 'super_admin' || currentUser.role === 'admin_level1' || currentUser.role === 'admin';

  const [users, setUsers] = useState<UserSafe[]>(() => {
    const saved = localStorage.getItem('nanucloud_admin_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'usr_super_01',
        name: 'Joaquim Monteiro (Super Admin)',
        email: 'joaquim.monteiro@nanucloud.com',
        role: 'super_admin',
        country: 'Angola',
        phone: '+244 955 581 862',
        company: 'NANUCLOUD Lda',
        isActive: true,
        queriesRemaining: 99999,
        totalQueriesUsed: 342,
        activePlanId: 'plan_corporate',
        activePlanName: 'Licença Super Admin Vitalícia',
        planExpiresAt: null,
        isImportUnlocked: true,
        isBatchUnlocked: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        lastLoginAt: '2026-08-25T10:00:00Z'
      },
      {
        id: 'usr_comm_02',
        name: 'Maria Antónia (Comercial)',
        email: 'maria.comercial@nanucloud.com',
        role: 'manager',
        country: 'Angola',
        phone: '+244 955 580 653',
        company: 'NANUCLOUD Comercial',
        isActive: true,
        queriesRemaining: 500,
        totalQueriesUsed: 89,
        activePlanId: 'plan_pro',
        activePlanName: 'Plano Comercial Pro',
        planExpiresAt: '2026-12-31T23:59:59Z',
        isImportUnlocked: true,
        isBatchUnlocked: true,
        createdAt: '2026-02-15T00:00:00Z',
        updatedAt: '2026-02-15T00:00:00Z',
        lastLoginAt: '2026-08-24T14:30:00Z'
      },
      {
        id: 'usr_client_03',
        name: 'Carlos Silva & Associados',
        email: 'carlos.silva@translog.co.ao',
        role: 'client',
        country: 'Angola',
        phone: '+244 923 888 777',
        company: 'TransLogística Lda',
        nif: '500098231',
        isActive: true,
        queriesRemaining: 150,
        totalQueriesUsed: 42,
        activePlanId: 'plan_standard',
        activePlanName: 'Plano Médio Porte',
        planExpiresAt: '2026-10-15T00:00:00Z',
        isImportUnlocked: true,
        isBatchUnlocked: false,
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
        lastLoginAt: '2026-08-25T08:15:00Z'
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserSafe | null>(null);

  // Form fields for Create / Edit
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('');
  const [formNif, setFormNif] = useState<string>('');
  const [formCountry, setFormCountry] = useState<string>('Angola');
  const [formRole, setFormRole] = useState<UserRole>('client');
  const [formQueries, setFormQueries] = useState<number>(50);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formUnlockImport, setFormUnlockImport] = useState<boolean>(true);
  const [formUnlockBatch, setFormUnlockBatch] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormNif('');
    setFormCountry('Angola');
    setFormRole('client');
    setFormQueries(50);
    setFormIsActive(true);
    setFormUnlockImport(true);
    setFormUnlockBatch(false);
    setSecurityError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: UserSafe) => {
    // Security check: Super Admins can only be edited by Super Admins!
    const isTargetSuper = (user.role as string) === 'super_admin' || user.role === 'admin_level1' || user.role === 'admin';
    if (isTargetSuper && !isSuperAdmin) {
      alert('Acesso Restrito: Apenas um Super Administrador tem permissão para editar perfis de Super Administradores!');
      return;
    }

    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormCompany(user.company || '');
    setFormNif(user.nif || '');
    setFormCountry(user.country || 'Angola');
    setFormRole(user.role);
    setFormQueries(user.queriesRemaining);
    setFormIsActive(user.isActive);
    setFormUnlockImport(user.isImportUnlocked);
    setFormUnlockBatch(user.isBatchUnlocked);
    setSecurityError(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    // Rule: Non-superadmins cannot assign superadmin role
    const isAssigningSuper = (formRole as string) === 'super_admin' || formRole === 'admin_level1' || formRole === 'admin';
    if (isAssigningSuper && !isSuperAdmin) {
      setSecurityError('Não tem permissão para atribuir a função de Super Administrador.');
      return;
    }

    if (editingUser) {
      const updatedList = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim(),
            company: formCompany.trim(),
            nif: formNif.trim(),
            country: formCountry,
            role: formRole,
            queriesRemaining: Number(formQueries) || 0,
            isActive: formIsActive,
            isImportUnlocked: formUnlockImport,
            isBatchUnlocked: formUnlockBatch,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });

      setUsers(updatedList);
      localStorage.setItem('nanucloud_admin_users_list', JSON.stringify(updatedList));
      setEditingUser(null);
      showSaveNotice(`Perfil do utilizador "${formName}" atualizado com sucesso!`);
    } else {
      const newUser: UserSafe = {
        id: `usr_${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        company: formCompany.trim(),
        nif: formNif.trim(),
        country: formCountry,
        role: formRole,
        queriesRemaining: Number(formQueries) || 0,
        totalQueriesUsed: 0,
        activePlanId: 'plan_custom',
        activePlanName: 'Plano Atribuído pela Administração',
        planExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: formIsActive,
        isImportUnlocked: formUnlockImport,
        isBatchUnlocked: formUnlockBatch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null
      };

      const updatedList = [newUser, ...users];
      setUsers(updatedList);
      localStorage.setItem('nanucloud_admin_users_list', JSON.stringify(updatedList));
      setIsCreateModalOpen(false);
      showSaveNotice(`Utilizador "${newUser.name}" criado com sucesso!`);
    }
  };

  const handleToggleBlock = (user: UserSafe) => {
    const isTargetSuper = (user.role as string) === 'super_admin' || user.role === 'admin_level1' || user.role === 'admin';
    if (isTargetSuper && !isSuperAdmin) {
      alert('Operação bloqueada: Não é permitido suspender contas de Super Administrador sem privilégios master.');
      return;
    }

    const updatedList = users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updatedList);
    localStorage.setItem('nanucloud_admin_users_list', JSON.stringify(updatedList));
    showSaveNotice(user.isActive ? `Utilizador ${user.name} bloqueado!` : `Utilizador ${user.name} desbloqueado e ativo!`);
  };

  const handleSaveAll = () => {
    localStorage.setItem('nanucloud_admin_users_list', JSON.stringify(users));
    onSaveSnapshot('Gestão de Utilizadores & Clientes', users);
    showSaveNotice('Lista de utilizadores e permissões salvas com sucesso!');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'blocked' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> GESTÃO DE UTILIZADORES & PERFIS DE CLIENTES
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
              RBAC Protegido
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Criação, edição e verificação de clientes, comerciais e administradores. Super Administradores possuem proteção estrita.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Criar Utilizador
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" /> Guardar Lista
          </button>
        </div>
      </div>

      {/* Super Admin Security Notice */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono flex items-center gap-2 text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Regra de Segurança Estrita:</strong> Contas de <strong>Super Administrador</strong> apenas podem ser criadas ou editadas por outros Super Administradores autenticados.
        </span>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, email ou empresa..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas as Funções</option>
            <option value="client">Clientes</option>
            <option value="manager">Comerciais / Gestores</option>
            <option value="admin_level2">Administradores Nível 2</option>
            <option value="super_admin">Super Administradores</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Estados</option>
            <option value="active">Apenas Ativos</option>
            <option value="blocked">Apenas Bloqueados / Suspensos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Utilizador / Empresa</th>
              <th className="p-3">Contacto & País</th>
              <th className="p-3">Função & Permissões</th>
              <th className="p-3">Consultas</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Nenhum utilizador encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSuper = user.role === 'super_admin' || user.role === 'superadmin' || user.role === 'admin_level1';

                return (
                  <tr key={user.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                      {user.company && (
                        <div className="text-[10px] text-indigo-400 mt-0.5">{user.company}</div>
                      )}
                    </td>

                    <td className="p-3 text-slate-300">
                      <div>{user.phone || '—'}</div>
                      <div className="text-[10px] text-slate-400">{user.country}</div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isSuper
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : user.role === 'manager'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-emerald-400">{user.queriesRemaining}</span>
                      <span className="text-slate-500 text-[10px] block">Usadas: {user.totalQueriesUsed}</span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {user.isActive ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                        title="Editar Utilizador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBlock(user)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          user.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}
                        title={user.isActive ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                      >
                        {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* User Create / Edit Modal */}
      {(isCreateModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                {editingUser ? `Editar Utilizador: ${editingUser.name}` : 'Criar Novo Utilizador / Cliente'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 overflow-y-auto font-mono text-xs">
              {securityError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">NIF / NIPC</label>
                  <input
                    type="text"
                    value={formNif}
                    onChange={(e) => setFormNif(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Função / Perfil</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="client">Cliente</option>
                    <option value="manager">Comercial / Gestor</option>
                    <option value="admin_level2">Administrador Nível 2</option>
                    {isSuperAdmin && <option value="super_admin">Super Administrador</option>}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Consultas Disponíveis</label>
                  <input
                    type="number"
                    value={formQueries}
                    onChange={(e) => setFormQueries(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Module Unlocks & State */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-bold">Acessos & Módulos:</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockImport}
                      onChange={(e) => setFormUnlockImport(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-slate-200">Módulo de Importação</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockBatch}
                      onChange={(e) => setFormUnlockBatch(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-slate-200">Módulo em Lote (Excel)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    <span className="text-emerald-300 font-bold">Conta Ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl uppercase shadow cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
