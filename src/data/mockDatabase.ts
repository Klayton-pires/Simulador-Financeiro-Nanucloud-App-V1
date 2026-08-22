import {
  BankAccount,
  DatabaseEngineConfig,
  AdsenseSlotConfig,
  SupportTicket,
  FiscalNotification,
  ApiIntegrationConfig,
  MarketingCampaign,
  ManualPaymentValidation,
  ConsultingAuditEntry,
  UserSafe
} from '../types';

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank_ao_1',
    bankName: 'Banco BAI - Banco Angolano de Investimentos',
    accountNumber: '0040.0000.1234.5678.101',
    iban: 'AO06.0040.0000.1234.5678.1018.9',
    swift: 'BAIAAOLL',
    holder: 'NANUCLOUD TECH SOLUTIONS LDA',
    currency: 'AOA (Kz)',
    isActive: true,
    isVisible: true
  },
  {
    id: 'bank_ao_2',
    bankName: 'Banco BFA - Banco de Fomento Angola',
    accountNumber: '0006.0000.9876.5432.202',
    iban: 'AO06.0006.0000.9876.5432.2023.4',
    swift: 'BFAAAOLL',
    holder: 'NANUCLOUD TECH SOLUTIONS LDA',
    currency: 'AOA (Kz)',
    isActive: true,
    isVisible: true
  },
  {
    id: 'bank_ao_3',
    bankName: 'Banco BIC - Banco BIC Angola',
    accountNumber: '0011.0000.4567.8901.303',
    iban: 'AO06.0011.0000.4567.8901.3034.5',
    swift: 'BICAOLL',
    holder: 'NANUCLOUD TECH SOLUTIONS LDA',
    currency: 'AOA (Kz)',
    isActive: true,
    isVisible: true
  },
  {
    id: 'bank_ao_4',
    bankName: 'Banco Millennium Atlântico (BMA)',
    accountNumber: '0055.0000.3344.5566.404',
    iban: 'AO06.0055.0000.3344.5566.4045.6',
    swift: 'ATLAAOLL',
    holder: 'NANUCLOUD TECH SOLUTIONS LDA',
    currency: 'AOA (Kz)',
    isActive: true,
    isVisible: false
  },
  {
    id: 'bank_pt_5',
    bankName: 'Millennium BCP (Portugal / Europa)',
    accountNumber: '0033.0000.7788.9900.505',
    iban: 'PT50.0033.0000.7788.9900.5056.7',
    swift: 'BCPPTPLX',
    holder: 'NANUCLOUD GLOBAL SERVICES UNIPESSOAL',
    currency: 'EUR (€)',
    isActive: true,
    isVisible: true
  },
  {
    id: 'bank_us_6',
    bankName: 'Wise / JPMorgan Chase (USD Global)',
    accountNumber: '9876543210',
    iban: 'US89.CHAS.0000.9876.5432.1001.2',
    swift: 'CHASUS33',
    holder: 'NANUCLOUD INTERNATIONAL LLC',
    currency: 'USD ($)',
    isActive: true,
    isVisible: false
  }
];

export const INITIAL_DB_ENGINES: DatabaseEngineConfig[] = [
  {
    id: 'db_mysql_prod',
    type: 'mysql',
    name: 'MySQL Server 8.0 Enterprise (Transações e ERP)',
    host: 'db-mysql.nanucloud.internal',
    port: 3306,
    database: 'nanucloud_fiscal_db',
    username: 'nanu_fiscal_user',
    password: '••••••••••••••••',
    ssl: true,
    isActive: true,
    connectionStatus: 'connected',
    lastTestedAt: '2026-08-21T16:45:00.000Z'
  },
  {
    id: 'db_mssql_corp',
    type: 'mssql',
    name: 'Microsoft SQL Server 2022 (Integração Corporativa)',
    host: 'sqlserver.corp.nanucloud.internal',
    port: 1433,
    database: 'NANU_ERP_STAGE',
    username: 'sa_nanu_sync',
    password: '••••••••••••••••',
    ssl: true,
    isActive: false,
    connectionStatus: 'disconnected',
    lastTestedAt: '2026-08-20T10:15:00.000Z'
  },
  {
    id: 'db_postgres_main',
    type: 'postgres',
    name: 'PostgreSQL 16 High-Availability',
    host: 'pg-cluster.nanucloud.internal',
    port: 5432,
    database: 'nanucloud_analytics',
    username: 'pg_admin',
    ssl: true,
    isActive: true,
    connectionStatus: 'connected',
    lastTestedAt: '2026-08-21T17:00:00.000Z'
  }
];

