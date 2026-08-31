import { jsPDF } from 'jspdf';
import { UserRole } from '../types';

export interface ManualDoc {
  id: string;
  number: string;
  title: string;
  category: string;
  targetRole: 'all' | 'client' | 'commercial' | 'admin_level2' | 'admin_level1';
  targetRoleLabel: string;
  description: string;
  contentSections: {
    heading: string;
    text: string;
    bullets?: string[];
  }[];
}

export const MANUALS_DATA: ManualDoc[] = [
  {
    id: 'manual_client',
    number: '01',
    title: 'Manual do Cliente & Utilizador Final',
    category: 'Utilizador & Clientes',
    targetRole: 'client',
    targetRoleLabel: 'Clientes & Utilizadores Finais',
    description: 'Guia completo para simulação de comércio, prestação de serviços, corretagem/intermediação, importação aduaneira e adesão a planos de consultas.',
    contentSections: [
      {
        heading: '1. Simulação de Comércio & Venda de Produtos',
        text: 'Para simular preços de produtos físicos, insira o Preço de Custo (SEM IVA) ou com IVA. O sistema calcula a margem pretendida, encargos de TPA (cartão) e provisão de Imposto Industrial.',
        bullets: [
          'Preço de Custo Líquido vs Bruto com sincronização automática',
          'Alíquotas oficiais de IVA (14% Angola, 7% bens essenciais, 23% Portugal, etc.)',
          'Margem sobre o custo (Markup) ou margem sobre o preço de venda final',
          'Demonstrativo visual com Preço Recomendado e Lucro Líquido Real'
        ]
      },
      {
        heading: '2. Simulação de Prestação de Serviços & Consultoria',
        text: 'Na prestação de serviços não existe preço de custo de mercadoria. O utilizador define o Valor do Serviço Pretendido (PVP). O sistema aplica a Retenção na Fonte e calcula o valor líquido que entra na conta bancária.',
        bullets: [
          'Atalhos de Retenção na Fonte: 6.5% (Angola - Código do Imposto Industrial), 11.5% (Portugal), 25% (Geral) e 0% (Isenção)',
          'Matriz comparativa de cenários fiscais',
          'Custos de deslocação e despesas operacionais 100% facultativos'
        ]
      },
      {
        heading: '3. Intermediários, Corretagem & Comissões',
        text: 'Cálculo de comissões por intermediação com separação de regimes (Empresa vs Particular), incidência e retenção na fonte.',
        bullets: [
          'Comissão calculada sobre Produtos, Serviços ou Valor Total Negociado',
          'Retenção legal obrigatória e valor líquido a liquidar ao intermediário'
        ]
      },
      {
        heading: '4. Importação Aduaneira & Landed Cost',
        text: 'Cálculo aduaneiro em cascata: FOB + Frete + Seguro = Valor CIF -> Direitos Aduaneiros + Taxa de Estatística + IVA Aduaneiro = Custo Nacionalizado.'
      },
      {
        heading: '5. Planos de Recarga & Pagamentos',
        text: 'Adesão instantânea a pacotes de consultas ou planos personalizados com ativação automática via Multicaixa GPO, Multicaixa Express, PayPal (com cartão Visa/Mastercard) e transferência bancária com envio de comprovativo.'
      }
    ]
  },
  {
    id: 'manual_commercial',
    number: '02',
    title: 'Manual do Operador Comercial & Vendas',
    category: 'Comercial & Atendimento',
    targetRole: 'commercial',
    targetRoleLabel: 'Operadores Comerciais & Atendimento',
    description: 'Instruções para atendimento a clientes via chat em tempo real, validação de comprovativos bancários e gestão de tickets de suporte.',
    contentSections: [
      {
        heading: '1. Atendimento via Chat em Tempo Real',
        text: 'Monitorização da fila de atendimento no painel comercial, envio de mensagens e respostas a dúvidas de clientes.',
        bullets: [
          'Horários de atendimento configuráveis e mensagens de boas-vindas automáticas',
          'Encaminhamento de tickets complexos para administradores técnicos'
        ]
      },
      {
        heading: '2. Validação de Pagamentos & Ativação de Planos',
        text: 'Conferência de talões de transferência bancária e referências Multicaixa Express:',
        bullets: [
          'Verificação de IBAN de destino e valor creditado na conta bancária da empresa',
          'Validação com 1 clique para aprovar transação e creditar pesquisas na conta do cliente imediatamente',
          'Registo do nome do operador no histórico de auditoria para transparência total'
        ]
      },
      {
        heading: '3. Gestão de Tickets & Dúvidas Fiscais',
        text: 'Acompanhamento do estado dos pedidos de apoio com prioridades (Baixa, Normal, Alta, Urgente).'
      }
    ]
  },
  {
    id: 'manual_admin2',
    number: '03',
    title: 'Manual do Administrador Operacional (Nível 2)',
    category: 'Administração Operacional',
    targetRole: 'admin_level2',
    targetRoleLabel: 'Administrador Operacional (Nível 2)',
    description: 'Gestão de planos, preços, limites, relatórios executivos em PDF e Excel, auditoria de cálculos e supervisão operacional.',
    contentSections: [
      {
        heading: '1. Gestão de Planos & Preços de Recarga',
        text: 'Ajuste de preços de pacotes comerciais, número de pesquisas concedidas e prazos de validade.',
        bullets: [
          'Configuração do preço unitário da consulta base (ex: 50 Kz)',
          'Definição de preço mínimo para planos personalizados (ex: 500 Kz)'
        ]
      },
      {
        heading: '2. Extratos de Utilizadores & Auditoria',
        text: 'Emissão de extratos individuais de clientes, histórico de simulações realizadas e registo de logins.',
        bullets: [
          'Atribuição de bónus de pesquisas de cortesia em caso de necessidade',
          'Extensão de prazos de validade de subscrições ativas'
        ]
      },
      {
        heading: '3. Emissão de Relatórios & Exportações',
        text: 'Geração de relatórios consolidados em PDF com desdobramento fiscal e exportação de dados em lote (.xlsx).'
      }
    ]
  },
  {
    id: 'manual_superadmin',
    number: '04',
    title: 'Manual do Super Administrador (Nível 1 - Governança Master)',
    category: 'Governança & Segurança',
    targetRole: 'admin_level1',
    targetRoleLabel: 'Super Administrador (Nível 1 Master)',
    description: 'Governança total, controlo de permissões RBAC, matriz fiscal personalizada, definições do sistema em tempo real, motores de base de dados (MySQL/MSSQL), chaves de API, AdSense, backups e reversão de alterações (Rollback).',
    contentSections: [
      {
        heading: '1. Gestão de Administradores & Controlo de Acesso RBAC',
        text: 'Criação e edição de administradores com garantia de segurança estrita: Super Administradores só podem ser criados ou alterados por outros Super Administradores.',
        bullets: [
          'Criação de grupos de permissões personalizados e atribuição por departamento',
          'Regras de restrição de acessos e auditoria de alterações em tempo real',
          'Acesso integral a todas as rotas administrativas (/api/admin/*) sem restrições'
        ]
      },
      {
        heading: '2. Definições do Sistema & Propagação em Tempo Real',
        text: 'Qualquer alteração efetuada nas Definições do Sistema propaga instantaneamente a toda a aplicação web, móvel e desktop sem necessidade de reinicialização:',
        bullets: [
          'Coordenadas Bancárias & Códigos SWIFT: Ativação/ocultação de até 6 contas com sincronização no rodapé e faturas',
          'Contactos Oficiais & WhatsApp: Atualização de números de apoio e botões diretos de atendimento 24/7',
          'Gateways de Pagamento Eletrónico: Configuração de credenciais EMIS (GPO / Multicaixa Express) e PayPal',
          'Créditos Gratuitos & Modos de Pesquisa: Gestão de cotas de registo e cotas para visitantes',
          'Matriz Fiscal Dinâmica: Modificação em direto de alíquotas de IVA, Retenções na Fonte e Taxas Aduaneiras com impacto imediato em todos os simuladores'
        ]
      },
      {
        heading: '3. Motores de Banco de Dados & Sincronização',
        text: 'Configuração de até 4 conexões externas (MySQL, Microsoft SQL Server, PostgreSQL, SQLite) com teste de conectividade em tempo real.'
      },
      {
        heading: '4. Chaves de API & Integrações Externas',
        text: 'Geração de tokens criptográficos de API REST para integração com PHC, Primavera, SAP, Odoo e lojas online.'
      },
      {
        heading: '5. Histórico de Alterações & Reversão (Rollback)',
        text: 'Todas as áreas de configurações guardam snapshots de versões anteriores. Em caso de erro na configuração, o Super Administrador pode reverter imediatamente para o estado funcional anterior com 1 clique.'
      }
    ]
  },
  {
    id: 'manual_deploy',
    number: '05',
    title: 'Guia Prático de Colocação em Produção / Online',
    category: 'DevOps & Infraestrutura',
    targetRole: 'admin_level1',
    targetRoleLabel: 'Super Admin & Engenharia de TI',
    description: 'Passo a passo prático para colocar o projeto online e acessível ao público mundial com todas as proteções, bancos de dados, chaves seguras e backups.',
    contentSections: [
      {
        heading: '1. Escolha da Hospedagem & Servidor',
        text: 'Recomendações oficiais de infraestrutura para alta disponibilidade e custos reduzidos:',
        bullets: [
          'Opção Cloud Run (Google Cloud): Hospedagem em contentores Docker com auto-escalonamento para zero custos quando inativo.',
          'Opção VPS Dedicado (DigitalOcean / Hetzner / Contabo): Ubuntu 22.04 LTS com 2GB+ RAM, Nginx e PM2.',
          'Opção Vercel / Netlify: Para front-end com rotas serverless integradas.'
        ]
      },
      {
        heading: '2. Banco de Dados Protegido',
        text: 'Opções para armazenamento persistente:',
        bullets: [
          'PostgreSQL Gerenciado (Cloud SQL / Supabase / Neon): Banco relacional robusto com SSL obrigatório.',
          'Firebase Firestore: Base de dados NoSQL em tempo real com regras de segurança ativas.',
          'SQLite Local Seguro: Com backups diários automáticos para a nuvem.'
        ]
      },
      {
        heading: '3. Certificado SSL & Domínio Personalizado',
        text: 'Apontamento de DNS (Registos A e CNAME) e instalação de SSL Let\'s Encrypt com renovação automática gratuita (certbot).'
      },
      {
        heading: '4. Variáveis de Ambiente & Chaves de Segurança',
        text: 'Armazenamento de segredos no ficheiro .env protegido, sem nunca expor chaves no código-fonte.',
        bullets: [
          'GEMINI_API_KEY, STRIPE_SECRET_KEY, PAYPAL_SECRET, EMIS_API_KEY',
          'Envio de cópia das chaves e credenciais para o e-mail oficial: klayton_pires@hotmail.com'
        ]
      },
      {
        heading: '5. Plano de Manutenção & Backups em Segundo Plano',
        text: 'Configuração de cron job diário para gerar snapshots da base de dados e enviar automaticamente para o e-mail klayton_pires@hotmail.com e nuvens MegaSync, Google Drive ou OneDrive.'
      }
    ]
  }
];

