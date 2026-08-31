@echo off
title NANUCLOUD - Plataforma Fiscal e Comercial (Windows)
color 0b
echo ===================================================================
echo              INICIANDO PLATAFORMA FISCAL NANUCLOUD
echo ===================================================================
echo.
echo [1/4] A verificar base de dados SQLite predefinida...
if not exist "data" mkdir data
if not exist "database" mkdir database

if exist "data\nanucloud.sqlite" (
    echo [OK] Base de dados SQLite encontrada em data\nanucloud.sqlite
) else (
    echo [INFO] A base de dados SQLite sera criada automaticamente na inicializacao.
)

echo.
echo [2/4] A verificar dependencias do sistema...
if not exist node_modules (
    echo [INFO] A instalar modulos necessarios... Aguarde um momento...
    call npm install
) else (
    echo [OK] Dependencias verificadas com sucesso!
)

echo.
echo [3/4] A iniciar o servidor backend e a aplicacao web na porta 3000...
echo.
echo ===================================================================
echo  NANUCLOUD PRONTO!
echo  Base de Dados Padrao: SQLite (/data/nanucloud.sqlite)
echo  Aceda no navegador: http://localhost:3000
echo  Admin Padrao: admin / Senha: admin
echo  Super Admin: joaquim.monteiro@nanucloud.com (admin123)
echo ===================================================================
echo.

echo [4/4] A abrir o navegador Windows (Microsoft Edge / Google Chrome)...
start "" http://localhost:3000

call npm run dev
pause
