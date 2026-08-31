import React, { useState } from 'react';
import {
  Laptop,
  Terminal,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  HardDrive,
  FileCode,
  Globe,
  ExternalLink,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';

export const WindowsExeManualGuide: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<'electron' | 'pkg' | 'edge' | 'inno'>('electron');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 font-mono text-xs shadow-xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Manual Passo a Passo: Converter em Aplicação Executável (.EXE) Windows
            </h3>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-bold">
              Windows 10 / 11 x64
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Guia completo para gerar executáveis nativos com motor SQLite embutido e compatibilidade total com navegadores no Windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`@echo off\ntitle NANUCLOUD Windows EXE Builder\ncall npm run build\ncd packages\\windows\ncall npm install\ncall npm run build:win\npause`, 'build_windows_exe.bat')}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-[11px] shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descarregar build_windows_exe.bat
          </button>
        </div>
      </div>

      {/* Method Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveMethod('electron')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeMethod === 'electron'
              ? 'bg-sky-500/10 border-sky-500 text-sky-300 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>1. Electron Builder</span>
            {activeMethod === 'electron' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Recomendado (Instalador + Portátil)</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('pkg')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeMethod === 'pkg'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>2. Node PKG</span>
            {activeMethod === 'pkg' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Ficheiro Único Sem Node.js</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('edge')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeMethod === 'edge'
              ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>3. Edge App Mode</span>
            {activeMethod === 'edge' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Zero Instalação (Nativo Windows)</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('inno')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeMethod === 'inno'
              ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>4. Inno Setup</span>
            {activeMethod === 'inno' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Instalador Windows Clássico</div>
        </button>
      </div>

      {/* METHOD 1: ELECTRON BUILDER */}
      {activeMethod === 'electron' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Passo a Passo com Electron Builder (Pasta /packages/windows)
              </h4>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                Gera Setup.exe e Portátil.exe
              </span>
            </div>

            <div className="space-y-3 text-[11px]">
              <div className="space-y-1">
                <div className="text-slate-300 font-bold">Passo 1: Compilar o Frontend & Backend</div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-300 flex items-center justify-between">
                  <code>npm run build</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm run build', 'm1_step1')}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    {copiedId === 'm1_step1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-300 font-bold">Passo 2: Aceder à pasta do pacote Windows</div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-300 flex items-center justify-between">
                  <code>cd packages\windows</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('cd packages\\windows', 'm1_step2')}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    {copiedId === 'm1_step2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-300 font-bold">Passo 3: Instalar as dependências do Electron e compilar o .EXE</div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-300 flex items-center justify-between">
                  <code>npm install && npm run build:win</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm install && npm run build:win', 'm1_step3')}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    {copiedId === 'm1_step3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5 text-[10px]">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ficheiros .EXE Gerados com Sucesso em packages\windows\dist\:
              </div>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                <li><strong className="text-slate-200">NANUCLOUD Fiscal Desktop Setup 2026.8.0.exe</strong> (Instalador NSIS com atalho no desktop)</li>
                <li><strong className="text-slate-200">NANUCLOUD Fiscal Desktop 2026.8.0.exe</strong> (Executável portátil para pen drive)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 2: NODE PKG */}
      {activeMethod === 'pkg' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Node PKG: Binário Único (.exe) de 1 Ficheiro
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                Zero Dependências de Node.js
              </span>
            </div>

            <div className="space-y-3 text-[11px]">
              <div className="space-y-1">
                <div className="text-slate-300 font-bold">Passo 1: Instalar a ferramenta de compilação PKG</div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-300 flex items-center justify-between">
                  <code>npm install -g @yao-pkg/pkg</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm install -g @yao-pkg/pkg', 'm2_step1')}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    {copiedId === 'm2_step1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-300 font-bold">Passo 2: Empacotar para Windows x64</div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-300 flex items-center justify-between">
                  <code>pkg dist\server.cjs --target node18-win-x64 --output dist\nanucloud-server.exe</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('pkg dist\\server.cjs --target node18-win-x64 --output dist\\nanucloud-server.exe', 'm2_step2')}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    {copiedId === 'm2_step2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: EDGE APP MODE */}
      {activeMethod === 'edge' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Microsoft Edge App Mode (Sem barra de URL / Janela Pura)
              </h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Nativo em Qualquer Windows 10/11
              </span>
            </div>

            <div className="space-y-3 text-[11px]">
              <p className="text-slate-300">
                O Windows possui o Microsoft Edge integrado. Você pode abrir o NANUCLOUD em uma janela de aplicação desktop independente com este comando:
              </p>

              <div className="p-2.5 bg-slate-900 rounded-lg text-amber-300 flex items-center justify-between">
                <code>msedge.exe --app=http://localhost:3000 --window-size=1280,800</code>
                <button
                  type="button"
                  onClick={() => handleCopy('msedge.exe --app=http://localhost:3000 --window-size=1280,800', 'm3_cmd')}
                  className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1"
                >
                  {copiedId === 'm3_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg text-slate-400 text-[10px] space-y-1">
                <div>✨ <strong>Vantagens:</strong></div>
                <div>• Zero tempo de compilação.</div>
                <div>• Janela com ícone próprio e sem botões de navegação web.</div>
                <div>• Consumo de memória ultra-baixo com aceleração de hardware.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 4: INNO SETUP */}
      {activeMethod === 'inno' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Inno Setup Compiler (Setup Wizard Profissional)
              </h4>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                Instalador Comercial
              </span>
            </div>

            <p className="text-slate-300 text-[11px]">
              O Inno Setup cria instaladores clássicos do Windows com assistente de instalação, termos de licença, seleção de pasta em <code className="text-purple-300">C:\Program Files\NANUCLOUD</code> e desinstalador automático.
            </p>

            <button
              type="button"
              onClick={() => downloadFile(`[Setup]\nAppName=NANUCLOUD Fiscal\nAppVersion=2026.8.0\nDefaultDirName={autopf}\\NANUCLOUD\nDefaultGroupName=NANUCLOUD\nOutputDir=installer_output\nOutputBaseFilename=Nanucloud_Setup_v2026\nCompression=lzma\nSolidCompression=yes\n\n[Files]\nSource: "dist\\*"; DestDir: "{app}\\dist"; Flags: recursesubdirs createallsubdirs\nSource: "data\\*"; DestDir: "{app}\\data"; Flags: recursesubdirs createallsubdirs\nSource: "INICIAR_SISTEMA.bat"; DestDir: "{app}"\n\n[Icons]\nName: "{group}\\NANUCLOUD"; Filename: "{app}\\INICIAR_SISTEMA.bat"\nName: "{autodesktop}\\NANUCLOUD"; Filename: "{app}\\INICIAR_SISTEMA.bat"`, 'setup_nanucloud.iss')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-[11px] shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descarregar Script Inno Setup (setup_nanucloud.iss)
            </button>
          </div>
        </div>
      )}

      {/* Windows Browser Compatibility Checklist */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Checklist de Compatibilidade com Navegadores no Windows</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Microsoft Edge
            </div>
            <div className="text-[10px] text-slate-400">
              Otimizado para motor Chromium do Windows 10 e 11 com suporte a PWA e App Mode.
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Google Chrome Windows
            </div>
            <div className="text-[10px] text-slate-400">
              Renderização acelerada por GPU, suporte a relatórios PDF instantâneos e ClearType font smoothing.
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mozilla Firefox Windows
            </div>
            <div className="text-[10px] text-slate-400">
              Suporte completo a IndexedDB, WebAssembly SQLite e atalhos F11 / Ctrl+P.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
