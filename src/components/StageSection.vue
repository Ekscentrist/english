<script setup>
import { computed } from 'vue'
import { useProgress } from '../composables/useProgress.js'
import SessionCard from './SessionCard.vue'
import HomeworkBlock from './HomeworkBlock.vue'

const props = defineProps({
  stage: { type: Object, required: true },
})

const { stageProgress } = useProgress()
const progress = computed(() => stageProgress(props.stage))
const complete = computed(
  () => progress.value.done === progress.value.total && progress.value.total > 0,
)
</script>

<template>
  <section :id="'stage-' + stage.id" class="panel stage">
    <div class="stage-head">
      <div>
        <div class="eyebrow">Этап {{ stage.id }}</div>
        <h2>{{ stage.title }}</h2>
        <p v-if="stage.description" class="muted">{{ stage.description }}</p>
      </div>
      <span class="tag" :class="{ success: complete }">
        {{ progress.done }}/{{ progress.total }}
      </span>
    </div>

    <div class="sessions">
      <SessionCard
        v-for="session in stage.sessions"
        :key="session.id"
        :session="session"
      />
    </div>

    <HomeworkBlock v-if="stage.showHomework" class="hw" />
  </section>
</template>

<style scoped>
.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.stage-head h2 {
  font-size: 1.25rem;
}

.stage-head .muted {
  margin-top: 0.35rem;
  font-size: 0.9rem;
}

.sessions {
  display: grid;
}

.hw {
  margin-top: 1rem;
  background: rgba(224, 160, 74, 0.05);
  border-color: var(--accent-border);
}
</style>
