const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Database Storage in AppData / Local Directory (JSON / SQLite Schema)
const dbPath = path.join(app.getPath('userData'), 'nanucloud_desktop_db.json');

function getDbData() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      clients: [
        { id: 'win_cli_01', name: 'Paulo Klayton Monteiro', company: 'Monteiro Comercial Lda', nif: '5417089123', balance: 2500 },
        { id: 'win_cli_02', name: 'Ana Carolina Sousa', company: 'Farmácias Unidas', nif: '5419082231', balance: 340 }
      ],
      simulations: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return { clients: [], simulations: [] };
  }
}

function saveDbData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'NANUCLOUD Desktop - Windows x64 / ARM64',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-db-stats', () => {
    return getDbData();
  });

  ipcMain.handle('save-simulation', (event, sim) => {
    const db = getDbData();
    db.simulations.unshift({
      ...sim,
      id: 'sim_win_' + Date.now(),
      createdAt: new Date().toISOString()
    });
    saveDbData(db);
    return { success: true, count: db.simulations.length };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
