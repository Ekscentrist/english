<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const router = useRouter()
const {
  nextSession,
  completedCount,
  totalSessions,
  progressPercent,
  readinessPercent,
  shadowingStreak,
  shadowingRecentCount,
  isShadowingDone,
  toggleShadowingToday,
} = useProgress()

const metaBits = computed(() => [plan.format, plan.pace, plan.sessionLength])

function startNext() {
  if (nextSession.value) {
    router.push(`/session/${nextSession.value.id}`)
  } else {
    router.push('/habits')
  }
}
</script>

<template>
  <div class="today">
    <header class="hero panel">
      <div class="eyebrow">Today</div>
      <h1>{{ plan.title }}</h1>
      <p class="lead muted">{{ plan.subtitle }}</p>
      <ul class="meta">
        <li v-for="bit in metaBits" :key="bit">{{ bit }}</li>
      </ul>

      <div v-if="nextSession" class="cta-card">
        <div>
          <div class="cta-label">Next session</div>
          <strong>Session {{ nextSession.id }} · {{ nextSession.title }}</strong>
          <p class="muted">
            Stage {{ nextSession.stageId }} — {{ nextSession.stageTitle }}
          </p>
        </div>
        <button type="button" class="btn btn-lg" @click="startNext">Start session</button>
      </div>
      <div v-else class="cta-card done">
        <div>
          <strong>All sessions completed</strong>
          <p class="muted">Review readiness and keep shadowing until interviews.</p>
        </div>
        <button type="button" class="btn" @click="router.push('/habits')">Open habits</button>
      </div>
    </header>

    <section class="stats">
      <div class="stat panel">
        <span class="label">Sessions</span>
        <strong>{{ completedCount }}/{{ totalSessions }}</strong>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
      </div>
      <div class="stat panel">
        <span class="label">Readiness</span>
        <strong>{{ readinessPercent }}%</strong>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: readinessPercent + '%' }" />
        </div>
      </div>
      <div class="stat panel">
        <span class="label">Shadowing</span>
        <strong>{{ shadowingStreak }} day streak</strong>
        <p class="muted tiny">{{ shadowingRecentCount }}/7 last week</p>
      </div>
    </section>

    <section class="panel quick">
      <label class="check-row">
        <input
          type="checkbox"
          :checked="isShadowingDone()"
          @change="toggleShadowingToday"
        />
        <span>Shadowing done today (~10 min)</span>
      </label>
      <div class="quick-links">
        <RouterLink class="btn btn-ghost" to="/curriculum">Curriculum</RouterLink>
        <RouterLink class="btn btn-ghost" to="/habits">Habits & readiness</RouterLink>
      </div>
    </section>

    <section class="panel goals">
      <h2>Goals</h2>
      <ul>
        <li v-for="goal in plan.goals" :key="goal">{{ goal }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.today {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.hero h1 {
  margin-top: 0.35rem;
  font-size: clamp(1.45rem, 2.4vw, 1.85rem);
}

.lead {
  margin-top: 0.45rem;
  font-size: 0.95rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  margin: 0.9rem 0 0;
  padding: 0;
}

.meta li {
  font-size: 0.75rem;
  font-family: var(--mono);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.cta-card {
  margin-top: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
}

.cta-card.done {
  border-color: rgba(95, 191, 138, 0.35);
  background: var(--success-soft);
}

.cta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.btn-lg {
  flex-shrink: 0;
  padding: 0.65rem 1.15rem;
  font-size: 0.95rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  align-items: stretch;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  min-height: 0;
}

.stat .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat strong {
  font-size: 1.15rem;
  line-height: 1.2;
  color: var(--text-strong);
  font-weight: 600;
}

.stat .progress-track {
  margin-top: auto;
}

.tiny {
  margin: 0;
  font-size: 0.8rem;
}

.quick {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin: 0;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.goals {
  margin: 0;
}

.goals h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.goals ul {
  margin: 0.65rem 0 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.35rem;
}

@media (max-width: 720px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .cta-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
