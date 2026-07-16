import { computed, reactive, ref, watch } from 'vue'
import { plan, TOTAL_SESSIONS, getAllSessions, findSessionMeta } from '../data/plan.js'
import { pb, PROGRESS_KEY, PROGRESS_COLLECTION } from '../lib/pocketbase.js'

const LOCAL_STORAGE_KEY = 'interview-prep-progress'
const SAVE_DEBOUNCE_MS = 400

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

function readLocalStorageFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
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

const state = reactive(defaultState())
const syncStatus = ref('loading')
const ready = ref(false)

let recordId = null
let hydrating = true
let saveTimer = null

function snapshotState() {
  return {
    sessions: JSON.parse(JSON.stringify(state.sessions)),
    homework: { ...state.homework },
    shadowing: { ...state.shadowing },
    readiness: { ...state.readiness },
  }
}

async function persistToPocketBase() {
  if (hydrating || !ready.value) return
  const payload = {
    key: PROGRESS_KEY,
    data: snapshotState(),
  }

  try {
    if (recordId) {
      await pb.collection(PROGRESS_COLLECTION).update(recordId, payload)
    } else {
      const created = await pb.collection(PROGRESS_COLLECTION).create(payload)
      recordId = created.id
    }
    syncStatus.value = 'ok'
  } catch (err) {
    console.error('PocketBase save failed', err)
    syncStatus.value = 'error'
  }
}

function scheduleSave() {
  if (hydrating || !ready.value) return
  syncStatus.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void persistToPocketBase()
  }, SAVE_DEBOUNCE_MS)
}

watch(state, scheduleSave, { deep: true })

async function loadFromPocketBase() {
  hydrating = true
  syncStatus.value = 'loading'

  try {
    const result = await pb.collection(PROGRESS_COLLECTION).getList(1, 1, {
      filter: `key="${PROGRESS_KEY}"`,
    })

    if (result.items.length > 0) {
      const record = result.items[0]
      recordId = record.id
      applyState(state, normalizeState(record.data))
    } else {
      const migrated = readLocalStorageFallback() || defaultState()
      applyState(state, migrated)
      const created = await pb.collection(PROGRESS_COLLECTION).create({
        key: PROGRESS_KEY,
        data: snapshotState(),
      })
      recordId = created.id
    }

    syncStatus.value = 'ok'
    ready.value = true
  } catch (err) {
    console.error('PocketBase load failed', err)
    const fallback = readLocalStorageFallback() || defaultState()
    applyState(state, fallback)
    syncStatus.value = 'error'
    ready.value = true
  } finally {
    hydrating = false
  }
}

loadFromPocketBase()

function ensureSession(id) {
  const key = String(id)
  if (!state.sessions[key]) {
    state.sessions[key] = {
      done: false,
      ratings: emptyRatings(),
      notes: '',
      cheatsheet: '',
    }
  } else if (state.sessions[key].cheatsheet === undefined) {
    state.sessions[key].cheatsheet = ''
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

  function toggleSession(sessionId) {
    const session = ensureSession(sessionId)
    session.done = !session.done
  }

  function setRating(sessionId, key, value) {
    const session = ensureSession(sessionId)
    session.ratings[key] = value
  }

  function setNotes(sessionId, notes) {
    const session = ensureSession(sessionId)
    session.notes = notes
  }

  function setCheatsheet(sessionId, cheatsheet) {
    const session = ensureSession(sessionId)
    session.cheatsheet = cheatsheet
  }

  function toggleHomework(id) {
    state.homework[id] = !state.homework[id]
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

  function toggleShadowing(date = todayKey()) {
    state.shadowing[date] = !state.shadowing[date]
  }

  function toggleShadowingToday() {
    toggleShadowing(todayKey())
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
      href: `#session-${next.id}`,
    }
  })

  function isReadinessDone(id) {
    return Boolean(state.readiness[id])
  }

  function toggleReadiness(id) {
    state.readiness[id] = !state.readiness[id]
  }

  const readinessDoneCount = computed(
    () => plan.readiness.items.filter((item) => state.readiness[item.id]).length,
  )

  const readinessPercent = computed(() =>
    Math.round((readinessDoneCount.value / plan.readiness.items.length) * 100),
  )

  async function resetAll() {
    const next = defaultState()
    applyState(state, next)
    await persistToPocketBase()
  }

  return {
    state,
    ready,
    syncStatus,
    completedCount,
    progressPercent,
    totalSessions: TOTAL_SESSIONS,
    stageProgress,
    isDone,
    getSession,
    toggleSession,
    setRating,
    setNotes,
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
    isReadinessDone,
    toggleReadiness,
    readinessDoneCount,
    readinessPercent,
    findSessionMeta,
    todayKey: todayKey(),
    resetAll,
  }
}
