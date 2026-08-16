<script setup>
import { computed } from 'vue'
import { highlightParts } from '../utils/highlight.js'

const props = defineProps({
  text: { type: String, default: '' },
  query: { type: String, default: '' },
})

const parts = computed(() => highlightParts(props.text, props.query))
</script>

<template>
  <span class="highlighted-text">
    <template v-for="(part, index) in parts" :key="index">
      <mark v-if="part.hit" class="search-hit">{{ part.text }}</mark>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<style scoped>
.highlighted-text {
  white-space: inherit;
}
</style>
