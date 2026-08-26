import React, { useState, useEffect } from 'react';
import { Palette, Check, Save, Sparkles, Moon, Sun, Monitor, RefreshCw, Eye } from 'lucide-react';
import { AppThemeConfig } from '../../types';

export const SYSTEM_THEMES: AppThemeConfig[] = [
  {
    id: 'theme_dark_slate',
    name: 'Escuro Slate (Padrão Corporativo)',
    description: 'Fundo grafite e ardósia com realces em índigo e texto de alto contraste.',
    primaryColor: '#6366F1',
    bgDark: '#0B1120',
    cardDark: '#1E293B',
    accentColor: '#818CF8',
    textColor: '#F8FAFC'
  },
  {
    id: 'theme_emerald_pro',
    name: 'Esmeralda Financeira (Pro)',
    description: 'Tons profundos de verde esmeralda, ideal para instituições financeiras e alfândegas.',
    primaryColor: '#10B981',
    bgDark: '#061A14',
    cardDark: '#0D2D23',
    accentColor: '#34D399',
    textColor: '#ECFDF5'
  },
  {
    id: 'theme_midnight_navy',
    name: 'Azul Meia-Noite (Institucional)',
    description: 'Azul marítimo ultramarino de elevada sofisticação com detalhes em ciano e safira.',
    primaryColor: '#0EA5E9',
    bgDark: '#081325',
    cardDark: '#0F2342',
    accentColor: '#38BDF8',
    textColor: '#F0F9FF'
  },
  {
    id: 'theme_amber_gold',
    name: 'Ouro & Âmbar (Comércio & Tributos)',
    description: 'Paleta quente e dourada inspirada no comércio internacional e mineração.',
    primaryColor: '#F59E0B',
    bgDark: '#191206',
    cardDark: '#2C1F0A',
    accentColor: '#FBBF24',
    textColor: '#FFFBEB'
  },
  {
    id: 'theme_titanium_graphite',
    name: 'Titânio & Grafite Minimalista',
    description: 'Estilo neutro de alta fidelidade para utilizadores focados em produtividade extrema.',
    primaryColor: '#64748B',
    bgDark: '#0F172A',
    cardDark: '#1E293B',
    accentColor: '#94A3B8',
    textColor: '#F1F5F9'
  }
];

interface ThemeSettingsSectionProps {
  onSaveSnapshot: (section: string, payload: any) => void;
  showSaveNotice: (msg: string) => void;
}

export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({
  onSaveSnapshot,
  showSaveNotice
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('nanucloud_app_theme') || 'theme_dark_slate';
  });

  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('#6366F1');
  const [allowUserThemeSwitch, setAllowUserThemeSwitch] = useState<boolean>(() => {
    return localStorage.getItem('nanucloud_allow_user_theme') !== 'false';
  });

  const handleApplyTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    localStorage.setItem('nanucloud_app_theme', themeId);
    const theme = SYSTEM_THEMES.find((t) => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--app-primary', theme.primaryColor);
      document.documentElement.style.setProperty('--app-bg', theme.bgDark);
      document.documentElement.style.setProperty('--app-card', theme.cardDark);
    }
  };

  const handleSaveThemes = () => {
    const payload = {
      activeThemeId: selectedThemeId,
      customPrimaryColor,
      allowUserThemeSwitch,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('nanucloud_app_theme', selectedThemeId);
    localStorage.setItem('nanucloud_allow_user_theme', String(allowUserThemeSwitch));
    onSaveSnapshot('Temas da Aplicação', payload);
    showSaveNotice('Tema e definições visuais gravados com sucesso!');
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" /> TEMAS & IDENTIDADE VISUAL DA PLATAFORMA
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize a paleta de cores padrão, contraste e modo de exibição para todos os utilizadores da aplicação.
          </p>
        </div>

        <button
          onClick={handleSaveThemes}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer self-start"
        >
          <Save className="w-4 h-4" /> Guardar Tema Padrão
        </button>
      </div>

      {/* Theme Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYSTEM_THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleApplyTheme(theme.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900 shadow-lg'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span className="text-xs font-mono font-bold text-slate-200">{theme.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{theme.description}</p>
              </div>

              {/* Color Swatch Preview */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-lg border border-slate-700 shadow-inner"
                    style={{ backgroundColor: theme.bgDark }}
                    title="Fundo"
                  />
                  <span
                    className="w-5 h-5 rounded-lg border border-slate-700 shadow-inner"
                    style={{ backgroundColor: theme.cardDark }}
                    title="Cartão"
                  />
                  <span
                    className="w-5 h-5 rounded-lg border border-slate-700 shadow-inner"
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primária"
                  />
                  <span
                    className="w-5 h-5 rounded-lg border border-slate-700 shadow-inner"
                    style={{ backgroundColor: theme.accentColor }}
                    title="Realce"
                  />
                </div>

                <button
                  type="button"
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                      : 'text-slate-400 bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected ? 'Ativo' : 'Selecionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Theme Settings Switcher */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowUserThemeSwitch}
            onChange={(e) => setAllowUserThemeSwitch(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700 focus:ring-0"
          />
          <span className="text-slate-200 font-bold">
            Permitir que utilizadores e clientes alternem o tema individualmente nas preferências do seu perfil
          </span>
        </label>
        <p className="text-slate-400 text-[11px] font-sans pl-7 leading-relaxed">
          Se desativado, todos os visitantes e utilizadores autenticados visualizarão o tema corporativo institucional definido pelo Super Administrador.
        </p>
      </div>
    </div>
  );
};
