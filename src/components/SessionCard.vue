<script setup>
import { computed, ref } from 'vue'
import { plan, getSessionPrompt } from '../data/plan.js'
import { useProgress } from '../composables/useProgress.js'

const props = defineProps({
  session: { type: Object, required: true },
})

const {
  isDone,
  getSession,
  toggleSession,
  setRating,
  setNotes,
  setCheatsheet,
} = useProgress()

const copied = ref(false)
const prompt = computed(() => getSessionPrompt(props.session))
const done = computed(() => isDone(props.session.id))
const data = computed(() => getSession(props.session.id))

const modeLabel = computed(() => {
  if (props.session.mode === 'hard') return 'Hard Mode'
  if (props.session.mode === 'pressure') return 'Pressure'
  return null
})

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(prompt.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    // ignore
  }
}

function onNotes(e) {
  setNotes(props.session.id, e.target.value)
}

function onCheatsheet(e) {
  setCheatsheet(props.session.id, e.target.value)
}
</script>

<template>
  <article :id="'session-' + session.id" class="session" :class="{ done }">
    <div class="session-head">
      <div class="titles">
        <div class="badges">
          <span class="tag">Сессия {{ session.id }}</span>
          <span v-if="session.duration" class="tag">{{ session.duration }}</span>
          <span v-if="modeLabel" class="tag" :class="session.mode === 'pressure' ? 'danger' : 'accent'">
            {{ modeLabel }}
          </span>
        </div>
        <h3>{{ session.title }}</h3>
        <p v-if="session.goal" class="goal muted">{{ session.goal }}</p>
      </div>

      <label class="check-row done-check">
        <input
          type="checkbox"
          :checked="done"
          @change="toggleSession(session.id)"
        />
        <span>Пройдена</span>
      </label>
    </div>

    <ul v-if="session.topics?.length" class="topics">
      <li v-for="topic in session.topics" :key="topic">{{ topic }}</li>
    </ul>

    <ol v-if="session.structure?.length" class="structure">
      <li v-for="step in session.structure" :key="step">{{ step }}</li>
    </ol>

    <div class="prompt-box">
      <pre>{{ prompt }}</pre>
      <div class="prompt-actions">
        <button
          type="button"
          class="btn"
          :class="{ copied }"
          @click="copyPrompt"
        >
          {{ copied ? 'Скопировано' : 'Копировать промпт' }}
        </button>
      </div>
    </div>

    <div v-if="done" class="ratings">
      <h4>Оценки после сессии</h4>
      <div class="rating-grid">
        <label
          v-for="item in plan.postSession.ratingKeys"
          :key="item.key"
          class="rating-row"
        >
          <span>{{ item.label }}</span>
          <select
            :value="data.ratings[item.key] || 0"
            @change="setRating(session.id, item.key, Number($event.target.value))"
          >
            <option :value="0">—</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
      <label class="notes">
        <span>Заметки по сессии</span>
        <textarea
          :value="data.notes"
          rows="3"
          placeholder="Что улучшить в следующий раз..."
          @input="onNotes"
        />
      </label>
    </div>

    <label class="notes cheatsheet">
      <span>Шпаргалка</span>
      <textarea
        :value="data.cheatsheet"
        rows="4"
        placeholder="Ключевые фразы, структура ответа, факты из опыта..."
        @input="onCheatsheet"
      />
    </label>
  </article>
</template>

<style scoped>
.session {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(12, 17, 24, 0.55);
  padding: 1.1rem 1.15rem;
  transition: border-color 0.2s, background 0.2s;
}

.session.done {
  border-color: rgba(95, 191, 138, 0.28);
  background: rgba(95, 191, 138, 0.04);
}

.session + .session {
  margin-top: 0.85rem;
}

.session-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
}

.titles h3 {
  font-size: 1.05rem;
}

.goal {
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.done-check {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: var(--text-strong);
  font-weight: 500;
  padding-top: 0.15rem;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
}

.topics li {
  font-family: var(--mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: var(--bg-3);
  border: 1px solid var(--border);
  color: #d4dde8;
}

.structure {
  margin: 0.85rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  color: var(--text);
}

.structure li + li {
  margin-top: 0.2rem;
}

.ratings {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.ratings h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem 0.85rem;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.rating-row select {
  background: var(--bg-0);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 0.25rem 0.4rem;
  color: var(--text-strong);
  min-width: 3.2rem;
}

.notes {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.85rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.notes textarea {
  width: 100%;
  resize: vertical;
  background: var(--bg-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
  color: var(--text-strong);
}

.notes textarea:focus {
  outline: 1px solid var(--accent-border);
}

.cheatsheet {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.cheatsheet span {
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.cheatsheet textarea {
  border-color: var(--accent-border);
  background: rgba(224, 160, 74, 0.04);
  min-height: 5.5rem;
}

@media (max-width: 640px) {
  .session-head {
    flex-direction: column;
  }

  .rating-grid {
    grid-template-columns: 1fr;
  }
}
</style>
