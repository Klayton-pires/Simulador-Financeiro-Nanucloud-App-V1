-- ==============================================================================
-- NANUCLOUD PLATFORM - BANCO DE DADOS OFICIAL
-- Compatível com: SQLite 3, PostgreSQL 14+, MySQL 8.0+ / MariaDB
-- Sistema: Simulador Financeiro e de Formação de Preços Nanucloud
-- Versão: 2026.9.0
-- ==============================================================================

-- 1. TABELA DE UTILIZADORES E ADMINISTRADORES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(150),
    address VARCHAR(255),
    nif VARCHAR(50),
    country VARCHAR(10) DEFAULT 'AO',
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'user', -- 'admin_level1', 'admin_level2', 'staff', 'manager', 'client', 'user'
    is_active INTEGER DEFAULT 1,
    queries_remaining INTEGER DEFAULT 3,
    total_queries_used INTEGER DEFAULT 0,
    active_plan_id VARCHAR(50),
    active_plan_name VARCHAR(100),
    plan_expires_at TIMESTAMP NULL,
    is_import_unlocked INTEGER DEFAULT 0,
    is_batch_unlocked INTEGER DEFAULT 0,
    two_factor_enabled INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- 2. TABELA DE PLANOS COMERCIAIS
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_kz DECIMAL(15, 2) NOT NULL,
    queries_count INTEGER NOT NULL,
    validity_days INTEGER DEFAULT 30,
    unit_price_kz DECIMAL(15, 2) DEFAULT 50.00,
    features TEXT, -- JSON array de funcionalidades
    unlocks_import INTEGER DEFAULT 0,
    unlocks_batch INTEGER DEFAULT 0,
    badge VARCHAR(50),
    sort_order INTEGER DEFAULT 1
);

-- 3. TABELA DE TRANSAÇÕES E PAGAMENTOS
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(150),
    user_email VARCHAR(150),
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount_kz DECIMAL(15, 2) NOT NULL,
    queries_granted INTEGER DEFAULT 0,
    validity_days INTEGER DEFAULT 30,
    payment_method VARCHAR(50) DEFAULT 'bank_transfer', -- 'bank_transfer', 'multicaixa_express', 'express_ref'
    payment_proof_url TEXT,
    payment_proof_name VARCHAR(255),
    payment_reference VARCHAR(100),
    notes TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by_admin_id VARCHAR(64),
    reviewed_by_admin_name VARCHAR(150),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE SIMULAÇÕES E HISTÓRICO DE CÁLCULO
CREATE TABLE IF NOT EXISTS query_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'local', 'import', 'batch', 'service', 'intermediary'
    item_type VARCHAR(30) DEFAULT 'product', -- 'product', 'service'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    country_code VARCHAR(10) DEFAULT 'AO',
    cost_base DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    vat_rate DECIMAL(6, 4) DEFAULT 0.1400,
    margin_applied DECIMAL(6, 4) DEFAULT 0.2500,
    final_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_profit DECIMAL(15, 2) DEFAULT 0.00,
    retention_rate DECIMAL(6, 4) DEFAULT 0.0000,
    retention_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_received DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'AOA',
    details TEXT, -- JSON completo dos cálculos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE CONTAS BANCÁRIAS OFICIAIS
CREATE TABLE IF NOT EXISTS bank_accounts (
    id VARCHAR(50) PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    swift VARCHAR(30),
    holder VARCHAR(150) NOT NULL,
    currency VARCHAR(20) DEFAULT 'AOA (Kz)',
    is_active INTEGER DEFAULT 1
);

