import React from 'react';
import { UserSafe } from '../types';
import { canUserSimulate, isStaffOrAdmin, isClientUser } from '../utils/accessControl';
import { useGuestCredits } from '../utils/guestCredits';
import { AlertCircle, Sparkles, Lock, ArrowRight, UserPlus, LogIn, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ClientCreditNoticeBannerProps {
  user: UserSafe | null;
  moduleName?: string;
  onOpenPlans: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ClientCreditNoticeBanner: React.FC<ClientCreditNoticeBannerProps> = ({
  user,
  moduleName = 'este simulador',
  onOpenPlans,
  onOpenAuth
}) => {
  const guestCredits = useGuestCredits();
  const check = canUserSimulate(user);

  // If user is Staff or Admin, show subtle staff badge
  if (user && isStaffOrAdmin(user.role)) {
    return (
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-300 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Sessão ativa como <strong className="text-emerald-300">{user.name}</strong> ({user.role}) — Acesso Staff / Administrador
          </span>
        </div>
        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
          Simulação Livre
        </span>
      </div>
    );
  }

  // If user is not logged in (Guest with free credits):
  if (!user) {
    if (guestCredits > 0) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-indigo-500/15 border border-emerald-500/30 text-xs font-sans text-slate-200 mb-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <span>Créditos Grátis de Demonstração Ativos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-bold">
                  Sem Login Necessário
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                Pode usar as suas <strong className="text-emerald-300 font-bold">{guestCredits} consultas gratuitas</strong> sem precisar de fazer login! Preencha os campos abaixo e clique em confirmar para calcular na hora.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Saldo Grátis: <strong className="text-emerald-400">{guestCredits}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-mono text-[11px] transition shadow cursor-pointer active:scale-95"
              title="Inicie sessão se pretender guardar históricos em nuvem"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          </div>
        </div>
      );
    }

    // Guest exhausted all free credits
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-500/15 border border-amber-500/30 text-xs font-sans text-slate-200 mb-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="font-bold text-amber-200 flex items-center gap-1.5">
              <span>Consultas Gratuitas Esgotadas</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                Saldo: 0
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
              Esgotou as suas consultas gratuitas de demonstração. Crie uma conta de cliente ou inicie sessão para adquirir créditos e continuar a simular sem restrições.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[11px] transition shadow cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sessão</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registar Conta</span>
          </button>
          <button
            type="button"
            onClick={onOpenPlans}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[11px] transition shadow cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Planos</span>
          </button>
        </div>
      </div>
    );
  }

  // If user is a client with 0 credits:
  if (isClientUser(user.role) && check.reason === 'no_credits') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-sans text-rose-200 mb-4 shadow-sm animate-in fade-in duration-150">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="font-bold text-rose-300 flex items-center gap-2 font-mono">
              <span>SEM CRÉDITOS NA CONTA (SALDO: 0)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/20 text-rose-200 rounded border border-rose-500/40">
                Cliente Front-End
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
              Como utilizador cliente, é obrigatório ter créditos ativos na conta para processar qualquer simulação nos módulos. Carregue o seu saldo ou subscreva um plano para desbloquear cálculos imediatos.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenPlans}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono font-bold text-xs transition shadow-md cursor-pointer shrink-0 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Adquirir Créditos / Planos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // If client has active credits: show positive summary pill
  return (
    <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 mb-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Conta de Cliente: <strong className="text-slate-200">{user.name}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <span>Saldo: <strong className="text-amber-400 font-bold">{user.queriesRemaining}</strong> consultas</span>
        <button
          type="button"
          onClick={onOpenPlans}
          className="text-indigo-400 hover:text-indigo-300 underline font-bold"
        >
          +Recarregar
        </button>
      </div>
    </div>
  );
};
