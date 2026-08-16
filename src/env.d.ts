export {}

type QaEntry = {
  id: number
  question: string
  answer: string
  createdAt: string
  updatedAt: string
}

declare global {
  interface Window {
    api?: {
      progress: {
        get: () => Promise<any>
        setSessionDone: (sessionId: string | number, done: boolean) => Promise<any>
        setRating: (sessionId: string | number, key: string, value: number) => Promise<any>
        setCheatsheet: (sessionId: string | number, cheatsheet: string) => Promise<any>
        setHomework: (itemId: string, done: boolean) => Promise<any>
        setShadowing: (day: string, done: boolean) => Promise<any>
        setReadiness: (itemId: string, done: boolean) => Promise<any>
        startRun: (sessionId: string | number) => Promise<number>
        finishRun: (runId: number, payload?: { durationSec?: number; notes?: string }) => Promise<boolean>
        resetAll: () => Promise<any>
        import: (data: any) => Promise<any>
        export: () => Promise<any>
        markMigrated: () => Promise<boolean>
      }
      qa: {
        list: () => Promise<QaEntry[]>
        create: (payload: { question: string; answer: string }) => Promise<QaEntry>
        update: (id: number, payload: { question: string; answer: string }) => Promise<QaEntry>
        delete: (id: number) => Promise<boolean>
      }
      meta: {
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<boolean>
      }
      dialog: {
        exportProgress: () => Promise<{ ok: boolean; filePath?: string }>
        importProgress: () => Promise<{ ok: boolean; progress?: any }>
      }
    }
  }
}
