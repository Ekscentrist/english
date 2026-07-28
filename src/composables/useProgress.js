import { computed, reactive, ref } from 'vue'
import { plan, TOTAL_SESSIONS, getAllSessions, findSessionMeta } from '../data/plan.js'

const LOCAL_STORAGE_KEY = 'interview-prep-progress'

const emptyRatings = () => ({
  grammar: 0,
  fluency: 0,
  technical: 0,
  confidence: 0,
  structure: 0,
  naturalness: 0,
})

function defaultReadiness() {
  return Object.fromEntries(plan.readiness.items.map((item) => [item.id, false]))
}

function defaultState() {
  return {
    sessions: {},
    homework: { '30s': false, '1m': false, '3m': false },
    shadowing: {},
    readiness: defaultReadiness(),
  }
}

function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  return {
    sessions: raw.sessions || {},
    homework: { ...base.homework, ...(raw.homework || {}) },
    shadowing: raw.shadowing || {},
    readiness: { ...base.readiness, ...(raw.readiness || {}) },
  }
}

function applyState(target, next) {
  target.sessions = next.sessions
  target.homework = next.homework
  target.shadowing = next.shadowing
  target.readiness = next.readiness
}

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dateKeyFromOffset(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readLocalStorageFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

const state = reactive(defaultState())
const syncStatus = ref('loading')
const ready = ref(false)
const lastSessionId = ref(null)

let cheatsheetTimer = null

function hasApi() {
  return typeof window !== 'undefined' && window.api?.progress
}

function applyFromProgress(progress) {
  applyState(state, normalizeState(progress))
  lastSessionId.value = progress.lastSessionId || null
}

async function withSave(action) {
  if (!hasApi()) {
    syncStatus.value = 'error'
    return
  }
  syncStatus.value = 'saving'
  try {
    const progress = await action()
    if (progress) applyFromProgress(progress)
    syncStatus.value = 'ok'
  } catch (err) {
    console.error('SQLite save failed', err)
    syncStatus.value = 'error'
  }
}

function scheduleCheatsheetSave(sessionId, cheatsheet) {
  syncStatus.value = 'saving'
  clearTimeout(cheatsheetTimer)
  cheatsheetTimer = setTimeout(() => {
    void withSave(() => window.api.progress.setCheatsheet(sessionId, cheatsheet))
  }, 400)
}

async function migrateFromLocalStorageIfNeeded(progress) {
  if (progress.migratedV1) return progress
  const legacy = readLocalStorageFallback()
  if (!legacy) {
    await window.api.progress.markMigrated()
    return progress
  }
  const hasRemoteData =
    Object.keys(progress.sessions || {}).length > 0 ||
    Object.values(progress.homework || {}).some(Boolean) ||
    Object.keys(progress.shadowing || {}).length > 0 ||
    Object.values(progress.readiness || {}).some(Boolean)
  if (hasRemoteData) {
    await window.api.progress.markMigrated()
    return progress
  }
  return window.api.progress.import(legacy)
}

async function loadProgress() {
  syncStatus.value = 'loading'
  try {
    if (!hasApi()) {
      applyState(state, readLocalStorageFallback() || defaultState())
      syncStatus.value = 'error'
      ready.value = true
      return
    }
    let progress = await window.api.progress.get()
    progress = await migrateFromLocalStorageIfNeeded(progress)
    applyFromProgress(progress)
    syncStatus.value = 'ok'
    ready.value = true
  } catch (err) {
    console.error('SQLite load failed', err)
    applyState(state, readLocalStorageFallback() || defaultState())
    syncStatus.value = 'error'
    ready.value = true
  }
}

loadProgress()

function ensureSession(id) {
  const key = String(id)
  if (!state.sessions[key]) {
    state.sessions[key] = {
      done: false,
      ratings: emptyRatings(),
      cheatsheet: '',
    }
  } else if (state.sessions[key].cheatsheet === undefined) {
    state.sessions[key].cheatsheet = ''
  }
  if (!state.sessions[key].ratings) {
    state.sessions[key].ratings = emptyRatings()
  }
  return state.sessions[key]
}

export function useProgress() {
  const completedCount = computed(() =>
    Object.values(state.sessions).filter((s) => s.done).length,
  )

  const progressPercent = computed(() =>
    Math.round((completedCount.value / TOTAL_SESSIONS) * 100),
  )

  function stageProgress(stage) {
    const done = stage.sessions.filter((s) => isDone(s.id)).length
    return { done, total: stage.sessions.length }
  }

  function isDone(sessionId) {
    return Boolean(state.sessions[String(sessionId)]?.done)
  }

  function getSession(sessionId) {
    return ensureSession(sessionId)
  }

  async function toggleSession(sessionId) {
    const session = ensureSession(sessionId)
    const next = !session.done
    session.done = next
    await withSave(() => window.api.progress.setSessionDone(sessionId, next))
  }

  async function setSessionDone(sessionId, done) {
    const session = ensureSession(sessionId)
    session.done = done
    await withSave(() => window.api.progress.setSessionDone(sessionId, done))
  }

  async function setRating(sessionId, key, value) {
    const session = ensureSession(sessionId)
    session.ratings[key] = value
    await withSave(() => window.api.progress.setRating(sessionId, key, value))
  }

  async function setCheatsheet(sessionId, cheatsheet) {
    const session = ensureSession(sessionId)
    session.cheatsheet = cheatsheet
    scheduleCheatsheetSave(sessionId, cheatsheet)
  }

  async function toggleHomework(id) {
    const next = !state.homework[id]
    state.homework[id] = next
    await withSave(() => window.api.progress.setHomework(id, next))
  }

  function isHomeworkDone(id) {
    return Boolean(state.homework[id])
  }

  const homeworkDoneCount = computed(
    () => plan.homework.items.filter((item) => state.homework[item.id]).length,
  )

  function isShadowingDone(date = todayKey()) {
    return Boolean(state.shadowing[date])
  }

  async function toggleShadowing(date = todayKey()) {
    const next = !state.shadowing[date]
    state.shadowing[date] = next
    await withSave(() => window.api.progress.setShadowing(date, next))
  }

  async function toggleShadowingToday() {
    await toggleShadowing(todayKey())
  }

  const shadowingRecentCount = computed(() => {
    let count = 0
    for (let i = 0; i < 7; i++) {
      if (state.shadowing[dateKeyFromOffset(i)]) count++
    }
    return count
  })

  const shadowingStreak = computed(() => {
    let streak = 0
    for (let i = 0; i < 60; i++) {
      if (state.shadowing[dateKeyFromOffset(i)]) streak++
      else break
    }
    return streak
  })

  const recentShadowing = computed(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const offset = 13 - i
      const date = dateKeyFromOffset(offset)
      return {
        date,
        label: date.slice(5),
        done: Boolean(state.shadowing[date]),
        isToday: offset === 0,
      }
    })
  })

  const nextSession = computed(() => {
    const all = getAllSessions()
    const next = all.find((s) => !isDone(s.id))
    if (!next) return null
    return {
      id: next.id,
      title: next.title,
      stageId: next.stageId,
      stageTitle: next.stageTitle,
    }
  })

  const practiceSessionId = computed(() => {
    if (lastSessionId.value && findSessionMeta(Number(lastSessionId.value) || lastSessionId.value)) {
      return String(lastSessionId.value)
    }
    return nextSession.value ? String(nextSession.value.id) : '1'
  })

  function isReadinessDone(id) {
    return Boolean(state.readiness[id])
  }

  async function toggleReadiness(id) {
    const next = !state.readiness[id]
    state.readiness[id] = next
    await withSave(() => window.api.progress.setReadiness(id, next))
  }

  const readinessDoneCount = computed(
    () => plan.readiness.items.filter((item) => state.readiness[item.id]).length,
  )

  const readinessPercent = computed(() =>
    Math.round((readinessDoneCount.value / plan.readiness.items.length) * 100),
  )

  async function resetAll() {
    await withSave(() => window.api.progress.resetAll())
  }

  async function startRun(sessionId) {
    if (!hasApi()) return null
    const runId = await window.api.progress.startRun(sessionId)
    lastSessionId.value = String(sessionId)
    return runId
  }

  async function finishRun(runId, payload) {
    if (!hasApi() || !runId) return
    await window.api.progress.finishRun(runId, payload)
  }

  async function exportViaDialog() {
    if (!hasApi()) return { ok: false }
    return window.api.dialog.exportProgress()
  }

  async function importViaDialog() {
    if (!hasApi()) return { ok: false }
    syncStatus.value = 'saving'
    try {
      const result = await window.api.dialog.importProgress()
      if (result.ok && result.progress) applyFromProgress(result.progress)
      syncStatus.value = 'ok'
      return result
    } catch (err) {
      console.error(err)
      syncStatus.value = 'error'
      return { ok: false }
    }
  }

  async function reload() {
    await loadProgress()
  }

  return {
    state,
    ready,
    syncStatus,
    lastSessionId,
    completedCount,
    progressPercent,
    totalSessions: TOTAL_SESSIONS,
    stageProgress,
    isDone,
    getSession,
    toggleSession,
    setSessionDone,
    setRating,
    setCheatsheet,
    toggleHomework,
    isHomeworkDone,
    homeworkDoneCount,
    isShadowingDone,
    toggleShadowing,
    toggleShadowingToday,
    shadowingRecentCount,
    shadowingStreak,
    recentShadowing,
    nextSession,
    practiceSessionId,
    isReadinessDone,
    toggleReadiness,
    readinessDoneCount,
    readinessPercent,
    findSessionMeta,
    todayKey: todayKey(),
    resetAll,
    startRun,
    finishRun,
    exportViaDialog,
    importViaDialog,
    reload,
  }
}
