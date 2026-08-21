import { CountryFiscal } from '../types';

export const COUNTRIES_DB: Record<string, CountryFiscal> = {
  AO: {
    code: 'AO',
    name: 'Angola',
    curr: 'Kz',
    agency: 'AGT',
    vatOptions: [
      { n: 'Geral (14%)', r: 14 },
      { n: 'Simplificado (7%)', r: 7 },
      { n: 'Cesta Básica (5%)', r: 5 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 25,
    tpa: 1.0,
    margins: [10, 20, 30],
    defaultCustomsRate: 10
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    curr: '€',
    agency: 'AT',
    vatOptions: [
      { n: 'Normal (23%)', r: 23 },
      { n: 'Intermédia (13%)', r: 13 },
      { n: 'Reduzida (6%)', r: 6 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 21,
    tpa: 1.0,
    margins: [15, 25, 35],
    defaultCustomsRate: 6
  },
  BR: {
    code: 'BR',
    name: 'Brasil',
    curr: 'R$',
    agency: 'Receita Federal',
    vatOptions: [
      { n: 'ICMS Padrão (17%)', r: 17 },
      { n: 'Reduzido (7%)', r: 7 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 15,
    tpa: 2.0,
    margins: [15, 25, 40],
    defaultCustomsRate: 14
  },
  MZ: {
    code: 'MZ',
    name: 'Moçambique',
    curr: 'MT',
    agency: 'AT',
    vatOptions: [
      { n: 'Geral (16%)', r: 16 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 32,
    tpa: 1.5,
    margins: [10, 20, 30],
    defaultCustomsRate: 20
  },
  CV: {
    code: 'CV',
    name: 'Cabo Verde',
    curr: 'CVE',
    agency: 'DNRE',
    vatOptions: [
      { n: 'Geral (15%)', r: 15 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 22,
    tpa: 1.2,
    margins: [10, 20, 30],
    defaultCustomsRate: 15
  },
  CN: {
    code: 'CN',
    name: 'China',
    curr: '¥',
    agency: 'STA',
    vatOptions: [
      { n: 'Standard (13%)', r: 13 },
      { n: 'Reduced (9%)', r: 9 },
      { n: 'Exempt (0%)', r: 0 }
    ],
    ii: 25,
    tpa: 0.6,
    margins: [10, 20, 30],
    defaultCustomsRate: 10
  },
  US: {
    code: 'US',
    name: 'Estados Unidos (EUA)',
    curr: '$',
    agency: 'IRS',
    vatOptions: [
      { n: 'Sales Tax Média (7%)', r: 7 },
      { n: 'Zero Tax (0%)', r: 0 }
    ],
    ii: 21,
    tpa: 2.5,
    margins: [15, 30, 50],
    defaultCustomsRate: 5
  },
  DE: {
    code: 'DE',
    name: 'Alemanha',
    curr: '€',
    agency: 'BZSt',
    vatOptions: [
      { n: 'MwSt Standard (19%)', r: 19 },
      { n: 'Reduzido (7%)', r: 7 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 15,
    tpa: 0.9,
    margins: [10, 20, 30],
    defaultCustomsRate: 6
  },
  AE: {
    code: 'AE',
    name: 'Emirados Árabes Unidos (Dubai)',
    curr: 'AED',
    agency: 'FTA',
    vatOptions: [
      { n: 'Standard (5%)', r: 5 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 9,
    tpa: 1.5,
    margins: [10, 20, 35],
    defaultCustomsRate: 5
  },
  IN: {
    code: 'IN',
    name: 'Índia',
    curr: '₹',
    agency: 'CBIC',
    vatOptions: [
      { n: 'GST Standard (18%)', r: 18 },
      { n: 'Reduced (12%)', r: 12 },
      { n: 'Low (5%)', r: 5 },
      { n: 'Exempt (0%)', r: 0 }
    ],
    ii: 25,
    tpa: 1.8,
    margins: [10, 20, 30],
    defaultCustomsRate: 15
  },
  JP: {
    code: 'JP',
    name: 'Japão',
    curr: '¥',
    agency: 'NTA',
    vatOptions: [
      { n: 'Standard (10%)', r: 10 },
      { n: 'Reduced (8%)', r: 8 },
      { n: 'Exempt (0%)', r: 0 }
    ],
    ii: 23.2,
    tpa: 1.5,
    margins: [10, 20, 30],
    defaultCustomsRate: 5
  },
  ZA: {
    code: 'ZA',
    name: 'África do Sul',
    curr: 'R',
    agency: 'SARS',
    vatOptions: [
      { n: 'Standard (15%)', r: 15 },
      { n: 'Zero Rate (0%)', r: 0 }
    ],
    ii: 27,
    tpa: 1.5,
    margins: [10, 20, 30],
    defaultCustomsRate: 15
  },
  TR: {
    code: 'TR',
    name: 'Turquia',
    curr: '₺',
    agency: 'GİB',
    vatOptions: [
      { n: 'KDV Standard (20%)', r: 20 },
      { n: 'Reduzido (10%)', r: 10 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 25,
    tpa: 1.8,
    margins: [10, 20, 35],
    defaultCustomsRate: 12
  },
  OTHER: {
    code: 'OTHER',
    name: 'Outro País / Internacional',
    curr: 'USD',
    agency: 'Fisco Local',
    vatOptions: [
      { n: 'Padrão (20%)', r: 20 },
      { n: 'Padrão (14%)', r: 14 },
      { n: 'Padrão (10%)', r: 10 },
      { n: 'Isento (0%)', r: 0 }
    ],
    ii: 20,
    tpa: 1.5,
    margins: [10, 20, 30],
    defaultCustomsRate: 10
  }
};
