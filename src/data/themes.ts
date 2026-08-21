import { AppTheme } from '../types';

export const ANGOLA_HOLIDAYS = [
  { day: 1, month: 1, name: 'Ano Novo', id: 'theme_ano_novo' },
  { day: 4, month: 2, name: 'Dia do Início da Luta Armada de Libertação Nacional', id: 'theme_4_fevereiro' },
  { day: 8, month: 3, name: 'Dia Internacional da Mulher', id: 'theme_8_marco' },
  { day: 23, month: 3, name: 'Dia da Libertação da África Austral (Batalha de Cuito Cuanavale)', id: 'theme_23_marco' },
  { day: 4, month: 4, name: 'Dia da Paz e da Reconciliação Nacional', id: 'theme_4_abril' },
  { day: 1, month: 5, name: 'Dia Internacional do Trabalhador', id: 'theme_1_maio' },
  { day: 17, month: 9, name: 'Dia do Fundador da Nação e do Herói Nacional (Dr. António Agostinho Neto)', id: 'theme_17_setembro' },
  { day: 2, month: 11, name: 'Dia dos Finados', id: 'theme_2_novembro' },
  { day: 11, month: 11, name: 'Dia da Independência Nacional de Angola', id: 'theme_11_novembro' },
  { day: 25, month: 12, name: 'Dia de Natal e da Família', id: 'theme_25_dezembro' }
];

