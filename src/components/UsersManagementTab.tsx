import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  Building,
  Save,
  Check,
  AlertTriangle,
  UserCheck,
  Users
} from 'lucide-react';
import { UserSafe, UserRole, PermissionGroup } from '../types';
import { DEFAULT_PERMISSION_GROUPS } from '../data/permissions';

interface UsersManagementTabProps {
  currentUser: UserSafe;
  onRefresh?: () => void;
}

export const UsersManagementTab: React.FC<UsersManagementTabProps> = ({ currentUser }) => {
  const isSuperAdmin =
    currentUser.role === 'superadmin' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin_level1' ||
    currentUser.role === 'admin';

  const [staffUsers, setStaffUsers] = useState<UserSafe[]>(() => {
    const saved = localStorage.getItem('nanucloud_staff_users_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'usr_super_01',
        name: 'Joaquim Monteiro (Super Administrador)',
        email: 'joaquim.monteiro@nanucloud.com',
        role: 'super_admin',
        country: 'Angola',
        phone: '+244 955 581 862',
        company: 'NANUCLOUD Direção Geral',
        permissionGroupId: 'grp_super_admin',
        isActive: true,
        queriesRemaining: 999999,
        totalQueriesUsed: 412,
        activePlanId: 'plan_superadmin',
        activePlanName: 'Licença Master Super Admin',
        planExpiresAt: null,
        isImportUnlocked: true,
        isBatchUnlocked: true,
        isApiUnlocked: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        lastLoginAt: '2026-08-25T16:00:00Z'
      },
      {
        id: 'usr_admin2_02',
        name: 'Dra. Teresa Bento (Diretora Fiscal / Admin)',
        email: 'teresa.bento@nanucloud.com',
        role: 'admin_level2',
        country: 'Angola',
        phone: '+244 955 580 653',
        company: 'NANUCLOUD Consultoria Fiscal',
        permissionGroupId: 'grp_admin_level2',
        isActive: true,
        queriesRemaining: 50000,
        totalQueriesUsed: 189,
        activePlanId: 'plan_pro',
        activePlanName: 'Licença Administrador Nível 2',
        planExpiresAt: '2026-12-31T23:59:59Z',
        isImportUnlocked: true,
        isBatchUnlocked: true,
        isApiUnlocked: true,
        createdAt: '2026-02-10T00:00:00Z',
        updatedAt: '2026-02-10T00:00:00Z',
        lastLoginAt: '2026-08-25T14:20:00Z'
      },
      {
        id: 'usr_mgr_03',
        name: 'Carlos Manuel (Gestor Comercial)',
        email: 'carlos.comercial@nanucloud.com',
        role: 'manager',
        country: 'Angola',
        phone: '+244 944 935 617',
        company: 'NANUCLOUD Vendas & Suporte',
        permissionGroupId: 'grp_commercial',
        isActive: true,
        queriesRemaining: 10000,
        totalQueriesUsed: 94,
        activePlanId: 'plan_pro',
        activePlanName: 'Plano Comercial & Vendas',
        planExpiresAt: '2026-12-31T23:59:59Z',
        isImportUnlocked: true,
        isBatchUnlocked: true,
        isApiUnlocked: false,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
        lastLoginAt: '2026-08-25T09:10:00Z'
      }
    ];
  });

  const [permissionGroups] = useState<PermissionGroup[]>(() => {
    const saved = localStorage.getItem('nanucloud_rbac_groups');
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSION_GROUPS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserSafe | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('');
  const [formCountry, setFormCountry] = useState<string>('Angola');
  const [formRole, setFormRole] = useState<UserRole>('manager');
  const [formPermissionGroup, setFormPermissionGroup] = useState<string>('grp_commercial');
  const [formQueries, setFormQueries] = useState<number>(1000);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formUnlockImport, setFormUnlockImport] = useState<boolean>(true);
  const [formUnlockBatch, setFormUnlockBatch] = useState<boolean>(true);
  const [formUnlockApi, setFormUnlockApi] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const saveStaffDb = (list: UserSafe[]) => {
    setStaffUsers(list);
    localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(list));
    setSaveSuccessMsg('Base de utilizadores do sistema atualizada com sucesso!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('NANUCLOUD');
    setFormCountry('Angola');
    setFormRole('manager');
    setFormPermissionGroup('grp_commercial');
    setFormQueries(1000);
    setFormIsActive(true);
    setFormUnlockImport(true);
    setFormUnlockBatch(true);
    setFormUnlockApi(false);
    setSecurityError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: UserSafe) => {
    const isTargetSuper =
      (user.role as string) === 'super_admin' ||
      user.role === 'admin_level1' ||
      user.role === 'admin';

    if (isTargetSuper && !isSuperAdmin) {
      alert('Acesso Restrito: Apenas um Super Administrador tem permissão para editar perfis de Super Administrador.');
      return;
    }

    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormCompany(user.company || 'NANUCLOUD');
    setFormCountry(user.country || 'Angola');
    setFormRole(user.role);
    setFormPermissionGroup(user.permissionGroupId || 'grp_commercial');
    setFormQueries(user.queriesRemaining);
    setFormIsActive(user.isActive);
    setFormUnlockImport(user.isImportUnlocked);
    setFormUnlockBatch(user.isBatchUnlocked);
    setFormUnlockApi(user.isApiUnlocked || false);
    setSecurityError(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setSecurityError('Nome e Email são campos obrigatórios.');
      return;
    }

    const isAssigningSuper =
      (formRole as string) === 'super_admin' ||
      formRole === 'admin_level1' ||
      formRole === 'admin';

    if (isAssigningSuper && !isSuperAdmin) {
      setSecurityError('Não tem permissão para atribuir a função de Super Administrador.');
      return;
    }

    if (editingUser) {
      const updated = staffUsers.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim(),
            company: formCompany.trim(),
            country: formCountry.trim(),
            role: formRole,
            permissionGroupId: formPermissionGroup,
            queriesRemaining: Number(formQueries) || 0,
            isActive: formIsActive,
            isImportUnlocked: formUnlockImport,
            isBatchUnlocked: formUnlockBatch,
            isApiUnlocked: formUnlockApi,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });
      saveStaffDb(updated);
      setEditingUser(null);
    } else {
      const newUser: UserSafe = {
        id: `staff_${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        company: formCompany.trim() || 'NANUCLOUD',
        country: formCountry.trim(),
        role: formRole,
        permissionGroupId: formPermissionGroup,
        isActive: formIsActive,
        queriesRemaining: Number(formQueries) || 1000,
        totalQueriesUsed: 0,
        activePlanId: 'plan_staff_internal',
        activePlanName: `Perfil Staff: ${formRole.toUpperCase()}`,
        planExpiresAt: null,
        isImportUnlocked: formUnlockImport,
        isBatchUnlocked: formUnlockBatch,
        isApiUnlocked: formUnlockApi,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null
      };
      saveStaffDb([newUser, ...staffUsers]);
      setIsCreateModalOpen(false);
    }
  };

  const handleToggleBlock = (target: UserSafe) => {
    const isTargetSuper =
      (target.role as string) === 'super_admin' ||
      target.role === 'admin_level1' ||
      target.role === 'admin';

    if (isTargetSuper && !isSuperAdmin) {
      alert('Operação bloqueada: Não é permitido suspender contas de Super Administrador.');
      return;
    }

    const updated = staffUsers.map((u) => (u.id === target.id ? { ...u, isActive: !u.isActive } : u));
    saveStaffDb(updated);
  };

  const filteredStaff = staffUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'blocked' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'admin_level1':
        return (
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> SUPER ADMIN MASTER
          </span>
        );
      case 'admin':
      case 'admin_level2':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> ADMIN NÍVEL 2
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> GESTOR COMERCIAL
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
            OPERADOR / STAFF
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">GESTÃO DE UTILIZADORES DO SISTEMA (STAFF)</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                {staffUsers.length} Membros da Equipa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Administração de administradores, gestores comerciais, operadores e grupos de permissão RBAC
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Adicionar Membro Staff
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" /> {saveSuccessMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar utilizador por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas as Funções</option>
            <option value="super_admin">Super Administrador</option>
            <option value="admin_level2">Administrador Nível 2</option>
            <option value="manager">Gestor Comercial</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Estados</option>
            <option value="active">Ativos</option>
            <option value="blocked">Suspensos</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Membro / Utilizador</th>
                <th className="p-4">Cargo / Função</th>
                <th className="p-4">Contactos</th>
                <th className="p-4 text-center">Permissões / Módulos</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" /> {user.email}
                    </div>
                    {user.company && (
                      <div className="text-[10px] text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-indigo-500" /> {user.company}
                      </div>
                    )}
                  </td>

                  <td className="p-4">{getRoleBadge(user.role)}</td>

                  <td className="p-4">
                    <div className="text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {user.phone || 'Sem telefone'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Último acesso: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-PT') : 'Sem registo'}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          user.isImportUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        Importação
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          user.isBatchUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        Lotes Excel
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded ${
                          user.isApiUnlocked ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        API
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3" /> Suspenso
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Editar Utilizador"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`p-1.5 rounded-lg transition ${
                            user.isActive
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                          title={user.isActive ? 'Suspender Conta' : 'Reativar Conta'}
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Utilizador Staff */}
      {(isCreateModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                {editingUser ? 'Editar Membro Staff' : 'Cadastrar Novo Utilizador Staff'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {securityError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-400 flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {securityError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Nome Completo *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Email Corporativo *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+244 955 581 862"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Departamento / Empresa</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="NANUCLOUD"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Função / Cargo Staff *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  >
                    {isSuperAdmin && <option value="super_admin">Super Administrador (Acesso Total)</option>}
                    <option value="admin_level2">Administrador Nível 2</option>
                    <option value="manager">Gestor Comercial & Atendimento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Grupo RBAC</label>
                  <select
                    value={formPermissionGroup}
                    onChange={(e) => setFormPermissionGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                  >
                    {permissionGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Módulos Desbloqueados */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-300 font-bold block">Privilégios de Módulos</label>
                <div className="flex flex-wrap gap-4 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockImport}
                      onChange={(e) => setFormUnlockImport(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    <span>Importação Aduaneira</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockBatch}
                      onChange={(e) => setFormUnlockBatch(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    <span>Lotes Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockApi}
                      onChange={(e) => setFormUnlockApi(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    <span>Acesso API REST ERP</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
