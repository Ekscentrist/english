<script setup>
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const { isHomeworkDone, toggleHomework, homeworkDoneCount } = useProgress()
</script>

<template>
  <section class="panel homework">
    <div class="head">
      <h3>{{ plan.homework.title }}</h3>
      <span class="tag" :class="{ success: homeworkDoneCount === plan.homework.items.length }">
        {{ homeworkDoneCount }}/{{ plan.homework.items.length }}
      </span>
    </div>
    <p class="muted">{{ plan.homework.description }}</p>
    <ul>
      <li v-for="item in plan.homework.items" :key="item.id">
        <label class="check-row">
          <input
            type="checkbox"
            :checked="isHomeworkDone(item.id)"
            @change="toggleHomework(item.id)"
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
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.head h3 {
  font-size: 1rem;
}

.muted {
  font-size: 0.9rem;
  margin-bottom: 0.85rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.check-row span {
  color: var(--text-strong);
  font-weight: 500;
}
</style>
