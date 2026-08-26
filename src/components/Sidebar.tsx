import React from 'react';
import { UserSafe } from '../types';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import {
  Store,
  Ship,
  FileSpreadsheet,
  Gem,
  History,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Terminal,
  Smartphone,
  Code,
  Table,
  Sparkles,
  Users,
  Building,
  LifeBuoy,
  MessageSquare,
  BarChart3,
  Settings,
  Scale,
  FileCode,
  Briefcase,
  Handshake,
  UserCheck,
  Download
} from 'lucide-react';

export type ActiveTab =
  | 'local'
  | 'services_consulting'
  | 'intermediary'
  | 'basic_mobile'
  | 'import'
  | 'excel'
  | 'api_integration'
  | 'fiscal_matrix'
  | 'fiscal_ai'
  | 'multiplatform_hub'
  | 'clients_management'
  | 'users_management'
  | 'tickets'
  | 'marketing'
  | 'reports_metrics'
  | 'admin_settings'
  | 'docs_deploy'
  | 'plans'
  | 'history'
  | 'manuals'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: UserSafe | null;
  currentLang: SupportedLang;
  onOpenTerms?: () => void;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  currentLang,
  onOpenTerms
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin_level1';
  const isAdmin = isSuperAdmin || user?.role === 'admin' || user?.role === 'admin_level2';
  const isManager = isAdmin || user?.role === 'manager';

  const simItems = [
    { id: 'local', label: 'Vendas & Comércio (PVP)', icon: Store, unlocked: true },
    {
      id: 'services_consulting',
      label: 'Prestação de Serviços & Consultoria',
      icon: Briefcase,
      unlocked: true,
      badge: 'NOVO'
    },
    {
      id: 'intermediary',
      label: 'Intermediários & Corretagem',
      icon: Handshake,
      unlocked: true,
      badge: 'PRO'
    },
    {
      id: 'basic_mobile',
      label: 'Modo Celular Básico / POS',
      icon: Smartphone,
      unlocked: true,
      badge: 'FAST'
    },
    {
      id: 'import',
      label: t.mImport || 'Importação Aduaneira',
      icon: Ship,
      unlocked: user ? (user.isImportUnlocked || isManager) : false,
      badge: user && (user.isImportUnlocked || isManager) ? undefined : 'PRO'
    },
    {
      id: 'excel',
      label: t.mExcel || 'Lotes Excel (.xlsx)',
      icon: FileSpreadsheet,
      unlocked: user ? (user.isBatchUnlocked || isManager) : false,
      badge: user && (user.isBatchUnlocked || isManager) ? undefined : 'PRO'
    },
    {
      id: 'api_integration',
      label: 'API REST ERP & Lojas',
      icon: Code,
      unlocked: user ? (user.isApiUnlocked || isManager) : false,
      badge: user && (user.isApiUnlocked || isManager) ? undefined : 'API'
    }
  ];

  const fiscalGovItems = [
    { id: 'fiscal_matrix', label: 'Matriz Fiscal de Taxas', icon: Table, unlocked: true },
    { id: 'fiscal_ai', label: 'IA Fiscal & Notícias AGT/AT', icon: Sparkles, unlocked: true }
  ];

  const managementItems = isManager
    ? [
        { id: 'clients_management', label: 'Gestão de Clientes & CRM', icon: Building },
        { id: 'users_management', label: 'Utilizadores & Staff (RBAC)', icon: ShieldCheck },
        { id: 'tickets', label: 'Tickets & Atendimento', icon: LifeBuoy },
        { id: 'marketing', label: 'Marketing, SMS & E-mail', icon: MessageSquare },
        { id: 'reports_metrics', label: 'Métricas & Auditoria', icon: BarChart3 },
        { id: 'admin_settings', label: 'Definições & RBAC', icon: Settings }
      ]
    : [];

  const userItems = [
    { id: 'plans', label: t.mPlans || 'Planos & Consultas', icon: Gem, unlocked: true, highlight: true },
    { id: 'history', label: t.mHistory || 'Histórico & Faturas', icon: History, unlocked: true }
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
      {/* Main Section */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1 shadow-sm">
        
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2 px-3 font-mono">
          Simuladores & Motor
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
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shrink-0">
                  {isLocked && <Lock className="w-2.5 h-2.5" />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Fiscal Intelligence & Matrix Section */}
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
          Inteligência Fiscal
        </div>

        {fiscalGovItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500/20'
                  : 'hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Multi-Plataformas & Download Section */}
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono flex items-center justify-between">
          <span>Ecossistema & Apps</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded">8 PLATAFORMAS</span>
        </div>

        <button
          onClick={() => onTabChange('multiplatform_hub')}
          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
            activeTab === 'multiplatform_hub'
              ? 'bg-indigo-500/15 text-indigo-300 font-bold border-indigo-500/40 shadow-sm'
              : 'hover:bg-[#1E293B] text-slate-300 border-slate-800/80 bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Download className={`w-4 h-4 shrink-0 ${activeTab === 'multiplatform_hub' ? 'text-indigo-400' : 'text-indigo-400'}`} />
            <span className="truncate">Download Multi-Plataformas</span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            TESTAR
          </span>
        </button>

        {/* Management & Governance Section */}
        {managementItems.length > 0 && (
          <>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
              Gestão & Operações
            </div>
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as ActiveTab)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500/20'
                      : 'hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* Super Admin Exclusive Docs & Deploy */}
        {isSuperAdmin && (
          <>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
              Super Admin Exclusivo
            </div>
            <button
              onClick={() => onTabChange('docs_deploy')}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border text-left ${
                activeTab === 'docs_deploy'
                  ? 'bg-rose-500/10 text-rose-300 font-medium border-rose-500/30'
                  : 'hover:bg-[#1E293B] text-rose-400/90 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-mono font-bold">Docs & Deploy</span>
              </div>
              <span className="text-[9px] uppercase font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                ROOT
              </span>
            </button>
          </>
        )}

        {/* Billing & Access */}
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-4 mb-2 px-3 font-mono">
          Conta & Planos
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
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}

      </div>

      {/* Legal & Terms Quick Button */}
      {onOpenTerms && (
        <button
          onClick={onOpenTerms}
          className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Termos & Reembolso</span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans">Legal</span>
        </button>
      )}

      {/* Docs Quick Widget */}
      <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>MANUAIS_OFICIAIS</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Guias de utilização, exportação PDF e fórmulas de precificação
          </p>
        </div>
        <button
          onClick={() => onTabChange('manuals')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs py-2 px-3 rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Ver Documentação</span>
        </button>
      </div>
    </aside>
  );
};
