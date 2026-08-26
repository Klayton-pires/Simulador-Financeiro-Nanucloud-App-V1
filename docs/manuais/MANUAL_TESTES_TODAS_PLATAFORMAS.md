# MANUAL COMPLETO DE TESTES & EXECUÇÃO MULTI-PLATAFORMA NANUCLOUD
**Versão:** 2026.8.0  
**Plataformas Suportadas:** Web, PHP, WordPress, Windows, Android, iOS, macOS, Remix

---

## 1. INTRODUÇÃO & ARQUITETURA MULTI-PLATAFORMA

A plataforma fiscal **NANUCLOUD** foi concebida para operar de forma 100% autónoma ou conectada em 8 ecossistemas distintos. Cada réplica possui a sua própria base de dados nativa (SQLite, MySQL, Room/Android, CoreData/iOS, Prisma SQLite):

| Plataforma | Pasta do Pacote | Motor Principal | Base de Dados Nativa |
| :--- | :--- | :--- | :--- |
| **Web Standalone** | `/packages/web/` | HTML5 / JavaScript ES6 | IndexedDB + LocalStorage SQLite Engine |
| **PHP 8.1+** | `/packages/php/` | PHP Nativo MVC | `database.sqlite` / MySQL `schema.sql` |
| **WordPress** | `/packages/wordpress/` | Plugin WP com Shortcodes | MySQL (`wp_nanucloud_clients`, `wp_nanucloud_simulations`) |
| **Windows** | `/packages/windows/` | Electron Desktop x64/ARM64 | SQLite (`better-sqlite3`) / JSON Store |
| **Android** | `/packages/android/` | Kotlin + WebView Native | Android SQLite (`NanuCloudDbHelper.db`) |
| **iOS** | `/packages/ios/` | Swift + WKWebView | iOS SQLite3 / CoreData (`nanucloud_ios.sqlite`) |
| **macOS** | `/packages/mac/` | Electron macOS + Menu Nativo | SQLite / Local Storage Sandbox |
| **Remix.run** | `/packages/remix/` | Remix 2.x + Vite + React | Prisma ORM com SQLite (`prisma/dev.db`) |

---

## 2. GUIA DE TESTES NO PC (WINDOWS, MACOS, LINUX)

### A. Testar a Versão Web Standalone no PC
1. Abra o terminal na pasta `packages/web/`.
2. Execute um dos comandos abaixo:
   ```bash
   # Opção 1: Com Node.js
   npx serve .
   
   # Opção 2: Com Python 3
   python -m http.server 3000
   ```
3. Abra no navegador: `http://localhost:3000`.

---

### B. Testar a Versão PHP 8.1+ & SQLite no PC
1. Certifique-se de ter o PHP instalado (ou use XAMPP / WampServer).
2. Na pasta `packages/php/`, execute:
   - **No Windows:** dê duplo clique no ficheiro `test_server.bat` ou digite no terminal:
     ```bash
     php -S localhost:8000
     ```
   - **No macOS / Linux:**
     ```bash
     php -S localhost:8000
     ```
3. Aceda no seu navegador a `http://localhost:8000`.
4. Faça uma simulação e veja o registo ser automaticamente gravado no ficheiro `database.sqlite`!

---

### C. Testar o Plugin WordPress no PC
1. Inicie o seu ambiente WordPress local (XAMPP, WAMP ou LocalWP / Local by Flywheel).
2. Copie a pasta `packages/wordpress/` para o diretório de plugins do seu WordPress:
   - Exemplo: `C:/xampp/htdocs/meu-site/wp-content/plugins/nanucloud-fiscal/`
3. No painel de administração do WordPress (`/wp-admin`):
   - Vá a **Plugins > Plugins Instalados**.
   - Clique em **Ativar** no plugin **NANUCLOUD - Simulador Fiscal & PVP Profissional**.
4. Crie uma nova página e adicione o shortcode:
   ```text
   [nanucloud_simulator]
   ```
5. Publique e teste o simulador integrado no layout do seu tema WordPress.
6. Aceda ao menu **NANUCLOUD Fiscal** na barra lateral do WordPress para visualizar a base de dados MySQL de clientes!

---

### D. Testar a Aplicação Windows (.EXE) no PC
1. Na pasta `packages/windows/`, instale as dependências:
   ```bash
   npm install
   ```
