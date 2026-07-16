<script setup>
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const {
  isReadinessDone,
  toggleReadiness,
  readinessDoneCount,
  readinessPercent,
} = useProgress()
</script>

<template>
  <section id="readiness" class="panel">
    <div class="head">
      <div>
        <h2>{{ plan.readiness.title }}</h2>
        <p class="muted">{{ plan.readiness.description }}</p>
      </div>
      <span
        class="tag"
        :class="{ success: readinessDoneCount === plan.readiness.items.length }"
      >
        {{ readinessDoneCount }}/{{ plan.readiness.items.length }} · {{ readinessPercent }}%
      </span>
    </div>

    <div class="progress-track bar">
      <div class="progress-fill" :style="{ width: readinessPercent + '%' }" />
    </div>

    <ul>
      <li v-for="item in plan.readiness.items" :key="item.id">
        <label class="check-row">
          <input
            type="checkbox"
            :checked="isReadinessDone(item.id)"
            @change="toggleReadiness(item.id)"
          />
          <span>{{ item.label }}</span>
        </label>
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

.bar {
  margin-top: 1rem;
}

ul {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.check-row span {
  color: var(--text-strong);
  font-weight: 500;
  font-size: 0.95rem;
}
</style>
