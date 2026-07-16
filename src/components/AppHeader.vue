<script setup>
import { computed } from 'vue'
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const {
  completedCount,
  progressPercent,
  totalSessions,
  shadowingRecentCount,
  shadowingStreak,
  readinessPercent,
  nextSession,
  resetAll,
  syncStatus,
  ready,
} = useProgress()

const metaBits = computed(() => [
  plan.format,
  plan.pace,
  plan.sessionLength,
])

const syncLabel = computed(() => {
  switch (syncStatus.value) {
    case 'loading':
      return 'PocketBase · загрузка…'
    case 'saving':
      return 'PocketBase · сохранение…'
    case 'ok':
      return 'PocketBase · синхронизировано'
    case 'error':
      return 'PocketBase · ошибка (проверь npm run pb)'
    default:
      return 'PocketBase'
  }
})

function onReset() {
  if (window.confirm('Сбросить весь прогресс?')) {
    resetAll()
  }
}
</script>

<template>
  <header class="header panel">
    <div class="top-row">
      <div class="eyebrow">Laravel Backend · EN Interview Prep</div>
      <span
        class="sync-pill"
        :class="syncStatus"
        :title="ready ? 'Хранилище прогресса' : 'Ожидание PocketBase'"
      >
        {{ syncLabel }}
      </span>
    </div>
    <h1>{{ plan.title }}</h1>
    <p class="lead muted">{{ plan.subtitle }}</p>

    <ul class="meta">
      <li v-for="bit in metaBits" :key="bit">{{ bit }}</li>
    </ul>

    <div class="goals">
      <h2>Цель</h2>
      <ul>
        <li v-for="goal in plan.goals" :key="goal">{{ goal }}</li>
      </ul>
    </div>

    <div v-if="nextSession" class="next-step">
      <div class="next-label">Следующий шаг</div>
      <div class="next-body">
        <div>
          <strong>Сессия {{ nextSession.id }} · {{ nextSession.title }}</strong>
          <p class="muted">Этап {{ nextSession.stageId }} — {{ nextSession.stageTitle }}</p>
        </div>
        <a class="btn" :href="nextSession.href">Перейти</a>
      </div>
    </div>
    <div v-else class="next-step done">
      <strong>Все сессии пройдены.</strong>
      <p class="muted">Проверь чеклист «Готов к рынку» и повторяй mock при необходимости.</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-top">
          <span>Сессии</span>
          <strong>{{ completedCount }}/{{ totalSessions }} · {{ progressPercent }}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
      </div>
      <div class="stat">
        <div class="stat-top">
          <span>Готовность к рынку</span>
          <strong>{{ readinessPercent }}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: readinessPercent + '%' }" />
        </div>
      </div>
      <div class="stat">
        <div class="stat-top">
          <span>Shadowing · привычка</span>
          <strong>streak {{ shadowingStreak }} · {{ shadowingRecentCount }}/7 за 7 дней</strong>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: Math.round((shadowingRecentCount / 7) * 100) + '%' }"
          />
        </div>
      </div>
    </div>

    <nav class="nav-stages" aria-label="Этапы">
      <a
        v-for="stage in plan.stages"
        :key="stage.id"
        :href="'#stage-' + stage.id"
      >
        Этап {{ stage.id }}
      </a>
      <a href="#warmup">Разминка</a>
      <a href="#readiness">Готовность</a>
      <a href="#shadowing">Shadowing</a>
      <a href="#post-session">Фидбек</a>
    </nav>

    <div class="header-actions">
      <button type="button" class="btn btn-ghost" @click="onReset">
        Сбросить прогресс
      </button>
    </div>
  </header>
</template>

<style scoped>
.header h1 {
  font-size: clamp(1.45rem, 3.5vw, 1.9rem);
  letter-spacing: -0.02em;
  margin-top: 0.35rem;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sync-pill {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
}

.sync-pill.loading,
.sync-pill.saving {
  border-color: var(--accent-border);
  color: var(--accent);
  background: var(--accent-soft);
}

.sync-pill.ok {
  border-color: rgba(95, 191, 138, 0.35);
  color: var(--success);
  background: var(--success-soft);
}

.sync-pill.error {
  border-color: rgba(217, 122, 108, 0.4);
  color: var(--danger);
  background: rgba(217, 122, 108, 0.12);
}

.lead {
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

.meta li {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
}

.goals {
  margin-top: 1.25rem;
  padding-top: 1.15rem;
  border-top: 1px solid var(--border);
}

.goals h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.goals ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--text);
}

.goals li + li {
  margin-top: 0.25rem;
}

.next-step {
  margin-top: 1.25rem;
  padding: 0.95rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
}

.next-step.done {
  border-color: rgba(95, 191, 138, 0.35);
  background: var(--success-soft);
}

.next-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.4rem;
}

.next-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.next-body strong {
  color: var(--text-strong);
  font-size: 0.98rem;
}

.next-body .muted {
  margin-top: 0.2rem;
  font-size: 0.85rem;
}

.next-step.done strong {
  color: var(--text-strong);
}

.next-step.done .muted {
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.stats {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.35rem;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}

.stat-top span {
  color: var(--text-muted);
}

.stat-top strong {
  color: var(--text-strong);
  font-weight: 600;
  text-align: right;
}

.header-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .next-body {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