export function getManualsForUser(role: UserRole): ManualDoc[] {
  const isSuperAdmin = role === 'admin_level1' || role === 'super_admin';
  const isAdmin2 = role === 'admin_level2' || role === 'admin';

  if (isSuperAdmin) {
    return MANUALS_DATA; // Super Admin tem acesso a todos os manuais
  }

  if (isAdmin2) {
    return MANUALS_DATA.filter((m) => m.targetRole === 'client' || m.targetRole === 'commercial' || m.targetRole === 'admin_level2');
  }

  // Utilizador comum / cliente
  return MANUALS_DATA.filter((m) => m.targetRole === 'client' || m.targetRole === 'all');
}

/**
 * Gera PDF de um manual específico
 */
export function generateManualPdf(manual: ManualDoc) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

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
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`MANUAL ${manual.number}: ${manual.title.toUpperCase()}`, 15, 42);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Grupo Alvo: ${manual.targetRoleLabel} | Categoria: ${manual.category} | Versão 2026 Enterprise`, 15, 48);

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
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(section.heading, 15, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const splitText = doc.splitTextToSize(section.text, 180);
    doc.text(splitText, 15, currentY);
    currentY += splitText.length * 4.8 + 3;

    if (section.bullets && section.bullets.length > 0) {
      section.bullets.forEach((bullet) => {
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(18, currentY - 1.2, 0.9, 'F');
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
    doc.text(`NANUCLOUD Enterprise • Documentação Oficial (${manual.targetRoleLabel})`, 15, 288);
    doc.text(`Página ${i} de ${totalPages}`, 180, 288);
  }

  doc.save(`NANUCLOUD_Manual_${manual.number}_${manual.id}.pdf`);
}

/**
 * Gera um único PDF consolidado contendo TODOS os manuais completos!
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

  doc.setFontSize(17);
  doc.setTextColor(primaryColor[0] + 40, primaryColor[1] + 40, 255);
  doc.text('MANUAIS TÉCNICOS & GUIA DE PRODUÇÃO', 20, 62);

  doc.setFontSize(10.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Clientes • Comercial • Administradores • Super Admin • Deploy & Nuvem', 20, 72);

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, 80, 190, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Versão do Sistema: 2026 Enterprise Edition', 20, 95);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 20, 102);
  doc.text('Envio Oficial: klayton_pires@hotmail.com', 20, 109);

  // Índice na capa
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(20, 125, 170, 120, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ÍNDICE DOS MANUAIS POR GRUPO DE UTILIZADORES:', 28, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);

  let idxY = 152;
  MANUALS_DATA.forEach((m) => {
    doc.text(`• [${m.targetRoleLabel}] Manual ${m.number}: ${m.title}`, 28, idxY);
    idxY += 12;
  });

  // Páginas dos Manuais
  MANUALS_DATA.forEach((manual) => {
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 10, 'F');

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`MANUAL ${manual.number}: ${manual.title.toUpperCase()}`, 15, 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Grupo: ${manual.targetRoleLabel} | Categoria: ${manual.category}`, 15, 28);
    doc.line(15, 31, 195, 31);

    let curY = 40;
    manual.contentSections.forEach((section) => {
      if (curY > 240) {
        doc.addPage();
        curY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.heading, 15, curY);
      curY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const splitT = doc.splitTextToSize(section.text, 180);
      doc.text(splitT, 15, curY);
      curY += splitT.length * 4.8 + 3;

      if (section.bullets) {
        section.bullets.forEach((b) => {
          if (curY > 260) {
            doc.addPage();
            curY = 20;
          }
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.circle(18, curY - 1.2, 0.9, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const splitB = doc.splitTextToSize(b, 170);
          doc.text(splitB, 22, curY);
          curY += splitB.length * 4.5 + 2;
        });
      }
      curY += 4;
    });
  });

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

  doc.save(`NANUCLOUD_MANUAIS_CONSOLIDADOS_ENTERPRISE.pdf`);
}
