import React, { useState, useEffect } from 'react';
import { UserSafe } from './types';
import { SupportedLang } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LocalTradeSimulator } from './components/LocalTradeSimulator';
import { ImportSimulator } from './components/ImportSimulator';
import { ExcelBatchSimulator } from './components/ExcelBatchSimulator';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { DocumentationTab } from './components/DocumentationTab';
import { AuthModal } from './components/AuthModal';
import { PlansModal } from './components/PlansModal';
import { SupportChatWidget } from './components/SupportChatWidget';

// New Advanced Features & Modules
import { BasicPhoneMobileMode } from './components/BasicPhoneMobileMode';
import { ServicesConsultingSimulator } from './components/ServicesConsultingSimulator';
import { IntermediaryBrokerSimulator } from './components/IntermediaryBrokerSimulator';
import { ApiIntegrationsTab } from './components/ApiIntegrationsTab';
import { ManualFiscalMatrixTab } from './components/ManualFiscalMatrixTab';
import { FiscalAiNotificationsTab } from './components/FiscalAiNotificationsTab';
import { ClientsManagementTab } from './components/ClientsManagementTab';
import { UsersManagementTab } from './components/UsersManagementTab';
import { TicketsManagementTab } from './components/TicketsManagementTab';
import { MarketingCampaignsTab } from './components/MarketingCampaignsTab';
import { ReportsAndMetricsTab } from './components/ReportsAndMetricsTab';
import { AdminAdvancedSettingsTab } from './components/admin/AdminAdvancedSettingsTab';
import { DocsAndDeployTab } from './components/DocsAndDeployTab';
import { LegalTermsModal } from './components/LegalTermsModal';
import { SuperAdminSetupModal } from './components/SuperAdminSetupModal';

