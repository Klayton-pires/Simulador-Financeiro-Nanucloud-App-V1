const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDbStats: () => ipcRenderer.invoke('get-db-stats'),
  saveSimulation: (sim) => ipcRenderer.invoke('save-simulation', sim),
  platform: 'windows'
});
