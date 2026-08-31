# GUIA COMPLETO & PASSO A PASSO: CONVERTER NANUCLOUD EM APLICAÇÃO .EXE (WINDOWS)

Este manual detalha **4 métodos profissionais** para empacotar e converter a plataforma NANUCLOUD em um executável nativo do Windows (`.exe`), com base de dados SQLite local incluída e suporte a instalador (`setup.exe`) ou executável portátil (`nanucloud-portable.exe`).

---

## 📋 ÍNDICE
1. [Visão Geral & Requisitos Prévios](#1-visão-geral--requisitos-prévios)
2. [Método 1: Electron Builder (Recomendado / Profissional)](#2-método-1-electron-builder-recomendado--profissional)
3. [Método 2: Node PKG (Executável Único sem Dependências)](#3-método-2-node-pkg-executável-único-sem-dependências)
4. [Método 3: Microsoft Edge Webview2 / PWA Nativo (.exe)](#4-método-3-microsoft-edge-webview2--pwa-nativo-exe)
5. [Método 4: Inno Setup (Gerador de Instalador Windows com Ícone)](#5-método-4-inno-setup-gerador-de-instalador-windows-com-ícone)
6. [Estrutura da Base de Dados SQLite no Windows](#6-estrutura-da-base-de-dados-sqlite-no-windows)
7. [Scripts Automatizados de 1-Clique](#7-scripts-automatizados-de-1-clique)

---

## 1. VISÃO GERAL & REQUISITOS PRÉVIOS

### Requisitos no computador Windows (10 ou 11):
1. **Node.js**: Versão 18.x, 20.x ou 22.x LTS (descarregar em [nodejs.org](https://nodejs.org))
2. **Navegador**: Microsoft Edge ou Google Chrome (já presente no Windows)
3. **Pasta do Projeto**: Todo o código com as pastas `/src`, `/server`, `/database` e `/data`

---

## 2. MÉTODO 1: ELECTRON BUILDER (RECOMENDADO / PROFISSIONAL)

O Electron empacota o motor Chromium + Node.js + Base de Dados SQLite em um ficheiro `.exe` independente.

### Passo 1: Navegar para a pasta do pacote Windows
Abra o Prompt de Comando (CMD) ou PowerShell e digite:
```cmd
cd packages\windows
```

### Passo 2: Instalar as dependências do Electron
```cmd
npm install
```

### Passo 3: Testar a aplicação em modo Desktop
```cmd
npm start
```
*A janela nativa do NANUCLOUD abrirá com suporte total a SQLite local.*

### Passo 4: Gerar o ficheiro .EXE executável
```cmd
npm run build:win
```

### 📁 Resultado gerado:
Na pasta `packages\windows\dist\` você encontrará:
- `NANUCLOUD Fiscal Desktop Setup 2026.8.0.exe` (Instalador com assistente)
- `NANUCLOUD Fiscal Desktop 2026.8.0.exe` (Versão Portátil para Pen Drive)

---

## 3. MÉTODO 2: NODE PKG (EXECUTÁVEL ÚNICO SEM DEPENDÊNCIAS)

Permite transformar o servidor backend + frontend compilado + SQLite em um único ficheiro `nanucloud.exe` de ~40MB que **não requer Node.js instalado** no PC do cliente final.

### Passo 1: Compilar o Frontend e Backend
Na raiz do projeto:
```cmd
npm run build
```

### Passo 2: Instalar a ferramenta de compilação PKG
```cmd
npm install -g @yao-pkg/pkg
```

### Passo 3: Gerar o executável nativo Windows x64
```cmd
pkg dist/server.cjs --target node18-win-x64 --output dist/nanucloud-server.exe
```

### Passo 4: Criar o lançador com navegador automático
Crie um ficheiro `NANUCLOUD_DESKTOP.bat` ao lado do `.exe`:
```bat
@echo off
title NANUCLOUD - Plataforma Fiscal
start "" dist\nanucloud-server.exe
timeout /t 2 /nobreak >nul
start msedge.exe --app=http://localhost:3000
```

Dê duplo clique em `NANUCLOUD_DESKTOP.bat` e a aplicação iniciará como um app nativo sem barras de endereço!

---

## 4. MÉTODO 3: MICROSOFT EDGE WEBVIEW2 / PWA NATIVO (.EXE)

O Windows 10 e 11 incluem nativamente o motor **Microsoft Edge WebView2**.

### Opção A - Usar o atalho nativo em modo Aplicação:
1. Inicie o sistema:
   ```cmd
   INICIAR_SISTEMA.bat
   ```
2. O script executará automaticamente:
   ```cmd
   start msedge.exe --app=http://localhost:3000 --window-size=1280,800
   ```
3. O Edge abrirá o NANUCLOUD em modo janela pura (sem barra de URL, sem abas, exatamente como um software desktop `.exe`).

### Opção B - Instalar via PWA:
1. Abra `http://localhost:3000` no Microsoft Edge ou Google Chrome.
2. Na barra de endereço, clique no ícone **"Instalar NANUCLOUD"** (ou menu `...` > *Aplicações* > *Instalar este site como uma aplicação*).
3. O Windows criará um ícone na Área de Trabalho e no Menu Iniciar (`NANUCLOUD.exe`).

---

## 5. MÉTODO 4: INNO SETUP (GERADOR DE INSTALADOR PROFISSIONAL)

Se quiser distribuir para clientes em Angola e no mundo com instalador de Setup padrão (`Avançar > Avançar > Concluir`):

1. Descarregue o [Inno Setup](https://jrsoftware.org/isdl.php) (Gratuito).
2. Abra o Inno Setup Compiler e crie o script `setup_nanucloud.iss`:
```iss
[Setup]
AppName=NANUCLOUD Fiscal Platform
AppVersion=2026.8.0
DefaultDirName={autopf}\NANUCLOUD
DefaultGroupName=NANUCLOUD
OutputDir=installer_output
OutputBaseFilename=Nanucloud_Setup_v2026
Compression=lzma
SolidCompression=yes
SetupIconFile=public\favicon.ico

[Files]
Source: "dist\*"; DestDir: "{app}\dist"; Flags: recursesubdirs createallsubdirs
Source: "data\*"; DestDir: "{app}\data"; Flags: recursesubdirs createallsubdirs
Source: "INICIAR_SISTEMA.bat"; DestDir: "{app}"

[Icons]
Name: "{group}\NANUCLOUD"; Filename: "{app}\INICIAR_SISTEMA.bat"; IconFilename: "{app}\dist\icon.ico"
Name: "{autodesktop}\NANUCLOUD"; Filename: "{app}\INICIAR_SISTEMA.bat"; IconFilename: "{app}\dist\icon.ico"
```
3. Clique em **Compile** (F9). O instalador `Nanucloud_Setup_v2026.exe` estará pronto para entrega!

---

## 6. ESTRUTURA DA BASE DE DADOS SQLITE NO WINDOWS

A aplicação utiliza por padrão o motor SQLite armazenado nas seguintes pastas para facilitar os seus testes e cópias de segurança:

- **Ficheiro Principal SQLite**: `/data/nanucloud.sqlite`
- **Cópia para Testes Imediatos**: `/database/nanucloud.sqlite`
- **Tabelas Criadas Automaticamente**:
  1. `users` (Administradores Joaquim e Klayton Monteiro, clientes, saldo e licenças)
  2. `plans` (Bronze 500 Kz, Prata 1.500 Kz, Ouro 3.000 Kz, Platina 5.000 Kz, Diamante 10.000 Kz)
  3. `transactions` (Pagamentos por IBAN, BAI, BFA, BMA, BIC, EMIS, Multicaixa Express)
  4. `query_history` (Simulações fiscais, IVA 14%, Retenção na Fonte, Importação CIF/FOB)
  5. `audit_logs` (Histórico de segurança e operações)
  6. `system_settings` (Configurações da empresa NANUCLOUD)
  7. `bank_accounts` (IBANs oficiais e titulares)
  8. `bot_knowledge` (Base de conhecimento inteligente do Robô de Suporte)
  9. `fiscal_proposals` (Monitor de Legislação Fiscal AGT)
  10. `api_keys` (Chaves para XD POS, Primavera BSS e SAP)

---

## 7. SCRIPTS AUTOMATIZADOS DE 1-CLIQUE

No projeto estão incluídos os seguintes scripts prontos para dar duplo clique:
- `INICIAR_SISTEMA.bat` → Inicia o servidor e abre no navegador padrão do Windows.
- `build_windows_exe.bat` → Executa o ciclo completo de build e empacotamento `.exe`.
- `test_sqlite.bat` → Realiza a verificação de integridade da base de dados SQLite.

---
**NANUCLOUD Lda** - Luanda, Angola | Suporte: +244 929 462 681 / +244 954 269 353
