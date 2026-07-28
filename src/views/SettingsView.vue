<script setup>
import { ref } from 'vue'
import { useProgress } from '../composables/useProgress.js'

const { resetAll, exportViaDialog, importViaDialog, syncStatus } = useProgress()
const message = ref('')

async function onExport() {
  const result = await exportViaDialog()
  message.value = result.ok ? 'Progress exported.' : 'Export cancelled.'
}

async function onImport() {
  const result = await importViaDialog()
  message.value = result.ok ? 'Progress imported.' : 'Import cancelled.'
}

async function onReset() {
  if (!window.confirm('Reset all progress? This cannot be undone.')) return
  await resetAll()
  message.value = 'Progress reset.'
}
</script>

<template>
  <div class="settings">
    <header class="panel head">
      <div class="eyebrow">Settings</div>
      <h1>Data & storage</h1>
      <p class="muted">
        Progress is stored locally in SQLite on this machine. Status:
        <strong>{{ syncStatus }}</strong>
      </p>
    </header>

    <section class="panel actions">
      <h2>Backup</h2>
      <p class="muted">Export or import a JSON snapshot when moving to another computer.</p>
      <div class="row">
        <button type="button" class="btn" @click="onExport">Export JSON</button>
        <button type="button" class="btn btn-ghost" @click="onImport">Import JSON</button>
      </div>
    </section>

    <section class="panel danger-zone">
      <h2>Reset</h2>
      <p class="muted">Clear sessions, ratings, homework, shadowing, and readiness.</p>
      <button type="button" class="btn btn-danger" @click="onReset">Reset all progress</button>
    </section>

    <p v-if="message" class="message">{{ message }}</p>
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

.actions,
.danger-zone {
  margin-top: 1rem;
}

h2 {
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.btn-danger {
  margin-top: 0.85rem;
  border-color: rgba(217, 122, 108, 0.45);
  background: rgba(217, 122, 108, 0.12);
  color: var(--danger);
}

.message {
  margin-top: 1rem;
  color: var(--success);
  font-size: 0.9rem;
}
</style>