export const APP_THEMES: AppTheme[] = [
  // 1. Padrão NANUCLOUD
  {
    id: 'theme_nanucloud_dark',
    name: 'NANUCLOUD Obsidian Pro (Padrão)',
    category: 'modern_dark',
    primaryColor: '#6366F1',
    accentColor: '#10B981',
    bgDark: '#0A0F1D',
    cardBg: '#1E293B',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    description: 'Tema padrão de alta performance com contraste otimizado para operações financeiras.'
  },

  // Feriados Nacionais de Angola (Temas Comemorativos com Ativação Automática)
  {
    id: 'theme_11_novembro',
    name: '11 de Novembro - Independência Nacional de Angola',
    category: 'angola_holiday',
    holidayDate: '11/11',
    holidayName: 'Dia da Independência Nacional',
    primaryColor: '#DC2626', // Vermelho rubi da bandeira
    accentColor: '#F59E0B', // Amarelo catana/estrela
    bgDark: '#0D0505',
    cardBg: '#1C1010',
    badgeBg: 'rgba(220, 38, 38, 0.2)',
    description: 'Comemoração solene da Independência de Angola. Dourado e Vermelho vibrante.'
  },
  {
    id: 'theme_4_abril',
    name: '4 de Abril - Dia da Paz e Reconciliação Nacional',
    category: 'angola_holiday',
    holidayDate: '04/04',
    holidayName: 'Dia da Paz e Reconciliação',
    primaryColor: '#059669', // Verde esperança e paz
    accentColor: '#38BDF8', // Azul celeste
    bgDark: '#04120C',
    cardBg: '#0D2419',
    badgeBg: 'rgba(5, 150, 105, 0.2)',
    description: 'Celebração da fraternidade, paz e união de todos os angolanos.'
  },
  {
    id: 'theme_17_setembro',
    name: '17 de Setembro - Herói Nacional (Agostinho Neto)',
    category: 'angola_holiday',
    holidayDate: '17/09',
    holidayName: 'Dia do Fundador da Nação e Herói Nacional',
    primaryColor: '#E11D48',
    accentColor: '#EAB308',
    bgDark: '#11050A',
    cardBg: '#210C16',
    badgeBg: 'rgba(225, 29, 72, 0.2)',
    description: 'Homenagem ao Fundador da Nação Angolana, Dr. António Agostinho Neto.'
  },
  {
    id: 'theme_4_fevereiro',
    name: '4 de Fevereiro - Início da Luta Armada',
    category: 'angola_holiday',
    holidayDate: '04/02',
    holidayName: 'Início da Luta Armada de Libertação Nacional',
    primaryColor: '#B91C1C',
    accentColor: '#F97316',
    bgDark: '#120505',
    cardBg: '#240F0F',
    badgeBg: 'rgba(185, 28, 28, 0.2)',
    description: 'Honra aos bravos heróis do 4 de Fevereiro de 1961.'
  },
  {
    id: 'theme_8_marco',
    name: '8 de Março - Dia Internacional da Mulher',
    category: 'angola_holiday',
    holidayDate: '08/03',
    holidayName: 'Dia da Mulher',
    primaryColor: '#D946EF',
    accentColor: '#EC4899',
    bgDark: '#140616',
    cardBg: '#240D27',
    badgeBg: 'rgba(217, 70, 239, 0.2)',
    description: 'Homenagem dedicada à força e resiliência da mulher angolana e mundial.'
  },
  {
    id: 'theme_23_marco',
    name: '23 de Março - Libertação da África Austral (Cuito Cuanavale)',
    category: 'angola_holiday',
    holidayDate: '23/03',
    holidayName: 'Dia da África Austral',
    primaryColor: '#D97706',
    accentColor: '#2563EB',
    bgDark: '#0A0E1A',
    cardBg: '#131D33',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    description: 'Vitória histórica de Cuito Cuanavale e libertação regional.'
  },
  {
    id: 'theme_1_maio',
    name: '1 de Maio - Dia do Trabalhador',
    category: 'angola_holiday',
    holidayDate: '01/05',
    holidayName: 'Dia do Trabalhador',
    primaryColor: '#0284C7',
    accentColor: '#10B981',
    bgDark: '#05101A',
    cardBg: '#0C2033',
    badgeBg: 'rgba(2, 132, 199, 0.2)',
    description: 'Celebração da classe trabalhadora, produtores e empresários.'
  },
  {
    id: 'theme_25_dezembro',
    name: '25 de Dezembro - Natal e Família Angolana',
    category: 'angola_holiday',
    holidayDate: '25/12',
    holidayName: 'Natal e Família',
    primaryColor: '#16A34A',
    accentColor: '#DC2626',
    bgDark: '#041208',
    cardBg: '#0B2412',
    badgeBg: 'rgba(22, 163, 74, 0.2)',
    description: 'Espírito natalício com tons festivos verde e carmesim.'
  },
  {
    id: 'theme_ano_novo',
    name: '1 de Janeiro - Ano Novo Prosperidade',
    category: 'angola_holiday',
    holidayDate: '01/01',
    holidayName: 'Ano Novo',
    primaryColor: '#F59E0B',
    accentColor: '#818CF8',
    bgDark: '#0B0B14',
    cardBg: '#181829',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    description: 'Celebração de novo ano e crescimento financeiro.'
  },

  // 10+ Temas Corporativos e Profissionais
  {
    id: 'theme_bancario_ouro',
    name: 'Banco Privado & Ouro Imperial',
    category: 'corporate',
    primaryColor: '#D97706',
    accentColor: '#FBBF24',
    bgDark: '#0C0A06',
    cardBg: '#1B1710',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    description: 'Elegância financeira com tons dourados nobres.'
  },
  {
    id: 'theme_luanda_executive',
    name: 'Luanda Executive Navy',
    category: 'corporate',
    primaryColor: '#1D4ED8',
    accentColor: '#38BDF8',
    bgDark: '#060B18',
    cardBg: '#0E1A33',
    badgeBg: 'rgba(29, 78, 216, 0.2)',
    description: 'Azul marinho executivo para empresas aduaneiras e bancárias.'
  },
  {
    id: 'theme_aduana_portuaria',
    name: 'Aduana & Logística Portuária',
    category: 'corporate',
    primaryColor: '#0284C7',
    accentColor: '#F59E0B',
    bgDark: '#07131D',
    cardBg: '#0F2538',
    badgeBg: 'rgba(2, 132, 199, 0.2)',
    description: 'Inspirado nos Portos de Luanda, Lobito e Namibe.'
  },
  {
    id: 'theme_esmeralda_fiscal',
    name: 'Esmeralda Fiscal Tributária',
    category: 'corporate',
    primaryColor: '#059669',
    accentColor: '#34D399',
    bgDark: '#04140D',
    cardBg: '#0B261A',
    badgeBg: 'rgba(5, 150, 105, 0.2)',
    description: 'Verde auditado para conformidade tributária e lucro limpo.'
  },
  {
    id: 'theme_safira_comex',
    name: 'Safira Comércio Internacional',
    category: 'corporate',
    primaryColor: '#4F46E5',
    accentColor: '#818CF8',
    bgDark: '#0A0C1E',
    cardBg: '#141838',
    badgeBg: 'rgba(79, 70, 229, 0.2)',
    description: 'Visual moderno para importadores e transitários.'
  },
  {
    id: 'theme_rubi_auditoria',
    name: 'Rubi Gestão de Risco',
    category: 'corporate',
    primaryColor: '#BE123C',
    accentColor: '#FB7185',
    bgDark: '#14060A',
    cardBg: '#260D15',
    badgeBg: 'rgba(190, 18, 60, 0.2)',
    description: 'Foco e atenção rigorosa a custos e margens industriais.'
  },
  {
    id: 'theme_diamante_catoca',
    name: 'Diamante Catoca Pureza',
    category: 'corporate',
    primaryColor: '#06B6D4',
    accentColor: '#E0F2FE',
    bgDark: '#061318',
    cardBg: '#0C222B',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    description: 'Inspirado nas riquezas minerais angolanas.'
  },
  {
    id: 'theme_platina_suica',
    name: 'Platina Suíça High-Tech',
    category: 'corporate',
    primaryColor: '#64748B',
    accentColor: '#94A3B8',
    bgDark: '#0F172A',
    cardBg: '#1E293B',
    badgeBg: 'rgba(100, 116, 139, 0.2)',
    description: 'Neutro sofisticado e sóbrio com alta legibilidade.'
  },
  {
    id: 'theme_petroleo_sonangol',
    name: 'Petróleo & Energia Offshore',
    category: 'corporate',
    primaryColor: '#F59E0B',
    accentColor: '#10B981',
    bgDark: '#0C0F0A',
    cardBg: '#161F14',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    description: 'Cores energéticas inspiradas no setor petrolífero angolano.'
  },
  {
    id: 'theme_agro_huila',
    name: 'Agro Indústria & Terras Altas',
    category: 'corporate',
    primaryColor: '#84CC16',
    accentColor: '#EAB308',
    bgDark: '#0B1204',
    cardBg: '#18240B',
    badgeBg: 'rgba(132, 204, 22, 0.2)',
    description: 'Fresco e dinâmico, voltado para produção nacional.'
  },

  // 10+ Temas Modern Dark, Cyber & Neon
  {
    id: 'theme_cyber_matrix',
    name: 'Cyber Matrix Terminal',
    category: 'modern_dark',
    primaryColor: '#22C55E',
    accentColor: '#10B981',
    bgDark: '#030A04',
    cardBg: '#08170B',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    description: 'Estilo terminal hacker financeiro com verde fluorescente suave.'
  },
  {
    id: 'theme_neon_tokyo',
    name: 'Neon Tokyo Synthwave',
    category: 'modern_dark',
    primaryColor: '#EC4899',
    accentColor: '#8B5CF6',
    bgDark: '#0D0517',
    cardBg: '#1B0D2E',
    badgeBg: 'rgba(236, 72, 153, 0.2)',
    description: 'Gradientes modernos e vibrantes para ambiente noturno.'
  },
  {
    id: 'theme_deep_space',
    name: 'Deep Space Nebula',
    category: 'modern_dark',
    primaryColor: '#8B5CF6',
    accentColor: '#06B6D4',
    bgDark: '#060714',
    cardBg: '#10122B',
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    description: 'Tons cósmicos roxo e ciano para alta concentração.'
  },
  {
    id: 'theme_sunset_benguela',
    name: 'Pôr do Sol em Benguela (Morena)',
    category: 'special',
    primaryColor: '#F97316',
    accentColor: '#F43F5E',
    bgDark: '#140804',
    cardBg: '#26120B',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    description: 'Inspirado nas praias e entardeceres da Baía Farta e Lobito.'
  },
  {
    id: 'theme_kalandula_falls',
    name: 'Quedas de Kalandula Névoa',
    category: 'special',
    primaryColor: '#0EA5E9',
    accentColor: '#14B8A6',
    bgDark: '#051117',
    cardBg: '#0C222E',
    badgeBg: 'rgba(14, 165, 233, 0.2)',
    description: 'Frescura das águas de Malanje e quedas majestosas.'
  },
  {
    id: 'theme_deserto_namibe',
    name: 'Deserto do Namibe & Welwitschia',
    category: 'special',
    primaryColor: '#D97706',
    accentColor: '#84CC16',
    bgDark: '#120E05',
    cardBg: '#241D0D',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    description: 'Resistência da Welwitschia Mirabilis em areias douradas.'
  },
  {
    id: 'theme_serra_leba',
    name: 'Serra da Leba Curvas Noturnas',
    category: 'special',
    primaryColor: '#A855F7',
    accentColor: '#EAB308',
    bgDark: '#0F061A',
    cardBg: '#1F0F33',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    description: 'Iluminação icónica das curvas da Serra da Leba.'
  },
  {
    id: 'theme_quantum_ai',
    name: 'Quantum AI Neural Core',
    category: 'modern_dark',
    primaryColor: '#6366F1',
    accentColor: '#06B6D4',
    bgDark: '#080914',
    cardBg: '#111329',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    description: 'Interface futurista de alta densidade analítica.'
  },
  {
    id: 'theme_stealth_carbon',
    name: 'Stealth Carbon Monocromático',
    category: 'modern_dark',
    primaryColor: '#94A3B8',
    accentColor: '#E2E8F0',
    bgDark: '#09090B',
    cardBg: '#18181B',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    description: 'Ultra minimalista preto grafite de luxo.'
  },
  {
    id: 'theme_minimal_light',
    name: 'Clean White Pro (Modo Claro)',
    category: 'professional_light',
    primaryColor: '#4F46E5',
    accentColor: '#059669',
    bgDark: '#0F172A',
    cardBg: '#1E293B',
    badgeBg: 'rgba(79, 70, 229, 0.1)',
    description: 'Tema profissional com clareza máxima.'
  },
  {
    id: 'theme_aurora_boreal',
    name: 'Aurora Boreal Nórdica',
    category: 'special',
    primaryColor: '#10B981',
    accentColor: '#06B6D4',
    bgDark: '#041014',
    cardBg: '#092128',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    description: 'Luzes celestes suaves para uso prolongado.'
  },
  {
    id: 'theme_monaco_royal',
    name: 'Mónaco Royal Velvet',
    category: 'special',
    primaryColor: '#7C3AED',
    accentColor: '#F59E0B',
    bgDark: '#0C0617',
    cardBg: '#1A0E30',
    badgeBg: 'rgba(124, 58, 237, 0.2)',
    description: 'Roxo nobre com toques dourados régios.'
  }
];

export function getTodayHolidayTheme(): AppTheme | null {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;

  const holiday = ANGOLA_HOLIDAYS.find((h) => h.day === currentDay && h.month === currentMonth);
  if (!holiday) return null;

  return APP_THEMES.find((t) => t.id === holiday.id) || null;
}
