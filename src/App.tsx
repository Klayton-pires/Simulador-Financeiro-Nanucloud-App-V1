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

  useEffect(() => {
    // Check saved language
    const savedLang = localStorage.getItem('nanucloud_lang') as SupportedLang;
    if (savedLang) {
      setCurrentLang(savedLang);
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify session:', err);
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
      setUser(null);
      setActiveTab('local');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCalculationDone = (newCredits: number) => {
    if (user) {
      setUser({ ...user, queriesRemaining: newCredits });
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
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenDocs={() => setActiveTab('manuals')}
      />

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
        />

        {/* Content View */}
        <div className="flex-1 min-w-0">
          {activeTab === 'local' && (
            <LocalTradeSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {activeTab === 'import' && (
            <ImportSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

          {activeTab === 'excel' && (
            <ExcelBatchSimulator
              user={user}
              currentLang={currentLang}
              onOpenPlans={() => setIsPlansOpen(true)}
              onOpenAuth={() => handleOpenAuth('login')}
              onCalculationDone={handleCalculationDone}
            />
          )}

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
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Inicie sessão para aceder ao histórico de simulações com descrições personalizadas e exportação em Excel (.xlsx).
                </p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Entrar ou Registar
                </button>
              </div>
            )
          )}

          {activeTab === 'manuals' && (
            <DocumentationTab />
          )}

          {activeTab === 'admin' && (
            user && (user.role === 'admin_level1' || user.role === 'admin_level2') ? (
              <AdminPanel
                user={user}
                onRefreshUser={checkAuth}
              />
            ) : (
              <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
                <p className="text-xs text-rose-400 font-mono font-bold">ACESSO RESTRITO: Permissão de Administrador (Lvl 1 ou Lvl 2) necessária.</p>
              </div>
            )
          )}
        </div>
      </main>

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

      {/* Floating 24/7 Live Support Chat & Bot */}
      <SupportChatWidget
        user={user}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}