-- 6. TABELA DE AUDITORIA DO SISTEMA (LOGS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(64),
    ip_address VARCHAR(50),
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE TICKETS DE SUPORTE
CREATE TABLE IF NOT EXISTS support_inquiries (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(64),
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    user_phone VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(30) DEFAULT 'normal',
    status VARCHAR(30) DEFAULT 'pending',
    assigned_admin_name VARCHAR(150),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- 8. TABELA DE CONFIGURAÇÕES GERAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_config',
    company_name VARCHAR(100) DEFAULT 'NANUCLOUD',
    company_address VARCHAR(255) DEFAULT 'Luanda, Angola',
    company_nif VARCHAR(50) DEFAULT '5417653438',
    support_email VARCHAR(150) DEFAULT 'suporte@nanucloud.com',
    company_email1 VARCHAR(150) DEFAULT 'geral@nanucloud.com',
    company_email2 VARCHAR(150) DEFAULT 'simulador@nanucloud.com',
    company_phone1 VARCHAR(50) DEFAULT '+244944935618',
    company_phone2 VARCHAR(50) DEFAULT '+244944935617',
    whatsapp_support1 VARCHAR(50) DEFAULT '+244944935618',
    whatsapp_support2 VARCHAR(50) DEFAULT '+244944935617',
    footer_copyright_text TEXT DEFAULT '© 2026 Nanucloud. Todos os direitos reservados.',
    free_queries_on_register INTEGER DEFAULT 3,
    free_queries_daily INTEGER DEFAULT 3,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INSERÇÃO DE DADOS INICIAIS (SEEDS OFICIAIS)
-- ==============================================================================

-- Contas Bancárias Oficiais
INSERT INTO bank_accounts (id, bank_name, iban, swift, holder, currency, is_active) VALUES
('bank_bai_01', 'Banco Angolano de Investimentos (BAI)', 'AO06 0040 0000 0692 4329 1010 6', 'BAIAOLLU', 'KLAYTON PIRES', 'AOA (Kz)', 1),
('bank_bfa_02', 'Banco de Fomento Angola (BFA)', 'AO06 0006 0000 9745 7140 3018 1', 'BFAAOLLU', 'KLAYTON PIRES', 'AOA (Kz)', 1),
('bank_bma_03', 'Banco Millennium Atlântico (BMA)', 'AO06 0055 0000 2469 9241 1017 7', 'BMAAOLLU', 'KLAYTON PIRES', 'AOA (Kz)', 1),
('bank_bic_04', 'Banco BIC Angola', 'AO06 0051 0000 7027 5788 1519 5', 'BICAOLLU', 'KLAYTON PIRES', 'AOA (Kz)', 1)
ON CONFLICT (id) DO NOTHING;

-- Planos Oficiais Nanucloud (Validade de 30 dias)
INSERT INTO plans (id, name, price_kz, queries_count, validity_days, unit_price_kz, features, unlocks_import, unlocks_batch, badge, sort_order) VALUES
('plan_bronze', 'Plano Bronze', 500.00, 10, 30, 50.00, '["10 Pesquisas / Simulações", "Módulo Comércio Local", "Histórico e Exportação", "Validade 30 dias"]', 0, 0, 'Iniciante', 1),
('plan_prata', 'Plano Prata', 1500.00, 30, 30, 50.00, '["30 Pesquisas / Simulações", "Comércio Local + Serviços", "Exportação XLSX", "Validade 30 dias"]', 0, 0, 'Popular', 2),
('plan_ouro', 'Plano Ouro Pro', 3000.00, 60, 30, 50.00, '["60 Pesquisas / Simulações", "Desbloqueia Módulo de Importação Aduaneira (CIF/FOB)", "Suporte Prioritário", "Validade 30 dias"]', 1, 0, 'Recomendado', 3),
('plan_platina', 'Plano Platina Business', 5000.00, 100, 30, 50.00, '["100 Pesquisas / Simulações", "Importação Aduaneira Desbloqueada", "Lote Excel .xlsx Desbloqueado", "Validade 30 dias"]', 1, 1, 'Empresarial', 4),
('plan_diamante', 'Plano Diamante Enterprise', 10000.00, 200, 30, 50.00, '["200 Pesquisas / Simulações", "Acesso Total a Todos os Módulos", "Atendimento VIP Dedicado", "Validade 30 dias"]', 1, 1, 'VIP', 5)
ON CONFLICT (id) DO NOTHING;

-- Configurações Iniciais
INSERT INTO system_settings (id, company_name, company_address, company_nif, support_email, company_email1, company_email2, company_phone1, company_phone2, whatsapp_support1, whatsapp_support2, footer_copyright_text) VALUES
('default_config', 'NANUCLOUD', 'Luanda, Angola', '5417653438', 'suporte@nanucloud.com', 'geral@nanucloud.com', 'simulador@nanucloud.com', '+244944935618', '+244944935617', '+244944935618', '+244944935617', '© 2026 Nanucloud. Todos os direitos reservados.')
ON CONFLICT (id) DO NOTHING;
