import React from 'react';
import { UserSafe } from '../types';
import { ShieldAlert, LogIn, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { getRoleDisplayLabel } from '../utils/accessControl';

interface BackofficeAccessDeniedProps {
  user: UserSafe | null;
  onGoToFrontEnd: () => void;
  onOpenLogin: () => void;
  onOpenPlans: () => void;
}

export const BackofficeAccessDenied: React.FC<BackofficeAccessDeniedProps> = ({
  user,
  onGoToFrontEnd,
  onOpenLogin,
  onOpenPlans
}) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-200">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-2xl pointer-events-none rounded-full" />

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-3 bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Lock className="w-3.5 h-3.5" />
          <span>Acesso Restrito ao Backoffice</span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight mb-3">
          Área Exclusiva para Staff & Administração
        </h2>

        {user ? (
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-sm text-slate-300 leading-relaxed">
              A sua conta está registada com o perfil{' '}
              <span className="font-bold text-indigo-400 font-mono">
                {getRoleDisplayLabel(user.role)}
              </span>
              .
            </p>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed font-mono text-left space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Utilizador:</span>
                <span className="text-slate-200 font-bold">{user.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">E-mail:</span>
                <span className="text-slate-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Créditos de Simulação:</span>
                <span className={user.queriesRemaining > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {user.queriesRemaining} restantes
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Os clientes têm acesso exclusivo aos recursos do <strong className="text-slate-200">Front-End</strong> (Simuladores comerciais, emissão de faturas e histórico). Para aceder ao Backoffice e aos módulos de gestão interna, é necessária uma conta com privilégios de Staff Utilizador, Administrador ou Super Administrador.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-sm text-slate-300 leading-relaxed">
              Para aceder ao Backoffice e às ferramentas de gestão, inicie sessão com uma credencial de <strong className="text-amber-400">Staff Utilizador</strong>, <strong className="text-amber-400">Administrador</strong> ou <strong className="text-amber-400">Super Administrador</strong>.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Se é um cliente, navegue pelos simuladores no Front-End e certifique-se de que a sua conta possui créditos ativos para realizar simulações.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoToFrontEnd}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Simuladores (Front-End)</span>
          </button>

          {!user ? (
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sessão (Staff / Admin)</span>
            </button>
          ) : (
            <button
              onClick={onOpenPlans}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Ver Meus Planos & Créditos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
