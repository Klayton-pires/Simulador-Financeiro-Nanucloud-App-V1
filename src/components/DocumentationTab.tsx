import React, { useState } from 'react';
import { BookOpen, Shield, Globe, Terminal, Smartphone, Monitor, Code, HelpCircle, Copy, Check, FileText } from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'user' | 'admin' | 'web' | 'wordpress' | 'exe' | 'apk' | 'ios' | 'support'>('user');
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

  mainWindow.loadURL('http://localhost:3000'); // Ou URL de produção
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100">
              Manual Completo de Utilização, Administração & Instalação
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Guias técnicos passo a passo com código pronto para Web, WordPress, Desktop (.EXE), Android (.APK) e iOS.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveSection('user')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Manual de Utilização</span>
        </button>

        <button
          onClick={() => setActiveSection('admin')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Manual de Administração</span>
        </button>

        <button
          onClick={() => setActiveSection('web')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'web' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Deploy Web & MySQL</span>
        </button>

        <button
          onClick={() => setActiveSection('wordpress')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'wordpress' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-indigo-400" />
          <span>WordPress (Plugin / Shortcode)</span>
        </button>

        <button
          onClick={() => setActiveSection('exe')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'exe' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          <span>Windows (.EXE Electron)</span>
        </button>

        <button
          onClick={() => setActiveSection('apk')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'apk' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>Android (.APK) & iOS</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl text-xs text-slate-300 space-y-6">
        {/* 1. USER MANUAL */}
        {activeSection === 'user' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3">
              1. Manual do Utilizador & Operação do Simulador
            </h3>

            <div className="space-y-3 leading-relaxed">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 text-sm">A. Registo e 3 Consultas Gratuitas</h4>
                <p>
                  Todo o novo utilizador ao criar conta recebe de imediato <strong>3 consultas gratuitas</strong> para testar a formação de preços de venda e lucros no Comércio Local.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 text-sm">B. Simulador de Comércio Local</h4>
                <p>
                  1. Selecione o país fiscal (ex: Angola AGT, Portugal AT, Moçambique AT).<br />
                  2. Escolha a taxa de IVA aplicável (ex: Geral 14%, Reduzida 5%, Isento 0%).<br />
                  3. Introduza o Custo de Compra (SEM IVA) ou com IVA (o sistema sincroniza automaticamente).<br />
                  4. Indique a margem percentual desejada ou um Preço Fixo Final de Venda.<br />
                  5. Clique em <strong>"Calcular Formação de Preço"</strong> para visualizar os 3 cenários padrão (10%, 20%, 30%) e o seu cenário personalizado, com o Lucro Líquido Real destacado.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 text-sm">C. Desembaraço Aduaneiro de Importação (Módulo PRO)</h4>
                <p>
                  Permite calcular o valor CIF (FOB + Frete + Seguro), Direitos Aduaneiros (Pauta Aduaneira), IEC e despesas portuárias para apurar o Custo Base Nacionalizado e a margem de revenda.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 text-sm">D. Histórico e Exportação em Excel (.xlsx)</h4>
                <p>
                  No separador <strong>"Meu Histórico"</strong>, o utilizador pode editar as descrições de cada consulta diretamente na tabela, pesquisar e descarregar relatórios formatados em Excel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. ADMIN MANUAL */}
        {activeSection === 'admin' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3">
              2. Manual de Administração & Níveis de Acesso (RBAC)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  NÍVEL 1: SUPER ADMINISTRADOR
                </span>
                <p className="font-bold text-slate-100">Controlo Total e Irrestrito</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Criação e gestão de outros administradores e utilizadores.</li>
                  <li>Ativação, suspensão e exclusão de contas.</li>
                  <li>Auditoria completa de logs com IP, horários e ações.</li>
                  <li>Ajuste das taxas unitárias por pesquisa (padrão 50 Kz).</li>
                  <li>Atualização dos dados bancários (IBAN e Multicaixa Express).</li>
                  <li>Acesso e exportação do schema do banco MySQL (.sql).</li>
                </ul>
              </div>

              <div className="bg-sky-950/20 border border-sky-500/30 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-400 text-slate-950 px-2 py-0.5 rounded">
                  NÍVEL 2: ADMINISTRADOR / GERENTE
                </span>
                <p className="font-bold text-slate-100">Gestão Comercial e Suporte</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Validação e aprovação de pagamentos recebidos por Multicaixa/IBAN.</li>
                  <li>Alteração de preços, validades e nomes dos 5 planos.</li>
                  <li>Visualização de relatórios de vendas e gráficos de receita.</li>
                  <li>Atendimento de tickets de suporte e moderação de conteúdo.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. WEB & MYSQL DEPLOY */}
        {activeSection === 'web' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-700/80 pb-3">
              3. Instalação Web & Integração com Banco MySQL / MariaDB
            </h3>

            <p>
              O sistema foi construído em arquitetura full-stack (Node.js + Express + TypeScript + React). O ficheiro de base de dados relacional é compatível com MySQL 8.0 e MariaDB.
            </p>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <p className="text-emerald-400 font-bold"># Passos para deploy em VPS / Linux (Ubuntu/Debian):</p>
              <p>1. git clone https://github.com/nanucloud/simulador.git</p>
              <p>2. cd simulador && npm install</p>
              <p>3. npm run build</p>
              <p>4. pm2 start dist/server.cjs --name "nanucloud-simulator"</p>
            </div>
          </div>
        )}

        {/* 4. WORDPRESS INTEGRATION */}
        {activeSection === 'wordpress' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                4. Plugin & Shortcode para WordPress
              </h3>
              <button
                onClick={() => copyToClipboard(wpCode, 'wp')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition"
              >
                {copiedCodeId === 'wp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeId === 'wp' ? 'Copiado!' : 'Copiar Código PHP'}</span>
              </button>
            </div>

            <p>
              Crie uma pasta em <code>wp-content/plugins/nanucloud-simulador/</code> e cole o código abaixo num arquivo chamado <code>nanucloud-simulador.php</code>. Depois use o shortcode <code>[nanucloud_simulador]</code> em qualquer página ou post do Elementor, Gutenberg ou Divi.
            </p>

            <pre className="bg-slate-900 border border-slate-800 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-indigo-300">
              {wpCode}
            </pre>
          </div>
        )}

        {/* 5. WINDOWS DESKTOP (.EXE) */}
        {activeSection === 'exe' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                5. Empacotamento Desktop Windows (.EXE) com Electron
              </h3>
              <button
                onClick={() => copyToClipboard(electronCode, 'exe')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition"
              >
                {copiedCodeId === 'exe' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeId === 'exe' ? 'Copiado!' : 'Copiar main.js'}</span>
              </button>
            </div>

            <p>
              Para gerar o instalador executável <code>.EXE</code> autônomo para Windows:
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
              npm install --save-dev electron electron-builder
              <br />
              npx electron-builder --win nsis:ia32,x64
            </div>

            <pre className="bg-slate-900 border border-slate-800 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-emerald-300">
              {electronCode}
            </pre>
          </div>
        )}

        {/* 6. ANDROID (.APK) & IOS */}
        {activeSection === 'apk' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                6. Compilação Mobile Android (.APK) & iOS (Capacitor)
              </h3>
              <button
                onClick={() => copyToClipboard(capacitorCode, 'cap')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition"
              >
                {copiedCodeId === 'cap' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeId === 'cap' ? 'Copiado!' : 'Copiar Config'}</span>
              </button>
            </div>

            <p>
              Utilizando Capacitor, o simulador transforma-se num aplicativo nativo para Android e iOS:
            </p>

            <pre className="bg-slate-900 border border-slate-800 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-teal-300">
              {capacitorCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