// Themes and Greetings logic
import { checkSpecialGreetings, SYSTEM_THEMES } from './data/themes';
import { Sparkles, Gift, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserSafe | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<SupportedLang>('pt');
  const [activeTab, setActiveTab] = useState<ActiveTab>('local');

  // Modals & Chat
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isPlansOpen, setIsPlansOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isSuperAdminSetupOpen, setIsSuperAdminSetupOpen] = useState<boolean>(() => {
    return !localStorage.getItem('nanucloud_super_admin_configured');
  });

  // Greeting Banner
  const [specialGreeting, setSpecialGreeting] = useState<{
    type: 'birthday' | 'holiday';
    title: string;
    message: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    // Check saved language
    const savedLang = localStorage.getItem('nanucloud_lang') as SupportedLang;
    if (savedLang) {
      setCurrentLang(savedLang);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const greeting = checkSpecialGreetings(user.name, user.birthDate);
      if (greeting) {
        setSpecialGreeting(greeting);
      }
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return;
      }
    } catch (err) {
      console.warn('Backend API not responding, checking local offline session...');
    }

    // Offline / Standalone session check
    try {
      const savedUser = localStorage.getItem('nanucloud_session_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLangChange = (lang: SupportedLang) => {
    setCurrentLang(lang);
    localStorage.setItem('nanucloud_lang', lang);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('nanucloud_session_user');
      setUser(null);
      setActiveTab('local');
    }
  };

  const handleCalculationDone = (newCredits: number) => {
    if (user) {
      const updated = { ...user, queriesRemaining: newCredits };
      setUser(updated);
      localStorage.setItem('nanucloud_session_user', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-200 antialiased selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Fixed Header */}
      <Navbar
        user={user}
        currentLang={currentLang}
        onLanguageChange={handleLangChange}
        onOpenAuth={handleOpenAuth}
        onOpenPlans={() => setIsPlansOpen(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('history')}
        onOpenAdmin={() => setActiveTab('admin_settings')}
        onOpenDocs={() => setActiveTab('manuals')}
      />

      {/* Special Holiday / Birthday Greeting Banner */}
      {specialGreeting && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 border-b border-indigo-500/40 py-3 px-4 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-300 block">{specialGreeting.title}</span>
                <span className="text-slate-200">{specialGreeting.message}</span>
              </div>
            </div>
            <button
              onClick={() => setSpecialGreeting(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Google AdSense Slot 1: Top Banner on Free Mode */}
      {!user && (
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-4">
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-3 text-center flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>PUBLICIDADE ADSENSE (SLOT 1 - TOPO BANNER)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Modo Teste Gratuito</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'plans') {
              setIsPlansOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          user={user}
          currentLang={currentLang}
          onOpenTerms={() => setIsTermsOpen(true)}
        />

        {/* Content View */}
        <div className="flex-1 min-w-0">
          
          {/* TAB: Vendas & Comércio (Local) */}
          {activeTab === 'local' && (
            <LocalTradeSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: Prestação de Serviços & Consultoria */}
          {activeTab === 'services_consulting' && (
            <ServicesConsultingSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: Intermediários & Corretagem */}
          {activeTab === 'intermediary' && (
            <IntermediaryBrokerSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: Modo Celular Básico / POS */}
          {activeTab === 'basic_mobile' && (
            <BasicPhoneMobileMode
              user={user}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: Importação Aduaneira */}
          {activeTab === 'import' && (
            <ImportSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: Lotes Excel (.xlsx) */}
          {activeTab === 'excel' && (
            <ExcelBatchSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {/* TAB: API REST ERP & Lojas */}
          {activeTab === 'api_integration' && (
            <ApiIntegrationsTab
              user={user}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          )}

          {/* TAB: Matriz Fiscal de Taxas */}
          {activeTab === 'fiscal_matrix' && (
            <ManualFiscalMatrixTab
              currentUser={
                user || {
                  id: 'guest',
                  name: 'Visitante',
                  email: 'visitante@nanucloud.com',
                  role: 'client',
                  isActive: true,
                  queriesRemaining: 5,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: IA Fiscal & Notícias Oficiais */}
          {activeTab === 'fiscal_ai' && (
            <FiscalAiNotificationsTab
              currentUser={
                user || {
                  id: 'guest',
                  name: 'Visitante',
                  email: 'visitante@nanucloud.com',
                  role: 'client',
                  isActive: true,
                  queriesRemaining: 5,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Gestão de Clientes */}
          {activeTab === 'clients_management' && (
            <ClientsManagementTab
              currentUser={
                user || {
                  id: 'admin_demo',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Gestão de Utilizadores (Staff) */}
          {activeTab === 'users_management' && (
            <UsersManagementTab
              currentUser={
                user || {
                  id: 'admin_demo',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Tickets & Atendimento */}
          {activeTab === 'tickets' && (
            <TicketsManagementTab
              currentUser={
                user || {
                  id: 'usr_admin_1',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Marketing, SMS & E-mail */}
          {activeTab === 'marketing' && (
            <MarketingCampaignsTab
              currentUser={
                user || {
                  id: 'usr_admin_1',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Métricas, Vendas & Auditoria */}
          {activeTab === 'reports_metrics' && (
            <ReportsAndMetricsTab
              currentUser={
                user || {
                  id: 'usr_admin_1',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Definições Avançadas & RBAC */}
          {activeTab === 'admin_settings' && (
            <AdminAdvancedSettingsTab
              currentUser={
                user || {
                  id: 'usr_admin_1',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Docs & Deploy (Exclusivo Super Admin) */}
          {activeTab === 'docs_deploy' && (
            <DocsAndDeployTab
              currentUser={
                user || {
                  id: 'usr_admin_1',
                  name: 'Super Administrador NANUCLOUD',
                  email: 'admin@nanucloud.com',
                  role: 'super_admin',
                  isActive: true,
                  queriesRemaining: 999999,
                  totalQueriesUsed: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            />
          )}

          {/* TAB: Perfil & Histórico */}
          {activeTab === 'history' && (
            user ? (
              <UserProfile
                user={user}
                onOpenPlans={() => setIsPlansOpen(true)}
                onUserUpdated={(u) => setUser(u)}
              />
            ) : (
              <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
                <h3 className="text-base font-bold text-slate-100 mb-2 font-mono">AUTENTICAÇÃO NECESSÁRIA</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed font-mono">
                  Inicie sessão para aceder ao histórico de simulações com descrições personalizadas e exportação em Excel (.xlsx).
                </p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors shadow-lg"
                >
                  Entrar ou Registar
                </button>
              </div>
            )
          )}

          {/* TAB: Manuais & Documentação */}
          {activeTab === 'manuals' && <DocumentationTab />}

          {/* TAB: Painel Administrativo Geral */}
          {activeTab === 'admin' && (
            user ? (
              <AdminPanel user={user} onRefreshUser={checkAuth} />
            ) : (
              <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
                <p className="text-xs text-rose-400 font-mono font-bold">
                  ACESSO RESTRITO: Permissão de Administrador necessária.
                </p>
              </div>
            )
          )}

        </div>
      </main>

      {/* Google AdSense Slot 3: Footer Banner on Free Mode */}
      {!user && (
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-2">
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-2.5 text-center text-[10px] font-mono text-slate-600">
            PUBLICIDADE GOOGLE ADSENSE (SLOT 3 - RODAPÉ DE RESULTADOS)
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        currentLang={currentLang}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setIsAuthOpen(false);
        }}
      />

      <PlansModal
        user={user}
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
        onOpenAuth={() => {
          setIsPlansOpen(false);
          handleOpenAuth('register');
        }}
        onOpenChat={() => {
          setIsPlansOpen(false);
          setIsChatOpen(true);
        }}
        onPurchaseSuccess={() => {
          checkAuth();
        }}
      />

      {/* Legal Terms & Refund Policy Modal */}
      <LegalTermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        currentUser={user}
      />

      {/* Floating 24/7 Live Support Chat & Bot */}
      <SupportChatWidget
        user={user}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Initial Super Admin Setup Wizard on First Application Login */}
      <SuperAdminSetupModal
        isOpen={isSuperAdminSetupOpen}
        onComplete={(superAdminUser) => {
          setUser(superAdminUser);
          localStorage.setItem('nanucloud_session_user', JSON.stringify(superAdminUser));
          setIsSuperAdminSetupOpen(false);
        }}
      />
    </div>
  );
}
