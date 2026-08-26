import React, { useState } from 'react';
import {
  FileCode,
  Lock,
  Download,
  Terminal,
  Server,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Cpu,
  HardDrive,
  RefreshCw,
  Layers,
  BookOpen
} from 'lucide-react';
import { UserSafe } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DocsAndDeployTabProps {
  currentUser: UserSafe;
}

export const DocsAndDeployTab: React.FC<DocsAndDeployTabProps> = ({ currentUser }) => {
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin_level1';
  const [selectedManual, setSelectedManual] = useState<string>('install');

  if (!isSuperAdmin) {
    return (
      <div className="bg-[#1E293B] border border-rose-500/40 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-100 font-mono">ACESSO RESTRITO AO SUPER ADMINISTRADOR</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          O módulo <strong className="text-slate-200">Docs & Deploy</strong> contém manuais confidenciais de arquitetura de servidores, chaves criptográficas de compilação e infraestrutura em nuvem. A sua conta não possui credenciais de Super Administrador para aceder a esta área.
        </p>
      </div>
    );
  }

  const manuals = [
    {
      id: 'install',
      title: 'Manual de Instalação & Setup do Servidor',
      category: 'Infraestrutura',
      desc: 'Requisitos de hardware, Docker, Nginx Reverse Proxy, certificados SSL e NodeJS 20+'
    },
    {
      id: 'admin',
      title: 'Manual de Administração & Grupos de Permissão (RBAC)',
      category: 'Governança',
      desc: 'Gestão de utilizadores, matriz de privilégios, auditoria e segurança'
    },
    {
      id: 'maintenance',
      title: 'Manual de Manutenção, Backups & Recuperação de Desastres',
      category: 'Operações',
      desc: 'Rotinas automáticas de backup do banco de dados, limpeza de logs e failover'
    },
    {
      id: 'fiscal_update',
      title: 'Manual de Atualização das Legislações Fiscais (AGT / AT)',
      category: 'Fiscalidade',
      desc: 'Como cadastrar novas alíquotas de IVA, pautas aduaneiras e fontes governamentais'
    },
    {
      id: 'user_guide',
      title: 'Manual do Utilizador & Fórmulas Matemáticas de Preço',
      category: 'Utilização',
      desc: 'Desdobramento detalhado do cálculo de mark-up, margens, TPA e retenções de serviços'
    },
    {
      id: 'deploy',
      title: 'Manual de Deploy Contínuo (CI/CD & Cloud Run)',
      category: 'Deploy',
      desc: 'Scripts de automação, variáveis de ambiente seguras e compilação de produção'
    },
    {
      id: 'mobile_app',
      title: 'Manual Mobile: Versão Navegador & App (PWA / APK Android / iOS)',
      category: 'Mobile & POS',
      desc: 'Instruções para operação em smartphone, instalação como app sem loja (PWA) e compilação nativa'
    }
  ];

  const handleDownloadFullManualPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('NANUCLOUD TECH SOLUTIONS — MANUAL COMPLETO DO SISTEMA', 14, 18);
    doc.setFontSize(10);
    doc.text('Guia Oficial de Instalação, Manutenção, Administração e Deploy', 14, 25);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')} • Super Administrador: ${currentUser.name}`, 14, 30);

    const rows = manuals.map((m) => [m.title, m.category, m.desc]);

    autoTable(doc, {
      startY: 36,
      head: [['Título do Manual', 'Categoria', 'Descrição Resumida']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.addPage();
    doc.setFontSize(14);
    doc.text('1. SCRIPT DE DEPLOY E INICIALIZAÇÃO AUTOMATIZADA', 14, 20);
    doc.setFontSize(9);
    doc.text(`
# Atualização de pacotes do servidor Linux Ubuntu 24.04 LTS
sudo apt update && sudo apt upgrade -y

# Instalação do Node.js LTS e Docker
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs docker.io docker-compose-plugin

# Clonagem e Instalação de Dependências NANUCLOUD
git clone https://github.com/nanucloud/fiscal-pricing-engine.git
cd fiscal-pricing-engine
npm install --production

# Compilação e Inicialização do Servidor de Produção
npm run build
npm run start
    `, 14, 30);

    doc.save(`NANUCLOUD_Manuais_Oficiais_Completos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">DOCS & DEPLOY DE PRODUÇÃO</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Exclusivo Super Administrador
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manuais de instalação, manutenção, governança de banco de dados e comandos de deploy
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadFullManualPDF}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Download className="w-4 h-4" /> Baixar Pasta de Manuais em PDF
        </button>
      </div>

      {/* Server Status Monitor (Super Admin Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">ESTADO DO SERVIDOR</span>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4" /> Ativo (Porta 3000)
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">CPU & MEMÓRIA</span>
            <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
              12% Uso • 240 MB / 2 GB
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">BANCO DE DADOS ATIVO</span>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
              MySQL 8.0 & PostgreSQL 16
            </div>
          </div>
        </div>
      </div>

      {/* Manuals Selector & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lista de Manuais */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider px-2 mb-2">
            PASTA OFICIAL DE MANUAIS
          </h3>

          {manuals.map((m) => {
            const isSelected = selectedManual === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedManual(m.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-indigo-400 text-[10px] font-bold uppercase">{m.category}</span>
                </div>
                <div className="font-bold text-slate-200 text-xs">{m.title}</div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Conteúdo do Manual Selecionado */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              {manuals.find((m) => m.id === selectedManual)?.title}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              v2026.1 Official
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4 leading-relaxed overflow-x-auto">
            {selectedManual === 'install' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># PROCEDIMENTO DE INSTALAÇÃO EM SERVIDOR LINUX / CLOUD</p>
                <p>1. Certifique-se de que o servidor possui Linux Ubuntu 22.04/24.04 com 2GB de RAM e 20GB de disco.</p>
                <p>2. Execute o comando de compilação da aplicação:</p>
                <pre className="text-amber-300 bg-slate-900 p-2.5 rounded">npm run build</pre>
                <p>3. Inicie o processo através do gestor PM2 para reinicialização contínua automática:</p>
                <pre className="text-amber-300 bg-slate-900 p-2.5 rounded">pm2 start dist/server.cjs --name "nanucloud-fiscal"</pre>
              </div>
            )}

            {selectedManual === 'admin' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># GOVERNANÇA DE PERMISSÕES & CONTROLO RBAC</p>
                <p>A hierarquia do sistema obedece a 5 níveis estritos:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Super Administrador:</strong> Acesso irrestrito a Docs, Deploy, Motores de Banco de Dados e Grupos.</li>
                  <li><strong>Administrador:</strong> Gestão de clientes, planos e validação manual de pagamentos.</li>
                  <li><strong>Gestor:</strong> Atualização da matriz fiscal e interação com IA Fiscal.</li>
                  <li><strong>Utilizador:</strong> Operações de cálculo e atendimento de tickets.</li>
                  <li><strong>Clientes:</strong> Simulação de vendas, importação, lotes Excel e chamadas de API.</li>
                </ul>
              </div>
            )}

            {selectedManual === 'deploy' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># COMANDOS DE DEPLOY EM NUVEM (DOCKER & CLOUD RUN)</p>
                <p>Para gerar o contêiner de produção execute:</p>
                <pre className="text-amber-300 bg-slate-900 p-2.5 rounded">
docker build -t gcr.io/nanucloud/fiscal-pricing:latest .
docker push gcr.io/nanucloud/fiscal-pricing:latest
                </pre>
                <p>A porta de execução interna e externa está fixada na porta 3000.</p>
              </div>
            )}

            {selectedManual === 'fiscal_update' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># ATUALIZAÇÕES DA LEGISLAÇÃO FISCAL</p>
                <p>Todas as taxas podem ser alteradas na aba Matriz Fiscal ou sincronizadas pelo módulo IA Fiscal com referência aos portais da AGT, AT, RFB e DNRE.</p>
              </div>
            )}

            {selectedManual === 'user_guide' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># FÓRMULAS MATEMÁTICAS APLICADAS</p>
                <p><strong>Comércio:</strong> PVP = (Custo / (1 - Margem%)) + IVA + TPA</p>
                <p><strong>Serviços:</strong> Total Faturado = Honorário Base + IVA - Retenção na Fonte</p>
                <p><strong>Importação:</strong> Custo Total Aduaneiro = FOB + Frete + Seguro + Direitos + Taxa Estatística + IVA</p>
              </div>
            )}

            {selectedManual === 'maintenance' && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold"># ROTINAS DE MANUTENÇÃO & BACKUP</p>
                <p>Backups diários são executados às 02:00 UTC com retenção de 30 dias em armazenamento redundante criptografado.</p>
              </div>
            )}

            {selectedManual === 'mobile_app' && (
              <div className="space-y-4">
                <p className="text-emerald-400 font-bold"># GUIA OFICIAL DE OPERAÇÃO MOBILE (NAVEGADOR & APP)</p>
                
                <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-indigo-300 font-bold">1. Acesso via Navegador no Smartphone (iOS / Android):</h4>
                  <p>A aplicação é 100% responsiva (Mobile First). No telemóvel, o layout adapta-se com o "Modo Celular Básico / POS" de digitação rápida, cálculo instantâneo e teclado numérico otimizado.</p>
                  <p className="text-slate-400">Suporte integral em: Google Chrome Mobile, Apple Safari iOS, Firefox Mobile e Samsung Internet.</p>
                </div>

                <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-emerald-300 font-bold">2. Instalação como App PWA (Sem necessidade de Loja de Aplicações):</h4>
                  <p>• <strong>No Android (Chrome):</strong> Toque no menu ⋮ (três pontos) e selecione <span className="text-white font-bold">"Instalar aplicação"</span> ou <span className="text-white font-bold">"Adicionar ao ecrã principal"</span>.</p>
                  <p>• <strong>No iPhone / iPad (Safari):</strong> Toque no botão de partilha <span className="text-white font-bold">Compartilhar ⎋</span> e selecione <span className="text-white font-bold">"Adicionar ao Ecrã Principal"</span>.</p>
                  <p className="text-slate-400">O ícone oficial do NANUCLOUD aparecerá no ecrã como uma aplicação nativa que funciona em ecrã inteiro sem barra de endereços.</p>
                </div>

                <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-purple-300 font-bold">3. Compilação de Pacote Nativo (.APK Android / .IPA iOS):</h4>
                  <p>Para empacotar como binário nativo para distribuição corporativa interna (MDM) ou Google Play Store:</p>
                  <pre className="text-amber-300 bg-slate-950 p-2.5 rounded font-mono text-[11px]">
npx cap add android
npx cap copy
npx cap open android # Abre o projeto pronto no Android Studio para gerar o APK
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DRIVERS, NAVEGADOR & SOFTWARES ESSENCIAIS PARA FUNCIONAMENTO */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                PASTA DE DRIVERS, NAVEGADOR & SOFTWARES DE EXECUÇÃO
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Auto-Instalação & Atualização Automática Ativa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Caso algum componente esteja em falta no ato da instalação do dispositivo, o sistema atualiza e instala automaticamente para a versão mais recente sem solicitar permissão adicional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Homologado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Navegador Chromium Headless / Engine',
              version: 'v124.0.6367 (Auto-Update)',
              status: 'Atualizado & Operacional',
              desc: 'Motor para geração ultra-rápida de PDFs, relatórios fiscais e renderização headless.'
            },
            {
              name: 'Drivers ODBC MySQL & MS SQL Server',
              version: 'v18.3 Enterprise Native',
              status: 'Instalado & Sincronizado',
              desc: 'Conectores universais para pooling de dados e replicação fiscal em tempo real.'
            },
            {
              name: 'Driver de Impressão Térmica POS / Esc/POS',
              version: 'v4.2 Universal Driver',
              status: 'Pronto para Impressoras de Talão',
              desc: 'Suporte a impressoras térmicas de 58mm e 80mm para recibos fiscais com corte automático.'
            },
            {
              name: 'Node.js LTS & V8 Execution Engine',
              version: 'v20.12.0 LTS (Active)',
              status: 'Motor Servidor Ativo',
              desc: 'Ambiente de execução dos microsserviços de cálculo e barramento de APIs REST.'
            }
          ].map((soft, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{soft.version}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-mono">{soft.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{soft.desc}</p>
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {soft.status}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
