import { jsPDF } from 'jspdf';

export interface ManualDoc {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  contentSections: {
    heading: string;
    text: string;
    bullets?: string[];
  }[];
}

export const MANUALS_DATA: ManualDoc[] = [
  {
    id: 'manual_01',
    number: '01',
    title: 'Manual de Instalação, Deploy & Servidores',
    category: 'Infraestrutura & DevOps',
    description: 'Instalação local, arranque automático no Windows (.bat), Docker, servidores Linux, NGINX, Vercel e GitHub Pages.',
    contentSections: [
      {
        heading: '1. Requisitos do Sistema',
        text: 'O NANUCLOUD suporta qualquer navegador moderno ou legado (Chrome, Safari, Firefox, Edge). Para execução em servidor, requer Node.js 18+ ou 20 LTS.',
        bullets: [
          'Windows 10/11: Execução em 1 clique via ficheiro INICIAR_SISTEMA.bat',
          'Linux / Servidor: Compatível com Ubuntu 20.04+, Debian 11+ e Docker',
          'Cloud / Serverless: 100% compatível com Vercel, Netlify, Render e GitHub Pages'
        ]
      },
      {
        heading: '2. Instalação e Arranque Local',
        text: 'Para iniciar o sistema na máquina local, extraia o ficheiro ZIP e execute:',
        bullets: [
          'Método Windows: Duplo clique em INICIAR_SISTEMA.bat',
          'Método Terminal: Execute "npm install" e em seguida "npm run dev"',
          'Acesso no Navegador: http://localhost:3000'
        ]
      },
      {
        heading: '3. Deploy em Servidor de Produção (NGINX + PM2)',
        text: 'Para hospedar num VPS próprio com domínio e certificado SSL gratuito:',
        bullets: [
          'Compilação de produção: npm run build',
          'Gestor de processos contínuos: pm2 start dist/server.cjs --name "nanucloud"',
          'Segurança: Certificado SSL Let\'s Encrypt com renovação automática a cada 90 dias'
        ]
      }
    ]
  },
  {
    id: 'manual_02',
    number: '02',
    title: 'Manual de Utilização & Simulações Financeiras',
    category: 'Operacional & Fiscal',
    description: 'Comércio Geral (Produtos), Prestação de Serviços (sem preço de custo, com retenção 6.5%/11.5%), e Despacho Aduaneiro.',
    contentSections: [
      {
        heading: '1. Simulação de Comércio (Produtos)',
        text: 'Para produtos físicos, o Preço de Custo Base (SEM IVA) é obrigatório. O sistema calcula a margem sobre o custo ou pelo PVP pretendido, deduz comissão TPA e provisão de Imposto Industrial.',
        bullets: [
          'Preço de Custo (SEM IVA) e sincronização com fatura Com IVA',
          'Aplicação de taxas de IVA oficiais (14% Angola, 7% Bens Essenciais, 23% Portugal)',
          'Cálculo de Lucro Líquido Real e margem efetiva'
        ]
      },
      {
        heading: '2. Simulação de Prestação de Serviços & Consultoria',
        text: 'Na prestação de serviços não há preço de custo de mercadoria. O utilizador define diretamente o Valor do Serviço Pretendido (PVP). O sistema calcula a Retenção na Fonte e o montante líquido que entra na conta bancária.',
        bullets: [
          'Atalhos de Retenção na Fonte: 6.5% (Angola - Código Imposto Industrial), 11.5% (Portugal), 25% (Geral) e 0% (Isenção)',
          'Matriz de Cenários com comparação de retenção, isenção e pagamentos diretos',
          'Custos operacionais (deslocações, subcontratados) 100% facultativos'
        ]
      },
      {
        heading: '3. Módulo de Importação Aduaneira',
        text: 'Cálculo de Despacho Aduaneiro em cascata: FOB + Frete + Seguro = CIF -> Direitos Aduaneiros + IEC + Taxa de Estatística + IVA Aduaneiro = Custo Nacionalizado (Landed Cost).'
      }
    ]
  },
  {
    id: 'manual_03',
    number: '03',
    title: 'Manual de Administração, Controlo de Acessos & RBAC',
    category: 'Governança & Gestão',
    description: 'Gestão de utilizadores, Super Administrador Nível 1 vs Nível 2, planos de subscrição, recargas e auditoria de cálculos.',
    contentSections: [
      {
        heading: '1. Hierarquia de Acessos',
        text: 'O sistema utiliza arquitetura de controlo de acessos por papéis (RBAC):',
        bullets: [
          'Super Admin Nível 1: Acesso global, controlo de planos, utilizadores e backup da BD',
          'Admin Nível 2: Gestão operacional, suporte a clientes e recarga manual de créditos',
          'Utilizador Normal: Execução de simulações e histórico pessoal'
        ]
      },
      {
        heading: '2. Atribuição de Planos e Créditos',
        text: 'O administrador pode alterar o plano de qualquer utilizador ou creditar consultas manualmente (ex: +50, +100 ou Ilimitado para grandes clientes).'
      }
    ]
  },
  {
    id: 'manual_04',
    number: '04',
    title: 'Manual de Manutenção, Backups & Disaster Recovery',
    category: 'Manutenção & Segurança',
    description: 'Cópias de segurança diárias, restauração de base de dados (.json), limpeza de logs e proteção contra perda de dados.',
    contentSections: [
      {
        heading: '1. Backup Completo da Base de Dados',
        text: 'O backup pode ser gerado a qualquer momento no Painel Administrativo em formato JSON ou agendado no Linux via Cron Job.',
        bullets: [
          'Exportação de ficheiro backup_nanucloud_db_YYYY-MM-DD.json',
          'Restauração instantânea de utilizadores, planos e histórico de simulações'
        ]
      },
      {
        heading: '2. Recuperação de Desastres (Disaster Recovery)',
        text: 'Em caso de migração ou falha de servidor, basta carregar o ficheiro de backup para restabelecer 100% da operação.'
      }
    ]
  },
  {
    id: 'manual_05',
    number: '05',
    title: 'Manual de Alterações, Atualizações Fiscais & Extensibilidade',
    category: 'Engenharia de Software',
    description: 'Como atualizar alíquotas de IVA e Retenção na Fonte, adicionar novos países, alterar preços de planos e compilar novas versões.',
    contentSections: [
      {
        heading: '1. Atualização de Alíquotas Fiscais',
        text: 'Todas as taxas estão centralizadas em /src/data/countries.ts. Ao alterar alíquotas de IVA, Retenção ou Imposto Industrial, todos os simuladores atualizam instantaneamente.',
        bullets: [
          'Adicionar novos países e moedas (Kz, €, $, MTn)',
          'Configurar alíquotas personalizadas de IVA e regimes transitórios'
        ]
      }
    ]
  },
  {
    id: 'manual_06',
    number: '06',
    title: 'Manual de Relatórios Executivos em PDF & Exportações',
    category: 'Relatórios & Contabilidade',
    description: 'Geração de relatórios executivos em PDF com desdobramento fiscal, exportação de planilhas em lote (.xlsx) e logs CSV.',
    contentSections: [
      {
        heading: '1. Relatórios Executivos em PDF',
        text: 'Emissão de documentos formais para gerência e contabilidade com logótipo, carimbo digital, desdobramento de impostos e margens de lucro.',
        bullets: [
          'Relatório de Preço de Venda e Margens de Lucro',
          'Relatório Aduaneiro de Importação e Despacho',
          'Exportação de planilhas em lote (.xlsx) com colunas NANUCLOUD'
        ]
      }
    ]
  }
];

