-- ==============================================================================
-- NANUCLOUD PLATFORM - UNIFIED DATABASE SCHEMA (SQLITE / MYSQL / POSTGRESQL)
-- Versão: 2026.8.0 - Multi-Plataforma
-- ==============================================================================

-- 1. TABELA DE UTILIZADORES DO SISTEMA & STAFF (RBAC)
CREATE TABLE IF NOT EXISTS nanucloud_staff_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(64),
    department VARCHAR(100) DEFAULT 'Consultoria Fiscal',
    role VARCHAR(32) DEFAULT 'user', -- super_admin, admin_level1, admin_level2, manager, user
    permission_group_id VARCHAR(64) DEFAULT 'grp_commercial',
    is_active INTEGER DEFAULT 1,
    queries_remaining INTEGER DEFAULT 10000,
    total_queries_used INTEGER DEFAULT 0,
    is_import_unlocked INTEGER DEFAULT 1,
    is_batch_unlocked INTEGER DEFAULT 1,
    is_api_unlocked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- 2. TABELA DE CLIENTES & EMPRESAS CONTRATANTES (CRM)
CREATE TABLE IF NOT EXISTS nanucloud_clients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(64),
    nif VARCHAR(64) NOT NULL,
    address TEXT,
    country VARCHAR(8) DEFAULT 'AO',
    client_category VARCHAR(32) DEFAULT 'comercio', -- comercio, servicos, importacao, industria, liberal
    is_active INTEGER DEFAULT 1,
    active_plan_id VARCHAR(64) DEFAULT 'plan_ouro',
    active_plan_name VARCHAR(128) DEFAULT 'Plano Ouro Pro',
    plan_expires_at TIMESTAMP NULL,
    queries_remaining INTEGER DEFAULT 500,
    total_queries_used INTEGER DEFAULT 120,
    is_import_unlocked INTEGER DEFAULT 1,
    is_batch_unlocked INTEGER DEFAULT 1,
    is_api_unlocked INTEGER DEFAULT 0,
    assigned_manager_name VARCHAR(255) DEFAULT 'Carlos Manuel',
    commercial_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- 3. TABELA DE SIMULAÇÕES FISCAIS & CÁLCULOS
CREATE TABLE IF NOT EXISTS nanucloud_simulations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    simulation_type VARCHAR(32) NOT NULL, -- local, services, intermediary, import, batch
    country_code VARCHAR(8) DEFAULT 'AO',
    product_description VARCHAR(255) NOT NULL,
    custom_tag VARCHAR(128),
    cost_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    freight_insurance DECIMAL(15, 2) DEFAULT 0.00,
    customs_duty_rate DECIMAL(6, 3) DEFAULT 0.000,
    customs_duty_amount DECIMAL(15, 2) DEFAULT 0.00,
    iva_rate DECIMAL(6, 3) DEFAULT 0.140,
    iva_amount DECIMAL(15, 2) DEFAULT 0.00,
    withholding_rate DECIMAL(6, 3) DEFAULT 0.000,
    withholding_amount DECIMAL(15, 2) DEFAULT 0.00,
    profit_margin_rate DECIMAL(6, 3) DEFAULT 0.250,
    profit_margin_amount DECIMAL(15, 2) DEFAULT 0.00,
    final_pvp DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(8) DEFAULT 'AOA',
    raw_payload_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE MATRIZ FISCAL DE TAXAS POR PAÍS
