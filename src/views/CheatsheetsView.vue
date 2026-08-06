<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllSessions } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const router = useRouter()
const { state } = useProgress()

const items = computed(() =>
  getAllSessions()
    .map((session) => ({
      ...session,
      cheatsheet: (state.sessions[String(session.id)]?.cheatsheet || '').trim(),
    }))
    .filter((session) => session.cheatsheet),
)

function openSession(id) {
  router.push(`/session/${id}`)
}
</script>

<template>
  <div class="cheatsheets">
    <header class="panel head">
      <div>
        <div class="eyebrow">Cheatsheets</div>
        <h1>All notes</h1>
        <p class="muted">Filled session cheatsheets in curriculum order.</p>
      </div>
    </header>

    <p v-if="!items.length" class="panel empty muted">
      No cheatsheets yet. Add notes on a Practice session.
    </p>

    <article
      v-for="item in items"
      :key="item.id"
      class="panel entry"
    >
      <button type="button" class="entry-head" @click="openSession(item.id)">
        <span class="id">{{ item.id }}</span>
        <span class="titles">
          <strong>{{ item.title }}</strong>
          <span class="muted">Stage {{ item.stageId }} · {{ item.stageTitle }}</span>
        </span>
        <span class="open muted">Open →</span>
      </button>
      <pre class="body">{{ item.cheatsheet }}</pre>
    </article>
  </div>
</template>

<style scoped>
.head h1 {
  margin-top: 0.25rem;
  font-size: 1.45rem;
}

.head .muted {
  margin-top: 0.35rem;
}

.empty {
  margin-top: 1rem;
}

.entry {
  margin-top: 1rem;
  display: grid;
  gap: 0.85rem;
}

.entry-head {
  width: 100%;
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  text-align: left;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.entry-head:hover strong {
  color: var(--accent);
}

.entry-head:hover .open {
  color: var(--text-strong);
}

.id {
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--accent);
}

.titles {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.titles strong {
  color: var(--text-strong);
  font-size: 1rem;
  transition: color 0.15s;
}

.titles .muted {
  font-size: 0.8rem;
}

.open {
  font-size: 0.8rem;
  white-space: nowrap;
  transition: color 0.15s;
}

.body {
  margin: 0;
  padding: 0.85rem 0.9rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(12, 17, 24, 0.45);
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text);
}

@media (max-width: 640px) {
  .entry-head {
    grid-template-columns: 2rem minmax(0, 1fr);
  }

  .open {
    grid-column: 2;
  }
}
</style>