/**
 * Gera um documento PDF profissional com jsPDF para o manual selecionado
 */
export function generateManualPdf(manual: ManualDoc) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Cores
  const primaryColor = [79, 70, 229]; // Indigo
  const darkColor = [15, 23, 42]; // Slate 900
  const grayColor = [100, 116, 139]; // Slate 500

  // 1. Barra Superior Colorida
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 12, 'F');

  // 2. Cabeçalho NANUCLOUD
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NANUCLOUD', 15, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Plataforma de Gestão Fiscal, Simulação de Preços & Despacho Aduaneiro', 15, 29);

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 33, 195, 33);

  // 3. Título do Manual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`MANUAL ${manual.number}: ${manual.title.toUpperCase()}`, 15, 42);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Categoria: ${manual.category} | Versão 2.5 Enterprise`, 15, 48);

  // Caixa de Descrição
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 52, 180, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(manual.description, 172);
  doc.text(splitDesc, 19, 58);

  let currentY = 75;

  // 4. Seções do Conteúdo
  manual.contentSections.forEach((section) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(section.heading, 15, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const splitText = doc.splitTextToSize(section.text, 180);
    doc.text(splitText, 15, currentY);
    currentY += splitText.length * 5 + 3;

    if (section.bullets && section.bullets.length > 0) {
      section.bullets.forEach((bullet) => {
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(18, currentY - 1.2, 1, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitBullet = doc.splitTextToSize(bullet, 170);
        doc.text(splitBullet, 22, currentY);
        currentY += splitBullet.length * 4.5 + 2;
      });
    }

    currentY += 4;
  });

  // Rodapé Oficial
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.line(15, 282, 195, 282);
    doc.text(`NANUCLOUD Enterprise • Documentação Oficial & Manuais Técnicos`, 15, 288);
    doc.text(`Página ${i} de ${totalPages}`, 180, 288);
  }

  // Guardar PDF
  doc.save(`NANUCLOUD_Manual_${manual.number}_${manual.id}.pdf`);
}

