<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { plan } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'
import HomeworkBlock from '../components/HomeworkBlock.vue'

const router = useRouter()
const { isDone, stageProgress } = useProgress()

function openSession(id) {
  router.push(`/session/${id}`)
}

function modeLabel(session) {
  if (session.mode === 'hard') return 'Hard'
  if (session.mode === 'pressure') return 'Pressure'
  return null
}
</script>

<template>
  <div class="curriculum">
    <header class="panel head">
      <div>
        <div class="eyebrow">Curriculum</div>
        <h1>All stages</h1>
        <p class="muted">Pick any session to practice. Progress saves locally.</p>
      </div>
    </header>

    <section
      v-for="stage in plan.stages"
      :key="stage.id"
      class="panel stage"
    >
      <div class="stage-head">
        <div>
          <div class="eyebrow">Stage {{ stage.id }}</div>
          <h2>{{ stage.title }}</h2>
          <p v-if="stage.description" class="muted">{{ stage.description }}</p>
        </div>
        <span
          class="tag"
          :class="{ success: stageProgress(stage).done === stageProgress(stage).total }"
        >
          {{ stageProgress(stage).done }}/{{ stageProgress(stage).total }}
        </span>
      </div>

      <ul class="session-list">
        <li v-for="session in stage.sessions" :key="session.id">
          <button
            type="button"
            class="session-row"
            :class="{ done: isDone(session.id) }"
            @click="openSession(session.id)"
          >
            <span class="id">{{ session.id }}</span>
            <span class="body">
              <strong>{{ session.title }}</strong>
              <span v-if="session.goal" class="muted">{{ session.goal }}</span>
            </span>
            <span class="badges">
              <span v-if="session.duration" class="tag">{{ session.duration }}</span>
              <span
                v-if="modeLabel(session)"
                class="tag"
                :class="session.mode === 'pressure' ? 'danger' : 'accent'"
              >
                {{ modeLabel(session) }}
              </span>
              <span v-if="isDone(session.id)" class="tag success">Done</span>
            </span>
          </button>
        </li>
      </ul>

      <HomeworkBlock v-if="stage.showHomework" class="hw" />
    </section>
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

.stage {
  margin-top: 1rem;
}

.stage-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.9rem;
}

.stage-head h2 {
  font-size: 1.1rem;
}

.stage-head .muted {
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.session-row {
  width: 100%;
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  text-align: left;
  padding: 0.7rem 0.8rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(12, 17, 24, 0.45);
  color: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.session-row:hover {
  border-color: var(--border-strong);
  background: rgba(255, 255, 255, 0.03);
}

.session-row.done {
  border-color: rgba(95, 191, 138, 0.28);
  background: rgba(95, 191, 138, 0.04);
}

.id {
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--accent);
}

.body {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.body strong {
  color: var(--text-strong);
  font-size: 0.95rem;
}

.body .muted {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-end;
}

.hw {
  margin-top: 0.9rem;
  background: rgba(224, 160, 74, 0.05);
  border-color: var(--accent-border);
}

@media (max-width: 640px) {
  .session-row {
    grid-template-columns: 2rem minmax(0, 1fr);
  }

  .badges {
    grid-column: 2;
    justify-content: flex-start;
  }
}
</style>
