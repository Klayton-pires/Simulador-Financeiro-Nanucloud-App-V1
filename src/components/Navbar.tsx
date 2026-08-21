import React, { useState } from 'react';
import { UserSafe } from '../types';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { Sparkles, Shield, User as UserIcon, LogOut, FileText, CreditCard, ChevronDown, CheckCircle2 } from 'lucide-react';
import { NanuCloudLogo } from './NanuCloudLogo';

interface NavbarProps {
  user: UserSafe | null;
  currentLang: SupportedLang;
  onLanguageChange: (lang: SupportedLang) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenPlans: () => void;
  onOpenAdmin: () => void;
  onOpenDocs: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentLang,
  onLanguageChange,
  onOpenAuth,
  onOpenProfile,
  onOpenPlans,
  onOpenAdmin,
  onOpenDocs,
  onLogout
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-[#1E293B] sticky top-0 z-40">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NanuCloudLogo className="h-9" isDarkTheme={true} />
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-tight">
              CONSOLE
            </span>
            <span className="text-emerald-400 text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
              v2.4.0-STABLE
            </span>
          </div>
        </div>

        {/* Controls & User State */}
        <div className="flex items-center gap-3">
          {/* Query Credits Badge */}
          {user ? (
            <button
              onClick={onOpenPlans}
              className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-900 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono transition group"
              title="Clique para recarregar ou mudar de plano"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-amber-400">{user.queriesRemaining}</span>
              <span className="hidden sm:inline text-slate-400 font-sans text-[11px]">créditos</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/30 ml-1">
                +RECARGA
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.freeQueriesTag}</span>
            </div>
          )}

          {/* Docs & Manuals Button */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
            title="Manuais de instalação e suporte"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Docs & Deploy</span>
          </button>

          {/* Language Selector */}
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLang)}
            className="bg-[#0F172A] text-slate-200 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="pt">🇵🇹 PT</option>
            <option value="en">🇬🇧 EN</option>
            <option value="es">🇪🇸 ES</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ar">🇦🇪 AR</option>
            <option value="ja">🇯🇵 JA</option>
            <option value="it">🇮🇹 IT</option>
            <option value="ko">🇰🇷 KO</option>
            <option value="hi">🇮🇳 HI</option>
          </select>

          {/* User Auth Controls */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-750 p-1.5 pr-2.5 rounded-lg border border-slate-700/70 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-indigo-500 shadow-sm shadow-indigo-500/20 flex items-center justify-center font-bold text-xs uppercase text-slate-100 font-mono">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[110px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-mono font-bold">
                    {user.role === 'admin_level1'
                      ? 'Super Admin (Lvl 1)'
                      : user.role === 'admin_level2'
                      ? 'Admin (Lvl 2)'
                      : 'Cliente'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-[#1E293B] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Autenticado como</p>
                    <p className="text-xs font-bold text-slate-100 truncate mt-0.5">{user.name}</p>
                    <p className="text-[11px] font-mono text-indigo-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono bg-[#0F172A] p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Plano:</span>
                      <span className="text-emerald-400 font-bold">{user.activePlanName || 'Gratuito (3)'}</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={onOpenProfile}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-sky-400" />
                      {t.profile} & Histórico
                    </button>
                    <button
                      onClick={onOpenPlans}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      {t.mPlans}
                    </button>

                    {(user.role === 'admin_level1' || user.role === 'admin_level2') && (
                      <button
                        onClick={onOpenAdmin}
                        className="w-full text-left px-4 py-2 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-2.5 font-bold transition border-t border-b border-amber-500/20 my-1 font-mono text-xs"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        {t.mAdmin} ({user.role === 'admin_level1' ? 'N1' : 'N2'})
                      </button>
                    )}

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
