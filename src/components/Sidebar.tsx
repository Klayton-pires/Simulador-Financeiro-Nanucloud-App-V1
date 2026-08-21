import React from 'react';
import { UserSafe } from '../types';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { Store, Ship, FileSpreadsheet, Gem, History, BookOpen, ShieldAlert, Lock, Terminal } from 'lucide-react';

export type ActiveTab = 'local' | 'import' | 'excel' | 'plans' | 'history' | 'manuals' | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: UserSafe | null;
  currentLang: SupportedLang;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  currentLang
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  const simItems = [
    { id: 'local', label: t.mLocal, icon: Store, unlocked: true },
    {
      id: 'import',
      label: t.mImport,
      icon: Ship,
      unlocked: user ? (user.isImportUnlocked || user.role !== 'user') : false,
      badge: user && (user.isImportUnlocked || user.role !== 'user') ? undefined : 'PRO'
    },
    {
      id: 'excel',
      label: t.mExcel,
      icon: FileSpreadsheet,
      unlocked: user ? (user.isBatchUnlocked || user.role !== 'user') : false,
      badge: user && (user.isBatchUnlocked || user.role !== 'user') ? undefined : 'PRO'
    },
  ];

  const userItems = [
    { id: 'plans', label: t.mPlans, icon: Gem, unlocked: true, highlight: true },
    { id: 'history', label: t.mHistory, icon: History, unlocked: true },
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
      {/* Main Section */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1 shadow-sm">
        <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2 px-3 font-mono">
          Main Interface
        </div>

        {simItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = !item.unlocked;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 rounded-lg font-medium border-indigo-500/20'
                  : 'hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  {isLocked && <Lock className="w-2.5 h-2.5" />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
          Billing & Access
        </div>

        {userItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 rounded-lg font-medium border-indigo-500/20'
                  : item.highlight
                  ? 'hover:bg-[#1E293B] text-emerald-400 border-transparent font-semibold'
                  : 'hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Admin Section */}
        {user && (user.role === 'admin_level1' || user.role === 'admin_level2') && (
          <>
            <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
              Security & Admin
            </div>
            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                activeTab === 'admin'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'hover:bg-[#1E293B] text-amber-400/90 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="font-mono">{t.mAdmin}</span>
              </div>
              <span className="text-[9px] uppercase font-mono font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                {user.role === 'admin_level1' ? 'LVL 1' : 'LVL 2'}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Docs Quick Widget matching Sleek Interface */}
      <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEPLOYMENT_KIT</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Multi-Platform Deployment (iOS, APK, Windows .EXE, Web & WordPress)
          </p>
        </div>
        <button
          onClick={() => onTabChange('manuals')}
          className={`w-full py-2 rounded text-xs font-bold font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'manuals'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
        >
          VIEW MANUAL
        </button>
      </div>
    </aside>
  );
};
