import { app, BrowserWindow, ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALLS_FILE = path.join(app.getPath('userData'), 'calls.json');

async function loadCalls() {
  try {
    const data = await readFile(CALLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { calls: [] };
  }
}

async function saveCalls(data) {
  await writeFile(CALLS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

ipcMain.handle('calls:get', async () => {
  return loadCalls();
});

ipcMain.handle('calls:save', async (_, call) => {
  const data = await loadCalls();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    ...call,
  };
  data.calls.push(entry);
  await saveCalls(data);
  return entry;
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
