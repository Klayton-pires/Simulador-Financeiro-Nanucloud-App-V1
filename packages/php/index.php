<?php
/**
 * NANUCLOUD FISCAL PLATFORM - NATIVE PHP 8.1+ REPLICA
 * Standalone MVC Engine with Native SQLite3 Database Support
 * Compatível com XAMPP, WampServer, Docker, Linux, Apache e Nginx.
 */

declare(strict_types=1);
session_start();

// Database Initialization (SQLite)
$dbFile = __DIR__ . '/database.sqlite';
$isNewDb = !file_exists($dbFile);

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    if ($isNewDb) {
        $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
        if ($schemaSql) {
            $pdo->exec($schemaSql);
        }
    }
} catch (PDOException $e) {
    die("Erro ao ligar à base de dados SQLite: " . $e->getMessage());
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle Calculation API
if ($uri === '/api/calculate' && $method === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    $costPrice = (float)($input['costPrice'] ?? 0);
    $freight = (float)($input['freight'] ?? 0);
    $customsRate = (float)($input['customsRate'] ?? 0.10);
    $ivaRate = (float)($input['ivaRate'] ?? 0.14);
    $marginRate = (float)($input['marginRate'] ?? 0.25);
    $withholdingRate = (float)($input['withholdingRate'] ?? 0.065);
    $productDesc = trim((string)($input['productDescription'] ?? 'Mercadoria'));

    $cif = $costPrice + $freight;
    $customsDuty = $cif * $customsRate;
    $baseIva = $cif + $customsDuty;
    $iva = $baseIva * $ivaRate;
    $totalCost = $cif + $customsDuty;
    
    // Profit margin calculation
    $profitMargin = $totalCost * $marginRate;
    $priceBeforeTax = $totalCost + $profitMargin;
    $finalPvp = $priceBeforeTax * (1 + $ivaRate);
    $withholding = $priceBeforeTax * $withholdingRate;

    // Save simulation to SQLite DB
    $stmt = $pdo->prepare("
        INSERT INTO nanucloud_simulations 
        (id, user_id, simulation_type, product_description, cost_price, freight_insurance, customs_duty_rate, customs_duty_amount, iva_rate, iva_amount, profit_margin_rate, profit_margin_amount, final_pvp, raw_payload_json)
        VALUES 
        (:id, :uid, 'local', :pdesc, :cost, :freight, :crate, :cduty, :irate, :iamount, :mrate, :mamount, :pvp, :raw)
    ");

    $simId = 'sim_' . time() . '_' . rand(100, 999);
    $stmt->execute([
        ':id' => $simId,
        ':uid' => $_SESSION['user_id'] ?? 'guest_web',
        ':pdesc' => $productDesc,
        ':cost' => $costPrice,
        ':freight' => $freight,
        ':crate' => $customsRate,
        ':cduty' => $customsDuty,
        ':irate' => $ivaRate,
        ':iamount' => $iva,
        ':mrate' => $marginRate,
        ':mamount' => $profitMargin,
        ':pvp' => $finalPvp,
        ':raw' => json_encode($input)
    ]);

    echo json_encode([
        'status' => 'success',
        'simulationId' => $simId,
        'results' => [
            'product' => $productDesc,
            'cif' => round($cif, 2),
            'customsDuty' => round($customsDuty, 2),
            'iva' => round($iva, 2),
            'withholding' => round($withholding, 2),
            'profitMargin' => round($profitMargin, 2),
            'pvpFinal' => round($finalPvp, 2),
            'formattedPvp' => number_format($finalPvp, 2, ',', '.') . ' Kz'
        ]
    ]);
    exit;
}

// Fetch clients list for demo
$clients = $pdo->query("SELECT * FROM nanucloud_clients ORDER BY created_at DESC LIMIT 10")->fetchAll();
$simulations = $pdo->query("SELECT * FROM nanucloud_simulations ORDER BY created_at DESC LIMIT 10")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NANUCLOUD - Versão PHP 8.1+ & SQLite</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-[#0F172A] text-slate-100 min-h-screen">
    
    <!-- Top Header -->
    <header class="border-b border-slate-800 bg-[#1E293B] px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold font-mono">N</div>
            <div>
                <h1 class="text-sm font-bold tracking-wider font-mono">NANUCLOUD PHP STANDALONE</h1>
                <p class="text-[11px] text-slate-400">Motor de Simulação & Base de Dados SQLite Integrada</p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <span class="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                ● SQLite: Ativo (database.sqlite)
            </span>
            <a href="#manual" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-mono">Ver Manual</a>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Simulator Card -->
        <div class="lg:col-span-7 space-y-6">
            <div class="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 class="text-base font-bold font-mono text-indigo-400 mb-4 flex items-center gap-2">
                    ⚡ Simulador de Preço de Venda ao Público (PVP)
                </h2>

                <form id="calcForm" class="space-y-4 font-mono text-xs">
                    <div>
                        <label class="block text-slate-400 mb-1">Descrição do Produto / Mercadoria</label>
                        <input type="text" id="productDescription" value="Óleo Alimentar 1L (Caixa c/ 12)" required
                               class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-400 mb-1">Preço de Custo Unitário (Kz)</label>
                            <input type="number" step="0.01" id="costPrice" value="15000" required
                                   class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200">
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1">Frete / Despesas Adicionais (Kz)</label>
                            <input type="number" step="0.01" id="freight" value="1200"
                                   class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200">
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block text-slate-400 mb-1">Taxa IVA (%)</label>
                            <select id="ivaRate" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-200">
                                <option value="0.14">14% (Regime Geral)</option>
                                <option value="0.05">5% (Cesta Básica)</option>
                                <option value="0.00">0% (Isento)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1">Direitos Aduaneiros (%)</label>
                            <select id="customsRate" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-200">
                                <option value="0.10">10% (Padrão)</option>
                                <option value="0.20">20% (Bens Acabados)</option>
                                <option value="0.02">2% (Matéria Prima)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1">Margem Lucro (%)</label>
                            <input type="number" step="1" id="marginRate" value="25"
                                   class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200">
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer">
                        Calcular e Salvar na Base de Dados
                    </button>
                </form>

                <!-- Result Box -->
                <div id="resultBox" class="mt-6 p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3 hidden">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span class="text-xs text-slate-400">PVP Recomendado ao Consumidor:</span>
                        <span id="resPvp" class="text-lg font-bold font-mono text-emerald-400">0,00 Kz</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                        <div>IVA a Liquidar: <b id="resIva" class="text-slate-200 block">0 Kz</b></div>
                        <div>Direitos: <b id="resDuty" class="text-slate-200 block">0 Kz</b></div>
                        <div>Margem Bruta: <b id="resMargin" class="text-slate-200 block">0 Kz</b></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: SQLite Database Inspector -->
        <div class="lg:col-span-5 space-y-6">
            <div class="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h3 class="text-xs font-bold font-mono uppercase text-slate-300 mb-3 flex items-center justify-between">
                    <span>Base de Dados SQLite (Clientes)</span>
                    <span class="text-emerald-400 font-normal"><?= count($clients) ?> Registos</span>
                </h3>

                <div class="divide-y divide-slate-800 text-xs font-mono max-h-80 overflow-y-auto">
                    <?php foreach ($clients as $c): ?>
                        <div class="py-2.5">
                            <div class="font-bold text-slate-200"><?= htmlspecialchars($c['company_name']) ?></div>
                            <div class="text-[11px] text-slate-400">NIF: <?= htmlspecialchars($c['nif']) ?> | <?= htmlspecialchars($c['active_plan_name']) ?></div>
                            <div class="text-[10px] text-indigo-400">Saldo: <?= $c['queries_remaining'] ?> consultas restantes</div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

    </main>

    <script>
        document.getElementById('calcForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                productDescription: document.getElementById('productDescription').value,
                costPrice: parseFloat(document.getElementById('costPrice').value),
                freight: parseFloat(document.getElementById('freight').value),
                ivaRate: parseFloat(document.getElementById('ivaRate').value),
                customsRate: parseFloat(document.getElementById('customsRate').value),
                marginRate: parseFloat(document.getElementById('marginRate').value) / 100
            };

            const res = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status === 'success') {
                document.getElementById('resultBox').classList.remove('hidden');
                document.getElementById('resPvp').innerText = data.results.formattedPvp;
                document.getElementById('resIva').innerText = data.results.iva + ' Kz';
                document.getElementById('resDuty').innerText = data.results.customsDuty + ' Kz';
                document.getElementById('resMargin').innerText = data.results.profitMargin + ' Kz';
            }
        });
    </script>
</body>
</html>
