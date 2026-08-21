#!/usr/bin/env bash
echo "==================================================================="
echo "              INICIANDO PLATAFORMA NANUCLOUD"
echo "==================================================================="
echo ""
echo "[1/3] A verificar dependências..."
if [ ! -d "node_modules" ]; then
    echo "[2/3] A instalar módulos necessários..."
    npm install
else
    echo "[2/3] Dependências já instaladas!"
fi
echo ""
echo "[3/3] A iniciar servidor..."
echo "Aceda no seu navegador a: http://localhost:3000"
echo "==================================================================="

# Tentar abrir no navegador padrão
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000 &
elif command -v open > /dev/null; then
    open http://localhost:3000 &
fi

npm run dev
