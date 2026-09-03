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
  AlertTriangle,
  Briefcase,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserSafe, UserRole } from '../../types';
import { INITIAL_STAFF_USERS } from '../../data/mockDatabase';

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
    const saved = localStorage.getItem('nanucloud_staff_users_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_STAFF_USERS;
  });

  const fetchUsersFromApi = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(data.users));
        }
      }
    } catch (e) {
      console.warn('Could not fetch server users:', e);
    }
  };

  useEffect(() => {
    fetchUsersFromApi();
  }, []);

  // Password reset modal state
  const [passwordModalUser, setPasswordModalUser] = useState<UserSafe | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPlainPassword, setShowPlainPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.trim().length < 4) {
      setPasswordErrorMsg('A palavra-passe deve conter pelo menos 4 caracteres.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${passwordModalUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordErrorMsg(data.error || 'Erro ao alterar palavra-passe.');
      } else {
        setPasswordSuccessMsg(data.message || `Palavra-passe de ${passwordModalUser.name} alterada com sucesso!`);
        showSaveNotice(`Palavra-passe de ${passwordModalUser.name} atualizada com sucesso!`);
        setTimeout(() => {
          setPasswordModalUser(null);
          setNewPassword('');
          setPasswordSuccessMsg('');
          fetchUsersFromApi();
        }, 1200);
      }
    } catch (err) {
      setPasswordErrorMsg('Erro ao comunicar com o servidor.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserSafe | null>(null);

  // Form fields for Create / Edit Staff User
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('NANUCLOUD');
  const [formDepartment, setFormDepartment] = useState<string>('Direção Geral');
  const [formCountry, setFormCountry] = useState<string>('Angola');
  const [formRole, setFormRole] = useState<UserRole>('manager');
  const [formQueries, setFormQueries] = useState<number>(10000);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formUnlockImport, setFormUnlockImport] = useState<boolean>(true);
  const [formUnlockBatch, setFormUnlockBatch] = useState<boolean>(true);
  const [formUnlockApi, setFormUnlockApi] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('NANUCLOUD Sede');
    setFormDepartment('Consultoria Fiscal');
    setFormCountry('Angola');
    setFormRole('manager');
    setFormQueries(10000);
    setFormIsActive(true);
    setFormUnlockImport(true);
    setFormUnlockBatch(true);
    setFormUnlockApi(false);
    setSecurityError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: UserSafe) => {
    const isTargetSuper = (user.role as string) === 'super_admin' || user.role === 'admin_level1' || user.role === 'admin';
    if (isTargetSuper && !isSuperAdmin) {
      alert('Acesso Restrito: Apenas um Super Administrador tem permissão para editar perfis de Super Administradores!');
      return;
    }

    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormCompany(user.company || 'NANUCLOUD');
    setFormDepartment(user.department || 'Operações');
    setFormCountry(user.country || 'Angola');
    setFormRole(user.role);
    setFormQueries(user.queriesRemaining);
    setFormIsActive(user.isActive);
    setFormUnlockImport(user.isImportUnlocked);
    setFormUnlockBatch(user.isBatchUnlocked);
    setFormUnlockApi(!!user.isApiUnlocked);
    setSecurityError(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

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
            department: formDepartment,
            country: formCountry,
            role: formRole,
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

      setUsers(updatedList);
      localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(updatedList));
      setEditingUser(null);
      showSaveNotice(`Perfil do colaborador "${formName}" atualizado com sucesso!`);
    } else {
      const newUser: UserSafe = {
        id: `staff_${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        company: formCompany.trim(),
        department: formDepartment,
        country: formCountry,
        role: formRole,
        permissionGroupId: formRole === 'super_admin' ? 'grp_super_admin' : formRole === 'admin_level2' ? 'grp_admin_level2' : 'grp_commercial',
        queriesRemaining: Number(formQueries) || 10000,
        totalQueriesUsed: 0,
        activePlanId: 'plan_staff_internal',
        activePlanName: `Licença Staff: ${formRole.toUpperCase()}`,
        planExpiresAt: null,
        isActive: formIsActive,
        isImportUnlocked: formUnlockImport,
        isBatchUnlocked: formUnlockBatch,
        isApiUnlocked: formUnlockApi,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null
      };

      const updatedList = [newUser, ...users];
      setUsers(updatedList);
      localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(updatedList));
      setIsCreateModalOpen(false);
      showSaveNotice(`Colaborador "${newUser.name}" criado com sucesso!`);
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
    localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(updatedList));
    showSaveNotice(user.isActive ? `Membro staff ${user.name} bloqueado!` : `Membro staff ${user.name} desbloqueado e ativo!`);
  };

  const handleSaveAll = () => {
    localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(users));
    onSaveSnapshot('Gestão de Utilizadores Internos (Staff)', users);
    showSaveNotice('Lista de colaboradores e permissões salvas com sucesso!');
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
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> UTILIZADORES DO SISTEMA (STAFF & RBAC)
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
              Equipa Interna
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
              Base Segregada de Clientes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Administração de operadores, gestores comerciais, administradores fiscais e super administradores do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Adicionar Membro Staff
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" /> Guardar Lista
          </button>
        </div>
      </div>

      {/* Info Card explaining separation */}
      <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Separação de Entidades:</strong> Clientes e empresas contratantes são geridos exclusivamente no módulo <strong>"Gestão de Clientes & CRM"</strong>.
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou email..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas as Funções Staff</option>
            <option value="super_admin">Super Administrador</option>
            <option value="admin_level2">Administrador Nível 2</option>
            <option value="manager">Gestor Comercial</option>
            <option value="user">Operador / Suporte</option>
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
            <option value="blocked">Apenas Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Colaborador / Departamento</th>
              <th className="p-3">Contacto & País</th>
              <th className="p-3">Função no Sistema</th>
              <th className="p-3">Consultas Staff</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Nenhum membro staff encontrado com os filtros aplicados.
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
                      {user.department && (
                        <div className="text-[10px] text-indigo-400 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-400" /> {user.department}
                        </div>
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
                            : user.role === 'admin_level2'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
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
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalUser(user);
                            setNewPassword('');
                            setShowPlainPassword(false);
                            setPasswordErrorMsg('');
                            setPasswordSuccessMsg('');
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                          title="Alterar Palavra-passe do Utilizador"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      )}

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
                <Shield className="w-4 h-4 text-indigo-400" />
                {editingUser ? `Editar Colaborador: ${editingUser.name}` : 'Cadastrar Membro da Equipa (Staff)'}
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
                  <label className="text-slate-400 block mb-1">Email Institucional *</label>
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
                  <label className="text-slate-400 block mb-1">Departamento / Área</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Direção Geral">Direção Geral</option>
                    <option value="Consultoria Fiscal">Consultoria Fiscal & Contabilidade</option>
                    <option value="Comercial & Vendas">Comercial & Vendas</option>
                    <option value="Suporte Técnico">Suporte Técnico</option>
                    <option value="Auditoria & TI">Auditoria & TI</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefone de Contacto</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Função / Perfil RBAC</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user">Operador / Suporte</option>
                    <option value="manager">Comercial / Gestor de Contas</option>
                    <option value="admin_level2">Administrador Nível 2</option>
                    {isSuperAdmin && <option value="super_admin">Super Administrador</option>}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Consultas Staff</label>
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
                <span className="text-[11px] text-slate-400 block font-bold">Módulos de Trabalho & Estado:</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockImport}
                      onChange={(e) => setFormUnlockImport(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-slate-200">Importação Aduaneira</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockBatch}
                      onChange={(e) => setFormUnlockBatch(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-slate-200">Lotes Excel</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formUnlockApi}
                      onChange={(e) => setFormUnlockApi(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-slate-200">Acesso API & Logs</span>
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
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal (Super Admin) */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E293B] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-slate-100">Redefinir Palavra-passe</h4>
                  <p className="text-[11px] text-slate-400">Super Administrador (Controlo Total)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Conta Selecionada:</span>
              <span className="text-sm font-bold text-slate-100 block">{passwordModalUser.name}</span>
              <span className="text-xs text-indigo-400 font-mono block">{passwordModalUser.email}</span>
            </div>

            {passwordErrorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {passwordSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showPlainPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Insira a nova senha (ex: *Angola@2030*)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 pr-10 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPlainPassword(!showPlainPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPlainPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-500">Mínimo 4 caracteres</span>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
                      let generated = '';
                      for (let i = 0; i < 10; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setNewPassword(generated);
                      setShowPlainPassword(true);
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Gerar Senha Forte
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-2 px-5 rounded-xl uppercase shadow cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isSubmittingPassword ? 'A guardar...' : 'Gravar Nova Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
