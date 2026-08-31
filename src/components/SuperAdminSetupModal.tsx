import React, { useState } from 'react';
import { UserSafe } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Building2,
  Phone,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Database,
  Globe,
  ArrowRight,
  Server
} from 'lucide-react';
import { COUNTRIES_DB } from '../data/countries';

interface SuperAdminSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete: (superAdminUser: UserSafe) => void;
}

export const SuperAdminSetupModal: React.FC<SuperAdminSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState<string>('Super Administrador NANU');
  const [email, setEmail] = useState<string>('root.admin@nanucloud.com');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [securityPin, setSecurityPin] = useState<string>('');

  // Enterprise details
  const [companyName, setCompanyName] = useState<string>('NANUCLOUD ENTERPRISE S.A.');
  const [nif, setNif] = useState<string>('5009842100');
  const [countryCode, setCountryCode] = useState<string>('AO');
  const [phone, setPhone] = useState<string>('+244 923 000 001');
  const [whatsapp, setWhatsapp] = useState<string>('+244 923 000 001');
  const [databaseEngine, setDatabaseEngine] = useState<'sqlite' | 'mysql' | 'mssql' | 'postgres'>('sqlite');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Preencha o nome e o e-mail oficial do Super Administrador.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('A palavra-passe deve conter no mínimo 6 caracteres seguros.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('A confirmação da palavra-passe não coincide.');
      return;
    }

    if (!securityPin || securityPin.length < 4) {
      setErrorMsg('Defina um PIN de Segurança de 4 a 6 dígitos para autorizações críticas.');
      return;
    }

    setStep(2);
  };

  const handleFinishSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyName.trim() || !phone.trim()) {
      setErrorMsg('Preencha o nome da empresa e o telefone principal de contacto.');
      return;
    }

    // Create Root Super Admin User
    const superAdminUser: UserSafe = {
      id: 'usr_super_admin_root',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: companyName.trim(),
      nif: nif.trim(),
      country: countryCode,
      role: 'super_admin',
      isActive: true,
      queriesRemaining: 999999,
      totalQueriesUsed: 0,
      activePlanId: 'plan_unlimited_root',
      activePlanName: 'Super Administrador Root (Ilimitado)',
      planExpiresAt: '2099-12-31T23:59:59.000Z',
      isImportUnlocked: true,
      isBatchUnlocked: true,
      isApiUnlocked: true,
      twoFactorEnabled: true,
      loginSmsEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Save configuration flags
    localStorage.setItem('nanucloud_super_admin_configured', 'true');
    localStorage.setItem('nanucloud_super_admin_pin', securityPin);
    localStorage.setItem('nanucloud_super_admin_engine', databaseEngine);
    localStorage.setItem(
      'nanucloud_company_profile',
      JSON.stringify({
        companyName,
        nif,
        countryCode,
        phone,
        whatsapp,
        email
      })
    );

    onComplete(superAdminUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#1E293B] border border-indigo-500/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-wider">
                  CONFIGURAÇÃO DO SUPER ADMINISTRADOR
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-mono font-bold">
                  Passo {step} de 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Opcional: Defina credenciais mestre de governança e dados institucionais da aplicação.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Fechar / Usar como Convidado"
            >
              ✕
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: CREDENCIAIS DO SUPER ADMIN */}
        {step === 1 && (
          <form onSubmit={handleNext} className="p-6 space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">NOME COMPLETO DO SUPER ADMINISTRADOR:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Engenheiro Mestre / Diretor de TI"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">E-MAIL INSTITUCIONAL PRINCIPAL (LOGIN ROOT):</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="root@nanucloud.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">PALAVRA-PASSE MESTRE:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">CONFIRMAR PALAVRA-PASSE:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a palavra-passe"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">PIN DE SEGURANÇA MESTRE (4 A 6 DÍGITOS):</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 884422"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-amber-300 font-bold tracking-widest focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Usado para autorizar limpezas de base de dados, exportação de credenciais e alterações de RBAC.
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                >
                  Pular / Entrar Direto
                </button>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
              >
                Prosseguir para Dados Institucionais <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DADOS DA EMPRESA E BANCO DE DADOS */}
        {step === 2 && (
          <form onSubmit={handleFinishSetup} className="p-6 space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">NOME DA EMPRESA / ENTIDADE:</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">NIF FISCAL:</label>
                  <input
                    type="text"
                    required
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">PAÍS SEDE:</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {Object.values(COUNTRIES_DB).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.curr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">TELEFONE OFICIAL:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">WHATSAPP SUPORTE:</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">MOTOR DE BANCO DE DADOS PREFERENCIAL:</label>
                <select
                  value={databaseEngine}
                  onChange={(e) => setDatabaseEngine(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="sqlite">SQLite 3 / Local Embedded (Pronto para Uso)</option>
                  <option value="mysql">MySQL 8.0+ Enterprise / MariaDB</option>
                  <option value="mssql">Microsoft SQL Server 2022</option>
                  <option value="postgres">PostgreSQL 16 Enterprise</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                Ao concluir, a sua conta receberá acesso completo e irrestrito a todos os módulos, incluindo o Docs & Deploy e a gestão de RBAC.
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ← Voltar
              </button>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Finalizar e Entrar como Super Admin
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
