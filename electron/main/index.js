import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'node:path'
import { writeFile, readFile } from 'node:fs/promises'
import {
  openDatabase,
  closeDatabase,
  getProgress,
  setSessionDone,
  setRating,
  setCheatsheet,
  setHomework,
  setShadowing,
  setReadiness,
  startRun,
  finishRun,
  resetAll,
  importProgress,
  exportProgress,
  markMigrated,
  getMeta,
  setMeta,
  listQa,
  createQa,
  updateQa,
  deleteQa,
} from './db.js'

const isDev = !app.isPackaged

function resolveIconPath() {
  if (isDev) {
    return join(app.getAppPath(), 'build', 'icon.ico')
  }
  return join(process.resourcesPath, 'icon.ico')
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 880,
    minHeight: 640,
    show: false,
    title: 'Interview Prep Tracker',
    backgroundColor: '#0c1118',
    icon: resolveIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc() {
  ipcMain.handle('progress:get', () => getProgress())
  ipcMain.handle('progress:setSessionDone', (_e, sessionId, done) => {
    setSessionDone(sessionId, done)
    return getProgress()
  })
  ipcMain.handle('progress:setRating', (_e, sessionId, key, value) => {
    setRating(sessionId, key, value)
    return getProgress()
  })
  ipcMain.handle('progress:setCheatsheet', (_e, sessionId, cheatsheet) => {
    setCheatsheet(sessionId, cheatsheet)
    return getProgress()
  })
  ipcMain.handle('progress:setHomework', (_e, itemId, done) => {
    setHomework(itemId, done)
    return getProgress()
  })
  ipcMain.handle('progress:setShadowing', (_e, day, done) => {
    setShadowing(day, done)
    return getProgress()
  })
  ipcMain.handle('progress:setReadiness', (_e, itemId, done) => {
    setReadiness(itemId, done)
    return getProgress()
  })
  ipcMain.handle('progress:startRun', (_e, sessionId) => startRun(sessionId))
  ipcMain.handle('progress:finishRun', (_e, runId, payload) => {
    finishRun(runId, payload || {})
    return true
  })
  ipcMain.handle('progress:resetAll', () => {
    resetAll()
    return getProgress()
  })
  ipcMain.handle('progress:import', (_e, data) => importProgress(data))
  ipcMain.handle('progress:export', () => exportProgress())
  ipcMain.handle('progress:markMigrated', () => {
    markMigrated()
    return true
  })
  ipcMain.handle('qa:list', () => listQa())
  ipcMain.handle('qa:create', (_e, payload) => createQa(payload || {}))
  ipcMain.handle('qa:update', (_e, id, payload) => updateQa(id, payload || {}))
  ipcMain.handle('qa:delete', (_e, id) => {
    deleteQa(id)
    return true
  })

  ipcMain.handle('meta:get', (_e, key) => getMeta(key))
  ipcMain.handle('meta:set', (_e, key, value) => {
    setMeta(key, value)
    return true
  })

  ipcMain.handle('dialog:exportProgress', async () => {
    const data = exportProgress()
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export progress',
      defaultPath: 'interview-prep-progress.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (canceled || !filePath) return { ok: false }
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    return { ok: true, filePath }
  })

  ipcMain.handle('dialog:importProgress', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import progress',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (canceled || !filePaths?.[0]) return { ok: false }
    const raw = await readFile(filePaths[0], 'utf8')
    const data = JSON.parse(raw)
    const progress = importProgress(data)
    return { ok: true, progress }
  })
}

app.whenReady().then(() => {
  openDatabase()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase()
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDatabase()
})
