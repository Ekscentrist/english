<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgress } from '../composables/useProgress.js'

const route = useRoute()
const router = useRouter()
const { syncStatus, practiceSessionId, progressPercent, nextSession } = useProgress()

const links = computed(() => [
  { to: '/', label: 'Today', match: (name) => name === 'today' },
  {
    to: `/session/${practiceSessionId.value}`,
    label: 'Practice',
    match: (name) => name === 'session',
  },
  { to: '/curriculum', label: 'Curriculum', match: (name) => name === 'curriculum' },
  { to: '/cheatsheets', label: 'Cheatsheets', match: (name) => name === 'cheatsheets' },
  { to: '/habits', label: 'Habits', match: (name) => name === 'habits' },
  { to: '/settings', label: 'Settings', match: (name) => name === 'settings' },
])

const syncLabel = computed(() => {
  switch (syncStatus.value) {
    case 'loading':
      return 'Loading…'
    case 'saving':
      return 'Saving…'
    case 'ok':
      return 'Saved'
    case 'error':
      return 'Save error'
    default:
      return 'Local'
  }
})

function goPractice() {
  const id = nextSession.value?.id || practiceSessionId.value
  router.push(`/session/${id}`)
}
</script>

<template>
  <aside class="nav">
    <div class="brand">
      <div class="eyebrow">Laravel · EN Interview</div>
      <div class="title">Prep Tracker</div>
      <div class="progress-mini">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <span>{{ progressPercent }}%</span>
      </div>
    </div>

    <nav class="links">
      <RouterLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        class="link"
        :class="{ active: link.match(route.name) }"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <button type="button" class="btn start" @click="goPractice">
      {{ nextSession ? 'Start next' : 'Open practice' }}
    </button>

    <div class="footer">
      <span class="sync-pill" :class="syncStatus">{{ syncLabel }}</span>
    </div>
  </aside>
</template>

<style scoped>
.nav {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.35rem 1.1rem;
  border-right: 1px solid var(--border);
  background: rgba(12, 17, 24, 0.72);
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand .eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.brand .title {
  margin-top: 0.25rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-strong);
}

.progress-mini {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.85rem;
  font-size: 0.75rem;
  font-family: var(--mono);
  color: var(--text-muted);
}

.progress-mini .progress-track {
  flex: 1;
}

.links {
  display: grid;
  gap: 0.35rem;
}

.link {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.link:hover {
  color: var(--text-strong);
  background: rgba(255, 255, 255, 0.03);
}

.link.active {
  color: var(--text-strong);
  background: var(--accent-soft);
  border-color: var(--accent-border);
}

.start {
  width: 100%;
}

.footer {
  margin-top: auto;
}

.sync-pill {
  display: inline-flex;
  font-size: 0.75rem;
  font-family: var(--mono);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.sync-pill.ok {
  color: var(--success);
  border-color: rgba(95, 191, 138, 0.35);
  background: var(--success-soft);
}

.sync-pill.saving,
.sync-pill.loading {
  color: var(--accent);
  border-color: var(--accent-border);
  background: var(--accent-soft);
}

.sync-pill.error {
  color: var(--danger);
  border-color: rgba(217, 122, 108, 0.35);
  background: rgba(217, 122, 108, 0.12);
}

@media (max-width: 860px) {
  .nav {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .footer {
    margin-top: 0;
  }
}
</style>
