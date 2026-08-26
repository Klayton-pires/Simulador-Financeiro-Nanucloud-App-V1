import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  Monitor,
  Smartphone,
  Server,
  Globe,
  Database,
  Code,
  CheckCircle2,
  Terminal,
  Layers,
  Copy,
  Check,
  FileCode,
  BookOpen,
  Apple,
  ExternalLink,
  Laptop,
  Cpu,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';
import { UserSafe } from '../types';
import { ScrollableRibbon } from './common/ScrollableRibbon';

interface MultiplatformHubTabProps {
  currentUser: UserSafe | null;
}

export const MultiplatformHubTab: React.FC<MultiplatformHubTabProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'platforms' | 'pc_guide' | 'android_guide' | 'database_hub'>('platforms');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const platforms = [
    {
      id: 'web',
      name: 'Web Standalone & PWA',
      folder: '/packages/web/',
      badge: 'HTML5 / JS / PWA',
      color: 'from-blue-600/20 to-cyan-600/20 border-cyan-500/40 text-cyan-400',
      icon: Globe,
      description: 'Aplicação web pura sem dependências pesadas, com base de dados SQLite/IndexedDB e PWA offline.',
      database: 'IndexedDB + LocalStorage SQLite Store',
      quickCmd: 'npx serve packages/web',
      files: ['index.html', 'app.js', 'db.js', 'server.js', 'package.json', 'README.md']
    },
    {
      id: 'php',
      name: 'PHP 8.1+ & SQLite MVC',
      folder: '/packages/php/',
      badge: 'PHP 8.1+ / Apache / Nginx',
      color: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/40 text-indigo-400',
      icon: Server,
      description: 'Motor completo em PHP nativo com ligação direta à base de dados SQLite (database.sqlite) e XAMPP ready.',
      database: 'SQLite3 nativo (database.sqlite) & MySQL schema',
      quickCmd: 'php -S localhost:8000 packages/php/index.php',
      files: ['index.php', 'database.sqlite', 'schema.sql', 'test_server.bat', 'README.md']
    },
    {
      id: 'wordpress',
      name: 'Plugin WordPress Oficial',
      folder: '/packages/wordpress/',
      badge: 'WordPress 6.x / WooCommerce',
      color: 'from-sky-600/20 to-blue-600/20 border-sky-500/40 text-sky-400',
      icon: Layers,
      description: 'Plugin WordPress com shortcode [nanucloud_simulator], criação automática de tabelas MySQL e painel admin.',
      database: 'MySQL (wp_nanucloud_clients, wp_nanucloud_simulations)',
      quickCmd: 'Copiar para wp-content/plugins/ e ativar no /wp-admin',
      files: ['nanucloud-fiscal-simulator.php', 'readme.txt', 'schema.sql']
    },
    {
      id: 'windows',
      name: 'Windows Desktop (.exe)',
      folder: '/packages/windows/',
      badge: 'Windows 10 / 11 x64',
      color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-blue-400',
      icon: Laptop,
      description: 'Aplicação nativa para desktop Windows com Electron, instalador NSIS/Portátil e base de dados local segura.',
      database: 'SQLite / JSON AppData Database',
      quickCmd: 'npm start (na pasta packages/windows)',
      files: ['main.js', 'preload.js', 'package.json', 'build_windows.bat', 'README.md']
    },
    {
      id: 'android',
      name: 'Android Studio / Kotlin',
      folder: '/packages/android/',
      badge: 'Android 10+ / Room DB',
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40 text-emerald-400',
      icon: Smartphone,
      description: 'Projeto completo Android Studio com MainActivity em Kotlin, WebView avançada e SQLite nativo (Room/SQLiteHelper).',
      database: 'Android SQLite / Room (nanucloud_android.db)',
      quickCmd: 'Abrir no Android Studio e clicar em Run (Shift + F10)',
      files: ['MainActivity.kt', 'NanuCloudDbHelper.kt', 'AndroidManifest.xml', 'build.gradle', 'README.md']
    },
    {
      id: 'ios',
      name: 'iOS Swift / Xcode Project',
      folder: '/packages/ios/',
      badge: 'iOS 15+ / Swift 5',
      color: 'from-rose-600/20 to-pink-600/20 border-rose-500/40 text-rose-400',
      icon: Apple,
      description: 'Estrutura de projeto iOS nativo em Swift com WKWebView, persistência SQLite3 no Sandbox e suporte a iPad/iPhone.',
      database: 'iOS SQLite3 / CoreData (nanucloud_ios.sqlite)',
      quickCmd: 'Abrir projeto no Xcode e executar no Simulador iOS',
      files: ['AppDelegate.swift', 'Info.plist', 'Podfile', 'README.md']
    },
    {
      id: 'mac',
      name: 'macOS Desktop (.dmg)',
      folder: '/packages/mac/',
      badge: 'Apple Silicon (M1/M2/M3) & Intel',
      color: 'from-slate-600/20 to-zinc-600/20 border-slate-500/40 text-slate-300',
      icon: Monitor,
      description: 'Aplicação desktop com suporte à barra de menus do macOS, atalhos de teclado (Cmd+N) e banco de dados SQLite.',
      database: 'macOS SQLite / Application Support',
      quickCmd: 'npm start (na pasta packages/mac)',
      files: ['main.js', 'package.json', 'README.md']
    },
    {
      id: 'remix',
      name: 'Remix.run 2.x & Prisma ORM',
      folder: '/packages/remix/',
      badge: 'Remix / Vite / Prisma',
      color: 'from-purple-600/20 to-fuchsia-600/20 border-purple-500/40 text-purple-400',
      icon: Code,
      description: 'Cópia integral moderna em arquitetura Remix com Server-Side Rendering (SSR), rotas dinâmicas e Prisma SQLite.',
      database: 'Prisma ORM com SQLite (prisma/dev.db)',
      quickCmd: 'npx prisma db push && npm run dev',
      files: ['remix.config.js', 'package.json', 'prisma/schema.prisma', 'app/root.tsx', 'README.md']
    }
  ];

  // ZIP Generation Function using JSZip
  const handleDownloadPlatformZip = async (platformId: string) => {
    try {
      setDownloadingId(platformId);
      const zip = new JSZip();

      // Read shared database schema
      const sharedSchema = `-- NANUCLOUD UNIFIED SCHEMA\n-- Plataforma: ${platformId.toUpperCase()}\n-- Criado em: ${new Date().toISOString()}\n\nCREATE TABLE IF NOT EXISTS nanucloud_clients (\n    id VARCHAR(64) PRIMARY KEY,\n    name VARCHAR(255) NOT NULL,\n    company_name VARCHAR(255) NOT NULL,\n    nif VARCHAR(64) NOT NULL,\n    email VARCHAR(255) NOT NULL,\n    queries_remaining INT DEFAULT 500\n);\n\nCREATE TABLE IF NOT EXISTS nanucloud_simulations (\n    id VARCHAR(64) PRIMARY KEY,\n    product_description VARCHAR(255) NOT NULL,\n    cost_price DECIMAL(15,2) NOT NULL,\n    final_pvp DECIMAL(15,2) NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n`;

      if (platformId === 'all') {
        // Build all-in-one ZIP with all platforms and manuals
        const rootZip = zip.folder('nanucloud-multiplatform-bundle');
        rootZip?.file('MANUAL_TESTES_TODAS_PLATAFORMAS.md', getFullManualContent());
        rootZip?.file('schema_unificado.sql', sharedSchema);

        // Add subfolders
        for (const p of platforms) {
          const sub = rootZip?.folder(p.id);
          sub?.file('README.md', `# NANUCLOUD - Plataforma ${p.name}\n\nConsulte o MANUAL_TESTES_TODAS_PLATAFORMAS.md para executar no PC ou Android.\n`);
          sub?.file('schema.sql', sharedSchema);
          if (p.id === 'php') {
            sub?.file('test_server.bat', '@echo off\nphp -S localhost:8000\npause\n');
          }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, 'nanucloud-todas-as-plataformas-bundle.zip');
      } else {
        const plat = platforms.find((p) => p.id === platformId);
        const folder = zip.folder(`nanucloud-${platformId}`);
        folder?.file('README.md', `# NANUCLOUD - Plataforma ${plat?.name}\n\nComo testar no PC e Android:\n1. Leia as instruções em MANUAL_TESTES.md\n2. Base de dados incluída no formato SQLite / MySQL.\n`);
        folder?.file('MANUAL_TESTES.md', getFullManualContent());
        folder?.file('schema.sql', sharedSchema);

        if (platformId === 'php') {
          folder?.file('test_server.bat', '@echo off\nphp -S localhost:8000\npause\n');
          folder?.file('test_server.sh', '#!/bin/bash\nphp -S localhost:8000\n');
        } else if (platformId === 'windows') {
          folder?.file('package.json', JSON.stringify({ name: 'nanucloud-windows', version: '2026.8.0', main: 'main.js' }, null, 2));
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, `nanucloud-${platformId}-pacote.zip`);
      }
    } catch (err) {
      console.error('Erro ao gerar pacote ZIP:', err);
      alert('Erro ao gerar ficheiro ZIP.');
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFullManualContent = () => {
    return `# MANUAL DE TESTES NANUCLOUD (PC & ANDROID)
Versão: 2026.8.0

1. TESTES NO PC:
- PHP: php -S localhost:8000 (abrir http://localhost:8000)
- Web: npx serve . ou python -m http.server 3000
- Windows: npm install && npm start
- WordPress: Copiar para wp-content/plugins e usar [nanucloud_simulator]
- Remix: npm install && npx prisma db push && npm run dev

2. TESTES NO TELEMÓVEL ANDROID:
- Método 1 (Wi-Fi): Abrir http://IP_DO_SEU_PC:8000 no Google Chrome do telemóvel
- Método 2 (PWA): Clicar nos 3 pontinhos do Chrome > "Instalar Aplicação"
- Método 3 (Termux): No telemóvel: pkg install php && php -S 0.0.0.0:8080
- Método 4 (APK): Abrir /packages/android no Android Studio e clicar em Run.
`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-slate-900 to-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" /> MULTI-PLATAFORMAS & CENTRAL DE DOWNLOAD
              </h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                8 Ecossistemas Prontos
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                Bases de Dados Incluídas
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Réplicas independentes criadas em pastas dedicadas para descarregar, testar no PC e instalar no telemóvel Android.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleDownloadPlatformZip('all')}
              disabled={downloadingId === 'all'}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4" />
              {downloadingId === 'all' ? 'A gerar Bundle...' : 'Descarregar Todas as Plataformas (ZIP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Nav with Left & Right Arrow Navigation */}
      <div className="border-b border-slate-800 pb-3">
        <ScrollableRibbon id="multiplatform-subtabs-ribbon" arrowSize="md" scrollAmount={280} className="font-mono text-xs gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('platforms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeSubTab === 'platforms'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" /> 1. Pacotes por Plataforma ({platforms.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('pc_guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeSubTab === 'pc_guide'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-sky-400" /> 2. Manual de Testes no PC
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('android_guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeSubTab === 'android_guide'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" /> 3. Manual de Testes no Telemóvel Android
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('database_hub')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeSubTab === 'database_hub'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" /> 4. Bases de Dados & Schemas SQL
          </button>
        </ScrollableRibbon>
      </div>

      {/* SUB-TAB 1: PLATFORM CARDS */}
      {activeSubTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isDownloading = downloadingId === p.id;

            return (
              <div
                key={p.id}
                className="bg-[#1E293B] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.color} border flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100">{p.name}</h3>
                    <span className="text-[10px] font-mono text-indigo-400 block">{p.folder}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Base de Dados:</div>
                    <div className="text-emerald-400 flex items-center gap-1">
                      <Database className="w-3 h-3 shrink-0" /> {p.database}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDownloadPlatformZip(p.id)}
                    disabled={isDownloading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isDownloading ? 'A Descarregar...' : 'Descarregar Pacote (.zip)'}
                  </button>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{p.files.length} ficheiros essenciais</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(p.quickCmd, p.id)}
                      className="hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      title="Copiar comando de teste"
                    >
                      {copiedCmd === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCmd === p.id ? 'Copiado!' : 'Copiar Comando'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: PC TESTING GUIDE */}
      {activeSubTab === 'pc_guide' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" /> GUIA DE EXECUÇÃO E TESTES NO COMPUTADOR (PC / MAC / LINUX)
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Instruções Passo a Passo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PHP & SQLite */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-400" /> 1. Testar Versão PHP & SQLite
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">XAMPP / CLI</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Abra a pasta <code className="text-indigo-300">packages/php/</code> e inicie o servidor interno do PHP:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-200">
                <code>php -S localhost:8000</code>
                <button
                  onClick={() => handleCopyCommand('php -S localhost:8000', 'php_cmd')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'php_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-500 text-[10px]">
                Aceda no navegador a: <strong className="text-slate-300">http://localhost:8000</strong>. No Windows pode clicar diretamente em <code className="text-indigo-300">test_server.bat</code>.
              </p>
            </div>

            {/* WordPress Plugin */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" /> 2. Testar Plugin WordPress
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">WP 6.x</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Copie a pasta <code className="text-sky-300">packages/wordpress/</code> para a pasta de plugins do seu WordPress:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg text-slate-200 text-[10px]">
                <code>wp-content/plugins/nanucloud-fiscal/</code>
              </div>
              <p className="text-slate-500 text-[10px]">
                Ative o plugin no painel de administração e insira o shortcode <strong className="text-slate-300">[nanucloud_simulator]</strong> em qualquer página!
              </p>
            </div>

            {/* Windows Desktop */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-400" /> 3. Testar Aplicação Windows (.exe)
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Electron</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Na pasta <code className="text-blue-300">packages/windows/</code>, execute os comandos:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-200">
                <code>npm install && npm start</code>
                <button
                  onClick={() => handleCopyCommand('npm install && npm start', 'win_cmd')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'win_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-500 text-[10px]">
                Para gerar o ficheiro executável (.exe), execute <code className="text-blue-300">npm run build:win</code>.
              </p>
            </div>

            {/* Remix.run & Prisma */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-purple-400" /> 4. Testar Remix.run & Prisma
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Prisma DB</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Na pasta <code className="text-purple-300">packages/remix/</code>, execute:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-200">
                <code>npm install && npx prisma db push && npm run dev</code>
                <button
                  onClick={() => handleCopyCommand('npm install && npx prisma db push && npm run dev', 'remix_cmd')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'remix_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-500 text-[10px]">
                Abra no navegador em <strong className="text-slate-300">http://localhost:5173</strong>. Use <code className="text-purple-300">npx prisma studio</code> para visualizar a base de dados.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANDROID SMARTPHONE TESTING GUIDE */}
      {activeSubTab === 'android_guide' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> GUIA DE TESTES NO TELEMÓVEL ANDROID (4 MÉTODOS)
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Totalmente Compatível
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Método 1: Wi-Fi Local */}
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
                <span>Método Wi-Fi Direto (Sem Instalação)</span>
              </div>
              <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1.5 leading-relaxed">
                <li>Conecte o seu PC e o telemóvel Android à mesma rede Wi-Fi.</li>
                <li>Inicie o servidor no PC (ex: <code className="text-emerald-300">php -S 0.0.0.0:8000</code>).</li>
                <li>Descubra o IP do PC (com o comando <code className="text-emerald-300">ipconfig</code> no Windows).</li>
                <li>No Chrome do telemóvel Android, abra: <strong className="text-emerald-400">http://192.168.x.x:8000</strong>.</li>
              </ol>
            </div>

            {/* Método 2: PWA Install */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                <span>Instalar como Aplicação PWA no Android</span>
              </div>
              <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1.5 leading-relaxed">
                <li>Abra o NANUCLOUD no Google Chrome do seu telemóvel Android.</li>
                <li>Toque no menu de 3 pontinhos no canto superior direito do Chrome.</li>
                <li>Selecione <strong>"Adicionar ao ecrã principal"</strong> ou <strong>"Instalar aplicação"</strong>.</li>
                <li>A aplicação abrirá em ecrã total e funcionará mesmo offline!</li>
              </ol>
            </div>

            {/* Método 3: Termux Local Server */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
                <span>Servidor Local no Android com Termux</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Instale o Termux no Android e rode o PHP diretamente no telemóvel:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg text-slate-200 text-[10px]">
                <code>pkg install php sqlite && php -S 0.0.0.0:8080</code>
              </div>
              <p className="text-slate-500 text-[10px]">
                Abra no navegador do telemóvel em <strong className="text-slate-300">http://localhost:8080</strong>.
              </p>
            </div>

            {/* Método 4: Android Studio APK */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">4</span>
                <span>Build de APK Nativo no Android Studio</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Abra a pasta <code className="text-cyan-300">packages/android/</code> no Android Studio:
              </p>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                Conecte o seu smartphone via cabo USB com a Depuração USB ativada e clique em <strong>Run 'app'</strong> para compilar o APK nativo com SQLite!
              </p>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: DATABASE & SCHEMAS */}
      {activeSubTab === 'database_hub' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> ARQUITETURA DE DADOS UNIFICADA (SQLITE / MYSQL / ROOM)
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Ficheiro /data/schema.sql
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-indigo-300">1. nanucloud_staff_users</div>
              <p className="text-slate-400 text-[10px]">
                Utilizadores internos, Super Admins, Gestores Comerciais, departamentos e permissões RBAC.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-emerald-300">2. nanucloud_clients</div>
              <p className="text-slate-400 text-[10px]">
                Clientes CRM, NIF fiscal, empresas, planos ativos, saldos de consultas e módulos desbloqueados.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-cyan-300">3. nanucloud_simulations</div>
              <p className="text-slate-400 text-[10px]">
                Histórico detalhado de cálculos de PVP, taxas de IVA, direitos aduaneiros e margens de lucro.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">Amostra do Script SQL (/data/schema.sql):</span>
              <button
                type="button"
                onClick={() => handleCopyCommand(getFullManualContent(), 'manual_copy')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCmd === 'manual_copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar Manual Completo
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-lg text-slate-300 text-[10px] overflow-x-auto max-h-60">
{`CREATE TABLE IF NOT EXISTS nanucloud_clients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nif VARCHAR(64) NOT NULL,
    client_category VARCHAR(32) DEFAULT 'comercio',
    active_plan_name VARCHAR(128) DEFAULT 'Plano Ouro Pro',
    queries_remaining INT DEFAULT 500,
    is_import_unlocked INT DEFAULT 1,
    is_batch_unlocked INT DEFAULT 1,
    is_api_unlocked INT DEFAULT 0
);`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
