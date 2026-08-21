import React, { useState, useEffect } from 'react';
import { UserSafe } from '../types';
import { COUNTRIES_DB } from '../data/countries';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';
import { X, Lock, Mail, User, Phone, Building, Globe, Key, MapPin, FileText, AlertCircle } from 'lucide-react';
import { NanuCloudLogo } from './NanuCloudLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  currentLang: SupportedLang;
  onSuccess: (user: UserSafe) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  currentLang,
  onSuccess
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [nif, setNif] = useState('');
  const [country, setCountry] = useState('AO');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { name, email, password, phone, company, address, nif, country };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Ocorreu um erro no processamento.');
        setIsLoading(false);
        return;
      }

      onSuccess(data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha na ligação ao servidor de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Tabs */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <NanuCloudLogo className="h-10" isDarkTheme={true} />
          </div>
          <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {mode === 'login'
              ? 'Aceda com as suas credenciais para continuar'
              : 'Preencha os seus dados para criar uma conta profissional'}
          </p>

          <div className="flex bg-[#0F172A] p-1 rounded-lg border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                mode === 'login' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.tabLogin}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                mode === 'register' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.tabRegister}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-slate-400 font-bold block mb-1">{t.lblName} *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome Completo ou Razão Social"
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">{t.lblPhone}</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 9..."
                      className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">{t.lblCompany}</label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Empresa / Organização"
                      className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Endereço / Morada *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Luanda, Viana, Capalanca"
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">NIF (Fiscal) *</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      placeholder="NIF da Empresa / Pessoal"
                      className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">{t.lblCountry}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  >
                    {Object.keys(COUNTRIES_DB).map((code) => (
                      <option key={code} value={code}>
                        {COUNTRIES_DB[code].name} ({COUNTRIES_DB[code].curr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-400 font-bold block mb-1">{t.lblEmail} *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">{t.lblPass} *</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-tight transition shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? 'A processar...' : mode === 'login' ? t.btnLogin : t.btnRegister}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  Registe-se agora
                </button>
              </>
            ) : (
              <>
                Já tem conta registada?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  Inicie sessão
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

