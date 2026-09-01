import React, { useState } from 'react';
import { UserSafe } from '../types';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { Sparkles, Shield, User as UserIcon, LogOut, FileText, CreditCard, ChevronDown, CheckCircle2, LayoutTemplate, SlidersHorizontal, Zap, Menu } from 'lucide-react';
import { NanuCloudLogo } from './NanuCloudLogo';
import { useLayoutMode } from '../data/layoutMode';

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
  onToggleMenu?: () => void;
  onNavigateHome?: () => void;
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
  onLogout,
  onToggleMenu,
  onNavigateHome
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-[#1E293B] sticky top-0 z-40">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Top-Left Menu Trigger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMenu && (
            <button
              type="button"
              onClick={onToggleMenu}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer shadow-sm active:scale-95 text-xs font-mono font-bold"
              title="Menu de Módulos & Opções (Ctrl + M)"
              aria-label="Abrir Menu de Módulos"
            >
              <Menu className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="cursor-pointer transition hover:opacity-90 active:scale-98 flex items-center"
            title="Ir para a Página Inicial do Simulador"
            role="button"
            tabIndex={0}
          >
            <NanuCloudLogo className="h-8 sm:h-9" isDarkTheme={true} />
          </div>
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Layout Mode Switcher (Friendly vs Advanced) */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'friendly' ? 'advanced' : 'friendly')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
              layoutMode === 'friendly'
                ? 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10'
            }`}
            title={`Layout Atual: Modo ${layoutMode === 'friendly' ? 'Amigável (Friendly/Básico)' : 'Avançado (Pro/Técnico)'}. Clique para alternar.`}
          >
            {layoutMode === 'friendly' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden sm:inline">Modo</span>
                <span className="text-indigo-200">Amigável</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo</span>
                <span className="text-amber-200">Avançado</span>
              </>
            )}
          </button>

          {/* Query Credits Badge */}
          {user ? (
            <button
              onClick={onOpenPlans}
              className="flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-900 text-slate-200 border border-slate-800 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono transition group"
              title="Clique para recarregar ou mudar de plano"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-amber-400">{user.queriesRemaining}</span>
              <span className="hidden md:inline text-slate-400 font-sans text-[11px]">créditos</span>
              <span className="text-[9px] sm:text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/30 ml-1">
                +RECARGA
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.freeQueriesTag}</span>
            </div>
          )}

          {/* Botão de Acesso Rápido ao Back Office (1 Clique / Sem Senha) */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
            title="Acesso Rápido ao Back Office e Painel de Gestão"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Acesso Rápido Back Office</span>
            <span className="text-[9px] bg-amber-400/25 text-amber-200 px-1.5 py-0.5 rounded font-mono uppercase font-black">
              Livre
            </span>
          </button>

          {/* Docs & Manuals Button */}
          <button
            onClick={onOpenDocs}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Manuais e Documentação"
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
                  <span className="text-[9px] text-amber-400 uppercase tracking-widest font-mono font-bold">
                    Super Admin
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
                      <span className="text-emerald-400 font-bold">{user.activePlanName || 'Diamante Ilimitado'}</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={onOpenAdmin}
                      className="w-full text-left px-4 py-2 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-2.5 font-bold transition border-t border-b border-amber-500/20 my-1 font-mono text-xs"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Back Office & Definições
                    </button>
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
                onClick={onOpenAdmin}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Acesso Direto"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar (Direto)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
