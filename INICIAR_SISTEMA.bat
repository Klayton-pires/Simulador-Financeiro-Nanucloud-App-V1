@echo off
title NANUCLOUD - Inicializacao do Sistema
color 0b
echo ===================================================================
echo              INICIANDO PLATAFORMA NANUCLOUD
echo ===================================================================
echo.
echo [1/3] A verificar dependencias do sistema...
if not exist node_modules (
    echo [2/3] Instalando modulos necessarios... Isso pode demorar 1 minuto...
    call npm install
) else (
    echo [2/3] Dependencias ja instaladas!
)
echo.
echo [3/3] A iniciar o servidor da aplicacao na porta 3000...
echo.
echo ===================================================================
echo  NANUCLOUD PRONTO!
echo  Aceda no seu navegador ao endereco: http://localhost:3000
echo ===================================================================
echo.
start http://localhost:3000
call npm run dev
pause