CREATE TABLE IF NOT EXISTS nanucloud_fiscal_matrix (
    id VARCHAR(64) PRIMARY KEY,
    country_code VARCHAR(8) NOT NULL,
    country_name VARCHAR(128) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    category_name VARCHAR(128) NOT NULL,
    standard_iva_rate DECIMAL(6, 3) NOT NULL DEFAULT 0.140,
    reduced_iva_rate DECIMAL(6, 3) DEFAULT 0.000,
    customs_duty_default DECIMAL(6, 3) DEFAULT 0.100,
    withholding_tax_default DECIMAL(6, 3) DEFAULT 0.065,
    legal_reference VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE TICKETS & ATENDIMENTO AO CLIENTE
CREATE TABLE IF NOT EXISTS nanucloud_tickets (
    id VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(64) DEFAULT 'fiscal_doubt',
    priority VARCHAR(32) DEFAULT 'medium',
    status VARCHAR(32) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to VARCHAR(255) DEFAULT 'Helena Afonso',
    messages_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DADOS INICIAIS (SEED)
INSERT OR REPLACE INTO nanucloud_staff_users (id, name, email, department, role, queries_remaining, is_active)
VALUES 
('usr_super_01', 'Joaquim Monteiro (Super Admin)', 'joaquim.monteiro@nanucloud.com', 'Direção Geral', 'super_admin', 999999, 1),
('usr_admin2_02', 'Dra. Teresa Bento (Diretora Fiscal)', 'teresa.bento@nanucloud.com', 'Consultoria Fiscal', 'admin_level2', 50000, 1),
('usr_mgr_03', 'Carlos Manuel (Gestor Comercial)', 'carlos.comercial@nanucloud.com', 'Comercial & Vendas', 'manager', 20000, 1),
('usr_sup_04', 'Helena Afonso (Agente Suporte)', 'helena.suporte@nanucloud.com', 'Suporte Técnico', 'user', 10000, 1);

INSERT OR REPLACE INTO nanucloud_clients (id, name, company_name, email, phone, nif, country, client_category, active_plan_name, queries_remaining, is_import_unlocked, is_batch_unlocked, is_api_unlocked)
VALUES 
('cli_001', 'Dr. Paulo Klayton Monteiro', 'Monteiro Comercial & Logística Lda', 'monteiro.comercial@gmail.com', '+244 923 111 222', '5417089123', 'AO', 'comercio', 'Plano Diamante (Importação + API)', 2500, 1, 1, 1),
('cli_002', 'Ana Carolina Sousa', 'Farmácias Unidas de Luanda Lda', 'ana.sousa@farmaciasunidas.ao', '+244 931 444 555', '5419082231', 'AO', 'comercio', 'Plano Prata Padrão', 340, 0, 1, 0),
('cli_003', 'Eng. Manuel Domingos', 'AngoLogistics Despachos Aduaneiros', 'm.domingos@angologistics.co.ao', '+244 923 777 888', '5401928374', 'AO', 'importacao', 'Plano Ouro Pro', 1850, 1, 1, 1),
('cli_004', 'Dra. Teresa Van-Dúnem', 'Van-Dúnem Consultores Associados RL', 'teresa@advogadosluanda.ao', '+244 944 123 456', '5420918231', 'AO', 'servicos', 'Plano Básico Teste', 45, 0, 0, 0);

INSERT OR REPLACE INTO nanucloud_fiscal_matrix (id, country_code, country_name, category_id, category_name, standard_iva_rate, customs_duty_default, withholding_tax_default, legal_reference)
VALUES
('fisc_ao_geral', 'AO', 'Angola', 'geral', 'Bens e Mercadorias em Geral', 0.140, 0.200, 0.065, 'Cód. IVA Art. 12 / Pauta Aduaneira 2024'),
('fisc_ao_cesta', 'AO', 'Angola', 'cesta_basica', 'Cesta Básica & Medicamentos Essenciais', 0.050, 0.020, 0.000, 'Decreto Presidencial 2024 - Alívio Cesta Básica'),
('fisc_pt_geral', 'PT', 'Portugal', 'geral', 'Regime Geral de IVA & IRC', 0.230, 0.000, 0.250, 'CIVA Art. 18 / Código IRC'),
('fisc_br_geral', 'BR', 'Brasil', 'geral', 'ICMS / PIS / COFINS Médio', 0.180, 0.140, 0.0465, 'Reforma Tributária IBS/CBS & TIPI'),
('fisc_mz_geral', 'MZ', 'Moçambique', 'geral', 'Regime Geral de IVA Moçambique', 0.160, 0.200, 0.200, 'Código do IVA Moçambique (Decreto 2023)');
