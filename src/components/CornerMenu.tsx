import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Maximize2,
  Minimize2,
  Search,
  Store,
  Briefcase,
  Handshake,
  Smartphone,
  Ship,
  FileSpreadsheet,
  Code,
  Table,
  Sparkles,
  Building,
  ShieldCheck,
  LifeBuoy,
  MessageSquare,
  BarChart3,
  Settings,
  Download,
  BookOpen,
  Gem,
  History,
  Layers,
  Check,
  ChevronRight,
  Globe,
  Sliders
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { UserSafe } from '../types';
import { SupportedLang } from '../i18n/translations';

interface CornerMenuProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isSidebarHidden: boolean;
  onToggleSidebar: () => void;
  user: UserSafe | null;
  currentLang: SupportedLang;
  onLanguageChange: (lang: SupportedLang) => void;
  onOpenPlans: () => void;
  onOpenSupport: () => void;
}

export const CornerMenu: React.FC<CornerMenuProps> = ({
  activeTab,
  onTabChange,
  isSidebarHidden,
  onToggleSidebar,
  user,
  currentLang,
  onLanguageChange,
  onOpenPlans,
  onOpenSupport
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin_level1';
  const isAdmin = isSuperAdmin || user?.role === 'admin' || user?.role === 'admin_level2';
  const isManager = isAdmin || user?.role === 'manager';

  // Keyboard shortcut listener (Ctrl + M or Alt + M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const allModules = [
    // Simuladores & Motor
    { id: 'local', label: 'Vendas & Comércio (PVP)', category: 'Simuladores', icon: Store, unlocked: true },
    { id: 'services_consulting', label: 'Prestação de Serviços', category: 'Simuladores', icon: Briefcase, unlocked: true },
    { id: 'intermediary', label: 'Intermediários & Corretagem', category: 'Simuladores', icon: Handshake, unlocked: true },
    { id: 'basic_mobile', label: 'Modo Celular Básico / POS', category: 'Simuladores', icon: Smartphone, unlocked: true },
    { id: 'import', label: 'Importação Aduaneira', category: 'Simuladores', icon: Ship, unlocked: !!(user?.isImportUnlocked || isManager) },
    { id: 'excel', label: 'Lotes Excel (.xlsx)', category: 'Simuladores', icon: FileSpreadsheet, unlocked: !!(user?.isBatchUnlocked || isManager) },
    { id: 'api_integration', label: 'API REST ERP & Lojas', category: 'Simuladores', icon: Code, unlocked: !!(user?.isApiUnlocked || isManager) },

    // Governança & IA
    { id: 'fiscal_matrix', label: 'Matriz Fiscal de Taxas', category: 'Governança & IA', icon: Table, unlocked: true },
    { id: 'fiscal_ai', label: 'IA Fiscal & Notícias AGT/AT', category: 'Governança & IA', icon: Sparkles, unlocked: true },

    // Multi-Plataformas & Download
    { id: 'multiplatform_hub', label: 'Download Multi-Plataformas & Testes', category: 'Multi-Plataformas', icon: Download, unlocked: true, badge: 'NOVO' },

    // Gestão CRM & RBAC
    ...(isManager
      ? [
          { id: 'clients_management', label: 'Gestão de Clientes & CRM', category: 'Gestão & Staff', icon: Building, unlocked: true },
          { id: 'users_management', label: 'Utilizadores & Staff (RBAC)', category: 'Gestão & Staff', icon: ShieldCheck, unlocked: true },
          { id: 'tickets', label: 'Tickets & Atendimento', category: 'Gestão & Staff', icon: LifeBuoy, unlocked: true },
          { id: 'marketing', label: 'Marketing, SMS & E-mail', category: 'Gestão & Staff', icon: MessageSquare, unlocked: true },
          { id: 'reports_metrics', label: 'Métricas & Auditoria', category: 'Gestão & Staff', icon: BarChart3, unlocked: true },
          { id: 'admin_settings', label: 'Definições & RBAC', category: 'Gestão & Staff', icon: Settings, unlocked: true }
        ]
      : []),

    // Conta & Documentação
    { id: 'history', label: 'Histórico & Faturas', category: 'Conta & Manuais', icon: History, unlocked: true },
    { id: 'manuals', label: 'Manuais & Documentação', category: 'Conta & Manuais', icon: BookOpen, unlocked: true }
  ];

  const filteredModules = allModules.filter(
    (m) =>
      m.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredModules.map((m) => m.category)));

  const handleSelectModule = (id: string) => {
    onTabChange(id as ActiveTab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Corner Button (Fixed Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 font-mono">
        
        {/* Quick Full-Screen / Space Saver Pill */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-lg backdrop-blur-md border ${
            isSidebarHidden
              ? 'bg-indigo-600/90 text-white border-indigo-400/50 hover:bg-indigo-500'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={isSidebarHidden ? 'Restaurar Barra Lateral' : 'Modo Espaço Total (Ocultar Barra Lateral)'}
        >
          {isSidebarHidden ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {isSidebarHidden ? 'Restaurar Menu' : 'Espaço Total'}
          </span>
        </button>

        {/* Main Corner Hub Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-3 rounded-2xl shadow-2xl border border-indigo-400/40 transition transform active:scale-95 flex items-center justify-center cursor-pointer group"
          title="Menu Rápido de Módulos & Opções (Ctrl + M)"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </button>
      </div>

      {/* Floating Modal / Drawer Launcher */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-[#0F172A] border border-slate-700 w-full sm:w-[460px] max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-[#1E293B] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    MENU DE MÓDULOS & OPÇÕES
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Acesso rápido a todas as funções da plataforma
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={onToggleSidebar}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                {isSidebarHidden ? <Minimize2 className="w-3 h-3 text-indigo-400" /> : <Maximize2 className="w-3 h-3 text-emerald-400" />}
                <span className="text-[11px]">{isSidebarHidden ? 'Mostrar Barra' : 'Ocultar Barra (Espaço Total)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenPlans();
                  setIsOpen(false);
                }}
                className="py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center gap-1 transition"
              >
                <Gem className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Planos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenSupport();
                  setIsOpen(false);
                }}
                className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1 transition"
              >
                <LifeBuoy className="w-3 h-3" />
                <span className="text-[11px]">Suporte</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar módulo ou simulação..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Modules List Categorized */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs max-h-[50vh]">
              {categories.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  Nenhum módulo encontrado com a pesquisa "{searchTerm}".
                </div>
              ) : (
                categories.map((cat) => {
                  const catModules = filteredModules.filter((m) => m.category === cat);
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">
                        {cat}
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        {catModules.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectModule(item.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${
                                isActive
                                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold shadow'
                                  : 'bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <Icon
                                  className={`w-4 h-4 shrink-0 ${
                                    isActive ? 'text-indigo-400' : 'text-slate-400'
                                  }`}
                                />
                                <span className="truncate">{item.label}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.badge && (
                                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                                    {item.badge}
                                  </span>
                                )}
                                {isActive ? (
                                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#1E293B] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Idioma:</span>
                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value as SupportedLang)}
                  className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px]"
                >
                  <option value="pt">PT (Português)</option>
                  <option value="en">EN (English)</option>
                  <option value="es">ES (Español)</option>
                  <option value="fr">FR (Français)</option>
                  <option value="zh">ZH (中文)</option>
                </select>
              </div>

              <span className="text-[10px] text-slate-500">Atalho: Ctrl + M</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