export const INITIAL_ADSENSE_SLOTS: AdsenseSlotConfig[] = [
  {
    id: 'slot_top_banner',
    slotNumber: 1,
    title: 'Banner Superior (Topo da Simulação Gratuita)',
    position: 'topo_banner',
    slotId: 'ca-pub-9842183912739182/1002938475',
    format: 'horizontal',
    isActive: true
  },
  {
    id: 'slot_sidebar_banner',
    slotNumber: 2,
    title: 'Banner Lateral (Barra de Ferramentas / Notícias)',
    position: 'lateral_banner',
    slotId: 'ca-pub-9842183912739182/2093847561',
    format: 'rectangle',
    isActive: true
  },
  {
    id: 'slot_footer_banner',
    slotNumber: 3,
    title: 'Banner de Rodapé (Abaixo dos Resultados de Teste)',
    position: 'rodape_banner',
    slotId: 'ca-pub-9842183912739182/3094857612',
    format: 'horizontal',
    isActive: true
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_001',
    ticketNumber: 'TKT-2026-8941',
    userId: 'usr_002',
    userName: 'Klayton Monteiro',
    userEmail: 'klayton.pires.monteiro@gmail.com',
    userPhone: '+244 923 000 111',
    subject: 'Integração da API com ERP Primavera v10 no módulo faturas',
    message: 'Precisamos de suporte para sincronizar o preço de venda líquido e a retenção de 6.5% automaticamente no ERP.',
    priority: 'alta',
    status: 'em_analise',
    assignedToUserId: 'usr_admin_2',
    assignedToUserName: 'Gestor Fiscal Carlos',
    department: 'Suporte Técnico & APIs',
    history: [
      {
        timestamp: '2026-08-21T09:30:00.000Z',
        action: 'Ticket Criado',
        actorName: 'Klayton Monteiro',
        notes: 'Abertura de chamado via painel'
      },
      {
        timestamp: '2026-08-21T10:00:00.000Z',
        action: 'Transferido para Gestor Fiscal Carlos',
        actorName: 'Super Administrador NANUCLOUD',
        notes: 'Atribuído para análise técnica de endpoint'
      }
    ],
    createdAt: '2026-08-21T09:30:00.000Z',
    updatedAt: '2026-08-21T10:00:00.000Z'
  },
  {
    id: 'tkt_002',
    ticketNumber: 'TKT-2026-8942',
    userId: 'usr_003',
    userName: 'Importadora Atlântico Sul Lda',
    userEmail: 'compras@atlanticosul.ao',
    userPhone: '+244 944 888 999',
    subject: 'Dúvida sobre Taxa Estatística Aduaneira na Pauta 2026',
    message: 'Gostaríamos de confirmar se mercadorias com origem na SADC têm isenção da taxa estatística de 0.5%.',
    priority: 'normal',
    status: 'aberto',
    department: 'Consultoria Aduaneira',
    history: [
      {
        timestamp: '2026-08-21T14:15:00.000Z',
        action: 'Ticket Criado',
        actorName: 'Importadora Atlântico Sul Lda'
      }
    ],
    createdAt: '2026-08-21T14:15:00.000Z',
    updatedAt: '2026-08-21T14:15:00.000Z'
  }
];

export const INITIAL_FISCAL_NOTIFICATIONS: FiscalNotification[] = [
  {
    id: 'notif_agt_2026_01',
    countryCode: 'AO',
    countryName: 'Angola',
    agencyName: 'AGT - Administração Geral Tributária',
    title: 'Atualização da Pauta Aduaneira e Regime de Cesta Básica (Lei 17/23)',
    summary: 'A AGT reforça a manutenção da alíquota de 5% de IVA para produtos essenciais da cesta básica e insumos agropecuários devidamente certificados.',
    taxType: 'IVA',
    oldRate: '14%',
    newRate: '5%',
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://agt.minfin.gov.ao/portal-agt/#!/legislacao-tributaria',
    lawReference: 'Lei nº 17/23 de 29 de Dezembro / Código do IVA Artigo 15º',
    isCritical: true,
    readByManagers: [
      {
        managerId: 'usr_admin_1',
        managerName: 'Super Administrador NANUCLOUD',
        readAt: '2026-08-21T08:00:00.000Z'
      }
    ],
    createdAt: '2026-08-20T12:00:00.000Z'
  },
  {
    id: 'notif_at_2026_02',
    countryCode: 'PT',
    countryName: 'Portugal',
    agencyName: 'AT - Autoridade Tributária e Aduaneira',
    title: 'Despacho da AT sobre Retenção na Fonte de Não Residentes',
    summary: 'Clarificação das regras de retenção na fonte (11.5% e 25%) em serviços de consultoria digital prestados à distância.',
    taxType: 'Retenção Fonte',
    oldRate: '25%',
    newRate: '11.5% (Recibos Verdes)',
    effectiveDate: '2026-03-01',
    sourceUrl: 'https://portaldasfinancas.gov.pt',
    lawReference: 'Circular Normativa AT nº 04/2026 / Art. 101º do CIRS',
    isCritical: false,
    readByManagers: [],
    createdAt: '2026-08-21T09:00:00.000Z'
  },
  {
    id: 'notif_rf_2026_03',
    countryCode: 'BR',
    countryName: 'Brasil',
    agencyName: 'Receita Federal do Brasil',
    title: 'Transição da Reforma Tributária: PIS/COFINS e Alíquotas de Referência',
    summary: 'Publicação da tabela de alíquotas de teste da CBS e IBS no âmbito da regulamentação da Emenda Constitucional.',
    taxType: 'Imposto Industrial',
    oldRate: '9.25%',
    newRate: 'Tabela Progressiva',
    effectiveDate: '2026-06-01',
    sourceUrl: 'https://gov.br/receitafederal',
    lawReference: 'Instrução Normativa RFB nº 2204/2026',
    isCritical: false,
    readByManagers: [],
    createdAt: '2026-08-21T11:30:00.000Z'
  }
];

