/**
 * NANUCLOUD Enterprise - Gestor Criptográfico de Licenças Multiplataforma
 * Suporta execução offline (Windows, Mac, iOS, Android e Web)
 * Inclui proteção contra manipulação do relógio do sistema (Anti-Clock Tampering)
 */

export interface OfflineLicense {
  licenseKey: string;
  customerName: string;
  customerNif?: string;
  customerEmail: string;
  planType: 'monthly' | 'annual' | 'lifetime' | 'enterprise_unlimited';
  platformTarget: 'all' | 'windows' | 'mac' | 'ios' | 'android' | 'web';
  maxBatchRows: number;
  issuedAt: string;
  expiresAt: string;
  lastVerifiedTimestamp: number;
  signature: string;
  status: 'valid' | 'expired' | 'tampered' | 'invalid';
}

export interface PlatformCapacityGuide {
  platform: string;
  recommendedBatchRows: number;
  maxBatchRows: number;
  offlineSupport: boolean;
  notes: string;
}

export const PLATFORM_CAPACITY_LIMITS: PlatformCapacityGuide[] = [
  {
    platform: 'Web Cloud (Navegador)',
    recommendedBatchRows: 5000,
    maxBatchRows: 15000,
    offlineSupport: true,
    notes: 'Execução via Service Worker + Web Worker no navegador com exportação Excel.'
  },
  {
    platform: 'Windows Desktop (.exe / .bat)',
    recommendedBatchRows: 25000,
    maxBatchRows: 60000,
    offlineSupport: true,
    notes: 'Desempenho nativo com suporte para grandes bases de dados e ficheiros pesados.'
  },
  {
    platform: 'macOS Native (.app / dmg)',
    recommendedBatchRows: 25000,
    maxBatchRows: 60000,
    offlineSupport: true,
    notes: 'Otimizado para arquitetura Apple Silicon (M1/M2/M3/M4) e Intel.'
  },
  {
    platform: 'iOS Mobile / iPadOS',
    recommendedBatchRows: 3000,
    maxBatchRows: 8000,
    offlineSupport: true,
    notes: 'Modo POS e celular com layout responsivo e leitor biométrico.'
  },
  {
    platform: 'Android APK / POS Terminal',
    recommendedBatchRows: 3000,
    maxBatchRows: 10000,
    offlineSupport: true,
    notes: 'Compatível com terminais POS Android e smartphones de baixa/alta gama.'
  }
];

const LICENSE_SALT = 'NANUCLOUD_SECURE_HASH_SALT_2026_V2';
const STORAGE_KEY_LICENSE = 'nanucloud_offline_license';
const STORAGE_KEY_MONOTONIC_TIME = 'nanucloud_monotonic_clock_seq';

/**
 * Gera uma chave de licença criptográfica formatada
 */
export function generateLicenseKey(
  customerEmail: string,
  customerName: string,
  planType: 'monthly' | 'annual' | 'lifetime' | 'enterprise_unlimited',
  durationDays: number = 365
): OfflineLicense {
  const now = Date.now();
  const expiresTimestamp = planType === 'lifetime' || planType === 'enterprise_unlimited' 
    ? now + (3650 * 24 * 60 * 60 * 1000) 
    : now + (durationDays * 24 * 60 * 60 * 1000);

  // Segmentos alfanuméricos da chave
  const segment1 = 'NANU';
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment3 = planType === 'annual' ? 'AN01' : (planType === 'monthly' ? 'MS01' : 'LT99');
  const segment4 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const licenseKey = `${segment1}-${segment2}-${segment3}-${segment4}`;

  const maxRows = planType === 'enterprise_unlimited' ? 100000 : (planType === 'annual' ? 50000 : 15000);

  const licensePayload = `${licenseKey}|${customerEmail}|${expiresTimestamp}|${maxRows}|${LICENSE_SALT}`;
  
  // Simples hash criptográfica representativa
  let hash = 0;
  for (let i = 0; i < licensePayload.length; i++) {
    const char = licensePayload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const signature = `SIG_${Math.abs(hash).toString(16).toUpperCase()}`;

  const license: OfflineLicense = {
    licenseKey,
    customerName,
    customerEmail,
    planType,
    platformTarget: 'all',
    maxBatchRows: maxRows,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresTimestamp).toISOString(),
    lastVerifiedTimestamp: now,
    signature,
    status: 'valid'
  };

  return license;
}

/**
 * Validação com Anti-Clock-Tampering
 * Impede que o utilizador volte a data do computador para utilizar o software expirado.
 */
export function validateOfflineLicense(license: OfflineLicense): { isValid: boolean; status: OfflineLicense['status']; message: string } {
  const currentLocalTime = Date.now();
  const storedMonotonicTime = Number(localStorage.getItem(STORAGE_KEY_MONOTONIC_TIME) || '0');

  // 1. Verificação de Manipulação de Relógio (Se o tempo atual for MENOR que o último tempo verificado e gravado)
  if (currentLocalTime < storedMonotonicTime - (5 * 60 * 1000)) {
    // Tolerância de 5 minutos para pequenos ajustes de fuso horário
    return {
      isValid: false,
      status: 'tampered',
      message: 'Manipulação de relógio do sistema detetada! A data do computador foi alterada para o passado para contornar a licença.'
    };
  }

  // Atualizar marcador de tempo monotónico para a próxima verificação
  const newMaxTime = Math.max(currentLocalTime, storedMonotonicTime);
  localStorage.setItem(STORAGE_KEY_MONOTONIC_TIME, String(newMaxTime));

  // 2. Verificação de Expiração
  const expiresTimestamp = new Date(license.expiresAt).getTime();
  if (newMaxTime > expiresTimestamp) {
    return {
      isValid: false,
      status: 'expired',
      message: `A sua licença offline expirou em ${new Date(expiresTimestamp).toLocaleDateString('pt-PT')}. Por favor, renove a sua subscrição.`
    };
  }

  return {
    isValid: true,
    status: 'valid',
    message: `Licença válida (${license.planType.toUpperCase()}) até ${new Date(expiresTimestamp).toLocaleDateString('pt-PT')}.`
  };
}

export function saveActiveLicense(license: OfflineLicense) {
  localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(license));
}

export function getActiveLicense(): OfflineLicense | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LICENSE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
