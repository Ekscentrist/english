import { computed, ref } from 'vue'

const entries = ref([])
const syncStatus = ref('idle')
const ready = ref(false)
const errorMessage = ref('')

function hasApi() {
  return typeof window !== 'undefined' && window.api?.qa
}

function sortByUpdated(list) {
  return [...list].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

async function loadQa() {
  if (!hasApi()) {
    syncStatus.value = 'error'
    errorMessage.value = 'Q&A storage is unavailable.'
    ready.value = true
    return
  }
  syncStatus.value = 'loading'
  errorMessage.value = ''
  try {
    entries.value = await window.api.qa.list()
    syncStatus.value = 'ok'
    ready.value = true
  } catch (err) {
    console.error('Q&A load failed', err)
    syncStatus.value = 'error'
    errorMessage.value = 'Could not load questions.'
    ready.value = true
  }
}

export function useQa() {
  const count = computed(() => entries.value.length)

  async function createEntry({ question, answer }) {
    if (!hasApi()) {
      syncStatus.value = 'error'
      return null
    }
    syncStatus.value = 'saving'
    errorMessage.value = ''
    try {
      const created = await window.api.qa.create({ question, answer })
      entries.value = sortByUpdated([created, ...entries.value.filter((item) => item.id !== created.id)])
      syncStatus.value = 'ok'
      return created
    } catch (err) {
      console.error('Q&A create failed', err)
      syncStatus.value = 'error'
      errorMessage.value = 'Could not save the question.'
      throw err
    }
  }

  async function updateEntry(id, { question, answer }) {
    if (!hasApi()) {
      syncStatus.value = 'error'
      return null
    }
    syncStatus.value = 'saving'
    errorMessage.value = ''
    try {
      const updated = await window.api.qa.update(id, { question, answer })
      entries.value = sortByUpdated(
        entries.value.map((item) => (item.id === updated.id ? updated : item)),
      )
      syncStatus.value = 'ok'
      return updated
    } catch (err) {
      console.error('Q&A update failed', err)
      syncStatus.value = 'error'
      errorMessage.value = 'Could not update the question.'
      throw err
    }
  }

  async function deleteEntry(id) {
    if (!hasApi()) {
      syncStatus.value = 'error'
      return false
    }
    syncStatus.value = 'saving'
    errorMessage.value = ''
    try {
      await window.api.qa.delete(id)
      entries.value = entries.value.filter((item) => item.id !== id)
      syncStatus.value = 'ok'
      return true
    } catch (err) {
      console.error('Q&A delete failed', err)
      syncStatus.value = 'error'
      errorMessage.value = 'Could not delete the question.'
      throw err
    }
  }

  return {
    entries,
    ready,
    syncStatus,
    errorMessage,
    count,
    loadQa,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
