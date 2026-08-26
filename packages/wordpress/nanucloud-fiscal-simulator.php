<?php
/**
 * Plugin Name: NANUCLOUD - Simulador Fiscal & PVP Profissional
 * Plugin URI: https://nanucloud.com
 * Description: Plugin WordPress profissional para cálculo de Preços de Venda ao Público (PVP), IVA (AGT/AT/Receita Federal), retenção na fonte, direitos aduaneiros e emissão de orçamentos com tabelas personalizadas no MySQL.
 * Version: 2026.8.0
 * Author: NANUCLOUD
 * Author URI: https://nanucloud.com
 * License: GPL-2.0+
 * Text Domain: nanucloud-simulator
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Hook de Ativação - Criação de Tabelas MySQL Dedicadas
register_activation_hook(__FILE__, 'nanucloud_activate_plugin');

function nanucloud_activate_plugin() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $table_clients = $wpdb->prefix . 'nanucloud_clients';
    $table_sims = $wpdb->prefix . 'nanucloud_simulations';

    $sql_clients = "CREATE TABLE IF NOT EXISTS $table_clients (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        nif VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64),
        plan_name VARCHAR(128) DEFAULT 'Plano Ouro WordPress',
        queries_remaining INT DEFAULT 500,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) $charset_collate;";

    $sql_sims = "CREATE TABLE IF NOT EXISTS $table_sims (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        product_description VARCHAR(255) NOT NULL,
        cost_price DECIMAL(15,2) NOT NULL,
        cif_price DECIMAL(15,2) NOT NULL,
        customs_duty DECIMAL(15,2) DEFAULT 0.00,
        iva_amount DECIMAL(15,2) NOT NULL,
        profit_margin DECIMAL(15,2) NOT NULL,
        final_pvp DECIMAL(15,2) NOT NULL,
        user_ip VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_clients);
    dbDelta($sql_sims);

    // Inserir dados de demonstração
    $wpdb->replace($table_clients, [
        'id' => 'wp_cli_01',
        'company_name' => 'Monteiro Comercial Lda',
        'nif' => '5417089123',
        'email' => 'monteiro@empresa.ao',
        'phone' => '+244 923 111 222',
        'plan_name' => 'Plano Diamante WP',
        'queries_remaining' => 1200
    ]);
}

// 2. Shortcode para exibir o simulador em qualquer página ou post [nanucloud_simulator]
add_shortcode('nanucloud_simulator', 'nanucloud_render_simulator_shortcode');

function nanucloud_render_simulator_shortcode($atts) {
    ob_start();
    ?>
    <div id="nanucloud-wp-app" style="background:#0f172a; color:#f8fafc; padding:24px; border-radius:16px; font-family:sans-serif; max-width:800px; margin:20px auto; box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:16px; margin-bottom:20px;">
            <div>
                <h3 style="margin:0; color:#818cf8; font-size:18px; font-weight:bold;">⚡ NANUCLOUD - Simulador Fiscal WordPress</h3>
                <p style="margin:4px 0 0 0; color:#94a3b8; font-size:12px;">Cálculo de Preço de Venda ao Público (PVP), IVA e Margem Comercial</p>
            </div>
            <span style="background:rgba(16,185,129,0.2); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3); padding:4px 10px; border-radius:999px; font-size:11px; font-family:monospace;">
                ● WP MySQL Ready
            </span>
        </div>

        <form id="nanucloudWpForm" style="display:grid; grid-gap:16px;">
            <div>
                <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:6px;">Nome do Produto / Serviço:</label>
                <input type="text" id="wp_product" value="Artigo Comercial Importado" required style="width:100%; background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px; border-radius:8px; font-size:14px; box-sizing:border-box;">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; grid-gap:12px;">
                <div>
                    <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:6px;">Preço de Custo (Kz / €):</label>
                    <input type="number" step="0.01" id="wp_cost" value="10000" required style="width:100%; background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px; border-radius:8px; font-size:14px; box-sizing:border-box;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:6px;">Margem de Lucro (%):</label>
                    <input type="number" step="1" id="wp_margin" value="30" required style="width:100%; background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px; border-radius:8px; font-size:14px; box-sizing:border-box;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; grid-gap:12px;">
                <div>
                    <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:6px;">Taxa de IVA (%):</label>
                    <select id="wp_iva" style="width:100%; background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px; border-radius:8px; font-size:14px; box-sizing:border-box;">
                        <option value="0.14">14% (Regime Geral AGT Angola)</option>
                        <option value="0.23">23% (Portugal Continental)</option>
                        <option value="0.05">5% (Cesta Básica / Reduzida)</option>
                        <option value="0.00">0% (Isento / Exportação)</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:6px;">Direitos Aduaneiros (%):</label>
                    <select id="wp_customs" style="width:100%; background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px; border-radius:8px; font-size:14px; box-sizing:border-box;">
                        <option value="0.10">10% (Padrão)</option>
                        <option value="0.20">20% (Produtos Acabados)</option>
                        <option value="0.00">0% (Produção Nacional)</option>
                    </select>
                </div>
            </div>

            <button type="submit" style="background:#4f46e5; hover:background:#4338ca; color:#fff; border:none; padding:12px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer; text-transform:uppercase; margin-top:8px;">
                Calcular Preço Final de Venda
            </button>
        </form>

        <div id="wp_result_panel" style="margin-top:20px; padding:16px; background:#020617; border:1px solid rgba(99,102,241,0.4); border-radius:12px; display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:10px;">
                <span style="font-size:13px; color:#94a3b8;">PVP Final Recomendado:</span>
                <span id="wp_pvp_display" style="font-size:22px; font-weight:bold; color:#34d399; font-family:monospace;">0.00 Kz</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; grid-gap:10px; margin-top:10px; font-size:11px; font-family:monospace; color:#94a3b8;">
                <div>IVA: <strong id="wp_iva_display" style="color:#e2e8f0;">0 Kz</strong></div>
                <div>Direitos: <strong id="wp_duty_display" style="color:#e2e8f0;">0 Kz</strong></div>
                <div>Margem Lucro: <strong id="wp_margin_display" style="color:#e2e8f0;">0 Kz</strong></div>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('nanucloudWpForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var cost = parseFloat(document.getElementById('wp_cost').value) || 0;
            var marginPct = (parseFloat(document.getElementById('wp_margin').value) || 0) / 100;
            var ivaRate = parseFloat(document.getElementById('wp_iva').value) || 0;
            var customsRate = parseFloat(document.getElementById('wp_customs').value) || 0;

            var customsDuty = cost * customsRate;
            var baseCost = cost + customsDuty;
            var marginAmount = baseCost * marginPct;
            var preTax = baseCost + marginAmount;
            var ivaAmount = preTax * ivaRate;
            var finalPvp = preTax + ivaAmount;

            document.getElementById('wp_result_panel').style.display = 'block';
            document.getElementById('wp_pvp_display').innerText = finalPvp.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kz';
            document.getElementById('wp_iva_display').innerText = ivaAmount.toFixed(2) + ' Kz';
            document.getElementById('wp_duty_display').innerText = customsDuty.toFixed(2) + ' Kz';
            document.getElementById('wp_margin_display').innerText = marginAmount.toFixed(2) + ' Kz';
        });
    });
    </script>
    <?php
    return ob_get_clean();
}

// 3. Menu no Painel de Administração do WordPress
add_action('admin_menu', 'nanucloud_add_admin_menu');

function nanucloud_add_admin_menu() {
    add_menu_page(
        'NANUCLOUD Fiscal',
        'NANUCLOUD Fiscal',
        'manage_options',
        'nanucloud-settings',
        'nanucloud_render_admin_page',
        'dashicons-calculator',
        30
    );
}

function nanucloud_render_admin_page() {
    global $wpdb;
    $table_clients = $wpdb->prefix . 'nanucloud_clients';
    $clients = $wpdb->get_results("SELECT * FROM $table_clients ORDER BY created_at DESC");
    ?>
    <div class="wrap">
        <h1>NANUCLOUD - Configuração & Clientes WordPress</h1>
        <p>Utilize o shortcode <code>[nanucloud_simulator]</code> em qualquer página, post ou construtor (Elementor / Gutenberg / Divi).</p>
        
        <h2>Clientes Registados no MySQL</h2>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Empresa</th>
                    <th>NIF</th>
                    <th>Email</th>
                    <th>Plano</th>
                    <th>Consultas Restantes</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($clients)): foreach ($clients as $c): ?>
                    <tr>
                        <td><strong><?php echo esc_html($c->company_name); ?></strong></td>
                        <td><?php echo esc_html($c->nif); ?></td>
                        <td><?php echo esc_html($c->email); ?></td>
                        <td><?php echo esc_html($c->plan_name); ?></td>
                        <td><?php echo esc_html($c->queries_remaining); ?></td>
                    </tr>
                <?php endforeach; else: ?>
                    <tr><td colspan="5">Nenhum cliente cadastrado ainda.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}
