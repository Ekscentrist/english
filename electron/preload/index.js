import { contextBridge, ipcRenderer } from 'electron'

const api = {
  progress: {
    get: () => ipcRenderer.invoke('progress:get'),
    setSessionDone: (sessionId, done) =>
      ipcRenderer.invoke('progress:setSessionDone', sessionId, done),
    setRating: (sessionId, key, value) =>
      ipcRenderer.invoke('progress:setRating', sessionId, key, value),
    setCheatsheet: (sessionId, cheatsheet) =>
      ipcRenderer.invoke('progress:setCheatsheet', sessionId, cheatsheet),
    setHomework: (itemId, done) =>
      ipcRenderer.invoke('progress:setHomework', itemId, done),
    setShadowing: (day, done) =>
      ipcRenderer.invoke('progress:setShadowing', day, done),
    setReadiness: (itemId, done) =>
      ipcRenderer.invoke('progress:setReadiness', itemId, done),
    startRun: (sessionId) => ipcRenderer.invoke('progress:startRun', sessionId),
    finishRun: (runId, payload) =>
      ipcRenderer.invoke('progress:finishRun', runId, payload),
    resetAll: () => ipcRenderer.invoke('progress:resetAll'),
    import: (data) => ipcRenderer.invoke('progress:import', data),
    export: () => ipcRenderer.invoke('progress:export'),
    markMigrated: () => ipcRenderer.invoke('progress:markMigrated'),
  },
  meta: {
    get: (key) => ipcRenderer.invoke('meta:get', key),
    set: (key, value) => ipcRenderer.invoke('meta:set', key, value),
  },
  dialog: {
    exportProgress: () => ipcRenderer.invoke('dialog:exportProgress'),
    importProgress: () => ipcRenderer.invoke('dialog:importProgress'),
  },
}

contextBridge.exposeInMainWorld('api', api)