2. Para testar em modo de desenvolvimento:
   ```bash
   npm start
   ```
3. Para gerar o instalador executável `.exe` (NSIS ou Portable):
   ```bash
   npm run build:win
   ```
4. O instalador será gerado na pasta `dist/`.

---

### E. Testar a Aplicação macOS no Mac
1. Na pasta `packages/mac/`, execute:
   ```bash
   npm install
   npm start
   ```
2. Para gerar o pacote `.dmg`:
   ```bash
   npm run build:mac
   ```

---

### F. Testar a Versão Remix.run no PC
1. Na pasta `packages/remix/`, execute:
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```
2. Abra no navegador: `http://localhost:5173`.
3. Para abrir o visualizador de base de dados Prisma Studio:
   ```bash
   npx prisma studio
   ```

---

## 3. GUIA DE TESTES NO TELEMÓVEL ANDROID

Existem **4 formas simples e eficazes** de testar o NANUCLOUD no seu smartphone Android:

### Método 1: Teste via Rede Wi-Fi Local (O Mais Rápido)
1. Conecte o seu PC e o seu telemóvel Android à **mesma rede Wi-Fi**.
2. Descubra o IP local do seu computador:
   - **No Windows:** abra o CMD e digite `ipconfig` (procure por *Endereço IPv4*, ex: `192.168.1.105`).
   - **No Mac / Linux:** abra o Terminal e digite `ifconfig` ou `ip a`.
3. No seu PC, inicie o servidor da plataforma desejada (ex: PHP na porta 8000 ou Web na porta 3000):
   ```bash
   php -S 0.0.0.0:8000
   ```
4. No telemóvel Android, abra o Google Chrome e digite:
   ```text
   http://192.168.1.105:8000
   ```
5. O sistema funcionará com total responsividade no ecrã do seu telemóvel!

---

### Método 2: Instalar como PWA no Android (App Semelhante a Nativa)
1. Aceda ao NANUCLOUD pelo Google Chrome no Android.
2. Toque nos **3 pontinhos no canto superior direito** do Chrome.
3. Selecione **"Adicionar ao ecrã principal"** ou **"Instalar aplicação"**.
4. Um ícone do NANUCLOUD será criado no menu do seu telemóvel, abrindo em ecrã inteiro sem a barra do navegador e funcionando mesmo offline com cache local!

---

### Método 3: Servidor Local Completo no Android com o Termux
Se quiser rodar o PHP ou Node.js **diretamente dentro do próprio telemóvel Android** sem precisar de PC:
1. Instale o aplicativo **Termux** no Android (via F-Droid ou Play Store).
2. Abra o Termux e instale o PHP e o SQLite:
   ```bash
   pkg update
   pkg install php sqlite git
   ```
3. Crie ou copie o ficheiro `index.php` do pacote PHP e inicie o servidor:
   ```bash
   php -S 0.0.0.0:8080
   ```
4. Abra o navegador do telemóvel em `http://localhost:8080`.

---

### Método 4: Build do APK Nativo no Android Studio
1. Abra a pasta `packages/android/` no **Android Studio**.
2. Deixe o Gradle sincronizar as dependências (`build.gradle`).
3. Ative a **Depuração USB** no seu telemóvel Android (em *Definições > Opções do Programador*).
4. Conecte o cabo USB e clique no botão verde **Run 'app'** no Android Studio.
5. O aplicativo nativo será instalado diretamente no telemóvel, utilizando a base de dados SQLite nativa (`nanucloud_android.db`).

---

## 4. ESTRUTURA DAS BASES DE DADOS INCLUÍDAS

Todas as versões incluem as seguintes tabelas estruturadas:
1. `nanucloud_staff_users`: Gestão de administradores e equipa interna.
2. `nanucloud_clients`: Base de dados CRM de empresas, planos e saldos.
3. `nanucloud_simulations`: Histórico de cálculos fiscais, IVA, direitos aduaneiros e margens de lucro.
4. `nanucloud_fiscal_matrix`: Taxas e alíquotas oficiais de Angola, Portugal, Brasil e Moçambique.

---

## 5. DÚVIDAS OU SUPORTE
Para assistência técnica ou ativação de módulos corporativos de importação e API REST, utilize o widget de **Suporte 24/7** ou consulte os canais oficiais NANUCLOUD.
