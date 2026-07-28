<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { plan, getSessionPrompt, getAllSessions, findSessionMeta } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const DEFAULT_SECONDS = 40 * 60

const router = useRouter()
const {
  isDone,
  getSession,
  setSessionDone,
  setRating,
  setCheatsheet,
  startRun,
  finishRun,
  nextSession,
} = useProgress()

const allSessions = getAllSessions()
const copiedPrompt = ref(false)
const copiedWarmup = ref(false)
const copiedFeedback = ref(false)
const showRecap = ref(false)
const runId = ref(null)

const remaining = ref(DEFAULT_SECONDS)
const running = ref(false)
const mode = ref('countdown')
let timerHandle = null
let elapsedSec = 0

const sessionId = computed(() => Number(props.id) || props.id)
const meta = computed(() => findSessionMeta(sessionId.value))
const session = computed(() => meta.value?.session || null)
const stage = computed(() => meta.value?.stage || null)
const prompt = computed(() => (session.value ? getSessionPrompt(session.value) : ''))
const done = computed(() => isDone(sessionId.value))
const data = computed(() => getSession(sessionId.value))

const index = computed(() =>
  allSessions.findIndex((s) => String(s.id) === String(sessionId.value)),
)
const prev = computed(() => (index.value > 0 ? allSessions[index.value - 1] : null))
const next = computed(() =>
  index.value >= 0 && index.value < allSessions.length - 1
    ? allSessions[index.value + 1]
    : null,
)

const modeLabel = computed(() => {
  if (!session.value) return null
  if (session.value.mode === 'hard') return 'Hard Mode'
  if (session.value.mode === 'pressure') return 'Pressure'
  return null
})

