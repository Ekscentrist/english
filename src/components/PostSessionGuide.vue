<script setup>
import { ref } from 'vue'
import { plan } from '../data/plan.js'

const copied = ref(false)

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(plan.postSession.prompt)
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
  <section id="post-session" class="panel">
    <div class="head">
      <h2>{{ plan.postSession.title }}</h2>
      <span class="tag">Всегда</span>
    </div>
    <p class="muted intro">После каждой сессии проси у ИИ этот фидбек:</p>

    <div class="prompt-box">
      <pre>{{ plan.postSession.prompt }}</pre>
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

.intro {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
</style>