export const INITIAL_API_CONFIGS: ApiIntegrationConfig[] = [
  {
    id: 'api_phc_01',
    systemName: 'PHC',
    systemCategory: 'ERP Gestão',
    apiKey: 'nanu_live_phc_98f4a7b21c0e8d3a6',
    apiSecret: 'sec_phc_77e9a3b8c2d1',
    syncPriceFieldOnly: true,
    recommendedFields: ['custo_fornecedor', 'iva_tipo', 'margem_lucro', 'preco_pvp_calculado', 'retencao_fonte'],
    isActive: true,
    queriesHandled: 1420,
    lastCallAt: '2026-08-21T16:10:00.000Z',
    createdAt: '2026-06-15T00:00:00.000Z'
  },
  {
    id: 'api_primavera_02',
    systemName: 'Primavera',
    systemCategory: 'ERP Gestão',
    apiKey: 'nanu_live_prim_33c8b1d9e4a5f607',
    apiSecret: 'sec_prim_88b2c4d6e8a0',
    syncPriceFieldOnly: true,
    recommendedFields: ['PrecoCusto', 'TaxaIVA', 'MargemPretendida', 'PVP1_Recomendado', 'TaxaRetencao'],
    isActive: true,
    queriesHandled: 3890,
    lastCallAt: '2026-08-21T17:05:00.000Z',
    createdAt: '2026-05-10T00:00:00.000Z'
  },
  {
    id: 'api_woo_03',
    systemName: 'WooCommerce',
    systemCategory: 'E-commerce',
    apiKey: 'nanu_live_woo_44a7f2e1d9c8b3a0',
    syncPriceFieldOnly: true,
    recommendedFields: ['regular_price', 'tax_class', 'cost_of_goods', 'calculated_retail_price'],
    isActive: true,
    queriesHandled: 850,
    lastCallAt: '2026-08-21T14:40:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 'api_excel_04',
    systemName: 'Excel / Power Query',
    systemCategory: 'Planilhas & BI',
    apiKey: 'nanu_live_excel_77d2c1e8a9b4f603',
    syncPriceFieldOnly: false,
    recommendedFields: ['CustoBase', 'PaisOrigem', 'AliquotaIVA', 'MargemPerc', 'PVPFinal', 'LucroLiquido'],
    isActive: true,
    queriesHandled: 5210,
    lastCallAt: '2026-08-21T17:15:00.000Z',
    createdAt: '2026-04-20T00:00:00.000Z'
  }
];

