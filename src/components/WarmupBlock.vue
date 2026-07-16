<script setup>
import { ref } from 'vue'
import { plan } from '../data/plan.js'

const copied = ref(false)

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(plan.warmup.prompt)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    // ignore
  }
}
</script>

<template>
  <section id="warmup" class="panel">
    <div class="head">
      <h2>{{ plan.warmup.title }}</h2>
      <span class="tag accent">{{ plan.warmup.tag }}</span>
    </div>
    <p class="note muted">{{ plan.warmup.note }}</p>

    <h3>Голосовая команда</h3>
    <div class="prompt-box">
      <pre>{{ plan.warmup.prompt }}</pre>
      <div class="prompt-actions">
        <button
          type="button"
          class="btn"
          :class="{ copied }"
          @click="copyPrompt"
        >
          {{ copied ? 'Скопировано' : 'Копировать' }}
        </button>
      </div>
    </div>

    <h3>Примеры вопросов</h3>
    <ul class="examples">
      <li v-for="q in plan.warmup.exampleQuestions" :key="q">{{ q }}</li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.head h2 {
  font-size: 1.15rem;
}

.note {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

h3 {
  margin-top: 1.15rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.examples {
  margin: 0.6rem 0 0;
  padding-left: 1.1rem;
  font-family: var(--mono);
  font-size: 0.85rem;
  color: #d4dde8;
}

.examples li + li {
  margin-top: 0.3rem;
}
</style>
