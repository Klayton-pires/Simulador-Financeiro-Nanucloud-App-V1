import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Globe,
  Terminal,
  Smartphone,
  Monitor,
  Code,
  Download,
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
  Wrench,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { MANUALS_DATA, generateManualPdf, generateConsolidatedManualsPdf } from '../utils/manualsPdf';
import { downloadOfficialExcelTemplate } from '../utils/excelTemplate';

export const DocumentationTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('manual_01');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const wpCode = `<?php
/**
 * Plugin Name: Nanucloud Simulador Financeiro
 * Description: Integração do Simulador de Preços e Margens da NANUCLOUD no WordPress.
 * Version: 1.0.0
 * Author: NANUCLOUD
 */

if (!defined('ABSPATH')) exit;

function nanucloud_simulator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'url' => 'https://simulador.nanucloud.com',
        'height' => '850px',
        'width' => '100%'
    ), $atts);

    return sprintf(
        '<div style="width:%s; overflow:hidden; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.15);">
            <iframe src="%s" style="width:100%%; height:%s; border:none;" allow="clipboard-write"></iframe>
        </div>',
        esc_attr($atts['width']),
        esc_url($atts['url']),
        esc_attr($atts['height'])
    );
}
add_shortcode('nanucloud_simulador', 'nanucloud_simulator_shortcode');
`;

  const electronCode = `// main.js - Electron Desktop Application (.EXE)
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Nanucloud - Simulador Financeiro & Gestão de Margens',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

  const capacitorCode = `// Capacitor Config para APK (Android) e iOS
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nanucloud.simulator',
  appName: 'Nanucloud Simulador',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;

/* Comandos para compilar:
1. npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
2. npx cap init
3. npm run build
4. npx cap add android && npx cap open android (Gera o APK no Android Studio)
5. npx cap add ios && npx cap open ios (Gera o IPA no Xcode)
*/
`;

  const currentManual = MANUALS_DATA.find((m) => m.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black shrink-0 shadow-lg shadow-indigo-950/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <span>Manuais Técnicos Oficiais & Documentação Completa</span>
                <span className="text-[10px] uppercase font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  v2.5 Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Guia completo desde a instalação, manutenção, utilização, alterações, atualizações, administração e relatórios em PDF.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateConsolidatedManualsPdf()}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descarregar Todos os Manuais em PDF</span>
            </button>

            <button
              onClick={() => downloadOfficialExcelTemplate('xlsx')}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Modelo Excel Oficial (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - 6 Official Manuals + 3 Embed Extensions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MANUALS_DATA.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveSection(m.id)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSection === m.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 opacity-80" />
            <span>Manual {m.number}: {m.title.split('Manual de ')[1] || m.title}</span>
          </button>
        ))}

        <div className="h-6 w-px bg-slate-700 mx-1 shrink-0" />

        <button
          onClick={() => setActiveSection('wordpress')}
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'wordpress' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-indigo-400" />
          <span>WordPress</span>
        </button>

        <button
          onClick={() => setActiveSection('exe')}
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'exe' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          <span>Desktop (.EXE)</span>
        </button>

        <button
          onClick={() => setActiveSection('apk')}
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'apk' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>Mobile (.APK / iOS)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl text-xs text-slate-300 space-y-6">
        {/* Render Selected Official Manual */}
        {currentManual && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/30">
                  {currentManual.category}
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-100 mt-2">
                  Manual {currentManual.number}: {currentManual.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{currentManual.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => generateManualPdf(currentManual)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarregar Este Manual em PDF</span>
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {currentManual.contentSections.map((section, idx) => (
                <div key={idx} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>{section.heading}</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">{section.text}</p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-1.5 pl-2 pt-1">
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Practical Quick Commands for Manual 01, 04, 05 */}
            {currentManual.id === 'manual_01' && (
              <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold text-xs">Comandos Rápidos de Instalação & Arranque:</span>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run dev', 'cmd_install')}
                    className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeId === 'cmd_install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeId === 'cmd_install' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg text-emerald-300 text-xs">
                  # 1. Instalar dependências<br />
                  npm install<br /><br />
                  # 2. Iniciar servidor de desenvolvimento<br />
                  npm run dev<br /><br />
                  # 3. Compilar para produção<br />
                  npm run build
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integration: WordPress Shortcode */}
        {activeSection === 'wordpress' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <span>Integração no WordPress (Plugin PHP & Shortcode)</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Pode incorporar o simulador em qualquer página ou post do seu site WordPress criando um mini-plugin ou inserindo o código no ficheiro <code className="text-indigo-300">functions.php</code> do seu tema.
            </p>

            <div className="relative">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-xl border border-slate-700 text-[11px] text-slate-400 font-mono">
                <span>nanucloud-simulator.php</span>
                <button
                  onClick={() => copyToClipboard(wpCode, 'wp')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer text-indigo-400"
                >
                  {copiedCodeId === 'wp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeId === 'wp' ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl border-x border-b border-slate-700 text-slate-300 font-mono text-xs overflow-x-auto">
                <code>{wpCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Integration: Desktop .EXE */}
        {activeSection === 'exe' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-400" />
              <span>Compilação para Desktop Windows (.EXE) via Electron</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Transforme a aplicação num executável nativo do Windows com ícone na barra de tarefas e execução offline.
            </p>

            <div className="relative">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-xl border border-slate-700 text-[11px] text-slate-400 font-mono">
                <span>main.js (Electron Entry)</span>
                <button
                  onClick={() => copyToClipboard(electronCode, 'electron')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer text-emerald-400"
                >
                  {copiedCodeId === 'electron' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeId === 'electron' ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl border-x border-b border-slate-700 text-slate-300 font-mono text-xs overflow-x-auto">
                <code>{electronCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Integration: Mobile APK / iOS */}
        {activeSection === 'apk' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              <span>Compilação Mobile Nativa: Android (.APK) & iOS (Capacitor)</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Gere os pacotes móveis nativos para publicação na Google Play Store e Apple App Store utilizando o Capacitor.
            </p>

            <div className="relative">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-t-xl border border-slate-700 text-[11px] text-slate-400 font-mono">
                <span>capacitor.config.ts</span>
                <button
                  onClick={() => copyToClipboard(capacitorCode, 'capacitor')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer text-teal-400"
                >
                  {copiedCodeId === 'capacitor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeId === 'capacitor' ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-b-xl border-x border-b border-slate-700 text-slate-300 font-mono text-xs overflow-x-auto">
                <code>{capacitorCode}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
