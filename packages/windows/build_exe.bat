@echo off
title Compilar NANUCLOUD Windows .EXE
echo [1/2] A instalar modulos do Electron...
call npm install
echo [2/2] A gerar o instalador Setup.exe e versao portatil...
call npm run build:win
echo.
echo Concluido! Verifique a pasta dist\
pause
