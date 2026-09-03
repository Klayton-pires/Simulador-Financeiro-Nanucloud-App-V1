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
  Users,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { UserSafe, UserRole, PermissionGroup } from '../types';
import { DEFAULT_PERMISSION_GROUPS } from '../data/permissions';

interface UsersManagementTabProps {
  currentUser: UserSafe;
  onRefresh?: () => void;
}

export const UsersManagementTab: React.FC<UsersManagementTabProps> = ({ currentUser, onRefresh }) => {
  const isSuperAdmin =
    currentUser.role === 'superadmin' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin_level1' ||
    currentUser.role === 'admin';
  const isAdmin = isSuperAdmin || currentUser.role === 'admin_level2';

  const [staffUsers, setStaffUsers] = useState<UserSafe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Password reset modal state
  const [passwordModalUser, setPasswordModalUser] = useState<UserSafe | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPlainPassword, setShowPlainPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);

  const fetchRealUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setStaffUsers(data.users);
          localStorage.setItem('nanucloud_staff_users_db', JSON.stringify(data.users));
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch server users, attempting cached:', e);
    }
    const saved = localStorage.getItem('nanucloud_staff_users_db');
    if (saved) {
      try {
        setStaffUsers(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRealUsers();
  }, []);

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
  const [formPassword, setFormPassword] = useState<string>('');
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>('');
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCompany, setFormCompany] = useState<string>('');
  const [formCountry, setFormCountry] = useState<string>('Angola');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formPermissionGroup, setFormPermissionGroup] = useState<string>('grp_commercial');
  const [formQueries, setFormQueries] = useState<number>(10000);
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
    setFormPassword('');
    setFormConfirmPassword('');
    setShowFormPassword(false);
    setFormPhone('');
    setFormCompany('NANUCLOUD');
    setFormCountry('Angola');
    setFormRole('staff');
    setFormPermissionGroup('grp_commercial');
    setFormQueries(10000);
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
    setFormPassword('');
    setFormConfirmPassword('');
    setShowFormPassword(false);
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setSecurityError('Nome e Email são campos obrigatórios.');
      return;
    }

    if (!editingUser) {
      if (!formPassword || formPassword.trim().length < 6) {
        setSecurityError('A palavra-passe é obrigatória para registar um membro Staff (mínimo 6 caracteres).');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setSecurityError('A confirmação da palavra-passe não coincide com a palavra-passe.');
        return;
      }
    } else if (formPassword && formPassword.trim().length < 6) {
      setSecurityError('A nova palavra-passe deve conter pelo menos 6 caracteres.');
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

    setIsSavingUser(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: formName.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          role: formRole,
          queriesRemaining: Number(formQueries) || 1000,
          isActive: formIsActive,
          isImportUnlocked: formUnlockImport,
          isBatchUnlocked: formUnlockBatch
        };
        if (formPassword && formPassword.trim().length >= 6) {
          payload.password = formPassword.trim();
        }

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setSecurityError(data.error || 'Erro ao atualizar dados do utilizador no servidor.');
          setIsSavingUser(false);
          return;
        }

        await fetchRealUsers();
        setEditingUser(null);
        setSaveSuccessMsg('Membro Staff atualizado com sucesso!');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim(),
            password: formPassword.trim(),
            phone: formPhone.trim(),
            company: formCompany.trim() || 'NANUCLOUD',
            role: formRole,
            queriesRemaining: Number(formQueries) || 10000,
            isImportUnlocked: formUnlockImport,
            isBatchUnlocked: formUnlockBatch
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setSecurityError(data.error || 'Erro ao criar conta de Staff no servidor.');
          setIsSavingUser(false);
          return;
        }

        await fetchRealUsers();
        setIsCreateModalOpen(false);
        setSaveSuccessMsg('Novo membro Staff criado com sucesso! As credenciais com senha foram registadas.');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (err) {
      setSecurityError('Falha ao comunicar com o servidor. Verifique a conexão.');
    } finally {
      setIsSavingUser(false);
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
        setPasswordErrorMsg(data.error || 'Erro ao atualizar palavra-passe.');
      } else {
        setPasswordSuccessMsg(data.message || `Palavra-passe de ${passwordModalUser.name} alterada com sucesso!`);
        setTimeout(() => {
          setPasswordModalUser(null);
          setNewPassword('');
          setPasswordSuccessMsg('');
          fetchRealUsers();
        }, 1200);
      }
    } catch (err) {
      setPasswordErrorMsg('Erro ao comunicar com o servidor.');
    } finally {
      setIsSubmittingPassword(false);
    }
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

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Adicionar Membro Staff
          </button>
        )}
      </div>

      {/* Diretriz de Segurança: Staff exclusivo por Admin no Backoffice */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs font-mono text-indigo-300">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-indigo-200">
            Regra de Segurança: Contas Staff Criadas Exclusivamente por Administradores no Backoffice
          </p>
          <p className="text-[11px] text-indigo-300/80 leading-relaxed">
            O registo público na tela de login destina-se estritamente a clientes finais para utilização dos simuladores no Front-End. Todas as contas de Staff (Administradores, Gestores e Operadores) só podem ser criadas aqui no Backoffice por um Administrador, com palavra-passe obrigatória definida no ato de registo.
          </p>
        </div>
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
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            setPasswordModalUser(user);
                            setNewPassword('');
                            setShowPlainPassword(false);
                            setPasswordErrorMsg('');
                            setPasswordSuccessMsg('');
                          }}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition"
                          title="Alterar Palavra-passe do Utilizador"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )}

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
                    <option value="staff">Técnico / Operador Staff</option>
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

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-bold">
                    {editingUser
                      ? 'Nova Palavra-passe Staff (Opcional - deixe em branco para manter a atual)'
                      : 'Palavra-passe de Acesso ao Backoffice * (Mínimo 6 caracteres)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? '••••••••' : 'Defina a palavra-passe do membro Staff'}
                      required={!editingUser}
                      minLength={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!editingUser && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-slate-400 font-bold">Confirmar Palavra-passe *</label>
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      placeholder="Repita a palavra-passe para confirmação"
                      required
                      minLength={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}
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

      {/* Modal Redefinição de Senha (Super Admin) */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Alterar Palavra-passe</h3>
                  <p className="text-xs text-slate-400">Super Administrador (Controlo de Credenciais)</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">Conta Selecionada:</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">{passwordModalUser.name}</div>
              <div className="text-xs text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" /> {passwordModalUser.email}
              </div>
            </div>

            {passwordErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {passwordSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">
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
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono pr-10 focus:outline-none"
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isSubmittingPassword ? 'A guardar...' : 'Confirmar e Gravar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
