@echo off
title NANUCLOUD - Gerador de Executavel Windows (.EXE)
color 0a
echo ===================================================================
echo       NANUCLOUD - COMPILADOR DE APLICACAO EXECUTAVEL (.EXE)
echo ===================================================================
echo.
echo Escolha o metodo de geracao do executavel:
echo.
echo [1] Metodo 1: Electron Builder (Instalador Setup.exe + Portatil .exe)
echo [2] Metodo 2: Node PKG (Ficheiro unico nanucloud.exe sem dependencias)
echo [3] Metodo 3: Iniciar em Modo Janela Nativa (Microsoft Edge App Mode)
echo [4] Ver Manual Completo de Conversao (Passo a Passo)
echo [5] Sair
echo.
set /p opcao="Digite a opcao desejada (1-5): "

if "%opcao%"=="1" goto electron
if "%opcao%"=="2" goto pkg
if "%opcao%"=="3" goto edgeapp
if "%opcao%"=="4" goto manual
if "%opcao%"=="5" goto fim

:electron
echo.
echo ===================================================================
echo [1/3] A compilar o Frontend e Backend...
call npm run build
echo.
echo [2/3] A navegar para packages\windows...
cd packages\windows
echo.
echo [3/3] A instalar dependencias do Electron e gerar .EXE...
call npm install
call npm run build:win
echo.
echo [CONCLUIDO] Executaveis gerados com sucesso na pasta packages\windows\dist\ !
cd ..\..
pause
goto fim

:pkg
echo.
echo ===================================================================
echo [1/3] A compilar o pacote com esbuild e vite...
call npm run build
echo.
echo [2/3] A verificar a ferramenta PKG...
call npm install -g @yao-pkg/pkg
echo.
echo [3/3] A empacotar o executavel unico nanucloud-server.exe...
call pkg dist\server.cjs --target node18-win-x64 --output dist\nanucloud-server.exe
echo.
echo [CONCLUIDO] Executavel gerado com sucesso em dist\nanucloud-server.exe !
pause
goto fim

:edgeapp
echo.
echo ===================================================================
echo A iniciar o servidor e abrir em modo janela nativa do Windows Edge...
start "" http://localhost:3000
start msedge.exe --app=http://localhost:3000 --window-size=1280,800
call npm run dev
goto fim

:manual
echo.
type docs\MANUAL_CONVERSAO_EXE.md | more
pause
goto fim

:fim
echo.
echo Obrigado por utilizar a plataforma NANUCLOUD!
