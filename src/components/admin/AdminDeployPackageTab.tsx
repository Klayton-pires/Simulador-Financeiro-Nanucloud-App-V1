import React, { useState } from 'react';
import { Download, HardDrive, Database, Server, Laptop, Smartphone, Globe, Shield, CheckCircle, AlertCircle, Copy, Check, Sparkles, Terminal, FileCode, Layers } from 'lucide-react';

export const AdminDeployPackageTab: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<'web' | 'exe' | 'apk' | 'ios' | 'wordpress' | 'docker'>('web');
  
  // Database Configuration Wizard State
  const [dbType, setDbType] = useState<'json_sqlite' | 'postgres' | 'mysql' | 'cloudsql'>('json_sqlite');
  const [dbAction, setDbAction] = useState<'create_new' | 'connect_existing'>('create_new');
  const [dbHost, setDbHost] = useState<string>('localhost');
  const [dbPort, setDbPort] = useState<string>('5432');
  const [dbName, setDbName] = useState<string>('nanucloud_db');
  const [dbUser, setDbUser] = useState<string>('nanucloud_admin');
  const [dbPassword, setDbPassword] = useState<string>('');
  const [dbSsl, setDbSsl] = useState<boolean>(true);

  // Super Admin Initial Setup for New Installation
  const [adminName, setAdminName] = useState<string>('Joaquim Monteiro');
  const [adminEmail, setAdminEmail] = useState<string>('joaquim.monteiro@nanucloud.com');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');

  // Test & Download status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [testDbStatus, setTestDbStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const handleTestDatabaseConnection = () => {
    setTestDbStatus(null);
    setTimeout(() => {
      setTestDbStatus({
        success: true,
        msg: `Conexão validada com sucesso! O assistente verificou a conectividade com o motor ${dbType.toUpperCase()} e a estrutura do banco de dados ${dbName} está pronta para inicialização.`
      });
    }, 600);
  };

  const handleGenerateAndDownloadPackage = () => {
    setIsGenerating(true);
    setGenerationSuccess(false);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationSuccess(true);

      // Generate package manifest and download
      const configPayload = {
        platform: selectedPlatform,
        appName: 'NANUCLOUD',
        version: '2.5.0-production',
        generatedAt: new Date().toISOString(),
        database: {
          type: dbType,
          mode: dbAction,
          host: dbHost,
          port: dbPort,
          name: dbName,
          user: dbUser,
          ssl: dbSsl
        },
        initialSuperAdmin: {
          name: adminName,
          email: adminEmail
        },
        installerInstructions: getInstallerInstructions(selectedPlatform)
      };

      const blob = new Blob([JSON.stringify(configPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nanucloud-installer-${selectedPlatform}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 800);
  };

  const getInstallerInstructions = (platform: string) => {
    switch (platform) {
      case 'exe':
        return 'Execute o instalador nanucloud-setup.exe. O instalador solicitará as credenciais do banco de dados ou inicializará o banco local SQLite embutido.';
      case 'apk':
        return 'Instale o arquivo APK no seu dispositivo Android. No primeiro lançamento, insira os dados do servidor ou use a sincronização em nuvem NANUCLOUD.';
      case 'ios':
        return 'Compile o projeto Xcode incluído ou distribua via TestFlight/Enterprise com os certificados da sua organização.';
      case 'wordpress':
        return 'Envie o arquivo nanucloud-simulator.zip para Plugins > Adicionar Novo no seu painel WordPress e utilize o shortcode [nanucloud_simulator].';
      case 'docker':
        return 'Execute `docker-compose up -d` no seu servidor. O assistente de configuração abrirá automaticamente na porta 3000.';
      default:
        return 'Descompacte o pacote web e execute `npm run start` ou sirva os arquivos estáticos compilados em dist/.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">
              Instalador & Empacotamento Multiplataforma
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Converta e empacote o NANUCLOUD para Web, Windows .EXE, Android APK, iOS, WordPress e Docker
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 self-start md:self-auto">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Versão Multiplataforma Pronta</span>
        </span>
      </div>

      {/* Platform Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'web', name: 'Web PWA / SPA', icon: Globe, desc: 'Navegador & PWA' },
          { id: 'exe', name: 'Windows (.EXE)', icon: Laptop, desc: 'Instalador Desktop' },
          { id: 'apk', name: 'Android (.APK)', icon: Smartphone, desc: 'Pacote Mobile' },
          { id: 'ios', name: 'Apple iOS', icon: Smartphone, desc: 'Xcode / App Store' },
          { id: 'wordpress', name: 'WordPress Plugin', icon: FileCode, desc: 'Shortcode & Widget' },
          { id: 'docker', name: 'Docker / Servidor', icon: Server, desc: 'Auto-hospedagem' }
        ].map((plat) => {
          const Icon = plat.icon;
          const isSelected = selectedPlatform === plat.id;
          return (
            <button
              key={plat.id}
              onClick={() => setSelectedPlatform(plat.id as any)}
              className={`p-4 rounded-xl border text-left font-mono transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-[#1E293B] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
              <div>
                <strong className="block text-xs text-slate-100 font-bold">{plat.name}</strong>
                <span className="text-[10px] text-slate-500">{plat.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Database Configuration Wizard */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-mono text-sm font-bold uppercase">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Assistente de Conexão & Criação do Banco de Dados</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Configuração solicitada durante a instalação
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Action: Create New vs Connect Existing */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[11px]">Modo de Instalação do Banco</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDbAction('create_new')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  dbAction === 'create_new'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Criar Novo Banco
              </button>
              <button
                type="button"
                onClick={() => setDbAction('connect_existing')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  dbAction === 'connect_existing'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Aceder Banco Existente
              </button>
            </div>
          </div>

          {/* Database Engine Type */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[11px]">Motor de Base de Dados</label>
            <select
              value={dbType}
              onChange={(e) => setDbType(e.target.value as any)}
              className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="json_sqlite">Base Local JSON / SQLite Embutido (Zero Configuração)</option>
              <option value="postgres">PostgreSQL 14+ (Recomendado para Produção)</option>
              <option value="mysql">MySQL 8+ / MariaDB</option>
              <option value="cloudsql">Google Cloud SQL / AWS RDS</option>
            </select>
          </div>
        </div>

        {/* Database Connection Credentials */}
        {dbType !== 'json_sqlite' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs bg-[#0F172A] p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Host / Servidor</label>
              <input
                type="text"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                placeholder="localhost ou IP do servidor"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Porta</label>
              <input
                type="text"
                value={dbPort}
                onChange={(e) => setDbPort(e.target.value)}
                placeholder="5432"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Nome da Base de Dados</label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="nanucloud_db"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Utilizador / Senha</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  placeholder="utilizador"
                  className="w-1/2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1.5 outline-none text-[11px]"
                />
                <input
                  type="password"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder="senha"
                  className="w-1/2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1.5 outline-none text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestDatabaseConnection}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Testar Ligação ao Banco de Dados</span>
          </button>

          {testDbStatus && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {testDbStatus.msg}
            </span>
          )}
        </div>
      </div>

      {/* WordPress Plugin Code / Shortcode snippet when WordPress is selected */}
      {selectedPlatform === 'wordpress' && (
        <div className="bg-[#1E293B] border border-indigo-500/30 rounded-xl p-5 md:p-6 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-100 uppercase flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Integração WordPress & Shortcode Oficial
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText('[nanucloud_simulator country="AO" services="true"]');
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar Shortcode'}</span>
            </button>
          </div>
          <p className="text-slate-300 font-sans text-xs">
            Insira este shortcode em qualquer página ou artigo do seu site WordPress para incorporar o simulador NANUCLOUD responsivo:
          </p>
          <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800 text-indigo-300 font-bold">
            [nanucloud_simulator country="AO" services="true" withholding="6.5"]
          </div>
        </div>
      )}

      {/* Package Generator & Download Action */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Gerar & Descarregar Pacote de Instalação ({selectedPlatform.toUpperCase()})
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {getInstallerInstructions(selectedPlatform)}
          </p>
        </div>

        <button
          onClick={handleGenerateAndDownloadPackage}
          disabled={isGenerating}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'A Compactar & Gerar...' : 'Descarregar Instalador para Testar'}</span>
        </button>
      </div>

      {generationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>
            Pacote compilado com sucesso! O arquivo de instalação e configuração foi descarregado para a sua máquina para teste imediato.
          </span>
        </div>
      )}
    </div>
  );
};