export const INITIAL_CLIENTS: UserSafe[] = [
  {
    id: 'cli_001',
    name: 'Klayton Monteiro',
    email: 'klayton.pires.monteiro@gmail.com',
    phone: '+244 923 111 222',
    company: 'Monteiro Comercial & Logística Lda',
    nif: '5417089123',
    country: 'AO',
    role: 'super_admin',
    isActive: true,
    queriesRemaining: 999999,
    totalQueriesUsed: 4210,
    activePlanId: 'plan_custom',
    activePlanName: 'Plano Personalizado Ilimitado',
    planExpiresAt: '2028-12-31T23:59:59.000Z',
    isImportUnlocked: true,
    isBatchUnlocked: true,
    isApiUnlocked: true,
    birthDate: '1990-05-15',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-21T17:00:00.000Z',
    lastLoginAt: '2026-08-21T17:10:00.000Z'
  },
  {
    id: 'cli_002',
    name: 'Ana Carolina Sousa',
    email: 'ana.sousa@farmaciasunidas.ao',
    phone: '+244 931 444 555',
    company: 'Farmácias Unidas de Luanda',
    nif: '5419082231',
    country: 'AO',
    role: 'client',
    isActive: true,
    queriesRemaining: 340,
    totalQueriesUsed: 660,
    activePlanId: 'plan_ouro',
    activePlanName: 'Plano Ouro (Comércio & Lotes)',
    planExpiresAt: '2026-10-15T00:00:00.000Z',
    isImportUnlocked: false,
    isBatchUnlocked: true,
    isApiUnlocked: false,
    birthDate: '1988-08-21', // Aniversário hoje!
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
    lastLoginAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cli_003',
    name: 'Eng. Manuel Domingos',
    email: 'm.domingos@angologistics.co.ao',
    phone: '+244 923 777 888',
    company: 'AngoLogistics Despachos Aduaneiros',
    nif: '5401928374',
    country: 'AO',
    role: 'client',
    isActive: true,
    queriesRemaining: 1850,
    totalQueriesUsed: 2150,
    activePlanId: 'plan_diamante',
    activePlanName: 'Plano Diamante (Importação + API)',
    planExpiresAt: '2026-12-31T00:00:00.000Z',
    isImportUnlocked: true,
    isBatchUnlocked: true,
    isApiUnlocked: true,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-08-19T15:30:00.000Z',
    lastLoginAt: '2026-08-21T08:20:00.000Z'
  },
  {
    id: 'cli_004',
    name: 'Dra. Teresa Van-Dúnem',
    email: 'teresa@advogadosluanda.ao',
    phone: '+244 944 123 456',
    company: 'Van-Dúnem Consultores Associados',
    nif: '5420918231',
    country: 'AO',
    role: 'client',
    isActive: true,
    queriesRemaining: 45,
    totalQueriesUsed: 155,
    activePlanId: 'plan_prata',
    activePlanName: 'Plano Prata (Serviços & Honorários)',
    planExpiresAt: '2026-09-01T00:00:00.000Z',
    isImportUnlocked: false,
    isBatchUnlocked: false,
    isApiUnlocked: false,
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-08-18T11:00:00.000Z',
    lastLoginAt: '2026-08-18T11:00:00.000Z'
  }
];

export const INITIAL_MANUAL_PAYMENTS: ManualPaymentValidation[] = [
  {
    id: 'val_pay_001',
    transactionId: 'trx_98214',
    clientId: 'cli_002',
    clientName: 'Ana Carolina Sousa',
    clientEmail: 'ana.sousa@farmaciasunidas.ao',
    planId: 'plan_ouro',
    planName: 'Plano Ouro (1.000 Consultas)',
    amountKz: 35000,
    paymentMethod: 'Transferência Bancária BAI (Comprovativo Anexado)',
    proofDocumentName: 'comprovativo_bai_35000kz_farmacias.pdf',
    validatedByUserId: 'usr_admin_1',
    validatedByUserName: 'Super Administrador NANUCLOUD',
    validationNotes: 'Comprovativo conferido no extrato bancário BAI em 20/08/2026. Saldo creditado.',
    status: 'approved',
    validatedAt: '2026-08-20T10:05:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: ConsultingAuditEntry[] = [
  {
    id: 'aud_001',
    operationType: 'ALTERACAO_PLANO_CLIENTE',
    operatorId: 'usr_admin_1',
    operatorName: 'Super Administrador NANUCLOUD',
    operatorRole: 'Super Administrador',
    clientAffectedId: 'cli_003',
    clientAffectedName: 'Eng. Manuel Domingos',
    ipAddress: '197.234.219.42 (Luanda / Unitel Net)',
    details: 'Alteração manual do plano para Diamante e desbloqueio do Módulo API REST.',
    timestamp: '2026-08-21T15:20:00.000Z'
  },
  {
    id: 'aud_002',
    operationType: 'ATUALIZACAO_MATRIZ_FISCAL',
    operatorId: 'usr_admin_1',
    operatorName: 'Super Administrador NANUCLOUD',
    operatorRole: 'Super Administrador',
    ipAddress: '197.234.219.42',
    details: 'Atualização da alíquota da Taxa Estatística Aduaneira para 0.5% (AGT Angola).',
    timestamp: '2026-08-21T16:00:00.000Z'
  },
  {
    id: 'aud_003',
    operationType: 'VALIDACAO_PAGAMENTO_MANUAL',
    operatorId: 'usr_admin_1',
    operatorName: 'Super Administrador NANUCLOUD',
    operatorRole: 'Super Administrador',
    clientAffectedId: 'cli_002',
    clientAffectedName: 'Ana Carolina Sousa',
    ipAddress: '197.234.219.42',
    details: 'Aprovação manual da transação trx_98214 no valor de 35.000 Kz.',
    timestamp: '2026-08-20T10:05:00.000Z'
  }
];
