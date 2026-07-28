<script setup>
import { useProgress } from './composables/useProgress.js'
import AppNav from './components/AppNav.vue'

const { ready } = useProgress()
</script>

<template>
  <div v-if="!ready" class="boot">
    <p>Loading progress…</p>
  </div>
  <div v-else class="shell">
    <AppNav />
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.boot {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 100vh;
}

.content {
  min-width: 0;
  align-self: start;
  width: 100%;
  max-width: 920px;
  padding: 1.5rem 1.75rem 3rem;
}

@media (max-width: 860px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .content {
    padding: 1rem 1rem 3rem;
    width: 100%;
  }
}
</style>
