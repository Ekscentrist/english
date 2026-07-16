<script setup>
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const {
  isShadowingDone,
  toggleShadowingToday,
  toggleShadowing,
  shadowingRecentCount,
  shadowingStreak,
  recentShadowing,
} = useProgress()
</script>

<template>
  <section id="shadowing" class="panel">
    <div class="head">
      <div>
        <h2>{{ plan.shadowing.title }}</h2>
        <p class="muted">{{ plan.shadowing.description }}</p>
      </div>
      <span class="tag" :class="{ success: shadowingStreak > 0 }">
        streak {{ shadowingStreak }} · {{ shadowingRecentCount }}/7 за 7 дней
      </span>
    </div>

    <label class="check-row today">
      <input
        type="checkbox"
        :checked="isShadowingDone()"
        @change="toggleShadowingToday"
      />
      <span>Сегодня сделано (~10 минут)</span>
    </label>

    <div class="calendar" aria-label="Последние 14 дней">
      <button
        v-for="day in recentShadowing"
        :key="day.date"
        type="button"
        class="day"
        :class="{ done: day.done, today: day.isToday }"
        :title="day.date"
        @click="toggleShadowing(day.date)"
      >
        <span class="dot" />
        <span class="label">{{ day.label }}</span>
      </button>
    </div>

    <h3>Фразы для практики</h3>
    <ul class="phrases">
      <li v-for="phrase in plan.shadowing.phrases" :key="phrase">
        <code>{{ phrase }}</code>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.head h2 {
  font-size: 1.15rem;
}

.head .muted {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  max-width: 36rem;
}

.today {
  margin-top: 1.1rem;
  font-weight: 500;
  color: var(--text-strong);
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
  margin-top: 1rem;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.2rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-0);
  color: var(--text-muted);
  transition: border-color 0.15s, background 0.15s;
}

.day:hover {
  border-color: var(--border-strong);
}

.day.today {
  border-color: var(--accent-border);
}

.day.done {
  background: var(--success-soft);
  border-color: rgba(95, 191, 138, 0.4);
}

.dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--border-strong);
}

.day.done .dot {
  background: var(--success);
}

.label {
  font-size: 0.65rem;
  font-family: var(--mono);
}

h3 {
  margin-top: 1.25rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.phrases {
  list-style: none;
  margin: 0.65rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.phrases code {
  display: block;
  font-family: var(--mono);
  font-size: 0.85rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--bg-0);
  border: 1px solid var(--border);
  color: #d4dde8;
}

@media (max-width: 640px) {
  .head {
    flex-direction: column;
  }

  .calendar {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