const displayTime = computed(() => {
  const total = Math.max(0, remaining.value)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function clearTimer() {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
}

function tick() {
  if (mode.value === 'countdown') {
    if (remaining.value <= 0) {
      pause()
      return
    }
    remaining.value -= 1
    elapsedSec += 1
  } else {
    remaining.value += 1
    elapsedSec += 1
  }
}

function start() {
  if (running.value) return
  running.value = true
  clearTimer()
  timerHandle = setInterval(tick, 1000)
}

function pause() {
  running.value = false
  clearTimer()
}

function resetTimer() {
  pause()
  elapsedSec = 0
  remaining.value = mode.value === 'countdown' ? DEFAULT_SECONDS : 0
}

function toggleMode() {
  pause()
  mode.value = mode.value === 'countdown' ? 'countup' : 'countdown'
  remaining.value = mode.value === 'countdown' ? DEFAULT_SECONDS : 0
  elapsedSec = 0
}

async function copyText(text, flag) {
  try {
    await navigator.clipboard.writeText(text)
    flag.value = true
    setTimeout(() => {
      flag.value = false
    }, 1600)
  } catch {
    // ignore
  }
}

function copyPrompt() {
  copyText(prompt.value, copiedPrompt)
}

function copyWarmup() {
  copyText(plan.warmup.prompt, copiedWarmup)
}

function copyFeedback() {
  copyText(plan.postSession.prompt, copiedFeedback)
}

function onCheatsheet(e) {
  setCheatsheet(sessionId.value, e.target.value)
}

async function markDone() {
  await setSessionDone(sessionId.value, true)
  pause()
  if (runId.value) {
    await finishRun(runId.value, { durationSec: elapsedSec })
    runId.value = null
  }
  showRecap.value = true
}

async function toggleDone() {
  const nextDone = !done.value
  await setSessionDone(sessionId.value, nextDone)
  if (nextDone) {
    showRecap.value = true
  }
}

function goNextAfterRecap() {
  showRecap.value = false
  if (nextSession.value) {
    router.push(`/session/${nextSession.value.id}`)
  } else if (next.value) {
    router.push(`/session/${next.value.id}`)
  } else {
    router.push('/')
  }
}

async function bootstrapRun() {
  pause()
  resetTimer()
  showRecap.value = false
  if (runId.value) {
    await finishRun(runId.value, { durationSec: elapsedSec })
  }
  elapsedSec = 0
  runId.value = await startRun(sessionId.value)
}

watch(
  () => props.id,
  async () => {
    if (!session.value) return
    await bootstrapRun()
  },
)

function onKey(e) {
  if (isTypingTarget(e.target)) return
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
    e.preventDefault()
    copyPrompt()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    if (!done.value) markDone()
  }
}

function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

onMounted(async () => {
  if (!session.value) {
    router.replace('/')
    return
  }
  await bootstrapRun()
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  clearTimer()
  if (runId.value) {
    finishRun(runId.value, { durationSec: elapsedSec })
  }
})
</script>

<template>
  <div v-if="!session" class="missing panel">
    <p>Session not found.</p>
    <RouterLink class="btn" to="/">Back to Today</RouterLink>
  </div>

  <div v-else class="session-view">
    <header class="panel top">
      <div class="nav-row">
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="!prev"
          @click="prev && router.push(`/session/${prev.id}`)"
        >
          ← Prev
        </button>
        <div class="center">
          <div class="eyebrow">Stage {{ stage.id }} · {{ stage.title }}</div>
          <h1>Session {{ session.id }} · {{ session.title }}</h1>
          <p v-if="session.goal" class="muted">{{ session.goal }}</p>
        </div>
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="!next"
          @click="next && router.push(`/session/${next.id}`)"
        >
          Next →
        </button>
      </div>

      <div class="badges">
        <span v-if="session.duration" class="tag">{{ session.duration }}</span>
        <span
          v-if="modeLabel"
          class="tag"
          :class="session.mode === 'pressure' ? 'danger' : 'accent'"
        >
          {{ modeLabel }}
        </span>
        <span v-if="done" class="tag success">Done</span>
      </div>
    </header>

    <section class="timer panel">
      <div class="timer-face">
        <div class="time">{{ displayTime }}</div>
        <div class="timer-meta muted">
          {{ mode === 'countdown' ? 'Countdown · 40 min default' : 'Count-up' }}
          <span class="hint">Ctrl+Shift+C copy prompt · Ctrl+Enter mark done</span>
        </div>
      </div>
      <div class="timer-actions">
        <button type="button" class="btn" @click="running ? pause() : start()">
          {{ running ? 'Pause' : 'Start' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="resetTimer">Reset</button>
        <button type="button" class="btn btn-ghost" @click="toggleMode">
          Switch to {{ mode === 'countdown' ? 'count-up' : 'countdown' }}
        </button>
      </div>
    </section>

    <section class="panel warmup-mini">
      <div class="section-head">
        <h2>{{ plan.warmup.title }}</h2>
        <span class="tag accent">{{ plan.warmup.tag }}</span>
      </div>
      <p class="muted note">{{ plan.warmup.note }}</p>
      <div class="prompt-box">
        <pre>{{ plan.warmup.prompt }}</pre>
        <div class="prompt-actions">
          <button
            type="button"
            class="btn"
            :class="{ copied: copiedWarmup }"
            @click="copyWarmup"
          >
            {{ copiedWarmup ? 'Copied' : 'Copy warm-up' }}
          </button>
        </div>
      </div>
    </section>

    <section class="panel practice">
      <div class="section-head">
        <h2>Session prompt</h2>
        <label class="check-row done-check">
          <input type="checkbox" :checked="done" @change="toggleDone" />
          <span>Done</span>
        </label>
      </div>

      <ul v-if="session.topics?.length" class="topics">
        <li v-for="topic in session.topics" :key="topic">{{ topic }}</li>
      </ul>

      <ol v-if="session.structure?.length" class="structure">
        <li v-for="step in session.structure" :key="step">{{ step }}</li>
      </ol>

      <div class="prompt-box">
        <pre>{{ prompt }}</pre>
        <div class="prompt-actions">
          <button
            type="button"
            class="btn"
            :class="{ copied: copiedPrompt }"
            @click="copyPrompt"
          >
            {{ copiedPrompt ? 'Copied' : 'Copy prompt' }}
          </button>
        </div>
      </div>

      <label class="notes cheatsheet">
        <span>Cheatsheet</span>
        <textarea
          :value="data.cheatsheet"
          rows="4"
          placeholder="Key phrases, answer structure, facts from experience..."
          @input="onCheatsheet"
        />
      </label>

      <div class="finish-row">
        <button type="button" class="btn btn-lg" :disabled="done" @click="markDone">
          {{ done ? 'Completed' : 'Mark done & recap' }}
        </button>
      </div>
    </section>

    <section v-if="done || showRecap" class="panel recap">
      <h2>Post-session</h2>
      <div class="prompt-box">
        <pre>{{ plan.postSession.prompt }}</pre>
        <div class="prompt-actions">
          <button
            type="button"
            class="btn"
            :class="{ copied: copiedFeedback }"
            @click="copyFeedback"
          >
            {{ copiedFeedback ? 'Copied' : 'Copy feedback prompt' }}
          </button>
        </div>
      </div>

      <div class="ratings">
        <h3>Your ratings</h3>
        <div class="rating-grid">
          <label
            v-for="item in plan.postSession.ratingKeys"
            :key="item.key"
            class="rating-row"
          >
            <span>{{ item.label }}</span>
            <select
              :value="data.ratings[item.key] || 0"
              @change="setRating(session.id, item.key, Number($event.target.value))"
            >
              <option :value="0">—</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="recap-actions">
        <button type="button" class="btn" @click="goNextAfterRecap">
          {{ nextSession ? 'Go to next incomplete' : next ? 'Next session' : 'Back to Today' }}
        </button>
        <RouterLink class="btn btn-ghost" to="/">Today</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.top .nav-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
}

.center {
  text-align: center;
}

.center h1 {
  margin-top: 0.2rem;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
}

.center .muted {
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-top: 0.85rem;
}

.timer {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.time {
  font-family: var(--mono);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 500;
  color: var(--text-strong);
  letter-spacing: 0.04em;
}

.timer-meta {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  display: grid;
  gap: 0.15rem;
}

.hint {
  font-size: 0.72rem;
  opacity: 0.85;
}

.timer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.warmup-mini,
.practice,
.recap {
  margin-top: 1rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-head h2,
.recap h2 {
  font-size: 1.05rem;
}

.note {
  margin-top: 0.4rem;
  font-size: 0.9rem;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
}

.topics li {
  font-family: var(--mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: var(--bg-3);
  border: 1px solid var(--border);
  color: #d4dde8;
}

.structure {
  margin: 0.85rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
}

.structure li + li {
  margin-top: 0.2rem;
}

.notes {
  display: grid;
  gap: 0.4rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.notes textarea {
  width: 100%;
  resize: vertical;
  background: var(--bg-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
  color: var(--text-strong);
}

.cheatsheet span {
  color: var(--accent);
  font-weight: 600;
}

.cheatsheet textarea {
  border-color: var(--accent-border);
  background: rgba(224, 160, 74, 0.04);
  min-height: 5.5rem;
}

.finish-row {
  margin-top: 1rem;
}

.btn-lg {
  padding: 0.65rem 1.1rem;
}

.ratings {
  margin-top: 1rem;
}

.ratings h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem 0.85rem;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.rating-row select {
  background: var(--bg-0);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 0.25rem 0.4rem;
  color: var(--text-strong);
  min-width: 3.2rem;
}

.recap-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.missing {
  display: grid;
  gap: 0.85rem;
  justify-items: start;
}

@media (max-width: 720px) {
  .top .nav-row {
    grid-template-columns: 1fr;
  }

  .center {
    text-align: left;
  }

  .rating-grid {
    grid-template-columns: 1fr;
  }
}
</style>
