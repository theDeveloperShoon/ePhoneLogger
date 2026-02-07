const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('callsApi', {
  saveCall: (call) => ipcRenderer.invoke('calls:save', call),
  getCalls: () => ipcRenderer.invoke('calls:get'),
});
