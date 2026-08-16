<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQa } from '../composables/useQa.js'
import HighlightedText from '../components/HighlightedText.vue'
import { matchesQuery } from '../utils/highlight.js'

const { entries, ready, errorMessage, loadQa, createEntry, updateEntry, deleteEntry } = useQa()

const query = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const draftQuestion = ref('')
const draftAnswer = ref('')
const saving = ref(false)

onMounted(() => {
  void loadQa()
})

const filtered = computed(() => {
  return entries.value.filter((item) => matchesQuery(query.value, item.question, item.answer))
})

const formTitle = computed(() => (editingId.value ? 'Edit question' : 'New question'))
const canSave = computed(
  () => Boolean(draftQuestion.value.trim() && draftAnswer.value.trim()) && !saving.value,
)
const emptyMessage = computed(() => {
  if (!ready.value) return 'Loading questions…'
  if (!entries.value.length) return 'No questions yet. Add the first one.'
  return 'No matches. Try another search.'
})

function openCreate() {
  editingId.value = null
  draftQuestion.value = query.value.trim()
  draftAnswer.value = ''
  formOpen.value = true
}

function openEdit(item) {
  editingId.value = item.id
  draftQuestion.value = item.question
  draftAnswer.value = item.answer
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingId.value = null
  draftQuestion.value = ''
  draftAnswer.value = ''
}

async function saveForm() {
  const question = draftQuestion.value.trim()
  const answer = draftAnswer.value.trim()
  if (!question || !answer || saving.value) return
  saving.value = true
  try {
    if (editingId.value) {
      await updateEntry(editingId.value, { question, answer })
    } else {
      await createEntry({ question, answer })
    }
    closeForm()
  } catch {
    // errorMessage is set in the composable
  } finally {
    saving.value = false
  }
}

async function removeEntry(item) {
  if (!window.confirm(`Delete “${item.question}”?`)) return
  try {
    if (editingId.value === item.id) closeForm()
    await deleteEntry(item.id)
  } catch {
    // errorMessage is set in the composable
  }
}
</script>

<template>
  <div class="qa">
    <header class="panel head">
      <div>
        <div class="eyebrow">Knowledge</div>
        <h1>Questions & answers</h1>
        <p class="muted">Search your notes, or add a new question with the answer below it.</p>
      </div>
      <button type="button" class="btn" @click="openCreate">Add</button>
    </header>

    <section class="panel search">
      <label class="field">
        <span class="muted">Search</span>
        <input
          v-model="query"
          type="search"
          placeholder="e.g. dependency injection"
          autocomplete="off"
        />
      </label>
    </section>

    <p v-if="errorMessage" class="panel error">{{ errorMessage }}</p>

    <section v-if="formOpen" class="panel form">
      <h2>{{ formTitle }}</h2>
      <label class="field">
        <span class="muted">Question</span>
        <input v-model="draftQuestion" type="text" placeholder="What is dependency injection?" />
      </label>
      <label class="field">
        <span class="muted">Answer</span>
        <textarea
          v-model="draftAnswer"
          rows="6"
          placeholder="Write the answer you want to recall later."
        />
      </label>
      <div class="form-actions">
        <button type="button" class="btn" :disabled="!canSave" @click="saveForm">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
        <button type="button" class="btn btn-ghost" :disabled="saving" @click="closeForm">
          Cancel
        </button>
      </div>
    </section>

    <p v-if="!filtered.length" class="panel empty muted">{{ emptyMessage }}</p>

    <article v-for="item in filtered" :key="item.id" class="panel entry">
      <div class="entry-head">
        <h2><HighlightedText :text="item.question" :query="query" /></h2>
        <div class="entry-actions">
          <button type="button" class="btn btn-ghost" @click="openEdit(item)">Edit</button>
          <button type="button" class="btn btn-ghost danger" @click="removeEntry(item)">
            Delete
          </button>
        </div>
      </div>
      <pre class="body"><HighlightedText :text="item.answer" :query="query" /></pre>
    </article>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.head h1 {
  margin-top: 0.25rem;
  font-size: 1.45rem;
}

.head .muted {
  margin-top: 0.35rem;
}

.search,
.form,
.error,
.empty,
.entry {
  margin-top: 1rem;
}

.error {
  color: var(--danger);
}

h2 {
  font-size: 1.05rem;
  margin: 0;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field + .field {
  margin-top: 0.85rem;
}

.field span {
  font-size: 0.8rem;
}

input,
textarea {
  width: 100%;
  background: var(--bg-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
  color: var(--text-strong);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent-border);
}

textarea {
  resize: vertical;
  min-height: 7rem;
  line-height: 1.55;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.95rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
  transform: none;
}

.entry {
  display: grid;
  gap: 0.85rem;
}

.entry-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
}

.entry-head h2 {
  color: var(--text-strong);
}

.entry-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.btn.danger {
  color: var(--danger);
}

.btn.danger:hover {
  border-color: rgba(217, 122, 108, 0.45);
  background: rgba(217, 122, 108, 0.12);
  color: var(--danger);
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
  .head,
  .entry-head {
    flex-direction: column;
  }
}
</style>
