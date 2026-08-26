const { app, BrowserWindow, Menu, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');

// Base de Dados SQLite / JSON macOS em ~/Library/Application Support/NANUCLOUD
const dbPath = path.join(app.getPath('userData'), 'nanucloud_mac_db.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 880,
    titleBarStyle: 'hiddenInset', // Estilo nativo macOS
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#0F172A',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // Menu nativo macOS
  const template = [
    {
      label: 'NANUCLOUD',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Ficheiro',
      submenu: [
        { label: 'Nova Simulação', accelerator: 'CmdOrCtrl+N', click: () => win.webContents.send('new-sim') },
        { label: 'Exportar Excel (.xlsx)', accelerator: 'CmdOrCtrl+E', click: () => win.webContents.send('export-excel') }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