/**
 * Gera um único PDF consolidado contendo TODOS os 6 manuais completos!
 */
export function generateConsolidatedManualsPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [79, 70, 229]; // Indigo
  const darkColor = [15, 23, 42]; // Slate 900
  const grayColor = [100, 116, 139]; // Slate 500

  // Capa Oficial
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('NANUCLOUD', 20, 50);

  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0] + 40, primaryColor[1] + 40, 255);
  doc.text('GUIA COMPLETO & MANUAIS TÉCNICOS OFICIAIS', 20, 62);

  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text('Instalação • Manutenção • Utilização • Administração • Alterações • Relatórios', 20, 72);

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, 80, 190, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Versão do Sistema: 2.5 Enterprise Edition', 20, 95);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 20, 102);
  doc.text('Destinatários: Administradores de TI, Contabilistas, Gestores e Utilizadores', 20, 109);

  // Índice na capa
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(20, 125, 170, 120, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('ÍNDICE GERAL DOS MANUAIS INCLUÍDOS:', 28, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);

  let idxY = 152;
  MANUALS_DATA.forEach((m) => {
    doc.text(`• Manual ${m.number}: ${m.title}`, 28, idxY);
    idxY += 12;
  });

  // Páginas dos Manuais
  MANUALS_DATA.forEach((manual) => {
    doc.addPage();

    // Top bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 10, 'F');

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`MANUAL ${manual.number}: ${manual.title.toUpperCase()}`, 15, 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Categoria: ${manual.category} | NANUCLOUD Enterprise`, 15, 28);
    doc.line(15, 31, 195, 31);

    let curY = 40;
    manual.contentSections.forEach((section) => {
      if (curY > 240) {
        doc.addPage();
        curY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.heading, 15, curY);
      curY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const splitT = doc.splitTextToSize(section.text, 180);
      doc.text(splitT, 15, curY);
      curY += splitT.length * 5 + 3;

      if (section.bullets) {
        section.bullets.forEach((b) => {
          if (curY > 260) {
            doc.addPage();
            curY = 20;
          }
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.circle(18, curY - 1.2, 0.9, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const splitB = doc.splitTextToSize(b, 170);
          doc.text(splitB, 22, curY);
          curY += splitB.length * 4.5 + 2;
        });
      }
      curY += 4;
    });
  });

  // Numeração de páginas
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.line(15, 282, 195, 282);
    doc.text(`NANUCLOUD Enterprise • Manuais Técnicos Consolidados`, 15, 288);
    doc.text(`Página ${i} de ${total}`, 180, 288);
  }

  doc.save(`NANUCLOUD_MANUAIS_COMPLETOS_CONSOLIDADOS.pdf`);
}
