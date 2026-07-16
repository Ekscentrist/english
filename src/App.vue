<script setup>
import { plan } from './data/plan.js'
import AppHeader from './components/AppHeader.vue'
import WarmupBlock from './components/WarmupBlock.vue'
import StageSection from './components/StageSection.vue'
import PostSessionGuide from './components/PostSessionGuide.vue'
import ShadowingBlock from './components/ShadowingBlock.vue'
import ReadinessBlock from './components/ReadinessBlock.vue'
</script>

<template>
  <AppHeader />
  <WarmupBlock class="section-gap" />
  <StageSection
    v-for="stage in plan.stages"
    :key="stage.id"
    :stage="stage"
    class="section-gap"
  />
  <ReadinessBlock class="section-gap" />
  <PostSessionGuide class="section-gap" />
  <ShadowingBlock class="section-gap" />
</template>
